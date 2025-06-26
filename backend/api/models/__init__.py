"""
Models package for the Climate Economy Assistant.
"""

from .auth import LoginRequest, SignupRequest, TokenResponse
from .user import UserBase, UserCreate, UserUpdate, UserResponse
from .conversation import (
    MessageBase,
    MessageCreate,
    MessageResponse,
    ConversationBase,
    ConversationCreate,
    ConversationResponse,
)
from .resume import ResumeAnalysisBase, ResumeAnalysisCreate, ResumeAnalysisResponse

__all__ = [
    # Auth models
    "LoginRequest",
    "SignupRequest",
    "TokenResponse",
    # User models
    "UserBase",
    "UserCreate",
    "UserUpdate",
    "UserResponse",
    # Conversation models
    "MessageBase",
    "MessageCreate",
    "MessageResponse",
    "ConversationBase",
    "ConversationCreate",
    "ConversationResponse",
    # Resume models
    "ResumeAnalysisBase",
    "ResumeAnalysisCreate",
    "ResumeAnalysisResponse",
]
