"""
Simple Climate Economy Assistant Backend API

This is a simplified version for testing basic functionality without langchain dependencies.
"""

import logging
import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("simple_main")

# Initialize FastAPI app
app = FastAPI(
    title="Climate Economy Assistant API (Simple)",
    description="Simplified API for testing basic functionality",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Root endpoint - API health check"""
    return {
        "message": "Climate Economy Assistant API is running (Simple Mode)",
        "version": "1.0.0",
        "status": "healthy",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Test Supabase connection
        from adapters.supabase import get_supabase_client

        supabase = get_supabase_client()
        supabase_status = "connected" if supabase else "disconnected"

        return {
            "status": "healthy",
            "supabase": supabase_status,
            "environment": {
                "supabase_url_configured": bool(os.getenv("SUPABASE_URL")),
                "openai_key_configured": bool(os.getenv("OPENAI_API_KEY")),
            },
        }
    except Exception as e:
        logger.error(f"Health check error: {e}")
        return {"status": "error", "error": str(e)}


@app.on_event("startup")
async def startup_event():
    """Runs when the API starts up"""
    try:
        logger.info("Starting Climate Economy Assistant API (Simple Mode)")

        # Test Supabase connection
        from adapters.supabase import get_supabase_client

        supabase = get_supabase_client()
        if supabase:
            logger.info("✅ Supabase connection established")
        else:
            logger.warning("⚠️ Supabase connection failed")

        logger.info("Climate Economy Assistant API is ready (Simple Mode)")
    except Exception as e:
        logger.error(f"Startup error: {str(e)}")


if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("simple_main:app", host="0.0.0.0", port=port, reload=True)
