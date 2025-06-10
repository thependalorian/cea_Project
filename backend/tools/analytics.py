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
