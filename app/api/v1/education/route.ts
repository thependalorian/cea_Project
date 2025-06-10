import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * Education Programs API v1 - RESTful CRUD Operations
 * 
 * Provides access to education programs and training opportunities
 * 
 * Location: /app/api/v1/education/route.ts
 */

interface PaginationParams {
  limit?: number;
  offset?: number;
  page?: number;
}

interface FilterParams {
  program_type?: string;
  format?: string;
  is_active?: boolean;
  partner_id?: string;
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
        'X-API-Version': 'v1'
      }
    }
  );
}

// GET /api/v1/education - Read all education programs with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    // Parse pagination parameters
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
    const offset = (page - 1) * limit;

    // Parse filter parameters
    const filters: FilterParams = {
      program_type: searchParams.get('program_type') || undefined,
      format: searchParams.get('format') || undefined,
      is_active: searchParams.get('is_active') === 'true' ? true : searchParams.get('is_active') === 'false' ? false : undefined,
      partner_id: searchParams.get('partner_id') || undefined,
    };

    // First, try simple query without JOIN to avoid complex relationship issues
    let query = supabase
      .from('education_programs')
      .select(`
        id,
        program_name,
        description,
        program_type,
        duration,
        format,
        cost,
        prerequisites,
        climate_focus,
        skills_taught,
        certification_offered,
        application_deadline,
        start_date,
        end_date,
        contact_info,
        application_url,
        is_active,
        partner_id,
        created_at,
        updated_at
      `, { count: 'exact' });

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        query = query.eq(key, value);
      }
    });

    // Apply pagination and ordering
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: programs, error, count } = await query;

    if (error) {
      console.error('Database error fetching education programs:', error);
      
      // If table doesn't exist, return empty array instead of 500 error
      if (error.code === '42P01') {
        return createSuccessResponse(
          [],
          'Education programs table not found - returning empty results',
          {
            total: 0,
            limit,
            offset,
            page,
            total_pages: 0
          }
        );
      }
      
      return createErrorResponse('Failed to fetch education programs', 500, { error });
    }

    const totalPages = Math.ceil((count || 0) / limit);

    // If we have programs and partner relationships exist, try to enrich data
    let enrichedPrograms = programs || [];
    
    if (programs && programs.length > 0) {
      try {
        // Try to get partner info separately to avoid JOIN issues
        const partnerIds = programs
          .map(p => p.partner_id)
          .filter(id => id !== null && id !== undefined);
          
        if (partnerIds.length > 0) {
          const { data: partners } = await supabase
            .from('profiles')
            .select('id, organization_name, organization_type, website')
            .in('id', partnerIds);
            
          if (partners) {
            // Add partner info to programs
            enrichedPrograms = programs.map(program => ({
              ...program,
              partner_info: partners.find(p => p.id === program.partner_id) || null
            }));
          }
        }
      } catch (enrichError) {
        console.warn('Could not enrich with partner data:', enrichError);
        // Continue with basic program data
      }
    }

    return createSuccessResponse(
      enrichedPrograms,
      'Education programs fetched successfully',
      {
        total: count || 0,
        limit,
        offset,
        page,
        total_pages: totalPages
      }
    );

  } catch (error) {
    console.error('GET /api/v1/education error:', error);
    return createErrorResponse('Internal server error while fetching education programs', 500, {
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// POST /api/v1/education - Create new education program (Partner/Admin only)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return createErrorResponse('Authentication required', 401);
    }

    const body = await request.json();
    const {
      program_name,
      description,
      program_type,
      duration,
      format,
      cost,
      prerequisites,
      climate_focus,
      skills_taught,
      certification_offered,
      application_deadline,
      start_date,
      end_date,
      contact_info,
      application_url,
      partner_id
    } = body;

    // Validate required fields
    if (!program_name || !description || !program_type) {
      return createErrorResponse('Program name, description, and type are required', 400);
    }

    const { data: program, error } = await supabase
      .from('education_programs')
      .insert([{
        program_name,
        description,
        program_type,
        duration,
        format,
        cost,
        prerequisites,
        climate_focus,
        skills_taught,
        certification_offered,
        application_deadline,
        start_date,
        end_date,
        contact_info,
        application_url,
        partner_id,
        is_active: true
      }])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return createErrorResponse('Failed to create education program', 500, { error });
    }

    return createSuccessResponse(program, 'Education program created successfully');

  } catch (error) {
    console.error('POST /api/v1/education error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return NextResponse.json({}, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
} 