"""
Configuration Loading Utilities

Following rule #12: Complete code verification with proper configuration management
Following rule #15: Include comprehensive error handling for config operations

This module provides configuration loading and environment management utilities.
Location: backendv1/utils/config_loader.py
"""

import os
import json
from typing import Any, Dict, Optional, Union
from pathlib import Path

from backendv1.logger import setup_logger

logger = setup_logger("config_loader")


def load_config(config_path: str) -> Dict[str, Any]:
    """
    Load configuration from file

    Args:
        config_path: Path to configuration file

    Returns:
        Dict[str, Any]: Loaded configuration
    """
    try:
        config_file = Path(config_path)

        if not config_file.exists():
            logger.warning(f"Config file not found: {config_path}")
            return {}

        with open(config_file, "r") as f:
            if config_path.endswith(".json"):
                config = json.load(f)
            else:
                # For simple key=value files
                config = {}
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#"):
                        if "=" in line:
                            key, value = line.split("=", 1)
                            config[key.strip()] = value.strip()

        logger.info(f"✅ Configuration loaded from {config_path}")
        return config

    except Exception as e:
        logger.error(f"Error loading config from {config_path}: {e}")
        return {}


def get_config_value(config: Dict[str, Any], key: str, default: Any = None) -> Any:
    """
    Get configuration value with fallback to default

    Args:
        config: Configuration dictionary
        key: Configuration key to retrieve
        default: Default value if key is not found

    Returns:
        Any: Configuration value or default
    """
    try:
        # Support nested keys with dot notation (e.g., "database.host")
        if "." in key:
            parts = key.split(".")
            current = config
            for part in parts:
                if part not in current:
                    return default
                current = current[part]
            return current

        # Simple key lookup
        return config.get(key, default)
    except Exception as e:
        logger.error(f"Error getting config value for {key}: {e}")
        return default


def get_environment_config() -> Dict[str, Any]:
    """
    Get environment-specific configuration

    Returns:
        Dict[str, Any]: Environment configuration
    """
    try:
        env = os.getenv("ENVIRONMENT", "development").lower()

        # Base configuration
        config = {
            "environment": env,
            "debug": env == "development",
            "log_level": "DEBUG" if env == "development" else "INFO",
        }

        # Environment-specific settings
        if env == "production":
            config.update(
                {"api_timeout": 30, "max_workers": 4, "enable_caching": True, "log_format": "json"}
            )
        elif env == "staging":
            config.update(
                {"api_timeout": 45, "max_workers": 2, "enable_caching": True, "log_format": "json"}
            )
        else:  # development
            config.update(
                {
                    "api_timeout": 60,
                    "max_workers": 1,
                    "enable_caching": False,
                    "log_format": "colored",
                }
            )

        return config

    except Exception as e:
        logger.error(f"Error getting environment config: {e}")
        return {"environment": "development", "debug": True}


def load_agent_config(agent_name: str) -> Dict[str, Any]:
    """
    Load agent-specific configuration

    Args:
        agent_name: Name of the agent

    Returns:
        Dict[str, Any]: Agent configuration
    """
    try:
        # Try to load agent-specific config file
        config_path = f"config/agents/{agent_name}.json"
        agent_config = load_config(config_path)

        # Merge with default agent settings
        default_config = {
            "temperature": 0.7,
            "max_tokens": 2000,
            "timeout": 30,
            "retry_attempts": 3,
        }

        return {**default_config, **agent_config}

    except Exception as e:
        logger.error(f"Error loading agent config for {agent_name}: {e}")
        return {"temperature": 0.7, "max_tokens": 2000}


def get_database_config() -> Dict[str, str]:
    """
    Get database configuration from environment

    Returns:
        Dict[str, str]: Database configuration
    """
    try:
        return {
            "host": os.getenv("DB_HOST", "localhost"),
            "port": os.getenv("DB_PORT", "5432"),
            "database": os.getenv("DB_NAME", "climate_assistant"),
            "username": os.getenv("DB_USER", "postgres"),
            "password": os.getenv("DB_PASSWORD", ""),
            "ssl_mode": os.getenv("DB_SSL_MODE", "prefer"),
        }
    except Exception as e:
        logger.error(f"Error getting database config: {e}")
        return {}


def validate_required_env_vars(required_vars: list) -> Dict[str, Any]:
    """
    Validate that required environment variables are set

    Args:
        required_vars: List of required environment variable names

    Returns:
        Dict[str, Any]: Validation results
    """
    missing_vars = []
    found_vars = {}

    for var in required_vars:
        value = os.getenv(var)
        if value is None or value == "":
            missing_vars.append(var)
        else:
            found_vars[var] = value

    return {"valid": len(missing_vars) == 0, "missing_vars": missing_vars, "found_vars": found_vars}


def get_api_config() -> Dict[str, Any]:
    """
    Get API configuration

    Returns:
        Dict[str, Any]: API configuration
    """
    return {
        "openai_api_key": os.getenv("OPENAI_API_KEY"),
        "anthropic_api_key": os.getenv("ANTHROPIC_API_KEY"),
        "supabase_url": os.getenv("SUPABASE_URL"),
        "supabase_anon_key": os.getenv("SUPABASE_ANON_KEY"),
        "supabase_service_key": os.getenv("SUPABASE_SERVICE_KEY"),
        "pinecone_api_key": os.getenv("PINECONE_API_KEY"),
        "pinecone_environment": os.getenv("PINECONE_ENVIRONMENT"),
    }


def merge_configs(*configs: Dict[str, Any]) -> Dict[str, Any]:
    """
    Merge multiple configuration dictionaries

    Args:
        *configs: Configuration dictionaries to merge

    Returns:
        Dict[str, Any]: Merged configuration
    """
    merged = {}
    for config in configs:
        if isinstance(config, dict):
            merged.update(config)
    return merged


# Export main functions
__all__ = [
    "load_config",
    "get_environment_config",
    "load_agent_config",
    "get_database_config",
    "validate_required_env_vars",
    "get_api_config",
    "merge_configs",
]
