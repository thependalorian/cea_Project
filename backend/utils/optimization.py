"""
Performance optimization utilities for the Climate Economy Assistant.
Implements strategies for improving speed, efficiency, and cost-effectiveness.
"""

import asyncio
import time
import functools
from typing import Any, Callable, Dict, List, Optional, TypeVar, Union, cast
import json

from backend.utils.logger import get_logger

logger = get_logger(__name__)

T = TypeVar("T")


class OptimizationManager:
    """
    Manages performance optimizations across the application.
    Implements caching, batching, and efficient resource utilization.
    """

    def __init__(self):
        """Initialize the optimization manager."""
        self.cache = {}
        self.ai_usage_stats = {
            "tokens": {"prompt": 0, "completion": 0, "total": 0},
            "cost": 0.0,
            "requests": 0,
            "models": {},
        }

    def track_ai_usage(
        self, model: str, prompt_tokens: int, completion_tokens: int, cost: float
    ) -> None:
        """
        Track AI usage statistics.

        Args:
            model: AI model used
            prompt_tokens: Number of prompt tokens
            completion_tokens: Number of completion tokens
            cost: Estimated cost
        """
        # Update global counters
        self.ai_usage_stats["tokens"]["prompt"] += prompt_tokens
        self.ai_usage_stats["tokens"]["completion"] += completion_tokens
        self.ai_usage_stats["tokens"]["total"] += prompt_tokens + completion_tokens
        self.ai_usage_stats["cost"] += cost
        self.ai_usage_stats["requests"] += 1

        # Update model-specific counters
        if model not in self.ai_usage_stats["models"]:
            self.ai_usage_stats["models"][model] = {
                "tokens": {"prompt": 0, "completion": 0, "total": 0},
                "cost": 0.0,
                "requests": 0,
            }

        self.ai_usage_stats["models"][model]["tokens"]["prompt"] += prompt_tokens
        self.ai_usage_stats["models"][model]["tokens"][
            "completion"
        ] += completion_tokens
        self.ai_usage_stats["models"][model]["tokens"]["total"] += (
            prompt_tokens + completion_tokens
        )
        self.ai_usage_stats["models"][model]["cost"] += cost
        self.ai_usage_stats["models"][model]["requests"] += 1

    def get_ai_usage_stats(self) -> Dict[str, Any]:
        """
        Get AI usage statistics.

        Returns:
            Dict[str, Any]: AI usage statistics
        """
        return self.ai_usage_stats

    def reset_ai_usage_stats(self) -> None:
        """Reset AI usage statistics."""
        self.ai_usage_stats = {
            "tokens": {"prompt": 0, "completion": 0, "total": 0},
            "cost": 0.0,
            "requests": 0,
            "models": {},
        }

    def cache_function(self, ttl: int = 60):
        """
        Decorator for caching function results.

        Args:
            ttl: Time to live in seconds
        """

        def decorator(func):
            cache_key = func.__name__

            @functools.wraps(func)
            async def wrapper(*args, **kwargs):
                # Generate cache key
                arg_key = json.dumps(args) + json.dumps(sorted(kwargs.items()))
                full_key = f"{cache_key}:{arg_key}"

                # Check cache
                if full_key in self.cache:
                    entry = self.cache[full_key]

                    # Check if entry is still valid
                    if time.time() < entry["expires"]:
                        logger.debug(f"Cache hit: {full_key}")
                        return entry["value"]

                # Call the function
                result = await func(*args, **kwargs)

                # Store in cache
                self.cache[full_key] = {"value": result, "expires": time.time() + ttl}

                logger.debug(f"Cache miss: {full_key}")
                return result

            return wrapper

        return decorator

    async def execute_with_timeout(
        self, func: Callable, timeout: float, *args, **kwargs
    ) -> Any:
        """
        Execute a function with a timeout.

        Args:
            func: Function to execute
            timeout: Timeout in seconds
            args: Positional arguments
            kwargs: Keyword arguments

        Returns:
            Any: Function result

        Raises:
            asyncio.TimeoutError: If the function execution times out
        """
        try:
            return await asyncio.wait_for(func(*args, **kwargs), timeout=timeout)
        except asyncio.TimeoutError:
            logger.warning(
                f"Function execution timed out after {timeout}s", function=func.__name__
            )
            raise

    async def execute_with_retry(
        self,
        func: Callable,
        max_retries: int = 3,
        retry_delay: float = 1.0,
        backoff_factor: float = 2.0,
        *args,
        **kwargs,
    ) -> Any:
        """
        Execute a function with retry logic.

        Args:
            func: Function to execute
            max_retries: Maximum number of retries
            retry_delay: Initial delay between retries in seconds
            backoff_factor: Backoff factor for retry delay
            args: Positional arguments
            kwargs: Keyword arguments

        Returns:
            Any: Function result

        Raises:
            Exception: If all retries fail
        """
        last_error = None

        for retry in range(max_retries + 1):
            try:
                if retry > 0:
                    logger.info(
                        f"Retry attempt {retry}/{max_retries}", function=func.__name__
                    )

                return await func(*args, **kwargs)

            except Exception as e:
                last_error = e

                if retry < max_retries:
                    # Calculate delay with exponential backoff
                    delay = retry_delay * (backoff_factor**retry)

                    logger.warning(
                        f"Execution failed, retrying in {delay:.2f}s",
                        function=func.__name__,
                        error=str(e),
                        retry=retry,
                    )

                    await asyncio.sleep(delay)
                else:
                    logger.error(
                        f"Max retries reached", function=func.__name__, error=str(e)
                    )

        assert last_error is not None
        raise last_error


# Create a global instance
optimization_manager = OptimizationManager()
