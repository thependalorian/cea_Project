/**
 * Health Check API v1 - Climate Economy Assistant
 * Provides system health status and backend connectivity check
 * Location: app/api/v1/health/route.ts
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Python backend URL
const BACKEND_URL = process.env.PYTHON_BACKEND_URL || 'http://localhost:8000';

interface HealthCheckResponse {
  status: string;
  timestamp: string;
  services: {
    frontend: string;
    database: string;
    backend: string;
  };
    version: string;
    environment: string;
  backend?: any; // Optional backend health details
}

export async function GET() {
  const healthCheck: HealthCheckResponse = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      frontend: 'healthy',
      database: 'unknown',
      backend: 'unknown'
    },
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  };

  try {
    // Check Supabase connection
    const supabase = await createClient();
    try {
      const { data, error } = await supabase
        .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
        healthCheck.services.database = 'error';
        healthCheck.status = 'degraded';
      } else {
        healthCheck.services.database = 'healthy';
      }
    } catch (dbError) {
      console.error('Database health check failed:', dbError);
      healthCheck.services.database = 'error';
      healthCheck.status = 'degraded';
    }

    // Check Python backend health
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5-second timeout

      const backendResponse = await fetch(`${BACKEND_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (backendResponse.ok) {
        const backendData = await backendResponse.json();
        healthCheck.services.backend = 'healthy';
        healthCheck.backend = backendData; // Include backend health details
      } else {
        healthCheck.services.backend = 'error';
        healthCheck.status = 'degraded';
      }
    } catch (backendError) {
      console.error('Backend health check failed:', backendError);
      healthCheck.services.backend = 'error';
      healthCheck.status = 'degraded';
    }

    // Determine overall status
    const allHealthy = Object.values(healthCheck.services).every(service => service === 'healthy');
    if (!allHealthy && healthCheck.status !== 'degraded') {
      healthCheck.status = 'degraded';
    }

    // Return appropriate status code
    const statusCode = healthCheck.status === 'healthy' ? 200 : 503;
    
    return NextResponse.json(healthCheck, { status: statusCode });
    
  } catch (error) {
    console.error('Health check error:', error);
    
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      services: {
        frontend: 'error',
        database: 'unknown',
        backend: 'unknown'
      },
      error: 'Health check failed',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    }, { status: 503 });
  }
} 