import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    // Check for essential environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
    
    const missingVars = [];
    
    if (!supabaseUrl) missingVars.push('NEXT_PUBLIC_SUPABASE_URL');
    if (!supabaseAnonKey) missingVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    if (!supabaseServiceKey) missingVars.push('SUPABASE_SERVICE_KEY');
    
    if (missingVars.length > 0) {
      return NextResponse.json({
        status: 'missing',
        missingVars,
        message: 'Missing required environment variables',
        instructions: 'Add these to your .env.local file. For the service key, go to your Supabase dashboard > Project Settings > API > service_role key.'
      });
    }
    
    return NextResponse.json({
      status: 'ok',
      message: 'All required environment variables are set',
      vars: {
        supabaseUrl: supabaseUrl ? '✓ Set' : '✗ Missing',
        supabaseAnonKey: supabaseAnonKey ? '✓ Set' : '✗ Missing',
        supabaseServiceKey: supabaseServiceKey ? '✓ Set' : '✗ Missing',
      }
    });
  } catch (error) {
    console.error("Error checking environment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 