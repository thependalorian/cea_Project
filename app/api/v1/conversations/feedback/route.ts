/**
 * Conversation Feedback API - Climate Economy Assistant
 * Human-in-the-loop feedback collection for AI responses
 * Location: app/api/v1/conversations/feedback/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Simple rate limiting helper (since we have import issues with middleware)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function simpleRateLimit(key: string, maxRequests: number = 30, windowMs: number = 60000) {
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
// POST - Submit Feedback
// ========================================

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const rateLimitResult = simpleRateLimit(`feedback:${clientIP}`, 30, 60000);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          message: 'Too many feedback submissions. Please slow down.',
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
      conversation_id,
      message_id,
      feedback_type,
      rating,
      comment,
      correction
    } = body;

    // Validate required fields
    if (!conversation_id || !message_id || !feedback_type) {
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          required: ['conversation_id', 'message_id', 'feedback_type']
        },
        { status: 400 }
      );
    }

    // Validate feedback type
    const validTypes = ['helpful', 'not_helpful', 'rating', 'correction', 'flag'];
    if (!validTypes.includes(feedback_type)) {
      return NextResponse.json(
        { 
          error: 'Invalid feedback type',
          valid_types: validTypes
        },
        { status: 400 }
      );
    }

    // Validate rating if provided
    if (feedback_type === 'rating' && (!rating || rating < 1 || rating > 5)) {
      return NextResponse.json(
        { 
          error: 'Rating must be between 1 and 5',
          provided: rating
        },
        { status: 400 }
      );
    }

    // Validate flag reason if flagging
    if (feedback_type === 'flag' && !comment) {
      return NextResponse.json(
        { 
          error: 'Comment is required when flagging content',
          message: 'Please provide a reason for flagging this message'
        },
        { status: 400 }
      );
    }

    // Verify conversation exists and user has access
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversation_id)
      .eq('user_id', user.id)
      .single();

    if (convError || !conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Verify message exists in conversation
    const { data: message, error: msgError } = await supabase
      .from('conversation_messages')
      .select('*')
      .eq('id', message_id)
      .eq('conversation_id', conversation_id)
      .single();

    if (msgError || !message) {
      return NextResponse.json(
        { error: 'Message not found in conversation' },
        { status: 404 }
      );
    }

    // Create feedback record
    const feedbackId = `fb_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    const feedbackPayload = {
      id: feedbackId,
      conversation_id,
      message_id,
      user_id: user.id,
      feedback_type,
      rating: rating || null,
      comment: comment || null,
      correction: correction || null,
      metadata: body.metadata || {},
      created_at: new Date().toISOString()
    };
    const { data: newFeedback, error: insertError } = await supabase
      .from('message_feedback')
      .insert(feedbackPayload)
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting feedback:', insertError);
      return NextResponse.json(
        { 
          error: 'Failed to save feedback',
          details: insertError.message
        },
        { status: 500 }
      );
    }

    // Simple escalation for negative feedback
    const shouldEscalate = feedback_type === 'flag' || 
                          (feedback_type === 'rating' && rating <= 2) ||
                          (feedback_type === 'not_helpful' && comment?.toLowerCase().includes('urgent'));

    return NextResponse.json({
      success: true,
      feedback: newFeedback,
      escalated: shouldEscalate,
      message: 'Feedback submitted successfully'
    });

  } catch (error) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to submit feedback'
      },
      { status: 500 }
    );
  }
}

// ========================================
// GET - Get User's Feedback
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
    const messageId = searchParams.get('message_id');
    const conversationId = searchParams.get('conversation_id');

    let feedback: Record<string, unknown>[] = [];

    if (messageId) {
      // Get feedback for specific message
      const { data: messageFeedback, error: fbError } = await supabase
        .from('message_feedback')
        .select('*')
        .eq('message_id', messageId)
        .eq('user_id', user.id);

      if (fbError) {
        console.error('Error fetching message feedback:', fbError);
        return NextResponse.json(
          { 
            error: 'Failed to fetch feedback',
            details: fbError.message
          },
          { status: 500 }
        );
      }

      feedback = messageFeedback || [];
    } else if (conversationId) {
      // Verify user has access to conversation
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

      // Get all feedback for conversation
      const { data: conversationFeedback, error: fbError } = await supabase
        .from('message_feedback')
        .select('*')
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id);

      if (fbError) {
        console.error('Error fetching conversation feedback:', fbError);
        return NextResponse.json(
          { 
            error: 'Failed to fetch feedback',
            details: fbError.message
          },
          { status: 500 }
        );
      }

      feedback = conversationFeedback || [];
    } else {
      // Get all user's feedback
      const { data: allFeedback, error: fbError } = await supabase
        .from('message_feedback')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fbError) {
        console.error('Error fetching all feedback:', fbError);
        return NextResponse.json(
          { 
            error: 'Failed to fetch feedback',
            details: fbError.message
          },
          { status: 500 }
        );
      }

      feedback = allFeedback || [];
    }

    return NextResponse.json({
      success: true,
      count: feedback.length,
      feedback,
      query: {
        message_id: messageId,
        conversation_id: conversationId
      }
    });

  } catch (error) {
    console.error('Error retrieving feedback:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to retrieve feedback'
      },
      { status: 500 }
    );
  }
} 