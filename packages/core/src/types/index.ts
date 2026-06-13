// ─── User ────────────────────────────────────────────────────────────────────

export type PersonalityType = 'introvert' | 'ambivert' | 'extrovert'
export type FitnessLevel = 1 | 2 | 3 | 4 | 5
export type BudgetTier = 1 | 2 | 3 | 4  // 1=free, 2=<500, 3=500-2000, 4=no-limit
export type Gender = 'male' | 'female' | 'non-binary' | 'prefer-not-to-say'

export interface UserProfile {
  id: string
  username: string
  email: string
  avatar_url: string | null
  age: number
  gender: Gender
  city: string
  personality_type: PersonalityType
  fitness_level: FitnessLevel
  budget_tier: BudgetTier
  xp: number
  level: number
  streak_count: number
  longest_streak: number
  last_active_date: string | null
  streak_freeze_available: boolean
  total_quests_completed: number
  disclaimer_accepted: boolean
  push_token: string | null
  is_suspended: boolean
  suspended_reason: string | null
  created_at: string
}

// ─── Quest ───────────────────────────────────────────────────────────────────

export type QuestTier = 'F' | 'D' | 'C' | 'B' | 'A' | 'S'
export type QuestCategory =
  | 'creative'
  | 'social'
  | 'physical'
  | 'mental'
  | 'culinary'
  | 'adventure'
  | 'learning'
  | 'wellness'

export type PersonalityMatch = 'introvert' | 'extrovert' | 'all'

export interface QuestInfoDetail {
  what_to_bring?: string[]
  safety_notes?: string[]
  nearest_search_term?: string
  why_its_worth_it: string
  pro_tip?: string
  estimated_time_range: string
}

export interface Quest {
  id: string
  title: string
  description: string
  category: QuestCategory
  cost_min: number
  cost_max: number
  budget_tier: BudgetTier
  duration_minutes: number
  xp_reward: number
  tier: QuestTier
  min_age: number
  max_age: number
  fitness_required: FitnessLevel
  personality_match: PersonalityMatch
  location_required: boolean
  tags: string[]
  info: QuestInfoDetail
  image_url: string | null
  is_active: boolean
  released_at: string
  embedding: number[] | null
  created_at: string
}

export interface UserQuestPreference {
  id: string
  user_id: string
  quest_id: string
  action: 'declined' | 'interested'
  created_at: string
}

// ─── User Quest ───────────────────────────────────────────────────────────────

export type UserQuestStatus = 'assigned' | 'queued' | 'in_progress' | 'paused' | 'completed' | 'skipped'

export interface UserQuest {
  id: string
  user_id: string
  quest_id: string
  quest: Quest
  status: UserQuestStatus
  assigned_at: string
  started_at: string | null
  completed_at: string | null
  lock_expires_at: string | null
  paused_at: string | null
  time_remaining_ms: number | null
  xp_earned: number
}

// ─── Badges ───────────────────────────────────────────────────────────────────

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  condition_type: 'quest_count' | 'category_count' | 'streak' | 'tier_count' | 'special'
  condition_value: number
  condition_category?: QuestCategory
}

export interface UserBadge {
  badge: Badge
  earned_at: string
}

// ─── Level System ─────────────────────────────────────────────────────────────

export interface LevelInfo {
  level: number
  title: string
  xp_required: number
  xp_for_next: number
  color: string
}

// ─── API Responses ────────────────────────────────────────────────────────────

export interface DailyQuestAssignment {
  quest: Quest
  user_quest_id: string
  assigned_at: string
}

export interface XPAwardResult {
  xp_earned: number
  total_xp: number
  level_before: number
  level_after: number
  leveled_up: boolean
  new_badges: Badge[]
}
