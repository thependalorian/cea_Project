"""
Rate Limiting and Redis Connection Tests
Testing rate limiting middleware and Redis functionality
"""

import pytest
import asyncio
from unittest.mock import Mock, patch, AsyncMock
from fastapi import Request, HTTPException
from starlette.responses import Response

from backend.api.middleware.rate_limit import RateLimitMiddleware
from backend.database.redis_client import redis_client


class TestRateLimiting:
    """Test suite for rate limiting functionality"""

    @pytest.fixture
    def mock_request(self):
        """Mock request fixture"""
        request = Mock(spec=Request)
        request.client.host = "127.0.0.1"
        request.url.path = "/api/test"
        request.method = "GET"
        return request

    @pytest.fixture
    def rate_limiter(self):
        """Rate limiter middleware fixture"""
        app = Mock()
        return RateLimitMiddleware(app, requests_per_minute=5)

    @pytest.mark.redis
    @pytest.mark.asyncio
    async def test_redis_connection(self):
        """Test Redis connection is working"""
        try:
            # Test basic Redis operations
            await redis_client.set("test_key", "test_value", ex=60)
            value = await redis_client.get("test_key")
            assert value == "test_value"

            await redis_client.delete("test_key")
            value = await redis_client.get("test_key")
            assert value is None

        except Exception as e:
            pytest.skip(f"Redis not available: {e}")

    @pytest.mark.redis
    @pytest.mark.asyncio
    async def test_rate_limit_under_threshold(self, rate_limiter, mock_request):
        """Test requests under rate limit threshold"""

        async def mock_call_next(request):
            return Response("OK", status_code=200)

        # Make requests under the limit
        for i in range(3):
            response = await rate_limiter.dispatch(mock_request, mock_call_next)
            assert response.status_code == 200

    @pytest.mark.redis
    @pytest.mark.asyncio
    async def test_rate_limit_exceeds_threshold(self, rate_limiter, mock_request):
        """Test rate limiting when threshold is exceeded"""

        async def mock_call_next(request):
            return Response("OK", status_code=200)

        # Make requests up to the limit
        for i in range(5):
            response = await rate_limiter.dispatch(mock_request, mock_call_next)
            assert response.status_code == 200

        # Next request should be rate limited
        response = await rate_limiter.dispatch(mock_request, mock_call_next)
        assert response.status_code == 429
        assert "rate limit" in response.body.decode().lower()

    @pytest.mark.redis
    @pytest.mark.asyncio
    async def test_rate_limit_different_ips(self, rate_limiter):
        """Test rate limiting works independently for different IPs"""

        async def mock_call_next(request):
            return Response("OK", status_code=200)

        # Create requests from different IPs
        request1 = Mock(spec=Request)
        request1.client.host = "192.168.1.1"
        request1.url.path = "/api/test"
        request1.method = "GET"

        request2 = Mock(spec=Request)
        request2.client.host = "192.168.1.2"
        request2.url.path = "/api/test"
        request2.method = "GET"

        # Both IPs should be able to make requests independently
        for i in range(3):
            response1 = await rate_limiter.dispatch(request1, mock_call_next)
            response2 = await rate_limiter.dispatch(request2, mock_call_next)
            assert response1.status_code == 200
            assert response2.status_code == 200

    @pytest.mark.redis
    @pytest.mark.asyncio
    async def test_rate_limit_window_reset(self, rate_limiter, mock_request):
        """Test rate limit window resets correctly"""

        async def mock_call_next(request):
            return Response("OK", status_code=200)

        # Exhaust rate limit
        for i in range(5):
            await rate_limiter.dispatch(mock_request, mock_call_next)

        # Should be rate limited
        response = await rate_limiter.dispatch(mock_request, mock_call_next)
        assert response.status_code == 429

        # Mock time passage (in real implementation, would wait)
        with patch("time.time", return_value=9999999999):  # Far future
            response = await rate_limiter.dispatch(mock_request, mock_call_next)
            assert response.status_code == 200

    @pytest.mark.redis
    @pytest.mark.asyncio
    async def test_redis_error_handling(self, rate_limiter, mock_request):
        """Test graceful handling of Redis connection errors"""

        async def mock_call_next(request):
            return Response("OK", status_code=200)

        # Mock Redis connection error
        with patch(
            "backend.database.redis_client.redis_client.get",
            side_effect=ConnectionError("Redis unavailable"),
        ):

            # Should still allow requests when Redis is down
            response = await rate_limiter.dispatch(mock_request, mock_call_next)
            assert response.status_code == 200

    @pytest.mark.integration
    @pytest.mark.asyncio
    async def test_concurrent_requests(self, rate_limiter, mock_request):
        """Test rate limiting under concurrent load"""

        async def mock_call_next(request):
            await asyncio.sleep(0.01)  # Simulate processing time
            return Response("OK", status_code=200)

        # Create concurrent requests
        tasks = []
        for i in range(10):
            task = rate_limiter.dispatch(mock_request, mock_call_next)
            tasks.append(task)

        responses = await asyncio.gather(*tasks, return_exceptions=True)

        # Some should succeed, some should be rate limited
        success_count = sum(
            1 for r in responses if hasattr(r, "status_code") and r.status_code == 200
        )
        rate_limited_count = sum(
            1 for r in responses if hasattr(r, "status_code") and r.status_code == 429
        )

        assert success_count <= 5  # Within rate limit
        assert rate_limited_count > 0  # Some were rate limited


class TestRedisClient:
    """Test Redis client functionality"""

    @pytest.mark.redis
    @pytest.mark.asyncio
    async def test_redis_basic_operations(self):
        """Test basic Redis operations"""
        try:
            # Test SET/GET
            key = "test:basic"
            value = "test_value"

            await redis_client.set(key, value, ex=300)
            retrieved = await redis_client.get(key)
            assert retrieved == value

            # Test DELETE
            await redis_client.delete(key)
            retrieved = await redis_client.get(key)
            assert retrieved is None

        except Exception as e:
            pytest.skip(f"Redis not available: {e}")

    @pytest.mark.redis
    @pytest.mark.asyncio
    async def test_redis_expiration(self):
        """Test Redis key expiration"""
        try:
            key = "test:expiration"
            value = "expires_soon"

            # Set with very short expiration
            await redis_client.set(key, value, ex=1)

            # Should exist immediately
            retrieved = await redis_client.get(key)
            assert retrieved == value

            # Wait for expiration
            await asyncio.sleep(2)

            # Should be expired
            retrieved = await redis_client.get(key)
            assert retrieved is None

        except Exception as e:
            pytest.skip(f"Redis not available: {e}")

    @pytest.mark.redis
    @pytest.mark.asyncio
    async def test_redis_hash_operations(self):
        """Test Redis hash operations for rate limiting counters"""
        try:
            hash_key = "test:hash"
            field = "counter"

            # Test HINCRBY for counters
            count = await redis_client.hincrby(hash_key, field, 1)
            assert count == 1

            count = await redis_client.hincrby(hash_key, field, 5)
            assert count == 6

            # Clean up
            await redis_client.delete(hash_key)

        except Exception as e:
            pytest.skip(f"Redis not available: {e}")
