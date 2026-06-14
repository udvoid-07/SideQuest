-- =========================================================
-- SideQuest — Fix: duration_minutes stored as seconds
-- Run this in the Supabase SQL Editor (one-time fix)
-- =========================================================

-- STEP 1: See what's currently wrong
-- Run this first to confirm which quests/timers are affected
SELECT
  uq.id               AS user_quest_id,
  q.title,
  q.duration_minutes,
  q.duration_minutes / 60.0  AS duration_hours,
  uq.lock_expires_at,
  uq.lock_expires_at - now() AS time_remaining
FROM public.user_quests uq
JOIN public.quests q ON q.id = uq.quest_id
WHERE uq.status = 'in_progress'
ORDER BY uq.lock_expires_at DESC;


-- STEP 2: Fix quests where duration_minutes was entered in seconds
-- Anything > 7 days (10080 minutes) is almost certainly wrong
-- (the longest valid quest is 3 days = 4320 minutes)
UPDATE public.quests
SET duration_minutes = ROUND(duration_minutes / 60.0)
WHERE duration_minutes > 10080;  -- > 7 days in minutes


-- STEP 3: Reset lock_expires_at for any in-progress quests with wrong timers
-- This recalculates from NOW using the (now-corrected) duration_minutes
UPDATE public.user_quests uq
SET lock_expires_at = now() + (q.duration_minutes * INTERVAL '1 minute')
FROM public.quests q
WHERE uq.quest_id = q.id
  AND uq.status   = 'in_progress'
  AND uq.lock_expires_at > now() + INTERVAL '7 days';


-- STEP 4: Verify the fix
SELECT
  uq.id               AS user_quest_id,
  q.title,
  q.duration_minutes,
  uq.lock_expires_at,
  uq.lock_expires_at - now() AS time_remaining
FROM public.user_quests uq
JOIN public.quests q ON q.id = uq.quest_id
WHERE uq.status = 'in_progress'
ORDER BY uq.lock_expires_at;
