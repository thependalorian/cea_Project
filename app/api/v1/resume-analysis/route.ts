/**
 * Resume Analysis API v1 - Climate Economy Assistant
 * Proxies resume analysis requests to Python backend with authentication
 * Location: app/api/v1/resume-analysis/route.ts
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
      user_id, 
      analysis_type = 'comprehensive', 
      include_social_data = true,
      stream = false 
    } = body;

    // Validate required fields
    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      );
    }

    // Ensure user can only analyze their own resume or is admin
    if (user_id !== user.id) {
      // Check if user has admin permissions
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (!profile || profile.role !== 'admin') {
        return NextResponse.json(
          { error: 'Forbidden: Can only analyze your own resume' },
          { status: 403 }
        );
      }
    }

    // Prepare request to Python backend
    const backendRequest = {
      user_id,
      analysis_type,
      include_social_data,
      stream
    };

    try {
      // Set timeout for backend request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000); // 45-second timeout for analysis

      // Forward request to Python backend
      const backendResponse = await fetch(`${BACKEND_URL}/api/v1/resume-analysis`, {
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
            console.error('Resume analysis stream processing error:', error);
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
        console.error('Resume analysis backend error:', errorText);
        return NextResponse.json(
          { error: `Resume analysis failed: ${errorText}` },
          { status: backendResponse.status }
        );
      }

      // Return standard JSON response
      const data = await backendResponse.json();
      
      // Handle successful response but no resume data found
      if (data && typeof data === 'object') {
        // Check if this is a "no resume found" response
        if (data.error && data.error.includes('No resume found')) {
          return NextResponse.json({
            success: true,
            status: 'no_resume',
            message: 'No resume found for this user. Please upload a resume first.',
            user_id,
            analysis_type,
            recommendations: [
              'Upload your resume to get personalized career analysis',
              'Visit the resume upload section to get started',
              'Once uploaded, return here for detailed climate career insights'
            ]
          });
        }
        
        // Check for other expected empty data scenarios
        if (data.analyze_user_resume && !data.analyze_user_resume.success) {
          return NextResponse.json({
            success: true,
            status: 'no_data',
            message: data.analyze_user_resume.error || 'No resume data available for analysis',
            user_id,
            analysis_type,
            suggestions: [
              'Upload a resume to enable career analysis',
              'Ensure your resume is properly processed',
              'Contact support if you believe this is an error'
            ]
          });
        }
      }
      
      return NextResponse.json(data);

    } catch (fetchError) {
      console.error('Resume analysis fetch error:', fetchError);
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Resume analysis timed out. Please try again with a smaller document.' },
          { status: 504 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to connect to analysis service. Please ensure Python backend is running.' },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error('Error in resume analysis API:', error);
    return NextResponse.json(
      { error: 'Failed to process resume analysis request' },
      { status: 500 }
    );
  }
} 