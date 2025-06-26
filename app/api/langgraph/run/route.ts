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
    
    // Call backend LangGraph service - FIXED: Updated to use correct /api/v1/langgraph/run path
    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/langgraph/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.id}` // Use user ID as auth token for now
      },
      body: JSON.stringify({
        workflow_id,
        input_data: {
          ...input_data,
          user_id: user.id
        },
        config
      })
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to run workflow')
    }
    
    const result = await response.json()
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('Error running workflow:', error)
    return NextResponse.json(
      { error: 'Failed to run workflow' },
      { status: 500 }
    )
  }
}