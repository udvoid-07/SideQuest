export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          email: string
          avatar_url: string | null
          age: number
          gender: string
          city: string
          personality_type: string
          fitness_level: number
          budget_tier: number
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
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      quests: {
        Row: {
          id: string
          title: string
          description: string
          category: string
          cost_min: number
          cost_max: number
          budget_tier: number
          duration_minutes: number
          xp_reward: number
          tier: string
          min_age: number
          max_age: number
          fitness_required: number
          personality_match: string
          location_required: boolean
          tags: string[]
          info: Json
          image_url: string | null
          is_active: boolean
          released_at: string
          embedding: number[] | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['quests']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['quests']['Insert']>
      }
      user_quests: {
        Row: {
          id: string
          user_id: string
          quest_id: string
          status: string
          assigned_at: string
          started_at: string | null
          completed_at: string | null
          lock_expires_at: string | null
          paused_at: string | null
          time_remaining_ms: number | null
          xp_earned: number
        }
        Insert: Omit<Database['public']['Tables']['user_quests']['Row'], 'id' | 'assigned_at'>
        Update: Partial<Database['public']['Tables']['user_quests']['Insert']>
      }
      badges: {
        Row: {
          id: string
          name: string
          description: string
          icon: string
          condition_type: string
          condition_value: number
          condition_category: string | null
        }
        Insert: Omit<Database['public']['Tables']['badges']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['badges']['Insert']>
      }
      user_badges: {
        Row: {
          id: string
          user_id: string
          badge_id: string
          earned_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_badges']['Row'], 'id' | 'earned_at'>
        Update: never
      }
      user_quest_preferences: {
        Row: {
          id: string
          user_id: string
          quest_id: string
          action: 'declined' | 'interested'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_quest_preferences']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['user_quest_preferences']['Insert']>
      }
      streak_freeze_uses: {
        Row: {
          id: string
          user_id: string
          used_at: string
        }
        Insert: Omit<Database['public']['Tables']['streak_freeze_uses']['Row'], 'id'>
        Update: never
      }
      security_audit_log: {
        Row: {
          id: string
          user_id: string | null
          action: string
          details: Json
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['security_audit_log']['Row'], 'id' | 'created_at'>
        Update: never
      }
    }
    Functions: {
      assign_daily_quest: {
        Args: { p_user_id: string }
        Returns: string
      }
      complete_quest: {
        Args: { p_user_quest_id: string }
        Returns: Json
      }
      start_quest: {
        Args: { p_user_quest_id: string }
        Returns: string
      }
      pause_quest: {
        Args: { p_user_quest_id: string }
        Returns: void
      }
      resume_quest: {
        Args: { p_user_quest_id: string }
        Returns: string
      }
      check_and_award_badges: {
        Args: { p_user_id: string }
        Returns: string[]
      }
      reset_inactive_streaks: {
        Args: Record<string, never>
        Returns: void
      }
      match_quests: {
        Args: {
          query_embedding: number[]
          match_threshold?: number
          match_count?: number
          p_personality?: string
          p_age?: number
          p_budget_tier?: number
          p_fitness_level?: number
        }
        Returns: {
          id: string
          title: string
          description: string
          category: string
          tier: string
          xp_reward: number
          duration_minutes: number
          cost_min: number
          cost_max: number
          tags: string[]
          info: Json
          similarity: number
        }[]
      }
      check_quest_daily_limit: {
        Args: { p_user_id: string }
        Returns: boolean
      }
    }
  }
}
