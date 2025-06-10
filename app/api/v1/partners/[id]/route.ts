import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * Individual Partner API v1 - RESTful CRUD Operations
 * 
 * Handles operations on specific partner resources:
 * - GET /api/v1/partners/{id} - Read specific partner
 * - PUT /api/v1/partners/{id} - Update specific partner
 * - DELETE /api/v1/partners/{id} - Delete specific partner (Admin only)
 * 
 * Location: /app/api/v1/partners/[id]/route.ts
 */

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

function createErrorResponse(message: string, status: number, details?: Record<string, unknown>): NextResponse {
  return NextResponse.json(
    { 
      success: false, 
      error: message,
      ...(details && { details })
    } as ApiResponse<null>,
    { 
      status,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Version': 'v1'
      }
    }
  );
}

function createSuccessResponse<T>(data: T, message?: string): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(message && { message })
    } as ApiResponse<T>,
    {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Version': 'v1'
      }
    }
  );
}

// GET /api/v1/partners/{id} - Read specific partner (Idempotent)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const partnerId = params.id;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(partnerId)) {
      return createErrorResponse('Invalid partner ID format', 400);
    }

    // Get partner profile
    const { data: partner, error } = await supabase
      .from('partner_profiles')
      .select(`
        id,
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
        profile_completed,
        created_at,
        updated_at
      `)
      .eq('id', partnerId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return createErrorResponse('Partner not found', 404);
      }
      console.error('Database error:', error);
      return createErrorResponse('Failed to fetch partner', 500);
    }

    return createSuccessResponse(partner, 'Partner retrieved successfully');

  } catch (error) {
    console.error('GET /api/v1/partners/[id] error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// PUT /api/v1/partners/{id} - Update specific partner
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const partnerId = params.id;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(partnerId)) {
      return createErrorResponse('Invalid partner ID format', 400);
    }

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return createErrorResponse('Authentication required', 401);
    }

    // Check if user owns this partner profile or is admin
    const { data: currentProfile } = await supabase
      .from('partner_profiles')
      .select('id')
      .eq('id', partnerId)
      .single();

    if (!currentProfile) {
      return createErrorResponse('Partner not found', 404);
    }

    // Check authorization: user must own the profile or be admin
    const isOwner = user.id === partnerId;
    let isAdmin = false;

    if (!isOwner) {
      const { data: adminProfile } = await supabase
        .from('admin_profiles')
        .select('can_manage_partners, can_manage_system')
        .eq('user_id', user.id)
        .single();
      
      isAdmin = adminProfile && (adminProfile.can_manage_partners || adminProfile.can_manage_system);
    }

    if (!isOwner && !isAdmin) {
      return createErrorResponse('Access denied. You can only update your own profile or be an admin.', 403);
    }

    // Parse and validate request body
    const body = await request.json();
    const {
      organization_name,
      organization_type,
      organization_size,
      website,
      headquarters_location,
      description,
      mission_statement,
      employee_count,
      founded_year,
      partnership_level,
      climate_focus,
      services_offered,
      industries,
      hiring_actively,
      training_programs,
      internship_programs,
      // Digital presence fields
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
      // Resource capability flags
      offers_webinars,
      hosts_events,
      has_resource_library,
      offers_certification,
      has_podcast,
      offers_virtual_tours,
      has_mobile_app,
      offers_mentorship,
      has_job_board,
      offers_funding
    } = body;

    // Validation
    if (organization_name !== undefined && !organization_name?.trim()) {
      return createErrorResponse('Organization name cannot be empty', 400);
    }

    if (organization_type !== undefined && !['employer', 'education', 'community', 'government', 'nonprofit'].includes(organization_type)) {
      return createErrorResponse('Invalid organization type', 400);
    }

    if (organization_size !== undefined && organization_size !== null && !['startup', 'small', 'medium', 'large', 'enterprise'].includes(organization_size)) {
      return createErrorResponse('Invalid organization size', 400);
    }

    if (partnership_level !== undefined && !['standard', 'premium', 'founding'].includes(partnership_level)) {
      return createErrorResponse('Invalid partnership level', 400);
    }

    if (website !== undefined && website && !website.startsWith('http')) {
      return createErrorResponse('Website must be a valid URL starting with http:// or https://', 400);
    }

    if (climate_focus !== undefined && (!Array.isArray(climate_focus) || climate_focus.length === 0)) {
      return createErrorResponse('At least one climate focus area is required', 400);
    }

    // Prepare update data (only include fields that are provided)
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    };

    // Only update fields that are explicitly provided
    if (organization_name !== undefined) updateData.organization_name = organization_name.trim();
    if (organization_type !== undefined) updateData.organization_type = organization_type;
    if (organization_size !== undefined) updateData.organization_size = organization_size;
    if (website !== undefined) updateData.website = website?.trim() || null;
    if (headquarters_location !== undefined) updateData.headquarters_location = headquarters_location?.trim() || null;
    if (description !== undefined) updateData.description = description?.trim() || '';
    if (mission_statement !== undefined) updateData.mission_statement = mission_statement?.trim() || null;
    if (employee_count !== undefined) updateData.employee_count = employee_count;
    if (founded_year !== undefined) updateData.founded_year = founded_year;
    if (partnership_level !== undefined) updateData.partnership_level = partnership_level;
    if (climate_focus !== undefined) updateData.climate_focus = climate_focus;
    if (services_offered !== undefined) updateData.services_offered = services_offered || [];
    if (industries !== undefined) updateData.industries = industries || [];
    if (hiring_actively !== undefined) updateData.hiring_actively = hiring_actively;
    if (training_programs !== undefined) updateData.training_programs = training_programs || [];
    if (internship_programs !== undefined) updateData.internship_programs = internship_programs;

    // Digital presence
    if (linkedin_url !== undefined) updateData.linkedin_url = linkedin_url?.trim() || null;
    if (careers_page_url !== undefined) updateData.careers_page_url = careers_page_url?.trim() || null;
    if (facebook_url !== undefined) updateData.facebook_url = facebook_url?.trim() || null;
    if (instagram_handle !== undefined) updateData.instagram_handle = instagram_handle?.trim() || null;
    if (youtube_url !== undefined) updateData.youtube_url = youtube_url?.trim() || null;
    if (twitter_handle !== undefined) updateData.twitter_handle = twitter_handle?.trim() || null;
    if (blog_url !== undefined) updateData.blog_url = blog_url?.trim() || null;
    if (newsletter_signup_url !== undefined) updateData.newsletter_signup_url = newsletter_signup_url?.trim() || null;
    if (events_calendar_url !== undefined) updateData.events_calendar_url = events_calendar_url?.trim() || null;
    if (student_portal_url !== undefined) updateData.student_portal_url = student_portal_url?.trim() || null;
    if (workforce_portal_url !== undefined) updateData.workforce_portal_url = workforce_portal_url?.trim() || null;
    if (platform_login_url !== undefined) updateData.platform_login_url = platform_login_url?.trim() || null;
    if (podcast_url !== undefined) updateData.podcast_url = podcast_url?.trim() || null;

    // Resource capabilities
    if (offers_webinars !== undefined) updateData.offers_webinars = offers_webinars;
    if (hosts_events !== undefined) updateData.hosts_events = hosts_events;
    if (has_resource_library !== undefined) updateData.has_resource_library = has_resource_library;
    if (offers_certification !== undefined) updateData.offers_certification = offers_certification;
    if (has_podcast !== undefined) updateData.has_podcast = has_podcast;
    if (offers_virtual_tours !== undefined) updateData.offers_virtual_tours = offers_virtual_tours;
    if (has_mobile_app !== undefined) updateData.has_mobile_app = has_mobile_app;
    if (offers_mentorship !== undefined) updateData.offers_mentorship = offers_mentorship;
    if (has_job_board !== undefined) updateData.has_job_board = has_job_board;
    if (offers_funding !== undefined) updateData.offers_funding = offers_funding;

    // Mark profile as completed if major fields are present
    if (organization_name && description && climate_focus) {
      updateData.profile_completed = true;
    }

    // Update partner profile
    const { data: updatedPartner, error: updateError } = await supabase
      .from('partner_profiles')
      .update(updateData)
      .eq('id', partnerId)
      .select()
      .single();

    if (updateError) {
      console.error('Update error:', updateError);
      return createErrorResponse('Failed to update partner profile', 500);
    }

    return createSuccessResponse(
      updatedPartner,
      'Partner profile updated successfully'
    );

  } catch (error) {
    console.error('PUT /api/v1/partners/[id] error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// DELETE /api/v1/partners/{id} - Delete specific partner (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const partnerId = params.id;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(partnerId)) {
      return createErrorResponse('Invalid partner ID format', 400);
    }

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return createErrorResponse('Authentication required', 401);
    }

    // Check if user has partner management privileges
    const { data: adminProfile } = await supabase
      .from('admin_profiles')
      .select('can_manage_partners, can_manage_system')
      .eq('user_id', user.id)
      .single();

    if (!adminProfile || (!adminProfile.can_manage_partners && !adminProfile.can_manage_system)) {
      return createErrorResponse('Partner management access required', 403);
    }

    // Check if partner exists
    const { data: existingPartner } = await supabase
      .from('partner_profiles')
      .select('id, organization_name')
      .eq('id', partnerId)
      .single();

    if (!existingPartner) {
      return createErrorResponse('Partner not found', 404);
    }

    // Delete partner profile (this will cascade delete related resources due to FK constraints)
    const { error: deleteError } = await supabase
      .from('partner_profiles')
      .delete()
      .eq('id', partnerId);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      return createErrorResponse('Failed to delete partner', 500);
    }

    // Also delete the user account
    const { error: userDeleteError } = await supabase.auth.admin.deleteUser(partnerId);
    if (userDeleteError) {
      console.error('User deletion error:', userDeleteError);
      // Don't fail the request if user deletion fails - profile is already deleted
    }

    return createSuccessResponse(
      null,
      `Partner "${existingPartner.organization_name}" deleted successfully`
    );

  } catch (error) {
    console.error('DELETE /api/v1/partners/[id] error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// OPTIONS - CORS preflight support
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
} 