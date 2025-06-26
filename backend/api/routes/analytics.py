"""
Analytics routes for the Climate Economy Assistant.
Handles conversation analytics, message feedback, conversation feedback, and conversation interrupts.
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import structlog

from backend.database.supabase_client import supabase
from backend.api.middleware.auth import verify_token

logger = structlog.get_logger(__name__)
router = APIRouter()


# Conversation Analytics Management
@router.post("/conversations", response_model=Dict[str, Any])
async def create_conversation_analytics(
    analytics_data: Dict[str, Any],
    user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Create conversation analytics record.
    - Records conversation metrics and performance data
    - Tracks user engagement and interaction patterns
    - Stores agent performance and response quality metrics
    """
    try:
        # Validate required fields
        required_fields = ["conversation_id", "user_id"]
        for field in required_fields:
            if not analytics_data.get(field):
                raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
        
        # Set metadata
        analytics_data["created_at"] = datetime.utcnow().isoformat()
        analytics_data["updated_at"] = datetime.utcnow().isoformat()
        
        # Insert conversation analytics
        result = supabase.table("conversation_analytics").insert(analytics_data).execute()
        
        if result.data:
            logger.info(f"Created conversation analytics {result.data[0]['id']} for conversation {analytics_data['conversation_id']}")
            return {"success": True, "analytics": result.data[0]}
        else:
            raise HTTPException(status_code=500, detail="Failed to create conversation analytics")
            
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error creating conversation analytics: {e}")
        raise HTTPException(status_code=500, detail="Failed to create conversation analytics")


@router.get("/conversations", response_model=Dict[str, Any])
async def get_conversation_analytics(
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    conversation_id: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Get conversation analytics with filtering and pagination.
    - Supports filtering by conversation ID and date range
    - Returns aggregated metrics and performance data
    - Includes user engagement and satisfaction scores
    """
    try:
        # Check if user has permission to view analytics (admin only)
        admin_result = supabase.table("admin_profiles").select("id, can_view_analytics").eq("user_id", user_id).execute()
        
        if not admin_result.data or not admin_result.data[0].get("can_view_analytics"):
            raise HTTPException(status_code=403, detail="Not authorized to view conversation analytics")
        
        query = supabase.table("conversation_analytics").select("*")
        
        # Apply filters
        if conversation_id:
            query = query.eq("conversation_id", conversation_id)
        if date_from:
            query = query.gte("created_at", date_from)
        if date_to:
            query = query.lte("created_at", date_to)
        
        # Apply pagination and ordering
        result = (
            query
            .order("created_at", desc=True)
            .range(offset, offset + limit - 1)
            .execute()
        )
        
        logger.info(f"Retrieved {len(result.data)} conversation analytics for user {user_id}")
        
        return {
            "success": True,
            "analytics": result.data if result.data else [],
            "pagination": {
                "limit": limit,
                "offset": offset
            }
        }
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error getting conversation analytics: {e}")
        raise HTTPException(status_code=500, detail="Failed to get conversation analytics")


@router.get("/conversations/{conversation_id}", response_model=Dict[str, Any])
async def get_conversation_analytics_detail(
    conversation_id: str,
    user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Get detailed analytics for a specific conversation.
    - Returns comprehensive conversation metrics
    - Includes message-by-message performance data
    - Shows agent effectiveness and user satisfaction
    """
    try:
        # Check if user has permission to view analytics or owns the conversation
        admin_result = supabase.table("admin_profiles").select("id, can_view_analytics").eq("user_id", user_id).execute()
        conversation_result = supabase.table("conversations").select("user_id").eq("id", conversation_id).execute()
        
        is_admin = admin_result.data and admin_result.data[0].get("can_view_analytics")
        is_owner = conversation_result.data and conversation_result.data[0]["user_id"] == user_id
        
        if not is_admin and not is_owner:
            raise HTTPException(status_code=403, detail="Not authorized to view this conversation analytics")
        
        result = supabase.table("conversation_analytics").select("*").eq("conversation_id", conversation_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Conversation analytics not found")
            
        analytics = result.data[0]
        
        # Get related message feedback
        message_feedback = (
            supabase.table("message_feedback")
            .select("*")
            .eq("conversation_id", conversation_id)
            .order("created_at", desc=True)
            .execute()
        )
        
        if message_feedback.data:
            analytics["message_feedback"] = message_feedback.data
        
        logger.info(f"Retrieved conversation analytics for conversation {conversation_id}")
        
        return {"success": True, "analytics": analytics}
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error getting conversation analytics for {conversation_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to get conversation analytics")


# Message Feedback Management
@router.post("/messages/feedback", response_model=Dict[str, Any])
async def create_message_feedback(
    feedback_data: Dict[str, Any],
    user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Create message feedback record.
    - Records user feedback on individual messages
    - Tracks rating, helpfulness, and specific comments
    - Associates feedback with message and conversation context
    """
    try:
        # Validate required fields
        required_fields = ["message_id", "conversation_id", "rating"]
        for field in required_fields:
            if feedback_data.get(field) is None:
                raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
        
        # Validate rating range
        if not (1 <= feedback_data["rating"] <= 5):
            raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
        
        # Set metadata
        feedback_data["user_id"] = user_id
        feedback_data["created_at"] = datetime.utcnow().isoformat()
        feedback_data["updated_at"] = datetime.utcnow().isoformat()
        
        # Insert message feedback
        result = supabase.table("message_feedback").insert(feedback_data).execute()
        
        if result.data:
            logger.info(f"Created message feedback {result.data[0]['id']} for message {feedback_data['message_id']}")
            return {"success": True, "feedback": result.data[0]}
        else:
            raise HTTPException(status_code=500, detail="Failed to create message feedback")
            
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error creating message feedback: {e}")
        raise HTTPException(status_code=500, detail="Failed to create message feedback")


@router.get("/messages/feedback", response_model=Dict[str, Any])
async def get_message_feedback(
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    conversation_id: Optional[str] = Query(None),
    message_id: Optional[str] = Query(None),
    rating: Optional[int] = Query(None, ge=1, le=5),
    date_from: Optional[str] = Query(None),
    user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Get message feedback with filtering and pagination.
    - Supports filtering by conversation, message, rating, and date
    - Returns user feedback data for analysis
    - Admin access shows all feedback, users see only their own
    """
    try:
        # Check user permissions
        admin_result = supabase.table("admin_profiles").select("id, can_view_analytics").eq("user_id", user_id).execute()
        is_admin = admin_result.data and admin_result.data[0].get("can_view_analytics")
        
        query = supabase.table("message_feedback").select("*")
        
        # Restrict to user's own feedback if not admin
        if not is_admin:
            query = query.eq("user_id", user_id)
        
        # Apply filters
        if conversation_id:
            query = query.eq("conversation_id", conversation_id)
        if message_id:
            query = query.eq("message_id", message_id)
        if rating:
            query = query.eq("rating", rating)
        if date_from:
            query = query.gte("created_at", date_from)
        
        # Apply pagination and ordering
        result = (
            query
            .order("created_at", desc=True)
            .range(offset, offset + limit - 1)
            .execute()
        )
        
        logger.info(f"Retrieved {len(result.data)} message feedback records for user {user_id}")
        
        return {
            "success": True,
            "feedback": result.data if result.data else [],
            "pagination": {
                "limit": limit,
                "offset": offset
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting message feedback: {e}")
        raise HTTPException(status_code=500, detail="Failed to get message feedback")


@router.put("/messages/feedback/{feedback_id}", response_model=Dict[str, Any])
async def update_message_feedback(
    feedback_id: str,
    update_data: Dict[str, Any],
    user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Update message feedback record.
    - Allows users to modify their feedback
    - Updates rating, comments, and helpfulness scores
    - Maintains audit trail of feedback changes
    """
    try:
        # Check if user owns this feedback
        feedback_result = supabase.table("message_feedback").select("user_id").eq("id", feedback_id).execute()
        
        if not feedback_result.data:
            raise HTTPException(status_code=404, detail="Message feedback not found")
            
        if feedback_result.data[0]["user_id"] != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to update this feedback")
        
        # Validate rating if provided
        if "rating" in update_data and not (1 <= update_data["rating"] <= 5):
            raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
        
        # Set update metadata
        update_data["updated_at"] = datetime.utcnow().isoformat()
        
        # Update message feedback
        result = (
            supabase.table("message_feedback")
            .update(update_data)
            .eq("id", feedback_id)
            .execute()
        )
        
        if result.data:
            logger.info(f"Updated message feedback {feedback_id} by user {user_id}")
            return {"success": True, "feedback": result.data[0]}
        else:
            raise HTTPException(status_code=500, detail="Failed to update message feedback")
            
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error updating message feedback {feedback_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to update message feedback")


# Conversation Feedback Management
@router.post("/conversations/feedback", response_model=Dict[str, Any])
async def create_conversation_feedback(
    feedback_data: Dict[str, Any],
    user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Create conversation feedback record.
    - Records overall conversation satisfaction and effectiveness
    - Captures user experience ratings and detailed comments
    - Associates feedback with conversation and agent performance
    """
    try:
        # Validate required fields
        required_fields = ["conversation_id", "overall_rating"]
        for field in required_fields:
            if feedback_data.get(field) is None:
                raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
        
        # Validate rating range
        if not (1 <= feedback_data["overall_rating"] <= 5):
            raise HTTPException(status_code=400, detail="Overall rating must be between 1 and 5")
        
        # Set metadata
        feedback_data["user_id"] = user_id
        feedback_data["created_at"] = datetime.utcnow().isoformat()
        feedback_data["updated_at"] = datetime.utcnow().isoformat()
        
        # Insert conversation feedback
        result = supabase.table("conversation_feedback").insert(feedback_data).execute()
        
        if result.data:
            logger.info(f"Created conversation feedback {result.data[0]['id']} for conversation {feedback_data['conversation_id']}")
            return {"success": True, "feedback": result.data[0]}
        else:
            raise HTTPException(status_code=500, detail="Failed to create conversation feedback")
            
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error creating conversation feedback: {e}")
        raise HTTPException(status_code=500, detail="Failed to create conversation feedback")


@router.get("/conversations/feedback", response_model=Dict[str, Any])
async def get_conversation_feedback(
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    conversation_id: Optional[str] = Query(None),
    rating: Optional[int] = Query(None, ge=1, le=5),
    date_from: Optional[str] = Query(None),
    user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Get conversation feedback with filtering and pagination.
    - Supports filtering by conversation, rating, and date
    - Returns user satisfaction and experience data
    - Admin access shows all feedback, users see only their own
    """
    try:
        # Check user permissions
        admin_result = supabase.table("admin_profiles").select("id, can_view_analytics").eq("user_id", user_id).execute()
        is_admin = admin_result.data and admin_result.data[0].get("can_view_analytics")
        
        query = supabase.table("conversation_feedback").select("*")
        
        # Restrict to user's own feedback if not admin
        if not is_admin:
            query = query.eq("user_id", user_id)
        
        # Apply filters
        if conversation_id:
            query = query.eq("conversation_id", conversation_id)
        if rating:
            query = query.eq("overall_rating", rating)
        if date_from:
            query = query.gte("created_at", date_from)
        
        # Apply pagination and ordering
        result = (
            query
            .order("created_at", desc=True)
            .range(offset, offset + limit - 1)
            .execute()
        )
        
        logger.info(f"Retrieved {len(result.data)} conversation feedback records for user {user_id}")
        
        return {
            "success": True,
            "feedback": result.data if result.data else [],
            "pagination": {
                "limit": limit,
                "offset": offset
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting conversation feedback: {e}")
        raise HTTPException(status_code=500, detail="Failed to get conversation feedback")


# Conversation Interrupts Management
@router.post("/conversations/interrupts", response_model=Dict[str, Any])
async def create_conversation_interrupt(
    interrupt_data: Dict[str, Any],
    user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Create conversation interrupt record.
    - Records when conversations are interrupted or abandoned
    - Tracks reasons for interruption and context
    - Helps identify conversation flow issues and user experience problems
    """
    try:
        # Validate required fields
        required_fields = ["conversation_id", "interrupt_type"]
        for field in required_fields:
            if not interrupt_data.get(field):
                raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
        
        # Set metadata
        interrupt_data["user_id"] = user_id
        interrupt_data["created_at"] = datetime.utcnow().isoformat()
        
        # Insert conversation interrupt
        result = supabase.table("conversation_interrupts").insert(interrupt_data).execute()
        
        if result.data:
            logger.info(f"Created conversation interrupt {result.data[0]['id']} for conversation {interrupt_data['conversation_id']}")
            return {"success": True, "interrupt": result.data[0]}
        else:
            raise HTTPException(status_code=500, detail="Failed to create conversation interrupt")
            
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error creating conversation interrupt: {e}")
        raise HTTPException(status_code=500, detail="Failed to create conversation interrupt")


@router.get("/conversations/interrupts", response_model=Dict[str, Any])
async def get_conversation_interrupts(
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    conversation_id: Optional[str] = Query(None),
    interrupt_type: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Get conversation interrupts with filtering and pagination.
    - Supports filtering by conversation, interrupt type, and date
    - Returns interrupt data for analysis and optimization
    - Admin access shows all interrupts, users see only their own
    """
    try:
        # Check user permissions
        admin_result = supabase.table("admin_profiles").select("id, can_view_analytics").eq("user_id", user_id).execute()
        is_admin = admin_result.data and admin_result.data[0].get("can_view_analytics")
        
        query = supabase.table("conversation_interrupts").select("*")
        
        # Restrict to user's own interrupts if not admin
        if not is_admin:
            query = query.eq("user_id", user_id)
        
        # Apply filters
        if conversation_id:
            query = query.eq("conversation_id", conversation_id)
        if interrupt_type:
            query = query.eq("interrupt_type", interrupt_type)
        if date_from:
            query = query.gte("created_at", date_from)
        
        # Apply pagination and ordering
        result = (
            query
            .order("created_at", desc=True)
            .range(offset, offset + limit - 1)
            .execute()
        )
        
        logger.info(f"Retrieved {len(result.data)} conversation interrupts for user {user_id}")
        
        return {
            "success": True,
            "interrupts": result.data if result.data else [],
            "pagination": {
                "limit": limit,
                "offset": offset
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting conversation interrupts: {e}")
        raise HTTPException(status_code=500, detail="Failed to get conversation interrupts")


# Analytics Aggregation and Reports
@router.get("/reports/conversation-summary", response_model=Dict[str, Any])
async def get_conversation_summary_report(
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Get aggregated conversation analytics summary report.
    - Returns high-level metrics and KPIs
    - Includes conversation volume, satisfaction scores, and engagement metrics
    - Admin-only access for system-wide analytics
    """
    try:
        # Check if user has analytics access
        admin_result = supabase.table("admin_profiles").select("id, can_view_analytics").eq("user_id", user_id).execute()
        
        if not admin_result.data or not admin_result.data[0].get("can_view_analytics"):
            raise HTTPException(status_code=403, detail="Not authorized to view analytics reports")
        
        # Set default date range if not provided
        if not date_from:
            date_from = (datetime.utcnow() - timedelta(days=30)).isoformat()
        if not date_to:
            date_to = datetime.utcnow().isoformat()
        
        # Get conversation analytics summary
        analytics_query = (
            supabase.table("conversation_analytics")
            .select("*")
            .gte("created_at", date_from)
            .lte("created_at", date_to)
            .execute()
        )
        
        # Get feedback summary
        feedback_query = (
            supabase.table("conversation_feedback")
            .select("overall_rating, agent_helpfulness_rating, problem_solved")
            .gte("created_at", date_from)
            .lte("created_at", date_to)
            .execute()
        )
        
        # Calculate summary metrics
        analytics_data = analytics_query.data if analytics_query.data else []
        feedback_data = feedback_query.data if feedback_query.data else []
        
        total_conversations = len(analytics_data)
        avg_satisfaction = sum(f["overall_rating"] for f in feedback_data) / len(feedback_data) if feedback_data else 0
        avg_helpfulness = sum(f["agent_helpfulness_rating"] for f in feedback_data if f.get("agent_helpfulness_rating")) / len([f for f in feedback_data if f.get("agent_helpfulness_rating")]) if feedback_data else 0
        problem_solved_rate = sum(1 for f in feedback_data if f.get("problem_solved")) / len(feedback_data) if feedback_data else 0
        
        summary = {
            "date_range": {
                "from": date_from,
                "to": date_to
            },
            "metrics": {
                "total_conversations": total_conversations,
                "total_feedback_responses": len(feedback_data),
                "average_satisfaction_rating": round(avg_satisfaction, 2),
                "average_helpfulness_rating": round(avg_helpfulness, 2),
                "problem_solved_rate": round(problem_solved_rate * 100, 2)
            }
        }
        
        logger.info(f"Generated conversation summary report for user {user_id}")
        
        return {"success": True, "summary": summary}
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error generating conversation summary report: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate conversation summary report") 