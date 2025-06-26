"""
Enhanced security middleware for Climate Economy Assistant API.
Provides security headers, request ID tracking, and response timing.
"""

from fastapi import Request, Response
from fastapi.middleware.base import BaseHTTPMiddleware
import time
import secrets
import structlog

logger = structlog.get_logger(__name__)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to all responses"""
    
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Content-Security-Policy"] = "default-src 'self'"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        return response


class RequestIdMiddleware(BaseHTTPMiddleware):
    """Add unique request ID to all requests"""
    
    async def dispatch(self, request: Request, call_next):
        request_id = secrets.token_hex(16)
        request.state.request_id = request_id
        
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        
        return response


class TimingMiddleware(BaseHTTPMiddleware):
    """Add response timing headers"""
    
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time
        
        response.headers["X-Process-Time"] = str(process_time)
        
        # Log slow requests
        if process_time > 1.0:  # Log requests taking more than 1 second
            logger.warning(
                "Slow request detected",
                path=request.url.path,
                method=request.method,
                process_time=process_time,
                request_id=getattr(request.state, 'request_id', 'unknown')
            )
        
        return response 