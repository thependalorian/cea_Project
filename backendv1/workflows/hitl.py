"""
Human-in-the-Loop (HITL) Steering with LangGraph Agent Orchestration
===================================================================

This module is a compatibility wrapper around human_steering.py.
It provides the same interface but delegates to the canonical implementation
in human_steering.py to avoid code duplication.

Location: backendv1/workflows/hitl.py
"""

import logging
from typing import Dict, Any, List, Optional, Union
from datetime import datetime

# Import from the canonical implementation
from .human_steering import HumanSteering as CanonicalHumanSteering, evaluate_intervention_need

logger = logging.getLogger(__name__)


class HumanSteering(CanonicalHumanSteering):
    """
    Compatibility wrapper around the canonical HumanSteering implementation.

    This class inherits from the canonical implementation to maintain
    backward compatibility while avoiding code duplication.
    """

    def __init__(self):
        """Initialize the human steering wrapper."""
        super().__init__()
        logger.info("Using HITL compatibility wrapper around human_steering.py")

    async def create_intelligent_steering_point(
        self, state: Any, steering_type: str = "discovery", context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Compatibility method that maps to the canonical implementation.

        Args:
            state: Current workflow state with user context
            steering_type: Type of steering (discovery, strategy, action_planning, matching)
            context: Additional context for the steering point

        Returns:
            Updated state with dynamic guidance and interrupt handling
        """
        # Map to the closest equivalent method in the canonical implementation
        steering_point = self._determine_steering_point(state)
        return await self.create_steering_point(state, steering_point, context)


# Export the canonical functions directly
__all__ = ["HumanSteering", "evaluate_intervention_need"]
