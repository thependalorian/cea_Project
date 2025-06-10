/**
 * Admin Debug API - Climate Economy Assistant
 * Debug endpoint to check admin profile data
 * Location: app/api/debug/admin/route.ts
 */

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated", authError }, { status: 401 });
    }

    // Get all profile data for the current user
    const [
      { data: adminProfile, error: adminError },
      { data: basicProfile, error: basicProfileError },
      { data: partnerProfile, error: partnerError },
      { data: jobSeekerProfile, error: jobSeekerError }
    ] = await Promise.all([
      supabase
        .from('admin_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single(),
      supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single(),
      supabase
        .from('partner_profiles')
        .select('*')
        .eq('id', user.id)
        .single(),
      supabase
        .from('job_seeker_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
    ]);

    // Check if there are any admin profiles for George Nekwaya specifically
    const { data: allAdminProfiles, error: allAdminError } = await supabase
      .from('admin_profiles')
      .select('*')
      .ilike('email', '%gnekwaya%');

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        user_metadata: user.user_metadata
      },
      profiles: {
        admin: { data: adminProfile, error: adminError },
        basic: { data: basicProfile, error: basicProfileError },
        partner: { data: partnerProfile, error: partnerError },
        jobSeeker: { data: jobSeekerProfile, error: jobSeekerError }
      },
      allAdminProfiles: { data: allAdminProfiles, error: allAdminError },
      debug: {
        timestamp: new Date().toISOString(),
        expectedRedirects: {
          admin: adminProfile?.profile_completed ? "/admin/dashboard" : null,
          partner: partnerProfile?.profile_completed ? "/partners/dashboard" : null,
          jobSeeker: jobSeekerProfile?.profile_completed ? "/job-seekers" : null,
          basic: basicProfile?.role === 'admin' ? "/admin/dashboard" : 
                 basicProfile?.role === 'partner' ? "/partners/dashboard" :
                 basicProfile?.role === 'job_seeker' ? "/job-seekers" : null
        }
      }
    });
  } catch (error) {
    console.error('Debug admin error:', error);
    return NextResponse.json({ 
      error: "Server error", 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
} 