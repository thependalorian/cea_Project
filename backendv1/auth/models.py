from typing import Optional, Dict, Any, List
from datetime import datetime
from pydantic import BaseModel, Field


class UserProfile(BaseModel):
    """
    User profile model for authentication and user management

    Following rule #13: Use TypeScript (but this is Python, so using Pydantic)
    Following rule #17: Secure database access with proper data models
    """

    # Core Identity
    id: Optional[str] = None
    user_id: str
    email: str

    # Personal Information
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None

    # Profile Details
    role: str = "user"
    user_type: str = "user"
    organization_name: Optional[str] = None
    organization_type: Optional[str] = None
    partnership_level: str = "standard"

    # Status and Verification
    verified: bool = False
    profile_completed: bool = False

    # Contact Information
    contact_info: Dict[str, Any] = Field(default_factory=dict)
    website: Optional[str] = None
    description: Optional[str] = None

    # Timestamps
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    last_login: Optional[datetime] = None

    # Preferences and Settings
    preferences: Dict[str, Any] = Field(default_factory=dict)
    settings: Dict[str, Any] = Field(default_factory=dict)

    # Climate-specific fields
    climate_interests: List[str] = Field(default_factory=list)
    climate_focus_areas: List[str] = Field(default_factory=list)

    class Config:
        from_attributes = True
        json_encoders = {datetime: lambda v: v.isoformat() if v else None}

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for database storage"""
        return self.dict(exclude_none=True)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "UserProfile":
        """Create from dictionary (e.g., from database)"""
        return cls(**data)

    def is_admin(self) -> bool:
        """Check if user has admin role"""
        return self.role == "admin"

    def is_partner(self) -> bool:
        """Check if user is a partner"""
        return self.user_type == "partner" or self.role == "partner"

    def get_display_name(self) -> str:
        """Get display name for the user"""
        if self.full_name:
            return self.full_name
        elif self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        elif self.first_name:
            return self.first_name
        else:
            return self.email.split("@")[0]


# Export all models
__all__ = [
    "User",
    "UserCreate",
    "UserUpdate",
    "UserInDB",
    "UserProfile",
    "Token",
    "TokenData",
    "LoginRequest",
    "RegisterRequest",
]
