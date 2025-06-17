/**
 * User Registration API Endpoint
 * 
 * Handles user signup with email/password and creates appropriate user profiles
 * Following rule #4: Vercel-compatible endpoint design
 * Following rule #16: Secure endpoints with proper authentication
 * 
 * Location: app/api/auth/signup/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface SignUpRequest {
  email: string;
  password: string;
  user_type: 'job_seeker' | 'partner';
  first_name: string;
  last_name: string;
  organization_name?: string;
  phone?: string;
  location?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SignUpRequest = await request.json();
    const { 
      email, 
      password, 
      user_type, 
      first_name, 
      last_name, 
      organization_name, 
      phone, 
      location 
    } = body;

    // Validation
    if (!email || !password || !user_type || !first_name || !last_name) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields'
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email format'
        },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error: 'Password must be at least 8 characters long'
        },
        { status: 400 }
      );
    }

    // Validate partner requirements
    if (user_type === 'partner' && !organization_name) {
      return NextResponse.json(
        {
          success: false,
          error: 'Organization name is required for partner accounts'
        },
        { status: 400 }
      );
    }

    // Create Supabase client for auth operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
        data: {
          first_name,
          last_name,
          user_type,
          organization_name: organization_name || null,
          phone: phone || null,
          location: location || null,
        }
      }
    });

    if (authError) {
      console.error('Auth signup error:', authError);
      return NextResponse.json(
        {
          success: false,
          error: authError.message || 'Failed to create account'
        },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        {
          success: false,
          error: 'No user data returned from signup'
        },
        { status: 400 }
      );
    }

    // Use service role client for database operations
    const serviceSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    try {
      // Create main profile
      const { error: profileError } = await serviceSupabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: authData.user.email,
          user_type,
          role: user_type === 'partner' ? 'partner' : 'user',
          first_name,
          last_name,
          phone,
          location,
          verified: false,
          profile_completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Don't fail the signup if profile creation fails
      }

      // Create role-specific profile
      if (user_type === 'job_seeker') {
        const { error: jobSeekerError } = await serviceSupabase
          .from('job_seeker_profiles')
          .insert({
            id: authData.user.id,
            user_id: authData.user.id,
            first_name,
            last_name,
            email: authData.user.email,
            phone,
            location,
            profile_completed: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (jobSeekerError) {
          console.error('Job seeker profile creation error:', jobSeekerError);
        }
      } else if (user_type === 'partner') {
        const { error: partnerError } = await serviceSupabase
          .from('partner_profiles')
          .insert({
            id: authData.user.id,
            organization_name: organization_name || '',
            contact_first_name: first_name,
            contact_last_name: last_name,
            contact_email: authData.user.email,
            contact_phone: phone,
            location,
            profile_completed: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (partnerError) {
          console.error('Partner profile creation error:', partnerError);
        }
      }

      // Log successful signup
      await serviceSupabase
        .from('audit_logs')
        .insert({
          user_id: authData.user.id,
          table_name: 'auth',
          action: 'signup',
          details: {
            email: authData.user.email,
            user_type,
            signup_timestamp: new Date().toISOString()
          }
        });

    } catch (dbError) {
      console.error('Database operations error:', dbError);
      // Don't fail the signup if database operations fail
    }

    return NextResponse.json({
      success: true,
      message: 'Account created successfully! Please check your email to verify your account.',
      data: {
        user: {
          id: authData.user.id,
          email: authData.user.email,
          user_type,
          email_confirmed_at: authData.user.email_confirmed_at
        },
        session: authData.session
      }
    });

  } catch (error) {
    console.error('Signup API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred during signup',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 