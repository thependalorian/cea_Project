export type UserType = 'job_seeker' | 'partner' | 'admin'

export interface Profile {
  id: string
  user_type: UserType
  role: string
  email: string
  first_name?: string
  last_name?: string
  full_name?: string
  organization_name?: string
  organization_type?: string
  website?: string
  description?: string
  partnership_level: string
  verified: boolean
  contact_info: Record<string, any>
  created_at: string
  updated_at: string
}

export interface JobSeekerProfile {
  id: string
  user_id: string
  email: string
  full_name: string
  phone?: string
  location?: string
  current_title?: string
  experience_level?: string
  desired_roles: string[]
  climate_focus_areas: string[]
  climate_interests: string[]
  employment_types: string[]
  preferred_locations: string[]
  remote_work_preference: string
  salary_range_min?: number
  salary_range_max?: number
  resume_filename?: string
  resume_storage_path?: string
  resume_uploaded_at?: string
  profile_completed: boolean
  last_login?: string
  preferences_updated_at?: string
  created_at: string
  updated_at: string
}

export interface PartnerProfile {
  id: string
  organization_name: string
  full_name?: string
  email?: string
  phone?: string
  website?: string
  description?: string
  organization_type?: string
  organization_size?: string
  headquarters_location?: string
  founded_year?: number
  employee_count?: number
  climate_focus: string[]
  industries: string[]
  services_offered: string[]
  training_programs: string[]
  has_job_board: boolean
  has_resource_library: boolean
  has_mobile_app: boolean
  has_podcast: boolean
  hiring_actively: boolean
  hosts_events: boolean
  offers_mentorship: boolean
  offers_certification: boolean
  offers_funding: boolean
  offers_webinars: boolean
  offers_virtual_tours: boolean
  internship_programs: boolean
  linkedin_url?: string
  twitter_handle?: string
  facebook_url?: string
  instagram_handle?: string
  youtube_url?: string
  podcast_url?: string
  careers_page_url?: string
  newsletter_signup_url?: string
  events_calendar_url?: string
  platform_login_url?: string
  student_portal_url?: string
  workforce_portal_url?: string
  partnership_level: string
  partnership_start_date?: string
  verified: boolean
  verification_date?: string
  mission_statement?: string
  profile_completed: boolean
  last_login?: string
  created_at: string
  updated_at: string
}

export interface AdminProfile {
  id: string
  user_id: string
  full_name: string
  email?: string
  phone?: string
  direct_phone?: string
  department?: string
  can_manage_users: boolean
  can_manage_partners: boolean
  can_manage_content: boolean
  can_manage_system: boolean
  can_view_analytics: boolean
  last_login?: string
  last_admin_action?: string
  total_admin_actions: number
  permissions: Record<string, any>
  emergency_contact: Record<string, any>
  admin_notes?: string
  profile_completed: boolean
  created_at: string
  updated_at: string
}

export interface UserPreferences {
  social_profile_analysis_enabled: boolean
  data_sharing_enabled: boolean
  marketing_emails_enabled: boolean
  newsletter_enabled: boolean
  email_notifications: boolean
  job_alerts_enabled: boolean
  partner_updates_enabled: boolean
  theme_preference: string
  language_preference: string
  timezone: string
}

// Auth related types
export interface AuthUser {
  id: string
  email: string
  user_metadata: Record<string, any>
  app_metadata: Record<string, any>
}

export interface AuthSession {
  access_token: string
  refresh_token: string
  expires_in: number
  expires_at?: number
  user: AuthUser
}

export interface SignUpData {
  email: string
  password: string
  user_type: UserType
  full_name?: string
  organization_name?: string
  phone?: string
  location?: string
  company_size?: string
  industry?: string
  website_url?: string
}

export interface SignInData {
  email: string
  password: string
}

// Dashboard data types
export interface JobSeekerDashboardData {
  profile: JobSeekerProfile
  recent_applications: number
  saved_jobs: number
  profile_completion: number
  recommendations: any[]
  upcoming_interviews: any[]
}

export interface PartnerDashboardData {
  profile: PartnerProfile
  active_job_posts: number
  total_applications: number
  interviews_scheduled: number
  recent_hires: number
  analytics: {
    applications_this_week: number
    top_skills_requested: string[]
    avg_time_to_hire: string
  }
}

export interface AdminDashboardData {
  user_statistics: Record<string, number>
  total_users: number
  system_health: string
  recent_activity: Array<{
    action: string
    user_type: string
    timestamp: string
  }>
} 