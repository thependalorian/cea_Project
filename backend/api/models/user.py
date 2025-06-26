"""
User models for the Climate Economy Assistant.
"""

from pydantic import BaseModel, EmailStr
from typing import Dict, Any, Optional, List
from datetime import datetime


class UserBase(BaseModel):
    """Base user model."""

    email: EmailStr
    full_name: str
    organization: Optional[str] = None
    organization_type: Optional[str] = None
    preferences: Optional[Dict[str, Any]] = None


class UserCreate(UserBase):
    """User creation model."""

    password: str


class UserUpdate(BaseModel):
    """User update model."""

    full_name: Optional[str] = None
    organization: Optional[str] = None
    organization_type: Optional[str] = None
    preferences: Optional[Dict[str, Any]] = None


class UserResponse(UserBase):
    """User response model."""

    id: str
    created_at: datetime
    updated_at: datetime


class UserProfile(BaseModel):
    """User profile model."""

    first_name: Optional[str] = None
    last_name: Optional[str] = None
    location: Optional[str] = None
    career_interests: List[str] = []
    skills: List[str] = []
    experience_level: Optional[str] = None
    population_identity: Optional[str] = None
    preferences: Dict[str, Any] = {}


class UserProfileResponse(BaseModel):
    """User profile response model."""

    id: str
    email: str
    profile: UserProfile
    created_at: str
    updated_at: str
