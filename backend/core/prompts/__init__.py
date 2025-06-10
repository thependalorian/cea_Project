"""
Prompts package for the Climate Economy Assistant.

This package contains prompt templates used by various components
of the Climate Economy Assistant.
"""

# Import from core/prompts.py for RESUME_ANALYSIS_PROMPT
from core.prompts.resume_prompts import RESUME_ANALYSIS_PROMPT
from core.prompts.specialist_prompts import (
    ENVIRONMENTAL_JUSTICE_SPECIALIST_PROMPT,
    INTERNATIONAL_SPECIALIST_PROMPT,
    MA_CLIMATE_CONTEXT,
    MA_RESOURCE_ANALYST_PROMPT,
    MEMBERS_DICT,
    OPTIONS,
    POPULATION_CONTEXTS,
    SUPERVISOR_SYSTEM_PROMPT,
    VETERAN_SPECIALIST_PROMPT,
    WORKER_INFO,
)

__all__ = [
    "MEMBERS_DICT",
    "OPTIONS",
    "WORKER_INFO",
    "MA_CLIMATE_CONTEXT",
    "POPULATION_CONTEXTS",
    "SUPERVISOR_SYSTEM_PROMPT",
    "INTERNATIONAL_SPECIALIST_PROMPT",
    "VETERAN_SPECIALIST_PROMPT",
    "ENVIRONMENTAL_JUSTICE_SPECIALIST_PROMPT",
    "MA_RESOURCE_ANALYST_PROMPT",
    "RESUME_ANALYSIS_PROMPT",
]
