/**
 * Forgot Password API Endpoint
 * Following rule #4: Vercel-compatible endpoint design
 * Following rule #16: Secure endpoints with proper authentication
 * 
 * Location: /app/api/auth/forgot-password/route.ts
 */

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, redirectTo } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo || `${process.env.NEXT_PUBLIC_SITE_URL}/auth/update-password`,
    });

    if (error) {
      console.error("Password reset error:", error);
      return NextResponse.json(
        { error: "Failed to send reset email" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Password reset email sent successfully" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Forgot password API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 