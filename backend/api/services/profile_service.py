"""
Profile service for managing user profiles, partner profiles, admin profiles, and user interests.
Handles all database operations for the profile management system.
"""

import structlog
from typing import Dict, Any, List, Optional
from datetime import datetime

from backend.database.supabase_client import supabase

logger = structlog.get_logger(__name__)


class ProfileService:
    """Service for managing all types of user profiles."""

    # Job Seeker Profile Methods
    async def create_job_seeker_profile(self, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new job seeker profile.
        
        Args:
            profile_data: Dictionary containing profile information
            
        Returns:
            Created profile data with ID and timestamps
        """
        try:
            profile_data["created_at"] = datetime.utcnow().isoformat()
            profile_data["updated_at"] = datetime.utcnow().isoformat()
            
            result = supabase.table("job_seeker_profiles").insert(profile_data).execute()
            
            if result.data:
                logger.info(f"Created job seeker profile for user {profile_data.get('user_id')}")
                return result.data[0]
            else:
                raise Exception("Failed to create job seeker profile")
                
        except Exception as e:
            logger.error(f"Error creating job seeker profile: {e}")
            raise

    async def get_job_seeker_profile(self, profile_id: str) -> Optional[Dict[str, Any]]:
        """
        Get job seeker profile by ID.
        
        Args:
            profile_id: Profile ID to retrieve
            
        Returns:
            Profile data or None if not found
        """
        try:
            result = supabase.table("job_seeker_profiles").select("*").eq("id", profile_id).execute()
            
            if result.data:
                return result.data[0]
            return None
            
        except Exception as e:
            logger.error(f"Error getting job seeker profile {profile_id}: {e}")
            raise

    async def get_job_seeker_profiles(self, limit: int = 10, offset: int = 0) -> List[Dict[str, Any]]:
        """
        Get list of job seeker profiles with pagination.
        
        Args:
            limit: Maximum number of profiles to return
            offset: Number of profiles to skip
            
        Returns:
            List of profile data
        """
        try:
            result = (
                supabase.table("job_seeker_profiles")
                .select("*")
                .order("created_at", desc=True)
                .range(offset, offset + limit - 1)
                .execute()
            )
            
            return result.data if result.data else []
            
        except Exception as e:
            logger.error(f"Error getting job seeker profiles: {e}")
            raise

    async def update_job_seeker_profile(self, profile_id: str, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Update job seeker profile.
        
        Args:
            profile_id: Profile ID to update
            update_data: Data to update
            
        Returns:
            Updated profile data or None if not found
        """
        try:
            update_data["updated_at"] = datetime.utcnow().isoformat()
            
            result = (
                supabase.table("job_seeker_profiles")
                .update(update_data)
                .eq("id", profile_id)
                .execute()
            )
            
            if result.data:
                logger.info(f"Updated job seeker profile {profile_id}")
                return result.data[0]
            return None
            
        except Exception as e:
            logger.error(f"Error updating job seeker profile {profile_id}: {e}")
            raise

    async def delete_job_seeker_profile(self, profile_id: str) -> bool:
        """
        Delete job seeker profile.
        
        Args:
            profile_id: Profile ID to delete
            
        Returns:
            True if deleted successfully, False otherwise
        """
        try:
            result = supabase.table("job_seeker_profiles").delete().eq("id", profile_id).execute()
            
            if result.data:
                logger.info(f"Deleted job seeker profile {profile_id}")
                return True
            return False
            
        except Exception as e:
            logger.error(f"Error deleting job seeker profile {profile_id}: {e}")
            raise

    # Partner Profile Methods
    async def create_partner_profile(self, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new partner profile.
        
        Args:
            profile_data: Dictionary containing profile information
            
        Returns:
            Created profile data with ID and timestamps
        """
        try:
            profile_data["created_at"] = datetime.utcnow().isoformat()
            profile_data["updated_at"] = datetime.utcnow().isoformat()
            
            result = supabase.table("partner_profiles").insert(profile_data).execute()
            
            if result.data:
                logger.info(f"Created partner profile for {profile_data.get('organization_name')}")
                return result.data[0]
            else:
                raise Exception("Failed to create partner profile")
                
        except Exception as e:
            logger.error(f"Error creating partner profile: {e}")
            raise

    async def get_partner_profile(self, profile_id: str) -> Optional[Dict[str, Any]]:
        """
        Get partner profile by ID.
        
        Args:
            profile_id: Profile ID to retrieve
            
        Returns:
            Profile data or None if not found
        """
        try:
            result = supabase.table("partner_profiles").select("*").eq("id", profile_id).execute()
            
            if result.data:
                return result.data[0]
            return None
            
        except Exception as e:
            logger.error(f"Error getting partner profile {profile_id}: {e}")
            raise

    async def get_partner_profiles(self, limit: int = 10, offset: int = 0) -> List[Dict[str, Any]]:
        """
        Get list of partner profiles with pagination.
        
        Args:
            limit: Maximum number of profiles to return
            offset: Number of profiles to skip
            
        Returns:
            List of profile data
        """
        try:
            result = (
                supabase.table("partner_profiles")
                .select("*")
                .order("created_at", desc=True)
                .range(offset, offset + limit - 1)
                .execute()
            )
            
            return result.data if result.data else []
            
        except Exception as e:
            logger.error(f"Error getting partner profiles: {e}")
            raise

    async def update_partner_profile(self, profile_id: str, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Update partner profile.
        
        Args:
            profile_id: Profile ID to update
            update_data: Data to update
            
        Returns:
            Updated profile data or None if not found
        """
        try:
            update_data["updated_at"] = datetime.utcnow().isoformat()
            
            result = (
                supabase.table("partner_profiles")
                .update(update_data)
                .eq("id", profile_id)
                .execute()
            )
            
            if result.data:
                logger.info(f"Updated partner profile {profile_id}")
                return result.data[0]
            return None
            
        except Exception as e:
            logger.error(f"Error updating partner profile {profile_id}: {e}")
            raise

    async def delete_partner_profile(self, profile_id: str) -> bool:
        """
        Delete partner profile.
        
        Args:
            profile_id: Profile ID to delete
            
        Returns:
            True if deleted successfully, False otherwise
        """
        try:
            result = supabase.table("partner_profiles").delete().eq("id", profile_id).execute()
            
            if result.data:
                logger.info(f"Deleted partner profile {profile_id}")
                return True
            return False
            
        except Exception as e:
            logger.error(f"Error deleting partner profile {profile_id}: {e}")
            raise

    # User Interests Methods
    async def create_user_interests(self, interests_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create user interests record.
        
        Args:
            interests_data: Dictionary containing user interests
            
        Returns:
            Created interests data
        """
        try:
            interests_data["created_at"] = datetime.utcnow().isoformat()
            interests_data["updated_at"] = datetime.utcnow().isoformat()
            
            result = supabase.table("user_interests").insert(interests_data).execute()
            
            if result.data:
                logger.info(f"Created user interests for user {interests_data.get('user_id')}")
                return result.data[0]
            else:
                raise Exception("Failed to create user interests")
                
        except Exception as e:
            logger.error(f"Error creating user interests: {e}")
            raise

    async def get_user_interests(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Get user interests by user ID.
        
        Args:
            user_id: User ID to get interests for
            
        Returns:
            User interests data or None if not found
        """
        try:
            result = supabase.table("user_interests").select("*").eq("user_id", user_id).execute()
            
            if result.data:
                return result.data[0]
            return None
            
        except Exception as e:
            logger.error(f"Error getting user interests for {user_id}: {e}")
            raise

    async def update_user_interests(self, user_id: str, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Update user interests.
        
        Args:
            user_id: User ID to update interests for
            update_data: Data to update
            
        Returns:
            Updated interests data or None if not found
        """
        try:
            update_data["updated_at"] = datetime.utcnow().isoformat()
            
            result = (
                supabase.table("user_interests")
                .update(update_data)
                .eq("user_id", user_id)
                .execute()
            )
            
            if result.data:
                logger.info(f"Updated user interests for {user_id}")
                return result.data[0]
            return None
            
        except Exception as e:
            logger.error(f"Error updating user interests for {user_id}: {e}")
            raise

    async def delete_user_interests(self, user_id: str) -> bool:
        """
        Delete user interests.
        
        Args:
            user_id: User ID to delete interests for
            
        Returns:
            True if deleted successfully, False otherwise
        """
        try:
            result = supabase.table("user_interests").delete().eq("user_id", user_id).execute()
            
            if result.data:
                logger.info(f"Deleted user interests for {user_id}")
                return True
            return False
            
        except Exception as e:
            logger.error(f"Error deleting user interests for {user_id}: {e}")
            raise