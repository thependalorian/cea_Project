"""
Resources routes for the Climate Economy Assistant.
Handles knowledge resources, resource views, and content flags.
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import structlog

from backend.database.supabase_client import supabase
from backend.api.middleware.auth import verify_token

logger = structlog.get_logger(__name__)
router = APIRouter()


# Knowledge Resources Management
@router.post("/knowledge", response_model=Dict[str, Any])
async def create_knowledge_resource(
    resource_data: Dict[str, Any],
    user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Create a new knowledge resource.
    - Validates resource content and metadata
    - Sets up resource categorization and tagging
    - Associates resource with creating user for tracking
    """
    try:
        # Validate required fields
        required_fields = ["title", "content_type", "description"]
        for field in required_fields:
            if not resource_data.get(field):
                raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
        
        # Set metadata
        resource_data["created_by"] = user_id
        resource_data["status"] = resource_data.get("status", "draft")
        resource_data["visibility"] = resource_data.get("visibility", "private")
        resource_data["view_count"] = 0
        resource_data["created_at"] = datetime.utcnow().isoformat()
        resource_data["updated_at"] = datetime.utcnow().isoformat()
        
        # Insert knowledge resource
        result = supabase.table("knowledge_resources").insert(resource_data).execute()
        
        if result.data:
            logger.info(f"Created knowledge resource {result.data[0]['id']} by user {user_id}")
            return {"success": True, "resource": result.data[0]}
        else:
            raise HTTPException(status_code=500, detail="Failed to create knowledge resource")
            
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error creating knowledge resource: {e}")
        raise HTTPException(status_code=500, detail="Failed to create knowledge resource")


@router.get("/knowledge", response_model=Dict[str, Any])
async def get_knowledge_resources(
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    content_type: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    tags: Optional[str] = Query(None),
    status: Optional[str] = Query("published"),
    visibility: Optional[str] = Query("public"),
    search: Optional[str] = Query(None),
    user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Get knowledge resources with filtering and pagination.
    - Supports filtering by content type, category, tags, status, visibility
    - Includes full-text search across title and description
    - Returns resources accessible to current user
    """
    try:
        query = supabase.table("knowledge_resources").select("*")
        
        # Apply visibility filters based on user permissions
        admin_result = supabase.table("admin_profiles").select("id").eq("user_id", user_id).execute()
        is_admin = bool(admin_result.data)
        
        if not is_admin:
            # Non-admin users see only public resources or their own
            query = query.or_(f"visibility.eq.public,created_by.eq.{user_id}")
        
        # Apply content filters
        if content_type:
            query = query.eq("content_type", content_type)
        if category:
            query = query.eq("category", category)
        if tags:
            tag_list = [tag.strip() for tag in tags.split(",")]
            query = query.contains("tags", tag_list)
        if status:
            query = query.eq("status", status)
        if visibility and is_admin:  # Only admins can filter by visibility
            query = query.eq("visibility", visibility)
        
        # Apply search filter
        if search:
            query = query.or_(f"title.ilike.%{search}%,description.ilike.%{search}%,content.ilike.%{search}%")
        
        # Apply pagination and ordering
        result = (
            query
            .order("created_at", desc=True)
            .range(offset, offset + limit - 1)
            .execute()
        )
        
        logger.info(f"Retrieved {len(result.data)} knowledge resources for user {user_id}")
        
        return {
            "success": True,
            "resources": result.data if result.data else [],
            "pagination": {
                "limit": limit,
                "offset": offset
            },
            "filters_applied": {
                "content_type": content_type,
                "category": category,
                "tags": tags,
                "status": status,
                "search": search
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting knowledge resources: {e}")
        raise HTTPException(status_code=500, detail="Failed to get knowledge resources")


@router.get("/knowledge/{resource_id}", response_model=Dict[str, Any])
async def get_knowledge_resource(
    resource_id: str,
    user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Get specific knowledge resource by ID.
    - Returns complete resource content and metadata
    - Increments view count for analytics
    - Checks user permissions for access
    """
    try:
        result = supabase.table("knowledge_resources").select("*").eq("id", resource_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Knowledge resource not found")
            
        resource = result.data[0]
        
        # Check if user has permission to view this resource
        admin_result = supabase.table("admin_profiles").select("id").eq("user_id", user_id).execute()
        is_admin = bool(admin_result.data)
        is_owner = resource["created_by"] == user_id
        is_public = resource["visibility"] == "public"
        
        if not (is_admin or is_owner or is_public):
            raise HTTPException(status_code=403, detail="Not authorized to view this resource")
        
        # Increment view count
        new_view_count = resource.get("view_count", 0) + 1
        supabase.table("knowledge_resources").update({"view_count": new_view_count}).eq("id", resource_id).execute()
        resource["view_count"] = new_view_count
        
        # Record resource view for analytics
        view_data = {
            "resource_id": resource_id,
            "user_id": user_id,
            "viewed_at": datetime.utcnow().isoformat(),
            "access_method": "direct"
        }
        supabase.table("resource_views").insert(view_data).execute()
        
        logger.info(f"Retrieved knowledge resource {resource_id} for user {user_id}")
        
        return {"success": True, "resource": resource}
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error getting knowledge resource {resource_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to get knowledge resource")


@router.put("/knowledge/{resource_id}", response_model=Dict[str, Any])
async def update_knowledge_resource(
    resource_id: str,
    update_data: Dict[str, Any],
    user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Update knowledge resource.
    - Only allows updates by resource owner or admin
    - Updates content, metadata, and status
    - Maintains version history and audit trail
    """
    try:
        # Check if user owns this resource or is admin
        resource_result = supabase.table("knowledge_resources").select("created_by").eq("id", resource_id).execute()
        
        if not resource_result.data:
            raise HTTPException(status_code=404, detail="Knowledge resource not found")
            
        resource = resource_result.data[0]
        admin_result = supabase.table("admin_profiles").select("id").eq("user_id", user_id).execute()
        is_admin = bool(admin_result.data)
        is_owner = resource["created_by"] == user_id
        
        if not (is_admin or is_owner):
            raise HTTPException(status_code=403, detail="Not authorized to update this resource")
        
        # Set update metadata
        update_data["updated_at"] = datetime.utcnow().isoformat()
        update_data["last_modified_by"] = user_id
        
        # Update knowledge resource
        result = (
            supabase.table("knowledge_resources")
            .update(update_data)
            .eq("id", resource_id)
            .execute()
        )
        
        if result.data:
            logger.info(f"Updated knowledge resource {resource_id} by user {user_id}")
            return {"success": True, "resource": result.data[0]}
        else:
            raise HTTPException(status_code=500, detail="Failed to update knowledge resource")
            
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error updating knowledge resource {resource_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to update knowledge resource")


@router.delete("/knowledge/{resource_id}")
async def delete_knowledge_resource(
    resource_id: str,
    user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Delete knowledge resource.
    - Only allows deletion by resource owner or admin
    - Soft delete by updating status to 'deleted'
    - Maintains resource history for audit purposes
    """
    try:
        # Check if user owns this resource or is admin
        resource_result = supabase.table("knowledge_resources").select("created_by").eq("id", resource_id).execute()
        
        if not resource_result.data:
            raise HTTPException(status_code=404, detail="Knowledge resource not found")
            
        resource = resource_result.data[0]
        admin_result = supabase.table("admin_profiles").select("id").eq("user_id", user_id).execute()
        is_admin = bool(admin_result.data)
        is_owner = resource["created_by"] == user_id
        
        if not (is_admin or is_owner):
            raise HTTPException(status_code=403, detail="Not authorized to delete this resource")
        
        # Soft delete by updating status
        result = (
            supabase.table("knowledge_resources")
            .update({
                "status": "deleted",
                "updated_at": datetime.utcnow().isoformat(),
                "last_modified_by": user_id
            })
            .eq("id", resource_id)
            .execute()
        )
        
        if result.data:
            logger.info(f"Deleted knowledge resource {resource_id} by user {user_id}")
            return {"success": True, "message": "Knowledge resource deleted successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to delete knowledge resource")
            
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error deleting knowledge resource {resource_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete knowledge resource")


# Resource Views Analytics
@router.get("/analytics/views", response_model=Dict[str, Any])
async def get_resource_views_analytics(
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    resource_id: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Get resource views analytics.
    - Admin access shows all views, users see views of their own resources
    - Supports filtering by resource and date range
    - Returns detailed view statistics and trends
    """
    try:
        # Check user permissions
        admin_result = supabase.table("admin_profiles").select("id, can_view_analytics").eq("user_id", user_id).execute()
        is_admin = admin_result.data and admin_result.data[0].get("can_view_analytics")
        
        query = supabase.table("resource_views").select("*")
        
        # Restrict to user's own resources if not admin
        if not is_admin:
            # Get user's resource IDs
            user_resources = (
                supabase.table("knowledge_resources")
                .select("id")
                .eq("created_by", user_id)
                .execute()
            )
            
            if user_resources.data:
                resource_ids = [r["id"] for r in user_resources.data]
                query = query.in_("resource_id", resource_ids)
            else:
                # User has no resources, return empty result
                return {
                    "success": True,
                    "views": [],
                    "pagination": {"limit": limit, "offset": offset}
                }
        
        # Apply filters
        if resource_id:
            query = query.eq("resource_id", resource_id)
        if date_from:
            query = query.gte("viewed_at", date_from)
        if date_to:
            query = query.lte("viewed_at", date_to)
        
        # Apply pagination and ordering
        result = (
            query
            .order("viewed_at", desc=True)
            .range(offset, offset + limit - 1)
            .execute()
        )
        
        logger.info(f"Retrieved {len(result.data)} resource views for user {user_id}")
        
        return {
            "success": True,
            "views": result.data if result.data else [],
            "pagination": {
                "limit": limit,
                "offset": offset
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting resource views analytics: {e}")
        raise HTTPException(status_code=500, detail="Failed to get resource views analytics")


@router.get("/analytics/popular", response_model=Dict[str, Any])
async def get_popular_resources(
    limit: int = Query(10, ge=1, le=50),
    days: int = Query(30, ge=1, le=365),
    user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Get popular resources by view count.
    - Returns most viewed resources in specified time period
    - Includes view counts and trending information
    - Shows only public resources unless admin
    """
    try:
        # Calculate date range
        date_from = (datetime.utcnow() - timedelta(days=days)).isoformat()
        
        # Check user permissions
        admin_result = supabase.table("admin_profiles").select("id").eq("user_id", user_id).execute()
        is_admin = bool(admin_result.data)
        
        # Get view counts for resources in date range
        views_query = (
            supabase.table("resource_views")
            .select("resource_id")
            .gte("viewed_at", date_from)
            .execute()
        )
        
        if not views_query.data:
            return {
                "success": True,
                "popular_resources": [],
                "time_period": f"Last {days} days"
            }
        
        # Count views per resource
        view_counts = {}
        for view in views_query.data:
            resource_id = view["resource_id"]
            view_counts[resource_id] = view_counts.get(resource_id, 0) + 1
        
        # Get top resource IDs
        top_resources = sorted(view_counts.items(), key=lambda x: x[1], reverse=True)[:limit]
        top_resource_ids = [r[0] for r in top_resources]
        
        if not top_resource_ids:
            return {
                "success": True,
                "popular_resources": [],
                "time_period": f"Last {days} days"
            }
        
        # Get resource details
        resources_query = supabase.table("knowledge_resources").select("*").in_("id", top_resource_ids)
        
        # Apply visibility filter for non-admin users
        if not is_admin:
            resources_query = resources_query.eq("visibility", "public")
        
        resources_result = resources_query.execute()
        
        # Combine with view counts
        popular_resources = []
        for resource in resources_result.data if resources_result.data else []:
            resource["recent_views"] = view_counts.get(resource["id"], 0)
            popular_resources.append(resource)
        
        # Sort by recent views
        popular_resources.sort(key=lambda x: x["recent_views"], reverse=True)
        
        logger.info(f"Retrieved {len(popular_resources)} popular resources for user {user_id}")
        
        return {
            "success": True,
            "popular_resources": popular_resources,
            "time_period": f"Last {days} days"
        }
        
    except Exception as e:
        logger.error(f"Error getting popular resources: {e}")
        raise HTTPException(status_code=500, detail="Failed to get popular resources")


# Content Flags Management
@router.post("/flags", response_model=Dict[str, Any])
async def create_content_flag(
    flag_data: Dict[str, Any],
    user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Create content flag for inappropriate or problematic content.
    - Records user reports of content issues
    - Categorizes flag type and severity
    - Initiates moderation workflow
    """
    try:
        # Validate required fields
        required_fields = ["resource_id", "flag_type", "reason"]
        for field in required_fields:
            if not flag_data.get(field):
                raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
        
        # Check if resource exists
        resource_result = supabase.table("knowledge_resources").select("id").eq("id", flag_data["resource_id"]).execute()
        if not resource_result.data:
            raise HTTPException(status_code=404, detail="Resource not found")
        
        # Set metadata
        flag_data["flagged_by"] = user_id
        flag_data["status"] = "pending"
        flag_data["created_at"] = datetime.utcnow().isoformat()
        
        # Insert content flag
        result = supabase.table("content_flags").insert(flag_data).execute()
        
        if result.data:
            logger.info(f"Created content flag {result.data[0]['id']} for resource {flag_data['resource_id']} by user {user_id}")
            return {"success": True, "flag": result.data[0]}
        else:
            raise HTTPException(status_code=500, detail="Failed to create content flag")
            
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error creating content flag: {e}")
        raise HTTPException(status_code=500, detail="Failed to create content flag")


@router.get("/flags", response_model=Dict[str, Any])
async def get_content_flags(
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    status: Optional[str] = Query(None),
    flag_type: Optional[str] = Query(None),
    resource_id: Optional[str] = Query(None),
    user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Get content flags for moderation review.
    - Admin-only access to content flag management
    - Supports filtering by status, flag type, and resource
    - Returns detailed flag information for moderation decisions
    """
    try:
        # Check if user has permission to view content flags (admin only)
        admin_result = supabase.table("admin_profiles").select("id, can_manage_content").eq("user_id", user_id).execute()
        
        if not admin_result.data or not admin_result.data[0].get("can_manage_content"):
            raise HTTPException(status_code=403, detail="Not authorized to view content flags")
        
        query = supabase.table("content_flags").select("*")
        
        # Apply filters
        if status:
            query = query.eq("status", status)
        if flag_type:
            query = query.eq("flag_type", flag_type)
        if resource_id:
            query = query.eq("resource_id", resource_id)
        
        # Apply pagination and ordering
        result = (
            query
            .order("created_at", desc=True)
            .range(offset, offset + limit - 1)
            .execute()
        )
        
        logger.info(f"Retrieved {len(result.data)} content flags for user {user_id}")
        
        return {
            "success": True,
            "flags": result.data if result.data else [],
            "pagination": {
                "limit": limit,
                "offset": offset
            }
        }
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error getting content flags: {e}")
        raise HTTPException(status_code=500, detail="Failed to get content flags")


@router.put("/flags/{flag_id}", response_model=Dict[str, Any])
async def update_content_flag(
    flag_id: str,
    update_data: Dict[str, Any],
    user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Update content flag status and resolution.
    - Admin-only access for flag moderation
    - Updates flag status and moderation decisions
    - Records resolution actions and outcomes
    """
    try:
        # Check if user has permission to manage content flags (admin only)
        admin_result = supabase.table("admin_profiles").select("id, can_manage_content").eq("user_id", user_id).execute()
        
        if not admin_result.data or not admin_result.data[0].get("can_manage_content"):
            raise HTTPException(status_code=403, detail="Not authorized to manage content flags")
        
        # Check if flag exists
        flag_result = supabase.table("content_flags").select("id").eq("id", flag_id).execute()
        if not flag_result.data:
            raise HTTPException(status_code=404, detail="Content flag not found")
        
        # Set update metadata
        update_data["reviewed_by"] = user_id
        update_data["reviewed_at"] = datetime.utcnow().isoformat()
        
        # Update content flag
        result = (
            supabase.table("content_flags")
            .update(update_data)
            .eq("id", flag_id)
            .execute()
        )
        
        if result.data:
            logger.info(f"Updated content flag {flag_id} by user {user_id}")
            return {"success": True, "flag": result.data[0]}
        else:
            raise HTTPException(status_code=500, detail="Failed to update content flag")
            
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error updating content flag {flag_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to update content flag")


# Resource Categories and Tags
@router.get("/categories", response_model=Dict[str, Any])
async def get_resource_categories(
    user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Get available resource categories.
    - Returns list of categories used in knowledge resources
    - Includes category usage counts
    - Helps users navigate and filter resources
    """
    try:
        # Get distinct categories with counts
        result = (
            supabase.table("knowledge_resources")
            .select("category")
            .eq("status", "published")
            .eq("visibility", "public")
            .execute()
        )
        
        # Count occurrences of each category
        category_counts = {}
        for resource in result.data if result.data else []:
            category = resource.get("category")
            if category:
                category_counts[category] = category_counts.get(category, 0) + 1
        
        # Convert to list format
        categories = [
            {"name": category, "count": count}
            for category, count in sorted(category_counts.items())
        ]
        
        logger.info(f"Retrieved {len(categories)} resource categories for user {user_id}")
        
        return {
            "success": True,
            "categories": categories,
            "total_categories": len(categories)
        }
        
    except Exception as e:
        logger.error(f"Error getting resource categories: {e}")
        raise HTTPException(status_code=500, detail="Failed to get resource categories")


@router.get("/tags", response_model=Dict[str, Any])
async def get_resource_tags(
    limit: int = Query(50, ge=1, le=200),
    user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Get popular resource tags.
    - Returns most frequently used tags
    - Includes tag usage counts
    - Helps users discover related content
    """
    try:
        # Get all tags from published resources
        result = (
            supabase.table("knowledge_resources")
            .select("tags")
            .eq("status", "published")
            .eq("visibility", "public")
            .execute()
        )
        
        # Count occurrences of each tag
        tag_counts = {}
        for resource in result.data if result.data else []:
            tags = resource.get("tags", [])
            if isinstance(tags, list):
                for tag in tags:
                    if tag:
                        tag_counts[tag] = tag_counts.get(tag, 0) + 1
        
        # Sort by usage count and limit results
        popular_tags = sorted(tag_counts.items(), key=lambda x: x[1], reverse=True)[:limit]
        
        # Convert to list format
        tags = [
            {"name": tag, "count": count}
            for tag, count in popular_tags
        ]
        
        logger.info(f"Retrieved {len(tags)} popular tags for user {user_id}")
        
        return {
            "success": True,
            "tags": tags,
            "total_unique_tags": len(tag_counts)
        }
        
    except Exception as e:
        logger.error(f"Error getting resource tags: {e}")
        raise HTTPException(status_code=500, detail="Failed to get resource tags") 