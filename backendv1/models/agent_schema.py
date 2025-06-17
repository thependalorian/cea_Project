"""
Agent Schema Models

Following rule #12: Complete code verification with proper agent models
Following rule #15: Include comprehensive error handling

This module defines agent schema, configuration, and capability models
for use in the Climate Economy Assistant backend.
Location: backendv1/models/agent_schema.py
"""

from datetime import datetime
from typing import Any, Dict, List, Optional, Union
from enum import Enum
from pydantic import BaseModel, Field, validator


class AgentCapability(str, Enum):
    """
    Agent capability categories
    """

    CONVERSATION = "conversation"
    RESUME_ANALYSIS = "resume_analysis"
    CAREER_SEARCH = "career_search"
    CLIMATE_KNOWLEDGE = "climate_knowledge"
    ENVIRONMENTAL_JUSTICE = "environmental_justice"
    INTERNATIONAL_EXPERTISE = "international_expertise"
    EMOTIONAL_SUPPORT = "emotional_support"
    CRISIS_INTERVENTION = "crisis_intervention"
    VETERAN_SUPPORT = "veteran_support"
    POLICY_KNOWLEDGE = "policy_knowledge"


class AgentConfig(BaseModel):
    """
    Agent configuration parameters
    """

    model_name: str = Field(..., description="Model name (e.g., gpt-4, claude-3)")
    temperature: float = Field(0.7, description="Response temperature")
    max_tokens: int = Field(2000, description="Maximum response length")
    streaming: bool = Field(True, description="Whether to stream responses")
    timeout: Optional[int] = Field(30, description="API timeout in seconds")
    top_p: Optional[float] = Field(1.0, description="Top P sampling parameter")
    frequency_penalty: Optional[float] = Field(0.0, description="Frequency penalty")
    presence_penalty: Optional[float] = Field(0.0, description="Presence penalty")
    stop_sequences: Optional[List[str]] = Field(None, description="Stop sequences")
    additional_params: Optional[Dict[str, Any]] = Field(default_factory=dict)

    @validator("temperature")
    def validate_temperature(cls, v):
        """Validate temperature is between 0 and 1"""
        if not 0 <= v <= 1:
            raise ValueError("Temperature must be between 0 and 1")
        return v


class AgentSchema(BaseModel):
    """
    Agent schema definition for Climate Economy Assistant
    """

    id: str = Field(..., description="Unique agent identifier")
    name: str = Field(..., description="Agent name (e.g., 'pendo', 'marcus')")
    display_name: str = Field(..., description="Human-readable agent name")
    description: str = Field(..., description="Agent description")
    system_prompt: str = Field(..., description="System prompt for the agent")
    capabilities: List[AgentCapability] = Field(..., description="Agent capabilities")
    config: AgentConfig = Field(..., description="Agent configuration")

    # Operational fields
    is_active: bool = Field(True, description="Whether the agent is active")
    confidence_threshold: float = Field(0.7, description="Confidence threshold")
    human_review_threshold: Optional[float] = Field(0.5, description="Human review threshold")

    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    version: str = Field("1.0.0", description="Agent version")

    class Config:
        """Pydantic configuration"""

        use_enum_values = True
        json_encoders = {datetime: lambda dt: dt.isoformat()}


# Export models
__all__ = ["AgentSchema", "AgentConfig", "AgentCapability"]
