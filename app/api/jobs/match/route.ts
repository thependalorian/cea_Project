/**
 * Job Matching API Routes - Climate Economy Assistant
 * 
 * Frontend proxy routes for job matching functionality:
 * - Run job matching algorithms
 * - Get user job matches
 * - Partner match results
 * 
 * Proxies requests to backend FastAPI endpoints at /api/v1/jobs/match
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
 * POST /api/jobs/match - Run job matching algorithm
 */
export async function POST(request: NextRequest) {
  try {
    const headers = await getAuthHeaders(request)
    const body = await request.json()
    
    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/jobs/match`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to run job matching')
    }
    
    const result = await response.json()
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('Error running job matching:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to run job matching' },
      { status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
} 