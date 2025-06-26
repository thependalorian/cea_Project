import { NextRequest, NextResponse } from 'next/server'
import createClient from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
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
    
    const { searchParams } = new URL(request.url)
    const runId = searchParams.get('run_id')
    
    if (!runId) {
      return NextResponse.json(
        { error: 'Run ID is required' },
        { status: 400 }
      )
    }
    
    // Call backend LangGraph status service
    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/langgraph/status/${runId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${user.id}`
      }
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to get workflow status')
    }
    
    const result = await response.json()
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('Error getting workflow status:', error)
    return NextResponse.json(
      { error: 'Failed to get workflow status' },
      { status: 500 }
    )
  }
} 