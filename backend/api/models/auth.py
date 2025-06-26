"""
Authentication models for the Climate Economy Assistant.
"""

from pydantic import BaseModel, EmailStr
from typing import Dict, Any, Optional


class LoginRequest(BaseModel):
    """Login request model."""

    email: EmailStr
    password: str


class SignupRequest(BaseModel):
    """Signup request model."""

    email: EmailStr
    password: str
    full_name: str
    organization: Optional[str] = None
    organization_type: Optional[str] = None


class TokenResponse(BaseModel):
    """Token response model."""

    access_token: str
    token_type: str = "bearer"
    expires_in: int
