"""
Tools for analytics and logging in the Climate Economy Assistant.

This module provides functionality for logging user interactions and
generating analytics data for the application.
"""

import json
import logging
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("cea_analytics")

# George Nekwaya's credentials for testing
GEORGE_NEKWAYA_USER_ID = "george_nekwaya_jobseeker"
GEORGE_NEKWAYA_EMAIL = "george.n.p.nekwaya@gmail.com"


async def log_specialist_interaction(
    user_id: str,
    conversation_id: str,
    specialist_type: str,
    tools_used: List[str],
    query: str,
    confidence: float = 0.0,
) -> None:
    """
    Log a specialist interaction for analytics purposes.

    Args:
        user_id: User ID
        conversation_id: Conversation ID
        specialist_type: Type of specialist (veteran, international, etc.)
        tools_used: List of tools used in the interaction
        query: User query that triggered the specialist
        confidence: Confidence score for the specialist selection

    Returns:
        None
    """
    # This is a placeholder implementation
    # In a real implementation, this would log to a database or analytics service

    interaction_id = str(uuid.uuid4())
    timestamp = datetime.now().isoformat()

    interaction_data = {
        "interaction_id": interaction_id,
        "user_id": user_id,
        "conversation_id": conversation_id,
        "specialist_type": specialist_type,
        "tools_used": tools_used,
        "query": query,
        "confidence": confidence,
        "timestamp": timestamp,
    }

    # Log to console for now
    logger.info(f"Specialist interaction: {json.dumps(interaction_data)}")

    # In a real implementation, you would store this in a database
    # E.g.: await db.interactions.insert_one(interaction_data)


async def log_conversation_analytics(
    user_id: str, conversation_id: str, analytics_data: Dict[str, Any]
) -> None:
    """
    Log comprehensive conversation analytics to align with ConversationAnalytics model.

    Args:
        user_id: User ID
        conversation_id: Conversation ID
        analytics_data: Dictionary of analytics data

    Returns:
        None
    """
    timestamp = datetime.now().isoformat()

    # Ensure analytics data has the required fields
    analytics_record = {
        "id": str(uuid.uuid4()),
        "conversation_id": conversation_id,
        "user_id": user_id,
        "messages_sent": analytics_data.get("messages_sent", 0),
        "messages_received": analytics_data.get("messages_received", 0),
        "session_duration_seconds": analytics_data.get("session_duration_seconds", 0),
        "topics_discussed": analytics_data.get("topics_discussed", []),
        "resources_accessed": analytics_data.get("resources_accessed", []),
        "jobs_viewed": analytics_data.get("jobs_viewed", []),
        "partners_contacted": analytics_data.get("partners_contacted", []),
        "conversation_outcome": analytics_data.get("conversation_outcome"),
        "goals_achieved": analytics_data.get("goals_achieved"),
        "user_satisfaction_score": analytics_data.get("user_satisfaction_score"),
        "follow_up_actions_taken": analytics_data.get("follow_up_actions_taken", 0),
        "next_steps": analytics_data.get("next_steps", []),
        "total_tokens_consumed": analytics_data.get("total_tokens_consumed", 0),
        "average_response_time_ms": analytics_data.get("average_response_time_ms"),
        "created_at": timestamp,
        "analyzed_at": timestamp,
    }

    # Log to console for now
    logger.info(f"Conversation analytics: {json.dumps(analytics_record)}")

    # In a real implementation, you would store this in a database
    # E.g.: await supabase.table("conversation_analytics").upsert(analytics_record).execute()


async def log_resource_view(
    user_id: str,
    resource_id: str,
    resource_type: str,
    session_id: Optional[str] = None,
    referrer: Optional[str] = None,
) -> None:
    """
    Log when a user views a resource (job, education program, etc.).

    Args:
        user_id: User ID
        resource_id: ID of the viewed resource
        resource_type: Type of resource (job, education, partner, etc.)
        session_id: Optional session ID
        referrer: Optional referrer information

    Returns:
        None
    """
    timestamp = datetime.now().isoformat()

    view_data = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "resource_id": resource_id,
        "resource_type": resource_type,
        "session_id": session_id,
        "referrer": referrer,
        "viewed_at": timestamp,
    }

    # Log to console for now
    logger.info(f"Resource view: {json.dumps(view_data)}")

    # In a real implementation, you would store this in a database
    # E.g.: await supabase.table("resource_views").insert(view_data).execute()


async def log_user_feedback(
    user_id: str,
    conversation_id: str,
    message_id: str,
    feedback_type: str,
    rating: Optional[int] = None,
    correction: Optional[str] = None,
    flag_reason: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None,
) -> None:
    """
    Log user feedback on conversations or messages.

    Args:
        user_id: User ID
        conversation_id: Conversation ID
        message_id: Message ID
        feedback_type: Type of feedback (rating, correction, flag)
        rating: Optional rating (1-5)
        correction: Optional correction text
        flag_reason: Optional reason for flagging
        metadata: Optional additional metadata

    Returns:
        None
    """
    timestamp = datetime.now().isoformat()

    feedback_data = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "conversation_id": conversation_id,
        "message_id": message_id,
        "feedback_type": feedback_type,
        "rating": rating,
        "correction": correction,
        "flag_reason": flag_reason,
        "metadata": metadata or {},
        "created_at": timestamp,
    }

    # Log to console for now
    logger.info(f"User feedback: {json.dumps(feedback_data)}")

    # In a real implementation, you would store this in a database
    # E.g.: await supabase.table("conversation_feedback").insert(feedback_data).execute()


async def log_conversation_interrupt(
    conversation_id: str,
    interrupt_type: str,
    priority: str = "medium",
    metadata: Optional[Dict[str, Any]] = None,
) -> str:
    """
    Log an interruption in a conversation.

    Args:
        conversation_id: Conversation ID
        interrupt_type: Type of interrupt (human_review, flag, pause)
        priority: Priority level (high, medium, low)
        metadata: Optional additional metadata

    Returns:
        str: Interrupt ID
    """
    timestamp = datetime.now().isoformat()
    interrupt_id = f"int_{int(datetime.now().timestamp())}_{uuid.uuid4().hex[:8]}"

    interrupt_data = {
        "id": interrupt_id,
        "conversation_id": conversation_id,
        "type": interrupt_type,
        "status": "pending",
        "priority": priority,
        "resolution": None,
        "created_at": timestamp,
        "resolved_at": None,
    }

    if metadata:
        interrupt_data["metadata"] = metadata

    # Log to console for now
    logger.info(f"Conversation interrupt: {json.dumps(interrupt_data)}")

    # In a real implementation, you would store this in a database
    # E.g.: await supabase.table("conversation_interrupts").insert(interrupt_data).execute()

    return interrupt_id


async def update_user_interests(
    user_id: str,
    climate_focus: Optional[List[str]] = None,
    target_roles: Optional[List[str]] = None,
    skills_to_develop: Optional[List[str]] = None,
    preferred_location: Optional[str] = None,
    employment_preferences: Optional[Dict[str, Any]] = None,
) -> None:
    """
    Update user interests based on conversation content.

    Args:
        user_id: User ID
        climate_focus: List of climate focus areas
        target_roles: List of target roles
        skills_to_develop: List of skills to develop
        preferred_location: Preferred location
        employment_preferences: Employment preferences

    Returns:
        None
    """
    timestamp = datetime.now().isoformat()

    interests_data = {"user_id": user_id, "updated_at": timestamp}

    if climate_focus is not None:
        interests_data["climate_focus"] = climate_focus

    if target_roles is not None:
        interests_data["target_roles"] = target_roles

    if skills_to_develop is not None:
        interests_data["skills_to_develop"] = skills_to_develop

    if preferred_location is not None:
        interests_data["preferred_location"] = preferred_location

    if employment_preferences is not None:
        interests_data["employment_preferences"] = employment_preferences

    # Log to console for now
    logger.info(f"User interests update: {json.dumps(interests_data)}")

    # In a real implementation, you would store this in a database
    # First check if record exists, then update or insert
    # E.g.:
    # existing = await supabase.table("user_interests").select("id").eq("user_id", user_id).execute()
    # if existing.data:
    #     await supabase.table("user_interests").update(interests_data).eq("user_id", user_id).execute()
    # else:
    #     await supabase.table("user_interests").insert(interests_data).execute()


async def log_audit_action(
    user_id: str,
    table_name: str,
    action_type: str,
    record_id: Optional[str] = None,
    old_values: Optional[Dict[str, Any]] = None,
    new_values: Optional[Dict[str, Any]] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
) -> None:
    """
    Log audit trail for important actions.

    Args:
        user_id: User ID
        table_name: Name of the table being modified
        action_type: Type of action (create, update, delete)
        record_id: ID of the record being modified
        old_values: Previous values before modification
        new_values: New values after modification
        ip_address: IP address of the user
        user_agent: User agent of the user

    Returns:
        None
    """
    timestamp = datetime.now().isoformat()

    audit_data = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "table_name": table_name,
        "action_type": action_type,
        "record_id": record_id,
        "old_values": old_values,
        "new_values": new_values,
        "ip_address": ip_address,
        "user_agent": user_agent,
        "created_at": timestamp,
        "details": {"source": "backend_tool", "automated": True},
    }

    # Log to console for now
    logger.info(f"Audit action: {json.dumps(audit_data)}")

    # In a real implementation, you would store this in a database
    # E.g.: await supabase.table("audit_logs").insert(audit_data).execute()


async def extract_conversation_insights(
    conversation_content: str, user_query: str
) -> Dict[str, Any]:
    """
    Extract insights from conversation for analytics.

    Args:
        conversation_content: Full conversation content
        user_query: Original user query

    Returns:
        Dict: Extracted insights
    """
    # This is a placeholder implementation
    # In a real implementation, this would use an LLM to extract insights

    # Sample extracted insights
    insights = {
        "topics_discussed": ["climate careers", "skill development"],
        "climate_focus_areas": ["renewable energy", "sustainability"],
        "target_roles": ["project manager", "sustainability analyst"],
        "skills_mentioned": ["project management", "data analysis"],
        "locations_discussed": ["Massachusetts"],
        "resources_of_interest": ["jobs", "education"],
        "conversation_outcome": "information_provided",
        "user_satisfaction_indicators": ["positive"],
        "follow_up_actions": ["resume_review", "job_search"],
        "confidence_score": 0.8,
    }

    logger.info(f"Extracted conversation insights: {json.dumps(insights)}")

    return insights


async def get_database_summary() -> Dict[str, Any]:
    """Get comprehensive database summary with real Supabase data."""
    try:
        from ..adapters.supabase_adapter import SupabaseAdapter

        adapter = SupabaseAdapter()
        client = adapter.get_cached_client()

        if not client:
            logger.warning("Supabase client not available, returning minimal summary")
            return {
                "total_tables": 25,
                "total_users": 0,
                "total_jobs": 0,
                "error": "database_unavailable",
            }

        # Get real counts from database tables
        summary = {
            "total_tables": 25,  # Known from schema
            "total_users": 0,
            "total_jobs": 0,
            "total_partners": 0,
            "total_resumes": 0,
            "total_conversations": 0,
            "total_skills": 0,
            "total_education_programs": 0,
            "active_job_seekers": 0,
            "active_partners": 0,
            "recent_activity": {},
            "database_health": "healthy",
        }

        # Query each table for counts
        tables_to_count = [
            ("profiles", "total_users"),
            ("job_listings", "total_jobs"),
            ("partner_profiles", "total_partners"),
            ("resumes", "total_resumes"),
            ("conversations", "total_conversations"),
            ("skills_mapping", "total_skills"),
            ("education_programs", "total_education_programs"),
        ]

        for table_name, summary_key in tables_to_count:
            try:
                result = client.table(table_name).select("id", count="exact").execute()
                summary[summary_key] = (
                    result.count if hasattr(result, "count") else len(result.data)
                )
            except Exception as e:
                logger.warning(f"Could not count {table_name}: {e}")
                summary[summary_key] = 0

        # Get active users counts
        try:
            # Active job seekers (profiles with role job_seeker)
            result = (
                client.table("profiles")
                .select("id", count="exact")
                .eq("role", "job_seeker")
                .execute()
            )
            summary["active_job_seekers"] = (
                result.count if hasattr(result, "count") else len(result.data)
            )

            # Active partners
            result = (
                client.table("profiles").select("id", count="exact").eq("role", "partner").execute()
            )
            summary["active_partners"] = (
                result.count if hasattr(result, "count") else len(result.data)
            )
        except Exception as e:
            logger.warning(f"Could not count active users: {e}")

        # Get recent activity (last 7 days)
        try:
            from datetime import datetime, timedelta

            week_ago = (datetime.now() - timedelta(days=7)).isoformat()

            result = (
                client.table("conversations")
                .select("id", count="exact")
                .gte("created_at", week_ago)
                .execute()
            )
            summary["recent_activity"]["conversations_last_week"] = (
                result.count if hasattr(result, "count") else len(result.data)
            )

            result = (
                client.table("job_applications")
                .select("id", count="exact")
                .gte("created_at", week_ago)
                .execute()
            )
            summary["recent_activity"]["applications_last_week"] = (
                result.count if hasattr(result, "count") else len(result.data)
            )
        except Exception as e:
            logger.warning(f"Could not get recent activity: {e}")
            summary["recent_activity"] = {"error": "unavailable"}

        logger.info(f"Database summary generated: {summary}")
        return summary

    except Exception as e:
        logger.error(f"Error getting database summary: {e}")
        return {
            "total_tables": 25,
            "total_users": 0,
            "total_jobs": 0,
            "error": str(e),
            "database_health": "error",
        }


async def get_conversation_analytics(
    user_id: str = None, conversation_id: str = None
) -> Dict[str, Any]:
    """Get real conversation analytics from Supabase."""
    try:
        from ..adapters.supabase_adapter import SupabaseAdapter

        adapter = SupabaseAdapter()
        client = adapter.get_cached_client()

        if not client:
            logger.warning("Supabase client not available for conversation analytics")
            return {"error": "database_unavailable"}

        # Use George's profile if no user_id provided
        if not user_id:
            user_id = GEORGE_NEKWAYA_USER_ID

        analytics = {
            "user_id": user_id,
            "total_conversations": 0,
            "total_messages": 0,
            "average_session_duration": 0,
            "topics_discussed": [],
            "recent_conversations": [],
            "conversation_outcomes": {},
            "user_satisfaction": 0.0,
            "tools_used": [],
            "resources_accessed": [],
        }

        # Get conversation count for user
        try:
            result = (
                client.table("conversations")
                .select("*", count="exact")
                .eq("user_id", user_id)
                .execute()
            )
            analytics["total_conversations"] = (
                result.count if hasattr(result, "count") else len(result.data)
            )
            analytics["recent_conversations"] = result.data[:5] if result.data else []
        except Exception as e:
            logger.warning(f"Could not get conversations for {user_id}: {e}")

        # Get message count
        try:
            result = (
                client.table("conversation_messages")
                .select("id", count="exact")
                .eq("user_id", user_id)
                .execute()
            )
            analytics["total_messages"] = (
                result.count if hasattr(result, "count") else len(result.data)
            )
        except Exception as e:
            logger.warning(f"Could not get messages for {user_id}: {e}")

        # Get conversation analytics if available
        try:
            result = (
                client.table("conversation_analytics").select("*").eq("user_id", user_id).execute()
            )
            if result.data:
                latest_analytics = result.data[0]
                analytics.update(
                    {
                        "topics_discussed": latest_analytics.get("topics_discussed", []),
                        "conversation_outcomes": latest_analytics.get(
                            "conversation_outcome", "unknown"
                        ),
                        "user_satisfaction": latest_analytics.get("user_satisfaction_score", 0.0),
                        "tools_used": latest_analytics.get("resources_accessed", []),
                        "average_session_duration": latest_analytics.get(
                            "session_duration_seconds", 0
                        ),
                    }
                )
        except Exception as e:
            logger.warning(f"Could not get analytics for {user_id}: {e}")

        return analytics

    except Exception as e:
        logger.error(f"Error getting conversation analytics: {e}")
        return {"error": str(e)}


async def get_user_profile_summary(user_id: str = None) -> Dict[str, Any]:
    """Get comprehensive user profile summary from Supabase."""
    try:
        from ..adapters.supabase_adapter import SupabaseAdapter

        adapter = SupabaseAdapter()
        client = adapter.get_cached_client()

        if not client:
            logger.warning("Supabase client not available for user profile")
            return {"error": "database_unavailable"}

        # Use George's profile if no user_id provided
        if not user_id:
            user_id = GEORGE_NEKWAYA_USER_ID

        profile_summary = {
            "user_id": user_id,
            "profile_exists": False,
            "basic_info": {},
            "job_seeker_profile": {},
            "partner_profile": {},
            "resume_info": {},
            "job_applications": [],
            "skills": [],
            "education": [],
            "match_history": [],
            "conversation_count": 0,
        }

        # Get basic profile
        try:
            result = client.table("profiles").select("*").eq("user_id", user_id).execute()
            if result.data:
                profile_summary["profile_exists"] = True
                profile_summary["basic_info"] = result.data[0]
        except Exception as e:
            logger.warning(f"Could not get basic profile for {user_id}: {e}")

        # Get job seeker specific data
        try:
            result = (
                client.table("job_seeker_profiles").select("*").eq("user_id", user_id).execute()
            )
            if result.data:
                profile_summary["job_seeker_profile"] = result.data[0]
        except Exception as e:
            logger.warning(f"Could not get job seeker profile for {user_id}: {e}")

        # Get resume information
        try:
            result = client.table("resumes").select("*").eq("user_id", user_id).execute()
            if result.data:
                profile_summary["resume_info"] = result.data[0]
        except Exception as e:
            logger.warning(f"Could not get resume for {user_id}: {e}")

        # Get job applications
        try:
            result = (
                client.table("job_applications")
                .select("*")
                .eq("user_id", user_id)
                .limit(10)
                .execute()
            )
            profile_summary["job_applications"] = result.data if result.data else []
        except Exception as e:
            logger.warning(f"Could not get job applications for {user_id}: {e}")

        # Get skills
        try:
            result = client.table("user_skills").select("*").eq("user_id", user_id).execute()
            profile_summary["skills"] = result.data if result.data else []
        except Exception as e:
            logger.warning(f"Could not get skills for {user_id}: {e}")

        return profile_summary

    except Exception as e:
        logger.error(f"Error getting user profile summary: {e}")
        return {"error": str(e)}
