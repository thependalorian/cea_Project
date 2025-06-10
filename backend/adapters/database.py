"""
Database adapter for the Climate Economy Assistant backend.

This module provides functions for interacting with the Supabase database,
abstracting the details of database operations and ensuring consistent data handling.
"""

import logging
import os
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional, Union

from pydantic import BaseModel
from supabase import create_client

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("cea_database")


class DatabaseAdapter:
    """Adapter for interacting with the Supabase database"""

    def __init__(self):
        """Initialize the database adapter"""
        self.supabase_url = os.getenv("SUPABASE_URL")
        self.supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        self.client = None

        if not self.supabase_url or not self.supabase_key:
            logger.warning(
                "Supabase credentials not configured in environment variables"
            )
        else:
            try:
                self.client = create_client(self.supabase_url, self.supabase_key)
                logger.info("Successfully connected to Supabase")
            except Exception as e:
                logger.error(f"Failed to initialize Supabase connection: {e}")

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
        if not self.client:
            return {
                "success": False,
                "error": "Database connection not initialized",
                "data": [],
            }

        try:
            # Start the query
            query = self.client.table(table).select(select_columns)

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
        if not self.client:
            return {"success": False, "error": "Database connection not initialized"}

        try:
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

            # Execute the insert
            result = self.client.table(table).insert(data).execute()

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
        if not self.client:
            return {"success": False, "error": "Database connection not initialized"}

        try:
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

            # Always set updated_at if it exists in the table
            try:
                # Check if updated_at exists in the table schema
                schema_query = (
                    self.client.table(table).select("updated_at").limit(1).execute()
                )
                if schema_query.data or "updated_at" in data:
                    data["updated_at"] = datetime.now().isoformat()
            except Exception:
                # Field might not exist, ignore error
                pass

            # Execute the update
            result = (
                self.client.table(table).update(data).eq(id_column, id_value).execute()
            )

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
        Upsert records in a table (insert if not exists, update if exists)

        Args:
            table: Table name
            data: Data to upsert (dict or Pydantic model)
            unique_columns: Columns that uniquely identify the record

        Returns:
            Dict[str, Any]: Upsert result
        """
        if not self.client:
            return {"success": False, "error": "Database connection not initialized"}

        try:
            # Convert to dict if it's a Pydantic model
            if isinstance(data, BaseModel):
                data = data.dict(exclude_unset=True)

            # Ensure record has an ID if not provided
            if "id" not in data:
                data["id"] = str(uuid.uuid4())

            # Always set timestamps
            now = datetime.now().isoformat()
            if "updated_at" not in data:
                data["updated_at"] = now
            if "created_at" not in data:
                data["created_at"] = now

            # Execute the upsert
            result = (
                self.client.table(table)
                .upsert(data, on_conflict=",".join(unique_columns))
                .execute()
            )

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
        if not self.client:
            return {"success": False, "error": "Database connection not initialized"}

        try:
            if not id_value:
                return {
                    "success": False,
                    "error": f"No {id_column} provided for delete",
                }

            # Execute the delete
            result = self.client.table(table).delete().eq(id_column, id_value).execute()

            return {"success": True, "data": result.data}

        except Exception as e:
            logger.error(f"Error deleting from {table}: {e}")
            return {"success": False, "error": str(e)}

    async def execute_rpc(
        self, function_name: str, params: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Execute a Postgres RPC function

        Args:
            function_name: Name of the function to call
            params: Parameters to pass to the function

        Returns:
            Dict[str, Any]: RPC result
        """
        if not self.client:
            return {"success": False, "error": "Database connection not initialized"}

        try:
            # Execute the RPC call
            result = self.client.rpc(function_name, params).execute()

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
        Get a record by its ID

        Args:
            table: Table name
            id_value: ID value to look up
            id_column: Column containing the ID
            select_columns: Columns to select

        Returns:
            Dict[str, Any]: Query result
        """
        if not self.client:
            return {
                "success": False,
                "error": "Database connection not initialized",
                "data": None,
            }

        try:
            # Execute the query
            result = (
                self.client.table(table)
                .select(select_columns)
                .eq(id_column, id_value)
                .execute()
            )

            if not result.data:
                return {
                    "success": False,
                    "error": f"No record found with {id_column}={id_value}",
                    "data": None,
                }

            return {"success": True, "data": result.data[0]}

        except Exception as e:
            logger.error(f"Error getting record from {table}: {e}")
            return {"success": False, "error": str(e), "data": None}


# Create a singleton instance
db = DatabaseAdapter()
