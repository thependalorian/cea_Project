import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * Resumes API v1 - RESTful CRUD Operations
 * 
 * Handles user resume management:
 * - GET /api/v1/resumes - List user's resumes
 * - POST /api/v1/resumes - Upload new resume
 * 
 * Location: /app/api/v1/resumes/route.ts
 */

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

// Rate limiting
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

function createSuccessResponse<T>(data: T, message?: string, meta?: any): NextResponse {
  return NextResponse.json(
    { success: true, data, ...(message && { message }), ...(meta && { meta }) } as ApiResponse<T>,
    { headers: { 'Content-Type': 'application/json', 'X-API-Version': 'v1' } }
  );
}

// GET /api/v1/resumes - List user's resumes
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = getClientId(request);
    if (!checkRateLimit(clientId)) {
      return createErrorResponse('Rate limit exceeded', 429);
    }

    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return createErrorResponse('Authentication required', 401);
    }

    const { searchParams } = new URL(request.url);
    
    // Parse pagination
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
    const offset = (page - 1) * limit;

    // Get user's resumes
    const { data: resumes, error, count } = await supabase
      .from('resumes')
      .select('id, file_name, file_size, content_type, processed, created_at, updated_at', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Database error:', error);
      return createErrorResponse('Failed to fetch resumes', 500);
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return createSuccessResponse(
      resumes,
      'Resumes fetched successfully',
      { total: count || 0, limit, offset, page, total_pages: totalPages }
    );

  } catch (error) {
    console.error('GET /api/v1/resumes error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// POST /api/v1/resumes - Upload new resume
export async function POST(request: NextRequest) {
  try {
    // Rate limiting (stricter for uploads)
    const clientId = getClientId(request);
    if (!checkRateLimit(clientId, 10, 60000)) {
      return createErrorResponse('Rate limit exceeded for resume uploads', 429);
    }

    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return createErrorResponse('Authentication required', 401);
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const originalName = formData.get('originalName') as string;

    if (!file) {
      return createErrorResponse('Resume file is required', 400);
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      return createErrorResponse('Invalid file type. Please upload PDF or Word documents only.', 400);
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return createErrorResponse('File size too large. Maximum 10MB allowed.', 400);
    }

    // Generate unique file path
    const fileExtension = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}-${file.name}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('user-documents')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return createErrorResponse('Failed to upload resume file', 500);
    }

    // Create resume record in database
    const { data: resume, error: dbError } = await supabase
      .from('resumes')
      .insert({
        user_id: user.id,
        file_name: originalName || file.name,
        file_path: uploadData.path,
        file_size: file.size,
        content_type: file.type,
        processed: false
      })
      .select()
      .single();

    if (dbError) {
      console.error('Resume creation error:', dbError);
      
      // Clean up uploaded file if database insert fails
      await supabase.storage
        .from('user-documents')
        .remove([uploadData.path]);
      
      return createErrorResponse('Failed to create resume record', 500);
    }

    return createSuccessResponse(
      resume,
      'Resume uploaded successfully'
    );

  } catch (error) {
    console.error('POST /api/v1/resumes error:', error);
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