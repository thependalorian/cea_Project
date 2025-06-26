from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime
from enum import Enum


class ConversationStatus(str, Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    ARCHIVED = "archived"


class MessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


class Message(BaseModel):
    id: Optional[str] = None
    conversation_id: str
    role: MessageRole
    content: str
    metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: Optional[datetime] = None
    agent_name: Optional[str] = None
    confidence_score: Optional[float] = None


class Conversation(BaseModel):
    id: Optional[str] = None
    user_id: str
    title: Optional[str] = None
    status: ConversationStatus = ConversationStatus.ACTIVE
    messages: List[Message] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    total_tokens: int = 0
    total_cost: float = 0.0


class ConversationCreate(BaseModel):
    title: Optional[str] = None
    initial_message: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


class ConversationResponse(BaseModel):
    id: str
    title: Optional[str]
    status: ConversationStatus
    message_count: int
    created_at: datetime
    updated_at: datetime
    last_message: Optional[Message] = None
