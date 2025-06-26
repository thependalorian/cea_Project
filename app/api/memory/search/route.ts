/**
 * Memory Search API Route
 * Location: /app/api/memory/search/route.ts
 * Purpose: Search memory entries for conversation context
 */

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Call backend memory search service
    const response = await fetch(
      `${process.env.BACKEND_URL}/api/v1/memory/memory/search`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to search memory')
    }

    const result = await response.json()
    return NextResponse.json(result)

  } catch (error) {
    console.error('Error searching memory:', error)
    return NextResponse.json(
      { error: 'Failed to search memory' },
      { status: 500 }
    )
  }
} 