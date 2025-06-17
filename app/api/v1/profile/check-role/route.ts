import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

/**
 * Check User Role API Endpoint
 * Securely determines user role without exposing database access to frontend
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check admin profile (uses user_id)
    const { data: adminProfile, error: adminError } = await supabase
      .from('admin_profiles')
      .select('id, profile_completed')
      .eq('user_id', user.id)
      .single();

    if (adminProfile && !adminError) {
      return NextResponse.json({
        role: 'admin',
        profile_data: adminProfile,
        user_id: user.id
      });
    }

    // Check partner profile (uses id directly)
    const { data: partnerProfile, error: partnerError } = await supabase
      .from('partner_profiles')
      .select('id, profile_completed')
      .eq('id', user.id)
      .single();

    if (partnerProfile && !partnerError) {
      return NextResponse.json({
        role: 'partner',
        profile_data: partnerProfile,
        user_id: user.id
      });
    }

    // Check job seeker profile (uses user_id)
    const { data: jobSeekerProfile, error: jobSeekerError } = await supabase
      .from('job_seeker_profiles')
      .select('id, profile_completed')
      .eq('user_id', user.id)
      .single();

    if (jobSeekerProfile && !jobSeekerError) {
      return NextResponse.json({
        role: 'job_seeker',
        profile_data: jobSeekerProfile,
        user_id: user.id
      });
    }

    // Check basic profile for fallback user type
    const { data: basicProfile, error: basicProfileError } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single();

    if (basicProfile && !basicProfileError && basicProfile.user_type) {
      return NextResponse.json({
        role: basicProfile.user_type,
        profile_data: basicProfile,
        user_id: user.id
      });
    }

    // Default fallback to job_seeker
    return NextResponse.json({
      role: 'job_seeker',
      profile_data: null,
      user_id: user.id
    });

  } catch (error) {
    console.error('Role check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 