"""
Data models for the Climate Economy Assistant backend.

This module defines Pydantic models that align with the Supabase database schema
and ensure consistent data structure across the application.
"""

import uuid
from datetime import datetime
from typing import Any, Dict, List, Literal, Optional, Union

from pydantic import BaseModel, Field, validator


class AgentState(BaseModel):
    """State maintained during agent conversation"""

    messages: List[Dict[str, Any]] = []
    user_id: str
    id: str
    next: str = ""
    query: str = ""
    current_reasoning: str = ""
    content: str = ""
    role: Optional[str] = "user"
    context: Optional[str] = "general"
    session_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = {}
    sources: Optional[List[Dict[str, Any]]] = []
    workflow_state: Optional[str] = "completed"
    next_action: Optional[str] = None
    include_resume_context: Optional[bool] = True
    search_scope: Optional[str] = "all"
    analysis_type: Optional[str] = "comprehensive"
    include_social_data: Optional[bool] = True
    stream: Optional[bool] = False
    response: Any = None
    action: Optional[str] = "continue"
    current_step: str = ""
    history: List[Dict[str, Any]] = []
    created_at: datetime = Field(default_factory=datetime.now)
    resumeData: Optional[Dict[str, Any]] = None
    useResumeRAG: Optional[bool] = False
    file_url: Optional[str] = None
    file_id: Optional[str] = None
    status: str = "ok"
    chunks_processed: Optional[int] = 0
    message: str = ""
    match_threshold: Optional[float] = 0.7
    match_count: Optional[int] = 5
    chat_history: Optional[List[List[str]]] = None
    answer: Optional[str] = ""
    success: Optional[bool] = True
    resume_id: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    personal_website: Optional[str] = None
    data: Optional[Dict[str, Any]] = None
    thoughts: Optional[str] = None
    tool_usage: Optional[List[Dict[str, Any]]] = None
    search_type: Optional[str] = "all"
    filters: Optional[Dict[str, Any]] = None
    limit: Optional[int] = 20
    count: Optional[int] = 0
    breakdown: Optional[Dict[str, int]] = None
    partner_name: Optional[str] = None
    partner_type: Optional[str] = None
    partners: Optional[List[Dict[str, Any]]] = None
    focus_area: Optional[str] = None
    search_results: Optional[List[Dict[str, Any]]] = None
    partner_recommendations: Optional[List[Dict[str, Any]]] = None
    insights: Optional[Dict[str, Any]] = None
    uuid: Optional[str] = None
    conversation_id: Optional[str] = None


class SkillAnalysis(BaseModel):
    """Analysis of a specific skill"""

    skill_name: str
    current_level: str
    climate_relevance: float = Field(ge=0.0, le=1.0)
    transferability: str
    gap_assessment: str


class CareerRecommendation(BaseModel):
    """Recommendation for a career path"""

    title: str
    employer: str
    match_score: float = Field(ge=0.0, le=1.0)
    required_skills: List[str]
    salary_range: str
    location: str
    pathway_description: str


class CredentialEvaluation(BaseModel):
    """Evaluation of a credential"""

    credential_name: str
    us_equivalent: str
    recognition_status: str
    additional_requirements: List[str]
    climate_economy_value: str


class UpskillingProgram(BaseModel):
    """Recommendation for an upskilling program"""

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
    next_steps: List[str] = []
    sources: List[str] = []
    confidence_score: float = Field(ge=0.0, le=1.0)
    personalized_insights: str


class ChatMessage(BaseModel):
    """Message in a conversation"""

    id: Optional[str] = None
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
    created_at: Optional[str] = None
    content_type: Optional[str] = "text"
    embedding: Optional[List[float]] = None
    error_message: Optional[str] = None
    processed: Optional[bool] = False
    updated_at: Optional[str] = None


class ConversationInterrupt(BaseModel):
    """Interruption in a conversation"""

    id: Optional[str] = None
    conversation_id: str
    type: str  # e.g. 'human_review', 'flag', 'pause', 'match_approval'
    status: str = (
        "pending"  # 'pending', 'resolved', 'dismissed', 'approved', 'rejected'
    )
    priority: str = "medium"
    resolution: Optional[Dict[str, Any]] = None
    created_at: Optional[str] = None
    resolved_at: Optional[str] = None
    supervisor_approval_required: Optional[bool] = False
    match_score: Optional[float] = None
    candidate_id: Optional[str] = None
    job_id: Optional[str] = None
    reviewer_id: Optional[str] = None
    review_notes: Optional[str] = None
    escalation_reason: Optional[str] = None


class MessageFeedback(BaseModel):
    """Feedback on a message"""

    id: Optional[str] = None
    conversation_id: str
    message_id: str
    user_id: Optional[str] = None
    feedback_type: str  # 'rating', 'correction', 'flag', etc.
    rating: Optional[int] = None
    correction: Optional[str] = None
    flag_reason: Optional[str] = None
    created_at: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = {}


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


class ConversationAnalytics(BaseModel):
    """Analytics for a conversation"""

    id: Optional[str] = None
    conversation_id: str
    user_id: str
    analyzed_at: Optional[str] = None
    created_at: Optional[str] = None
    messages_sent: int = 0
    messages_received: int = 0
    session_duration_seconds: Optional[int] = None
    topics_discussed: List[str] = []
    resources_accessed: List[str] = []
    jobs_viewed: List[str] = []
    partners_contacted: List[str] = []
    conversation_outcome: Optional[str] = None
    goals_achieved: Optional[bool] = None
    user_satisfaction_score: Optional[int] = None
    follow_up_actions_taken: int = 0
    next_steps: List[Dict[str, Any]] = []
    total_tokens_consumed: int = 0
    average_response_time_ms: Optional[float] = None


class Resume(BaseModel):
    """User resume data"""

    id: str
    user_id: str
    file_name: str
    file_type: str
    file_size: int
    file_url: str
    processed: bool = False
    content: Optional[str] = None
    created_at: str
    updated_at: Optional[str] = None
    metadata: Dict[str, Any] = {}
    skills_extracted: List[str] = []
    education_level: Optional[str] = None
    experience_years: Optional[int] = None
    military_branch: Optional[str] = None
    mos_code: Optional[str] = None
    community_experience: Optional[str] = None


class JobListing(BaseModel):
    """Job listing data"""

    id: str
    title: str
    company: str
    location: str
    description: str
    requirements: List[str]
    salary_range: Optional[str] = None
    application_url: Optional[str] = None
    climate_focus: List[str] = []
    posted_date: str
    closing_date: Optional[str] = None
    partner_id: Optional[str] = None
    created_at: str
    updated_at: Optional[str] = None
    status: str = "active"
    job_type: str = "full_time"
    remote_option: bool = False
    experience_level: str = "entry_level"


class UserInterests(BaseModel):
    """User interests data"""

    id: Optional[str] = None
    user_id: str
    climate_focus: List[str] = []
    target_roles: List[str] = []
    skills_to_develop: List[str] = []
    preferred_location: Optional[str] = None
    employment_preferences: Dict[str, Any] = {}
    updated_at: Optional[str] = None


class WorkflowSession(BaseModel):
    """Workflow session data"""

    session_id: str
    user_id: str
    workflow_type: str
    status: str = "active"
    data: Dict[str, Any] = {}
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class JobSeekerProfile(BaseModel):
    """Job seeker profile data"""

    id: Optional[str] = None
    user_id: str
    climate_interests: List[str] = []
    desired_roles: List[str] = []
    employment_types: List[str] = []
    preferred_locations: List[str] = []
    climate_focus_areas: List[str] = []
    resume_id: Optional[str] = None
    last_login: Optional[str] = None
    updated_at: Optional[str] = None
    preferences_updated_at: Optional[str] = None
    profile_completed: bool = False


# Resume related models
class ProcessResumeRequest(BaseModel):
    """Request model for processing uploaded resume"""

    file_url: str
    file_id: str
    context: Optional[str] = "general"
    user_id: str


class CheckUserResumeRequest(BaseModel):
    """Request model for checking if user has a resume"""

    user_id: str


class ResumeAnalysisRequest(BaseModel):
    """Request model for analyzing a resume"""

    user_id: str
    session_id: Optional[str] = None
    analysis_type: Optional[str] = "comprehensive"
    include_social_data: Optional[bool] = True
    stream: Optional[bool] = False


class ResumeUploadResponse(BaseModel):
    """Response model for resume upload"""

    success: bool
    message: str
    resume_id: Optional[str] = None
    file_name: Optional[str] = None
    error: Optional[str] = None


class ResumeCheckResponse(BaseModel):
    """Response model for checking if user has a resume"""

    has_resume: bool
    resume_id: Optional[str] = None
    file_name: Optional[str] = None
    processed: Optional[bool] = False
    uploaded_at: Optional[datetime] = None
    message: Optional[str] = None


class ResumeProcessingResponse(BaseModel):
    """Response model for resume processing"""

    success: bool
    message: str
    content_length: Optional[int] = None
    chunks_count: Optional[int] = None
    skills_extracted: Optional[int] = None
    climate_relevance_score: Optional[float] = None
    experience_years: Optional[int] = None
    education_level: Optional[str] = None
    industry_background: Optional[List[str]] = None
    already_processed: Optional[bool] = None
    resume_id: Optional[str] = None
    context: Optional[str] = None
    analysis_method: Optional[str] = None
    analysis_confidence: Optional[float] = None
    content_quality: Optional[str] = None
    data_storage: Optional[str] = None
    processing_steps: Optional[List[str]] = None
    error: Optional[str] = None


class ResumeAnalysisResponse(BaseModel):
    """Response model for resume analysis"""

    analysis: str
    resume_id: Optional[str] = None
    user_id: str
    analysis_type: str
    message: str
    success: bool = True
    error: Optional[str] = None


class MilitaryInfo(BaseModel):
    """Model for military background information"""

    branch: Optional[str] = None
    rank: Optional[str] = None
    years_of_service: Optional[int] = None
    mos_codes: Optional[List[str]] = []
    base_locations: Optional[List[str]] = []
    current_base: Optional[str] = None
    awards: Optional[List[str]] = []
    leadership_roles: Optional[List[str]] = []
    technical_training: Optional[List[str]] = []


class CommunityInfo(BaseModel):
    """Model for community information"""

    location: Optional[str] = None
    is_ej_community: Optional[bool] = False
    transportation_options: Optional[List[str]] = []
    nearby_resources: Optional[List[str]] = []


class PartnerMatchResult(BaseModel):
    """Result of partner-candidate matching analysis"""

    candidate_id: str
    job_id: str
    match_score: float = Field(ge=0.0, le=1.0)
    threshold_met: bool
    matching_skills: List[str] = []
    skill_gaps: List[str] = []
    recommendations: List[str] = []
    requires_human_review: bool = False
    auto_approved: bool = False
    created_at: datetime = Field(default_factory=datetime.now)
    reviewed_at: Optional[datetime] = None
    reviewer_id: Optional[str] = None


class HITLWorkflowState(BaseModel):
    """Human-in-the-loop workflow state management"""

    workflow_id: str
    user_id: str
    workflow_type: str  # 'match_review', 'resume_analysis', 'career_guidance'
    current_step: str
    status: str = "active"  # 'active', 'pending_human', 'completed', 'escalated'
    context: Dict[str, Any] = {}
    human_required: bool = False
    supervisor_required: bool = False
    escalation_triggers: List[str] = []
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
