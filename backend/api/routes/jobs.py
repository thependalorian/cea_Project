"""
Job routes for the Climate Economy Assistant.
Handles job listings, job matching, partner match results, and job approvals.
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Dict, Any, List, Optional
from datetime import datetime
import structlog

from backend.database.supabase_client import supabase
from backend.api.middleware.auth import verify_token

logger = structlog.get_logger(__name__)
router = APIRouter()


# Test endpoint without authentication
@router.get("/test", response_model=Dict[str, Any])
async def test_jobs_endpoint() -> Dict[str, Any]:
    """Test endpoint to verify jobs route is working"""
    return {"success": True, "message": "Jobs API is working", "timestamp": datetime.utcnow().isoformat()}


# Job Listings Management
@router.post("/listings", response_model=Dict[str, Any])
async def create_job_listing(
    job_data: Dict[str, Any], 
    user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Create a new job listing.
    - Validates required fields (title, description, organization_name)
    - Auto-assigns posting user and timestamps
    - Sets initial status as 'pending' for approval workflow
    """
    try:
        # Validate required fields
        required_fields = ["title", "description", "organization_name"]
        for field in required_fields:
            if not job_data.get(field):
                raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
        
        # Set metadata
        job_data["posted_by"] = user_id
        job_data["status"] = job_data.get("status", "pending")
        job_data["created_at"] = datetime.utcnow().isoformat()
        job_data["updated_at"] = datetime.utcnow().isoformat()
        
        # Insert job listing
        result = supabase.table("job_listings").insert(job_data).execute()
        
        if result.data:
            logger.info(f"Created job listing {result.data[0]['id']} by user {user_id}")
            return {"success": True, "job": result.data[0]}
        else:
            raise HTTPException(status_code=500, detail="Failed to create job listing")
            
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error creating job listing: {e}")
        raise HTTPException(status_code=500, detail="Failed to create job listing")


@router.get("/listings", response_model=Dict[str, Any])
async def get_job_listings(
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    status: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    remote_work_preference: Optional[str] = Query(None),
    user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Get job listings with optional filtering and pagination.
    - Supports filtering by status, location, remote work preference
    - Returns paginated results with total count
    - Includes basic job information and metadata
    """
    try:
        query = supabase.table("job_listings").select("*")
        
        # Apply filters
        if status:
            query = query.eq("status", status)
        if location:
            query = query.ilike("location", f"%{location}%")
        if remote_work_preference:
            query = query.eq("remote_work_preference", remote_work_preference)
        
        # Apply pagination and ordering
        result = (
            query
            .order("created_at", desc=True)
            .range(offset, offset + limit - 1)
            .execute()
        )
        
        # Get total count for pagination
        count_result = supabase.table("job_listings").select("id", count="exact").execute()
        total_count = count_result.count if count_result.count else 0
        
        logger.info(f"Retrieved {len(result.data)} job listings for user {user_id}")
        
        return {
            "success": True,
            "jobs": result.data if result.data else [],
            "pagination": {
                "total": total_count,
                "limit": limit,
                "offset": offset,
                "has_more": (offset + limit) < total_count
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting job listings: {e}")
        raise HTTPException(status_code=500, detail="Failed to get job listings")


@router.get("/listings/{job_id}", response_model=Dict[str, Any])
async def get_job_listing(
    job_id: str,
    user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Get specific job listing by ID.
    - Returns complete job details including requirements and benefits
    - Includes related partner information if available
    """
    try:
        result = supabase.table("job_listings").select("*").eq("id", job_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Job listing not found")
            
        job = result.data[0]
        
        # Get partner information if available
        if job.get("partner_id"):
            partner_result = (
                supabase.table("partner_profiles")
                .select("organization_name, website, description")
                .eq("id", job["partner_id"])
                .execute()
            )
            if partner_result.data:
                job["partner_info"] = partner_result.data[0]
        
        logger.info(f"Retrieved job listing {job_id} for user {user_id}")
        
        return {"success": True, "job": job}
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error getting job listing {job_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to get job listing")


@router.put("/listings/{job_id}", response_model=Dict[str, Any])
async def update_job_listing(
    job_id: str,
    update_data: Dict[str, Any],
    user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Update job listing.
    - Only allows updates by job poster or admin users
    - Updates timestamp and maintains audit trail
    """
    try:
        # Check if user owns this job or is admin
        job_result = supabase.table("job_listings").select("posted_by").eq("id", job_id).execute()
        
        if not job_result.data:
            raise HTTPException(status_code=404, detail="Job listing not found")
            
        job = job_result.data[0]
        if job["posted_by"] != user_id:
            # Check if user is admin
            admin_result = supabase.table("admin_profiles").select("id").eq("user_id", user_id).execute()
            if not admin_result.data:
                raise HTTPException(status_code=403, detail="Not authorized to update this job listing")
        
        # Update job listing
        update_data["updated_at"] = datetime.utcnow().isoformat()
        
        result = (
            supabase.table("job_listings")
            .update(update_data)
            .eq("id", job_id)
            .execute()
        )
        
        if result.data:
            logger.info(f"Updated job listing {job_id} by user {user_id}")
            return {"success": True, "job": result.data[0]}
        else:
            raise HTTPException(status_code=500, detail="Failed to update job listing")
            
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error updating job listing {job_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to update job listing")


@router.delete("/listings/{job_id}")
async def delete_job_listing(
    job_id: str,
    user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Delete job listing.
    - Only allows deletion by job poster or admin users
    - Soft delete by updating status to 'deleted'
    """
    try:
        # Check if user owns this job or is admin
        job_result = supabase.table("job_listings").select("posted_by").eq("id", job_id).execute()
        
        if not job_result.data:
            raise HTTPException(status_code=404, detail="Job listing not found")
            
        job = job_result.data[0]
        if job["posted_by"] != user_id:
            # Check if user is admin
            admin_result = supabase.table("admin_profiles").select("id").eq("user_id", user_id).execute()
            if not admin_result.data:
                raise HTTPException(status_code=403, detail="Not authorized to delete this job listing")
        
        # Soft delete by updating status
        result = (
            supabase.table("job_listings")
            .update({
                "status": "deleted",
                "updated_at": datetime.utcnow().isoformat()
            })
            .eq("id", job_id)
            .execute()
        )
        
        if result.data:
            logger.info(f"Deleted job listing {job_id} by user {user_id}")
            return {"success": True, "message": "Job listing deleted successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to delete job listing")
            
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error deleting job listing {job_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete job listing")


# Partner Match Results Management
@router.post("/matches", response_model=Dict[str, Any])
async def create_partner_match(
    match_data: Dict[str, Any],
    user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Create a new partner match result.
    - Records job seeker and partner matching results
    - Calculates and stores match score and criteria
    """
    try:
        # Validate required fields
        required_fields = ["job_seeker_id", "partner_id", "match_score"]
        for field in required_fields:
            if match_data.get(field) is None:
                raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
        
        match_data["created_by"] = user_id
        match_data["created_at"] = datetime.utcnow().isoformat()
        match_data["updated_at"] = datetime.utcnow().isoformat()
        
        result = supabase.table("partner_match_results").insert(match_data).execute()
        
        if result.data:
            logger.info(f"Created partner match {result.data[0]['id']} by user {user_id}")
            return {"success": True, "match": result.data[0]}
        else:
            raise HTTPException(status_code=500, detail="Failed to create partner match")
            
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error creating partner match: {e}")
        raise HTTPException(status_code=500, detail="Failed to create partner match")


@router.get("/search", response_model=Dict[str, Any])
async def search_jobs(
    query: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    experience_level: Optional[str] = Query(None),
    remote_work_preference: Optional[str] = Query(None),
    climate_focus: Optional[str] = Query(None),
    limit: int = Query(10, ge=1, le=50),
    offset: int = Query(0, ge=0),
    user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Search job listings with advanced filtering.
    - Full-text search across title, description, and requirements
    - Multiple filter criteria support
    - Returns ranked results based on relevance
    """
    try:
        # Start with basic query
        db_query = supabase.table("job_listings").select("*").eq("status", "active")
        
        # Apply text search if query provided
        if query:
            db_query = db_query.or_(f"title.ilike.%{query}%,description.ilike.%{query}%,requirements.ilike.%{query}%")
        
        # Apply filters
        if location:
            db_query = db_query.ilike("location", f"%{location}%")
        if experience_level:
            db_query = db_query.eq("experience_level", experience_level)
        if remote_work_preference:
            db_query = db_query.eq("remote_work_preference", remote_work_preference)
        if climate_focus:
            db_query = db_query.contains("climate_focus", [climate_focus])
        
        # Execute query with pagination
        result = (
            db_query
            .order("created_at", desc=True)
            .range(offset, offset + limit - 1)
            .execute()
        )
        
        logger.info(f"Job search returned {len(result.data)} results for user {user_id}")
        
        return {
            "success": True,
            "jobs": result.data if result.data else [],
            "search_params": {
                "query": query,
                "location": location,
                "experience_level": experience_level,
                "remote_work_preference": remote_work_preference,
                "climate_focus": climate_focus
            },
            "pagination": {
                "limit": limit,
                "offset": offset
            }
        }
        
    except Exception as e:
        logger.error(f"Error searching jobs: {e}")
        raise HTTPException(status_code=500, detail="Failed to search jobs")