/**
 * Individual User API Routes - Climate Economy Assistant
 * 
 * Frontend proxy routes for individual user management:
 * - Get specific user by ID
 * - Update user by ID
 * - Delete user by ID
 * 
 * Proxies requests to backend FastAPI endpoints at /api/v1/users/{userId}
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
 * GET /api/users/[userId] - Get specific user by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const headers = await getAuthHeaders(request)
    const { userId } = params
    
    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/users/${userId}`, {
      method: 'GET',
      headers
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to fetch user')
    }
    
    const result = await response.json()
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch user' },
      { status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}

/**
 * PUT /api/users/[userId] - Update user by ID
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const headers = await getAuthHeaders(request)
    const { userId } = params
    const body = await request.json()
    
    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/users/${userId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body)
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to update user')
    }
    
    const result = await response.json()
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update user' },
      { status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}

/**
 * DELETE /api/users/[userId] - Delete user by ID
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const headers = await getAuthHeaders(request)
    const { userId } = params
    
    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/users/${userId}`, {
      method: 'DELETE',
      headers
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to delete user')
    }
    
    const result = await response.json()
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete user' },
      { status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}