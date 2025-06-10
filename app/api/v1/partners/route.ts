import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * Partners API v1 - RESTful CRUD Operations (V1 Schema Compatible)
 * 
 * Updated to work with simplified V1 database schema
 * Only includes columns that exist in partner_profiles table
 * 
 * Location: /app/api/v1/partners/route.ts
 */

interface PaginationParams {
  limit?: number;
  offset?: number;
  page?: number;
}

interface FilterParams {
  organization_type?: string;
  partnership_level?: string;
  verified?: boolean;
  climate_focus?: string;
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

// Rate limiting helper (can be extended with Redis for production)
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
    {
      success: true,
      data,
      ...(message && { message }),
      ...(meta && { meta })
    } as ApiResponse<T>,
    {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Version': 'v1'
      }
    }
  );
}

// GET /api/v1/partners - Read all partners with pagination and filtering
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
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100); // Max 100 per page
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
    const offset = (page - 1) * limit;

    // Parse filter parameters (V1 Schema Compatible)
    const filters: FilterParams = {
      organization_type: searchParams.get('organization_type') || undefined,
      partnership_level: searchParams.get('partnership_level') || undefined,
      verified: searchParams.get('verified') === 'true' ? true : searchParams.get('verified') === 'false' ? false : undefined,
      climate_focus: searchParams.get('climate_focus') || undefined,
    };

    // Build query (V1 Schema - Only existing columns)
    let query = supabase
      .from('partner_profiles')
      .select(`
        id,
        organization_name,
        organization_type,
        website,
        email,
        phone,
        full_name,
        partnership_level,
        verified,
        climate_focus,
        description,
        profile_completed,
        last_login,
        created_at,
        updated_at
      `, { count: 'exact' });

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'climate_focus') {
          // For JSONB array search
          query = query.contains('climate_focus', [value]);
        } else {
          query = query.eq(key, value);
        }
      }
    });

    // Apply pagination and ordering
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: partners, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      return createErrorResponse(`Failed to fetch partners: ${error.message}`, 500, error);
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return createSuccessResponse(
      partners,
      'Partners fetched successfully',
      {
        total: count || 0,
        limit,
        offset,
        page,
        total_pages: totalPages
      }
    );

  } catch (error) {
    console.error('GET /api/v1/partners error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// POST /api/v1/partners - Create new partner (Admin only)
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = getClientId(request);
    if (!checkRateLimit(clientId, 10, 60000)) { // Stricter limit for POST
      return createErrorResponse('Rate limit exceeded for partner creation', 429);
    }

    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return createErrorResponse('Authentication required', 401);
    }

    // Check if user has partner management privileges
    const { data: adminProfile } = await supabase
      .from('admin_profiles')
      .select('can_manage_partners, can_manage_system')
      .eq('user_id', user.id)
      .single();

    if (!adminProfile || (!adminProfile.can_manage_partners && !adminProfile.can_manage_system)) {
      return createErrorResponse('Partner management access required', 403);
    }

    // Parse and validate request body
    const body = await request.json();
    const {
      organization_name,
      organization_type,
      organization_size,
      website,
      headquarters_location,
      description,
      partnership_level = 'standard',
      climate_focus,
      contact_email
    } = body;

    // Validation
    if (!organization_name?.trim()) {
      return createErrorResponse('Organization name is required', 400);
    }

    if (!organization_type || !['employer', 'education', 'community', 'government', 'nonprofit'].includes(organization_type)) {
      return createErrorResponse('Valid organization type is required', 400);
    }

    if (!Array.isArray(climate_focus) || climate_focus.length === 0) {
      return createErrorResponse('At least one climate focus area is required', 400);
    }

    if (!contact_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact_email)) {
      return createErrorResponse('Valid contact email is required', 400);
    }

    // Create user account for partner
    const { data: newUser, error: userError } = await supabase.auth.admin.createUser({
      email: contact_email,
      password: `ClimatePartner2025!${organization_name.replace(/\s+/g, '_')}`,
      email_confirm: true,
      user_metadata: {
        organization_name,
        role: 'partner'
      }
    });

    if (userError) {
      if (userError.message.includes('already registered')) {
        return createErrorResponse('Email address already registered', 409);
      }
      console.error('User creation error:', userError);
      return createErrorResponse('Failed to create partner account', 500);
    }

    // Create partner profile
    const { data: newPartner, error: profileError } = await supabase
      .from('partner_profiles')
      .insert({
        id: newUser.user.id,
        organization_name: organization_name.trim(),
        organization_type,
        organization_size: organization_size || null,
        website: website?.trim() || null,
        headquarters_location: headquarters_location?.trim() || null,
        description: description?.trim() || '',
        partnership_level,
        climate_focus,
        email: contact_email,
        verified: false,
        profile_completed: false
      })
      .select()
      .single();

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Clean up user if profile creation fails
      await supabase.auth.admin.deleteUser(newUser.user.id);
      return createErrorResponse('Failed to create partner profile', 500);
    }

    return createSuccessResponse(
      newPartner,
      'Partner created successfully',
    );

  } catch (error) {
    console.error('POST /api/v1/partners error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// OPTIONS - CORS preflight support
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
} 