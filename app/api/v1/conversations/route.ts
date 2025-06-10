/**
 * Conversations API - Climate Economy Assistant
 * Main conversation management endpoints
 * Location: app/api/v1/conversations/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Rate limiting helper
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function simpleRateLimit(key: string, maxRequests: number = 60, windowMs: number = 60000) {
  const now = Date.now();
  const windowStart = Math.floor(now / windowMs) * windowMs;
  
  const current = rateLimitMap.get(key);
  if (!current || current.resetTime !== windowStart) {
    rateLimitMap.set(key, { count: 1, resetTime: windowStart });
    return { success: true, resetTime: windowStart + windowMs };
  }
  
  if (current.count >= maxRequests) {
    return { success: false, resetTime: windowStart + windowMs };
  }
  
  current.count++;
  return { success: true, resetTime: windowStart + windowMs };
}

// ========================================
// POST - Create New Conversation
// ========================================

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const rateLimitResult = simpleRateLimit(`conv_create:${clientIP}`, 30, 60000);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          message: 'Too many conversation creations. Please try again later.',
          resetTime: rateLimitResult.resetTime
        },
        { status: 429 }
      );
    }

    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      title,
      conversation_type = 'general',
      initial_message
    } = body;

    // Validate conversation type
    const validTypes = ['general', 'career_guidance', 'job_search', 'resume_analysis', 'skill_development', 'recommendations'];
    if (!validTypes.includes(conversation_type)) {
      return NextResponse.json(
        { 
          error: 'Invalid conversation type',
          valid_types: validTypes
        },
        { status: 400 }
      );
    }

    // Create conversation directly in Supabase
    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    const { error: createError } = await supabase
      .from('conversations')
      .insert({
        id: conversationId,
        user_id: user.id,
        title: title || null,
        conversation_type,
        status: 'active',
        message_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        session_metadata: body.session_metadata || {},
        last_activity: new Date().toISOString(),
        initial_query: initial_message || null
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating conversation:', createError);
      return NextResponse.json(
        { 
          error: 'Failed to create conversation',
          details: createError.message
        },
        { status: 500 }
      );
    }

    // Add initial message if provided
    let messageId = null;
    if (initial_message) {
      messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      const { error: msgError } = await supabase
        .from('conversation_messages')
        .insert({
          id: messageId,
          conversation_id: conversationId,
          role: 'user',
          content: initial_message,
          metadata: {},
          created_at: new Date().toISOString()
        });

      if (msgError) {
        console.error('Error adding initial message:', msgError);
      } else {
        // Update message count
        await supabase
          .from('conversations')
          .update({ 
            message_count: 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', conversationId);
      }
    }

    return NextResponse.json({
      success: true,
      conversation: {
        id: conversationId,
        user_id: user.id,
        title,
        conversation_type,
        status: 'active',
        message_count: initial_message ? 1 : 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        session_metadata: body.session_metadata || {},
        last_activity: new Date().toISOString(),
        initial_query: initial_message || null
      },
      initial_message_id: messageId,
      message: 'Conversation created successfully'
    });

  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to create conversation'
      },
      { status: 500 }
    );
  }
}

// ========================================
// GET - Get User's Conversations
// ========================================

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const conversation_type = searchParams.get('type');

    // Validate limit
    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { 
          error: 'Invalid limit',
          message: 'Limit must be between 1 and 100'
        },
        { status: 400 }
      );
    }

    // Get conversations from Supabase
    let query = supabase
      .from('conversations')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(limit);

    // Filter by type if specified
    if (conversation_type) {
      query = query.eq('conversation_type', conversation_type);
    }

    const { data: conversations, error: queryError } = await query;

    if (queryError) {
      console.error('Error fetching conversations:', queryError);
      return NextResponse.json(
        { 
          error: 'Failed to fetch conversations',
          details: queryError.message
        },
        { status: 500 }
      );
    }

    // Get total count for metadata
    const { count: totalCount } = await supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    return NextResponse.json({
      success: true,
      conversations: conversations || [],
      count: conversations?.length || 0,
      total_available: totalCount || 0,
      filters: {
        limit,
        conversation_type: conversation_type || null
      }
    });

  } catch (error) {
    console.error('Error getting conversations:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to get conversations'
      },
      { status: 500 }
    );
  }
} 