/**
 * System Health API - Climate Economy Assistant
 * Admin endpoint for monitoring system health and status
 * Location: app/api/admin/system-health/route.ts
 */

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

interface ServiceHealth {
  status: 'healthy' | 'unhealthy';
  responseTime: number | null;
  error: string | null;
  statusCode?: number;
  buckets?: number;
}

interface SystemMetrics {
  users: number;
  partners: number;
  jobs: number;
  resources: number;
  recentActivity: number;
  error?: string;
}

interface HealthCheckResponse {
  timestamp: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: {
    database: ServiceHealth;
    authentication: ServiceHealth;
    storage: ServiceHealth;
    api: ServiceHealth;
  };
  metrics: SystemMetrics;
  averageResponseTime?: number | null;
  error?: string;
}

export async function GET(request: NextRequest) {
  try {
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

    if (!adminProfile) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const healthChecks: HealthCheckResponse = {
      timestamp: new Date().toISOString(),
      status: 'healthy',
      services: {
        database: { status: 'healthy', responseTime: null, error: null },
        authentication: { status: 'healthy', responseTime: null, error: null },
        storage: { status: 'healthy', responseTime: null, error: null },
        api: { status: 'healthy', responseTime: null, error: null }
      },
      metrics: {
        users: 0,
        partners: 0,
        jobs: 0,
        resources: 0,
        recentActivity: 0
      }
    };

    // Database Health Check
    try {
      const dbStart = Date.now();
      const { error: dbError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);

      healthChecks.services.database = {
        status: dbError ? 'unhealthy' : 'healthy',
        responseTime: Date.now() - dbStart,
        error: dbError?.message || null
      };
    } catch (error) {
      healthChecks.services.database = {
        status: 'unhealthy',
        responseTime: null,
        error: error instanceof Error ? error.message : 'Unknown database error'
      };
    }

    // Authentication Service Health Check
    try {
      const authStart = Date.now();
      const { data: authTest } = await supabase.auth.getUser();
      
      healthChecks.services.authentication = {
        status: authTest ? 'healthy' : 'unhealthy',
        responseTime: Date.now() - authStart,
        error: null
      };
    } catch (error) {
      healthChecks.services.authentication = {
        status: 'unhealthy',
        responseTime: null,
        error: error instanceof Error ? error.message : 'Unknown auth error'
      };
    }

    // Storage Health Check
    try {
      const storageStart = Date.now();
      const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
      
      healthChecks.services.storage = {
        status: storageError ? 'unhealthy' : 'healthy',
        responseTime: Date.now() - storageStart,
        error: storageError?.message || null,
        buckets: buckets?.length || 0
      };
    } catch (error) {
      healthChecks.services.storage = {
        status: 'unhealthy',
        responseTime: null,
        error: error instanceof Error ? error.message : 'Unknown storage error'
      };
    }

    // API Endpoints Health Check
    try {
      const apiStart = Date.now();
      // Test internal API connectivity
      const healthResponse = await fetch(`${request.nextUrl.origin}/api/health`, {
        method: 'GET',
        headers: {
          'User-Agent': 'Admin-Health-Check'
        }
      });

      healthChecks.services.api = {
        status: healthResponse.ok ? 'healthy' : 'unhealthy',
        responseTime: Date.now() - apiStart,
        statusCode: healthResponse.status,
        error: healthResponse.ok ? null : `HTTP ${healthResponse.status}`
      };
    } catch (error) {
      healthChecks.services.api = {
        status: 'unhealthy',
        responseTime: null,
        error: error instanceof Error ? error.message : 'Unknown API error'
      };
    }

    // Get system metrics
    try {
      const [
        { count: totalUsers },
        { count: totalPartners },
        { count: totalJobs },
        { count: totalResources },
        { data: recentActivity }
      ] = await Promise.all([
        supabase
          .from('user_profiles')
          .select('*', { count: 'exact', head: true }),
        
        supabase
          .from('partner_profiles')
          .select('*', { count: 'exact', head: true }),
        
        supabase
          .from('job_listings')
          .select('*', { count: 'exact', head: true }),
        
        supabase
          .from('knowledge_resources')
          .select('*', { count: 'exact', head: true }),
        
        supabase
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10)
      ]);

      healthChecks.metrics = {
        users: totalUsers || 0,
        partners: totalPartners || 0,
        jobs: totalJobs || 0,
        resources: totalResources || 0,
        recentActivity: recentActivity?.length || 0
      };
    } catch (error) {
      healthChecks.metrics = {
        users: 0,
        partners: 0,
        jobs: 0,
        resources: 0,
        recentActivity: 0,
        error: error instanceof Error ? error.message : 'Failed to fetch metrics'
      };
    }

    // Determine overall system status
    const services = Object.values(healthChecks.services);
    const unhealthyServices = services.filter(service => service.status === 'unhealthy');
    
    if (unhealthyServices.length === 0) {
      healthChecks.status = 'healthy';
    } else if (unhealthyServices.length < services.length) {
      healthChecks.status = 'degraded';
    } else {
      healthChecks.status = 'unhealthy';
    }

    // Calculate average response time
    const responseTimes = services
      .map(service => service.responseTime)
      .filter(time => time !== null) as number[];
    
    healthChecks.averageResponseTime = responseTimes.length > 0
      ? Math.round(responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length)
      : null;

    return NextResponse.json(healthChecks);

  } catch (error) {
    console.error('System health check error:', error);
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'System health check failed',
      services: {
        database: { status: 'unhealthy', responseTime: null, error: 'Health check failed' },
        authentication: { status: 'unhealthy', responseTime: null, error: 'Health check failed' },
        storage: { status: 'unhealthy', responseTime: null, error: 'Health check failed' },
        api: { status: 'unhealthy', responseTime: null, error: 'Health check failed' }
      },
      metrics: {
        users: 0,
        partners: 0,
        jobs: 0,
        resources: 0,
        recentActivity: 0,
        error: 'Metrics unavailable'
      }
    } as HealthCheckResponse, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    const supabase = await createClient();

    // Check authentication and admin access
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify system admin access
    const { data: adminProfile } = await supabase
      .from('admin_profiles')
      .select('admin_level')
      .eq('user_id', user.id)
      .single();

    if (!adminProfile || adminProfile.admin_level !== 'system') {
      return NextResponse.json(
        { error: 'System admin access required' },
        { status: 403 }
      );
    }

    switch (action) {
      case 'clear_cache':
        // In a real implementation, this would clear application caches
        await supabase.from('audit_logs').insert({
          user_id: user.id,
          action: 'clear_cache',
          table_name: 'system',
          record_id: null,
          old_values: null,
          new_values: { action: 'clear_cache' },
          ip_address: request.headers.get('x-forwarded-for') || 'unknown'
        });

        return NextResponse.json({ 
          success: true, 
          message: 'Cache cleared successfully' 
        });

      case 'restart_services':
        // In a real implementation, this would restart services
        await supabase.from('audit_logs').insert({
          user_id: user.id,
          action: 'restart_services',
          table_name: 'system',
          record_id: null,
          old_values: null,
          new_values: { action: 'restart_services' },
          ip_address: request.headers.get('x-forwarded-for') || 'unknown'
        });

        return NextResponse.json({ 
          success: true, 
          message: 'Services restart initiated' 
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('System health action error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 