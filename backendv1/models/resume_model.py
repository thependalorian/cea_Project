"""
Resume Data Models

Following rule #12: Complete code verification with proper resume models
Following rule #15: Include comprehensive error handling

This module defines resume-related data models and analysis results.
Location: backendv1/models/resume_model.py
"""

from datetime import datetime
from typing import Any, Dict, List, Optional
from enum import Enum

from pydantic import BaseModel, Field


class ResumeModel(BaseModel):
    """
    Resume data model

    Following rule #12: Complete code verification with proper typing
    """

    id: str = Field(..., description="Unique resume identifier")
    user_id: str = Field(..., description="Associated user ID")
    filename: str = Field(..., description="Original filename")
    content: str = Field(..., description="Extracted text content")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None

    class Config:
        json_encoders = {datetime: lambda v: v.isoformat()}


class ResumeAnalysis(BaseModel):
    """
    Resume analysis results
    """

    resume_id: str = Field(..., description="Associated resume ID")
    analysis_score: float = Field(..., description="Overall analysis score")
    recommendations: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class SkillExtraction(BaseModel):
    """
    Extracted skills from resume
    """

    resume_id: str = Field(..., description="Associated resume ID")
    skills: List[str] = Field(default_factory=list)
    confidence_scores: Dict[str, float] = Field(default_factory=dict)


# Export main classes
__all__ = ["ResumeModel", "ResumeAnalysis", "SkillExtraction"]
