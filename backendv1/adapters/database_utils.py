"""
Database Utilities Adapter - Full Production Implementation

Following rule #15: Include comprehensive error handling
Following rule #17: Secure database access with proper authentication

This module provides advanced database utilities and helper functions
for database migrations, transactions, and bulk operations.
Ported from backend/adapters/database_utils.py (323 lines) to provide full functionality.

Location: backendv1/adapters/database_utils.py
"""

import logging
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional, TypeVar, Union, Generic

from pydantic import BaseModel

from backendv1.adapters.supabase_adapter import SupabaseAdapter
from backendv1.adapters.database_adapter import DatabaseAdapter
from backendv1.utils.logger import setup_logger

logger = setup_logger("database_utils")

# Type definitions for generic functions
T = TypeVar("T", bound=BaseModel)


class DatabaseUtils:
    """
    Advanced database utilities for complex operations

    Following rule #15: Include comprehensive error handling
    Following rule #17: Secure database access with proper authentication
    """

    def __init__(self):
        """Initialize database utilities with adapters"""
        self.supabase_adapter = SupabaseAdapter()
        self.database_adapter = DatabaseAdapter()
        logger.info("📊 Database utilities initialized")

    async def execute_transaction(self, operations: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Execute multiple database operations as a transaction

        Args:
            operations: List of operations, each with:
                - operation: "insert", "update", "delete", "upsert"
                - table: Table name
                - data: Data for operation
                - filters: Filters for operation (for update/delete)

        Returns:
            Dict with transaction results
        """
        try:
            results = []
            success = True
            error = None

            # Execute each operation and track results
            for op in operations:
                operation_type = op.get("operation", "").lower()
                table = op.get("table")
                data = op.get("data", {})

                if not operation_type or not table:
                    results.append(
                        {"success": False, "error": "Missing operation type or table", "data": None}
                    )
                    success = False
                    continue

                try:
                    if operation_type == "insert":
                        result = await self.supabase_adapter.insert_database_record(table, data)
                    elif operation_type == "update":
                        record_id = op.get("record_id")
                        if not record_id:
                            result = {
                                "success": False,
                                "error": "Missing record_id for update operation",
                                "data": None,
                            }
                        else:
                            result = await self.supabase_adapter.update_database_record(
                                table, record_id, data
                            )
                    elif operation_type == "delete":
                        record_id = op.get("record_id")
                        if not record_id:
                            result = {
                                "success": False,
                                "error": "Missing record_id for delete operation",
                                "data": None,
                            }
                        else:
                            # Use database adapter for delete
                            result = await self.database_adapter.delete(table, "id", record_id)
                    elif operation_type == "upsert":
                        # Use database adapter for upsert
                        unique_columns = op.get("unique_columns", ["id"])
                        result = await self.database_adapter.upsert(table, data, unique_columns)
                    else:
                        result = {
                            "success": False,
                            "error": f"Unknown operation type: {operation_type}",
                            "data": None,
                        }

                    results.append(result)
                    if not result.get("success", False):
                        success = False

                except Exception as op_error:
                    logger.error(
                        f"Error in transaction operation {operation_type} on {table}: {op_error}"
                    )
                    results.append({"success": False, "error": str(op_error), "data": None})
                    success = False

            return {
                "success": success,
                "results": results,
                "error": "One or more operations failed" if not success else None,
            }

        except Exception as e:
            logger.error(f"Transaction execution error: {e}")
            return {"success": False, "error": str(e), "results": []}

    async def bulk_insert(self, table: str, records: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Insert multiple records in a single operation

        Args:
            table: Table name
            records: List of records to insert

        Returns:
            Dict with bulk insert results
        """
        try:
            if not records:
                return {
                    "success": True,
                    "message": "No records to insert",
                    "inserted_count": 0,
                    "data": [],
                }

            # Prepare records with IDs and timestamps
            now = datetime.utcnow().isoformat()
            for record in records:
                if "id" not in record:
                    record["id"] = str(uuid.uuid4())
                if "created_at" not in record:
                    record["created_at"] = now
                if "updated_at" not in record:
                    record["updated_at"] = now

            # Execute bulk insert
            result = await self.database_adapter.insert(table, records)

            if result["success"]:
                return {"success": True, "inserted_count": len(records), "data": result["data"]}
            else:
                return {
                    "success": False,
                    "error": result.get("error", "Unknown error"),
                    "inserted_count": 0,
                    "data": [],
                }

        except Exception as e:
            logger.error(f"Bulk insert error on table {table}: {e}")
            return {"success": False, "error": str(e), "inserted_count": 0, "data": []}

    async def query_and_transform(
        self,
        table: str,
        filters: Optional[Dict[str, Any]] = None,
        transformer: callable = None,
        model_class: Optional[Any] = None,
    ) -> Dict[str, Any]:
        """
        Query database and transform results with a function or Pydantic model

        Args:
            table: Table name
            filters: Query filters
            transformer: Optional function to transform results
            model_class: Optional Pydantic model to validate/transform results

        Returns:
            Dict with query and transformation results
        """
        try:
            # Execute the query
            query_result = await self.supabase_adapter.query_database(table=table, filters=filters)

            if not query_result["success"]:
                return query_result

            data = query_result["data"]

            # Apply transformer function if provided
            if transformer and callable(transformer):
                try:
                    transformed_data = [transformer(item) for item in data]
                    return {"success": True, "data": transformed_data, "transformed": True}
                except Exception as transform_error:
                    logger.error(f"Error transforming data: {transform_error}")
                    return {
                        "success": False,
                        "error": f"Transform error: {str(transform_error)}",
                        "data": data,
                        "transformed": False,
                    }

            # Apply Pydantic model if provided
            if model_class:
                try:
                    validated_data = [model_class(**item).dict() for item in data]
                    return {"success": True, "data": validated_data, "validated": True}
                except Exception as validation_error:
                    logger.error(f"Error validating data with model: {validation_error}")
                    return {
                        "success": False,
                        "error": f"Validation error: {str(validation_error)}",
                        "data": data,
                        "validated": False,
                    }

            # Return original data if no transformation
            return {"success": True, "data": data, "transformed": False}

        except Exception as e:
            logger.error(f"Query and transform error on table {table}: {e}")
            return {"success": False, "error": str(e), "data": []}

    async def synchronize_records(
        self,
        table: str,
        source_records: List[Dict[str, Any]],
        filters: Optional[Dict[str, Any]] = None,
        key_field: str = "id",
    ) -> Dict[str, Any]:
        """
        Synchronize database records with a source of truth
        (creates, updates, or deletes records to match source)

        Args:
            table: Table name
            source_records: Source of truth records
            filters: Base filters to apply
            key_field: Field to use as unique identifier

        Returns:
            Dict with synchronization results
        """
        try:
            # Get existing records
            existing_result = await self.supabase_adapter.query_database(
                table=table, filters=filters
            )

            if not existing_result["success"]:
                return {
                    "success": False,
                    "error": existing_result.get("error", "Failed to fetch existing records"),
                    "created": 0,
                    "updated": 0,
                    "deleted": 0,
                }

            existing_records = existing_result["data"]
            existing_keys = {
                record.get(key_field): record for record in existing_records if key_field in record
            }
            source_keys = {
                record.get(key_field): record for record in source_records if key_field in record
            }

            # Identify records to create, update, or delete
            keys_to_create = set(source_keys.keys()) - set(existing_keys.keys())
            keys_to_update = set(source_keys.keys()) & set(existing_keys.keys())
            keys_to_delete = set(existing_keys.keys()) - set(source_keys.keys())

            created_count = 0
            updated_count = 0
            deleted_count = 0

            # Create new records
            for key in keys_to_create:
                create_result = await self.supabase_adapter.insert_database_record(
                    table=table, data=source_keys[key]
                )
                if create_result["success"]:
                    created_count += 1

            # Update existing records
            for key in keys_to_update:
                source_record = source_keys[key]
                existing_record = existing_keys[key]
                record_id = existing_record.get("id")

                # Skip if no changes needed
                if all(
                    source_record.get(k) == existing_record.get(k) for k in source_record.keys()
                ):
                    continue

                # Add updated_at timestamp
                source_record["updated_at"] = datetime.utcnow().isoformat()

                update_result = await self.supabase_adapter.update_database_record(
                    table=table, record_id=record_id, data=source_record
                )
                if update_result["success"]:
                    updated_count += 1

            # Delete records not in source
            for key in keys_to_delete:
                record_id = existing_keys[key].get("id")
                delete_result = await self.database_adapter.delete(
                    table=table, id_column="id", id_value=record_id
                )
                if delete_result["success"]:
                    deleted_count += 1

            return {
                "success": True,
                "created": created_count,
                "updated": updated_count,
                "deleted": deleted_count,
                "total_source_records": len(source_records),
                "total_existing_records": len(existing_records),
            }

        except Exception as e:
            logger.error(f"Record synchronization error on table {table}: {e}")
            return {"success": False, "error": str(e), "created": 0, "updated": 0, "deleted": 0}

    # Helper functions that wrap the basic supabase adapter operations
    async def query_table(
        self,
        table: str,
        select: str = "*",
        filters: Optional[Dict[str, Any]] = None,
        order_by: Optional[str] = None,
        limit: Optional[int] = None,
    ) -> Dict[str, Any]:
        """
        Query a table in the database (wrapper for query_database)

        Args:
            table: Table name
            select: Select statement
            filters: Column-value filters
            order_by: Column to order by
            limit: Row limit

        Returns:
            Dict with query results
        """
        return await self.supabase_adapter.query_database(
            table=table,
            select=select,
            filters=filters,
            order_column=order_by,
            limit=limit or 10,
        )

    async def get_database_record(
        self, table: str, record_id: str, select: str = "*"
    ) -> Dict[str, Any]:
        """
        Get a specific record from the database by ID

        Args:
            table: Table name
            record_id: Record ID to fetch
            select: Select statement

        Returns:
            Dict with record data or error
        """
        return await self.supabase_adapter.get_database_record(table, record_id, select)

    async def store_database_record(
        self, table: str, data: Dict[str, Any], record_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Store a record in the database (insert or update)

        Args:
            table: Table name
            data: Record data
            record_id: Optional record ID for updates

        Returns:
            Dict with operation result
        """
        try:
            if record_id:
                # Update existing record
                return await self.supabase_adapter.update_database_record(table, record_id, data)
            else:
                # Insert new record
                return await self.supabase_adapter.insert_database_record(table, data)

        except Exception as e:
            logger.error(f"Error storing database record: {str(e)}")
            return {"success": False, "error": str(e), "data": None}


# Create a singleton instance
database_utils = DatabaseUtils()


# ============================================================================
# STANDALONE UTILITY FUNCTIONS
# ============================================================================


async def get_database_connection():
    """
    Get a database connection instance

    Following rule #17: Secure database access with proper authentication

    Returns:
        SupabaseAdapter: Database connection instance
    """
    try:
        adapter = SupabaseAdapter()
        if adapter.is_configured():
            logger.info("✅ Database connection established")
            return adapter
        else:
            logger.warning("⚠️ Database not configured properly")
            return None
    except Exception as e:
        logger.error(f"❌ Failed to get database connection: {e}")
        return None


async def execute_query(query: str, params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Execute a raw SQL query

    Args:
        query: SQL query string
        params: Query parameters

    Returns:
        Dict with query results
    """
    try:
        adapter = await get_database_connection()
        if not adapter:
            return {"success": False, "error": "Database connection not available"}

        # Note: Supabase doesn't support raw SQL queries directly
        # This is a placeholder for future implementation
        logger.warning("Raw SQL queries not supported with Supabase adapter")
        return {
            "success": False,
            "error": "Raw SQL queries not supported with current adapter",
            "data": [],
        }

    except Exception as e:
        logger.error(f"Query execution error: {e}")
        return {"success": False, "error": str(e), "data": []}


async def fetch_one(
    table: str, filters: Dict[str, Any], select: str = "*"
) -> Optional[Dict[str, Any]]:
    """
    Fetch a single record from the database

    Args:
        table: Table name
        filters: Filter conditions
        select: Columns to select

    Returns:
        Single record or None
    """
    try:
        result = await database_utils.query_table(
            table=table, select=select, filters=filters, limit=1
        )

        if result["success"] and result["data"]:
            return result["data"][0]
        return None

    except Exception as e:
        logger.error(f"Fetch one error: {e}")
        return None


async def fetch_all(
    table: str,
    filters: Optional[Dict[str, Any]] = None,
    select: str = "*",
    limit: Optional[int] = None,
) -> List[Dict[str, Any]]:
    """
    Fetch multiple records from the database

    Args:
        table: Table name
        filters: Filter conditions
        select: Columns to select
        limit: Maximum number of records

    Returns:
        List of records
    """
    try:
        result = await database_utils.query_table(
            table=table, select=select, filters=filters, limit=limit
        )

        if result["success"]:
            return result["data"]
        return []

    except Exception as e:
        logger.error(f"Fetch all error: {e}")
        return []


# Export classes and convenience functions
__all__ = [
    "DatabaseUtils",
    "database_utils",
    "get_database_connection",
    "execute_query",
    "fetch_one",
    "fetch_all",
]
