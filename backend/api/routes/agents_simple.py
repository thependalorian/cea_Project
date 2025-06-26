"""
Simplified Agents routes for the Climate Economy Assistant API.
Provides access to all 20 specialized agents organized into 5 teams.
"""

from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import structlog
from datetime import datetime
import uuid

# Import agent coordinator for proper routing
from backend.agents.agent_coordinator import AgentCoordinator

router = APIRouter()
logger = structlog.get_logger(__name__)

# Initialize agent coordinator
agent_coordinator = AgentCoordinator()


# Request models
class ChatRequest(BaseModel):
    """Request model for agent chat"""
    message: str
    conversation_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


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
            "sofia": {"name": "Sofia", "specialization": "Cross-Cultural Communications"},
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
    Chat with a specific agent - SIMPLIFIED VERSION
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
            or f"conv_{user_id}_{int(datetime.now().timestamp())}"
        )

        # Log the attempt
        logger.info(f"Processing chat request for agent {agent_id}")

        # Use the agent coordinator to process the message
        coordinator_response = await agent_coordinator.process_message(
            message=chat_request.message,
            user_id=user_id,
            conversation_id=conversation_id,
        )

        logger.info(f"Agent coordinator processing completed for agent {agent_id}")

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
                "requested_agent": agent_id,
                "processing_time_ms": coordinator_response.processing_time_ms,
            },
        }

    except Exception as e:
        logger.error(f"Error processing chat for agent {agent_id}: {e}")

        # Final fallback response with enhanced context
        return {
            "agent_id": agent_id,
            "team": team_id,
            "response": f"Hello! I'm {agent_info['name']}, your {agent_info['specialization']}. I understand you're asking about: '{chat_request.message}'. Let me help you with climate career guidance based on my expertise. Based on my specialization in {agent_info['specialization']}, I can provide targeted advice for your climate career journey. How can I assist you today?",
            "conversation_id": conversation_id,
            "metadata": {
                "agent_name": agent_info["name"],
                "specialization": agent_info["specialization"],
                "timestamp": datetime.now().isoformat(),
                "fallback_response": True,
                "error": str(e),
                "requested_agent": agent_id,
            },
        } 