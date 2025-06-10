/**
 * Redis Cache Utilities - Climate Economy Assistant
 * Utilities for caching, session management, and temporary data storage
 * Location: lib/redis/cache.ts
 */

import redis from './client';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string; // Key prefix for organization
}

export class RedisCache {
  private defaultTTL = 3600; // 1 hour default
  private defaultPrefix = 'cea:';

  /**
   * Set a key-value pair in Redis with optional TTL
   */
  async set(key: string, value: unknown, options: CacheOptions = {}): Promise<boolean> {
    try {
      const { ttl = this.defaultTTL, prefix = this.defaultPrefix } = options;
      const fullKey = `${prefix}${key}`;
      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
      
      if (ttl > 0) {
        await redis.setEx(fullKey, ttl, serializedValue);
      } else {
        await redis.set(fullKey, serializedValue);
      }
      
      return true;
    } catch (error) {
      console.error('Redis SET error:', error);
      return false;
    }
  }

  /**
   * Get a value from Redis by key
   */
  async get<T = unknown>(key: string, options: CacheOptions = {}): Promise<T | null> {
    try {
      const { prefix = this.defaultPrefix } = options;
      const fullKey = `${prefix}${key}`;
      const value = await redis.get(fullKey);
      
      if (!value) return null;
      
      try {
        return JSON.parse(value) as T;
      } catch {
        return value as T;
      }
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  }

  /**
   * Delete a key from Redis
   */
  async delete(key: string, options: CacheOptions = {}): Promise<boolean> {
    try {
      const { prefix = this.defaultPrefix } = options;
      const fullKey = `${prefix}${key}`;
      const result = await redis.del(fullKey);
      return result > 0;
    } catch (error) {
      console.error('Redis DELETE error:', error);
      return false;
    }
  }

  /**
   * Check if a key exists in Redis
   */
  async exists(key: string, options: CacheOptions = {}): Promise<boolean> {
    try {
      const { prefix = this.defaultPrefix } = options;
      const fullKey = `${prefix}${key}`;
      const result = await redis.exists(fullKey);
      return result > 0;
    } catch (error) {
      console.error('Redis EXISTS error:', error);
      return false;
    }
  }

  /**
   * Get TTL for a key
   */
  async ttl(key: string, options: CacheOptions = {}): Promise<number> {
    try {
      const { prefix = this.defaultPrefix } = options;
      const fullKey = `${prefix}${key}`;
      return await redis.ttl(fullKey);
    } catch (error) {
      console.error('Redis TTL error:', error);
      return -1;
    }
  }

  /**
   * Increment a numeric value
   */
  async increment(key: string, by = 1, options: CacheOptions = {}): Promise<number> {
    try {
      const { prefix = this.defaultPrefix } = options;
      const fullKey = `${prefix}${key}`;
      return await redis.incrBy(fullKey, by);
    } catch (error) {
      console.error('Redis INCREMENT error:', error);
      return 0;
    }
  }

  /**
   * Get multiple keys at once
   */
  async getMultiple<T = unknown>(keys: string[], options: CacheOptions = {}): Promise<(T | null)[]> {
    try {
      const { prefix = this.defaultPrefix } = options;
      const fullKeys = keys.map(key => `${prefix}${key}`);
      const values = await redis.mGet(fullKeys);
      
      return values.map((value: string | null) => {
        if (!value) return null;
        try {
          return JSON.parse(value) as T;
        } catch {
          return value as T;
        }
      });
    } catch (error) {
      console.error('Redis MGET error:', error);
      return keys.map(() => null);
    }
  }

  /**
   * Set multiple key-value pairs at once
   */
  async setMultiple(data: Record<string, unknown>, options: CacheOptions = {}): Promise<boolean> {
    try {
      const { prefix = this.defaultPrefix } = options;
      const pairs: string[] = [];
      
      Object.entries(data).forEach(([key, value]) => {
        pairs.push(`${prefix}${key}`);
        pairs.push(typeof value === 'string' ? value : JSON.stringify(value));
      });
      
      await redis.mSet(pairs);
      return true;
    } catch (error) {
      console.error('Redis MSET error:', error);
      return false;
    }
  }

  /**
   * Add item to a list
   */
  async listPush(key: string, value: unknown, options: CacheOptions = {}): Promise<number> {
    try {
      const { prefix = this.defaultPrefix } = options;
      const fullKey = `${prefix}${key}`;
      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
      return await redis.lPush(fullKey, serializedValue);
    } catch (error) {
      console.error('Redis LPUSH error:', error);
      return 0;
    }
  }

  /**
   * Get items from a list
   */
  async listGet<T = unknown>(key: string, start = 0, end = -1, options: CacheOptions = {}): Promise<T[]> {
    try {
      const { prefix = this.defaultPrefix } = options;
      const fullKey = `${prefix}${key}`;
      const values = await redis.lRange(fullKey, start, end);
      
      return values.map((value: string) => {
        try {
          return JSON.parse(value) as T;
        } catch {
          return value as T;
        }
      });
    } catch (error) {
      console.error('Redis LRANGE error:', error);
      return [];
    }
  }

  /**
   * Add item to a set
   */
  async setAdd(key: string, value: unknown, options: CacheOptions = {}): Promise<boolean> {
    try {
      const { prefix = this.defaultPrefix } = options;
      const fullKey = `${prefix}${key}`;
      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
      const result = await redis.sAdd(fullKey, serializedValue);
      return result > 0;
    } catch (error) {
      console.error('Redis SADD error:', error);
      return false;
    }
  }

  /**
   * Get all members of a set
   */
  async setMembers<T = unknown>(key: string, options: CacheOptions = {}): Promise<T[]> {
    try {
      const { prefix = this.defaultPrefix } = options;
      const fullKey = `${prefix}${key}`;
      const values = await redis.sMembers(fullKey);
      
      return values.map((value: string) => {
        try {
          return JSON.parse(value) as T;
        } catch {
          return value as T;
        }
      });
    } catch (error) {
      console.error('Redis SMEMBERS error:', error);
      return [];
    }
  }

  /**
   * Clear all keys with a specific prefix
   */
  async clearPrefix(prefix: string): Promise<number> {
    try {
      const pattern = `${prefix}*`;
      const keys = await redis.keys(pattern);
      
      if (keys.length === 0) return 0;
      
      return await redis.del(keys);
    } catch (error) {
      console.error('Redis CLEAR PREFIX error:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const cache = new RedisCache();
export default cache; 