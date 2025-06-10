/**
 * Interactive Chat API - Climate Economy Assistant
 * This endpoint bridges the frontend chat interface with the Python backend
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

    // Parse request body
    const body = await request.json();
    const { query, context = {}, stream = false } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Prepare request to Python backend with proper field mapping
    const backendRequest = {
      message: query, // Backend expects 'message' not 'query'
      user_id: user.id, // Use the authenticated user's actual ID
      conversation_id: context.session_id || undefined, // Pass session_id as conversation_id
      context: context.session_id || "general", // Backend expects context as string
      include_resume_context: true,
      metadata: {
        session_id: context.session_id,
        user: {
          id: user.id,
          email: user.email
        },
        frontend_context: context
      },
      use_langgraph: false // Can be made configurable later
    };

    try {
      // Set timeout for backend request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30-second timeout

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
        // Return streamed response directly
        const { readable, writable } = new TransformStream();
        const writer = writable.getWriter();
        
        // Process stream from Python backend
        const reader = backendResponse.body?.getReader();
        if (!reader) {
          throw new Error('Failed to get reader from backend response');
        }

        // Stream processing function
        (async () => {
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              await writer.write(value);
            }
          } catch (error) {
            console.error('Stream processing error:', error);
          } finally {
            await writer.close();
          }
        })();

        return new NextResponse(readable, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
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

      // Return standard JSON response
      const data = await backendResponse.json();
      
      // Transform backend response to match frontend expectations
      const transformedResponse = {
        content: data.response || data.message || data.content || "I'm having trouble generating a response right now.", // Map 'response', 'message', or 'content' to 'content'
        role: 'assistant',
        conversation_id: data.conversation_id,
        sources: data.sources || [],
        metadata: data.metadata || {},
        specialist_type: data.specialist_type || 'general',
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