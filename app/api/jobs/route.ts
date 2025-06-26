/**
 * Jobs API Routes - Climate Economy Assistant
 * 
 * Frontend proxy routes for job management endpoints including:
 * - Job listings CRUD operations
 * - Job matching algorithms
 * - Partner match results
 * - Job approval workflows
 * 
 * Proxies requests to backend FastAPI endpoints at /api/v1/jobs/*
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
 * GET /api/jobs - List all job listings with pagination and filtering
 */
export async function GET(request: NextRequest) {
  try {
    const headers = await getAuthHeaders(request)
    const { searchParams } = new URL(request.url)
    
    // Forward query parameters for pagination and filtering
    const queryString = searchParams.toString()
    const url = `${process.env.BACKEND_URL}/api/v1/jobs/listings${queryString ? `?${queryString}` : ''}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to fetch job listings')
    }
    
    const result = await response.json()
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('Error fetching job listings:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch job listings' },
      { status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}

/**
 * POST /api/jobs - Create a new job listing
 */
export async function POST(request: NextRequest) {
  try {
    const headers = await getAuthHeaders(request)
    const body = await request.json()
    
    const response = await fetch(`${process.env.BACKEND_URL}/api/v1/jobs/listings`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to create job listing')
    }
    
    const result = await response.json()
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('Error creating job listing:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create job listing' },
      { status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}