"""
Resume processing and analysis API endpoints for Climate Economy Assistant

This module handles resume uploads, processing, and analysis, integrating with
the LangGraph workflow system for enhanced resume-based career guidance.
"""

import json
import logging
import os
import traceback
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, BackgroundTasks, Depends, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from adapters.supabase import get_supabase_client
from core.config import get_settings
from models import (
    CheckUserResumeRequest,
    ProcessResumeRequest,
    ResumeAnalysisRequest,
    ResumeAnalysisResponse,
    ResumeCheckResponse,
    ResumeProcessingResponse,
    ResumeUploadResponse,
)
from tools.resume import (
    analyze_resume_for_climate_careers,
    check_user_resume_status,
    get_user_resume,
    process_resume,
    update_resume_analysis,
)

settings = get_settings()
logger = logging.getLogger("resume_api")

router = APIRouter(prefix="/resume", tags=["resume"])


@router.post("/upload", response_model=ResumeUploadResponse)
async def upload_resume(
    file: UploadFile = File(...), background_tasks: BackgroundTasks = None
):
    """
    Direct resume upload endpoint (alternative to Next.js API)

    This endpoint handles file uploads, stores them in Supabase storage,
    and creates a record in the resumes table.
    """
    try:
        # Get Supabase client
        supabase = get_supabase_client()
        if not supabase:
            return JSONResponse(
                status_code=503,
                content={
                    "success": False,
                    "message": "Database connection unavailable",
                    "error": "Could not connect to database",
                },
            )

        # Validate file type
        allowed_types = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ]

        if file.content_type not in allowed_types:
            return JSONResponse(
                status_code=400,
                content={
                    "success": False,
                    "message": "Invalid file type",
                    "error": "Only PDF and Word documents are allowed",
                },
            )

        # Read file content
        file_content = await file.read()

        # Generate unique filename
        file_extension = file.filename.split(".")[-1] if "." in file.filename else "pdf"
        unique_filename = f"{uuid.uuid4()}_{file.filename}"
        file_path = f"resumes/{unique_filename}"

        # Upload to Supabase Storage
        upload_response = supabase.storage.from_("resumes").upload(
            file_path, file_content, {"content-type": file.content_type}
        )

        if hasattr(upload_response, "error") and upload_response.error:
            return JSONResponse(
                status_code=500,
                content={
                    "success": False,
                    "message": "Failed to upload file",
                    "error": str(upload_response.error),
                },
            )

        # For now, we'll need user_id from the request or session
        # This is a simplified version - in production, get user_id from JWT token
        user_id = "temp-user-id"  # Replace with actual user authentication

        # Create resume record
        resume_data = {
            "user_id": user_id,
            "file_name": file.filename,
            "file_path": file_path,
            "file_size": len(file_content),
            "content_type": file.content_type,
            "processed": False,
        }

        db_response = supabase.table("resumes").insert(resume_data).execute()

        if hasattr(db_response, "error") and db_response.error:
            # Clean up uploaded file if database insert fails
            supabase.storage.from_("resumes").remove([file_path])
            return JSONResponse(
                status_code=500,
                content={
                    "success": False,
                    "message": "Failed to save resume record",
                    "error": str(db_response.error),
                },
            )

        # Get the resume ID from the response
        resume_id = db_response.data[0]["id"] if db_response.data else None

        # Process resume in background if requested
        if background_tasks:
            background_tasks.add_task(
                process_resume,
                user_id=user_id,
                file_url=file_path,
                file_name=file.filename,
                file_type=file.content_type,
                file_size=len(file_content),
            )

        return ResumeUploadResponse(
            success=True,
            message="Resume uploaded successfully",
            resume_id=resume_id,
            file_name=file.filename,
        )

    except Exception as e:
        logger.error(f"Resume upload error: {e}")
        logger.error(traceback.format_exc())
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "message": "Failed to upload resume",
                "error": str(e),
            },
        )


@router.post("/check", response_model=ResumeCheckResponse)
async def check_user_resume(request: CheckUserResumeRequest):
    """Check if user has uploaded and processed resume"""
    try:
        # Call the service function
        result = await check_user_resume_status(request.user_id)

        return ResumeCheckResponse(
            has_resume=result.get("has_resume", False),
            resume_id=result.get("resume_id"),
            file_name=result.get("file_name"),
            processed=result.get("processed", False),
            uploaded_at=result.get("uploaded_at"),
            message="Resume check successful",
        )

    except Exception as e:
        logger.error(f"Check resume error: {e}")
        logger.error(traceback.format_exc())
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "has_resume": False,
                "message": "Failed to check resume",
                "error": str(e),
            },
        )


@router.post("/process", response_model=ResumeProcessingResponse)
async def process_resume_endpoint(request: ProcessResumeRequest):
    """Process uploaded resume and extract relevant information"""
    try:
        logger.info(f"🚀 Starting resume processing for user: {request.user_id}")
        logger.info(f"   📄 File ID: {request.file_id}")
        logger.info(f"   🔗 File URL: {request.file_url}")

        # Get Supabase client
        supabase = get_supabase_client()
        if not supabase:
            return JSONResponse(
                status_code=503,
                content={
                    "success": False,
                    "message": "Database connection unavailable",
                    "error": "Could not connect to database",
                },
            )

        # Process resume
        result = await process_resume(
            user_id=request.user_id,
            file_url=request.file_url,
            file_id=request.file_id,
            context=request.context,
        )

        # If there was an error during processing
        if not result.get("success", False):
            return JSONResponse(
                status_code=result.get("status_code", 500),
                content={
                    "success": False,
                    "message": result.get("message", "Failed to process resume"),
                    "error": result.get("error", "Unknown error during processing"),
                    "resume_id": request.file_id,
                },
            )

        return ResumeProcessingResponse(
            success=True,
            message=result.get("message", "Resume processed successfully"),
            content_length=result.get("content_length"),
            chunks_count=result.get("chunks_count"),
            skills_extracted=result.get("skills_extracted"),
            climate_relevance_score=result.get("climate_relevance_score"),
            experience_years=result.get("experience_years"),
            education_level=result.get("education_level"),
            industry_background=result.get("industry_background"),
            already_processed=result.get("already_processed", False),
            resume_id=result.get("resume_id"),
            context=result.get("context"),
            analysis_method=result.get("analysis_method"),
            analysis_confidence=result.get("analysis_confidence"),
            content_quality=result.get("content_quality"),
            data_storage=result.get("data_storage"),
            processing_steps=result.get("processing_steps"),
        )

    except Exception as e:
        logger.error(f"Resume processing error: {e}")
        logger.error(traceback.format_exc())
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "message": "Failed to process resume",
                "error": str(e),
                "resume_id": request.file_id,
            },
        )


@router.post("/analyze", response_model=ResumeAnalysisResponse)
async def analyze_resume(request: ResumeAnalysisRequest):
    """Analyze user's resume and provide insights for climate economy careers"""
    try:
        logger.info(f"🔍 Starting analyze_resume for user_id: {request.user_id}")

        # Analyze the resume
        result = await analyze_resume_for_climate_careers(
            user_id=request.user_id,
            analysis_type=request.analysis_type,
            include_social_data=request.include_social_data,
        )

        if not result.get("success", False):
            return JSONResponse(
                status_code=(
                    404 if "No resume found" in result.get("error", "") else 500
                ),
                content={
                    "success": False,
                    "message": result.get("message", "Failed to analyze resume"),
                    "error": result.get("error", "Unknown error during analysis"),
                    "user_id": request.user_id,
                    "analysis_type": request.analysis_type,
                },
            )

        return ResumeAnalysisResponse(
            success=True,
            analysis=result.get("analysis", ""),
            resume_id=result.get("resume_id"),
            user_id=request.user_id,
            analysis_type=request.analysis_type,
            message=result.get("message", "Resume analysis completed successfully"),
        )

    except Exception as e:
        logger.error(f"Resume analysis error: {e}")
        logger.error(traceback.format_exc())
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "analysis": "An error occurred during analysis.",
                "message": "Failed to analyze resume",
                "error": str(e),
                "user_id": request.user_id,
                "analysis_type": request.analysis_type,
            },
        )


@router.post("/query", response_model=Dict[str, Any])
async def query_user_resume_endpoint(
    query: str, user_id: str, chat_history: Optional[List[Dict[str, Any]]] = None
):
    """Query a user's resume with natural language"""
    try:
        from tools.resume import query_user_resume

        result = await query_user_resume(
            user_id=user_id, query=query, chat_history=chat_history
        )

        return result

    except Exception as e:
        logger.error(f"Resume query error: {e}")
        logger.error(traceback.format_exc())
        return {
            "success": False,
            "answer": "I encountered an error while trying to analyze your resume.",
            "error": str(e),
        }
