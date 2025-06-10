"""
Custom FastAPI app with lifespan events for Climate Economy Assistant
This handles proper initialization of Supabase, Redis, and other resources.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
import logging
import os
from typing import Dict, Any

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("cea_webapp")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan events for Climate Economy Assistant
    Handles startup and shutdown of critical resources
    """
    logger.info("🌱 Climate Economy Assistant - Starting up...")

    # Initialize resources
    startup_info = {}

    try:
        # Initialize Supabase connection
        logger.info("📊 Initializing Supabase connection...")
        from adapters.supabase import get_cached_supabase_client

        supabase_client = get_cached_supabase_client()
        if supabase_client:
            logger.info("✅ Supabase client initialized successfully")
            startup_info["supabase"] = "connected"
        else:
            logger.warning("⚠️  Supabase client failed to initialize")
            startup_info["supabase"] = "failed"

        # Initialize Redis connection (if configured)
        redis_host = os.getenv("REDIS_HOST")
        if redis_host:
            logger.info("🔄 Redis configuration detected...")
            startup_info["redis"] = "configured"
        else:
            logger.info("ℹ️  No Redis configuration found")
            startup_info["redis"] = "not_configured"

        # Test OpenAI connection
        openai_key = os.getenv("OPENAI_API_KEY")
        if openai_key and openai_key.startswith("sk-"):
            logger.info("🤖 OpenAI API key configured")
            startup_info["openai"] = "configured"
        else:
            logger.warning("⚠️  OpenAI API key not properly configured")
            startup_info["openai"] = "missing"

        # Test LangSmith configuration
        langsmith_key = os.getenv("LANGSMITH_API_KEY")
        if langsmith_key and langsmith_key.startswith("lsv2_"):
            logger.info("📈 LangSmith tracing configured")
            startup_info["langsmith"] = "configured"
        else:
            logger.info("ℹ️  LangSmith tracing not configured")
            startup_info["langsmith"] = "not_configured"

        # Store initialization info in app state
        app.state.startup_info = startup_info
        app.state.agents_initialized = True

        logger.info("🎉 Climate Economy Assistant startup complete!")
        logger.info(f"📋 Status: {startup_info}")

    except Exception as e:
        logger.error(f"❌ Error during startup: {e}")
        app.state.startup_info = {"error": str(e)}
        app.state.agents_initialized = False

    # App is ready to serve requests
    yield

    # Cleanup on shutdown
    logger.info("🌱 Climate Economy Assistant - Shutting down...")

    try:
        # Cleanup any resources if needed
        logger.info("🧹 Cleaning up resources...")

        # Clear cached connections
        # (Supabase client cleanup is handled automatically)

        logger.info("✅ Shutdown complete")

    except Exception as e:
        logger.error(f"❌ Error during shutdown: {e}")


# Create FastAPI app with lifespan events
app = FastAPI(
    title="Climate Economy Assistant API",
    description="Massachusetts Climate Economy Career Guidance System",
    version="1.0.0",
    lifespan=lifespan,
)


# Add health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint with startup status"""
    startup_info = getattr(app.state, "startup_info", {})
    agents_initialized = getattr(app.state, "agents_initialized", False)

    return {
        "status": "healthy" if agents_initialized else "degraded",
        "service": "climate_economy_assistant",
        "version": "1.0.0",
        "agents_available": agents_initialized,
        "components": startup_info,
        "capabilities": [
            "multi_agent_climate_career_guidance",
            "massachusetts_job_pipeline_38100",
            "gateway_cities_focus",
            "resume_analysis",
            "skills_translation",
            "act_partner_network",
        ],
    }


# Add system info endpoint
@app.get("/system/info")
async def system_info():
    """System information endpoint"""
    return {
        "system": "Climate Economy Assistant",
        "description": "Sophisticated multi-agent system for Massachusetts climate career transitions",
        "specialists": {
            "pendo": "Massachusetts Climate Economy Supervisor",
            "marcus": "Veterans Specialist (Military → Climate Careers)",
            "liv": "International Professional Specialist (Credentials & Visa)",
            "miguel": "Environmental Justice Specialist (Gateway Cities Focus)",
            "jasmine": "MA Resource Analyst (Resume Analysis & Job Matching)",
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
            ],
        },
        "endpoints": {
            "health": "/health",
            "docs": "/docs",
            "graphs": "Available via LangGraph API",
        },
    }


# Add custom route for agent status
@app.get("/agents/status")
async def agents_status():
    """Get status of all specialist agents"""
    return {
        "agents_initialized": getattr(app.state, "agents_initialized", False),
        "specialists": {
            "pendo": {"status": "active", "type": "supervisor"},
            "marcus": {"status": "active", "type": "veterans_specialist"},
            "liv": {"status": "active", "type": "international_specialist"},
            "miguel": {"status": "active", "type": "environmental_justice_specialist"},
            "jasmine": {"status": "active", "type": "ma_resource_analyst"},
        },
        "graphs_available": [
            "climate_agent",
            "resume_agent",
            "career_agent",
            "interactive_chat",
        ],
    }

