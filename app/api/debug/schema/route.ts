/**
 * Debug Schema API - Check database table structure
 * Location: app/api/debug/schema/route.ts
 */

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user (for security)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const table = searchParams.get('table') || 'resumes';

    // Check table schema using information_schema
    const { data: columns, error: schemaError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', table)
      .eq('table_schema', 'public')
      .order('ordinal_position');

    if (schemaError) {
      console.error('Schema query error:', schemaError);
      
      // Fallback: Try to get a sample record to see what columns exist
      const { data: sampleData, error: sampleError } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (sampleError) {
        return NextResponse.json({
          error: 'Failed to query schema',
          table,
          schema_error: schemaError,
          sample_error: sampleError
        }, { status: 500 });
      }

      // Return column names from sample data
      const columnNames = sampleData && sampleData.length > 0 
        ? Object.keys(sampleData[0])
        : [];

      return NextResponse.json({
        table,
        method: 'sample_data',
        columns: columnNames.map(name => ({ column_name: name, data_type: 'unknown' })),
        sample_count: sampleData?.length || 0
      });
    }

    // Get all related tables
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .like('table_name', '%profile%')
      .or('table_name.like.%resume%');

    return NextResponse.json({
      table,
      columns: columns || [],
      related_tables: tables || [],
      column_count: columns?.length || 0
    });

  } catch (error) {
    console.error('Debug schema error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { action, table = 'resumes' } = body;

    if (action === 'test_insert') {
      // Test what columns can be inserted
      const testData = {
        user_id: user.id,
        file_name: 'test.pdf',
        // Try minimal data first
      };

      const { data, error } = await supabase
        .from(table)
        .insert(testData)
        .select()
        .single();

      if (error) {
        return NextResponse.json({
          action: 'test_insert',
          success: false,
          error: error,
          test_data: testData
        });
      }

      // Clean up test record
      await supabase.from(table).delete().eq('id', data.id);

      return NextResponse.json({
        action: 'test_insert',
        success: true,
        inserted_data: data
      });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });

  } catch (error) {
    console.error('Debug schema POST error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 