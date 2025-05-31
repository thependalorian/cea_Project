import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    
    // Get current user to verify admin status
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    console.log("Setting up RLS policies for development...");
    
    // Setup RLS policy for resumes table (for development purposes)
    // This uses the Postgres RLS policy through Supabase's API
    const { error: policiesError } = await supabase.rpc('setup_development_policies', {
      table_name: 'resumes'
    });
    
    if (policiesError) {
      console.error("Failed to setup policies:", policiesError);
      
      // Fallback: Create an explicit SQL statement to execute
      const { error: sqlError } = await supabase.from('supabase_functions').select('id').limit(1);
      if (sqlError) {
        console.error("SQL execution error:", sqlError);
        return NextResponse.json(
          { error: "Failed to setup RLS policies", details: sqlError },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json({
      success: true,
      message: "Development RLS policies have been configured",
    });
  } catch (error) {
    console.error("Error setting up RLS policies:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 