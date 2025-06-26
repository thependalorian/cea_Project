"""
Education and Credentials routes for the Climate Economy Assistant.
Handles education programs, credential evaluation, MOS translation, and skills mapping.
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Dict, Any, List, Optional
from datetime import datetime
import structlog

from backend.database.supabase_client import supabase
from backend.api.middleware.auth import verify_token

logger = structlog.get_logger(__name__)
router = APIRouter()


# Education Programs Management
@router.post("/programs", response_model=Dict[str, Any])
async def create_education_program(
    program_data: Dict[str, Any],
    user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Create a new education program.
    - Validates required fields (program_name, provider, description)
    - Sets creation metadata and approval status
    - Associates program with creating user for tracking
    """
    try:
        # Validate required fields
        required_fields = ["program_name", "provider", "description"]
        for field in required_fields:
            if not program_data.get(field):
                raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
        
        # Set metadata
        program_data["created_by"] = user_id
        program_data["status"] = program_data.get("status", "pending")
        program_data["created_at"] = datetime.utcnow().isoformat()
        program_data["updated_at"] = datetime.utcnow().isoformat()
        
        # Insert education program
        result = supabase.table("education_programs").insert(program_data).execute()
        
        if result.data:
            logger.info(f"Created education program {result.data[0]['id']} by user {user_id}")
            return {"success": True, "program": result.data[0]}
        else:
            raise HTTPException(status_code=500, detail="Failed to create education program")
            
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error creating education program: {e}")
        raise HTTPException(status_code=500, detail="Failed to create education program")


@router.get("/programs", response_model=Dict[str, Any])
async def get_education_programs(
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    provider: Optional[str] = Query(None),
    program_type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    climate_focus: Optional[str] = Query(None),
    user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Get education programs with filtering and pagination.
    - Supports filtering by provider, program type, status, climate focus
    - Returns detailed program information including requirements
    - Includes enrollment and completion statistics
    """
    try:
        query = supabase.table("education_programs").select("*")
        
        # Apply filters
        if provider:
            query = query.ilike("provider", f"%{provider}%")
        if program_type:
            query = query.eq("program_type", program_type)
        if status:
            query = query.eq("status", status)
        if climate_focus:
            query = query.contains("climate_focus", [climate_focus])
        
        # Apply pagination and ordering
        result = (
            query
            .order("created_at", desc=True)
            .range(offset, offset + limit - 1)
            .execute()
        )
        
        logger.info(f"Retrieved {len(result.data)} education programs for user {user_id}")
        
        return {
            "success": True,
            "programs": result.data if result.data else [],
            "pagination": {
                "limit": limit,
                "offset": offset
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting education programs: {e}")
        raise HTTPException(status_code=500, detail="Failed to get education programs")


@router.get("/programs/{program_id}", response_model=Dict[str, Any])
async def get_education_program(
    program_id: str,
    user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Get specific education program by ID.
    - Returns complete program details including curriculum
    - Includes enrollment status if user is enrolled
    - Shows completion requirements and certification info
    """
    try:
        result = supabase.table("education_programs").select("*").eq("id", program_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Education program not found")
            
        program = result.data[0]
        
        # Check if user is enrolled in this program
        enrollment_result = (
            supabase.table("user_enrollments")
            .select("status, enrolled_at, progress")
            .eq("user_id", user_id)
            .eq("program_id", program_id)
            .execute()
        )
        
        if enrollment_result.data:
            program["user_enrollment"] = enrollment_result.data[0]
        
        logger.info(f"Retrieved education program {program_id} for user {user_id}")
        
        return {"success": True, "program": program}
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error getting education program {program_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to get education program")


# Credential Evaluation Management
@router.post("/credentials/evaluate", response_model=Dict[str, Any])
async def evaluate_credentials(
    evaluation_data: Dict[str, Any],
    user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Create credential evaluation request.
    - Validates required credential information
    - Initiates evaluation process with relevant agencies
    - Tracks evaluation status and results
    """
    try:
        # Validate required fields
        required_fields = ["credential_type", "issuing_country", "credential_name"]
        for field in required_fields:
            if not evaluation_data.get(field):
                raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
        
        # Set metadata
        evaluation_data["user_id"] = user_id
        evaluation_data["status"] = "submitted"
        evaluation_data["submitted_at"] = datetime.utcnow().isoformat()
        evaluation_data["created_at"] = datetime.utcnow().isoformat()
        evaluation_data["updated_at"] = datetime.utcnow().isoformat()
        
        # Insert credential evaluation
        result = supabase.table("credential_evaluation").insert(evaluation_data).execute()
        
        if result.data:
            logger.info(f"Created credential evaluation {result.data[0]['id']} for user {user_id}")
            return {"success": True, "evaluation": result.data[0]}
        else:
            raise HTTPException(status_code=500, detail="Failed to create credential evaluation")
            
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error creating credential evaluation: {e}")
        raise HTTPException(status_code=500, detail="Failed to create credential evaluation")


@router.get("/credentials/evaluations", response_model=Dict[str, Any])
async def get_credential_evaluations(
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    status: Optional[str] = Query(None),
    credential_type: Optional[str] = Query(None),
    user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Get credential evaluations for current user.
    - Returns user's credential evaluation history
    - Supports filtering by status and credential type
    - Includes evaluation results and recommendations
    """
    try:
        query = supabase.table("credential_evaluation").select("*").eq("user_id", user_id)
        
        # Apply filters
        if status:
            query = query.eq("status", status)
        if credential_type:
            query = query.eq("credential_type", credential_type)
        
        # Apply pagination and ordering
        result = (
            query
            .order("submitted_at", desc=True)
            .range(offset, offset + limit - 1)
            .execute()
        )
        
        logger.info(f"Retrieved {len(result.data)} credential evaluations for user {user_id}")
        
        return {
            "success": True,
            "evaluations": result.data if result.data else [],
            "pagination": {
                "limit": limit,
                "offset": offset
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting credential evaluations: {e}")
        raise HTTPException(status_code=500, detail="Failed to get credential evaluations")


@router.get("/credentials/evaluations/{evaluation_id}", response_model=Dict[str, Any])
async def get_credential_evaluation(
    evaluation_id: str,
    user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Get specific credential evaluation by ID.
    - Returns complete evaluation details and results
    - Includes equivalent US credentials and recommendations
    - Shows next steps for credential recognition
    """
    try:
        result = (
            supabase.table("credential_evaluation")
            .select("*")
            .eq("id", evaluation_id)
            .eq("user_id", user_id)
            .execute()
        )
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Credential evaluation not found")
            
        evaluation = result.data[0]
        
        logger.info(f"Retrieved credential evaluation {evaluation_id} for user {user_id}")
        
        return {"success": True, "evaluation": evaluation}
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error getting credential evaluation {evaluation_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to get credential evaluation")


# MOS (Military Occupational Specialty) Translation
@router.post("/mos/translate", response_model=Dict[str, Any])
async def translate_mos(
    mos_data: Dict[str, Any],
    user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Translate Military Occupational Specialty to civilian careers.
    - Maps military skills to civilian job opportunities
    - Identifies relevant climate economy positions
    - Provides skill gap analysis and training recommendations
    """
    try:
        # Validate required fields
        required_fields = ["mos_code", "branch"]
        for field in required_fields:
            if not mos_data.get(field):
                raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
        
        # Set metadata
        mos_data["user_id"] = user_id
        mos_data["translation_date"] = datetime.utcnow().isoformat()
        mos_data["created_at"] = datetime.utcnow().isoformat()
        mos_data["updated_at"] = datetime.utcnow().isoformat()
        
        # Insert MOS translation record
        result = supabase.table("mos_translation").insert(mos_data).execute()
        
        if result.data:
            translation_id = result.data[0]['id']
            
            # Get existing MOS translation data if available
            mos_lookup = (
                supabase.table("mos_lookup")
                .select("*")
                .eq("mos_code", mos_data["mos_code"])
                .eq("branch", mos_data["branch"])
                .execute()
            )
            
            translation_result = result.data[0]
            if mos_lookup.data:
                translation_result["civilian_equivalents"] = mos_lookup.data[0].get("civilian_equivalents", [])
                translation_result["climate_opportunities"] = mos_lookup.data[0].get("climate_opportunities", [])
                translation_result["required_certifications"] = mos_lookup.data[0].get("required_certifications", [])
            
            logger.info(f"Created MOS translation {translation_id} for user {user_id}")
            return {"success": True, "translation": translation_result}
        else:
            raise HTTPException(status_code=500, detail="Failed to translate MOS")
            
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error translating MOS: {e}")
        raise HTTPException(status_code=500, detail="Failed to translate MOS")


@router.get("/mos/translations", response_model=Dict[str, Any])
async def get_mos_translations(
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    branch: Optional[str] = Query(None),
    user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Get MOS translations for current user.
    - Returns user's MOS translation history
    - Supports filtering by military branch
    - Includes civilian career mapping results
    """
    try:
        query = supabase.table("mos_translation").select("*").eq("user_id", user_id)
        
        # Apply filters
        if branch:
            query = query.eq("branch", branch)
        
        # Apply pagination and ordering
        result = (
            query
            .order("translation_date", desc=True)
            .range(offset, offset + limit - 1)
            .execute()
        )
        
        logger.info(f"Retrieved {len(result.data)} MOS translations for user {user_id}")
        
        return {
            "success": True,
            "translations": result.data if result.data else [],
            "pagination": {
                "limit": limit,
                "offset": offset
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting MOS translations: {e}")
        raise HTTPException(status_code=500, detail="Failed to get MOS translations")


# Skills Mapping Management
@router.post("/skills/map", response_model=Dict[str, Any])
async def create_skills_mapping(
    mapping_data: Dict[str, Any],
    user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Create skills mapping for career transition.
    - Maps current skills to target climate economy roles
    - Identifies skill gaps and training opportunities
    - Provides personalized career pathway recommendations
    """
    try:
        # Validate required fields
        required_fields = ["current_skills", "target_role"]
        for field in required_fields:
            if not mapping_data.get(field):
                raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
        
        # Set metadata
        mapping_data["user_id"] = user_id
        mapping_data["created_at"] = datetime.utcnow().isoformat()
        mapping_data["updated_at"] = datetime.utcnow().isoformat()
        
        # Insert skills mapping
        result = supabase.table("skills_mapping").insert(mapping_data).execute()
        
        if result.data:
            mapping_id = result.data[0]['id']
            
            # Get role requirements for comparison
            role_requirements = (
                supabase.table("role_requirements")
                .select("*")
                .eq("role_name", mapping_data["target_role"])
                .execute()
            )
            
            mapping_result = result.data[0]
            if role_requirements.data:
                required_skills = role_requirements.data[0].get("required_skills", [])
                current_skills = mapping_data.get("current_skills", [])
                
                # Calculate skill gaps
                skill_gaps = [skill for skill in required_skills if skill not in current_skills]
                matching_skills = [skill for skill in required_skills if skill in current_skills]
                
                mapping_result["skill_gaps"] = skill_gaps
                mapping_result["matching_skills"] = matching_skills
                mapping_result["match_percentage"] = (len(matching_skills) / len(required_skills)) * 100 if required_skills else 0
            
            logger.info(f"Created skills mapping {mapping_id} for user {user_id}")
            return {"success": True, "mapping": mapping_result}
        else:
            raise HTTPException(status_code=500, detail="Failed to create skills mapping")
            
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error creating skills mapping: {e}")
        raise HTTPException(status_code=500, detail="Failed to create skills mapping")


@router.get("/skills/mappings", response_model=Dict[str, Any])
async def get_skills_mappings(
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    target_role: Optional[str] = Query(None),
    user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Get skills mappings for current user.
    - Returns user's skills mapping history
    - Supports filtering by target role
    - Includes gap analysis and recommendations
    """
    try:
        query = supabase.table("skills_mapping").select("*").eq("user_id", user_id)
        
        # Apply filters
        if target_role:
            query = query.eq("target_role", target_role)
        
        # Apply pagination and ordering
        result = (
            query
            .order("created_at", desc=True)
            .range(offset, offset + limit - 1)
            .execute()
        )
        
        logger.info(f"Retrieved {len(result.data)} skills mappings for user {user_id}")
        
        return {
            "success": True,
            "mappings": result.data if result.data else [],
            "pagination": {
                "limit": limit,
                "offset": offset
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting skills mappings: {e}")
        raise HTTPException(status_code=500, detail="Failed to get skills mappings")


# Role Requirements Management
@router.get("/roles/requirements", response_model=Dict[str, Any])
async def get_role_requirements(
    role_name: Optional[str] = Query(None),
    climate_focus: Optional[str] = Query(None),
    experience_level: Optional[str] = Query(None),
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Get role requirements for climate economy positions.
    - Returns detailed skill and education requirements
    - Supports filtering by role name, climate focus, experience level
    - Includes salary ranges and career progression paths
    """
    try:
        query = supabase.table("role_requirements").select("*")
        
        # Apply filters
        if role_name:
            query = query.ilike("role_name", f"%{role_name}%")
        if climate_focus:
            query = query.contains("climate_focus", [climate_focus])
        if experience_level:
            query = query.eq("experience_level", experience_level)
        
        # Apply pagination and ordering
        result = (
            query
            .order("role_name")
            .range(offset, offset + limit - 1)
            .execute()
        )
        
        logger.info(f"Retrieved {len(result.data)} role requirements for user {user_id}")
        
        return {
            "success": True,
            "roles": result.data if result.data else [],
            "pagination": {
                "limit": limit,
                "offset": offset
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting role requirements: {e}")
        raise HTTPException(status_code=500, detail="Failed to get role requirements")


@router.get("/roles/requirements/{role_id}", response_model=Dict[str, Any])
async def get_role_requirement(
    role_id: str,
    user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Get specific role requirement by ID.
    - Returns complete role details including all requirements
    - Includes related education programs and certifications
    - Shows career progression opportunities
    """
    try:
        result = supabase.table("role_requirements").select("*").eq("id", role_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Role requirement not found")
            
        role = result.data[0]
        
        # Get related education programs
        education_result = (
            supabase.table("education_programs")
            .select("id, program_name, provider, description")
            .contains("target_roles", [role["role_name"]])
            .execute()
        )
        
        if education_result.data:
            role["related_programs"] = education_result.data
        
        logger.info(f"Retrieved role requirement {role_id} for user {user_id}")
        
        return {"success": True, "role": role}
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error getting role requirement {role_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to get role requirement") 