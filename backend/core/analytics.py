"""
Analytics module for Climate Economy Assistant

This module handles all analytics functionality including:
- Conversation tracking
- User engagement metrics
- Specialist interaction logging
- Resource access tracking
"""

import asyncio
import json
import logging
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from langchain_core.messages import AIMessage, HumanMessage

from adapters.supabase import (
    get_supabase_client,
    insert_database_record,
    update_database_record,
)
from core.config import get_settings

settings = get_settings()
logger = logging.getLogger("analytics")


async def initialize_analytics() -> bool:
    """
    Initialize analytics system

    Returns:
        bool: True if initialized successfully, False otherwise
    """
    try:
        # Check if Supabase connection is available
        supabase = get_supabase_client()
        if not supabase:
            print("Warning: Supabase connection unavailable, analytics will be limited")
            return False

        # For now, just check connection and return success
        return True
    except Exception as e:
        print(f"Error initializing analytics: {e}")
        return False


async def log_api_request(
    path: str,
    method: str,
    status_code: int,
    processing_time: float,
    user_id: Optional[str] = None,
    client_ip: Optional[str] = None,
    user_agent: Optional[str] = None,
) -> None:
    """
    Log an API request for analytics

    Args:
        path: Request path
        method: HTTP method
        status_code: Response status code
        processing_time: Request processing time in seconds
        user_id: Optional user ID
        client_ip: Optional client IP address
        user_agent: Optional user agent string
    """
    if not settings.ENABLE_ANALYTICS:
        return

    try:
        # Create request log entry
        request_data = {
            "id": f"req_{uuid.uuid4().hex}",
            "path": path,
            "method": method,
            "status_code": status_code,
            "processing_time_ms": int(processing_time * 1000),
            "user_id": user_id,
            "client_ip": client_ip,
            "user_agent": user_agent,
            "timestamp": datetime.now().isoformat(),
        }

        # Insert record
        await insert_database_record("api_requests", request_data)
    except Exception as e:
        print(f"Warning: Failed to log API request: {e}")


async def start_conversation(user_id: str, initial_query: str) -> str:
    """
    Start a new conversation and return the conversation ID

    Args:
        user_id: User identifier
        initial_query: First query in the conversation

    Returns:
        str: New conversation ID
    """
    # Generate conversation ID
    conversation_id = f"conv_{uuid.uuid4().hex}"

    # Create conversation record
    if settings.ENABLE_ANALYTICS:
        try:
            # Create conversation entry
            conversation_data = {
                "id": conversation_id,
                "user_id": user_id,
                "status": "active",
                "initial_query": initial_query,
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat(),
            }

            # Insert record
            await insert_database_record("conversations", conversation_data)

            # Initialize analytics record
            analytics_data = {
                "conversation_id": conversation_id,
                "user_id": user_id,
                "messages_sent": 1,
                "messages_received": 0,
                "session_duration_seconds": 0,
                "topics_discussed": extract_topics(initial_query),
                "created_at": datetime.now().isoformat(),
                "analyzed_at": datetime.now().isoformat(),
            }

            # Insert analytics record
            await insert_database_record("conversation_analytics", analytics_data)

        except Exception as e:
            print(f"Warning: Failed to start conversation analytics: {e}")

    return conversation_id


async def log_message(
    conversation_id: str,
    role: str,
    content: str,
    specialist_type: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None,
) -> None:
    """
    Log a conversation message

    Args:
        conversation_id: Conversation identifier
        role: Message role (user, assistant, system)
        content: Message content
        specialist_type: Type of specialist for assistant messages
        metadata: Additional metadata
    """
    if not settings.ENABLE_ANALYTICS:
        return

    try:
        # Create message data
        message_data = {
            "id": f"msg_{uuid.uuid4().hex}",
            "conversation_id": conversation_id,
            "role": role,
            "content": content,
            "specialist_type": specialist_type,
            "metadata": metadata or {},
            "created_at": datetime.now().isoformat(),
        }

        # Insert message
        await insert_database_record("conversation_messages", message_data)

        # Update conversation analytics
        analytics_update = {
            "updated_at": datetime.now().isoformat(),
        }

        if role == "user":
            analytics_update["messages_sent"] = "messages_sent + 1"  # SQL increment
            topics = extract_topics(content)
            if topics:
                analytics_update["topics_discussed"] = topics
        else:
            analytics_update["messages_received"] = (
                "messages_received + 1"  # SQL increment
            )

        # Update analytics record
        await update_database_record(
            "conversation_analytics",
            analytics_update,
            "conversation_id",
            conversation_id,
        )

        # Update conversation record
        await update_database_record(
            "conversations",
            {"updated_at": datetime.now().isoformat()},
            "id",
            conversation_id,
        )

    except Exception as e:
        print(f"Warning: Failed to log message: {e}")


async def log_user_action(
    user_id: str, action_type: str, action_data: Dict[str, Any]
) -> None:
    """
    Log a user action

    Args:
        user_id: User identifier
        action_type: Type of action
        action_data: Action details
    """
    if not settings.ENABLE_ANALYTICS:
        return

    try:
        # Create action data
        action_record = {
            "id": f"action_{uuid.uuid4().hex}",
            "user_id": user_id,
            "action_type": action_type,
            "action_data": action_data,
            "created_at": datetime.now().isoformat(),
        }

        # Insert action
        await insert_database_record("user_actions", action_record)

    except Exception as e:
        print(f"Warning: Failed to log user action: {e}")


async def log_resource_access(
    user_id: str, resource_id: str, resource_type: str, session_id: Optional[str] = None
) -> None:
    """
    Log a resource access event

    Args:
        user_id: User identifier
        resource_id: Resource identifier
        resource_type: Type of resource (job, education, partner, knowledge)
        session_id: Optional session/conversation ID
    """
    if not settings.ENABLE_ANALYTICS:
        return

    try:
        # Create view data
        view_data = {
            "user_id": user_id,
            "resource_id": resource_id,
            "resource_type": resource_type,
            "session_id": session_id,
            "viewed_at": datetime.now().isoformat(),
        }

        # Insert view
        await insert_database_record("resource_views", view_data)

        # Update conversation analytics if session_id provided
        if session_id:
            try:
                analytics_update = {
                    "resources_accessed": f"array_append(resources_accessed, '{resource_type}:{resource_id}')",
                    "analyzed_at": datetime.now().isoformat(),
                }

                # Resource-specific updates
                if resource_type == "job":
                    analytics_update["jobs_viewed"] = (
                        f"array_append(jobs_viewed, '{resource_id}')"
                    )
                elif resource_type == "partner":
                    analytics_update["partners_contacted"] = (
                        f"array_append(partners_contacted, '{resource_id}')"
                    )

                # Update follow-up actions count
                analytics_update["follow_up_actions_taken"] = (
                    "follow_up_actions_taken + 1"
                )

                # Update analytics record
                await update_database_record(
                    "conversation_analytics",
                    analytics_update,
                    "conversation_id",
                    session_id,
                )

            except Exception as analytics_error:
                print(
                    f"Warning: Failed to update conversation analytics: {analytics_error}"
                )

    except Exception as e:
        print(f"Warning: Failed to log resource view: {e}")


async def log_specialist_interaction(
    user_id: str,
    conversation_id: str,
    specialist_type: str,
    tools_used: List[str],
    query: str,
    confidence: float = 0.0,
) -> None:
    """
    Log a specialist interaction

    Args:
        user_id: User identifier
        conversation_id: Conversation identifier
        specialist_type: Type of specialist
        tools_used: List of tools used
        query: User query
        confidence: Confidence score
    """
    if not settings.ENABLE_ANALYTICS:
        return

    try:
        # Create interaction data
        interaction_data = {
            "id": f"interaction_{uuid.uuid4().hex}",
            "user_id": user_id,
            "conversation_id": conversation_id,
            "specialist_type": specialist_type,
            "tools_used": tools_used,
            "query": query,
            "confidence_score": confidence,
            "created_at": datetime.now().isoformat(),
        }

        # Insert interaction
        await insert_database_record("specialist_interactions", interaction_data)

        # Update conversation analytics
        analytics_update = {
            "specialist_used": specialist_type,
            "tools_used": tools_used,
            "analyzed_at": datetime.now().isoformat(),
        }

        # Update analytics record
        await update_database_record(
            "conversation_analytics",
            analytics_update,
            "conversation_id",
            conversation_id,
        )

    except Exception as e:
        print(f"Warning: Failed to log specialist interaction: {e}")


async def track_user_interests(user_id: str, interests: List[str]) -> None:
    """
    Track user interests

    Args:
        user_id: User identifier
        interests: List of interest categories
    """
    if not settings.ENABLE_ANALYTICS:
        return

    try:
        # Check if user interests exist
        supabase = get_supabase_client()
        if not supabase:
            return

        # Get existing interests
        result = (
            supabase.table("user_interests")
            .select("*")
            .eq("user_id", user_id)
            .execute()
        )

        interests_data = {
            "user_id": user_id,
            "updated_at": datetime.now().isoformat(),
        }

        # Update interests based on existing data
        if result.data and len(result.data) > 0:
            existing = result.data[0]

            # Merge interests
            current_interests = existing.get("climate_focus", [])
            for interest in interests:
                if interest not in current_interests:
                    current_interests.append(interest)

            interests_data["climate_focus"] = current_interests

            # Update record
            await update_database_record(
                "user_interests", interests_data, "user_id", user_id
            )
        else:
            # Create new record
            interests_data["climate_focus"] = interests
            interests_data["created_at"] = datetime.now().isoformat()

            # Insert record
            await insert_database_record("user_interests", interests_data)

    except Exception as e:
        print(f"Warning: Failed to track user interests: {e}")


async def complete_session(conversation_id: str, outcome: str = "completed") -> None:
    """
    Mark a conversation as completed

    Args:
        conversation_id: Conversation identifier
        outcome: Completion outcome (completed, abandoned, interrupted)
    """
    if not settings.ENABLE_ANALYTICS:
        return

    try:
        # Update conversation record
        conversation_update = {
            "status": "completed",
            "outcome": outcome,
            "completed_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
        }

        # Update record
        await update_database_record(
            "conversations", conversation_update, "id", conversation_id
        )

        # Update analytics record
        analytics_update = {
            "conversation_outcome": outcome,
            "analyzed_at": datetime.now().isoformat(),
        }

        # Update record
        await update_database_record(
            "conversation_analytics",
            analytics_update,
            "conversation_id",
            conversation_id,
        )

    except Exception as e:
        print(f"Warning: Failed to complete session: {e}")


async def get_user_engagement_summary(user_id: str) -> Dict[str, Any]:
    """
    Get a summary of user engagement

    Args:
        user_id: User identifier

    Returns:
        Dict[str, Any]: Engagement summary
    """
    if not settings.ENABLE_ANALYTICS:
        return {"user_id": user_id, "analytics_enabled": False}

    try:
        supabase = get_supabase_client()
        if not supabase:
            return {"user_id": user_id, "analytics_available": False}

        # Get conversation count
        conversations = (
            supabase.table("conversations")
            .select("count", count="exact")
            .eq("user_id", user_id)
            .execute()
        )

        total_conversations = (
            conversations.count if hasattr(conversations, "count") else 0
        )

        # Get resource views
        resource_views = (
            supabase.table("resource_views")
            .select("count", count="exact")
            .eq("user_id", user_id)
            .execute()
        )

        total_resources = (
            resource_views.count if hasattr(resource_views, "count") else 0
        )

        # Get user interests
        interests = (
            supabase.table("user_interests")
            .select("*")
            .eq("user_id", user_id)
            .execute()
        )

        climate_interests = (
            interests.data[0].get("climate_focus", []) if interests.data else []
        )

        # Build summary
        return {
            "user_id": user_id,
            "total_conversations": total_conversations,
            "total_resources_accessed": total_resources,
            "climate_interests": climate_interests,
            "engagement_level": get_engagement_level(
                total_conversations, total_resources
            ),
            "analyzed_at": datetime.now().isoformat(),
        }

    except Exception as e:
        print(f"Warning: Failed to get user engagement summary: {e}")
        return {"user_id": user_id, "error": str(e)}


# Helper functions


def extract_topics(text: str) -> List[str]:
    """
    Extract topics from text content

    Args:
        text: Text content

    Returns:
        List[str]: Extracted topics
    """
    topics = []

    # Map of keywords to topics
    topic_keywords = {
        "offshore_wind": ["offshore", "wind", "turbine"],
        "solar": ["solar", "photovoltaic", "pv"],
        "energy_efficiency": ["efficiency", "conservation", "weatherization"],
        "green_building": ["building", "construction", "leed"],
        "transportation": ["transportation", "ev", "electric vehicle"],
        "policy": ["policy", "regulation", "legislation"],
        "jobs": ["job", "career", "employment", "hiring"],
        "education": ["education", "training", "certificate", "degree"],
        "environmental_justice": ["justice", "equity", "community", "frontline"],
        "climate_tech": ["technology", "innovation", "startup"],
    }

    # Check for topic keywords
    text_lower = text.lower()
    for topic, keywords in topic_keywords.items():
        if any(keyword in text_lower for keyword in keywords):
            topics.append(topic)

    return topics


def get_engagement_level(conversations: int, resources: int) -> str:
    """
    Calculate engagement level

    Args:
        conversations: Number of conversations
        resources: Number of resources accessed

    Returns:
        str: Engagement level
    """
    total_score = conversations + resources

    if total_score == 0:
        return "none"
    elif total_score < 5:
        return "low"
    elif total_score < 15:
        return "medium"
    else:
        return "high"
