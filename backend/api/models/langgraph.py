"""
LangGraph models for the Climate Economy Assistant.
"""

from pydantic import BaseModel
from typing import Dict, Any, Optional, List
from datetime import datetime


class GraphRequest(BaseModel):
    """Graph execution request model."""

    workflow_id: str
    input_data: Dict[str, Any]
    config: Optional[Dict[str, Any]] = None


class GraphResponse(BaseModel):
    """Graph execution response model."""

    workflow_id: str
    status: str
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None


class WorkflowBase(BaseModel):
    """Base workflow model."""

    name: str
    description: str
    metadata: Optional[Dict[str, Any]] = None


class WorkflowCreate(WorkflowBase):
    """Workflow creation model."""

    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]


class WorkflowResponse(WorkflowBase):
    """Workflow response model."""

    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]
