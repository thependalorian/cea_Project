import { NextResponse } from 'next/server';

// Python backend URL
const BACKEND_URL = process.env.PYTHON_BACKEND_URL || 'http://localhost:8000';

export async function GET() {
  try {
    // Check Python backend health on correct port 8000
    const response = await fetch(`${BACKEND_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Set a timeout to avoid long waits if the service is down
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      return NextResponse.json({ status: 'ok' });
    } else {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      return NextResponse.json(
        { error: errorData.error || 'Backend service unavailable' },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      { error: 'Failed to connect to backend service' },
      { status: 503 }
    );
  }
} 