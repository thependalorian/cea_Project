/**
 * Job Search API Routes - Climate Economy Assistant
 * 
 * Frontend proxy routes for job search functionality:
 * - Advanced job search with filters
 * - Location-based search
 * - Skills and experience matching
 * 
 * Proxies requests to backend FastAPI endpoints at /api/v1/jobs/search
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
 * GET /api/jobs/search - Search jobs with advanced filtering
 */
export async function GET(request: NextRequest) {
  try {
    const headers = await getAuthHeaders(request)
    const { searchParams } = new URL(request.url)
    
    // Forward all query parameters for search filtering
    const queryString = searchParams.toString()
    const url = `${process.env.BACKEND_URL}/api/v1/jobs/search${queryString ? `?${queryString}` : ''}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to search jobs')
    }
    
    const result = await response.json()
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('Error searching jobs:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to search jobs' },
      { status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
} 