/**
 * Climate Career Agent API v1 - Climate Economy Assistant
 * Proxies requests to the specialized climate career agent
 * Location: app/api/v1/career-agent/route.ts
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
      query,
      user_id,
      session_id,
      include_resume_context = true,
      search_scope = 'all',
      stream = false 
    } = body;

    // Validate required fields
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required and must be a string' },
        { status: 400 }
      );
    }

    // Validate search scope
    const validScopes = ['all', 'jobs', 'education', 'partners', 'knowledge'];
    if (!validScopes.includes(search_scope)) {
      return NextResponse.json(
        { error: `Invalid search_scope. Must be one of: ${validScopes.join(', ')}` },
        { status: 400 }
      );
    }

    // Generate session ID if not provided
    const effectiveSessionId = session_id || `career-agent-${Date.now()}-${user.id}`;

    // Prepare request to Python backend
    const backendRequest = {
      query,
      user_id: user_id || user.id,
      session_id: effectiveSessionId,
      include_resume_context,
      search_scope,
      stream,
      context: {
        user: {
          id: user.id,
          email: user.email
        },
        agent_type: 'climate_career_specialist',
        timestamp: new Date().toISOString()
      }
    };

    try {
      // Set timeout for backend request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000); // 90-second timeout for agent processing

      // Forward request to Python backend
      const backendResponse = await fetch(`${BACKEND_URL}/api/v1/climate-career-agent`, {
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
            console.error('Career agent stream processing error:', error);
          } finally {
            await writer.close();
          }
        })();

        return new NextResponse(readable, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'X-Session-ID': effectiveSessionId
          }
        });
      }

      // Handle non-streaming response
      if (!backendResponse.ok) {
        const errorText = await backendResponse.text();
        console.error('Career agent backend error:', errorText);
        return NextResponse.json(
          { error: `Climate career agent failed: ${errorText}` },
          { status: backendResponse.status }
        );
      }

      // Return standard JSON response
      const data = await backendResponse.json();
      
      // Log agent interaction for analytics
      try {
        await supabase
          .from('conversations')
          .insert({
            user_id: user.id,
            title: `Career Agent: ${query.slice(0, 50)}...`,
            messages: [
              {
                role: 'user',
                content: query,
                timestamp: new Date().toISOString()
              },
              {
                role: 'assistant',
                content: data.content || 'Agent response',
                timestamp: new Date().toISOString(),
                agent_type: 'climate_career_specialist'
              }
            ],
            status: 'completed'
          });
      } catch (logError) {
        console.warn('Failed to log career agent interaction:', logError);
        // Don't fail the request if logging fails
      }

      return NextResponse.json({
        ...data,
        session_id: effectiveSessionId,
        agent_type: 'climate_career_specialist',
        timestamp: new Date().toISOString()
      });

    } catch (fetchError) {
      console.error('Career agent fetch error:', fetchError);
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Career agent processing timed out. Please try a more specific query.' },
          { status: 504 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to connect to career agent service. Please ensure Python backend is running.' },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error('Error in career agent API:', error);
    return NextResponse.json(
      { error: 'Failed to process career agent request' },
      { status: 500 }
    );
  }
} 