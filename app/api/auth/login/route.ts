import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Auth Login API Endpoint
 * 
 * Handles user login with email/password
 * Returns proper JSON responses for API consumption
 * 
 * Location: /app/api/auth/login/route.ts
 */

interface LoginRequest {
  email: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    console.log("🔐 API: User login request");
    
    const body: LoginRequest = await request.json();
    const { email, password } = body;
    
    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing credentials',
          message: 'Email and password are required' 
        },
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'X-API-Version': 'v1'
          }
        }
      );
    }
    
    const supabase = await createClient();
    
    // Sign in the user
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error("🔐 API: Login failed:", error.message);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Login failed',
          message: error.message 
        },
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'X-API-Version': 'v1'
          }
        }
      );
    }
    
    if (!data.user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Login failed',
          message: 'No user data returned' 
        },
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'X-API-Version': 'v1'
          }
        }
      );
    }
    
    console.log("🔐 API: User logged in successfully:", data.user.email);
    
    // Get user type for redirect
    const { data: userTypeData } = await supabase.rpc('get_user_type_v1', { 
      user_id: data.user.id 
    });
    
    // Return success response with user data
    return NextResponse.json(
      { 
        success: true, 
        message: 'Logged in successfully',
        data: {
          user: {
            id: data.user.id,
            email: data.user.email,
            user_metadata: data.user.user_metadata,
          },
          session: {
            access_token: data.session?.access_token,
            expires_at: data.session?.expires_at,
          },
          user_type: userTypeData || 'job_seeker',
          redirect_url: userTypeData === 'partner' ? '/partner-dashboard' : '/dashboard'
        }
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
    console.error("🔐 API: Login error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: 'An unexpected error occurred during login' 
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