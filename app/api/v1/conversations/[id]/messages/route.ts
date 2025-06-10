/**
 * Conversation Messages API - Climate Economy Assistant
 * Manage messages within specific conversations
 * Location: app/api/v1/conversations/[id]/messages/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Rate limiting helper
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function simpleRateLimit(key: string, maxRequests: number = 100, windowMs: number = 60000) {
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
// POST - Add Message to Conversation
// ========================================

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const conversationId = params.id;

    // Rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const rateLimitResult = simpleRateLimit(`msg_add:${clientIP}`, 100, 60000);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          message: 'Too many messages. Please slow down.',
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
    const { role, content, metadata } = body;

    // Validate required fields
    if (!role || !content) {
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          required: ['role', 'content']
        },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['user', 'assistant', 'system'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { 
          error: 'Invalid role',
          valid_roles: validRoles
        },
        { status: 400 }
      );
    }

    // Validate content length
    if (content.length > 10000) {
      return NextResponse.json(
        { 
          error: 'Content too long',
          max_length: 10000,
          current_length: content.length
        },
        { status: 400 }
      );
    }

    // Get conversation and verify access
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .eq('user_id', user.id)
      .single();

    if (convError || !conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Add message to database
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    const messagePayload = {
      id: messageId,
      conversation_id: conversationId,
      user_id: user.id,
      role,
      content,
      specialist_type: body.specialist_type || null,
      is_human: body.is_human ?? null,
      status: body.status || 'completed',
      metadata: metadata || {},
      content_type: body.content_type || 'text',
      processed: body.processed ?? false,
      error_message: body.error_message || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      embedding: body.embedding || null
    };
    const { data: newMessage, error: insertError } = await supabase
      .from('conversation_messages')
      .insert(messagePayload)
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting message:', insertError);
      return NextResponse.json(
        { 
          error: 'Failed to add message',
          details: insertError.message
        },
        { status: 500 }
      );
    }

    // Update conversation message count
    const { error: updateError } = await supabase
      .from('conversations')
      .update({
        message_count: conversation.message_count + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId);

    if (updateError) {
      console.error('Error updating conversation:', updateError);
    }

    return NextResponse.json({
      success: true,
      message_data: newMessage,
      conversation_info: {
        id: conversationId,
        message_count: conversation.message_count + 1
      },
      message: 'Message added successfully'
    });

  } catch (error) {
    console.error('Error adding message:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to add message'
      },
      { status: 500 }
    );
  }
}

// ========================================
// GET - Get Conversation Messages
// ========================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const conversationId = params.id;

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
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const role = searchParams.get('role');

    // Validate parameters
    if (limit < 1 || limit > 200) {
      return NextResponse.json(
        { 
          error: 'Invalid limit',
          message: 'Limit must be between 1 and 200'
        },
        { status: 400 }
      );
    }

    if (offset < 0) {
      return NextResponse.json(
        { 
          error: 'Invalid offset',
          message: 'Offset must be non-negative'
        },
        { status: 400 }
      );
    }

    // Get conversation and verify access
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .eq('user_id', user.id)
      .single();

    if (convError || !conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Get messages from database
    let query = supabase
      .from('conversation_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    // Filter by role if specified
    if (role) {
      query = query.eq('role', role);
    }

    // Apply pagination
    const { data: messages, error: msgError } = await query
      .range(offset, offset + limit - 1);

    if (msgError) {
      console.error('Error fetching messages:', msgError);
      return NextResponse.json(
        { 
          error: 'Failed to fetch messages',
          details: msgError.message
        },
        { status: 500 }
      );
    }

    // Get total count for pagination info
    const { count: totalCount } = await supabase
      .from('conversation_messages')
      .select('*', { count: 'exact', head: true })
      .eq('conversation_id', conversationId)
      .eq(role ? 'role' : 'id', role || conversationId); // Conditional filter

    return NextResponse.json({
      success: true,
      messages: messages || [],
      pagination: {
        total: totalCount || 0,
        limit,
        offset,
        returned: messages?.length || 0,
        has_more: offset + limit < (totalCount || 0)
      },
      conversation_info: {
        id: conversationId,
        total_messages: conversation.message_count
      },
      filters: {
        role: role || null
      }
    });

  } catch (error) {
    console.error('Error getting messages:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to get messages'
      },
      { status: 500 }
    );
  }
} 