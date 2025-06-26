"""
Supabase configuration and client initialization.
"""

import os
from typing import Optional
from supabase import create_client, Client
import structlog

from ..utils.logger import get_logger

logger = get_logger(__name__)

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL", "")

# Use service key for backend operations to bypass RLS
SUPABASE_KEY = (
    os.getenv("SUPABASE_SERVICE_KEY") or 
    os.getenv("SUPABASE_SERVICE_ROLE_KEY") or 
    os.getenv("SUPABASE_ANON_KEY") or 
    os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY") or
    "your-supabase-key"
)

# Global client instance
_supabase_client: Optional[Client] = None


def get_supabase_client() -> Client:
    """Get or create Supabase client instance."""
    global _supabase_client

    if _supabase_client is None:
        try:
            _supabase_client = create_client(
                supabase_url=SUPABASE_URL, supabase_key=SUPABASE_KEY
            )
            logger.info("Supabase client initialized successfully", url=SUPABASE_URL)
        except Exception as e:
            logger.error("Error initializing Supabase client", error=str(e))
            raise

    return _supabase_client


def close_supabase_client() -> None:
    """Close Supabase client connection."""
    global _supabase_client

    if _supabase_client is not None:
        try:
            # Close any active connections
            _supabase_client = None
            logger.info("Supabase client closed successfully")
        except Exception as e:
            logger.error("Error closing Supabase client", error=str(e))
            raise
