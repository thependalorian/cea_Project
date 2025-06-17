"""
Agent Configuration Management

Following rule #12: Complete code verification with proper agent configuration
Following rule #15: Include comprehensive error handling for configuration

This module manages agent-specific configurations and settings.
Location: backendv1/config/agent_config.py
"""

from typing import Dict, Any, List, Optional
from dataclasses import dataclass, field
from enum import Enum

from backendv1.config.settings import get_settings

settings = get_settings()


class AgentType(str, Enum):
    """Agent type enumeration"""

    CLIMATE_SPECIALIST = "lauren"
    RESUME_SPECIALIST = "mai"
    VETERAN_SPECIALIST = "marcus"
    ENVIRONMENTAL_JUSTICE_SPECIALIST = "miguel"
    INTERNATIONAL_SPECIALIST = "liv"
    MA_RESOURCES_SPECIALIST = "jasmine"
    EMPATHY_SPECIALIST = "alex"


@dataclass
class AgentConfig:
    """
    Agent configuration class

    Following rule #12: Complete code verification with proper typing
    """

    # Core Configuration
    agent_name: str
    agent_type: AgentType
    model_name: str = "gpt-4"
    temperature: float = 0.7
    max_tokens: int = 2000

    # Capabilities
    specialization_areas: List[str] = field(default_factory=list)
    available_tools: List[str] = field(default_factory=list)
    confidence_threshold: float = 0.8

    # Behavior Settings
    response_style: str = "professional_helpful"
    empathy_level: str = "high"
    technical_depth: str = "moderate"

    # Performance Settings
    timeout_seconds: int = 30
    retry_attempts: int = 3
    enable_streaming: bool = True

    # System Integration
    enable_memory: bool = True
    enable_reflection: bool = True
    enable_quality_analysis: bool = True

    # Metadata
    version: str = "1.0.0"
    created_at: str = ""
    updated_at: str = ""


# Default agent configurations
DEFAULT_AGENT_CONFIGS = {
    AgentType.CLIMATE_SPECIALIST: AgentConfig(
        agent_name="Lauren",
        agent_type=AgentType.CLIMATE_SPECIALIST,
        specialization_areas=["climate_careers", "green_jobs", "sustainability"],
        available_tools=["web_search", "job_matching", "resource_search"],
        confidence_threshold=0.8,
        technical_depth="high",
    ),
    AgentType.RESUME_SPECIALIST: AgentConfig(
        agent_name="Mai",
        agent_type=AgentType.RESUME_SPECIALIST,
        specialization_areas=["resume_optimization", "ats_systems", "career_transitions"],
        available_tools=["resume_analysis", "ats_optimization", "career_matching"],
        confidence_threshold=0.9,
        technical_depth="high",
    ),
    AgentType.VETERAN_SPECIALIST: AgentConfig(
        agent_name="Marcus",
        agent_type=AgentType.VETERAN_SPECIALIST,
        specialization_areas=["military_transition", "veteran_benefits", "mos_translation"],
        available_tools=["mos_translator", "veteran_resources", "benefits_lookup"],
        confidence_threshold=0.85,
        empathy_level="very_high",
    ),
    AgentType.ENVIRONMENTAL_JUSTICE_SPECIALIST: AgentConfig(
        agent_name="Miguel",
        agent_type=AgentType.ENVIRONMENTAL_JUSTICE_SPECIALIST,
        specialization_areas=["environmental_justice", "community_organizing", "equity"],
        available_tools=["ej_resources", "community_search", "advocacy_tools"],
        confidence_threshold=0.8,
        empathy_level="very_high",
    ),
    AgentType.INTERNATIONAL_SPECIALIST: AgentConfig(
        agent_name="Liv",
        agent_type=AgentType.INTERNATIONAL_SPECIALIST,
        specialization_areas=["credential_recognition", "visa_guidance", "international_careers"],
        available_tools=["credential_evaluation", "visa_lookup", "international_resources"],
        confidence_threshold=0.8,
        technical_depth="high",
    ),
    AgentType.MA_RESOURCES_SPECIALIST: AgentConfig(
        agent_name="Jasmine",
        agent_type=AgentType.MA_RESOURCES_SPECIALIST,
        specialization_areas=["massachusetts_resources", "local_programs", "state_benefits"],
        available_tools=["ma_resources", "local_search", "state_programs"],
        confidence_threshold=0.75,
        technical_depth="moderate",
    ),
    AgentType.EMPATHY_SPECIALIST: AgentConfig(
        agent_name="Alex",
        agent_type=AgentType.EMPATHY_SPECIALIST,
        specialization_areas=["emotional_support", "confidence_building", "crisis_intervention"],
        available_tools=["empathy_assessment", "confidence_tools", "crisis_support"],
        confidence_threshold=0.7,
        empathy_level="maximum",
    ),
}


def get_agent_config(agent_type: AgentType) -> AgentConfig:
    """
    Get configuration for a specific agent type

    Args:
        agent_type: Type of agent to configure

    Returns:
        AgentConfig: Agent configuration
    """
    return DEFAULT_AGENT_CONFIGS.get(
        agent_type, DEFAULT_AGENT_CONFIGS[AgentType.CLIMATE_SPECIALIST]
    )


def get_all_agent_configs() -> Dict[AgentType, AgentConfig]:
    """
    Get all agent configurations

    Returns:
        Dict[AgentType, AgentConfig]: All agent configurations
    """
    return DEFAULT_AGENT_CONFIGS.copy()


# Export main classes and functions
__all__ = [
    "AgentType",
    "AgentConfig",
    "SpecialistConfig",
    "get_agent_config",
    "get_all_agent_configs",
    "DEFAULT_AGENT_CONFIGS",
]

# Alias for backward compatibility
SpecialistConfig = AgentConfig
