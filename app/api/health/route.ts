/**
 * Health Check API Endpoint
 * Purpose: Monitor application and external service health
 * Location: /app/api/health/route.ts
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  version: string
  environment: string
  services: {
    database: ServiceStatus
    redis: ServiceStatus
    auth: ServiceStatus
    external_apis: ServiceStatus
  }
  metrics: {
    response_time_ms: number
    memory_usage: NodeJS.MemoryUsage
    uptime_seconds: number
  }
}

interface ServiceStatus {
  status: 'up' | 'down' | 'degraded'
  response_time_ms?: number
  error?: string
  last_checked: string
}

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  const healthCheck: HealthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.VERCEL_GIT_COMMIT_SHA || 'development',
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: await checkDatabase(),
      redis: await checkRedis(),
      auth: await checkAuth(),
      external_apis: await checkExternalAPIs()
    },
    metrics: {
      response_time_ms: 0,
      memory_usage: process.memoryUsage(),
      uptime_seconds: process.uptime()
    }
  }

  // Calculate overall health status
  const serviceStatuses = Object.values(healthCheck.services).map(s => s.status)
  
  if (serviceStatuses.includes('down')) {
    healthCheck.status = 'unhealthy'
  } else if (serviceStatuses.includes('degraded')) {
    healthCheck.status = 'degraded'
  }

  healthCheck.metrics.response_time_ms = Date.now() - startTime

  const statusCode = healthCheck.status === 'healthy' ? 200 : 
                    healthCheck.status === 'degraded' ? 200 : 503

  return NextResponse.json(healthCheck, { status: statusCode })
}

async function checkDatabase(): Promise<ServiceStatus> {
  const startTime = Date.now()
  
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Simple query to test database connectivity
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)

    if (error) {
      return {
        status: 'down',
        error: error.message,
        last_checked: new Date().toISOString()
      }
    }

    const responseTime = Date.now() - startTime
    
    return {
      status: responseTime > 1000 ? 'degraded' : 'up',
      response_time_ms: responseTime,
      last_checked: new Date().toISOString()
    }
  } catch (error) {
    return {
      status: 'down',
      error: error instanceof Error ? error.message : 'Unknown error',
      last_checked: new Date().toISOString()
    }
  }
}

async function checkRedis(): Promise<ServiceStatus> {
  const startTime = Date.now()
  
  try {
    if (!process.env.REDIS_URL) {
      return {
        status: 'down',
        error: 'Redis URL not configured',
        last_checked: new Date().toISOString()
      }
    }

    // Use dynamic import to avoid build errors if Redis is not available
    const { createClient: createRedisClient } = await import('redis')
    
    const client = createRedisClient({
      url: process.env.REDIS_URL,
      socket: {
        connectTimeout: 5000
      }
    })

    // Test Redis connection
    await client.connect()
    await client.ping()
    await client.disconnect()
    
    const responseTime = Date.now() - startTime
    return {
      status: responseTime > 500 ? 'degraded' : 'up',
      response_time_ms: responseTime,
      last_checked: new Date().toISOString()
    }
  } catch (error) {
    return {
      status: 'down',
      error: error instanceof Error ? error.message : 'Redis connection failed',
      last_checked: new Date().toISOString()
    }
  }
}

async function checkAuth(): Promise<ServiceStatus> {
  const startTime = Date.now()
  
  try {
    // Check if required auth environment variables are set
    const requiredVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY'
    ]

    const missingVars = requiredVars.filter(varName => !process.env[varName])
    
    if (missingVars.length > 0) {
      return {
        status: 'down',
        error: `Missing environment variables: ${missingVars.join(', ')}`,
        last_checked: new Date().toISOString()
      }
    }

    const responseTime = Date.now() - startTime
    
    return {
      status: 'up',
      response_time_ms: responseTime,
      last_checked: new Date().toISOString()
    }
  } catch (error) {
    return {
      status: 'down',
      error: error instanceof Error ? error.message : 'Unknown error',
      last_checked: new Date().toISOString()
    }
  }
}

async function checkExternalAPIs(): Promise<ServiceStatus> {
  const startTime = Date.now()
  
  try {
    // Check if external API keys are configured
    const externalAPIs = [
      { name: 'OpenAI', env: 'OPENAI_API_KEY' },
      { name: 'GROQ', env: 'GROQ_API_KEY' },
      { name: 'DeepSeek', env: 'DEEPSEEK_API_KEY' },
      { name: 'Google', env: 'GOOGLE_API_KEY' },
      { name: 'Tavily', env: 'TAVILY_API_KEY' }
    ]

    const configuredAPIs = externalAPIs.filter(api => process.env[api.env])
    
    if (configuredAPIs.length === 0) {
      return {
        status: 'down',
        error: 'No external AI APIs configured',
        last_checked: new Date().toISOString()
      }
    }

    // Test OpenAI API if available
    if (process.env.OPENAI_API_KEY) {
      try {
        const response = await fetch('https://api.openai.com/v1/models', {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          signal: AbortSignal.timeout(5000)
        })
        
        if (!response.ok) {
          throw new Error(`OpenAI API returned ${response.status}`)
        }
      } catch (error) {
        return {
          status: 'degraded',
          error: `OpenAI API check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          last_checked: new Date().toISOString()
        }
      }
    }

    const responseTime = Date.now() - startTime
    
    return {
      status: 'up',
      response_time_ms: responseTime,
      last_checked: new Date().toISOString()
    }
  } catch (error) {
    return {
      status: 'down',
      error: error instanceof Error ? error.message : 'Unknown error',
      last_checked: new Date().toISOString()
    }
  }
}

// Simple health check for load balancers
export async function HEAD() {
  return new NextResponse(null, { status: 200 })
} 