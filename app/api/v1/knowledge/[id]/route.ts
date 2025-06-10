import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * Individual Knowledge Resource API v1 - RESTful CRUD Operations
 * 
 * Handles operations on specific knowledge resources:
 * - GET /api/v1/knowledge/{id} - Read specific knowledge resource
 * - PUT /api/v1/knowledge/{id} - Update specific knowledge resource
 * - DELETE /api/v1/knowledge/{id} - Delete specific knowledge resource
 * 
 * Location: /app/api/v1/knowledge/[id]/route.ts
 */

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
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

function createSuccessResponse<T>(data: T, message?: string): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(message && { message })
    } as ApiResponse<T>,
    {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Version': 'v1'
      }
    }
  );
}

// GET /api/v1/knowledge/{id} - Read specific knowledge resource
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const resourceId = params.id;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(resourceId)) {
      return createErrorResponse('Invalid resource ID format', 400);
    }

    // Get knowledge resource
    const { data: resource, error } = await supabase
      .from('knowledge_resources')
      .select(`
        id,
        title,
        description,
        content_type,
        content,
        source_url,
        file_path,
        domain,
        categories,
        tags,
        topics,
        target_audience,
        metadata,
        is_published,
        partner_id,
        created_at,
        updated_at,
        partner_profiles(
          organization_name,
          organization_type,
          verified,
          website
        )
      `)
      .eq('id', resourceId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return createErrorResponse('Knowledge resource not found', 404);
      }
      console.error('Database error:', error);
      return createErrorResponse('Failed to fetch knowledge resource', 500);
    }

    return createSuccessResponse(resource, 'Knowledge resource retrieved successfully');

  } catch (error) {
    console.error('GET /api/v1/knowledge/[id] error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// PUT /api/v1/knowledge/{id} - Update specific knowledge resource
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const resourceId = params.id;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(resourceId)) {
      return createErrorResponse('Invalid resource ID format', 400);
    }

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return createErrorResponse('Authentication required', 401);
    }

    // Check if resource exists and get current data
    const { data: currentResource } = await supabase
      .from('knowledge_resources')
      .select('id, partner_id')
      .eq('id', resourceId)
      .single();

    if (!currentResource) {
      return createErrorResponse('Knowledge resource not found', 404);
    }

    // Check authorization: user must own the resource or be admin
    const isOwner = user.id === currentResource.partner_id;
    let isAdmin = false;

    if (!isOwner) {
      const { data: adminProfile } = await supabase
        .from('admin_profiles')
        .select('admin_level')
        .eq('id', user.id)
        .single();
      
      isAdmin = !!adminProfile;
    }

    if (!isOwner && !isAdmin) {
      return createErrorResponse('Access denied. You can only update your own resources or be an admin.', 403);
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
      is_published,
      metadata
    } = body;

    // Validation
    if (title !== undefined && !title?.trim()) {
      return createErrorResponse('Title cannot be empty', 400);
    }

    if (content_type !== undefined && !['webpage', 'pdf', 'document', 'job_training', 'internship', 'video', 'article'].includes(content_type)) {
      return createErrorResponse('Invalid content type', 400);
    }

    if (content !== undefined && !content?.trim()) {
      return createErrorResponse('Content cannot be empty', 400);
    }

    // Prepare update data (only include fields that are provided)
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    };

    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description?.trim() || '';
    if (content_type !== undefined) updateData.content_type = content_type;
    if (content !== undefined) updateData.content = content.trim();
    if (source_url !== undefined) updateData.source_url = source_url?.trim() || null;
    if (domain !== undefined) updateData.domain = domain?.trim() || null;
    if (categories !== undefined) updateData.categories = categories || [];
    if (tags !== undefined) updateData.tags = tags || [];
    if (topics !== undefined) updateData.topics = topics || [];
    if (target_audience !== undefined) updateData.target_audience = target_audience || [];
    if (is_published !== undefined) updateData.is_published = is_published;
    if (metadata !== undefined) updateData.metadata = metadata || {};

    // Update knowledge resource
    const { data: updatedResource, error: updateError } = await supabase
      .from('knowledge_resources')
      .update(updateData)
      .eq('id', resourceId)
      .select()
      .single();

    if (updateError) {
      console.error('Update error:', updateError);
      return createErrorResponse('Failed to update knowledge resource', 500);
    }

    return createSuccessResponse(
      updatedResource,
      'Knowledge resource updated successfully'
    );

  } catch (error) {
    console.error('PUT /api/v1/knowledge/[id] error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// DELETE /api/v1/knowledge/{id} - Delete specific knowledge resource
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const resourceId = params.id;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(resourceId)) {
      return createErrorResponse('Invalid resource ID format', 400);
    }

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return createErrorResponse('Authentication required', 401);
    }

    // Check if resource exists and get current data
    const { data: currentResource } = await supabase
      .from('knowledge_resources')
      .select('id, title, partner_id')
      .eq('id', resourceId)
      .single();

    if (!currentResource) {
      return createErrorResponse('Knowledge resource not found', 404);
    }

    // Check authorization: user must own the resource or be admin
    const isOwner = user.id === currentResource.partner_id;
    let isAdmin = false;

    if (!isOwner) {
      const { data: adminProfile } = await supabase
        .from('admin_profiles')
        .select('admin_level')
        .eq('id', user.id)
        .single();
      
      isAdmin = !!adminProfile;
    }

    if (!isOwner && !isAdmin) {
      return createErrorResponse('Access denied. You can only delete your own resources or be an admin.', 403);
    }

    // Delete knowledge resource
    const { error: deleteError } = await supabase
      .from('knowledge_resources')
      .delete()
      .eq('id', resourceId);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      return createErrorResponse('Failed to delete knowledge resource', 500);
    }

    return createSuccessResponse(
      null,
      `Knowledge resource "${currentResource.title}" deleted successfully`
    );

  } catch (error) {
    console.error('DELETE /api/v1/knowledge/[id] error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// OPTIONS - CORS preflight support
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