"""
Empathy Data Models

Following rule #12: Complete code verification with proper empathy models
Following rule #15: Include comprehensive error handling

This module defines empathy and emotional intelligence data models.
Location: backendv1/models/empathy_model.py
"""

from datetime import datetime
from typing import Any, Dict, List, Optional
from enum import Enum

from pydantic import BaseModel, Field


class EmotionalState(BaseModel):
    """
    User emotional state assessment
    """

    user_id: str = Field(..., description="User identifier")
    emotional_indicators: Dict[str, float] = Field(default_factory=dict)
    stress_level: float = Field(default=0.0, ge=0.0, le=1.0)
    confidence_level: float = Field(default=0.5, ge=0.0, le=1.0)
    support_needed: bool = Field(default=False)
    crisis_indicators: List[str] = Field(default_factory=list)
    assessed_at: datetime = Field(default_factory=datetime.utcnow)


class EmpathyAssessment(BaseModel):
    """
    Empathy assessment and response recommendations
    """

    assessment_id: str = Field(..., description="Assessment identifier")
    user_id: str = Field(..., description="User identifier")
    emotional_state: EmotionalState
    empathy_score: float = Field(..., description="Empathy response score")
    recommended_approach: str = Field(..., description="Recommended empathy approach")
    specialist_recommendation: Optional[str] = None
    intervention_needed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)


# Export main classes
__all__ = ["EmotionalState", "EmpathyAssessment"]
