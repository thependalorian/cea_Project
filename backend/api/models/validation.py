"""
Pydantic models for request/response validation.
"""

from pydantic import BaseModel, field_validator, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    """User role enumeration"""

    admin = "admin"
    user = "user"
    partner = "partner"


class UserType(str, Enum):
    """User type enumeration"""

    job_seeker = "job_seeker"
    admin = "admin"
    partner = "partner"


# Base models
class BaseResponse(BaseModel):
    """Base response model"""

    success: bool = True
    message: str = "Operation successful"
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    data: Optional[Dict[str, Any]] = None


class ErrorResponse(BaseModel):
    """Error response model"""

    success: bool = False
    error: str
    message: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


# User models
class UserCreate(BaseModel):
    """User creation model"""

    email: str = Field(..., pattern=r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
    full_name: str = Field(..., min_length=2, max_length=100)
    role: UserRole = UserRole.user
    user_type: UserType = UserType.job_seeker


class UserUpdate(BaseModel):
    """User update model"""

    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    user_type: Optional[UserType] = None
    profile_completed: Optional[bool] = None


class UserResponse(BaseModel):
    """User response model"""

    id: str
    email: str
    full_name: str
    role: UserRole
    user_type: UserType
    verified: bool
    profile_completed: bool
    created_at: datetime
    updated_at: datetime


# Conversation models
class MessageCreate(BaseModel):
    """Message creation model"""

    content: str = Field(..., min_length=1, max_length=10000)
    role: str = Field(..., pattern=r"^(human|assistant)$")

    @field_validator("content")
    @classmethod
    def content_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError("Content cannot be empty or whitespace only")
        return v.strip()


class MessageCreateRequest(BaseModel):
    """Message creation request"""

    content: str = Field(..., min_length=1, max_length=10000)
    role: str = Field(default="human")
    agent_id: Optional[str] = None

    @field_validator("content")
    @classmethod
    def content_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError("Content cannot be empty or whitespace only")
        return v.strip()


class ConversationCreate(BaseModel):
    """Conversation creation model"""

    title: Optional[str] = Field(None, max_length=200)
    initial_message: Optional[MessageCreate] = None


class ConversationCreateRequest(BaseModel):
    """Conversation creation request"""

    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    conversation_type: str = Field(default="general")


class ConversationUpdate(BaseModel):
    """Conversation update model"""

    title: Optional[str] = Field(None, max_length=200)
    archived: Optional[bool] = None


class ConversationListResponse(BaseModel):
    """Conversation list response"""

    success: bool = True
    message: str = "Conversations retrieved successfully"
    data: Dict[str, Any]
    timestamp: datetime = Field(default_factory=datetime.utcnow)


# Agent models
class AgentQuery(BaseModel):
    """Agent query model"""

    message: str = Field(..., min_length=1, max_length=5000)
    conversation_id: Optional[str] = None
    context: Optional[Dict[str, Any]] = None

    @field_validator("message")
    @classmethod
    def message_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError("Message cannot be empty")
        return v.strip()


class AgentResponse(BaseModel):
    """Agent response model"""

    agent_id: str
    message: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    tools_used: List[str] = []
    metadata: Dict[str, Any] = {}


# File upload models
class FileUpload(BaseModel):
    """File upload validation"""

    filename: str = Field(..., max_length=255)
    content_type: str
    size: int = Field(..., gt=0, le=10_000_000)  # Max 10MB

    @field_validator("content_type")
    @classmethod
    def validate_content_type(cls, v):
        allowed_types = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain",
        ]
        if v not in allowed_types:
            raise ValueError(f"Content type {v} not allowed")
        return v


# Pagination models
class PaginationParams(BaseModel):
    """Pagination parameters"""

    page: int = Field(1, ge=1)
    limit: int = Field(10, ge=1, le=100)

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.limit


class PaginatedResponse(BaseModel):
    """Paginated response"""

    items: List[Any]
    total: int
    page: int
    limit: int
    has_next: bool
    has_prev: bool


# Health check models
class HealthCheck(BaseModel):
    """Health check response"""

    status: str = "healthy"
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    version: str = "1.0.0"
    database: bool = True
    redis: bool = True
    services: Dict[str, bool] = {}
