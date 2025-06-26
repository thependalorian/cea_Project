/**
 * Supabase database types
 * Purpose: Type definitions for Supabase database schema
 * Location: /types/database.ts
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
      profiles: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          full_name: string | null
          avatar_url: string | null
          user_type: string
          role: string
          contact_info: Json
          verified: boolean
          profile_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          user_type: string
          role: string
          contact_info?: Json
          verified?: boolean
          profile_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          user_type?: string
          role?: string
          contact_info?: Json
          verified?: boolean
          profile_completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      admin_profiles: {
        Row: {
          id: string
          user_id: string
          email: string
          full_name: string | null
          can_manage_users: boolean
          can_manage_content: boolean
          can_manage_partners: boolean
          can_manage_system: boolean
          can_view_analytics: boolean
          profile_completed: boolean
          permissions: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          full_name?: string | null
          can_manage_users?: boolean
          can_manage_content?: boolean
          can_manage_partners?: boolean
          can_manage_system?: boolean
          can_view_analytics?: boolean
          profile_completed?: boolean
          permissions?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email?: string
          full_name?: string | null
          can_manage_users?: boolean
          can_manage_content?: boolean
          can_manage_partners?: boolean
          can_manage_system?: boolean
          can_view_analytics?: boolean
          profile_completed?: boolean
          permissions?: Json
          created_at?: string
          updated_at?: string
        }
      }
      job_seeker_profiles: {
        Row: {
          id: string
          user_id: string
          email: string
          full_name: string | null
          resume_url: string | null
          skills: string[] | null
          interests: string[] | null
          experience_level: string | null
          preferred_location: string | null
          profile_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          full_name?: string | null
          resume_url?: string | null
          skills?: string[] | null
          interests?: string[] | null
          experience_level?: string | null
          preferred_location?: string | null
          profile_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email?: string
          full_name?: string | null
          resume_url?: string | null
          skills?: string[] | null
          interests?: string[] | null
          experience_level?: string | null
          preferred_location?: string | null
          profile_completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          user_id: string
          title: string | null
          description: string | null
          conversation_type: string | null
          status: string | null
          message_count: number | null
          total_tokens_used: number | null
          session_metadata: Json | null
          last_activity: string
          thread_id: string | null
          initial_query: string | null
          ended_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          user_id: string
          title?: string | null
          description?: string | null
          conversation_type?: string | null
          status?: string | null
          message_count?: number | null
          total_tokens_used?: number | null
          session_metadata?: Json | null
          last_activity: string
          thread_id?: string | null
          initial_query?: string | null
          ended_at?: string | null
          created_at: string
          updated_at: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string | null
          description?: string | null
          conversation_type?: string | null
          status?: string | null
          message_count?: number | null
          total_tokens_used?: number | null
          session_metadata?: Json | null
          last_activity?: string
          thread_id?: string | null
          initial_query?: string | null
          ended_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      conversation_messages: {
        Row: {
          id: string
          conversation_id: string
          user_id: string
          content: string
          role: string
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          user_id: string
          content: string
          role: string
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          user_id?: string
          content?: string
          role?: string
          created_at?: string
        }
      }
      resumes: {
        Row: {
          id: string
          user_id: string
          file_path: string
          file_name: string
          file_type: string
          status: string
          analysis_result: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          file_path: string
          file_name: string
          file_type: string
          status?: string
          analysis_result?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          file_path?: string
          file_name?: string
          file_type?: string
          status?: string
          analysis_result?: Json | null
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

export type Profile = Database['public']['Tables']['profiles']['Row']
export type AdminProfile = Database['public']['Tables']['admin_profiles']['Row']
export type JobSeekerProfile = Database['public']['Tables']['job_seeker_profiles']['Row']
export type Conversation = Database['public']['Tables']['conversations']['Row']
export type ConversationMessage = Database['public']['Tables']['conversation_messages']['Row']
export type Resume = Database['public']['Tables']['resumes']['Row']

// Additional types for analytics
export interface ConversationAnalytics {
  id: string
  conversation_id: string
  user_id: string
  tokens_used: number
  duration_seconds: number
  message_count: number
  topics_discussed: string[]
  sentiment_score: number
  created_at: string
  updated_at: string
} 