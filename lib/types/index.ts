// Centralized Type Definitions for Climate Economy Assistant
// Rule 13: Use TypeScript for all development

// === User & Authentication Types ===
export interface UserProfile {
  id: string;
  email: string;
  user_type: 'user' | 'partner' | 'admin';
  role: string;
  first_name?: string;
  last_name?: string;
  organization_name?: string;
  organization_type?: 'nonprofit' | 'government' | 'private' | 'education';
  website?: string;
  description?: string;
  partnership_level: 'standard' | 'premium' | 'enterprise';
  climate_focus: string[];
  verified: boolean;
  contact_info: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// === Resume & Skills Types ===
export interface ResumeData {
  id: string;
  user_id: string;
  file_path: string;
  file_name: string;
  file_size: number;
  file_type: string;
  context: string;
  processed: boolean;
  chunks: ResumeChunk[];
  linkedin_url?: string;
  github_url?: string;
  personal_website?: string;
  full_text?: string;
  social_data: Record<string, unknown>[];
  created_at: string;
  updated_at: string;
}

export interface ResumeChunk {
  content: string;
  embedding?: number[];
  metadata?: Record<string, unknown>;
}

export interface ResumeUploadResponse {
  fileId: string;
  fileName: string;
  userId?: string;
  url?: string;
}

// === Skills Translation Types (Key Selling Point) ===
export interface SkillTranslation {
  original_skill: string;
  original_domain: string;
  climate_equivalent: string;
  climate_domain: string;
  transferability_score: number; // 0.0 to 1.0
  translation_explanation: string;
  examples: string[];
  positioning_advice: string;
  community_specific_guidance?: string;
}

export interface SkillCluster {
  cluster_name: string;
  original_skills: string[];
  climate_applications: string[];
  transferability_score: number;
  development_priority: 'high' | 'medium' | 'low';
}

export interface CommunityOpportunity {
  opportunity_type: string;
  title: string;
  description: string;
  url: string;
  eligibility_requirements: string[];
  application_deadline?: string;
  partner_organization: string;
}

// === Chat & Communication Types ===
export interface ChatUser {
  id: string;
  name: string;
  image?: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  createdAt?: string; // For compatibility
  user?: ChatUser; // For realtime chat
  metadata?: Record<string, unknown>;
  sources?: Array<{
    content: string;
    metadata: {
      chunk_index?: number;
      page?: number;
      resume_id?: string;
      similarity?: number;
      [key: string]: unknown;
    }
  }>;
}

export interface EnhancedChatResponse {
  response: string;
  sources: SourceReference[];
  follow_up_questions: FollowUpQuestion[];
  actionable_items: ActionableItem[];
  suggestions: string[];
  context_summary?: string;
}

export interface SourceReference {
  title: string;
  url: string;
  relevance_score: number;
  partner_organization?: string;
  content_type: string;
}

export interface FollowUpQuestion {
  question: string;
  context: string;
  category: string;
}

export interface ActionableItem {
  action: 'apply' | 'learn' | 'connect' | 'explore';
  title: string;
  description: string;
  url: string;
  partner?: string;
  deadline?: string;
}

// === Knowledge Base Types ===
export interface KnowledgeResource {
  id: string;
  partner_id?: string;
  title: string;
  description?: string;
  content_type: 'webpage' | 'pdf' | 'document' | 'job_training' | 'internship';
  content: string;
  source_url?: string;
  file_path?: string;
  tags: string[];
  categories: string[];
  domain?: 'clean_energy' | 'workforce_development' | 'career_pathways' | 'equity' | 'policy';
  topics: string[];
  target_audience: ('veterans' | 'ej_communities' | 'international_professionals')[];
  embedding?: number[];
  metadata: Record<string, unknown>;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

// === Job & Education Types ===
export interface JobListing {
  id: string;
  partner_id: string;
  title: string;
  description: string;
  requirements?: string;
  responsibilities?: string;
  location?: string;
  employment_type?: 'full_time' | 'part_time' | 'contract' | 'internship';
  experience_level?: 'entry_level' | 'mid_level' | 'senior_level';
  salary_range?: string;
  climate_focus: string[];
  skills_required: string[];
  benefits?: string;
  application_url?: string;
  application_email?: string;
  is_active: boolean;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface EducationProgram {
  id: string;
  partner_id: string;
  program_name: string;
  description: string;
  program_type?: 'certificate' | 'degree' | 'bootcamp' | 'workshop' | 'online_course';
  duration?: string;
  format?: 'in_person' | 'online' | 'hybrid';
  cost?: string;
  prerequisites?: string;
  climate_focus: string[];
  skills_taught: string[];
  certification_offered?: string;
  application_deadline?: string;
  start_date?: string;
  end_date?: string;
  contact_info: Record<string, unknown>;
  application_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// === Community-Specific Types ===
export type CommunityBackground = 'veteran' | 'international_professional' | 'environmental_justice';

export interface CommunityBarrier {
  barrier_type: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  mitigation_strategies: string[];
  community_resources: ActionableItem[];
}

// === API Request/Response Types ===
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: unknown;
  message?: string;
}

export interface SearchFilters {
  location?: string;
  employment_type?: string;
  experience_level?: string;
  climate_focus?: string[];
  community_focus?: string;
}

// === Form & UI Types ===
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'select' | 'textarea' | 'checkbox' | 'radio';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };
}

export interface ToastConfig {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
  duration?: number;
}

export * from './chat'; 