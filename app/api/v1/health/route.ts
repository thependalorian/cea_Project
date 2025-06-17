/**
 * Health Check API Endpoint
 * 
 * Provides system health status for monitoring and debugging
 * 
 * Location: app/api/v1/health/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const healthStatus = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: 'connected', // TODO: Add actual Supabase health check
        auth: 'operational',
        api: 'running'
      },
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
      }
    };

    return NextResponse.json(healthStatus, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json(
      { 
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

export async function HEAD(request: NextRequest) {
  // Quick health check for load balancers
  return new NextResponse(null, { status: 200 });
} 