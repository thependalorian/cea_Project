"""
API package for Climate Economy Assistant

This package contains all API endpoints and routers for the Climate Economy Assistant,
including chat, resume processing, and climate career guidance.
"""

from fastapi import APIRouter

from api.endpoints.chat import router as chat_router
from api.endpoints.interactive_chat import router as interactive_chat_router
from api.endpoints.streaming import router as streaming_router

# Import all routers
from api.endpoints.resume import router as resume_router

# Create main API router
api_router = APIRouter()

# Include all routers
api_router.include_router(chat_router, prefix="/chat", tags=["chat"])
api_router.include_router(resume_router, prefix="/resume", tags=["resume"])
api_router.include_router(interactive_chat_router, prefix="/v1", tags=["interactive"])
api_router.include_router(streaming_router, prefix="/v1", tags=["streaming"])
