/**
 * Memory Store API Route
 * Location: /app/api/memory/store/route.ts
 * Purpose: Store conversation memories for future retrieval
 */

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Call backend memory store service
    const response = await fetch(
      `${process.env.BACKEND_URL}/api/v1/memory/memory/store`,
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
      throw new Error(error.detail || 'Failed to store memory')
    }

    const result = await response.json()
    return NextResponse.json(result)

  } catch (error) {
    console.error('Error storing memory:', error)
    return NextResponse.json(
      { error: 'Failed to store memory' },
      { status: 500 }
    )
  }
} 