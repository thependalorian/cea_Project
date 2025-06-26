from datetime import datetime
from typing import Dict, List, Optional, Union
from uuid import UUID, uuid4

from pydantic import BaseModel, Field


class Message(BaseModel):
    """Base message model for all agent communications."""

    id: UUID = Field(default_factory=uuid4)
    content: str
    role: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    metadata: Dict = Field(default_factory=dict)


class AgentState(BaseModel):
    """State model for individual agents."""

    id: UUID = Field(default_factory=uuid4)
    name: str
    role: str
    status: str = "idle"
    current_task: Optional[str] = None
    memory: List[Message] = Field(default_factory=list)
    context: Dict = Field(default_factory=dict)
    performance_metrics: Dict = Field(default_factory=dict)


class UserState(BaseModel):
    """State model for user information and preferences."""

    id: UUID = Field(default_factory=uuid4)
    preferences: Dict = Field(default_factory=dict)
    skills: List[str] = Field(default_factory=list)
    interests: List[str] = Field(default_factory=list)
    history: List[Message] = Field(default_factory=list)
    goals: List[str] = Field(default_factory=list)


class ConversationState(BaseModel):
    """State model for ongoing conversations."""

    id: UUID = Field(default_factory=uuid4)
    user_id: UUID
    messages: List[Message] = Field(default_factory=list)
    active_agents: List[UUID] = Field(default_factory=list)
    context: Dict = Field(default_factory=dict)
    status: str = "active"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class WorkforceState(BaseModel):
    """Main state model for the workforce development system."""

    id: UUID = Field(default_factory=uuid4)
    agents: Dict[str, AgentState] = Field(default_factory=dict)
    users: Dict[str, UserState] = Field(default_factory=dict)
    conversations: Dict[str, ConversationState] = Field(default_factory=dict)
    system_metrics: Dict = Field(default_factory=dict)

    def add_agent(self, name: str, role: str) -> AgentState:
        """Add a new agent to the system."""
        agent = AgentState(name=name, role=role)
        self.agents[str(agent.id)] = agent
        return agent

    def add_user(self, preferences: Dict = None) -> UserState:
        """Add a new user to the system."""
        user = UserState(preferences=preferences or {})
        self.users[str(user.id)] = user
        return user

    def start_conversation(self, user_id: UUID) -> ConversationState:
        """Start a new conversation for a user."""
        conv = ConversationState(user_id=user_id)
        self.conversations[str(conv.id)] = conv
        return conv

    def update_metrics(self, metrics: Dict) -> None:
        """Update system metrics."""
        self.system_metrics.update(metrics)
        self.system_metrics["last_updated"] = datetime.utcnow()


class MemoryEntry(BaseModel):
    """Model for storing memory entries with semantic context."""

    id: UUID = Field(default_factory=uuid4)
    content: str
    embedding: Optional[List[float]] = None
    metadata: Dict = Field(default_factory=dict)
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class SemanticContext(BaseModel):
    """Model for managing semantic context and routing."""

    query: str
    embeddings: List[float]
    relevance_score: float
    metadata: Dict = Field(default_factory=dict)


class AgentCommand(BaseModel):
    """Model for agent commands and actions."""

    command_type: str
    parameters: Dict = Field(default_factory=dict)
    priority: int = 1
    timeout: float = 30.0
    retry_count: int = 3
