import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Partner Profile API Endpoint
 * 
 * Handles getting and updating partner profiles with climate economy specific fields.
 * Ensures proper authentication, validation, and security.
 * Located: /app/api/partners/profile/route.ts
 */

// GET - Retrieve partner profile
export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" }, 
        { status: 401 }
      );
    }

    // Get user profile with partner data
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select(`
        id,
        email,
        role,
        organization_name,
        organization_type,
        website,
        description,
        partnership_level,
        climate_focus,
        verified,
        contact_info,
        created_at,
        updated_at
      `)
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      return NextResponse.json(
        { error: "Failed to fetch profile" }, 
        { status: 500 }
      );
    }

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" }, 
        { status: 404 }
      );
    }

    // Check if user has partner role
    if (profile.role !== "partner") {
      return NextResponse.json(
        { error: "Access denied - Partner role required" }, 
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: profile
    });

  } catch (error: any) {
    console.error("GET /api/partners/profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}

// PUT - Update partner profile
export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" }, 
        { status: 401 }
      );
    }

    // Verify user has partner role
    const { data: currentProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (currentProfile?.role !== "partner") {
      return NextResponse.json(
        { error: "Access denied - Partner role required" }, 
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      organization_name,
      organization_type,
      website,
      description,
      partnership_level,
      climate_focus,
      contact_info
    } = body;

    // Validation
    if (!organization_name?.trim()) {
      return NextResponse.json(
        { error: "Organization name is required" }, 
        { status: 400 }
      );
    }

    if (!description?.trim()) {
      return NextResponse.json(
        { error: "Description is required" }, 
        { status: 400 }
      );
    }

    if (!Array.isArray(climate_focus) || climate_focus.length === 0) {
      return NextResponse.json(
        { error: "At least one climate focus area is required" }, 
        { status: 400 }
      );
    }

    // Valid organization types
    const validOrgTypes = ["employer", "education", "community", "government", "nonprofit"];
    if (!validOrgTypes.includes(organization_type)) {
      return NextResponse.json(
        { error: "Invalid organization type" }, 
        { status: 400 }
      );
    }

    // Valid partnership levels
    const validPartnershipLevels = ["standard", "premium", "founding"];
    if (!validPartnershipLevels.includes(partnership_level)) {
      return NextResponse.json(
        { error: "Invalid partnership level" }, 
        { status: 400 }
      );
    }

    // Website validation (if provided)
    if (website && !website.startsWith("http")) {
      return NextResponse.json(
        { error: "Website must be a valid URL starting with http:// or https://" }, 
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData = {
      organization_name: organization_name.trim(),
      organization_type,
      website: website?.trim() || null,
      description: description.trim(),
      partnership_level,
      climate_focus,
      contact_info: contact_info || {},
      updated_at: new Date().toISOString()
    };

    // Update profile
    const { data: updatedProfile, error: updateError } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", user.id)
      .select(`
        id,
        email,
        role,
        organization_name,
        organization_type,
        website,
        description,
        partnership_level,
        climate_focus,
        verified,
        contact_info,
        created_at,
        updated_at
      `)
      .single();

    if (updateError) {
      console.error("Error updating profile:", updateError);
      return NextResponse.json(
        { error: "Failed to update profile" }, 
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      data: updatedProfile
    });

  } catch (error: any) {
    console.error("PUT /api/partners/profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
} 