import type { Quest } from '@sidequest/core'

export type CategoryStats = Record<string, number>

// ─── XP Multiplier ────────────────────────────────────────
// Rewards exploration, penalises repetition of familiar categories

export function getXPMultiplier(category: string, stats: CategoryStats, total: number): number {
  const count = stats[category] ?? 0
  const avg   = total > 0 ? total / 8 : 0  // 8 categories

  if (count === 0)                  return 1.6   // never tried: +60%
  if (count < avg * 0.5)            return 1.35  // under-explored: +35%
  if (count >= avg * 0.5 && count <= avg * 1.3) return 1.0  // balanced
  if (count > avg * 2.5)            return 0.6   // heavily over-used: -40%
  if (count > avg * 1.3)            return 0.8   // slightly over: -20%
  return 1.0
}

export interface DynamicXP {
  base: number
  adjusted: number
  multiplier: number
  label: string | null
  isBonus: boolean
  isPenalty: boolean
}

export function getDynamicXP(quest: Quest, stats: CategoryStats, total: number): DynamicXP {
  const multiplier = getXPMultiplier(quest.category, stats, total)
  const adjusted   = Math.round(quest.xp_reward * multiplier)

  const label =
    multiplier >= 1.5 ? '🌟 Explorer bonus!'
  : multiplier >= 1.3 ? '✨ Variety bonus'
  : multiplier >= 1.1 ? '↑ New territory'
  : multiplier <= 0.65 ? 'Your comfort zone'
  : multiplier < 1.0  ? 'Familiar territory'
  : null

  return { base: quest.xp_reward, adjusted, multiplier, label, isBonus: multiplier > 1, isPenalty: multiplier < 1 }
}

// ─── Quest Scoring ────────────────────────────────────────
// Higher score = surfaced first in suggestions

export function scoreQuest(
  quest: Quest,
  stats: CategoryStats,
  total: number,
  declinedIds: string[],
  declinedTags: string[],
): number {
  if (declinedIds.includes(quest.id)) return -999  // never surface declined quests

  const count = stats[quest.category] ?? 0
  const avg   = total > 0 ? total / 8 : 0
  let   score = 50 + Math.random() * 8  // base + tiny noise for variety

  // Boost unexplored categories
  if (count === 0)             score += 55
  else if (count < avg * 0.5) score += 30
  else if (count > avg * 2.5) score -= 25
  else if (count > avg * 1.3) score -= 12

  // Penalise tag overlap with declined quests
  const overlap = quest.tags.filter(t => declinedTags.includes(t)).length
  score -= overlap * 10

  // Slight boost for quests with location (richer experience)
  if (quest.location_required) score += 5

  // Boost higher-tier quests for seasoned users
  const tierBonus: Record<string, number> = { F: 0, D: 3, C: 8, B: 15, A: 20, S: 25 }
  score += (tierBonus[quest.tier] ?? 0) * Math.min(1, total / 10)

  return score
}

// ─── Pillar guarantee ─────────────────────────────────────

const PILLAR_CATEGORIES: Record<string, string[]> = {
  healthy:  ['physical'],
  creative: ['creative'],
  grow:     ['learning', 'mental'],
  peace:    ['wellness'],
  connect:  ['social'],
}

// ─── Diverse selection ────────────────────────────────────
// Returns quest IDs: pillar-balanced, category-diverse, out-of-comfort-zone

export function selectDiverseQuests(
  quests: Quest[],
  stats: CategoryStats,
  total: number,
  declinedIds: string[],
  declinedTags: string[],
  todayQuestId: string | null,
  alreadyQueuedIds: string[],
  count = 6,
): string[] {
  const exclude = new Set([
    ...declinedIds,
    ...(todayQuestId ? [todayQuestId] : []),
    ...alreadyQueuedIds,
  ])

  const candidates = quests
    .filter(q => !exclude.has(q.id))
    .map(q => ({
      id:       q.id,
      category: q.category,
      score:    scoreQuest(q, stats, total, [], declinedTags), // declined already excluded above
    }))
    .sort((a, b) => b.score - a.score)

  const selected:    string[]          = []
  const catUsed:     Record<string, number> = {}
  const MAX_PER_CAT = 2

  // Pass 1 — guarantee one quest per pillar
  for (const [, categories] of Object.entries(PILLAR_CATEGORIES)) {
    if (selected.length >= count) break
    const pick = candidates.find(c =>
      categories.includes(c.category) &&
      !selected.includes(c.id) &&
      (catUsed[c.category] ?? 0) < MAX_PER_CAT
    )
    if (pick) {
      selected.push(pick.id)
      catUsed[pick.category] = (catUsed[pick.category] ?? 0) + 1
    }
  }

  // Pass 2 — fill remaining slots with top-scored diverse quests
  for (const c of candidates) {
    if (selected.length >= count) break
    if (selected.includes(c.id)) continue
    if ((catUsed[c.category] ?? 0) >= MAX_PER_CAT) continue
    selected.push(c.id)
    catUsed[c.category] = (catUsed[c.category] ?? 0) + 1
  }

  return selected.sort(() => Math.random() - 0.5)
}
