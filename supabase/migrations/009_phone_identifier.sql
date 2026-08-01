-- =========================================================
-- SideQuest — Migration 009: Email-or-Phone Identity
-- Lets an account be identified by email OR phone (for OTP
-- signup verification via either channel).
-- =========================================================

alter table public.users
  alter column email drop not null;

alter table public.users
  add column if not exists phone text unique;

do $$ begin
  if not exists (
    select 1 from pg_constraint where conname = 'users_email_or_phone_present'
  ) then
    alter table public.users
      add constraint users_email_or_phone_present
      check (email is not null or phone is not null);
  end if;
end $$;
