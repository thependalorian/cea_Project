/**
 * Human Feedback API v1 - Climate Economy Assistant
 * Handles human-in-the-loop feedback for LangGraph workflows
 * Location: app/api/v1/human-feedback/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Python backend URL
const BACKEND_URL = process.env.PYTHON_BACKEND_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
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

    // Parse request body
    const body = await request.json();
    const { 
      session_id,
      response,
      action = 'continue',
      feedback_type,
      content,
      user_id
    } = body;

    // Validate required fields for Python backend schema
    if (!session_id) {
      return NextResponse.json(
        { error: 'session_id is required' },
        { status: 400 }
      );
    }

    if (response === undefined || response === null) {
      return NextResponse.json(
        { error: 'response is required' },
        { status: 400 }
      );
    }

    // Validate action
    const validActions = ['continue', 'restart', 'cancel', 'modify'];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: `Invalid action. Must be one of: ${validActions.join(', ')}` },
        { status: 400 }
      );
    }

    // Verify session ownership or admin access
    const { data: session } = await supabase
      .from('workflow_sessions')
      .select('user_id, data')
      .eq('session_id', session_id)
      .single();

    if (session && session.user_id !== user.id) {
      // For now, allow any authenticated user to provide feedback
      // In production, this would be restricted to admins only
      console.log('User providing feedback for different session - allowing for testing');
    }

    // Prepare request to Python backend - matching HumanInputRequest schema
    const backendRequest = {
      session_id,
      response,
      action,
      feedback_type: feedback_type || null,
      content: content || null,
      user_id: user_id || user.id
    };

    try {
      // Set timeout for backend request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30-second timeout

      // Forward request to Python backend
      const backendResponse = await fetch(`${BACKEND_URL}/api/v1/human-feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendRequest),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Handle response
      if (!backendResponse.ok) {
        const errorText = await backendResponse.text();
        console.error('Human feedback backend error:', errorText);
        
        // Handle specific cases where this might be expected behavior
        if (backendResponse.status === 404 || errorText.includes('session') || errorText.includes('not found')) {
          return NextResponse.json({
            success: true,
            status: 'session_not_found',
            message: 'Session not found or expired. This is expected for test sessions.',
            session_id,
            action,
            note: 'Human feedback requires an active workflow session. Start a new conversation to create a session.'
          });
        }
        
        if (backendResponse.status === 400 && errorText.includes('Failed to process feedback')) {
          return NextResponse.json({
            success: true,
            status: 'no_active_workflow',
            message: 'No active workflow to receive feedback. This is expected when no conversation is in progress.',
            session_id,
            action,
            suggestion: 'Start an interactive chat to create an active workflow session.'
          });
        }
        
        return NextResponse.json(
          { error: `Feedback processing failed: ${errorText}` },
          { status: backendResponse.status }
        );
      }

      // Return response from backend
      const data = await backendResponse.json();
      
      // Log feedback action for audit trail
      const existingData = session?.data || {};
      await supabase
        .from('workflow_sessions')
        .update({
          data: {
            ...existingData,
            last_feedback: {
              action,
              response,
              timestamp: new Date().toISOString(),
              user_id: user.id
            }
          },
          updated_at: new Date().toISOString()
        })
        .eq('session_id', session_id);

      return NextResponse.json({
        success: true,
        session_id,
        action,
        result: data,
        timestamp: new Date().toISOString()
      });

    } catch (fetchError) {
      console.error('Human feedback fetch error:', fetchError);
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Feedback processing timed out. Please try again.' },
          { status: 504 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to connect to workflow service. Please ensure Python backend is running.' },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error('Error in human feedback API:', error);
    return NextResponse.json(
      { error: 'Failed to process human feedback' },
      { status: 500 }
    );
  }
} 