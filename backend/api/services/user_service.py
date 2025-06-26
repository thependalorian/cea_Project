"""
User service for the Climate Economy Assistant.
"""

from typing import Dict, Any, Optional
from datetime import datetime

from backend.utils.logger import get_logger

logger = get_logger(__name__)


class UserService:
    """Service for managing user data and profiles."""

    def __init__(self, database=None):
        """Initialize the user service."""
        self.database = database

    async def get_user_profile(self, user_id: str) -> Dict[str, Any]:
        """
        Get a user's profile.

        Args:
            user_id: ID of the user

        Returns:
            Dict containing user profile data
        """
        try:
            if not self.database:
                raise ValueError("Database not initialized")

            result = (
                await self.database.table("user_profiles")
                .select("*")
                .eq("user_id", user_id)
                .single()
                .execute()
            )

            if not result.data:
                return {"success": False, "error": "User profile not found"}

            return {"success": True, "profile": result.data}

        except Exception as e:
            logger.error(f"Error getting user profile: {e}")
            return {"success": False, "error": str(e)}

    async def update_user_profile(
        self, user_id: str, profile_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Update a user's profile.

        Args:
            user_id: ID of the user
            profile_data: New profile data

        Returns:
            Dict containing updated profile data
        """
        try:
            if not self.database:
                raise ValueError("Database not initialized")

            # Add updated timestamp
            profile_data["updated_at"] = datetime.utcnow().isoformat()

            result = (
                await self.database.table("user_profiles")
                .update(profile_data)
                .eq("user_id", user_id)
                .execute()
            )

            if not result.data:
                # Profile doesn't exist, create it
                profile_data["user_id"] = user_id
                profile_data["created_at"] = profile_data["updated_at"]
                result = (
                    await self.database.table("user_profiles")
                    .insert(profile_data)
                    .execute()
                )

            return {"success": True, "profile": result.data[0] if result.data else None}

        except Exception as e:
            logger.error(f"Error updating user profile: {e}")
            return {"success": False, "error": str(e)}

    async def delete_user_profile(self, user_id: str) -> Dict[str, Any]:
        """
        Delete a user's profile.

        Args:
            user_id: ID of the user

        Returns:
            Dict indicating success or failure
        """
        try:
            if not self.database:
                raise ValueError("Database not initialized")

            result = (
                await self.database.table("user_profiles")
                .delete()
                .eq("user_id", user_id)
                .execute()
            )

            return {"success": True, "deleted": bool(result.data)}

        except Exception as e:
            logger.error(f"Error deleting user profile: {e}")
            return {"success": False, "error": str(e)}
