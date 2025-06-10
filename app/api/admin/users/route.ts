/**
 * Admin Users API - Climate Economy Assistant
 * Admin endpoint for user management operations
 * Location: app/api/admin/users/route.ts
 */

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const role = searchParams.get('role') || 'all';

    const supabase = await createClient();

    // Check authentication and admin access
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify admin access
    const { data: adminProfile } = await supabase
      .from('admin_profiles')
      .select('admin_level')
      .eq('user_id', user.id)
      .single();

    if (!adminProfile || !['super', 'system'].includes(adminProfile.admin_level)) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Build query for users
    let query = supabase
      .from('profiles')
      .select(`
        id,
        email,
        full_name,
        location,
        skills,
        experience_level,
        interests,
        created_at,
        updated_at,
        user_profiles!inner(
          user_type,
          verification_status,
          subscription_tier,
          last_active_at
        )
      `, { count: 'exact' });

    // Apply search filter
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // Apply status filter
    if (status !== 'all') {
      query = query.eq('user_profiles.verification_status', status);
    }

    // Apply role filter
    if (role !== 'all') {
      query = query.eq('user_profiles.user_type', role);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    // Order by creation date
    query = query.order('created_at', { ascending: false });

    const { data: users, error, count } = await query;

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      users: users || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Admin users API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action, data } = body;

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'Missing required parameters: userId and action' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check authentication and admin access
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify admin access
    const { data: adminProfile } = await supabase
      .from('admin_profiles')
      .select('admin_level')
      .eq('user_id', user.id)
      .single();

    if (!adminProfile || !['super', 'system'].includes(adminProfile.admin_level)) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    let result;

    switch (action) {
      case 'update_status':
        result = await supabase
          .from('user_profiles')
          .update({ verification_status: data.status })
          .eq('user_id', userId);
        break;

      case 'update_subscription':
        result = await supabase
          .from('user_profiles')
          .update({ subscription_tier: data.tier })
          .eq('user_id', userId);
        break;

      case 'ban_user':
        result = await supabase
          .from('user_profiles')
          .update({ 
            verification_status: 'banned',
            ban_reason: data.reason,
            banned_at: new Date().toISOString(),
            banned_by: user.id
          })
          .eq('user_id', userId);
        break;

      case 'unban_user':
        result = await supabase
          .from('user_profiles')
          .update({ 
            verification_status: 'verified',
            ban_reason: null,
            banned_at: null,
            banned_by: null
          })
          .eq('user_id', userId);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    if (result.error) {
      console.error('Error updating user:', result.error);
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      );
    }

    // Log admin action
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: `admin_${action}`,
      table_name: 'user_profiles',
      record_id: userId,
      old_values: null,
      new_values: data,
      ip_address: request.headers.get('x-forwarded-for') || 'unknown'
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Admin user update API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 