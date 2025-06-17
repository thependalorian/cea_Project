"""
Agent Data Models

Following rule #12: Complete code verification with proper agent models
Following rule #15: Include comprehensive error handling

This module defines agent response and interaction data models.
Location: backendv1/models/agent_model.py
"""

from datetime import datetime
from typing import Any, Dict, List, Optional
from enum import Enum

from pydantic import BaseModel, Field


class AgentResponse(BaseModel):
    """
    Agent response data model
    """

    id: str = Field(..., description="Unique response identifier")
    agent_name: str = Field(..., description="Responding agent name")
    content: str = Field(..., description="Response content")
    confidence_score: float = Field(..., description="Response confidence")
    sources: List[str] = Field(default_factory=list)
    next_actions: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class SpecialistInteraction(BaseModel):
    """
    Specialist interaction tracking
    """

    interaction_id: str = Field(..., description="Interaction identifier")
    user_id: str = Field(..., description="User identifier")
    specialist_name: str = Field(..., description="Specialist name")
    interaction_type: str = Field(..., description="Type of interaction")
    duration: Optional[float] = None
    outcome: Optional[str] = None
    satisfaction_score: Optional[float] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


# Export main classes
__all__ = ["AgentResponse", "SpecialistInteraction"]
