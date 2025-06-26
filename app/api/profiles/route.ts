/**
 * Profiles API Routes - Climate Economy Assistant
 * 
 * Frontend proxy routes for profile management endpoints including:
 * - Job seeker profiles
 * - Partner profiles  
 * - Admin profiles
 * - User interests
 * 
 * Proxies requests to backend FastAPI endpoints at /api/v1/profiles/*
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
 * GET /api/profiles - List profiles (route to job-seekers by default)
 */
export async function GET(request: NextRequest) {
  try {
    const headers = await getAuthHeaders(request)
    const { searchParams } = new URL(request.url)
    
    const queryString = searchParams.toString()
    const url = `${process.env.BACKEND_URL}/api/v1/profiles/job-seekers${queryString ? `?${queryString}` : ''}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to fetch profiles')
    }
    
    const result = await response.json()
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('Error fetching profiles:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch profiles' },
      { status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
} 