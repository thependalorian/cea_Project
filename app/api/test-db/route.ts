import { NextResponse } from 'next/server';
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Test database connection with a table that actually exists
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (error) {
      return NextResponse.json({
        success: false,
        error: "Database connection failed",
        details: error.message
      });
    }

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      data: data
    });
  } catch (error) {
    console.error("Database test error:", error);
    return NextResponse.json({
      success: false,
      error: "Database connection failed",
      details: String(error)
    });
  }
} 