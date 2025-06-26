"""
Agent Awareness API routes
"""

from fastapi import APIRouter, HTTPException
from backend.agents.awareness import agent_awareness

router = APIRouter()


@router.get("/{agent_name}")
def get_agent_awareness(agent_name: str):
    """Get awareness/capabilities for a specific agent"""
    info = agent_awareness.get_agent_capability(agent_name)
    if not info:
        raise HTTPException(status_code=404, detail="Agent not found")
    return info.__dict__
