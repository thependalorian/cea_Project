import { NextRequest } from "next/server";

// Simple working CopilotKit-compatible endpoint
export async function POST(req: NextRequest): Promise<Response> {
  try {
    // Handle basic CopilotKit requests
    const body = await req.json();
    
    // If it's a simple ping or health check
    if (!body.message && !body.content) {
      return new Response(
        JSON.stringify({ 
          status: 'ok',
          message: 'CopilotKit proxy is running' 
        }),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Forward complex requests to FastAPI backend
    return await forwardToBackend(req, body);
    
  } catch (error) {
    console.error('CopilotKit endpoint error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'CopilotKit endpoint error', 
        details: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}

export async function GET(req: NextRequest): Promise<Response> {
  return new Response(
    JSON.stringify({ 
      status: 'ok',
      endpoint: 'CopilotKit API',
      message: 'Use POST for chat requests' 
    }),
    { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

// Forward to FastAPI backend
async function forwardToBackend(req: NextRequest, body: any) {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
  
  const response = await fetch(`${backendUrl}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Forward the authorization header if present
      ...(req.headers.get('authorization') && {
        'Authorization': req.headers.get('authorization')!
      })
    },
    body: JSON.stringify({
      message: body.message || body.content || '',
      conversation_id: body.conversation_id,
      context: body.context || {},
      stream: false
    })
  });

  if (!response.ok) {
    throw new Error(`Backend responded with ${response.status}`);
  }

  const data = await response.json();
  
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' }
  });
} 