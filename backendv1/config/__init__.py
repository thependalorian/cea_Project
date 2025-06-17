"""
Configuration Package for Climate Economy Assistant

This package contains all configuration settings and environment management.
Following rule #3: Component documentation explaining purpose and functionality
Following rule #4: Vercel compatibility for all configurations

Location: backendv1/config/__init__.py
"""

import os
import sys
import importlib.util
import logging

# Set up package-specific logging
logger = logging.getLogger("backendv1.config")

# Add the parent directory to sys.path to enable absolute imports
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

# Safe imports with error handling
try:
    from backendv1.config.settings import (
        Settings,
        get_settings,
        DatabaseSettings,
        OpenAISettings,
        RedisSettings,
        AuthSettings,
    )

    has_settings = True
except ImportError as e:
    logger.warning(f"Could not import settings: {e}")
    has_settings = False

try:
    from backendv1.config.workflow_config import (
        WorkflowConfig,
        get_workflow_config,
        AgentWorkflowSettings,
    )

    has_workflow_config = True
except ImportError as e:
    logger.warning(f"Could not import workflow_config: {e}")
    has_workflow_config = False

try:
    from backendv1.config.agent_config import AgentConfig, get_agent_config, SpecialistConfig

    has_agent_config = True
except ImportError as e:
    logger.warning(f"Could not import agent_config: {e}")
    has_agent_config = False

# Export list
__all__ = []

# Add settings exports if available
if has_settings:
    __all__.extend(
        [
            "Settings",
            "get_settings",
            "DatabaseSettings",
            "OpenAISettings",
            "RedisSettings",
            "AuthSettings",
        ]
    )

# Add workflow config exports if available
if has_workflow_config:
    __all__.extend(["WorkflowConfig", "get_workflow_config", "AgentWorkflowSettings"])

# Add agent config exports if available
if has_agent_config:
    __all__.extend(["AgentConfig", "get_agent_config", "SpecialistConfig"])

# Package version
__version__ = "1.0.0"
