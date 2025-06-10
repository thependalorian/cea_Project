/**
 * Redis Session Management - Climate Economy Assistant
 * Utilities for managing user sessions, chat history, and temporary data
 * Location: lib/redis/session.ts
 */

import { cache, CacheOptions } from './cache';
import { User } from '@supabase/supabase-js';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface UserSession {
  userId: string;
  email: string;
  lastActivity: Date;
  ipAddress?: string;
  userAgent?: string;
  preferences?: Record<string, unknown>;
}

export interface JobSearchCache {
  query: string;
  filters: Record<string, unknown>;
  results: unknown[];
  timestamp: Date;
  totalResults: number;
}

export class RedisSessionManager {
  private sessionTTL = 86400; // 24 hours
  private chatTTL = 3600; // 1 hour for chat sessions
  private cacheTTL = 1800; // 30 minutes for search cache

  /**
   * Store user session data
   */
  async setUserSession(userId: string, sessionData: Partial<UserSession>): Promise<boolean> {
    const sessionKey = `session:${userId}`;
    const session: UserSession = {
      userId,
      lastActivity: new Date(),
      ...sessionData,
    } as UserSession;

    return await cache.set(sessionKey, session, {
      ttl: this.sessionTTL,
      prefix: 'cea:',
    });
  }

  /**
   * Get user session data
   */
  async getUserSession(userId: string): Promise<UserSession | null> {
    const sessionKey = `session:${userId}`;
    return await cache.get<UserSession>(sessionKey, { prefix: 'cea:' });
  }

  /**
   * Update user session activity
   */
  async updateSessionActivity(userId: string): Promise<boolean> {
    const session = await this.getUserSession(userId);
    if (!session) return false;

    session.lastActivity = new Date();
    return await this.setUserSession(userId, session);
  }

  /**
   * Clear user session
   */
  async clearUserSession(userId: string): Promise<boolean> {
    const sessionKey = `session:${userId}`;
    return await cache.delete(sessionKey, { prefix: 'cea:' });
  }

  /**
   * Store chat message history for AI conversations
   */
  async addChatMessage(sessionId: string, message: ChatMessage): Promise<boolean> {
    const chatKey = `chat:${sessionId}`;
    
    // Add message to chat history list
    const result = await cache.listPush(chatKey, message, {
      ttl: this.chatTTL,
      prefix: 'cea:',
    });

    // Keep only last 50 messages to prevent memory bloat
    if (result > 50) {
      const messages = await this.getChatHistory(sessionId, 0, 49);
      await cache.delete(chatKey, { prefix: 'cea:' });
      
      for (const msg of messages) {
        await cache.listPush(chatKey, msg, {
          ttl: this.chatTTL,
          prefix: 'cea:',
        });
      }
    }

    return result > 0;
  }

  /**
   * Get chat message history
   */
  async getChatHistory(sessionId: string, start = 0, end = -1): Promise<ChatMessage[]> {
    const chatKey = `chat:${sessionId}`;
    return await cache.listGet<ChatMessage>(chatKey, start, end, { prefix: 'cea:' });
  }

  /**
   * Clear chat history
   */
  async clearChatHistory(sessionId: string): Promise<boolean> {
    const chatKey = `chat:${sessionId}`;
    return await cache.delete(chatKey, { prefix: 'cea:' });
  }

  /**
   * Store job search results for caching
   */
  async cacheJobSearch(
    userId: string,
    searchKey: string,
    results: JobSearchCache
  ): Promise<boolean> {
    const cacheKey = `search:${userId}:${searchKey}`;
    return await cache.set(cacheKey, results, {
      ttl: this.cacheTTL,
      prefix: 'cea:',
    });
  }

  /**
   * Get cached job search results
   */
  async getCachedJobSearch(userId: string, searchKey: string): Promise<JobSearchCache | null> {
    const cacheKey = `search:${userId}:${searchKey}`;
    return await cache.get<JobSearchCache>(cacheKey, { prefix: 'cea:' });
  }

  /**
   * Store user preferences temporarily
   */
  async setUserPreferences(userId: string, preferences: Record<string, unknown>): Promise<boolean> {
    const prefKey = `preferences:${userId}`;
    return await cache.set(prefKey, preferences, {
      ttl: this.sessionTTL,
      prefix: 'cea:',
    });
  }

  /**
   * Get user preferences
   */
  async getUserPreferences(userId: string): Promise<Record<string, unknown> | null> {
    const prefKey = `preferences:${userId}`;
    return await cache.get(prefKey, { prefix: 'cea:' });
  }

  /**
   * Store job matching results temporarily
   */
  async cacheJobMatches(userId: string, matches: unknown[]): Promise<boolean> {
    const matchKey = `matches:${userId}`;
    return await cache.set(matchKey, matches, {
      ttl: 7200, // 2 hours for job matches
      prefix: 'cea:',
    });
  }

  /**
   * Get cached job matches
   */
  async getCachedJobMatches(userId: string): Promise<unknown[] | null> {
    const matchKey = `matches:${userId}`;
    return await cache.get(matchKey, { prefix: 'cea:' });
  }

  /**
   * Store rate limiting data
   */
  async incrementRateLimit(
    identifier: string,
    windowMs: number = 3600000 // 1 hour
  ): Promise<number> {
    const rateLimitKey = `ratelimit:${identifier}`;
    const current = await cache.increment(rateLimitKey, 1, {
      ttl: Math.ceil(windowMs / 1000),
      prefix: 'cea:',
    });

    return current;
  }

  /**
   * Check rate limit
   */
  async checkRateLimit(identifier: string): Promise<number> {
    const rateLimitKey = `ratelimit:${identifier}`;
    const current = await cache.get<number>(rateLimitKey, { prefix: 'cea:' });
    return current || 0;
  }

  /**
   * Store temporary form data
   */
  async setFormData(sessionId: string, formKey: string, data: Record<string, unknown>): Promise<boolean> {
    const formDataKey = `form:${sessionId}:${formKey}`;
    return await cache.set(formDataKey, data, {
      ttl: 1800, // 30 minutes for form data
      prefix: 'cea:',
    });
  }

  /**
   * Get temporary form data
   */
  async getFormData(sessionId: string, formKey: string): Promise<Record<string, unknown> | null> {
    const formDataKey = `form:${sessionId}:${formKey}`;
    return await cache.get(formDataKey, { prefix: 'cea:' });
  }

  /**
   * Clear temporary form data
   */
  async clearFormData(sessionId: string, formKey: string): Promise<boolean> {
    const formDataKey = `form:${sessionId}:${formKey}`;
    return await cache.delete(formDataKey, { prefix: 'cea:' });
  }

  /**
   * Store file upload progress
   */
  async setUploadProgress(uploadId: string, progress: number): Promise<boolean> {
    const progressKey = `upload:${uploadId}`;
    return await cache.set(progressKey, { progress, timestamp: new Date() }, {
      ttl: 3600, // 1 hour for upload progress
      prefix: 'cea:',
    });
  }

  /**
   * Get file upload progress
   */
  async getUploadProgress(uploadId: string): Promise<{ progress: number; timestamp: Date } | null> {
    const progressKey = `upload:${uploadId}`;
    return await cache.get(progressKey, { prefix: 'cea:' });
  }

  /**
   * Clear all user-related data
   */
  async clearUserData(userId: string): Promise<number> {
    const patterns = [
      `session:${userId}`,
      `preferences:${userId}`,
      `matches:${userId}`,
      `search:${userId}:*`,
    ];

    let clearedCount = 0;
    for (const pattern of patterns) {
      const deleted = await cache.delete(pattern, { prefix: 'cea:' });
      if (deleted) clearedCount++;
    }

    return clearedCount;
  }

  /**
   * Get session statistics
   */
  async getSessionStats(): Promise<{
    activeSessions: number;
    activeChats: number;
    cacheEntries: number;
  }> {
    try {
      // This is a simplified version - in production you'd want more sophisticated metrics
      const sessionKeys = await cache.setMembers('active_sessions', { prefix: 'cea:' });
      const chatKeys = await cache.setMembers('active_chats', { prefix: 'cea:' });
      
      return {
        activeSessions: sessionKeys.length,
        activeChats: chatKeys.length,
        cacheEntries: 0, // Would need to implement key counting
      };
    } catch {
      return {
        activeSessions: 0,
        activeChats: 0,
        cacheEntries: 0,
      };
    }
  }
}

// Export singleton instance
export const sessionManager = new RedisSessionManager();
export default sessionManager; 