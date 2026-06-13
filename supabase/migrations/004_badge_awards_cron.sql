-- =========================================================
-- SideQuest — Migration 004: Badge Awarding + Streak Cron
-- =========================================================

-- ─── Badge awarding function ──────────────────────────────

create or replace function check_and_award_badges(p_user_id uuid)
returns uuid[] language plpgsql security definer as $$
declare
  v_user       public.users;
  v_badge      public.badges;
  v_cat_count  integer;
  v_new_ids    uuid[] := '{}';
begin
  select * into v_user from public.users where id = p_user_id;
  if not found then return v_new_ids; end if;

  for v_badge in select * from public.badges loop
    -- Skip already earned
    continue when exists (
      select 1 from public.user_badges
      where user_id = p_user_id and badge_id = v_badge.id
    );

    -- Evaluate condition
    case v_badge.condition_type
      when 'quest_count' then
        continue when v_user.total_quests_completed < v_badge.condition_value;

      when 'streak' then
        continue when v_user.streak_count < v_badge.condition_value;

      when 'category_count' then
        select count(*) into v_cat_count
        from public.user_quests uq
        join public.quests q on q.id = uq.quest_id
        where uq.user_id  = p_user_id
          and uq.status   = 'completed'
          and q.category  = v_badge.condition_category;
        continue when v_cat_count < v_badge.condition_value;

      when 'tier_count' then
        select count(*) into v_cat_count
        from public.user_quests uq
        join public.quests q on q.id = uq.quest_id
        where uq.user_id = p_user_id
          and uq.status  = 'completed'
          and q.tier     = v_badge.condition_category;
        continue when v_cat_count < v_badge.condition_value;

      when 'special' then
        continue when v_user.level < v_badge.condition_value;

      else continue;
    end case;

    insert into public.user_badges (user_id, badge_id)
    values (p_user_id, v_badge.id)
    on conflict (user_id, badge_id) do nothing;

    v_new_ids := array_append(v_new_ids, v_badge.id);
  end loop;

  return v_new_ids;
end;
$$;

-- ─── Replace complete_quest — now awards badges + returns them ────────────

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
  select * into v_uq
  from public.user_quests
  where id = p_user_quest_id and user_id = auth.uid();

  if not found then raise exception 'Quest not found or not yours'; end if;
  if v_uq.status = 'completed' then raise exception 'Quest already completed'; end if;

  -- ── SECURITY FIX: enforce timer lock ────────────────────
  if v_uq.lock_expires_at is not null and now() < v_uq.lock_expires_at then
    raise exception 'Quest timer has not expired yet. % seconds remaining.',
      extract(epoch from (v_uq.lock_expires_at - now()))::integer;
  end if;

  select * into v_quest from public.quests where id = v_uq.quest_id;
  select * into v_user  from public.users   where id = auth.uid();

  -- Streak bonus
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

  -- ── Award badges based on new state ─────────────────────
  v_new_badges := check_and_award_badges(auth.uid());

  -- ── Fetch badge details for newly earned badges ─────────
  return jsonb_build_object(
    'xp_earned',    v_xp,
    'total_xp',     v_user.xp + v_xp,
    'level_before', v_level_before,
    'level_after',  v_level_after,
    'leveled_up',   v_leveled_up,
    'new_badges',   coalesce(
      (select jsonb_agg(jsonb_build_object('name', name, 'icon', icon, 'description', description))
       from public.badges where id = any(v_new_badges)),
      '[]'::jsonb
    )
  );
end;
$$;

-- ─── Streak reset via pg_cron ─────────────────────────────
-- Runs daily at 18:30 UTC (midnight IST)
-- Enable pg_cron in Supabase: Database → Extensions → pg_cron

do $$
begin
  -- Only schedule if pg_cron extension is available
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.schedule(
      'sidequest-reset-streaks',
      '30 18 * * *',
      'select public.reset_inactive_streaks()'
    );
    raise notice 'pg_cron streak reset scheduled.';
  else
    raise notice 'pg_cron not available. Enable it in Supabase Extensions, then run: select cron.schedule(''sidequest-reset-streaks'', ''30 18 * * *'', ''select public.reset_inactive_streaks()'');';
  end if;
end $$;
