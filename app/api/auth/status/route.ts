import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * Auth Status API Endpoint
 * 
 * Provides authentication status information including:
 * - Current user details
 * - Session information
 * - Cookie status
 * 
 * Location: /app/api/auth/status/route.ts
 */

export async function GET(request: NextRequest) {
  console.log('🔍 AUTH STATUS: Checking authentication status...');
  
  // Check all cookies
  const allCookies = request.cookies.getAll();
  const supabaseCookies = allCookies.filter(c => 
    c.name.includes('supabase') || 
    c.name.includes('auth') ||
    c.name.includes('session')
  );
  
  // Try authentication
  const supabase = await createClient();
  
  try {
    // Test direct user access
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    // Test session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    return NextResponse.json({
      success: true,
      authenticated: !!user,
      user: user ? {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at
      } : null,
      session: session ? {
        expires_at: session.expires_at,
        last_activity: session.user?.last_sign_in_at
      } : null,
      cookies: {
        total: allCookies.length,
        auth_related: supabaseCookies.length,
        details: supabaseCookies.map(c => ({
          name: c.name,
          hasValue: !!c.value
        }))
      },
      errors: {
        user: userError?.message || null,
        session: sessionError?.message || null
      },
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('🔍 AUTH STATUS: Error:', err);
    return NextResponse.json({
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
      cookieCount: allCookies.length,
      supabaseCookieCount: supabaseCookies.length
    }, { status: 500 });
  }
} 