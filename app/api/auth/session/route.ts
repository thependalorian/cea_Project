/**
 * Session Management API Endpoint
 * Following rule #4: Vercel-compatible endpoint design
 * Following rule #16: Secure endpoints with proper authentication
 * 
 * Location: /app/api/auth/session/route.ts
 */

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error("Session error:", error);
      return NextResponse.json(
        { error: "Failed to get session" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { 
        session,
        user: session?.user || null,
        authenticated: !!session
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Session API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 