"""
Standardized logging utility for the Climate Economy Assistant.
Provides structured logging with consistent formatting across the application.
"""

import logging
import json
import sys
from datetime import datetime
from typing import Any, Dict, Optional

# Configure default logging format
DEFAULT_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

# Log levels
LEVELS = {
    "DEBUG": logging.DEBUG,
    "INFO": logging.INFO,
    "WARNING": logging.WARNING,
    "ERROR": logging.ERROR,
    "CRITICAL": logging.CRITICAL,
}


class StructuredLogger:
    """
    Structured logger that provides consistent JSON-formatted logs.
    Designed to work well with log aggregation systems.
    """

    def __init__(self, name: str, level: str = "INFO"):
        """Initialize a structured logger with the given name and level."""
        self.logger = logging.getLogger(name)
        self.logger.setLevel(LEVELS.get(level.upper(), logging.INFO))

        # Add console handler if none exists
        if not self.logger.handlers:
            console_handler = logging.StreamHandler(sys.stdout)
            console_handler.setFormatter(self._get_formatter())
            self.logger.addHandler(console_handler)

    def _get_formatter(self):
        """Get a JSON formatter for structured logging."""
        return logging.Formatter(DEFAULT_FORMAT)

    def _log(self, level: int, message: str, **kwargs):
        """Log a message with structured data."""
        # Add timestamp if not present
        if "timestamp" not in kwargs:
            kwargs["timestamp"] = datetime.utcnow().isoformat()

        # Format as JSON if kwargs are present
        if kwargs:
            log_data = {"message": message, **kwargs}
            self.logger.log(level, json.dumps(log_data))
        else:
            self.logger.log(level, message)

    def debug(self, message: str, **kwargs):
        """Log a debug message."""
        self._log(logging.DEBUG, message, **kwargs)

    def info(self, message: str, **kwargs):
        """Log an info message."""
        self._log(logging.INFO, message, **kwargs)

    def warning(self, message: str, **kwargs):
        """Log a warning message."""
        self._log(logging.WARNING, message, **kwargs)

    def error(self, message: str, **kwargs):
        """Log an error message."""
        self._log(logging.ERROR, message, **kwargs)

    def critical(self, message: str, **kwargs):
        """Log a critical message."""
        self._log(logging.CRITICAL, message, **kwargs)


def get_logger(name: str, level: str = "INFO") -> StructuredLogger:
    """Get a structured logger instance."""
    return StructuredLogger(name, level)


def setup_logger(name: str, level: str = "INFO") -> StructuredLogger:
    """Setup a structured logger instance (alias for get_logger for compatibility)."""
    return StructuredLogger(name, level)
