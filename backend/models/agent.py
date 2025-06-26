"""
Agent models for the Climate Economy Assistant.
Defines agent state, capabilities, and interaction models.
"""

from datetime import datetime
from typing import Optional, List, Dict, Any, Union
from enum import Enum
from pydantic import BaseModel, Field, validator
import uuid

from .base import BaseDBModel


class AgentRole(str, Enum):
    """Enumeration of possible agent roles."""

    GENERAL = "general"
    VETERANS = "veterans"
    INTERNATIONAL = "international"
    ENVIRONMENTAL_JUSTICE = "environmental_justice"
    CAREERS = "careers"
    RESOURCES = "resources"
    CRISIS = "crisis"


class AgentCapability(str, Enum):
    """Enumeration of agent capabilities."""

    SEMANTIC_ANALYSIS = "semantic_analysis"
    RESUME_PROCESSING = "resume_processing"
    CAREER_GUIDANCE = "career_guidance"
    CRISIS_INTERVENTION = "crisis_intervention"
    RESOURCE_DISCOVERY = "resource_discovery"
    SKILLS_TRANSLATION = "skills_translation"
    CULTURAL_ADAPTATION = "cultural_adaptation"
    ENVIRONMENTAL_JUSTICE = "environmental_justice"
    VETERAN_SUPPORT = "veteran_support"
    INTERNATIONAL_CREDENTIALS = "international_credentials"


class AgentState(BaseDBModel):
    """Agent state model for persisting agent state."""

    agent_id: str
    conversation_id: str
    user_id: str

    # Current conversation state
    current_topic: Optional[str] = None
    intent: Optional[str] = None
    entity_memory: Dict[str, Any] = Field(default_factory=dict)
    conversation_history: List[Dict[str, Any]] = Field(default_factory=list)
    current_step: Optional[str] = None

    # Agent reasoning
    last_reasoning: Optional[str] = None
    confidence_score: float = 0.0
    uncertainty_areas: List[str] = Field(default_factory=list)

    # Tool usage
    tools_used: List[str] = Field(default_factory=list)
    tool_results: Dict[str, Any] = Field(default_factory=dict)

    # System fields
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_active: datetime = Field(default_factory=datetime.utcnow)

    def update_state(self, updates: Dict[str, Any]) -> None:
        """Update the agent state with new values."""
        for key, value in updates.items():
            if hasattr(self, key):
                setattr(self, key, value)

        self.updated_at = datetime.utcnow()
        self.last_active = datetime.utcnow()


class AgentDefinition(BaseDBModel):
    """Definition of an agent in the system."""

    agent_id: str  # e.g., "pendo", "marcus", etc.
    name: str  # Display name, e.g., "Pendo"
    role: AgentRole
    description: str
    avatar_url: Optional[str] = None

    # Capabilities and behavior
    capabilities: List[AgentCapability] = Field(default_factory=list)
    specializations: List[str] = Field(default_factory=list)
    default_tools: List[str] = Field(default_factory=list)
    prompt_template: Optional[str] = None

    # Configuration
    model_name: str = "gpt-4-turbo"
    temperature: float = 0.2
    max_tokens: int = 1000
    streaming: bool = True
    config: Dict[str, Any] = Field(default_factory=dict)

    # System fields
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    @validator("role", pre=True)
    def validate_role(cls, v):
        """Validate that the role is a valid AgentRole."""
        if isinstance(v, str):
            return AgentRole(v)
        return v

    @validator("capabilities", pre=True, each_item=True)
    def validate_capabilities(cls, v):
        """Validate that each capability is a valid AgentCapability."""
        if isinstance(v, str):
            return AgentCapability(v)
        return v


class AgentMessage(BaseDBModel):
    """Message sent or received by an agent."""

    message_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    conversation_id: str
    agent_id: str
    user_id: str

    # Message content
    role: str  # "user", "assistant", "system", "function"
    content: str

    # Metadata
    metadata: Dict[str, Any] = Field(default_factory=dict)
    reasoning: Optional[str] = None
    confidence_score: float = 0.0

    # Tool usage
    tool_calls: List[Dict[str, Any]] = Field(default_factory=list)
    tool_results: Dict[str, Any] = Field(default_factory=dict)

    # System fields
    created_at: datetime = Field(default_factory=datetime.utcnow)

    @classmethod
    def user_message(
        cls, conversation_id: str, user_id: str, content: str
    ) -> "AgentMessage":
        """Create a user message."""
        return cls(
            conversation_id=conversation_id,
            agent_id="user",
            user_id=user_id,
            role="user",
            content=content,
        )

    @classmethod
    def agent_message(
        cls,
        conversation_id: str,
        agent_id: str,
        user_id: str,
        content: str,
        reasoning: Optional[str] = None,
        confidence_score: float = 0.0,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> "AgentMessage":
        """Create an agent message."""
        return cls(
            conversation_id=conversation_id,
            agent_id=agent_id,
            user_id=user_id,
            role="assistant",
            content=content,
            reasoning=reasoning,
            confidence_score=confidence_score,
            metadata=metadata or {},
        )


class AgentFeedback(BaseDBModel):
    """User feedback on agent responses."""

    feedback_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    agent_id: str
    message_id: str
    conversation_id: str

    # Feedback
    rating: Optional[int] = None  # 1-5 stars
    was_helpful: Optional[bool] = None
    feedback_text: Optional[str] = None
    feedback_categories: List[str] = Field(
        default_factory=list
    )  # e.g., "accurate", "relevant", "clear"

    # System fields
    created_at: datetime = Field(default_factory=datetime.utcnow)

    @validator("rating")
    def validate_rating(cls, v):
        """Validate that the rating is between 1 and 5."""
        if v is not None and (v < 1 or v > 5):
            raise ValueError("Rating must be between 1 and 5")
        return v


class AgentMetrics(BaseDBModel):
    """Performance metrics for an agent."""

    agent_id: str
    period_start: datetime
    period_end: datetime

    # Usage metrics
    total_conversations: int = 0
    total_messages: int = 0
    unique_users: int = 0
    average_messages_per_conversation: float = 0.0

    # Performance metrics
    average_rating: float = 0.0
    average_helpfulness: float = 0.0  # 0.0 to 1.0
    average_confidence: float = 0.0

    # Time metrics
    average_response_time_ms: float = 0.0
    tools_usage_distribution: Dict[str, int] = Field(default_factory=dict)

    # System fields
    created_at: datetime = Field(default_factory=datetime.utcnow)


class AgentTeam(BaseDBModel):
    """Definition of a team of agents that work together."""

    team_id: str
    name: str
    description: str

    # Team composition
    primary_agent_id: str
    supporting_agent_ids: List[str] = Field(default_factory=list)

    # Team behavior
    routing_strategy: str = "semantic"  # "semantic", "rule-based", "hybrid"
    confidence_threshold: float = 0.7
    config: Dict[str, Any] = Field(default_factory=dict)

    # System fields
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class AgentConfiguration(BaseModel):
    """Agent runtime configuration."""

    agent_id: str
    model_name: str
    temperature: float = 0.2
    max_tokens: int = 1000
    streaming: bool = True
    tools: List[str] = Field(default_factory=list)
    prompt_variables: Dict[str, Any] = Field(default_factory=dict)
    additional_context: Optional[str] = None

    @validator("temperature")
    def validate_temperature(cls, v):
        """Validate that the temperature is between 0.0 and 1.0."""
        if v < 0.0 or v > 1.0:
            raise ValueError("Temperature must be between 0.0 and 1.0")
        return v
