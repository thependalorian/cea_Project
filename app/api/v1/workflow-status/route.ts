/**
 * Workflow Status API v1 - Base Route
 * 
 * Handles workflow status operations:
 * - GET /api/v1/workflow-status - List user's workflow sessions
 * - POST /api/v1/workflow-status - Create new workflow session
 * 
 * Location: /app/api/v1/workflow-status/route.ts
 */

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: Record<string, unknown>;
}

function createErrorResponse(message: string, status: number, details?: Record<string, unknown>): NextResponse {
  return NextResponse.json(
    { 
      success: false, 
      error: message,
      ...(details && { details })
    } as ApiResponse<null>,
    { 
      status,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Version': 'v1'
      }
    }
  );
}

function createSuccessResponse<T>(data: T, message?: string, meta?: Record<string, unknown>): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(message && { message }),
      ...(meta && { meta })
    } as ApiResponse<T>,
    {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Version': 'v1'
      }
    }
  );
}

// GET /api/v1/workflow-status - List user's workflow sessions
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return createErrorResponse('Authentication required', 401);
    }

    const { searchParams } = new URL(request.url);
    
    // Pagination
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
    const offset = (page - 1) * limit;

    // Filters
    const status = searchParams.get('status');
    const workflow_type = searchParams.get('workflow_type');
    const date_from = searchParams.get('date_from');
    const date_to = searchParams.get('date_to');

    try {
      // Check if workflow_sessions table exists, if not use a mock response
      let query = supabase
        .from('workflow_sessions')
        .select(`
          id, session_id, user_id, workflow_type, status, 
          current_step, total_steps, progress_percentage,
          started_at, updated_at, completed_at, metadata
        `, { count: 'exact' })
        .eq('user_id', user.id);

      // Apply filters
      if (status) query = query.eq('status', status);
      if (workflow_type) query = query.eq('workflow_type', workflow_type);
      if (date_from) query = query.gte('started_at', date_from);
      if (date_to) query = query.lte('started_at', date_to);

      const { data: sessions, error, count } = await query
        .order('started_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      const totalPages = Math.ceil((count || 0) / limit);

      return createSuccessResponse(
        sessions,
        'Workflow sessions retrieved successfully',
        { 
          total: count || 0, 
          limit, 
          offset, 
          page, 
          total_pages: totalPages,
          filters: { status, workflow_type, date_from, date_to }
        }
      );

    } catch (dbError: any) {
      // If table doesn't exist, return mock data structure
      if (dbError?.code === '42P01') {
        const mockSessions = [
          {
            id: 'mock-1',
            session_id: 'session-' + Date.now(),
            user_id: user.id,
            workflow_type: 'career_discovery',
            status: 'in_progress',
            current_step: 2,
            total_steps: 5,
            progress_percentage: 40,
            started_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            completed_at: null,
            metadata: {
              note: 'Mock session - workflow_sessions table not yet implemented'
            }
          }
        ];

        return createSuccessResponse(
          mockSessions,
          'Workflow sessions retrieved (mock data)',
          { 
            total: 1, 
            limit, 
            offset, 
            page, 
            total_pages: 1,
            note: 'Using mock data - database table not yet implemented'
          }
        );
      }
      
      throw dbError;
    }

  } catch (error: any) {
    console.error('GET /api/v1/workflow-status error:', error);
    return createErrorResponse('Failed to retrieve workflow sessions', 500);
  }
}

// POST /api/v1/workflow-status - Create new workflow session
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return createErrorResponse('Authentication required', 401);
    }

    const body = await request.json();
    const {
      workflow_type,
      initial_data = {},
      session_id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    } = body;

    // Validation
    if (!workflow_type) {
      return createErrorResponse('workflow_type is required', 400);
    }

    const validWorkflowTypes = [
      'career_discovery',
      'skill_assessment', 
      'job_matching',
      'resume_analysis',
      'interview_prep',
      'career_transition'
    ];

    if (!validWorkflowTypes.includes(workflow_type)) {
      return createErrorResponse(
        `Invalid workflow_type. Must be one of: ${validWorkflowTypes.join(', ')}`,
        400
      );
    }

    try {
      // Try to create in database
      const sessionData = {
        session_id,
        user_id: user.id,
        workflow_type,
        status: 'started',
        current_step: 1,
        total_steps: getWorkflowSteps(workflow_type),
        progress_percentage: 0,
        started_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
          initial_data,
          created_via: 'api_v1'
        }
      };

      const { data: newSession, error } = await supabase
        .from('workflow_sessions')
        .insert([sessionData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return createSuccessResponse(
        newSession,
        'Workflow session created successfully',
        { session_id: newSession.session_id }
      );

    } catch (dbError: any) {
      // If table doesn't exist, return mock response
      if (dbError?.code === '42P01') {
        const mockSession = {
          id: 'mock-' + Date.now(),
          session_id,
          user_id: user.id,
          workflow_type,
          status: 'started',
          current_step: 1,
          total_steps: getWorkflowSteps(workflow_type),
          progress_percentage: 0,
          started_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          completed_at: null,
          metadata: {
            initial_data,
            created_via: 'api_v1',
            note: 'Mock session - workflow_sessions table not yet implemented'
          }
        };

        return createSuccessResponse(
          mockSession,
          'Workflow session created (mock response)',
          { 
            session_id,
            note: 'Using mock response - database table not yet implemented'
          }
        );
      }
      
      throw dbError;
    }

  } catch (error: any) {
    console.error('POST /api/v1/workflow-status error:', error);
    return createErrorResponse('Failed to create workflow session', 500);
  }
}

// Helper function to get workflow steps
function getWorkflowSteps(workflowType: string): number {
  const stepMap: Record<string, number> = {
    'career_discovery': 5,
    'skill_assessment': 4,
    'job_matching': 6,
    'resume_analysis': 3,
    'interview_prep': 7,
    'career_transition': 8
  };
  
  return stepMap[workflowType] || 5;
}

// OPTIONS - CORS preflight support
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