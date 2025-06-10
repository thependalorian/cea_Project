import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * Resource Views Analytics API v1 - RESTful Analytics Operations
 * 
 * Handles resource view tracking and analytics:
 * - GET /api/v1/analytics/views - Get view analytics (Admin only)
 * - POST /api/v1/analytics/views - Track resource view
 * 
 * Location: /app/api/v1/analytics/views/route.ts
 */

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: Record<string, unknown>;
}

function createErrorResponse(message: string, status: number): NextResponse {
  return NextResponse.json(
    { success: false, error: message } as ApiResponse<null>,
    { status, headers: { 'Content-Type': 'application/json', 'X-API-Version': 'v1' } }
  );
}

function createSuccessResponse<T>(data: T, message?: string, meta?: Record<string, unknown>): NextResponse {
  return NextResponse.json(
    { success: true, data, ...(message && { message }), ...(meta && { meta }) } as ApiResponse<T>,
    { headers: { 'Content-Type': 'application/json', 'X-API-Version': 'v1' } }
  );
}

// Define types for resource views and analytics
interface ResourceView {
  id: string;
  resource_id: string;
  resource_type: string;
  viewed_at: string;
  session_id: string;
  referrer: string;
  user_id: string;
  resource_title?: string;
}

// GET /api/v1/analytics/views - Get view analytics (Admin/Partner analytics)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return createErrorResponse('Authentication required', 401);
    }

    // Check if user is admin or partner
    const { data: adminProfile } = await supabase
      .from('admin_profiles')
      .select('can_view_analytics, can_manage_system')
      .eq('user_id', user.id)
      .single();

    const { data: partnerProfile } = await supabase
      .from('partner_profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!adminProfile && !partnerProfile) {
      return createErrorResponse('Admin or Partner access required', 403);
    }

    // Admin must have analytics permission
    if (adminProfile && !adminProfile.can_view_analytics && !adminProfile.can_manage_system) {
      return createErrorResponse('Analytics viewing permission required', 403);
    }

    const { searchParams } = new URL(request.url);
    
    // Date range filtering
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const last_days = searchParams.get('last_days');
    
    // Resource filtering
    const resource_id = searchParams.get('resource_id');
    const resource_type = searchParams.get('resource_type');
    
    // Aggregation options
    const groupBy = searchParams.get('group_by') || 'day'; // day, hour, week, month

    let query = supabase
      .from('resource_views')
      .select(`
        id,
        resource_id,
        resource_type,
        viewed_at,
        session_id,
        referrer,
        user_id
      `);

    // Apply date filters
    if (last_days) {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(last_days));
      query = query.gte('viewed_at', daysAgo.toISOString());
    } else {
      if (startDate) query = query.gte('viewed_at', startDate);
      if (endDate) query = query.lte('viewed_at', endDate);
    }

    // Apply resource filters
    if (resource_id) query = query.eq('resource_id', resource_id);
    if (resource_type) query = query.eq('resource_type', resource_type);

    // Partners can only see views for their own resources (we'll filter this after getting the data)
    let views: Record<string, unknown>[] = [];
    const { data: viewsData, error } = await query
      .order('viewed_at', { ascending: false })
      .limit(1000); // Reasonable limit for analytics

    if (error) {
      console.error('Database error:', error);
      return createErrorResponse('Failed to fetch view analytics', 500);
    }

    // Get resource titles for knowledge resources
    let processedViews = viewsData;
    if (viewsData && viewsData.length > 0) {
      const knowledgeResourceIds = viewsData
        .filter(v => v.resource_type === 'knowledge_resource')
        .map(v => v.resource_id);

      if (knowledgeResourceIds.length > 0) {
        const { data: knowledgeResources } = await supabase
          .from('knowledge_resources')
          .select('id, title, partner_id')
          .in('id', knowledgeResourceIds);

        // Filter for partner access if needed
        let allowedResourceIds = new Set(knowledgeResourceIds);
        if (partnerProfile && !adminProfile && knowledgeResources) {
          allowedResourceIds = new Set(
            knowledgeResources
              .filter(kr => kr.partner_id === user.id)
              .map(kr => kr.id)
          );
        }

        // Filter views based on partner access
        processedViews = viewsData.filter(view => {
          if (view.resource_type === 'knowledge_resource') {
            return allowedResourceIds.has(view.resource_id);
          }
          return true; // Allow other resource types for now
        });

        // Add title information to views
        const resourceTitleMap = new Map();
        if (knowledgeResources) {
          knowledgeResources.forEach(kr => {
            resourceTitleMap.set(kr.id, kr.title);
          });
        }

        processedViews = processedViews.map(view => ({
          ...view,
          resource_title: resourceTitleMap.get(view.resource_id) || 'Unknown'
        }));
      }
    }

    // Process analytics data
    const analytics = {
      total_views: processedViews.length,
      unique_sessions: new Set(processedViews.map(v => v.session_id)).size,
      unique_resources: new Set(processedViews.map(v => v.resource_id)).size,
      date_range: {
        start: processedViews.length ? processedViews[processedViews.length - 1].viewed_at : null,
        end: processedViews.length ? processedViews[0].viewed_at : null
      },
      top_resources: Object.entries(
        processedViews.reduce((acc: Record<string, { title: string; count: number }>, view: ResourceView) => {
          const title = view.resource_title || 'Unknown';
          acc[view.resource_id] = {
            title,
            count: (acc[view.resource_id]?.count || 0) + 1
          };
          return acc;
        }, {} as Record<string, { title: string; count: number }>)
      )
        .sort(([,a], [,b]) => a.count - b.count)
        .slice(0, 10)
        .map(([id, data]) => ({ resource_id: id, ...data })),
      
      referrer_breakdown: Object.entries(
        processedViews.reduce((acc: Record<string, number>, view: ResourceView) => {
          const referrer = view.referrer || 'Direct';
          acc[referrer] = (acc[referrer] || 0) + 1;
          return acc;
        }, {})
      )
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 10)
        .map(([referrer, count]) => ({ referrer, count })),
    };

    // Group by time period if requested
    if (groupBy !== 'none') {
      const timeGroups: Record<string, number> = processedViews.reduce((acc: Record<string, number>, view: ResourceView) => {
        const date = new Date(view.viewed_at);
        let key: string;
        
        switch (groupBy) {
          case 'hour':
            key = date.toISOString().substring(0, 13) + ':00:00.000Z';
            break;
          case 'day':
            key = date.toISOString().substring(0, 10);
            break;
          case 'week':
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            key = weekStart.toISOString().substring(0, 10);
            break;
          case 'month':
            key = date.toISOString().substring(0, 7);
            break;
          default:
            key = date.toISOString().substring(0, 10);
        }
        
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      (analytics as Record<string, unknown>).timeline = Object.entries(timeGroups)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([period, views]) => ({ period, views }));
    }

    return createSuccessResponse(
      analytics,
      'View analytics retrieved successfully'
    );

  } catch (error) {
    console.error('GET /api/v1/analytics/views error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// POST /api/v1/analytics/views - Track resource view
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get user (optional for view tracking)
    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json();
    const {
      resource_id,
      resource_type,
      session_id,
      referrer
    } = body;

    // Validation
    if (!resource_id || !resource_type) {
      return createErrorResponse('Resource ID and type are required', 400);
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(resource_id)) {
      return createErrorResponse('Invalid resource ID format', 400);
    }

    const validResourceTypes = ['knowledge_resource', 'job_listing', 'education_program', 'partner_resource'];
    if (!validResourceTypes.includes(resource_type)) {
      return createErrorResponse('Invalid resource type', 400);
    }

    // Verify resource exists based on type
    let resourceExists = false;
    switch (resource_type) {
      case 'knowledge_resource':
        const { data: knowledge } = await supabase
          .from('knowledge_resources')
          .select('id')
          .eq('id', resource_id)
          .eq('is_published', true)
          .single();
        resourceExists = !!knowledge;
        break;
      case 'job_listing':
        const { data: job } = await supabase
          .from('job_listings')
          .select('id')
          .eq('id', resource_id)
          .eq('is_active', true)
          .single();
        resourceExists = !!job;
        break;
      case 'education_program':
        const { data: program } = await supabase
          .from('education_programs')
          .select('id')
          .eq('id', resource_id)
          .eq('is_active', true)
          .single();
        resourceExists = !!program;
        break;
      case 'partner_resource':
        const { data: partnerResource } = await supabase
          .from('partner_resources')
          .select('id')
          .eq('id', resource_id)
          .eq('status', 'active')
          .single();
        resourceExists = !!partnerResource;
        break;
    }

    if (!resourceExists) {
      return createErrorResponse('Resource not found or not accessible', 404);
    }

    // Create view record
    const { data: viewRecord, error: createError } = await supabase
      .from('resource_views')
      .insert({
        user_id: user?.id || null,
        resource_id,
        resource_type,
        session_id: session_id || `anon-${Date.now()}`,
        referrer: referrer?.trim() || null,
        viewed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (createError) {
      console.error('View tracking error:', createError);
      return createErrorResponse('Failed to track resource view', 500);
    }

    return createSuccessResponse(
      { view_id: viewRecord.id },
      'Resource view tracked successfully'
    );

  } catch (error) {
    console.error('POST /api/v1/analytics/views error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
} 