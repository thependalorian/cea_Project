"""
Audit Logger - Security Audit Trail for Authentication and API Access

This module provides audit logging capabilities for tracking authentication
events and API access. It logs critical security events like token usage,
login attempts, and endpoint access, which is essential for compliance,
security monitoring, and debugging.

Location: backendv1/utils/audit_logger.py
"""

import json
import logging
import uuid
from datetime import datetime
from typing import Dict, Any, Optional, List, Union

from fastapi import Request
from pydantic import BaseModel

from backendv1.utils.logger import setup_logger
from backendv1.adapters.supabase_adapter import supabase_adapter
from backendv1.config.settings import get_settings

settings = get_settings()
logger = setup_logger("audit_logger")


class AuditEvent(BaseModel):
    """Data model for audit events"""

    id: str = None
    timestamp: str = None
    event_type: str
    user_id: Optional[str] = None
    ip_address: Optional[str] = None
    endpoint: Optional[str] = None
    status_code: Optional[int] = None
    request_method: Optional[str] = None
    user_agent: Optional[str] = None
    details: Optional[Dict[str, Any]] = None


class AuditLogger:
    """
    Audit logger for tracking authentication and API access

    This class provides methods for logging different types of security
    events and storing them in both log files and the database.
    """

    def __init__(self):
        """Initialize the audit logger"""
        self.supabase_table = "security_audit_logs"

    async def log_event(self, event: AuditEvent) -> None:
        """
        Log an audit event to both log file and database

        Args:
            event: Audit event to log
        """
        # Generate ID if not provided
        if not event.id:
            event.id = str(uuid.uuid4())

        # Set timestamp if not provided
        if not event.timestamp:
            event.timestamp = datetime.utcnow().isoformat()

        # Log to file
        log_data = event.dict()
        logger.info(f"AUDIT: {json.dumps(log_data)}")

        # Log to database if configured
        await self._store_in_database(event)

    async def _store_in_database(self, event: AuditEvent) -> None:
        """
        Store audit event in database

        Args:
            event: Audit event to store
        """
        # Skip if Supabase is not configured
        if not supabase_adapter.is_configured():
            return

        try:
            client = supabase_adapter.get_cached_client()
            if not client:
                return

            # Insert into audit log table (Supabase client is synchronous, not async)
            result = client.table(self.supabase_table).insert(event.dict()).execute()

            if not result.data:
                logger.warning(f"Failed to store audit event in database: {event.event_type}")

        except Exception as e:
            logger.error(f"Error storing audit event in database: {str(e)}")

    async def log_auth_event(
        self,
        event_type: str,
        user_id: Optional[str] = None,
        request: Optional[Request] = None,
        details: Optional[Dict[str, Any]] = None,
    ) -> None:
        """
        Log an authentication event

        Args:
            event_type: Type of authentication event
            user_id: User ID associated with the event
            request: FastAPI request object
            details: Additional details about the event
        """
        event = AuditEvent(event_type=f"auth.{event_type}", user_id=user_id, details=details or {})

        # Add request information if available
        if request:
            event.ip_address = self._get_client_ip(request)
            event.user_agent = request.headers.get("user-agent")
            event.endpoint = request.url.path
            event.request_method = request.method

        await self.log_event(event)

    async def log_api_access(
        self,
        endpoint: str,
        method: str,
        user_id: Optional[str] = None,
        status_code: int = 200,
        request: Optional[Request] = None,
        details: Optional[Dict[str, Any]] = None,
    ) -> None:
        """
        Log an API access event

        Args:
            endpoint: API endpoint accessed
            method: HTTP method used
            user_id: User ID who accessed the endpoint
            status_code: HTTP status code
            request: FastAPI request object
            details: Additional details about the access
        """
        event = AuditEvent(
            event_type="api.access",
            user_id=user_id,
            endpoint=endpoint,
            request_method=method,
            status_code=status_code,
            details=details or {},
        )

        # Add request information if available
        if request:
            event.ip_address = self._get_client_ip(request)
            event.user_agent = request.headers.get("user-agent")

        await self.log_event(event)

    def _get_client_ip(self, request: Request) -> str:
        """
        Get client IP address from request

        Args:
            request: FastAPI request object

        Returns:
            str: Client IP address
        """
        # Check for X-Forwarded-For header (common behind proxies)
        forwarded_for = request.headers.get("x-forwarded-for")
        if forwarded_for:
            # Return the first IP in the list
            return forwarded_for.split(",")[0].strip()

        # Fall back to client.host
        return request.client.host if request.client else "unknown"


# Create a singleton instance
audit_logger = AuditLogger()

# Export classes and instance
__all__ = ["AuditLogger", "AuditEvent", "audit_logger"]
