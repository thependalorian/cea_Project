import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { createClientForRouteHandler } from '@/lib/supabase/server';

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
    console.log("🔐 API: User login request - UPDATED VERSION", new Date().toISOString());
    
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
    
    // Use the route handler client that can set cookies properly
    const supabase = await createClientForRouteHandler();
    
    // Check if user is already authenticated to prevent session conflicts
    const { data: existingUser } = await supabase.auth.getUser();
    if (existingUser?.user?.email === email) {
      console.log("🔐 API: User already authenticated, refreshing session...");
      
      // User is already logged in, just refresh the session and return user type
      const serviceSupabase = createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      
      let userType = 'job_seeker';
      let redirectUrl = '/job-seekers';
      
      // Get user type for existing session
      try {
        const { data: adminProfile } = await serviceSupabase
          .from('admin_profiles')
          .select('id')
          .eq('user_id', existingUser.user.id)
          .maybeSingle();
        
        if (adminProfile) {
          userType = 'admin';
          redirectUrl = '/admin';
        } else {
          const { data: partnerProfile } = await serviceSupabase
            .from('partner_profiles')
            .select('id')
            .eq('id', existingUser.user.id)
            .maybeSingle();
          
          if (partnerProfile) {
            userType = 'partner';
            redirectUrl = '/partners';
          } else {
            const { data: jobSeekerProfile } = await serviceSupabase
              .from('job_seeker_profiles')
              .select('id')
              .eq('id', existingUser.user.id)  // ✅ FIXED: job_seeker_profiles.id = auth.users.id
              .maybeSingle();
            
            if (jobSeekerProfile) {
              userType = 'job_seeker';
              redirectUrl = '/job-seekers';
            }
          }
        }
      } catch (error) {
        console.log("🔐 API: Error getting user type for existing session:", error);
      }
      
      return NextResponse.json(
        { 
          success: true, 
          message: 'Session refreshed successfully',
          data: {
            user: {
              id: existingUser.user.id,
              email: existingUser.user.email,
              user_metadata: existingUser.user.user_metadata,
            },
            session: {
              access_token: 'existing_session',
              expires_at: null,
            },
            user_type: userType,
            redirect_url: redirectUrl
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
    }
    
    // Sign in the user with new session
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
    console.log("🔐 API: User ID:", data.user.id);
    
    // Get user type by checking profile tables
    // Use service role for profile detection since RLS might block access
    const serviceSupabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    let userType = 'job_seeker';
    let redirectUrl = '/job-seekers';
    
    console.log("🔐 API: Starting user type detection...");
    
    try {
      // Check admin_profiles first (uses user_id)
      console.log("🔐 API: Checking admin_profiles...");
      const { data: adminProfile, error: adminError } = await serviceSupabase
        .from('admin_profiles')
        .select('id')
        .eq('user_id', data.user.id)
        .maybeSingle();
      
      console.log("🔐 API: Admin check result:", { data: adminProfile, error: adminError?.message });
      
      if (adminProfile) {
        console.log("🔐 API: User type detected as admin");
        userType = 'admin';
        redirectUrl = '/admin';
      } else {
        // Check partner_profiles (uses id directly, not user_id)
        console.log("🔐 API: Checking partner_profiles...");
        const { data: partnerProfile, error: partnerError } = await serviceSupabase
          .from('partner_profiles')
          .select('id')
          .eq('id', data.user.id)
          .maybeSingle();
        
        console.log("🔐 API: Partner check result:", { data: partnerProfile, error: partnerError?.message });
        
        if (partnerProfile) {
          console.log("🔐 API: User type detected as partner");
          userType = 'partner';
          redirectUrl = '/partners';
        } else {
          // Check job_seeker_profiles - FIXED: uses id directly, not user_id
          console.log("🔐 API: Checking job_seeker_profiles...");
          const { data: jobSeekerProfile, error: jobSeekerError } = await serviceSupabase
            .from('job_seeker_profiles')
            .select('id')
            .eq('id', data.user.id)  // ✅ FIXED: job_seeker_profiles.id = auth.users.id
            .maybeSingle();
          
          console.log("🔐 API: Job seeker check result:", { data: jobSeekerProfile, error: jobSeekerError?.message });
          
          if (jobSeekerProfile) {
            console.log("🔐 API: User type detected as job_seeker");
            userType = 'job_seeker';
            redirectUrl = '/job-seekers';
          } else {
            console.log("🔐 API: No profile found, defaulting to job_seeker");
          }
        }
      }
    } catch (error) {
      console.log("🔐 API: User type detection error (using default):", error);
      // Keep defaults
    }
    
    console.log("🔐 API: Final user type:", userType);
    console.log("🔐 API: Final redirect URL:", redirectUrl);
    
    // Create response with proper session cookies
    const response = NextResponse.json(
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
          user_type: userType,
          redirect_url: redirectUrl
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
    
    console.log("🔐 API: Session cookies should be set by createClientForRouteHandler");
    
    return response;
    
  } catch (error) {
    console.error("🔐 API: Unexpected error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Server error',
        message: 'An unexpected error occurred' 
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