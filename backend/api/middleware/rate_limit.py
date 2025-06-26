"""
Advanced rate limiting middleware using Redis for the Climate Economy Assistant.
Enhanced with endpoint-specific limits and comprehensive monitoring.
"""

from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
import time
import hashlib
from typing import Optional, Dict
import structlog
from backend.database.redis_client import redis_client
from backend.config.settings import get_settings

logger = structlog.get_logger(__name__)
settings = get_settings()


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Advanced rate limiting middleware with endpoint-specific limits"""

    def __init__(self, app, requests_per_minute: int = 60):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.window_size = 60  # 1 minute window
        
        # Endpoint-specific rate limits (requests per minute)
        self.rate_limits = {
            "/api/v1/agents/*/chat": {"requests": 30, "window": 60},  # 30 req/min for chat
            "/api/v1/jobs/search": {"requests": 100, "window": 60},   # 100 req/min for search
            "/api/v1/tools/*": {"requests": 50, "window": 60},        # 50 req/min for tools
            "/api/v1/resumes/analyze": {"requests": 10, "window": 60}, # 10 req/min for analysis
            "/api/v1/langgraph/*": {"requests": 20, "window": 60},    # 20 req/min for workflows
            "default": {"requests": requests_per_minute, "window": 60} # Default limit
        }
        # Fallback to memory-based rate limiting if Redis is not available
        self.memory_cache = {}

    def get_rate_limit(self, path: str) -> Dict[str, int]:
        """Get rate limit configuration for a specific path"""
        for pattern, limit in self.rate_limits.items():
            if pattern == "default":
                continue
            # Simple pattern matching with wildcard support
            if "*" in pattern:
                pattern_prefix = pattern.split("*")[0]
                if path.startswith(pattern_prefix):
                    return limit
            elif path.startswith(pattern):
                return limit
        return self.rate_limits["default"]

    async def dispatch(self, request: Request, call_next) -> Response:
        """Apply rate limiting logic with enhanced features"""

        # Skip rate limiting for health checks and docs
        if request.url.path in ["/health", "/", "/docs", "/redoc", "/openapi.json"]:
            return await call_next(request)

        # Get client identifier (IP + User-Agent)
        client_ip = self._get_client_ip(request)
        user_agent = request.headers.get("user-agent", "")
        client_id = hashlib.md5(f"{client_ip}:{user_agent}".encode()).hexdigest()
        path = request.url.path

        # Get rate limit for this endpoint
        rate_limit = self.get_rate_limit(path)

        # Check rate limit
        if await self._is_rate_limited(client_id, path, rate_limit):
            logger.warning(
                "Rate limit exceeded",
                client_ip=client_ip,
                path=path,
                rate_limit=rate_limit,
                request_id=getattr(request.state, 'request_id', 'unknown')
            )
            raise HTTPException(
                status_code=429,
                detail={
                    "error": "rate_limit_exceeded",
                    "message": "Rate limit exceeded. Please try again later.",
                    "retry_after": rate_limit["window"]
                },
                headers={"Retry-After": str(rate_limit["window"])},
            )

        # Process request
        response = await call_next(request)
        
        # Add rate limit headers
        try:
            remaining = await self._get_remaining_requests(client_id, path, rate_limit)
            response.headers["X-RateLimit-Limit"] = str(rate_limit["requests"])
            response.headers["X-RateLimit-Remaining"] = str(remaining)
            response.headers["X-RateLimit-Reset"] = str(int(time.time()) + rate_limit["window"])
        except Exception as e:
            logger.error("Failed to add rate limit headers", error=str(e))

        return response

    def _get_client_ip(self, request: Request) -> str:
        """Extract client IP from request"""
        # Check for forwarded headers (Vercel, Cloudflare, etc.)
        forwarded_for = request.headers.get("x-forwarded-for")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()

        real_ip = request.headers.get("x-real-ip")
        if real_ip:
            return real_ip

        return request.client.host if request.client else "unknown"

    async def _is_rate_limited(self, client_id: str, path: str, rate_limit: Dict[str, int]) -> bool:
        """Check if client has exceeded rate limit"""
        try:
            current_time = int(time.time())
            window = rate_limit["window"]
            max_requests = rate_limit["requests"]

            # Create unique key for this client and endpoint
            key = f"rate_limit:{client_id}:{path}"

            # Try Redis first
            try:
                # Use Redis directly with individual commands instead of pipeline
                async with await redis_client.get_connection() as conn:
                    # Remove expired entries
                    await conn.zremrangebyscore(key, 0, current_time - window)
                    # Get current count
                    request_count = await conn.zcard(key)
                    # Add current request
                    await conn.zadd(key, {str(current_time): current_time})
                    # Set expiration
                    await conn.expire(key, window)
                    
                    return request_count >= max_requests
            except Exception as redis_error:
                logger.warning("Redis rate limiting failed, falling back to memory", error=str(redis_error))

            # Fallback to memory-based rate limiting
            if key not in self.memory_cache:
                self.memory_cache[key] = []
            
            # Clean old entries
            self.memory_cache[key] = [
                timestamp for timestamp in self.memory_cache[key]
                if timestamp > current_time - window
            ]
            
            # Check limit
            if len(self.memory_cache[key]) >= max_requests:
                return True
            
            # Add current request
            self.memory_cache[key].append(current_time)
            return False

        except Exception as e:
            logger.error("Rate limiting error", error=str(e))
            # Fail open - don't block requests if rate limiting fails
            return False

    async def _get_remaining_requests(self, client_id: str, path: str, rate_limit: Dict[str, int]) -> int:
        """Get remaining requests for the current window"""
        try:
            current_time = int(time.time())
            window = rate_limit["window"]
            max_requests = rate_limit["requests"]
            key = f"rate_limit:{client_id}:{path}"

            try:
                async with await redis_client.get_connection() as conn:
                    count = await conn.zcard(key)
                    return max(0, max_requests - count)
            except Exception as redis_error:
                logger.warning("Redis remaining requests check failed", error=str(redis_error))

            # Fallback to memory cache
            if key in self.memory_cache:
                # Clean old entries
                self.memory_cache[key] = [
                    timestamp for timestamp in self.memory_cache[key]
                    if timestamp > current_time - window
                ]
                return max(0, max_requests - len(self.memory_cache[key]))
            
            return max_requests

        except Exception as e:
            logger.error("Failed to get remaining requests", error=str(e))
            return max_requests
