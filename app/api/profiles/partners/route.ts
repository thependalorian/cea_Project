/**
 * Partner Profile API Routes - Climate Economy Assistant
 * 
 * Frontend proxy routes for partner profile management:
 * - Create partner organization profiles
 * - List partner profiles
 * - Partner search and filtering
 * 
 * Proxies requests to backend FastAPI endpoints at /api/v1/profiles/partners
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
 * GET /api/profiles/partners - List partner profiles
 */
export async function GET(request: NextRequest) {
  try {
    const headers = await getAuthHeaders(request)
    const { searchParams } = new URL(request.url)
    
    // Forward query parameters for pagination and filtering
    const queryString = searchParams.toString()
    const url = `${process.env.BACKEND_URL}/api/v1/profiles/partners${queryString ? `?${queryString}` : ''}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to fetch partner profiles')
    }
    
    const result = await response.json()
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('Error fetching partner profiles:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch partner profiles' },
      { status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}

/**
 * POST /api/profiles/partners - Create a new partner profile
 */
export async function POST(request: NextRequest) {
  try {
    const headers = await getAuthHeaders(request)
    const body = await request.json()
    
    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/profiles/partners`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to create partner profile')
    }
    
    const result = await response.json()
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('Error creating partner profile:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create partner profile' },
      { status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
} 