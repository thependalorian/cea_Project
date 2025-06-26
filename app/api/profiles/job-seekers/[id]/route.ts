/**
 * Individual Job Seeker Profile API Routes - Climate Economy Assistant
 * 
 * Frontend proxy routes for individual job seeker profile management:
 * - Get specific job seeker profile by ID
 * - Update job seeker profile by ID
 * - Delete job seeker profile by ID
 * 
 * Proxies requests to backend FastAPI endpoints at /api/v1/profiles/job-seekers/{id}
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
 * GET /api/profiles/job-seekers/[id] - Get specific job seeker profile by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const headers = await getAuthHeaders(request)
    const { id } = params
    
    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/profiles/job-seekers/${id}`, {
      method: 'GET',
      headers
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to fetch job seeker profile')
    }
    
    const result = await response.json()
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('Error fetching job seeker profile:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch job seeker profile' },
      { status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}

/**
 * PUT /api/profiles/job-seekers/[id] - Update job seeker profile by ID
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const headers = await getAuthHeaders(request)
    const { id } = params
    const body = await request.json()
    
    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/profiles/job-seekers/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body)
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to update job seeker profile')
    }
    
    const result = await response.json()
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('Error updating job seeker profile:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update job seeker profile' },
      { status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}

/**
 * DELETE /api/profiles/job-seekers/[id] - Delete job seeker profile by ID
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const headers = await getAuthHeaders(request)
    const { id } = params
    
    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/profiles/job-seekers/${id}`, {
      method: 'DELETE',
      headers
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to delete job seeker profile')
    }
    
    const result = await response.json()
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('Error deleting job seeker profile:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete job seeker profile' },
      { status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
} 