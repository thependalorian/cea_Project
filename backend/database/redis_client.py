"""
Redis client implementation with connection pooling and improved error handling.
"""

import redis.asyncio as redis
import os
import json
from typing import Optional, Any, List
import structlog
from contextlib import asynccontextmanager

logger = structlog.get_logger(__name__)


class RedisClient:
    _instance = None
    _client = None
    _pool = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    async def get_client(self) -> redis.Redis:
        if self._client is None:
            redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")

            # Configure connection pool
            pool = redis.ConnectionPool.from_url(
                redis_url,
                encoding="utf-8",
                decode_responses=True,
                max_connections=20,
                socket_timeout=5.0,
                socket_connect_timeout=2.0,
                retry_on_timeout=True,
            )

            self._client = redis.Redis(connection_pool=pool, health_check_interval=30)
            self._pool = pool

        return self._client

    @asynccontextmanager
    async def get_connection(self):
        """Get a Redis connection from the pool with automatic cleanup."""
        client = await self.get_client()
        try:
            yield client
        except redis.ConnectionError as e:
            logger.error("Redis connection error", error=str(e))
            # Reset client on connection error
            self._client = None
            raise
        except Exception as e:
            logger.error("Redis operation error", error=str(e))
            raise

    async def ping(self) -> bool:
        """Test Redis connection"""
        try:
            async with self.get_connection() as client:
                await client.ping()
                return True
        except Exception as e:
            logger.error("Redis ping error", error=str(e))
            return False

    async def close(self) -> None:
        """Close Redis connection pool"""
        if self._pool:
            await self._pool.disconnect()
            self._client = None
            self._pool = None

    async def set(self, key: str, value: Any, ttl: int = 3600) -> bool:
        try:
            async with self.get_connection() as client:
                if isinstance(value, (dict, list)):
                    value = json.dumps(value)
                await client.setex(key, ttl, value)
                return True
        except Exception as e:
            logger.error("Redis set error", error=str(e), key=key)
            return False

    async def get(self, key: str) -> Optional[Any]:
        try:
            async with self.get_connection() as client:
                value = await client.get(key)
                if value:
                    try:
                        return json.loads(value)
                    except json.JSONDecodeError:
                        return value
                return None
        except Exception as e:
            logger.error("Redis get error", error=str(e), key=key)
            return None

    async def keys(self, pattern: str) -> List[str]:
        """Get keys matching pattern"""
        try:
            async with self.get_connection() as client:
                keys = await client.keys(pattern)
                return keys
        except Exception as e:
            logger.error("Redis keys error", error=str(e), pattern=pattern)
            return []

    async def delete(self, key: str) -> bool:
        """Delete a key"""
        try:
            async with self.get_connection() as client:
                result = await client.delete(key)
                return bool(result)
        except Exception as e:
            logger.error("Redis delete error", error=str(e), key=key)
            return False


redis_client = RedisClient()
