/**
 * Redis Module Exports - Climate Economy Assistant
 * Main entry point for Redis functionality
 * Location: lib/redis/index.ts
 */

// Export Redis client
export { default as redis } from './client';

// Export cache utilities
export { cache, RedisCache } from './cache';
export type { CacheOptions } from './cache';

// Export session management
export { sessionManager, RedisSessionManager } from './session';
export type { 
  ChatMessage, 
  UserSession, 
  JobSearchCache 
} from './session';

// Export middleware
export { 
  default as RedisMiddleware, 
  withRedisMiddleware 
} from './middleware';
export type { MiddlewareOptions } from './middleware';

// Import dependencies for RedisUtils
import { cache } from './cache';
import { sessionManager, type ChatMessage } from './session';
import RedisMiddleware from './middleware';

// Convenience exports for common operations
export const RedisUtils = {
  // Cache operations
  cache,
  
  // Session operations
  session: sessionManager,
  
  // Middleware
  middleware: RedisMiddleware,
  
  // Quick access methods
  async setCache(key: string, value: unknown, ttl = 3600) {
    return await cache.set(key, value, { ttl });
  },
  
  async getCache<T = unknown>(key: string): Promise<T | null> {
    return await cache.get<T>(key);
  },
  
  async deleteCache(key: string) {
    return await cache.delete(key);
  },
  
  async setUserSession(userId: string, sessionData: Record<string, unknown>) {
    return await sessionManager.setUserSession(userId, sessionData);
  },
  
  async getUserSession(userId: string) {
    return await sessionManager.getUserSession(userId);
  },
  
  async addChatMessage(sessionId: string, message: ChatMessage) {
    return await sessionManager.addChatMessage(sessionId, message);
  },
  
  async getChatHistory(sessionId: string) {
    return await sessionManager.getChatHistory(sessionId);
  },
  
  async cacheJobSearch(userId: string, query: string, filters: Record<string, unknown>, results: unknown[]) {
    const searchKey = `${query}:${JSON.stringify(filters)}`.toLowerCase().replace(/\s+/g, '_');
    return await sessionManager.cacheJobSearch(userId, searchKey, {
      query,
      filters,
      results,
      timestamp: new Date(),
      totalResults: results.length,
    });
  },
  
  async getCachedJobSearch(userId: string, query: string, filters: Record<string, unknown>) {
    const searchKey = `${query}:${JSON.stringify(filters)}`.toLowerCase().replace(/\s+/g, '_');
    return await sessionManager.getCachedJobSearch(userId, searchKey);
  },
};

export default RedisUtils; 