"""
API Routes for Climate Economy Assistant
"""

from fastapi import APIRouter

from .auth import router as auth
from .users import router as users
from .conversations import router as conversations

__all__ = ["auth", "users", "conversations"]

# Initialize routers for different endpoints
router = APIRouter()

# Import and include sub-routers here as they are created
# Example:
# from .conversations import router as conversations_router
# router.include_router(conversations_router, prefix="/conversations", tags=["conversations"])


@router.get("/")
async def root():
    """Root endpoint to verify API is running"""
    return {"message": "Climate Economy Assistant API v4.0", "status": "operational"}
