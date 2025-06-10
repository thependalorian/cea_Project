/**
 * Individual Conversation API - Climate Economy Assistant
 * Manage specific conversation by ID
 * Location: app/api/v1/conversations/[id]/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { ChatMessage } from '@/lib/types';

interface Conversation {
  id: string;
  user_id: string;
  title: string | null;
  conversation_type: string;
  status: string;
  message_count: number;
  created_at: string;
  updated_at: string;
  messages?: ChatMessage[];
}

// ========================================
// GET - Get Specific Conversation
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

    // Get conversation from Supabase
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

    // Parse query parameters for message options
    const { searchParams } = new URL(request.url);
    const includeMessages = searchParams.get('include_messages') !== 'false';
    const messageLimit = parseInt(searchParams.get('message_limit') || '50');

    // Prepare response
    const response: {
      success: boolean;
      conversation: Conversation;
      message_info?: {
        returned: number;
        total: number;
        limited: boolean;
      };
    } = {
      success: true,
      conversation: {
        id: conversation.id,
        user_id: conversation.user_id,
        title: conversation.title,
        conversation_type: conversation.conversation_type,
        status: conversation.status,
        message_count: conversation.message_count,
        created_at: conversation.created_at,
        updated_at: conversation.updated_at
      }
    };

    if (includeMessages) {
      // Get messages from conversation_messages table
      const { data: messages, error: msgError } = await supabase
        .from('conversation_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(messageLimit);

      if (msgError) {
        console.error('Error fetching messages:', msgError);
        return NextResponse.json(
          { 
            error: 'Failed to fetch messages',
            message: 'Could not retrieve conversation messages'
          },
          { status: 500 }
        );
      }

      response.conversation.messages = messages || [];
      response.message_info = {
        returned: messages?.length || 0,
        total: conversation.message_count,
        limited: (messages?.length || 0) >= messageLimit
      };
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error getting conversation:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to get conversation'
      },
      { status: 500 }
    );
  }
}

// ========================================
// PATCH - Update Conversation
// ========================================

export async function PATCH(
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

    // Get conversation from Supabase
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

    // Parse request body
    const body = await request.json();
    const { title, status } = body;

    // Validate updates
    if (status && !['active', 'completed'].includes(status)) {
      return NextResponse.json(
        { 
          error: 'Invalid status',
          valid_statuses: ['active', 'completed']
        },
        { status: 400 }
      );
    }

    // Prepare update object
    const updates: Partial<Conversation> = {
      updated_at: new Date().toISOString()
    };

    if (title !== undefined && title !== conversation.title) {
      updates.title = title;
    }

    if (status && status !== conversation.status) {
      updates.status = status;
    }

    // Update conversation in database
    const { data: updatedConversation, error: updateError } = await supabase
      .from('conversations')
      .update(updates)
      .eq('id', conversationId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating conversation:', updateError);
      return NextResponse.json(
        { 
          error: 'Failed to update conversation',
          details: updateError.message
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      conversation: updatedConversation,
      message: 'Conversation updated successfully'
    });

  } catch (error) {
    console.error('Error updating conversation:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to update conversation'
      },
      { status: 500 }
    );
  }
}

// ========================================
// DELETE - Delete Conversation
// ========================================

export async function DELETE(
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

    // Get conversation to verify ownership
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

    // Delete from Supabase (cascading deletes will handle messages and feedback)
    const { error: deleteError } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);

    if (deleteError) {
      console.error('Error deleting conversation from Supabase:', deleteError);
      return NextResponse.json(
        { 
          error: 'Database error',
          message: 'Failed to delete conversation'
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Conversation deleted successfully',
      deleted_conversation_id: conversationId
    });

  } catch (error) {
    console.error('Error deleting conversation:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to delete conversation'
      },
      { status: 500 }
    );
  }
} 