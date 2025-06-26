/**
 * Agents API Route - Proxy to Backend
 * Purpose: Proxy agent requests to FastAPI backend where agent logic belongs
 * Location: /app/api/agents/route.ts
 */

import { NextRequest, NextResponse } from 'next/server'
import createClient from '@/lib/supabase/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get auth token for backend
    const { data: { session } } = await supabase.auth.getSession()
    const authToken = session?.access_token || ''

    // Proxy request to FastAPI backend
    const response = await fetch(`${BACKEND_URL}/api/v1/agents/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
        'X-User-ID': user.id
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { 
          error: 'Backend error',
          detail: errorData.detail || `HTTP ${response.status}`,
          status: response.status
        },
        { status: response.status }
      )
    }

    const agentsData = await response.json()
    return NextResponse.json(agentsData)
    
  } catch (error) {
    console.error('Error proxying agents request:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch agents',
        detail: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 