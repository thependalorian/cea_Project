"""
Careers Router - Climate Career Opportunities Endpoints
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def careers_placeholder():
    return {"message": "Careers endpoints - Implementation coming in Phase 2C"}


# Export the router with both names for compatibility
careers_router = router
__all__ = ["router", "careers_router"]
