"""
Environment Variables Validation
Ensures all critical secrets and configuration are properly set
"""

import os
from typing import Dict, List, Optional
import structlog
from dataclasses import dataclass, field

logger = structlog.get_logger(__name__)


@dataclass
class EnvironmentConfig:
    """Environment configuration validation - All fields optional with defaults"""

    # Database
    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_key: Optional[str] = None

    # Redis
    redis_url: str = ""

    # Authentication
    auth_secret: str = ""
    nextauth_url: str = ""

    # API Keys
    openai_api_key: Optional[str] = None
    anthropic_api_key: Optional[str] = None

    # Monitoring
    sentry_dsn: Optional[str] = None

    # App Settings
    environment: str = "development"
    debug: bool = False
    cors_origins: Optional[List[str]] = field(default_factory=list)


def get_settings() -> EnvironmentConfig:
    """Get environment settings with defaults"""
    return EnvironmentConfig(
        supabase_url=os.getenv("SUPABASE_URL", ""),
        supabase_anon_key=os.getenv("SUPABASE_ANON_KEY", ""),
        supabase_service_key=os.getenv("SUPABASE_SERVICE_KEY"),
        redis_url=os.getenv("REDIS_URL", "redis://localhost:6379"),
        auth_secret=os.getenv("AUTH_SECRET", "default-secret"),
        nextauth_url=os.getenv("NEXTAUTH_URL", "http://localhost:3000"),
        openai_api_key=os.getenv("OPENAI_API_KEY"),
        anthropic_api_key=os.getenv("ANTHROPIC_API_KEY"),
        sentry_dsn=os.getenv("SENTRY_DSN"),
        environment=os.getenv("ENVIRONMENT", "development"),
        debug=os.getenv("DEBUG", "false").lower() == "true",
        cors_origins=os.getenv("CORS_ORIGINS", "").split(",") if os.getenv("CORS_ORIGINS") else [],
    )


def validate_environment() -> EnvironmentConfig:
    """
    Validate and return environment configuration.
    Raises ValueError if critical variables are missing.
    """
    errors = []
    warnings = []

    # Critical variables that must be set
    critical_vars = {
        "SUPABASE_URL": "Database connection URL",
        "SUPABASE_ANON_KEY": "Database anonymous key",
        "REDIS_URL": "Redis cache connection URL",
        "AUTH_SECRET": "Authentication secret key",
        "NEXTAUTH_URL": "NextAuth callback URL",
    }

    # Optional but recommended variables
    recommended_vars = {
        "SUPABASE_SERVICE_KEY": "Database service key for admin operations",
        "OPENAI_API_KEY": "OpenAI API access",
        "ANTHROPIC_API_KEY": "Anthropic/Claude API access",
        "SENTRY_DSN": "Error monitoring and logging",
    }

    config_data = {}

    # Check critical variables
    for var, description in critical_vars.items():
        value = os.getenv(var)
        if not value:
            errors.append(
                f"Missing critical environment variable: {var} ({description})"
            )
        else:
            config_data[var.lower()] = value

    # Check recommended variables
    for var, description in recommended_vars.items():
        value = os.getenv(var)
        if not value:
            warnings.append(
                f"Missing recommended environment variable: {var} ({description})"
            )
        else:
            config_data[var.lower()] = value

    # Validate URL formats
    if "supabase_url" in config_data:
        if not config_data["supabase_url"].startswith("https://"):
            errors.append("SUPABASE_URL must start with https://")

    if "redis_url" in config_data:
        if not config_data["redis_url"].startswith("redis://"):
            errors.append("REDIS_URL must start with redis://")

    # Environment-specific validations
    environment = os.getenv("ENVIRONMENT", "development").lower()
    config_data["environment"] = environment

    if environment == "production":
        if not config_data.get("sentry_dsn"):
            warnings.append("SENTRY_DSN is highly recommended for production")
        if os.getenv("DEBUG", "false").lower() == "true":
            warnings.append("DEBUG should be false in production")

    # CORS origins
    cors_origins = os.getenv("CORS_ORIGINS", "").split(",")
    cors_origins = [origin.strip() for origin in cors_origins if origin.strip()]
    config_data["cors_origins"] = cors_origins if cors_origins else []

    # Log warnings
    for warning in warnings:
        logger.warning("environment_warning", message=warning)

    # Raise errors if any critical variables are missing
    if errors:
        error_message = "Environment validation failed:\n" + "\n".join(
            f"- {error}" for error in errors
        )
        logger.error("environment_validation_failed", errors=errors)
        raise ValueError(error_message)

    logger.info(
        "environment_validated",
        environment=environment,
        warnings_count=len(warnings),
        configured_vars=list(config_data.keys()),
    )

    return EnvironmentConfig(
        supabase_url=config_data.get("supabase_url", ""),
        supabase_anon_key=config_data.get("supabase_anon_key", ""),
        redis_url=config_data.get("redis_url", "redis://localhost:6379"),
        auth_secret=config_data.get("auth_secret", "default-secret"),
        nextauth_url=config_data.get("nextauth_url", "http://localhost:3000"),
        supabase_service_key=config_data.get("supabase_service_key"),
        openai_api_key=config_data.get("openai_api_key"),
        anthropic_api_key=config_data.get("anthropic_api_key"),
        sentry_dsn=config_data.get("sentry_dsn"),
        environment=environment,
        debug=os.getenv("DEBUG", "false").lower() == "true",
        cors_origins=config_data.get("cors_origins", []),
    )


def get_environment_config() -> EnvironmentConfig:
    """Get validated environment configuration (cached)"""
    global _config_cache
    if not hasattr(get_environment_config, "_config_cache"):
        get_environment_config._config_cache = validate_environment()
    return get_environment_config._config_cache


# Test function for validation
def test_environment_variables():
    """Test environment variables are properly configured"""
    try:
        config = validate_environment()
        print("✅ Environment validation passed!")
        print(f"Environment: {config.environment}")
        print(f"Debug mode: {config.debug}")
        print(
            f"Configured variables: {len([v for v in [config.supabase_url, config.redis_url, config.auth_secret] if v])}/3 critical"
        )
        return True
    except ValueError as e:
        print("❌ Environment validation failed!")
        print(e)
        return False


if __name__ == "__main__":
    test_environment_variables()
