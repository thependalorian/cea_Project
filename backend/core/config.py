"""
Core configuration module for Climate Economy Assistant

This module centralizes all configuration settings, environment variables,
and constants used throughout the application.
"""

import os
from functools import lru_cache
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv
from pydantic import BaseModel, Field

# Load .env file explicitly before creating Settings
load_dotenv()


class Settings(BaseModel):
    """
    Application settings loaded from environment variables
    """

    # API Configuration
    API_V1_PREFIX: str = "/api/v1"
    PROJECT_NAME: str = "Climate Economy Assistant"
    VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "development_secret_key")

    # OpenAI Configuration
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4-turbo")
    OPENAI_TEMPERATURE: float = float(os.getenv("OPENAI_TEMPERATURE", "0.7"))

    # Groq Configuration
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "llama3-70b-8192")
    GROQ_TEMPERATURE: float = float(os.getenv("GROQ_TEMPERATURE", "0.7"))

    # Model Provider Selection
    DEFAULT_MODEL_PROVIDER: str = os.getenv("DEFAULT_MODEL_PROVIDER", "openai")

    # Supabase Configuration
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")
    SUPABASE_JWT_SECRET: str = os.getenv("SUPABASE_JWT_SECRET", "")
    NEXT_PUBLIC_SUPABASE_URL: str = os.getenv("NEXT_PUBLIC_SUPABASE_URL", "")
    NEXT_PUBLIC_SUPABASE_ANON_KEY: str = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "")

    # Postgres Configuration
    POSTGRES_URL: str = os.getenv("POSTGRES_URL", "")
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "")
    POSTGRES_HOST: str = os.getenv("POSTGRES_HOST", "")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "")
    POSTGRES_DATABASE: str = os.getenv("POSTGRES_DATABASE", "")
    POSTGRES_PRISMA_URL: str = os.getenv("POSTGRES_PRISMA_URL", "")
    POSTGRES_URL_NON_POOLING: str = os.getenv("POSTGRES_URL_NON_POOLING", "")

    # Redis Configuration
    REDIS_PORT: str = os.getenv("REDIS_PORT", "")
    REDIS_USERNAME: str = os.getenv("REDIS_USERNAME", "")
    REDIS_PASSWORD: str = os.getenv("REDIS_PASSWORD", "")
    REDIS_HOST: str = os.getenv("REDIS_HOST", "")

    # Tavily Configuration
    TAVILY_API_KEY: str = os.getenv("TAVILY_API_KEY", "")

    # Application Configuration
    APP_URL: str = os.getenv("APP_URL", "")
    PII_ENCRYPTION_KEY: str = os.getenv("PII_ENCRYPTION_KEY", "")

    # CORS Settings
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "https://*.vercel.app"]

    # Storage Configuration
    STORAGE_BUCKET: str = "resumes"

    # Path Configuration
    ROOT_DIR: str = os.path.dirname(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    )

    # Feature Flags
    ENABLE_ENHANCED_AGENTS: bool = True
    ENABLE_ANALYTICS: bool = True
    ENABLE_HITL: bool = True


@lru_cache()
def get_settings() -> Settings:
    """
    Get cached settings instance to avoid reloading from environment
    for each request
    """
    return Settings()


# Constants

# Specialist Types
SPECIALIST_TYPES = {
    "international": "international_specialist",
    "veteran": "veteran_specialist",
    "environmental_justice": "environmental_justice_specialist",
    "tool": "tool_specialist",
    "fallback": "fallback_system",
}

# Message Roles
MESSAGE_ROLES = {
    "user": "user",
    "assistant": "assistant",
    "system": "system",
    "human": "human",
}

# Status Types
STATUS_TYPES = {
    "completed": "completed",
    "pending": "pending",
    "pending_human": "pending_human",
    "interrupted": "interrupted",
    "error": "error",
}

# Resource Types
RESOURCE_TYPES = {
    "job": "job",
    "education": "education",
    "partner": "partner",
    "knowledge": "knowledge",
}

# Climate Economy Sectors
CLIMATE_SECTORS = [
    "offshore_wind",
    "clean_energy",
    "green_building",
    "clean_transportation",
    "energy_storage",
    "climate_tech",
    "environmental_justice",
]

# Search Types
SEARCH_TYPES = ["all", "jobs", "education", "partners", "knowledge"]
