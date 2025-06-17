"""
Prompts package for the Climate Economy Assistant.

This package contains prompt templates used by various components
of the Climate Economy Assistant.
"""

# Import from core/prompts.py for RESUME_ANALYSIS_PROMPT and EMPATHY_AGENT_PROMPT
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

# Import EMPATHY_AGENT_PROMPT and new confidence prompts using importlib to avoid circular import
import importlib.util
import sys
from pathlib import Path

# Get the path to the prompts.py file
prompts_file_path = Path(__file__).parent.parent / "prompts.py"

# Load the prompts module directly
spec = importlib.util.spec_from_file_location("core_prompts", prompts_file_path)
prompts_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(prompts_module)

# Import all prompts from the loaded module
EMPATHY_AGENT_PROMPT = prompts_module.EMPATHY_AGENT_PROMPT
SOURCE_CITATION_STANDARDS = prompts_module.SOURCE_CITATION_STANDARDS

# NEW: Import confidence-based dialogue prompts
CONFIDENCE_BASED_DIALOGUE_PROMPTS = prompts_module.CONFIDENCE_BASED_DIALOGUE_PROMPTS
MARCUS_CONFIDENCE_PROMPT = prompts_module.MARCUS_CONFIDENCE_PROMPT
LIV_CONFIDENCE_PROMPT = prompts_module.LIV_CONFIDENCE_PROMPT
MIGUEL_CONFIDENCE_PROMPT = prompts_module.MIGUEL_CONFIDENCE_PROMPT
JASMINE_CONFIDENCE_PROMPT = prompts_module.JASMINE_CONFIDENCE_PROMPT
ALEX_CONFIDENCE_PROMPT = prompts_module.ALEX_CONFIDENCE_PROMPT
SUPERVISOR_CONFIDENCE_ROUTING = prompts_module.SUPERVISOR_CONFIDENCE_ROUTING

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
    "EMPATHY_AGENT_PROMPT",
    "SOURCE_CITATION_STANDARDS",
    # NEW: Confidence-based dialogue prompts
    "CONFIDENCE_BASED_DIALOGUE_PROMPTS",
    "MARCUS_CONFIDENCE_PROMPT",
    "LIV_CONFIDENCE_PROMPT",
    "MIGUEL_CONFIDENCE_PROMPT",
    "JASMINE_CONFIDENCE_PROMPT",
    "ALEX_CONFIDENCE_PROMPT",
    "SUPERVISOR_CONFIDENCE_ROUTING",
]
