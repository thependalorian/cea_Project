"""
Job models for the Climate Economy Assistant.
Defines job listings, skills, and matching algorithms.
"""

from datetime import datetime
from typing import Optional, List, Dict, Any, Set
from enum import Enum
from pydantic import BaseModel, Field, HttpUrl, validator
import uuid

from .base import BaseDBModel


class JobType(str, Enum):
    """Types of job positions."""

    FULL_TIME = "full_time"
    PART_TIME = "part_time"
    CONTRACT = "contract"
    FREELANCE = "freelance"
    INTERNSHIP = "internship"
    APPRENTICESHIP = "apprenticeship"
    FELLOWSHIP = "fellowship"
    VOLUNTEER = "volunteer"
    TEMPORARY = "temporary"


class ExperienceLevel(str, Enum):
    """Job experience levels."""

    ENTRY = "entry"
    ASSOCIATE = "associate"
    MID = "mid"
    SENIOR = "senior"
    LEAD = "lead"
    MANAGER = "manager"
    DIRECTOR = "director"
    EXECUTIVE = "executive"


class LocationType(str, Enum):
    """Job location types."""

    ONSITE = "onsite"
    HYBRID = "hybrid"
    REMOTE = "remote"


class IndustryType(str, Enum):
    """Climate-related industry types."""

    RENEWABLE_ENERGY = "renewable_energy"
    CLEAN_TRANSPORTATION = "clean_transportation"
    GREEN_BUILDING = "green_building"
    SUSTAINABLE_AGRICULTURE = "sustainable_agriculture"
    WASTE_MANAGEMENT = "waste_management"
    CARBON_CAPTURE = "carbon_capture"
    CIRCULAR_ECONOMY = "circular_economy"
    CLIMATE_FINANCE = "climate_finance"
    CLIMATE_POLICY = "climate_policy"
    CONSERVATION = "conservation"
    ENVIRONMENTAL_JUSTICE = "environmental_justice"
    WATER_MANAGEMENT = "water_management"
    GREEN_TECH = "green_tech"
    SUSTAINABLE_FASHION = "sustainable_fashion"
    OTHER = "other"


class JobListing(BaseDBModel):
    """Job listing model."""

    job_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    company: str
    company_id: Optional[str] = None

    # Job details
    description: str
    responsibilities: List[str] = Field(default_factory=list)
    qualifications: List[str] = Field(default_factory=list)
    benefits: List[str] = Field(default_factory=list)

    # Classification
    job_type: JobType
    experience_level: ExperienceLevel
    location_type: LocationType
    industry: IndustryType

    # Location
    location: Optional[str] = None  # City, State/Province, Country
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    remote_regions: List[str] = Field(
        default_factory=list
    )  # Regions where remote workers can be based

    # Skills and keywords
    required_skills: List[str] = Field(default_factory=list)
    preferred_skills: List[str] = Field(default_factory=list)
    keywords: List[str] = Field(default_factory=list)

    # Compensation
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    salary_currency: str = "USD"
    salary_period: str = "year"  # "hour", "day", "week", "month", "year"

    # Application details
    application_url: Optional[HttpUrl] = None
    contact_email: Optional[str] = None
    application_instructions: Optional[str] = None

    # Status
    is_active: bool = True
    is_featured: bool = False
    is_verified: bool = False

    # Climate impact metrics
    climate_impact_category: List[str] = Field(default_factory=list)
    climate_impact_score: Optional[float] = None  # 0.0 - 1.0
    sustainability_goals: List[str] = Field(default_factory=list)

    # Veterans and international
    military_friendly: bool = False
    visa_sponsorship: bool = False

    # Timestamps
    publish_date: datetime = Field(default_factory=datetime.utcnow)
    expiry_date: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # System fields
    source: str = "manual"  # "manual", "api", "scraper", etc.
    source_job_id: Optional[str] = None
    embedding_vector: Optional[List[float]] = None

    def is_expired(self) -> bool:
        """Check if job listing is expired."""
        if not self.expiry_date:
            return False
        return datetime.utcnow() > self.expiry_date

    def generate_embedding_vector(self):
        """Generate embedding vector for semantic search."""
        # Implementation will be done in a separate function
        pass

    @validator("job_type", "experience_level", "location_type", "industry", pre=True)
    def validate_enums(cls, v, values, field):
        """Validate enum fields."""
        if isinstance(v, str):
            if field.name == "job_type":
                return JobType(v)
            elif field.name == "experience_level":
                return ExperienceLevel(v)
            elif field.name == "location_type":
                return LocationType(v)
            elif field.name == "industry":
                return IndustryType(v)
        return v


class JobApplication(BaseDBModel):
    """Job application model."""

    application_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    job_id: str
    user_id: str

    # Application status
    status: str = (
        "applied"  # "applied", "screening", "interviewing", "offer", "hired", "rejected"
    )
    status_updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Application details
    cover_letter: Optional[str] = None
    resume_id: Optional[str] = None
    skills_match_score: Optional[float] = None  # 0.0 - 1.0

    # User notes
    user_notes: Optional[str] = None

    # Timestamps
    applied_at: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class Skill(BaseDBModel):
    """Skill entity model."""

    skill_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str

    # Classification
    category: str  # "technical", "soft", "industry", etc.
    is_technical: bool = False

    # Climate-specific
    climate_relevance: float = 0.0  # 0.0 - 1.0
    climate_sectors: List[str] = Field(default_factory=list)

    # Relationships
    related_skills: List[str] = Field(default_factory=list)
    parent_skills: List[str] = Field(default_factory=list)
    child_skills: List[str] = Field(default_factory=list)

    # Metadata
    description: Optional[str] = None
    aliases: List[str] = Field(default_factory=list)

    # System fields
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    embedding_vector: Optional[List[float]] = None

    def get_full_skill_tree(self) -> Dict[str, Any]:
        """Get the full skill tree including parents and children."""
        # This would be implemented separately to avoid circular imports
        pass


class JobMatch(BaseModel):
    """Job matching results for a user."""

    user_id: str
    job_id: str
    match_score: float  # 0.0 - 1.0

    # Match details
    skill_match_score: float  # 0.0 - 1.0
    experience_match_score: float  # 0.0 - 1.0
    location_match_score: float  # 0.0 - 1.0
    salary_match_score: float  # 0.0 - 1.0

    # Skill details
    matching_skills: List[str] = Field(default_factory=list)
    missing_required_skills: List[str] = Field(default_factory=list)
    missing_preferred_skills: List[str] = Field(default_factory=list)

    # Insights
    career_path_alignment: float = 0.0  # 0.0 - 1.0
    growth_opportunity: float = 0.0  # 0.0 - 1.0
    climate_impact_alignment: float = 0.0  # 0.0 - 1.0

    # Timestamp
    matched_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        """Pydantic configuration."""

        arbitrary_types_allowed = True


class JobSearchFilters(BaseModel):
    """Job search filters."""

    keywords: Optional[str] = None
    job_types: Set[JobType] = Field(default_factory=set)
    experience_levels: Set[ExperienceLevel] = Field(default_factory=set)
    location_types: Set[LocationType] = Field(default_factory=set)
    industries: Set[IndustryType] = Field(default_factory=set)

    location: Optional[str] = None
    distance: Optional[int] = None  # Distance in miles/km from location

    salary_min: Optional[float] = None
    salary_max: Optional[float] = None

    required_skills: List[str] = Field(default_factory=list)
    preferred_skills: List[str] = Field(default_factory=list)

    climate_impact_categories: List[str] = Field(default_factory=list)
    climate_impact_score_min: Optional[float] = None

    military_friendly: Optional[bool] = None
    visa_sponsorship: Optional[bool] = None

    date_posted_after: Optional[datetime] = None

    class Config:
        """Pydantic configuration."""

        use_enum_values = True
