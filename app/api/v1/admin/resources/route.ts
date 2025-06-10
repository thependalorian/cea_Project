import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * Admin Resources API v1 - RESTful CRUD Operations
 * 
 * Handles admin content management:
 * - GET /api/v1/admin/resources - List admin resources (Admin only)
 * - POST /api/v1/admin/resources - Create new admin resource (Admin only)
 * 
 * Location: /app/api/v1/admin/resources/route.ts
 */

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: Record<string, unknown>;
}

function createErrorResponse(message: string, status: number): NextResponse {
  return NextResponse.json(
    { success: false, error: message } as ApiResponse<null>,
    { status, headers: { 'Content-Type': 'application/json', 'X-API-Version': 'v1' } }
  );
}

function createSuccessResponse<T>(data: T, message?: string, meta?: Record<string, unknown>): NextResponse {
  return NextResponse.json(
    { success: true, data, ...(message && { message }), ...(meta && { meta }) } as ApiResponse<T>,
    { headers: { 'Content-Type': 'application/json', 'X-API-Version': 'v1' } }
  );
}

// Aligned AdminResource type for DB schema (example, update as needed)
interface AdminResource {
  id: string; // uuid, not nullable
  title: string; // text, not nullable
  description: string | null; // text, nullable
  resource_type: string; // text, not nullable
  content: string | null; // text, nullable
  file_path: string | null; // text, nullable
  access_level: string; // text, not nullable
  permissions: Record<string, unknown>; // jsonb, nullable
  status: string; // text, not nullable
  department: string | null; // varchar(100), nullable
  priority: string | null; // text, nullable
  usage_stats: Record<string, unknown>; // jsonb, nullable
  metadata: Record<string, unknown>; // jsonb, nullable
  version: string | null; // text, nullable
  created_by: string; // uuid, not nullable
  created_at: string; // timestamp, not nullable
  updated_at: string; // timestamp, not nullable
  expiry_date?: string | null; // timestamp, nullable
  review_required?: boolean; // boolean, nullable
  admin_profiles?: {
    full_name: string;
    department: string;
  };
}

// GET /api/v1/admin/resources - List admin resources (Admin only)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return createErrorResponse('Authentication required', 401);
    }

    // Check if user is admin
    const { data: adminProfile } = await supabase
      .from('admin_profiles')
      .select('admin_level, can_manage_content')
      .eq('id', user.id)
      .single();

    if (!adminProfile) {
      return createErrorResponse('Admin access required', 403);
    }

    // Check content management permission
    if (!adminProfile.can_manage_content && adminProfile.admin_level !== 'super') {
      return createErrorResponse('Content management permission required', 403);
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
    const offset = (page - 1) * limit;

    // Filters
    const resource_type = searchParams.get('resource_type');
    const status = searchParams.get('status');
    const access_level = searchParams.get('access_level');
    const department = searchParams.get('department');
    const created_by = searchParams.get('created_by');

    let query = supabase
      .from('admin_resources')
      .select(`
        id, title, description, resource_type, content, file_path,
        access_level, permissions, status, department, priority,
        usage_stats, metadata, version, created_by, created_at, updated_at,
        admin_profiles!inner(
          full_name,
          department
        )
      `, { count: 'exact' });

    // Apply filters
    if (resource_type) query = query.eq('resource_type', resource_type);
    if (status) query = query.eq('status', status);
    if (access_level) query = query.eq('access_level', access_level);
    if (department) query = query.eq('department', department);
    if (created_by) query = query.eq('created_by', created_by);

    // Search across title and description
    const search = searchParams.get('search');
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Filter by admin level access
    if (adminProfile.admin_level === 'standard') {
      // Standard admins can only see resources they have access to
      query = query.in('access_level', ['standard', 'all']);
    }
    // Super admins can see all resources

    const { data: resources, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Database error:', error);
      return createErrorResponse('Failed to fetch admin resources', 500);
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return createSuccessResponse(
      resources as any[],
      'Admin resources fetched successfully',
      { total: count || 0, limit, offset, page, total_pages: totalPages }
    );

  } catch (error) {
    console.error('GET /api/v1/admin/resources error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// POST /api/v1/admin/resources - Create admin resource (Admin only)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return createErrorResponse('Authentication required', 401);
    }

    // Check if user is admin
    const { data: adminProfile } = await supabase
      .from('admin_profiles')
      .select('admin_level, can_manage_content, department')
      .eq('id', user.id)
      .single();

    if (!adminProfile) {
      return createErrorResponse('Admin access required', 403);
    }

    // Check content management permission
    if (!adminProfile.can_manage_content && adminProfile.admin_level !== 'super') {
      return createErrorResponse('Content management permission required', 403);
    }

    const body: Partial<AdminResource> = await request.json();
    const {
      title,
      description,
      resource_type,
      content,
      file_path,
      access_level,
      permissions,
      status,
      department,
      priority,
      metadata,
      version,
      expiry_date,
      review_required
    } = body;

    // Validation
    if (!title?.trim()) {
      return createErrorResponse('Resource title is required', 400);
    }

    if (!description?.trim()) {
      return createErrorResponse('Resource description is required', 400);
    }

    const validResourceTypes = ['policy', 'procedure', 'template', 'report', 'guideline', 'training_material', 'system_config'];
    if (resource_type && !validResourceTypes.includes(resource_type)) {
      return createErrorResponse('Invalid resource type', 400);
    }

    const validAccessLevels = ['standard', 'super', 'system', 'all'];
    if (access_level && !validAccessLevels.includes(access_level)) {
      return createErrorResponse('Invalid access level', 400);
    }

    const validStatuses = ['draft', 'active', 'archived', 'under_review', 'expired'];
    if (status && !validStatuses.includes(status)) {
      return createErrorResponse('Invalid status', 400);
    }

    // Standard admins can't create super/system level resources
    if (adminProfile.admin_level === 'standard' && access_level && ['super', 'system'].includes(access_level)) {
      return createErrorResponse('Insufficient privileges to create this access level', 403);
    }

    // Create admin resource
    const { data: newResource, error: createError } = await supabase
      .from('admin_resources')
      .insert({
        title: title.trim(),
        description: description.trim(),
        resource_type: resource_type || 'guideline',
        content: content?.trim() || null,
        file_path: file_path?.trim() || null,
        access_level: access_level || 'standard',
        permissions: permissions || {},
        status: status || 'draft',
        department: department?.trim() || adminProfile.department || null,
        priority: priority || 'medium',
        metadata: metadata || {},
        version: version || '1.0',
        expiry_date: expiry_date ? new Date(expiry_date).toISOString() : null,
        review_required: review_required || false,
        usage_stats: {
          views: 0,
          downloads: 0,
          last_accessed: null,
          access_count: 0
        },
        created_by: user.id
      })
      .select()
      .single();

    if (createError) {
      console.error('Admin resource creation error:', createError);
      return createErrorResponse('Failed to create admin resource', 500);
    }

    // Log admin action
    await supabase
      .from('admin_profiles')
      .update({
        last_admin_action: new Date().toISOString()
      })
      .eq('id', user.id);

    return createSuccessResponse(
      newResource,
      'Admin resource created successfully'
    );

  } catch (error) {
    console.error('POST /api/v1/admin/resources error:', error);
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