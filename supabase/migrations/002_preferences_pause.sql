-- =========================================================
-- SideQuest — Migration 002: Quest Preferences & Pause
-- Run ONLY this file in a fresh SQL editor tab
-- =========================================================

-- ─── Extend user_quests status values ────────────────────

alter table public.user_quests
  drop constraint if exists user_quests_status_check;

alter table public.user_quests
  add constraint user_quests_status_check
  check (status in ('assigned','queued','in_progress','paused','completed','skipped'));

alter table public.user_quests
  add column if not exists paused_at        timestamptz,
  add column if not exists time_remaining_ms bigint;

-- ─── Quest preference tracking ───────────────────────────

create table if not exists public.user_quest_preferences (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references public.users(id) on delete cascade,
  quest_id   uuid        not null references public.quests(id) on delete cascade,
  action     text        not null check (action in ('declined','interested')),
  created_at timestamptz not null default now(),
  unique(user_id, quest_id)
);

alter table public.user_quest_preferences enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'user_quest_preferences'
    and policyname  = 'Users manage own quest preferences'
  ) then
    create policy "Users manage own quest preferences"
      on public.user_quest_preferences
      for all using (auth.uid() = user_id);
  end if;
end $$;

create index if not exists user_quest_prefs_user_idx
  on public.user_quest_preferences(user_id, action);

-- ─── Pause function ───────────────────────────────────────

create or replace function pause_quest(p_user_quest_id uuid)
returns void language plpgsql security definer as $$
declare v_uq public.user_quests;
begin
  select * into v_uq
  from public.user_quests
  where id = p_user_quest_id and user_id = auth.uid();

  if not found then raise exception 'Quest not found'; end if;
  if v_uq.status <> 'in_progress' then raise exception 'Quest is not in progress'; end if;

  update public.user_quests set
    status            = 'paused',
    paused_at         = now(),
    time_remaining_ms = greatest(0,
      extract(epoch from (lock_expires_at - now())) * 1000
    )::bigint
  where id = p_user_quest_id;
end; $$;

-- ─── Resume function ──────────────────────────────────────

create or replace function resume_quest(p_user_quest_id uuid)
returns timestamptz language plpgsql security definer as $$
declare
  v_uq          public.user_quests;
  v_new_expires timestamptz;
begin
  select * into v_uq
  from public.user_quests
  where id = p_user_quest_id and user_id = auth.uid();

  if not found then raise exception 'Quest not found'; end if;
  if v_uq.status <> 'paused' then raise exception 'Quest is not paused'; end if;

  v_new_expires := now() +
    (coalesce(v_uq.time_remaining_ms, 0) * interval '1 millisecond');

  update public.user_quests set
    status            = 'in_progress',
    lock_expires_at   = v_new_expires,
    paused_at         = null,
    time_remaining_ms = null
  where id = p_user_quest_id;

  return v_new_expires;
end; $$;
