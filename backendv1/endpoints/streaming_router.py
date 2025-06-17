"""
Streaming Router - Real-time Communication Endpoints
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def streaming_placeholder():
    return {"message": "Streaming endpoints - Implementation coming in Phase 2C"}


# Export the router with both names for compatibility
streaming_router = router
__all__ = ["router", "streaming_router"]
