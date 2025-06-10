import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * Admin Analytics API v1 - System-wide Analytics
 * 
 * Provides comprehensive analytics for administrators:
 * - GET /api/v1/admin/analytics - Get system-wide analytics (Admin only)
 * - POST /api/v1/admin/analytics - Track admin action/event
 * 
 * Location: /app/api/v1/admin/analytics/route.ts
 */

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

function createErrorResponse(message: string, status: number): NextResponse {
  return NextResponse.json(
    { success: false, error: message } as ApiResponse<null>,
    { status, headers: { 'Content-Type': 'application/json', 'X-API-Version': 'v1' } }
  );
}

function createSuccessResponse<T>(data: T, message?: string): NextResponse {
  return NextResponse.json(
    { success: true, data, ...(message && { message }) } as ApiResponse<T>,
    { headers: { 'Content-Type': 'application/json', 'X-API-Version': 'v1' } }
  );
}

/**
 * Admin Analytics API - Climate Economy Assistant
 * RLHF analytics and conversation insights for admins
 * Location: app/api/v1/admin/analytics/route.ts
 */

// ========================================
// GET - Admin Analytics Dashboard
// ========================================

type MessageRole = 'user' | 'assistant';

interface Message {
  created_at: string;
  role: MessageRole;
}

interface Feedback {
  id: string;
  feedback_type: string;
  created_at: string;
  conversation_messages?: {
    content: string;
    role: MessageRole;
  };
  conversations?: {
    conversation_type: string;
    title: string;
  };
  [key: string]: unknown;
}

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

    // Check admin role
    if (user.user_metadata?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '7d'; // 1d, 7d, 30d
    const includeDetails = searchParams.get('include_details') === 'true';

    // Calculate date range based on timeframe
    const now = new Date();
    let startDate: Date;

    switch (timeframe) {
      case '1d':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default: // 7d
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const startDateStr = startDate.toISOString();

    // Get feedback analytics using the function we created
    const { data: feedbackAnalytics, error: feedbackError } = await supabase
      .rpc('get_feedback_analytics');

    if (feedbackError) {
      console.error('Error getting feedback analytics:', feedbackError);
    }

    // Get conversation type analytics
    const { data: conversationTypeAnalytics, error: typeError } = await supabase
      .rpc('get_conversation_type_analytics');

    if (typeError) {
      console.error('Error getting conversation type analytics:', typeError);
    }

    // Get recent conversations
    const { data: recentConversations, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .gte('created_at', startDateStr)
      .order('created_at', { ascending: false })
      .limit(100);

    if (convError) {
      console.error('Error getting recent conversations:', convError);
    }

    // Get message count by timeframe
    const { data: messages, error: msgError } = await supabase
      .from('conversation_messages')
      .select('created_at, role')
      .gte('created_at', startDateStr);

    if (msgError) {
      console.error('Error getting messages:', msgError);
    }

    // Get recent feedback
    const { data: recentFeedback, error: fbError } = await supabase
      .from('message_feedback')
      .select(`
        *,
        conversation_messages(content, role),
        conversations(conversation_type, title)
      `)
      .gte('created_at', startDateStr)
      .order('created_at', { ascending: false })
      .limit(50);

    if (fbError) {
      console.error('Error getting recent feedback:', fbError);
    }

    // Process message data for time-based analytics
    const messagesByDay: { [key: string]: { total: number; user: number; assistant: number } } = {};
    
    if (messages) {
      (messages as Message[]).forEach((msg) => {
        const date = new Date(msg.created_at).toISOString().split('T')[0];
        if (!messagesByDay[date]) {
          messagesByDay[date] = { total: 0, user: 0, assistant: 0 };
        }
        messagesByDay[date].total++;
        if (msg.role === 'user') messagesByDay[date].user++;
        if (msg.role === 'assistant') messagesByDay[date].assistant++;
      });
    }

    // Calculate totals
    const totalConversations = recentConversations?.length || 0;
    const totalMessages = messages?.length || 0;
    const totalFeedback = recentFeedback?.length || 0;

    // Build response
    const analytics: Record<string, unknown> = {
      timeframe,
      period: {
        start: startDateStr,
        end: now.toISOString()
      },
      overview: {
        total_conversations: totalConversations,
        total_messages: totalMessages,
        total_feedback: totalFeedback,
        avg_messages_per_conversation: totalConversations > 0 ? totalMessages / totalConversations : 0
      },
      feedback_analytics: feedbackAnalytics?.[0] || {
        total_messages: 0,
        total_feedback: 0,
        helpful_feedback: 0,
        not_helpful_feedback: 0,
        corrections_provided: 0,
        flagged_messages: 0,
        avg_rating: 0
      },
      conversation_types: conversationTypeAnalytics || [],
      messages_by_day: messagesByDay
    };

    // Add detailed data if requested
    if (includeDetails) {
      (analytics as Record<string, unknown>).details = {
        recent_conversations: recentConversations?.slice(0, 20) || [],
        recent_feedback: (recentFeedback as Feedback[])?.slice(0, 10) || [],
        top_issues: (recentFeedback as Feedback[])
          ?.filter((fb) => fb.feedback_type === 'flag' || fb.feedback_type === 'not_helpful')
          ?.slice(0, 10) || []
      };
    }

    return NextResponse.json({
      success: true,
      analytics,
      generated_at: now.toISOString(),
      message: 'Analytics retrieved successfully'
    });

  } catch (error) {
    console.error('Error getting admin analytics:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to get analytics'
      },
      { status: 500 }
    );
  }
}

// POST /api/v1/admin/analytics - Track admin action/event
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return createErrorResponse('Authentication required', 401);
    }

    // Check if user is admin
    const { data: adminProfile } = await supabase
      .from('admin_profiles')
      .select('can_view_analytics, can_manage_system')
      .eq('user_id', user.id)
      .single();

    if (!adminProfile || (!adminProfile.can_view_analytics && !adminProfile.can_manage_system)) {
      return createErrorResponse('Analytics access required', 403);
    }

    const body = await request.json();
    const {
      action_type,
      target_type,
      target_id,
      details,
      metadata
    } = body;

    // Validation
    if (!action_type?.trim()) {
      return createErrorResponse('Action type is required', 400);
    }

    const validActionTypes = [
      'create', 'update', 'delete', 'view', 'approve', 'reject', 
      'export', 'backup', 'restore', 'configure', 'moderate'
    ];
    if (!validActionTypes.includes(action_type)) {
      return createErrorResponse('Invalid action type', 400);
    }

    // Create analytics record
    const { data: analyticsRecord, error: createError } = await supabase
      .from('admin_analytics')
      .insert({
        admin_id: user.id,
        action_type: action_type.trim(),
        target_type: target_type?.trim() || null,
        target_id: target_id?.trim() || null,
        details: details?.trim() || null,
        metadata: metadata || {},
        performed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (createError) {
      console.error('Analytics tracking error:', createError);
      return createErrorResponse('Failed to track admin action', 500);
    }

    // Update admin profile with action count
    const { data: currentAdmin } = await supabase
      .from('admin_profiles')
      .select('total_admin_actions')
      .eq('id', user.id)
      .single();

    await supabase
      .from('admin_profiles')
      .update({
        last_admin_action: new Date().toISOString(),
        total_admin_actions: (currentAdmin?.total_admin_actions || 0) + 1
      })
      .eq('id', user.id);

    return createSuccessResponse(
      { analytics_id: analyticsRecord.id },
      'Admin action tracked successfully'
    );

  } catch (error) {
    console.error('POST /api/v1/admin/analytics error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
} 