import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * Auth Logout API Endpoint
 * 
 * Handles user logout by clearing Supabase session
 * Returns proper JSON responses for API consumption
 * 
 * Location: /app/api/auth/logout/route.ts
 */

export async function POST() {
  try {
    const supabase = await createClient();

    // Check if a user's logged in
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError) {
      console.error('Error getting user:', userError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to verify user session',
          message: userError.message
        },
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'X-API-Version': 'v1'
          }
        }
      );
    }

    let logoutResult = null;

    if (user) {
      const { error: signOutError } = await supabase.auth.signOut();
      
      if (signOutError) {
        console.error('Error signing out:', signOutError);
        return NextResponse.json(
          {
            success: false,
            error: 'Failed to sign out user',
            message: signOutError.message
          },
          { 
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              'X-API-Version': 'v1'
            }
          }
        );
      }
      
      logoutResult = {
        user_id: user.id,
        email: user.email,
        signed_out_at: new Date().toISOString()
      };
    }

    // Return JSON response instead of redirect for API testing
    return NextResponse.json(
      {
        success: true,
        message: user ? 'User logged out successfully' : 'No active session found',
        data: logoutResult
      },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-API-Version': 'v1'
        }
      }
    );

  } catch (error) {
    console.error('POST /api/auth/logout error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error during logout',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'X-API-Version': 'v1'
        }
      }
    );
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Content-Type': 'application/json',
        'X-API-Version': 'v1'
      }
    }
  );
} 