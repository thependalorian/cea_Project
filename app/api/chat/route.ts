import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

    const body = await request.json();
    
    // Transform legacy request format to v1 format
    const v1Request = {
      query: body.content || body.query,
      context: {
        legacy_mode: true,
        original_context: body.context || 'general',
        user_role: body.role || 'user',
        resume_data: body.resumeData,
        use_resume_rag: body.useResumeRAG || false,
        file_id: body.fileId
      },
      stream: false
    };

    // Forward to v1 endpoint
    const v1Response = await fetch(`${request.url.replace('/api/chat', '/api/v1/interactive-chat')}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
        'Cookie': request.headers.get('Cookie') || ''
      },
      body: JSON.stringify(v1Request)
    });

    if (!v1Response.ok) {
      const errorText = await v1Response.text();
      return NextResponse.json(
        { error: `Legacy chat proxy failed: ${errorText}` },
        { status: v1Response.status }
      );
    }

    const v1Data = await v1Response.json();
    
    // Transform v1 response back to legacy format for compatibility
    const legacyResponse = {
      content: v1Data.content,
      role: 'assistant',
      sources: v1Data.sources || [],
      metadata: {
        session_id: v1Data.session_id,
        workflow_state: v1Data.workflow_state,
        migrated_to_v1: true
      }
    };

    return NextResponse.json(legacyResponse);

  } catch (error) {
    console.error('Error in legacy chat proxy:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process chat message via legacy endpoint. Please use /api/v1/interactive-chat directly.',
        migration_notice: 'This endpoint is deprecated. Please update to use /api/v1/interactive-chat'
      },
      { status: 500 }
    );
  }
} 