"""
Resume routes for the Climate Economy Assistant.
"""

from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from typing import Dict, Any, List, Optional
import structlog
from datetime import datetime
import PyPDF2
import io

from backend.api.middleware.auth import optional_verify_token
from backend.api.models.resume import ResumeAnalysisResponse
from backend.api.services.resume_service import ResumeAnalysisService
from backend.tools.resume_processor import ProductionResumeProcessor

logger = structlog.get_logger(__name__)
router = APIRouter()


@router.post("/extract-text")
async def extract_text_from_pdf(file: UploadFile = File(...)) -> Dict[str, Any]:
    """Extract text from PDF files"""
    try:
        logger.info(f"📄 Processing PDF: {file.filename}")
        
        # Read file content
        content = await file.read()
        if not content:
            raise HTTPException(status_code=400, detail="Empty file")

        # Extract text from PDF
        text = ""
        try:
            pdf_file = io.BytesIO(content)
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            
            for page_num in range(len(pdf_reader.pages)):
                page = pdf_reader.pages[page_num]
                text += page.extract_text() + "\n"
                
        except Exception as pdf_error:
            logger.error(f"Error extracting PDF text: {pdf_error}")
            raise HTTPException(status_code=400, detail="Failed to extract text from PDF")

        if not text.strip():
            raise HTTPException(status_code=400, detail="No text found in PDF")

        logger.info(f"✅ Successfully extracted {len(text)} characters from PDF")
        
        return {
            "text": text,
            "filename": file.filename,
            "extracted_at": datetime.utcnow().isoformat()
        }

    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"❌ Error in extract-text endpoint: {e}")
        raise HTTPException(status_code=500, detail="Failed to extract text")


@router.post("/resumes/process")
async def process_resume_with_ai(
    text: str = Form(...),
    filename: str = Form(...),
    user_id: Optional[str] = Form(None)
) -> Dict[str, Any]:
    """Process resume content with AI analysis and store results"""
    try:
        # Use provided user_id or create development fallback
        actual_user_id = user_id or f"dev-user-{int(datetime.utcnow().timestamp())}"
        
        logger.info(f"🤖 Processing resume for user {actual_user_id}: {filename}")
        
        # Initialize the production resume processor
        processor = ProductionResumeProcessor()
        
        # Process the resume
        result = await processor.process_resume(
            user_id=actual_user_id,
            file_content=text,
            filename=filename
        )
        
        logger.info(f"✅ Successfully processed resume {filename}")
        
        return {
            "success": True,
            "resume_id": result.get("resume_id"),
            "climate_score": result.get("climate_relevance_score", 0.0),
            "skills_count": len(result.get("skills_extracted", [])),
            "chunks_created": result.get("chunk_count", 0),
            "processing_time_ms": result.get("processing_time", 0),
            "message": f"Resume '{filename}' processed successfully"
        }

    except Exception as e:
        logger.error(f"❌ Error processing resume: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process resume: {str(e)}")


@router.post("/resumes/analyze", response_model=ResumeAnalysisResponse)
async def analyze_resume(
    file: UploadFile = File(...), user_id_optional: Optional[str] = Depends(optional_verify_token)
) -> Dict[str, Any]:
    """Analyze a resume for climate economy career opportunities."""
    try:
        # Use provided user_id or create development fallback
        user_id = user_id_optional or f"dev-user-{int(datetime.now().timestamp())}"
        
        service = ResumeAnalysisService()

        # Read file content
        content = await file.read()
        if not content:
            raise HTTPException(status_code=400, detail="Empty file")

        # Get file type
        file_type = file.filename.split(".")[-1].lower()
        if file_type not in ["pdf", "doc", "docx", "txt"]:
            raise HTTPException(status_code=400, detail="Unsupported file type")

        # Process resume
        result = await service.process_resume(content, file_type, user_id)
        return result

    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error analyzing resume: {e}")
        raise HTTPException(status_code=500, detail="Failed to analyze resume")


@router.get("/resumes/{resume_id}")
async def get_resume_analysis(
    resume_id: str, user_id: Optional[str] = Depends(optional_verify_token)
) -> Dict[str, Any]:
    """Get a previously analyzed resume."""
    try:
        service = ResumeAnalysisService()
        analysis = await service.get_resume_analysis(resume_id, user_id)
        if not analysis:
            raise HTTPException(
                status_code=404, detail=f"Resume analysis {resume_id} not found"
            )
        return analysis
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error getting resume analysis: {e}")
        raise HTTPException(status_code=500, detail="Failed to get resume analysis")


@router.get("/resumes")
async def list_resume_analyses(
    user_id: Optional[str] = Depends(optional_verify_token), limit: int = 10, offset: int = 0
) -> List[Dict[str, Any]]:
    """List all resume analyses for a user."""
    try:
        service = ResumeAnalysisService()
        analyses = await service.list_resume_analyses(user_id, limit, offset)
        return analyses
    except Exception as e:
        logger.error(f"Error listing resume analyses: {e}")
        raise HTTPException(status_code=500, detail="Failed to list resume analyses")


@router.delete("/resumes/{resume_id}")
async def delete_resume_analysis(
    resume_id: str, user_id_optional: Optional[str] = Depends(optional_verify_token)
) -> Dict[str, Any]:
    """Delete a resume analysis."""
    try:
        # Use provided user_id or create development fallback
        user_id = user_id_optional or f"dev-user-{int(datetime.now().timestamp())}"
        
        service = ResumeAnalysisService()
        # Check if analysis exists
        analysis = await service.get_resume_analysis(resume_id, user_id)
        if not analysis:
            raise HTTPException(
                status_code=404, detail=f"Resume analysis {resume_id} not found"
            )

        # Delete analysis
        success = await service.delete_resume_analysis(resume_id, user_id)
        if not success:
            raise HTTPException(
                status_code=500, detail="Failed to delete resume analysis"
            )

        return {"message": "Resume analysis deleted successfully"}
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error deleting resume analysis: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete resume analysis")
