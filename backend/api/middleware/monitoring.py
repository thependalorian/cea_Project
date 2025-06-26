"""
Comprehensive monitoring middleware for Climate Economy Assistant API.
Provides request/response logging, metrics collection, and security headers.
"""

import structlog
import time
import json
import secrets
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Dict, Any

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


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Comprehensive request/response logging"""
    
    def __init__(self, app):
        super().__init__(app)
        self.logger = structlog.get_logger(__name__)
    
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        # Log request
        request_id = getattr(request.state, 'request_id', 'unknown')
        user_id = getattr(request.state, 'user_id', 'anonymous')
        
        self.logger.info(
            "Request started",
            request_id=request_id,
            method=request.method,
            path=request.url.path,
            query_params=str(request.query_params),
            user_id=user_id,
            client_ip=request.client.host,
            user_agent=request.headers.get("user-agent", "unknown")
        )
        
        # Process request
        try:
            response = await call_next(request)
        except Exception as e:
            # Log errors
            process_time = time.time() - start_time
            self.logger.error(
                "Request failed",
                request_id=request_id,
                method=request.method,
                path=request.url.path,
                error=str(e),
                process_time=process_time,
                user_id=user_id
            )
            raise
        
        # Log response
        process_time = time.time() - start_time
        self.logger.info(
            "Request completed",
            request_id=request_id,
            method=request.method,
            path=request.url.path,
            status_code=response.status_code,
            process_time=process_time,
            user_id=user_id
        )
        
        return response


class MetricsMiddleware(BaseHTTPMiddleware):
    """Collect application metrics"""
    
    def __init__(self, app, metrics_collector=None):
        super().__init__(app)
        self.metrics = metrics_collector or {}
        self.request_count = 0
        self.response_times = []
        self.error_count = 0
    
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        self.request_count += 1
        
        try:
            response = await call_next(request)
            
            # Record metrics
            process_time = time.time() - start_time
            self.response_times.append(process_time)
            
            # Keep only last 1000 response times for memory efficiency
            if len(self.response_times) > 1000:
                self.response_times = self.response_times[-1000:]
            
            # Add metrics headers
            response.headers["X-Request-Count"] = str(self.request_count)
            if self.response_times:
                avg_response_time = sum(self.response_times) / len(self.response_times)
                response.headers["X-Avg-Response-Time"] = f"{avg_response_time:.3f}"
            
            return response
            
        except Exception as e:
            self.error_count += 1
            logger.error(
                "Request error tracked",
                error=str(e),
                path=request.url.path,
                method=request.method,
                total_errors=self.error_count
            )
            raise
    
    def get_metrics(self) -> Dict[str, Any]:
        """Get current metrics"""
        avg_response_time = 0
        if self.response_times:
            avg_response_time = sum(self.response_times) / len(self.response_times)
        
        return {
            "request_count": self.request_count,
            "error_count": self.error_count,
            "avg_response_time": avg_response_time,
            "error_rate": self.error_count / max(self.request_count, 1) * 100
        }