"""
Application Settings and Configuration

Following rule #8: Use TypeScript (JavaScript) for frontend, Python for backend
Following rule #14: Ensure application security and scalability
Following rule #17: Secure database access

This module manages all environment variables and application settings
Location: backendv1/config/settings.py
"""

import os
from typing import List, Optional, Dict
from functools import lru_cache

try:
    from pydantic_settings import BaseSettings
except ImportError:
    from pydantic import BaseSettings

from pydantic import Field, validator


class DatabaseSettings(BaseSettings):
    """
    Database-specific settings and configuration
    Following rule #17: Secure database access with proper authentication
    """

    # Supabase Configuration
    SUPABASE_URL: str = Field(default="", env="SUPABASE_URL")
    SUPABASE_SERVICE_KEY: str = Field(default="", env="SUPABASE_SERVICE_KEY")
    SUPABASE_ANON_KEY: str = Field(default="", env="SUPABASE_ANON_KEY")
    SUPABASE_JWT_SECRET: str = Field(default="", env="SUPABASE_JWT_SECRET")

    # Database Connection Settings
    DATABASE_URL: str = Field(default="", env="DATABASE_URL")
    DATABASE_POOL_SIZE: int = Field(default=10, env="DATABASE_POOL_SIZE")
    DATABASE_MAX_OVERFLOW: int = Field(default=20, env="DATABASE_MAX_OVERFLOW")
    DATABASE_TIMEOUT: int = Field(default=30, env="DATABASE_TIMEOUT")

    # Connection Pool Settings
    DATABASE_POOL_RECYCLE: int = Field(default=3600, env="DATABASE_POOL_RECYCLE")
    DATABASE_POOL_PRE_PING: bool = Field(default=True, env="DATABASE_POOL_PRE_PING")

    # Query Settings
    DATABASE_QUERY_TIMEOUT: int = Field(default=30, env="DATABASE_QUERY_TIMEOUT")
    DATABASE_MAX_RETRIES: int = Field(default=3, env="DATABASE_MAX_RETRIES")

    @property
    def is_configured(self) -> bool:
        """Check if database is properly configured"""
        return bool(self.SUPABASE_URL and self.SUPABASE_SERVICE_KEY)

    @property
    def connection_string(self) -> str:
        """Get the primary database connection string"""
        return self.DATABASE_URL or self.SUPABASE_URL

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


class OpenAISettings(BaseSettings):
    """
    OpenAI-specific settings and configuration
    Following rule #14: Ensure application security and scalability
    """

    # OpenAI Configuration
    OPENAI_API_KEY: str = Field(default="", env="OPENAI_API_KEY")
    OPENAI_MODEL: str = Field(default="gpt-4", env="OPENAI_MODEL")
    OPENAI_TEMPERATURE: float = Field(default=0.7, env="OPENAI_TEMPERATURE")
    OPENAI_MAX_TOKENS: int = Field(default=2000, env="OPENAI_MAX_TOKENS")
    OPENAI_TIMEOUT: int = Field(default=60, env="OPENAI_TIMEOUT")

    # Groq Configuration (OpenAI-compatible)
    GROQ_API_KEY: str = Field(default="", env="GROQ_API_KEY")
    GROQ_MODEL: str = Field(default="llama3-8b-8192", env="GROQ_MODEL")
    GROQ_TEMPERATURE: float = Field(default=0.7, env="GROQ_TEMPERATURE")
    GROQ_MAX_TOKENS: int = Field(default=2000, env="GROQ_MAX_TOKENS")

    # Anthropic Configuration
    ANTHROPIC_API_KEY: str = Field(default="", env="ANTHROPIC_API_KEY")
    ANTHROPIC_MODEL: str = Field(default="claude-3-sonnet-20240229", env="ANTHROPIC_MODEL")
    ANTHROPIC_TEMPERATURE: float = Field(default=0.7, env="ANTHROPIC_TEMPERATURE")
    ANTHROPIC_MAX_TOKENS: int = Field(default=2000, env="ANTHROPIC_MAX_TOKENS")

    # Rate Limiting
    OPENAI_RATE_LIMIT_RPM: int = Field(default=60, env="OPENAI_RATE_LIMIT_RPM")
    OPENAI_RATE_LIMIT_TPM: int = Field(default=40000, env="OPENAI_RATE_LIMIT_TPM")

    @validator("OPENAI_TEMPERATURE", "GROQ_TEMPERATURE", "ANTHROPIC_TEMPERATURE")
    def validate_temperature(cls, v):
        if not 0.0 <= v <= 2.0:
            raise ValueError("Temperature must be between 0.0 and 2.0")
        return v

    @validator("OPENAI_MAX_TOKENS", "GROQ_MAX_TOKENS", "ANTHROPIC_MAX_TOKENS")
    def validate_max_tokens(cls, v):
        if v <= 0:
            raise ValueError("Max tokens must be positive")
        return v

    class Config:
        env_file = ".env"
        case_sensitive = True


class RedisSettings(BaseSettings):
    """
    Redis-specific settings and configuration
    Following rule #14: Ensure application security and scalability
    """

    # Redis Configuration
    REDIS_URL: str = Field(default="redis://localhost:6379", env="REDIS_URL")
    REDIS_HOST: str = Field(default="localhost", env="REDIS_HOST")
    REDIS_PORT: int = Field(default=6379, env="REDIS_PORT")
    REDIS_PASSWORD: str = Field(default="", env="REDIS_PASSWORD")
    REDIS_DB: int = Field(default=0, env="REDIS_DB")

    # Connection Settings
    REDIS_MAX_CONNECTIONS: int = Field(default=20, env="REDIS_MAX_CONNECTIONS")
    REDIS_TIMEOUT: int = Field(default=30, env="REDIS_TIMEOUT")
    REDIS_RETRY_ON_TIMEOUT: bool = Field(default=True, env="REDIS_RETRY_ON_TIMEOUT")

    # Cache Settings
    REDIS_DEFAULT_TTL: int = Field(default=3600, env="REDIS_DEFAULT_TTL")  # 1 hour
    REDIS_SESSION_TTL: int = Field(default=86400, env="REDIS_SESSION_TTL")  # 24 hours
    REDIS_CACHE_PREFIX: str = Field(default="cea_v1:", env="REDIS_CACHE_PREFIX")

    # Performance Settings
    REDIS_SOCKET_KEEPALIVE: bool = Field(default=True, env="REDIS_SOCKET_KEEPALIVE")
    REDIS_SOCKET_KEEPALIVE_OPTIONS: Dict[str, int] = Field(
        default_factory=lambda: {"TCP_KEEPINTVL": 1, "TCP_KEEPCNT": 3, "TCP_KEEPIDLE": 1},
        env="REDIS_SOCKET_KEEPALIVE_OPTIONS",
    )

    @validator("REDIS_PORT")
    def validate_redis_port(cls, v):
        if not 1 <= v <= 65535:
            raise ValueError("Redis port must be between 1 and 65535")
        return v

    @validator("REDIS_DB")
    def validate_redis_db(cls, v):
        if not 0 <= v <= 15:
            raise ValueError("Redis DB must be between 0 and 15")
        return v

    class Config:
        env_file = ".env"
        case_sensitive = True


class AuthSettings(BaseSettings):
    """
    Authentication-specific settings and configuration
    Following rule #16: Protect exposed endpoints with secure authentication
    """

    # JWT Configuration
    JWT_SECRET_KEY: str = Field(
        default="your-secret-key-change-in-production", env="JWT_SECRET_KEY"
    )
    JWT_ALGORITHM: str = Field(default="HS256", env="JWT_ALGORITHM")
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30, env="JWT_ACCESS_TOKEN_EXPIRE_MINUTES")
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = Field(default=7, env="JWT_REFRESH_TOKEN_EXPIRE_DAYS")

    # Session Configuration
    SESSION_SECRET_KEY: str = Field(
        default="your-session-secret-change-in-production", env="SESSION_SECRET_KEY"
    )
    SESSION_EXPIRE_MINUTES: int = Field(default=60, env="SESSION_EXPIRE_MINUTES")

    # Password Security
    PASSWORD_MIN_LENGTH: int = Field(default=8, env="PASSWORD_MIN_LENGTH")
    PASSWORD_REQUIRE_UPPERCASE: bool = Field(default=True, env="PASSWORD_REQUIRE_UPPERCASE")
    PASSWORD_REQUIRE_LOWERCASE: bool = Field(default=True, env="PASSWORD_REQUIRE_LOWERCASE")
    PASSWORD_REQUIRE_NUMBERS: bool = Field(default=True, env="PASSWORD_REQUIRE_NUMBERS")
    PASSWORD_REQUIRE_SPECIAL: bool = Field(default=True, env="PASSWORD_REQUIRE_SPECIAL")

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = Field(default=60, env="RATE_LIMIT_PER_MINUTE")
    RATE_LIMIT_PER_HOUR: int = Field(default=1000, env="RATE_LIMIT_PER_HOUR")
    RATE_LIMIT_PER_DAY: int = Field(default=10000, env="RATE_LIMIT_PER_DAY")

    # Security Headers
    ENABLE_CORS: bool = Field(default=True, env="ENABLE_CORS")
    CORS_ORIGINS: List[str] = Field(
        default_factory=lambda: ["http://localhost:3000"], env="CORS_ORIGINS"
    )
    ENABLE_CSRF_PROTECTION: bool = Field(default=True, env="ENABLE_CSRF_PROTECTION")

    # OAuth Configuration (for future use)
    GOOGLE_CLIENT_ID: str = Field(default="", env="GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET: str = Field(default="", env="GOOGLE_CLIENT_SECRET")
    GITHUB_CLIENT_ID: str = Field(default="", env="GITHUB_CLIENT_ID")
    GITHUB_CLIENT_SECRET: str = Field(default="", env="GITHUB_CLIENT_SECRET")

    @validator("JWT_ACCESS_TOKEN_EXPIRE_MINUTES")
    def validate_access_token_expire(cls, v):
        if not 5 <= v <= 1440:  # 5 minutes to 24 hours
            raise ValueError("Access token expiry must be between 5 minutes and 24 hours")
        return v

    @validator("PASSWORD_MIN_LENGTH")
    def validate_password_length(cls, v):
        if not 6 <= v <= 128:
            raise ValueError("Password minimum length must be between 6 and 128 characters")
        return v

    class Config:
        env_file = ".env"
        case_sensitive = True


class Settings(BaseSettings):
    """
    Application settings with environment variable loading
    Follows rule #16: Protect exposed endpoints with secure configuration
    """

    # Environment Configuration
    ENVIRONMENT: str = Field(default="development", env="ENVIRONMENT")
    DEBUG: bool = Field(default=False, env="DEBUG")
    DEV_MODE: bool = Field(default=False, env="DEV_MODE")

    # API Configuration
    API_HOST: str = Field(default="0.0.0.0", env="API_HOST")
    API_PORT: int = Field(default=8000, env="API_PORT")

    # CORS Configuration for Vercel deployment (rule #4)
    ALLOWED_ORIGINS: List[str] = Field(
        default=[
            "http://localhost:3000",
            "http://localhost:3001",
            "https://*.vercel.app",
            "https://climate-economy-assistant.vercel.app",
        ],
        env="ALLOWED_ORIGINS",
    )

    # Database Configuration (rule #8: Use Supabase with SSR)
    SUPABASE_URL: str = Field(default="", env="NEXT_PUBLIC_SUPABASE_URL")
    SUPABASE_SERVICE_KEY: str = Field(default="", env="SUPABASE_SERVICE_ROLE_KEY")
    SUPABASE_ANON_KEY: str = Field(default="", env="NEXT_PUBLIC_SUPABASE_ANON_KEY")
    SUPABASE_JWT_SECRET: str = Field(default="", env="SUPABASE_JWT_SECRET")

    # AI Model Configuration
    OPENAI_API_KEY: str = Field(default="", env="OPENAI_API_KEY")
    ANTHROPIC_API_KEY: str = Field(default="", env="ANTHROPIC_API_KEY")
    GROQ_API_KEY: str = Field(default="", env="GROQ_API_KEY")

    # External API Keys
    TAVILY_API_KEY: str = Field(default="", env="TAVILY_API_KEY")

    # Redis Configuration (for caching)
    REDIS_URL: str = Field(default="", env="REDIS_URL")
    REDIS_PASSWORD: str = Field(default="", env="REDIS_PASSWORD")

    # Security Configuration
    SECRET_KEY: str = Field(default="development-secret-key", env="SECRET_KEY")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30, env="ACCESS_TOKEN_EXPIRE_MINUTES")

    # Rate Limiting (rule #16: Protect exposed endpoints)
    RATE_LIMIT_REQUESTS: int = Field(default=100, env="RATE_LIMIT_REQUESTS")
    RATE_LIMIT_WINDOW: int = Field(default=3600, env="RATE_LIMIT_WINDOW")  # 1 hour

    # LangGraph Configuration
    LANGGRAPH_MAX_STEPS: int = Field(default=25, env="LANGGRAPH_MAX_STEPS")
    LANGGRAPH_TIMEOUT: int = Field(default=30, env="LANGGRAPH_TIMEOUT")

    # Agent Configuration
    DEFAULT_AI_MODEL: str = Field(default="gpt-4", env="DEFAULT_AI_MODEL")
    AGENT_TEMPERATURE: float = Field(default=0.7, env="AGENT_TEMPERATURE")
    AGENT_MAX_TOKENS: int = Field(default=2000, env="AGENT_MAX_TOKENS")

    # File Upload Configuration
    MAX_FILE_SIZE_MB: int = Field(default=10, env="MAX_FILE_SIZE_MB")
    ALLOWED_FILE_TYPES: List[str] = Field(
        default=["pdf", "docx", "doc", "txt"], env="ALLOWED_FILE_TYPES"
    )

    # Monitoring and Analytics
    ENABLE_ANALYTICS: bool = Field(default=True, env="ENABLE_ANALYTICS")
    LOG_LEVEL: str = Field(default="INFO", env="LOG_LEVEL")

    # Human-in-the-Loop Configuration
    enable_human_interrupts: bool = Field(default=False, env="ENABLE_HUMAN_INTERRUPTS")
    human_interrupt_timeout: int = Field(default=120, env="HUMAN_INTERRUPT_TIMEOUT")
    human_queue_url: Optional[str] = Field(default=None, env="HUMAN_QUEUE_URL")
    human_feedback_webhook: Optional[str] = Field(default=None, env="HUMAN_FEEDBACK_WEBHOOK")
    human_intervention_quality_threshold: float = Field(default=5.0, env="HUMAN_QUALITY_THRESHOLD")
    human_intervention_confidence_threshold: float = Field(
        default=0.6, env="HUMAN_CONFIDENCE_THRESHOLD"
    )
    crisis_escalation_email: Optional[str] = Field(
        default="support@climateeconomyassistant.org", env="CRISIS_ESCALATION_EMAIL"
    )

    # LangGraph Configuration
    langgraph_state_persistence: bool = Field(default=False, env="LANGGRAPH_STATE_PERSISTENCE")
    langgraph_state_ttl: int = Field(default=86400, env="LANGGRAPH_STATE_TTL")
    langgraph_streaming_enabled: bool = Field(default=True, env="LANGGRAPH_STREAMING_ENABLED")
    langgraph_checkpoint_enabled: bool = Field(default=False, env="LANGGRAPH_CHECKPOINT_ENABLED")

    @validator("ALLOWED_ORIGINS", pre=True)
    def parse_cors_origins(cls, v):
        """Parse CORS origins from string or list"""
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v

    @validator("ALLOWED_FILE_TYPES", pre=True)
    def parse_file_types(cls, v):
        """Parse allowed file types from string or list"""
        if isinstance(v, str):
            return [file_type.strip() for file_type in v.split(",")]
        return v

    @validator("ENVIRONMENT")
    def validate_environment(cls, v):
        """Validate environment values"""
        allowed_envs = ["development", "staging", "production"]
        if v not in allowed_envs:
            raise ValueError(f"Environment must be one of {allowed_envs}")
        return v

    @property
    def is_development(self) -> bool:
        """Check if running in development environment or dev mode"""
        return self.ENVIRONMENT.lower() in ["development", "dev", "local"] or self.DEV_MODE

    @property
    def is_production(self) -> bool:
        """Check if running in production mode"""
        return self.ENVIRONMENT == "production"

    @property
    def database_url(self) -> str:
        """Get formatted database URL"""
        return self.SUPABASE_URL

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True
        extra = "ignore"  # Ignore extra environment variables


@lru_cache()
def get_settings() -> Settings:
    """
    Get cached application settings
    Following rule #15: Include error checks and logging

    Returns:
        Settings: Application configuration instance
    """
    try:
        settings = Settings()

        # Validate critical settings in production
        if settings.is_production:
            required_settings = [
                "SUPABASE_URL",
                "SUPABASE_SERVICE_KEY",
                "SUPABASE_JWT_SECRET",
                "OPENAI_API_KEY",
                "SECRET_KEY",
            ]

            missing_settings = []
            for setting in required_settings:
                if not getattr(settings, setting):
                    missing_settings.append(setting)

            if missing_settings:
                raise ValueError(f"Missing required production settings: {missing_settings}")

        return settings

    except Exception as e:
        # Rule #15: Include error checks and logging
        import logging

        logger = logging.getLogger(__name__)
        logger.error(f"Failed to load application settings: {e}")
        raise


# Export for convenience
__all__ = [
    "Settings",
    "DatabaseSettings",
    "OpenAISettings",
    "RedisSettings",
    "AuthSettings",
    "get_settings",
]
