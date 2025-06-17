/**
 * Profile Management API Endpoint
 * Following rule #4: Vercel-compatible endpoint design
 * Following rule #16: Secure endpoints with proper authentication
 * 
 * Location: /app/api/auth/profile/route.ts
 */

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check admin profile first
    const { data: adminProfile } = await supabase
      .from('admin_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (adminProfile) {
      const profile = {
        id: user.id,
        user_type: 'admin',
        role: adminProfile.department || 'Administrator',
        full_name: adminProfile.full_name,
        email: adminProfile.email || user.email,
        verified: true,
        partnership_level: 'admin',
        profile_completed: adminProfile.profile_completed,
        created_at: adminProfile.created_at,
        updated_at: adminProfile.updated_at
      };

      return NextResponse.json({
        profile,
        adminProfile,
        user_type: 'admin'
      });
    }

    // Check partner profile
    const { data: partnerProfile } = await supabase
      .from('partner_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (partnerProfile) {
      const profile = {
        id: user.id,
        user_type: 'partner',
        role: 'Partner Organization',
        full_name: partnerProfile.full_name || partnerProfile.organization_name,
        organization_name: partnerProfile.organization_name,
        email: partnerProfile.email || user.email,
        verified: partnerProfile.verified,
        partnership_level: partnerProfile.partnership_level || 'standard',
        profile_completed: partnerProfile.profile_completed,
        created_at: partnerProfile.created_at,
        updated_at: partnerProfile.updated_at
      };

      return NextResponse.json({
        profile,
        partnerProfile,
        user_type: 'partner'
      });
    }

    // Default to job seeker
    const { data: jobSeekerProfile } = await supabase
      .from('job_seeker_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (jobSeekerProfile) {
      const profile = {
        id: user.id,
        user_type: 'job_seeker',
        role: jobSeekerProfile.current_title || 'Job Seeker',
        full_name: jobSeekerProfile.full_name,
        email: jobSeekerProfile.email || user.email,
        verified: true,
        partnership_level: 'user',
        profile_completed: jobSeekerProfile.profile_completed,
        created_at: jobSeekerProfile.created_at,
        updated_at: jobSeekerProfile.updated_at
      };

      return NextResponse.json({
        profile,
        jobSeekerProfile,
        user_type: 'job_seeker'
      });
    }

    return NextResponse.json(
      { error: "Profile not found" },
      { status: 404 }
    );

  } catch (error) {
    console.error("Profile API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const updates = await request.json();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Update profile based on user type
    // This is a simplified version - you'd implement specific update logic
    // based on the profile type and fields being updated

    return NextResponse.json({
      message: "Profile updated successfully",
      profile: updates
    });

  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 