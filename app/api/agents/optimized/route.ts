/**
 * 🚀 Optimized Agents API Endpoint
 * High-performance endpoint using LangGraph Functional API for sub-second responses
 * 
 * Performance Targets:
 * - Routing: <50ms
 * - Total Response: <1000ms
 * - Cache Hit Rate: >80%
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Performance monitoring
const PERFORMANCE_THRESHOLD_MS = 1000;
const ROUTING_THRESHOLD_MS = 50;

interface OptimizedResponse {
  content: string;
  agent: string;
  team: string;
  confidence: number;
  processing_time_ms: number;
  metadata: {
    routing_time_ms: number;
    cache_hit: boolean;
    optimized_framework: boolean;
    model_provider: string;
  };
}

interface StreamChunk {
  type: 'framework_start' | 'routing_complete' | 'start' | 'content' | 'complete' | 'error';
  data: any;
}

/**
 * POST /api/agents/optimized - Process message with optimized framework
 */
export async function POST(request: NextRequest) {
  const startTime = performance.now();
  
  try {
    // Parse request body
    const { message, conversation_id, stream = false } = await request.json();
    
    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'Message is required' }, 
        { status: 400 }
      );
    }

    // Get authenticated user
    const supabase = createServerComponentClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      );
    }

    // Generate conversation ID if not provided
    const finalConversationId = conversation_id || `conv_${Date.now()}_${user.id}`;

    if (stream) {
      return handleStreamingResponse(message, user.id, finalConversationId);
    } else {
      return handleStandardResponse(message, user.id, finalConversationId, startTime);
    }

  } catch (error) {
    const processingTime = performance.now() - startTime;
    console.error('❌ Optimized API error:', error);
    
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      processing_time_ms: processingTime,
      framework: 'optimized',
      success: false
    }, { status: 500 });
  }
}

/**
 * Handle standard (non-streaming) response
 */
async function handleStandardResponse(
  message: string, 
  userId: string, 
  conversationId: string,
  startTime: number
): Promise<NextResponse> {
  try {
    // Call optimized Python backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    const response = await fetch(`${backendUrl}/api/agents/optimized`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        user_id: userId,
        conversation_id: conversationId,
        stream: false
      }),
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status} ${response.statusText}`);
    }

    const optimizedResponse: OptimizedResponse = await response.json();
    const totalTime = performance.now() - startTime;

    // Performance monitoring
    const performanceAlert = totalTime > PERFORMANCE_THRESHOLD_MS;
    const routingAlert = optimizedResponse.metadata.routing_time_ms > ROUTING_THRESHOLD_MS;

    if (performanceAlert || routingAlert) {
      console.warn('⚠️ Performance threshold exceeded:', {
        total_time_ms: totalTime,
        routing_time_ms: optimizedResponse.metadata.routing_time_ms,
        performance_alert: performanceAlert,
        routing_alert: routingAlert
      });
    }

    return NextResponse.json({
      ...optimizedResponse,
      api_processing_time_ms: totalTime,
      performance_metrics: {
        under_threshold: !performanceAlert,
        routing_fast: !routingAlert,
        cache_effectiveness: optimizedResponse.metadata.cache_hit
      },
      success: true
    });

  } catch (error) {
    const totalTime = performance.now() - startTime;
    console.error('❌ Standard response error:', error);
    
    return NextResponse.json({
      error: 'Failed to process message with optimized framework',
      details: error instanceof Error ? error.message : 'Unknown error',
      processing_time_ms: totalTime,
      framework: 'optimized',
      success: false
    }, { status: 500 });
  }
}

/**
 * Handle streaming response with Server-Sent Events
 */
async function handleStreamingResponse(
  message: string, 
  userId: string, 
  conversationId: string
): Promise<NextResponse> {
  const encoder = new TextEncoder();

  // Create readable stream
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Call optimized Python backend for streaming
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
        const response = await fetch(`${backendUrl}/api/agents/optimized/stream`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message,
            user_id: userId,
            conversation_id: conversationId
          }),
        });

        if (!response.ok) {
          throw new Error(`Backend streaming error: ${response.status}`);
        }

        if (!response.body) {
          throw new Error('No response body for streaming');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.trim().startsWith('data: ')) {
                try {
                  const jsonStr = line.slice(6); // Remove "data: " prefix
                  const data: StreamChunk = JSON.parse(jsonStr);
                  
                  // Forward chunk to client
                  const sseData = `data: ${JSON.stringify({
                    ...data,
                    timestamp: new Date().toISOString(),
                    framework: 'optimized'
                  })}\n\n`;
                  
                  controller.enqueue(encoder.encode(sseData));
                  
                  // End stream on completion or error
                  if (data.type === 'complete' || data.type === 'error') {
                    controller.close();
                    return;
                  }
                } catch (parseError) {
                  console.warn('Failed to parse SSE chunk:', parseError);
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
        }

        controller.close();

      } catch (error) {
        console.error('❌ Streaming error:', error);
        
        // Send error to client
        const errorData = `data: ${JSON.stringify({
          type: 'error',
          data: {
            error: error instanceof Error ? error.message : 'Streaming failed',
            framework: 'optimized',
            timestamp: new Date().toISOString()
          }
        })}\n\n`;
        
        controller.enqueue(encoder.encode(errorData));
        controller.close();
      }
    }
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

/**
 * GET /api/agents/optimized - Get optimization status
 */
export async function GET() {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    const response = await fetch(`${backendUrl}/api/agents/optimized/status`);
    
    if (!response.ok) {
      throw new Error(`Backend status error: ${response.status}`);
    }
    
    const status = await response.json();
    
    return NextResponse.json({
      ...status,
      api_status: 'operational',
      timestamp: new Date().toISOString(),
      performance_monitoring: {
        thresholds: {
          total_response_ms: PERFORMANCE_THRESHOLD_MS,
          routing_ms: ROUTING_THRESHOLD_MS
        },
        alerts_enabled: true
      }
    });
    
  } catch (error) {
    console.error('❌ Status check error:', error);
    
    return NextResponse.json({
      error: 'Failed to get optimization status',
      details: error instanceof Error ? error.message : 'Unknown error',
      api_status: 'error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 