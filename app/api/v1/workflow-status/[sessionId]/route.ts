/**
 * Workflow Status API v1 - Climate Economy Assistant
 * Retrieves the current status of workflow sessions
 * Location: app/api/v1/workflow-status/[sessionId]/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Python backend URL
const BACKEND_URL = process.env.PYTHON_BACKEND_URL || 'http://localhost:8000';

interface RouteParams {
  params: {
    sessionId: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Verify authentication
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { sessionId } = params;

    // Validate session ID
    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json(
        { error: 'Valid session ID is required' },
        { status: 400 }
      );
    }

    // Verify session ownership or admin access
    const { data: session, error: sessionError } = await supabase
      .from('workflow_sessions')
      .select('user_id, workflow_type, status, created_at, updated_at, data')
      .eq('session_id', sessionId)
      .single();

    if (sessionError) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    if (session.user_id !== user.id) {
      // Check if user has admin permissions
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (!profile || profile.role !== 'admin') {
        return NextResponse.json(
          { error: 'Forbidden: Can only view your own workflow sessions' },
          { status: 403 }
        );
      }
    }

    try {
      // Set timeout for backend request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10-second timeout

      // Get workflow status from Python backend
      const backendResponse = await fetch(`${BACKEND_URL}/api/v1/workflow-status/${sessionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      let backendStatus = null;
      if (backendResponse.ok) {
        backendStatus = await backendResponse.json();
      } else {
        console.warn(`Backend workflow status unavailable for session ${sessionId}`);
      }

      // Combine database session info with backend status
      const combinedStatus = {
        session_id: sessionId,
        user_id: session.user_id,
        workflow_type: session.workflow_type,
        database_status: session.status,
        database_updated_at: session.updated_at,
        created_at: session.created_at,
        backend_status: backendStatus,
        is_active: session.status === 'active' || session.status === 'running',
        last_activity: session.updated_at,
        data_summary: {
          has_data: !!session.data,
          data_size: session.data ? JSON.stringify(session.data).length : 0
        }
      };

      return NextResponse.json(combinedStatus);

    } catch (fetchError) {
      console.error('Workflow status fetch error:', fetchError);
      
      // Return database info even if backend is unavailable
      const fallbackStatus = {
        session_id: sessionId,
        user_id: session.user_id,
        workflow_type: session.workflow_type,
        database_status: session.status,
        database_updated_at: session.updated_at,
        created_at: session.created_at,
        backend_status: null,
        backend_error: fetchError instanceof Error && fetchError.name === 'AbortError' 
          ? 'Backend timeout' 
          : 'Backend unavailable',
        is_active: session.status === 'active' || session.status === 'running',
        last_activity: session.updated_at,
        data_summary: {
          has_data: !!session.data,
          data_size: session.data ? JSON.stringify(session.data).length : 0
        }
      };

      return NextResponse.json(fallbackStatus);
    }
  } catch (error) {
    console.error('Error in workflow status API:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve workflow status' },
      { status: 500 }
    );
  }
} 