"""
Supabase Database Adapter - Full Production Implementation

Following rule #8: Use Supabase with SSR for secure data access
Following rule #17: Secure database access with proper authentication
Following rule #15: Include comprehensive error handling

This adapter handles all Supabase database operations and authentication.
Ported from backend/adapters/supabase.py (491 lines) to provide full functionality.

Location: backendv1/adapters/supabase_adapter.py
"""

import asyncio
import logging
import uuid
from datetime import datetime
from typing import Any, BinaryIO, Dict, List, Optional, Union

from supabase import Client, create_client

from backendv1.config.settings import get_settings
from backendv1.utils.logger import setup_logger

logger = setup_logger("supabase_adapter")
settings = get_settings()


class SupabaseAdapter:
    """
    Supabase database and authentication adapter - Full Production Implementation

    Following rule #17: Secure database access patterns
    Following rule #8: Use Supabase with SSR
    Following rule #15: Comprehensive error handling
    """

    def __init__(self):
        self.url = settings.SUPABASE_URL
        self.service_key = settings.SUPABASE_SERVICE_KEY
        self.anon_key = settings.SUPABASE_ANON_KEY
        self._client = None

        # Debug logging for credentials
        if not self.url:
            logger.warning("Supabase credentials not configured: SUPABASE_URL is missing")
        if not self.service_key:
            logger.warning("Supabase credentials not configured: SUPABASE_SERVICE_KEY is missing")
        else:
            logger.info(f"SUPABASE_URL: {self.url[:15] if self.url else 'None'}...")
            logger.info(
                f"SUPABASE_SERVICE_KEY: {self.service_key[:10] if self.service_key else 'None'}..."
            )

    def is_configured(self) -> bool:
        """Check if Supabase adapter is properly configured with valid credentials"""
        return bool(self.url) and bool(self.service_key)

    def get_client(self) -> Optional[Client]:
        """Get a Supabase client instance with proper error handling"""
        try:
            if not self.url or not self.service_key:
                logger.warning("Supabase credentials not configured")
                return None

            logger.info(f"Creating Supabase client with URL: {self.url[:15]}...")

            # Create client with minimal configuration to avoid version issues
            try:
                client = create_client(self.url, self.service_key)
                logger.info("Supabase client created successfully")
                return client

            except Exception as e:
                logger.error(f"Supabase client creation failed: {e}")
                return None

        except Exception as e:
            logger.error(f"Error creating Supabase client: {str(e)}")
            return None

    def get_cached_client(self) -> Optional[Client]:
        """Get a cached Supabase client instance"""
        if self._client is None:
            self._client = self.get_client()
        return self._client

    async def validate_connection(self) -> bool:
        """
        Validate connection to Supabase

        Returns:
            bool: True if connection is valid
        """
        try:
            client = self.get_cached_client()
            if not client:
                return False

            # Test connection with a simple query
            result = client.table("profiles").select("id").limit(1).execute()
            logger.info("✅ Supabase connection validated")
            return True
        except Exception as e:
            logger.error(f"Supabase connection validation failed: {e}")
            return False

    # ============================================================================
    # FILE STORAGE OPERATIONS
    # ============================================================================

    async def upload_file_to_storage(
        self,
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
            client = self.get_cached_client()
            if not client:
                return {"success": False, "error": "Supabase client not available"}

            # Generate a unique file path
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

    async def get_file_from_storage(
        self, file_path: str, bucket: str = "resumes"
    ) -> Optional[bytes]:
        """
        Get a file from Supabase storage

        Args:
            file_path: Path to the file
            bucket: Storage bucket name

        Returns:
            File content as bytes or None if not found
        """
        try:
            client = self.get_cached_client()
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

    async def list_storage_buckets(self) -> List[str]:
        """
        List available storage buckets

        Returns:
            List of bucket names
        """
        try:
            client = self.get_cached_client()
            if not client:
                return []

            # Test known buckets by trying to access them
            known_buckets = ["resumes", "documents", "images"]
            available_buckets = []

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

    # ============================================================================
    # DATABASE OPERATIONS
    # ============================================================================

    async def query_database(
        self,
        table: str,
        select: str = "*",
        filters: Optional[Dict[str, Any]] = None,
        order_column: Optional[str] = None,
        order_desc: bool = True,
        limit: int = 10,
    ) -> Dict[str, Any]:
        """
        Query database table with filters and ordering

        Args:
            table: Table name
            select: Columns to select
            filters: Optional filters to apply
            order_column: Optional column to order by
            order_desc: Whether to order in descending order
            limit: Maximum number of records to return

        Returns:
            Dict with query result
        """
        try:
            client = self.get_cached_client()
            if not client:
                return {
                    "success": False,
                    "error": "Supabase client not available",
                    "data": [],
                }

            # Start the query
            query = client.table(table).select(select)

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

    async def insert_database_record(self, table: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Insert a record into database table

        Args:
            table: Table name
            data: Data to insert

        Returns:
            Dict with insert result
        """
        try:
            client = self.get_cached_client()
            if not client:
                return {"success": False, "error": "Supabase client not available"}

            # Ensure record has an ID if not provided
            if "id" not in data:
                data["id"] = str(uuid.uuid4())

            # Add timestamps
            now = datetime.utcnow().isoformat()
            if "created_at" not in data:
                data["created_at"] = now
            if "updated_at" not in data:
                data["updated_at"] = now

            # Execute the insert
            result = client.table(table).insert(data).execute()

            return {"success": True, "data": result.data}

        except Exception as e:
            logger.error(f"Error inserting into {table}: {e}")
            return {"success": False, "error": str(e)}

    async def update_database_record(
        self, table: str, record_id: str, data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Update a record in database table

        Args:
            table: Table name
            record_id: ID of record to update
            data: Data to update

        Returns:
            Dict with update result
        """
        try:
            client = self.get_cached_client()
            if not client:
                return {"success": False, "error": "Supabase client not available"}

            # Add updated timestamp
            data["updated_at"] = datetime.utcnow().isoformat()

            # Execute the update
            result = client.table(table).update(data).eq("id", record_id).execute()

            return {"success": True, "data": result.data}

        except Exception as e:
            logger.error(f"Error updating {table}: {e}")
            return {"success": False, "error": str(e)}

    async def get_database_record(
        self, table: str, record_id: str, select: str = "*"
    ) -> Dict[str, Any]:
        """
        Get a single record from database table

        Args:
            table: Table name
            record_id: ID of record to get
            select: Columns to select

        Returns:
            Dict with record data
        """
        try:
            client = self.get_cached_client()
            if not client:
                return {"success": False, "error": "Supabase client not available"}

            # Execute the query
            result = client.table(table).select(select).eq("id", record_id).execute()

            if result.data:
                return {"success": True, "data": result.data[0]}
            else:
                return {"success": False, "error": "Record not found", "data": None}

        except Exception as e:
            logger.error(f"Error getting record from {table}: {e}")
            return {"success": False, "error": str(e), "data": None}

    async def store_database_record(self, table: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Store (upsert) a record in database table

        Args:
            table: Table name
            data: Data to store

        Returns:
            Dict with store result
        """
        try:
            client = self.get_cached_client()
            if not client:
                return {"success": False, "error": "Supabase client not available"}

            # Ensure record has an ID
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
            logger.error(f"Error storing record in {table}: {e}")
            return {"success": False, "error": str(e)}

    # ============================================================================
    # USER PROFILE OPERATIONS
    # ============================================================================

    async def get_user_profile(self, user_id: str, user_type: str) -> Optional[Dict[str, Any]]:
        """
        Get user profile from database

        Args:
            user_id: User identifier
            user_type: Type of user profile

        Returns:
            Optional[Dict[str, Any]]: User profile data
        """
        try:
            result = await self.get_database_record("profiles", user_id)
            if result["success"]:
                logger.info(f"Retrieved user profile for {user_id}")
                return result["data"]
            else:
                logger.warning(f"User profile not found for {user_id}")
                return None
        except Exception as e:
            logger.error(f"Error getting user profile: {e}")
            return None

    async def get_user_permissions(self, user_id: str, user_type: str) -> List[str]:
        """
        Get user permissions from database

        Args:
            user_id: User identifier
            user_type: Type of user

        Returns:
            List[str]: User permissions
        """
        try:
            # Get user profile to check permissions
            profile = await self.get_user_profile(user_id, user_type)
            if not profile:
                return ["chat"]  # Minimal fallback

            base_permissions = ["chat", "profile_access"]

            if user_type == "job_seeker":
                base_permissions.extend(["resume_upload", "job_search"])
            elif user_type == "partner":
                base_permissions.extend(["analytics", "job_posting"])
            elif user_type == "admin":
                base_permissions.extend(["user_management", "system_admin"])

            return base_permissions

        except Exception as e:
            logger.error(f"Error getting user permissions: {e}")
            return ["chat"]  # Minimal fallback

    # ============================================================================
    # AUTHENTICATION OPERATIONS
    # ============================================================================

    async def auth_sign_in(self, email: str, password: str) -> Dict[str, Any]:
        """
        Authenticate user with Supabase Auth

        Args:
            email: User email
            password: User password

        Returns:
            Dict with authentication result
        """
        try:
            client = self.get_cached_client()
            if not client:
                return {"success": False, "error": "Supabase client not available"}

            # Sign in with Supabase Auth
            auth_response = client.auth.sign_in_with_password(
                {"email": email, "password": password}
            )

            if auth_response.user and auth_response.session:
                return {
                    "success": True,
                    "user_id": auth_response.user.id,
                    "access_token": auth_response.session.access_token,
                    "refresh_token": auth_response.session.refresh_token,
                    "user": auth_response.user,
                    "session": auth_response.session,
                }
            else:
                return {"success": False, "error": "Authentication failed"}

        except Exception as e:
            logger.error(f"Supabase auth sign in error: {e}")
            return {"success": False, "error": str(e)}

    async def auth_get_user(self, access_token: str) -> Dict[str, Any]:
        """
        Get user from access token

        Args:
            access_token: Supabase access token

        Returns:
            Dict with user data
        """
        try:
            client = self.get_cached_client()
            if not client:
                return {"success": False, "error": "Supabase client not available"}

            # Get user from token
            user_response = client.auth.get_user(access_token)

            if user_response.user:
                return {
                    "success": True,
                    "user": user_response.user,
                    "user_id": user_response.user.id,
                }
            else:
                return {"success": False, "error": "Invalid token"}

        except Exception as e:
            logger.error(f"Supabase auth get user error: {e}")
            return {"success": False, "error": str(e)}

    # ============================================================================
    # SIMPLIFIED QUERY METHODS FOR AUTH WORKFLOW
    # ============================================================================

    async def query(
        self, table: str, filters: Optional[Dict[str, Any]] = None, select: str = "*"
    ) -> Dict[str, Any]:
        """
        Simplified query method for auth workflow compatibility

        Args:
            table: Table name
            filters: Query filters
            select: Columns to select

        Returns:
            Dict with query result
        """
        return await self.query_database(table, select=select, filters=filters)

    async def insert(self, table: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Simplified insert method for auth workflow compatibility

        Args:
            table: Table name
            data: Data to insert

        Returns:
            Dict with insert result
        """
        return await self.insert_database_record(table, data)


# Export main class
__all__ = ["SupabaseAdapter"]

# Create a singleton instance for use throughout the application
supabase_adapter = SupabaseAdapter()

# Update exports to include the singleton
__all__ = ["SupabaseAdapter", "supabase_adapter"]
