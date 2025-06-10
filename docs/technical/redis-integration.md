# Redis Integration - Climate Economy Assistant

## Overview

Redis is integrated as our short-term memory storage solution, complementing Supabase for long-term persistence. Redis handles:

- **Session Management**: User sessions, preferences, and temporary data
- **Caching**: API responses, search results, and computed data
- **Rate Limiting**: API endpoint protection and abuse prevention
- **Chat Context**: AI conversation history and context
- **Real-time Data**: Live updates and temporary storage

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Application   │───▶│      Redis      │───▶│    Supabase     │
│   (Next.js)     │    │  (Short-term)   │    │  (Long-term)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Configuration

### Environment Variables

**Required environment variables for Redis connection:**

```bash
# Redis Configuration (replace with your Redis instance details)
REDIS_HOST=your-redis-host.redis-cloud.com
REDIS_PORT=your-port-number
REDIS_USERNAME=your-username
REDIS_PASSWORD=your-secure-password
```

⚠️ **Security Note**: Never commit these credentials to version control. Use environment variables or secure secret management.

### Connection Setup

```typescript
// lib/redis/client.ts
import { createClient } from 'redis';

// Validate required environment variables
const requiredEnvVars = {
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: process.env.REDIS_PORT,
  REDIS_USERNAME: process.env.REDIS_USERNAME,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
};

const redis = createClient({
  socket: {
    host: process.env.REDIS_HOST!,
    port: parseInt(process.env.REDIS_PORT!),
  },
  username: process.env.REDIS_USERNAME!,
  password: process.env.REDIS_PASSWORD!,
});
```

## Usage Examples

### 1. Basic Cache Operations

```typescript
import { RedisUtils } from '@/lib/redis';

// Set cache with TTL
await RedisUtils.setCache('user:123:preferences', {
  theme: 'dark',
  notifications: true,
}, 3600); // 1 hour

// Get cached data
const preferences = await RedisUtils.getCache('user:123:preferences');

// Delete cache
await RedisUtils.deleteCache('user:123:preferences');
```

### 2. Session Management

```typescript
import { sessionManager } from '@/lib/redis';

// Create user session
await sessionManager.setUserSession('user-123', {
  userId: 'user-123',
  email: 'john@example.com',
  lastActivity: new Date(),
  preferences: { theme: 'dark' },
});

// Get session
const session = await sessionManager.getUserSession('user-123');

// Update activity
await sessionManager.updateSessionActivity('user-123');

// Clear session
await sessionManager.clearUserSession('user-123');
```

### 3. Chat History Management

```typescript
import { sessionManager, ChatMessage } from '@/lib/redis';

// Add chat message
const message: ChatMessage = {
  id: '1',
  role: 'user',
  content: 'What climate jobs are available in Boston?',
  timestamp: new Date(),
  metadata: { location: 'Boston' },
};

await sessionManager.addChatMessage('chat-session-456', message);

// Get chat history
const history = await sessionManager.getChatHistory('chat-session-456');

// Clear chat history
await sessionManager.clearChatHistory('chat-session-456');
```

### 4. Job Search Caching

```typescript
import { RedisUtils } from '@/lib/redis';

// Cache search results
await RedisUtils.cacheJobSearch(
  'user-123',
  'climate engineer',
  { location: 'Massachusetts', salary: 70000 },
  searchResults
);

// Get cached results
const cached = await RedisUtils.getCachedJobSearch(
  'user-123',
  'climate engineer',
  { location: 'Massachusetts', salary: 70000 }
);
```

### 5. Rate Limiting

```typescript
import { RedisMiddleware } from '@/lib/redis';

// In API route
export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = await RedisMiddleware.rateLimit(request, {
    requests: 100,
    windowMs: 3600000, // 1 hour
  });
  
  if (rateLimitResponse) {
    return rateLimitResponse; // 429 Too Many Requests
  }
  
  // Continue with normal processing
}
```

### 6. Middleware Usage

```typescript
import { withRedisMiddleware } from '@/lib/redis';

// Wrap API handler with Redis middleware
export const GET = withRedisMiddleware(
  async (request: NextRequest) => {
    // Your API logic here
    return NextResponse.json({ success: true });
  },
  {
    rateLimit: { requests: 100, windowMs: 3600000 },
    cacheResponse: { ttl: 1800 }, // 30 minutes
    requireAuth: true,
  }
);
```

## Data Types and TTL Strategy

### TTL (Time To Live) Settings

| Data Type | TTL | Rationale |
|-----------|-----|-----------|
| User Sessions | 24 hours | Daily login expected |
| Chat History | 1 hour | Recent context only |
| Search Cache | 30 minutes | Fresh results needed |
| Job Matches | 2 hours | Stable for session |
| Rate Limits | 1 hour | Sliding window |
| Form Data | 30 minutes | Temporary storage |
| Upload Progress | 1 hour | File operations |

### Key Naming Convention

```
cea:{category}:{identifier}:{subcategory}

Examples:
- cea:session:user-123
- cea:chat:session-456
- cea:search:user-123:climate_engineer
- cea:matches:user-123
- cea:ratelimit:192.168.1.100
- cea:form:session-789:job-application
```

## Integration with Supabase

### Data Flow Strategy

1. **Read Path**:
   ```
   Request → Redis Cache → Supabase (if miss) → Cache Result
   ```

2. **Write Path**:
   ```
   Request → Supabase → Invalidate Cache → Success
   ```

3. **Session Path**:
   ```
   Auth → Supabase → Create Redis Session → Continue
   ```

### Example: Cached Job Search

```typescript
// app/api/v1/jobs/route.ts
import { RedisUtils } from '@/lib/redis';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const query = url.searchParams.get('q') || '';
  const userId = request.headers.get('x-user-id');
  
  // Try Redis cache first
  if (userId) {
    const cached = await RedisUtils.getCachedJobSearch(
      userId, 
      query, 
      Object.fromEntries(url.searchParams)
    );
    
    if (cached) {
      return NextResponse.json({
        ...cached,
        cached: true,
        timestamp: cached.timestamp,
      });
    }
  }
  
  // Query Supabase
  const supabase = createClient();
  const { data: jobs, error } = await supabase
    .from('jobs')
    .select('*')
    .ilike('title', `%${query}%`);
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  // Cache results
  if (userId && jobs) {
    await RedisUtils.cacheJobSearch(
      userId,
      query,
      Object.fromEntries(url.searchParams),
      jobs
    );
  }
  
  return NextResponse.json({
    jobs,
    cached: false,
    timestamp: new Date(),
  });
}
```

## Performance Monitoring

### Key Metrics to Track

1. **Cache Hit Rate**: Target >80% for search results
2. **Session Duration**: Average user session length
3. **Rate Limit Triggers**: Monitor for abuse patterns
4. **Redis Memory Usage**: Keep under limits
5. **Response Times**: Redis vs Supabase latency

### Monitoring Implementation

```typescript
// lib/redis/monitoring.ts
export class RedisMonitoring {
  static async getMetrics() {
    const stats = await sessionManager.getSessionStats();
    
    return {
      activeSessions: stats.activeSessions,
      activeChats: stats.activeChats,
      cacheEntries: stats.cacheEntries,
      memoryUsage: await this.getMemoryUsage(),
      hitRate: await this.getCacheHitRate(),
    };
  }
  
  static async trackCacheHit(key: string, hit: boolean) {
    const today = new Date().toISOString().split('T')[0];
    const metric = hit ? 'hits' : 'misses';
    await cache.increment(`metrics:${today}:cache_${metric}`);
  }
}
```

## Error Handling

### Redis Connection Failures

```typescript
// Graceful degradation
export async function getCachedData(key: string) {
  try {
    return await cache.get(key);
  } catch (error) {
    console.error('Redis error:', error);
    // Continue without cache
    return null;
  }
}
```

### Fallback Strategies

1. **Cache Miss**: Always fall back to Supabase
2. **Redis Down**: Disable caching, direct to Supabase
3. **Rate Limit Failure**: Log and allow request
4. **Session Failure**: Create temporary session

## Security Considerations

### Data Classification

- **Public**: Job listings, education resources
- **User-Specific**: Preferences, search history
- **Sensitive**: Session tokens, personal data (encrypted)

### Access Control

```typescript
// Only store non-sensitive data in Redis
const sessionData = {
  userId: user.id,
  email: user.email, // OK
  preferences: user.preferences, // OK
  // Never store: passwords, tokens, SSN, etc.
};
```

### Environment Variable Security

```bash
# ✅ Good: Use environment variables
REDIS_PASSWORD=your-secure-password

# ❌ Bad: Never hardcode credentials in source code
const password = 'hardcoded-password'; // Don't do this!
```

### Encryption for Sensitive Data

```typescript
import crypto from 'crypto';

const encryptData = (data: string, key: string) => {
  const cipher = crypto.createCipher('aes-256-cbc', key);
  return cipher.update(data, 'utf8', 'hex') + cipher.final('hex');
};
```

## Testing Redis Integration

### Test API Endpoint

```bash
# Test Redis connection
curl http://localhost:3000/api/v1/test/redis-simple

# Test specific operations
curl -X POST http://localhost:3000/api/v1/test/redis \
  -H "Content-Type: application/json" \
  -d '{"operation": "set", "key": "test", "value": "hello", "ttl": 300}'
```

### Unit Tests

```typescript
// __tests__/redis.test.ts
import { RedisUtils } from '@/lib/redis';

describe('Redis Integration', () => {
  test('should set and get cache', async () => {
    await RedisUtils.setCache('test-key', { data: 'test' });
    const result = await RedisUtils.getCache('test-key');
    expect(result).toEqual({ data: 'test' });
  });
  
  test('should handle TTL expiration', async () => {
    await RedisUtils.setCache('ttl-test', 'data', 1); // 1 second
    await new Promise(resolve => setTimeout(resolve, 1100));
    const result = await RedisUtils.getCache('ttl-test');
    expect(result).toBeNull();
  });
});
```

## Deployment Considerations

### Vercel Deployment

- Redis Cloud connection works seamlessly with Vercel
- Environment variables are automatically available
- No additional configuration needed

### Production Checklist

- [ ] Environment variables configured securely
- [ ] Redis Cloud connection tested
- [ ] TTL values optimized for production
- [ ] Monitoring and alerts set up
- [ ] Error handling implemented
- [ ] Security review completed
- [ ] Performance benchmarks established
- [ ] **No hardcoded credentials in source code**

## Troubleshooting

### Common Issues

1. **Connection Timeout**
   ```
   Error: Connection timeout
   Solution: Check Redis Cloud status and credentials
   ```

2. **Memory Limit Exceeded**
   ```
   Error: OOM command not allowed
   Solution: Reduce TTL values or clear old data
   ```

3. **Authentication Failed**
   ```
   Error: WRONGPASS invalid username-password pair
   Solution: Verify environment variables are set correctly
   ```

4. **Missing Environment Variables**
   ```
   Error: Missing required Redis environment variables
   Solution: Ensure all required variables are set in .env file
   ```

### Debug Commands

```bash
# Check Redis connection (replace with your credentials)
redis-cli -h your-host -p your-port -a your-password ping

# Monitor Redis operations
redis-cli -h your-host -p your-port -a your-password monitor

# Check memory usage
redis-cli -h your-host -p your-port -a your-password info memory
```

## Future Enhancements

1. **Redis Streams**: For real-time job notifications
2. **Pub/Sub**: Live chat and notifications
3. **Sorted Sets**: Trending jobs and skills
4. **Geospatial**: Location-based job matching
5. **Lua Scripts**: Complex atomic operations

---

This Redis integration provides a robust foundation for the Climate Economy Assistant's caching and session management needs, with clear separation between short-term (Redis) and long-term (Supabase) data storage. 