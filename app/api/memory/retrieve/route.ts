/**
 * Memory Retrieve API Route
 * Location: /app/api/memory/retrieve/route.ts
 * Purpose: Retrieve specific memory entries by ID
 */

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const memoryId = searchParams.get('memory_id')
    
    if (!memoryId) {
      return NextResponse.json(
        { error: 'Memory ID is required' },
        { status: 400 }
      )
    }

    // Call backend memory retrieve service
    const response = await fetch(
      `${process.env.BACKEND_URL}/api/v1/memory/retrieve/${memoryId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to retrieve memory')
    }

    const result = await response.json()
    return NextResponse.json(result)

  } catch (error) {
    console.error('Error retrieving memory:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve memory' },
      { status: 500 }
    )
  }
} 