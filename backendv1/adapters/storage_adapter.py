"""
Storage Adapter - Full Production Implementation

Following rule #14: Ensure application security and scalability
Following rule #15: Include comprehensive error handling

This adapter provides file storage and document management functionality
using Supabase Storage and local filesystem capabilities.
Ported from backend/adapters/storage.py (267 lines) to provide full functionality.

Location: backendv1/adapters/storage_adapter.py
"""

import os
import uuid
import io
from pathlib import Path
from typing import Any, BinaryIO, Dict, List, Optional, Union
from datetime import datetime

from backendv1.adapters.supabase_adapter import SupabaseAdapter
from backendv1.utils.logger import setup_logger
from backendv1.config.settings import get_settings

logger = setup_logger("storage_adapter")
settings = get_settings()


class StorageAdapter:
    """
    Unified storage adapter for files and documents

    Following rule #14: Ensure application security and scalability
    Following rule #15: Comprehensive error handling
    """

    def __init__(self):
        """Initialize the storage adapter with Supabase and local storage options"""
        self.supabase_adapter = SupabaseAdapter()
        self.local_storage_path = Path("./storage")
        self.local_storage_path.mkdir(exist_ok=True)
        logger.info("📂 Storage adapter initialized")

    async def validate_connection(self) -> bool:
        """
        Validate storage service connection

        Returns:
            bool: True if connection is valid
        """
        try:
            is_connected = await self.supabase_adapter.validate_connection()
            if is_connected:
                logger.info("✅ Storage service connection validated")
                return True
            else:
                logger.error("❌ Storage service connection failed - Supabase unavailable")
                return False
        except Exception as e:
            logger.error(f"❌ Storage service connection failed: {e}")
            return False

    async def upload_file(
        self,
        file_data: bytes,
        filename: str,
        content_type: str = "application/octet-stream",
        bucket: str = "documents",
        user_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Upload file to storage

        Following rule #15: Include comprehensive error handling

        Args:
            file_data: File content as bytes
            filename: Original filename
            content_type: MIME type of the file
            bucket: Storage bucket name
            user_id: User ID for organization

        Returns:
            Dict with upload results and file metadata
        """
        try:
            file_id = str(uuid.uuid4())
            file_extension = Path(filename).suffix
            stored_filename = f"{file_id}{file_extension}"

            # Organize by user if provided
            if user_id:
                storage_path = f"{user_id}/{stored_filename}"
            else:
                storage_path = f"shared/{stored_filename}"

            # Try Supabase storage first
            supabase_result = await self.supabase_adapter.upload_file_to_storage(
                file_data, stored_filename, content_type, bucket
            )

            if supabase_result["success"]:
                logger.info(f"✅ File uploaded to Supabase storage: {storage_path}")
                return {
                    "success": True,
                    "file_id": file_id,
                    "storage_path": supabase_result["file_path"],
                    "public_url": supabase_result["file_url"],
                    "storage_type": "supabase",
                    "content_type": content_type,
                    "uploaded_at": datetime.now().isoformat(),
                }
            else:
                logger.warning(
                    f"⚠️ Supabase storage failed, falling back to local: {supabase_result.get('error')}"
                )

            # Fallback to local storage
            local_path = self.local_storage_path / storage_path
            local_path.parent.mkdir(parents=True, exist_ok=True)

            with open(local_path, "wb") as f:
                f.write(file_data)

            logger.info(f"✅ File uploaded to local storage: {local_path}")
            return {
                "success": True,
                "file_id": file_id,
                "storage_path": str(local_path),
                "public_url": f"/storage/{storage_path}",
                "storage_type": "local",
                "content_type": content_type,
                "uploaded_at": datetime.now().isoformat(),
            }

        except Exception as e:
            logger.error(f"❌ Error uploading file: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "uploaded_at": datetime.now().isoformat(),
            }

    async def download_file(self, storage_path: str, bucket: str = "documents") -> Optional[bytes]:
        """
        Download file from storage

        Following rule #15: Include comprehensive error handling

        Args:
            storage_path: Path to file in storage
            bucket: Storage bucket name

        Returns:
            File content as bytes or None if not found
        """
        try:
            # Try Supabase first
            file_data = await self.supabase_adapter.get_file_from_storage(storage_path, bucket)
            if file_data:
                logger.info(f"✅ File downloaded from Supabase storage: {storage_path}")
                return file_data

            # Try local storage
            local_path = self.local_storage_path / storage_path
            if local_path.exists():
                with open(local_path, "rb") as f:
                    file_content = f.read()
                logger.info(f"✅ File downloaded from local storage: {local_path}")
                return file_content

            logger.warning(f"⚠️ File not found in any storage: {storage_path}")
            return None

        except Exception as e:
            logger.error(f"❌ Download error: {e}")
            return None

    async def delete_file(self, storage_path: str, bucket: str = "documents") -> bool:
        """
        Delete file from storage

        Following rule #15: Include comprehensive error handling

        Args:
            storage_path: Path to file in storage
            bucket: Storage bucket name

        Returns:
            True if deleted successfully
        """
        try:
            success = False

            # Delete from Supabase
            try:
                client = self.supabase_adapter.get_cached_client()
                if client:
                    storage_client = client.storage
                    storage_client.from_(bucket).remove([storage_path])
                    logger.info(f"✅ File deleted from Supabase storage: {storage_path}")
                    success = True
            except Exception as e:
                logger.warning(f"⚠️ Supabase delete failed: {e}")

            # Delete from local storage
            local_path = self.local_storage_path / storage_path
            if local_path.exists():
                local_path.unlink()
                logger.info(f"✅ File deleted from local storage: {local_path}")
                success = True

            return success

        except Exception as e:
            logger.error(f"❌ Delete error: {e}")
            return False

    async def list_files(
        self, prefix: str = "", bucket: str = "documents", limit: int = 100
    ) -> List[Dict[str, Any]]:
        """
        List files in storage

        Following rule #15: Include comprehensive error handling

        Args:
            prefix: File path prefix to filter by
            bucket: Storage bucket name
            limit: Maximum files to return

        Returns:
            List of file metadata dictionaries
        """
        try:
            files = []

            # List from Supabase
            try:
                client = self.supabase_adapter.get_cached_client()
                if client:
                    storage_client = client.storage
                    response = storage_client.from_(bucket).list(prefix, {"limit": limit})
                    for file_info in response:
                        files.append(
                            {
                                "name": file_info["name"],
                                "size": file_info.get("metadata", {}).get("size", 0),
                                "created_at": file_info.get("created_at"),
                                "storage_type": "supabase",
                            }
                        )
                    logger.info(f"✅ Listed {len(files)} files from Supabase storage")
            except Exception as e:
                logger.warning(f"⚠️ Supabase list failed: {e}")

            # List from local storage
            local_prefix_path = self.local_storage_path / prefix
            if local_prefix_path.exists():
                local_files = []
                for file_path in local_prefix_path.rglob("*"):
                    if file_path.is_file():
                        relative_path = file_path.relative_to(self.local_storage_path)
                        local_files.append(
                            {
                                "name": str(relative_path),
                                "size": file_path.stat().st_size,
                                "created_at": datetime.fromtimestamp(
                                    file_path.stat().st_ctime
                                ).isoformat(),
                                "storage_type": "local",
                            }
                        )
                logger.info(f"✅ Listed {len(local_files)} files from local storage")
                files.extend(local_files)

            return files[:limit]

        except Exception as e:
            logger.error(f"❌ List files error: {e}")
            return []

    # ============================================================================
    # RESUME FILE OPERATIONS
    # ============================================================================

    async def upload_resume(
        self, file_data: bytes, filename: str, content_type: str, user_id: str
    ) -> Dict[str, Any]:
        """
        Upload a resume file to storage

        Following rule #15: Include comprehensive error handling

        Args:
            file_data: Resume file content as bytes
            filename: Original filename
            content_type: MIME type of the file
            user_id: User ID

        Returns:
            Dict with upload results and file metadata
        """
        try:
            # Use resumes bucket for resume files
            result = await self.upload_file(
                file_data=file_data,
                filename=filename,
                content_type=content_type,
                bucket="resumes",
                user_id=user_id,
            )

            if result["success"]:
                # Store record in database
                resume_data = {
                    "user_id": user_id,
                    "file_name": filename,
                    "file_path": result["storage_path"],
                    "file_size": len(file_data),
                    "content_type": content_type,
                    "processed": False,
                    "processing_status": "pending",
                    "created_at": datetime.now().isoformat(),
                    "updated_at": datetime.now().isoformat(),
                }

                db_result = await self.supabase_adapter.store_database_record(
                    "resumes", resume_data
                )
                if db_result["success"]:
                    logger.info(
                        f"✅ Resume record created in database: {db_result['data'][0]['id']}"
                    )
                    result["resume_id"] = db_result["data"][0]["id"]
                else:
                    logger.error(f"❌ Failed to create resume record: {db_result.get('error')}")
                    # If database record fails, try to clean up the file
                    await self.delete_file(result["storage_path"], "resumes")
                    return {
                        "success": False,
                        "error": f"Database error: {db_result.get('error')}",
                        "uploaded_at": datetime.now().isoformat(),
                    }

            return result

        except Exception as e:
            logger.error(f"❌ Resume upload error: {e}")
            return {
                "success": False,
                "error": str(e),
                "uploaded_at": datetime.now().isoformat(),
            }

    async def download_resume(self, resume_id: str) -> Optional[Dict[str, Any]]:
        """
        Download a resume file by its ID

        Following rule #15: Include comprehensive error handling

        Args:
            resume_id: Resume record ID

        Returns:
            Dict with file content and metadata or None if not found
        """
        try:
            # Get resume record from database
            resume_result = await self.supabase_adapter.get_database_record("resumes", resume_id)
            if not resume_result["success"] or not resume_result["data"]:
                logger.warning(f"⚠️ Resume record not found: {resume_id}")
                return None

            resume = resume_result["data"]
            file_path = resume.get("file_path")

            if not file_path:
                logger.warning(f"⚠️ Resume file path not found in record: {resume_id}")
                return None

            # Download file content
            file_content = await self.download_file(file_path, "resumes")
            if not file_content:
                logger.warning(f"⚠️ Resume file not found in storage: {file_path}")
                return None

            return {
                "success": True,
                "resume_id": resume_id,
                "file_name": resume.get("file_name"),
                "content_type": resume.get("content_type"),
                "file_size": len(file_content),
                "file_content": file_content,
                "processed": resume.get("processed", False),
                "processing_status": resume.get("processing_status", "pending"),
            }

        except Exception as e:
            logger.error(f"❌ Resume download error: {e}")
            return None

    async def get_user_resume(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Get the most recent resume for a user

        Following rule #15: Include comprehensive error handling

        Args:
            user_id: User ID

        Returns:
            Dict with resume metadata or None if not found
        """
        try:
            # Query for the user's most recent resume
            query_result = await self.supabase_adapter.query_database(
                "resumes",
                filters={"user_id": user_id},
                order_column="created_at",
                order_desc=True,
                limit=1,
            )

            if not query_result["success"] or not query_result["data"]:
                logger.info(f"No resume found for user: {user_id}")
                return None

            resume = query_result["data"][0]
            return {
                "resume_id": resume["id"],
                "file_name": resume.get("file_name"),
                "file_path": resume.get("file_path"),
                "file_size": resume.get("file_size"),
                "content_type": resume.get("content_type"),
                "processed": resume.get("processed", False),
                "processing_status": resume.get("processing_status", "pending"),
                "created_at": resume.get("created_at"),
                "updated_at": resume.get("updated_at"),
            }

        except Exception as e:
            logger.error(f"❌ Error getting user resume: {e}")
            return None


# Export main class
__all__ = ["StorageAdapter"]
