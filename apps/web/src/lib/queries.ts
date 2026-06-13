import type { SupabaseClient } from '@supabase/supabase-js'
import type { UserProfile, Quest, UserQuest, Badge } from '@sidequest/core'
import { selectDiverseQuests } from './quest-scoring'
import type { CategoryStats } from './quest-scoring'

// ─── User ─────────────────────────────────────────────────

export async function getUserProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<UserProfile | null> {
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()
  return data as UserProfile | null
}

// ─── Quests ───────────────────────────────────────────────

export async function getTodayQuest(
  supabase: SupabaseClient,
  userId: string,
): Promise<UserQuest | null> {
  const today = new Date().toISOString().split('T')[0]

  // Look for any in-progress or assigned quest from today
  const { data } = await supabase
    .from('user_quests')
    .select('*, quest:quests(*)')
    .eq('user_id', userId)
    .in('status', ['assigned', 'in_progress'])
    .gte('assigned_at', today)
    .order('assigned_at', { ascending: false })
    .limit(1)
    .single()

  if (data) return data as UserQuest

  // No quest yet — assign one via the DB function
  const { data: newId, error } = await supabase.rpc('assign_daily_quest', {
    p_user_id: userId,
  })
  if (error || !newId) return null

  const { data: newQuest } = await supabase
    .from('user_quests')
    .select('*, quest:quests(*)')
    .eq('id', newId)
    .single()

  return newQuest as UserQuest | null
}

export async function getUserPreferences(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ declinedIds: string[]; declinedTags: string[]; interestedIds: string[] }> {
  // Single join — avoids fetching all quests separately
  const { data: prefs } = await supabase
    .from('user_quest_preferences')
    .select('quest_id, action, quest:quests(tags)')
    .eq('user_id', userId)

  const rows = prefs ?? []
  const declinedIds: string[]   = []
  const interestedIds: string[] = []
  const declinedTags: string[]  = []

  for (const p of rows as any[]) {
    if (p.action === 'declined') {
      declinedIds.push(p.quest_id)
      if (Array.isArray(p.quest?.tags)) declinedTags.push(...p.quest.tags)
    } else if (p.action === 'interested') {
      interestedIds.push(p.quest_id)
    }
  }

  return { declinedIds, declinedTags: [...new Set(declinedTags)], interestedIds }
}

export async function getQueuedQuests(
  supabase: SupabaseClient,
  userId: string,
): Promise<UserQuest[]> {
  const { data } = await supabase
    .from('user_quests')
    .select('*, quest:quests(*)')
    .eq('user_id', userId)
    .in('status', ['queued', 'paused'])
    .order('assigned_at', { ascending: false })
  return (data ?? []) as UserQuest[]
}

export async function getSuggestedQuests(
  supabase: SupabaseClient,
  user: UserProfile,
  excludeQuestId?: string,
  limit = 6,
): Promise<Quest[]> {
  // Fetch all candidate quests for this user's profile
  const { data: all } = await supabase
    .from('quests')
    .select('*')
    .eq('is_active', true)
    .lte('min_age', user.age)
    .gte('max_age', user.age)
    .lte('budget_tier', user.budget_tier)
    .lte('fitness_required', user.fitness_level)
    .in('personality_match', ['all', user.personality_type])

  if (!all || all.length === 0) return []

  // Gather user history for scoring
  const [completedRes, prefsRes, queuedRes] = await Promise.all([
    supabase.from('user_quests').select('quest_id').eq('user_id', user.id).eq('status', 'completed'),
    getUserPreferences(supabase, user.id),
    supabase.from('user_quests').select('quest_id').eq('user_id', user.id).in('status', ['queued','assigned','in_progress','paused']),
  ])

  const completedIds = (completedRes.data ?? []).map((r: any) => r.quest_id)
  const queuedIds    = (queuedRes.data ?? []).map((r: any) => r.quest_id)
  const { declinedIds, declinedTags } = prefsRes

  // Build category stats from completions
  const completedQuests = all.filter((q: any) => completedIds.includes(q.id))
  const stats: CategoryStats = {}
  for (const q of completedQuests as any[]) {
    stats[q.category] = (stats[q.category] ?? 0) + 1
  }

  const excludeAll = [...completedIds, ...queuedIds, ...(excludeQuestId ? [excludeQuestId] : [])]

  const selectedIds = selectDiverseQuests(
    all as Quest[],
    stats,
    user.total_quests_completed,
    declinedIds,
    declinedTags,
    excludeQuestId ?? null,
    excludeAll,
    limit,
  )

  return selectedIds
    .map(id => all.find((q: any) => q.id === id))
    .filter(Boolean) as Quest[]
}

export async function getRecentCompletions(
  supabase: SupabaseClient,
  userId: string,
  limit = 5,
): Promise<UserQuest[]> {
  const { data } = await supabase
    .from('user_quests')
    .select('*, quest:quests(title, category, tier)')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(limit)
  return (data ?? []) as UserQuest[]
}

export async function getAllFilteredQuests(
  supabase: SupabaseClient,
  user: UserProfile,
): Promise<Quest[]> {
  // Browser shows ALL quests the user can discover regardless of budget/fitness —
  // budget and fitness are only applied to the auto-assigned daily quest.
  // Age and personality are still respected to avoid irrelevant content.
  const { data } = await supabase
    .from('quests')
    .select('*')
    .eq('is_active', true)
    .lte('min_age', user.age)
    .gte('max_age', user.age)
    .in('personality_match', ['all', user.personality_type])
    .order('created_at', { ascending: false })  // newest first so daily additions appear at top

  return (data ?? []) as Quest[]
}

// ─── Profile ──────────────────────────────────────────────

export async function getAcceptedQuests(
  supabase: SupabaseClient,
  userId: string,
): Promise<UserQuest[]> {
  const { data } = await supabase
    .from('user_quests')
    .select('*, quest:quests(*)')
    .eq('user_id', userId)
    .in('status', ['queued', 'in_progress', 'paused'])
    .order('assigned_at', { ascending: false })
  return (data ?? []) as UserQuest[]
}

export async function getCompletedQuests(
  supabase: SupabaseClient,
  userId: string,
): Promise<UserQuest[]> {
  const { data } = await supabase
    .from('user_quests')
    .select('*, quest:quests(*)')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(50)
  return (data ?? []) as UserQuest[]
}

export async function getCategoryStats(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ category: string; count: number }[]> {
  const { data } = await supabase
    .from('user_quests')
    .select('quest:quests(category)')
    .eq('user_id', userId)
    .eq('status', 'completed')

  if (!data || data.length === 0) return []

  const counts: Record<string, number> = {}
  for (const row of data as any[]) {
    const cat = row.quest?.category
    if (cat) counts[cat] = (counts[cat] ?? 0) + 1
  }
  return Object.entries(counts)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
}

export async function getUserBadgesEarned(
  supabase: SupabaseClient,
  userId: string,
): Promise<string[]> {
  const { data } = await supabase
    .from('user_badges')
    .select('badge_id')
    .eq('user_id', userId)
  return (data ?? []).map((r: any) => r.badge_id)
}

export async function getAllBadges(
  supabase: SupabaseClient,
): Promise<Badge[]> {
  const { data } = await supabase.from('badges').select('*').order('condition_value')
  return (data ?? []) as Badge[]
}
