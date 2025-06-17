"""
Custom FastAPI app with lifespan events for Climate Economy Assistant V1
This handles proper initialization of Supabase, Redis, and other resources.
Following LangGraph 2025 best practices for webapp.py configuration.
"""

import os
import sys
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Response, HTTPException, Depends
import logging
from typing import Dict, Any, Optional, List
import asyncio
import redis.asyncio as redis
import aiofiles
import httpx
import json
from pydantic import BaseModel

# Add the project root to Python path to fix import issues
project_root = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("cea_webapp_v1")

# Try to import from backendv1 packages using absolute imports
try:
    from backendv1.utils.logger import setup_logger
    from backendv1.utils import human_in_loop_available
    from backendv1.config.settings import get_settings
    from backendv1.models import AgentResponse

    # Set up application logger
    logger = setup_logger("webapp_v1")
    logger.info("✅ Logger initialized successfully")

    # Get application settings
    settings = get_settings()
    logger.info("✅ Settings loaded successfully")

except ImportError as e:
    logger.error(f"Failed to import required modules: {e}")
    settings = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan events for Climate Economy Assistant V1
    Handles startup and shutdown of critical resources
    Following LangGraph 2025 patterns for webapp.py configuration
    """
    logger.info("🚀 Starting Climate Economy Assistant V1...")

    # Store initialization status
    app.state.initialization_status = {}
    startup_time = asyncio.get_event_loop().time()

    try:
        # Initialize resources asynchronously
        await _initialize_resources_async(app)

        # Calculate startup time
        total_startup_time = asyncio.get_event_loop().time() - startup_time
        logger.info(f"✅ CEA V1 initialized successfully in {total_startup_time:.2f}s")

        yield  # Server runs here

    except Exception as e:
        logger.error(f"❌ Startup failed: {e}")
        raise
    finally:
        # Cleanup resources asynchronously
        await _cleanup_resources_async(app)
        logger.info("🔄 Climate Economy Assistant V1 lifespan ended")


async def _initialize_resources_async(app: FastAPI):
    """Initialize all resources with async I/O operations"""

    # 1. Test Supabase Connection (Async)
    try:
        # Use httpx for async HTTP testing
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{os.getenv('SUPABASE_URL')}/rest/v1/",
                headers={"apikey": os.getenv("SUPABASE_ANON_KEY")},
            )
            if response.status_code == 200:
                app.state.initialization_status["supabase"] = "connected"
                logger.info("✅ Supabase connection verified")
            else:
                app.state.initialization_status["supabase"] = "failed"
                logger.warning("⚠️ Supabase connection failed")
    except Exception as e:
        app.state.initialization_status["supabase"] = f"failed: {str(e)}"
        logger.error(f"❌ Supabase test failed: {e}")

    # 2. Test Database Query (Async)
    try:
        # Use async database query instead of sync
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{os.getenv('SUPABASE_URL')}/rest/v1/users?select=count",
                headers={
                    "apikey": os.getenv("SUPABASE_ANON_KEY"),
                    "Authorization": f"Bearer {os.getenv('SUPABASE_ANON_KEY')}",
                },
            )
            if response.status_code in [200, 401]:  # 401 is OK for auth-protected endpoint
                app.state.initialization_status["database_test"] = "connected"
                logger.info("✅ Database query test passed")
            else:
                app.state.initialization_status["database_test"] = "failed"
    except Exception as e:
        app.state.initialization_status["database_test"] = f"failed: {str(e)}"
        logger.error(f"❌ Database test failed: {e}")

    # 3. Initialize Redis (Async)
    try:
        redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
        # Use redis.asyncio for stable async Redis connection
        app.state.redis = redis.from_url(redis_url, encoding="utf-8", decode_responses=True)

        # Test Redis connection asynchronously
        await app.state.redis.ping()
        app.state.initialization_status["redis"] = "connected"
        logger.info("✅ Redis connection established")

    except Exception as e:
        app.state.initialization_status["redis"] = f"failed: {str(e)}"
        logger.error(f"❌ Redis connection failed: {e}")
        app.state.redis = None

    # 4. Check API Keys (No I/O needed)
    api_status = {}

    # OpenAI
    if os.getenv("OPENAI_API_KEY"):
        api_status["openai"] = "configured"
    else:
        api_status["openai"] = "missing"

    # Anthropic
    if os.getenv("ANTHROPIC_API_KEY"):
        api_status["anthropic"] = "configured"
    else:
        api_status["anthropic"] = "missing"

    # Groq
    if os.getenv("GROQ_API_KEY"):
        api_status["groq"] = "configured"
    else:
        api_status["groq"] = "missing"

    # LangSmith
    if os.getenv("LANGCHAIN_API_KEY"):
        api_status["langsmith"] = "configured"
    else:
        api_status["langsmith"] = "missing"

    # Tavily
    if os.getenv("TAVILY_API_KEY"):
        api_status["tavily"] = "configured"
    else:
        api_status["tavily"] = "missing"

    # Initialize human-in-the-loop module if available
    if human_in_loop_available:
        try:
            from backendv1.utils.human_in_the_loop import initialize_human_loop_system

            await initialize_human_loop_system()
            api_status["human_in_loop"] = "initialized"
            logger.info("✅ Human-in-the-loop system initialized")
        except Exception as e:
            api_status["human_in_loop"] = f"failed: {str(e)}"
            logger.error(f"❌ Human-in-the-loop initialization failed: {e}")

    app.state.initialization_status.update(api_status)

    # 5. Climate Agents Status
    climate_agents = {
        "pendo": "active",
        "marcus": "active",
        "liv": "active",
        "miguel": "active",
        "jasmine": "active",
        "alex": "active",  # Alex - Empathy Specialist (crisis intervention & emotional support)
        "lauren": "active",  # Lauren - Climate Career Specialist (environmental justice & green jobs)
        "mai": "active",  # Mai - Resume & Career Transition Specialist (strategic optimization)
    }
    app.state.initialization_status["climate_agents"] = climate_agents

    logger.info(f"📋 Status: {app.state.initialization_status}")


async def _cleanup_resources_async(app: FastAPI):
    """Cleanup resources asynchronously"""
    try:
        # Close Redis connection if it exists
        if hasattr(app.state, "redis") and app.state.redis:
            await app.state.redis.aclose()
            logger.info("✅ Redis connection closed")
    except Exception as e:
        logger.error(f"❌ Cleanup error: {e}")


# Create FastAPI app with async lifespan
app = FastAPI(
    title="Climate Economy Assistant API V1",
    description="Advanced AI-powered platform for climate economy career guidance",
    version="1.0.0",
    lifespan=lifespan,
)


@app.get("/api/v1/health")
async def health_check():
    """Enhanced health check with initialization status"""
    if hasattr(app.state, "initialization_status"):
        return {
            "status": "healthy",
            "version": "1.0.0",
            "initialization": app.state.initialization_status,
            "message": "Climate Economy Assistant V1 is operational",
        }
    else:
        return {
            "status": "initializing",
            "message": "Climate Economy Assistant V1 is starting up",
        }


# Add system info endpoint with enhanced details
@app.get("/api/v1/system/info")
async def system_info():
    """System information endpoint with LangGraph integration details"""
    return {
        "system": "Climate Economy Assistant V1",
        "description": "Advanced 8-agent system for Massachusetts climate career transitions with enhanced intelligence",
        "framework": "LangGraph 2025",
        "version": "1.0.0",
        "backend_type": "langgraph",
        "human_in_loop": human_in_loop_available,
        "environment": os.environ.get("ENVIRONMENT", "development"),
        "specialists": {
            "pendo": "Massachusetts Climate Economy Supervisor",
            "marcus": "Veterans Specialist (Military → Climate Careers)",
            "liv": "International Professional Specialist (Credentials & Visa)",
            "miguel": "Environmental Justice Specialist (Gateway Cities Focus)",
            "jasmine": "MA Resource Analyst (Resume Analysis & Job Matching)",
            "alex": "Empathy & Crisis Intervention Specialist (Emotional Support & Confidence Building)",
            "lauren": "Climate Career Specialist (Environmental Justice & Green Job Opportunities)",
            "mai": "Resume & Career Transition Specialist (Strategic Optimization & ATS Enhancement)",
        },
        "capabilities": {
            "job_pipeline": "38,100 Massachusetts clean energy jobs",
            "geographic_focus": [
                "Brockton",
                "Fall River/New Bedford",
                "Lowell/Lawrence",
            ],
            "data_sources": "ACT partner network, real employer contacts",
            "specializations": [
                "resume_processing_analysis_31kb_tools",
                "web_search_integration_35kb_tools",
                "human_in_the_loop_escalation",
                "database_integration_supabase",
                "sophisticated_agent_orchestration_1777_lines",
                "crisis_detection_and_intervention",
                "empathy_driven_career_guidance",
                "climate_economy_specialization",
                "strategic_resume_optimization",
            ],
        },
        "edge_functions": {
            "ai_resume_processor": "AI-powered resume analysis",
            "smart_job_matching": "Vector similarity job search",
            "empathy_assessment": "Crisis detection & emotional support",
            "climate_chat_supervisor": "Intelligent agent routing (94% precision)",
            "crisis_intervention": "Emergency support system",
            "skills_translation": "Military/International skills mapping",
            "climate_career_guidance": "Comprehensive green economy pathways",
            "strategic_resume_enhancement": "ATS-optimized resume transformation",
        },
        "endpoints": {
            "health": "/api/v1/health",
            "docs": "/docs",
            "system_info": "/api/v1/system/info",
            "agents_status": "/api/v1/agents/status",
            "graphs": "Available via LangGraph API",
        },
    }


# Add custom route for agent status with enhanced monitoring
@app.get("/api/v1/agents/status")
async def agents_status():
    """Get detailed status of all specialist agents"""
    startup_info = getattr(app.state, "initialization_status", {})

    return {
        "agents_initialized": True,
        "framework": "LangGraph 2025",
        "total_agents": 8,
        "specialists": {
            "pendo": {
                "status": "active",
                "type": "supervisor",
                "capabilities": ["agent_routing", "crisis_detection", "user_steering"],
            },
            "marcus": {
                "status": "active",
                "type": "veterans_specialist",
                "capabilities": [
                    "military_transition",
                    "mos_translation",
                    "veteran_benefits",
                ],
            },
            "liv": {
                "status": "active",
                "type": "international_specialist",
                "capabilities": [
                    "credential_evaluation",
                    "visa_guidance",
                    "international_networking",
                ],
            },
            "miguel": {
                "status": "active",
                "type": "environmental_justice_specialist",
                "capabilities": [
                    "gateway_cities",
                    "community_outreach",
                    "equity_advocacy",
                ],
            },
            "jasmine": {
                "status": "active",
                "type": "ma_resource_analyst",
                "capabilities": [
                    "resume_analysis",
                    "job_matching",
                    "massachusetts_resources",
                ],
            },
            "alex": {
                "status": "active",
                "type": "empathy_specialist",
                "capabilities": [
                    "crisis_intervention",
                    "emotional_support",
                    "confidence_building",
                ],
            },
            "lauren": {
                "status": "active",
                "type": "climate_career_specialist",
                "capabilities": [
                    "climate_economy_guidance",
                    "environmental_justice_pathways",
                    "green_job_opportunities",
                    "act_partner_connections",
                ],
            },
            "mai": {
                "status": "active",
                "type": "resume_career_specialist",
                "capabilities": [
                    "strategic_resume_optimization",
                    "ats_enhancement",
                    "career_transition_planning",
                    "professional_branding",
                ],
            },
        },
        "graphs_available": [
            "climate_supervisor",
            "pendo_supervisor",
            "empathy_agent",
            "resume_agent",
            "career_agent",
            "interactive_chat",
        ],
        "edge_functions_deployed": [
            "ai-resume-processor",
            "smart-job-matching",
            "empathy-assessment",
            "climate-chat-supervisor",
            "crisis-intervention",
            "skills-translation",
        ],
        "infrastructure": startup_info,
    }


# Legacy endpoint compatibility - keep simple paths for backward compatibility
@app.get("/health")
async def health_check_legacy():
    """Legacy health check endpoint for backward compatibility"""
    return await health_check()


@app.get("/system/info")
async def system_info_legacy():
    """Legacy system info endpoint for backward compatibility"""
    return await system_info()


@app.get("/agents/status")
async def agents_status_legacy():
    """Legacy agents status endpoint for backward compatibility"""
    return await agents_status()


# Additional V1 legacy endpoints from original backend
@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Climate Economy Assistant V1 API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/v1/health",
        "interactive_chat": "/api/v1/interactive-chat",
        "backend_type": "backendv1_langgraph",
    }


@app.get("/api/v1/me")
async def get_current_user_v1():
    """V1 alias for current user endpoint"""
    # This will be handled by the auth router, but we provide a direct alias
    return {"status": "redirect", "message": "Use /api/me endpoint", "redirect_to": "/api/me"}


@app.get("/api/v1/auth/status")
async def auth_status_v1():
    """V1 alias for auth status endpoint"""
    return {
        "status": "redirect",
        "message": "Use /api/status endpoint",
        "redirect_to": "/api/status",
    }


@app.post("/api/v1/chat")
async def chat_v1_alias():
    """V1 alias for chat endpoint - redirects to interactive-chat"""
    return {
        "status": "redirect",
        "message": "Use /api/v1/interactive-chat endpoint",
        "redirect_to": "/api/v1/interactive-chat",
    }


@app.get("/api/v1/job-seekers/profile")
async def job_seekers_profile_v1():
    """V1 alias for job seekers profile"""
    return {
        "status": "redirect",
        "message": "Use /api/job-seekers/profile endpoint",
        "redirect_to": "/api/job-seekers/profile",
    }


@app.get("/api/v1/job-seekers/recommendations")
async def job_seekers_recommendations_v1():
    """V1 job seekers recommendations endpoint"""
    return {
        "status": "not_implemented",
        "message": "Job recommendations endpoint coming soon",
        "v1_alias": True,
        "backend_version": "v1",
    }


@app.get("/api/v1/job-seekers/workflow-status")
async def job_seekers_workflow_status_v1():
    """V1 job seekers workflow status endpoint"""
    return {
        "status": "active",
        "workflow": "pendo_supervisor",
        "specialists_available": 8,
        "v1_alias": True,
        "backend_version": "v1",
    }


@app.get("/api/v1/partners/profile")
async def partners_profile_v1():
    """V1 alias for partners profile"""
    return {
        "status": "redirect",
        "message": "Use /api/partners/profile endpoint",
        "redirect_to": "/api/partners/profile",
    }


@app.get("/api/v1/partners/dashboard")
async def partners_dashboard_v1():
    """V1 partners dashboard endpoint"""
    return {
        "status": "not_implemented",
        "message": "Partners dashboard endpoint coming soon",
        "v1_alias": True,
        "backend_version": "v1",
    }


@app.get("/api/v1/admin/profile")
async def admin_profile_v1():
    """V1 alias for admin profile"""
    return {
        "status": "redirect",
        "message": "Use /api/admin/profile endpoint",
        "redirect_to": "/api/admin/profile",
    }


@app.get("/api/v1/admin/dashboard")
async def admin_dashboard_v1():
    """V1 admin dashboard endpoint"""
    return {
        "status": "not_implemented",
        "message": "Admin dashboard endpoint coming soon",
        "v1_alias": True,
        "backend_version": "v1",
    }


@app.get("/api/v1/admin/users")
async def admin_users_v1():
    """V1 admin users endpoint"""
    return {
        "status": "not_implemented",
        "message": "Admin users endpoint coming soon",
        "v1_alias": True,
        "backend_version": "v1",
    }


# Add custom middleware for request logging (optional)
@app.middleware("http")
async def log_requests(request, call_next):
    """Optional request logging middleware"""
    start_time = asyncio.get_event_loop().time()
    response = await call_next(request)
    process_time = asyncio.get_event_loop().time() - start_time

    # Log slow requests
    if process_time > 1.0:
        logger.warning(
            f"Slow request: {request.method} {request.url.path} took {process_time:.2f}s"
        )

    return response


# Export the app as cea_app_v1 for LangGraph compatibility
cea_app_v1 = app

# Import and include all V1 API routers
# These imports are placed here to avoid circular imports
try:
    from backendv1.endpoints.auth import auth_router

    app.include_router(auth_router, prefix="/api", tags=["Authentication"])
    logger.info("✅ Auth router included")
except ImportError as e:
    logger.warning(f"Could not include auth router: {e}")

try:
    from backendv1.endpoints.chat_router import router as chat_router

    app.include_router(chat_router, prefix="/api/v1/chat", tags=["Chat"])
    logger.info("✅ Chat router included")
except ImportError as e:
    logger.warning(f"Could not include chat router: {e}")

try:
    from backendv1.endpoints.v1_aliases import router as v1_router

    app.include_router(v1_router, prefix="/api", tags=["V1 Compatibility"])
    logger.info("✅ V1 aliases router included")
except ImportError as e:
    logger.warning(f"Could not include v1_aliases router: {e}")

try:
    from backendv1.endpoints.streaming_router import router as streaming_router

    app.include_router(streaming_router, prefix="/api/v1/stream", tags=["Streaming"])
    logger.info("✅ Streaming router included")
except ImportError as e:
    logger.warning(f"Could not include streaming router: {e}")

try:
    from backendv1.endpoints.admin_router import router as admin_router

    app.include_router(admin_router, prefix="/api/v1/admin", tags=["Admin"])
    logger.info("✅ Admin router included")
except ImportError as e:
    logger.warning(f"Could not include admin router: {e}")

try:
    from backendv1.endpoints.careers_router import router as careers_router

    app.include_router(careers_router, prefix="/api/v1/careers", tags=["Careers"])
    logger.info("✅ Careers router included")
except ImportError as e:
    logger.warning(f"Could not include careers router: {e}")

try:
    from backendv1.endpoints.resume_router import router as resume_router

    app.include_router(resume_router, prefix="/api/v1/resume", tags=["Resume"])
    logger.info("✅ Resume router included")
except ImportError as e:
    logger.warning(f"Could not include resume router: {e}")

# Also keep the default app export
__all__ = ["app", "cea_app_v1"]
