"""
Centralized Logging Configuration

Following rule #15: Include error checks and logging
Following rule #10: Comprehensive error handling and logging for complex APIs

This module provides centralized logging configuration for the entire application.
Location: backendv1/utils/logger.py
"""

import logging
import sys
from datetime import datetime
from pathlib import Path
from typing import Optional

# Avoid circular imports by making settings import optional
try:
    from backendv1.config.settings import get_settings

    _settings_available = True
except ImportError:
    _settings_available = False
    get_settings = None


def _get_safe_settings():
    """
    Safely get settings with fallback values to avoid circular imports

    Returns:
        Settings object or fallback values
    """
    if _settings_available and get_settings:
        try:
            return get_settings()
        except Exception:
            pass

    # Fallback settings class
    class FallbackSettings:
        LOG_LEVEL = "INFO"
        is_development = True
        is_production = False

    return FallbackSettings()


class ColoredFormatter(logging.Formatter):
    """Colored console formatter for better development experience"""

    # Color codes
    COLORS = {
        "DEBUG": "\033[36m",  # Cyan
        "INFO": "\033[32m",  # Green
        "WARNING": "\033[33m",  # Yellow
        "ERROR": "\033[31m",  # Red
        "CRITICAL": "\033[35m",  # Magenta
        "RESET": "\033[0m",  # Reset
    }

    def format(self, record):
        """Format log record with colors"""
        log_color = self.COLORS.get(record.levelname, self.COLORS["RESET"])
        reset_color = self.COLORS["RESET"]

        # Add colors to the log message
        record.levelname = f"{log_color}{record.levelname}{reset_color}"
        record.name = f"\033[90m{record.name}{reset_color}"  # Gray

        return super().format(record)


def setup_logger(
    name: str, level: Optional[str] = None, log_file: Optional[str] = None
) -> logging.Logger:
    """
    Set up a logger with consistent formatting

    Following rule #15: Include error checks and logging

    Args:
        name: Logger name (usually module name)
        level: Log level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_file: Optional file path for file logging

    Returns:
        logging.Logger: Configured logger instance
    """
    try:
        settings = _get_safe_settings()

        # Determine log level
        if level is None:
            level = settings.LOG_LEVEL

        # Create logger
        logger = logging.getLogger(name)

        # Avoid duplicate handlers
        if logger.handlers:
            return logger

        logger.setLevel(getattr(logging, level.upper()))

        # Console handler with colored formatting
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(getattr(logging, level.upper()))

        if settings.is_development:
            # Use colored formatter for development
            console_format = ColoredFormatter(
                fmt="%(asctime)s | %(levelname)s | %(name)s | %(message)s", datefmt="%H:%M:%S"
            )
        else:
            # Use standard formatter for production
            console_format = logging.Formatter(
                fmt="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
                datefmt="%Y-%m-%d %H:%M:%S",
            )

        console_handler.setFormatter(console_format)
        logger.addHandler(console_handler)

        # File handler (if specified)
        if log_file:
            try:
                # Ensure log directory exists
                log_path = Path(log_file)
                log_path.parent.mkdir(parents=True, exist_ok=True)

                file_handler = logging.FileHandler(log_file)
                file_handler.setLevel(logging.INFO)

                file_format = logging.Formatter(
                    fmt="%(asctime)s | %(levelname)s | %(name)s | %(funcName)s:%(lineno)d | %(message)s",
                    datefmt="%Y-%m-%d %H:%M:%S",
                )
                file_handler.setFormatter(file_format)
                logger.addHandler(file_handler)

            except Exception as e:
                logger.warning(f"Failed to set up file logging: {e}")

        # Production logging configuration
        if settings.is_production:
            # Add structured logging for production monitoring
            production_handler = logging.StreamHandler(sys.stdout)
            production_handler.setLevel(logging.INFO)

            production_format = logging.Formatter(
                fmt='{"timestamp": "%(asctime)s", "level": "%(levelname)s", "logger": "%(name)s", "message": "%(message)s"}',
                datefmt="%Y-%m-%dT%H:%M:%S",
            )
            production_handler.setFormatter(production_format)

            # Replace console handler in production
            logger.removeHandler(console_handler)
            logger.addHandler(production_handler)

        return logger

    except Exception as e:
        # Fallback to basic logging if setup fails
        fallback_logger = logging.getLogger(name)
        fallback_logger.setLevel(logging.INFO)

        if not fallback_logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
            handler.setFormatter(formatter)
            fallback_logger.addHandler(handler)

        fallback_logger.error(f"Failed to set up advanced logging: {e}")
        return fallback_logger


def get_logger(name: str) -> logging.Logger:
    """
    Get an existing logger or create a new one

    Args:
        name: Logger name

    Returns:
        logging.Logger: Logger instance
    """
    return logging.getLogger(name) if logging.getLogger(name).handlers else setup_logger(name)


class AgentLogger:
    """
    Specialized logger for agent interactions
    Following rule #15: Include error checks and logging for agent operations
    """

    def __init__(self, agent_name: str):
        self.agent_name = agent_name
        self.logger = setup_logger(f"agent.{agent_name}")

    def log_interaction(
        self,
        user_id: str,
        conversation_id: str,
        message: str,
        response: str,
        tools_used: list = None,
        confidence_score: float = None,
    ):
        """Log agent interaction details"""
        try:
            log_data = {
                "user_id": user_id,
                "conversation_id": conversation_id,
                "agent": self.agent_name,
                "message_length": len(message),
                "response_length": len(response),
                "tools_used": tools_used or [],
                "confidence_score": confidence_score,
                "timestamp": datetime.utcnow().isoformat(),
            }

            self.logger.info(f"Agent interaction: {log_data}")

        except Exception as e:
            self.logger.error(f"Failed to log agent interaction: {e}")

    def log_error(self, error: Exception, context: dict = None):
        """Log agent errors with context"""
        try:
            error_data = {
                "agent": self.agent_name,
                "error_type": type(error).__name__,
                "error_message": str(error),
                "context": context or {},
                "timestamp": datetime.utcnow().isoformat(),
            }

            self.logger.error(f"Agent error: {error_data}")

        except Exception as e:
            self.logger.error(f"Failed to log agent error: {e}")


class WorkflowLogger:
    """
    Specialized logger for LangGraph workflow operations
    """

    def __init__(self, workflow_name: str):
        self.workflow_name = workflow_name
        self.logger = setup_logger(f"workflow.{workflow_name}")

    def log_state_transition(
        self,
        from_state: str,
        to_state: str,
        user_id: str,
        conversation_id: str,
        metadata: dict = None,
    ):
        """Log workflow state transitions"""
        try:
            transition_data = {
                "workflow": self.workflow_name,
                "from_state": from_state,
                "to_state": to_state,
                "user_id": user_id,
                "conversation_id": conversation_id,
                "metadata": metadata or {},
                "timestamp": datetime.utcnow().isoformat(),
            }

            self.logger.info(f"State transition: {transition_data}")

        except Exception as e:
            self.logger.error(f"Failed to log state transition: {e}")

    def log_workflow_error(self, error: Exception, state: dict = None):
        """Log workflow errors with state context"""
        try:
            error_data = {
                "workflow": self.workflow_name,
                "error_type": type(error).__name__,
                "error_message": str(error),
                "current_state": state,
                "timestamp": datetime.utcnow().isoformat(),
            }

            self.logger.error(f"Workflow error: {error_data}")

        except Exception as e:
            self.logger.error(f"Failed to log workflow error: {e}")


# Export main functions
__all__ = ["setup_logger", "get_logger", "AgentLogger", "WorkflowLogger"]
