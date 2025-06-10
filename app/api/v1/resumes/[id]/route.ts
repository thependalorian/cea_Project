/**
 * Individual Resume API v1 - RESTful Operations
 * 
 * Handles operations on specific resumes:
 * - GET /api/v1/resumes/[id] - Get resume details
 * - DELETE /api/v1/resumes/[id] - Delete resume
 * - GET /api/v1/resumes/[id]/download - Download resume file
 * 
 * Location: /app/api/v1/resumes/[id]/route.ts
 */

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

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

// GET /api/v1/resumes/[id] - Get resume details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return createErrorResponse('Authentication required', 401);
    }

    const { id } = params;

    // Check if this is a download request
    const url = new URL(request.url);
    if (url.pathname.endsWith('/download')) {
      return handleDownload(supabase, user.id, id);
    }

    // Get resume details
    const { data: resume, error } = await supabase
      .from('resumes')
      .select('id, file_name, file_size, content_type, processed, created_at, updated_at')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return createErrorResponse('Resume not found', 404);
      }
      console.error('Database error:', error);
      return createErrorResponse('Failed to fetch resume', 500);
    }

    return createSuccessResponse(resume, 'Resume details fetched successfully');

  } catch (error) {
    console.error('GET /api/v1/resumes/[id] error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// Handle file download
async function handleDownload(supabase: any, userId: string, resumeId: string) {
  try {
    // Get resume with file path
    const { data: resume, error } = await supabase
      .from('resumes')
      .select('file_path, file_name, content_type')
      .eq('id', resumeId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return createErrorResponse('Resume not found', 404);
      }
      return createErrorResponse('Failed to fetch resume', 500);
    }

    // Get signed URL for download
    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from('user-documents')
      .createSignedUrl(resume.file_path, 60 * 60); // 1 hour expiry

    if (urlError) {
      console.error('Signed URL error:', urlError);
      return createErrorResponse('Failed to generate download URL', 500);
    }

    // Return download URL
    return NextResponse.json({
      success: true,
      download_url: signedUrlData.signedUrl,
      file_name: resume.file_name,
      content_type: resume.content_type,
      expires_in: 3600
    });

  } catch (error) {
    console.error('Download error:', error);
    return createErrorResponse('Failed to process download', 500);
  }
}

// DELETE /api/v1/resumes/[id] - Delete resume
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return createErrorResponse('Authentication required', 401);
    }

    const { id } = params;

    // Get resume with file path for cleanup
    const { data: resume, error: fetchError } = await supabase
      .from('resumes')
      .select('file_path')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return createErrorResponse('Resume not found', 404);
      }
      return createErrorResponse('Failed to fetch resume', 500);
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('resumes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Database delete error:', deleteError);
      return createErrorResponse('Failed to delete resume', 500);
    }

    // Delete file from storage
    const { error: storageError } = await supabase.storage
      .from('user-documents')
      .remove([resume.file_path]);

    if (storageError) {
      console.error('Storage delete error:', storageError);
      // Don't fail the request if storage deletion fails
    }

    return createSuccessResponse(null, 'Resume deleted successfully');

  } catch (error) {
    console.error('DELETE /api/v1/resumes/[id] error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
} 