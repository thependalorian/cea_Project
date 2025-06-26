/**
 * Individual Job API Routes - Climate Economy Assistant
 * 
 * Frontend proxy routes for individual job management:
 * - Get specific job listing by ID
 * - Update job listing by ID  
 * - Delete job listing by ID
 * 
 * Proxies requests to backend FastAPI endpoints at /api/v1/jobs/listings/{id}
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
 * GET /api/jobs/[id] - Get specific job listing by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const headers = await getAuthHeaders(request)
    const { id } = params
    
    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/jobs/listings/${id}`, {
      method: 'GET',
      headers
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to fetch job listing')
    }
    
    const result = await response.json()
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('Error fetching job listing:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch job listing' },
      { status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}

/**
 * PUT /api/jobs/[id] - Update job listing by ID
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const headers = await getAuthHeaders(request)
    const { id } = params
    const body = await request.json()
    
    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/jobs/listings/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body)
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to update job listing')
    }
    
    const result = await response.json()
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('Error updating job listing:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update job listing' },
      { status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}

/**
 * DELETE /api/jobs/[id] - Delete job listing by ID
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const headers = await getAuthHeaders(request)
    const { id } = params
    
    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/jobs/listings/${id}`, {
      method: 'DELETE',
      headers
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to delete job listing')
    }
    
    const result = await response.json()
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('Error deleting job listing:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete job listing' },
      { status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}