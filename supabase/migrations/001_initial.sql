-- =========================================================
-- SideQuest — Initial Database Schema
-- =========================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ─── Users ────────────────────────────────────────────────

create table public.users (
  id                      uuid        primary key references auth.users(id) on delete cascade,
  username                text        not null,
  email                   text        not null,
  avatar_url              text,
  age                     integer     not null check (age >= 13 and age <= 120),
  gender                  text        not null check (gender in ('male','female','non-binary','prefer-not-to-say')),
  city                    text        not null,
  personality_type        text        not null check (personality_type in ('introvert','ambivert','extrovert')),
  fitness_level           integer     not null default 1 check (fitness_level between 1 and 5),
  budget_tier             integer     not null default 1 check (budget_tier between 1 and 4),
  xp                      integer     not null default 0 check (xp >= 0),
  level                   integer     not null default 1 check (level between 1 and 6),
  streak_count            integer     not null default 0 check (streak_count >= 0),
  longest_streak          integer     not null default 0 check (longest_streak >= 0),
  last_active_date        date,
  streak_freeze_available boolean     not null default true,
  total_quests_completed  integer     not null default 0 check (total_quests_completed >= 0),
  disclaimer_accepted     boolean     not null default false,
  push_token              text,
  created_at              timestamptz not null default now()
);

alter table public.users enable row level security;

create policy "Users can read own profile"
  on public.users for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.users for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.users for insert with check (auth.uid() = id);

-- ─── Quests ───────────────────────────────────────────────

create table public.quests (
  id                  uuid        primary key default gen_random_uuid(),
  title               text        not null,
  description         text        not null,
  category            text        not null check (category in (
    'creative','social','physical','mental','culinary','adventure','learning','wellness'
  )),
  cost_min            integer     not null default 0 check (cost_min >= 0),
  cost_max            integer     not null default 0 check (cost_max >= 0),
  budget_tier         integer     not null check (budget_tier between 1 and 4),
  duration_minutes    integer     not null check (duration_minutes > 0),
  xp_reward           integer     not null check (xp_reward > 0),
  tier                text        not null check (tier in ('F','D','C','B','A','S')),
  min_age             integer     not null default 13,
  max_age             integer     not null default 99,
  fitness_required    integer     not null default 1 check (fitness_required between 1 and 5),
  personality_match   text        not null default 'all' check (personality_match in ('introvert','extrovert','all')),
  location_required   boolean     not null default false,
  tags                text[]      not null default '{}',
  info                jsonb       not null default '{}',
  image_url           text,
  is_active           boolean     not null default true,
  created_at          timestamptz not null default now()
);

-- Public read for all authenticated users
alter table public.quests enable row level security;
create policy "Authenticated users can read active quests"
  on public.quests for select
  to authenticated
  using (is_active = true);

-- Indexes for quest filtering
create index quests_category_idx    on public.quests(category);
create index quests_tier_idx        on public.quests(tier);
create index quests_budget_tier_idx on public.quests(budget_tier);
create index quests_personality_idx on public.quests(personality_match);
create index quests_active_idx      on public.quests(is_active);

-- ─── User Quests ──────────────────────────────────────────

create table public.user_quests (
  id              uuid        primary key default gen_random_uuid(),
  user_id         uuid        not null references public.users(id) on delete cascade,
  quest_id        uuid        not null references public.quests(id) on delete cascade,
  status          text        not null default 'assigned' check (status in ('assigned','in_progress','completed','skipped')),
  assigned_at     timestamptz not null default now(),
  started_at      timestamptz,
  completed_at    timestamptz,
  lock_expires_at timestamptz,
  xp_earned       integer     not null default 0 check (xp_earned >= 0)
);

alter table public.user_quests enable row level security;

create policy "Users can read own user_quests"
  on public.user_quests for select using (auth.uid() = user_id);

create policy "Users can insert own user_quests"
  on public.user_quests for insert with check (auth.uid() = user_id);

create policy "Users can update own user_quests"
  on public.user_quests for update using (auth.uid() = user_id);

create index user_quests_user_id_idx    on public.user_quests(user_id);
create index user_quests_status_idx     on public.user_quests(user_id, status);
create index user_quests_assigned_idx   on public.user_quests(user_id, assigned_at desc);

-- ─── Badges ───────────────────────────────────────────────

create table public.badges (
  id                  uuid    primary key default gen_random_uuid(),
  name                text    not null unique,
  description         text    not null,
  icon                text    not null,
  condition_type      text    not null check (condition_type in (
    'quest_count','category_count','streak','tier_count','special'
  )),
  condition_value     integer not null,
  condition_category  text
);

alter table public.badges enable row level security;
create policy "Anyone can read badges"
  on public.badges for select to authenticated using (true);

create table public.user_badges (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references public.users(id) on delete cascade,
  badge_id    uuid        not null references public.badges(id),
  earned_at   timestamptz not null default now(),
  unique(user_id, badge_id)
);

alter table public.user_badges enable row level security;
create policy "Users can read own badges"
  on public.user_badges for select using (auth.uid() = user_id);

-- ─── Streak Freezes ───────────────────────────────────────

create table public.streak_freeze_uses (
  id          uuid    primary key default gen_random_uuid(),
  user_id     uuid    not null references public.users(id) on delete cascade,
  used_at     date    not null default current_date,
  unique(user_id, used_at)
);

alter table public.streak_freeze_uses enable row level security;
create policy "Users can read own freeze uses"
  on public.streak_freeze_uses for select using (auth.uid() = user_id);

-- ─── Functions ────────────────────────────────────────────

-- Assign a daily quest to a user (called by Edge Function)
create or replace function assign_daily_quest(p_user_id uuid)
returns uuid language plpgsql security definer as $$
declare
  v_user    public.users;
  v_quest   public.quests;
  v_uq_id   uuid;
begin
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

-- Award XP and update streak
create or replace function complete_quest(p_user_quest_id uuid)
returns jsonb language plpgsql security definer as $$
declare
  v_uq      public.user_quests;
  v_user    public.users;
  v_quest   public.quests;
  v_xp      integer;
  v_bonus   integer := 0;
  v_level_before integer;
  v_level_after  integer;
  v_leveled_up   boolean := false;
begin
  select * into v_uq from public.user_quests where id = p_user_quest_id and user_id = auth.uid();
  if not found then raise exception 'Quest not found or not yours'; end if;
  if v_uq.status = 'completed' then raise exception 'Quest already completed'; end if;

  select * into v_quest from public.quests where id = v_uq.quest_id;
  select * into v_user  from public.users   where id = auth.uid();

  -- Streak bonus
  if v_user.streak_count >= 100 then v_bonus := 50;
  elsif v_user.streak_count >= 30 then v_bonus := 30;
  elsif v_user.streak_count >= 7  then v_bonus := 15;
  elsif v_user.streak_count >= 3  then v_bonus := 5;
  end if;

  v_xp := round(v_quest.xp_reward * (1 + v_bonus / 100.0));
  v_level_before := v_user.level;

  -- Update user_quests
  update public.user_quests
  set status = 'completed', completed_at = now(), xp_earned = v_xp
  where id = p_user_quest_id;

  -- Update user XP, streak, quest count
  update public.users
  set
    xp                    = xp + v_xp,
    total_quests_completed = total_quests_completed + 1,
    streak_count          = case
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

  return jsonb_build_object(
    'xp_earned',    v_xp,
    'level_before', v_level_before,
    'level_after',  v_level_after,
    'leveled_up',   v_leveled_up
  );
end;
$$;

-- Reset streaks for inactive users (call via daily cron)
create or replace function reset_inactive_streaks()
returns void language plpgsql security definer as $$
begin
  update public.users
  set streak_count = 0
  where last_active_date < current_date - 1
    and streak_freeze_available = false;

  update public.users
  set streak_freeze_available = false
  where last_active_date = current_date - 1
    and streak_freeze_available = true;
end;
$$;
