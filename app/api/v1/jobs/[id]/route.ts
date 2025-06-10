import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * Individual Job Listing API v1 - RESTful CRUD Operations
 * Location: /app/api/v1/jobs/[id]/route.ts
 */

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

function createErrorResponse(message: string, status: number): NextResponse {
  return NextResponse.json(
    { success: false, error: message } as ApiResponse<null>,
    { status, headers: { 'Content-Type': 'application/json', 'X-API-Version': 'v1' } }
  );
}

function createSuccessResponse<T>(data: T, message?: string): NextResponse {
  return NextResponse.json(
    { success: true, data, ...(message && { message }) } as ApiResponse<T>,
    { headers: { 'Content-Type': 'application/json', 'X-API-Version': 'v1' } }
  );
}

// GET /api/v1/jobs/{id}
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient();
    const jobId = params.id;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(jobId)) {
      return createErrorResponse('Invalid job ID format', 400);
    }

    const { data: job, error } = await supabase
      .from('job_listings')
      .select(`
        *,
        partner_profiles(
          organization_name,
          organization_type,
          verified,
          website,
          careers_page_url
        )
      `)
      .eq('id', jobId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return createErrorResponse('Job listing not found', 404);
      }
      return createErrorResponse('Failed to fetch job listing', 500);
    }

    return createSuccessResponse(job, 'Job listing retrieved successfully');
  } catch (error) {
    return createErrorResponse('Internal server error', 500);
  }
}

// PUT /api/v1/jobs/{id}
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient();
    const jobId = params.id;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(jobId)) {
      return createErrorResponse('Invalid job ID format', 400);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return createErrorResponse('Authentication required', 401);
    }

    const { data: currentJob } = await supabase
      .from('job_listings')
      .select('id, partner_id')
      .eq('id', jobId)
      .single();

    if (!currentJob) {
      return createErrorResponse('Job listing not found', 404);
    }

    // Check authorization
    const isOwner = user.id === currentJob.partner_id;
    const { data: adminProfile } = await supabase
      .from('admin_profiles')
      .select('admin_level')
      .eq('id', user.id)
      .single();
    
    const isAdmin = !!adminProfile;

    if (!isOwner && !isAdmin) {
      return createErrorResponse('Access denied', 403);
    }

    const body = await request.json();
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };

    // Only update provided fields
    if (body.title !== undefined) updateData.title = body.title.trim();
    if (body.description !== undefined) updateData.description = body.description.trim();
    if (body.requirements !== undefined) updateData.requirements = body.requirements?.trim() || null;
    if (body.responsibilities !== undefined) updateData.responsibilities = body.responsibilities?.trim() || null;
    if (body.location !== undefined) updateData.location = body.location?.trim() || null;
    if (body.employment_type !== undefined) updateData.employment_type = body.employment_type;
    if (body.experience_level !== undefined) updateData.experience_level = body.experience_level;
    if (body.salary_range !== undefined) updateData.salary_range = body.salary_range?.trim() || null;
    if (body.climate_focus !== undefined) updateData.climate_focus = body.climate_focus || [];
    if (body.skills_required !== undefined) updateData.skills_required = body.skills_required || [];
    if (body.benefits !== undefined) updateData.benefits = body.benefits?.trim() || null;
    if (body.application_url !== undefined) updateData.application_url = body.application_url?.trim() || null;
    if (body.application_email !== undefined) updateData.application_email = body.application_email?.trim() || null;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;
    if (body.expires_at !== undefined) updateData.expires_at = body.expires_at ? new Date(body.expires_at).toISOString() : null;

    const { data: updatedJob, error: updateError } = await supabase
      .from('job_listings')
      .update(updateData)
      .eq('id', jobId)
      .select()
      .single();

    if (updateError) {
      return createErrorResponse('Failed to update job listing', 500);
    }

    return createSuccessResponse(updatedJob, 'Job listing updated successfully');
  } catch (error) {
    return createErrorResponse('Internal server error', 500);
  }
}

// DELETE /api/v1/jobs/{id}
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient();
    const jobId = params.id;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(jobId)) {
      return createErrorResponse('Invalid job ID format', 400);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return createErrorResponse('Authentication required', 401);
    }

    const { data: currentJob } = await supabase
      .from('job_listings')
      .select('id, title, partner_id')
      .eq('id', jobId)
      .single();

    if (!currentJob) {
      return createErrorResponse('Job listing not found', 404);
    }

    // Check authorization
    const isOwner = user.id === currentJob.partner_id;
    const { data: adminProfile } = await supabase
      .from('admin_profiles')
      .select('admin_level')
      .eq('id', user.id)
      .single();
    
    const isAdmin = !!adminProfile;

    if (!isOwner && !isAdmin) {
      return createErrorResponse('Access denied', 403);
    }

    const { error: deleteError } = await supabase
      .from('job_listings')
      .delete()
      .eq('id', jobId);

    if (deleteError) {
      return createErrorResponse('Failed to delete job listing', 500);
    }

    return createSuccessResponse(null, `Job listing "${currentJob.title}" deleted successfully`);
  } catch (error) {
    return createErrorResponse('Internal server error', 500);
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
} 