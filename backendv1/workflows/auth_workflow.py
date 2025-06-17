"""
Auth Workflow - Authentication and Authorization Workflow with Memory & Context Injection

Following rule #12: Complete code verification with proper workflow design
Following rule #15: Include comprehensive error handling

This module handles authentication and authorization workflows with integrated
memory management and context injection for enhanced AI agent performance.

Updated to match the actual database schema with profiles, job_seeker_profiles,
partner_profiles, and admin_profiles tables, plus memory and context capabilities.

Location: backendv1/workflows/auth_workflow.py
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import jwt
import bcrypt
import uuid
import json

from backendv1.utils.logger import setup_logger
from backendv1.config.settings import get_settings
from backendv1.adapters.supabase_adapter import SupabaseAdapter

logger = setup_logger("auth_workflow")
settings = get_settings()


class MemoryManager:
    """
    Memory manager for storing and retrieving user context and conversation history
    Integrated with the auth workflow for enhanced AI agent performance
    """

    def __init__(self, supabase: SupabaseAdapter):
        self.supabase = supabase

    async def extract_and_store_user_context(
        self, user_id: str, context_data: Dict[str, Any]
    ) -> bool:
        """
        Extract and store important user context for future AI interactions
        Uses the conversations table with session_metadata for context storage

        Args:
            user_id: User identifier
            context_data: Context data to store (preferences, goals, history, etc.)

        Returns:
            bool: Success status
        """
        try:
            # Store in conversations table with session_metadata for persistent context
            conversation_record = {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "title": "User Context Session",
                "description": "AI agent context and memory storage",
                "conversation_type": "context_storage",
                "status": "active",
                "session_metadata": {
                    "context_type": "user_profile_context",
                    "extracted_at": datetime.utcnow().isoformat(),
                    "context_data": context_data,
                },
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat(),
                "last_activity": datetime.utcnow().isoformat(),
            }

            result = await self.supabase.insert("conversations", conversation_record)
            return result.get("success", False)

        except Exception as e:
            logger.error(f"Error storing user context: {e}")
            return False

    async def get_relevant_user_context(
        self, user_id: str, query_context: str = ""
    ) -> Dict[str, Any]:
        """
        Retrieve relevant user context for AI agent interactions

        Args:
            user_id: User identifier
            query_context: Current query context for relevance matching

        Returns:
            Dict with relevant user context
        """
        try:
            # Get user context from conversations table
            result = await self.supabase.query(
                table="conversations",
                filters={"user_id": user_id, "conversation_type": "context_storage"},
                select="session_metadata, created_at",
            )

            if result.get("success") and result.get("data"):
                contexts = []
                for record in result["data"]:
                    metadata = record.get("session_metadata", {})
                    if metadata.get("context_type") == "user_profile_context":
                        contexts.append(metadata.get("context_data", {}))

                return {
                    "user_contexts": contexts,
                    "context_count": len(contexts),
                    "last_updated": result["data"][0].get("created_at") if result["data"] else None,
                }

            return {"user_contexts": [], "context_count": 0, "last_updated": None}

        except Exception as e:
            logger.error(f"Error retrieving user context: {e}")
            return {"user_contexts": [], "context_count": 0, "last_updated": None}

    async def format_context_for_ai_prompt(self, user_context: Dict[str, Any]) -> str:
        """
        Format user context for AI agent prompt injection

        Args:
            user_context: User context data

        Returns:
            str: Formatted context for AI prompt
        """
        if not user_context.get("user_contexts"):
            return ""

        context_lines = []
        for ctx in user_context["user_contexts"]:
            if ctx.get("career_goals"):
                context_lines.append(f"- Career Goals: {', '.join(ctx['career_goals'])}")
            if ctx.get("climate_interests"):
                context_lines.append(f"- Climate Interests: {', '.join(ctx['climate_interests'])}")
            if ctx.get("experience_level"):
                context_lines.append(f"- Experience Level: {ctx['experience_level']}")
            if ctx.get("preferred_locations"):
                context_lines.append(
                    f"- Preferred Locations: {', '.join(ctx['preferred_locations'])}"
                )
            if ctx.get("skills"):
                context_lines.append(f"- Skills: {', '.join(ctx['skills'])}")

        if context_lines:
            return f"User Context:\n" + "\n".join(context_lines)
        return ""


class ContextInjector:
    """
    Context injector for enhancing AI agent sessions with user-specific information
    """

    def __init__(self, supabase: SupabaseAdapter):
        self.supabase = supabase
        self.memory_manager = MemoryManager(supabase)

    async def inject_user_profile_context(
        self, user_id: str, user_type: str, profile_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Inject user profile context into session for AI agent enhancement

        Args:
            user_id: User identifier
            user_type: Type of user (job_seeker, partner, admin)
            profile_data: User profile data

        Returns:
            Dict with injected context
        """
        try:
            context = {
                "user_id": user_id,
                "user_type": user_type,
                "profile_context": {},
                "ai_context": {},
                "session_enhancements": {},
            }

            # Extract context based on user type
            if user_type == "job_seeker":
                context["profile_context"] = await self._extract_job_seeker_context(profile_data)
            elif user_type == "partner":
                context["profile_context"] = await self._extract_partner_context(profile_data)
            elif user_type == "admin":
                context["profile_context"] = await self._extract_admin_context(profile_data)

            # Get user preferences for AI customization
            preferences = await self._get_user_preferences(user_id)
            context["ai_context"] = {
                "communication_style": preferences.get("communication_style", "professional"),
                "expertise_level": preferences.get("expertise_level", "intermediate"),
                "climate_focus_areas": preferences.get("climate_focus", []),
                "preferred_interaction_mode": preferences.get("interaction_mode", "conversational"),
            }

            # Session enhancements for AI agents
            context["session_enhancements"] = {
                "memory_enabled": True,
                "context_aware": True,
                "personalization_level": "high",
                "adaptive_responses": True,
                "goal_tracking": True,
            }

            # Store context for future retrieval
            await self.memory_manager.extract_and_store_user_context(user_id, context)

            return context

        except Exception as e:
            logger.error(f"Error injecting user context: {e}")
            return {"user_id": user_id, "user_type": user_type, "error": str(e)}

    async def _extract_job_seeker_context(self, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        """Extract context specific to job seekers"""
        specific_profile = profile_data.get("specific_profile", {})
        return {
            "career_stage": "job_seeking",
            "experience_level": specific_profile.get("experience_level", "entry"),
            "desired_roles": specific_profile.get("desired_roles", []),
            "climate_interests": specific_profile.get("climate_focus_areas", []),
            "preferred_locations": specific_profile.get("preferred_locations", []),
            "remote_preference": specific_profile.get("remote_work_preference", "hybrid"),
            "salary_range": {
                "min": specific_profile.get("salary_range_min"),
                "max": specific_profile.get("salary_range_max"),
            },
            "profile_completion": specific_profile.get("profile_completed", False),
        }

    async def _extract_partner_context(self, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        """Extract context specific to partners"""
        specific_profile = profile_data.get("specific_profile", {})
        return {
            "organization_type": specific_profile.get("organization_type", "unknown"),
            "organization_size": specific_profile.get("organization_size", "unknown"),
            "climate_focus": specific_profile.get("climate_focus", []),
            "hiring_status": specific_profile.get("hiring_actively", False),
            "services_offered": specific_profile.get("services_offered", []),
            "partnership_level": specific_profile.get("partnership_level", "standard"),
            "verified_status": specific_profile.get("verified", False),
        }

    async def _extract_admin_context(self, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        """Extract context specific to admins"""
        specific_profile = profile_data.get("specific_profile", {})
        return {
            "admin_level": "system_admin",
            "permissions": {
                "manage_users": specific_profile.get("can_manage_users", False),
                "manage_partners": specific_profile.get("can_manage_partners", False),
                "manage_content": specific_profile.get("can_manage_content", False),
                "manage_system": specific_profile.get("can_manage_system", False),
                "view_analytics": specific_profile.get("can_view_analytics", False),
            },
            "department": specific_profile.get("department", "general"),
            "admin_actions_count": specific_profile.get("total_admin_actions", 0),
        }

    async def _get_user_preferences(self, user_id: str) -> Dict[str, Any]:
        """Get user preferences from user_interests table"""
        try:
            result = await self.supabase.query(table="user_interests", filters={"user_id": user_id})

            if result.get("success") and result.get("data"):
                prefs = result["data"][0]
                return {
                    "climate_focus": prefs.get("climate_focus", []),
                    "communication_style": "professional",  # Default
                    "expertise_level": "intermediate",  # Default
                    "interaction_mode": "conversational",  # Default
                    "language_preference": prefs.get("language_preference", "en"),
                    "theme_preference": prefs.get("theme_preference", "system"),
                }

            return {}

        except Exception as e:
            logger.error(f"Error getting user preferences: {e}")
            return {}


class AuthWorkflow:
    """
    Authentication and authorization workflow with memory and context injection

    Updated to work with already-authenticated users and enhanced with:
    - Memory management for user context
    - Context injection for AI agent enhancement
    - Session state management with user-specific data
    - Adaptive AI agent configuration based on user profile

    Following rule #12: Complete code verification with proper typing
    """

    def __init__(self):
        """Initialize auth workflow with memory and context capabilities"""
        self.supabase = SupabaseAdapter()
        # Use SUPABASE_JWT_SECRET or fallback to SECRET_KEY
        self.jwt_secret = settings.SUPABASE_JWT_SECRET or settings.SECRET_KEY
        self.jwt_algorithm = "HS256"
        self.jwt_expiration = 24  # hours
        self.memory_manager = MemoryManager(self.supabase)
        self.context_injector = ContextInjector(self.supabase)
        logger.info("🔐 Enhanced Auth workflow initialized with memory and context injection")

    async def enhance_authenticated_user_session(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Enhance already-authenticated user session with context injection and memory management

        This method assumes the user is already authenticated via frontend/Supabase Auth.
        It focuses on injecting context and setting up AI agent enhancements.

        Args:
            user_data: Already authenticated user data (user_id, email, access_token, etc.)

        Returns:
            Dict[str, Any]: Enhanced session with context injection and AI capabilities
        """
        try:
            user_id = user_data.get("user_id")
            email = user_data.get("email", "").lower()
            access_token = user_data.get("access_token")

            if not user_id:
                logger.warning("🔐 Missing user_id in authenticated user data")
                return {"enhanced": False, "error": "Missing user_id"}

            # Get user profile and determine user type
            profile_data = await self._get_user_profile(user_id)

            if not profile_data:
                logger.warning(f"🔐 No profile found for user: {user_id}")
                return {"enhanced": False, "error": "User profile not found"}

            user_type = profile_data.get("user_type", "job_seeker")

            # Inject user context for AI agent enhancement
            injected_context = await self.context_injector.inject_user_profile_context(
                user_id, user_type, profile_data
            )

            # Generate enhanced session token with context
            enhanced_token = await self.generate_token(
                {
                    "user_id": user_id,
                    "email": email,
                    "user_type": user_type,
                    "profile_data": profile_data,
                    "injected_context": injected_context,
                    "original_access_token": access_token,
                }
            )

            # Create enhanced workflow session with context
            session_id = str(uuid.uuid4())
            session_created = await self._create_enhanced_workflow_session(
                user_id, session_id, user_type, injected_context
            )

            logger.info(
                f"🔐 User session enhanced with context injection: {user_id} (type: {user_type})"
            )
            return {
                "enhanced": True,
                "user_id": user_id,
                "user_type": user_type,
                "enhanced_token": enhanced_token,
                "original_access_token": access_token,
                "session_id": session_id if session_created else None,
                "profile": profile_data,
                "injected_context": injected_context,
                "ai_enhancements": {
                    "memory_enabled": True,
                    "context_aware": True,
                    "personalized": True,
                    "adaptive_responses": True,
                    "goal_tracking": True,
                },
                "session_capabilities": {
                    "context_injection": True,
                    "memory_retrieval": True,
                    "preference_adaptation": True,
                    "conversation_continuity": True,
                },
            }

        except Exception as e:
            logger.error(f"Session enhancement error: {e}")
            return {"enhanced": False, "error": str(e)}

    async def get_session_context_for_ai(
        self, user_id: str, conversation_context: str = ""
    ) -> Dict[str, Any]:
        """
        Get enhanced session context for AI agent interactions

        Args:
            user_id: User identifier
            conversation_context: Current conversation context

        Returns:
            Dict with formatted context for AI agents
        """
        try:
            # Get stored user context
            user_context = await self.memory_manager.get_relevant_user_context(
                user_id, conversation_context
            )

            # Format for AI prompt injection
            formatted_context = await self.memory_manager.format_context_for_ai_prompt(user_context)

            # Get current session data from workflow_sessions
            session_result = await self.supabase.query(
                table="workflow_sessions", filters={"user_id": user_id, "status": "active"}
            )

            session_data = {}
            if session_result.get("success") and session_result.get("data"):
                session_data = session_result["data"][0].get("data", {})

            return {
                "user_id": user_id,
                "formatted_context": formatted_context,
                "session_enhancements": session_data.get("ai_enhancements", {}),
                "memory_context": user_context,
                "context_timestamp": datetime.utcnow().isoformat(),
                "ready_for_ai": True,
            }

        except Exception as e:
            logger.error(f"Error getting session context for AI: {e}")
            return {"user_id": user_id, "ready_for_ai": False, "error": str(e)}

    async def _get_user_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Get user profile data from the appropriate table based on user type

        Args:
            user_id: User UUID

        Returns:
            Dict with profile data including user_type, or None if not found
        """
        try:
            # First check the main profiles table
            profile_result = await self.supabase.query(table="profiles", filters={"id": user_id})

            if profile_result.get("success") and profile_result.get("data"):
                main_profile = profile_result["data"][0]
                user_type = main_profile.get("user_type", "job_seeker")

                # Get specific profile data based on user type
                specific_profile = None

                if user_type == "admin":
                    admin_result = await self.supabase.query(
                        table="admin_profiles", filters={"user_id": user_id}
                    )
                    if admin_result.get("success") and admin_result.get("data"):
                        specific_profile = admin_result["data"][0]

                elif user_type == "partner":
                    partner_result = await self.supabase.query(
                        table="partner_profiles", filters={"id": user_id}
                    )
                    if partner_result.get("success") and partner_result.get("data"):
                        specific_profile = partner_result["data"][0]

                elif user_type == "job_seeker":
                    jobseeker_result = await self.supabase.query(
                        table="job_seeker_profiles", filters={"user_id": user_id}
                    )
                    if jobseeker_result.get("success") and jobseeker_result.get("data"):
                        specific_profile = jobseeker_result["data"][0]

                # Combine main profile with specific profile data
                combined_profile = {**main_profile, "specific_profile": specific_profile}

                return combined_profile

            return None

        except Exception as e:
            logger.error(f"Error getting user profile: {e}")
            return None

    async def generate_token(self, user_data: Dict[str, Any]) -> str:
        """Generate JWT token with profile data and context"""
        try:
            # Set expiration time
            expiration = datetime.utcnow() + timedelta(hours=self.jwt_expiration)

            # Create token payload with profile information and context
            payload = {
                "user_id": user_data.get("user_id"),
                "email": user_data.get("email"),
                "user_type": user_data.get("user_type", "job_seeker"),
                "profile_data": user_data.get("profile_data", {}),
                "injected_context": user_data.get("injected_context", {}),
                "exp": expiration.timestamp(),
                "iat": datetime.utcnow().timestamp(),
                "aud": "authenticated",
            }

            # Generate token
            token = jwt.encode(payload, self.jwt_secret, algorithm=self.jwt_algorithm)

            return token

        except Exception as e:
            logger.error(f"Token generation error: {e}")
            raise

    async def _create_enhanced_workflow_session(
        self, user_id: str, session_id: str, workflow_type: str, injected_context: Dict[str, Any]
    ) -> bool:
        """Create enhanced workflow session with injected context"""
        try:
            # Store session in workflow_sessions table with enhanced context
            result = await self.supabase.insert(
                table="workflow_sessions",
                data={
                    "session_id": session_id,
                    "user_id": user_id,
                    "workflow_type": workflow_type,
                    "status": "active",
                    "data": {
                        "created_at": datetime.utcnow().isoformat(),
                        "expires_at": (
                            datetime.utcnow() + timedelta(hours=self.jwt_expiration)
                        ).isoformat(),
                        "auth_method": "supabase_auth_with_context",
                        "injected_context": injected_context,
                        "ai_enhancements": {
                            "memory_enabled": True,
                            "context_aware": True,
                            "personalization_active": True,
                            "adaptive_responses": True,
                        },
                        "session_capabilities": {
                            "context_injection": True,
                            "memory_retrieval": True,
                            "goal_tracking": True,
                            "preference_adaptation": True,
                        },
                    },
                    "updated_at": datetime.utcnow().isoformat(),
                },
            )

            return result.get("success", False)

        except Exception as e:
            logger.error(f"Enhanced workflow session creation error: {e}")
            return False


# Export main class
__all__ = ["AuthWorkflow"]
