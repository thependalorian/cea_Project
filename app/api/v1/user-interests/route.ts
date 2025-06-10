import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * User Interests API v1 - RESTful CRUD Operations
 * 
 * Handles user personalization and interests:
 * - GET /api/v1/user-interests - Get user's interests
 * - POST /api/v1/user-interests - Create/Update user interests
 * - DELETE /api/v1/user-interests - Delete user interests
 * 
 * Location: /app/api/v1/user-interests/route.ts
 */

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

function createErrorResponse(message: string, status: number): NextResponse {
  return NextResponse.json(
    { success: false, error: message } as ApiResponse<null>,
    { status, headers: { 'Content-Type': 'application/json', 'X-API-Version': 'v1' } }
  );
}

function createSuccessResponse<T>(data: T, message?: string): NextResponse {
  return NextResponse.json(
    { success: true, data, ...(message && { message }) } as ApiResponse<T>,
    { headers: { 'Content-Type': 'application/json', 'X-API-Version': 'v1' } }
  );
}

// GET /api/v1/user-interests - Get user's interests
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return createErrorResponse('Authentication required', 401);
    }

    const { data: interests, error } = await supabase
      .from('user_interests')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Database error:', error);
      return createErrorResponse('Failed to fetch user interests', 500);
    }

    // Return empty interests if none exist yet
    if (!interests) {
      return createSuccessResponse({
        user_id: user.id,
        climate_focus: [],
        career_stage: null,
        target_roles: [],
        preferred_location: null,
        employment_preferences: {},
        skills_to_develop: [],
        created_at: null,
        updated_at: null
      }, 'No interests found - defaults returned');
    }

    return createSuccessResponse(interests, 'User interests retrieved successfully');

  } catch (error) {
    console.error('GET /api/v1/user-interests error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// POST /api/v1/user-interests - Create/Update user interests
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return createErrorResponse('Authentication required', 401);
    }

    const body = await request.json();
    const {
      climate_focus,
      career_stage,
      target_roles,
      preferred_location,
      employment_preferences,
      skills_to_develop
    } = body;

    // Validation
    const validCareerStages = ['student', 'entry_level', 'mid_career', 'senior_level', 'executive', 'career_transition', 'retired'];
    if (career_stage && !validCareerStages.includes(career_stage)) {
      return createErrorResponse('Invalid career stage', 400);
    }

    const interestsData = {
      user_id: user.id,
      climate_focus: climate_focus || [],
      career_stage: career_stage || null,
      target_roles: target_roles || [],
      preferred_location: preferred_location?.trim() || null,
      employment_preferences: employment_preferences || {},
      skills_to_develop: skills_to_develop || [],
      updated_at: new Date().toISOString()
    };

    // Use upsert to handle both create and update
    const { data: result, error } = await supabase
      .from('user_interests')
      .upsert(interestsData, { 
        onConflict: 'user_id',
        ignoreDuplicates: false 
      })
      .select()
      .single();

    if (error) {
      console.error('User interests upsert error:', error);
      return createErrorResponse('Failed to save user interests', 500);
    }

    return createSuccessResponse(
      result,
      'User interests saved successfully'
    );

  } catch (error) {
    console.error('POST /api/v1/user-interests error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// DELETE /api/v1/user-interests - Delete user interests
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return createErrorResponse('Authentication required', 401);
    }

    const { error: deleteError } = await supabase
      .from('user_interests')
      .delete()
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      return createErrorResponse('Failed to delete user interests', 500);
    }

    return createSuccessResponse(
      null,
      'User interests deleted successfully'
    );

  } catch (error) {
    console.error('DELETE /api/v1/user-interests error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
} 