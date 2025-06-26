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
import logging
from contextlib import asynccontextmanager
import uuid

# Use relative imports to fix module import issues
from backend.api.routes.conversations import router as conversations_router
from backend.api.routes.auth import router as auth_router
from backend.api.routes.users import router as users_router
from backend.api.routes.agents import router as agents_router
from backend.api.routes.agent_coordinator import router as coordinator_router
from backend.api.routes.langgraph import router as langgraph_router
from backend.api.routes.memory import router as memory_router
from backend.api.routes.resumes import router as resumes_router

# Database API routes
from backend.api.routes.jobs import router as jobs_router
from backend.api.routes.education import router as education_router
from backend.api.routes.profiles import router as profiles_router
from backend.api.routes.analytics import router as analytics_router
from backend.api.routes.audit import router as audit_router
from backend.api.routes.resources import router as resources_router
from backend.api.routes.resume_chunks import router as resume_chunks_router
from backend.api.routes.individual_tools import router as individual_tools_router
from backend.api.routes.verified_tools import router as verified_tools_router
from backend.database.supabase_client import supabase
from backend.database.redis_client import redis_client

# Configure structured logging
structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.add_log_level,
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.JSONRenderer(),
    ],
    wrapper_class=structlog.make_filtering_bound_logger(logging.INFO),
    context_class=dict,
    logger_factory=structlog.PrintLoggerFactory(),
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info(
        "Starting Climate Economy Assistant API",
        version="4.0.0",
        environment=os.getenv("ENVIRONMENT", "development"),
    )

    # Test database connections
    try:
        # Test Supabase
        await supabase.query("conversations", "select")
        logger.info("Database connection successful", service="supabase")

        # Test Redis only in production
        if os.getenv("ENVIRONMENT") != "development":
            redis_client_instance = await redis_client.get_client()
            await redis_client_instance.ping()
            logger.info("Cache connection successful", service="redis")
        else:
            logger.info("Cache check skipped in development mode")

    except Exception as e:
        logger.error(
            "Database connection failed", error=str(e), error_type=type(e).__name__
        )
        if os.getenv("ENVIRONMENT") != "development":
            raise e

    yield

    # Shutdown
    logger.info("Shutting down Climate Economy Assistant API")
    await redis_client.close()


# Create FastAPI application
app = FastAPI(
    title="Climate Economy Assistant API",
    description="Backend API for Climate Economy Assistant - Multi-Agent Workforce Development System",
    version="4.0.0",
    docs_url="/docs" if os.getenv("ENVIRONMENT") != "production" else None,
    redoc_url="/redoc" if os.getenv("ENVIRONMENT") != "production" else None,
    lifespan=lifespan,
)

# Security middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=(
        ["*"]
        if os.getenv("ENVIRONMENT") == "development"
        else ["cea.georgenekwaya.com", "*.vercel.app", "localhost"]
    ),
)

# CORS middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js development
        "https://cea.georgenekwaya.com",  # Production frontend
        "https://*.vercel.app",  # Vercel preview deployments
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_request_id(request: Request, call_next):
    """Add request ID to each request for tracing"""
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id

    # Add request context to logger
    logger = structlog.get_logger().bind(
        request_id=request_id, path=request.url.path, method=request.method
    )

    try:
        response = await call_next(request)
        logger.info("Request processed", status_code=response.status_code)
        response.headers["X-Request-ID"] = request_id
        return response
    except Exception as e:
        logger.error("Request failed", error=str(e), error_type=type(e).__name__)
        raise


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(
        "Global exception",
        error=str(exc),
        error_type=type(exc).__name__,
        request_id=getattr(request.state, "request_id", None),
        path=request.url.path,
        method=request.method,
        exc_info=True,
    )
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": "An unexpected error occurred",
            "request_id": getattr(request.state, "request_id", None),
        },
    )


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    try:
        # Test database connections
        await supabase.query("conversations", "select")

        # Test Redis only in production
        redis_status = "skipped"
        if os.getenv("ENVIRONMENT") != "development":
            redis_client_instance = await redis_client.get_client()
            await redis_client_instance.ping()
            redis_status = "connected"

        return {
            "status": "healthy",
            "service": "climate-economy-assistant",
            "version": "4.0.0",
            "database": "connected",
            "cache": redis_status,
            "environment": os.getenv("ENVIRONMENT", "development"),
        }
    except Exception as e:
        logger.error("Health check failed", error=str(e), error_type=type(e).__name__)
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "service": "climate-economy-assistant",
                "error": str(e),
                "environment": os.getenv("ENVIRONMENT", "development"),
            },
        )


# Include API routes with proper organization

# Core system routes
app.include_router(verified_tools_router, prefix="/api/v1/verified-tools", tags=["verified-tools"])
app.include_router(auth_router, prefix="/api/v1/auth", tags=["authentication"])
app.include_router(users_router, prefix="/api/v1/users", tags=["users"])
app.include_router(
    conversations_router, prefix="/api/v1/conversations", tags=["conversations"]
)

# AGENTS: Register both old and new routes for compatibility
app.include_router(agents_router, prefix="/api/v1/agents", tags=["agents"])  # Old routes: /api/v1/agents/{id}/chat
app.include_router(agents_router, prefix="/api", tags=["agents-optimized"])  # New routes: /api/agents/{id}/chat

app.include_router(
    coordinator_router, prefix="/api/v1/coordinator", tags=["coordination"]
)
app.include_router(langgraph_router, prefix="/api/v1/langgraph", tags=["workflow"])
app.include_router(memory_router, prefix="/api/v1/memory", tags=["memory"])
app.include_router(resumes_router, prefix="/api/v1/resumes", tags=["resumes"])

# ADDITIONAL: Register resumes router for direct /api endpoints (extract-text, resumes/process)
app.include_router(resumes_router, prefix="/api", tags=["resumes-direct"])

# Database management routes
app.include_router(jobs_router, prefix="/api/v1/jobs", tags=["jobs"])
app.include_router(education_router, prefix="/api/v1/education", tags=["education"])
app.include_router(profiles_router, prefix="/api/v1/profiles", tags=["profiles"])
app.include_router(analytics_router, prefix="/api/v1/analytics", tags=["analytics"])
app.include_router(audit_router, prefix="/api/v1/audit", tags=["audit"])
app.include_router(resources_router, prefix="/api/v1/resources", tags=["resources"])
app.include_router(resume_chunks_router, prefix="/api/v1/resume-chunks", tags=["resume-processing"])
app.include_router(individual_tools_router, prefix="/api/v1/tools", tags=["individual-tools"])


# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Climate Economy Assistant API",
        "version": "4.0.0",
        "docs": "/docs",
        "health": "/health",
        "endpoints": {
            # Core system endpoints
            "auth": "/api/v1/auth",
            "users": "/api/v1/users",
            "conversations": "/api/v1/conversations",
            "agents": "/api/v1/agents",
            "coordinator": "/api/v1/coordinator",
            "langgraph": "/api/v1/langgraph",
            "memory": "/api/v1/memory",
            "resumes": "/api/v1/resumes",
            
            # Database management endpoints
            "jobs": "/api/v1/jobs",
            "education": "/api/v1/education",
            "profiles": "/api/v1/profiles",
            "analytics": "/api/v1/analytics",
            "audit": "/api/v1/audit",
            "resources": "/api/v1/resources",
            "resume_chunks": "/api/v1/resume-chunks",
        },
    }


if __name__ == "__main__":
    uvicorn.run(
        "backend.main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=os.getenv("ENVIRONMENT") == "development",
        log_level="info",
    )
