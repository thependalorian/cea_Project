"""
User Profile Manager - Helper Functions for User Profiles

Following rule #7: API response documentation
Following rule #8: Use Supabase with SSR
Following rule #16: Protect exposed endpoints

This utility provides helper functions for managing user profiles in Supabase.
It assists with creating and retrieving user profiles from various profile tables.

Location: backendv1/utils/user_profile_manager.py
"""

from typing import Dict, Any, Optional, List, Literal
import json
from datetime import datetime
import uuid

from backendv1.utils.logger import setup_logger
from backendv1.adapters.supabase_adapter import supabase_adapter
from backendv1.config.settings import get_settings

logger = setup_logger("user_profile_manager")
settings = get_settings()

# User profile types
ProfileType = Literal["job_seeker", "partner", "admin"]


async def create_user_profile(
    user_id: str,
    email: str,
    full_name: str,
    profile_type: ProfileType = "job_seeker",
    additional_data: Dict[str, Any] = None,
) -> Optional[Dict[str, Any]]:
    """
    Create a new user profile in the appropriate table based on profile type

    Args:
        user_id: Supabase user ID (sub from JWT)
        email: User email
        full_name: User full name
        profile_type: Type of profile to create (job_seeker, partner, admin)
        additional_data: Additional profile data

    Returns:
        Optional[Dict[str, Any]]: Created profile or None if failed
    """
    try:
        # Get Supabase client
        supabase = supabase_adapter.get_client()
        if not supabase:
            logger.warning("Cannot create user profile: Supabase client not available")
            return None

        # Set base profile data
        profile_data = {
            "user_id": user_id,
            "email": email,
            "full_name": full_name,
            "profile_completed": False,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
        }

        # Add additional data if provided
        if additional_data:
            profile_data.update(additional_data)

        # Determine table based on profile type
        table_name = {
            "job_seeker": "job_seeker_profiles",
            "partner": "partner_profiles",
            "admin": "admin_profiles",
        }.get(profile_type)

        if not table_name:
            logger.error(f"Invalid profile type: {profile_type}")
            return None

        logger.info(f"Creating {profile_type} profile for user: {user_id}")

        # Insert profile into appropriate table
        result = await supabase.table(table_name).insert(profile_data).execute()

        if result.data:
            logger.info(f"Profile created successfully: {user_id}")
            return result.data[0]
        else:
            logger.error(f"Failed to create profile: {result.error}")
            return None

    except Exception as e:
        logger.error(f"Error creating user profile: {str(e)}")
        return None


async def get_user_profile(
    user_id: str, profile_type: Optional[ProfileType] = None
) -> Optional[Dict[str, Any]]:
    """
    Get user profile from the appropriate table

    Args:
        user_id: Supabase user ID (sub from JWT)
        profile_type: Type of profile to retrieve (if known)

    Returns:
        Optional[Dict[str, Any]]: User profile or None if not found
    """
    try:
        # Get Supabase client
        supabase = supabase_adapter.get_client()
        if not supabase:
            logger.warning("Cannot get user profile: Supabase client not available")
            return None

        # If profile type is known, query only that table
        if profile_type:
            table_name = {
                "job_seeker": "job_seeker_profiles",
                "partner": "partner_profiles",
                "admin": "admin_profiles",
            }.get(profile_type)

            if not table_name:
                logger.error(f"Invalid profile type: {profile_type}")
                return None

            result = (
                await supabase.table(table_name)
                .select("*")
                .eq("user_id", user_id)
                .limit(1)
                .execute()
            )

            if result.data and len(result.data) > 0:
                profile = result.data[0]
                profile["user_type"] = profile_type
                return profile
            else:
                logger.warning(f"No {profile_type} profile found for user: {user_id}")
                return None

        # If profile type is not known, check all tables
        tables = ["job_seeker_profiles", "partner_profiles", "admin_profiles"]
        profile_types = ["job_seeker", "partner", "admin"]

        for i, table in enumerate(tables):
            result = (
                await supabase.table(table).select("*").eq("user_id", user_id).limit(1).execute()
            )

            if result.data and len(result.data) > 0:
                profile = result.data[0]
                profile["user_type"] = profile_types[i]
                logger.info(f"Found {profile_types[i]} profile for user: {user_id}")
                return profile

        logger.warning(f"No profile found for user: {user_id}")
        return None

    except Exception as e:
        logger.error(f"Error getting user profile: {str(e)}")
        return None


async def create_test_profile_for_debugging(token_sub: str) -> Dict[str, Any]:
    """
    Helper function to create a test profile for debugging

    Args:
        token_sub: Subject from JWT token (user ID)

    Returns:
        Dict[str, Any]: Test profile data
    """
    # Create a minimal test profile
    test_profile = {
        "id": str(uuid.uuid4()),
        "user_id": token_sub,
        "email": f"test-{token_sub}@example.com",
        "full_name": "Test User",
        "user_type": "job_seeker",
        "profile_completed": False,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
        "is_test_profile": True,
        "base_profile": {},  # Required for Pydantic validation
    }

    logger.info(f"Created test profile for debugging: {token_sub}")
    return test_profile


# Export functions
__all__ = ["create_user_profile", "get_user_profile", "create_test_profile_for_debugging"]
