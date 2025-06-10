/**
 * User Data Export API Route - Climate Economy Assistant
 * 
 * Purpose: Provides secure user data export functionality for GDPR compliance
 * Location: /app/api/v1/user/export/route.ts
 * 
 * Follows rule 4: Vercel-compatible endpoint design
 * Follows rule 10: Comprehensive error handling and logging
 * Follows rule 16: Protected endpoints with authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Create authenticated Supabase client
    const supabase = createRouteHandlerClient({ cookies });
    
    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' }, 
        { status: 401 }
      );
    }

    // Fetch user profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return NextResponse.json(
        { error: 'Failed to fetch user profile' }, 
        { status: 500 }
      );
    }

    // Prepare exportable user data
    const exportData = {
      user_info: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
      },
      profile: profile,
      export_timestamp: new Date().toISOString(),
      format_version: '1.0'
    };

    // Return user data as JSON
    return NextResponse.json({
      success: true,
      data: exportData,
      message: 'User data exported successfully'
    });

  } catch (error) {
    console.error('User export error:', error);
    return NextResponse.json(
      { error: 'Internal server error during data export' }, 
      { status: 500 }
    );
  }
}

export async function POST() {
  // POST method not allowed for this endpoint
  return NextResponse.json(
    { error: 'Method not allowed - Use GET for data export' }, 
    { status: 405 }
  );
} 