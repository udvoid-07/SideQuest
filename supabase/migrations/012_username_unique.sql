-- =========================================================
-- SideQuest — Migration 012: Unique Usernames
-- Case-insensitive uniqueness (so "Adventurer" and "adventurer" can't
-- both exist) — enforced at the DB level since app-side checks alone
-- have a race window between two concurrent signups.
--
-- NOTE: two existing usernames ("Gabriel-Rib", "Dark knight") contain
-- characters outside the new A-Za-z0-9_@ rule. That rule is enforced
-- in application code for new/edited usernames only — this migration
-- does not touch existing data, so it's safe to run as-is.
-- =========================================================

create unique index if not exists users_username_unique_idx
  on public.users (lower(username));
