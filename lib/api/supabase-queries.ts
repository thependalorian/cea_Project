/**
 * Supabase Query Functions - Climate Economy Assistant
 * Comprehensive database queries matching actual schema
 * Location: lib/api/supabase-queries.ts
 */

import { supabase } from '@/lib/supabase/client';
import type { 
  JobSeekerProfile, 
  PartnerProfile, 
  AdminProfile,
  JobListing,
  KnowledgeResource,
  Conversation,
  ConversationAnalytics,
  Resume,
  UserInterests
} from '@/lib/types/database';

// ============================================================================
// USER PROFILES
// ============================================================================

export const userProfileQueries = {
  // Get job seeker profile
  async getJobSeekerProfile(userId: string) {
    const { data, error } = await supabase
      .from('job_seeker_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Update job seeker profile
  async updateJobSeekerProfile(userId: string, updates: any) {
    const { data, error } = await supabase
      .from('job_seeker_profiles')
      .upsert({ 
        user_id: userId, 
        id: userId, // Using user_id as primary key
        ...updates,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get partner profile
  async getPartnerProfile(userId: string) {
    const { data, error } = await supabase
      .from('partner_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Update partner profile
  async updatePartnerProfile(userId: string, updates: any) {
    const { data, error } = await supabase
      .from('partner_profiles')
      .upsert({ 
        id: userId,
        ...updates,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get admin profile
  async getAdminProfile(userId: string) {
    const { data, error } = await supabase
      .from('admin_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Get user interests
  async getUserInterests(userId: string) {
    const { data, error } = await supabase
      .from('user_interests')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Update user interests
  async updateUserInterests(userId: string, interests: any) {
    const { data, error } = await supabase
      .from('user_interests')
      .upsert({
        user_id: userId,
        ...interests,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// ============================================================================
// JOB LISTINGS
// ============================================================================

export const jobQueries = {
  // Get active job listings with partner info
  async getActiveJobs(filters?: {
    climate_focus?: string[];
    location?: string;
    experience_level?: string;
    employment_type?: string;
    skills_required?: string[];
    limit?: number;
    offset?: number;
  }) {
    let query = supabase
      .from('job_listings')
      .select(`
        *,
        partner_profiles!inner(
          organization_name,
          organization_type,
          verified,
          partnership_level,
          website,
          linkedin_url
        )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (filters?.climate_focus?.length) {
      query = query.overlaps('climate_focus', filters.climate_focus);
    }
    
    if (filters?.location) {
      query = query.ilike('location', `%${filters.location}%`);
    }
    
    if (filters?.experience_level) {
      query = query.eq('experience_level', filters.experience_level);
    }
    
    if (filters?.employment_type) {
      query = query.eq('employment_type', filters.employment_type);
    }

    if (filters?.skills_required?.length) {
      query = query.overlaps('skills_required', filters.skills_required);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(filters.offset, (filters.offset + (filters.limit || 10)) - 1);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Get job by ID
  async getJobById(jobId: string) {
    const { data, error } = await supabase
      .from('job_listings')
      .select(`
        *,
        partner_profiles!inner(
          organization_name,
          organization_type,
          verified,
          partnership_level,
          website,
          linkedin_url,
          description,
          headquarters_location
        )
      `)
      .eq('id', jobId)
      .single();

    if (error) throw error;
    return data;
  },

  // Search jobs with full-text search
  async searchJobs(searchTerm: string, filters?: any) {
    let query = supabase
      .from('job_listings')
      .select(`
        *,
        partner_profiles!inner(organization_name, organization_type, verified)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    // Use text search on multiple fields
    if (searchTerm) {
      query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,requirements.ilike.%${searchTerm}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Get job statistics
  async getJobStats() {
    const [totalJobs, activeJobs, newJobsThisMonth] = await Promise.all([
      supabase.from('job_listings').select('id', { count: 'exact', head: true }),
      supabase.from('job_listings').select('id', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('job_listings').select('id', { count: 'exact', head: true })
        .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
    ]);

    return {
      total: totalJobs.count || 0,
      active: activeJobs.count || 0,
      newThisMonth: newJobsThisMonth.count || 0
    };
  }
};

// ============================================================================
// PARTNER ORGANIZATIONS
// ============================================================================

export const partnerQueries = {
  // Get verified partners
  async getVerifiedPartners(filters?: {
    organization_type?: string;
    climate_focus?: string[];
    hiring_actively?: boolean;
    offers_certification?: boolean;
    partnership_level?: string;
    limit?: number;
  }) {
    let query = supabase
      .from('partner_profiles')
      .select('*')
      .eq('verified', true)
      .order('partnership_level', { ascending: false })
      .order('created_at', { ascending: false });

    if (filters?.organization_type) {
      query = query.eq('organization_type', filters.organization_type);
    }

    if (filters?.climate_focus?.length) {
      query = query.overlaps('climate_focus', filters.climate_focus);
    }

    if (filters?.hiring_actively !== undefined) {
      query = query.eq('hiring_actively', filters.hiring_actively);
    }

    if (filters?.offers_certification !== undefined) {
      query = query.eq('offers_certification', filters.offers_certification);
    }

    if (filters?.partnership_level) {
      query = query.eq('partnership_level', filters.partnership_level);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Get partner statistics
  async getPartnerStats() {
    const [totalPartners, activelyHiring, offeringCertification, providingMentorship] = await Promise.all([
      supabase.from('partner_profiles').select('id', { count: 'exact', head: true }).eq('verified', true),
      supabase.from('partner_profiles').select('id', { count: 'exact', head: true }).eq('hiring_actively', true),
      supabase.from('partner_profiles').select('id', { count: 'exact', head: true }).eq('offers_certification', true),
      supabase.from('partner_profiles').select('id', { count: 'exact', head: true }).eq('offers_mentorship', true)
    ]);

    return {
      total: totalPartners.count || 0,
      activelyHiring: activelyHiring.count || 0,
      offeringCertification: offeringCertification.count || 0,
      providingMentorship: providingMentorship.count || 0
    };
  }
};

// ============================================================================
// KNOWLEDGE RESOURCES
// ============================================================================

export const resourceQueries = {
  // Get published resources
  async getPublishedResources(filters?: {
    content_type?: string;
    categories?: string[];
    climate_sectors?: string[];
    content_difficulty?: string;
    limit?: number;
    offset?: number;
  }) {
    let query = supabase
      .from('knowledge_resources')
      .select(`
        *,
        partner_profiles(organization_name, verified)
      `)
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (filters?.content_type) {
      query = query.eq('content_type', filters.content_type);
    }

    if (filters?.categories?.length) {
      query = query.overlaps('categories', filters.categories);
    }

    if (filters?.climate_sectors?.length) {
      query = query.overlaps('climate_sectors', filters.climate_sectors);
    }

    if (filters?.content_difficulty) {
      query = query.eq('content_difficulty', filters.content_difficulty);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(filters.offset, (filters.offset + (filters.limit || 10)) - 1);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Search resources with text search
  async searchResources(searchTerm: string, limit = 10) {
    const { data, error } = await supabase
      .from('knowledge_resources')
      .select(`
        *,
        partner_profiles(organization_name, verified)
      `)
      .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
      .eq('is_published', true)
      .limit(limit);

    if (error) throw error;
    return data;
  },

  // Track resource view
  async trackResourceView(resourceId: string, userId?: string) {
    const { error } = await supabase
      .from('resource_views')
      .insert({
        resource_id: resourceId,
        user_id: userId,
        resource_type: 'knowledge_resource',
        viewed_at: new Date().toISOString()
      });

    if (error) throw error;
  },

  // Get resource categories
  async getResourceCategories() {
    const { data, error } = await supabase
      .from('knowledge_resources')
      .select('categories')
      .eq('is_published', true);

    if (error) throw error;
    
    // Flatten and count categories
    const categoryCount: Record<string, number> = {};
    data?.forEach(resource => {
      resource.categories?.forEach((category: string) => {
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      });
    });

    return Object.entries(categoryCount).map(([name, count]) => ({ name, count }));
  }
};

// ============================================================================
// CONVERSATIONS & ANALYTICS
// ============================================================================

export const conversationQueries = {
  // Get user conversations
  async getUserConversations(userId: string, limit = 20) {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('last_activity', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  // Get conversation messages
  async getConversationMessages(conversationId: string) {
    const { data, error } = await supabase
      .from('conversation_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Create new conversation
  async createConversation(userId: string, initialQuery?: string) {
    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        id: conversationId,
        user_id: userId,
        initial_query: initialQuery,
        created_at: new Date().toISOString(),
        last_activity: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'active'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get conversation analytics
  async getConversationAnalytics(timeRange = '30d') {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90));

    const { data, error } = await supabase
      .from('conversation_analytics')
      .select('*')
      .gte('created_at', startDate.toISOString());

    if (error) throw error;
    return data;
  }
};

// ============================================================================
// ADMIN QUERIES
// ============================================================================

export const adminQueries = {
  // Get platform statistics
  async getPlatformStats() {
    const [users, conversations, jobs, partners, auditLogs] = await Promise.all([
      supabase.from('job_seeker_profiles').select('id', { count: 'exact', head: true }),
      supabase.from('conversations').select('id', { count: 'exact', head: true }),
      supabase.from('job_listings').select('id', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('partner_profiles').select('id', { count: 'exact', head: true }).eq('verified', true),
      supabase.from('audit_logs').select('id', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    ]);

    return {
      totalUsers: users.count || 0,
      totalConversations: conversations.count || 0,
      activeJobs: jobs.count || 0,
      totalPartners: partners.count || 0,
      dailyAuditLogs: auditLogs.count || 0
    };
  },

  // Get recent audit logs
  async getRecentAuditLogs(limit = 50) {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  // Get content flags
  async getContentFlags(reviewed = false) {
    const { data, error } = await supabase
      .from('content_flags')
      .select('*')
      .eq('admin_reviewed', reviewed)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get pending approvals
  async getPendingApprovals() {
    const [pendingPartners, flaggedContent] = await Promise.all([
      supabase.from('partner_profiles').select('*').eq('verified', false),
      supabase.from('content_flags').select('*').eq('admin_reviewed', false)
    ]);

    return {
      partners: pendingPartners.data || [],
      content: flaggedContent.data || []
    };
  }
};

// ============================================================================
// RESUME QUERIES
// ============================================================================

export const resumeQueries = {
  // Get user resume
  async getUserResume(userId: string) {
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Upload resume
  async uploadResume(userId: string, file: File) {
    // Upload file to storage
    const fileName = `${userId}/${Date.now()}_${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // Create resume record
    const { data, error } = await supabase
      .from('resumes')
      .insert({
        user_id: userId,
        file_name: file.name,
        file_path: uploadData.path,
        file_size: file.size,
        content_type: file.type,
        processing_status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get resume chunks for analysis
  async getResumeChunks(resumeId: string) {
    const { data, error } = await supabase
      .from('resume_chunks')
      .select('*')
      .eq('resume_id', resumeId)
      .order('page_number', { ascending: true });

    if (error) throw error;
    return data;
  }
};

// ============================================================================
// EDUCATION PROGRAMS
// ============================================================================

export const educationQueries = {
  // Get active education programs
  async getActivePrograms(filters?: {
    program_type?: string;
    climate_focus?: string[];
    format?: string;
    certification_offered?: boolean;
    limit?: number;
  }) {
    let query = supabase
      .from('education_programs')
      .select(`
        *,
        partner_profiles!inner(organization_name, verified)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (filters?.program_type) {
      query = query.eq('program_type', filters.program_type);
    }

    if (filters?.climate_focus?.length) {
      query = query.overlaps('climate_focus', filters.climate_focus);
    }

    if (filters?.format) {
      query = query.eq('format', filters.format);
    }

    if (filters?.certification_offered !== undefined) {
      query = query.not('certification_offered', 'is', null);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }
};

// ============================================================================
// REAL-TIME SUBSCRIPTIONS
// ============================================================================

export const realtimeSubscriptions = {
  // Subscribe to conversation updates
  subscribeToConversation(conversationId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`conversation:${conversationId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversation_messages',
        filter: `conversation_id=eq.${conversationId}`
      }, callback)
      .subscribe();
  },

  // Subscribe to job updates
  subscribeToJobs(callback: (payload: any) => void) {
    return supabase
      .channel('jobs')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'job_listings'
      }, callback)
      .subscribe();
  },

  // Subscribe to admin notifications
  subscribeToAdminNotifications(callback: (payload: any) => void) {
    return supabase
      .channel('admin-notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'audit_logs'
      }, callback)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'content_flags'
      }, callback)
      .subscribe();
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const utilityQueries = {
  // Health check
  async healthCheck() {
    const { data, error } = await supabase
      .from('job_seeker_profiles')
      .select('id')
      .limit(1);

    return { healthy: !error, error };
  },

  // Get user type
  async getUserType(userId: string) {
    const [jobSeeker, partner, admin] = await Promise.all([
      supabase.from('job_seeker_profiles').select('id').eq('user_id', userId).single(),
      supabase.from('partner_profiles').select('id').eq('id', userId).single(),
      supabase.from('admin_profiles').select('id').eq('user_id', userId).single()
    ]);

    if (!jobSeeker.error) return 'job_seeker';
    if (!partner.error) return 'partner';
    if (!admin.error) return 'admin';
    return 'user';
  }
}; 