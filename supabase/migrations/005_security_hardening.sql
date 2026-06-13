-- =========================================================
-- SideQuest — Migration 005: Full Security Hardening
-- Run in Supabase SQL Editor (fresh tab)
-- =========================================================

-- ─── 1. User suspension flag ─────────────────────────────

alter table public.users
  add column if not exists is_suspended boolean not null default false,
  add column if not exists suspended_reason text;

-- ─── 2. Audit log (immutable — no UPDATE/DELETE policy) ──

create table if not exists public.security_audit_log (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        references public.users(id) on delete set null,
  action      text        not null,
  details     jsonb       not null default '{}',
  created_at  timestamptz not null default now()
);

alter table public.security_audit_log enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'security_audit_log' and policyname = 'Users read own audit log'
  ) then
    create policy "Users read own audit log"
      on public.security_audit_log for select using (auth.uid() = user_id);
  end if;
end $$;
-- No INSERT/UPDATE/DELETE policies for users — only security-definer functions write here

-- ─── 3. Unique constraints: prevent replay + race condition ──

-- C3 FIX: One completed record per quest per user — no replay farming
create unique index if not exists uq_user_quest_completed
  on public.user_quests(user_id, quest_id)
  where status = 'completed';

-- H1 FIX: One active record per quest per user — no race condition double-start
create unique index if not exists uq_user_quest_active
  on public.user_quests(user_id, quest_id)
  where status in ('assigned','queued','in_progress','paused');

-- ─── 4. C4 FIX: Restrict direct XP/level updates via RLS WITH CHECK ─

-- Drop the permissive policy
drop policy if exists "Users can update own profile" on public.users;
drop policy if exists "Users can update safe profile fields only" on public.users;

-- New policy: only allow updating safe profile fields
-- The WITH CHECK compares new values to current stored values for protected columns
-- If someone tries to set xp=999999, the subquery returns current xp (e.g. 480) → mismatch → blocked
create policy "Users update safe fields only"
  on public.users for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    -- Protect game state: new value must equal current stored value
    and xp                    = (select xp                    from public.users where id = auth.uid())
    and level                 = (select level                 from public.users where id = auth.uid())
    and streak_count          = (select streak_count          from public.users where id = auth.uid())
    and longest_streak        = (select longest_streak        from public.users where id = auth.uid())
    and total_quests_completed= (select total_quests_completed from public.users where id = auth.uid())
    and is_suspended          = (select is_suspended          from public.users where id = auth.uid())
  );

-- ─── 5. Rate-limit helper ─────────────────────────────────

create or replace function check_quest_daily_limit(p_user_id uuid)
returns boolean language plpgsql security definer as $$
declare v_count integer;
begin
  select count(*) into v_count
  from public.user_quests
  where user_id = p_user_id
    and status  = 'completed'
    and completed_at >= current_date;
  return v_count < 15;  -- max 15 completions per calendar day
end;
$$;

-- ─── 6. Replace complete_quest with hardened version ─────────────────

create or replace function complete_quest(p_user_quest_id uuid)
returns jsonb language plpgsql security definer as $$
declare
  v_uq           public.user_quests;
  v_user         public.users;
  v_quest        public.quests;
  v_xp           integer;
  v_bonus        integer := 0;
  v_level_before integer;
  v_level_after  integer;
  v_leveled_up   boolean := false;
  v_new_badges   uuid[];
begin
  -- ── Auth ────────────────────────────────────────────────
  select * into v_uq
  from public.user_quests
  where id = p_user_quest_id and user_id = auth.uid();
  if not found then raise exception 'Quest not found or not yours'; end if;

  -- ── Idempotency ──────────────────────────────────────────
  if v_uq.status = 'completed' then raise exception 'Quest already completed'; end if;

  -- ── Timer enforcement (C2 FIX) ───────────────────────────
  if v_uq.lock_expires_at is not null and now() < v_uq.lock_expires_at then
    raise exception 'Timer still running: % seconds remaining',
      extract(epoch from (v_uq.lock_expires_at - now()))::integer;
  end if;

  -- ── Load user + check suspension ─────────────────────────
  select * into v_user from public.users where id = auth.uid();
  if v_user.is_suspended then
    raise exception 'Account suspended: %', coalesce(v_user.suspended_reason, 'contact support');
  end if;

  -- ── Daily rate limit ─────────────────────────────────────
  if not check_quest_daily_limit(auth.uid()) then
    insert into public.security_audit_log(user_id, action, details)
    values (auth.uid(), 'rate_limit_hit',
      jsonb_build_object('quest_id', v_uq.quest_id, 'ts', now()));
    raise exception 'Daily quest limit reached (15/day). Come back tomorrow!';
  end if;

  select * into v_quest from public.quests where id = v_uq.quest_id;

  -- ── Streak bonus ─────────────────────────────────────────
  if    v_user.streak_count >= 100 then v_bonus := 50;
  elsif v_user.streak_count >= 30  then v_bonus := 30;
  elsif v_user.streak_count >= 7   then v_bonus := 15;
  elsif v_user.streak_count >= 3   then v_bonus := 5;
  end if;

  v_xp           := round(v_quest.xp_reward * (1 + v_bonus / 100.0));
  v_level_before := v_user.level;

  update public.user_quests
  set status = 'completed', completed_at = now(), xp_earned = v_xp
  where id = p_user_quest_id;

  update public.users
  set
    xp                     = xp + v_xp,
    total_quests_completed = total_quests_completed + 1,
    streak_count = case
      when last_active_date = current_date - 1 then streak_count + 1
      when last_active_date = current_date     then streak_count
      else 1
    end,
    longest_streak = greatest(longest_streak,
      case
        when last_active_date = current_date - 1 then streak_count + 1
        else 1
      end
    ),
    last_active_date = current_date,
    level = case
      when xp + v_xp >= 6000 then 6
      when xp + v_xp >= 3000 then 5
      when xp + v_xp >= 1400 then 4
      when xp + v_xp >= 600  then 3
      when xp + v_xp >= 200  then 2
      else 1
    end
  where id = auth.uid()
  returning level into v_level_after;

  v_leveled_up := v_level_after > v_level_before;
  v_new_badges := check_and_award_badges(auth.uid());

  -- ── Audit log ─────────────────────────────────────────────
  insert into public.security_audit_log(user_id, action, details)
  values (auth.uid(), 'quest_completed', jsonb_build_object(
    'quest_id',    v_uq.quest_id,
    'quest_title', v_quest.title,
    'xp_earned',   v_xp,
    'leveled_up',  v_leveled_up,
    'new_level',   v_level_after
  ));

  return jsonb_build_object(
    'xp_earned',    v_xp,
    'total_xp',     v_user.xp + v_xp,
    'level_before', v_level_before,
    'level_after',  v_level_after,
    'leveled_up',   v_leveled_up,
    'new_badges', coalesce(
      (select jsonb_agg(jsonb_build_object('name', name, 'icon', icon, 'description', description))
       from public.badges where id = any(v_new_badges)),
      '[]'::jsonb
    )
  );
end;
$$;

-- ─── 7. Contingency: Suspend / Unsuspend ─────────────────
-- Called via Supabase Dashboard SQL or admin script — NOT exposed to users

create or replace function admin_suspend_user(
  p_user_id uuid,
  p_reason  text default 'Policy violation'
)
returns void language plpgsql security definer as $$
begin
  update public.users
  set is_suspended = true, suspended_reason = p_reason
  where id = p_user_id;

  insert into public.security_audit_log(user_id, action, details)
  values (p_user_id, 'account_suspended',
    jsonb_build_object('reason', p_reason, 'by', 'admin', 'ts', now()));
end;
$$;

create or replace function admin_unsuspend_user(p_user_id uuid)
returns void language plpgsql security definer as $$
begin
  update public.users
  set is_suspended = false, suspended_reason = null
  where id = p_user_id;

  insert into public.security_audit_log(user_id, action, details)
  values (p_user_id, 'account_unsuspended',
    jsonb_build_object('by', 'admin', 'ts', now()));
end;
$$;

-- ─── 8. Contingency: XP Rollback ─────────────────────────
-- Use when an exploit is detected. Recalculates XP from honest completions.

create or replace function admin_recalculate_user_xp(p_user_id uuid)
returns jsonb language plpgsql security definer as $$
declare
  v_correct_xp    integer;
  v_correct_quests integer;
  v_old_xp        integer;
begin
  select coalesce(sum(uq.xp_earned), 0), count(*)
  into v_correct_xp, v_correct_quests
  from public.user_quests uq
  join public.quests q on q.id = uq.quest_id
  where uq.user_id = p_user_id
    and uq.status  = 'completed';

  select xp into v_old_xp from public.users where id = p_user_id;

  update public.users
  set
    xp                     = v_correct_xp,
    total_quests_completed = v_correct_quests,
    level = case
      when v_correct_xp >= 6000 then 6
      when v_correct_xp >= 3000 then 5
      when v_correct_xp >= 1400 then 4
      when v_correct_xp >= 600  then 3
      when v_correct_xp >= 200  then 2
      else 1
    end
  where id = p_user_id;

  insert into public.security_audit_log(user_id, action, details)
  values (p_user_id, 'xp_recalculated', jsonb_build_object(
    'old_xp', v_old_xp,
    'new_xp', v_correct_xp,
    'by', 'admin'
  ));

  return jsonb_build_object('old_xp', v_old_xp, 'new_xp', v_correct_xp, 'quests', v_correct_quests);
end;
$$;

-- ─── 9. Anomaly detection trigger ────────────────────────
-- Auto-flags users who complete more than 10 quests in 1 hour

create or replace function flag_suspicious_activity()
returns trigger language plpgsql security definer as $$
declare v_count integer;
begin
  if NEW.status = 'completed' then
    select count(*) into v_count
    from public.user_quests
    where user_id    = NEW.user_id
      and status     = 'completed'
      and completed_at >= now() - interval '1 hour';

    if v_count > 10 then
      insert into public.security_audit_log(user_id, action, details)
      values (NEW.user_id, 'anomaly_high_completion_rate',
        jsonb_build_object(
          'completions_last_hour', v_count,
          'quest_id', NEW.quest_id,
          'flagged_at', now()
        ));
    end if;
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_anomaly_detection on public.user_quests;
create trigger trg_anomaly_detection
  after update on public.user_quests
  for each row
  when (NEW.status = 'completed' and OLD.status <> 'completed')
  execute function flag_suspicious_activity();

-- ─── 10. Verify RLS is on everywhere ─────────────────────

do $$
declare r record;
begin
  for r in
    select tablename
    from pg_tables
    where schemaname = 'public'
      and tablename not in (select tablename from pg_tables
                            where schemaname = 'public'
                            and rowsecurity = true)
  loop
    raise notice 'WARNING: RLS not enabled on table: %', r.tablename;
  end loop;
end $$;
