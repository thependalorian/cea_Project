"""
Chat Router - Climate Economy Assistant Chat Endpoints

Following rule #4: Vercel compatibility for endpoints
Following rule #6: Asynchronous data handling with streaming
Following rule #12: Complete code verification with proper chat endpoints

This router handles all chat-related API endpoints using Pendo as the intelligent supervisor.
Location: backendv1/endpoints/chat_router.py
"""

from typing import Dict, Any, List, Optional
from datetime import datetime

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from backendv1.utils.logger import setup_logger
from backendv1.workflows.pendo_supervisor import create_pendo_supervisor_workflow
from backendv1.endpoints.auth import get_current_user
from backendv1.models.user_model import UserProfile
from backendv1.config.settings import get_settings

logger = setup_logger("chat_router")
settings = get_settings()

router = APIRouter()

# Initialize Pendo supervisor workflow
pendo_workflow = create_pendo_supervisor_workflow()


class ChatMessage(BaseModel):
    """Chat message model"""

    content: str = Field(..., description="Message content")
    user_id: str = Field(..., description="User identifier")
    conversation_id: str = Field(..., description="Conversation identifier")
    message_type: str = Field(default="user", description="Message type")
    timestamp: Optional[str] = None


class ChatResponse(BaseModel):
    """Chat response model"""

    content: str = Field(..., description="Response content")
    specialist: str = Field(..., description="Responding specialist")
    confidence_score: float = Field(..., description="Response confidence")
    conversation_id: str = Field(..., description="Conversation identifier")
    timestamp: str = Field(..., description="Response timestamp")
    sources: List[str] = Field(default_factory=list, description="Information sources")
    next_actions: List[str] = Field(default_factory=list, description="Suggested next actions")
    routing_info: Optional[Dict[str, Any]] = Field(
        default=None, description="Pendo routing information"
    )


class ConversationHistory(BaseModel):
    """Conversation history model"""

    conversation_id: str
    messages: List[Dict[str, Any]]
    user_id: str
    created_at: str
    updated_at: str


@router.post("/message", response_model=ChatResponse)
async def send_chat_message(
    message: ChatMessage, current_user: UserProfile = Depends(get_current_user)
):
    """
    Send a chat message to Pendo, the climate economy assistant supervisor

    Following rule #6: Asynchronous data handling for performance
    Following rule #15: Include comprehensive error handling
    """
    try:
        logger.info(f"💬 Chat message from user {message.user_id} via Pendo supervisor")

        # Validate user permissions
        if current_user.id != message.user_id:
            raise HTTPException(status_code=403, detail="Unauthorized access to conversation")

        # Convert user profile to dict for Pendo
        user_profile_dict = {
            "id": current_user.id,
            "email": current_user.email,
            "user_type": current_user.user_type,
            "profile_data": getattr(current_user, "profile_data", {}),
        }

        # Process message through Pendo supervisor
        pendo_response = await pendo_workflow.process_user_message(
            user_message=message.content,
            user_id=message.user_id,
            conversation_id=message.conversation_id,
            user_profile=user_profile_dict,
            session_data={"authenticated": True, "user_type": current_user.user_type},
        )

        # Extract specialist information
        specialist_type = pendo_response.specialist_type
        if "pendo_coordinated_" in specialist_type:
            # Extract the actual specialist from coordinated response
            specialist = specialist_type.replace("pendo_coordinated_", "").replace(
                "_specialist", ""
            )
        elif specialist_type == "supervisor_coordinator":
            specialist = "pendo"
        else:
            specialist = specialist_type.replace("_specialist", "")

        # Create response
        response = ChatResponse(
            content=pendo_response.content,
            specialist=specialist,
            confidence_score=pendo_response.confidence_score,
            conversation_id=message.conversation_id,
            timestamp=datetime.utcnow().isoformat(),
            sources=pendo_response.sources,
            next_actions=pendo_response.next_actions,
            routing_info={
                "pendo_routing": pendo_response.metadata.get("pendo_routing", False),
                "specialist_delegated": pendo_response.metadata.get("specialist_delegated"),
                "routing_recommendation": pendo_response.metadata.get("routing_recommendation"),
                "combined_response": pendo_response.metadata.get("combined_response", False),
            },
        )

        logger.info(
            f"✅ Pendo coordinated response via {specialist} (confidence: {pendo_response.confidence_score:.3f})"
        )
        return response

    except Exception as e:
        logger.error(f"Error processing chat message through Pendo: {e}")
        raise HTTPException(status_code=500, detail=f"Pendo chat processing error: {str(e)}")


@router.post("/stream")
async def stream_chat_message(
    message: ChatMessage, current_user: UserProfile = Depends(get_current_user)
):
    """
    Stream a chat conversation with real-time updates through Pendo supervision

    Following rule #6: Asynchronous data handling with streaming
    """
    try:
        logger.info(f"🌊 Streaming chat for user {message.user_id} via Pendo supervisor")

        # Validate user permissions
        if current_user.id != message.user_id:
            raise HTTPException(status_code=403, detail="Unauthorized streaming access")

        # Convert user profile to dict for Pendo
        user_profile_dict = {
            "id": current_user.id,
            "email": current_user.email,
            "user_type": current_user.user_type,
            "profile_data": getattr(current_user, "profile_data", {}),
        }

        async def generate_pendo_stream():
            try:
                # Stream through Pendo supervisor
                async for update in pendo_workflow.stream_conversation(
                    user_message=message.content,
                    user_id=message.user_id,
                    conversation_id=message.conversation_id,
                    user_profile=user_profile_dict,
                    session_data={"authenticated": True, "user_type": current_user.user_type},
                ):
                    # Format update for streaming
                    if update:
                        yield f"data: {update}\n\n"

                yield "data: [DONE]\n\n"

            except Exception as e:
                logger.error(f"Error in Pendo chat streaming: {e}")
                yield f'data: {{"type": "error", "message": "Pendo streaming error: {str(e)}"}}\n\n'

        return StreamingResponse(
            generate_pendo_stream(),
            media_type="text/plain",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Supervisor": "Pendo",
            },
        )

    except Exception as e:
        logger.error(f"Error setting up Pendo chat stream: {e}")
        raise HTTPException(status_code=500, detail=f"Pendo streaming setup error: {str(e)}")


@router.get("/history/{conversation_id}", response_model=ConversationHistory)
async def get_conversation_history(
    conversation_id: str, current_user: UserProfile = Depends(get_current_user)
):
    """
    Get conversation history for a specific conversation through Pendo analysis

    Following rule #17: Secure database access with proper authentication
    """
    try:
        logger.info(f"📚 Retrieving Pendo-managed history for conversation {conversation_id}")

        # Get conversation summary from Pendo
        summary = await pendo_workflow.get_conversation_summary(
            conversation_id=conversation_id, user_id=current_user.id
        )

        # Convert to expected format
        history = ConversationHistory(
            conversation_id=conversation_id,
            messages=summary.get("conversation_history", []),
            user_id=current_user.id,
            created_at=summary.get("started_at", datetime.utcnow().isoformat()),
            updated_at=summary.get("last_updated", datetime.utcnow().isoformat()),
        )

        logger.info(f"✅ Retrieved {summary.get('message_count', 0)} messages via Pendo")
        return history

    except Exception as e:
        logger.error(f"Error retrieving Pendo conversation history: {e}")
        raise HTTPException(status_code=500, detail=f"Pendo history retrieval error: {str(e)}")


@router.get("/summary/{conversation_id}")
async def get_conversation_summary(
    conversation_id: str, current_user: UserProfile = Depends(get_current_user)
):
    """
    Get AI-generated conversation summary through Pendo analysis

    Following rule #6: Asynchronous data handling for performance
    """
    try:
        logger.info(f"📊 Generating Pendo conversation summary for {conversation_id}")

        # Get Pendo's analysis
        summary = await pendo_workflow.get_conversation_summary(
            conversation_id=conversation_id, user_id=current_user.id
        )

        logger.info(f"✅ Pendo generated summary for {summary.get('message_count', 0)} messages")
        return summary

    except Exception as e:
        logger.error(f"Error generating Pendo conversation summary: {e}")
        raise HTTPException(status_code=500, detail=f"Pendo summary error: {str(e)}")


@router.delete("/conversation/{conversation_id}")
async def delete_conversation(
    conversation_id: str, current_user: UserProfile = Depends(get_current_user)
):
    """
    Delete a conversation and clear Pendo's memory

    Following rule #17: Secure database access with proper authentication
    """
    try:
        logger.info(f"🗑️ Deleting Pendo conversation {conversation_id}")

        # Clear from Pendo's memory
        if (
            hasattr(pendo_workflow, "conversation_history")
            and conversation_id in pendo_workflow.conversation_history
        ):
            del pendo_workflow.conversation_history[conversation_id]

        # Clear session tracking
        session_key = f"{current_user.id}_{conversation_id}"
        if (
            hasattr(pendo_workflow, "session_tracking")
            and session_key in pendo_workflow.session_tracking
        ):
            del pendo_workflow.session_tracking[session_key]

        logger.info(f"✅ Pendo conversation {conversation_id} deleted")
        return {"message": "Conversation deleted successfully", "conversation_id": conversation_id}

    except Exception as e:
        logger.error(f"Error deleting Pendo conversation: {e}")
        raise HTTPException(status_code=500, detail=f"Pendo deletion error: {str(e)}")


@router.get("/conversations")
async def list_user_conversations(
    current_user: UserProfile = Depends(get_current_user), limit: int = 20, offset: int = 0
):
    """
    List user conversations managed by Pendo

    Following rule #17: Secure database access with proper authentication
    """
    try:
        logger.info(f"📋 Listing Pendo conversations for user {current_user.id}")

        # Get session stats from Pendo
        session_stats = pendo_workflow.get_session_stats(current_user.id)

        # Get conversation summaries
        conversations = []
        if hasattr(pendo_workflow, "conversation_history"):
            user_conversations = {
                conv_id: history
                for conv_id, history in pendo_workflow.conversation_history.items()
                if any(msg.get("user_id") == current_user.id for msg in history)
            }

            for conv_id, history in list(user_conversations.items())[offset : offset + limit]:
                if history:
                    conversations.append(
                        {
                            "conversation_id": conv_id,
                            "message_count": len(history),
                            "last_message": (
                                history[-1].get("content", "")[:100] + "..."
                                if len(history[-1].get("content", "")) > 100
                                else history[-1].get("content", "")
                            ),
                            "last_updated": history[-1].get("timestamp"),
                            "specialists_involved": list(
                                set(
                                    [
                                        msg.get("specialist", "pendo")
                                        for msg in history
                                        if msg.get("type") == "assistant"
                                    ]
                                )
                            ),
                        }
                    )

        result = {
            "conversations": conversations,
            "total_count": len(conversations),
            "session_stats": session_stats,
            "limit": limit,
            "offset": offset,
        }

        logger.info(f"✅ Listed {len(conversations)} Pendo conversations")
        return result

    except Exception as e:
        logger.error(f"Error listing Pendo conversations: {e}")
        raise HTTPException(status_code=500, detail=f"Pendo conversation listing error: {str(e)}")


@router.get("/stats")
async def get_user_chat_stats(current_user: UserProfile = Depends(get_current_user)):
    """
    Get user chat statistics from Pendo

    Following rule #6: Asynchronous data handling for performance
    """
    try:
        logger.info(f"📈 Getting Pendo chat stats for user {current_user.id}")

        # Get comprehensive stats from Pendo
        session_stats = pendo_workflow.get_session_stats(current_user.id)

        # Add additional metadata
        stats = {
            **session_stats,
            "pendo_supervisor": True,
            "available_specialists": [
                "alex",
                "mai",
                "marcus",
                "liv",
                "miguel",
                "jasmine",
                "lauren",
            ],
            "last_updated": datetime.utcnow().isoformat(),
        }

        logger.info(f"✅ Retrieved Pendo stats: {session_stats.get('total_sessions', 0)} sessions")
        return stats

    except Exception as e:
        logger.error(f"Error getting Pendo chat stats: {e}")
        raise HTTPException(status_code=500, detail=f"Pendo stats error: {str(e)}")


# Health check endpoint for Pendo supervisor
@router.get("/health")
async def chat_health_check():
    """
    Health check for Pendo supervisor chat system
    """
    try:
        # Check if Pendo is responsive
        pendo_status = "operational" if pendo_workflow.pendo else "unavailable"

        return {
            "status": "healthy",
            "supervisor": "pendo",
            "pendo_status": pendo_status,
            "specialists_available": 7,
            "timestamp": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        logger.error(f"Pendo health check failed: {e}")
        return {
            "status": "unhealthy",
            "supervisor": "pendo",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat(),
        }


# Export the router
# Export the router with both names for compatibility
chat_router = router
__all__ = ["router", "chat_router"]
