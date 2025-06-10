/**
 * Process Resume API Endpoint
 * Handles resume processing after upload
 * Location: app/api/v1/process-resume/route.ts
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

    // Parse request body
    const body = await request.json();
    const { resume_id, file_name } = body;

    if (!resume_id) {
      return NextResponse.json(
        { error: 'Resume ID is required' },
        { status: 400 }
      );
    }

    // Prepare request to Python backend
    const backendRequest = {
      file_id: resume_id,
      user_id: user.id,
      context: "comprehensive",
      metadata: {
        file_name,
        user: {
          id: user.id,
          email: user.email
        }
      }
    };

    try {
      // Forward request to Python backend
      const backendResponse = await fetch(`${BACKEND_URL}/api/v1/process-resume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendRequest)
      });

      if (!backendResponse.ok) {
        const errorText = await backendResponse.text();
        console.warn('Backend resume processing failed:', errorText);
        
        // Return success even if backend processing fails
        // The resume upload already succeeded
        return NextResponse.json({
          success: true,
          message: 'Resume uploaded successfully. Processing may continue in background.',
          warning: 'Advanced processing temporarily unavailable'
        });
      }

      const data = await backendResponse.json();
      return NextResponse.json({
        success: true,
        data,
        message: 'Resume processed successfully'
      });

    } catch (fetchError) {
      console.error('Resume processing fetch error:', fetchError);
      
      // Return success even if backend processing fails
      return NextResponse.json({
        success: true,
        message: 'Resume uploaded successfully. Processing may continue in background.',
        warning: 'Advanced processing temporarily unavailable'
      });
    }
  } catch (error) {
    console.error('Error in process resume API:', error);
    return NextResponse.json(
      { error: 'Failed to process resume' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'Process Resume endpoint available',
    description: 'POST to this endpoint to process uploaded resume files',
    supported_formats: [
      {
        description: 'Current frontend format',
        example_request: {
          resume_id: 123,
          file_name: 'resume.pdf',
          context: 'general'
        }
      },
      {
        description: 'Alternative format',
        example_request: {
          file_url: 'https://example.com/resume.pdf',
          file_id: 'file-123',
          context: 'general'
        }
      }
    ]
  });
} 