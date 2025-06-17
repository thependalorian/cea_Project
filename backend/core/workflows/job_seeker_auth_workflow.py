"""
Job Seeker Authentication Workflow - Climate Economy Assistant
LangGraph-based authentication and interaction workflow specifically for job seekers
Location: backend/core/workflows/job_seeker_auth_workflow.py

Uses existing 28-table database schema - no new tables required
"""

import asyncio
import uuid
from typing import Dict, Any, Optional, List, Literal
from datetime import datetime
from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage, AIMessage
from pydantic import BaseModel, Field

# Import our existing infrastructure
from core.config import get_settings
from adapters.supabase import get_supabase_client

# Import the climate supervisor workflow for AI capabilities
from api.workflows.climate_supervisor_workflow import (
    create_climate_supervisor_workflow,
    ClimateAgentState,
)

settings = get_settings()
supabase = get_supabase_client()

# =============================================================================
# STATE MODELS FOR JOB SEEKER WORKFLOWS
# =============================================================================


class JobSeekerAuthState(BaseModel):
    """Enhanced state for job seeker authentication and interactions"""

    # Authentication & Identity
    user_id: str
    access_token: Optional[str] = None
    is_authenticated: bool = False
    authentication_error: Optional[str] = None

    # User Profile Data
    profile: Optional[Dict[str, Any]] = None
    job_seeker_profile: Optional[Dict[str, Any]] = None

    # Session Management (maps to workflow_sessions table)
    session_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    conversation_id: Optional[str] = None
    last_activity: datetime = Field(default_factory=datetime.now)

    # Chat Interaction
    user_message: str = ""
    ai_response: str = ""
    conversation_history: List[Dict[str, Any]] = Field(default_factory=list)

    # AI Agent Context (integrates with supervisor workflow)
    climate_agent_state: Optional[Dict[str, Any]] = None
    current_specialist: Optional[str] = None
    specialist_history: List[str] = Field(default_factory=list)
    tools_used: List[str] = Field(default_factory=list)

    # Job Seeker Specific Context
    career_stage: str = "discovery"  # discovery, planning, applying, transitioning
    career_goals: List[str] = Field(default_factory=list)
    climate_interests: List[str] = Field(default_factory=list)
    skills_assessment: Optional[Dict[str, Any]] = None
    job_preferences: Dict[str, Any] = Field(default_factory=dict)

    # Workflow State
    workflow_step: str = "authenticate"
    intent_analysis: Optional[Dict[str, Any]] = None
    next_actions: List[str] = Field(default_factory=list)
    requires_human_review: bool = False

    # Analytics & Tracking (maps to conversation_analytics table)
    interaction_count: int = 0
    satisfaction_score: Optional[float] = None
    feedback_provided: bool = False

    # Error Handling
    error: Optional[str] = None
    warnings: List[str] = Field(default_factory=list)


class JobSeekerChatState(BaseModel):
    """Specialized state for job seeker chat interactions"""

    # Inherit from base auth state
    auth_state: JobSeekerAuthState

    # Chat specific (maps to conversations & conversation_messages tables)
    message: str
    conversation_id: str
    context: Dict[str, Any] = Field(default_factory=dict)

    # AI Response
    response: str = ""
    specialist_used: Optional[str] = None
    tools_used: List[str] = Field(default_factory=list)
    confidence_score: float = 0.0

    # Workflow control
    workflow_state: str = "active"
    next_step: Optional[str] = None
    error: Optional[str] = None


class JobRecommendationState(BaseModel):
    """State for job recommendation workflow"""

    auth_state: JobSeekerAuthState

    # Recommendation parameters (uses job_listings table)
    skills_filter: List[str] = Field(default_factory=list)
    location_filter: Optional[str] = None
    experience_level: Optional[str] = None
    climate_focus: List[str] = Field(default_factory=list)

    # Results
    recommendations: List[Dict[str, Any]] = Field(default_factory=list)
    total_matches: int = 0
    personalization_score: float = 0.0

    # Metadata
    search_timestamp: datetime = Field(default_factory=datetime.now)
    error: Optional[str] = None


# =============================================================================
# JOB SEEKER AUTHENTICATION WORKFLOW
# =============================================================================


class JobSeekerAuthWorkflow:
    """
    Comprehensive authentication and interaction workflow for job seekers
    Integrates with the Climate Supervisor and uses existing 28-table database schema
    """

    def __init__(self):
        self.supabase = supabase
        self.climate_supervisor = None
        self.graph = StateGraph(JobSeekerAuthState)
        self.chat_graph = StateGraph(JobSeekerChatState)
        self.recommendation_graph = StateGraph(JobRecommendationState)
        self.setup_workflows()

    def setup_workflows(self):
        """Setup all workflow graphs"""
        self._setup_auth_workflow()
        self._setup_chat_workflow()
        self._setup_recommendation_workflow()

    def _setup_auth_workflow(self):
        """Setup the main authentication workflow"""
        # Authentication nodes
        self.graph.add_node("authenticate_user", self.authenticate_user)
        self.graph.add_node("load_profile", self.load_job_seeker_profile)
        self.graph.add_node("validate_access", self.validate_job_seeker_access)
        self.graph.add_node("initialize_session", self.initialize_job_seeker_session)
        self.graph.add_node("setup_ai_context", self.setup_ai_context)
        self.graph.add_node("determine_next_action", self.determine_next_action)

        # Error handling
        self.graph.add_node("handle_auth_error", self.handle_authentication_error)

        # Define edges
        self.graph.add_edge("authenticate_user", "load_profile")
        self.graph.add_edge("load_profile", "validate_access")
        self.graph.add_edge("validate_access", "initialize_session")
        self.graph.add_edge("initialize_session", "setup_ai_context")
        self.graph.add_edge("setup_ai_context", "determine_next_action")
        self.graph.add_edge("determine_next_action", END)

        # Conditional routing for errors
        self.graph.add_conditional_edges(
            "authenticate_user",
            self._should_handle_auth_error,
            {"error": "handle_auth_error", "continue": "load_profile"},
        )

        self.graph.add_edge("handle_auth_error", END)
        self.graph.set_entry_point("authenticate_user")

    def _setup_chat_workflow(self):
        """Setup the chat interaction workflow"""
        # Chat nodes
        self.chat_graph.add_node("validate_auth", self.validate_chat_auth)
        self.chat_graph.add_node("analyze_intent", self.analyze_user_intent)
        self.chat_graph.add_node("prepare_ai_context", self.prepare_ai_context)
        self.chat_graph.add_node(
            "invoke_climate_supervisor", self.invoke_climate_supervisor
        )
        self.chat_graph.add_node("process_ai_response", self.process_ai_response)
        self.chat_graph.add_node("log_interaction", self.log_chat_interaction)
        self.chat_graph.add_node("format_response", self.format_chat_response)

        # Error handling
        self.chat_graph.add_node("handle_chat_error", self.handle_chat_error)

        # Define edges
        self.chat_graph.add_edge("validate_auth", "analyze_intent")
        self.chat_graph.add_edge("analyze_intent", "prepare_ai_context")
        self.chat_graph.add_edge("prepare_ai_context", "invoke_climate_supervisor")
        self.chat_graph.add_edge("invoke_climate_supervisor", "process_ai_response")
        self.chat_graph.add_edge("process_ai_response", "log_interaction")
        self.chat_graph.add_edge("log_interaction", "format_response")
        self.chat_graph.add_edge("format_response", END)

        # Error routing
        self.chat_graph.add_conditional_edges(
            "validate_auth",
            self._should_handle_chat_error,
            {"error": "handle_chat_error", "continue": "analyze_intent"},
        )

        self.chat_graph.add_edge("handle_chat_error", END)
        self.chat_graph.set_entry_point("validate_auth")

    def _setup_recommendation_workflow(self):
        """Setup the job recommendation workflow"""
        # Recommendation nodes
        self.recommendation_graph.add_node(
            "validate_auth", self.validate_recommendation_auth
        )
        self.recommendation_graph.add_node(
            "extract_preferences", self.extract_job_preferences
        )
        self.recommendation_graph.add_node("search_jobs", self.search_climate_jobs)
        self.recommendation_graph.add_node(
            "personalize_results", self.personalize_job_results
        )
        self.recommendation_graph.add_node(
            "format_recommendations", self.format_job_recommendations
        )

        # Define edges
        self.recommendation_graph.add_edge("validate_auth", "extract_preferences")
        self.recommendation_graph.add_edge("extract_preferences", "search_jobs")
        self.recommendation_graph.add_edge("search_jobs", "personalize_results")
        self.recommendation_graph.add_edge(
            "personalize_results", "format_recommendations"
        )
        self.recommendation_graph.add_edge("format_recommendations", END)

        self.recommendation_graph.set_entry_point("validate_auth")

    # =============================================================================
    # AUTHENTICATION WORKFLOW NODES
    # =============================================================================

    async def authenticate_user(self, state: JobSeekerAuthState) -> JobSeekerAuthState:
        """Authenticate user and validate token using existing auth system"""
        try:
            if not state.access_token:
                state.authentication_error = "Access token required"
                state.error = "Authentication failed: No token provided"
                return state

            # Verify token with Supabase
            if self.supabase:
                try:
                    # Get user from token
                    user_response = await asyncio.get_event_loop().run_in_executor(
                        None, lambda: self.supabase.auth.get_user(state.access_token)
                    )

                    if user_response.user:
                        state.user_id = user_response.user.id
                        state.is_authenticated = True
                        state.last_activity = datetime.now()
                    else:
                        state.authentication_error = "Invalid token"
                        state.error = "Authentication failed: Invalid token"

                except Exception as e:
                    state.authentication_error = f"Token verification failed: {str(e)}"
                    state.error = f"Authentication error: {str(e)}"
            else:
                state.authentication_error = "Database service unavailable"
                state.error = "Authentication failed: Service unavailable"

        except Exception as e:
            state.authentication_error = f"Authentication system error: {str(e)}"
            state.error = f"System error during authentication: {str(e)}"

        return state

    async def load_job_seeker_profile(
        self, state: JobSeekerAuthState
    ) -> JobSeekerAuthState:
        """Load user profile from existing profiles and job_seeker_profiles tables"""
        if not state.is_authenticated:
            return state

        try:
            # Load base profile from profiles table
            profile_response = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.supabase.table("profiles")
                .select("*")
                .eq("id", state.user_id)
                .execute(),
            )

            if profile_response.data:
                state.profile = profile_response.data[0]
            else:
                state.error = "User profile not found"
                return state

            # Load job seeker profile from job_seeker_profiles table
            job_seeker_response = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.supabase.table("job_seeker_profiles")
                .select("*")
                .eq("user_id", state.user_id)
                .execute(),
            )

            if job_seeker_response.data:
                job_seeker_data = job_seeker_response.data[0]
                state.job_seeker_profile = job_seeker_data

                # Extract key information for workflow from existing schema
                state.climate_interests = job_seeker_data.get("climate_interests", [])
                state.career_goals = job_seeker_data.get("desired_roles", [])
                state.job_preferences = {
                    "experience_level": job_seeker_data.get("experience_level"),
                    "preferred_locations": job_seeker_data.get(
                        "preferred_locations", []
                    ),
                    "remote_work_preference": job_seeker_data.get(
                        "remote_work_preference"
                    ),
                    "salary_range": {
                        "min": job_seeker_data.get("salary_range_min"),
                        "max": job_seeker_data.get("salary_range_max"),
                    },
                }
            else:
                state.warnings.append(
                    "Job seeker profile not found - user needs to complete profile"
                )

        except Exception as e:
            state.error = f"Error loading profile data: {str(e)}"

        return state

    async def validate_job_seeker_access(
        self, state: JobSeekerAuthState
    ) -> JobSeekerAuthState:
        """Validate that user has job seeker access using existing user_type field"""
        if not state.profile:
            state.error = "Profile not loaded"
            return state

        user_type = state.profile.get("user_type")
        if user_type != "job_seeker":
            state.error = f"Access denied. Job seeker role required, found: {user_type}"
            return state

        return state

    async def initialize_job_seeker_session(
        self, state: JobSeekerAuthState
    ) -> JobSeekerAuthState:
        """Initialize session using existing workflow_sessions table"""
        try:
            # Create or update session record in workflow_sessions table
            session_data = {
                "session_id": state.session_id,
                "user_id": state.user_id,
                "workflow_type": "job_seeker_auth",
                "status": "active",
                "data": {
                    "user_type": "job_seeker",
                    "started_at": state.last_activity.isoformat(),
                    "last_activity": state.last_activity.isoformat(),
                    "career_stage": state.career_stage,
                    "interaction_count": state.interaction_count,
                },
                "updated_at": state.last_activity.isoformat(),
            }

            # Log session start to workflow_sessions table
            if self.supabase:
                await asyncio.get_event_loop().run_in_executor(
                    None,
                    lambda: self.supabase.table("workflow_sessions")
                    .upsert(session_data)
                    .execute(),
                )

            # Determine career stage based on profile completeness
            if state.job_seeker_profile:
                profile_completeness = self._calculate_profile_completeness(
                    state.job_seeker_profile
                )
                if profile_completeness < 0.3:
                    state.career_stage = "discovery"
                elif profile_completeness < 0.7:
                    state.career_stage = "planning"
                else:
                    state.career_stage = "applying"

        except Exception as e:
            state.warnings.append(f"Session initialization warning: {str(e)}")

        return state

    async def setup_ai_context(self, state: JobSeekerAuthState) -> JobSeekerAuthState:
        """Setup AI context for Climate Supervisor integration"""
        try:
            # Initialize climate supervisor if not already done
            if not self.climate_supervisor:
                self.climate_supervisor = create_climate_supervisor_workflow()

            # Prepare context for AI interactions
            state.climate_agent_state = {
                "user_id": state.user_id,
                "user_profile": state.job_seeker_profile or {},
                "climate_goals": state.climate_interests,
                "career_stage": state.career_stage,
                "job_preferences": state.job_preferences,
                "session_id": state.session_id,
                "geographic_focus": (
                    state.job_seeker_profile.get(
                        "preferred_locations", ["Massachusetts"]
                    )[0]
                    if state.job_seeker_profile
                    else "Massachusetts"
                ),
            }

        except Exception as e:
            state.warnings.append(f"AI context setup warning: {str(e)}")

        return state

    async def determine_next_action(
        self, state: JobSeekerAuthState
    ) -> JobSeekerAuthState:
        """Determine next action based on user profile and career stage"""
        if state.error:
            return state

        # Increment interaction count
        state.interaction_count += 1

        # Determine next actions based on career stage and profile
        if state.career_stage == "discovery":
            state.next_actions = [
                "Complete skills assessment",
                "Explore climate career paths",
                "Set career goals",
            ]
        elif state.career_stage == "planning":
            state.next_actions = [
                "Get job recommendations",
                "Review resume",
                "Identify skill gaps",
            ]
        elif state.career_stage == "applying":
            state.next_actions = [
                "Find matching jobs",
                "Get application assistance",
                "Practice interviews",
            ]

        state.workflow_step = "ready"
        return state

    async def handle_authentication_error(
        self, state: JobSeekerAuthState
    ) -> JobSeekerAuthState:
        """Handle authentication errors using existing audit_logs table"""
        state.is_authenticated = False
        state.workflow_step = "error"

        # Log authentication failure to audit_logs table
        try:
            if self.supabase:
                audit_data = {
                    "user_id": state.user_id,
                    "table_name": "authentication",
                    "operation": "job_seeker_auth_failure",
                    "details": {
                        "error_type": "job_seeker_auth",
                        "error_message": state.authentication_error,
                        "session_id": state.session_id,
                        "workflow_type": "job_seeker_auth",
                    },
                    "created_at": datetime.now().isoformat(),
                }

                await asyncio.get_event_loop().run_in_executor(
                    None,
                    lambda: self.supabase.table("audit_logs")
                    .insert(audit_data)
                    .execute(),
                )
        except Exception as e:
            state.warnings.append(f"Failed to log auth error: {str(e)}")

        return state

    # =============================================================================
    # CHAT WORKFLOW NODES
    # =============================================================================

    async def validate_chat_auth(self, state: JobSeekerChatState) -> JobSeekerChatState:
        """Validate authentication for chat"""
        if not state.auth_state.is_authenticated:
            state.error = "Authentication required for chat"
            return state

        if (
            state.auth_state.profile
            and state.auth_state.profile.get("user_type") != "job_seeker"
        ):
            state.error = "Job seeker access required for chat"
            return state

        return state

    async def analyze_user_intent(
        self, state: JobSeekerChatState
    ) -> JobSeekerChatState:
        """Analyze user intent from message"""
        message_lower = state.message.lower()

        # Intent classification keywords
        job_search_keywords = [
            "job",
            "jobs",
            "find work",
            "opportunities",
            "positions",
            "openings",
            "hiring",
            "career opportunities",
        ]
        career_advice_keywords = [
            "career",
            "advice",
            "skills",
            "growth",
            "development",
            "interview",
            "resume",
            "transition",
        ]
        application_keywords = [
            "apply",
            "application",
            "cover letter",
            "portfolio",
            "submit",
            "interview prep",
        ]
        climate_keywords = [
            "climate",
            "environment",
            "sustainability",
            "green",
            "renewable",
            "clean energy",
        ]
        skills_keywords = [
            "skills",
            "training",
            "certification",
            "education",
            "learn",
            "course",
        ]

        # Calculate intent scores
        intent_scores = {
            "job_search": sum(
                1 for keyword in job_search_keywords if keyword in message_lower
            ),
            "career_advice": sum(
                1 for keyword in career_advice_keywords if keyword in message_lower
            ),
            "application_help": sum(
                1 for keyword in application_keywords if keyword in message_lower
            ),
            "climate_focus": sum(
                1 for keyword in climate_keywords if keyword in message_lower
            ),
            "skills_development": sum(
                1 for keyword in skills_keywords if keyword in message_lower
            ),
        }

        # Determine primary intent
        primary_intent = (
            max(intent_scores, key=intent_scores.get)
            if max(intent_scores.values()) > 0
            else "general"
        )

        state.context["intent_analysis"] = {
            "primary_intent": primary_intent,
            "intent_scores": intent_scores,
            "confidence": (
                max(intent_scores.values()) / len(message_lower.split())
                if message_lower.split()
                else 0
            ),
        }

        return state

    async def prepare_ai_context(self, state: JobSeekerChatState) -> JobSeekerChatState:
        """Prepare context for AI interaction"""
        # Add conversation context
        state.context.update(
            {
                "user_profile": state.auth_state.job_seeker_profile,
                "career_stage": state.auth_state.career_stage,
                "climate_interests": state.auth_state.climate_interests,
                "job_preferences": state.auth_state.job_preferences,
                "session_history": state.auth_state.conversation_history[
                    -5:
                ],  # Last 5 interactions
                "user_id": state.auth_state.user_id,
                "conversation_id": state.conversation_id,
            }
        )

        return state

    async def invoke_climate_supervisor(
        self, state: JobSeekerChatState
    ) -> JobSeekerChatState:
        """Invoke the Climate Supervisor AI workflow"""
        try:
            if not self.climate_supervisor:
                self.climate_supervisor = create_climate_supervisor_workflow()

            # Create ClimateAgentState from our job seeker context
            climate_state = ClimateAgentState(
                messages=[HumanMessage(content=state.message)],
                user_id=state.auth_state.user_id,
                conversation_id=state.conversation_id,
                user_profile=state.context.get("user_profile"),
                climate_goals=state.auth_state.climate_interests,
                user_journey_stage=state.auth_state.career_stage,
                user_preferences=state.context.get("job_preferences"),
                geographic_focus="Massachusetts",  # Default for our platform
                workflow_state="active",
                ready_for_specialist=True,
            )

            # Execute the supervisor workflow
            result = await self.climate_supervisor.ainvoke(climate_state)

            # Extract results
            if result and hasattr(result, "messages") and result.messages:
                last_message = result.messages[-1]
                if hasattr(last_message, "content"):
                    state.response = last_message.content
                else:
                    state.response = str(last_message)
            else:
                state.response = "I'm here to help with your climate career journey!"

            # Extract specialist and tools information
            if (
                hasattr(result, "current_specialist_history")
                and result.current_specialist_history
            ):
                state.specialist_used = result.current_specialist_history[-1]

            if hasattr(result, "tools_used"):
                state.tools_used = result.tools_used or []

            # Calculate confidence score
            state.confidence_score = getattr(result, "confidence_score", 0.8)

        except Exception as e:
            state.error = f"AI processing error: {str(e)}"
            state.response = "I'm sorry, I'm having trouble processing your request right now. Please try again."

        return state

    async def process_ai_response(
        self, state: JobSeekerChatState
    ) -> JobSeekerChatState:
        """Process and enhance AI response"""
        if state.error:
            return state

        # Add job seeker specific enhancements
        if state.specialist_used:
            state.auth_state.specialist_history.append(state.specialist_used)
            state.auth_state.current_specialist = state.specialist_used

        if state.tools_used:
            state.auth_state.tools_used.extend(state.tools_used)

        # Update conversation history
        interaction = {
            "timestamp": datetime.now().isoformat(),
            "user_message": state.message,
            "ai_response": state.response,
            "specialist": state.specialist_used,
            "intent": state.context.get("intent_analysis", {}).get("primary_intent"),
            "confidence": state.confidence_score,
        }

        state.auth_state.conversation_history.append(interaction)

        return state

    async def log_chat_interaction(
        self, state: JobSeekerChatState
    ) -> JobSeekerChatState:
        """Log chat interaction using existing conversation_analytics table"""
        try:
            if self.supabase:
                # Log to conversation_analytics table
                analytics_data = {
                    "conversation_id": state.conversation_id,
                    "user_id": state.auth_state.user_id,
                    "messages_sent": 1,
                    "messages_received": 1,
                    "session_duration_seconds": (
                        datetime.now() - state.auth_state.last_activity
                    ).total_seconds(),
                    "topics_discussed": [
                        state.context.get("intent_analysis", {}).get(
                            "primary_intent", "general"
                        )
                    ],
                    "total_tokens_consumed": len(state.message.split())
                    + len(state.response.split()),
                    "analyzed_at": datetime.now().isoformat(),
                    "created_at": datetime.now().isoformat(),
                }

                await asyncio.get_event_loop().run_in_executor(
                    None,
                    lambda: self.supabase.table("conversation_analytics")
                    .insert(analytics_data)
                    .execute(),
                )

                # Also log individual message to conversation_messages table
                message_data = {
                    "id": f"msg_{uuid.uuid4()}",
                    "conversation_id": state.conversation_id,
                    "role": "user",
                    "content": state.message,
                    "specialist_type": state.specialist_used,
                    "metadata": {
                        "intent_analysis": state.context.get("intent_analysis"),
                        "confidence_score": state.confidence_score,
                        "tools_used": state.tools_used,
                    },
                    "created_at": datetime.now().isoformat(),
                }

                await asyncio.get_event_loop().run_in_executor(
                    None,
                    lambda: self.supabase.table("conversation_messages")
                    .insert(message_data)
                    .execute(),
                )

        except Exception as e:
            state.auth_state.warnings.append(f"Logging warning: {str(e)}")

        return state

    async def format_chat_response(
        self, state: JobSeekerChatState
    ) -> JobSeekerChatState:
        """Format the final chat response"""
        if state.error:
            state.workflow_state = "error"
        else:
            state.workflow_state = "completed"

        # Update auth state
        state.auth_state.last_activity = datetime.now()
        state.auth_state.interaction_count += 1

        return state

    async def handle_chat_error(self, state: JobSeekerChatState) -> JobSeekerChatState:
        """Handle chat errors"""
        state.workflow_state = "error"
        state.response = "I'm sorry, I encountered an error while processing your message. Please try again."

        return state

    # =============================================================================
    # JOB RECOMMENDATION WORKFLOW NODES
    # =============================================================================

    async def validate_recommendation_auth(
        self, state: JobRecommendationState
    ) -> JobRecommendationState:
        """Validate authentication for recommendations"""
        if not state.auth_state.is_authenticated:
            state.error = "Authentication required"
            return state

        if (
            state.auth_state.profile
            and state.auth_state.profile.get("user_type") != "job_seeker"
        ):
            state.error = "Job seeker access required"
            return state

        return state

    async def extract_job_preferences(
        self, state: JobRecommendationState
    ) -> JobRecommendationState:
        """Extract job preferences from existing job_seeker_profiles table"""
        if state.auth_state.job_seeker_profile:
            profile = state.auth_state.job_seeker_profile

            # Extract skills from existing schema
            skills = profile.get("skills", [])
            if isinstance(skills, str):
                import json

                try:
                    skills = json.loads(skills)
                except:
                    skills = [skills]
            state.skills_filter = skills or []

            # Extract other preferences from existing schema
            state.location_filter = profile.get("location") or (
                profile.get("preferred_locations", [None])[0]
                if profile.get("preferred_locations")
                else None
            )
            state.experience_level = profile.get("experience_level")

            # Extract climate interests from existing schema
            climate_interests = profile.get("climate_interests", [])
            if isinstance(climate_interests, str):
                try:
                    climate_interests = json.loads(climate_interests)
                except:
                    climate_interests = [climate_interests]
            state.climate_focus = climate_interests or []

        return state

    async def search_climate_jobs(
        self, state: JobRecommendationState
    ) -> JobRecommendationState:
        """Search for climate-related jobs using existing job_listings table"""
        try:
            if self.supabase:
                # Build query using existing job_listings table
                query = (
                    self.supabase.table("job_listings")
                    .select("*")
                    .eq("is_active", True)
                )

                # Apply filters based on existing schema
                if state.experience_level:
                    query = query.eq("experience_level", state.experience_level)

                if state.location_filter:
                    query = query.ilike("location", f"%{state.location_filter}%")

                # Execute query
                response = await asyncio.get_event_loop().run_in_executor(
                    None, lambda: query.limit(20).execute()
                )

                if response.data:
                    state.recommendations = response.data
                    state.total_matches = len(response.data)
                else:
                    state.recommendations = []
                    state.total_matches = 0

        except Exception as e:
            state.error = f"Job search error: {str(e)}"

        return state

    async def personalize_job_results(
        self, state: JobRecommendationState
    ) -> JobRecommendationState:
        """Personalize job results based on user profile using existing job_listings schema"""
        if not state.recommendations:
            return state

        # Calculate personalization scores based on existing schema
        for job in state.recommendations:
            score = 0.0

            # Skills matching using existing skills_required field
            job_skills = job.get("skills_required", [])
            if job_skills and state.skills_filter:
                skill_matches = len(set(job_skills) & set(state.skills_filter))
                score += (skill_matches / len(job_skills)) * 0.4

            # Climate focus matching using existing climate_focus field
            job_climate_focus = job.get("climate_focus", [])
            if job_climate_focus and state.climate_focus:
                climate_matches = len(set(job_climate_focus) & set(state.climate_focus))
                score += (climate_matches / len(job_climate_focus)) * 0.3

            # Location matching using existing location field
            if state.location_filter and job.get("location"):
                if state.location_filter.lower() in job["location"].lower():
                    score += 0.2

            # Experience level matching using existing experience_level field
            if (
                state.experience_level
                and job.get("experience_level") == state.experience_level
            ):
                score += 0.1

            job["personalization_score"] = score

        # Sort by personalization score
        state.recommendations.sort(
            key=lambda x: x.get("personalization_score", 0), reverse=True
        )

        # Calculate overall personalization score
        if state.recommendations:
            state.personalization_score = sum(
                job.get("personalization_score", 0) for job in state.recommendations
            ) / len(state.recommendations)

        return state

    async def format_job_recommendations(
        self, state: JobRecommendationState
    ) -> JobRecommendationState:
        """Format job recommendations for response"""
        # Add metadata and formatting
        for job in state.recommendations:
            job["match_percentage"] = (
                f"{job.get('personalization_score', 0) * 100:.0f}%"
            )
            job["recommended_at"] = state.search_timestamp.isoformat()

        return state

    # =============================================================================
    # UTILITY METHODS
    # =============================================================================

    def _should_handle_auth_error(
        self, state: JobSeekerAuthState
    ) -> Literal["error", "continue"]:
        """Determine if authentication error should be handled"""
        return "error" if state.authentication_error else "continue"

    def _should_handle_chat_error(
        self, state: JobSeekerChatState
    ) -> Literal["error", "continue"]:
        """Determine if chat error should be handled"""
        return (
            "error"
            if state.error or not state.auth_state.is_authenticated
            else "continue"
        )

    def _calculate_profile_completeness(self, profile: Dict[str, Any]) -> float:
        """Calculate profile completeness score based on existing schema"""
        required_fields = [
            "full_name",
            "email",
            "experience_level",
            "desired_roles",
            "climate_interests",
            "preferred_locations",
        ]

        completed = sum(1 for field in required_fields if profile.get(field))
        return completed / len(required_fields)

    # =============================================================================
    # PUBLIC WORKFLOW EXECUTION METHODS
    # =============================================================================

    async def authenticate_job_seeker(
        self, user_id: str, access_token: str
    ) -> JobSeekerAuthState:
        """Execute the authentication workflow"""
        auth_graph = self.graph.compile()

        initial_state = JobSeekerAuthState(user_id=user_id, access_token=access_token)

        result = await auth_graph.ainvoke(initial_state)
        return result

    async def handle_chat_interaction(
        self, auth_state: JobSeekerAuthState, message: str, conversation_id: str
    ) -> JobSeekerChatState:
        """Execute the chat workflow"""
        chat_graph = self.chat_graph.compile()

        initial_state = JobSeekerChatState(
            auth_state=auth_state, message=message, conversation_id=conversation_id
        )

        result = await chat_graph.ainvoke(initial_state)
        return result

    async def get_job_recommendations(
        self, auth_state: JobSeekerAuthState
    ) -> JobRecommendationState:
        """Execute the job recommendation workflow"""
        recommendation_graph = self.recommendation_graph.compile()

        initial_state = JobRecommendationState(auth_state=auth_state)

        result = await recommendation_graph.ainvoke(initial_state)
        return result


# =============================================================================
# WORKFLOW FACTORY AND INTEGRATION
# =============================================================================

# Global workflow instance
_job_seeker_workflow = None


def get_job_seeker_workflow() -> JobSeekerAuthWorkflow:
    """Get or create the job seeker workflow instance"""
    global _job_seeker_workflow
    if _job_seeker_workflow is None:
        _job_seeker_workflow = JobSeekerAuthWorkflow()
    return _job_seeker_workflow


# Convenience functions for integration with FastAPI
async def run_job_seeker_chat_workflow(
    user_id: str, access_token: str, message: str, conversation_id: str
) -> Dict[str, Any]:
    """Run the complete job seeker chat workflow using existing database schema"""
    try:
        workflow = get_job_seeker_workflow()

        # Authenticate user
        auth_result = await workflow.authenticate_job_seeker(user_id, access_token)

        if auth_result.error:
            return {"error": auth_result.error, "workflow": "authentication"}

        # Handle chat interaction
        chat_result = await workflow.handle_chat_interaction(
            auth_result, message, conversation_id
        )

        if chat_result.error:
            return {"error": chat_result.error, "workflow": "chat"}

        return {
            "success": True,
            "response": chat_result.response,
            "specialist": chat_result.specialist_used,
            "tools_used": chat_result.tools_used,
            "confidence_score": chat_result.confidence_score,
            "conversation_id": conversation_id,
            "career_stage": auth_result.career_stage,
            "next_actions": auth_result.next_actions,
            "interaction_count": auth_result.interaction_count,
        }

    except Exception as e:
        return {"error": f"Workflow execution error: {str(e)}", "workflow": "system"}


async def run_job_recommendation_workflow(
    user_id: str, access_token: str
) -> Dict[str, Any]:
    """Run the job recommendation workflow using existing database schema"""
    try:
        workflow = get_job_seeker_workflow()

        # Authenticate user
        auth_result = await workflow.authenticate_job_seeker(user_id, access_token)

        if auth_result.error:
            return {"error": auth_result.error}

        # Get recommendations
        recommendation_result = await workflow.get_job_recommendations(auth_result)

        if recommendation_result.error:
            return {"error": recommendation_result.error}

        return {
            "success": True,
            "recommendations": recommendation_result.recommendations,
            "total_matches": recommendation_result.total_matches,
            "personalization_score": recommendation_result.personalization_score,
            "user_preferences": {
                "skills": recommendation_result.skills_filter,
                "location": recommendation_result.location_filter,
                "experience_level": recommendation_result.experience_level,
                "climate_focus": recommendation_result.climate_focus,
            },
        }

    except Exception as e:
        return {"error": f"Workflow execution error: {str(e)}"}
