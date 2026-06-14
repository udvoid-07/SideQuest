'use server'
import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient, getAuthUser } from '@/lib/supabase-server'

// ─── Start a quest ────────────────────────────────────────
// Accepts a quest_id (no row yet) or user_quest_id (row exists).
// Upserts the user_quest row if needed, then delegates timer logic
// to the start_quest DB function to keep time server-authoritative.
export async function startQuest(questId: string) {
  const user = await getAuthUser()
  if (!user) return { error: 'Not authenticated' }

  const supabase = createSupabaseServerClient()

  // Find existing user_quest row for this quest (any non-completed status)
  let { data: uq } = await supabase
    .from('user_quests')
    .select('id, status')
    .eq('user_id', user.id)
    .eq('quest_id', questId)
    .not('status', 'eq', 'completed')
    .maybeSingle()

  // No row yet — insert as assigned so start_quest can transition it
  if (!uq) {
    const { data: inserted, error: insertErr } = await supabase
      .from('user_quests')
      .insert({ user_id: user.id, quest_id: questId, status: 'assigned' })
      .select('id, status')
      .single()
    if (insertErr) return { error: insertErr.message }
    uq = inserted
  }

  const { data: lockExpiresAt, error } = await supabase.rpc('start_quest', {
    p_user_quest_id: uq.id,
  })

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  return { success: true, lockExpiresAt }
}

// ─── Complete a quest ─────────────────────────────────────
export async function completeQuest(userQuestId: string) {
  const user = await getAuthUser()
  if (!user) return { error: 'Not authenticated' }

  const supabase = createSupabaseServerClient()

  const { data, error } = await supabase.rpc('complete_quest', {
    p_user_quest_id: userQuestId,
  })

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  revalidatePath('/profile')
  return { success: true, result: data }
}

// ─── Skip a quest ─────────────────────────────────────────
export async function skipQuest(userQuestId: string) {
  const user = await getAuthUser()
  if (!user) return { error: 'Not authenticated' }

  const supabase = createSupabaseServerClient()

  await supabase
    .from('user_quests')
    .update({ status: 'skipped' })
    .eq('id', userQuestId)
    .eq('user_id', user.id)

  // Assign a fresh quest for today
  await supabase.rpc('assign_daily_quest', { p_user_id: user.id })

  revalidatePath('/dashboard')
  return { success: true }
}

// ─── Express interest in a quest ─────────────────────────
export async function expressInterest(questId: string) {
  const user = await getAuthUser()
  if (!user) return { error: 'Not authenticated' }

  const supabase = createSupabaseServerClient()

  // Upsert preference
  await supabase.from('user_quest_preferences').upsert(
    { user_id: user.id, quest_id: questId, action: 'interested' },
    { onConflict: 'user_id,quest_id' },
  )

  // Add to dashboard queue if not already there
  const { data: existing } = await supabase
    .from('user_quests')
    .select('id, status')
    .eq('user_id', user.id)
    .eq('quest_id', questId)
    .single()

  if (!existing) {
    await supabase.from('user_quests').insert({
      user_id:  user.id,
      quest_id: questId,
      status:   'queued',
    })
  }

  revalidatePath('/quests')
  revalidatePath('/dashboard')
  return { success: true }
}

// ─── Decline a quest ──────────────────────────────────────
export async function declineQuest(questId: string) {
  const user = await getAuthUser()
  if (!user) return { error: 'Not authenticated' }

  const supabase = createSupabaseServerClient()

  await supabase.from('user_quest_preferences').upsert(
    { user_id: user.id, quest_id: questId, action: 'declined' },
    { onConflict: 'user_id,quest_id' },
  )

  // Remove from queue if it was there
  await supabase
    .from('user_quests')
    .delete()
    .eq('user_id', user.id)
    .eq('quest_id', questId)
    .eq('status', 'queued')

  revalidatePath('/quests')
  revalidatePath('/dashboard')
  return { success: true }
}

// ─── Pause an in-progress quest ───────────────────────────
export async function pauseQuest(userQuestId: string) {
  const user = await getAuthUser()
  if (!user) return { error: 'Not authenticated' }

  const supabase = createSupabaseServerClient()
  const { error } = await supabase.rpc('pause_quest', { p_user_quest_id: userQuestId })

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  return { success: true }
}

// ─── Resume a paused quest ────────────────────────────────
export async function resumeQuest(userQuestId: string) {
  const user = await getAuthUser()
  if (!user) return { error: 'Not authenticated' }

  const supabase = createSupabaseServerClient()
  const { error } = await supabase.rpc('resume_quest', { p_user_quest_id: userQuestId })

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  return { success: true }
}

// ─── Abandon an in-progress / assigned quest ─────────────
export async function abandonQuest(userQuestId: string) {
  const user = await getAuthUser()
  if (!user) return { error: 'Not authenticated' }

  const supabase = createSupabaseServerClient()
  await supabase
    .from('user_quests')
    .update({ status: 'skipped' })
    .eq('id', userQuestId)
    .eq('user_id', user.id)
    .in('status', ['in_progress', 'paused', 'assigned'])

  revalidatePath('/dashboard')
  revalidatePath('/profile')
  return { success: true }
}

// ─── Update user profile ──────────────────────────────────
export async function updateProfile(updates: {
  username?: string
  city?: string
  personality_type?: string
  fitness_level?: number
  budget_tier?: number
}) {
  const user = await getAuthUser()
  if (!user) return { error: 'Not authenticated' }

  const supabase = createSupabaseServerClient()
  const { error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/profile')
  revalidatePath('/dashboard')
  return { success: true }
}

// ─── Send password reset email ────────────────────────────
export async function sendPasswordReset() {
  const user = await getAuthUser()
  if (!user?.email) return { error: 'Not authenticated' }

  const supabase = createSupabaseServerClient()
  const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/reset-password`,
  })
  if (error) return { error: error.message }
  return { success: true }
}

// ─── Remove a queued quest ────────────────────────────────
export async function removeFromQueue(userQuestId: string) {
  const user = await getAuthUser()
  if (!user) return { error: 'Not authenticated' }

  const supabase = createSupabaseServerClient()
  await supabase
    .from('user_quests')
    .delete()
    .eq('id', userQuestId)
    .eq('user_id', user.id)
    .eq('status', 'queued')

  revalidatePath('/dashboard')
  return { success: true }
}

// ─── Delete account (GDPR / IT Act compliance) ───────────
export async function deleteAccount() {
  const user = await getAuthUser()
  if (!user) return { error: 'Not authenticated' }

  const supabase = createSupabaseServerClient()

  // Delete profile row — cascades to all user data via FK
  await supabase.from('users').delete().eq('id', user.id)

  // Sign out before deleting from auth (need service role for auth.users deletion)
  // The auth.users record will be cleaned up via Supabase's scheduled cleanup
  // or manually via: supabase.auth.admin.deleteUser(user.id) with service role
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  return { success: true }
}

// ─── Sign out ─────────────────────────────────────────────
export async function signOut() {
  const supabase = createSupabaseServerClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
}
