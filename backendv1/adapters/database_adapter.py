"""
Database Adapter - Full Production Implementation

Following rule #17: Secure database access with proper authentication
Following rule #15: Include comprehensive error handling
Following rule #8: Use Supabase with SSR

This adapter provides comprehensive database operations for the Climate Economy Assistant.
Ported from backend/adapters/database.py (361 lines) to provide full functionality.

Location: backendv1/adapters/database_adapter.py
"""

import logging
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional, Union

from pydantic import BaseModel

from backendv1.adapters.supabase_adapter import SupabaseAdapter
from backendv1.utils.logger import setup_logger

logger = setup_logger("database_adapter")


class DatabaseAdapter:
    """
    Comprehensive database adapter for all CRUD operations

    Following rule #17: Secure database access patterns
    Following rule #15: Comprehensive error handling
    """

    def __init__(self):
        """Initialize the database adapter"""
        self.supabase_adapter = SupabaseAdapter()
        logger.info("Database adapter initialized")

    async def select(
        self,
        table: str,
        select_columns: str = "*",
        filters: Optional[Dict[str, Any]] = None,
        order_column: Optional[str] = None,
        order_desc: bool = False,
        limit: Optional[int] = None,
    ) -> Dict[str, Any]:
        """
        Select records from a table

        Args:
            table: Table name
            select_columns: Columns to select
            filters: Optional filters to apply
            order_column: Optional column to order by
            order_desc: Whether to order in descending order
            limit: Optional limit on number of records

        Returns:
            Dict[str, Any]: Query result
        """
        try:
            client = self.supabase_adapter.get_cached_client()
            if not client:
                return {
                    "success": False,
                    "error": "Database connection not initialized",
                    "data": [],
                }

            # Start the query
            query = client.table(table).select(select_columns)

            # Apply filters
            if filters:
                for key, value in filters.items():
                    query = query.eq(key, value)

            # Apply ordering
            if order_column:
                query = query.order(order_column, desc=order_desc)

            # Apply limit
            if limit:
                query = query.limit(limit)

            # Execute the query
            result = query.execute()

            return {"success": True, "data": result.data}

        except Exception as e:
            logger.error(f"Error querying {table}: {e}")
            return {"success": False, "error": str(e), "data": []}

    async def insert(
        self,
        table: str,
        data: Union[Dict[str, Any], BaseModel, List[Dict[str, Any]], List[BaseModel]],
    ) -> Dict[str, Any]:
        """
        Insert records into a table

        Args:
            table: Table name
            data: Data to insert (dict, Pydantic model, or list of either)

        Returns:
            Dict[str, Any]: Insert result
        """
        try:
            client = self.supabase_adapter.get_cached_client()
            if not client:
                return {"success": False, "error": "Database connection not initialized"}

            # Convert to dict if it's a Pydantic model
            if isinstance(data, BaseModel):
                data = data.dict(exclude_unset=True)
            elif isinstance(data, list) and data and isinstance(data[0], BaseModel):
                data = [item.dict(exclude_unset=True) for item in data]

            # Ensure record has an ID if not provided
            if isinstance(data, dict) and "id" not in data:
                data["id"] = str(uuid.uuid4())
            elif isinstance(data, list):
                for item in data:
                    if isinstance(item, dict) and "id" not in item:
                        item["id"] = str(uuid.uuid4())

            # Add timestamps
            now = datetime.utcnow().isoformat()
            if isinstance(data, dict):
                if "created_at" not in data:
                    data["created_at"] = now
                if "updated_at" not in data:
                    data["updated_at"] = now
            elif isinstance(data, list):
                for item in data:
                    if isinstance(item, dict):
                        if "created_at" not in item:
                            item["created_at"] = now
                        if "updated_at" not in item:
                            item["updated_at"] = now

            # Execute the insert
            result = client.table(table).insert(data).execute()

            return {"success": True, "data": result.data}

        except Exception as e:
            logger.error(f"Error inserting into {table}: {e}")
            return {"success": False, "error": str(e)}

    async def update(
        self,
        table: str,
        data: Union[Dict[str, Any], BaseModel],
        id_column: str = "id",
        id_value: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Update records in a table

        Args:
            table: Table name
            data: Data to update (dict or Pydantic model)
            id_column: Column to use for identifying the record
            id_value: Value to match in the id_column

        Returns:
            Dict[str, Any]: Update result
        """
        try:
            client = self.supabase_adapter.get_cached_client()
            if not client:
                return {"success": False, "error": "Database connection not initialized"}

            # Convert to dict if it's a Pydantic model
            if isinstance(data, BaseModel):
                data = data.dict(exclude_unset=True)

            # If id_value is not provided, try to get it from the data
            if not id_value and id_column in data:
                id_value = data[id_column]

            if not id_value:
                return {
                    "success": False,
                    "error": f"No {id_column} provided for update",
                }

            # Always set updated_at
            data["updated_at"] = datetime.utcnow().isoformat()

            # Execute the update
            result = client.table(table).update(data).eq(id_column, id_value).execute()

            return {"success": True, "data": result.data}

        except Exception as e:
            logger.error(f"Error updating {table}: {e}")
            return {"success": False, "error": str(e)}

    async def upsert(
        self,
        table: str,
        data: Union[Dict[str, Any], BaseModel],
        unique_columns: List[str] = ["id"],
    ) -> Dict[str, Any]:
        """
        Upsert (insert or update) records in a table

        Args:
            table: Table name
            data: Data to upsert (dict or Pydantic model)
            unique_columns: Columns that define uniqueness

        Returns:
            Dict[str, Any]: Upsert result
        """
        try:
            client = self.supabase_adapter.get_cached_client()
            if not client:
                return {"success": False, "error": "Database connection not initialized"}

            # Convert to dict if it's a Pydantic model
            if isinstance(data, BaseModel):
                data = data.dict(exclude_unset=True)

            # Ensure record has an ID if not provided
            if "id" not in data:
                data["id"] = str(uuid.uuid4())

            # Add timestamps
            now = datetime.utcnow().isoformat()
            if "created_at" not in data:
                data["created_at"] = now
            data["updated_at"] = now

            # Execute the upsert
            result = client.table(table).upsert(data).execute()

            return {"success": True, "data": result.data}

        except Exception as e:
            logger.error(f"Error upserting into {table}: {e}")
            return {"success": False, "error": str(e)}

    async def delete(
        self, table: str, id_column: str = "id", id_value: str = None
    ) -> Dict[str, Any]:
        """
        Delete records from a table

        Args:
            table: Table name
            id_column: Column to use for identifying the record
            id_value: Value to match in the id_column

        Returns:
            Dict[str, Any]: Delete result
        """
        try:
            client = self.supabase_adapter.get_cached_client()
            if not client:
                return {"success": False, "error": "Database connection not initialized"}

            if not id_value:
                return {"success": False, "error": f"No {id_column} provided for delete"}

            # Execute the delete
            result = client.table(table).delete().eq(id_column, id_value).execute()

            return {"success": True, "data": result.data}

        except Exception as e:
            logger.error(f"Error deleting from {table}: {e}")
            return {"success": False, "error": str(e)}

    async def execute_rpc(self, function_name: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute a stored procedure/function

        Args:
            function_name: Name of the function to execute
            params: Parameters to pass to the function

        Returns:
            Dict[str, Any]: Function result
        """
        try:
            client = self.supabase_adapter.get_cached_client()
            if not client:
                return {"success": False, "error": "Database connection not initialized"}

            # Execute the RPC
            result = client.rpc(function_name, params).execute()

            return {"success": True, "data": result.data}

        except Exception as e:
            logger.error(f"Error executing RPC {function_name}: {e}")
            return {"success": False, "error": str(e)}

    async def get_by_id(
        self,
        table: str,
        id_value: str,
        id_column: str = "id",
        select_columns: str = "*",
    ) -> Dict[str, Any]:
        """
        Get a single record by ID

        Args:
            table: Table name
            id_value: Value to search for
            id_column: Column to search in
            select_columns: Columns to select

        Returns:
            Dict[str, Any]: Record data
        """
        try:
            client = self.supabase_adapter.get_cached_client()
            if not client:
                return {"success": False, "error": "Database connection not initialized"}

            # Execute the query
            result = client.table(table).select(select_columns).eq(id_column, id_value).execute()

            if result.data:
                return {"success": True, "data": result.data[0]}
            else:
                return {"success": False, "error": "Record not found", "data": None}

        except Exception as e:
            logger.error(f"Error getting record from {table}: {e}")
            return {"success": False, "error": str(e), "data": None}

    # ============================================================================
    # CONVENIENCE METHODS FOR COMMON OPERATIONS
    # ============================================================================

    async def get_user_conversations(self, user_id: str) -> Dict[str, Any]:
        """Get all conversations for a user"""
        return await self.select(
            "conversations",
            filters={"user_id": user_id},
            order_column="updated_at",
            order_desc=True,
            limit=50,
        )

    async def get_user_messages(self, conversation_id: str) -> Dict[str, Any]:
        """Get all messages for a conversation"""
        return await self.select(
            "messages",
            filters={"conversation_id": conversation_id},
            order_column="created_at",
            order_desc=False,
            limit=100,
        )

    async def create_conversation(
        self, user_id: str, title: str = "New Conversation"
    ) -> Dict[str, Any]:
        """Create a new conversation"""
        conversation_data = {"user_id": user_id, "title": title, "status": "active"}
        return await self.insert("conversations", conversation_data)

    async def create_message(
        self,
        conversation_id: str,
        user_id: str,
        content: str,
        role: str = "user",
        specialist: str = None,
    ) -> Dict[str, Any]:
        """Create a new message"""
        message_data = {
            "conversation_id": conversation_id,
            "user_id": user_id,
            "content": content,
            "role": role,
            "specialist": specialist,
        }
        return await self.insert("messages", message_data)

    async def update_conversation_activity(self, conversation_id: str) -> Dict[str, Any]:
        """Update conversation last activity timestamp"""
        return await self.update(
            "conversations", {"updated_at": datetime.utcnow().isoformat()}, id_value=conversation_id
        )

    async def get_user_profile_by_email(self, email: str) -> Dict[str, Any]:
        """Get user profile by email"""
        return await self.select("profiles", filters={"email": email}, limit=1)

    async def create_user_profile(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new user profile"""
        return await self.insert("profiles", user_data)

    async def update_user_profile(
        self, user_id: str, profile_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Update user profile"""
        return await self.update("profiles", profile_data, id_value=user_id)


# Export main class
__all__ = ["DatabaseAdapter"]
