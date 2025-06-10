/**
 * Redis Client Configuration - Climate Economy Assistant
 * Short-term memory storage for session data, caching, and real-time features
 * Location: lib/redis/client.ts
 */

import { createClient } from 'redis';

// Validate required environment variables
const requiredEnvVars = {
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: process.env.REDIS_PORT,
  REDIS_USERNAME: process.env.REDIS_USERNAME,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
};

// Check for missing environment variables
const missingVars = Object.entries(requiredEnvVars)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  throw new Error(
    `Missing required Redis environment variables: ${missingVars.join(', ')}\n` +
    'Please ensure these are set in your .env file:\n' +
    '- REDIS_HOST\n' +
    '- REDIS_PORT\n' +
    '- REDIS_USERNAME\n' +
    '- REDIS_PASSWORD'
  );
}

const redis = createClient({
  socket: {
    host: process.env.REDIS_HOST!,
    port: parseInt(process.env.REDIS_PORT!),
  },
  username: process.env.REDIS_USERNAME!,
  password: process.env.REDIS_PASSWORD!,
});

// Handle Redis connection events
redis.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redis.on('connect', () => {
  console.log('Redis Client Connected');
});

redis.on('ready', () => {
  console.log('Redis Client Ready');
});

redis.on('end', () => {
  console.log('Redis Client Disconnected');
});

// Connect to Redis
if (!redis.isOpen) {
  redis.connect().catch((err) => {
    console.error('Failed to connect to Redis:', err);
  });
}

export { redis };
export default redis; 