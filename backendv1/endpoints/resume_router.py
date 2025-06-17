"""
Resume Router - Resume Analysis and Optimization Endpoints
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def resume_placeholder():
    return {"message": "Resume endpoints - Implementation coming in Phase 2C"}


# Export the router with both names for compatibility
resume_router = router
__all__ = ["router", "resume_router"]
