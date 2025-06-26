"""
Agent Coordinator Diagnostics API routes
"""

from fastapi import APIRouter
from pydantic import BaseModel
from backend.agents.agent_coordinator import coordinator

router = APIRouter()


@router.get("/available-agents")
def get_available_agents():
    """Get all available agents and their info"""
    return coordinator.get_available_agents()


class SemanticRouteRequest(BaseModel):
    message: str


@router.post("/semantic-route")
async def semantic_route(data: SemanticRouteRequest):
    """Get semantic routing for a message"""
    return await coordinator.semantic_route_message(data.message)
