-- =========================================================
-- SideQuest — Migration 011: Security Advisor Fixes
-- Addresses Supabase's Security Advisor findings:
--   1. Mutable search_path on SECURITY DEFINER functions — a real
--      privilege-escalation pattern (an attacker-created object
--      earlier in the resolved search_path could shadow what the
--      function calls, since SECURITY DEFINER runs as the owner).
--   2. Functions left executable by PUBLIC — Postgres grants EXECUTE
--      to PUBLIC by default on every new function unless revoked.
--   3. assign_daily_quest had no ownership check at all — any
--      authenticated user could assign a quest to ANY other user's
--      account by passing an arbitrary p_user_id (IDOR).
-- =========================================================

-- ─── 1. Pin search_path on functions we aren't otherwise redefining ──────
alter function public.complete_quest(uuid) set search_path = public;
alter function public.pause_quest(uuid) set search_path = public;
alter function public.resume_quest(uuid) set search_path = public;
alter function public.start_quest(uuid) set search_path = public;
alter function public.check_and_award_badges(uuid) set search_path = public;
alter function public.reset_inactive_streaks() set search_path = public;

-- ─── 2. Fix assign_daily_quest's IDOR + pin its search_path ─────────────
-- auth.uid() is null when called via the service role (cron/admin) — only
-- block when a real, mismatched authenticated caller is present, so the
-- daily-quest cron job (which assigns on behalf of many users) still works.
create or replace function public.assign_daily_quest(p_user_id uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_user    public.users;
  v_quest   public.quests;
  v_uq_id   uuid;
begin
  if auth.uid() is not null and auth.uid() <> p_user_id then
    raise exception 'Not authorized to assign a quest for another user';
  end if;

  select * into v_user from public.users where id = p_user_id;
  if not found then raise exception 'User not found'; end if;

  select q.* into v_quest
  from public.quests q
  where q.is_active = true
    and q.min_age   <= v_user.age
    and q.max_age   >= v_user.age
    and q.budget_tier <= v_user.budget_tier
    and q.fitness_required <= v_user.fitness_level
    and (q.personality_match = 'all' or q.personality_match = v_user.personality_type)
    and q.id not in (
      select quest_id from public.user_quests
      where user_id = p_user_id and status = 'completed'
    )
  order by random()
  limit 1;

  if not found then
    raise exception 'No suitable quest found for user';
  end if;

  insert into public.user_quests (user_id, quest_id, status)
  values (p_user_id, v_quest.id, 'assigned')
  returning id into v_uq_id;

  return v_uq_id;
end;
$$;

-- ─── 3. Lock down EXECUTE grants ─────────────────────────────────────────
-- Revoke the implicit PUBLIC grant everywhere, then re-grant only where a
-- client legitimately needs to call the function directly.

revoke execute on function public.assign_daily_quest(uuid)     from public;
revoke execute on function public.complete_quest(uuid)         from public;
revoke execute on function public.pause_quest(uuid)            from public;
revoke execute on function public.resume_quest(uuid)           from public;
revoke execute on function public.start_quest(uuid)            from public;
revoke execute on function public.check_and_award_badges(uuid) from public;
revoke execute on function public.reset_inactive_streaks()     from public;

-- User-facing — called directly by the signed-in user, for themselves.
grant execute on function public.assign_daily_quest(uuid) to authenticated;
grant execute on function public.complete_quest(uuid)     to authenticated;
grant execute on function public.pause_quest(uuid)        to authenticated;
grant execute on function public.resume_quest(uuid)       to authenticated;
grant execute on function public.start_quest(uuid)        to authenticated;

-- Internal-only — never called directly by a client. complete_quest calls
-- check_and_award_badges internally (function-to-function calls bypass
-- GRANT/REVOKE entirely); reset_inactive_streaks only runs via pg_cron.
-- Intentionally left with no authenticated/anon grant.

-- ─── 4. rls_auto_enable — not defined by any SideQuest migration (likely a
-- Supabase-provided helper). Not called by any app code — lock it down
-- defensively without touching whatever it actually does.
do $$ begin
  if exists (
    select 1 from pg_proc
    where proname = 'rls_auto_enable' and pronamespace = 'public'::regnamespace
  ) then
    revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
  end if;
end $$;
