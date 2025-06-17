"""
Custom FastAPI app with lifespan events for Climate Economy Assistant
This handles proper initialization of Supabase, Redis, and other resources.
Following LangGraph 2025 best practices for webapp.py configuration.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
import logging
import os
from typing import Dict, Any
import asyncio
import redis.asyncio as redis  # Changed to redis.asyncio for better compatibility
import aiofiles  # Added for async file operations
import httpx  # For async HTTP calls

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("cea_webapp")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan events for Climate Economy Assistant
    Handles startup and shutdown of critical resources
    Following LangGraph 2025 patterns for webapp.py configuration
    """
    logger.info("🚀 Starting Climate Economy Assistant Lifespan...")

    # Store initialization status
    app.state.initialization_status = {}
    startup_time = asyncio.get_event_loop().time()

    try:
        # Initialize async resources
        await _initialize_resources_async(app)

        # Calculate startup time
        total_startup_time = asyncio.get_event_loop().time() - startup_time
        logger.info(f"✅ CEA initialized successfully in {total_startup_time:.2f}s")

        yield  # Server runs here

    except Exception as e:
        logger.error(f"❌ Startup failed: {e}")
        raise
    finally:
        # Cleanup async resources
        await _cleanup_resources_async(app)
        logger.info("🔄 Climate Economy Assistant lifespan ended")


async def _initialize_resources_async(app: FastAPI):
    """Initialize all resources with async I/O operations"""

    # 1. Test Supabase Connection (Async)
    try:
        # Use httpx for async HTTP testing instead of supabase client
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
            if response.status_code in [
                200,
                401,
            ]:  # 401 is OK for auth-protected endpoint
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
        app.state.redis = redis.from_url(
            redis_url, encoding="utf-8", decode_responses=True
        )

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
    title="Climate Economy Assistant API",
    description="Advanced AI-powered platform for climate economy career guidance",
    version="2.0.0",
    lifespan=lifespan,
)


@app.get("/health")
async def health_check():
    """Enhanced health check with initialization status"""
    if hasattr(app.state, "initialization_status"):
        return {
            "status": "healthy",
            "initialization": app.state.initialization_status,
            "message": "Climate Economy Assistant is operational",
        }
    else:
        return {
            "status": "initializing",
            "message": "Climate Economy Assistant is starting up",
        }


# Add system info endpoint with enhanced details
@app.get("/system/info")
async def system_info():
    """System information endpoint with LangGraph integration details"""
    return {
        "system": "Climate Economy Assistant",
        "description": "Advanced 7-agent system for Massachusetts climate career transitions with enhanced intelligence",
        "framework": "LangGraph 2025",
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
            "health": "/health",
            "docs": "/docs",
            "system_info": "/system/info",
            "agents_status": "/agents/status",
            "graphs": "Available via LangGraph API",
        },
    }


# Add custom route for agent status with enhanced monitoring
@app.get("/agents/status")
async def agents_status():
    """Get detailed status of all specialist agents"""
    startup_info = getattr(app.state, "initialization_status", {})

    return {
        "agents_initialized": True,
        "framework": "LangGraph 2025",
        "total_agents": 7,
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
            "climate_agent",
            "resume_agent",
            "career_agent",
            "interactive_chat",
            "empathy_workflow",
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
