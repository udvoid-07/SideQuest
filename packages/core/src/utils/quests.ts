import type { Quest, UserProfile, QuestCategory } from '../types'

export const CATEGORY_ICONS: Record<QuestCategory, string> = {
  creative:  '🎨',
  social:    '🤝',
  physical:  '🏃',
  mental:    '🧠',
  culinary:  '🍜',
  adventure: '🗺️',
  learning:  '📚',
  wellness:  '🌿',
}

export const CATEGORY_COLORS: Record<QuestCategory, string> = {
  creative:  'from-pink-600 to-purple-600',
  social:    'from-blue-600 to-cyan-500',
  physical:  'from-orange-500 to-red-500',
  mental:    'from-violet-600 to-indigo-600',
  culinary:  'from-amber-500 to-orange-500',
  adventure: 'from-green-600 to-teal-500',
  learning:  'from-sky-500 to-blue-600',
  wellness:  'from-emerald-500 to-green-600',
}

export function filterQuestsForUser(quests: Quest[], user: UserProfile): Quest[] {
  return quests.filter(q => {
    if (!q.is_active) return false
    if (q.min_age > user.age || q.max_age < user.age) return false
    if (q.budget_tier > user.budget_tier) return false
    if (q.fitness_required > user.fitness_level) return false
    if (
      q.personality_match !== 'all' &&
      q.personality_match !== user.personality_type
    ) return false
    return true
  })
}

export function formatCost(min: number, max: number): string {
  if (min === 0 && max === 0) return 'Free'
  if (min === 0) return `Up to ₹${max}`
  if (min === max) return `₹${min}`
  return `₹${min}–₹${max}`
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export function getBudgetLabel(tier: number): string {
  const labels = ['Free only', 'Under ₹500', '₹500–₹2000', 'No limit']
  return labels[tier - 1] ?? 'Unknown'
}

export function getFitnessLabel(level: number): string {
  const labels = ['Sedentary', 'Lightly Active', 'Moderately Active', 'Active', 'Athletic']
  return labels[level - 1] ?? 'Unknown'
}
