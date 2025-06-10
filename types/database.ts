/**
 * Database Types - Climate Economy Assistant
 * Comprehensive TypeScript interfaces matching Supabase schema
 * Generated from database schema analysis
 * Location: types/database.ts
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
      admin_permissions: {
        Row: {
          id: string
          permission_level: string
          resource_type: string
          granted_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          permission_level: string
          resource_type: string
          granted_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          permission_level?: string
          resource_type?: string
          granted_by?: string | null
          created_at?: string
        }
      }
      admin_profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string
          email: string | null
          phone: string | null
          direct_phone: string | null
          department: string | null
          can_manage_users: boolean | null
          can_manage_partners: boolean | null
          can_manage_content: boolean | null
          can_view_analytics: boolean | null
          can_manage_system: boolean | null
          permissions: Json | null
          emergency_contact: Json | null
          admin_notes: string | null
          profile_completed: boolean | null
          last_login: string | null
          last_admin_action: string | null
          total_admin_actions: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name: string
          email?: string | null
          phone?: string | null
          direct_phone?: string | null
          department?: string | null
          can_manage_users?: boolean | null
          can_manage_partners?: boolean | null
          can_manage_content?: boolean | null
          can_view_analytics?: boolean | null
          can_manage_system?: boolean | null
          permissions?: Json | null
          emergency_contact?: Json | null
          admin_notes?: string | null
          profile_completed?: boolean | null
          last_login?: string | null
          last_admin_action?: string | null
          total_admin_actions?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string
          email?: string | null
          phone?: string | null
          direct_phone?: string | null
          department?: string | null
          can_manage_users?: boolean | null
          can_manage_partners?: boolean | null
          can_manage_content?: boolean | null
          can_view_analytics?: boolean | null
          can_manage_system?: boolean | null
          permissions?: Json | null
          emergency_contact?: Json | null
          admin_notes?: string | null
          profile_completed?: boolean | null
          last_login?: string | null
          last_admin_action?: string | null
          total_admin_actions?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          table_name: string
          record_id: string | null
          operation: string
          old_values: Json | null
          new_values: Json | null
          ip_address: string | null
          user_agent: string | null
          details: Json | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          table_name: string
          record_id?: string | null
          operation: string
          old_values?: Json | null
          new_values?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          details?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          table_name?: string
          record_id?: string | null
          operation?: string
          old_values?: Json | null
          new_values?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          details?: Json | null
          created_at?: string | null
        }
      }
      content_flags: {
        Row: {
          id: string
          content_id: string
          content_type: string
          flag_reason: string
          flagged_by: string | null
          admin_reviewed: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          content_id: string
          content_type: string
          flag_reason: string
          flagged_by?: string | null
          admin_reviewed?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          content_id?: string
          content_type?: string
          flag_reason?: string
          flagged_by?: string | null
          admin_reviewed?: boolean | null
          created_at?: string | null
        }
      }
      conversation_analytics: {
        Row: {
          id: string
          user_id: string
          conversation_id: string
          session_duration_seconds: number | null
          messages_sent: number | null
          messages_received: number | null
          total_tokens_consumed: number | null
          average_response_time_ms: number | null
          user_satisfaction_score: number | null
          goals_achieved: boolean | null
          conversation_outcome: string | null
          topics_discussed: string[] | null
          resources_accessed: string[] | null
          jobs_viewed: string[] | null
          partners_contacted: string[] | null
          follow_up_actions_taken: number | null
          next_steps: Json | null
          analyzed_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          conversation_id: string
          session_duration_seconds?: number | null
          messages_sent?: number | null
          messages_received?: number | null
          total_tokens_consumed?: number | null
          average_response_time_ms?: number | null
          user_satisfaction_score?: number | null
          goals_achieved?: boolean | null
          conversation_outcome?: string | null
          topics_discussed?: string[] | null
          resources_accessed?: string[] | null
          jobs_viewed?: string[] | null
          partners_contacted?: string[] | null
          follow_up_actions_taken?: number | null
          next_steps?: Json | null
          analyzed_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          conversation_id?: string
          session_duration_seconds?: number | null
          messages_sent?: number | null
          messages_received?: number | null
          total_tokens_consumed?: number | null
          average_response_time_ms?: number | null
          user_satisfaction_score?: number | null
          goals_achieved?: boolean | null
          conversation_outcome?: string | null
          topics_discussed?: string[] | null
          resources_accessed?: string[] | null
          jobs_viewed?: string[] | null
          partners_contacted?: string[] | null
          follow_up_actions_taken?: number | null
          next_steps?: Json | null
          analyzed_at?: string | null
          created_at?: string | null
        }
      }
      job_listings: {
        Row: {
          id: string
          partner_id: string
          title: string
          description: string
          responsibilities: string | null
          requirements: string | null
          skills_required: string[] | null
          experience_level: string | null
          employment_type: string | null
          location: string | null
          salary_range: string | null
          benefits: string | null
          climate_focus: string[] | null
          application_url: string | null
          is_active: boolean | null
          expires_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          partner_id: string
          title: string
          description: string
          responsibilities?: string | null
          requirements?: string | null
          skills_required?: string[] | null
          experience_level?: string | null
          employment_type?: string | null
          location?: string | null
          salary_range?: string | null
          benefits?: string | null
          climate_focus?: string[] | null
          application_url?: string | null
          is_active?: boolean | null
          expires_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          partner_id?: string
          title?: string
          description?: string
          responsibilities?: string | null
          requirements?: string | null
          skills_required?: string[] | null
          experience_level?: string | null
          employment_type?: string | null
          location?: string | null
          salary_range?: string | null
          benefits?: string | null
          climate_focus?: string[] | null
          application_url?: string | null
          is_active?: boolean | null
          expires_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      job_seeker_profiles: {
        Row: {
          id: string
          user_id: string | null
          full_name: string | null
          email: string | null
          phone: string | null
          location: string | null
          current_title: string | null
          experience_level: string | null
          desired_roles: Json | null
          climate_interests: Json | null
          climate_focus_areas: Json | null
          preferred_locations: Json | null
          remote_work_preference: string | null
          employment_types: Json | null
          salary_range_min: number | null
          salary_range_max: number | null
          resume_filename: string | null
          resume_storage_path: string | null
          resume_uploaded_at: string | null
          profile_completed: boolean | null
          last_login: string | null
          preferences_updated_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          full_name?: string | null
          email?: string | null
          phone?: string | null
          location?: string | null
          current_title?: string | null
          experience_level?: string | null
          desired_roles?: Json | null
          climate_interests?: Json | null
          climate_focus_areas?: Json | null
          preferred_locations?: Json | null
          remote_work_preference?: string | null
          employment_types?: Json | null
          salary_range_min?: number | null
          salary_range_max?: number | null
          resume_filename?: string | null
          resume_storage_path?: string | null
          resume_uploaded_at?: string | null
          profile_completed?: boolean | null
          last_login?: string | null
          preferences_updated_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          full_name?: string | null
          email?: string | null
          phone?: string | null
          location?: string | null
          current_title?: string | null
          experience_level?: string | null
          desired_roles?: Json | null
          climate_interests?: Json | null
          climate_focus_areas?: Json | null
          preferred_locations?: Json | null
          remote_work_preference?: string | null
          employment_types?: Json | null
          salary_range_min?: number | null
          salary_range_max?: number | null
          resume_filename?: string | null
          resume_storage_path?: string | null
          resume_uploaded_at?: string | null
          profile_completed?: boolean | null
          last_login?: string | null
          preferences_updated_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      partner_profiles: {
        Row: {
          id: string
          organization_name: string
          full_name: string | null
          email: string | null
          phone: string | null
          website: string | null
          description: string | null
          organization_type: string | null
          organization_size: string | null
          employee_count: number | null
          founded_year: number | null
          headquarters_location: string | null
          climate_focus: string[] | null
          industries: Json | null
          services_offered: Json | null
          training_programs: Json | null
          partnership_level: string | null
          partnership_start_date: string | null
          verified: boolean | null
          verification_date: string | null
          profile_completed: boolean | null
          last_login: string | null
          created_at: string | null
          updated_at: string | null
          // Additional fields from your schema
          mission_statement: string | null
          hiring_actively: boolean | null
          has_job_board: boolean | null
          has_resource_library: boolean | null
          offers_webinars: boolean | null
          offers_certification: boolean | null
          offers_mentorship: boolean | null
          offers_funding: boolean | null
          offers_virtual_tours: boolean | null
          internship_programs: boolean | null
          hosts_events: boolean | null
          has_mobile_app: boolean | null
          has_podcast: boolean | null
          careers_page_url: string | null
          events_calendar_url: string | null
          newsletter_signup_url: string | null
          platform_login_url: string | null
          student_portal_url: string | null
          workforce_portal_url: string | null
          podcast_url: string | null
          linkedin_url: string | null
          twitter_handle: string | null
          facebook_url: string | null
          instagram_handle: string | null
          youtube_url: string | null
        }
        Insert: {
          id: string
          organization_name: string
          full_name?: string | null
          email?: string | null
          phone?: string | null
          website?: string | null
          description?: string | null
          organization_type?: string | null
          organization_size?: string | null
          employee_count?: number | null
          founded_year?: number | null
          headquarters_location?: string | null
          climate_focus?: string[] | null
          industries?: Json | null
          services_offered?: Json | null
          training_programs?: Json | null
          partnership_level?: string | null
          partnership_start_date?: string | null
          verified?: boolean | null
          verification_date?: string | null
          profile_completed?: boolean | null
          last_login?: string | null
          created_at?: string | null
          updated_at?: string | null
          mission_statement?: string | null
          hiring_actively?: boolean | null
          has_job_board?: boolean | null
          has_resource_library?: boolean | null
          offers_webinars?: boolean | null
          offers_certification?: boolean | null
          offers_mentorship?: boolean | null
          offers_funding?: boolean | null
          offers_virtual_tours?: boolean | null
          internship_programs?: boolean | null
          hosts_events?: boolean | null
          has_mobile_app?: boolean | null
          has_podcast?: boolean | null
          careers_page_url?: string | null
          events_calendar_url?: string | null
          newsletter_signup_url?: string | null
          platform_login_url?: string | null
          student_portal_url?: string | null
          workforce_portal_url?: string | null
          podcast_url?: string | null
          linkedin_url?: string | null
          twitter_handle?: string | null
          facebook_url?: string | null
          instagram_handle?: string | null
          youtube_url?: string | null
        }
        Update: {
          id?: string
          organization_name?: string
          full_name?: string | null
          email?: string | null
          phone?: string | null
          website?: string | null
          description?: string | null
          organization_type?: string | null
          organization_size?: string | null
          employee_count?: number | null
          founded_year?: number | null
          headquarters_location?: string | null
          climate_focus?: string[] | null
          industries?: Json | null
          services_offered?: Json | null
          training_programs?: Json | null
          partnership_level?: string | null
          partnership_start_date?: string | null
          verified?: boolean | null
          verification_date?: string | null
          profile_completed?: boolean | null
          last_login?: string | null
          created_at?: string | null
          updated_at?: string | null
          mission_statement?: string | null
          hiring_actively?: boolean | null
          has_job_board?: boolean | null
          has_resource_library?: boolean | null
          offers_webinars?: boolean | null
          offers_certification?: boolean | null
          offers_mentorship?: boolean | null
          offers_funding?: boolean | null
          offers_virtual_tours?: boolean | null
          internship_programs?: boolean | null
          hosts_events?: boolean | null
          has_mobile_app?: boolean | null
          has_podcast?: boolean | null
          careers_page_url?: string | null
          events_calendar_url?: string | null
          newsletter_signup_url?: string | null
          platform_login_url?: string | null
          student_portal_url?: string | null
          workforce_portal_url?: string | null
          podcast_url?: string | null
          linkedin_url?: string | null
          twitter_handle?: string | null
          facebook_url?: string | null
          instagram_handle?: string | null
          youtube_url?: string | null
        }
      }
      knowledge_resources: {
        Row: {
          id: string
          title: string
          description: string | null
          content: string
          content_type: string
          partner_id: string | null
          categories: string[] | null
          tags: string[] | null
          topics: string[] | null
          climate_sectors: string[] | null
          skill_categories: string[] | null
          target_audience: string[] | null
          content_difficulty: string | null
          domain: string | null
          source_url: string | null
          file_path: string | null
          is_published: boolean | null
          metadata: Json | null
          embedding: unknown | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          content: string
          content_type: string
          partner_id?: string | null
          categories?: string[] | null
          tags?: string[] | null
          topics?: string[] | null
          climate_sectors?: string[] | null
          skill_categories?: string[] | null
          target_audience?: string[] | null
          content_difficulty?: string | null
          domain?: string | null
          source_url?: string | null
          file_path?: string | null
          is_published?: boolean | null
          metadata?: Json | null
          embedding?: unknown | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          content?: string
          content_type?: string
          partner_id?: string | null
          categories?: string[] | null
          tags?: string[] | null
          topics?: string[] | null
          climate_sectors?: string[] | null
          skill_categories?: string[] | null
          target_audience?: string[] | null
          content_difficulty?: string | null
          domain?: string | null
          source_url?: string | null
          file_path?: string | null
          is_published?: boolean | null
          metadata?: Json | null
          embedding?: unknown | null
          created_at?: string | null
          updated_at?: string | null
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

// Helper types for common operations
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Specific table types for easier import
export type AdminProfile = Tables<'admin_profiles'>
export type JobSeekerProfile = Tables<'job_seeker_profiles'>
export type PartnerProfile = Tables<'partner_profiles'>
export type JobListing = Tables<'job_listings'>
export type KnowledgeResource = Tables<'knowledge_resources'>
export type AuditLog = Tables<'audit_logs'>
export type ContentFlag = Tables<'content_flags'>
export type ConversationAnalytics = Tables<'conversation_analytics'>

// Insert types
export type AdminProfileInsert = TablesInsert<'admin_profiles'>
export type JobSeekerProfileInsert = TablesInsert<'job_seeker_profiles'>
export type PartnerProfileInsert = TablesInsert<'partner_profiles'>
export type JobListingInsert = TablesInsert<'job_listings'>
export type KnowledgeResourceInsert = TablesInsert<'knowledge_resources'>
export type AuditLogInsert = TablesInsert<'audit_logs'>
export type ContentFlagInsert = TablesInsert<'content_flags'>

// Update types
export type AdminProfileUpdate = TablesUpdate<'admin_profiles'>
export type JobSeekerProfileUpdate = TablesUpdate<'job_seeker_profiles'>
export type PartnerProfileUpdate = TablesUpdate<'partner_profiles'>
export type JobListingUpdate = TablesUpdate<'job_listings'>
export type KnowledgeResourceUpdate = TablesUpdate<'knowledge_resources'>

// Common response types for API operations
export interface DatabaseResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// Form types for UI components
export interface JobSeekerProfileForm {
  full_name: string
  email: string
  phone?: string
  location?: string
  current_title?: string
  experience_level?: string
  desired_roles: string[]
  climate_interests: string[]
  climate_focus_areas: string[]
  preferred_locations: string[]
  remote_work_preference: 'remote' | 'hybrid' | 'onsite'
  employment_types: string[]
  salary_range_min?: number
  salary_range_max?: number
}

export interface PartnerProfileForm {
  organization_name: string
  full_name?: string
  email?: string
  phone?: string
  website?: string
  description?: string
  organization_type?: string
  organization_size?: string
  employee_count?: number
  founded_year?: number
  headquarters_location?: string
  climate_focus: string[]
  industries: string[]
  services_offered: string[]
  mission_statement?: string
  hiring_actively: boolean
  offers_webinars: boolean
  offers_certification: boolean
  offers_mentorship: boolean
}

export interface JobListingForm {
  title: string
  description: string
  responsibilities?: string
  requirements?: string
  skills_required: string[]
  experience_level?: string
  employment_type?: string
  location?: string
  salary_range?: string
  benefits?: string
  climate_focus: string[]
  application_url?: string
  expires_at?: string
} 