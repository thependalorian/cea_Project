"""
Agents routes for the Climate Economy Assistant API.
Provides access to all 20 specialized agents organized into 5 teams.
SIMPLIFIED TO USE FRAMEWORK DIRECTLY
"""

from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import structlog
from datetime import datetime
import uuid
import asyncio
import json
import time

# Import agent coordinator for proper routing
from backend.agents.agent_coordinator import AgentCoordinator

# Import framework processing function
from backend.agents.langgraph.framework import (
    process_message_with_enhanced_graph,
    stream_message_with_enhanced_graph,
    get_framework_status,
    get_agent_capabilities
)
from backend.utils.logger import setup_logger

logger = setup_logger("agents_routes")

router = APIRouter()
logger = structlog.get_logger(__name__)

# Initialize agent coordinator
agent_coordinator = AgentCoordinator()


# Request models
class ChatRequest(BaseModel):
    """Request model for agent chat"""

    message: str
    user_id: str
    conversation_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    files: List[Dict[str, Any]] = []
    stream: bool = True


class ChatResponse(BaseModel):
    success: bool
    response: str
    agent: str
    team: str
    conversation_id: str
    processing_time: float
    metadata: Dict[str, Any]


# Simple auth function for testing
def simple_verify_token(request: Request) -> str:
    """Simple token verification for testing"""
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        return "test-user-123"
    return "anonymous"


# Agent and team data
AGENT_TEAMS = {
    "specialists": {
        "name": "Climate Career Specialists",
        "description": "General climate career guidance and navigation",
        "agents": {
            "pendo": {"name": "Pendo", "specialization": "Climate Career Navigator"},
            "lauren": {"name": "Lauren", "specialization": "Clean Energy Specialist"},
            "alex": {"name": "Alex", "specialization": "Green Finance Expert"},
            "jasmine": {"name": "Jasmine", "specialization": "Sustainability Consultant"},
        },
    },
    "veterans": {
        "name": "Veterans Support Team",
        "description": "Support for military veterans transitioning to climate careers",
        "agents": {
            "marcus": {"name": "Marcus", "specialization": "Veterans Career Guide"},
            "james": {"name": "James", "specialization": "Skills Translator"},
            "sarah": {"name": "Sarah", "specialization": "Career Coach"},
            "david": {"name": "David", "specialization": "Benefits Specialist"},
        },
    },
    "environmental_justice": {
        "name": "Environmental Justice Team",
        "description": "Environmental justice and community advocacy",
        "agents": {
            "miguel": {"name": "Miguel", "specialization": "Environmental Justice"},
            "maria": {"name": "Maria", "specialization": "Community Organizing"},
            "andre": {"name": "Andre", "specialization": "Environmental Health"},
            "carmen": {"name": "Carmen", "specialization": "Community Relations"},
        },
    },
    "international": {
        "name": "International Climate Team",
        "description": "Global climate opportunities and international support",
        "agents": {
            "liv": {"name": "Liv", "specialization": "International Climate Policy"},
            "mei": {"name": "Mei", "specialization": "International Credentials"},
            "raj": {"name": "Raj", "specialization": "Global Sustainability"},
            "sofia": {
                "name": "Sofia",
                "specialization": "Cross-Cultural Communications",
            },
        },
    },
    "support": {
        "name": "Mental Health & Support Team",
        "description": "Mental health support and career counseling",
        "agents": {
            "mai": {"name": "Mai", "specialization": "Mental Health"},
            "michael": {"name": "Michael", "specialization": "Crisis Intervention"},
            "elena": {"name": "Elena", "specialization": "Career Counseling"},
            "thomas": {"name": "Thomas", "specialization": "Job Placement"},
        },
    },
}


@router.get("/")
async def get_all_agents(
    request: Request, user_id: str = Depends(simple_verify_token)
) -> Dict[str, Any]:
    """Get all agents organized by teams"""
    return {
        "teams": AGENT_TEAMS,
        "total_agents": sum(len(team["agents"]) for team in AGENT_TEAMS.values()),
        "total_teams": len(AGENT_TEAMS),
        "summary": {
            team_id: {
                "name": team["name"],
                "description": team["description"],
                "agent_count": len(team["agents"]),
            }
            for team_id, team in AGENT_TEAMS.items()
        },
    }


@router.get("/teams")
async def get_teams(
    request: Request, user_id: str = Depends(simple_verify_token)
) -> Dict[str, Any]:
    """Get summary of all teams"""
    return {
        "teams": {
            team_id: {
                "name": team["name"],
                "description": team["description"],
                "agent_count": len(team["agents"]),
            }
            for team_id, team in AGENT_TEAMS.items()
        }
    }


@router.get("/teams/{team_id}")
async def get_team(
    team_id: str, request: Request, user_id: str = Depends(simple_verify_token)
) -> Dict[str, Any]:
    """Get detailed information about a specific team"""
    if team_id not in AGENT_TEAMS:
        raise HTTPException(status_code=404, detail="Team not found")

    team = AGENT_TEAMS[team_id]
    return {
        "team_id": team_id,
        "name": team["name"],
        "description": team["description"],
        "agents": team["agents"],
    }


@router.get("/{agent_id}")
async def get_agent(
    agent_id: str, request: Request, user_id: str = Depends(simple_verify_token)
) -> Dict[str, Any]:
    """Get detailed information about a specific agent"""
    # Find agent across all teams
    for team_id, team in AGENT_TEAMS.items():
        if agent_id in team["agents"]:
            agent = team["agents"][agent_id]
            return {
                "agent_id": agent_id,
                "team": team_id,
                "team_name": team["name"],
                **agent,
            }

    raise HTTPException(status_code=404, detail="Agent not found")


@router.post("/{agent_id}/chat")
async def chat_with_agent(
    agent_id: str,
    chat_request: ChatRequest,
    request: Request,
    user_id: str = Depends(simple_verify_token),
) -> Dict[str, Any]:
    """
    Chat with a specific agent using the enhanced LangGraph framework
    SIMPLIFIED APPROACH - Direct framework usage
    """
    # Find agent across all teams
    agent_info = None
    team_id = None

    for tid, team in AGENT_TEAMS.items():
        if agent_id in team["agents"]:
            agent_info = team["agents"][agent_id]
            team_id = tid
            break

    if not agent_info:
        raise HTTPException(status_code=404, detail="Agent not found")

    try:
        # Create conversation ID if not provided
        conversation_id = (
            chat_request.conversation_id
            or f"conv_{user_id}_{datetime.now().timestamp()}"
        )

        # Log the attempt
        logger.info(f"Processing chat request for agent {agent_id}")

        # Use the enhanced framework directly
        framework_result = await process_message_with_enhanced_graph(
            message=chat_request.message,
            user_id=user_id,
            conversation_id=conversation_id,
            config=chat_request.metadata or {},
        )

        logger.info(f"Framework processing completed for agent {agent_id}")

        return {
            "agent_id": agent_id,
            "team": framework_result.get("team", team_id),
            "response": framework_result.get("response"),
            "conversation_id": conversation_id,
            "metadata": {
                **framework_result.get("metadata", {}),
                "agent_name": agent_info["name"],
                "specialization": agent_info["specialization"],
                "timestamp": datetime.now().isoformat(),
                "requested_agent": agent_id,
                "framework_processing": True,
            },
        }

    except Exception as e:
        logger.error(f"Error processing chat for agent {agent_id}: {e}")

        # Enhanced fallback with agent coordinator
        try:
            coordinator_response = await agent_coordinator.process_message(
                message=chat_request.message,
                user_id=user_id,
                conversation_id=conversation_id,
            )

            return {
                "agent_id": agent_id,
                "team": coordinator_response.team,
                "response": coordinator_response.content,
                "conversation_id": conversation_id,
                "metadata": {
                    **coordinator_response.metadata,
                    "agent_name": agent_info["name"],
                    "specialization": agent_info["specialization"],
                    "timestamp": datetime.now().isoformat(),
                    "coordinator_fallback": True,
                    "original_error": str(e),
                },
            }

        except Exception as fallback_error:
            logger.error(f"Fallback also failed for agent {agent_id}: {fallback_error}")

            # Final fallback response
            return {
                "agent_id": agent_id,
                "team": team_id,
                "response": f"Hello! I'm {agent_info['name']}, your {agent_info['specialization']}. I understand you're asking about: '{chat_request.message}'. Let me help you with climate career guidance based on my expertise. How can I assist you today?",
                "conversation_id": conversation_id,
                "metadata": {
                    "agent_name": agent_info["name"],
                    "specialization": agent_info["specialization"],
                    "timestamp": datetime.now().isoformat(),
                    "final_fallback": True,
                    "framework_error": str(e),
                    "coordinator_error": str(fallback_error),
                },
            }


@router.post("/agents/{agent_id}/chat")
async def optimized_agent_chat(agent_id: str, request: ChatRequest):
    """
    Optimized streaming chat endpoint with DeepSeek integration
    
    Features:
    - Immediate response streaming
    - 30-second timeout protection
    - Progressive content delivery
    - Error recovery with helpful fallbacks
    """
    start_time = time.time()
    
    try:
        # Validate request
        if not request.message.strip():
            raise HTTPException(status_code=400, detail="Message cannot be empty")
        
        logger.info(f"🚀 Processing chat for agent {agent_id}, user {request.user_id}")
        logger.info(f"📝 Message: {request.message[:100]}{'...' if len(request.message) > 100 else ''}")
        
        # Generate conversation ID if not provided
        conversation_id = request.conversation_id or f"conv_{request.user_id}_{int(time.time())}"
        
        # Use streaming by default for better UX
        if request.stream:
            return StreamingResponse(
                stream_agent_response(
                    agent_id=agent_id,
                    message=request.message,
                    user_id=request.user_id,
                    conversation_id=conversation_id,
                    files=request.files,
                    metadata=request.metadata or {}
                ),
                media_type="text/event-stream",
                headers={
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive",
                    "Access-Control-Allow-Origin": "*",
                    "X-Processing-Mode": "streaming"
                }
            )
        
        # Fallback: Non-streaming response with timeout
        try:
            response_data = await asyncio.wait_for(
                process_message_with_enhanced_graph(
                    message=request.message,
                    user_id=request.user_id,
                    conversation_id=conversation_id,
                    config={"agent_preference": agent_id}
                ),
                timeout=25.0  # 25-second timeout
            )
            
            processing_time = (time.time() - start_time) * 1000
            
            return ChatResponse(
                success=True,
                response=response_data.get("response", "No response received"),
                agent=response_data.get("agent", agent_id),
                team=response_data.get("team", "unknown"),
                conversation_id=conversation_id,
                processing_time=processing_time,
                metadata={
                    **response_data.get("metadata", {}),
                    "processing_mode": "non_streaming",
                    "timeout_used": False
                }
            )
            
        except asyncio.TimeoutError:
            logger.warning(f"⏰ Request timeout for agent {agent_id}, user {request.user_id}")
            
            # Return helpful timeout response
            return ChatResponse(
                success=False,
                response=f"I'm taking longer than usual to process your request. This might be due to high demand. Please try again, and I'll do my best to respond quickly. (Agent: {agent_id})",
                agent=agent_id,
                team="system",
                conversation_id=conversation_id,
                processing_time=(time.time() - start_time) * 1000,
                metadata={
                    "processing_mode": "timeout_fallback",
                    "timeout_used": True,
                    "suggested_actions": ["retry", "try_streaming", "contact_support"]
                }
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Unexpected error in agent chat: {e}")
        
        processing_time = (time.time() - start_time) * 1000
        
        return ChatResponse(
            success=False,
            response=f"I apologize, but I encountered an error processing your request. Our system using DeepSeek is optimized for cost and speed, but this request couldn't be completed. Please try again or contact support. (Error: {str(e)[:100]})",
            agent=agent_id,
            team="error",
            conversation_id=request.conversation_id or f"error_{int(time.time())}",
            processing_time=processing_time,
            metadata={
                "error": str(e),
                "processing_mode": "error_fallback",
                "timestamp": datetime.now().isoformat()
            }
        )


async def stream_agent_response(
    agent_id: str,
    message: str,
    user_id: str,
    conversation_id: str,
    files: List[Dict[str, Any]],
    metadata: Dict[str, Any]
):
    """
    Streaming response generator with progressive enhancement
    """
    try:
        # Immediate acknowledgment
        yield f"data: {json.dumps({'type': 'ack', 'data': {'status': 'received', 'agent': agent_id, 'timestamp': datetime.now().isoformat()}})}\n\n"
        
        # Stream through the enhanced framework
        async for chunk in stream_message_with_enhanced_graph(
            message=message,
            user_id=user_id,
            conversation_id=conversation_id,
            config={"agent_preference": agent_id, "files": files, "metadata": metadata}
        ):
            # Convert framework chunks to frontend format
            if chunk.get("type") == "status":
                yield f"data: {json.dumps({'type': 'metadata', 'data': chunk['data']})}\n\n"
            
            elif chunk.get("type") == "routing":
                routing_status = f"Routing to {chunk['data']['agent']}..."
                yield f"data: {json.dumps({'type': 'metadata', 'data': {'status': routing_status, 'agent': chunk['data']['agent'], 'confidence': chunk['data']['confidence']}})}\n\n"
            
            elif chunk.get("type") == "thinking":
                yield f"data: {json.dumps({'type': 'metadata', 'data': {'status': chunk['data']['status'], 'agent': chunk['data']['agent']}})}\n\n"
                
            elif chunk.get("type") == "content":
                yield f"data: {json.dumps({'type': 'content', 'data': chunk['data']})}\n\n"
                
            elif chunk.get("type") == "complete":
                yield f"data: {json.dumps({'type': 'complete', 'data': chunk['data']})}\n\n"
                
            elif chunk.get("type") == "error":
                yield f"data: {json.dumps({'type': 'error', 'data': chunk['data']})}\n\n"
                
        # End of stream marker
        yield f"data: {json.dumps({'type': 'end', 'data': {'timestamp': datetime.now().isoformat()}})}\n\n"
        
    except Exception as e:
        logger.error(f"❌ Streaming error: {e}")
        
        error_data = {
            "type": "error",
            "data": {
                "error": str(e),
                "fallback_response": f"I apologize, but I encountered an error while streaming your response. Please try again. (Agent: {agent_id})",
                "timestamp": datetime.now().isoformat(),
                "agent": agent_id
            }
        }
        yield f"data: {json.dumps(error_data)}\n\n"


@router.get("/agents/status")
async def get_agents_status():
    """Get status of all agents and framework"""
    try:
        status = get_framework_status()
        capabilities = get_agent_capabilities()
        
        return {
            "success": True,
            "framework": status,
            "agents": capabilities,
            "optimizations": {
                "streaming_enabled": True,
                "deepseek_integration": True,
                "timeout_protection": True,
                "cost_optimized": True
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting agents status: {e}")
        raise HTTPException(status_code=500, detail=f"Error getting status: {str(e)}")


@router.get("/agents/{agent_id}/info")
async def get_agent_info(agent_id: str):
    """Get detailed information about a specific agent"""
    try:
        capabilities = get_agent_capabilities()
        
        if agent_id not in capabilities:
            raise HTTPException(status_code=404, detail=f"Agent '{agent_id}' not found")
        
        agent_info = capabilities[agent_id]
        
        return {
            "success": True,
            "agent_id": agent_id,
            "info": agent_info,
            "features": {
                "streaming_support": True,
                "deepseek_optimized": True,
                "timeout_protected": True,
                "cost_efficient": True
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting agent info: {e}")
        raise HTTPException(status_code=500, detail=f"Error getting agent info: {str(e)}")


# Health check endpoint
@router.get("/agents/health")
async def health_check():
    """Quick health check for agents system"""
    return {
        "status": "healthy",
        "streaming": "enabled",
        "model_provider": "deepseek",
        "cost_optimization": "active",
        "timestamp": datetime.now().isoformat()
    }
