"""
Redis Adapter - Caching and Session Storage

Following rule #12: Complete code verification with proper caching integration
Following rule #15: Include comprehensive error handling

This adapter handles Redis operations for caching and session management.
Location: backendv1/adapters/redis_adapter.py
"""

from typing import Dict, Any, Optional
import asyncio
import redis.asyncio as redis

from backendv1.utils.logger import setup_logger
from backendv1.config.settings import get_settings

logger = setup_logger("redis_adapter")
settings = get_settings()


class RedisAdapter:
    """
    Redis adapter for caching and session management

    Following rule #12: Complete code verification with proper typing
    """

    def __init__(self):
        """Initialize Redis adapter"""
        self.redis_url = settings.REDIS_URL
        self.redis_client = None
        logger.info("🔴 Redis adapter initialized")

    async def _get_client(self):
        """Get or create Redis client"""
        if self.redis_client is None:
            try:
                self.redis_client = redis.from_url(
                    self.redis_url, encoding="utf-8", decode_responses=True
                )
                logger.debug("📡 Redis client created")
            except Exception as e:
                logger.error(f"❌ Redis client creation failed: {e}")
                return None
        return self.redis_client

    async def validate_connection(self) -> bool:
        """
        Validate Redis connection

        Returns:
            bool: True if connection is valid
        """
        try:
            client = await self._get_client()
            if client:
                await client.ping()
                logger.info("✅ Redis connection validated")
                return True
            return False
        except Exception as e:
            logger.error(f"❌ Redis connection failed: {e}")
            return False

    async def get(self, key: str) -> Optional[str]:
        """
        Get value from Redis

        Args:
            key: Cache key

        Returns:
            Optional[str]: Cached value or None
        """
        try:
            client = await self._get_client()
            if client:
                result = await client.get(key)
                logger.debug(f"🔴 Getting key: {key}")
                return result
            return None
        except Exception as e:
            logger.error(f"Error getting Redis key {key}: {e}")
            return None

    async def set(self, key: str, value: str, ttl: int = 3600) -> bool:
        """
        Set value in Redis

        Args:
            key: Cache key
            value: Value to cache
            ttl: Time to live in seconds

        Returns:
            bool: True if successful
        """
        try:
            client = await self._get_client()
            if client:
                await client.set(key, value, ex=ttl)
                logger.debug(f"🔴 Setting key: {key}")
                return True
            return False
        except Exception as e:
            logger.error(f"Error setting Redis key {key}: {e}")
            return False

    async def close(self):
        """Close Redis connection"""
        if self.redis_client:
            try:
                await self.redis_client.aclose()
                self.redis_client = None
                logger.debug("🔴 Redis connection closed")
            except Exception as e:
                logger.error(f"Error closing Redis connection: {e}")


# Export main class
__all__ = ["RedisAdapter"]
