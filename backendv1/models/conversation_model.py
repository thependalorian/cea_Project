"""
Conversation Data Models

Following rule #12: Complete code verification with proper conversation models
Following rule #15: Include comprehensive error handling

This module defines conversation and message data models.
Location: backendv1/models/conversation_model.py
"""

from datetime import datetime
from typing import Any, Dict, List, Optional
from enum import Enum

from pydantic import BaseModel, Field


class MessageModel(BaseModel):
    """
    Chat message data model
    """

    id: str = Field(..., description="Unique message identifier")
    conversation_id: str = Field(..., description="Associated conversation ID")
    user_id: str = Field(..., description="Message sender ID")
    content: str = Field(..., description="Message content")
    message_type: str = Field(default="user", description="Message type")
    specialist: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ConversationModel(BaseModel):
    """
    Conversation data model
    """

    id: str = Field(..., description="Unique conversation identifier")
    user_id: str = Field(..., description="Associated user ID")
    title: Optional[str] = None
    messages: List[MessageModel] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    is_active: bool = Field(default=True)


class SessionState(BaseModel):
    """
    User session state
    """

    session_id: str = Field(..., description="Session identifier")
    user_id: str = Field(..., description="Associated user ID")
    state_data: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: Optional[datetime] = None


# Export main classes
__all__ = ["MessageModel", "ConversationModel", "SessionState"]
