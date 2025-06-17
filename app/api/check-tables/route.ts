import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Check for essential tables that actually exist in the database
    const tables = [
      'profiles',
      'resumes', 
      'job_listings',
      'education_programs',
      'partner_profiles',
      'knowledge_resources'
    ];
    
    const tableStatus = await Promise.all(
      tables.map(async (table) => {
        try {
          const { data, error } = await supabase
            .from(table)
            .select('*')
            .limit(1);
          
          return {
            table,
            status: error ? 'error' : 'ok',
            error: error?.message,
            hasData: data && data.length > 0
          };
        } catch (err) {
          return {
            table,
            status: 'error',
            error: String(err),
            hasData: false
          };
        }
      })
    );
    
    const allTablesOk = tableStatus.every(t => t.status === 'ok');
    
    return NextResponse.json({
      status: allTablesOk ? 'ok' : 'issues',
      tables: tableStatus,
      message: allTablesOk ? 'All tables accessible' : 'Some tables have issues'
    });
  } catch (error) {
    console.error("Error checking tables:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 