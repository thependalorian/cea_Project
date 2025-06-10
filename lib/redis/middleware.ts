/**
 * Redis Middleware - Climate Economy Assistant
 * Middleware for rate limiting, session management, and request caching
 * Location: lib/redis/middleware.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import { sessionManager } from './session';
import { cache } from './cache';

export interface MiddlewareOptions {
  rateLimit?: {
    requests: number;
    windowMs: number;
    skipSuccessfulRequests?: boolean;
  };
  requireAuth?: boolean;
  cacheResponse?: {
    ttl: number;
    keyGenerator?: (request: NextRequest) => string;
  };
}

export class RedisMiddleware {
  /**
   * Rate limiting middleware
   */
  static async rateLimit(
    request: NextRequest,
    options: { requests: number; windowMs: number; skipSuccessfulRequests?: boolean } = {
      requests: 100,
      windowMs: 3600000, // 1 hour
    }
  ): Promise<NextResponse | null> {
    try {
      const identifier = this.getClientIdentifier(request);
      const current = await sessionManager.incrementRateLimit(identifier, options.windowMs);
      
      if (current > options.requests) {
        return NextResponse.json({
          error: 'Too many requests',
          limit: options.requests,
          current,
          resetTime: Date.now() + options.windowMs,
        }, { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': options.requests.toString(),
            'X-RateLimit-Remaining': Math.max(0, options.requests - current).toString(),
            'X-RateLimit-Reset': new Date(Date.now() + options.windowMs).toISOString(),
          },
        });
      }

      return null; // Continue processing
    } catch (error) {
      console.error('Rate limit middleware error:', error);
      return null; // Continue processing on Redis error
    }
  }

  /**
   * Session validation middleware
   */
  static async validateSession(request: NextRequest): Promise<{
    valid: boolean;
    userId?: string;
    session?: unknown;
  }> {
    try {
      const authHeader = request.headers.get('authorization');
      if (!authHeader?.startsWith('Bearer ')) {
        return { valid: false };
      }

      // Extract user ID from token (you'll need to implement JWT validation)
      const token = authHeader.split(' ')[1];
      const userId = await this.getUserIdFromToken(token);
      
      if (!userId) {
        return { valid: false };
      }

      const session = await sessionManager.getUserSession(userId);
      if (!session) {
        return { valid: false };
      }

      // Update last activity
      await sessionManager.updateSessionActivity(userId);

      return {
        valid: true,
        userId,
        session: session as unknown,
      };
    } catch (error) {
      console.error('Session validation error:', error);
      return { valid: false };
    }
  }

  /**
   * Response caching middleware
   */
  static async cacheResponse(
    request: NextRequest,
    response: NextResponse,
    options: { ttl: number; keyGenerator?: (request: NextRequest) => string }
  ): Promise<void> {
    try {
      const cacheKey = options.keyGenerator 
        ? options.keyGenerator(request)
        : this.generateCacheKey(request);

      const responseData = await response.json();
      await cache.set(cacheKey, responseData, { ttl: options.ttl });
    } catch (error) {
      console.error('Response caching error:', error);
    }
  }

  /**
   * Get cached response
   */
  static async getCachedResponse(
    request: NextRequest,
    keyGenerator?: (request: NextRequest) => string
  ): Promise<Record<string, unknown> | null> {
    try {
      const cacheKey = keyGenerator 
        ? keyGenerator(request)
        : this.generateCacheKey(request);

      return await cache.get(cacheKey);
    } catch (error) {
      console.error('Cache retrieval error:', error);
      return null;
    }
  }

  /**
   * Track API usage for analytics
   */
  static async trackAPIUsage(
    request: NextRequest,
    response: NextResponse,
    userId?: string
  ): Promise<void> {
    try {
      const usage = {
        method: request.method,
        url: request.url,
        userAgent: request.headers.get('user-agent'),
        userId,
        statusCode: response.status,
        timestamp: new Date(),
        responseTime: Date.now(), // You'd need to calculate actual response time
      };

      const today = new Date().toISOString().split('T')[0];
      const usageKey = `usage:${today}`;
      
      await cache.listPush(usageKey, usage, { ttl: 86400 * 7 }); // Keep for 7 days
    } catch (error) {
      console.error('API usage tracking error:', error);
    }
  }

  /**
   * Store user preferences in Redis
   */
  static async setUserPreferences(
    userId: string,
    preferences: Record<string, unknown>
  ): Promise<boolean> {
    return await sessionManager.setUserPreferences(userId, preferences);
  }

  /**
   * Get user preferences from Redis
   */
  static async getUserPreferences(userId: string): Promise<Record<string, unknown> | null> {
    return await sessionManager.getUserPreferences(userId);
  }

  /**
   * Cache job search results
   */
  static async cacheJobSearch(
    userId: string,
    query: string,
    filters: Record<string, unknown>,
    results: unknown[]
  ): Promise<void> {
    const searchKey = this.generateSearchKey(query, filters);
    await sessionManager.cacheJobSearch(userId, searchKey, {
      query,
      filters,
      results,
      timestamp: new Date(),
      totalResults: results.length,
    });
  }

  /**
   * Get cached job search results
   */
  static async getCachedJobSearch(
    userId: string,
    query: string,
    filters: Record<string, unknown>
  ): Promise<unknown | null> {
    const searchKey = this.generateSearchKey(query, filters);
    return await sessionManager.getCachedJobSearch(userId, searchKey);
  }

  /**
   * Store chat context for AI conversations
   */
  static async storeChatContext(
    sessionId: string,
    context: {
      userId?: string;
      topic?: string;
      jobPreferences?: Record<string, unknown>;
      recentSearches?: unknown[];
    }
  ): Promise<void> {
    await cache.set(`chat_context:${sessionId}`, context, { ttl: 3600 }); // 1 hour
  }

  /**
   * Get chat context
   */
  static async getChatContext(sessionId: string): Promise<Record<string, unknown> | null> {
    return await cache.get(`chat_context:${sessionId}`);
  }

  /**
   * Helper: Get client identifier for rate limiting
   */
  private static getClientIdentifier(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ip = forwarded?.split(',')[0] || realIp || 'unknown';
    
    // Optionally include user ID if authenticated
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      return `${ip}:${authHeader.slice(0, 20)}`; // Truncated for security
    }
    
    return ip;
  }

  /**
   * Helper: Generate cache key for requests
   */
  private static generateCacheKey(request: NextRequest): string {
    const url = new URL(request.url);
    const params = Array.from(url.searchParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    
    return `cache:${request.method}:${url.pathname}:${params}`;
  }

  /**
   * Helper: Generate search key for job search caching
   */
  private static generateSearchKey(query: string, filters: Record<string, unknown>): string {
    const filterString = Object.keys(filters)
      .sort()
      .map(key => `${key}:${filters[key]}`)
      .join('|');
    
    return `${query}:${filterString}`.toLowerCase().replace(/\s+/g, '_');
  }

  /**
   * Helper: Extract user ID from JWT token (implement according to your auth system)
   */
  private static async getUserIdFromToken(token: string): Promise<string | null> {
    // This is a placeholder - implement according to your JWT handling
    try {
      // You would typically decode and validate the JWT here
      // For now, returning null to indicate implementation needed
      return null;
    } catch {
      return null;
    }
  }
}

/**
 * Higher-order function to wrap API routes with Redis middleware
 */
export function withRedisMiddleware(
  handler: (request: NextRequest) => Promise<NextResponse>,
  options: MiddlewareOptions = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // Check for cached response first
      if (options.cacheResponse) {
        const cached = await RedisMiddleware.getCachedResponse(
          request,
          options.cacheResponse.keyGenerator
        );
        
        if (cached) {
          return NextResponse.json(cached, {
            headers: { 'X-Cache': 'HIT' },
          });
        }
      }

      // Apply rate limiting
      if (options.rateLimit) {
        const rateLimitResponse = await RedisMiddleware.rateLimit(request, options.rateLimit);
        if (rateLimitResponse) {
          return rateLimitResponse;
        }
      }

      // Validate session if required
      if (options.requireAuth) {
        const sessionValidation = await RedisMiddleware.validateSession(request);
        if (!sessionValidation.valid) {
          return NextResponse.json({
            error: 'Authentication required',
          }, { status: 401 });
        }
        
        // Add user info to request headers for the handler
        request.headers.set('x-user-id', sessionValidation.userId!);
      }

      // Execute the actual handler
      const response = await handler(request);

      // Cache successful responses
      if (options.cacheResponse && response.status < 400) {
        await RedisMiddleware.cacheResponse(request, response, options.cacheResponse);
      }

      // Track API usage
      const userId = request.headers.get('x-user-id');
      if (userId) {
        await RedisMiddleware.trackAPIUsage(request, response, userId);
      }

      return response;
    } catch (error) {
      console.error('Redis middleware error:', error);
      // Return the original handler result on middleware error
      return await handler(request);
    }
  };
}

export default RedisMiddleware; 