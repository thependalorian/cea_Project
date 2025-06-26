"""
Conversation routes for the Climate Economy Assistant.
"""

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from fastapi.responses import StreamingResponse
from typing import Dict, List, Any, Optional
from datetime import datetime
import structlog
import uuid

from backend.api.middleware.auth import verify_token
from backend.agents.base.agent_base import AgentState
from backend.database.supabase_client import supabase
from backend.api.models.conversation import (
    ConversationCreate,
    ConversationResponse,
    MessageCreate,
    MessageResponse,
)
from backend.api.models.validation import (
    ConversationCreateRequest,
    MessageCreateRequest,
    ConversationListResponse,
    BaseResponse,
    ErrorResponse,
)
from backend.api.services.conversation_service import ConversationService

logger = structlog.get_logger(__name__)
router = APIRouter()


@router.get("/", response_model=ConversationListResponse)
async def list_conversations(
    limit: int = 10, offset: int = 0, user_id: str = Depends(verify_token)
) -> ConversationListResponse:
    """List user's conversations with pagination"""
    try:
        service = ConversationService()
        conversations = await service.list_conversations(user_id, limit, offset)
        return ConversationListResponse(
            success=True,
            message="Conversations retrieved successfully",
            data={
                "conversations": conversations,
                "total": len(conversations),
                "limit": limit,
                "offset": offset,
            },
        )
    except Exception as e:
        logger.error("conversation_list_failed", error=str(e), user_id=user_id)
        raise HTTPException(
            status_code=500, detail=f"Failed to list conversations: {str(e)}"
        )


@router.post("/", response_model=BaseResponse)
async def create_conversation(
    data: ConversationCreateRequest, user_id: str = Depends(verify_token)
) -> BaseResponse:
    """Create a new conversation."""
    try:
        service = ConversationService()
        conversation = await service.create_conversation(user_id, data)
        return conversation
    except Exception as e:
        logger.error(f"Error creating conversation: {e}")
        raise HTTPException(status_code=500, detail="Failed to create conversation")


@router.get("/{conversation_id}")
async def get_conversation(
    conversation_id: str, user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """Get a conversation by ID."""
    try:
        service = ConversationService()
        conversation = await service.get_conversation(conversation_id, user_id)
        if not conversation:
            raise HTTPException(
                status_code=404, detail=f"Conversation {conversation_id} not found"
            )
        return conversation
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error getting conversation: {e}")
        raise HTTPException(status_code=500, detail="Failed to get conversation")


@router.post("/{conversation_id}/messages", response_model=BaseResponse)
async def send_message(
    conversation_id: str,
    message: MessageCreateRequest,
    user_id: str = Depends(verify_token),
) -> BaseResponse:
    """Send a message in a conversation."""
    try:
        service = ConversationService()
        # Check if conversation exists
        conversation = await service.get_conversation(conversation_id, user_id)
        if not conversation:
            raise HTTPException(
                status_code=404, detail=f"Conversation {conversation_id} not found"
            )

        # Send message
        result = await service.send_message(conversation_id, user_id, message)
        return result
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error sending message: {e}")
        raise HTTPException(status_code=500, detail="Failed to send message")


@router.delete("/{conversation_id}")
async def delete_conversation(
    conversation_id: str, user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """Delete a conversation."""
    try:
        service = ConversationService()
        # Check if conversation exists
        conversation = await service.get_conversation(conversation_id, user_id)
        if not conversation:
            raise HTTPException(
                status_code=404, detail=f"Conversation {conversation_id} not found"
            )

        # Delete conversation
        success = await service.delete_conversation(conversation_id, user_id)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to delete conversation")

        return {"message": "Conversation deleted successfully"}
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error deleting conversation: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete conversation")


async def _process_conversation_async(conversation_id: str, state: AgentState) -> None:
    """Background task for processing conversation"""
    try:
        # Additional processing like:
        # - Updating analytics
        # - Training models
        # - Generating summaries
        pass
    except Exception as e:
        logger.error(
            "async_processing_failed", error=str(e), conversation_id=conversation_id
        )
