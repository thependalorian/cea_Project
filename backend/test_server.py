"""
Simple test server for Climate Economy Assistant backend

This file provides a minimal FastAPI server for testing environment variables
and basic configuration without dependencies on other components.
"""

import json
import logging
import os
from datetime import datetime
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from core.config import get_settings

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("cea_test_backend")

# Create FastAPI application
app = FastAPI(
    title="Climate Economy Assistant Test API",
    description="Test backend API for the Climate Economy Assistant",
    version="1.0.0",
)

# Load settings
settings = get_settings()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Models for chat endpoint
class InteractionRequest(BaseModel):
    """Chat interaction request model"""

    query: str
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    context: Optional[Dict[str, Any]] = {}
    stream: Optional[bool] = False


@app.get("/health")
async def health_check():
    """
    Health check endpoint for monitoring
    """
    return {
        "status": "healthy",
        "time": datetime.now().isoformat(),
        "version": settings.VERSION,
    }


@app.get("/env-check")
async def env_check():
    """
    Check environment variables
    """
    return {
        "supabase_url": settings.SUPABASE_URL,
        "openai_api_key_configured": bool(settings.OPENAI_API_KEY),
        "debug_mode": settings.DEBUG,
        "cors_origins": settings.CORS_ORIGINS,
    }


@app.post("/api/v1/interactive-chat")
async def interactive_chat(request: InteractionRequest):
    """
    Simple mock implementation of the chat endpoint
    """
    logger.info(f"Received chat request: {request.query}")

    # Log full request for debugging
    logger.info(f"Full request: {json.dumps(request.dict(), default=str)}")

    # Simple response
    return {
        "content": f"Echo: {request.query}\n\nThis is a test response from the backend running on port 8000.",
        "role": "assistant",
        "specialist_type": "test_specialist",
        "conversation_id": request.session_id or "test-session",
        "metadata": {"test": True},
    }


@app.get("/")
async def root():
    """
    Root endpoint
    """
    return {
        "name": "Climate Economy Assistant Test API",
        "message": "Environment variables loaded successfully!",
    }


if __name__ == "__main__":
    import uvicorn

    # Get host and port settings
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))

    # Start server
    uvicorn.run("test_server:app", host=host, port=port, reload=True)
