import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * DEPRECATED: Partner Profile API (Legacy)
 * 
 * ⚠️  DEPRECATION NOTICE ⚠️
 * This endpoint is deprecated and will be removed in 6 months.
 * Please migrate to the new v1 API:
 * 
 * GET/PUT /api/v1/partners/{id} - Individual partner operations
 * GET /api/v1/partners - List all partners with filtering
 * 
 * The new API follows REST best practices with proper versioning,
 * pagination, error handling, rate limiting, and CORS support.
 * 
 * Location: /app/api/partners/profile/route.ts
 */

function createDeprecationResponse(data: Record<string, unknown>, method: string): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
      deprecation_warning: {
        message: "This endpoint is deprecated and will be removed in 6 months",
        migrate_to: method === 'GET' 
          ? "/api/v1/partners/{id} for individual partner data or /api/v1/partners for partner listings"
          : "/api/v1/partners/{id}",
        documentation: "/API_V1_DOCUMENTATION.md",
        benefits: [
          "Proper REST conventions",
          "Enhanced error handling", 
          "Rate limiting protection",
          "Better pagination",
          "CORS support",
          "Comprehensive filtering"
        ]
      }
    },
    {
      headers: {
        'X-Deprecation-Warning': 'true',
        'X-Deprecation-Date': '2025-07-15',
        'X-Migration-Guide': '/API_V1_DOCUMENTATION.md',
        'Sunset': 'Tue, 15 Jul 2025 00:00:00 GMT'
      }
    }
  );
}

function createDeprecationErrorResponse(message: string, status: number): NextResponse {
  return NextResponse.json(
    { 
      success: false, 
      error: message,
      deprecation_warning: {
        message: "This endpoint is deprecated and will be removed in 6 months",
        migrate_to: "/api/v1/partners/{id}",
        documentation: "/API_V1_DOCUMENTATION.md"
      }
    },
    { 
      status,
      headers: {
        'X-Deprecation-Warning': 'true',
        'X-Deprecation-Date': '2025-07-15',
        'X-Migration-Guide': '/API_V1_DOCUMENTATION.md',
        'Sunset': 'Tue, 15 Jul 2025 00:00:00 GMT'
      }
    }
  );
}

// GET - Retrieve partner profile (DEPRECATED)
export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return createDeprecationErrorResponse("Unauthorized", 401);
    }

    // Get partner profile data from new partner_profiles table
    const { data: profile, error: profileError } = await supabase
      .from("partner_profiles")
      .select(`
        id,
        full_name,
        email,
        phone,
        organization_name,
        organization_type,
        organization_size,
        website,
        headquarters_location,
        partnership_level,
        partnership_start_date,
        verified,
        verification_date,
        climate_focus,
        services_offered,
        industries,
        description,
        mission_statement,
        employee_count,
        founded_year,
        hiring_actively,
        training_programs,
        internship_programs,
        linkedin_url,
        careers_page_url,
        facebook_url,
        instagram_handle,
        youtube_url,
        twitter_handle,
        blog_url,
        newsletter_signup_url,
        events_calendar_url,
        student_portal_url,
        workforce_portal_url,
        platform_login_url,
        podcast_url,
        offers_webinars,
        hosts_events,
        has_resource_library,
        offers_certification,
        has_podcast,
        offers_virtual_tours,
        has_mobile_app,
        offers_mentorship,
        has_job_board,
        offers_funding,
        contact_info,
        profile_completed,
        last_login,
        created_at,
        updated_at
      `)
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Error fetching partner profile:", profileError);
      return createDeprecationErrorResponse("Failed to fetch partner profile", 500);
    }

    if (!profile) {
      return createDeprecationErrorResponse("Partner profile not found", 404);
    }

    return createDeprecationResponse(profile, 'GET');

  } catch (error: unknown) {
    console.error("GET /api/partners/profile error:", error);
    return createDeprecationErrorResponse("Internal server error", 500);
  }
}

// PUT - Update partner profile (DEPRECATED)
export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return createDeprecationErrorResponse("Unauthorized", 401);
    }

    // Verify user has partner profile (exists in partner_profiles table)
    const { data: currentProfile } = await supabase
      .from("partner_profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    if (!currentProfile) {
      return createDeprecationErrorResponse("Access denied - Partner profile required", 403);
    }

    // Parse request body
    const body = await request.json();
    
    // For backward compatibility, accept the old format but recommend new API
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    };

    // Map old field names to new ones and handle the update
    Object.keys(body).forEach(key => {
      if (body[key] !== undefined) {
        updateData[key] = body[key];
      }
    });

    // Ensure profile completion check
    if (updateData.organization_name && updateData.description && updateData.climate_focus) {
      updateData.profile_completed = true;
    }

    // Update partner profile
    const { data: updatedProfile, error: updateError } = await supabase
      .from("partner_profiles")
      .update(updateData)
      .eq("id", user.id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating partner profile:", updateError);
      return createDeprecationErrorResponse("Failed to update partner profile", 500);
    }

    return createDeprecationResponse(updatedProfile, 'PUT');

  } catch (error: unknown) {
    console.error("PUT /api/partners/profile error:", error);
    return createDeprecationErrorResponse("Internal server error", 500);
  }
} 