"""
Admin Router - Administrative Management Endpoints
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def admin_placeholder():
    return {"message": "Admin endpoints - Implementation coming in Phase 2C"}


# Export the router with both names for compatibility
admin_router = router
__all__ = ["router", "admin_router"]
