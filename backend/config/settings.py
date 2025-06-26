"""Application settings and configuration."""

import os
from functools import lru_cache
from typing import Dict, Any, Optional


class Settings:
    """Application settings."""

    # API Configuration
    API_VERSION: str = "v1"
    API_PREFIX: str = f"/api/{API_VERSION}"
    DEBUG: bool = os.getenv("DEBUG", "False").lower() in ("true", "1", "t")

    # Authentication
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "development_secret_key")
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # Database
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")

    # Redis
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")

    # AI Services
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    DEFAULT_MODEL: str = os.getenv("DEFAULT_MODEL", "gpt-4-turbo")

    @property
    def default_llm(self):
        """Return the default LLM provider object using the adapter."""
        # Import here to avoid circular import
        from backend.adapters import models as model_adapter

        return model_adapter.get_default_provider()

    # Rate Limiting
    RATE_LIMIT_REQUESTS: int = int(os.getenv("RATE_LIMIT_REQUESTS", "100"))
    RATE_LIMIT_PERIOD: int = int(
        os.getenv("RATE_LIMIT_PERIOD", "3600")
    )  # 1 hour in seconds

    # CORS
    CORS_ORIGINS: list = os.getenv("CORS_ORIGINS", "*").split(",")

    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    # Agent Configuration
    @property
    def AGENT_CONFIG(self) -> Dict[str, Any]:
        """Return agent configuration with models loaded lazily."""
        # Import here to avoid circular import
        from backend.adapters import models as model_adapter

        return {
            "pendo": {
                "name": "Pendo",
                "description": "General support agent",
                "model": model_adapter.get_default_provider(),
            },
            "marcus": {
                "name": "Marcus",
                "description": "Veterans specialist",
                "model": model_adapter.get_default_provider(),
            },
            "liv": {
                "name": "Liv",
                "description": "International specialist",
                "model": model_adapter.get_default_provider(),
            },
            "miguel": {
                "name": "Miguel",
                "description": "Environmental Justice specialist",
                "model": model_adapter.get_default_provider(),
            },
            "jasmine": {
                "name": "Jasmine",
                "description": "MA Resources specialist",
                "model": model_adapter.get_default_provider(),
            },
            "lauren": {
                "name": "Lauren",
                "description": "Climate Careers specialist",
                "model": model_adapter.get_default_provider(),
            },
        }


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
