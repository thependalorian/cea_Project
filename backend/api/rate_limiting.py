from fastapi import HTTPException, Request, status
from teams.adapters.redis_adapter import RedisAdapter
from typing import Dict, Optional
import time
import asyncio
from functools import wraps
from pydantic import BaseModel, Field


class RateLimitConfig(BaseModel):
    """Configuration for rate limiting."""

    calls_per_minute: int = Field(60, description="Maximum calls allowed per minute")
    calls_per_hour: int = Field(1000, description="Maximum calls allowed per hour")
    calls_per_day: int = Field(10000, description="Maximum calls allowed per day")
    burst_allowance: int = Field(10, description="Number of burst requests allowed")
    premium_multiplier: float = Field(2.0, description="Multiplier for premium users")


class AdvancedRateLimiter:
    """Multi-tier rate limiting with burst protection."""

    def __init__(self, redis_client: RedisAdapter):
        self.redis = redis_client
        self.default_config = RateLimitConfig()

    async def check_rate_limit(
        self, user_id: str, endpoint: str, user_tier: str = "basic"
    ) -> bool:
        """Check if the request is within rate limits."""
        try:
            # Get rate limit configuration for user tier
            limits = self._calculate_rate_limit(user_tier, endpoint)
            current_time = int(time.time())

            # Check limits for different time windows
            for window, limit in limits.items():
                key = f"rate_limit:{user_id}:{endpoint}:{window}"
                count = await self.redis.incr(key)

                # Set expiry on first increment
                if count == 1:
                    await self.redis.expire(key, self._get_window_seconds(window))

                if count > limit:
                    return False

            return True
        except Exception as e:
            # Log error and allow request in case of Redis failure
            print(f"Rate limiting error: {str(e)}")
            return True

    async def increment_usage(self, user_id: str, endpoint: str) -> None:
        """Increment usage counters for a user."""
        try:
            current_time = int(time.time())

            # Increment counters for different time windows
            for window in ["minute", "hour", "day"]:
                key = f"rate_limit:{user_id}:{endpoint}:{window}"
                await self.redis.incr(key)
        except Exception as e:
            print(f"Error incrementing usage: {str(e)}")

    async def get_usage_stats(self, user_id: str) -> Dict[str, int]:
        """Get current usage statistics for a user."""
        try:
            stats = {}
            current_time = int(time.time())

            # Get counts for different time windows
            for window in ["minute", "hour", "day"]:
                pattern = f"rate_limit:{user_id}:*:{window}"
                keys = await self.redis.keys(pattern)

                total = 0
                for key in keys:
                    count = await self.redis.get(key)
                    if count:
                        total += int(count)

                stats[window] = total

            return stats
        except Exception as e:
            print(f"Error getting usage stats: {str(e)}")
            return {}

    async def reset_user_limits(self, user_id: str) -> None:
        """Reset all rate limits for a user."""
        try:
            pattern = f"rate_limit:{user_id}:*"
            keys = await self.redis.keys(pattern)

            for key in keys:
                await self.redis.delete(key)
        except Exception as e:
            print(f"Error resetting user limits: {str(e)}")

    def _calculate_rate_limit(
        self, user_tier: str, endpoint_type: str
    ) -> Dict[str, int]:
        """Calculate rate limits based on user tier and endpoint type."""
        base_limits = {
            "minute": self.default_config.calls_per_minute,
            "hour": self.default_config.calls_per_hour,
            "day": self.default_config.calls_per_day,
        }

        # Apply multipliers based on user tier
        multiplier = (
            self.default_config.premium_multiplier if user_tier == "premium" else 1.0
        )

        # Adjust limits based on endpoint type
        endpoint_multipliers = {
            "ai_completion": 0.5,  # More restrictive for AI endpoints
            "basic_api": 2.0,  # Less restrictive for basic endpoints
            "streaming": 0.25,  # Very restrictive for streaming endpoints
        }

        endpoint_mult = endpoint_multipliers.get(endpoint_type, 1.0)

        return {
            window: int(limit * multiplier * endpoint_mult)
            for window, limit in base_limits.items()
        }

    def _get_window_seconds(self, window: str) -> int:
        """Get the number of seconds in a time window."""
        return {"minute": 60, "hour": 3600, "day": 86400}.get(window, 60)


def rate_limit(
    calls_per_minute: Optional[int] = None, endpoint_type: str = "basic_api"
):
    """Decorator for applying rate limits to endpoints."""

    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Get request object
            request = None
            for arg in args:
                if isinstance(arg, Request):
                    request = arg
                    break

            if not request:
                return await func(*args, **kwargs)

            # Get user ID from request (implement your own logic)
            user_id = request.headers.get("X-User-ID", "anonymous")
            user_tier = request.headers.get("X-User-Tier", "basic")

            # Initialize rate limiter
            redis_client = RedisAdapter()  # Configure your Redis connection
            rate_limiter = AdvancedRateLimiter(redis_client)

            # Check rate limit
            if not await rate_limiter.check_rate_limit(
                user_id, endpoint_type, user_tier
            ):
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Rate limit exceeded",
                )

            # Increment usage
            await rate_limiter.increment_usage(user_id, endpoint_type)

            return await func(*args, **kwargs)

        return wrapper

    return decorator
