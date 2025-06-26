"""
Resume Chunks routes for the Climate Economy Assistant.
Handles resume processing, chunking, analysis, and optimization.
"""

from fastapi import APIRouter, HTTPException, Depends, Query, UploadFile, File
from typing import Dict, Any, List, Optional
from datetime import datetime
import structlog

from backend.database.supabase_client import supabase
from backend.api.middleware.auth import verify_token

logger = structlog.get_logger(__name__)
router = APIRouter()


# Resume Chunks Management
@router.post("/process", response_model=Dict[str, Any])
async def process_resume_chunks(
    chunk_data: Dict[str, Any],
    user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Process resume into chunks for analysis.
    - Breaks down resume into semantic chunks
    - Extracts skills, experience, and key information
    - Stores chunks for further analysis and optimization
    """
    try:
        # Validate required fields
        required_fields = ["resume_id", "chunk_content", "chunk_type"]
        for field in required_fields:
            if not chunk_data.get(field):
                raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
        
        # Verify resume belongs to user
        resume_result = supabase.table("resumes").select("user_id").eq("id", chunk_data["resume_id"]).execute()
        if not resume_result.data or resume_result.data[0]["user_id"] != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to process this resume")
        
        # Set metadata
        chunk_data["user_id"] = user_id
        chunk_data["processed_at"] = datetime.utcnow().isoformat()
        chunk_data["created_at"] = datetime.utcnow().isoformat()
        chunk_data["updated_at"] = datetime.utcnow().isoformat()
        
        # Insert resume chunk
        result = supabase.table("resume_chunks").insert(chunk_data).execute()
        
        if result.data:
            logger.info(f"Created resume chunk {result.data[0]['id']} for resume {chunk_data['resume_id']} by user {user_id}")
            return {"success": True, "chunk": result.data[0]}
        else:
            raise HTTPException(status_code=500, detail="Failed to process resume chunk")
            
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error processing resume chunk: {e}")
        raise HTTPException(status_code=500, detail="Failed to process resume chunk")


@router.get("/resume/{resume_id}", response_model=Dict[str, Any])
async def get_resume_chunks(
    resume_id: str,
    chunk_type: Optional[str] = Query(None),
    user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Get resume chunks for a specific resume.
    - Returns all chunks for the specified resume
    - Supports filtering by chunk type
    - Only accessible by resume owner
    """
    try:
        # Verify resume belongs to user
        resume_result = supabase.table("resumes").select("user_id").eq("id", resume_id).execute()
        if not resume_result.data or resume_result.data[0]["user_id"] != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to access this resume")
        
        query = supabase.table("resume_chunks").select("*").eq("resume_id", resume_id)
        
        # Apply chunk type filter if provided
        if chunk_type:
            query = query.eq("chunk_type", chunk_type)
        
        # Order by chunk order or creation time
        result = query.order("chunk_order", nulls_last=True).order("created_at").execute()
        
        logger.info(f"Retrieved {len(result.data)} resume chunks for resume {resume_id} by user {user_id}")
        
        return {
            "success": True,
            "chunks": result.data if result.data else [],
            "resume_id": resume_id,
            "total_chunks": len(result.data) if result.data else 0
        }
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error getting resume chunks for resume {resume_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to get resume chunks")


@router.get("/chunk/{chunk_id}", response_model=Dict[str, Any])
async def get_resume_chunk(
    chunk_id: str,
    user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Get specific resume chunk by ID.
    - Returns detailed chunk information
    - Includes analysis results and recommendations
    - Only accessible by chunk owner
    """
    try:
        result = supabase.table("resume_chunks").select("*").eq("id", chunk_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Resume chunk not found")
            
        chunk = result.data[0]
        
        # Verify chunk belongs to user
        if chunk["user_id"] != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to access this chunk")
        
        logger.info(f"Retrieved resume chunk {chunk_id} for user {user_id}")
        
        return {"success": True, "chunk": chunk}
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error getting resume chunk {chunk_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to get resume chunk")


@router.put("/chunk/{chunk_id}", response_model=Dict[str, Any])
async def update_resume_chunk(
    chunk_id: str,
    update_data: Dict[str, Any],
    user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Update resume chunk content or analysis.
    - Allows modification of chunk content and metadata
    - Updates analysis results and optimization suggestions
    - Only accessible by chunk owner
    """
    try:
        # Verify chunk belongs to user
        chunk_result = supabase.table("resume_chunks").select("user_id").eq("id", chunk_id).execute()
        
        if not chunk_result.data:
            raise HTTPException(status_code=404, detail="Resume chunk not found")
            
        if chunk_result.data[0]["user_id"] != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to update this chunk")
        
        # Set update metadata
        update_data["updated_at"] = datetime.utcnow().isoformat()
        
        # Update resume chunk
        result = (
            supabase.table("resume_chunks")
            .update(update_data)
            .eq("id", chunk_id)
            .execute()
        )
        
        if result.data:
            logger.info(f"Updated resume chunk {chunk_id} by user {user_id}")
            return {"success": True, "chunk": result.data[0]}
        else:
            raise HTTPException(status_code=500, detail="Failed to update resume chunk")
            
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error updating resume chunk {chunk_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to update resume chunk")


@router.delete("/chunk/{chunk_id}")
async def delete_resume_chunk(
    chunk_id: str,
    user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Delete resume chunk.
    - Removes chunk from resume analysis
    - Only accessible by chunk owner
    - Used for cleanup or re-processing scenarios
    """
    try:
        # Verify chunk belongs to user
        chunk_result = supabase.table("resume_chunks").select("user_id").eq("id", chunk_id).execute()
        
        if not chunk_result.data:
            raise HTTPException(status_code=404, detail="Resume chunk not found")
            
        if chunk_result.data[0]["user_id"] != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to delete this chunk")
        
        # Delete resume chunk
        result = supabase.table("resume_chunks").delete().eq("id", chunk_id).execute()
        
        if result.data:
            logger.info(f"Deleted resume chunk {chunk_id} by user {user_id}")
            return {"success": True, "message": "Resume chunk deleted successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to delete resume chunk")
            
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error deleting resume chunk {chunk_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete resume chunk")


# Resume Analysis and Optimization
@router.post("/analyze/{resume_id}", response_model=Dict[str, Any])
async def analyze_resume_chunks(
    resume_id: str,
    analysis_params: Dict[str, Any],
    user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Analyze resume chunks for optimization opportunities.
    - Evaluates content quality and relevance
    - Identifies improvement opportunities
    - Provides tailored recommendations
    """
    try:
        # Verify resume belongs to user
        resume_result = supabase.table("resumes").select("user_id").eq("id", resume_id).execute()
        if not resume_result.data or resume_result.data[0]["user_id"] != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to analyze this resume")
        
        # Get all chunks for the resume
        chunks_result = (
            supabase.table("resume_chunks")
            .select("*")
            .eq("resume_id", resume_id)
            .order("chunk_order", nulls_last=True)
            .execute()
        )
        
        if not chunks_result.data:
            raise HTTPException(status_code=404, detail="No resume chunks found for analysis")
        
        chunks = chunks_result.data
        
        # Perform analysis (simplified example)
        analysis_results = {
            "resume_id": resume_id,
            "total_chunks": len(chunks),
            "chunk_types": list(set(chunk.get("chunk_type") for chunk in chunks if chunk.get("chunk_type"))),
            "analysis_date": datetime.utcnow().isoformat(),
            "recommendations": [],
            "score_breakdown": {
                "content_quality": 0,
                "climate_relevance": 0,
                "skill_alignment": 0,
                "overall_score": 0
            }
        }
        
        # Basic content analysis
        for chunk in chunks:
            content = chunk.get("chunk_content", "")
            chunk_type = chunk.get("chunk_type", "")
            
            # Example scoring logic (would be replaced with actual ML/AI analysis)
            if len(content) > 50:
                analysis_results["score_breakdown"]["content_quality"] += 10
            
            climate_keywords = ["climate", "environment", "sustainability", "renewable", "green", "carbon"]
            if any(keyword in content.lower() for keyword in climate_keywords):
                analysis_results["score_breakdown"]["climate_relevance"] += 15
            
            if chunk_type in ["skills", "experience"]:
                analysis_results["score_breakdown"]["skill_alignment"] += 10
        
        # Calculate overall score
        total_possible = len(chunks) * 35  # Max points per chunk
        actual_score = sum(analysis_results["score_breakdown"].values())
        analysis_results["score_breakdown"]["overall_score"] = (actual_score / total_possible * 100) if total_possible > 0 else 0
        
        # Generate recommendations based on analysis
        if analysis_results["score_breakdown"]["climate_relevance"] < 30:
            analysis_results["recommendations"].append({
                "type": "climate_focus",
                "priority": "high",
                "description": "Consider highlighting more climate-related experience and skills",
                "action": "Add climate keywords and quantify environmental impact of your work"
            })
        
        if analysis_results["score_breakdown"]["content_quality"] < 50:
            analysis_results["recommendations"].append({
                "type": "content_improvement",
                "priority": "medium",
                "description": "Some sections could be expanded with more detail",
                "action": "Provide specific examples and quantifiable achievements"
            })
        
        logger.info(f"Analyzed resume {resume_id} with {len(chunks)} chunks for user {user_id}")
        
        return {"success": True, "analysis": analysis_results}
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error analyzing resume chunks for resume {resume_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to analyze resume chunks")


@router.post("/optimize/{resume_id}", response_model=Dict[str, Any])
async def optimize_resume_chunks(
    resume_id: str,
    optimization_params: Dict[str, Any],
    user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Optimize resume chunks for climate economy roles.
    - Suggests improvements for specific chunks
    - Provides climate-focused optimization recommendations
    - Tailors content for target roles and industries
    """
    try:
        # Verify resume belongs to user
        resume_result = supabase.table("resumes").select("user_id").eq("id", resume_id).execute()
        if not resume_result.data or resume_result.data[0]["user_id"] != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to optimize this resume")
        
        # Get target role and preferences from optimization params
        target_role = optimization_params.get("target_role", "climate professional")
        focus_areas = optimization_params.get("focus_areas", ["sustainability", "renewable energy"])
        experience_level = optimization_params.get("experience_level", "mid-level")
        
        # Get all chunks for the resume
        chunks_result = (
            supabase.table("resume_chunks")
            .select("*")
            .eq("resume_id", resume_id)
            .order("chunk_order", nulls_last=True)
            .execute()
        )
        
        if not chunks_result.data:
            raise HTTPException(status_code=404, detail="No resume chunks found for optimization")
        
        chunks = chunks_result.data
        
        # Generate optimization suggestions for each chunk
        optimization_results = {
            "resume_id": resume_id,
            "target_role": target_role,
            "focus_areas": focus_areas,
            "optimization_date": datetime.utcnow().isoformat(),
            "chunk_optimizations": []
        }
        
        for chunk in chunks:
            chunk_optimization = {
                "chunk_id": chunk["id"],
                "chunk_type": chunk.get("chunk_type"),
                "current_content": chunk.get("chunk_content", ""),
                "suggestions": [],
                "priority": "medium"
            }
            
            # Generate suggestions based on chunk type
            chunk_type = chunk.get("chunk_type", "")
            content = chunk.get("chunk_content", "").lower()
            
            if chunk_type == "summary":
                if "climate" not in content and "environment" not in content:
                    chunk_optimization["suggestions"].append({
                        "type": "keyword_addition",
                        "description": "Add climate-related keywords to your professional summary",
                        "example": "Passionate about sustainable development and climate solutions"
                    })
                    chunk_optimization["priority"] = "high"
            
            elif chunk_type == "experience":
                if not any(word in content for word in ["impact", "reduced", "improved", "sustainability"]):
                    chunk_optimization["suggestions"].append({
                        "type": "quantify_impact",
                        "description": "Quantify environmental or sustainability impact of your work",
                        "example": "Reduced energy consumption by 25% through implementation of efficiency measures"
                    })
            
            elif chunk_type == "skills":
                climate_skills = ["gis", "environmental analysis", "sustainability reporting", "carbon accounting"]
                if not any(skill in content for skill in climate_skills):
                    chunk_optimization["suggestions"].append({
                        "type": "skill_enhancement",
                        "description": "Consider adding climate-relevant technical skills",
                        "example": "GIS analysis, Environmental Impact Assessment, Carbon Footprint Analysis"
                    })
            
            # Add general improvements
            if len(chunk.get("chunk_content", "")) < 100:
                chunk_optimization["suggestions"].append({
                    "type": "content_expansion",
                    "description": "Expand this section with more specific details and examples",
                    "example": "Add specific projects, technologies used, or quantifiable results"
                })
            
            optimization_results["chunk_optimizations"].append(chunk_optimization)
        
        # Generate overall optimization summary
        total_suggestions = sum(len(co["suggestions"]) for co in optimization_results["chunk_optimizations"])
        high_priority_count = sum(1 for co in optimization_results["chunk_optimizations"] if co["priority"] == "high")
        
        optimization_results["summary"] = {
            "total_suggestions": total_suggestions,
            "high_priority_items": high_priority_count,
            "completion_estimate": "15-30 minutes",
            "impact_score": min(total_suggestions * 10, 100)
        }
        
        logger.info(f"Generated {total_suggestions} optimization suggestions for resume {resume_id} by user {user_id}")
        
        return {"success": True, "optimization": optimization_results}
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error optimizing resume chunks for resume {resume_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to optimize resume chunks")


# Resume Bulk Operations
@router.post("/bulk-process", response_model=Dict[str, Any])
async def bulk_process_resume_chunks(
    bulk_data: Dict[str, Any],
    user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Process multiple resume chunks in bulk.
    - Handles batch processing of resume sections
    - Optimizes processing time for large resumes
    - Maintains chunk relationships and ordering
    """
    try:
        # Validate required fields
        if not bulk_data.get("chunks") or not isinstance(bulk_data["chunks"], list):
            raise HTTPException(status_code=400, detail="Missing or invalid chunks data")
        
        chunks_data = bulk_data["chunks"]
        resume_id = bulk_data.get("resume_id")
        
        if not resume_id:
            raise HTTPException(status_code=400, detail="Missing resume_id")
        
        # Verify resume belongs to user
        resume_result = supabase.table("resumes").select("user_id").eq("id", resume_id).execute()
        if not resume_result.data or resume_result.data[0]["user_id"] != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to process this resume")
        
        # Process each chunk
        processed_chunks = []
        errors = []
        
        for i, chunk_data in enumerate(chunks_data):
            try:
                # Set metadata for each chunk
                chunk_data["user_id"] = user_id
                chunk_data["resume_id"] = resume_id
                chunk_data["chunk_order"] = i + 1
                chunk_data["processed_at"] = datetime.utcnow().isoformat()
                chunk_data["created_at"] = datetime.utcnow().isoformat()
                chunk_data["updated_at"] = datetime.utcnow().isoformat()
                
                # Insert chunk
                result = supabase.table("resume_chunks").insert(chunk_data).execute()
                
                if result.data:
                    processed_chunks.append(result.data[0])
                else:
                    errors.append(f"Failed to process chunk {i + 1}")
                    
            except Exception as e:
                errors.append(f"Error processing chunk {i + 1}: {str(e)}")
        
        logger.info(f"Bulk processed {len(processed_chunks)} resume chunks for resume {resume_id} by user {user_id}")
        
        return {
            "success": True,
            "processed_chunks": processed_chunks,
            "total_processed": len(processed_chunks),
            "total_requested": len(chunks_data),
            "errors": errors if errors else None
        }
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error bulk processing resume chunks: {e}")
        raise HTTPException(status_code=500, detail="Failed to bulk process resume chunks")


@router.get("/user/chunks", response_model=Dict[str, Any])
async def get_user_resume_chunks(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    chunk_type: Optional[str] = Query(None),
    resume_id: Optional[str] = Query(None),
    user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Get all resume chunks for current user.
    - Returns user's resume chunks across all resumes
    - Supports filtering by chunk type and specific resume
    - Useful for analytics and bulk operations
    """
    try:
        query = supabase.table("resume_chunks").select("*").eq("user_id", user_id)
        
        # Apply filters
        if chunk_type:
            query = query.eq("chunk_type", chunk_type)
        if resume_id:
            query = query.eq("resume_id", resume_id)
        
        # Apply pagination and ordering
        result = (
            query
            .order("created_at", desc=True)
            .range(offset, offset + limit - 1)
            .execute()
        )
        
        # Get chunk type summary
        chunk_types = {}
        for chunk in result.data if result.data else []:
            chunk_type = chunk.get("chunk_type", "unknown")
            chunk_types[chunk_type] = chunk_types.get(chunk_type, 0) + 1
        
        logger.info(f"Retrieved {len(result.data)} resume chunks for user {user_id}")
        
        return {
            "success": True,
            "chunks": result.data if result.data else [],
            "pagination": {
                "limit": limit,
                "offset": offset
            },
            "summary": {
                "total_chunks": len(result.data) if result.data else 0,
                "chunk_types": chunk_types
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting user resume chunks: {e}")
        raise HTTPException(status_code=500, detail="Failed to get user resume chunks") 