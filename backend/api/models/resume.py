"""
Resume models for the Climate Economy Assistant.
"""

from pydantic import BaseModel
from typing import Dict, Any, Optional, List
from datetime import datetime


class ResumeAnalysisBase(BaseModel):
    """Base resume analysis model."""

    climate_relevance_score: float
    recommended_roles: List[str]
    skills: List[str]
    skill_gaps: List[str]
    enhancement_suggestions: List[str]
    climate_sectors_match: Dict[str, float]
    metadata: Optional[Dict[str, Any]] = None


class ResumeAnalysisCreate(ResumeAnalysisBase):
    """Resume analysis creation model."""

    file_name: str
    content: str
    content_embedding: List[float]


class ResumeAnalysisResponse(ResumeAnalysisBase):
    """Resume analysis response model."""

    id: str
    file_name: str
    processing_status: str
    created_at: datetime
    updated_at: datetime
