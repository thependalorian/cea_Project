/**
 * Interactive Chat API - Climate Economy Assistant
 * Enhanced for LangGraph 2025 execution patterns with user steering support
 * Location: app/api/v1/interactive-chat/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Python backend URL
const BACKEND_URL = process.env.PYTHON_BACKEND_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication - RE-ENABLED FOR PROPER FUNCTIONALITY
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
      query, 
      context = {}, 
      stream = false,
      user_journey_stage = "discovery", 
      user_preferences = {},
      awaiting_user_input = false,
      decision_context = null,
      include_resume_context = true
    } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Prepare enhanced request with LangGraph 2025 support
    const backendRequest = {
      message: query, // Backend expects 'message' not 'query'
      user_id: user.id, // Use the authenticated user's actual ID
      conversation_id: context.session_id || undefined, // Pass session_id as conversation_id
      stream: stream, // LangGraph 2025 streaming flag
      context: context.session_id || "general", // Backend expects context as string
      include_resume_context: include_resume_context,
      metadata: {
        session_id: context.session_id,
        journey_stage: user_journey_stage,
        user_preferences: user_preferences,
        awaiting_user_input: awaiting_user_input,
        decision_context: decision_context,
        stream: stream,
        user: {
          id: user.id,
          email: user.email
        },
        frontend_context: context,
        langgraph_2025: true,
        interactive_chat: true,
        user_steering_enabled: true,
        enhanced_agents: true
      },
      use_langgraph: false // Can be made configurable later
    };

    try {
      // Set timeout for backend request (longer for streaming)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), stream ? 90000 : 30000);

      // Forward request to Python backend
      const backendResponse = await fetch(`${BACKEND_URL}/api/v1/interactive-chat`, {
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
        // Return enhanced streamed response for LangGraph 2025
        const { readable, writable } = new TransformStream();
        const writer = writable.getWriter();
        const encoder = new TextEncoder();
        
        // Process stream from Python backend
        const reader = backendResponse.body?.getReader();
        if (!reader) {
          throw new Error('Failed to get reader from backend response');
        }

        // Enhanced stream processing for interactive chat
        (async () => {
          try {
            let accumulatedContent = "";
            let currentSpecialist = "unknown";
            
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              
              // Process streaming chunks for LangGraph 2025 patterns
              const chunk = new TextDecoder().decode(value);
              const lines = chunk.split('\n');
              
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try {
                    const data = JSON.parse(line.slice(6));
                    
                    // Track accumulated content for context
                    if (data.type === 'content') {
                      accumulatedContent += data.content;
                      data.accumulated_content = accumulatedContent;
                    }
                    
                    // Track specialist changes
                    if (data.type === 'specialist') {
                      currentSpecialist = data.specialist;
                    }
                    
                    // Enhance streaming data with interactive chat metadata
                    if (data.type === 'user_input_needed') {
                      data.frontend_action = 'show_user_steering_modal';
                      data.modal_type = 'decision_point';
                    } else if (data.type === 'milestone') {
                      data.frontend_action = 'update_career_progress';
                    } else if (data.type === 'tools') {
                      data.frontend_action = 'show_tool_activity';
                    } else if (data.type === 'sources') {
                      data.frontend_action = 'update_sources_panel';
                    } else if (data.type === 'workflow_state') {
                      data.frontend_action = 'update_workflow_indicator';
                    }
                    
                    // Add context metadata
                    data.chat_context = {
                      current_specialist: currentSpecialist,
                      accumulated_length: accumulatedContent.length,
                      user_steering_active: data.type === 'user_input_needed'
                    };
                    
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
            console.error('Interactive chat stream processing error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown streaming error';
            const errorEvent = `data: ${JSON.stringify({
              type: 'error',
              error: errorMessage,
              frontend_action: 'show_error_notification'
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
            'X-Interactive-Chat': 'true',
            'X-User-Steering': 'enabled'
          }
        });
      }

      // Handle non-streaming response
      if (!backendResponse.ok) {
        const errorText = await backendResponse.text();
        return NextResponse.json(
          { error: `Backend error: ${errorText}` },
          { status: backendResponse.status }
        );
      }

      // Return enhanced JSON response with LangGraph 2025 format
      const data = await backendResponse.json();
      
      // Transform backend response to include LangGraph 2025 features
      const transformedResponse = {
        content: data.response || data.message || data.content || "I'm having trouble generating a response right now.",
        role: 'assistant',
        conversation_id: data.conversation_id,
        sources: data.sources || [],
        specialist_type: data.specialist_type || 'general',
        
        // LangGraph 2025 fields
        tools_used: data.tools_used || [],
        next_actions: data.next_actions || [],
        workflow_state: data.workflow_state || 'completed',
        
        // User steering state
        user_steering: data.user_steering || {
          journey_stage: data.user_journey_stage || 'discovery',
          awaiting_input: data.awaiting_user_input || false,
          decision_context: data.decision_context,
          milestones: data.career_milestones || [],
          decisions: data.user_decisions || []
        },
        
        // Enhanced metadata
        metadata: {
          ...data.metadata,
          langgraph_2025: true,
          interactive_chat: true,
          user_steering_enabled: true,
          enhanced_agents: true,
          confidence_score: data.confidence_score || 0.0,
          intelligence_level: data.intelligence_level || 'developing'
        },
        success: true
      };
      
      // Handle successful response but no user data scenarios
      if (data && typeof data === 'object') {
        // If the response indicates missing resume but chat was successful
        if (transformedResponse.content && transformedResponse.content.includes('resume')) {
          // This is still a successful interaction, just with limited context
          return NextResponse.json({
            ...transformedResponse,
            status: 'limited_context',
            context_note: 'Response generated without resume context. Upload a resume for more personalized advice.'
          });
        }
        
        // Handle workflow responses that might have empty search results
        if (data.generate_personalized_response && data.generate_personalized_response.confidence_score !== undefined) {
          const confidence = data.generate_personalized_response.confidence_score;
          if (confidence < 0.7) {
            return NextResponse.json({
              ...transformedResponse,
              status: 'low_confidence',
              confidence_note: `Response confidence: ${confidence}. Consider providing more specific information for better recommendations.`
            });
          }
        }
      }
      
      return NextResponse.json(transformedResponse);

    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timed out. The Python backend may be unavailable.' },
          { status: 504 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to connect to Python backend. Please ensure it is running.' },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error('Error in interactive chat API:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}

// GET method to provide endpoint information
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';
    
    const endpointInfo = {
      endpoint: '/api/v1/interactive-chat',
      version: 'v1',
      description: 'Interactive Climate Economy Assistant Chat API',
      features: [
        'LangGraph 2025 execution patterns',
        'User steering support',
        'Stream processing',
        'Multi-specialist routing',
        'Resume context integration'
      ],
      methods: {
        POST: {
          description: 'Send chat message for processing',
          required_auth: true,
          parameters: {
            query: 'string (required) - User message/question',
            context: 'object (optional) - Session context',
            stream: 'boolean (optional) - Enable streaming response',
            user_journey_stage: 'string (optional) - Current user journey stage',
            user_preferences: 'object (optional) - User preferences',
            include_resume_context: 'boolean (optional) - Include resume in context'
          },
          example_request: {
            query: "I want to transition to a climate career",
            context: { session_id: "unique-session-id" },
            stream: false,
            user_journey_stage: "discovery",
            include_resume_context: true
          }
        },
        GET: {
          description: 'Get endpoint documentation',
          required_auth: false,
          parameters: {
            format: 'string (optional) - Response format (json|yaml)'
          }
        }
      },
      specialist_types: [
        'PENDO (Climate Supervisor)',
        'MARCUS (Veterans specialist)',
        'LIV (International credentials)',
        'MIGUEL (Environmental justice)',
        'JASMINE (Massachusetts resources)',
        'ALEX (Empathy & support)',
        'LAUREN (Climate careers)',
        'MAI (Resume specialist)'
      ],
      response_types: {
        standard: 'JSON response with enhanced metadata',
        streaming: 'Server-sent events with real-time updates'
      },
      status: 'operational',
      backend_integration: 'Python FastAPI with LangGraph workflows'
    };

    if (format === 'yaml') {
      return new NextResponse(
        JSON.stringify(endpointInfo, null, 2).replace(/[{}]/g, '').replace(/"/g, ''),
        {
          headers: {
            'Content-Type': 'text/yaml',
            'X-API-Version': 'v1'
          }
        }
      );
    }

    return NextResponse.json(endpointInfo, {
      headers: {
        'X-API-Version': 'v1',
        'Cache-Control': 'public, max-age=3600'
      }
    });

  } catch (error) {
    console.error('GET /api/v1/interactive-chat error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve endpoint information' },
      { status: 500 }
    );
  }
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