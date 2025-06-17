"""
Core Models Package - Empathy Models

Contains empathy-specific Pydantic models for the Climate Economy Assistant system.
"""

# Import AgentState and other models directly from the models.py file using importlib to avoid circular imports
import importlib.util
import sys
from pathlib import Path

# Get the path to the models.py file
models_file_path = Path(__file__).parent.parent / "models.py"

# Load the models module directly
spec = importlib.util.spec_from_file_location("core_models", models_file_path)
models_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(models_module)

# Import all the models from the loaded module
AgentState = models_module.AgentState
BaseResponseModel = models_module.BaseResponseModel
ErrorResponseModel = models_module.ErrorResponseModel
ChatMessage = models_module.ChatMessage
ChatResponse = models_module.ChatResponse
StreamingChatResponse = models_module.StreamingChatResponse
InteractionRequest = models_module.InteractionRequest
ConversationInterrupt = models_module.ConversationInterrupt
MessageFeedback = models_module.MessageFeedback
ResumeAnalysisRequest = models_module.ResumeAnalysisRequest
ProcessResumeRequest = models_module.ProcessResumeRequest
CheckUserResumeRequest = models_module.CheckUserResumeRequest
SkillAnalysis = models_module.SkillAnalysis
CareerRecommendation = models_module.CareerRecommendation
CredentialEvaluation = models_module.CredentialEvaluation
UpskillingProgram = models_module.UpskillingProgram
SpecialistResponse = models_module.SpecialistResponse
WorkflowState = models_module.WorkflowState
ClimateCareerRequest = models_module.ClimateCareerRequest
SearchRequest = models_module.SearchRequest
ResourceView = models_module.ResourceView
ConversationAnalytics = models_module.ConversationAnalytics
UserInterests = models_module.UserInterests
AuditLog = models_module.AuditLog
Conversation = models_module.Conversation

# Import from empathy_models.py
from .empathy_models import (
    EmpathyAssessment,
    EmotionalState,
    SupportLevel,
    EmpathyTrigger,
    EmotionalIndicators,
    IntersectionalContext,
    EmpathyStrategy,
    EmpathyResponse,
    EmpathyWorkflowState,
    EMPATHY_TEMPLATES,
    SUPPORT_INTERVENTIONS,
)

__all__ = [
    # Core models from models.py
    "AgentState",
    "BaseResponseModel",
    "ErrorResponseModel",
    "ChatMessage",
    "ChatResponse",
    "StreamingChatResponse",
    "InteractionRequest",
    "ConversationInterrupt",
    "MessageFeedback",
    "ResumeAnalysisRequest",
    "ProcessResumeRequest",
    "CheckUserResumeRequest",
    "SkillAnalysis",
    "CareerRecommendation",
    "CredentialEvaluation",
    "UpskillingProgram",
    "SpecialistResponse",
    "WorkflowState",
    "ClimateCareerRequest",
    "SearchRequest",
    "ResourceView",
    "ConversationAnalytics",
    "UserInterests",
    "AuditLog",
    "Conversation",
    # Empathy models
    "EmpathyAssessment",
    "EmotionalState",
    "SupportLevel",
    "EmpathyTrigger",
    "EmotionalIndicators",
    "IntersectionalContext",
    "EmpathyStrategy",
    "EmpathyResponse",
    "EmpathyWorkflowState",
    "EMPATHY_TEMPLATES",
    "SUPPORT_INTERVENTIONS",
]
