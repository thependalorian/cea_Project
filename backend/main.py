"""
Climate Economy Assistant Backend API - Enhanced with Supervisor Workflow

This module serves as the main entry point for the Climate Economy Assistant API,
providing endpoints for chat, resume processing, and climate career guidance.

Enhanced with:
- Supervisor Workflow Integration
- LangGraph Multi-Agent System
- Enhanced Intelligence Framework
- Comprehensive Tool Integration
- Human-in-the-Loop Support
"""

import logging
import os
import asyncio
import uuid
from typing import Dict, Any, Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse

# Import API router
from api import api_router

# Import configuration
from core.config import get_settings

# Import the supervisor workflow
from api.workflows.climate_supervisor_workflow import (
    create_climate_supervisor_workflow,
    ClimateAgentState,
    initialize_enhanced_intelligence
)

# Import enhanced chat integration
from api.chat.interactive_chat import chat_graph

# Import enhanced intelligence components
from core.agents.enhanced_intelligence import (
    EnhancedIntelligenceCoordinator,
    IntelligenceLevel
)

# Import adapters
from adapters.supabase import get_supabase_client
from adapters.models import get_default_provider

# Configure logging
logging.basicConfig(
    level=logging.INFO, 
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("cea_main")

# Load settings
settings = get_settings()

# Global workflow instances
climate_supervisor_graph = None
enhanced_intelligence = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Enhanced application lifespan management with workflow initialization"""
    logger.info("🚀 Starting Climate Economy Assistant API...")
    
    try:
        # Initialize Enhanced Intelligence Framework
        global enhanced_intelligence
        enhanced_intelligence = await initialize_enhanced_intelligence()
        logger.info("✅ Enhanced Intelligence Framework initialized")
        
        # Initialize Supervisor Workflow
        global climate_supervisor_graph
        climate_supervisor_graph = create_climate_supervisor_workflow()
        logger.info("✅ Climate Supervisor Workflow initialized")
        
        # Test database connection
        supabase = get_supabase_client()
        if supabase:
            logger.info("✅ Supabase connection established")
        else:
            logger.warning("⚠️ Supabase connection failed - some features may be limited")
        
        # Test LLM provider
        try:
            provider = get_default_provider()
            logger.info(f"✅ Default LLM provider: {provider}")
        except Exception as e:
            logger.warning(f"⚠️ LLM provider initialization warning: {e}")
        
        logger.info("🎯 Climate Economy Assistant API is ready for multi-agent interactions")
        
        yield
        
    except Exception as e:
        logger.error(f"❌ Startup error: {str(e)}")
        raise
    finally:
        logger.info("🛑 Shutting down Climate Economy Assistant API...")


# Initialize FastAPI app with enhanced configuration
app = FastAPI(
    title="Climate Economy Assistant API",
    description="""
    API for the Climate Economy Assistant, providing climate career guidance in Massachusetts.
    
    Features:
    - Multi-agent supervisor workflow with specialist routing
    - Enhanced intelligence framework for 8.5-9.5/10 performance
    - Comprehensive tool integration (resume, jobs, training, credentials)
    - Human-in-the-loop coordination
    - Real-time analytics and performance monitoring
    """,
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure enhanced middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(GZipMiddleware, minimum_size=1000)

# Include API router
app.include_router(api_router, prefix="/api")


@app.get("/")
async def root():
    """Enhanced root endpoint with workflow status"""
    return {
        "message": "Climate Economy Assistant API is running",
        "version": "2.0.0",
        "status": "healthy",
        "features": {
            "supervisor_workflow": climate_supervisor_graph is not None,
            "enhanced_intelligence": enhanced_intelligence is not None,
            "multi_agent_system": True,
            "human_in_the_loop": True
        },
        "endpoints": {
            "health": "/health",
            "supervisor_chat": "/api/v1/supervisor-chat",
            "interactive_chat": "/api/v1/interactive-chat",
            "workflow_status": "/api/v1/workflow-status",
            "docs": "/docs"
        }
    }


@app.get("/health")
async def health_check():
    """Comprehensive health check with workflow status"""
    health_status = {
        "status": "healthy",
        "timestamp": str(asyncio.get_event_loop().time()),
        "services": {
            "api": True,
            "supervisor_workflow": climate_supervisor_graph is not None,
            "enhanced_intelligence": enhanced_intelligence is not None,
            "database": False,
            "llm_provider": False
        },
        "version": "2.0.0"
    }
    
    # Test database connection
    try:
        supabase = get_supabase_client()
        if supabase:
            health_status["services"]["database"] = True
    except Exception as e:
        logger.warning(f"Database health check failed: {e}")
    
    # Test LLM provider
    try:
        provider = get_default_provider()
        if provider:
            health_status["services"]["llm_provider"] = True
    except Exception as e:
        logger.warning(f"LLM provider health check failed: {e}")
    
    # Overall health assessment
    if all(health_status["services"].values()):
        health_status["status"] = "healthy"
    elif any(health_status["services"].values()):
        health_status["status"] = "partial"
    else:
        health_status["status"] = "unhealthy"
    
    return health_status


@app.post("/api/v1/supervisor-chat")
async def supervisor_chat_endpoint(
    request: Dict[str, Any],
    background_tasks: BackgroundTasks
):
    """
    Enhanced supervisor chat endpoint using the climate supervisor workflow
    """
    try:
        if not climate_supervisor_graph:
            raise HTTPException(
                status_code=503, 
                detail="Supervisor workflow not initialized"
            )
        
        # Extract request parameters
        message = request.get("message", "")
        user_id = request.get("user_id", str(uuid.uuid4()))
        conversation_id = request.get("conversation_id", str(uuid.uuid4()))
        
        if not message:
            raise HTTPException(
                status_code=400, 
                detail="Message is required"
            )
        
        # Create initial state for supervisor workflow
        initial_state = ClimateAgentState(
            messages=[{"role": "human", "content": message}],
            user_id=user_id,
            conversation_id=conversation_id,
            workflow_state="active",
            tools_used=[],
            specialist_handoffs=[],
            resource_recommendations=[],
            next_actions=[],
            error_recovery_log=[],
            reflection_history=[],
            case_recommendations=[]
        )
        
        # Execute supervisor workflow
        logger.info(f"🎯 Processing supervisor chat for user {user_id}")
        
        # Run the workflow
        result = await climate_supervisor_graph.ainvoke(initial_state)
        
        # Extract response from the result
        response_message = ""
        if result.get("messages"):
            last_message = result["messages"][-1]
            if hasattr(last_message, 'content'):
                response_message = last_message.content
            elif isinstance(last_message, dict):
                response_message = last_message.get('content', '')
        
        # Background task for analytics
        background_tasks.add_task(
            log_supervisor_interaction,
            user_id=user_id,
            conversation_id=conversation_id,
            message=message,
            response=response_message,
            specialist_used=result.get("current_specialist"),
            tools_used=result.get("tools_used", [])
        )
        
        return {
            "success": True,
            "response": response_message,
            "conversation_id": conversation_id,
            "specialist": result.get("current_specialist"),
            "tools_used": result.get("tools_used", []),
            "next_actions": result.get("next_actions", []),
            "workflow_state": result.get("workflow_state", "completed"),
            "quality_metrics": result.get("quality_metrics"),
            "intelligence_level": result.get("intelligence_level", "developing")
        }
        
    except Exception as e:
        logger.error(f"❌ Supervisor chat error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing supervisor chat: {str(e)}"
        )


async def log_supervisor_interaction(**kwargs):
    """Background task to log supervisor interactions"""
    try:
        # Import here to avoid circular imports
        from tools.analytics import log_specialist_interaction
        await log_specialist_interaction(**kwargs)
    except Exception as e:
        logger.error(f"Analytics logging error: {e}")


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler for better error responses"""
    logger.error(f"Unhandled exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": "An unexpected error occurred",
            "request_id": str(uuid.uuid4())
        }
    )


if __name__ == "__main__":
    import uvicorn
    
    # Configuration for different environments
    config = {
        "host": "0.0.0.0",
        "port": int(os.environ.get("PORT", 8000)),
        "reload": os.environ.get("ENVIRONMENT", "development") == "development",
        "workers": 1 if os.environ.get("ENVIRONMENT", "development") == "development" else 4,
        "access_log": True,
        "log_level": os.environ.get("LOG_LEVEL", "info").lower()
    }
    
    logger.info(f"🚀 Starting Climate Economy Assistant API with config: {config}")
    uvicorn.run("main:app", **config)
