"""
Updated API routes for Climate Economy Assistant with proper agent integration.
Follows REST principles and integrates with the 20-agent system.
"""

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks, Query
from fastapi.responses import StreamingResponse
from typing import Dict, List, Optional, Any
import asyncio
import json
import logging
from datetime import datetime
import uuid

# Import agents from implementations
from backend.agents.implementations import (
    # Specialists Team
    PendoAgent,
    LaurenAgent,
    AlexAgent,
    JasmineAgent,
    # Veterans Team
    MarcusAgent,
    JamesAgent,
    SarahAgent,
    DavidAgent,
    # Environmental Justice Team
    MiguelAgent,
    MariaAgent,
    AndreAgent,
    CarmenAgent,
    # International Team
    LivAgent,
    MeiAgent,
    RajAgent,
    SofiaAgent,
    # Support Team
    MaiAgent,
    MichaelAgent,
    ElenaAgent,
    ThomasAgent,
)

logger = logging.getLogger(__name__)

# Create main router
router = APIRouter()

# Agent organization by teams
AGENT_TEAMS = {
    "specialists": {
        "pendo": PendoAgent,
        "lauren": LaurenAgent,
        "alex": AlexAgent,
        "jasmine": JasmineAgent,
    },
    "veterans": {
        "marcus": MarcusAgent,
        "james": JamesAgent,
        "sarah": SarahAgent,
        "david": DavidAgent,
    },
    "environmental_justice": {
        "miguel": MiguelAgent,
        "maria": MariaAgent,
        "andre": AndreAgent,
        "carmen": CarmenAgent,
    },
    "international": {
        "liv": LivAgent,
        "mei": MeiAgent,
        "raj": RajAgent,
        "sofia": SofiaAgent,
    },
    "support": {
        "mai": MaiAgent,
        "michael": MichaelAgent,
        "elena": ElenaAgent,
        "thomas": ThomasAgent,
    },
}

# Agent metadata
AGENT_METADATA = {
    "pendo": {
        "name": "Pendo",
        "description": "General Climate Specialist and Supervisor",
        "specialization": "Climate policy and career coordination",
    },
    "lauren": {
        "name": "Lauren",
        "description": "Environmental Justice Specialist",
        "specialization": "Equitable climate solutions",
    },
    "alex": {
        "name": "Alex",
        "description": "Crisis Intervention Specialist",
        "specialization": "Mental health and crisis support",
    },
    "jasmine": {
        "name": "Jasmine",
        "description": "Massachusetts Resources Specialist",
        "specialization": "MA-specific climate programs",
    },
    "marcus": {
        "name": "Marcus",
        "description": "Veterans Specialist",
        "specialization": "Military-to-civilian transition",
    },
    "james": {
        "name": "James",
        "description": "Military Skills Translator",
        "specialization": "Translating military skills to climate careers",
    },
    "sarah": {
        "name": "Sarah",
        "description": "Veterans Career Coach",
        "specialization": "Career coaching for veterans",
    },
    "david": {
        "name": "David",
        "description": "Veterans Support Specialist",
        "specialization": "VA benefits and crisis resources",
    },
    "miguel": {
        "name": "Miguel",
        "description": "EJ Community Advocate",
        "specialization": "Environmental justice advocacy",
    },
    "maria": {
        "name": "Maria",
        "description": "Community Engagement Specialist",
        "specialization": "Community organizing and outreach",
    },
    "andre": {
        "name": "Andre",
        "description": "Green Jobs Navigator",
        "specialization": "Workforce development for EJ communities",
    },
    "carmen": {
        "name": "Carmen",
        "description": "Cultural Liaison",
        "specialization": "Cultural adaptation and community relations",
    },
    "liv": {
        "name": "Liv",
        "description": "International Career Specialist",
        "specialization": "International populations and credentials",
    },
    "mei": {
        "name": "Mei",
        "description": "Asia-Pacific Climate Specialist",
        "specialization": "Regional climate solutions",
    },
    "raj": {
        "name": "Raj",
        "description": "South Asia & Middle East Specialist",
        "specialization": "Regional climate adaptation",
    },
    "sofia": {
        "name": "Sofia",
        "description": "Europe & Africa Climate Specialist",
        "specialization": "Green Deal and African partnerships",
    },
    "mai": {
        "name": "Mai",
        "description": "Resume Analysis Specialist",
        "specialization": "Resume optimization and analysis",
    },
    "michael": {
        "name": "Michael",
        "description": "Technical Support Specialist",
        "specialization": "Technical troubleshooting and support",
    },
    "elena": {
        "name": "Elena",
        "description": "User Experience Specialist",
        "specialization": "UX research and design optimization",
    },
    "thomas": {
        "name": "Thomas",
        "description": "Data and Analytics Specialist",
        "specialization": "Data analysis and insights",
    },
}

# =============================================================================
# AGENT ENDPOINTS
# =============================================================================


@router.get("/agents", tags=["agents"])
async def get_all_agents():
    """
    Get all available agents organized by teams.
    Returns comprehensive information about all 20 agents.
    """
    try:
        agents_data = {
            "teams": {},
            "agents": {},
            "total_agents": 0,
            "total_teams": len(AGENT_TEAMS),
        }

        # Organize by teams
        for team_name, team_agents in AGENT_TEAMS.items():
            agents_data["teams"][team_name] = {
                "name": team_name.replace("_", " ").title(),
                "agent_count": len(team_agents),
                "agents": list(team_agents.keys()),
            }

            # Add individual agent info
            for agent_id, agent_class in team_agents.items():
                metadata = AGENT_METADATA.get(agent_id, {})
                agents_data["agents"][agent_id] = {
                    "id": agent_id,
                    "name": metadata.get("name", agent_id.title()),
                    "description": metadata.get("description", "Climate specialist"),
                    "specialization": metadata.get(
                        "specialization", "General climate assistance"
                    ),
                    "team": team_name,
                    "status": "active",
                }

        agents_data["total_agents"] = len(agents_data["agents"])

        return agents_data

    except Exception as e:
        logger.error(f"Error retrieving agents: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error retrieving agents: {str(e)}"
        )


@router.get("/agents/teams", tags=["agents"])
async def get_agent_teams():
    """Get all agent teams with their specializations."""
    try:
        teams_data = {}

        for team_name, team_agents in AGENT_TEAMS.items():
            team_display_name = team_name.replace("_", " ").title()
            teams_data[team_name] = {
                "name": team_display_name,
                "agent_count": len(team_agents),
                "agents": [
                    {
                        "id": agent_id,
                        "name": AGENT_METADATA.get(agent_id, {}).get(
                            "name", agent_id.title()
                        ),
                        "specialization": AGENT_METADATA.get(agent_id, {}).get(
                            "specialization", "General assistance"
                        ),
                    }
                    for agent_id in team_agents.keys()
                ],
            }

        return {"teams": teams_data, "total_teams": len(teams_data)}

    except Exception as e:
        logger.error(f"Error retrieving teams: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error retrieving teams: {str(e)}")


@router.get("/agents/{agent_id}", tags=["agents"])
async def get_agent_details(agent_id: str):
    """Get detailed information about a specific agent."""
    try:
        # Find agent across all teams
        agent_class = None
        agent_team = None

        for team_name, team_agents in AGENT_TEAMS.items():
            if agent_id in team_agents:
                agent_class = team_agents[agent_id]
                agent_team = team_name
                break

        if not agent_class:
            raise HTTPException(status_code=404, detail=f"Agent '{agent_id}' not found")

        metadata = AGENT_METADATA.get(agent_id, {})

        # Get agent capabilities if available
        capabilities = {}
        try:
            if hasattr(agent_class, "get_capabilities"):
                agent_instance = agent_class()
                capabilities = agent_instance.get_capabilities()
        except Exception as e:
            logger.warning(f"Could not get capabilities for {agent_id}: {e}")

        agent_details = {
            "id": agent_id,
            "name": metadata.get("name", agent_id.title()),
            "description": metadata.get("description", "Climate specialist"),
            "specialization": metadata.get(
                "specialization", "General climate assistance"
            ),
            "team": agent_team,
            "team_display": agent_team.replace("_", " ").title(),
            "status": "active",
            "capabilities": capabilities,
        }

        return agent_details

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving agent {agent_id}: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error retrieving agent details: {str(e)}"
        )


# =============================================================================
# CONVERSATION ENDPOINTS
# =============================================================================


@router.post("/conversations", tags=["conversations"])
async def create_conversation(
    request: Dict[str, Any], background_tasks: BackgroundTasks
):
    """
    Create a new conversation.
    Auto-routes to appropriate agent based on message content.
    """
    try:
        user_message = request.get("message", "")
        context = request.get("context", {})

        if not user_message:
            raise HTTPException(status_code=400, detail="Message is required")

        # Create conversation ID
        conversation_id = str(uuid.uuid4())

        # Initialize conversation state
        initial_state = {
            "messages": [
                {
                    "id": str(uuid.uuid4()),
                    "role": "user",
                    "content": user_message,
                    "timestamp": datetime.now().isoformat(),
                }
            ],
            "conversation_id": conversation_id,
            "context": context,
            "created_at": datetime.now().isoformat(),
        }

        # Route to appropriate agent (start with Pendo for general routing)
        response = await route_to_agent("pendo", initial_state)

        return {
            "conversation_id": conversation_id,
            "initial_response": response,
            "status": "created",
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating conversation: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error creating conversation: {str(e)}"
        )


@router.post("/conversations/{conversation_id}/messages", tags=["conversations"])
async def send_message(conversation_id: str, request: Dict[str, Any]):
    """Send a message to an existing conversation."""
    try:
        user_message = request.get("message", "")
        context = request.get("context", {})
        agent_id = request.get("agent_id", "pendo")  # Default to Pendo for routing

        if not user_message:
            raise HTTPException(status_code=400, detail="Message is required")

        # Create message state
        message_state = {
            "messages": [
                {
                    "id": str(uuid.uuid4()),
                    "role": "user",
                    "content": user_message,
                    "timestamp": datetime.now().isoformat(),
                }
            ],
            "conversation_id": conversation_id,
            "context": context,
        }

        # Handle streaming if requested
        if request.get("stream", False):
            return StreamingResponse(
                stream_agent_response(agent_id, message_state),
                media_type="text/event-stream",
            )

        # Route to specified agent
        response = await route_to_agent(agent_id, message_state)

        return {
            "conversation_id": conversation_id,
            "response": response,
            "timestamp": datetime.now().isoformat(),
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error sending message: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error sending message: {str(e)}")


@router.post("/agents/{agent_id}/chat", tags=["agents", "conversations"])
async def chat_with_agent(agent_id: str, request: Dict[str, Any]):
    """
    Chat directly with a specific agent.
    Bypasses routing and goes directly to the specified agent.
    """
    try:
        user_message = request.get("message", "")
        context = request.get("context", {})

        if not user_message:
            raise HTTPException(status_code=400, detail="Message is required")

        # Validate agent exists
        agent_class = None
        for team_agents in AGENT_TEAMS.values():
            if agent_id in team_agents:
                agent_class = team_agents[agent_id]
                break

        if not agent_class:
            raise HTTPException(status_code=404, detail=f"Agent '{agent_id}' not found")

        # Create message state
        message_state = {
            "messages": [
                {
                    "id": str(uuid.uuid4()),
                    "role": "user",
                    "content": user_message,
                    "timestamp": datetime.now().isoformat(),
                }
            ],
            "context": context,
            "direct_chat": True,
        }

        # Handle streaming if requested
        if request.get("stream", False):
            return StreamingResponse(
                stream_agent_response(agent_id, message_state),
                media_type="text/event-stream",
            )

        # Route directly to agent
        response = await route_to_agent(agent_id, message_state)

        return {
            "agent_id": agent_id,
            "agent_name": AGENT_METADATA.get(agent_id, {}).get(
                "name", agent_id.title()
            ),
            "response": response,
            "timestamp": datetime.now().isoformat(),
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error chatting with agent {agent_id}: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error chatting with agent: {str(e)}"
        )


# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================


async def route_to_agent(agent_id: str, state: Dict[str, Any]) -> Dict[str, Any]:
    """Route a message to the specified agent and return the response."""
    try:
        # Find agent class
        agent_class = None
        for team_agents in AGENT_TEAMS.values():
            if agent_id in team_agents:
                agent_class = team_agents[agent_id]
                break

        if not agent_class:
            raise ValueError(f"Agent '{agent_id}' not found")

        # Execute agent
        try:
            response = agent_class(state)

            # Handle Command response (from LangGraph-style agents)
            if hasattr(response, "update") and hasattr(response, "goto"):
                return {
                    "content": response.update.get("messages", [])[-1].get(
                        "content", ""
                    ),
                    "agent": agent_id,
                    "team": response.goto if response.goto else "unknown",
                    "metadata": response.update.get("metadata", {}),
                    "type": "command_response",
                }

            # Handle direct response
            elif isinstance(response, dict):
                return {
                    "content": response.get("content", str(response)),
                    "agent": agent_id,
                    "metadata": response.get("metadata", {}),
                    "type": "direct_response",
                }

            # Handle string response
            else:
                return {
                    "content": str(response),
                    "agent": agent_id,
                    "type": "string_response",
                }

        except Exception as e:
            logger.error(f"Error executing agent {agent_id}: {e}")
            return {
                "content": f"I apologize, but I encountered an error while processing your request. Error: {str(e)}",
                "agent": agent_id,
                "error": str(e),
                "type": "error_response",
            }

    except Exception as e:
        logger.error(f"Error routing to agent {agent_id}: {e}")
        raise ValueError(f"Error routing to agent: {str(e)}")


async def stream_agent_response(agent_id: str, state: Dict[str, Any]):
    """Stream agent response for real-time communication."""
    try:
        # Get agent response
        response = await route_to_agent(agent_id, state)

        # Stream the response content
        content = response.get("content", "")

        # Yield initial metadata
        yield f"data: {json.dumps({'type': 'start', 'agent': agent_id, 'timestamp': datetime.now().isoformat()})}\n\n"

        # Stream content in chunks
        chunk_size = 40
        for i in range(0, len(content), chunk_size):
            chunk = content[i : i + chunk_size]
            chunk_data = {"type": "content", "content": chunk, "agent": agent_id}
            yield f"data: {json.dumps(chunk_data)}\n\n"
            await asyncio.sleep(0.05)  # Small delay for streaming effect

        # Yield completion metadata
        yield f"data: {json.dumps({'type': 'complete', 'agent': agent_id, 'metadata': response.get('metadata', {})})}\n\n"

    except Exception as e:
        error_data = {"type": "error", "error": str(e), "agent": agent_id}
        yield f"data: {json.dumps(error_data)}\n\n"
