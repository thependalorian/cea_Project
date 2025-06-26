"""
LangGraph routes for the Climate Economy Assistant.
"""

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
import structlog
from datetime import datetime
import uuid

from backend.api.middleware.auth import verify_token
from backend.agents.langgraph.framework import (
    create_climate_assistant_graph,
    process_message_with_graph,
    ConversationState,
)
from backend.api.models.langgraph import GraphRequest, GraphResponse
from backend.api.services.langgraph_service import LanggraphService

router = APIRouter()
logger = structlog.get_logger(__name__)


class RunRequest(BaseModel):
    """Request model for running LangGraph workflow"""

    workflow_id: str
    input_data: Dict[str, Any]
    config: Optional[Dict[str, Any]] = None


class MessageRequest(BaseModel):
    """Request model for processing messages with LangGraph"""

    message: str
    conversation_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class StatusResponse(BaseModel):
    """Response model for workflow status"""

    workflow_id: str
    status: str
    progress: float
    started_at: datetime
    updated_at: datetime
    metadata: Dict[str, Any] = {}


@router.post("/run")
async def run_workflow(
    request: RunRequest, user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """Run a LangGraph workflow"""
    try:
        # Use the available process_message_with_graph function
        result = await process_message_with_graph(
            message=str(request.input_data.get("message", "")),
            user_id=user_id,
            conversation_id=request.workflow_id,
            config=request.config,
        )

        return {
            "workflow_id": request.workflow_id,
            "status": "completed",
            "result": result,
        }

    except Exception as e:
        logger.error(
            "workflow_execution_failed",
            error=str(e),
            workflow_id=request.workflow_id,
            user_id=user_id,
        )
        raise HTTPException(
            status_code=500, detail=f"Workflow execution failed: {str(e)}"
        )


@router.post("/message")
async def process_message(
    request: MessageRequest, user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """Process a message through the LangGraph framework"""
    try:
        conversation_id = request.conversation_id or str(uuid.uuid4())

        result = await process_message_with_graph(
            message=request.message,
            user_id=user_id,
            conversation_id=conversation_id,
            config=request.metadata,
        )

        return {
            "conversation_id": conversation_id,
            "status": "completed",
            "result": result,
        }

    except Exception as e:
        logger.error("message_processing_failed", error=str(e), user_id=user_id)
        raise HTTPException(
            status_code=500, detail=f"Message processing failed: {str(e)}"
        )


@router.get("/status/{workflow_id}", response_model=StatusResponse)
async def get_workflow_status(
    workflow_id: str, user_id: str = Depends(verify_token)
) -> StatusResponse:
    """Get status of a workflow"""
    try:
        # For now, return a basic status since we don't have persistent workflow tracking
        return StatusResponse(
            workflow_id=workflow_id,
            status="completed",
            progress=1.0,
            started_at=datetime.now(),
            updated_at=datetime.now(),
            metadata={},
        )

    except Exception as e:
        logger.error(
            "workflow_status_check_failed",
            error=str(e),
            workflow_id=workflow_id,
            user_id=user_id,
        )
        raise HTTPException(
            status_code=500, detail=f"Failed to get workflow status: {str(e)}"
        )


@router.get("/stream/{workflow_id}")
async def stream_workflow(
    workflow_id: str, user_id: str = Depends(verify_token)
) -> StreamingResponse:
    """Stream workflow results"""
    try:

        async def generate():
            yield f"data: {{'status': 'started', 'workflow_id': '{workflow_id}'}}\n\n"
            yield f"data: {{'status': 'completed', 'workflow_id': '{workflow_id}'}}\n\n"

        return StreamingResponse(generate(), media_type="text/event-stream")

    except Exception as e:
        logger.error(
            "workflow_streaming_failed",
            error=str(e),
            workflow_id=workflow_id,
            user_id=user_id,
        )
        raise HTTPException(
            status_code=500, detail=f"Failed to stream workflow: {str(e)}"
        )
