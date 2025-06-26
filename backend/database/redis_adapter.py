"""
Redis adapter for the Climate Economy Assistant.
Provides standardized Redis access for caching, rate limiting, and persistent storage.
"""

import redis.asyncio as redis
from typing import Optional, List, Any, Dict, Union
import os
import json
import logging

from ..utils.logger import get_logger

logger = get_logger(__name__)


class RedisAdapter:
    """Redis adapter for rate limiting and caching."""

    def __init__(self):
        """Initialize Redis connection."""
        self.redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
        self.client = redis.from_url(
            self.redis_url, encoding="utf-8", decode_responses=True
        )
        self.default_ttl = 3600  # 1 hour default TTL

    async def connect(self) -> None:
        """Establish Redis connection."""
        try:
            await self.client.ping()
            logger.info("Successfully connected to Redis")
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {str(e)}")
            raise

    async def disconnect(self) -> None:
        """Close Redis connection."""
        try:
            await self.client.close()
            logger.info("Successfully disconnected from Redis")
        except Exception as e:
            logger.error(f"Error disconnecting from Redis: {str(e)}")

    async def get(self, key: str) -> Optional[str]:
        """Get value for a key."""
        try:
            return await self.client.get(key)
        except Exception as e:
            logger.error(f"Error getting key {key}: {str(e)}")
            return None

    async def set(self, key: str, value: str, ttl: Optional[int] = None) -> bool:
        """Set value for a key with optional TTL."""
        try:
            return await self.client.set(key, value, ex=ttl or self.default_ttl)
        except Exception as e:
            logger.error(f"Error setting key {key}: {str(e)}")
            return False

    async def delete(self, key: str) -> bool:
        """Delete a key."""
        try:
            return bool(await self.client.delete(key))
        except Exception as e:
            logger.error(f"Error deleting key {key}: {str(e)}")
            return False

    async def incr(self, key: str) -> int:
        """Increment a key's value."""
        try:
            return await self.client.incr(key)
        except Exception as e:
            logger.error(f"Error incrementing key {key}: {str(e)}")
            return 0

    async def expire(self, key: str, seconds: int) -> bool:
        """Set expiry on a key."""
        try:
            return await self.client.expire(key, seconds)
        except Exception as e:
            logger.error(f"Error setting expiry for key {key}: {str(e)}")
            return False

    async def keys(self, pattern: str) -> List[str]:
        """Get keys matching a pattern."""
        try:
            return await self.client.keys(pattern)
        except Exception as e:
            logger.error(f"Error getting keys for pattern {pattern}: {str(e)}")
            return []

    async def set_json(
        self, key: str, value: Dict[str, Any], ttl: Optional[int] = None
    ) -> bool:
        """Set JSON value for a key."""
        try:
            json_str = json.dumps(value)
            return await self.set(key, json_str, ttl)
        except Exception as e:
            logger.error(f"Error setting JSON for key {key}: {str(e)}")
            return False

    async def get_json(self, key: str) -> Optional[Dict[str, Any]]:
        """Get JSON value for a key."""
        try:
            value = await self.get(key)
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            logger.error(f"Error getting JSON for key {key}: {str(e)}")
            return None

    async def pipeline(self):
        """Get a Redis pipeline for batch operations."""
        try:
            return self.client.pipeline()
        except Exception as e:
            logger.error(f"Error creating pipeline: {str(e)}")
            return None

    async def execute_pipeline(self, pipeline) -> List[Any]:
        """Execute a Redis pipeline."""
        try:
            return await pipeline.execute()
        except Exception as e:
            logger.error(f"Error executing pipeline: {str(e)}")
            return []

    async def set_hash(
        self, key: str, mapping: Dict[str, Any], ttl: Optional[int] = None
    ) -> bool:
        """Set hash fields for a key."""
        try:
            # Convert all values to strings
            string_mapping = {k: str(v) for k, v in mapping.items()}

            pipeline = self.client.pipeline()
            pipeline.hmset(key, string_mapping)

            if ttl:
                pipeline.expire(key, ttl)

            await pipeline.execute()
            return True
        except Exception as e:
            logger.error(f"Error setting hash for key {key}: {str(e)}")
            return False

    async def get_hash(self, key: str) -> Dict[str, str]:
        """Get all hash fields for a key."""
        try:
            return await self.client.hgetall(key)
        except Exception as e:
            logger.error(f"Error getting hash for key {key}: {str(e)}")
            return {}

    async def get_hash_field(self, key: str, field: str) -> Optional[str]:
        """Get a specific hash field for a key."""
        try:
            return await self.client.hget(key, field)
        except Exception as e:
            logger.error(f"Error getting hash field {field} for key {key}: {str(e)}")
            return None

    async def set_list(
        self, key: str, values: List[Any], ttl: Optional[int] = None
    ) -> bool:
        """Set a list of values for a key."""
        try:
            pipeline = self.client.pipeline()

            # Delete existing key
            pipeline.delete(key)

            # Add all values
            if values:
                pipeline.rpush(key, *values)

            if ttl:
                pipeline.expire(key, ttl)

            await pipeline.execute()
            return True
        except Exception as e:
            logger.error(f"Error setting list for key {key}: {str(e)}")
            return False

    async def get_list(self, key: str, start: int = 0, end: int = -1) -> List[str]:
        """Get a range of values from a list."""
        try:
            return await self.client.lrange(key, start, end)
        except Exception as e:
            logger.error(f"Error getting list for key {key}: {str(e)}")
            return []

    async def set_rate_limit(
        self, key: str, max_requests: int, window_seconds: int
    ) -> bool:
        """
        Set up rate limiting for a key.

        Args:
            key: The rate limit key
            max_requests: Maximum requests allowed in the time window
            window_seconds: Time window in seconds

        Returns:
            bool: Success status
        """
        try:
            current = await self.incr(key)

            # Set expiry only on first request
            if current == 1:
                await self.expire(key, window_seconds)

            return True
        except Exception as e:
            logger.error(f"Error setting rate limit for {key}: {str(e)}")
            return False

    async def check_rate_limit(
        self, key: str, max_requests: int
    ) -> Dict[str, Union[bool, int]]:
        """
        Check if a rate limit has been exceeded.

        Args:
            key: The rate limit key
            max_requests: Maximum requests allowed

        Returns:
            Dict with 'allowed' status and 'current' count
        """
        try:
            current = await self.get(key)
            current_count = int(current) if current else 0

            return {
                "allowed": current_count < max_requests,
                "current": current_count,
                "remaining": max(0, max_requests - current_count),
            }
        except Exception as e:
            logger.error(f"Error checking rate limit for {key}: {str(e)}")
            return {"allowed": True, "current": 0, "remaining": max_requests}


# Create a global instance
redis_adapter = RedisAdapter()
