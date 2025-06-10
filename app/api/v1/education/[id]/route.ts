import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * Individual Education Program API v1 - RESTful CRUD Operations
 * Location: /app/api/v1/education/[id]/route.ts
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

// GET /api/v1/education/{id}
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient();
    const programId = params.id;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(programId)) {
      return createErrorResponse('Invalid program ID format', 400);
    }

    const { data: program, error } = await supabase
      .from('education_programs')
      .select(`
        *,
        partner_profiles(
          organization_name,
          organization_type,
          verified,
          website
        )
      `)
      .eq('id', programId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return createErrorResponse('Education program not found', 404);
      }
      return createErrorResponse('Failed to fetch education program', 500);
    }

    return createSuccessResponse(program, 'Education program retrieved successfully');
  } catch (error) {
    return createErrorResponse('Internal server error', 500);
  }
}

// PUT /api/v1/education/{id}
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient();
    const programId = params.id;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(programId)) {
      return createErrorResponse('Invalid program ID format', 400);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return createErrorResponse('Authentication required', 401);
    }

    const { data: currentProgram } = await supabase
      .from('education_programs')
      .select('id, partner_id')
      .eq('id', programId)
      .single();

    if (!currentProgram) {
      return createErrorResponse('Education program not found', 404);
    }

    // Check authorization
    const isOwner = user.id === currentProgram.partner_id;
    const { data: adminProfile } = await supabase
      .from('admin_profiles')
      .select('can_manage_content, can_manage_system')
      .eq('user_id', user.id)
      .single();
    
    const isAdmin = adminProfile && (adminProfile.can_manage_content || adminProfile.can_manage_system);

    if (!isOwner && !isAdmin) {
      return createErrorResponse('Access denied. Content management privileges required for admin actions.', 403);
    }

    const body = await request.json();
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };

    // Only update provided fields
    if (body.title !== undefined) updateData.title = body.title.trim();
    if (body.description !== undefined) updateData.description = body.description.trim();
    if (body.program_type !== undefined) updateData.program_type = body.program_type;
    if (body.duration !== undefined) updateData.duration = body.duration?.trim() || null;
    if (body.delivery_method !== undefined) updateData.delivery_method = body.delivery_method;
    if (body.prerequisites !== undefined) updateData.prerequisites = body.prerequisites?.trim() || null;
    if (body.learning_outcomes !== undefined) updateData.learning_outcomes = body.learning_outcomes || [];
    if (body.certification_provided !== undefined) updateData.certification_provided = body.certification_provided;
    if (body.cost_range !== undefined) updateData.cost_range = body.cost_range?.trim() || null;
    if (body.location !== undefined) updateData.location = body.location?.trim() || null;
    if (body.start_date !== undefined) updateData.start_date = body.start_date ? new Date(body.start_date).toISOString() : null;
    if (body.end_date !== undefined) updateData.end_date = body.end_date ? new Date(body.end_date).toISOString() : null;
    if (body.application_deadline !== undefined) updateData.application_deadline = body.application_deadline ? new Date(body.application_deadline).toISOString() : null;
    if (body.climate_focus !== undefined) updateData.climate_focus = body.climate_focus || [];
    if (body.skills_taught !== undefined) updateData.skills_taught = body.skills_taught || [];
    if (body.target_audience !== undefined) updateData.target_audience = body.target_audience || [];
    if (body.contact_information !== undefined) updateData.contact_information = body.contact_information || {};
    if (body.application_url !== undefined) updateData.application_url = body.application_url?.trim() || null;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;

    const { data: updatedProgram, error: updateError } = await supabase
      .from('education_programs')
      .update(updateData)
      .eq('id', programId)
      .select()
      .single();

    if (updateError) {
      return createErrorResponse('Failed to update education program', 500);
    }

    return createSuccessResponse(updatedProgram, 'Education program updated successfully');
  } catch (error) {
    return createErrorResponse('Internal server error', 500);
  }
}

// DELETE /api/v1/education/{id}
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient();
    const programId = params.id;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(programId)) {
      return createErrorResponse('Invalid program ID format', 400);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return createErrorResponse('Authentication required', 401);
    }

    const { data: currentProgram } = await supabase
      .from('education_programs')
      .select('id, title, partner_id')
      .eq('id', programId)
      .single();

    if (!currentProgram) {
      return createErrorResponse('Education program not found', 404);
    }

    // Check authorization
    const isOwner = user.id === currentProgram.partner_id;
    const { data: adminProfile } = await supabase
      .from('admin_profiles')
      .select('can_manage_content, can_manage_system')
      .eq('user_id', user.id)
      .single();
    
    const isAdmin = adminProfile && (adminProfile.can_manage_content || adminProfile.can_manage_system);

    if (!isOwner && !isAdmin) {
      return createErrorResponse('Access denied. Content management privileges required for admin actions.', 403);
    }

    const { error: deleteError } = await supabase
      .from('education_programs')
      .delete()
      .eq('id', programId);

    if (deleteError) {
      return createErrorResponse('Failed to delete education program', 500);
    }

    return createSuccessResponse(null, `Education program "${currentProgram.title}" deleted successfully`);
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