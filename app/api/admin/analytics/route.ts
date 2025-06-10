/**
 * Admin Analytics API - Climate Economy Assistant
 * Admin endpoint for analytics data and metrics
 * Location: app/api/admin/analytics/route.ts
 */

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

interface TimeSeriesData {
  date: string;
  count: number;
}

interface UserAnalytics {
  total: number;
  new: number;
  active: number;
  registrationTrend: TimeSeriesData[];
  error?: string;
}

interface PartnerAnalytics {
  total: number;
  verified: number;
  new: number;
  verificationRate: number;
  error?: string;
}

interface JobAnalytics {
  total: number;
  active: number;
  new: number;
  byType: Record<string, number>;
  error?: string;
}

interface ContentAnalytics {
  total: number;
  published: number;
  new: number;
  publishRate: number;
  byType: Record<string, number>;
  error?: string;
}

interface SystemAnalytics {
  totalActions: number;
  errors: number;
  activityTrend: TimeSeriesData[];
  errorRate: number;
  error?: string;
}

interface AnalyticsResponse {
  period: string;
  startDate: string;
  endDate: string;
  metrics: {
    users?: UserAnalytics;
    partners?: PartnerAnalytics;
    jobs?: JobAnalytics;
    content?: ContentAnalytics;
    system?: SystemAnalytics;
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7d'; // 1d, 7d, 30d, 90d
    const metric = searchParams.get('metric') || 'all';

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
      .select('can_view_analytics, can_manage_system')
      .eq('user_id', user.id)
      .single();

    if (!adminProfile || (!adminProfile.can_view_analytics && !adminProfile.can_manage_system)) {
      return NextResponse.json(
        { error: 'Analytics access required' },
        { status: 403 }
      );
    }

    // Calculate date range based on period
    const now = new Date();
    const periodDays = {
      '1d': 1,
      '7d': 7,
      '30d': 30,
      '90d': 90
    };

    const days = periodDays[period as keyof typeof periodDays] || 7;
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const startDateISO = startDate.toISOString();

    const analytics: AnalyticsResponse = {
      period,
      startDate: startDateISO,
      endDate: now.toISOString(),
      metrics: {}
    };

    // User Analytics
    if (metric === 'all' || metric === 'users') {
      try {
        const [
          { count: totalUsers },
          { count: newUsers },
          { count: activeUsers },
          { data: userRegistrations }
        ] = await Promise.all([
          // Total users
          supabase
            .from('user_profiles')
            .select('*', { count: 'exact', head: true }),
          
          // New users in period
          supabase
            .from('user_profiles')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', startDateISO),
          
          // Active users in period (based on last_active_at)
          supabase
            .from('user_profiles')
            .select('*', { count: 'exact', head: true })
            .gte('last_active_at', startDateISO),
          
          // Daily user registrations
          supabase
            .from('user_profiles')
            .select('created_at')
            .gte('created_at', startDateISO)
            .order('created_at', { ascending: true })
        ]);

        analytics.metrics.users = {
          total: totalUsers || 0,
          new: newUsers || 0,
          active: activeUsers || 0,
          registrationTrend: processTimeSeriesData(userRegistrations || [], 'created_at', days)
        };
      } catch (error) {
        console.error('User analytics error:', error);
        analytics.metrics.users = { 
          total: 0,
          new: 0,
          active: 0,
          registrationTrend: [],
          error: 'Failed to fetch user analytics' 
        };
      }
    }

    // Partner Analytics
    if (metric === 'all' || metric === 'partners') {
      try {
        const [
          { count: totalPartners },
          { count: verifiedPartners },
          { count: newPartners }
        ] = await Promise.all([
          supabase
            .from('partner_profiles')
            .select('*', { count: 'exact', head: true }),
          
          supabase
            .from('partner_profiles')
            .select('*', { count: 'exact', head: true })
            .eq('verified', true),
          
          supabase
            .from('partner_profiles')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', startDateISO)
        ]);

        analytics.metrics.partners = {
          total: totalPartners || 0,
          verified: verifiedPartners || 0,
          new: newPartners || 0,
          verificationRate: totalPartners ? Math.round((verifiedPartners || 0) / totalPartners * 100) : 0
        };
      } catch (error) {
        console.error('Partner analytics error:', error);
        analytics.metrics.partners = { 
          total: 0,
          verified: 0,
          new: 0,
          verificationRate: 0,
          error: 'Failed to fetch partner analytics' 
        };
      }
    }

    // Job Analytics
    if (metric === 'all' || metric === 'jobs') {
      try {
        const [
          { count: totalJobs },
          { count: activeJobs },
          { count: newJobs },
          { data: jobsByType }
        ] = await Promise.all([
          supabase
            .from('job_listings')
            .select('*', { count: 'exact', head: true }),
          
          supabase
            .from('job_listings')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'active'),
          
          supabase
            .from('job_listings')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', startDateISO),
          
          supabase
            .from('job_listings')
            .select('employment_type')
            .gte('created_at', startDateISO)
        ]);

        // Process job types
        const jobTypeCounts = jobsByType?.reduce((acc, job) => {
          const type = job.employment_type || 'unknown';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {};

        analytics.metrics.jobs = {
          total: totalJobs || 0,
          active: activeJobs || 0,
          new: newJobs || 0,
          byType: jobTypeCounts
        };
      } catch (error) {
        console.error('Job analytics error:', error);
        analytics.metrics.jobs = { 
          total: 0,
          active: 0,
          new: 0,
          byType: {},
          error: 'Failed to fetch job analytics' 
        };
      }
    }

    // Content Analytics
    if (metric === 'all' || metric === 'content') {
      try {
        const [
          { count: totalResources },
          { count: publishedResources },
          { count: newResources },
          { data: resourcesByType }
        ] = await Promise.all([
          supabase
            .from('knowledge_resources')
            .select('*', { count: 'exact', head: true }),
          
          supabase
            .from('knowledge_resources')
            .select('*', { count: 'exact', head: true })
            .eq('is_published', true),
          
          supabase
            .from('knowledge_resources')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', startDateISO),
          
          supabase
            .from('knowledge_resources')
            .select('content_type')
            .gte('created_at', startDateISO)
        ]);

        // Process content types
        const contentTypeCounts = resourcesByType?.reduce((acc, resource) => {
          const type = resource.content_type || 'unknown';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {};

        analytics.metrics.content = {
          total: totalResources || 0,
          published: publishedResources || 0,
          new: newResources || 0,
          publishRate: totalResources ? Math.round((publishedResources || 0) / totalResources * 100) : 0,
          byType: contentTypeCounts
        };
      } catch (error) {
        console.error('Content analytics error:', error);
        analytics.metrics.content = { 
          total: 0,
          published: 0,
          new: 0,
          publishRate: 0,
          byType: {},
          error: 'Failed to fetch content analytics' 
        };
      }
    }

    // System Analytics
    if (metric === 'all' || metric === 'system') {
      try {
        const [
          { data: systemLogs },
          { data: errorLogs }
        ] = await Promise.all([
          supabase
            .from('audit_logs')
            .select('action, created_at')
            .gte('created_at', startDateISO)
            .order('created_at', { ascending: true }),
          
          supabase
            .from('audit_logs')
            .select('*')
            .ilike('action', '%error%')
            .gte('created_at', startDateISO)
        ]);

        analytics.metrics.system = {
          totalActions: systemLogs?.length || 0,
          errors: errorLogs?.length || 0,
          activityTrend: processTimeSeriesData(systemLogs || [], 'created_at', days),
          errorRate: systemLogs?.length ? Math.round((errorLogs?.length || 0) / systemLogs.length * 100) : 0
        };
      } catch (error) {
        console.error('System analytics error:', error);
        analytics.metrics.system = { 
          totalActions: 0,
          errors: 0,
          activityTrend: [],
          errorRate: 0,
          error: 'Failed to fetch system analytics' 
        };
      }
    }

    return NextResponse.json(analytics);

  } catch (error) {
    console.error('Admin analytics API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to process time series data
function processTimeSeriesData(data: any[], dateField: string, days: number): TimeSeriesData[] {
  if (!data || data.length === 0) {
    return Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      count: 0
    }));
  }

  // Group data by date
  const dateCounts = data.reduce((acc, item) => {
    const date = new Date(item[dateField]).toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Fill in missing dates with 0 counts
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    return {
      date,
      count: dateCounts[date] || 0
    };
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, filters } = body;

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
      .select('can_view_analytics, can_manage_system')
      .eq('user_id', user.id)
      .single();

    if (!adminProfile || (!adminProfile.can_view_analytics && !adminProfile.can_manage_system)) {
      return NextResponse.json(
        { error: 'Analytics access required' },
        { status: 403 }
      );
    }

    switch (action) {
      case 'export_analytics':
        // Generate analytics export
        const exportData = await generateAnalyticsExport(supabase, filters);
        
        // Log export action
        await supabase.from('audit_logs').insert({
          user_id: user.id,
          action: 'export_analytics',
          table_name: 'analytics',
          record_id: null,
          old_values: null,
          new_values: filters,
          ip_address: request.headers.get('x-forwarded-for') || 'unknown'
        });

        return NextResponse.json(exportData);

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Admin analytics action error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function generateAnalyticsExport(supabase: any, filters: any) {
  // This would generate a comprehensive analytics export
  // For now, return a simple structure
  return {
    exportId: `analytics_${Date.now()}`,
    timestamp: new Date().toISOString(),
    filters,
    status: 'generated',
    downloadUrl: '/api/admin/download-analytics' // This would be implemented separately
  };
} 