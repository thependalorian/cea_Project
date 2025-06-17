"""
Profile Synchronization Task

This module provides a background task for ensuring Supabase users
always have a corresponding profile in the appropriate profile table.

Location: backendv1/tasks/profile_sync.py
"""

import asyncio
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta

from backendv1.adapters.supabase_adapter import supabase_adapter
from backendv1.utils.user_profile_manager import create_user_profile, get_user_profile
from backendv1.utils.logger import setup_logger

logger = setup_logger("profile_sync")


class ProfileSyncTask:
    """
    Profile synchronization task class for managing user profile sync operations

    Following rule #2: Create new, modular UI components for easy maintenance
    Following rule #12: Complete code verification with proper error handling
    """

    def __init__(self, interval_minutes: int = 60):
        """
        Initialize the profile sync task

        Args:
            interval_minutes: Minutes between sync runs
        """
        self.interval_minutes = interval_minutes
        self.is_running = False
        self.task = None

    async def start(self):
        """Start the profile sync task"""
        if not self.is_running:
            self.is_running = True
            self.task = asyncio.create_task(self._run_periodic_sync())
            logger.info(f"✅ ProfileSyncTask started (interval: {self.interval_minutes} minutes)")

    async def stop(self):
        """Stop the profile sync task"""
        if self.is_running and self.task:
            self.is_running = False
            self.task.cancel()
            try:
                await self.task
            except asyncio.CancelledError:
                pass
            logger.info("🔄 ProfileSyncTask stopped")

    async def _run_periodic_sync(self):
        """Run profile sync periodically"""
        while self.is_running:
            try:
                await sync_user_profiles()
            except Exception as e:
                logger.error(f"Error in profile sync: {e}")

            # Wait for next run
            await asyncio.sleep(self.interval_minutes * 60)

    async def sync_single_user(
        self, user_id: str, user_data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Sync a single user profile

        Args:
            user_id: User ID to sync
            user_data: Optional user data

        Returns:
            Dict with sync results
        """
        return await sync_user_profile(user_id, user_data)

    async def sync_all_users(self) -> Dict[str, Any]:
        """
        Sync all user profiles

        Returns:
            Dict with sync results
        """
        try:
            await sync_user_profiles()
            return {"success": True, "message": "All users synced successfully"}
        except Exception as e:
            logger.error(f"Error syncing all users: {e}")
            return {"success": False, "error": str(e)}


async def get_supabase_users() -> List[Dict[str, Any]]:
    """
    Get all users from Supabase auth.users table

    Returns:
        List[Dict[str, Any]]: List of user records
    """
    try:
        client = supabase_adapter.get_cached_client()
        if not client:
            logger.error("Cannot get users: Supabase client not available")
            return []

        # Query auth.users table - requires service role key
        result = await client.rpc("get_all_users").execute()

        if not result.data:
            logger.warning("No users found in Supabase")
            return []

        logger.info(f"Retrieved {len(result.data)} users from Supabase")
        return result.data

    except Exception as e:
        logger.error(f"Error getting Supabase users: {e}")
        return []


async def sync_user_profiles():
    """
    Sync all Supabase users with appropriate profile tables
    """
    if not supabase_adapter.is_configured():
        logger.warning("Supabase not configured, skipping profile sync")
        return

    logger.info("Starting user profile synchronization")

    # Get all users from Supabase
    users = await get_supabase_users()
    if not users:
        return

    # Process each user
    for user in users:
        user_id = user.get("id")
        if not user_id:
            continue

        email = user.get("email", "")
        name = user.get("user_metadata", {}).get("full_name", "")
        user_type = user.get("user_metadata", {}).get("user_type", "job_seeker")

        # Check if user already has a profile
        profile = await get_user_profile(user_id, user_type)

        if not profile:
            logger.info(f"Creating profile for user {user_id} of type {user_type}")
            await create_user_profile(
                user_id=user_id,
                email=email,
                full_name=name or email.split("@")[0],  # Use email prefix if name not available
                profile_type=user_type,
            )
        else:
            logger.debug(f"Profile already exists for user {user_id}")

    logger.info("User profile synchronization completed")


async def run_periodic_sync(interval_minutes: int = 60):
    """
    Run profile sync periodically

    Args:
        interval_minutes: Minutes between sync runs
    """
    while True:
        try:
            await sync_user_profiles()
        except Exception as e:
            logger.error(f"Error in profile sync: {e}")

        # Wait for next run
        await asyncio.sleep(interval_minutes * 60)


def start_sync_task(interval_minutes: int = 60):
    """
    Start the profile sync background task

    Args:
        interval_minutes: Minutes between sync runs
    """
    # Create and start the background task
    loop = asyncio.get_event_loop()
    task = loop.create_task(run_periodic_sync(interval_minutes))

    logger.info(f"Profile sync task started (interval: {interval_minutes} minutes)")
    return task


async def sync_user_profile(
    user_id: str, user_data: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Sync a single user profile

    Following rule #12: Complete code verification with proper error handling
    Following rule #15: Include comprehensive error handling

    Args:
        user_id: User ID to sync
        user_data: Optional user data to use for sync

    Returns:
        Dict with sync results
    """
    try:
        if not supabase_adapter.is_configured():
            return {"success": False, "error": "Supabase not configured", "user_id": user_id}

        # Get user data if not provided
        if not user_data:
            client = supabase_adapter.get_cached_client()
            if not client:
                return {
                    "success": False,
                    "error": "Supabase client not available",
                    "user_id": user_id,
                }

            # Try to get user data from auth
            try:
                result = await client.auth.admin.get_user_by_id(user_id)
                user_data = result.user.dict() if result.user else {}
            except Exception as e:
                logger.warning(f"Could not fetch user data for {user_id}: {e}")
                user_data = {}

        # Extract user information
        email = user_data.get("email", "")
        name = user_data.get("user_metadata", {}).get("full_name", "")
        user_type = user_data.get("user_metadata", {}).get("user_type", "job_seeker")

        # Check if user already has a profile
        profile = await get_user_profile(user_id, user_type)

        if not profile:
            logger.info(f"Creating profile for user {user_id} of type {user_type}")
            result = await create_user_profile(
                user_id=user_id,
                email=email,
                full_name=name or email.split("@")[0] if email else f"User_{user_id[:8]}",
                profile_type=user_type,
            )

            return {
                "success": True,
                "action": "created",
                "user_id": user_id,
                "profile_type": user_type,
                "data": result,
            }
        else:
            logger.debug(f"Profile already exists for user {user_id}")
            return {
                "success": True,
                "action": "exists",
                "user_id": user_id,
                "profile_type": user_type,
                "data": profile,
            }

    except Exception as e:
        logger.error(f"Error syncing profile for user {user_id}: {e}")
        return {"success": False, "error": str(e), "user_id": user_id}


# For CLI use
if __name__ == "__main__":
    asyncio.run(sync_user_profiles())


# Export functions
__all__ = [
    "ProfileSyncTask",
    "sync_user_profiles",
    "sync_user_profile",
    "get_supabase_users",
    "run_periodic_sync",
    "start_sync_task",
    "schedule_profile_sync",
]

# Create aliases for backward compatibility
sync_all_profiles = sync_user_profiles  # Alias for the main sync function

# Update exports to include alias
__all__.append("sync_all_profiles")


async def schedule_profile_sync(interval_minutes: int = 60) -> ProfileSyncTask:
    """
    Schedule periodic profile synchronization

    Following rule #6: Asynchronous data handling for better performance

    Args:
        interval_minutes: Minutes between sync runs

    Returns:
        ProfileSyncTask: The scheduled sync task
    """
    sync_task = ProfileSyncTask(interval_minutes=interval_minutes)
    await sync_task.start()
    logger.info(f"✅ Profile sync scheduled every {interval_minutes} minutes")
    return sync_task
