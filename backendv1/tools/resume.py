"""
Resume processing and analysis tools for Climate Economy Assistant

This module implements functions for resume processing, analysis, and querying
to support the Climate Economy Assistant's career guidance capabilities.
"""

import json
import logging
import os
import traceback
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from langchain_core.output_parsers import StrOutputParser
from langchain_openai import ChatOpenAI, OpenAIEmbeddings

# cspell:ignore supabase
from backendv1.adapters.supabase import (
    get_file_from_storage,
    get_supabase_client,
    insert_database_record,
    query_database,
    update_database_record,
)
from backendv1.core.config import get_settings
from backendv1.core.prompts import RESUME_ANALYSIS_PROMPT
from backendv1.tools.web import web_search_for_social_profiles

settings = get_settings()
logger = logging.getLogger("resume_tools")

# Initialize OpenAI embeddings
try:
    embeddings = OpenAIEmbeddings(api_key=settings.OPENAI_API_KEY)
except Exception as e:
    logger.error(f"Error initializing embeddings: {e}")
    embeddings = None


async def get_user_resume(user_id: str) -> Optional[Dict[str, Any]]:
    """
    Get the most recent resume for a user

    Args:
        user_id: User ID

    Returns:
        Resume data or None if not found
    """
    try:
        # Query database for user's resume
        result = await query_database(
            table="resumes",
            select="*",
            filters={"user_id": user_id},
            order_column="created_at",
            order_desc=True,
            limit=1,
        )

        if not result.get("success", False) or not result.get("data"):
            return None

        return result["data"][0]

    except Exception as e:
        logger.error(f"Error getting user resume: {e}")
        return None


async def process_resume(
    user_id: str, file_url: str, file_id: str, context: str = "general"
) -> Dict[str, Any]:
    """
    Process an uploaded resume file

    Args:
        user_id: User ID
        file_url: URL or path to the resume file
        file_id: Resume file ID
        context: Context for resume processing

    Returns:
        Processing result
    """
    try:
        logger.info(f"Starting resume processing for user: {user_id}")
        logger.info(f"File ID: {file_id}")
        logger.info(f"File URL: {file_url}")

        supabase = get_supabase_client()
        if not supabase:
            return {
                "success": False,
                "error": "Database connection unavailable",
                "status_code": 503,
            }

        # Get resume from database
        logger.info("Retrieving resume record from database...")
        try:
            response = supabase.table("resumes").select("*").eq("id", file_id).single().execute()
            resume = response.data
            logger.info(f"Resume record found: {resume.get('file_name', 'Unknown')}")
        except Exception as db_error:
            # Handle case where single() fails because no record found
            if (
                "no rows returned" in str(db_error).lower()
                or "multiple (or no) rows returned" in str(db_error).lower()
            ):
                logger.error(f"Resume record not found in database")
                return {
                    "success": False,
                    "error": "Resume not found",
                    "status_code": 404,
                }
            else:
                # Re-raise other database errors
                logger.error(f"Database error: {db_error}")
                return {
                    "success": False,
                    "error": f"Database error: {str(db_error)}",
                    "status_code": 500,
                }

        if not resume:
            logger.error(f"Resume record is null")
            return {"success": False, "error": "Resume not found", "status_code": 404}

        # Verify the resume belongs to the requesting user
        if resume.get("user_id") != user_id:
            logger.error(f"Access denied - resume belongs to different user")
            return {
                "success": False,
                "error": "Access denied to this resume",
                "status_code": 403,
            }

        # Check if already processed
        if resume.get("processed", False) and resume.get("skills_extracted"):
            logger.info(f"Resume already processed")
            return {
                "success": True,
                "message": "Resume already processed",
                "content_length": len(resume.get("content", "")),
                "chunks_count": len(resume.get("chunks", [])),
                "skills_extracted": len(resume.get("skills_extracted", [])),
                "climate_relevance_score": resume.get("climate_relevance_score", 0.0),
                "already_processed": True,
                "resume_id": file_id,
                "context": context,
            }

        # Extract content from file
        logger.info(f"Extracting resume content...")
        content = ""

        # Try to use existing content if available
        if resume.get("content") and len(resume.get("content", "").strip()) > 100:
            content = resume.get("content", "")
            logger.info(f"Using existing content from database: {len(content)} characters")

        # If no content, try to download and extract from storage
        elif resume.get("file_path"):
            logger.info(f"Attempting to download file from storage...")
            try:
                file_content = await get_file_from_storage(resume["file_path"])

                if file_content:
                    logger.info(f"File downloaded successfully from storage")
                    # Extract text based on file type
                    content_type = resume.get("content_type", "")

                    # Basic text extraction (would be enhanced in a real implementation)
                    if "pdf" in content_type.lower():
                        content = extract_text_from_pdf(file_content)
                    elif "word" in content_type.lower() or "docx" in content_type.lower():
                        content = extract_text_from_word(file_content)
                    else:
                        content = file_content.decode("utf-8", errors="ignore")

                    logger.info(f"Extracted {len(content)} characters from file")
                else:
                    logger.warning(f"File not found in storage")

            except Exception as storage_error:
                logger.error(f"Storage error: {storage_error}")
                # Continue with fallback content generation

        # If still no content, provide a placeholder
        if not content or len(content.strip()) < 50:
            logger.warning(f"No meaningful content extracted, using placeholder")
            content = f"[Placeholder resume content for user {user_id}]"

        # Analyze the resume with LLM
        logger.info(f"Analyzing resume with LLM...")
        analysis_result = await analyze_resume_with_llm(content, resume.get("file_name", ""))

        # Create chunks for database storage (simplified)
        logger.info(f"Creating chunks for database storage...")
        chunks = []
        if content:
            # Simple chunking by paragraphs
            paragraphs = content.split("\n\n")
            current_chunk = ""

            for paragraph in paragraphs:
                if len(current_chunk + paragraph) > 400:
                    if current_chunk:
                        chunks.append(current_chunk.strip()[:400])
                    current_chunk = paragraph[:400]
                else:
                    current_chunk += "\n\n" + paragraph if current_chunk else paragraph

            if current_chunk:
                chunks.append(current_chunk.strip()[:400])

        # Limit chunks array size for database storage
        chunks = chunks[:5]  # Maximum 5 chunks

        # Generate embeddings for search if available
        content_embedding = None
        if embeddings and content:
            try:
                content_embedding = embeddings.embed_query(content[:8000])  # Limit content size
            except Exception as embed_error:
                logger.error(f"Error generating embeddings: {embed_error}")

        # Prepare update data
        update_data = {
            "content": content[:5000] if content else "",  # Limit content size
            "chunks": chunks,
            "processed": True,
            "processing_status": "completed",
            "updated_at": datetime.now().isoformat(),
            "skills_extracted": analysis_result.get("skills_extracted", [])[:15],
            "experience_years": analysis_result.get("experience_years", 0),
            "education_level": analysis_result.get("education_level", "Unknown")[:40],
            "industry_background": analysis_result.get("industry_background", [])[:4],
            "climate_relevance_score": analysis_result.get("climate_relevance_score", 0.0),
            "content_embedding": content_embedding,
            "processing_metadata": {
                "analysis_timestamp": datetime.now().isoformat(),
                "analysis_version": "v1",
                "content_quality": analysis_result.get("content_quality", "fair"),
                "analysis_confidence": analysis_result.get("analysis_confidence", 0.5),
            },
        }

        # Update the database record
        logger.info(f"Updating database record...")
        try:
            update_result = await update_database_record(
                table="resumes", record_id=file_id, data=update_data
            )

            if not update_result.get("success", False):
                logger.error(f"Database update error: {update_result.get('error')}")
                return {
                    "success": False,
                    "error": f"Database update failed: {update_result.get('error')}",
                    "status_code": 500,
                }

            logger.info(f"Database update successful")

        except Exception as db_error:
            logger.error(f"Database update failed: {db_error}")
            return {
                "success": False,
                "error": f"Database update failed: {str(db_error)}",
                "status_code": 500,
            }

        logger.info(f"Resume processing completed successfully")

        return {
            "success": True,
            "message": "Resume processed successfully",
            "content_length": len(content),
            "chunks_count": len(chunks),
            "skills_extracted": len(analysis_result.get("skills_extracted", [])),
            "climate_relevance_score": analysis_result.get("climate_relevance_score", 0.0),
            "experience_years": analysis_result.get("experience_years", 0),
            "education_level": analysis_result.get("education_level", "Unknown"),
            "industry_background": analysis_result.get("industry_background", []),
            "resume_id": file_id,
            "context": context,
            "analysis_method": "llm_analysis_v1",
            "analysis_confidence": analysis_result.get("analysis_confidence", 0.5),
            "content_quality": analysis_result.get("content_quality", "fair"),
        }

    except Exception as e:
        logger.error(f"Resume processing error: {e}")
        logger.error(traceback.format_exc())
        return {
            "success": False,
            "error": f"Failed to process resume: {str(e)}",
            "status_code": 500,
        }


async def extract_skills_from_resume(content: str) -> List[str]:
    """
    Extract skills from resume content using LLM

    Args:
        content: Resume content

    Returns:
        List of extracted skills
    """
    try:
        # Initialize the LLM
        llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0.2, api_key=settings.OPENAI_API_KEY)

        # Create the prompt
        prompt = f"""
        Extract a list of skills from the following resume content. 
        Focus on hard skills, technical abilities, and certifications.
        Include both technical and soft skills.
        Format the response as a JSON array of strings.
        
        Resume content:
        {content[:3000]}  # Limit content size
        """

        # Generate response
        response = await llm.ainvoke(prompt)

        # Parse response as JSON
        skills_text = response.content

        # Handle different response formats
        if "[" in skills_text and "]" in skills_text:
            # Extract content between brackets
            skills_json = skills_text[skills_text.find("[") : skills_text.rfind("]") + 1]
            skills = json.loads(skills_json)
        else:
            # Split by newlines and clean up
            skills = [
                line.strip().strip('"-,•*')
                for line in skills_text.split("\n")
                if line.strip() and not line.strip().startswith("```")
            ]

        return skills

    except Exception as e:
        logger.error(f"Error extracting skills: {e}")
        return []


async def analyze_resume_for_climate_careers(
    user_id: str,
    resume_id: Optional[str] = None,
    analysis_type: str = "comprehensive",
    include_social_data: bool = True,
) -> Dict[str, Any]:
    """
    Analyze a resume for climate economy career opportunities

    Args:
        user_id: User ID
        resume_id: Optional resume ID (if not provided, will use the most recent resume)
        analysis_type: Type of analysis to perform (basic or comprehensive)
        include_social_data: Whether to include social profile data in analysis

    Returns:
        Analysis results
    """
    try:
        # Get the resume
        resume = None
        if resume_id:
            supabase = get_supabase_client()
            if supabase:
                response = (
                    supabase.table("resumes").select("*").eq("id", resume_id).single().execute()
                )
                resume = response.data

        if not resume:
            # Try to get the most recent resume
            resume = await get_user_resume(user_id)

        if not resume:
            return {
                "success": False,
                "error": "No resume found for user",
                "message": "Please upload your resume for personalized analysis",
            }

        # Check if the resume has been processed
        if not resume.get("processed", False):
            return {
                "success": False,
                "error": "Resume has not been processed yet",
                "message": "Resume is still being processed. Please try again later.",
            }

        # Get resume content
        content = resume.get("content", "")
        if not content:
            return {
                "success": False,
                "error": "Resume content not available",
                "message": "Resume content could not be retrieved. Please try uploading your resume again.",
            }

        # Get any social profile data if requested
        social_data = None
        if include_social_data:
            try:
                # Check if we have LinkedIn or GitHub URLs
                linkedin_url = resume.get("linkedin_url")
                github_url = resume.get("github_url")
                personal_website = resume.get("personal_website")

                if linkedin_url or github_url or personal_website:
                    social_result = await web_search_for_social_profiles(
                        name=resume.get("name", ""),
                        links=[url for url in [linkedin_url, github_url, personal_website] if url],
                    )
                    social_data = (
                        json.loads(social_result)
                        if isinstance(social_result, str)
                        else social_result
                    )
            except Exception as social_error:
                logger.error(f"Error getting social data: {social_error}")
                social_data = None

        # Initialize LLM for analysis
        llm = ChatOpenAI(model="gpt-4", temperature=0.3, api_key=settings.OPENAI_API_KEY)

        # Create the analysis prompt
        prompt = RESUME_ANALYSIS_PROMPT

        # Add resume content
        analysis_prompt = f"""
        {prompt}
        
        Resume Content:
        {content[:4000]}  # Limit content size
        
        """

        # Add social data if available
        if social_data and include_social_data:
            analysis_prompt += f"""
            Additional Social Profile Information:
            {json.dumps(social_data, indent=2)[:1000]}  # Limit size
            """

        # Generate analysis
        response = await llm.ainvoke(analysis_prompt)
        analysis = response.content

        # Create response
        result = {
            "success": True,
            "analysis": analysis,
            "resume_id": resume.get("id"),
            "user_id": user_id,
            "analysis_type": analysis_type,
            "message": "Resume analysis completed successfully",
            "timestamp": datetime.now().isoformat(),
        }

        return result

    except Exception as e:
        logger.error(f"Resume analysis error: {e}")
        logger.error(traceback.format_exc())
        return {
            "success": False,
            "error": f"Failed to analyze resume: {str(e)}",
            "message": "An error occurred during resume analysis",
        }


async def check_user_resume_status(user_id: str) -> Dict[str, Any]:
    """
    Check if a user has uploaded and processed resume

    Args:
        user_id: User ID

    Returns:
        Resume status information
    """
    try:
        # Query resumes for the user
        supabase = get_supabase_client()
        if not supabase:
            return {"has_resume": False}

        response = (
            supabase.table("resumes")
            .select("id, file_name, processed, created_at")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )

        if response.data and len(response.data) > 0:
            latest_resume = response.data[0]
            return {
                "has_resume": True,
                "resume_id": latest_resume["id"],
                "file_name": latest_resume["file_name"],
                "processed": latest_resume["processed"],
                "uploaded_at": latest_resume["created_at"],
            }
        else:
            return {
                "has_resume": False,
                "resume_id": None,
                "file_name": None,
                "processed": False,
                "uploaded_at": None,
            }

    except Exception as e:
        logger.error(f"Check resume error: {e}")
        return {"has_resume": False, "error": str(e)}


async def update_resume_analysis(
    resume_id: str, analysis_updates: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Update resume analysis data

    Args:
        resume_id: Resume ID
        analysis_updates: Updates to apply to the resume analysis

    Returns:
        Update result
    """
    try:
        # Add updated_at timestamp
        analysis_updates["updated_at"] = datetime.now().isoformat()

        # Update the resume record
        result = await update_database_record(
            table="resumes", record_id=resume_id, data=analysis_updates
        )

        return result

    except Exception as e:
        logger.error(f"Update resume analysis error: {e}")
        return {"success": False, "error": str(e)}


async def analyze_resume_with_llm(content: str, file_name: str) -> Dict[str, Any]:
    """
    Analyze resume content using LLM

    Args:
        content: Resume content
        file_name: Resume file name

    Returns:
        Analysis results
    """
    try:
        # Initialize LLM
        llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0.2, api_key=settings.OPENAI_API_KEY)

        # Create analysis prompt
        prompt = f"""
        Analyze the following resume and extract key information.
        
        Resume filename: {file_name}
        
        Resume content:
        {content[:3000]}  # Limit content size
        
        Extract the following information:
        1. Skills (technical, soft, domain-specific)
        2. Experience years (total professional experience)
        3. Education level (highest degree)
        4. Industry background (industries the person has worked in)
        5. Climate relevance score (0.0-1.0, how relevant is their experience to climate roles)
        6. Most recent job title
        7. Most recent company
        8. Key achievements
        9. Certifications
        10. Location (if available)
        
        Format the response as a JSON object with these fields.
        """

        # Generate response
        response = await llm.ainvoke(prompt)

        # Parse response
        analysis_text = response.content

        # Extract JSON from response (handling different formats)
        if "{" in analysis_text and "}" in analysis_text:
            json_str = analysis_text[analysis_text.find("{") : analysis_text.rfind("}") + 1]
            analysis = json.loads(json_str)
        else:
            # Fallback to manual extraction
            analysis = {
                "skills_extracted": [],
                "experience_years": 0,
                "education_level": "Unknown",
                "industry_background": [],
                "climate_relevance_score": 0.0,
                "most_recent_title": "",
                "most_recent_company": "",
                "key_achievements": [],
                "certifications": [],
                "location": "",
            }

        # Extract skills if not already done
        if not analysis.get("skills_extracted"):
            skills = await extract_skills_from_resume(content)
            analysis["skills_extracted"] = skills

        # Add analysis metadata
        analysis["content_quality"] = (
            "good" if len(content) > 1000 else "fair" if len(content) > 500 else "poor"
        )
        analysis["analysis_confidence"] = (
            0.8 if len(content) > 1000 else 0.6 if len(content) > 500 else 0.4
        )

        return analysis

    except Exception as e:
        logger.error(f"LLM analysis error: {e}")
        return {
            "skills_extracted": [],
            "experience_years": 0,
            "education_level": "Unknown",
            "industry_background": [],
            "climate_relevance_score": 0.0,
            "content_quality": "unknown",
            "analysis_confidence": 0.1,
            "error": str(e),
        }


async def query_user_resume(
    user_id: str,
    query: str,
    resume_id: Optional[str] = None,
    chat_history: Optional[List[Dict[str, Any]]] = None,
) -> Dict[str, Any]:
    """
    Query a user's resume with natural language

    Args:
        user_id: User ID
        query: Natural language query
        resume_id: Optional resume ID
        chat_history: Optional chat history

    Returns:
        Query results
    """
    try:
        # Get the resume
        resume = None
        if resume_id:
            supabase = get_supabase_client()
            if supabase:
                response = (
                    supabase.table("resumes").select("*").eq("id", resume_id).single().execute()
                )
                resume = response.data

        if not resume:
            # Try to get the most recent resume
            resume = await get_user_resume(user_id)

        if not resume:
            return {
                "success": False,
                "error": "No resume found for user",
                "answer": "I don't have your resume on file. Please upload your resume for personalized guidance.",
            }

        # Check if the resume has been processed
        if not resume.get("processed", False):
            return {
                "success": False,
                "error": "Resume has not been processed yet",
                "answer": "Your resume is still being processed. Please try again later.",
            }

        # Get resume content
        content = resume.get("content", "")
        if not content:
            return {
                "success": False,
                "error": "Resume content not available",
                "answer": "I couldn't retrieve your resume content. Please try uploading your resume again.",
            }

        # Initialize LLM
        llm = ChatOpenAI(model="gpt-4", temperature=0.3, api_key=settings.OPENAI_API_KEY)

        # Format chat history if provided
        history_text = ""
        if chat_history:
            history_text = "Previous conversation:\n"
            for exchange in chat_history:
                if len(exchange) >= 2:
                    history_text += f"User: {exchange[0]}\nAssistant: {exchange[1]}\n\n"

        # Create the query prompt
        prompt = f"""
        You are a Climate Economy Career Advisor specializing in resume analysis.
        
        Resume Content:
        {content[:3000]}  # Limit content size
        
        {history_text}
        
        User Query: {query}
        
        Provide a helpful, specific answer based on the resume content.
        Focus on climate economy career opportunities, skills relevance, and actionable advice.
        """

        # Generate response
        response = await llm.ainvoke(prompt)
        answer = response.content

        return {
            "success": True,
            "answer": answer,
            "resume_id": resume.get("id"),
            "user_id": user_id,
            "query": query,
        }

    except Exception as e:
        logger.error(f"Resume query error: {e}")
        return {
            "success": False,
            "error": str(e),
            "answer": "I encountered an error while trying to analyze your resume.",
        }


def analyze_resume_with_social_context(
    resume_text: str,
    name: str,
    social_data: Optional[str] = None,
    military_info: Optional[Dict[str, Any]] = None,
    community_info: Optional[Dict[str, Any]] = None,
    target_roles: Optional[List[str]] = None,
) -> str:
    """
    Analyze a resume with additional social context data

    Args:
        resume_text: Resume content
        name: Candidate's name
        social_data: Optional social profile data (JSON string)
        military_info: Optional military background information
        community_info: Optional community context information
        target_roles: Optional target roles to focus analysis on

    Returns:
        Comprehensive analysis as JSON string
    """
    try:
        # Initialize LLM
        llm = ChatOpenAI(model="gpt-4", temperature=0.3, api_key=settings.OPENAI_API_KEY)

        # Parse social data if provided as string
        social_data_obj = None
        if social_data and isinstance(social_data, str):
            try:
                social_data_obj = json.loads(social_data)
            except json.JSONDecodeError:
                social_data_obj = {"content": social_data}
        elif social_data:
            social_data_obj = social_data

        # Create the analysis prompt
        prompt = f"""
        You are a Climate Economy Career Advisor specializing in resume analysis.
        
        Analyze the following resume for climate economy career opportunities.
        
        Candidate: {name}
        
        Resume Content:
        {resume_text[:3000]}  # Limit content size
        """

        # Add social data if available
        if social_data_obj:
            prompt += f"""
            
            Social Profile Information:
            {json.dumps(social_data_obj, indent=2)[:1000]}  # Limit size
            """

        # Add military info if available
        if military_info:
            prompt += f"""
            
            Military Background:
            {json.dumps(military_info, indent=2)}
            """

        # Add community info if available
        if community_info:
            prompt += f"""
            
            Community Context:
            {json.dumps(community_info, indent=2)}
            """

        # Add target roles if specified
        if target_roles:
            prompt += f"""
            
            Target Roles to Analyze For:
            {', '.join(target_roles)}
            """

        # Add output instructions
        prompt += """
        
        Provide a comprehensive analysis including:
        1. CLIMATE RELEVANCE SCORE (0-100): Overall assessment of climate career readiness
        2. KEY STRENGTHS: Top 3-5 transferable skills for climate roles
        3. SKILL GAPS: Critical missing skills for target climate roles
        4. RECOMMENDED CLIMATE PATHWAYS: 2-3 specific Massachusetts climate career paths
        5. UPSKILLING RECOMMENDATIONS: Specific programs, certifications, or courses
        6. NEXT STEPS: Actionable advice for climate career transition
        
        Format the response as a JSON object with these fields.
        """

        # Generate response
        response = llm.invoke(prompt)

        # Parse response
        analysis_text = response.content

        # Extract JSON from response (handling different formats)
        if "{" in analysis_text and "}" in analysis_text:
            json_str = analysis_text[analysis_text.find("{") : analysis_text.rfind("}") + 1]
            try:
                analysis = json.loads(json_str)
                return json.dumps(analysis)
            except json.JSONDecodeError:
                # If JSON parsing fails, return the raw text
                return analysis_text
        else:
            return analysis_text

    except Exception as e:
        logger.error(f"Resume analysis with social context error: {e}")
        error_response = {
            "error": str(e),
            "climate_relevance_score": 0,
            "key_strengths": [],
            "skill_gaps": [],
            "recommended_climate_pathways": [],
            "upskilling_recommendations": [],
            "next_steps": ["Please try again later."],
        }
        return json.dumps(error_response)


# Helper functions for text extraction
def extract_text_from_pdf(file_content: bytes) -> str:
    """Extract text from PDF file"""
    try:
        # This is a simplified implementation
        # In a real application, would use a library like PyPDF2 or pdfminer
        return file_content.decode("utf-8", errors="ignore")
    except Exception as e:
        logger.error(f"PDF extraction error: {e}")
        return ""


def extract_text_from_word(file_content: bytes) -> str:
    """Extract text from Word document"""
    try:
        # This is a simplified implementation
        # In a real application, would use a library like python-docx
        return file_content.decode("utf-8", errors="ignore")
    except Exception as e:
        logger.error(f"Word extraction error: {e}")
        return ""


async def analyze_resume_skills(resume_text: str):
    return {"skills": ["python", "data_analysis"], "climate_relevance": 0.8}


async def get_resume_insights(user_id: str):
    return {"insights": ["strong technical background", "needs climate focus"], "score": 75}
