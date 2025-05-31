import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    // Use admin client to bypass RLS
    const adminClient = createAdminClient();
    
    // 1. Check if user-documents bucket exists, create if not
    const { data: existingBuckets, error: bucketsError } = await adminClient
      .storage
      .listBuckets();
    
    let bucketExists = false;
    if (existingBuckets) {
      bucketExists = existingBuckets.some(bucket => bucket.name === 'user-documents');
    }
    
    if (!bucketExists) {
      console.log("Creating user-documents bucket");
      const { data: newBucket, error: createError } = await adminClient
        .storage
        .createBucket('user-documents', {
          public: false, // Keep it private to enforce security
          fileSizeLimit: 5242880, // 5MB
        });
      
      if (createError) {
        console.error("Error creating bucket:", createError);
        return NextResponse.json(
          { error: "Failed to create storage bucket", details: createError },
          { status: 500 }
        );
      }
    }
    
    // 2. Set up RLS policies for the resumes table
    const { data: resumesPolicyData, error: resumesPolicyError } = await adminClient.rpc(
      'execute_sql',
      {
        sql_query: `
          -- Enable RLS on the resumes table
          ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
          
          -- Drop existing policies if they exist
          DROP POLICY IF EXISTS "Users can insert their own resumes" ON public.resumes;
          DROP POLICY IF EXISTS "Users can view their own resumes" ON public.resumes;
          DROP POLICY IF EXISTS "Users can update their own resumes" ON public.resumes;
          DROP POLICY IF EXISTS "Users can delete their own resumes" ON public.resumes;
          
          -- Create INSERT policy
          CREATE POLICY "Users can insert their own resumes" 
          ON public.resumes FOR INSERT 
          TO authenticated
          WITH CHECK (auth.uid() = user_id);
          
          -- Create SELECT policy
          CREATE POLICY "Users can view their own resumes" 
          ON public.resumes FOR SELECT 
          TO authenticated
          USING (auth.uid() = user_id);
          
          -- Create UPDATE policy
          CREATE POLICY "Users can update their own resumes" 
          ON public.resumes FOR UPDATE
          TO authenticated
          USING (auth.uid() = user_id) 
          WITH CHECK (auth.uid() = user_id);
          
          -- Create DELETE policy
          CREATE POLICY "Users can delete their own resumes" 
          ON public.resumes FOR DELETE
          TO authenticated
          USING (auth.uid() = user_id);
        `
      }
    );
    
    if (resumesPolicyError) {
      console.error("Error setting up resumes policies:", resumesPolicyError);
      return NextResponse.json(
        { error: "Failed to set up resumes RLS policies", details: resumesPolicyError },
        { status: 500 }
      );
    }
    
    // 3. Set up RLS policies for storage
    const { data: storagePolicyData, error: storagePolicyError } = await adminClient.rpc(
      'execute_sql',
      {
        sql_query: `
          -- Configure storage policies
          -- Drop existing policies if they exist
          DROP POLICY IF EXISTS "User can upload their own resumes" ON storage.objects;
          DROP POLICY IF EXISTS "User can access their own resumes" ON storage.objects;
          
          -- Create upload policy for storage
          CREATE POLICY "User can upload their own resumes"
          ON storage.objects FOR INSERT
          TO authenticated
          WITH CHECK (
            bucket_id = 'user-documents' AND 
            (storage.foldername(name))[1] = auth.uid()::text
          );
          
          -- Create access policy for storage
          CREATE POLICY "User can access their own resumes"
          ON storage.objects FOR SELECT
          TO authenticated
          USING (
            bucket_id = 'user-documents' AND 
            (storage.foldername(name))[1] = auth.uid()::text
          );
          
          -- Create update policy for storage
          CREATE POLICY "User can update their own resumes"
          ON storage.objects FOR UPDATE
          TO authenticated
          USING (
            bucket_id = 'user-documents' AND 
            (storage.foldername(name))[1] = auth.uid()::text
          );
          
          -- Create delete policy for storage
          CREATE POLICY "User can delete their own resumes"
          ON storage.objects FOR DELETE
          TO authenticated
          USING (
            bucket_id = 'user-documents' AND 
            (storage.foldername(name))[1] = auth.uid()::text
          );
        `
      }
    );
    
    if (storagePolicyError) {
      console.error("Error setting up storage policies:", storagePolicyError);
      return NextResponse.json(
        { error: "Failed to set up storage RLS policies", details: storagePolicyError },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: "Storage bucket and RLS policies have been configured",
      bucketCreated: !bucketExists,
      resumePoliciesApplied: true,
      storagePoliciesApplied: true
    });
  } catch (error) {
    console.error("Error setting up storage:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error },
      { status: 500 }
    );
  }
} 