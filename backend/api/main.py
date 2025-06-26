"""
Main FastAPI application for Climate Economy Assistant.
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import structlog
import os
from contextlib import asynccontextmanager

from backend.api.routes.conversations import router as conversations_router
from backend.api.routes.auth import router as auth_router
from backend.api.routes.users import router as users_router
from backend.api.routes.resumes import router as resumes_router
from backend.api.routes.resume_processor import router as resume_processor_router
from backend.api.routes.langgraph import router as langgraph_router
from backend.api.routes.memory import router as memory_router
from backend.api.routes.tools import router as tools_router
from backend.api.routes.agents import router as agents_router
from backend.database.supabase_client import supabase
from backend.database.redis_client import redis_client
from .routes import router as api_router
from backend.api.routes.awareness import router as awareness_router
from backend.api.routes.coordination import router as coordination_router
from backend.api.routes.agent_coordinator import router as agent_coordinator_router
from backend.api.middleware.rate_limit import RateLimitMiddleware

# Import individual and verified tools routers
from backend.api.routes.individual_tools import router as individual_tools_router
from backend.api.routes.tools_verified import router as verified_tools_router

# Import all database route modules
from backend.api.routes.jobs import router as jobs_router
from backend.api.routes.education import router as education_router
from backend.api.routes.profiles import router as profiles_router
from backend.api.routes.analytics import router as analytics_router
from backend.api.routes.audit import router as audit_router
from backend.api.routes.resources import router as resources_router
from backend.api.routes.resume_chunks import router as resume_chunks_router

# Configure logging
logger = structlog.get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Startup
    try:
        # Initialize Supabase client
        _ = supabase.client

        # Initialize Redis client if not in development
        if os.getenv("ENVIRONMENT") != "development":
            is_connected = await redis_client.ping()
            if not is_connected:
                logger.error("Failed to connect to Redis")
                raise Exception("Redis connection failed")

    except Exception as e:
        logger.error("Failed to initialize services", error_msg=str(e))
        raise

    yield

    # Shutdown
    try:
        if os.getenv("ENVIRONMENT") != "development":
            await redis_client.close()
    except Exception as e:
        logger.error("Error during shutdown", error_msg=str(e))


app = FastAPI(
    title="Climate Economy Assistant API",
    description="API for Climate Economy Assistant",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS
origins = ["http://localhost:3000", "https://climate-economy-assistant.vercel.app"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add trusted host middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["localhost", "climate-economy-assistant.vercel.app"],
)

# Add rate limiting middleware
app.add_middleware(
    RateLimitMiddleware, requests_per_minute=100  # Adjust based on your needs
)


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": "2024-03-29T12:00:00Z",
        "version": "1.0.0",
    }


# Root endpoint with API documentation
@app.get("/")
async def root():
    """Root endpoint listing all available API endpoints"""
    return {
        "message": "Climate Economy Assistant API",
        "version": "1.0.0",
        "endpoints": {
            "health": "/health",
            "auth": "/api/auth/*",
            "users": "/api/users/*", 
            "conversations": "/api/conversations/*",
            "resumes": "/api/resumes/*",
            "langgraph": "/api/langgraph/*",
            "memory": "/api/memory/*",
            "tools": "/api/tools/*",
            "agents": "/api/v1/agents/*",
            "jobs": "/api/v1/jobs/*",
            "education": "/api/v1/education/*",
            "profiles": "/api/v1/profiles/*",
            "analytics": "/api/v1/analytics/*",
            "audit": "/api/v1/audit/*",
            "resources": "/api/v1/resources/*",
            "resume_chunks": "/api/v1/resume-chunks/*",
            "coordination": "/api/coordination/*",
            "awareness": "/api/awareness/*"
        },
        "docs": "/docs",
        "redoc": "/redoc"
    }


# Include routers with standardized prefixes
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(users_router, prefix="/api/users", tags=["users"])
app.include_router(
    conversations_router, prefix="/api/conversations", tags=["conversations"]
)
app.include_router(resumes_router, prefix="/api/resumes", tags=["resumes"])
app.include_router(resume_processor_router)
app.include_router(langgraph_router, prefix="/api/langgraph", tags=["langgraph"])
app.include_router(memory_router, prefix="/api/memory", tags=["memory"])
app.include_router(tools_router, prefix="/api/tools", tags=["tools"])
app.include_router(agents_router, prefix="/api/v1/agents", tags=["agents"])
app.include_router(awareness_router, prefix="/api/awareness", tags=["awareness"])
app.include_router(
    coordination_router, prefix="/api/coordination", tags=["coordination"]
)
app.include_router(
    agent_coordinator_router,
    prefix="/api/agent-coordinator",
    tags=["agent-coordinator"],
)
app.include_router(api_router)

# Register all database API routes with v1 prefix
app.include_router(jobs_router, prefix="/api/v1/jobs", tags=["jobs"])
app.include_router(education_router, prefix="/api/v1/education", tags=["education"])
app.include_router(profiles_router, prefix="/api/v1/profiles", tags=["profiles"])
app.include_router(analytics_router, prefix="/api/v1/analytics", tags=["analytics"])
app.include_router(audit_router, prefix="/api/v1/audit", tags=["audit"])
app.include_router(resources_router, prefix="/api/v1/resources", tags=["resources"])
app.include_router(resume_chunks_router, prefix="/api/v1/resume-chunks", tags=["resume-chunks"])

# Register individual and verified tool routers
app.include_router(individual_tools_router, prefix="/api/v1/tools", tags=["individual-tools"])
app.include_router(verified_tools_router, prefix="/api/v1/verified-tools", tags=["verified-tools"])

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handle all unhandled exceptions"""
    logger.error(
        "Unhandled exception",
        error_msg=str(exc),
        path=request.url.path,
        method=request.method,
    )
    return JSONResponse(
        status_code=500,
        content={
            "error": "internal_server_error",
            "message": "Internal server error",
            "path": request.url.path,
            "method": request.method,
        },
    )


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "backend.api.main:app", host="0.0.0.0", port=port, reload=True, log_level="info"
    )
