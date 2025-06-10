import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * Job Listings API v1 - RESTful CRUD Operations
 * 
 * Follows API design best practices:
 * - Versioned endpoints (/v1/)
 * - Standard HTTP methods
 * - Proper error handling
 * - Pagination and filtering
 * - Rate limiting ready
 * - CORS compliant
 * 
 * Location: /app/api/v1/jobs/route.ts
 */

interface PaginationParams {
  limit?: number;
  offset?: number;
  page?: number;
}

interface FilterParams {
  partner_id?: string;
  location?: string;
  employment_type?: string;
  experience_level?: string;
  climate_focus?: string;
  skills_required?: string;
  is_active?: boolean;
  salary_range_min?: number;
  salary_range_max?: number;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    total: number;
    limit: number;
    offset: number;
    page: number;
    total_pages: number;
  };
}

// Rate limiting helper
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(clientId: string, maxRequests = 100, windowMs = 60000): boolean {
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

function createErrorResponse(message: string, status: number, details?: Record<string, unknown>): NextResponse {
  return NextResponse.json(
    { 
      success: false, 
      error: message,
      ...(details && { details })
    } as ApiResponse<null>,
    { 
      status,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Version': 'v1'
      }
    }
  );
}

function createSuccessResponse<T>(data: T, message?: string, meta?: Record<string, unknown>): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(message && { message }),
      ...(meta && { meta })
    } as ApiResponse<T>,
    {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Version': 'v1',
        'Cache-Control': 'public, max-age=300'
      }
    }
  );
}

// GET /api/v1/jobs - Read all job listings with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = getClientId(request);
    if (!checkRateLimit(clientId)) {
      return createErrorResponse('Rate limit exceeded. Try again later.', 429);
    }

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    // Parse pagination parameters
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
    const offset = (page - 1) * limit;

    // Parse filter parameters
    const filters: FilterParams = {
      partner_id: searchParams.get('partner_id') || undefined,
      location: searchParams.get('location') || undefined,
      employment_type: searchParams.get('employment_type') || undefined,
      experience_level: searchParams.get('experience_level') || undefined,
      climate_focus: searchParams.get('climate_focus') || undefined,
      skills_required: searchParams.get('skills_required') || undefined,
      is_active: searchParams.get('is_active') === 'true' ? true : searchParams.get('is_active') === 'false' ? false : undefined,
    };

    // Build query with partner status filtering
    let query = supabase
      .from('job_listings')
      .select(`
        *,
        partner_profiles!job_listings_partner_id_fkey (
          id,
          organization_name,
          status,
          verified,
          partnership_level,
          last_active
        )
      `)
      // Only include jobs from active, verified partners
      .eq('partner_profiles.status', 'active')
      .eq('partner_profiles.verified', true);

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'climate_focus' || key === 'skills_required') {
          query = query.contains(key, [value]);
        } else if (key === 'location') {
          query = query.ilike('location', `%${value}%`);
        } else {
          query = query.eq(key, value);
        }
      }
    });

    // Apply text search if provided
    const search = searchParams.get('search');
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,requirements.ilike.%${search}%`);
    }

    // Filter by active jobs by default
    if (filters.is_active === undefined) {
      query = query.eq('is_active', true);
    }

    // Filter out expired jobs
    const hideExpired = searchParams.get('hide_expired') !== 'false';
    if (hideExpired) {
      query = query.or('expires_at.is.null,expires_at.gte.' + new Date().toISOString());
    }

    // Apply pagination and ordering
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: jobs, error, count } = await query;

    if (error) {
      console.error('Jobs fetch error:', error);
      return createErrorResponse('Failed to fetch jobs', 500);
    }

    // Filter out jobs from unavailable partners on the client side as additional safety
    const availableJobs = jobs?.filter(job => {
      if (!job.partner_profiles) return false;
      
      // Use existing partner availability utility
      const partner = job.partner_profiles;
      return partner.status === 'active' && partner.verified;
    }) || [];

    const totalPages = Math.ceil((count || 0) / limit);

    return createSuccessResponse(
      availableJobs,
      'Job listings fetched successfully',
      {
        total: availableJobs.length,
        limit,
        offset,
        page,
        total_pages: totalPages,
        filters_applied: {
          partner_status: 'active',
          partner_verified: true,
          ...searchParams
        }
      }
    );

  } catch (error) {
    console.error('GET /api/v1/jobs error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// POST /api/v1/jobs - Create new job listing (Partner/Admin only)
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = getClientId(request);
    if (!checkRateLimit(clientId, 10, 60000)) {
      return createErrorResponse('Rate limit exceeded for job listing creation', 429);
    }

    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return createErrorResponse('Authentication required', 401);
    }

    // Check if user is partner or admin
    const { data: partnerProfile } = await supabase
      .from('partner_profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    const { data: adminProfile } = await supabase
      .from('admin_profiles')
      .select('can_manage_content, can_manage_system')
      .eq('user_id', user.id)
      .single();

    if (!partnerProfile && !adminProfile) {
      return createErrorResponse('Partner or Admin access required', 403);
    }

    // For admin users, verify they have content management permissions
    if (adminProfile && !partnerProfile && !adminProfile.can_manage_content && !adminProfile.can_manage_system) {
      return createErrorResponse('Content management privileges required for admin job creation', 403);
    }

    // Parse and validate request body
    const body = await request.json();
    const {
      title,
      description,
      requirements,
      responsibilities,
      location,
      employment_type,
      experience_level,
      salary_range,
      climate_focus,
      skills_required,
      benefits,
      application_url,
      application_email,
      expires_at,
      is_active = true
    } = body;

    // Validation
    if (!title?.trim()) {
      return createErrorResponse('Job title is required', 400);
    }

    if (!description?.trim()) {
      return createErrorResponse('Job description is required', 400);
    }

    if (employment_type && !['full_time', 'part_time', 'contract', 'internship', 'apprenticeship', 'training'].includes(employment_type)) {
      return createErrorResponse('Invalid employment type', 400);
    }

    if (experience_level && !['entry_level', 'mid_level', 'senior_level', 'executive'].includes(experience_level)) {
      return createErrorResponse('Invalid experience level', 400);
    }

    if (!application_url && !application_email) {
      return createErrorResponse('Either application URL or application email is required', 400);
    }

    // Create job listing
    const { data: newJob, error: createError } = await supabase
      .from('job_listings')
      .insert({
        title: title.trim(),
        description: description.trim(),
        requirements: requirements?.trim() || null,
        responsibilities: responsibilities?.trim() || null,
        location: location?.trim() || null,
        employment_type: employment_type || null,
        experience_level: experience_level || null,
        salary_range: salary_range?.trim() || null,
        climate_focus: climate_focus || [],
        skills_required: skills_required || [],
        benefits: benefits?.trim() || null,
        application_url: application_url?.trim() || null,
        application_email: application_email?.trim() || null,
        expires_at: expires_at ? new Date(expires_at).toISOString() : null,
        is_active,
        partner_id: partnerProfile ? user.id : adminProfile ? user.id : null
      })
      .select()
      .single();

    if (createError) {
      console.error('Job listing creation error:', createError);
      return createErrorResponse('Failed to create job listing', 500);
    }

    return createSuccessResponse(
      newJob,
      'Job listing created successfully'
    );

  } catch (error) {
    console.error('POST /api/v1/jobs error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// OPTIONS - CORS preflight support
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