-- =========================================================
-- SideQuest — Migration 010: Custom Email OTP Verification
-- Bypasses Supabase's built-in confirmation email entirely (its
-- default mailer only delivers to project team members and is
-- capped at 2/hour). OTPs are generated, hashed, and emailed by our
-- own server code via Resend; Supabase's admin API confirms the
-- user directly once the code is verified.
-- =========================================================

create table if not exists public.email_otp_verifications (
  id          uuid        primary key default gen_random_uuid(),
  email       text        not null,
  otp_hash    text        not null,
  purpose     text        not null default 'signup',
  attempts    integer     not null default 0,
  expires_at  timestamptz not null,
  consumed_at timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists idx_email_otp_lookup
  on public.email_otp_verifications(email, purpose, consumed_at);

-- Server-only table — RLS enabled with zero policies (default-deny).
-- Only touched via the service role key from API routes.
alter table public.email_otp_verifications enable row level security;
