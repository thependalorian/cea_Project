"""
Core module for Climate Economy Assistant

This package contains core components for the Climate Economy Assistant,
including configuration, agents, workflows, and prompts.
"""

# Import core configuration (safe import)
from core.config import get_settings

# Import prompts (safe import)
from core.prompts import (
    ENVIRONMENTAL_JUSTICE_SPECIALIST_PROMPT,
    INTERNATIONAL_SPECIALIST_PROMPT,
    MA_CLIMATE_CONTEXT,
    MA_RESOURCE_ANALYST_PROMPT,
    RESUME_ANALYSIS_PROMPT,
    SUPERVISOR_SYSTEM_PROMPT,
    VETERAN_SPECIALIST_PROMPT,
    CONFIDENCE_BASED_DIALOGUE_PROMPTS,
    MARCUS_CONFIDENCE_PROMPT,
    LIV_CONFIDENCE_PROMPT,
    MIGUEL_CONFIDENCE_PROMPT,
    JASMINE_CONFIDENCE_PROMPT,
    ALEX_CONFIDENCE_PROMPT,
    SUPERVISOR_CONFIDENCE_ROUTING,
    SOURCE_CITATION_STANDARDS,
    EMPATHY_AGENT_PROMPT,
)

# Version
__version__ = "1.0.0"

# Note: Other imports like langgraph_agents and workflows should be imported directly
# where needed to avoid circular dependencies
