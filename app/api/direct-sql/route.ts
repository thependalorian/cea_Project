import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    // For development purposes only - this is not secure for production
    // First, check the RLS policies on the resumes table
    const { data: rlsInfo, error: rlsError } = await supabase
      .from('resumes')
      .select('*')
      .limit(1);
    
    console.log("RLS test result:", rlsInfo, rlsError);
    
    // Set up RLS policies that allow users to manage only their own data
    const { data: policyData, error: policyError } = await supabase.rpc(
      'execute_sql',
      {
        sql_query: `
          BEGIN;
          -- Enable RLS on the resumes table
          ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
          
          -- Drop existing policies if they exist
          DROP POLICY IF EXISTS "Users can insert their own resumes" ON public.resumes;
          DROP POLICY IF EXISTS "Users can view their own resumes" ON public.resumes;
          DROP POLICY IF EXISTS "Users can update their own resumes" ON public.resumes;
          DROP POLICY IF EXISTS "Users can delete their own resumes" ON public.resumes;
          
          -- Create granular policies for different operations
          -- Allow users to INSERT their own resumes
          CREATE POLICY "Users can insert their own resumes" 
          ON public.resumes FOR INSERT 
          WITH CHECK (auth.uid() = user_id);
          
          -- Allow users to SELECT only their own resumes
          CREATE POLICY "Users can view their own resumes" 
          ON public.resumes FOR SELECT 
          USING (auth.uid() = user_id);
          
          -- Allow users to UPDATE only their own resumes
          CREATE POLICY "Users can update their own resumes" 
          ON public.resumes FOR UPDATE
          USING (auth.uid() = user_id) 
          WITH CHECK (auth.uid() = user_id);
          
          -- Allow users to DELETE only their own resumes
          CREATE POLICY "Users can delete their own resumes" 
          ON public.resumes FOR DELETE
          USING (auth.uid() = user_id);
          
          -- Storage bucket policies (set these up in Supabase dashboard as well)
          -- This part may vary depending on your storage setup
          BEGIN;
            DROP POLICY IF EXISTS "User can upload their own resumes" ON storage.objects;
            DROP POLICY IF EXISTS "User can access their own resumes" ON storage.objects;
            
            CREATE POLICY "User can upload their own resumes"
            ON storage.objects FOR INSERT
            WITH CHECK (bucket_id = 'user-documents' AND (storage.foldername(name))[1] = auth.uid()::text);
            
            CREATE POLICY "User can access their own resumes"
            ON storage.objects FOR SELECT
            USING (bucket_id = 'user-documents' AND (storage.foldername(name))[1] = auth.uid()::text);
          EXCEPTION
            WHEN OTHERS THEN NULL;
          END;
          
          COMMIT;
        `
      }
    );
    
    if (policyError) {
      console.error("Policy setup error:", policyError);
      return NextResponse.json(
        { error: "Failed to setup RLS policies", details: policyError },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: "RLS policies have been configured properly",
      userId: user.id
    });
  } catch (error) {
    console.error("Error in direct SQL:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 