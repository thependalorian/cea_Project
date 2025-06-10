import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * Job Seekers API v1 - RESTful CRUD Operations (V1 Schema Compatible)
 * 
 * Updated to work with simplified V1 database schema
 * Handles job seeker profile management:
 * - GET /api/v1/job-seekers - List job seeker profiles (Partner access only)
 * - POST /api/v1/job-seekers - Create/Update job seeker profile
 * 
 * Location: /app/api/v1/job-seekers/route.ts
 */

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: Record<string, unknown>;
}

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(clientId: string, maxRequests = 50, windowMs = 60000): boolean {
  const now = Date.now();
  const clientData = rateLimitStore.get(clientId);
  
  if (!clientData || now > clientData.resetTime) {
    rateLimitStore.set(clientId, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (clientData.count >= maxRequests) {
    return false;
  }
  
  clientData.count++;
  return true;
}

function getClientId(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  return forwarded?.split(',')[0] || realIp || 'unknown';
}

function createErrorResponse(message: string, status: number): NextResponse {
  return NextResponse.json(
    { success: false, error: message } as ApiResponse<null>,
    { status, headers: { 'Content-Type': 'application/json', 'X-API-Version': 'v1' } }
  );
}

function createSuccessResponse<T>(data: T, message?: string, meta?: Record<string, unknown>): NextResponse {
  return NextResponse.json(
    { success: true, data, ...(message && { message }), ...(meta && { meta }) } as ApiResponse<T>,
    { headers: { 'Content-Type': 'application/json', 'X-API-Version': 'v1' } }
  );
}

// GET /api/v1/job-seekers - List job seeker profiles (Partner access only in V1)
export async function GET(request: NextRequest) {
  try {
    const clientId = getClientId(request);
    if (!checkRateLimit(clientId)) {
      return createErrorResponse('Rate limit exceeded', 429);
    }

    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return createErrorResponse('Authentication required', 401);
    }

    // Check if user is partner (V1 schema - no admin_profiles)
    const { data: partnerProfile } = await supabase
      .from('partner_profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!partnerProfile) {
      return createErrorResponse('Partner access required', 403);
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
    const offset = (page - 1) * limit;

    // Filters (V1 Schema Compatible)
    const experience_level = searchParams.get('experience_level');
    const location = searchParams.get('location');
    const climate_interest = searchParams.get('climate_interest');

    let query = supabase
      .from('job_seeker_profiles')
      .select(`
        id, 
        full_name, 
        email, 
        phone,
        location, 
        current_title, 
        experience_level,
        climate_interests, 
        desired_roles,
        profile_completed,
        last_login,
        created_at, 
        updated_at
      `, { count: 'exact' });

    // Apply filters (V1 schema compatible)
    if (experience_level) query = query.eq('experience_level', experience_level);
    if (location) query = query.ilike('location', `%${location}%`);
    if (climate_interest) query = query.contains('climate_interests', [climate_interest]);

    // Search across name and title
    const search = searchParams.get('search');
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,current_title.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data: jobSeekers, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Database error:', error);
      return createErrorResponse(`Failed to fetch job seeker profiles: ${error.message}`, 500);
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return createSuccessResponse(
      jobSeekers,
      'Job seeker profiles fetched successfully',
      { total: count || 0, limit, offset, page, total_pages: totalPages }
    );

  } catch (error) {
    console.error('GET /api/v1/job-seekers error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// POST /api/v1/job-seekers - Create/Update job seeker profile (V1 Schema)
export async function POST(request: NextRequest) {
  try {
    const clientId = getClientId(request);
    if (!checkRateLimit(clientId, 20, 60000)) {
      return createErrorResponse('Rate limit exceeded for profile updates', 429);
    }

    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return createErrorResponse('Authentication required', 401);
    }

    const body = await request.json();
    const {
      full_name,
      email,
      phone,
      location,
      current_title,
      experience_level,
      climate_interests,
      desired_roles
    } = body;

    // Validation (V1 Schema)
    if (experience_level && !['entry', 'mid', 'senior', 'executive'].includes(experience_level)) {
      return createErrorResponse('Invalid experience level', 400);
    }

    // Prepare profile data (V1 Schema compatible)
    const profileData = {
      id: user.id,
      full_name,
      email: email || user.email,
      phone,
      location,
      current_title,
      experience_level,
      climate_interests: climate_interests || [],
      desired_roles: desired_roles || [],
      profile_completed: !!(full_name && location && current_title),
      updated_at: new Date().toISOString()
    };

    // Remove undefined values
    Object.keys(profileData).forEach(key => {
      if ((profileData as Record<string, unknown>)[key] === undefined) {
        delete (profileData as Record<string, unknown>)[key];
      }
    });

    // Upsert profile
    const { data: profile, error } = await supabase
      .from('job_seeker_profiles')
      .upsert(profileData, {
        onConflict: 'id',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return createErrorResponse(`Failed to save profile: ${error.message}`, 500);
    }

    return createSuccessResponse(
      profile,
      'Job seeker profile updated successfully'
    );

  } catch (error) {
    console.error('POST /api/v1/job-seekers error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
} 