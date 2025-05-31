import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

async function checkBackendHealth(): Promise<{ isHealthy: boolean; error?: string }> {
  try {
    const response = await fetch('http://localhost:8000/health', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Set a timeout to avoid long waits if the service is down
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return { isHealthy: false, error: 'Backend health check failed' };
    }

    return { isHealthy: true };
  } catch {
    return { isHealthy: false, error: 'Failed to connect to Python backend' };
  }
}

export async function POST(req: Request) {
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

    // Check if backend is healthy
    const healthCheck = await checkBackendHealth();
    if (!healthCheck.isHealthy) {
      return NextResponse.json(
        { error: healthCheck.error || 'Python backend is not properly configured.' },
        { status: 503 }
      );
    }

    const body = await req.json();
    
    // Get resume data from the request body if provided
    let resumeData = body.resumeData || null;
    
    // If we have fileId but not resumeData, get the resume data from Supabase
    if (!resumeData && body.fileId) {
      const { data: resume, error: resumeError } = await supabase
        .from("resumes")
        .select("*")
        .eq("id", body.fileId)
        .eq("user_id", user.id)
        .single();
      
      if (resumeError) {
        console.error("Error fetching resume:", resumeError);
      } else {
        resumeData = resume;
      }
    }
    
    // Add user ID to resume data if available
    if (resumeData && !resumeData.user_id) {
      resumeData.user_id = user.id;
    }

    try {
      // Determine which backend endpoint to use based on RAG toggle
      const endpoint = body.useResumeRAG && resumeData 
        ? 'http://localhost:8000/api/chat-with-resume'
        : 'http://localhost:8000/api/chat';
      
      // Call Python backend with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      // Prepare request body based on endpoint
      let requestBody = {};
      
      if (body.useResumeRAG && resumeData) {
        // For RAG mode, use the chat-with-resume endpoint
        requestBody = {
          query: body.content,
          user_id: resumeData.user_id || user.id
        };
      } else {
        // For normal chat mode
        requestBody = {
          content: body.content,
          role: 'user',
          context: body.context || 'general',
          resumeData: resumeData, // Pass resume data if available
          useResumeRAG: body.useResumeRAG || false
        };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Python backend error:', errorText);
        return NextResponse.json(
          { error: `Backend error: ${errorText}` },
          { status: response.status }
        );
      }

      const data = await response.json();
      
      // Format response based on the endpoint used
      if (body.useResumeRAG && resumeData) {
        // Format response from chat-with-resume endpoint
        return NextResponse.json({
          content: data.answer,
          role: 'assistant',
          sources: data.sources || []
        });
      } else {
        // Return response from regular chat endpoint
        return NextResponse.json(data);
      }
    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timed out. Please ensure the Python backend is running: Run `python python_backend/main.py` in your terminal.' },
          { status: 504 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to connect to Python backend. Please ensure it is running on port 8000.' },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
} 