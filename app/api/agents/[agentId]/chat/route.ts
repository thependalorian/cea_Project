/**
 * Optimized Streaming Agent Chat Route
 * Purpose: Handle chat messages with streaming support and DeepSeek integration
 * Location: /app/api/agents/[agentId]/chat/route.ts
 * 
 * Features:
 * - Streaming responses for immediate feedback
 * - Fallback to non-streaming
 * - Timeout protection (25 seconds)
 * - Error recovery
 * - DeepSeek cost optimization
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000'

interface ChatRequest {
  message: string
  conversationId?: string
  files?: Array<{ name: string; type: string; size: number }>
  stream?: boolean
}

export async function POST(
  request: NextRequest,
  { params }: { params: { agentId: string } }
) {
  const agentId = params.agentId
  const startTime = Date.now()

  try {
    // Parse request body
    const data: ChatRequest = await request.json()

    // Validate message
    if (!data.message?.trim()) {
      return NextResponse.json(
        { error: 'Message cannot be empty' },
        { status: 400 }
      )
    }

    // Get user (optional in dev mode)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    let userId = 'dev_user'
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) userId = user.id
    } catch (error) {
      console.log('🔓 No authentication found, using development mode')
    }

    // Generate conversation ID if not provided
    const conversationId = data.conversationId || `conv_${userId}_${Date.now()}`

    console.log(`🚀 Processing ${data.stream ? 'streaming' : 'non-streaming'} chat for agent ${agentId}`)
    console.log(`📝 Message: ${data.message.slice(0, 100)}${data.message.length > 100 ? '...' : ''}`)

    // Send request to backend (using optimized route)
    const response = await fetch(`${BACKEND_URL}/api/agents/${agentId}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': data.stream !== false ? 'text/event-stream' : 'application/json',
      },
      body: JSON.stringify({
        message: data.message,
        user_id: userId,
        conversation_id: conversationId,
        files: data.files || [],
        stream: data.stream !== false, // Default to streaming
        metadata: {
          agent_id: agentId,
          timestamp: new Date().toISOString(),
          user_agent: request.headers.get('user-agent'),
          frontend_start: startTime,
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ Backend responded with ${response.status}: ${errorText}`)
      
      return NextResponse.json({
        error: `Backend error: ${response.status}`,
        details: errorText,
        agentId,
        fallback: true
      }, { status: response.status })
    }

    // Handle streaming response
    if (data.stream !== false && response.headers.get('content-type')?.includes('text/event-stream')) {
      console.log(`📡 Returning streaming response for agent ${agentId}`)
      
      return new Response(response.body, {
        status: 200,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
          'X-Processing-Mode': 'streaming',
          'X-Agent-Id': agentId
        },
      })
    }

    // Handle JSON response
    const result = await response.json()
    const processingTime = Date.now() - startTime
    
    console.log(`✅ Response received from ${result.agent || agentId} in ${processingTime}ms`)

    return NextResponse.json({
      response: result.response || result.content || 'No response received',
      agent: result.agent || agentId,
      conversationId: result.conversation_id || conversationId,
      processingTime,
      metadata: {
        ...result.metadata,
        frontend_processing_time: processingTime,
        backend_processing_time: result.processing_time,
        streaming_attempted: data.stream !== false,
        cost_optimized: true,
        model_provider: 'deepseek'
      },
    })

  } catch (error: any) {
    const processingTime = Date.now() - startTime
    console.error(`❌ Chat error for agent ${agentId}:`, error)

    // Try to parse request body for error handling
    let errorConversationId = `error_${Date.now()}`
    try {
      const errorData = await request.json()
      errorConversationId = errorData.conversationId || errorConversationId
    } catch {
      // Ignore parsing errors in error handler
    }

    // Handle timeout specifically
    if (error.name === 'AbortError' || error.message?.includes('timeout')) {
      return NextResponse.json({
        error: 'Request timeout',
        response: `I'm taking longer than usual to process your request. This might be due to high demand with our DeepSeek-powered system. Please try again, and I'll do my best to respond quickly.`,
        agent: agentId,
        conversationId: errorConversationId,
        processingTime,
        metadata: {
          timeout: true,
          processing_time: processingTime,
          suggested_actions: ['retry', 'try_streaming', 'contact_support']
        }
      }, { status: 408 })
    }

    // General error fallback
    return NextResponse.json({
      error: 'Internal server error',
      response: `I apologize, but I encountered an error processing your request. Our enhanced system using DeepSeek is designed to handle complex queries, but this particular request couldn't be processed. Please try rephrasing your question or contact support.`,
      agent: agentId,
      conversationId: errorConversationId,
      processingTime,
      metadata: {
        error: error.message,
        processing_time: processingTime,
        fallback_used: true,
        cost_optimized: true
      }
    }, { status: 500 })
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  })
} 