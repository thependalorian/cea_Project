import { NextRequest, NextResponse } from 'next/server'
import createClient from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get user session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Get request body
    const body = await request.json()
    const { workflow_id, input_data, config = {} } = body
    
    if (!workflow_id || !input_data) {
      return NextResponse.json(
        { error: 'Workflow ID and input data are required' },
        { status: 400 }
      )
    }
    
    // Call backend LangGraph streaming service - FIXED: Updated to use correct /api/v1/langgraph/stream path
    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/langgraph/stream/${workflow_id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${user.id}`
      }
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to stream workflow')
    }
    
    // Return streaming response
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    })
    
  } catch (error) {
    console.error('Error streaming workflow:', error)
    return NextResponse.json(
      { error: 'Failed to stream workflow' },
      { status: 500 }
    )
  }
} 