"""
Resume Processing API Routes - Backend Implementation
Purpose: Handle resume processing requests with semantic analysis
Location: /backend/api/routes/resume_processor.py
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, Any, Optional
import logging

from backend.tools.resume_processor import ProductionResumeProcessor
from backend.api.middleware.auth import verify_token
from backend.config.supabase import get_supabase_client

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/resumes", tags=["resume-processing"])


class ResumeProcessRequest(BaseModel):
    """Request model for resume processing"""

    user_id: str
    filename: str
    content: str


class ResumeProcessResponse(BaseModel):
    """Response model for resume processing"""

    success: bool
    resume_id: Optional[str] = None
    chunks_processed: Optional[int] = None
    skills_extracted: Optional[int] = None
    climate_relevance_score: Optional[float] = None
    message: str
    error: Optional[str] = None


@router.post("/process", response_model=ResumeProcessResponse)
async def process_resume(
    request: ResumeProcessRequest, user_id: str = Depends(verify_token)
) -> ResumeProcessResponse:
    """
    Process resume with semantic analysis and structured data extraction

    Args:
        request: Resume processing request data
        user_id: User ID from authentication

    Returns:
        Processing results with analysis data
    """
    try:
        logger.info(f"🚀 Processing resume for user: {request.user_id}")

        # Initialize processor
        processor = ProductionResumeProcessor()

        # Process the resume
        result = await processor.process_resume(
            user_id=request.user_id,
            file_content=request.content,
            filename=request.filename,
        )

        if result["success"]:
            logger.info(f"✅ Resume processing completed: {result['resume_id']}")
            return ResumeProcessResponse(
                success=True,
                resume_id=result["resume_id"],
                chunks_processed=result["chunks_processed"],
                skills_extracted=result["skills_extracted"],
                climate_relevance_score=result["climate_relevance_score"],
                message=result["message"],
            )
        else:
            logger.error(f"❌ Resume processing failed: {result['error']}")
            return ResumeProcessResponse(
                success=False, message=result["message"], error=result["error"]
            )

    except Exception as e:
        logger.error(f"Resume processing API error: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Resume processing failed: {str(e)}"
        )


@router.get("/status/{resume_id}")
async def get_resume_status(
    resume_id: str, user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Get processing status of a resume

    Args:
        resume_id: Resume ID to check
        user_id: User ID from authentication

    Returns:
        Resume processing status and metadata
    """
    try:
        supabase = get_supabase_client()

        # Get resume record
        response = (
            supabase.table("resumes").select("*").eq("id", resume_id).single().execute()
        )

        if not response.data:
            raise HTTPException(status_code=404, detail="Resume not found")

        resume_data = response.data

        return {
            "success": True,
            "resume_id": resume_id,
            "processing_status": resume_data.get("processing_status", "unknown"),
            "climate_relevance_score": resume_data.get("climate_relevance_score"),
            "skills_count": len(resume_data.get("skills_extracted", [])),
            "chunk_count": resume_data.get("chunk_count", 0),
            "processed_at": resume_data.get("processed_at"),
            "filename": resume_data.get("filename"),
        }

    except Exception as e:
        logger.error(f"Resume status check error: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Failed to get resume status: {str(e)}"
        )


# Export router
__all__ = ["router"]
