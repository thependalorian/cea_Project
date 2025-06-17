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


# Database Models (Aligned with Supabase Schema)


class AdminPermissions(BaseModel):
    """Admin permissions table model"""

    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    permission_level: str
    resource_type: str
    granted_by: Optional[str] = None
    created_at: Optional[datetime] = Field(default_factory=datetime.now)


class AdminProfiles(BaseModel):
    """Admin profiles table model"""

    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    full_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    direct_phone: Optional[str] = None
    department: Optional[str] = None
    permissions: Optional[Dict[str, Any]] = Field(default_factory=dict)
    can_manage_users: bool = False
    can_manage_content: bool = False
    can_manage_partners: bool = False
    can_manage_system: bool = False
    can_view_analytics: bool = False
    profile_completed: bool = False
    last_login: Optional[datetime] = None
    last_admin_action: Optional[datetime] = None
    total_admin_actions: int = 0
    admin_notes: Optional[str] = None
    emergency_contact: Optional[Dict[str, Any]] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class AuditLogs(BaseModel):
    """Audit logs table model"""

    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    table_name: str
    user_id: Optional[str] = None
    record_id: Optional[str] = None
    old_values: Optional[Dict[str, Any]] = None
    new_values: Optional[Dict[str, Any]] = None
    details: Optional[Dict[str, Any]] = Field(default_factory=dict)
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    created_at: Optional[datetime] = Field(default_factory=datetime.now)


class ContentFlags(BaseModel):
    """Content flags table model"""

    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    content_id: str
    content_type: str
    flag_reason: str
    flagged_by: Optional[str] = None
    admin_reviewed: bool = False
    created_at: Optional[datetime] = Field(default_factory=datetime.now)


class ConversationAnalytics(BaseModel):
    """Conversation analytics table model - aligned with database schema"""

    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    conversation_id: str
    user_id: str
    messages_sent: int = 0
    messages_received: int = 0
    session_duration_seconds: Optional[int] = None
    topics_discussed: List[str] = Field(default_factory=list)
    resources_accessed: List[str] = Field(default_factory=list)
    jobs_viewed: List[str] = Field(default_factory=list)
    partners_contacted: List[str] = Field(default_factory=list)
    conversation_outcome: Optional[str] = None
    goals_achieved: Optional[bool] = None
    user_satisfaction_score: Optional[int] = None
    follow_up_actions_taken: int = 0
    next_steps: List[Dict[str, Any]] = Field(default_factory=list)
    total_tokens_consumed: int = 0
    average_response_time_ms: Optional[float] = None
    created_at: Optional[datetime] = Field(default_factory=datetime.now)
    analyzed_at: Optional[datetime] = Field(default_factory=datetime.now)


class ConversationFeedback(BaseModel):
    """Conversation feedback table model"""

    id: str
    conversation_id: str
    message_id: str
    user_id: str
    feedback_type: str  # 'rating', 'correction', 'flag', etc.
    rating: Optional[int] = None
    correction: Optional[str] = None
    flag_reason: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)
    created_at: str


class ConversationInterrupts(BaseModel):
    """Conversation interrupts table model"""

    id: str
    conversation_id: str
    type: str  # e.g. 'human_review', 'flag', 'pause', 'match_approval'
    status: str = (
        "pending"  # 'pending', 'resolved', 'dismissed', 'approved', 'rejected'
    )
    priority: str = "medium"
    job_id: Optional[str] = None
    match_score: Optional[float] = None
    escalation_reason: Optional[str] = None
    context: Optional[Dict[str, Any]] = Field(default_factory=dict)
    resolution: Optional[Dict[str, Any]] = None
    supervisor_approval_required: bool = False
    reviewer_id: Optional[str] = None
    review_notes: Optional[str] = None
    created_at: str
    resolved_at: Optional[str] = None


class ConversationMessages(BaseModel):
    """Conversation messages table model - aligned with database schema"""

    id: str
    conversation_id: str
    role: str  # 'user', 'assistant', 'system', 'correction', etc.
    content: str = ""  # Made content have default empty string to match usage
    specialist_type: Optional[str] = None
    content_type: str = "text"
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)
    embedding: Optional[List[float]] = None
    processed: bool = False
    error_message: Optional[str] = None
    created_at: str
    updated_at: Optional[str] = None


class Conversations(BaseModel):
    """Conversations table model - aligned with database schema"""

    id: str
    user_id: str
    title: Optional[str] = None
    description: Optional[str] = None
    conversation_type: str = "general"
    initial_query: Optional[str] = None
    status: str = "active"
    thread_id: Optional[str] = None
    message_count: int = 0
    total_tokens_used: int = 0
    session_metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: str
    updated_at: str
    last_activity: str
    ended_at: Optional[str] = None


class CredentialEvaluation(BaseModel):
    """Credential evaluation table model"""

    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    credential_type: str  # max 100 chars
    issuing_country: str  # max 3 chars
    us_equivalent: Optional[str] = None  # max 200 chars
    evaluation_status: str = "pending"  # max 20 chars
    updated_at: datetime = Field(default_factory=datetime.now)


class EducationPrograms(BaseModel):
    """Education programs table model"""

    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    partner_id: str
    program_name: str
    description: str
    program_type: Optional[str] = None
    format: Optional[str] = None
    duration: Optional[str] = None
    cost: Optional[str] = None
    prerequisites: Optional[str] = None
    certification_offered: Optional[str] = None
    skills_taught: List[str] = Field(default_factory=list)
    climate_focus: List[str] = Field(default_factory=list)
    contact_info: Optional[Dict[str, Any]] = Field(default_factory=dict)
    application_url: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    is_active: bool = True
    created_at: Optional[datetime] = Field(default_factory=datetime.now)
    updated_at: Optional[datetime] = Field(default_factory=datetime.now)


class JobListings(BaseModel):
    """Job listings table model"""

    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    partner_id: str
    title: str
    description: str
    responsibilities: Optional[str] = None
    requirements: Optional[str] = None
    skills_required: List[str] = Field(default_factory=list)
    experience_level: Optional[str] = None
    employment_type: Optional[str] = None
    salary_range: Optional[str] = None
    benefits: Optional[str] = None
    location: Optional[str] = None
    climate_focus: List[str] = Field(default_factory=list)
    application_url: Optional[str] = None
    expires_at: Optional[datetime] = None
    is_active: bool = True
    created_at: Optional[datetime] = Field(default_factory=datetime.now)
    updated_at: Optional[datetime] = Field(default_factory=datetime.now)


class JobSeekerProfiles(BaseModel):
    """Job seeker profiles table model"""

    id: Optional[str] = None
    user_id: Optional[str] = None
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    current_title: Optional[str] = None
    location: Optional[str] = None
    experience_level: Optional[str] = None
    climate_interests: List[Dict[str, Any]] = Field(default_factory=list)
    desired_roles: List[Dict[str, Any]] = Field(default_factory=list)
    employment_types: List[Dict[str, Any]] = Field(default_factory=list)
    preferred_locations: List[Dict[str, Any]] = Field(default_factory=list)
    climate_focus_areas: List[Dict[str, Any]] = Field(default_factory=list)
    salary_range_min: Optional[int] = None
    salary_range_max: Optional[int] = None
    remote_work_preference: str = "hybrid"
    resume_filename: Optional[str] = None
    resume_storage_path: Optional[str] = None
    resume_uploaded_at: Optional[datetime] = None
    profile_completed: bool = False
    last_login: Optional[datetime] = None
    preferences_updated_at: Optional[datetime] = None
    created_at: Optional[datetime] = Field(default_factory=datetime.now)
    updated_at: Optional[datetime] = Field(default_factory=datetime.now)


class KnowledgeResources(BaseModel):
    """Knowledge resources table model"""

    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    content: str
    content_type: str
    description: Optional[str] = None
    categories: List[str] = Field(default_factory=list)
    topics: List[str] = Field(default_factory=list)
    climate_sectors: List[str] = Field(default_factory=list)
    skill_categories: List[str] = Field(default_factory=list)
    target_audience: List[str] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)
    content_difficulty: str = "intermediate"
    domain: Optional[str] = None
    source_url: Optional[str] = None
    file_path: Optional[str] = None
    partner_id: Optional[str] = None
    embedding: Optional[List[float]] = None
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)
    is_published: bool = True
    created_at: Optional[datetime] = Field(default_factory=datetime.now)
    updated_at: Optional[datetime] = Field(default_factory=datetime.now)


class MessageFeedback(BaseModel):
    """Message feedback table model"""

    id: str
    conversation_id: str
    message_id: str
    user_id: str
    feedback_type: str  # 'rating', 'correction', 'flag', etc.
    rating: Optional[int] = None
    correction: Optional[str] = None
    created_at: str


class MosTranslation(BaseModel):
    """MOS translation table model"""

    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    mos_code: str  # max 10 chars
    mos_title: str  # max 300 chars
    civilian_equivalents: List[str] = Field(default_factory=list)
    transferable_skills: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class PartnerMatchResults(BaseModel):
    """Partner match results table model"""

    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    candidate_id: str
    job_id: str
    match_score: float = Field(ge=0.0, le=1.0)
    threshold_met: bool = False
    matching_skills: List[str] = Field(default_factory=list)
    skill_gaps: List[str] = Field(default_factory=list)
    recommendations: List[Dict[str, Any]] = Field(default_factory=list)
    requires_human_review: bool = False
    auto_approved: bool = False
    status: str = "pending"
    reviewer_id: Optional[str] = None
    approved_by: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    approved_at: Optional[datetime] = None
    created_at: Optional[datetime] = Field(default_factory=datetime.now)
    updated_at: Optional[datetime] = Field(default_factory=datetime.now)


class PartnerProfiles(BaseModel):
    """Partner profiles table model"""

    id: Optional[str] = None
    organization_name: str
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None
    organization_type: Optional[str] = None
    organization_size: Optional[str] = None
    headquarters_location: Optional[str] = None
    founded_year: Optional[int] = None
    employee_count: Optional[int] = None
    mission_statement: Optional[str] = None
    climate_focus: List[str] = Field(default_factory=list)
    industries: List[Dict[str, Any]] = Field(default_factory=list)
    services_offered: List[Dict[str, Any]] = Field(default_factory=list)
    training_programs: List[Dict[str, Any]] = Field(default_factory=list)
    partnership_level: str = "standard"
    partnership_start_date: Optional[datetime] = None
    verified: bool = False
    verification_date: Optional[datetime] = None
    profile_completed: bool = False
    last_login: Optional[datetime] = None
    # Boolean features
    hiring_actively: bool = False
    has_job_board: bool = False
    internship_programs: bool = False
    offers_mentorship: bool = False
    offers_funding: bool = False
    offers_certification: bool = False
    has_resource_library: bool = False
    offers_webinars: bool = False
    offers_virtual_tours: bool = False
    hosts_events: bool = False
    has_podcast: bool = False
    has_mobile_app: bool = False
    # URLs and social media
    linkedin_url: Optional[str] = None
    twitter_handle: Optional[str] = None
    facebook_url: Optional[str] = None
    instagram_handle: Optional[str] = None
    youtube_url: Optional[str] = None
    podcast_url: Optional[str] = None
    careers_page_url: Optional[str] = None
    events_calendar_url: Optional[str] = None
    newsletter_signup_url: Optional[str] = None
    platform_login_url: Optional[str] = None
    student_portal_url: Optional[str] = None
    workforce_portal_url: Optional[str] = None
    created_at: Optional[datetime] = Field(default_factory=datetime.now)
    updated_at: Optional[datetime] = Field(default_factory=datetime.now)


class Profiles(BaseModel):
    """Profiles table model"""

    id: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    organization_name: Optional[str] = None
    organization_type: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None
    role: str = "user"
    user_type: str = "user"
    partnership_level: str = "standard"
    verified: bool = False
    contact_info: Optional[Dict[str, Any]] = Field(default_factory=dict)
    created_at: Optional[datetime] = Field(default_factory=datetime.now)
    updated_at: Optional[datetime] = Field(default_factory=datetime.now)


class ResourceViews(BaseModel):
    """Resource views table model"""

    user_id: Optional[str] = None
    resource_id: str
    resource_type: str
    session_id: Optional[str] = None
    referrer: Optional[str] = None
    interaction_metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)
    viewed_at: Optional[datetime] = Field(default_factory=datetime.now)


class ResumeChunks(BaseModel):
    """Resume chunks table model"""

    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    resume_id: str
    content: str
    chunk_type: str = "content"
    page_number: int = 0
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)
    embedding: Optional[List[float]] = None
    created_at: Optional[datetime] = Field(default_factory=datetime.now)
    updated_at: Optional[datetime] = Field(default_factory=datetime.now)


class Resumes(BaseModel):
    """Resumes table model - aligned with database schema"""

    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    file_name: str
    content_type: Optional[str] = None  # max 100 chars
    file_size: Optional[int] = None
    file_path: Optional[str] = None
    processed: bool = False
    processing_status: str = "pending"
    processing_error: Optional[str] = None
    processing_metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)
    content: Optional[str] = None
    content_embedding: Optional[List[float]] = None
    embedding: Optional[List[float]] = None
    skills_extracted: List[Dict[str, Any]] = Field(default_factory=list)
    education_level: Optional[str] = None
    experience_years: Optional[int] = None
    industry_background: Optional[List[str]] = None
    climate_relevance_score: Optional[float] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    personal_website: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class RoleRequirements(BaseModel):
    """Role requirements table model"""

    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    role_title: str  # max 200 chars
    experience_level: str  # max 50 chars
    minimum_years: Optional[int] = None
    required_skills: List[str]
    preferred_skills: List[str] = Field(default_factory=list)
    salary_range: Optional[Dict[str, Any]] = None
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class SkillsMapping(BaseModel):
    """Skills mapping table model"""

    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    skill_name: str  # max 200 chars
    category: str  # max 100 chars
    climate_relevance: float = Field(ge=0.0, le=1.0)
    keywords: List[str] = Field(default_factory=list)
    mapped_roles: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class UserInterests(BaseModel):
    """User interests table model - aligned with database schema"""

    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    climate_focus: List[str] = Field(default_factory=list)
    target_roles: List[str] = Field(default_factory=list)
    skills_to_develop: List[str] = Field(default_factory=list)
    preferred_location: Optional[str] = None
    employment_preferences: Optional[Dict[str, Any]] = Field(default_factory=dict)
    email_notifications: bool = True
    job_alerts_enabled: bool = True
    newsletter_enabled: bool = True
    marketing_emails_enabled: bool = True
    partner_updates_enabled: bool = True
    data_sharing_enabled: bool = False
    social_profile_analysis_enabled: bool = True
    language_preference: str = "en"
    timezone: str = "UTC"
    theme_preference: str = "system"
    created_at: Optional[datetime] = Field(default_factory=datetime.now)
    updated_at: Optional[datetime] = Field(default_factory=datetime.now)


class WorkflowSessions(BaseModel):
    """Workflow sessions table model"""

    session_id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    workflow_type: str  # max 50 chars
    status: str = "active"  # max 20 chars
    data: Optional[Dict[str, Any]] = Field(default_factory=dict)
    updated_at: datetime = Field(default_factory=datetime.now)


# Legacy models for backward compatibility
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


class CredentialEvaluationLegacy(BaseModel):
    """Legacy evaluation of a credential"""

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
    credentials: List[CredentialEvaluationLegacy] = []
    upskilling_programs: List[UpskillingProgram] = []
    next_steps: List[str] = []
    sources: List[str] = []
    confidence_score: float = Field(ge=0.0, le=1.0)
    personalized_insights: str


# Alias for backward compatibility
ChatMessage = ConversationMessages
ConversationInterrupt = ConversationInterrupts
MessageFeedback = MessageFeedback
Conversation = Conversations
ConversationAnalytics = ConversationAnalytics
Resume = Resumes
JobListing = JobListings
UserInterests = UserInterests
WorkflowSession = WorkflowSessions
JobSeekerProfile = JobSeekerProfiles

# Request/Response Models (for API usage)


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
