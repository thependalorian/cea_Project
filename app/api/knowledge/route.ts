/**
 * Knowledge Resources API Routes - Climate Economy Assistant
 * 
 * Frontend proxy routes for knowledge management endpoints including:
 * - Knowledge resources CRUD
 * - Resource views tracking
 * - Content flags and moderation
 * - Resource analytics
 * 
 * Proxies requests to backend FastAPI endpoints at /api/v1/resources/*
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
 * GET /api/knowledge - List all knowledge resources
 */
export async function GET(request: NextRequest) {
  try {
    const headers = await getAuthHeaders(request)
    const { searchParams } = new URL(request.url)
    
    const queryString = searchParams.toString()
    const url = `${process.env.BACKEND_URL}/api/v1/resources/knowledge/resources${queryString ? `?${queryString}` : ''}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to fetch knowledge resources')
    }
    
    const result = await response.json()
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('Error fetching knowledge resources:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch knowledge resources' },
      { status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}

/**
 * POST /api/knowledge - Create a new knowledge resource
 */
export async function POST(request: NextRequest) {
  try {
    const headers = await getAuthHeaders(request)
    const body = await request.json()
    
    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/resources/knowledge/resources`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to create knowledge resource')
    }
    
    const result = await response.json()
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('Error creating knowledge resource:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create knowledge resource' },
      { status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}
