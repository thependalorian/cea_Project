"""
Chat API endpoints for Climate Economy Assistant

This module handles all conversation-related endpoints including:
- Interactive chat with agents
- Conversation history
- Human-in-the-loop interventions
- Feedback submission
"""

import asyncio
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, Request
from pydantic import BaseModel

from adapters.models import ModelProvider, generate_completion
from adapters.supabase import get_supabase_client
from core.agents.langgraph_agents import (
    AgentState,
    add_human_input,
    create_agent_graph,
    should_escalate_to_human,
)
from core.agents.workflow import create_agent_workflow
from core.analytics import (
    complete_session,
    log_message,
    log_user_action,
    start_conversation,
)
from core.config import get_settings
from core.models import (
    ChatMessage,
    ChatResponse,
    ConversationInterrupt,
    ErrorResponseModel,
    InteractionRequest,
    MessageFeedback,
    StreamingChatResponse,
)

settings = get_settings()
router = APIRouter()


# Define model provider selection model
class ModelProviderSelection(BaseModel):
    provider: ModelProvider
    model: Optional[str] = None


# Define an endpoint to select the model provider
@router.post("/model-provider")
async def set_model_provider(selection: ModelProviderSelection):
    """
    Select the model provider to use for chat

    Args:
        selection: Model provider selection

    Returns:
        Dict: Success message
    """
    # Save to a session or cookie in a real implementation
    # Here we just return a success message
    return {
        "success": True,
        "message": f"Model provider set to {selection.provider}"
        + (f" with model {selection.model}" if selection.model else ""),
    }


# Add a parameter to chat endpoint to allow specifying provider
@router.post("/complete")
async def generate_chat_completion(
    messages: List[Dict[str, Any]],
    provider: Optional[ModelProvider] = None,
    model: Optional[str] = None,
    temperature: Optional[float] = None,
):
    """
    Generate a chat completion

    Args:
        messages: List of message objects
        provider: Model provider ("openai" or "groq")
        model: Model to use
        temperature: Sampling temperature

    Returns:
        Dict: Completion response
    """
    try:
        response = await generate_completion(
            messages=messages, provider=provider, model=model, temperature=temperature
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/interactive-chat", response_model=ChatResponse)
async def interactive_chat_endpoint(
    request: InteractionRequest, background_tasks: BackgroundTasks
):
    """
    Enhanced interactive chat with comprehensive analytics and HITL tracking
    """
    try:
        query = request.query
        user_id = request.user_id or "anonymous"
        conversation_id = request.session_id
        stream = request.stream
        context = request.context or {}

        # Start analytics tracking
        if not conversation_id:
            conversation_id = await start_conversation(user_id, query)
            await log_user_action(
                user_id,
                "conversation_started",
                {"query": query, "enhanced_agents": settings.ENABLE_ENHANCED_AGENTS},
            )

        # Log user message
        chat_msg = ChatMessage(
            conversation_id=conversation_id,
            user_id=user_id,
            content=query,
            role="user",
            metadata=context,
        )

        # Log the message in the background to avoid blocking
        background_tasks.add_task(
            log_message, conversation_id, "user", query, None, metadata=context
        )

        if stream:
            # Return streaming response
            return await stream_chat_response(query, user_id, conversation_id, context)
        else:
            # Execute workflow with timeout
            try:
                # Create the agent workflow
                agent_workflow = create_agent_workflow()

                # Prepare initial state
                initial_state = {
                    "messages": [{"role": "user", "content": query}],
                    "uuid": user_id,
                    "conversation_id": conversation_id,
                    "query": query,
                    "context": "climate_career_guidance",
                    "workflow_state": "active",
                }

                # Execute with timeout
                result = await asyncio.wait_for(
                    agent_workflow.ainvoke(initial_state), timeout=30.0
                )

                # Extract assistant response
                assistant_messages = [
                    msg
                    for msg in result.get("messages", [])
                    if (isinstance(msg, dict) and msg.get("role") == "assistant")
                    or (hasattr(msg, "type") and msg.type == "ai")
                ]

                if assistant_messages:
                    latest_response = assistant_messages[-1]
                    if isinstance(latest_response, dict):
                        response_content = latest_response.get("content", "")
                        specialist_used = latest_response.get("name", "unknown")
                    else:
                        response_content = latest_response.content
                        specialist_used = getattr(latest_response, "name", "unknown")

                    # Log assistant response in the background
                    background_tasks.add_task(
                        log_message,
                        conversation_id,
                        "assistant",
                        response_content,
                        specialist_used,
                        metadata={"enhanced_agents": True},
                    )

                    return ChatResponse(
                        content=response_content,
                        role="assistant",
                        specialist_type=specialist_used,
                        conversation_id=conversation_id,
                        metadata={"enhanced_agents": True},
                        sources=result.get("sources", []),
                    )
                else:
                    raise HTTPException(
                        status_code=500, detail="No assistant response generated"
                    )

            except asyncio.TimeoutError:
                # Handle timeout - raise error instead of fallback
                background_tasks.add_task(
                    log_user_action, user_id, "conversation_timeout", {"query": query}
                )
                raise HTTPException(
                    status_code=408,
                    detail="Request timeout - agent did not respond in time",
                )

            except Exception as e:
                # Handle other errors - raise instead of fallback
                background_tasks.add_task(
                    log_user_action,
                    user_id,
                    "conversation_error",
                    {"error": str(e), "query": query},
                )
                raise HTTPException(
                    status_code=500, detail=f"Agent processing error: {str(e)}"
                )

    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Handle unexpected errors
        if "user_id" in locals():
            background_tasks.add_task(
                log_user_action,
                user_id,
                "conversation_error",
                {"error": str(e), "query": request.query},
            )
        raise HTTPException(status_code=500, detail=str(e))


async def stream_chat_response(
    query: str, user_id: str, conversation_id: str, context: Dict[str, Any]
):
    """
    Stream chat response with event-based chunks
    """

    async def event_generator():
        try:
            # Create the agent workflow
            agent_workflow = create_agent_workflow()

            # Prepare initial state
            initial_state = {
                "messages": [{"role": "user", "content": query}],
                "uuid": user_id,
                "conversation_id": conversation_id,
                "query": query,
                "context": "climate_career_guidance",
                "workflow_state": "active",
            }

            # Start the workflow
            result_stream = agent_workflow.astream(initial_state)

            # Stream the chunks
            async for chunk in result_stream:
                # Extract the latest message
                if "messages" in chunk:
                    messages = chunk["messages"]
                    for msg in messages:
                        if hasattr(msg, "content") and msg.content:
                            yield StreamingChatResponse(
                                type="chunk",
                                content=msg.content,
                                session_id=conversation_id,
                            )

            # Signal completion
            yield StreamingChatResponse(type="complete", session_id=conversation_id)

        except Exception as e:
            # Handle errors in streaming
            yield StreamingChatResponse(
                type="error",
                content=str(e),
                session_id=conversation_id,
                data={"error": str(e)},
            )

    return event_generator()


@router.post("/conversation-feedback")
async def log_conversation_feedback(request: MessageFeedback):
    """
    Log user feedback on conversation quality
    """
    try:
        supabase = get_supabase_client()
        if not supabase:
            return ErrorResponseModel(
                error="Database connection unavailable", error_code="DB_UNAVAILABLE"
            )

        # Prepare feedback data
        feedback_data = {
            "id": request.id or f"feedback_{uuid.uuid4().hex}",
            "conversation_id": request.conversation_id,
            "message_id": request.message_id,
            "user_id": request.user_id,
            "feedback_type": request.feedback_type,
            "rating": request.rating,
            "correction": request.correction,
            "metadata": request.metadata or {},
            "created_at": datetime.now().isoformat(),
        }

        # Insert feedback
        supabase.table("conversation_feedback").insert(feedback_data).execute()

        # Update conversation analytics with satisfaction score if rating provided
        if request.rating and supabase:
            try:
                supabase.table("conversation_analytics").update(
                    {
                        "user_satisfaction_score": request.rating,
                        "analyzed_at": datetime.now().isoformat(),
                    }
                ).eq("conversation_id", request.conversation_id).execute()
            except Exception as analytics_error:
                print(f"Could not update satisfaction score: {analytics_error}")

        return {"success": True, "message": "Feedback logged successfully"}

    except Exception as e:
        return ErrorResponseModel(
            error=f"Failed to log feedback: {str(e)}", error_code="FEEDBACK_ERROR"
        )


@router.post("/conversation-interrupt")
async def create_conversation_interrupt(request: ConversationInterrupt):
    """
    Create a conversation interrupt for HITL (pause, flag, etc.)
    """
    try:
        supabase = get_supabase_client()
        if not supabase:
            return ErrorResponseModel(
                error="Database connection unavailable", error_code="DB_UNAVAILABLE"
            )

        # Insert interrupt record
        interrupt_data = request.dict()
        if not interrupt_data.get("id"):
            interrupt_data["id"] = f"interrupt_{uuid.uuid4().hex}"

        if not interrupt_data.get("created_at"):
            interrupt_data["created_at"] = datetime.now().isoformat()

        supabase.table("conversation_interrupts").insert(interrupt_data).execute()

        return {"success": True, "interrupt_id": interrupt_data["id"]}

    except Exception as e:
        return ErrorResponseModel(
            error=f"Failed to create interrupt: {str(e)}", error_code="INTERRUPT_ERROR"
        )


@router.post("/complete-conversation")
async def complete_conversation_endpoint(
    conversation_id: str,
    user_id: Optional[str] = None,
    outcome: Optional[str] = "completed",
    duration_seconds: Optional[int] = None,
):
    """
    Mark conversation as completed
    """
    try:
        # Complete conversation
        await complete_session(conversation_id, outcome)

        # Log audit action if user_id provided
        if user_id:
            await log_user_action(
                user_id,
                "conversation_completed",
                {
                    "conversation_id": conversation_id,
                    "outcome": outcome,
                    "duration_seconds": duration_seconds,
                },
            )

        return {
            "success": True,
            "message": f"Conversation {outcome} successfully",
            "conversation_id": conversation_id,
        }

    except Exception as e:
        return ErrorResponseModel(
            error=f"Failed to complete conversation: {str(e)}",
            error_code="COMPLETION_ERROR",
        )


# Add a new endpoint for LangGraph-based agent chat
@router.post("/langgraph-chat", response_model=ChatResponse)
async def langgraph_chat_endpoint(
    request: InteractionRequest, background_tasks: BackgroundTasks
):
    """
    Enhanced interactive chat using LangGraph-based multi-agent system
    """
    try:
        query = request.query
        user_id = request.user_id or "anonymous"
        conversation_id = request.session_id or str(uuid.uuid4())
        stream = request.stream
        context = request.context or {}

        # Start analytics tracking
        if not request.session_id:
            await start_conversation(user_id, query)
            await log_user_action(
                user_id,
                "conversation_started",
                {"query": query, "enhanced_agents": True, "using_langgraph": True},
            )

        # Log user message
        chat_msg = ChatMessage(
            conversation_id=conversation_id,
            user_id=user_id,
            content=query,
            role="user",
            metadata=context,
        )

        # Log the message in the background to avoid blocking
        background_tasks.add_task(
            log_message, conversation_id, "user", query, None, metadata=context
        )

        if stream:
            # Return streaming response (to be implemented)
            return await stream_langgraph_response(
                query, user_id, conversation_id, context
            )
        else:
            # Execute LangGraph workflow with timeout
            try:
                # Create the LangGraph agent workflow
                agent_workflow = await create_agent_graph()

                # Prepare initial state
                initial_state = AgentState(
                    messages=[{"role": "user", "content": query}],
                    uuid=user_id,
                    conversation_id=conversation_id,
                    query=query,
                    context="climate_career_guidance",
                    workflow_state="active",
                    human_input=None,
                    current_agent=None,
                )

                # Execute with timeout
                result = await asyncio.wait_for(
                    agent_workflow.ainvoke(initial_state), timeout=30.0
                )

                # Extract assistant response
                assistant_messages = [
                    msg
                    for msg in result.get("messages", [])
                    if (isinstance(msg, dict) and msg.get("role") == "assistant")
                    or (hasattr(msg, "type") and msg.type == "ai")
                    or (
                        hasattr(msg, "additional_kwargs")
                        and "specialist" in msg.additional_kwargs
                    )
                ]

                if assistant_messages:
                    latest_response = assistant_messages[-1]

                    # Extract content and specialist based on message type
                    if hasattr(latest_response, "content"):
                        response_content = latest_response.content
                        specialist_used = latest_response.additional_kwargs.get(
                            "specialist", "unknown"
                        )
                    elif isinstance(latest_response, dict):
                        response_content = latest_response.get("content", "")
                        specialist_used = latest_response.get("name", "unknown")
                    else:
                        response_content = str(latest_response)
                        specialist_used = "unknown"

                    # Log assistant response in the background
                    background_tasks.add_task(
                        log_message,
                        conversation_id,
                        "assistant",
                        response_content,
                        specialist_used,
                        metadata={"enhanced_agents": True, "using_langgraph": True},
                    )

                    return ChatResponse(
                        content=response_content,
                        role="assistant",
                        specialist_type=specialist_used,
                        conversation_id=conversation_id,
                        metadata={"enhanced_agents": True, "using_langgraph": True},
                        sources=result.get("sources", []),
                    )
                else:
                    raise HTTPException(
                        status_code=500, detail="No assistant response generated"
                    )

            except asyncio.TimeoutError:
                # Handle timeout - raise error instead of fallback
                background_tasks.add_task(
                    log_user_action,
                    user_id,
                    "conversation_timeout",
                    {"query": query, "using_langgraph": True},
                )
                raise HTTPException(
                    status_code=408,
                    detail="LangGraph agent timeout - request took too long",
                )

            except Exception as e:
                # Handle other errors - raise instead of fallback
                background_tasks.add_task(
                    log_user_action,
                    user_id,
                    "conversation_error",
                    {"error": str(e), "query": query, "using_langgraph": True},
                )
                raise HTTPException(
                    status_code=500, detail=f"LangGraph agent error: {str(e)}"
                )

    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Handle unexpected errors
        if "user_id" in locals():
            background_tasks.add_task(
                log_user_action,
                user_id,
                "conversation_error",
                {"error": str(e), "query": request.query, "using_langgraph": True},
            )
        raise HTTPException(status_code=500, detail=str(e))


# Streaming response handler for LangGraph-based chat
async def stream_langgraph_response(
    query: str, user_id: str, conversation_id: str, context: Dict[str, Any]
):
    """
    Stream chat response with event-based chunks using LangGraph
    """

    async def event_generator():
        try:
            # Create the LangGraph agent workflow
            agent_workflow = await create_agent_graph()

            # Prepare initial state
            initial_state = AgentState(
                messages=[{"role": "user", "content": query}],
                uuid=user_id,
                conversation_id=conversation_id,
                query=query,
                context="climate_career_guidance",
                workflow_state="active",
                human_input=None,
                current_agent=None,
            )

            # Start the workflow
            result_stream = agent_workflow.astream(initial_state)

            # Stream the chunks
            async for chunk in result_stream:
                # Extract the latest message
                if "messages" in chunk:
                    messages = chunk["messages"]
                    for msg in messages:
                        if (
                            isinstance(msg, dict)
                            and msg.get("role") == "assistant"
                            and msg.get("content")
                        ):
                            yield StreamingChatResponse(
                                type="chunk",
                                content=msg.get("content"),
                                session_id=conversation_id,
                            )
                        elif (
                            hasattr(msg, "content")
                            and msg.content
                            and hasattr(msg, "additional_kwargs")
                        ):
                            # Only yield new content if it's from the assistant
                            if "specialist" in msg.additional_kwargs:
                                yield StreamingChatResponse(
                                    type="chunk",
                                    content=msg.content,
                                    session_id=conversation_id,
                                    data={
                                        "specialist": msg.additional_kwargs.get(
                                            "specialist"
                                        )
                                    },
                                )

            # Signal completion
            yield StreamingChatResponse(type="complete", session_id=conversation_id)

        except Exception as e:
            # Handle errors in streaming
            yield StreamingChatResponse(
                type="error",
                content=str(e),
                session_id=conversation_id,
                data={"error": str(e)},
            )

    return event_generator()


# Add endpoint to submit human expert input for a conversation
@router.post("/human-input")
async def submit_human_input(
    conversation_id: str,
    message: str,
    expert_name: Optional[str] = "Massachusetts Climate Expert",
):
    """
    Submit human expert input for a pending conversation

    Args:
        conversation_id: Conversation ID
        message: Expert message content
        expert_name: Name of the expert

    Returns:
        Dict: Success message
    """
    try:
        # Add human input to the conversation
        success = await add_human_input(
            conversation_id=conversation_id,
            human_message=message,
            expert_name=expert_name,
        )

        if success:
            return {
                "success": True,
                "message": "Human input added successfully",
                "conversation_id": conversation_id,
            }
        else:
            return ErrorResponseModel(
                error="Failed to add human input", error_code="HUMAN_INPUT_ERROR"
            )

    except Exception as e:
        return ErrorResponseModel(
            error=f"Error adding human input: {str(e)}", error_code="HUMAN_INPUT_ERROR"
        )
