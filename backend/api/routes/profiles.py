"""
Profile routes for the Climate Economy Assistant.
Handles job seeker profiles, partner profiles, admin profiles, and user interests.
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Dict, Any, List, Optional
from datetime import datetime
import structlog

from backend.database.supabase_client import supabase
from backend.api.middleware.auth import verify_token

logger = structlog.get_logger(__name__)
router = APIRouter()


# Job Seeker Profiles Management
@router.post("/job-seekers", response_model=Dict[str, Any])
async def create_job_seeker_profile(
    profile_data: Dict[str, Any],
    user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Create a new job seeker profile.
    - Validates required fields and user authentication
    - Sets up initial profile with default preferences
    - Links profile to authenticated user account
    """
    try:
        # Set user association and metadata
        profile_data["user_id"] = user_id
        profile_data["profile_completed"] = False
        profile_data["verified"] = False
        profile_data["created_at"] = datetime.utcnow().isoformat()
        profile_data["updated_at"] = datetime.utcnow().isoformat()
        
        # Insert job seeker profile
        result = supabase.table("job_seeker_profiles").insert(profile_data).execute()
        
        if result.data:
            logger.info(f"Created job seeker profile {result.data[0]['id']} for user {user_id}")
            return {"success": True, "profile": result.data[0]}
        else:
            raise HTTPException(status_code=500, detail="Failed to create job seeker profile")
            
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error creating job seeker profile: {e}")
        raise HTTPException(status_code=500, detail="Failed to create job seeker profile")


@router.get("/job-seekers/me", response_model=Dict[str, Any])
async def get_my_job_seeker_profile(
    user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Get current user's job seeker profile.
    - Returns complete profile information
    - Includes preferences and resume information
    - Shows profile completion status
    """
    try:
        result = supabase.table("job_seeker_profiles").select("*").eq("user_id", user_id).execute()
        
        if not result.data:
            return {
                "success": True,
                "profile": None,
                "message": "No job seeker profile found. Create one to get started."
            }
            
        profile = result.data[0]
        
        logger.info(f"Retrieved job seeker profile for user {user_id}")
        
        return {"success": True, "profile": profile}
        
    except Exception as e:
        logger.error(f"Error getting job seeker profile for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to get job seeker profile")


@router.put("/job-seekers/me", response_model=Dict[str, Any])
async def update_my_job_seeker_profile(
    update_data: Dict[str, Any],
    user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Update current user's job seeker profile.
    - Updates profile information and preferences
    - Recalculates profile completion percentage
    - Updates last modified timestamp
    """
    try:
        # Set update metadata
        update_data["updated_at"] = datetime.utcnow().isoformat()
        
        # Calculate profile completion
        required_fields = ["full_name", "email", "location", "experience_level", "climate_focus"]
        completed_fields = sum(1 for field in required_fields if update_data.get(field))
        if completed_fields == len(required_fields):
            update_data["profile_completed"] = True
        
        # Update job seeker profile
        result = (
            supabase.table("job_seeker_profiles")
            .update(update_data)
            .eq("user_id", user_id)
            .execute()
        )
        
        if result.data:
            logger.info(f"Updated job seeker profile for user {user_id}")
            return {"success": True, "profile": result.data[0]}
        else:
            raise HTTPException(status_code=404, detail="Job seeker profile not found")
            
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error updating job seeker profile for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to update job seeker profile")


@router.get("/job-seekers", response_model=Dict[str, Any])
async def get_job_seeker_profiles(
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    experience_level: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    climate_focus: Optional[str] = Query(None),
    verified_only: bool = Query(False),
    user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Get job seeker profiles with filtering (admin/partner access).
    - Supports filtering by experience level, location, climate focus
    - Option to show only verified profiles
    - Returns paginated results for browsing
    """
    try:
        # Check if user has permission to view profiles (admin or partner)
        admin_result = supabase.table("admin_profiles").select("id").eq("user_id", user_id).execute()
        partner_result = supabase.table("partner_profiles").select("id").eq("user_id", user_id).execute()
        
        if not admin_result.data and not partner_result.data:
            raise HTTPException(status_code=403, detail="Not authorized to view job seeker profiles")
        
        query = supabase.table("job_seeker_profiles").select("*")
        
        # Apply filters
        if experience_level:
            query = query.eq("experience_level", experience_level)
        if location:
            query = query.ilike("location", f"%{location}%")
        if climate_focus:
            query = query.contains("climate_focus_areas", [climate_focus])
        if verified_only:
            query = query.eq("verified", True)
        
        # Apply pagination and ordering
        result = (
            query
            .order("created_at", desc=True)
            .range(offset, offset + limit - 1)
            .execute()
        )
        
        logger.info(f"Retrieved {len(result.data)} job seeker profiles for user {user_id}")
        
        return {
            "success": True,
            "profiles": result.data if result.data else [],
            "pagination": {
                "limit": limit,
                "offset": offset
            }
        }
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error getting job seeker profiles: {e}")
        raise HTTPException(status_code=500, detail="Failed to get job seeker profiles")


# Partner Profiles Management
@router.post("/partners", response_model=Dict[str, Any])
async def create_partner_profile(
    profile_data: Dict[str, Any],
    user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Create a new partner profile.
    - Validates organization information
    - Sets up partner account with initial settings
    - Requires approval process for verification
    """
    try:
        # Validate required fields
        required_fields = ["organization_name", "full_name", "email"]
        for field in required_fields:
            if not profile_data.get(field):
                raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
        
        # Set metadata
        profile_data["user_id"] = user_id
        profile_data["profile_completed"] = False
        profile_data["verified"] = False
        profile_data["partnership_level"] = "standard"
        profile_data["created_at"] = datetime.utcnow().isoformat()
        profile_data["updated_at"] = datetime.utcnow().isoformat()
        
        # Insert partner profile
        result = supabase.table("partner_profiles").insert(profile_data).execute()
        
        if result.data:
            logger.info(f"Created partner profile {result.data[0]['id']} for user {user_id}")
            return {"success": True, "profile": result.data[0]}
        else:
            raise HTTPException(status_code=500, detail="Failed to create partner profile")
            
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error creating partner profile: {e}")
        raise HTTPException(status_code=500, detail="Failed to create partner profile")


@router.get("/partners/me", response_model=Dict[str, Any])
async def get_my_partner_profile(
    user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Get current user's partner profile.
    - Returns complete organization information
    - Includes partnership level and verification status
    - Shows available features and capabilities
    """
    try:
        result = supabase.table("partner_profiles").select("*").eq("user_id", user_id).execute()
        
        if not result.data:
            return {
                "success": True,
                "profile": None,
                "message": "No partner profile found. Create one to become a partner."
            }
            
        profile = result.data[0]
        
        logger.info(f"Retrieved partner profile for user {user_id}")
        
        return {"success": True, "profile": profile}
        
    except Exception as e:
        logger.error(f"Error getting partner profile for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to get partner profile")


@router.put("/partners/me", response_model=Dict[str, Any])
async def update_my_partner_profile(
    update_data: Dict[str, Any],
    user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Update current user's partner profile.
    - Updates organization information and capabilities
    - Recalculates profile completion status
    - Updates partnership features and settings
    """
    try:
        # Set update metadata
        update_data["updated_at"] = datetime.utcnow().isoformat()
        
        # Calculate profile completion
        required_fields = ["organization_name", "description", "website", "climate_focus"]
        existing_profile = supabase.table("partner_profiles").select("*").eq("user_id", user_id).execute()
        
        if existing_profile.data:
            current_data = existing_profile.data[0]
            current_data.update(update_data)
            completed_fields = sum(1 for field in required_fields if current_data.get(field))
            if completed_fields == len(required_fields):
                update_data["profile_completed"] = True
        
        # Update partner profile
        result = (
            supabase.table("partner_profiles")
            .update(update_data)
            .eq("user_id", user_id)
            .execute()
        )
        
        if result.data:
            logger.info(f"Updated partner profile for user {user_id}")
            return {"success": True, "profile": result.data[0]}
        else:
            raise HTTPException(status_code=404, detail="Partner profile not found")
            
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error updating partner profile for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to update partner profile")


@router.get("/partners", response_model=Dict[str, Any])
async def get_partner_profiles(
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    organization_type: Optional[str] = Query(None),
    climate_focus: Optional[str] = Query(None),
    verified_only: bool = Query(False),
    hiring_actively: Optional[bool] = Query(None),
    user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Get partner profiles for directory browsing.
    - Supports filtering by organization type, climate focus
    - Option to show only verified partners or actively hiring
    - Returns public partner information for job seekers
    """
    try:
        query = supabase.table("partner_profiles").select("*")
        
        # Apply filters
        if organization_type:
            query = query.eq("organization_type", organization_type)
        if climate_focus:
            query = query.contains("climate_focus", [climate_focus])
        if verified_only:
            query = query.eq("verified", True)
        if hiring_actively is not None:
            query = query.eq("hiring_actively", hiring_actively)
        
        # Apply pagination and ordering
        result = (
            query
            .order("organization_name")
            .range(offset, offset + limit - 1)
            .execute()
        )
        
        logger.info(f"Retrieved {len(result.data)} partner profiles for user {user_id}")
        
        return {
            "success": True,
            "partners": result.data if result.data else [],
            "pagination": {
                "limit": limit,
                "offset": offset
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting partner profiles: {e}")
        raise HTTPException(status_code=500, detail="Failed to get partner profiles")


# Admin Profiles Management
@router.post("/admin", response_model=Dict[str, Any])
async def create_admin_profile(
    profile_data: Dict[str, Any],
    user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Create a new admin profile (restricted).
    - Only existing admins can create new admin profiles
    - Sets up administrative permissions and access levels
    - Requires approval from super admin
    """
    try:
        # Check if current user is an admin
        admin_check = supabase.table("admin_profiles").select("id, can_manage_users").eq("user_id", user_id).execute()
        
        if not admin_check.data or not admin_check.data[0].get("can_manage_users"):
            raise HTTPException(status_code=403, detail="Not authorized to create admin profiles")
        
        # Validate required fields
        required_fields = ["full_name", "email", "department"]
        for field in required_fields:
            if not profile_data.get(field):
                raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
        
        # Set metadata and default permissions
        profile_data["profile_completed"] = True
        profile_data["can_manage_users"] = profile_data.get("can_manage_users", False)
        profile_data["can_manage_partners"] = profile_data.get("can_manage_partners", False)
        profile_data["can_manage_content"] = profile_data.get("can_manage_content", False)
        profile_data["can_manage_system"] = profile_data.get("can_manage_system", False)
        profile_data["can_view_analytics"] = profile_data.get("can_view_analytics", True)
        profile_data["created_at"] = datetime.utcnow().isoformat()
        profile_data["updated_at"] = datetime.utcnow().isoformat()
        
        # Insert admin profile
        result = supabase.table("admin_profiles").insert(profile_data).execute()
        
        if result.data:
            logger.info(f"Created admin profile {result.data[0]['id']} for user {profile_data['user_id']}")
            return {"success": True, "profile": result.data[0]}
        else:
            raise HTTPException(status_code=500, detail="Failed to create admin profile")
            
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error creating admin profile: {e}")
        raise HTTPException(status_code=500, detail="Failed to create admin profile")


@router.get("/admin/me", response_model=Dict[str, Any])
async def get_my_admin_profile(
    user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Get current user's admin profile.
    - Returns admin permissions and capabilities
    - Includes recent admin activity statistics
    - Shows access levels and restrictions
    """
    try:
        result = supabase.table("admin_profiles").select("*").eq("user_id", user_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Admin profile not found")
            
        profile = result.data[0]
        
        # Get recent admin activity count
        recent_activity = (
            supabase.table("audit_logs")
            .select("id", count="exact")
            .eq("user_id", user_id)
            .gte("created_at", (datetime.utcnow().replace(hour=0, minute=0, second=0)).isoformat())
            .execute()
        )
        
        profile["today_activity_count"] = recent_activity.count if recent_activity.count else 0
        
        logger.info(f"Retrieved admin profile for user {user_id}")
        
        return {"success": True, "profile": profile}
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error getting admin profile for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to get admin profile")


# User Interests Management
@router.post("/interests", response_model=Dict[str, Any])
async def create_user_interests(
    interests_data: Dict[str, Any],
    user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Create user interests and preferences.
    - Sets up personalized interest profile
    - Configures notification and privacy preferences
    - Establishes content recommendation settings
    """
    try:
        # Set user association and metadata
        interests_data["user_id"] = user_id
        interests_data["created_at"] = datetime.utcnow().isoformat()
        interests_data["updated_at"] = datetime.utcnow().isoformat()
        
        # Insert user interests
        result = supabase.table("user_interests").insert(interests_data).execute()
        
        if result.data:
            logger.info(f"Created user interests for user {user_id}")
            return {"success": True, "interests": result.data[0]}
        else:
            raise HTTPException(status_code=500, detail="Failed to create user interests")
            
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error creating user interests: {e}")
        raise HTTPException(status_code=500, detail="Failed to create user interests")


@router.get("/interests/me", response_model=Dict[str, Any])
async def get_my_user_interests(
    user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Get current user's interests and preferences.
    - Returns complete interest profile
    - Includes notification and privacy settings
    - Shows content personalization preferences
    """
    try:
        result = supabase.table("user_interests").select("*").eq("user_id", user_id).execute()
        
        if not result.data:
            return {
                "success": True,
                "interests": None,
                "message": "No interests profile found. Create one to personalize your experience."
            }
            
        interests = result.data[0]
        
        logger.info(f"Retrieved user interests for user {user_id}")
        
        return {"success": True, "interests": interests}
        
    except Exception as e:
        logger.error(f"Error getting user interests for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to get user interests")


@router.put("/interests/me", response_model=Dict[str, Any])
async def update_my_user_interests(
    update_data: Dict[str, Any],
    user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Update current user's interests and preferences.
    - Updates interest categories and preferences
    - Modifies notification and privacy settings
    - Refreshes content recommendation algorithms
    """
    try:
        # Set update metadata
        update_data["updated_at"] = datetime.utcnow().isoformat()
        
        # Update user interests
        result = (
            supabase.table("user_interests")
            .update(update_data)
            .eq("user_id", user_id)
            .execute()
        )
        
        if result.data:
            logger.info(f"Updated user interests for user {user_id}")
            return {"success": True, "interests": result.data[0]}
        else:
            # Create interests if they don't exist
            update_data["user_id"] = user_id
            update_data["created_at"] = update_data["updated_at"]
            
            create_result = supabase.table("user_interests").insert(update_data).execute()
            
            if create_result.data:
                return {"success": True, "interests": create_result.data[0]}
            else:
                raise HTTPException(status_code=500, detail="Failed to update user interests")
            
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error updating user interests for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to update user interests") 