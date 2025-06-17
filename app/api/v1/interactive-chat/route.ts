/**
 * Interactive Chat API Endpoint
 * 
 * Handles AI-powered chat conversations for climate career guidance
 * 
 * Location: app/api/v1/interactive-chat/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

interface ChatRequest {
  message: string;
  conversation_id?: string;
  context?: {
    user_type?: string;
    career_interests?: string[];
    location?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { message, conversation_id, context } = body;

    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Message content is required'
        },
        { status: 400 }
      );
    }

    const cookieStore = cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });
    
    // Get current user (optional for chat)
    const { data: { user } } = await supabase.auth.getUser();

    // Generate a simple AI response (TODO: Integrate with OpenAI or Claude)
    const aiResponse = generateSimpleResponse(message, context);

    // Store conversation in database if user is authenticated
    let conversationData = null;
    if (user) {
      try {
        // Create or update conversation
        const { data: conversation, error: convError } = await supabase
          .from('conversations')
          .upsert({
            id: conversation_id || undefined,
            user_id: user.id,
            title: generateConversationTitle(message),
            updated_at: new Date().toISOString()
          })
          .select('id')
          .single();

        if (!convError && conversation) {
          // Store user message
          await supabase
            .from('conversation_messages')
            .insert({
              conversation_id: conversation.id,
              role: 'user',
              content: message,
              timestamp: new Date().toISOString()
            });

          // Store AI response
          await supabase
            .from('conversation_messages')
            .insert({
              conversation_id: conversation.id,
              role: 'assistant',
              content: aiResponse,
              timestamp: new Date().toISOString()
            });

          conversationData = {
            id: conversation.id,
            user_id: user.id
          };
        }
      } catch (dbError) {
        console.error('Database error storing conversation:', dbError);
        // Continue without storing if DB fails
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        response: aiResponse,
        conversation_id: conversationData?.id || conversation_id,
        timestamp: new Date().toISOString(),
        message_id: generateMessageId()
      }
    });

  } catch (error) {
    console.error('Interactive chat API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred processing your chat message',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function generateSimpleResponse(message: string, context?: any): string {
  const lowerMessage = message.toLowerCase();
  
  // Climate career-focused responses
  if (lowerMessage.includes('job') || lowerMessage.includes('career')) {
    return "I can help you explore exciting opportunities in the climate economy! Massachusetts has a thriving clean energy sector with jobs in solar installation, wind technology, energy efficiency, and environmental consulting. What specific area interests you most?";
  }
  
  if (lowerMessage.includes('salary') || lowerMessage.includes('pay')) {
    return "Climate jobs in Massachusetts offer competitive salaries! Entry-level positions in renewable energy typically start at $45-55k, while experienced professionals can earn $70-120k+. The industry is growing rapidly, creating excellent advancement opportunities.";
  }
  
  if (lowerMessage.includes('skill') || lowerMessage.includes('training')) {
    return "Great question! Key skills for climate careers include project management, data analysis, technical writing, and knowledge of sustainability practices. Many roles also value certifications in LEED, energy auditing, or renewable energy technologies. Would you like specific training recommendations?";
  }
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return "Hello! I'm your Climate Economy Assistant. I'm here to help you navigate career opportunities in Massachusetts' growing clean energy and sustainability sectors. How can I assist you today?";
  }
  
  // Default response
  return "Thank you for your question about climate careers! I'm here to help you explore opportunities in Massachusetts' clean energy economy. Whether you're interested in solar installation, energy efficiency, environmental consulting, or policy work, I can provide guidance on career paths, skills needed, and job opportunities. What would you like to know more about?";
}

function generateConversationTitle(message: string): string {
  const words = message.split(' ').slice(0, 6).join(' ');
  return words.length > 50 ? words.substring(0, 47) + '...' : words;
}

function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export async function GET(request: NextRequest) {
  // Get conversation history
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversation_id');
    
    if (!conversationId) {
      return NextResponse.json(
        { success: false, message: 'Conversation ID is required' },
        { status: 400 }
      );
    }

    const cookieStore = cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { data: messages, error } = await supabase
      .from('conversation_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('timestamp', { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: {
        messages: messages || [],
        conversation_id: conversationId
      }
    });

  } catch (error) {
    console.error('Get conversation error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to retrieve conversation',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
} 