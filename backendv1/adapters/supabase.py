"""
Supabase adapter for Climate Economy Assistant

This module handles interactions with Supabase, including authentication,
database operations, and storage for resume files and other assets.
"""

import logging
from datetime import datetime
from typing import Any, BinaryIO, Dict, List, Optional, Union

from supabase import Client, create_client

from core.config import get_settings

settings = get_settings()
logger = logging.getLogger("supabase_adapter")

# Initialize Supabase connection
supabase_url = settings.SUPABASE_URL
supabase_key = settings.SUPABASE_SERVICE_ROLE_KEY

# Debug logging for credentials
if not supabase_url:
    logger.warning(
        "Supabase credentials not configured in environment variables: SUPABASE_URL is missing"
    )
if not supabase_key:
    logger.warning(
        "Supabase credentials not configured in environment variables: SUPABASE_SERVICE_ROLE_KEY is missing"
    )
else:
    # Only log the first few characters for security
    logger.info(f"SUPABASE_URL: {supabase_url[:15]}...")
    logger.info(f"SUPABASE_SERVICE_ROLE_KEY: {supabase_key[:10]}...")


def get_supabase_client() -> Optional[Client]:
    """Get a Supabase client instance with proper error handling"""
    try:
        if not supabase_url or not supabase_key:
            logger.warning("Supabase credentials not configured")
            return None

        logger.info(f"Creating Supabase client with URL: {supabase_url[:15]}...")

        # Create client with absolutely minimal configuration to avoid version issues
        # This should work with all Supabase Python versions
        try:
            # Simple, direct initialization without any optional parameters
            client = create_client(supabase_url, supabase_key)
            logger.info("Supabase client created successfully")
            return client

        except Exception as e:
            logger.error(f"Supabase client creation failed: {e}")
            # Return None to gracefully handle missing database instead of crashing
            return None

    except Exception as e:
        logger.error(f"Error creating Supabase client: {str(e)}")
        # Return None instead of raising to prevent application crash
        return None


# Cache the client to avoid repeated initialization
_supabase_client = None


def get_cached_supabase_client() -> Optional[Client]:
    """Get a cached Supabase client instance"""
    global _supabase_client

    if _supabase_client is None:
        _supabase_client = get_supabase_client()

    return _supabase_client


async def upload_file_to_storage(
    file_content: Union[bytes, BinaryIO],
    file_name: str,
    content_type: str,
    bucket: str = "resumes",
) -> Dict[str, Any]:
    """
    Upload a file to Supabase storage

    Args:
        file_content: File content as bytes or file-like object
        file_name: Name of the file
        content_type: MIME type of the file
        bucket: Storage bucket name

    Returns:
        Dict with upload result
    """
    try:
        client = get_cached_supabase_client()
        if not client:
            return {"success": False, "error": "Supabase client not available"}

        # Generate a unique file path
        import uuid

        file_path = f"{uuid.uuid4()}-{file_name}"

        # Upload the file with proper error handling
        try:
            storage_client = client.storage
            result = storage_client.from_(bucket).upload(
                file_path, file_content, {"content-type": content_type}
            )

            # Check for errors in the response
            if not result:
                return {"success": False, "error": "Upload failed"}

            # Get the public URL
            file_url = storage_client.from_(bucket).get_public_url(file_path)

            return {
                "success": True,
                "file_path": file_path,
                "file_url": file_url,
                "content_type": content_type,
                "bucket": bucket,
            }
        except Exception as storage_error:
            logger.error(f"Storage operation failed: {storage_error}")
            return {"success": False, "error": f"Storage error: {str(storage_error)}"}

    except Exception as e:
        logger.error(f"Error uploading file: {str(e)}")
        return {"success": False, "error": str(e)}


async def get_file_from_storage(file_path: str, bucket: str = "resumes") -> Optional[bytes]:
    """
    Get a file from Supabase storage

    Args:
        file_path: Path to the file
        bucket: Storage bucket name

    Returns:
        File content as bytes or None if not found
    """
    try:
        client = get_cached_supabase_client()
        if not client:
            logger.warning("Supabase client not available for file download")
            return None

        # Download the file with error handling
        try:
            storage_client = client.storage
            result = storage_client.from_(bucket).download(file_path)
            return result
        except Exception as storage_error:
            logger.error(f"Storage download failed: {storage_error}")
            return None

    except Exception as e:
        logger.error(f"Error downloading file: {str(e)}")
        return None


# List storage buckets (new helper function for v1.0.0)
async def list_storage_buckets() -> List[str]:
    """
    List available storage buckets

    Returns:
        List of bucket names
    """
    try:
        client = get_cached_supabase_client()
        if not client:
            return []

        # In v1.0.0, we need to use a different approach to list buckets
        # First, get the buckets we know about
        known_buckets = ["resumes", "documents", "images"]
        available_buckets = []

        # Test each bucket by trying to access it
        storage_client = client.storage
        for bucket in known_buckets:
            try:
                # Try to list files in the bucket - if it succeeds, the bucket exists
                storage_client.from_(bucket).list()
                available_buckets.append(bucket)
            except Exception:
                # Skip buckets that don't exist or we don't have access to
                pass

        return available_buckets

    except Exception as e:
        logger.error(f"Error listing storage buckets: {str(e)}")
        return []


async def query_database(
    table: str,
    select: str = "*",
    filters: Optional[Dict[str, Any]] = None,
    order_column: Optional[str] = None,
    order_desc: bool = True,
    limit: int = 10,
) -> Dict[str, Any]:
    """
    Query the Supabase database

    Args:
        table: Table name
        select: Select statement
        filters: Column-value filters
        order_column: Column to order by
        order_desc: Whether to order descending
        limit: Row limit

    Returns:
        Dict with query results
    """
    try:
        client = get_cached_supabase_client()
        if not client:
            return {
                "success": False,
                "error": "Supabase client not available",
                "data": [],
            }

        # Start the query with error handling
        try:
            query = client.table(table).select(select)

            # Apply filters
            if filters:
                for column, value in filters.items():
                    query = query.eq(column, value)

            # Apply ordering
            if order_column:
                query = query.order(order_column, desc=order_desc)

            # Apply limit
            if limit > 0:
                query = query.limit(limit)

            # Execute the query
            result = query.execute()

            # Check for errors
            if hasattr(result, "error") and result.error:
                return {"success": False, "error": str(result.error), "data": []}

            return {
                "success": True,
                "data": result.data if result.data else [],
                "count": len(result.data) if result.data else 0,
            }
        except Exception as query_error:
            logger.error(f"Database query failed: {query_error}")
            return {
                "success": False,
                "error": f"Query error: {str(query_error)}",
                "data": [],
            }

    except Exception as e:
        logger.error(f"Error querying database: {str(e)}")
        return {"success": False, "error": str(e), "data": []}


async def insert_database_record(table: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Insert a record into the Supabase database

    Args:
        table: Table name
        data: Record data

    Returns:
        Dict with insert result
    """
    try:
        client = get_cached_supabase_client()
        if not client:
            return {
                "success": False,
                "error": "Supabase client not available",
                "data": None,
            }

        # Add timestamp
        data["created_at"] = datetime.now().isoformat()

        # Insert the record with error handling
        try:
            result = client.table(table).insert(data).execute()

            # Check for errors
            if hasattr(result, "error") and result.error:
                return {"success": False, "error": str(result.error), "data": None}

            return {
                "success": True,
                "data": result.data[0] if result.data else None,
                "record_id": result.data[0].get("id") if result.data else None,
            }
        except Exception as insert_error:
            logger.error(f"Database insert failed: {insert_error}")
            return {
                "success": False,
                "error": f"Insert error: {str(insert_error)}",
                "data": None,
            }

    except Exception as e:
        logger.error(f"Error inserting record: {str(e)}")
        return {"success": False, "error": str(e), "data": None}


async def update_database_record(
    table: str, record_id: str, data: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Update a record in the Supabase database

    Args:
        table: Table name
        record_id: Record ID
        data: Updated data

    Returns:
        Dict with update result
    """
    try:
        client = get_cached_supabase_client()
        if not client:
            return {
                "success": False,
                "error": "Supabase client not available",
                "data": None,
            }

        # Add updated_at timestamp
        data["updated_at"] = datetime.now().isoformat()

        # Update the record with error handling
        try:
            result = client.table(table).update(data).eq("id", record_id).execute()

            # Check for errors
            if hasattr(result, "error") and result.error:
                return {"success": False, "error": str(result.error), "data": None}

            return {
                "success": True,
                "data": result.data[0] if result.data else None,
                "record_id": record_id,
            }
        except Exception as update_error:
            logger.error(f"Database update failed: {update_error}")
            return {
                "success": False,
                "error": f"Update error: {str(update_error)}",
                "data": None,
            }

    except Exception as e:
        logger.error(f"Error updating record: {str(e)}")
        return {"success": False, "error": str(e), "data": None}


async def get_database_record(table: str, record_id: str, select: str = "*") -> Dict[str, Any]:
    """
    Get a specific record from the database by ID

    Args:
        table: Table name
        record_id: Record ID to fetch
        select: Select statement

    Returns:
        Dict with record data or error
    """
    try:
        client = get_cached_supabase_client()
        if not client:
            return {
                "success": False,
                "error": "Supabase client not available",
                "data": None,
            }

        # Query for the specific record
        try:
            query = client.table(table).select(select).eq("id", record_id)
            result = query.execute()

            if result.data and len(result.data) > 0:
                return {
                    "success": True,
                    "data": result.data[0],
                    "error": None,
                }
            else:
                return {
                    "success": False,
                    "error": f"Record not found in {table}",
                    "data": None,
                }

        except Exception as query_error:
            logger.error(f"Database query error: {query_error}")
            return {
                "success": False,
                "error": f"Query failed: {str(query_error)}",
                "data": None,
            }

    except Exception as e:
        logger.error(f"Error getting database record: {e}")
        return {
            "success": False,
            "error": f"Database error: {str(e)}",
            "data": None,
        }


async def store_database_record(table: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Store a new record in the database

    Args:
        table: Table name
        data: Record data to store

    Returns:
        Dict with operation result
    """
    try:
        client = get_cached_supabase_client()
        if not client:
            return {
                "success": False,
                "error": "Supabase client not available",
                "data": None,
            }

        # Insert the record
        try:
            result = client.table(table).insert(data).execute()

            if result.data and len(result.data) > 0:
                return {
                    "success": True,
                    "data": result.data[0],
                    "error": None,
                }
            else:
                return {
                    "success": False,
                    "error": f"Failed to insert record in {table}",
                    "data": None,
                }

        except Exception as query_error:
            logger.error(f"Database insert error: {query_error}")
            return {
                "success": False,
                "error": f"Insert failed: {str(query_error)}",
                "data": None,
            }

    except Exception as e:
        logger.error(f"Error storing database record: {e}")
        return {
            "success": False,
            "error": f"Database error: {str(e)}",
            "data": None,
        }
