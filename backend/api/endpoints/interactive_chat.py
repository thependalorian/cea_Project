"""
Interactive chat endpoints for real-time messaging
with WebSocket support for the Climate Economy Assistant
"""

import asyncio
import json
import logging
import uuid
from typing import Any, Dict, List, Optional

from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    HTTPException,
    Request,
    WebSocket,
    WebSocketDisconnect,
)
from pydantic import BaseModel, Field
from datetime import datetime

from core.config import get_settings
from adapters.models import get_default_provider

from adapters.database import db
from adapters.openai import get_openai_client
from adapters.supabase import get_supabase_client
from core.agents.langgraph_agents import AgentState as LangGraphState
from core.agents.langgraph_agents import (
    add_human_input,
    create_agent_graph,
    should_escalate_to_human,
)
from core.agents.environmental import EnvironmentalJusticeSpecialist
from core.agents.international import InternationalSpecialist
from core.agents.veteran import VeteranSpecialist
from core.models import (
    AgentState,
    ChatMessage,
    Conversation,
    ConversationAnalytics,
    ConversationInterrupt,
)
from core.prompts import MA_RESOURCE_ANALYST_PROMPT
from tools.analytics import (
    extract_conversation_insights,
    log_conversation_analytics,
    log_specialist_interaction,
)

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("cea_interactive_chat")

# Create router
router = APIRouter()


class ChatRequest(BaseModel):
    """Chat request model"""

    message: str
    user_id: str
    conversation_id: Optional[str] = None
    context: Optional[str] = "general"
    include_resume_context: Optional[bool] = True
    metadata: Optional[Dict[str, Any]] = {}
    use_langgraph: Optional[bool] = False


class ChatResponse(BaseModel):
    """Chat response model"""

    message: str
    conversation_id: str
    metadata: Optional[Dict[str, Any]] = {}
    sources: Optional[List[Dict[str, Any]]] = []
    specialist_type: Optional[str] = None


@router.post("/interactive-chat", response_model=ChatResponse, tags=["chat"])
async def interactive_chat(
    request: ChatRequest, background_tasks: BackgroundTasks, http_request: Request
):
    """
    Interactive chat with specialist agents - no fallback mode
    """
    try:
        # Use LangGraph if requested and available
        if request.use_langgraph:
            return await langgraph_chat(request, background_tasks, http_request)

        # Generate conversation ID if not provided
        conversation_id = request.conversation_id or f"conv_{uuid.uuid4().hex[:8]}"

        # Route to appropriate specialist
        response_message, specialist_type, metadata = await route_to_specialist(
            request.message,
            request.user_id,
            conversation_id,
            request.context,
            request.include_resume_context,
        )

        # Create chat message for logging
        chat_message = ChatMessage(
            conversation_id=conversation_id,
            user_id=request.user_id,
            content=request.message,
            role="user",
            specialist_type=specialist_type,
            metadata=request.metadata,
        )

        # Log the conversation in the background
        background_tasks.add_task(log_message, chat_message)

        # Create response message for logging
        response_chat_message = ChatMessage(
            conversation_id=conversation_id,
            user_id=request.user_id,
            content=response_message,
            role="assistant",
            specialist_type=specialist_type,
            metadata=metadata,
        )

        # Log the response in the background
        background_tasks.add_task(log_message, response_chat_message)

        # Log conversation analytics
        background_tasks.add_task(
            analyze_conversation,
            conversation_id,
            request.user_id,
            request.message,
            response_message,
        )

        return ChatResponse(
            message=response_message,
            conversation_id=conversation_id,
            metadata=metadata,
            specialist_type=specialist_type,
        )

    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Log error and raise HTTP exception
        if "conversation_id" in locals():
            background_tasks.add_task(
                log_user_action,
                request.user_id,
                "conversation_error",
                {"error": str(e), "conversation_id": conversation_id},
            )
        raise HTTPException(status_code=500, detail=f"Chat processing error: {str(e)}")


@router.post("/langgraph-chat", response_model=ChatResponse, tags=["chat"])
async def langgraph_chat(
    request: ChatRequest, background_tasks: BackgroundTasks, http_request: Request
):
    """
    Enhanced chat using LangGraph multi-agent system - no fallback mode
    """
    try:
        # Generate conversation ID if not provided
        conversation_id = request.conversation_id or f"conv_{uuid.uuid4().hex[:8]}"

        # Create agent workflow
        try:
            agent_workflow = await create_agent_graph()
        except Exception as e:
            raise HTTPException(
                status_code=503, detail=f"Agent system unavailable: {str(e)}"
            )

            # Prepare initial state
        initial_state = {
            "messages": [{"role": "user", "content": request.message}],
            "uuid": request.user_id,
            "conversation_id": conversation_id,
            "query": request.message,
            "context": request.context or "climate_career_guidance",
            "workflow_state": "active",
            "human_input": None,
            "current_agent": None,
        }

        # Execute workflow with timeout
        try:
            result = await asyncio.wait_for(
                agent_workflow.ainvoke(initial_state), timeout=45.0
            )
        except asyncio.TimeoutError:
            background_tasks.add_task(
                log_user_action,
                request.user_id,
                "langgraph_timeout",
                {"conversation_id": conversation_id, "message": request.message},
            )
            raise HTTPException(
                status_code=408, detail="Agent response timeout - request took too long"
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

        if not assistant_messages:
            raise HTTPException(
                status_code=500, detail="No response generated by agent system"
            )

        latest_response = assistant_messages[-1]

        # Extract content and specialist
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

        # Create metadata
        metadata = {
            "enhanced_agents": True,
            "using_langgraph": True,
            "agent_workflow": True,
            "specialist": specialist_used,
            "sources": result.get("sources", []),
        }

        # Create chat messages for logging
        user_message = ChatMessage(
            conversation_id=conversation_id,
            user_id=request.user_id,
            content=request.message,
            role="user",
            specialist_type=specialist_used,
            metadata=request.metadata,
        )

        assistant_message = ChatMessage(
            conversation_id=conversation_id,
            user_id=request.user_id,
            content=response_content,
            role="assistant",
            specialist_type=specialist_used,
            metadata=metadata,
        )

        # Log messages in background
        background_tasks.add_task(log_message, user_message)
        background_tasks.add_task(log_message, assistant_message)

        # Log analytics
        background_tasks.add_task(
            analyze_conversation,
            conversation_id,
            request.user_id,
            request.message,
            response_content,
        )

        return ChatResponse(
            message=response_content,
            conversation_id=conversation_id,
            metadata=metadata,
            specialist_type=specialist_used,
            sources=result.get("sources", []),
        )

    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Log the error
        logger.error(f"LangGraph chat error: {str(e)}", exc_info=True)

        # Create error response
        if "conversation_id" in locals():
            background_tasks.add_task(
                log_user_action,
                request.user_id,
                "langgraph_error",
                {"error": str(e), "conversation_id": conversation_id},
            )
            raise HTTPException(
                status_code=500, detail=f"LangGraph processing error: {str(e)}"
            )
        else:
            raise HTTPException(
                status_code=500, detail=f"LangGraph initialization error: {str(e)}"
            )


async def route_to_specialist(
    message: str,
    user_id: str,
    conversation_id: str,
    context: str = "general",
    include_resume_context: bool = True,
) -> tuple[str, str, Dict[str, Any]]:
    """
    Route message to appropriate specialist agent - no fallback mode
    """
    try:
        # Determine specialist type
        specialist_type = determine_specialist_type(message, context)

        # Create appropriate agent
        if specialist_type == "jasmine":
            agent = MAResourceAnalystAgent()
            response_data = await agent.handle_message(
                message, user_id, conversation_id
            )
        elif specialist_type == "marcus":
            agent = VeteranSpecialist()
            response_data = await agent.handle_message(
                message, user_id, conversation_id
            )
        elif specialist_type == "liv":
            agent = InternationalSpecialist()
            response_data = await agent.handle_message(
                message, user_id, conversation_id
            )
        elif specialist_type == "miguel":
            # Use ToolSpecialist for environmental justice for now
            agent = ToolSpecialist()
            response_data = await agent.handle_message(
                message, user_id, conversation_id
            )
        else:
            # Default to general specialist
            agent = ToolSpecialist()
            response_data = await agent.handle_message(
                message, user_id, conversation_id
            )

        # Extract response content
        response_content = response_data.get("content", "")
        metadata = response_data.get("metadata", {})

        if not response_content:
            raise HTTPException(status_code=500, detail="Agent returned empty response")

        return response_content, specialist_type, metadata

    except Exception as e:
        # Log error and raise
        await log_user_action(
            user_id,
            "specialist_routing_error",
            {
                "error": str(e),
                "specialist_type": (
                    specialist_type if "specialist_type" in locals() else "unknown"
                ),
            },
        )
        raise HTTPException(
            status_code=500, detail=f"Specialist routing error: {str(e)}"
        )


def determine_specialist_type(message: str, context: str = "general") -> str:
    """
    Determine which specialist should handle the message
    """
    message_lower = message.lower()

    # Veteran keywords
    if any(
        keyword in message_lower
        for keyword in ["veteran", "military", "army", "navy", "marine", "air force"]
    ):
        return "marcus"

    # International keywords
    if any(
        keyword in message_lower
        for keyword in ["international", "visa", "credential", "degree", "foreign"]
    ):
        return "liv"

    # Environmental justice keywords
    if any(
        keyword in message_lower
        for keyword in [
            "environmental justice",
            "community",
            "gateway cities",
            "equity",
        ]
    ):
        return "miguel"

    # Default to Massachusetts resource analyst
    return "jasmine"


def get_specialist_prompt(specialist_type: str) -> str:
    """
    Get the appropriate prompt for the specialist
    """
    prompts = {
        "jasmine": MA_RESOURCE_ANALYST_PROMPT,
        "marcus": VETERAN_SPECIALIST_PROMPT,
        "liv": INTERNATIONAL_SPECIALIST_PROMPT,
        "miguel": ENVIRONMENTAL_JUSTICE_SPECIALIST_PROMPT,
        "supervisor": SUPERVISOR_SYSTEM_PROMPT,
    }
    return prompts.get(specialist_type, MA_RESOURCE_ANALYST_PROMPT)


async def log_message(message: ChatMessage):
    """
    Log chat message to database
    """
    try:
        await db.insert("conversation_messages", message)
        logger.info(
            f"Logged {message.role} message to conversation {message.conversation_id}"
        )
    except Exception as e:
        logger.error(f"Error logging message: {e}")


async def log_new_conversation(conversation: Conversation):
    """
    Log new conversation to database
    """
    try:
        await db.insert("conversations", conversation)
        logger.info(f"Created new conversation: {conversation.id}")
    except Exception as e:
        logger.error(f"Error creating conversation: {e}")


async def update_conversation_activity(conversation_id: str):
    """
    Update conversation last activity timestamp
    """
    try:
        update_data = {
            "last_activity": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "message_count": None,  # Will be incremented in database
        }
        await db.update("conversations", update_data, "id", conversation_id)
        logger.info(f"Updated conversation activity: {conversation_id}")
    except Exception as e:
        logger.error(f"Error updating conversation activity: {e}")


async def analyze_conversation(
    conversation_id: str, user_id: str, user_message: str, assistant_message: str
):
    """
    Analyze conversation for insights and improvement
    """
    try:
        # Extract conversation insights using the tool
        insights = await extract_conversation_insights(
            conversation_history=[
                {"role": "user", "content": user_message},
                {"role": "assistant", "content": assistant_message},
            ]
        )

        # Log conversation analytics
        analytics_data = {
            "conversation_id": conversation_id,
            "user_id": user_id,
            "messages_count": 2,  # User + assistant
            "user_satisfaction_estimated": insights.get("user_satisfaction", 0.7),
            "topics_discussed": insights.get("topics", []),
            "insights": insights,
            "analyzed_at": datetime.now().isoformat(),
        }

        await log_conversation_analytics(
            user_id=user_id,
            conversation_id=conversation_id,
            analytics_data=analytics_data,
        )

    except Exception as e:
        logger.error(f"Error analyzing conversation: {e}")


class FeedbackRequest(BaseModel):
    """Feedback request model"""

    conversation_id: str
    message_id: str
    user_id: str
    feedback_type: str = "rating"  # rating, correction, flag
    rating: Optional[int] = None
    correction: Optional[str] = None
    flag_reason: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = {}


class FeedbackResponse(BaseModel):
    """Feedback response model"""

    success: bool
    message: str
    feedback_id: Optional[str] = None


@router.post("/conversation-feedback", response_model=FeedbackResponse, tags=["chat"])
async def conversation_feedback(request: FeedbackRequest):
    """
    Submit feedback on conversation quality
    """
    try:
        # Create feedback record
        feedback_id = (
            f"feedback_{int(datetime.now().timestamp())}_{uuid.uuid4().hex[:8]}"
        )

        feedback = {
            "id": feedback_id,
            "conversation_id": request.conversation_id,
            "message_id": request.message_id,
            "user_id": request.user_id,
            "feedback_type": request.feedback_type,
            "rating": request.rating,
            "correction": request.correction,
            "flag_reason": request.flag_reason,
            "metadata": request.metadata,
            "created_at": datetime.now().isoformat(),
        }

        # Store feedback
        result = await db.insert("conversation_feedback", feedback)

        if not result.get("success"):
            return FeedbackResponse(
                success=False, message=f"Error storing feedback: {result.get('error')}"
            )

        return FeedbackResponse(
            success=True,
            message="Feedback submitted successfully",
            feedback_id=feedback_id,
        )

    except Exception as e:
        logger.error(f"Error submitting feedback: {e}")
        raise HTTPException(
            status_code=500, detail=f"Error submitting feedback: {str(e)}"
        )


class InterruptRequest(BaseModel):
    """Interrupt request model"""

    conversation_id: str
    type: str  # human_review, flag, pause
    priority: str = "medium"  # high, medium, low
    metadata: Optional[Dict[str, Any]] = {}


class InterruptResponse(BaseModel):
    """Interrupt response model"""

    success: bool
    message: str
    interrupt_id: Optional[str] = None


@router.post("/conversation-interrupt", response_model=InterruptResponse, tags=["chat"])
async def conversation_interrupt(request: InterruptRequest):
    """
    Create a conversation interrupt for human review
    """
    try:
        # Generate interrupt ID
        interrupt_id = f"int_{int(datetime.now().timestamp())}_{uuid.uuid4().hex[:8]}"

        # Create interrupt record
        interrupt = ConversationInterrupt(
            id=interrupt_id,
            conversation_id=request.conversation_id,
            type=request.type,
            priority=request.priority,
            status="pending",
            created_at=datetime.now().isoformat(),
            resolved_at=None,
            resolution=None,
        )

        # Store in database
        await db.table("conversation_interrupts").insert(interrupt.dict()).execute()

        # Update conversation status if this is a human review request
        if request.type == "human_review":
            await db.table("conversations").update(
                {"status": "pending_human", "updated_at": datetime.now().isoformat()}
            ).eq("id", request.conversation_id).execute()

            # Add system message about human review
            system_message = ChatMessage(
                id=f"msg_{int(datetime.now().timestamp())}_{uuid.uuid4().hex[:8]}",
                conversation_id=request.conversation_id,
                user_id=None,
                content="This conversation has been flagged for human expert review. A Massachusetts climate economy specialist will follow up with you shortly.",
                role="assistant",
                specialist_type="human_intervention",
                created_at=datetime.now().isoformat(),
                metadata={
                    "interrupt_id": interrupt_id,
                    "interrupt_type": request.type,
                    "priority": request.priority,
                    **request.metadata,
                },
            )
            await log_message(system_message)

            # If using LangGraph, use its human intervention functionality
            if request.metadata.get("using_langgraph"):
                # This would trigger the appropriate human intervention workflow
                # Mark the state as pending_human in the conversation metadata
                await db.table("conversations").update(
                    {
                        "session_metadata": db.raw(
                            f"jsonb_set(session_metadata, '{{workflow_state}}', '\"pending_human\"')"
                        )
                    }
                ).eq("id", request.conversation_id).execute()

        return InterruptResponse(
            success=True,
            message=f"Conversation interrupt of type '{request.type}' created",
            interrupt_id=interrupt_id,
        )

    except Exception as e:
        logger.error(f"Error creating conversation interrupt: {e}")
        raise HTTPException(
            status_code=500, detail=f"Error submitting interrupt: {str(e)}"
        )


class HumanInputRequest(BaseModel):
    """Human input request model"""

    conversation_id: str
    message: str
    expert_name: Optional[str] = "Massachusetts Climate Expert"
    metadata: Optional[Dict[str, Any]] = {}


class HumanInputResponse(BaseModel):
    """Human input response model"""

    success: bool
    message: str
    conversation_id: str


@router.post("/human-input", response_model=HumanInputResponse, tags=["chat"])
async def human_input(request: HumanInputRequest):
    """
    Submit human expert input for a conversation
    """
    try:
        # Add human input to the conversation
        success = await add_human_input(
            conversation_id=request.conversation_id,
            human_message=request.message,
            expert_name=request.expert_name,
        )

        if success:
            # Log the human expert message
            human_message = ChatMessage(
                id=f"msg_{int(datetime.now().timestamp())}_{uuid.uuid4().hex[:8]}",
                conversation_id=request.conversation_id,
                user_id=None,
                content=request.message,
                role="assistant",
                specialist_type="human_expert",
                created_at=datetime.now().isoformat(),
                metadata={
                    "human_expert": True,
                    "expert_name": request.expert_name,
                    **request.metadata,
                },
            )
            await log_message(human_message)

            # Update conversation status
            await db.table("conversations").update(
                {
                    "status": "active",
                    "last_activity": datetime.now().isoformat(),
                    "updated_at": datetime.now().isoformat(),
                    "message_count": db.rpc(
                        "increment_message_count",
                        {"conversation_id": request.conversation_id},
                    ),
                }
            ).eq("id", request.conversation_id).execute()

            # Update any interrupt records
            await db.table("conversation_interrupts").update(
                {
                    "status": "resolved",
                    "resolved_at": datetime.now().isoformat(),
                    "resolution": {
                        "resolved_by": "human_expert",
                        "expert_name": request.expert_name,
                        "resolution_type": "human_response",
                        "timestamp": datetime.now().isoformat(),
                    },
                }
            ).eq("conversation_id", request.conversation_id).eq(
                "status", "pending"
            ).execute()

            return HumanInputResponse(
                success=True,
                message="Human input added successfully",
                conversation_id=request.conversation_id,
            )
        else:
            logger.warning(
                f"Failed to add human input for conversation {request.conversation_id}"
            )
            return HumanInputResponse(
                success=False,
                message="Failed to add human input",
                conversation_id=request.conversation_id,
            )

    except Exception as e:
        logger.error(f"Error adding human input: {e}")
        raise HTTPException(
            status_code=500, detail=f"Error adding human input: {str(e)}"
        )


async def create_personalized_response(
    message: str, user_id: str, conversation_id: str, context: str = "general"
) -> tuple[str, str, Dict[str, Any]]:
    """
    Create personalized response using user context and OpenAI - no fallback mode
    """
    try:
        # Get user resume context if available
        resume_context = ""
        try:
            user_resume = await get_user_resume(user_id)
            if user_resume:
                skills = user_resume.get("skills_extracted", [])
                experience = user_resume.get("experience_years", 0)
                resume_context = f"User has {experience} years experience with skills: {', '.join(skills[:5])}"
        except Exception as resume_error:
            print(f"Could not get resume context: {resume_error}")

        # Get relevant job matches
        job_matches = ""
        try:
            if user_resume and user_resume.get("skills_extracted"):
                matches = await match_jobs_for_profile.ainvoke(
                    {
                        "skills": user_resume["skills_extracted"][:5],
                        "background": "general",
                        "experience_level": "mid_level",
                    }
                )
                job_matches = f"Relevant opportunities: {matches[:200]}..."
        except Exception as job_error:
            print(f"Could not get job matches: {job_error}")

        # Get training recommendations
        training_recs = ""
        try:
            recommendations = await recommend_upskilling.ainvoke(
                {
                    "user_background": "general",
                    "target_skills": ["renewable energy", "sustainability"],
                    "learning_format": "hybrid",
                }
            )
            training_recs = f"Training recommendations: {recommendations[:200]}..."
        except Exception as training_error:
            print(f"Could not get training recommendations: {training_error}")

        # Create enhanced prompt
        enhanced_prompt = f"""
        You are a Massachusetts Climate Economy Career Advisor.
        
        User context: {resume_context}
        {job_matches}
        {training_recs}
        
        User message: {message}
        
        Provide personalized guidance for Massachusetts climate economy opportunities.
        """

        # Generate response using OpenAI
        messages = [{"role": "user", "content": enhanced_prompt}]

        completion = await generate_completion(
            messages=messages,
            provider=ModelProvider.OPENAI,
            model="gpt-4",
            temperature=0.7,
        )

        response_content = completion.get("content", "")

        if not response_content:
            raise HTTPException(
                status_code=500, detail="OpenAI returned empty response"
            )

        metadata = {
            "personalized": True,
            "has_resume_context": bool(resume_context),
            "has_job_matches": bool(job_matches),
            "has_training_recs": bool(training_recs),
        }

        # Log interaction
        await log_specialist_interaction(
            user_id=user_id,
            conversation_id=conversation_id,
            specialist_type="personalized_ai",
            tools_used=["openai_completion"],
            query=message,
            confidence=0.8,
        )

        return response_content, "personalized_ai", metadata

    except Exception as e:
        # Log error and raise
        await log_user_action(
            user_id,
            "personalized_response_error",
            {"error": str(e), "conversation_id": conversation_id},
        )
        raise HTTPException(
            status_code=500, detail=f"Personalized response error: {str(e)}"
        )
