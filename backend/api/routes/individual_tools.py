"""
Individual Tools API Router - Database-Driven Implementation
Connects tools to Supabase database tables for scalable, dynamic functionality
Location: backend/api/routes/individual_tools.py
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from datetime import datetime
import logging
from ..middleware.auth import verify_token
from supabase import create_client, Client
import os

# Initialize logger
logger = logging.getLogger(__name__)

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_ANON_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

router = APIRouter(prefix="/tools", tags=["individual-tools"])

# =============================================================================
# PYDANTIC MODELS
# =============================================================================

class ToolRequest(BaseModel):
    """Base request model for tool execution"""
    parameters: Dict[str, Any]
    metadata: Optional[Dict[str, Any]] = None

class ToolResponse(BaseModel):
    """Base response model for tool execution"""
    success: bool
    result: Any
    tool_name: str
    timestamp: str
    metadata: Optional[Dict[str, Any]] = None

# =============================================================================
# DATABASE-DRIVEN TOOL IMPLEMENTATIONS
# =============================================================================

@router.post("/job-search")
async def job_search_tool(
    request: ToolRequest, user_id: str = Depends(verify_token)
) -> ToolResponse:
    """Search job listings from database"""
    try:
        # Build dynamic query based on parameters
        query = supabase.table("job_listings").select("*")
        
        if request.parameters.get("location"):
            query = query.ilike("location", f"%{request.parameters['location']}%")
            
        if request.parameters.get("experience_level"):
            query = query.eq("experience_level", request.parameters['experience_level'])
            
        if request.parameters.get("climate_focus"):
            query = query.overlaps("climate_focus", request.parameters['climate_focus'])
        
        query = query.eq("is_active", True)
        result = query.execute()
        
        return ToolResponse(
            success=True,
            result={"jobs": result.data, "total_count": len(result.data)},
            tool_name="job-search",
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        logger.error(f"Job search failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/education-programs")
async def education_programs_tool(
    request: ToolRequest, user_id: str = Depends(verify_token)
) -> ToolResponse:
    """Search education programs from database"""
    try:
        query = supabase.table("education_programs").select("*")
        
        if request.parameters.get("program_type"):
            query = query.eq("program_type", request.parameters['program_type'])
            
        if request.parameters.get("climate_focus"):
            query = query.overlaps("climate_focus", request.parameters['climate_focus'])
            
        query = query.eq("is_active", True)
        result = query.execute()
        
        return ToolResponse(
            success=True,
            result={"programs": result.data, "total_count": len(result.data)},
            tool_name="education-programs",
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        logger.error(f"Education programs search failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/partner-search")
async def partner_search_tool(
    request: ToolRequest, user_id: str = Depends(verify_token)
) -> ToolResponse:
    """Search partner organizations from database"""
    try:
        query = supabase.table("partner_profiles").select("*")
        
        if request.parameters.get("organization_type"):
            query = query.eq("organization_type", request.parameters['organization_type'])
            
        if request.parameters.get("climate_focus"):
            query = query.overlaps("climate_focus", request.parameters['climate_focus'])
            
        query = query.eq("verified", True)
        result = query.execute()
        
        return ToolResponse(
            success=True,
            result={"partners": result.data, "total_count": len(result.data)},
            tool_name="partner-search",
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        logger.error(f"Partner search failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/knowledge-search")
async def knowledge_search_tool(
    request: ToolRequest, user_id: str = Depends(verify_token)
) -> ToolResponse:
    """Search knowledge resources from database"""
    try:
        query = supabase.table("knowledge_resources").select("*")
        
        if request.parameters.get("content_type"):
            query = query.eq("content_type", request.parameters['content_type'])
            
        if request.parameters.get("categories"):
            query = query.overlaps("categories", request.parameters['categories'])
            
        query = query.eq("is_published", True)
        result = query.execute()
        
        return ToolResponse(
            success=True,
            result={"resources": result.data, "total_count": len(result.data)},
            tool_name="knowledge-search",
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        logger.error(f"Knowledge search failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/veteran-mos-translation")
async def veteran_mos_translation_tool(
    request: ToolRequest, user_id: str = Depends(verify_token)
) -> ToolResponse:
    """Translate military MOS to civilian climate careers"""
    try:
        mos_code = request.parameters.get("mos_code")
        if not mos_code:
            raise HTTPException(status_code=400, detail="MOS code is required")
            
        result = supabase.table("mos_translation").select("*").eq("mos_code", mos_code).execute()
        
        return ToolResponse(
            success=True,
            result={"mos_translation": result.data, "found": len(result.data) > 0},
            tool_name="veteran-mos-translation",
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        logger.error(f"MOS translation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/skills-analysis")
async def skills_analysis_tool(
    request: ToolRequest, user_id: str = Depends(verify_token)
) -> ToolResponse:
    """Analyze skills and get climate career mapping"""
    try:
        skills = request.parameters.get("skills", [])
        
        query = supabase.table("skills_mapping").select("*")
        if skills:
            query = query.in_("skill_name", skills)
            
        result = query.execute()
        
        return ToolResponse(
            success=True,
            result={"skills_mapping": result.data, "total_skills_found": len(result.data)},
            tool_name="skills-analysis",
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        logger.error(f"Skills analysis failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/resume-analysis")
async def resume_analysis_tool(
    request: ToolRequest, user_id: str = Depends(verify_token)
) -> ToolResponse:
    """Analyze user's resume and chunks"""
    try:
        resumes_result = supabase.table("resumes").select("*").eq("user_id", user_id).execute()
        
        if not resumes_result.data:
            return ToolResponse(
                success=True,
                result={"message": "No resumes found for user"},
                tool_name="resume-analysis",
                timestamp=datetime.now().isoformat()
            )
            
        resume_ids = [resume["id"] for resume in resumes_result.data]
        chunks_result = supabase.table("resume_chunks").select("*").in_("resume_id", resume_ids).execute()
        
        return ToolResponse(
            success=True,
            result={
                "resumes": resumes_result.data,
                "resume_chunks": chunks_result.data,
                "total_resumes": len(resumes_result.data)
            },
            tool_name="resume-analysis",
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        logger.error(f"Resume analysis failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/available")
async def list_available_tools(user_id: str = Depends(verify_token)) -> Dict[str, Any]:
    """List all available database-driven tools"""
    
    tools = [
        {
            "name": "job-search",
            "category": "job_search",
            "description": "Search job listings from database",
            "database_table": "job_listings",
            "parameters": ["location", "climate_focus", "experience_level", "employment_type"]
        },
        {
            "name": "education-programs",
            "category": "education",
            "description": "Search education programs from database",
            "database_table": "education_programs",
            "parameters": ["program_type", "climate_focus", "format"]
        },
        {
            "name": "partner-search",
            "category": "partnerships",
            "description": "Search partner organizations from database",
            "database_table": "partner_profiles",
            "parameters": ["organization_type", "climate_focus", "services_offered"]
        },
        {
            "name": "knowledge-search",
            "category": "resources",
            "description": "Search knowledge resources from database",
            "database_table": "knowledge_resources",
            "parameters": ["content_type", "categories", "climate_sectors"]
        },
        {
            "name": "veteran-mos-translation",
            "category": "veterans",
            "description": "Translate military MOS to civilian climate careers",
            "database_table": "mos_translation",
            "parameters": ["mos_code"]
        },
        {
            "name": "skills-analysis",
            "category": "career_development",
            "description": "Analyze skills and get climate career mapping",
            "database_table": "skills_mapping",
            "parameters": ["skills"]
        },
        {
            "name": "resume-analysis",
            "category": "career_development",
            "description": "Analyze user's resume and chunks",
            "database_table": "resumes",
            "parameters": []
        }
    ]
    
    return {
        "total_tools": len(tools),
        "tools": tools,
        "database_driven": True,
        "scalable": True,
        "base_url": "/api/v1/tools/"
    }