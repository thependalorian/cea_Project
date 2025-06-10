import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * Knowledge Resources API v1 - RESTful CRUD Operations
 * 
 * Follows API design best practices:
 * - Versioned endpoints (/v1/)
 * - Standard HTTP methods
 * - Proper error handling
 * - Pagination and filtering
 * - Rate limiting ready
 * - CORS compliant
 * 
 * Location: /app/api/v1/knowledge/route.ts
 */

interface PaginationParams {
  limit?: number;
  offset?: number;
  page?: number;
}

interface FilterParams {
  partner_id?: string;
  domain?: string;
  content_type?: string;
  categories?: string;
  tags?: string;
  target_audience?: string;
  is_published?: boolean;
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

// GET /api/v1/knowledge - Read all knowledge resources with pagination and filtering
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
      domain: searchParams.get('domain') || undefined,
      content_type: searchParams.get('content_type') || undefined,
      categories: searchParams.get('categories') || undefined,
      tags: searchParams.get('tags') || undefined,
      target_audience: searchParams.get('target_audience') || undefined,
      is_published: searchParams.get('is_published') === 'true' ? true : searchParams.get('is_published') === 'false' ? false : undefined,
    };

    // Build query - Make partner_profiles join optional to avoid relationship errors
    let query = supabase
      .from('knowledge_resources')
      .select(`
        id,
        title,
        description,
        content_type,
        content,
        source_url,
        domain,
        categories,
        tags,
        topics,
        target_audience,
        is_published,
        partner_id,
        created_at,
        updated_at
      `, { count: 'exact' });

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'categories' || key === 'tags') {
          query = query.contains(key, [value]);
        } else if (key === 'target_audience') {
          query = query.contains('target_audience', [value]);
        } else {
          query = query.eq(key, value);
        }
      }
    });

    // Apply text search if provided
    const search = searchParams.get('search');
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,content.ilike.%${search}%`);
    }

    // Apply pagination and ordering
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: resources, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      return createErrorResponse('Failed to fetch knowledge resources', 500);
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return createSuccessResponse(
      resources,
      'Knowledge resources fetched successfully',
      {
        total: count || 0,
        limit,
        offset,
        page,
        total_pages: totalPages
      }
    );

  } catch (error) {
    console.error('GET /api/v1/knowledge error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// POST /api/v1/knowledge - Create new knowledge resource (Partner/Admin only)
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = getClientId(request);
    if (!checkRateLimit(clientId, 10, 60000)) {
      return createErrorResponse('Rate limit exceeded for knowledge resource creation', 429);
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
      .select('admin_level')
      .eq('id', user.id)
      .single();

    if (!partnerProfile && !adminProfile) {
      return createErrorResponse('Partner or Admin access required', 403);
    }

    // Parse and validate request body
    const body = await request.json();
    const {
      title,
      description,
      content_type,
      content,
      source_url,
      domain,
      categories,
      tags,
      topics,
      target_audience,
      is_published = true
    } = body;

    // Validation
    if (!title?.trim()) {
      return createErrorResponse('Title is required', 400);
    }

    if (!content_type || !['webpage', 'pdf', 'document', 'job_training', 'internship', 'video', 'article'].includes(content_type)) {
      return createErrorResponse('Valid content type is required', 400);
    }

    if (!content?.trim()) {
      return createErrorResponse('Content is required', 400);
    }

    // Create knowledge resource
    const { data: newResource, error: createError } = await supabase
      .from('knowledge_resources')
      .insert({
        title: title.trim(),
        description: description?.trim() || '',
        content_type,
        content: content.trim(),
        source_url: source_url?.trim() || null,
        domain: domain?.trim() || null,
        categories: categories || [],
        tags: tags || [],
        topics: topics || [],
        target_audience: target_audience || [],
        is_published,
        partner_id: partnerProfile ? user.id : null
      })
      .select()
      .single();

    if (createError) {
      console.error('Knowledge resource creation error:', createError);
      return createErrorResponse('Failed to create knowledge resource', 500);
    }

    return createSuccessResponse(
      newResource,
      'Knowledge resource created successfully'
    );

  } catch (error) {
    console.error('POST /api/v1/knowledge error:', error);
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