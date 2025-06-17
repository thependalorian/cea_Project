"""
V1 Aliases Module - Backward Compatibility

This module provides aliases and backward compatibility functions
for the Climate Economy Assistant V1 backend.

Location: backendv1/v1_aliases.py
"""

from fastapi import APIRouter
from backendv1.utils.logger import setup_logger

logger = setup_logger("v1_aliases")

# Create router for v1 aliases
router = APIRouter(prefix="/api/v1/aliases", tags=["v1-aliases"])


@router.get("/health")
async def health_check():
    """
    Health check endpoint for v1 aliases

    Following rule #4: Vercel compatibility for endpoints
    Following rule #5: Design quick and scalable endpoints
    """
    return {"status": "healthy", "service": "v1_aliases", "version": "1.0.0"}


@router.get("/status")
async def get_status():
    """
    Get status of v1 aliases system
    """
    return {"aliases_active": True, "backward_compatibility": "enabled", "version": "1.0.0"}


# Legacy endpoint aliases for backward compatibility
@router.get("/legacy/resume-analysis")
async def legacy_resume_analysis():
    """
    Legacy endpoint alias for resume analysis
    Redirects to new endpoint structure
    """
    return {
        "message": "This endpoint has been moved",
        "new_endpoint": "/api/v1/resume-analysis",
        "status": "deprecated",
    }


@router.get("/legacy/career-search")
async def legacy_career_search():
    """
    Legacy endpoint alias for career search
    Redirects to new endpoint structure
    """
    return {
        "message": "This endpoint has been moved",
        "new_endpoint": "/api/v1/career-search",
        "status": "deprecated",
    }


logger.info("✅ V1 aliases module initialized successfully")

# Create alias for backward compatibility
v1_router = router

# Export router
__all__ = ["router", "v1_router"]
