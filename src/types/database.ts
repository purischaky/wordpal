/**
 * Supabase Database type definitions for WordPal.
 *
 * This is a placeholder that will be replaced with generated types
 * from `supabase gen types typescript` once the database schema is deployed.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          display_name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          display_name?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string
          created_at?: string
          updated_at?: string
        }
      }
      lessons: {
        Row: {
          id: string
          title: string
          description: string
          order: number
          grammar_concept: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string
          order: number
          grammar_concept: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          order?: number
          grammar_concept?: string
          created_at?: string
        }
      }
      exercises: {
        Row: {
          id: string
          lesson_id: string
          order: number
          target_sentence: string
          max_blocks: number
          created_at: string
        }
        Insert: {
          id?: string
          lesson_id: string
          order: number
          target_sentence: string
          max_blocks?: number
          created_at?: string
        }
        Update: {
          id?: string
          lesson_id?: string
          order?: number
          target_sentence?: string
          max_blocks?: number
          created_at?: string
        }
      }
      exercise_blocks: {
        Row: {
          id: string
          exercise_id: string
          label: string
          category: 'subject' | 'verb' | 'object' | 'modifier' | 'time' | 'place' | 'contrast'
          is_distractor: boolean
          source_order: number
        }
        Insert: {
          id?: string
          exercise_id: string
          label: string
          category: 'subject' | 'verb' | 'object' | 'modifier' | 'time' | 'place' | 'contrast'
          is_distractor?: boolean
          source_order?: number
        }
        Update: {
          id?: string
          exercise_id?: string
          label?: string
          category?: 'subject' | 'verb' | 'object' | 'modifier' | 'time' | 'place' | 'contrast'
          is_distractor?: boolean
          source_order?: number
        }
      }
      user_progress: {
        Row: {
          id: string
          user_id: string
          exercise_id: string
          score: number
          completed: boolean
          attempts: number
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          exercise_id: string
          score?: number
          completed?: boolean
          attempts?: number
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          exercise_id?: string
          score?: number
          completed?: boolean
          attempts?: number
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
