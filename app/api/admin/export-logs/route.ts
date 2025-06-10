/**
 * Export Logs API - Climate Economy Assistant
 * Admin endpoint for exporting audit logs in various formats
 * Location: app/api/admin/export-logs/route.ts
 */

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filters, format = 'csv' } = body;

    const supabase = await createClient();

    // Check authentication and admin access
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify admin access
    const { data: adminProfile } = await supabase
      .from('admin_profiles')
      .select('admin_level')
      .eq('user_id', user.id)
      .single();

    if (!adminProfile || !['super', 'system'].includes(adminProfile.admin_level)) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Build query with filters
    let query = supabase
      .from('audit_logs')
      .select(`
        id,
        user_id,
        action,
        table_name,
        record_id,
        old_values,
        new_values,
        ip_address,
        user_agent,
        created_at,
        profiles(full_name, email),
        admin_profiles(admin_level)
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters?.search) {
      query = query.or(`action.ilike.%${filters.search}%,table_name.ilike.%${filters.search}%`);
    }

    if (filters?.action && filters.action !== 'all') {
      query = query.ilike('action', `%${filters.action}%`);
    }

    if (filters?.date && filters.date !== 'all') {
      const now = new Date();
      let startDate: Date;

      switch (filters.date) {
        case '1h':
          startDate = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case '24h':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      }

      query = query.gte('created_at', startDate.toISOString());
    }

    // Limit to prevent excessive exports
    query = query.limit(10000);

    const { data: logs, error } = await query;

    if (error) {
      console.error('Error fetching logs for export:', error);
      return NextResponse.json(
        { error: 'Failed to fetch logs' },
        { status: 500 }
      );
    }

    // Log the export action
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'export_logs',
      table_name: 'audit_logs',
      record_id: null,
      old_values: null,
      new_values: { 
        format,
        filters,
        recordCount: logs?.length || 0
      },
      ip_address: request.headers.get('x-forwarded-for') || 'unknown'
    });

    // Generate export based on format
    switch (format) {
      case 'csv':
        return generateCSVExport(logs || []);
      
      case 'json':
        return NextResponse.json({
          exportInfo: {
            timestamp: new Date().toISOString(),
            recordCount: logs?.length || 0,
            filters
          },
          data: logs
        });
      
      default:
        return NextResponse.json(
          { error: 'Unsupported export format' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Export logs error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateCSVExport(logs: any[]) {
  const headers = [
    'ID',
    'Timestamp',
    'User Name',
    'User Email',
    'Admin Level',
    'Action',
    'Table',
    'Record ID',
    'IP Address',
    'User Agent',
    'Old Values',
    'New Values'
  ];

  const csvRows = [
    headers.join(','),
    ...logs.map(log => [
      log.id,
      new Date(log.created_at).toISOString(),
      log.profiles?.full_name || 'System',
      log.profiles?.email || 'N/A',
      log.admin_profiles?.admin_level || 'N/A',
      log.action,
      log.table_name || 'N/A',
      log.record_id || 'N/A',
      log.ip_address,
      log.user_agent || 'N/A',
      log.old_values ? JSON.stringify(log.old_values).replace(/"/g, '""') : 'N/A',
      log.new_values ? JSON.stringify(log.new_values).replace(/"/g, '""') : 'N/A'
    ].map(field => `"${field}"`).join(','))
  ];

  const csvContent = csvRows.join('\n');
  const response = new NextResponse(csvContent);
  
  response.headers.set('Content-Type', 'text/csv; charset=utf-8');
  response.headers.set('Content-Disposition', `attachment; filename="audit_logs_${new Date().toISOString().split('T')[0]}.csv"`);
  
  return response;
} 