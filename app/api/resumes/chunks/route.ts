/**
 * Resume Chunks API Routes - Climate Economy Assistant
 * 
 * Frontend proxy routes for resume processing:
 * - Resume content chunking
 * - Resume analysis
 * - Content optimization
 * 
 * Proxies requests to backend FastAPI endpoints at /api/v1/resumes/chunks
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
 * GET /api/resumes/chunks - Get resume chunks
 */
export async function GET(request: NextRequest) {
  try {
    const headers = await getAuthHeaders(request)
    const { searchParams } = new URL(request.url)
    
    // Forward query parameters for filtering
    const queryString = searchParams.toString()
    const url = `${process.env.BACKEND_URL}/api/v1/resumes/chunks${queryString ? `?${queryString}` : ''}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to fetch resume chunks')
    }
    
    const result = await response.json()
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('Error fetching resume chunks:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch resume chunks' },
      { status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}

/**
 * POST /api/resumes/chunks - Create resume chunks
 */
export async function POST(request: NextRequest) {
  try {
    const headers = await getAuthHeaders(request)
    const body = await request.json()
    
    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/resumes/chunks`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to create resume chunks')
    }
    
    const result = await response.json()
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('Error creating resume chunks:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create resume chunks' },
      { status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
} 