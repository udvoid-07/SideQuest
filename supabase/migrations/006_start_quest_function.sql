-- =========================================================
-- SideQuest — Migration 006: start_quest DB Function
-- Moves quest-start logic from server action into a
-- security-definer function so the timer is set atomically
-- in the DB, not derived from client/server time.
-- =========================================================

-- ─── start_quest ─────────────────────────────────────────
-- Called instead of direct UPDATE from the server action.
-- Returns the lock_expires_at so the client can render a timer.

create or replace function start_quest(p_user_quest_id uuid)
returns timestamptz language plpgsql security definer as $$
declare
  v_uq          public.user_quests;
  v_quest       public.quests;
  v_expires_at  timestamptz;
begin
  -- Auth: user can only start their own quests
  select * into v_uq
  from public.user_quests
  where id = p_user_quest_id and user_id = auth.uid();

  if not found then
    raise exception 'Quest not found or not yours';
  end if;

  -- Allow starting from assigned, queued, or paused states
  if v_uq.status not in ('assigned', 'queued', 'paused') then
    if v_uq.status = 'in_progress' then
      -- Idempotent: return existing expiry so client can resume timer
      return v_uq.lock_expires_at;
    end if;
    raise exception 'Quest cannot be started in status: %', v_uq.status;
  end if;

  -- If resuming from pause, restore remaining time
  if v_uq.status = 'paused' and v_uq.time_remaining_ms is not null then
    v_expires_at := now() + (v_uq.time_remaining_ms * interval '1 millisecond');
  else
    select * into v_quest from public.quests where id = v_uq.quest_id;
    v_expires_at := now() + (v_quest.duration_minutes * interval '1 minute');
  end if;

  update public.user_quests set
    status          = 'in_progress',
    started_at      = coalesce(started_at, now()),
    lock_expires_at = v_expires_at,
    paused_at       = null,
    time_remaining_ms = null
  where id = p_user_quest_id;

  return v_expires_at;
end;
$$;

-- Authenticated users can call this (RLS on user_quests enforces ownership)
grant execute on function start_quest to authenticated;

-- ─── Add missing index for daily quest lookup ─────────────
-- Speeds up getTodayQuest: status IN + assigned_at >= today + user_id
create index if not exists user_quests_active_today_idx
  on public.user_quests(user_id, assigned_at desc)
  where status in ('assigned', 'in_progress', 'queued', 'paused');

-- ─── Add compound index for preference lookups ────────────
-- Speeds up getUserPreferences: user_id + action filter
create index if not exists user_quest_prefs_user_action_idx
  on public.user_quest_preferences(user_id, quest_id)
  include (action);
