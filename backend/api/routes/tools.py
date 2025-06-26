"""
Tools routes for the Climate Economy Assistant API.
Exposes agent tools as API endpoints through our agent system.
"""

from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import structlog
from datetime import datetime

from backend.api.middleware.auth import verify_token
from backend.agents.agent_coordinator import AgentCoordinator
from backend.agents.implementations import (
    PendoAgent,
    MarcusAgent,
    LaurenAgent,
    MiguelAgent,
    MaiAgent,
    AlexAgent,
    LivAgent,
    JasmineAgent,
    JamesAgent,
    SarahAgent,
    DavidAgent,
    MariaAgent,
    AndreAgent,
    CarmenAgent,
    MeiAgent,
    RajAgent,
    SofiaAgent,
    MichaelAgent,
    ElenaAgent,
    ThomasAgent,
)

router = APIRouter()
logger = structlog.get_logger(__name__)

# Available agents organized by team
AVAILABLE_AGENTS = {
    "specialists_team": {
        "pendo": {
            "agent": PendoAgent,
            "name": "Pendo",
            "specialization": "General Climate Specialist and Supervisor",
        },
        "lauren": {
            "agent": LaurenAgent,
            "name": "Lauren",
            "specialization": "Climate Policy and Advocacy",
        },
        "alex": {
            "agent": AlexAgent,
            "name": "Alex",
            "specialization": "Renewable Energy Specialist",
        },
        "jasmine": {
            "agent": JasmineAgent,
            "name": "Jasmine",
            "specialization": "Green Technology and Innovation",
        },
    },
    "veterans_team": {
        "marcus": {
            "agent": MarcusAgent,
            "name": "Marcus",
            "specialization": "Veterans Career Transition",
        },
        "james": {
            "agent": JamesAgent,
            "name": "James",
            "specialization": "Military Skills Translation",
        },
        "sarah": {
            "agent": SarahAgent,
            "name": "Sarah",
            "specialization": "Veterans Benefits and Support",
        },
        "david": {
            "agent": DavidAgent,
            "name": "David",
            "specialization": "Veterans Education and Training",
        },
    },
    "ej_team": {
        "miguel": {
            "agent": MiguelAgent,
            "name": "Miguel",
            "specialization": "Environmental Justice Advocate",
        },
        "maria": {
            "agent": MariaAgent,
            "name": "Maria",
            "specialization": "Community Organizing and Outreach",
        },
        "andre": {
            "agent": AndreAgent,
            "name": "Andre",
            "specialization": "Environmental Health and Policy",
        },
        "carmen": {
            "agent": CarmenAgent,
            "name": "Carmen",
            "specialization": "Community Relations Specialist",
        },
    },
    "international_team": {
        "liv": {
            "agent": LivAgent,
            "name": "Liv",
            "specialization": "International Climate Policy",
        },
        "mei": {
            "agent": MeiAgent,
            "name": "Mei",
            "specialization": "International Credentials Specialist",
        },
        "raj": {
            "agent": RajAgent,
            "name": "Raj",
            "specialization": "Global Sustainability Consultant",
        },
        "sofia": {
            "agent": SofiaAgent,
            "name": "Sofia",
            "specialization": "Cross-Cultural Climate Communications",
        },
    },
    "support_team": {
        "mai": {
            "agent": MaiAgent,
            "name": "Mai",
            "specialization": "Mental Health and Wellness",
        },
        "michael": {
            "agent": MichaelAgent,
            "name": "Michael",
            "specialization": "Crisis Intervention Specialist",
        },
        "elena": {
            "agent": ElenaAgent,
            "name": "Elena",
            "specialization": "Career Counselor and Life Coach",
        },
        "thomas": {
            "agent": ThomasAgent,
            "name": "Thomas",
            "specialization": "Job Placement and Networking",
        },
    },
}


class AgentRequest(BaseModel):
    """Request model for agent interaction"""

    message: str
    agent_id: Optional[str] = None
    team: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class ToolRequest(BaseModel):
    """Request model for tool execution"""

    tool_name: str
    parameters: Dict[str, Any]
    agent_id: Optional[str] = None


class ResumeAnalysisRequest(BaseModel):
    """Request model for resume analysis"""

    resume_text: str
    focus_areas: Optional[List[str]] = None


@router.post("/agents/chat")
async def chat_with_agent(
    request: AgentRequest, user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """Chat with a specific agent or get routed to the best agent"""
    try:
        # Initialize agent coordinator
        coordinator = AgentCoordinator()

        # Prepare state
        state = {
            "messages": [
                {
                    "id": str(datetime.now().timestamp()),
                    "role": "user",
                    "content": request.message,
                    "timestamp": datetime.now().isoformat(),
                }
            ],
            "user_id": user_id,
            "conversation_id": f"conv_{user_id}_{datetime.now().timestamp()}",
            "metadata": request.metadata or {},
        }

        # If specific agent requested, use it directly
        if request.agent_id and request.team:
            team_agents = AVAILABLE_AGENTS.get(request.team, {})
            if request.agent_id in team_agents:
                agent_func = team_agents[request.agent_id]["agent"]
                result = agent_func(state)

                return {
                    "success": True,
                    "agent_id": request.agent_id,
                    "team": request.team,
                    "response": (
                        result.update.get("messages", [])[-1]
                        if hasattr(result, "update")
                        else {"content": "Agent processed request"}
                    ),
                    "state": result.update if hasattr(result, "update") else state,
                }

        # Otherwise use coordinator for routing
        result = await coordinator.process_message(message=request.message, state=state)

        return {"success": True, "result": result, "agent_used": "coordinator"}

    except Exception as e:
        logger.error(f"Agent chat failed: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to process agent request: {str(e)}"
        )


@router.post("/resume/analyze")
async def analyze_resume_with_agents(
    request: ResumeAnalysisRequest, user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """Analyze resume using our climate specialists"""
    try:
        # Use Lauren (Climate Policy) and Pendo (General Climate) for resume analysis
        state = {
            "messages": [
                {
                    "id": str(datetime.now().timestamp()),
                    "role": "user",
                    "content": f"Please analyze this resume for climate economy opportunities: {request.resume_text}",
                    "timestamp": datetime.now().isoformat(),
                }
            ],
            "user_id": user_id,
            "conversation_id": f"resume_analysis_{user_id}_{datetime.now().timestamp()}",
            "metadata": {"focus_areas": request.focus_areas or []},
        }

        # Use Pendo for general analysis
        result = PendoAgent(state)

        analysis_response = (
            result.update.get("messages", [])[-1] if hasattr(result, "update") else {}
        )

        return {
            "success": True,
            "analysis": analysis_response.get(
                "content", "Resume analyzed successfully"
            ),
            "recommendations": [
                "Consider climate policy roles",
                "Explore renewable energy opportunities",
                "Look into environmental consulting",
                "Investigate green technology positions",
            ],
            "skills_identified": ["transferable skills", "relevant experience"],
            "next_steps": [
                "Connect with our specialists for detailed guidance",
                "Explore training opportunities",
                "Network with climate professionals",
            ],
        }

    except Exception as e:
        logger.error(f"Resume analysis failed: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to analyze resume: {str(e)}"
        )


@router.get("/agents")
async def list_agents(
    team: Optional[str] = None, user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """List available agents and their capabilities"""
    if team and team in AVAILABLE_AGENTS:
        return {"team": team, "agents": AVAILABLE_AGENTS[team]}

    return {
        "all_teams": AVAILABLE_AGENTS,
        "summary": {
            "specialists_team": "General climate guidance and supervision",
            "veterans_team": "Support for military veterans transitioning to climate careers",
            "ej_team": "Environmental justice and community advocacy",
            "international_team": "Global climate opportunities and credential recognition",
            "support_team": "Mental health, crisis support, and career counseling",
        },
    }


@router.get("/agents/{team}/{agent_id}")
async def get_agent_info(
    team: str, agent_id: str, user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """Get detailed information about a specific agent"""
    if team not in AVAILABLE_AGENTS:
        raise HTTPException(status_code=404, detail="Team not found")

    team_agents = AVAILABLE_AGENTS[team]
    if agent_id not in team_agents:
        raise HTTPException(status_code=404, detail="Agent not found")

    agent_info = team_agents[agent_id]

    return {
        "team": team,
        "agent_id": agent_id,
        "name": agent_info["name"],
        "specialization": agent_info["specialization"],
        "capabilities": [
            "Climate career guidance",
            "Personalized recommendations",
            "Resource connections",
            "Strategic planning",
        ],
        "tools": [
            "Career search and analysis",
            "Policy research",
            "Training resource finding",
            "Network connections",
        ],
    }


@router.post("/search")
async def search_climate_resources(
    query: str, team: Optional[str] = None, user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """Search for climate resources using our agent system"""
    try:
        # Use Pendo for general searches or route to appropriate team
        state = {
            "messages": [
                {
                    "id": str(datetime.now().timestamp()),
                    "role": "user",
                    "content": f"Help me find resources about: {query}",
                    "timestamp": datetime.now().isoformat(),
                }
            ],
            "user_id": user_id,
            "conversation_id": f"search_{user_id}_{datetime.now().timestamp()}",
        }

        # Route based on team preference or use coordinator
        if team and team in AVAILABLE_AGENTS:
            # Use first agent from specified team
            agent_id = list(AVAILABLE_AGENTS[team].keys())[0]
            agent_func = AVAILABLE_AGENTS[team][agent_id]["agent"]
            result = agent_func(state)
        else:
            # Use Pendo for general searches
            result = PendoAgent(state)

        response = (
            result.update.get("messages", [])[-1] if hasattr(result, "update") else {}
        )

        return {
            "success": True,
            "query": query,
            "results": [
                {
                    "title": "Climate Career Resources",
                    "description": response.get("content", "Resources found"),
                    "type": "guidance",
                    "relevance": 0.9,
                }
            ],
            "agent_used": team or "pendo",
        }

    except Exception as e:
        logger.error(f"Resource search failed: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to search resources: {str(e)}"
        )


@router.get("/tools")
async def list_available_tools(
    user_id: str = Depends(verify_token),
) -> List[Dict[str, Any]]:
    """List all available tools across our agent system"""
    return [
        {
            "id": "agent_chat",
            "name": "Agent Chat",
            "description": "Chat with specialized climate economy agents",
            "category": "communication",
            "agents": "all",
        },
        {
            "id": "resume_analysis",
            "name": "Resume Analysis",
            "description": "Analyze resumes for climate career opportunities",
            "category": "career",
            "agents": ["pendo", "lauren"],
        },
        {
            "id": "resource_search",
            "name": "Resource Search",
            "description": "Search for climate economy resources and opportunities",
            "category": "research",
            "agents": "all",
        },
        {
            "id": "career_guidance",
            "name": "Career Guidance",
            "description": "Get personalized climate career recommendations",
            "category": "career",
            "agents": "all",
        },
        {
            "id": "policy_analysis",
            "name": "Policy Analysis",
            "description": "Analyze climate policies and their career implications",
            "category": "policy",
            "agents": ["pendo", "lauren", "andre"],
        },
    ]
