import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * Partner Resources API v1 - RESTful CRUD Operations
 * 
 * Handles partner-specific resource management:
 * - GET /api/v1/partner-resources - List partner resources
 * - POST /api/v1/partner-resources - Create new partner resource (Partner/Admin)
 * 
 * Location: /app/api/v1/partner-resources/route.ts
 */

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: any;
}

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

function createErrorResponse(message: string, status: number, details?: any): NextResponse {
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

function createSuccessResponse<T>(data: T, message?: string, meta?: any): NextResponse {
  return NextResponse.json(
    { success: true, data, ...(message && { message }), ...(meta && { meta }) } as ApiResponse<T>,
    { headers: { 'Content-Type': 'application/json', 'X-API-Version': 'v1', 'Cache-Control': 'public, max-age=300' } }
  );
}

// Check if partner_resources table exists
async function checkTableExists(supabase: any): Promise<boolean> {
  try {
    await supabase.from('partner_resources').select('id').limit(1);
    return true;
  } catch (error: any) {
    if (error?.code === '42P01') { // Table does not exist
      return false;
    }
    throw error;
  }
}

// GET /api/v1/partner-resources - List partner resources
export async function GET(request: NextRequest) {
  try {
    const clientId = getClientId(request);
    if (!checkRateLimit(clientId)) {
      return createErrorResponse('Rate limit exceeded', 429);
    }

    const supabase = await createClient();
    
    // Check if partner_resources table exists
    const tableExists = await checkTableExists(supabase);
    if (!tableExists) {
      return createErrorResponse(
        'Partner resources feature not yet implemented', 
        501,
        { 
          reason: 'partner_resources table not found',
          suggestion: 'This feature will be available after database migration'
        }
      );
    }

    const { searchParams } = new URL(request.url);

    // Get authenticated user (optional for public resources)
    const { data: { user } } = await supabase.auth.getUser();

    // Pagination
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
    const offset = (page - 1) * limit;

    // Filters
    const partner_id = searchParams.get('partner_id');
    const resource_type = searchParams.get('resource_type');
    const status = searchParams.get('status') || 'active';
    const visibility = searchParams.get('visibility');
    const category = searchParams.get('category');

    let query = supabase
      .from('partner_resources')
      .select(`
        id, title, description, resource_type, content, file_url,
        category, tags, visibility, status, metadata, usage_stats,
        partner_id, created_at, updated_at
      `, { count: 'exact' });

    // Apply filters
    if (partner_id) query = query.eq('partner_id', partner_id);
    if (resource_type) query = query.eq('resource_type', resource_type);
    if (status) query = query.eq('status', status);
    if (category) query = query.eq('category', category);

    // Handle visibility based on user authentication
    if (!user) {
      // Public users can only see public resources
      query = query.eq('visibility', 'public');
    } else {
      // Check if user is admin
      try {
        const { data: adminProfile } = await supabase
          .from('admin_profiles')
          .select('can_manage_content, can_manage_system')
          .eq('user_id', user.id)
          .single();

        if (!(adminProfile && (adminProfile.can_manage_content || adminProfile.can_manage_system))) {
          // Non-admin users can see public and partner_only resources
          if (visibility) {
            query = query.eq('visibility', visibility);
          } else {
            query = query.in('visibility', ['public', 'partner_only']);
          }
        }
        // Admins can see all resources regardless of visibility
      } catch (adminError) {
        // If admin check fails, treat as regular user
        if (visibility) {
          query = query.eq('visibility', visibility);
        } else {
          query = query.in('visibility', ['public', 'partner_only']);
        }
      }
    }

    // Search across title and description
    const search = searchParams.get('search');
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Filter by tags if provided
    const tag = searchParams.get('tag');
    if (tag) {
      query = query.contains('tags', [tag]);
    }

    const { data: resources, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Database error:', error);
      return createErrorResponse('Failed to fetch partner resources', 500, { database_error: error.message });
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return createSuccessResponse(
      resources,
      'Partner resources fetched successfully',
      { total: count || 0, limit, offset, page, total_pages: totalPages }
    );

  } catch (error: any) {
    console.error('GET /api/v1/partner-resources error:', error);
    
    // Handle specific database errors
    if (error?.code === '42P01') {
      return createErrorResponse(
        'Partner resources table not found', 
        501,
        { suggestion: 'Database migration needed to enable this feature' }
      );
    }
    
    return createErrorResponse('Internal server error', 500);
  }
}

// POST /api/v1/partner-resources - Create partner resource (Partner/Admin only)
export async function POST(request: NextRequest) {
  try {
    const clientId = getClientId(request);
    if (!checkRateLimit(clientId, 15, 60000)) {
      return createErrorResponse('Rate limit exceeded for resource creation', 429);
    }

    const supabase = await createClient();
    
    // Check if partner_resources table exists
    const tableExists = await checkTableExists(supabase);
    if (!tableExists) {
      return createErrorResponse(
        'Partner resources creation not yet implemented', 
        501,
        { 
          reason: 'partner_resources table not found',
          suggestion: 'This feature will be available after database migration'
        }
      );
    }
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return createErrorResponse('Authentication required', 401);
    }

    // Check if user is partner or admin
    const [partnerCheck, adminCheck] = await Promise.allSettled([
      supabase.from('partner_profiles').select('id').eq('id', user.id).single(),
      supabase.from('admin_profiles').select('can_manage_content, can_manage_system').eq('user_id', user.id).single()
    ]);

    const partnerProfile = partnerCheck.status === 'fulfilled' ? partnerCheck.value.data : null;
    const adminProfile = adminCheck.status === 'fulfilled' ? adminCheck.value.data : null;

    if (!partnerProfile && !adminProfile) {
      return createErrorResponse('Partner or Admin access required', 403);
    }

    // For admin users, verify they have content management permissions
    if (adminProfile && !partnerProfile && !adminProfile.can_manage_content && !adminProfile.can_manage_system) {
      return createErrorResponse('Content management privileges required for admin resource creation', 403);
    }

    const body = await request.json();
    const {
      title,
      description,
      resource_type,
      content,
      file_url,
      category,
      tags = [],
      visibility = 'partner_only',
      metadata = {}
    } = body;

    // Validation
    if (!title || !description || !resource_type) {
      return createErrorResponse('Title, description, and resource_type are required', 400);
    }

    if (title.length > 200) {
      return createErrorResponse('Title must be 200 characters or less', 400);
    }

    if (description.length > 1000) {
      return createErrorResponse('Description must be 1000 characters or less', 400);
    }

    const validResourceTypes = ['document', 'link', 'video', 'course', 'tool', 'guide'];
    if (!validResourceTypes.includes(resource_type)) {
      return createErrorResponse(`Invalid resource_type. Must be one of: ${validResourceTypes.join(', ')}`, 400);
    }

    const validVisibility = ['public', 'partner_only', 'private'];
    if (!validVisibility.includes(visibility)) {
      return createErrorResponse(`Invalid visibility. Must be one of: ${validVisibility.join(', ')}`, 400);
    }

    const resourceData = {
      title,
      description,
      resource_type,
      content,
      file_url,
      category,
      tags,
      visibility,
      status: 'active',
      metadata,
      partner_id: partnerProfile?.id || null, // Use partner ID if available
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: newResource, error } = await supabase
      .from('partner_resources')
      .insert([resourceData])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return createErrorResponse('Failed to create partner resource', 500, { database_error: error.message });
    }

    return createSuccessResponse(
      newResource,
      'Partner resource created successfully',
      { resource_id: newResource.id }
    );

  } catch (error: any) {
    console.error('POST /api/v1/partner-resources error:', error);
    
    // Handle specific database errors
    if (error?.code === '42P01') {
      return createErrorResponse(
        'Partner resources table not found', 
        501,
        { suggestion: 'Database migration needed to enable this feature' }
      );
    }
    
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