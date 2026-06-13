-- =========================================================
-- SideQuest — Migration 003: Daily Quest Release System
-- =========================================================

-- Add released_at so quests can be drip-released daily
alter table public.quests
  add column if not exists released_at date not null default current_date;

-- All existing quests are available from today
update public.quests set released_at = current_date where released_at is null;

-- Index for efficient daily filtering
create index if not exists quests_released_idx on public.quests(released_at);
