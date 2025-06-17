"""
Models Package for Climate Economy Assistant

This package contains Pydantic models for structured data validation and API contracts.
Following the modular architecture pattern from the successful backend implementation.
"""

import os
import sys
import importlib.util
from typing import Dict, Any, Optional, List, Union

# Add the project root to Python path to fix relative imports
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

# Base model imports
from backendv1.models.user_model import UserModel, JobSeekerProfile, PartnerProfile, AdminProfile
from backendv1.models.resume_model import ResumeModel, ResumeAnalysis, SkillExtraction
from backendv1.models.conversation_model import ConversationModel, MessageModel, SessionState
from backendv1.models.agent_model import AgentResponse, SpecialistInteraction
from backendv1.models.empathy_model import EmpathyAssessment, EmotionalState

# Check if additional model modules are available
try:
    from backendv1.models.agent_schema import AgentSchema, AgentConfig, AgentCapability

    has_agent_schema = True
except ImportError:
    has_agent_schema = False
    AgentSchema = None
    AgentConfig = None
    AgentCapability = None

# Export all model classes
__all__ = [
    # User models
    "UserModel",
    "JobSeekerProfile",
    "PartnerProfile",
    "AdminProfile",
    # Resume models
    "ResumeModel",
    "ResumeAnalysis",
    "SkillExtraction",
    # Conversation models
    "ConversationModel",
    "MessageModel",
    "SessionState",
    # Agent models
    "AgentResponse",
    "SpecialistInteraction",
    # Empathy models
    "EmpathyAssessment",
    "EmotionalState",
]

# Add agent schema models if available
if has_agent_schema:
    __all__.extend(
        [
            "AgentSchema",
            "AgentConfig",
            "AgentCapability",
        ]
    )

# Version tracking
__version__ = "1.0.0"
