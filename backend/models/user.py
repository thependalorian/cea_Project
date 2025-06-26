"""
User models for the Climate Economy Assistant.
Defines user profile, preferences, and interaction history.
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, EmailStr, validator

from .base import BaseDBModel


class UserProfile(BaseDBModel):
    """User profile information."""

    email: EmailStr
    first_name: str
    last_name: str
    display_name: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    avatar_url: Optional[str] = None
    timezone: Optional[str] = "America/New_York"

    # Career and preferences
    career_stage: Optional[str] = None  # e.g., "student", "entry", "mid", "senior"
    current_industry: Optional[str] = None
    target_industries: List[str] = Field(default_factory=list)
    skills: List[str] = Field(default_factory=list)
    interests: List[str] = Field(default_factory=list)
    preferred_job_types: List[str] = Field(
        default_factory=list
    )  # e.g., "full-time", "remote"

    # Special groups
    is_veteran: bool = False
    veteran_details: Optional[Dict[str, Any]] = None
    is_international: bool = False
    international_details: Optional[Dict[str, Any]] = None

    # Preferences
    notification_preferences: Dict[str, bool] = Field(
        default_factory=lambda: {"email": True, "push": False, "sms": False}
    )
    privacy_preferences: Dict[str, bool] = Field(
        default_factory=lambda: {
            "share_profile": False,
            "allow_recommendations": True,
            "allow_analytics": True,
        }
    )

    # User authentication
    auth_provider: str = "email"  # "email", "google", "github", etc.
    is_verified: bool = False

    # System fields
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None

    @validator("veteran_details", pre=True, always=True)
    def ensure_veteran_details(cls, v, values):
        """Ensure veteran details are present if user is a veteran."""
        if values.get("is_veteran", False) and not v:
            return {"confirmed": True}
        return v

    @validator("international_details", pre=True, always=True)
    def ensure_international_details(cls, v, values):
        """Ensure international details are present if user is international."""
        if values.get("is_international", False) and not v:
            return {"confirmed": True}
        return v

    def update_last_login(self):
        """Update the last login timestamp."""
        self.last_login = datetime.utcnow()
        self.updated_at = datetime.utcnow()


class UserPreferences(BaseDBModel):
    """User preferences for system behavior."""

    user_id: str
    preferred_agent: Optional[str] = "pendo"  # Default to Pendo
    language: str = "en"
    theme: str = "light"
    interface_density: str = "comfortable"
    default_view: str = "dashboard"
    accessibility_settings: Dict[str, Any] = Field(default_factory=dict)
    custom_settings: Dict[str, Any] = Field(default_factory=dict)

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class UserActivity(BaseDBModel):
    """User activity tracking."""

    user_id: str
    activity_type: str  # "login", "conversation", "resume_upload", etc.
    details: Dict[str, Any] = Field(default_factory=dict)
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None

    @classmethod
    def log_activity(
        cls, user_id: str, activity_type: str, details: Dict[str, Any] = None
    ):
        """Log a user activity."""
        return cls(user_id=user_id, activity_type=activity_type, details=details or {})


class UserProgress(BaseDBModel):
    """Tracks user progress through career development journey."""

    user_id: str

    # Assessment status
    profile_completion: float = 0.0  # 0.0 to 1.0
    resume_uploaded: bool = False
    skills_assessed: bool = False
    interests_assessed: bool = False

    # Career planning progress
    career_goals_defined: bool = False
    industries_explored: List[str] = Field(default_factory=list)
    learning_paths_started: List[str] = Field(default_factory=list)

    # Achievements
    badges: List[str] = Field(default_factory=list)
    achievements_unlocked: List[Dict[str, Any]] = Field(default_factory=list)

    # Interaction metrics
    conversations_count: int = 0
    resources_viewed: int = 0
    tools_used: Dict[str, int] = Field(default_factory=dict)

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_interaction: Optional[datetime] = None

    def update_progress(self, field: str, value: Any):
        """Update a progress field and the updated_at timestamp."""
        setattr(self, field, value)
        self.updated_at = datetime.utcnow()
        self.last_interaction = datetime.utcnow()


# User creation and update models
class UserCreate(BaseModel):
    """Model for creating a new user."""

    email: EmailStr
    password: str
    first_name: str
    last_name: str
    display_name: Optional[str] = None
    is_veteran: bool = False
    is_international: bool = False


class UserUpdate(BaseModel):
    """Model for updating user information."""

    first_name: Optional[str] = None
    last_name: Optional[str] = None
    display_name: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    avatar_url: Optional[str] = None
    timezone: Optional[str] = None
    career_stage: Optional[str] = None
    current_industry: Optional[str] = None
    target_industries: Optional[List[str]] = None
    skills: Optional[List[str]] = None
    interests: Optional[List[str]] = None
    preferred_job_types: Optional[List[str]] = None
    notification_preferences: Optional[Dict[str, bool]] = None
    privacy_preferences: Optional[Dict[str, bool]] = None
