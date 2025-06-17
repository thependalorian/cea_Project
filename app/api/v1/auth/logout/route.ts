/**
 * Authentication Logout API Endpoint
 * 
 * Handles user logout and session cleanup
 * 
 * Location: app/api/v1/auth/logout/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });

    // Get current user before logout for logging
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    // Sign out the user
    const { error } = await supabase.auth.signOut();

    if (error) {
      return NextResponse.json(
        {
          success: false,
          message: error.message || 'Logout failed'
        },
        { status: 500 }
      );
    }

    // Log successful logout (optional)
    if (user) {
      try {
        await supabase
          .from('audit_logs')
          .insert({
            user_id: user.id,
            table_name: 'auth',
            action: 'logout',
            details: {
              email: user.email,
              logout_timestamp: new Date().toISOString()
            }
          });
      } catch (logError) {
        console.error('Error logging logout:', logError);
        // Don't fail the logout if logging fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'An unexpected error occurred during logout',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
} 