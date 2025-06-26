"""
Conversation models for the Climate Economy Assistant.
"""

from pydantic import BaseModel
from typing import Dict, Any, Optional, List
from datetime import datetime


class MessageBase(BaseModel):
    """Base message model."""

    content: str
    role: str = "user"
    metadata: Optional[Dict[str, Any]] = None


class MessageCreate(MessageBase):
    """Message creation model."""

    pass


class MessageResponse(MessageBase):
    """Message response model."""

    id: str
    conversation_id: str
    created_at: datetime


class ConversationBase(BaseModel):
    """Base conversation model."""

    metadata: Optional[Dict[str, Any]] = None


class ConversationCreate(ConversationBase):
    """Conversation creation model."""

    initial_message: str


class ConversationResponse(ConversationBase):
    """Conversation response model."""

    id: str
    messages: List[MessageResponse]
    current_agent: str
    created_at: datetime
    updated_at: datetime
