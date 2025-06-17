"""
Enhanced Streaming Endpoint with LangGraph Flow Control
Implements 2025 best practices for real-time agent streaming
"""

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
import asyncio
import json
from typing import AsyncGenerator, Dict, Any, TYPE_CHECKING
from pydantic import BaseModel
from langchain_core.messages import HumanMessage

from ..workflows.climate_supervisor_workflow import (
    create_climate_supervisor_workflow,
    AdvancedInvokeManager,
    WorkflowResourceManager,
)

# Use string import for ClimateAgentState to avoid circular import
if TYPE_CHECKING:
    from ..workflows.climate_supervisor_workflow import ClimateAgentState

router = APIRouter()


class StreamingRequest(BaseModel):
    message: str
    user_id: str
    conversation_id: str = ""
    stream_mode: str = "values"  # values, updates, messages, debug


@router.post("/stream-chat")
async def stream_chat_endpoint(request: StreamingRequest):
    """
    Enhanced streaming chat with LangGraph flow control and advanced invoke patterns

    Stream modes:
    - values: Full state after each step
    - updates: Only state changes
    - messages: LLM token-by-token streaming
    - debug: Full debug information with flow control metrics
    """

    async def generate_stream() -> AsyncGenerator[str, None]:
        try:
            # Initialize workflow
            workflow = create_climate_supervisor_workflow()

            # Create initial state with flow control
            initial_state = {
                "messages": [HumanMessage(request.message)],
                "user_id": request.user_id,
                "conversation_id": request.conversation_id
                or f"stream_{request.user_id}_{int(asyncio.get_event_loop().time())}",
                "flow_control": None,  # Will be initialized in supervisor
            }

            # Stream based on mode
            if request.stream_mode == "values":
                async for chunk in stream_values_mode(workflow, initial_state):
                    yield f"data: {json.dumps(chunk)}\n\n"

            elif request.stream_mode == "updates":
                async for chunk in stream_updates_mode(workflow, initial_state):
                    yield f"data: {json.dumps(chunk)}\n\n"

            elif request.stream_mode == "messages":
                async for chunk in stream_messages_mode(workflow, initial_state):
                    yield f"data: {json.dumps(chunk)}\n\n"

            elif request.stream_mode == "debug":
                async for chunk in stream_debug_mode(workflow, initial_state):
                    yield f"data: {json.dumps(chunk)}\n\n"

            # Final completion message
            yield f"data: {json.dumps({'type': 'completion', 'status': 'done'})}\n\n"

        except Exception as e:
            error_response = {"type": "error", "error": str(e), "circuit_breaker": True}
            yield f"data: {json.dumps(error_response)}\n\n"

    return StreamingResponse(
        generate_stream(),
        media_type="text/plain",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Content-Type": "text/event-stream",
        },
    )


async def stream_values_mode(
    workflow, state: Dict[str, Any]
) -> AsyncGenerator[Dict[str, Any], None]:
    """Stream full state values after each step"""
    async for event in workflow.astream(state, stream_mode="values"):
        # Add flow control metrics
        flow_metrics = {}
        flow_control = state.get("flow_control")
        if flow_control:
            flow_metrics = {
                "step_count": getattr(flow_control, "step_count", 0),
                "specialist_calls": getattr(flow_control, "specialist_calls", {}),
                "circuit_breaker_trips": getattr(
                    flow_control, "circuit_breaker_trips", 0
                ),
            }

        yield {
            "type": "state_update",
            "event": event,
            "flow_metrics": flow_metrics,
            "timestamp": asyncio.get_event_loop().time(),
        }


async def stream_updates_mode(
    workflow, state: Dict[str, Any]
) -> AsyncGenerator[Dict[str, Any], None]:
    """Stream only state updates/changes"""
    async for event in workflow.astream(state, stream_mode="updates"):
        yield {
            "type": "state_delta",
            "update": event,
            "timestamp": asyncio.get_event_loop().time(),
        }


async def stream_messages_mode(
    workflow, state: Dict[str, Any]
) -> AsyncGenerator[Dict[str, Any], None]:
    """Stream LLM messages token by token"""
    async for event in workflow.astream_events(state, version="v1"):
        if event["event"] == "on_chat_model_stream":
            token = event["data"]["chunk"].content
            yield {
                "type": "token",
                "token": token,
                "agent": event.get("metadata", {}).get("agent", "unknown"),
            }


async def stream_debug_mode(
    workflow, state: Dict[str, Any]
) -> AsyncGenerator[Dict[str, Any], None]:
    """Stream full debug information with flow control details"""
    async for event in workflow.astream_events(state, version="v1"):
        debug_info = {
            "type": "debug",
            "event_type": event["event"],
            "event_data": event.get("data", {}),
            "metadata": event.get("metadata", {}),
            "timestamp": asyncio.get_event_loop().time(),
        }

        # Add flow control debug info
        flow_control = state.get("flow_control")
        if flow_control:
            debug_info["flow_control"] = {
                "step_count": getattr(flow_control, "step_count", 0),
                "specialist_calls": getattr(flow_control, "specialist_calls", {}),
                "empathy_attempts": getattr(flow_control, "empathy_attempts", 0),
                "confidence_checks": getattr(flow_control, "confidence_checks", 0),
                "last_action": getattr(flow_control, "last_action", ""),
            }

        yield debug_info
