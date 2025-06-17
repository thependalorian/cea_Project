import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * Job Seeker Dashboard Stats API v1
 * 
 * Following rule #4: Vercel compatibility for endpoints
 * Following rule #5: Design quick and scalable endpoints
 * Following rule #12: Complete code verification with proper error handling
 * 
 * Provides real dashboard statistics for job seekers from database.
 * Location: /app/api/v1/dashboard/job_seeker/stats/route.ts
 */

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: Record<string, unknown>;
}

interface JobSeekerStats {
  applications: number;
  interviews: number;
  saved_jobs: number;
  profile_views: number;
  response_rate: number;
  active_searches: number;
  profile_completion: number;
  recent_activity: number;
}

function createErrorResponse(message: string, status: number): NextResponse {
  return NextResponse.json(
    { success: false, error: message } as ApiResponse<null>,
    { 
      status,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Version': 'v1'
      }
    }
  );
}

function createSuccessResponse<T>(data: T, message?: string): NextResponse {
  return NextResponse.json(
    { success: true, data, ...(message && { message }) } as ApiResponse<T>,
    {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Version': 'v1',
        'Cache-Control': 'private, max-age=300' // Cache for 5 minutes
      }
    }
  );
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    // Get job seeker profile
    const { data: profile, error: profileError } = await supabase
      .from('job_seeker_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return createErrorResponse('Job seeker profile not found', 404);
    }

    // Get application statistics
    const { data: applications, error: appError } = await supabase
      .from('job_applications')
      .select('id, status, created_at')
      .eq('job_seeker_id', profile.id);

    if (appError) {
      console.error('Error fetching applications:', appError);
    }

    // Get saved jobs count
    const { data: savedJobs, error: savedError } = await supabase
      .from('saved_jobs')
      .select('id')
      .eq('job_seeker_id', profile.id);

    if (savedError) {
      console.error('Error fetching saved jobs:', savedError);
    }

    // Get profile views (if tracking table exists)
    const { data: profileViews, error: viewsError } = await supabase
      .from('profile_views')
      .select('id')
      .eq('profile_id', profile.id);

    if (viewsError) {
      console.error('Error fetching profile views:', viewsError);
    }

    // Calculate statistics
    const totalApplications = applications?.length || 0;
    const interviews = applications?.filter(app => 
      app.status === 'interview_scheduled' || app.status === 'interviewed'
    ).length || 0;
    
    const responseRate = totalApplications > 0 
      ? Math.round((interviews / totalApplications) * 100) 
      : 0;

    // Calculate profile completion percentage
    const profileFields = [
      profile.full_name,
      profile.email,
      profile.phone,
      profile.location,
      profile.current_title,
      profile.experience_level,
      profile.resume_filename
    ];
    
    const completedFields = profileFields.filter(field => field && field.trim() !== '').length;
    const profileCompletion = Math.round((completedFields / profileFields.length) * 100);

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentApplications = applications?.filter(app => 
      new Date(app.created_at) > thirtyDaysAgo
    ).length || 0;

    const stats: JobSeekerStats = {
      applications: totalApplications,
      interviews: interviews,
      saved_jobs: savedJobs?.length || 0,
      profile_views: profileViews?.length || 0,
      response_rate: responseRate,
      active_searches: 0, // This would need a separate tracking mechanism
      profile_completion: profileCompletion,
      recent_activity: recentApplications
    };

    return createSuccessResponse(stats, 'Dashboard stats retrieved successfully');

  } catch (error) {
    console.error('Dashboard stats API error:', error);
    return createErrorResponse('Internal server error', 500);
  }
} 