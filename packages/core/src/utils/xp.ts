import type { LevelInfo, QuestTier } from '../types'

export const LEVEL_TABLE: LevelInfo[] = [
  { level: 1, title: 'The Curious',    xp_required: 0,     xp_for_next: 200,   color: '#9CA3AF' },
  { level: 2, title: 'The Wanderer',   xp_required: 200,   xp_for_next: 600,   color: '#60A5FA' },
  { level: 3, title: 'The Explorer',   xp_required: 600,   xp_for_next: 1400,  color: '#34D399' },
  { level: 4, title: 'The Seeker',     xp_required: 1400,  xp_for_next: 3000,  color: '#FBBF24' },
  { level: 5, title: 'The Adventurer', xp_required: 3000,  xp_for_next: 6000,  color: '#F97316' },
  { level: 6, title: 'The Legend',     xp_required: 6000,  xp_for_next: 99999, color: '#f15153' },
]

export const TIER_XP: Record<QuestTier, number> = {
  F: 25,
  D: 60,
  C: 120,
  B: 250,
  A: 500,
  S: 1000,
}

export const TIER_COLORS: Record<QuestTier, string> = {
  F: '#9CA3AF',
  D: '#60A5FA',
  C: '#34D399',
  B: '#FBBF24',
  A: '#F97316',
  S: '#f15153',
}

export const TIER_LABELS: Record<QuestTier, string> = {
  F: 'Micro',
  D: 'Easy',
  C: 'Medium',
  B: 'Challenging',
  A: 'Hard',
  S: 'Legendary',
}

export function getLevelInfo(xp: number): LevelInfo {
  for (let i = LEVEL_TABLE.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_TABLE[i].xp_required) {
      return LEVEL_TABLE[i]
    }
  }
  return LEVEL_TABLE[0]
}

export function getXPProgress(xp: number): { current: number; required: number; percent: number } {
  const level = getLevelInfo(xp)
  const nextLevel = LEVEL_TABLE.find(l => l.level === level.level + 1)
  if (!nextLevel) return { current: xp - level.xp_required, required: 1, percent: 100 }
  const current = xp - level.xp_required
  const required = nextLevel.xp_required - level.xp_required
  return { current, required, percent: Math.min(100, Math.round((current / required) * 100)) }
}

export function calculateStreakBonus(streakDays: number): number {
  if (streakDays >= 100) return 50
  if (streakDays >= 30) return 30
  if (streakDays >= 7) return 15
  if (streakDays >= 3) return 5
  return 0
}

export function getTotalXPForQuest(
  baseXP: number,
  streakDays: number,
): number {
  const bonus = calculateStreakBonus(streakDays)
  return Math.round(baseXP * (1 + bonus / 100))
}
