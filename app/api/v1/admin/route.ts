import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * Admin Profiles API v1 - RESTful CRUD Operations
 * 
 * Handles admin profile management:
 * - GET /api/v1/admin - List admin profiles (Super Admin only)
 * - POST /api/v1/admin - Create/Update admin profile
 * 
 * Location: /app/api/v1/admin/route.ts
 */

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: Record<string, unknown>;
}

// Aligned AdminProfile type for DB schema
interface AdminProfile {
  id: string; // uuid, not nullable
  user_id: string; // uuid, not nullable
  full_name: string; // varchar(200), not nullable
  email: string | null; // text, nullable
  phone: string | null; // text, nullable
  department: string | null; // varchar(100), nullable
  permissions: Record<string, unknown>; // jsonb, nullable, default '{}'
  can_manage_users: boolean; // boolean, nullable, default false
  can_manage_partners: boolean; // boolean, nullable, default false
  can_manage_content: boolean; // boolean, nullable, default false
  can_view_analytics: boolean; // boolean, nullable, default false
  can_manage_system: boolean; // boolean, nullable, default false
  admin_notes: string | null; // text, nullable
  direct_phone: string | null; // text, nullable
  emergency_contact: Record<string, unknown>; // jsonb, nullable, default '{}'
  last_admin_action: string | null; // timestamp, nullable
  last_login: string | null; // timestamp, nullable
  profile_completed: boolean; // boolean, nullable, default false
  total_admin_actions: number; // integer, nullable, default 0
  created_at: string; // timestamp, not nullable
  updated_at: string; // timestamp, not nullable
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

// GET /api/v1/admin - List admin profiles (Super Admin only)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return createErrorResponse('Authentication required', 401);
    }

    // Check if user has system management privileges (equivalent to super admin)
    const { data: adminProfile } = await supabase
      .from('admin_profiles')
      .select('can_manage_system, can_manage_users')
      .eq('user_id', user.id)
      .single();

    if (!adminProfile || !adminProfile.can_manage_system) {
      return createErrorResponse('System management access required', 403);
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
    const offset = (page - 1) * limit;

    // Filters
    const department = searchParams.get('department');
    const can_manage_users = searchParams.get('can_manage_users');

    let query = supabase
      .from('admin_profiles')
      .select(`
        id, full_name, email, department, permissions,
        can_manage_users, can_manage_partners, can_manage_content,
        can_view_analytics, can_manage_system, last_admin_action,
        total_admin_actions, created_at, updated_at
      `, { count: 'exact' });

    // Apply filters
    if (department) query = query.eq('department', department);
    if (can_manage_users) query = query.eq('can_manage_users', can_manage_users === 'true');

    // Search across name and email
    const search = searchParams.get('search');
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data: admins, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Database error:', error);
      return createErrorResponse('Failed to fetch admin profiles', 500);
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return createSuccessResponse(
      admins,
      'Admin profiles fetched successfully',
      { total: count || 0, limit, offset, page, total_pages: totalPages }
    );

  } catch (error) {
    console.error('GET /api/v1/admin error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// POST /api/v1/admin - Create/Update admin profile (Self or System Admin)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return createErrorResponse('Authentication required', 401);
    }

    const body = await request.json();
    const {
      full_name,
      email,
      phone,
      department,
      permissions,
      can_manage_users,
      can_manage_partners,
      can_manage_content,
      can_view_analytics,
      can_manage_system,
      admin_notes,
      direct_phone,
      emergency_contact
    } = body;

    // Check if user is admin
    const { data: currentAdminProfile } = await supabase
      .from('admin_profiles')
      .select('can_manage_system, can_manage_users, permissions')
      .eq('user_id', user.id)
      .single();

    if (!currentAdminProfile) {
      return createErrorResponse('Admin access required', 403);
    }

    // For creating new admins or modifying system permissions, require system management access
    const hasSystemAccess = currentAdminProfile.can_manage_system;
    const isModifyingPermissions = (
        can_manage_users !== undefined || can_manage_partners !== undefined ||
        can_manage_content !== undefined || can_view_analytics !== undefined ||
      can_manage_system !== undefined || permissions !== undefined
    );
      
    if (isModifyingPermissions && !hasSystemAccess) {
      return createErrorResponse('System management access required for permission changes', 403);
    }

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('admin_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    const profileData: Partial<AdminProfile> = {
      user_id: user.id,
      full_name: full_name?.trim() || null,
      email: email?.trim() || null,
      phone: phone?.trim() || null,
      department: department?.trim() || null,
      admin_notes: admin_notes?.trim() || null,
      direct_phone: direct_phone?.trim() || null,
      emergency_contact: emergency_contact || {},
      updated_at: new Date().toISOString()
    };

    // Only system admins can modify these fields
    if (hasSystemAccess) {
      if (permissions !== undefined) profileData.permissions = permissions || {};
      if (can_manage_users !== undefined) profileData.can_manage_users = can_manage_users;
      if (can_manage_partners !== undefined) profileData.can_manage_partners = can_manage_partners;
      if (can_manage_content !== undefined) profileData.can_manage_content = can_manage_content;
      if (can_view_analytics !== undefined) profileData.can_view_analytics = can_view_analytics;
      if (can_manage_system !== undefined) profileData.can_manage_system = can_manage_system;
    }

    let result;
    if (existingProfile) {
      // Update existing profile
      const { data: updatedProfile, error: updateError } = await supabase
        .from('admin_profiles')
        .update(profileData)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        console.error('Admin profile update error:', updateError);
        return createErrorResponse('Failed to update admin profile', 500);
      }

      result = updatedProfile;
    } else {
      // Create new profile (system admin only)
      if (!hasSystemAccess) {
        return createErrorResponse('System management access required to create admin profiles', 403);
      }

      const { data: newProfile, error: createError } = await supabase
        .from('admin_profiles')
        .insert({
          ...profileData,
          permissions: permissions || {},
          can_manage_users: can_manage_users || false,
          can_manage_partners: can_manage_partners || false,
          can_manage_content: can_manage_content || false,
          can_view_analytics: can_view_analytics || false,
          can_manage_system: can_manage_system || false
        })
        .select()
        .single();

      if (createError) {
        console.error('Admin profile creation error:', createError);
        return createErrorResponse('Failed to create admin profile', 500);
      }

      result = newProfile;
    }

    return createSuccessResponse(
      result,
      existingProfile ? 'Admin profile updated successfully' : 'Admin profile created successfully'
    );

  } catch (error) {
    console.error('POST /api/v1/admin error:', error);
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