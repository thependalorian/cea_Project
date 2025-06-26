"""
Memory routes for the Climate Economy Assistant API.
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
import structlog
from datetime import datetime
import uuid

from backend.api.middleware.auth import verify_token
from backend.database.redis_client import redis_client
from backend.services.embeddings import get_embedding_service
from backend.api.models.memory import MemoryCreate, MemoryResponse, MemoryQuery
from backend.api.services.memory_service import MemoryService

router = APIRouter()
logger = structlog.get_logger(__name__)


class MemoryEntry(BaseModel):
    """Model for memory entries"""

    content: str
    metadata: Dict[str, Any] = {}
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    type: str = "conversation"
    embedding: Optional[List[float]] = None


class SearchQuery(BaseModel):
    """Model for memory search queries"""

    query: str
    filters: Dict[str, Any] = {}
    limit: int = 10


class StoreRequest(BaseModel):
    """Model for storing memory entries"""

    entries: List[MemoryEntry]


@router.get("/retrieve/{memory_id}")
async def retrieve_memory(
    memory_id: str, user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """Retrieve a specific memory entry"""
    try:
        # Get memory from Redis
        memory_key = f"memory:{user_id}:{memory_id}"
        memory_data = await redis_client.get(memory_key)

        if not memory_data:
            raise HTTPException(status_code=404, detail="Memory not found")

        return {"memory_id": memory_id, "data": memory_data}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            "memory_retrieval_failed",
            error=str(e),
            memory_id=memory_id,
            user_id=user_id,
        )
        raise HTTPException(
            status_code=500, detail=f"Failed to retrieve memory: {str(e)}"
        )


@router.post("/memory/store", response_model=MemoryResponse)
async def store_memory(
    data: MemoryCreate, user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """Store a memory."""
    try:
        service = MemoryService()
        memory = await service.store_memory(user_id, data)
        return memory
    except Exception as e:
        logger.error(f"Error storing memory: {e}")
        raise HTTPException(status_code=500, detail="Failed to store memory")


@router.post("/memory/search")
async def search_memory(
    query: MemoryQuery, user_id: str = Depends(verify_token)
) -> List[Dict[str, Any]]:
    """Search memories."""
    try:
        service = MemoryService()
        memories = await service.search_memory(user_id, query)
        return memories
    except Exception as e:
        logger.error(f"Error searching memory: {e}")
        raise HTTPException(status_code=500, detail="Failed to search memory")


@router.get("/memory/{memory_id}")
async def get_memory(
    memory_id: str, user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """Get a memory by ID."""
    try:
        service = MemoryService()
        memory = await service.get_memory(memory_id, user_id)
        if not memory:
            raise HTTPException(status_code=404, detail=f"Memory {memory_id} not found")
        return memory
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error getting memory: {e}")
        raise HTTPException(status_code=500, detail="Failed to get memory")
