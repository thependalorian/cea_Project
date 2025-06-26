"""
Resume models for the Climate Economy Assistant.
Defines resume processing, analysis, and storage models.
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from enum import Enum
from pydantic import BaseModel, Field, validator
import uuid

from .base import BaseDBModel


class ResumeFormat(str, Enum):
    """Supported resume file formats."""

    PDF = "pdf"
    DOCX = "docx"
    DOC = "doc"
    TXT = "txt"
    RTF = "rtf"
    HTML = "html"
    JSON = "json"


class EducationLevel(str, Enum):
    """Education levels."""

    HIGH_SCHOOL = "high_school"
    ASSOCIATE = "associate"
    BACHELOR = "bachelor"
    MASTER = "master"
    DOCTORATE = "doctorate"
    CERTIFICATION = "certification"
    VOCATIONAL = "vocational"
    OTHER = "other"


class Resume(BaseDBModel):
    """Resume model for storing processed resume data."""

    resume_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str

    # File information
    file_name: str
    file_format: ResumeFormat
    file_size: int  # Size in bytes
    file_url: str  # URL to stored file

    # Basic information
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None

    # Sections
    objective: Optional[str] = None
    summary: Optional[str] = None
    education: List[Dict[str, Any]] = Field(default_factory=list)
    experience: List[Dict[str, Any]] = Field(default_factory=list)
    skills: List[str] = Field(default_factory=list)
    certificates: List[Dict[str, Any]] = Field(default_factory=list)
    projects: List[Dict[str, Any]] = Field(default_factory=list)
    languages: List[Dict[str, str]] = Field(default_factory=list)

    # Military service
    military_service: Optional[Dict[str, Any]] = None

    # Analysis fields
    extracted_skills: List[Dict[str, Any]] = Field(default_factory=list)
    skill_keywords: List[str] = Field(default_factory=list)
    years_of_experience: Optional[float] = None
    highest_education: Optional[EducationLevel] = None
    career_level: Optional[str] = None

    # Climate-specific analysis
    climate_relevant_skills: List[str] = Field(default_factory=list)
    climate_relevant_experience: List[Dict[str, Any]] = Field(default_factory=list)
    climate_relevance_score: float = 0.0  # 0.0 - 1.0

    # Veterans-specific analysis
    military_skills_translation: Optional[Dict[str, Any]] = None
    veteran_status_detected: bool = False

    # International-specific analysis
    international_credentials: List[Dict[str, Any]] = Field(default_factory=list)
    international_experience: List[Dict[str, Any]] = Field(default_factory=list)

    # Transformation flags
    is_parsed: bool = False
    is_analyzed: bool = False
    is_anonymized: bool = False

    # Processing metadata
    processing_errors: List[Dict[str, Any]] = Field(default_factory=list)
    processing_warnings: List[Dict[str, Any]] = Field(default_factory=list)
    processing_status: str = "pending"  # "pending", "processing", "completed", "failed"

    # Timestamps
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)
    processed_at: Optional[datetime] = None
    analyzed_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Vector embedding for similarity search
    embedding_vector: Optional[List[float]] = None

    def mark_processed(self) -> None:
        """Mark the resume as processed."""
        self.is_parsed = True
        self.processed_at = datetime.utcnow()
        self.processing_status = "completed"
        self.updated_at = datetime.utcnow()

    def mark_analyzed(self) -> None:
        """Mark the resume as analyzed."""
        self.is_analyzed = True
        self.analyzed_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()

    @validator("file_format", pre=True)
    def validate_file_format(cls, v):
        """Validate the file format."""
        if isinstance(v, str):
            return ResumeFormat(v.lower())
        return v

    @validator("highest_education", pre=True)
    def validate_education_level(cls, v):
        """Validate the education level."""
        if isinstance(v, str):
            return EducationLevel(v.lower())
        return v


class ResumeAnalysis(BaseDBModel):
    """Resume analysis results."""

    analysis_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    resume_id: str
    user_id: str

    # Skill analysis
    skills_identified: List[Dict[str, Any]] = Field(default_factory=list)
    skill_gaps: List[Dict[str, Any]] = Field(default_factory=list)
    skill_strengths: List[Dict[str, Any]] = Field(default_factory=list)

    # Career analysis
    career_path_recommendations: List[Dict[str, Any]] = Field(default_factory=list)
    industry_fit_scores: Dict[str, float] = Field(default_factory=dict)
    job_role_recommendations: List[Dict[str, Any]] = Field(default_factory=list)

    # Climate-specific analysis
    climate_career_fit: Dict[str, Any] = Field(default_factory=dict)
    climate_transition_plan: Optional[Dict[str, Any]] = None
    sustainability_impact_potential: Optional[float] = None

    # Development recommendations
    skill_development_recommendations: List[Dict[str, Any]] = Field(
        default_factory=list
    )
    training_recommendations: List[Dict[str, Any]] = Field(default_factory=list)
    certification_recommendations: List[Dict[str, Any]] = Field(default_factory=list)

    # Resume improvement
    resume_improvement_suggestions: List[Dict[str, Any]] = Field(default_factory=list)
    content_quality_score: Optional[float] = None  # 0.0 - 1.0
    keyword_optimization_suggestions: List[Dict[str, Any]] = Field(default_factory=list)

    # Veterans-specific analysis
    military_skills_translation: Optional[Dict[str, Any]] = None
    veteran_specific_recommendations: List[Dict[str, Any]] = Field(default_factory=list)

    # International-specific analysis
    credential_equivalency: List[Dict[str, Any]] = Field(default_factory=list)
    international_transition_recommendations: List[Dict[str, Any]] = Field(
        default_factory=list
    )

    # Analysis metadata
    analysis_version: str = "1.0.0"
    tools_used: List[str] = Field(default_factory=list)
    confidence_score: float = 0.0  # 0.0 - 1.0

    # Timestamps
    analyzed_at: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class ResumeVersion(BaseDBModel):
    """Resume version for tracking changes."""

    version_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    resume_id: str
    user_id: str

    # Version information
    version_number: int
    version_name: Optional[str] = None
    version_notes: Optional[str] = None

    # File information
    file_url: str
    file_format: ResumeFormat

    # Version differences
    added_content: List[Dict[str, Any]] = Field(default_factory=list)
    removed_content: List[Dict[str, Any]] = Field(default_factory=list)
    modified_content: List[Dict[str, Any]] = Field(default_factory=list)

    # Improvement metrics
    skill_coverage_change: float = 0.0  # Positive or negative percentage
    keyword_optimization_change: float = 0.0
    content_quality_change: float = 0.0

    # Analysis results for this version
    analysis_id: Optional[str] = None

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)

    @validator("file_format", pre=True)
    def validate_file_format(cls, v):
        """Validate the file format."""
        if isinstance(v, str):
            return ResumeFormat(v.lower())
        return v


class ResumeUpload(BaseModel):
    """Model for resume upload request."""

    user_id: str
    file_name: str
    file_format: str
    file_content_base64: str
    perform_analysis: bool = True

    @validator("file_format")
    def validate_file_format(cls, v):
        """Validate the file format."""
        try:
            ResumeFormat(v.lower())
            return v.lower()
        except ValueError:
            raise ValueError(f"Unsupported file format: {v}")


class SkillRecommendation(BaseModel):
    """Skill recommendation model."""

    skill_name: str
    relevance_score: float  # 0.0 - 1.0
    climate_relevance: float  # 0.0 - 1.0
    description: str
    reason: str
    resources: List[Dict[str, Any]] = Field(default_factory=list)

    class Config:
        """Pydantic configuration."""

        schema_extra = {
            "example": {
                "skill_name": "Solar Panel Installation",
                "relevance_score": 0.95,
                "climate_relevance": 0.9,
                "description": "The ability to install and maintain solar panel systems.",
                "reason": "Based on your background in electrical engineering and interest in renewable energy.",
                "resources": [
                    {
                        "name": "Solar Training Network",
                        "url": "https://example.com/solar-training",
                        "type": "training",
                    }
                ],
            }
        }
