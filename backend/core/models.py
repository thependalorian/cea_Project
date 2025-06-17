"""
Core models module for Climate Economy Assistant

This module centralizes all Pydantic models used throughout the application
for type safety, schema validation, and documentation.
"""

import uuid
from datetime import datetime
from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, Field

# Import database-aligned models from main models module
from models import (
    ConversationMessages as ChatMessage,
    ConversationInterrupts as ConversationInterrupt,
    MessageFeedback,
    Conversations as Conversation,
    ConversationAnalytics,
    UserInterests,
    AuditLogs as AuditLog,
    ResourceViews as ResourceView,
    SpecialistResponse,
    SkillAnalysis,
    CareerRecommendation,
    CredentialEvaluationLegacy as CredentialEvaluation,
    UpskillingProgram,
    ResumeAnalysisRequest,
    ProcessResumeRequest,
    CheckUserResumeRequest,
)

# Base Models


class BaseResponseModel(BaseModel):
    """Base model for all API responses"""

    success: bool = True
    message: Optional[str] = None


class ErrorResponseModel(BaseResponseModel):
    """Error response model"""

    success: bool = False
    error: str
    error_code: Optional[str] = None
    details: Optional[Dict[str, Any]] = None


# Chat and Response Models (API-specific, not database tables)


class ChatResponse(BaseModel):
    """Chat response model"""

    content: str
    role: str = "assistant"
    specialist_type: Optional[str] = None
    is_human: Optional[bool] = None
    status: Optional[str] = "completed"
    sources: Optional[List[Dict[str, Any]]] = []
    session_id: Optional[str] = None
    workflow_state: Optional[str] = "completed"
    next_action: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = {}
    conversation_id: str


class StreamingChatResponse(BaseModel):
    """Streaming chat response model"""

    type: str  # 'chunk', 'interrupt', 'complete', 'error'
    content: Optional[str] = None
    data: Optional[Dict[str, Any]] = None
    session_id: Optional[str] = None


class InteractionRequest(BaseModel):
    """Chat interaction request model"""

    query: str
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    context: Optional[Dict[str, Any]] = {}
    stream: Optional[bool] = False


# Agent State Models (LangGraph-specific, not database tables)


class AgentState(BaseModel):
    """Base state for LangGraph agents"""

    messages: List[Any]
    user_id: Optional[str] = None
    id: Optional[str] = None
    next: Optional[str] = None
    query: Optional[str] = None
    current_reasoning: Optional[str] = None
    content: Optional[str] = None
    role: Optional[str] = "user"
    context: Optional[str] = "general"
    session_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = {}
    sources: Optional[List[Dict[str, Any]]] = []
    workflow_state: Optional[str] = "completed"
    next_action: Optional[str] = None
    include_resume_context: Optional[bool] = True
    search_scope: Optional[str] = "all"  # jobs, education, partners, all
    analysis_type: Optional[str] = "comprehensive"
    include_social_data: Optional[bool] = True
    stream: Optional[bool] = False
    response: Optional[Any] = None
    action: Optional[str] = "continue"
    current_step: Optional[str] = None
    history: List[Dict[str, Any]] = []
    created_at: datetime = Field(default_factory=datetime.now)
    resumeData: Optional[Dict[str, Any]] = None
    useResumeRAG: Optional[bool] = False
    uuid: Optional[str] = None
    conversation_id: Optional[str] = None


class WorkflowState(BaseModel):
    """Workflow session state"""

    session_id: str
    user_id: Optional[str] = None
    current_step: str
    context: Dict[str, Any] = {}
    history: List[Dict[str, Any]] = []
    created_at: datetime = Field(default_factory=datetime.now)


# Request Models (API-specific)


class ClimateCareerRequest(BaseModel):
    """Climate career search request"""

    query: str
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    include_resume_context: Optional[bool] = True
    search_scope: Optional[str] = "all"  # jobs, education, partners, all
    stream: Optional[bool] = False


class SearchRequest(BaseModel):
    """Generic search request"""

    query: str
    search_type: Optional[str] = "all"  # all, jobs, education, partners, knowledge
    filters: Optional[Dict[str, Any]] = None
    limit: Optional[int] = 20


# Export all database-aligned models for convenience
__all__ = [
    # Base models
    "BaseResponseModel",
    "ErrorResponseModel",
    # API-specific models
    "ChatResponse",
    "StreamingChatResponse",
    "InteractionRequest",
    "AgentState",
    "WorkflowState",
    "ClimateCareerRequest",
    "SearchRequest",
    # Database-aligned models (imported from main models)
    "ChatMessage",
    "ConversationInterrupt",
    "MessageFeedback",
    "Conversation",
    "ConversationAnalytics",
    "UserInterests",
    "AuditLog",
    "ResourceView",
    "SpecialistResponse",
    "SkillAnalysis",
    "CareerRecommendation",
    "CredentialEvaluation",
    "UpskillingProgram",
    "ResumeAnalysisRequest",
    "ProcessResumeRequest",
    "CheckUserResumeRequest",
]
