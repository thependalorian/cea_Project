"""
Error handling utilities for the Climate Economy Assistant.
Provides standardized error handling and reporting across the application.
"""

import traceback
from typing import Any, Dict, Optional, Tuple, Type, Union
from fastapi import HTTPException, Request, Response
from fastapi.responses import JSONResponse
import json

from backend.utils.logger import get_logger

logger = get_logger(__name__)


class AppError(Exception):
    """Base error class for application-specific errors."""

    def __init__(
        self,
        message: str,
        status_code: int = 500,
        error_code: str = "INTERNAL_ERROR",
        details: Optional[Dict[str, Any]] = None,
    ):
        self.message = message
        self.status_code = status_code
        self.error_code = error_code
        self.details = details or {}
        super().__init__(message)


class ValidationError(AppError):
    """Error for validation failures."""

    def __init__(
        self,
        message: str = "Validation error",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(
            message=message,
            status_code=400,
            error_code="VALIDATION_ERROR",
            details=details,
        )


class AuthenticationError(AppError):
    """Error for authentication failures."""

    def __init__(
        self,
        message: str = "Authentication failed",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(
            message=message,
            status_code=401,
            error_code="AUTHENTICATION_ERROR",
            details=details,
        )


class AuthorizationError(AppError):
    """Error for authorization failures."""

    def __init__(
        self, message: str = "Not authorized", details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(
            message=message,
            status_code=403,
            error_code="AUTHORIZATION_ERROR",
            details=details,
        )


class NotFoundError(AppError):
    """Error for resource not found."""

    def __init__(
        self,
        message: str = "Resource not found",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(
            message=message, status_code=404, error_code="NOT_FOUND", details=details
        )


class RateLimitError(AppError):
    """Error for rate limiting."""

    def __init__(
        self,
        message: str = "Rate limit exceeded",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(
            message=message,
            status_code=429,
            error_code="RATE_LIMIT_EXCEEDED",
            details=details,
        )


# Function to handle exceptions in a standardized way
async def handle_exception(request: Request, exc: Exception) -> JSONResponse:
    """Global exception handler for FastAPI."""

    # Get request ID for tracing
    request_id = getattr(request.state, "request_id", None)

    # Handle AppError exceptions
    if isinstance(exc, AppError):
        logger.error(
            f"Application error: {exc.message}",
            error_code=exc.error_code,
            status_code=exc.status_code,
            request_id=request_id,
            details=exc.details,
        )

        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": exc.error_code,
                "message": exc.message,
                "request_id": request_id,
                "details": exc.details,
            },
        )

    # Handle HTTPException
    if isinstance(exc, HTTPException):
        logger.error(
            f"HTTP error: {exc.detail}",
            status_code=exc.status_code,
            request_id=request_id,
        )

        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": "HTTP_ERROR",
                "message": str(exc.detail),
                "request_id": request_id,
            },
        )

    # Handle unexpected exceptions
    logger.error(
        f"Unexpected error: {str(exc)}",
        error_type=type(exc).__name__,
        traceback=traceback.format_exc(),
        request_id=request_id,
    )

    return JSONResponse(
        status_code=500,
        content={
            "error": "INTERNAL_SERVER_ERROR",
            "message": "An unexpected error occurred",
            "request_id": request_id,
        },
    )


def format_error_response(
    message: str,
    error_code: str = "INTERNAL_ERROR",
    details: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Format error response in a consistent structure."""
    return {"error": error_code, "message": message, "details": details or {}}
