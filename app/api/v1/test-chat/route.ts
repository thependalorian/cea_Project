/**
 * Test Chat API - No Authentication Required
 * This endpoint is for testing the Python backend without authentication
 * Location: app/api/v1/test-chat/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';

// Python backend URL
const BACKEND_URL = process.env.PYTHON_BACKEND_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { query, context = {}, stream = false } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Prepare request to Python backend (no auth required for testing)
    const backendRequest = {
      query,
      user_id: 'test-user-' + Date.now(),
      context: {
        ...context,
        test: true
      },
      stream
    };

    try {
      // Set timeout for backend request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000); // 45-second timeout

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
      return NextResponse.json({
        ...data,
        test_mode: true,
        frontend_backend_integration: 'working'
      });

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
    console.error('Error in test chat API:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'Test endpoint available',
    description: 'POST to this endpoint to test Python backend integration without authentication',
    example_request: {
      query: 'What climate careers are available?',
      context: { test: true },
      stream: false
    }
  });
} 