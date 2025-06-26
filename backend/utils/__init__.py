"""
Utility modules for the Climate Economy Assistant.
"""

from .logger import get_logger, StructuredLogger
from .error_handling import (
    AppError,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    RateLimitError,
    handle_exception,
    format_error_response,
)
from .memory_manager import MemoryManager, memory_manager
from .optimization import OptimizationManager, optimization_manager

__all__ = [
    "get_logger",
    "StructuredLogger",
    "AppError",
    "ValidationError",
    "AuthenticationError",
    "AuthorizationError",
    "NotFoundError",
    "RateLimitError",
    "handle_exception",
    "format_error_response",
    "MemoryManager",
    "memory_manager",
    "OptimizationManager",
    "optimization_manager",
]
