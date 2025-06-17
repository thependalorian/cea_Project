"""
Climate Economy Assistant V1 Main Application

This is the main entry point for the Climate Economy Assistant V1 backend.
It initializes all required services and provides the FastAPI application.

Location: backendv1/main.py
"""

import os
import logging
from fastapi import FastAPI, Request, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from backendv1.config.settings import get_settings
from backendv1.adapters.auth_adapter import auth_adapter
from backendv1.adapters.supabase_adapter import supabase_adapter
from backendv1.tasks.profile_sync import start_sync_task
from backendv1.utils.audit_logger import audit_logger
from backendv1.auth.role_guard import role_guard
from backendv1.utils.logger import setup_logger

logger = setup_logger("cea_main_v1")
settings = get_settings()

# Create FastAPI application
app = FastAPI(
    title="Climate Economy Assistant V1",
    description="Climate Economy Assistant V1 API",
    version="1.0.0",
    docs_url="/api/docs" if settings.is_development else None,
    redoc_url="/api/redoc" if settings.is_development else None,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)


# Add audit logging middleware
@app.middleware("http")
async def audit_logging_middleware(request: Request, call_next):
    """Middleware for audit logging API access"""
    # Get request details
    endpoint = request.url.path
    method = request.method

    # Process the request
    response = await call_next(request)

    # Only log API endpoints
    if endpoint.startswith("/api/"):
        # Try to get user ID from request state
        user_id = getattr(request.state, "user_id", None)

        # Log API access
        await audit_logger.log_api_access(
            endpoint=endpoint,
            method=method,
            user_id=user_id,
            status_code=response.status_code,
            request=request,
        )

    return response


# Startup event
@app.on_event("startup")
async def startup_event():
    """Run on application startup"""
    logger.info("🚀 Climate Economy Assistant V1 - Starting up")

    # Validate connections
    if not await supabase_adapter.validate_connection():
        logger.warning("Supabase connection failed, some features may not work")

    # Start background tasks if in production mode
    if not settings.is_development:
        # Start profile sync task
        try:
            profile_sync_task = start_sync_task(interval_minutes=60)
            logger.info("👥 Profile sync task started")
        except Exception as e:
            logger.error(f"Error starting profile sync task: {e}")

    logger.info("✅ Core services initialized successfully")


# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Run on application shutdown"""
    logger.info("🛑 Climate Economy Assistant V1 - Shutting down")


# Health check endpoint
@app.get("/api/v1/health")
async def health_check():
    """API health check endpoint"""
    return {
        "status": "healthy",
        "version": "v1",
        "backend_type": "backendv1_with_pendo",
        "supervisor": "pendo",
        "specialists_available": 7,
        "endpoints": {
            "interactive_chat": "/api/v1/interactive-chat",
            "resume_analysis": "/api/v1/resume-analysis",
            "career_search": "/api/v1/career-search",
            "health": "/api/v1/health",
        },
        "compatibility_layer": True,
        "human_in_the_loop": True,
    }


# Protected endpoint example using enhanced role guard
@app.get("/api/v1/protected-example")
async def protected_example(user=Depends(role_guard.requires_role("job_seeker"))):
    """Example protected endpoint requiring job seeker role"""
    return {"message": f"Hello {user['user_type']} {user['user_id']}", "user": user}


# Enhanced protected endpoint example
@app.get("/api/v1/enhanced-protected-example")
async def enhanced_protected_example():
    """Example enhanced protected endpoint - import will be added when enhanced_role_guard is ready"""
    # This will be updated once enhanced_role_guard imports are working
    return {
        "message": "Enhanced protection endpoint",
        "note": "Will be protected with enhanced_role_guard once imports are resolved",
    }


# Root redirect to docs
@app.get("/")
async def root():
    """Redirect root to docs"""
    return {"message": "Climate Economy Assistant V1 API", "docs": "/api/docs"}


# Import API routers
# These imports are intentionally placed here to avoid circular imports
from backendv1.endpoints.auth import auth_router
from backendv1.endpoints.enhanced_auth import enhanced_auth_router
from backendv1.endpoints.chat_router import router as chat_router
from backendv1.endpoints.v1_aliases import router as v1_aliases_router

# Include routers
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(enhanced_auth_router, prefix="/api/v1/auth", tags=["Enhanced Authentication"])
app.include_router(chat_router, prefix="/api/v1", tags=["Chat"])
app.include_router(v1_aliases_router, prefix="/api", tags=["V1 Compatibility"])

logger.info("✅ All routers mounted successfully")


# Create app factory function for ASGI servers
def create_app() -> FastAPI:
    """Create FastAPI application instance"""
    return app


# Create application instance for ASGI servers
cea_app_v1 = app
