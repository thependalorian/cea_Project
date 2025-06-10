import { getUser } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// Determine if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

// Simple in-memory cache to reduce database calls
const cache = new Map<string, { data: Record<string, unknown>; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 seconds cache

export async function POST(req: NextRequest) {
  try {
    const { user_id } = await req.json();
    
    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Check cache first to reduce database calls
    const cacheKey = `resume_check_${user_id}`;
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`📁 API: Returning cached resume status for user: ${user_id}`);
      return NextResponse.json(cached.data);
    }
    
    console.log(`📁 API: check-user-resume called (v1 schema) for user: ${user_id}`)
    
    // Get current authenticated user using the new helper
    const { user: currentUser, error: authError } = await getUser();
    
    if (authError) {
      console.error("📁 API: Authentication error:", authError);
      if (!isDevelopment) {
        return NextResponse.json(
          { error: 'Authentication error' },
          { status: 401 }
        );
      }
    }
    
    if (!currentUser) {
      if (isDevelopment) {
        console.log("📁 API: No authenticated user - continuing for debugging (development mode)");
      } else {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
    } else {
      console.log(`📁 API: ✅ Authenticated user found: ${currentUser.email} (${currentUser.id})`);
    }
    
    // Check if the requesting user matches the profile user (with dev bypass)
    if (currentUser && currentUser.id !== user_id) {
      if (isDevelopment) {
        console.log("📁 API: User ID mismatch - continuing for debugging (development mode)");
        console.log(`📁 API: Authenticated user: ${currentUser.id}, Requested user: ${user_id}`);
      } else {
        return NextResponse.json(
          { error: 'Unauthorized access to user data' },
          { status: 403 }
        );
      }
    }
    
    // V1 schema - resume functionality not implemented yet
    console.log("📁 API: V1 schema - resume functionality not implemented yet");
    
    const responseData = {
      has_resume: false,
      has_social_data: false,
      social_links: {},
      message: "Resume functionality not available in v1 schema",
      schema_version: "v1",
      user_id: user_id,
      authenticated_user: currentUser?.id || null,
      cached: false
    };
    
    // Cache the response
    cache.set(cacheKey, {
      data: responseData,
      timestamp: Date.now()
    });
    
    // Clean old cache entries periodically
    if (Math.random() < 0.1) { // 10% chance to clean cache
      const now = Date.now();
      for (const [key, value] of cache.entries()) {
        if (now - value.timestamp > CACHE_DURATION) {
          cache.delete(key);
        }
      }
    }
    
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error("📁 API: Error in check-user-resume:", error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: 'An unexpected error occurred',
        schema_version: "v1"
      },
      { status: 500 }
    );
  }
} 