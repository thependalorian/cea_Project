"""
Enhanced Human-in-the-Loop Coordination with Advanced Rate Limiting

This module implements intelligent rate limiting and coordination for human-in-the-loop
operations, integrating with LangGraph configuration and providing comprehensive
API management across multiple providers.

Location: backendv1/utils/human_in_the_loop.py
"""

import asyncio
import json
import logging
import time
from typing import Dict, Any, List, Optional, Union
from dataclasses import dataclass
from enum import Enum
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


class ProviderType(Enum):
    """API Provider types with their specific characteristics"""

    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    COHERE = "cohere"
    SUPABASE = "supabase"
    GENERIC = "generic"


@dataclass
class RateLimitConfig:
    """Configuration for rate limiting per provider"""

    requests_per_minute: int
    tokens_per_minute: int
    burst_limit: int
    cooldown_seconds: int
    max_retries: int
    timeout_seconds: int


class EnhancedRateLimiter:
    """
    Advanced rate limiter with token tracking, provider-specific handling,
    and LangGraph configuration integration.
    """

    def __init__(self, config_path: Optional[str] = None):
        """
        Initialize the enhanced rate limiter.

        Args:
            config_path: Path to LangGraph configuration file
        """
        self.provider_configs = self._load_provider_configs(config_path)
        self.request_history: Dict[str, List[float]] = {}
        self.token_usage: Dict[str, Dict[str, int]] = {}
        self.burst_tracking: Dict[str, List[float]] = {}
        self.cooldown_until: Dict[str, float] = {}
        self.error_counts: Dict[str, int] = {}

        # LangGraph integration
        self.langgraph_config = self._load_langgraph_config(config_path)

        logger.info("Enhanced rate limiter initialized with provider-specific configs")

    def _load_provider_configs(
        self, config_path: Optional[str] = None
    ) -> Dict[str, RateLimitConfig]:
        """Load provider-specific rate limiting configurations"""
        default_configs = {
            ProviderType.OPENAI.value: RateLimitConfig(
                requests_per_minute=60,
                tokens_per_minute=150000,  # GPT-4 tier 1 limit
                burst_limit=10,
                cooldown_seconds=60,
                max_retries=3,
                timeout_seconds=30,
            ),
            ProviderType.ANTHROPIC.value: RateLimitConfig(
                requests_per_minute=50,
                tokens_per_minute=100000,  # Claude tier 1 limit
                burst_limit=8,
                cooldown_seconds=45,
                max_retries=3,
                timeout_seconds=30,
            ),
            ProviderType.COHERE.value: RateLimitConfig(
                requests_per_minute=100,
                tokens_per_minute=200000,  # Cohere tier 1 limit
                burst_limit=15,
                cooldown_seconds=30,
                max_retries=2,
                timeout_seconds=25,
            ),
            ProviderType.SUPABASE.value: RateLimitConfig(
                requests_per_minute=200,
                tokens_per_minute=1000000,  # Database operations
                burst_limit=25,
                cooldown_seconds=15,
                max_retries=5,
                timeout_seconds=20,
            ),
            ProviderType.GENERIC.value: RateLimitConfig(
                requests_per_minute=30,
                tokens_per_minute=50000,
                burst_limit=5,
                cooldown_seconds=90,
                max_retries=2,
                timeout_seconds=45,
            ),
        }

        # TODO: Load from config file if provided
        return default_configs

    def _load_langgraph_config(self, config_path: Optional[str] = None) -> Dict[str, Any]:
        """Load LangGraph configuration for rate limiting integration"""
        try:
            if config_path:
                with open(config_path, "r") as f:
                    config = json.load(f)
                    return config.get("rate_limits", {})
            else:
                # Load from default langgraph.json
                try:
                    with open("langgraph.json", "r") as f:
                        config = json.load(f)
                        return config.get("rate_limits", {})
                except FileNotFoundError:
                    logger.warning("langgraph.json not found, using default rate limits")
                    return {}
        except Exception as e:
            logger.error(f"Error loading LangGraph config: {e}")
            return {}

    async def check_rate_limit(
        self, provider: str, estimated_tokens: int = 0, operation_type: str = "request"
    ) -> Dict[str, Any]:
        """
        Enhanced rate limit checking with token tracking.

        Args:
            provider: Provider identifier
            estimated_tokens: Estimated token usage for the operation
            operation_type: Type of operation (request, streaming, batch)

        Returns:
            Dictionary with rate limit status and recommendations
        """
        current_time = time.time()
        provider_config = self.provider_configs.get(
            provider, self.provider_configs[ProviderType.GENERIC.value]
        )

        # Check if in cooldown period
        if provider in self.cooldown_until and current_time < self.cooldown_until[provider]:
            cooldown_remaining = self.cooldown_until[provider] - current_time
            return {
                "allowed": False,
                "reason": "cooldown_active",
                "wait_time": cooldown_remaining,
                "recommendation": "wait_for_cooldown",
            }

        # Initialize tracking for new provider
        if provider not in self.request_history:
            self.request_history[provider] = []
            self.token_usage[provider] = {"current_minute": 0, "minute_start": current_time}
            self.burst_tracking[provider] = []
            self.error_counts[provider] = 0

        # Clean old request history (keep last minute)
        cutoff_time = current_time - 60
        self.request_history[provider] = [
            req_time for req_time in self.request_history[provider] if req_time > cutoff_time
        ]

        # Clean burst tracking (keep last 10 seconds)
        burst_cutoff = current_time - 10
        self.burst_tracking[provider] = [
            req_time for req_time in self.burst_tracking[provider] if req_time > burst_cutoff
        ]

        # Reset token usage if new minute
        if current_time - self.token_usage[provider]["minute_start"] >= 60:
            self.token_usage[provider] = {"current_minute": 0, "minute_start": current_time}

        # Check request rate limit
        if len(self.request_history[provider]) >= provider_config.requests_per_minute:
            return {
                "allowed": False,
                "reason": "request_rate_exceeded",
                "wait_time": 60 - (current_time - min(self.request_history[provider])),
                "recommendation": "exponential_backoff",
            }

        # Check token rate limit
        if estimated_tokens > 0:
            if (
                self.token_usage[provider]["current_minute"] + estimated_tokens
            ) > provider_config.tokens_per_minute:
                return {
                    "allowed": False,
                    "reason": "token_rate_exceeded",
                    "wait_time": 60 - (current_time - self.token_usage[provider]["minute_start"]),
                    "recommendation": "reduce_token_usage",
                }

        # Check burst limit
        if len(self.burst_tracking[provider]) >= provider_config.burst_limit:
            return {
                "allowed": False,
                "reason": "burst_limit_exceeded",
                "wait_time": 10 - (current_time - min(self.burst_tracking[provider])),
                "recommendation": "implement_jitter",
            }

        # Check error threshold
        if self.error_counts[provider] >= 5:  # Error threshold
            self.cooldown_until[provider] = current_time + provider_config.cooldown_seconds
            return {
                "allowed": False,
                "reason": "error_threshold_exceeded",
                "wait_time": provider_config.cooldown_seconds,
                "recommendation": "investigate_errors",
            }

        return {
            "allowed": True,
            "reason": "within_limits",
            "current_usage": {
                "requests_this_minute": len(self.request_history[provider]),
                "tokens_this_minute": self.token_usage[provider]["current_minute"],
                "burst_requests": len(self.burst_tracking[provider]),
                "error_count": self.error_counts[provider],
            },
            "limits": {
                "max_requests_per_minute": provider_config.requests_per_minute,
                "max_tokens_per_minute": provider_config.tokens_per_minute,
                "burst_limit": provider_config.burst_limit,
            },
        }

    async def record_request(
        self,
        provider: str,
        tokens_used: int = 0,
        success: bool = True,
        response_time_ms: Optional[int] = None,
    ) -> None:
        """
        Record a completed request for rate limiting tracking.

        Args:
            provider: Provider identifier
            tokens_used: Actual tokens consumed
            success: Whether the request was successful
            response_time_ms: Response time in milliseconds
        """
        current_time = time.time()

        # Record request time
        if provider not in self.request_history:
            self.request_history[provider] = []
        self.request_history[provider].append(current_time)

        # Record burst tracking
        if provider not in self.burst_tracking:
            self.burst_tracking[provider] = []
        self.burst_tracking[provider].append(current_time)

        # Update token usage
        if provider not in self.token_usage:
            self.token_usage[provider] = {"current_minute": 0, "minute_start": current_time}
        self.token_usage[provider]["current_minute"] += tokens_used

        # Update error count
        if provider not in self.error_counts:
            self.error_counts[provider] = 0

        if not success:
            self.error_counts[provider] += 1
        else:
            # Reset error count on successful request
            self.error_counts[provider] = max(0, self.error_counts[provider] - 1)

        # Log performance metrics
        if response_time_ms:
            logger.info(
                f"Request to {provider}: {response_time_ms}ms, {tokens_used} tokens, success: {success}"
            )

    def get_wait_time_recommendation(self, provider: str) -> Dict[str, Any]:
        """
        Get intelligent wait time recommendations based on current state.

        Args:
            provider: Provider identifier

        Returns:
            Dictionary with wait time recommendations and strategies
        """
        current_time = time.time()
        provider_config = self.provider_configs.get(
            provider, self.provider_configs[ProviderType.GENERIC.value]
        )

        if provider not in self.request_history:
            return {"wait_time": 0, "strategy": "immediate"}

        # Calculate time until next request slot is available
        if len(self.request_history[provider]) >= provider_config.requests_per_minute:
            oldest_request = min(self.request_history[provider])
            wait_time = 60 - (current_time - oldest_request)
            return {
                "wait_time": max(0, wait_time),
                "strategy": "linear_backoff",
                "reason": "request_rate_limit",
            }

        # Check burst limit
        if len(self.burst_tracking[provider]) >= provider_config.burst_limit:
            oldest_burst = min(self.burst_tracking[provider])
            wait_time = 10 - (current_time - oldest_burst)
            return {
                "wait_time": max(0, wait_time),
                "strategy": "jitter_backoff",
                "reason": "burst_limit",
            }

        # Exponential backoff based on error count
        if self.error_counts[provider] > 0:
            wait_time = min(2 ** self.error_counts[provider], 60)
            return {
                "wait_time": wait_time,
                "strategy": "exponential_backoff",
                "reason": "error_recovery",
            }

        return {"wait_time": 0, "strategy": "immediate"}


class HumanInTheLoopCoordinator:
    """
    Enhanced coordinator for human-in-the-loop operations with advanced rate limiting.
    """

    def __init__(self, config_path: Optional[str] = None):
        """Initialize the HITL coordinator with enhanced rate limiting"""
        self.rate_limiter = EnhancedRateLimiter(config_path)
        self.active_sessions: Dict[str, Dict[str, Any]] = {}
        self.intervention_history: List[Dict[str, Any]] = []

        logger.info("HITL Coordinator initialized with enhanced rate limiting")

    async def evaluate_intervention_need(
        self,
        state: Dict[str, Any],
        quality_metrics: Optional[Dict[str, Any]] = None,
        routing_decision: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Enhanced evaluation of whether human intervention is needed.

        Args:
            state: Current workflow state
            quality_metrics: Quality assessment metrics
            routing_decision: Agent routing decision

        Returns:
            Dictionary with intervention recommendation and rate limiting info
        """
        # Check rate limits before proceeding
        rate_check = await self.rate_limiter.check_rate_limit(
            provider="openai",  # Default provider for evaluation
            estimated_tokens=500,  # Estimated tokens for evaluation
            operation_type="evaluation",
        )

        if not rate_check["allowed"]:
            return {
                "needs_intervention": False,
                "reason": "rate_limited",
                "rate_limit_info": rate_check,
                "recommendation": "defer_evaluation",
            }

        # Perform intervention evaluation
        intervention_score = 0.0
        reasons = []

        # Quality-based intervention triggers
        if quality_metrics:
            if quality_metrics.get("confidence_score", 1.0) < 0.6:
                intervention_score += 0.3
                reasons.append("low_confidence")

            if quality_metrics.get("clarity_score", 1.0) < 0.5:
                intervention_score += 0.2
                reasons.append("low_clarity")

        # State-based intervention triggers
        if state.get("error_count", 0) > 2:
            intervention_score += 0.4
            reasons.append("repeated_errors")

        if state.get("user_frustration_detected", False):
            intervention_score += 0.5
            reasons.append("user_frustration")

        # Record the evaluation request
        await self.rate_limiter.record_request(provider="openai", tokens_used=500, success=True)

        needs_intervention = intervention_score >= 0.5

        return {
            "needs_intervention": needs_intervention,
            "intervention_score": intervention_score,
            "reasons": reasons,
            "rate_limit_info": rate_check,
            "recommendation": "human_review" if needs_intervention else "continue_automated",
        }


# Standalone function for backward compatibility
async def evaluate_intervention_need(
    state: Dict[str, Any],
    quality_metrics: Optional[Dict[str, Any]] = None,
    routing_decision: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Standalone function for evaluating intervention need.
    Maintains backward compatibility while using enhanced coordinator.
    """
    coordinator = HumanInTheLoopCoordinator()
    return await coordinator.evaluate_intervention_need(state, quality_metrics, routing_decision)


# Backward compatibility alias
human_loop_coordinator = HumanInTheLoopCoordinator()

# Export main classes and functions
__all__ = [
    "EnhancedRateLimiter",
    "HumanInTheLoopCoordinator",
    "evaluate_intervention_need",
    "human_loop_coordinator",  # Backward compatibility
    "ProviderType",
    "RateLimitConfig",
]
