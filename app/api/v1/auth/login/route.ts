/**
 * Authentication Login API Endpoint
 * 
 * Handles user login with email/password and returns role-based redirect URLs
 * 
 * Location: app/api/v1/auth/login/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

interface LoginRequest {
  email: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email and password are required'
        },
        { status: 400 }
      );
    }

    const cookieStore = cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });

    // Attempt to sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        {
          success: false,
          message: error.message || 'Authentication failed'
        },
        { status: 401 }
      );
    }

    if (!data.user) {
      return NextResponse.json(
        {
          success: false,
          message: 'No user returned from authentication'
        },
        { status: 401 }
      );
    }

    // Get user profile to determine role-based redirect
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_type, first_name, last_name')
      .eq('id', data.user.id)
      .single();

    let redirectUrl = '/dashboard';
    
    // Role-based redirect URLs
    if (profile && !profileError) {
      switch (profile.user_type) {
        case 'job_seeker':
          redirectUrl = '/job-seekers';
          break;
        case 'partner':
          redirectUrl = '/partners';
          break;
        case 'admin':
          redirectUrl = '/admin';
          break;
        default:
          redirectUrl = '/dashboard';
      }
    }

    // Log successful login (optional)
    if (profile) {
      await supabase
        .from('audit_logs')
        .insert({
          user_id: data.user.id,
          table_name: 'auth',
          action: 'login',
          details: {
            email: data.user.email,
            user_type: profile.user_type,
            login_timestamp: new Date().toISOString()
          }
        });
    }

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: data.user.id,
          email: data.user.email,
          email_confirmed_at: data.user.email_confirmed_at
        },
        profile: profile || null,
        user_type: profile?.user_type || null,
        redirect_url: redirectUrl,
        session: {
          access_token: data.session?.access_token,
          refresh_token: data.session?.refresh_token,
          expires_at: data.session?.expires_at
        }
      }
    });

  } catch (error) {
    console.error('Login API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'An unexpected error occurred during login',
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