/**
 * Conversation Analytics API Routes - Climate Economy Assistant
 * 
 * Frontend proxy routes for conversation analytics:
 * - Conversation metrics and insights
 * - User feedback on conversations
 * - Performance analytics
 * 
 * Proxies requests to backend FastAPI endpoints at /api/v1/analytics/conversations
 */

import { NextRequest, NextResponse } from 'next/server'
import createClient from '@/lib/supabase/server'

/**
 * Get authentication headers from request
 */
async function getAuthHeaders(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    throw new Error('Unauthorized')
  }
  
  return {
    'Authorization': `Bearer ${user.id}`,
    'Content-Type': 'application/json'
  }
}

/**
 * GET /api/analytics/conversations - Get conversation analytics
 */
export async function GET(request: NextRequest) {
  try {
    const headers = await getAuthHeaders(request)
    const { searchParams } = new URL(request.url)
    
    // Forward query parameters for filtering and date ranges
    const queryString = searchParams.toString()
    const url = `${process.env.BACKEND_URL}/api/v1/analytics/conversations${queryString ? `?${queryString}` : ''}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to fetch conversation analytics')
    }
    
    const result = await response.json()
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('Error fetching conversation analytics:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch conversation analytics' },
      { status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}

/**
 * POST /api/analytics/conversations - Create conversation analytics entry
 */
export async function POST(request: NextRequest) {
  try {
    const headers = await getAuthHeaders(request)
    const body = await request.json()
    
    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/analytics/conversations`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to create conversation analytics')
    }
    
    const result = await response.json()
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('Error creating conversation analytics:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create conversation analytics' },
      { status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}