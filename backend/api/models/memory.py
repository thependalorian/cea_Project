"""
Memory models for the Climate Economy Assistant.
"""

from pydantic import BaseModel
from typing import Dict, Any, Optional, List
from datetime import datetime


class MemoryBase(BaseModel):
    """Base memory model."""

    content: str
    metadata: Optional[Dict[str, Any]] = None


class MemoryCreate(MemoryBase):
    """Memory creation model."""

    embedding: Optional[List[float]] = None


class MemoryResponse(MemoryBase):
    """Memory response model."""

    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime


class MemoryQuery(BaseModel):
    """Memory query model."""

    query: str
    limit: int = 10
    metadata_filters: Optional[Dict[str, Any]] = None
