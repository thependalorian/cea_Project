"""
Storage adapter for Climate Economy Assistant.

This module provides file storage and document management functionality
using Supabase Storage and local filesystem capabilities.
"""

import os
import uuid
from typing import Any, Dict, List, Optional, Union
from pathlib import Path
import asyncio
from datetime import datetime

from adapters.supabase import get_supabase_client


class StorageAdapter:
    """Unified storage adapter for files and documents"""

    def __init__(self):
        self.supabase = None
        self.local_storage_path = Path("./storage")
        self.local_storage_path.mkdir(exist_ok=True)

    async def initialize(self):
        """Initialize storage connections"""
        try:
            self.supabase = await get_supabase_client()
            return True
        except Exception as e:
            print(f"Storage initialization warning: {e}")
            return False

    async def upload_file(
        self,
        file_data: bytes,
        filename: str,
        bucket: str = "documents",
        user_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Upload file to storage.

        Args:
            file_data: File content as bytes
            filename: Original filename
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
            if self.supabase:
                try:
                    response = self.supabase.storage.from_(bucket).upload(
                        storage_path, file_data
                    )

                    # Get public URL
                    public_url = self.supabase.storage.from_(bucket).get_public_url(
                        storage_path
                    )

                    return {
                        "success": True,
                        "file_id": file_id,
                        "storage_path": storage_path,
                        "public_url": public_url,
                        "storage_type": "supabase",
                        "uploaded_at": datetime.now().isoformat(),
                    }
                except Exception as e:
                    print(f"Supabase storage failed, falling back to local: {e}")

            # Fallback to local storage
            local_path = self.local_storage_path / storage_path
            local_path.parent.mkdir(parents=True, exist_ok=True)

            with open(local_path, "wb") as f:
                f.write(file_data)

            return {
                "success": True,
                "file_id": file_id,
                "storage_path": str(local_path),
                "public_url": f"/storage/{storage_path}",
                "storage_type": "local",
                "uploaded_at": datetime.now().isoformat(),
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "uploaded_at": datetime.now().isoformat(),
            }

    async def download_file(
        self, storage_path: str, bucket: str = "documents"
    ) -> Optional[bytes]:
        """
        Download file from storage.

        Args:
            storage_path: Path to file in storage
            bucket: Storage bucket name

        Returns:
            File content as bytes or None if not found
        """
        try:
            # Try Supabase first
            if self.supabase:
                try:
                    response = self.supabase.storage.from_(bucket).download(
                        storage_path
                    )
                    return response
                except Exception as e:
                    print(f"Supabase download failed, trying local: {e}")

            # Try local storage
            local_path = self.local_storage_path / storage_path
            if local_path.exists():
                with open(local_path, "rb") as f:
                    return f.read()

            return None

        except Exception as e:
            print(f"Download error: {e}")
            return None

    async def delete_file(self, storage_path: str, bucket: str = "documents") -> bool:
        """
        Delete file from storage.

        Args:
            storage_path: Path to file in storage
            bucket: Storage bucket name

        Returns:
            True if deleted successfully
        """
        try:
            success = False

            # Delete from Supabase
            if self.supabase:
                try:
                    response = self.supabase.storage.from_(bucket).remove(
                        [storage_path]
                    )
                    success = True
                except Exception as e:
                    print(f"Supabase delete failed: {e}")

            # Delete from local storage
            local_path = self.local_storage_path / storage_path
            if local_path.exists():
                local_path.unlink()
                success = True

            return success

        except Exception as e:
            print(f"Delete error: {e}")
            return False

    async def list_files(
        self, prefix: str = "", bucket: str = "documents", limit: int = 100
    ) -> List[Dict[str, Any]]:
        """
        List files in storage.

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
            if self.supabase:
                try:
                    response = self.supabase.storage.from_(bucket).list(
                        prefix, {"limit": limit}
                    )
                    for file_info in response:
                        files.append(
                            {
                                "name": file_info["name"],
                                "size": file_info.get("metadata", {}).get("size", 0),
                                "created_at": file_info.get("created_at"),
                                "storage_type": "supabase",
                            }
                        )
                except Exception as e:
                    print(f"Supabase list failed: {e}")

            # List from local storage
            local_prefix_path = self.local_storage_path / prefix
            if local_prefix_path.exists():
                for file_path in local_prefix_path.rglob("*"):
                    if file_path.is_file():
                        relative_path = file_path.relative_to(self.local_storage_path)
                        files.append(
                            {
                                "name": str(relative_path),
                                "size": file_path.stat().st_size,
                                "created_at": datetime.fromtimestamp(
                                    file_path.stat().st_ctime
                                ).isoformat(),
                                "storage_type": "local",
                            }
                        )

            return files[:limit]

        except Exception as e:
            print(f"List files error: {e}")
            return []


# Global storage adapter instance
storage_adapter = StorageAdapter()


async def initialize_storage():
    """Initialize the global storage adapter"""
    return await storage_adapter.initialize()


# Convenience functions
async def upload_document(
    file_data: bytes, filename: str, user_id: Optional[str] = None
):
    """Upload a document file"""
    return await storage_adapter.upload_file(file_data, filename, "documents", user_id)


async def download_document(storage_path: str):
    """Download a document file"""
    return await storage_adapter.download_file(storage_path, "documents")


async def delete_document(storage_path: str):
    """Delete a document file"""
    return await storage_adapter.delete_file(storage_path, "documents")
