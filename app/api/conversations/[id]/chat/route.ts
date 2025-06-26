/**
 * Chat API Route - Proxy to Backend
 * Purpose: Proxy chat requests to FastAPI backend where agent logic belongs
 * Location: /app/api/conversations/[id]/chat/route.ts
 */

import createClient from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { message, agent_id } = body

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Verify the conversation belongs to the user
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('user_id')
      .eq('id', params.id)
      .single()

    if (convError || !conversation || conversation.user_id !== user.id) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // Get auth token for backend
    const { data: { session } } = await supabase.auth.getSession()
    const authToken = session?.access_token || ''

    // Proxy to backend agent chat endpoint (UPDATED to use optimized route)
    const backendUrl = agent_id 
      ? `${BACKEND_URL}/api/agents/${agent_id}/chat`
      : `${BACKEND_URL}/api/v1/coordinator/chat`

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
        'X-User-ID': user.id
      },
      body: JSON.stringify({
        message,
        conversation_id: params.id,
        metadata: {
          frontend_route: 'chat',
          timestamp: new Date().toISOString()
        }
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Backend chat error:', errorData)
      
      return NextResponse.json(
        { 
          error: 'Backend chat error',
          detail: errorData.detail || `HTTP ${response.status}`,
          status: response.status
        },
        { status: response.status }
      )
    }

    const chatResponse = await response.json()

    // Store the conversation in our database for sync
    try {
      await supabase
        .from('conversations')
        .update({ 
          last_activity: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', params.id)
    } catch (updateError) {
      console.error('Failed to update conversation timestamp:', updateError)
      // Don't fail the request for this
    }

    return NextResponse.json({
      ...chatResponse,
      conversation_id: params.id,
      processed_by: 'backend'
    }, { status: 201 })

  } catch (error) {
    console.error('Error in chat proxy:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 