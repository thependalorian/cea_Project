import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    // Use admin client to bypass RLS
    const adminClient = createAdminClient();
    
    // Check table schema for resumes
    const { data: tableInfo, error: tableError } = await adminClient.rpc(
      'execute_sql',
      {
        sql_query: `
          -- Get table schema for resumes
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns
          WHERE table_name = 'resumes'
          ORDER BY ordinal_position;
        `
      }
    );
    
    // Check RLS policies for resumes
    const { data: policiesInfo, error: policiesError } = await adminClient.rpc(
      'execute_sql',
      {
        sql_query: `
          -- Get RLS policies for resumes
          SELECT
            policyname,
            permissive,
            cmd,
            qual,
            with_check
          FROM pg_policies
          WHERE tablename = 'resumes';
        `
      }
    );
    
    // Check storage policies
    const { data: storagePolicies, error: storagePoliciesError } = await adminClient.rpc(
      'execute_sql',
      {
        sql_query: `
          -- Get policies for storage.objects
          SELECT
            policyname,
            permissive,
            cmd,
            qual,
            with_check
          FROM pg_policies
          WHERE tablename = 'objects' AND schemaname = 'storage';
        `
      }
    );
    
    // Check if bucket exists
    const { data: buckets, error: bucketsError } = await adminClient
      .from('storage.buckets')
      .select('id, name')
      .eq('name', 'user-documents');
    
    // Create a test row to check if admin bypass works
    const testId = Date.now().toString();
    const { data: testInsert, error: testInsertError } = await adminClient
      .from('resumes')
      .insert({
        user_id: 'test-' + testId,
        file_path: 'test-path',
        file_name: 'test.pdf',
        file_size: 1000,
        file_type: 'application/pdf',
        context: 'test',
      })
      .select()
      .single();
    
    // Clean up the test row
    if (testInsert) {
      await adminClient
        .from('resumes')
        .delete()
        .eq('id', testInsert.id);
    }
    
    return NextResponse.json({
      tableSchema: tableInfo,
      rlsPolicies: policiesInfo,
      storagePolicies: storagePolicies,
      buckets: buckets,
      testInsert: testInsertError ? { error: testInsertError } : { success: true },
      errors: {
        tableError: tableError || null,
        policiesError: policiesError || null,
        storagePoliciesError: storagePoliciesError || null,
        bucketsError: bucketsError || null,
      }
    });
  } catch (error) {
    console.error("Error checking tables:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error },
      { status: 500 }
    );
  }
} 