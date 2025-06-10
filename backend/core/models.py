"""
Core models module for Climate Economy Assistant

This module centralizes all Pydantic models used throughout the application
for type safety, schema validation, and documentation.
"""

import uuid
from datetime import datetime
from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, Field

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


# Chat and Conversation Models


class ChatMessage(BaseModel):
    """Chat message model"""

    id: Optional[str] = Field(default_factory=lambda: f"msg_{uuid.uuid4().hex}")
    conversation_id: str
    user_id: Optional[str] = None
    content: str
    role: str  # 'user', 'assistant', 'system', 'correction', etc.
    specialist_type: Optional[str] = None
    is_human: Optional[bool] = None
    status: Optional[str] = (
        "completed"  # 'pending', 'pending_human', 'completed', 'interrupted', etc.
    )
    metadata: Optional[Dict[str, Any]] = {}
    created_at: Optional[str] = Field(
        default_factory=lambda: datetime.now().isoformat()
    )
    content_type: Optional[str] = "text"


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


class ConversationInterrupt(BaseModel):
    """Conversation interrupt for HITL"""

    id: Optional[str] = Field(default_factory=lambda: f"interrupt_{uuid.uuid4().hex}")
    conversation_id: str
    type: str  # e.g. 'human_review', 'flag', 'pause', etc.
    status: str = "pending"  # 'pending', 'resolved', 'dismissed'
    priority: str = "medium"
    resolution: Optional[Dict[str, Any]] = None
    created_at: Optional[str] = Field(
        default_factory=lambda: datetime.now().isoformat()
    )
    resolved_at: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = {}


class MessageFeedback(BaseModel):
    """Feedback on a message"""

    id: Optional[str] = Field(default_factory=lambda: f"feedback_{uuid.uuid4().hex}")
    conversation_id: str
    message_id: str
    user_id: Optional[str] = None
    feedback_type: str  # 'rating', 'correction', 'flag', etc.
    rating: Optional[int] = None
    correction: Optional[str] = None
    created_at: Optional[datetime] = Field(default_factory=datetime.now)
    metadata: Optional[Dict[str, Any]] = {}


# Resume and Analysis Models


class ResumeAnalysisRequest(BaseModel):
    """Resume analysis request"""

    user_id: str
    session_id: Optional[str] = None
    analysis_type: Optional[str] = "comprehensive"
    include_social_data: Optional[bool] = True
    stream: Optional[bool] = False


class ProcessResumeRequest(BaseModel):
    """Process resume request"""

    file_url: str
    file_id: str
    context: Optional[str] = "general"
    user_id: str


class CheckUserResumeRequest(BaseModel):
    """Check user resume request"""

    user_id: str


class SkillAnalysis(BaseModel):
    """Skill analysis for a resume"""

    skill_name: str
    current_level: str
    climate_relevance: float = Field(ge=0.0, le=1.0)
    transferability: str
    gap_assessment: str


class CareerRecommendation(BaseModel):
    """Career recommendation for a user"""

    title: str
    employer: str
    match_score: float = Field(ge=0.0, le=1.0)
    required_skills: List[str]
    salary_range: str
    location: str
    pathway_description: str


class CredentialEvaluation(BaseModel):
    """Credential evaluation"""

    credential_name: str
    us_equivalent: str
    recognition_status: str
    additional_requirements: List[str]
    climate_economy_value: str


class UpskillingProgram(BaseModel):
    """Upskilling program recommendation"""

    program_name: str
    provider: str
    duration: str
    cost: str
    skills_covered: List[str]
    certification: str
    contact_info: str


class SpecialistResponse(BaseModel):
    """Response from a specialist agent"""

    specialist_type: str
    analysis: List[SkillAnalysis] = []
    recommendations: List[CareerRecommendation] = []
    credentials: List[CredentialEvaluation] = []
    upskilling_programs: List[UpskillingProgram] = []
    next_steps: List[str]
    sources: List[str]
    confidence_score: float = Field(ge=0.0, le=1.0)
    personalized_insights: str


# LangGraph State Models


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


# Search and Resource Models


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


class ResourceView(BaseModel):
    """Resource view tracking"""

    user_id: str
    resource_id: str
    resource_type: str  # 'job', 'education', 'partner', 'knowledge'
    session_id: Optional[str] = None
    referrer: Optional[str] = "climate_assistant"
    viewed_at: datetime = Field(default_factory=datetime.now)


# Analytics Models


class ConversationAnalytics(BaseModel):
    """Conversation analytics"""

    conversation_id: str
    user_id: Optional[str] = None
    messages_sent: int = 0
    messages_received: int = 0
    session_duration_seconds: int = 0
    topics_discussed: List[str] = []
    resources_accessed: List[str] = []
    jobs_viewed: List[str] = []
    partners_contacted: List[str] = []
    conversation_outcome: Optional[str] = None
    goals_achieved: Optional[bool] = None
    user_satisfaction_score: Optional[int] = None
    follow_up_actions_taken: int = 0
    next_steps: List[str] = []
    total_tokens_consumed: int = 0
    average_response_time_ms: Optional[int] = None
    created_at: datetime = Field(default_factory=datetime.now)
    analyzed_at: datetime = Field(default_factory=datetime.now)


class UserInterests(BaseModel):
    """User interest tracking"""

    user_id: str
    climate_focus: List[str] = []
    target_roles: List[str] = []
    skills_to_develop: List[str] = []
    preferred_location: Optional[str] = None
    employment_preferences: Dict[str, Any] = {}
    updated_at: datetime = Field(default_factory=datetime.now)


class AuditLog(BaseModel):
    """Audit log entry"""

    user_id: str
    table_name: str
    action_type: str
    record_id: Optional[str] = None
    old_values: Optional[Dict[str, Any]] = None
    new_values: Optional[Dict[str, Any]] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)


class Conversation(BaseModel):
    """Conversation metadata"""

    id: str
    user_id: str
    title: Optional[str] = None
    description: Optional[str] = None
    conversation_type: str = "general"
    status: str = "active"
    created_at: str
    updated_at: str
    last_activity: str
    ended_at: Optional[str] = None
    message_count: int = 0
    initial_query: Optional[str] = None
    thread_id: Optional[str] = None
    total_tokens_used: int = 0
    session_metadata: Dict[str, Any] = {}
