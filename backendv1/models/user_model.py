"""
User Data Models

Following rule #13: Use TypeScript (JavaScript) - Python equivalent with proper typing
Following rule #12: Complete code verification with proper data models
Following rule #17: Secure database access with validated models

This module defines all user-related data models and profiles.
Location: backendv1/models/user_model.py
"""

from datetime import datetime
from typing import Any, Dict, List, Optional, Literal
from enum import Enum

from pydantic import BaseModel, Field, EmailStr, field_validator


class UserType(str, Enum):
    """User type enumeration"""

    JOB_SEEKER = "job_seeker"
    PARTNER = "partner"
    ADMIN = "admin"


class UserModel(BaseModel):
    """
    Base user model for all user types

    Following rule #17: Secure database access with proper validation
    """

    id: str = Field(..., description="Unique user identifier")
    email: EmailStr = Field(..., description="User email address")
    user_type: UserType = Field(..., description="Type of user account")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    is_active: bool = Field(default=True)
    last_login: Optional[datetime] = None

    class Config:
        use_enum_values = True
        json_encoders = {datetime: lambda v: v.isoformat()}


class JobSeekerProfile(UserModel):
    """
    Job seeker user profile with career-specific information

    Following rule #12: Complete code verification with comprehensive profiles
    """

    user_type: Literal[UserType.JOB_SEEKER] = Field(default=UserType.JOB_SEEKER)

    # Personal Information
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None

    # Career Information
    current_role: Optional[str] = None
    industry_experience: List[str] = Field(default_factory=list)
    career_goals: List[str] = Field(default_factory=list)
    skills: List[str] = Field(default_factory=list)

    # Climate Career Specific
    climate_interests: List[str] = Field(default_factory=list)
    sustainability_experience: Optional[str] = None
    environmental_justice_focus: bool = Field(default=False)

    # Identity and Background
    veteran_status: bool = Field(default=False)
    international_status: bool = Field(default=False)
    gateway_cities_resident: bool = Field(default=False)

    # Resume and Documents
    resume_uploaded: bool = Field(default=False)
    resume_analysis_complete: bool = Field(default=False)
    portfolio_url: Optional[str] = None
    linkedin_url: Optional[str] = None

    # Preferences
    job_search_active: bool = Field(default=False)
    salary_expectations: Optional[Dict[str, Any]] = None
    work_preferences: Dict[str, Any] = Field(default_factory=dict)

    # Progress Tracking
    onboarding_complete: bool = Field(default=False)
    assessment_complete: bool = Field(default=False)
    pathway_selected: bool = Field(default=False)


class PartnerProfile(UserModel):
    """
    Partner organization profile for employers and collaborators
    """

    user_type: Literal[UserType.PARTNER] = Field(default=UserType.PARTNER)

    # Organization Information
    organization_name: str = Field(..., description="Partner organization name")
    organization_type: str = Field(..., description="Type of organization")
    industry: str = Field(..., description="Industry sector")
    size: Optional[str] = None
    website: Optional[str] = None

    # Contact Information
    contact_name: str = Field(..., description="Primary contact name")
    contact_title: Optional[str] = None
    phone: Optional[str] = None

    # Location and Scope
    headquarters_location: Optional[str] = None
    service_areas: List[str] = Field(default_factory=list)
    remote_work_options: bool = Field(default=False)

    # Climate Focus
    climate_focus_areas: List[str] = Field(default_factory=list)
    sustainability_initiatives: List[str] = Field(default_factory=list)
    environmental_justice_commitment: bool = Field(default=False)

    # Partnership Details
    partnership_type: List[str] = Field(default_factory=list)  # hiring, training, funding, etc.
    available_positions: int = Field(default=0)
    training_programs: List[str] = Field(default_factory=list)

    # Permissions and Access
    can_post_jobs: bool = Field(default=True)
    can_view_candidates: bool = Field(default=True)
    can_access_analytics: bool = Field(default=False)


class AdminProfile(UserModel):
    """
    Administrator profile with system access permissions
    """

    user_type: Literal[UserType.ADMIN] = Field(default=UserType.ADMIN)

    # Admin Information
    admin_name: str = Field(..., description="Administrator name")
    admin_level: str = Field(default="standard")  # standard, super, system
    department: Optional[str] = None

    # Permissions
    can_manage_users: bool = Field(default=False)
    can_manage_partners: bool = Field(default=False)
    can_manage_system: bool = Field(default=False)
    can_view_analytics: bool = Field(default=True)
    can_moderate_content: bool = Field(default=True)

    # Access Scope
    geographic_scope: List[str] = Field(default_factory=list)
    functional_scope: List[str] = Field(default_factory=list)

    # Activity Tracking
    last_admin_action: Optional[datetime] = None
    admin_actions_count: int = Field(default=0)


class UserProfile(BaseModel):
    """
    Unified user profile that can represent any user type

    Following rule #12: Complete code verification with flexible typing
    """

    base_profile: UserModel
    job_seeker_profile: Optional[JobSeekerProfile] = None
    partner_profile: Optional[PartnerProfile] = None
    admin_profile: Optional[AdminProfile] = None

    @property
    def id(self) -> str:
        return self.base_profile.id

    @property
    def email(self) -> str:
        return self.base_profile.email

    @property
    def user_type(self) -> UserType:
        return self.base_profile.user_type

    @field_validator("job_seeker_profile", "partner_profile", "admin_profile")
    @classmethod
    def validate_profile_consistency(cls, v, info):
        """Ensure profile type matches user type"""
        if hasattr(info, "data") and "base_profile" in info.data and v is not None:
            base_profile = info.data["base_profile"]
            if hasattr(v, "user_type") and v.user_type != base_profile.user_type:
                raise ValueError("Profile type must match base profile user type")
        return v


# Export main classes
__all__ = [
    "UserType",
    "UserModel",
    "JobSeekerProfile",
    "PartnerProfile",
    "AdminProfile",
    "UserProfile",
]
