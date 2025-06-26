"""
Supabase client singleton for database operations.
"""

from supabase import create_client, Client
from typing import Optional, Dict, Any
import os
from functools import wraps
import structlog
from datetime import datetime

logger = structlog.get_logger(__name__)


def handle_supabase_error(func):
    """Decorator to handle Supabase errors consistently"""

    @wraps(func)
    async def wrapper(*args, **kwargs):
        try:
            return await func(*args, **kwargs)
        except Exception as e:
            logger.error(
                "Supabase operation failed",
                function=func.__name__,
                error=str(e),
                args=args,
                kwargs=kwargs,
            )
            return {
                "error": True,
                "message": "Database operation failed",
                "timestamp": datetime.utcnow().isoformat(),
            }

    return wrapper


class SupabaseClient:
    _instance: Optional["SupabaseClient"] = None
    _client: Optional[Client] = None

    def __new__(cls) -> "SupabaseClient":
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        if self._client is None:
            self._initialize_client()

    def _initialize_client(self):
        """Initialize Supabase client with service key for admin operations"""
        try:
            # Get Supabase credentials from environment
            url = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")

            # Use service key for backend operations to bypass RLS
            service_key = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv(
                "SUPABASE_SERVICE_ROLE_KEY"
            )

            if not url:
                raise ValueError("Missing SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL")

            key_type = "unknown"
            if service_key:
                key_type = "service"
            else:
                logger.warning("No service key found, falling back to anon key")
                service_key = os.getenv("SUPABASE_ANON_KEY") or os.getenv(
                    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
                )
                key_type = "anon"

            if not service_key:
                raise ValueError(
                    "Missing Supabase keys. Required: SUPABASE_SERVICE_KEY or SUPABASE_ANON_KEY"
                )

            # Create client with service key for admin access
            self._client = create_client(url, service_key)
            logger.info(
                "Supabase client initialized successfully", url=url, key_type=key_type
            )

        except Exception as e:
            logger.error("Failed to initialize Supabase client", error=str(e))
            raise

    @property
    def client(self) -> Client:
        """Get the Supabase client instance"""
        if self._client is None:
            self._initialize_client()
        return self._client

    def table(self, table_name: str):
        """Direct access to table method for compatibility"""
        return self.client.table(table_name)

    @handle_supabase_error
    async def query(
        self, table: str, query_type: str = "select", **kwargs
    ) -> Dict[str, Any]:
        """
        Execute a query on Supabase

        Args:
            table: Table name to query
            query_type: Type of query (select, insert, update, delete)
            **kwargs: Additional query parameters

        Returns:
            Query results or error information
        """
        if not self._client:
            raise ValueError("Supabase client not initialized")

        query = self._client.table(table)

        if query_type == "select":
            result = query.select("*")
            if "columns" in kwargs:
                result = query.select(kwargs["columns"])
            if "filters" in kwargs:
                for filter_key, filter_value in kwargs["filters"].items():
                    result = result.eq(filter_key, filter_value)
        elif query_type == "insert":
            result = query.insert(kwargs.get("data", {}))
        elif query_type == "update":
            result = query.update(kwargs.get("data", {})).eq("id", kwargs.get("id"))
        elif query_type == "delete":
            result = query.delete().eq("id", kwargs.get("id"))
        else:
            raise ValueError(f"Invalid query type: {query_type}")

        try:
            return result.execute()
        except Exception as e:
            logger.error(
                "Error executing Supabase query",
                error=str(e),
                table=table,
                query_type=query_type,
                kwargs=kwargs,
            )
            raise


# Create singleton instance
supabase = SupabaseClient()
