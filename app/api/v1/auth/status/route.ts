/**
 * Authentication Status API Endpoint
 * 
 * Returns current authentication status and user information
 * 
 * Location: app/api/v1/auth/status/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      return NextResponse.json(
        {
          authenticated: false,
          user: null,
          error: userError.message
        },
        { status: 401 }
      );
    }

    if (!user) {
      return NextResponse.json({
        authenticated: false,
        user: null
      });
    }

    // Get user profile from database
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
    }

    // Get session information
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        email_confirmed_at: user.email_confirmed_at,
        created_at: user.created_at,
        updated_at: user.updated_at,
        user_metadata: user.user_metadata,
        app_metadata: user.app_metadata
      },
      profile: profile || null,
      session: session ? {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at,
        token_type: session.token_type,
        user: session.user
      } : null,
      roles: profile?.user_type ? [profile.user_type] : [],
      permissions: [] // TODO: Implement role-based permissions
    });

  } catch (error) {
    console.error('Auth status check failed:', error);
    
    return NextResponse.json(
      {
        authenticated: false,
        user: null,
        error: 'Authentication status check failed',
        message: error instanceof Error ? error.message : 'Unknown error'
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
} 