"""
User routes for the Climate Economy Assistant.
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any
from datetime import datetime
import structlog

from backend.database.supabase_client import supabase
from backend.api.middleware.auth import verify_token
from backend.api.models.user import (
    UserUpdate,
    UserResponse,
    UserProfile,
    UserProfileResponse,
)
from backend.api.services.user_service import UserService

logger = structlog.get_logger(__name__)
router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def get_current_user(user_id: str = Depends(verify_token)) -> Dict[str, Any]:
    """Get current user profile."""
    try:
        service = UserService()
        user = await service.get_user_profile(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error getting user profile: {e}")
        raise HTTPException(status_code=500, detail="Failed to get user profile")


@router.put("/me", response_model=UserResponse)
async def update_current_user(
    data: UserUpdate, user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """Update current user profile."""
    try:
        service = UserService()
        user = await service.update_user_profile(user_id, data)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error updating user profile: {e}")
        raise HTTPException(status_code=500, detail="Failed to update user profile")


@router.delete("/me")
async def delete_current_user(user_id: str = Depends(verify_token)) -> Dict[str, Any]:
    """Delete current user account."""
    try:
        service = UserService()
        success = await service.delete_user(user_id)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to delete user account")
        return {"message": "User account deleted successfully"}
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error deleting user: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete user account")


@router.get("/profile", response_model=UserProfileResponse)
async def get_user_profile(user_id: str = Depends(verify_token)):
    """Get user profile"""
    try:
        service = UserService()
        profile = await service.get_user_profile(user_id)
        if not profile:
            # Create default profile
            profile = UserProfile()

        return profile
    except Exception as e:
        logger.error(f"Error getting user profile: {e}")
        raise HTTPException(status_code=500, detail="Failed to get user profile")


@router.put("/profile", response_model=UserProfileResponse)
async def update_user_profile(
    profile_data: UserProfile, user_id: str = Depends(verify_token)
):
    """Update user profile"""
    try:
        service = UserService()
        profile = await service.update_user_profile(user_id, profile_data)
        if not profile:
            raise HTTPException(status_code=404, detail="User profile not found")
        return profile
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error updating user profile: {e}")
        raise HTTPException(status_code=500, detail="Failed to update user profile")


@router.get("/conversations")
async def get_user_conversations(
    limit: int = 10, offset: int = 0, user_id: str = Depends(verify_token)
):
    """Get user's conversations"""
    try:
        result = (
            supabase.table("conversations")
            .select("id, title, status, created_at, updated_at")
            .eq("user_id", user_id)
            .order("updated_at", desc=True)
            .range(offset, offset + limit - 1)
            .execute()
        )

        return {
            "conversations": result.data,
            "total": len(result.data),
            "limit": limit,
            "offset": offset,
        }
    except Exception as e:
        logger.error(f"Error getting user conversations: {e}")
        raise HTTPException(status_code=500, detail="Failed to get user conversations")
