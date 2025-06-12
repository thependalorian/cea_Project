/**
 * Supervisor Chat API - Climate Economy Assistant
 * Enhanced for LangGraph 2025 execution patterns with full streaming support
 * Location: app/api/v1/supervisor-chat/route.ts
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
        { error: 'Unauthorized - Please log in to continue' },
        { status: 401 }
      );
    }

    // Parse request body with LangGraph 2025 input format support
    const body = await request.json();
    const { 
      message, 
      conversation_id,
      context = {},
      metadata = {},
      stream = false,
      user_journey_stage = "discovery",
      user_preferences = {},
      pathway_options = null,
      goals_validated = false,
      pathway_chosen = false,
      action_plan_approved = false
    } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Prepare enhanced request with LangGraph 2025 user steering support
    const backendRequest = {
      message: message,
      user_id: user.id,
      conversation_id: conversation_id || `conv_${Date.now()}_${user.id.slice(0, 8)}`,
      stream: stream, // LangGraph 2025 streaming flag
      context: {
        ...context,
        journey_stage: user_journey_stage,
        user_preferences: user_preferences,
        pathway_options: pathway_options,
        goals_validated: goals_validated,
        pathway_chosen: pathway_chosen,
        plan_approved: action_plan_approved,
        control_level: context.control_level || "collaborative"
      },
      metadata: {
        ...metadata,
        user: {
          id: user.id,
          email: user.email
        },
        frontend_source: 'supervisor_chat',
        langgraph_2025: true,
        user_steering_enabled: true,
        timestamp: new Date().toISOString()
      }
    };

    try {
      // Set timeout for backend request (longer for streaming)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), stream ? 120000 : 45000);

      // Forward request to Python backend supervisor workflow
      const backendResponse = await fetch(`${BACKEND_URL}/api/v1/supervisor-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendRequest),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Handle streaming response if requested
      if (stream && backendResponse.ok) {
        // Return streamed response directly with enhanced headers
        const { readable, writable } = new TransformStream();
        const writer = writable.getWriter();
        const encoder = new TextEncoder();
        
        // Process stream from Python backend
        const reader = backendResponse.body?.getReader();
        if (!reader) {
          throw new Error('Failed to get reader from backend response');
        }

        // Enhanced stream processing for LangGraph 2025
        (async () => {
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              
              // Process streaming chunks for user steering events
              const chunk = new TextDecoder().decode(value);
              const lines = chunk.split('\n');
              
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try {
                    const data = JSON.parse(line.slice(6));
                    
                    // Enhance streaming data with frontend metadata
                    if (data.type === 'user_input_needed') {
                      data.frontend_action = 'show_decision_modal';
                    } else if (data.type === 'milestone') {
                      data.frontend_action = 'update_progress_bar';
                    } else if (data.type === 'specialist') {
                      data.frontend_action = 'update_specialist_indicator';
                    }
                    
                    // Write enhanced chunk
                    await writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
                  } catch (parseError) {
                    // Forward original chunk if parsing fails
                    await writer.write(value);
                  }
                } else {
                  // Forward non-data lines as-is
                  await writer.write(encoder.encode(line + '\n'));
                }
              }
            }
          } catch (error) {
            console.error('Stream processing error:', error);
            // Send error event to frontend
            const errorMessage = error instanceof Error ? error.message : 'Unknown streaming error';
            const errorEvent = `data: ${JSON.stringify({
              type: 'error',
              error: errorMessage,
              frontend_action: 'show_error_message'
            })}\n\n`;
            await writer.write(encoder.encode(errorEvent));
          } finally {
            await writer.close();
          }
        })();

        return new NextResponse(readable, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*',
            'X-LangGraph-2025': 'true',
            'X-User-Steering': 'enabled'
          }
        });
      }

      // Handle non-streaming response
      if (!backendResponse.ok) {
        const errorText = await backendResponse.text();
        return NextResponse.json(
          { error: `Supervisor workflow error: ${errorText}` },
          { status: backendResponse.status }
        );
      }

      // Return enhanced JSON response with LangGraph 2025 format
      const data = await backendResponse.json();
      
      // Transform backend response to include user steering state
      const transformedResponse = {
        content: data.content || data.response || data.message || "I'm having trouble generating a response right now.",
        role: 'assistant',
        conversation_id: data.conversation_id,
        specialist: data.specialist || data.current_specialist,
        tools_used: data.tools_used || [],
        next_actions: data.next_actions || [],
        workflow_state: data.workflow_state || 'completed',
        quality_metrics: data.quality_metrics || {},
        intelligence_level: data.intelligence_level || 'developing',
        confidence_score: data.confidence_score || 0.0,
        sources: data.sources || [],
        
        // LangGraph 2025 User Steering State
        user_steering: {
          journey_stage: data.user_journey_stage || 'discovery',
          awaiting_input: data.awaiting_user_input || false,
          input_type_needed: data.input_type_needed,
          decision_context: data.decision_context,
          next_decision_point: data.next_decision_point,
          career_milestones: data.career_milestones || [],
          user_decisions: data.user_decisions || [],
          goals_validated: data.goals_validated || false,
          pathway_chosen: data.pathway_chosen || false,
          action_plan_approved: data.action_plan_approved || false,
          implementation_started: data.implementation_started || false
        },
        
        // Enhanced metadata with LangGraph 2025 indicators
        metadata: {
          ...data.metadata,
          supervisor_workflow: true,
          enhanced_intelligence: true,
          langgraph_2025: true,
          user_steering_enabled: true,
          specialist_handoffs: data.specialist_handoffs || [],
          tools_used: data.tools_used || [],
          workflow_state: data.workflow_state || 'completed',
          empathy_assessment: data.empathy_assessment,
          crisis_intervention_needed: data.crisis_intervention_needed || false
        },
        success: data.success !== false
      };
      
      return NextResponse.json(transformedResponse);

    } catch (fetchError) {
      console.error('Supervisor workflow fetch error:', fetchError);
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timed out. The supervisor workflow may be processing a complex request.' },
          { status: 504 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to connect to supervisor workflow. Please ensure the Python backend is running.' },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error('Error in supervisor chat API:', error);
    return NextResponse.json(
      { error: 'Failed to process supervisor chat message' },
      { status: 500 }
    );
  }
} 