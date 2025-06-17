"""
Settings Module - Centralized Configuration

This module provides centralized access to all configuration settings
for the Climate Economy Assistant V1 backend.

Location: backendv1/settings.py
"""

from backendv1.config.settings import get_settings, Settings, DatabaseSettings
from backendv1.utils.logger import setup_logger

logger = setup_logger("settings")

# Get the main settings instance
settings = get_settings()

# Export commonly used settings
SUPABASE_URL = settings.SUPABASE_URL
SUPABASE_SERVICE_KEY = settings.SUPABASE_SERVICE_KEY
SUPABASE_ANON_KEY = settings.SUPABASE_ANON_KEY
SUPABASE_JWT_SECRET = settings.SUPABASE_JWT_SECRET

OPENAI_API_KEY = settings.OPENAI_API_KEY
GROQ_API_KEY = settings.GROQ_API_KEY
ANTHROPIC_API_KEY = settings.ANTHROPIC_API_KEY

SECRET_KEY = settings.SECRET_KEY
ENVIRONMENT = settings.ENVIRONMENT
DEBUG = settings.DEBUG

# Database settings
DATABASE_URL = settings.DATABASE_URL
DATABASE_POOL_SIZE = getattr(settings, "DATABASE_POOL_SIZE", 10)
DATABASE_MAX_OVERFLOW = getattr(settings, "DATABASE_MAX_OVERFLOW", 20)
DATABASE_TIMEOUT = getattr(settings, "DATABASE_TIMEOUT", 30)

# API settings
API_VERSION = settings.API_VERSION
API_PREFIX = settings.API_PREFIX
CORS_ORIGINS = settings.CORS_ORIGINS

# LangSmith settings
LANGCHAIN_API_KEY = settings.LANGCHAIN_API_KEY
LANGCHAIN_PROJECT = settings.LANGCHAIN_PROJECT
LANGCHAIN_TRACING_V2 = settings.LANGCHAIN_TRACING_V2

# Tavily settings
TAVILY_API_KEY = settings.TAVILY_API_KEY

# Redis settings
REDIS_URL = settings.REDIS_URL

logger.info("✅ Settings module initialized successfully")

# Export everything
__all__ = [
    "settings",
    "Settings",
    "DatabaseSettings",
    "get_settings",
    "SUPABASE_URL",
    "SUPABASE_SERVICE_KEY",
    "SUPABASE_ANON_KEY",
    "SUPABASE_JWT_SECRET",
    "OPENAI_API_KEY",
    "GROQ_API_KEY",
    "ANTHROPIC_API_KEY",
    "SECRET_KEY",
    "ENVIRONMENT",
    "DEBUG",
    "DATABASE_URL",
    "DATABASE_POOL_SIZE",
    "DATABASE_MAX_OVERFLOW",
    "DATABASE_TIMEOUT",
    "API_VERSION",
    "API_PREFIX",
    "CORS_ORIGINS",
    "LANGCHAIN_API_KEY",
    "LANGCHAIN_PROJECT",
    "LANGCHAIN_TRACING_V2",
    "TAVILY_API_KEY",
    "REDIS_URL",
]
