/**
 * Supabase Database type definitions for WordPal.
 *
 * Hand-written to match supabase/migrations/0001..0007. Regenerate
 * with `npx supabase gen types typescript --linked` once the project
 * is linked, then diff against this file before overwriting it.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type AppRole = 'admin' | 'instructor' | 'content_creator' | 'student'

export interface Database {
  public: {
    Tables: {
      user_roles: {
        Row: {
          user_id: string
          role: AppRole
          granted_by: string | null
          granted_at: string
        }
        Insert: {
          user_id: string
          role?: AppRole
          granted_by?: string | null
          granted_at?: string
        }
        Update: {
          user_id?: string
          role?: AppRole
          granted_by?: string | null
          granted_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          email: string
          display_name: string
          avatar_url: string | null
          cefr_level: string
          status: 'active' | 'inactive' | 'suspended'
          current_learning_path_id: string | null
          current_lesson_id: string | null
          total_xp: number
          streak_current: number
          streak_longest: number
          last_activity_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          display_name?: string
          avatar_url?: string | null
          cefr_level?: string
          status?: 'active' | 'inactive' | 'suspended'
          current_learning_path_id?: string | null
          current_lesson_id?: string | null
          total_xp?: number
          streak_current?: number
          streak_longest?: number
          last_activity_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string
          avatar_url?: string | null
          cefr_level?: string
          status?: 'active' | 'inactive' | 'suspended'
          current_learning_path_id?: string | null
          current_lesson_id?: string | null
          total_xp?: number
          streak_current?: number
          streak_longest?: number
          last_activity_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      learning_paths: {
        Row: {
          id: string
          legacy_id: string | null
          title: string
          description: string
          target_level: string
          difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
          estimated_duration: number
          xp_reward: number
          status: 'draft' | 'published'
          created_by: string | null
          updated_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          legacy_id?: string | null
          title: string
          description?: string
          target_level: string
          difficulty?: 'Beginner' | 'Intermediate' | 'Advanced'
          estimated_duration?: number
          xp_reward?: number
          status?: 'draft' | 'published'
          created_by?: string | null
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          legacy_id?: string | null
          title?: string
          description?: string
          target_level?: string
          difficulty?: 'Beginner' | 'Intermediate' | 'Advanced'
          estimated_duration?: number
          xp_reward?: number
          status?: 'draft' | 'published'
          created_by?: string | null
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      units: {
        Row: {
          id: string
          learning_path_id: string
          legacy_id: string | null
          title: string
          description: string
          position: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          learning_path_id: string
          legacy_id?: string | null
          title: string
          description?: string
          position: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          learning_path_id?: string
          legacy_id?: string | null
          title?: string
          description?: string
          position?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      lessons: {
        Row: {
          id: string
          unit_id: string
          legacy_id: string | null
          title: string
          description: string
          grammar_focus: string
          cefr_level: string
          path_level: 'beginner' | 'intermediate' | 'advanced'
          icon: string
          difficulty: number
          estimated_duration: number
          learning_objectives: string[]
          status: 'draft' | 'published' | 'incomplete'
          position: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          unit_id: string
          legacy_id?: string | null
          title: string
          description?: string
          grammar_focus?: string
          cefr_level?: string
          path_level?: 'beginner' | 'intermediate' | 'advanced'
          icon?: string
          difficulty?: number
          estimated_duration?: number
          learning_objectives?: string[]
          status?: 'draft' | 'published' | 'incomplete'
          position: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          unit_id?: string
          legacy_id?: string | null
          title?: string
          description?: string
          grammar_focus?: string
          cefr_level?: string
          path_level?: 'beginner' | 'intermediate' | 'advanced'
          icon?: string
          difficulty?: number
          estimated_duration?: number
          learning_objectives?: string[]
          status?: 'draft' | 'published' | 'incomplete'
          position?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      placement_challenges: {
        Row: {
          id: string
          legacy_id: string | null
          title: string
          description: string
          target_level: string
          from_level: 'beginner' | 'intermediate' | null
          to_level: 'intermediate' | 'advanced' | null
          grammar_topics: string[]
          difficulty: number
          required_correct: number
          status: 'draft' | 'published'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          legacy_id?: string | null
          title: string
          description?: string
          target_level: string
          from_level?: 'beginner' | 'intermediate' | null
          to_level?: 'intermediate' | 'advanced' | null
          grammar_topics?: string[]
          difficulty?: number
          required_correct?: number
          status?: 'draft' | 'published'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          legacy_id?: string | null
          title?: string
          description?: string
          target_level?: string
          from_level?: 'beginner' | 'intermediate' | null
          to_level?: 'intermediate' | 'advanced' | null
          grammar_topics?: string[]
          difficulty?: number
          required_correct?: number
          status?: 'draft' | 'published'
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      exercises: {
        Row: {
          id: string
          lesson_id: string | null
          challenge_id: string | null
          legacy_id: string | null
          type: 'drag-and-drop' | 'multiple-choice' | 'sentence-ordering' | 'fill-in-blank' | 'rewrite-sentence' | 'free-writing'
          position: number
          status: 'draft' | 'published' | 'incomplete'
          hint: string
          tutor_explanation: string
          content: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          lesson_id?: string | null
          challenge_id?: string | null
          legacy_id?: string | null
          type: 'drag-and-drop' | 'multiple-choice' | 'sentence-ordering' | 'fill-in-blank' | 'rewrite-sentence' | 'free-writing'
          position: number
          status?: 'draft' | 'published' | 'incomplete'
          hint?: string
          tutor_explanation?: string
          content: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          lesson_id?: string | null
          challenge_id?: string | null
          legacy_id?: string | null
          type?: 'drag-and-drop' | 'multiple-choice' | 'sentence-ordering' | 'fill-in-blank' | 'rewrite-sentence' | 'free-writing'
          position?: number
          status?: 'draft' | 'published' | 'incomplete'
          hint?: string
          tutor_explanation?: string
          content?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      achievements: {
        Row: {
          id: string
          legacy_id: string | null
          title: string
          description: string
          badge_icon: string
          xp_reward: number
          trigger_criteria: 'lessons_completed' | 'streak_days' | 'grammar_score' | 'challenge_passed' | 'exercises_completed'
          threshold_value: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          legacy_id?: string | null
          title: string
          description?: string
          badge_icon?: string
          xp_reward?: number
          trigger_criteria: 'lessons_completed' | 'streak_days' | 'grammar_score' | 'challenge_passed' | 'exercises_completed'
          threshold_value: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          legacy_id?: string | null
          title?: string
          description?: string
          badge_icon?: string
          xp_reward?: number
          trigger_criteria?: 'lessons_completed' | 'streak_days' | 'grammar_score' | 'challenge_passed' | 'exercises_completed'
          threshold_value?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      exercise_attempts: {
        Row: {
          id: string
          user_id: string
          exercise_id: string
          is_correct: boolean
          score: number
          submitted_answer: Json | null
          incorrect_categories: string[]
          duration_ms: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          exercise_id: string
          is_correct: boolean
          score?: number
          submitted_answer?: Json | null
          incorrect_categories?: string[]
          duration_ms?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          exercise_id?: string
          is_correct?: boolean
          score?: number
          submitted_answer?: Json | null
          incorrect_categories?: string[]
          duration_ms?: number | null
          created_at?: string
        }
        Relationships: []
      }
      user_exercise_progress: {
        Row: {
          user_id: string
          exercise_id: string
          best_score: number
          completed: boolean
          attempts: number
          first_completed_at: string | null
          last_attempt_at: string
        }
        Insert: {
          user_id: string
          exercise_id: string
          best_score?: number
          completed?: boolean
          attempts?: number
          first_completed_at?: string | null
          last_attempt_at?: string
        }
        Update: {
          user_id?: string
          exercise_id?: string
          best_score?: number
          completed?: boolean
          attempts?: number
          first_completed_at?: string | null
          last_attempt_at?: string
        }
        Relationships: []
      }
      user_lesson_progress: {
        Row: {
          user_id: string
          lesson_id: string
          exercises_completed: number
          exercises_total: number
          completed: boolean
          completed_at: string | null
          updated_at: string
        }
        Insert: {
          user_id: string
          lesson_id: string
          exercises_completed?: number
          exercises_total?: number
          completed?: boolean
          completed_at?: string | null
          updated_at?: string
        }
        Update: {
          user_id?: string
          lesson_id?: string
          exercises_completed?: number
          exercises_total?: number
          completed?: boolean
          completed_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_challenge_attempts: {
        Row: {
          id: string
          user_id: string
          challenge_id: string
          correct_count: number
          total_count: number
          passed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          challenge_id: string
          correct_count: number
          total_count: number
          passed: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          challenge_id?: string
          correct_count?: number
          total_count?: number
          passed?: boolean
          created_at?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          user_id: string
          achievement_id: string
          unlocked_at: string
        }
        Insert: {
          user_id: string
          achievement_id: string
          unlocked_at?: string
        }
        Update: {
          user_id?: string
          achievement_id?: string
          unlocked_at?: string
        }
        Relationships: []
      }
      xp_events: {
        Row: {
          id: string
          user_id: string
          amount: number
          source: 'exercise' | 'lesson' | 'challenge' | 'achievement' | 'adjustment'
          source_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          source: 'exercise' | 'lesson' | 'challenge' | 'achievement' | 'adjustment'
          source_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          source?: 'exercise' | 'lesson' | 'challenge' | 'achievement' | 'adjustment'
          source_id?: string | null
          created_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          type: 'registration' | 'challenge_completion' | 'system_error'
          title: string
          description: string
          context_url: string
          subject_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          type: 'registration' | 'challenge_completion' | 'system_error'
          title: string
          description?: string
          context_url?: string
          subject_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          type?: 'registration' | 'challenge_completion' | 'system_error'
          title?: string
          description?: string
          context_url?: string
          subject_id?: string | null
          created_at?: string
        }
        Relationships: []
      }
      notification_reads: {
        Row: {
          notification_id: string
          user_id: string
          read_at: string
        }
        Insert: {
          notification_id: string
          user_id: string
          read_at?: string
        }
        Update: {
          notification_id?: string
          user_id?: string
          read_at?: string
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          id: number
          brand: Json
          scoring: Json
          notifications: Json
          updated_by: string | null
          updated_at: string
        }
        Insert: {
          id?: number
          brand?: Json
          scoring?: Json
          notifications?: Json
          updated_by?: string | null
          updated_at?: string
        }
        Update: {
          id?: number
          brand?: Json
          scoring?: Json
          notifications?: Json
          updated_by?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      admin_lesson_rows: {
        Row: Database['public']['Tables']['lessons']['Row'] & {
          learning_path_id: string
          exercise_count: number
        }
        Relationships: []
      }
      admin_learning_path_rows: {
        Row: Database['public']['Tables']['learning_paths']['Row'] & {
          unit_count: number
          lesson_count: number
        }
        Relationships: []
      }
      admin_placement_challenge_rows: {
        Row: Database['public']['Tables']['placement_challenges']['Row'] & {
          question_count: number
        }
        Relationships: []
      }
      admin_student_rows: {
        Row: {
          id: string
          avatar_url: string | null
          name: string
          email: string
          role: AppRole
          cefr_level: string
          current_lesson: string | null
          grammar_score: number
          progress_percentage: number
          status: 'active' | 'inactive' | 'suspended'
          last_active_at: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      app_role_of: { Args: { p_user: string }; Returns: AppRole }
      my_role: { Args: Record<string, never>; Returns: AppRole }
      is_staff: { Args: Record<string, never>; Returns: boolean }
      is_admin: { Args: Record<string, never>; Returns: boolean }
      can_edit_content: { Args: Record<string, never>; Returns: boolean }
      can_manage_students: { Args: Record<string, never>; Returns: boolean }
      record_exercise_attempt: {
        Args: {
          p_exercise_id: string
          p_is_correct: boolean
          p_incorrect_categories?: string[]
          p_duration_ms?: number | null
          p_submitted?: Json | null
        }
        Returns: Json
      }
      record_challenge_attempt: {
        Args: { p_challenge_id: string; p_correct_count: number; p_total_count: number }
        Returns: Json
      }
      get_leaderboard: {
        Args: { p_limit?: number }
        Returns: {
          user_id: string
          display_name: string
          avatar_url: string | null
          total_xp: number
          streak_current: number
          rank: number
        }[]
      }
      get_student_profile: { Args: { p_user: string }; Returns: Json }
      get_kpi_metrics: { Args: Record<string, never>; Returns: Json }
      get_analytics_data: { Args: { p_start: string; p_end: string }; Returns: Json }
      pct_change: { Args: { v_current: number; v_previous: number }; Returns: number }
      admin_update_student: {
        Args: {
          p_user: string
          p_status?: string | null
          p_cefr_level?: string | null
          p_display_name?: string | null
          p_role?: AppRole | null
        }
        Returns: Json
      }
    }
    Enums: {
      app_role: AppRole
    }
  }
}
