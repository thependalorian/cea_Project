"""
Profile models for the Climate Economy Assistant.
Includes job seeker profiles, partner profiles, admin profiles, and user interests.
"""

from pydantic import BaseModel, EmailStr
from typing import Dict, Any, Optional, List
from datetime import datetime
from enum import Enum


class ExperienceLevel(str, Enum):
    """Experience level enumeration."""
    ENTRY_LEVEL = "entry_level"
    MID_LEVEL = "mid_level"
    SENIOR_LEVEL = "senior_level"
    EXECUTIVE = "executive"


class RemoteWorkPreference(str, Enum):
    """Remote work preference enumeration."""
    REMOTE = "remote"
    HYBRID = "hybrid"
    ON_SITE = "on_site"
    FLEXIBLE = "flexible"


class OrganizationType(str, Enum):
    """Organization type enumeration."""
    STARTUP = "startup"
    CORPORATION = "corporation"
    NONPROFIT = "nonprofit"
    GOVERNMENT = "government"
    EDUCATIONAL = "educational"
    CONSULTING = "consulting"
    OTHER = "other"


# Job Seeker Profile Models
class JobSeekerProfileBase(BaseModel):
    """Base job seeker profile model."""
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    current_title: Optional[str] = None
    experience_level: Optional[str] = None
    climate_focus: Optional[str] = None
    skills: List[str] = []
    desired_roles: List[str] = []
    preferred_locations: List[str] = []
    salary_range_min: Optional[int] = None
    salary_range_max: Optional[int] = None


class JobSeekerProfileCreate(JobSeekerProfileBase):
    """Job seeker profile creation model."""
    user_id: str


class JobSeekerProfileUpdate(BaseModel):
    """Job seeker profile update model."""
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    current_title: Optional[str] = None
    experience_level: Optional[str] = None


class JobSeekerProfileResponse(JobSeekerProfileBase):
    """Job seeker profile response model."""
    id: str
    user_id: Optional[str] = None
    profile_completed: bool = False
    verified: bool = False
    created_at: datetime
    updated_at: datetime


# Partner Profile Models  
class PartnerProfileBase(BaseModel):
    """Base partner profile model."""
    organization_name: str
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None
    climate_focus: List[str] = []


class PartnerProfileCreate(PartnerProfileBase):
    """Partner profile creation model."""
    pass


class PartnerProfileResponse(PartnerProfileBase):
    """Partner profile response model."""
    id: str
    profile_completed: bool = False
    verified: bool = False
    created_at: datetime
    updated_at: datetime


# Admin Profile Models
class AdminProfileBase(BaseModel):
    """Base admin profile model."""
    full_name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    direct_phone: Optional[str] = None
    department: Optional[str] = None
    admin_notes: Optional[str] = None
    emergency_contact: Dict[str, Any] = {}
    
    # Permissions
    can_manage_users: bool = False
    can_manage_partners: bool = False
    can_manage_content: bool = False
    can_manage_system: bool = False
    can_view_analytics: bool = False
    permissions: Dict[str, Any] = {}


class AdminProfileCreate(AdminProfileBase):
    """Admin profile creation model."""
    user_id: str


class AdminProfileUpdate(BaseModel):
    """Admin profile update model."""
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    direct_phone: Optional[str] = None
    department: Optional[str] = None
    admin_notes: Optional[str] = None
    emergency_contact: Optional[Dict[str, Any]] = None
    can_manage_users: Optional[bool] = None
    can_manage_partners: Optional[bool] = None
    can_manage_content: Optional[bool] = None
    can_manage_system: Optional[bool] = None
    can_view_analytics: Optional[bool] = None
    permissions: Optional[Dict[str, Any]] = None


class AdminProfileResponse(AdminProfileBase):
    """Admin profile response model."""
    id: str
    user_id: str
    profile_completed: bool = False
    total_admin_actions: int = 0
    last_admin_action: Optional[datetime] = None
    last_login: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


# User Interests Models
class UserInterestsBase(BaseModel):
    """Base user interests model."""
    climate_focus: List[str] = []
    target_roles: List[str] = []
    skills_to_develop: List[str] = []
    preferred_location: Optional[str] = None
    employment_preferences: Dict[str, Any] = {}
    
    # Notification preferences
    email_notifications: bool = True
    job_alerts_enabled: bool = True
    newsletter_enabled: bool = True
    marketing_emails_enabled: bool = True
    partner_updates_enabled: bool = True
    
    # Privacy and sharing preferences
    data_sharing_enabled: bool = False
    social_profile_analysis_enabled: bool = True
    
    # UI preferences
    language_preference: str = "en"
    theme_preference: str = "system"
    timezone: str = "UTC"


class UserInterestsCreate(UserInterestsBase):
    """User interests creation model."""
    user_id: str


class UserInterestsUpdate(BaseModel):
    """User interests update model."""
    climate_focus: Optional[List[str]] = None
    target_roles: Optional[List[str]] = None
    skills_to_develop: Optional[List[str]] = None
    preferred_location: Optional[str] = None
    employment_preferences: Optional[Dict[str, Any]] = None
    email_notifications: Optional[bool] = None
    job_alerts_enabled: Optional[bool] = None
    newsletter_enabled: Optional[bool] = None
    marketing_emails_enabled: Optional[bool] = None
    partner_updates_enabled: Optional[bool] = None
    data_sharing_enabled: Optional[bool] = None
    social_profile_analysis_enabled: Optional[bool] = None
    language_preference: Optional[str] = None
    theme_preference: Optional[str] = None
    timezone: Optional[str] = None


class UserInterestsResponse(UserInterestsBase):
    """User interests response model."""
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime


# Admin Permissions Models
class AdminPermissionBase(BaseModel):
    """Base admin permission model."""
    permission_level: str
    resource_type: str
    granted_by: Optional[str] = None


class AdminPermissionCreate(AdminPermissionBase):
    """Admin permission creation model."""
    pass


class AdminPermissionUpdate(BaseModel):
    """Admin permission update model."""
    permission_level: Optional[str] = None
    resource_type: Optional[str] = None
    granted_by: Optional[str] = None


class AdminPermissionResponse(AdminPermissionBase):
    """Admin permission response model."""
    id: str
    created_at: datetime 