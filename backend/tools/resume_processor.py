"""
Production Resume Processor - FREE Semantic Analysis & Database Storage
Purpose: Robust LLM-based resume processing with semantic chunking and structured data extraction
Location: /backend/tools/resume_processor.py

Features:
- Semantic section identification
- FREE LLM-based skills extraction (HuggingFace/Groq)
- Climate relevance scoring
- Structured data extraction
- FREE vector embeddings (sentence-transformers)
- Database storage
"""

import json
import re
import asyncio
from typing import Dict, List, Any, Optional
from datetime import datetime
import logging
from pathlib import Path

# FREE model imports - prioritize these
try:
    from sentence_transformers import SentenceTransformer
    from transformers import pipeline, AutoTokenizer, AutoModelForCausalLM
except ImportError:
    pass

# Fallback imports
from langchain_openai import ChatOpenAI, OpenAIEmbeddings

from backend.config.environment import get_settings
from backend.config.supabase import get_supabase_client

logger = logging.getLogger(__name__)
settings = get_settings()


class ProductionResumeProcessor:
    """Production-grade resume processor with FREE semantic analysis"""

    def __init__(self):
        logger.info("🚀 Initializing cost-optimized resume processor...")

        # Initialize with DeepSeek for cost optimization
        self.llm = None
        self.embeddings_model = None
        
        try:
            from backend.adapters.models import create_langchain_llm

            # Force DeepSeek usage (90% cheaper than OpenAI)
            self.llm = create_langchain_llm(
                provider="deepseek", model="deepseek-chat", temperature=0.1
            )
            logger.info("💰 Using DeepSeek LLM")

            # Try free embeddings first
            try:
                from sentence_transformers import SentenceTransformer
                self.embeddings_model = SentenceTransformer("all-MiniLM-L6-v2")
                logger.info("✅ Using FREE sentence-transformers embeddings")
            except ImportError:
                # Fallback to OpenAI embeddings if needed
                self.embeddings = OpenAIEmbeddings(api_key=settings.OPENAI_API_KEY)
                logger.warning("💸 Using OpenAI embeddings as fallback")

        except Exception as e:
            logger.error(f"❌ Resume processor initialization failed: {e}")
            raise Exception(f"Failed to initialize resume processor: {e}")

        self.supabase = get_supabase_client()
        logger.info("✅ Resume processor initialized successfully")

    async def invoke_llm(self, prompt: str) -> str:
        """Unified LLM invocation method for different model types"""
        try:
            # Use LangChain LLM (DeepSeek/OpenAI)
            response = await self.llm.ainvoke(prompt)
            return (
                response.content if hasattr(response, "content") else str(response)
            )
        except Exception as e:
            logger.error(f"LLM invocation failed: {e}")
            return ""

    async def generate_embeddings(self, text: str) -> List[float]:
        """Generate embeddings using free or paid models"""
        try:
            if hasattr(self, "embeddings_model"):
                # Use FREE sentence-transformers
                return self.embeddings_model.encode(text).tolist()
            else:
                # Use OpenAI embeddings as fallback
                embedding = await self.embeddings.aembed_query(text)
                return embedding
        except Exception as e:
            logger.error(f"Embedding generation failed: {e}")
            return []

    async def process_resume(
        self, user_id: str, file_content: str, filename: str
    ) -> Dict[str, Any]:
        """
        Main processing function - handles complete resume analysis pipeline

        Args:
            user_id: User ID
            file_content: Extracted text content from resume
            filename: Original filename

        Returns:
            Processing results with analysis data
        """
        try:
            logger.info(f"🚀 Starting semantic resume processing for user: {user_id}")

            # Step 1: Create semantic chunks with section identification
            chunks = await self.create_semantic_chunks(file_content, filename)
            logger.info(f"📄 Created {len(chunks)} semantic chunks")

            # Step 2: Extract structured data using LLM
            structured_data = await self.extract_structured_data(file_content)
            logger.info(
                f"🧠 Extracted structured data: {len(structured_data.get('skills', []))} skills"
            )

            # Step 3: Calculate climate relevance score
            climate_score = await self.calculate_climate_relevance(
                file_content, structured_data.get("skills", [])
            )
            logger.info(f"🌿 Climate relevance score: {climate_score}")

            # Step 4: Store resume record in database
            resume_id = await self.store_resume_record(
                user_id=user_id,
                filename=filename,
                content=file_content,
                structured_data=structured_data,
                climate_score=climate_score,
                chunk_count=len(chunks),
            )
            logger.info(f"💾 Stored resume record: {resume_id}")

            # Step 5: Generate and store embeddings for chunks
            await self.store_resume_chunks(resume_id, chunks)
            logger.info(f"🔗 Stored {len(chunks)} chunks with embeddings")

            # Step 6: Update processing status
            await self.update_processing_status(resume_id, "completed")
            logger.info(f"✅ Resume processing completed successfully")

            return {
                "success": True,
                "resume_id": resume_id,
                "chunks_processed": len(chunks),
                "skills_extracted": len(structured_data.get("skills", [])),
                "climate_relevance_score": climate_score,
                "message": "Resume processed successfully with semantic analysis",
            }

        except Exception as e:
            logger.error(f"❌ Resume processing failed: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "message": "Resume processing failed",
            }

    async def create_semantic_chunks(
        self, content: str, filename: str
    ) -> List[Dict[str, Any]]:
        """Create semantically meaningful chunks from resume content"""
        chunks = []

        # Step 1: Identify document structure and sections
        sections = self.identify_resume_sections(content)

        # Step 2: Process each section into appropriate chunks
        for section_name, section_text in sections.items():
            if not section_text or len(section_text.strip()) < 20:
                continue

            if section_name.lower() in ["summary", "objective", "profile"]:
                chunks.append(
                    {
                        "text": section_text.strip(),
                        "metadata": {
                            "type": "section",
                            "section": section_name,
                            "importance": 0.9,
                            "context": f"From {section_name} section of resume: {filename}",
                        },
                    }
                )
            elif section_name.lower() in [
                "experience",
                "work experience",
                "employment",
            ]:
                job_chunks = self.split_experience_section(section_text)
                for i, job_chunk in enumerate(job_chunks):
                    chunks.append(
                        {
                            "text": job_chunk.strip(),
                            "metadata": {
                                "type": "experience",
                                "section": section_name,
                                "position": i,
                                "importance": 0.8,
                                "context": f"From {section_name} section, job position {i+1} of resume: {filename}",
                            },
                        }
                    )
            elif section_name.lower() in ["skills", "technical skills", "competencies"]:
                chunks.append(
                    {
                        "text": section_text.strip(),
                        "metadata": {
                            "type": "skills",
                            "section": section_name,
                            "importance": 0.9,
                            "context": f"From {section_name} section of resume: {filename}",
                        },
                    }
                )
            else:
                other_chunks = self.split_by_paragraphs(
                    section_text, min_size=200, max_size=1000
                )
                for i, other_chunk in enumerate(other_chunks):
                    chunks.append(
                        {
                            "text": other_chunk.strip(),
                            "metadata": {
                                "type": "other",
                                "section": section_name,
                                "position": i,
                                "importance": 0.6,
                                "context": f"From {section_name} section, paragraph {i+1} of resume: {filename}",
                            },
                        }
                    )

        return chunks

    def identify_resume_sections(self, content: str) -> Dict[str, str]:
        """Identify common resume sections using pattern matching"""
        section_patterns = [
            (
                r"(?i)(?:^|\n\n)(SUMMARY|PROFESSIONAL SUMMARY|CAREER SUMMARY|PROFILE|OBJECTIVE)(?::|\.|\n)",
                "Summary",
            ),
            (
                r"(?i)(?:^|\n\n)(EXPERIENCE|WORK EXPERIENCE|EMPLOYMENT|PROFESSIONAL EXPERIENCE|WORK HISTORY)(?::|\.|\n)",
                "Experience",
            ),
            (
                r"(?i)(?:^|\n\n)(EDUCATION|ACADEMIC BACKGROUND|QUALIFICATIONS|ACADEMIC QUALIFICATIONS)(?::|\.|\n)",
                "Education",
            ),
            (
                r"(?i)(?:^|\n\n)(SKILLS|TECHNICAL SKILLS|KEY SKILLS|CORE COMPETENCIES|COMPETENCIES)(?::|\.|\n)",
                "Skills",
            ),
            (
                r"(?i)(?:^|\n\n)(PROJECTS|PROJECT EXPERIENCE|KEY PROJECTS)(?::|\.|\n)",
                "Projects",
            ),
            (
                r"(?i)(?:^|\n\n)(CERTIFICATIONS|CERTIFICATES|PROFESSIONAL CERTIFICATIONS)(?::|\.|\n)",
                "Certifications",
            ),
        ]

        sections = {}
        content_lines = content.split("\n")
        current_section = "Other"
        current_content = []

        for line in content_lines:
            matched_section = None
            for pattern, section_name in section_patterns:
                if re.search(pattern, line):
                    matched_section = section_name
                    break

            if matched_section:
                # Save previous section
                if current_content:
                    sections[current_section] = "\n".join(current_content)

                # Start new section
                current_section = matched_section
                current_content = [line]
            else:
                current_content.append(line)

        # Save last section
        if current_content:
            sections[current_section] = "\n".join(current_content)

        return sections

    def split_experience_section(self, experience_text: str) -> List[str]:
        """Split experience section by job positions"""
        # Look for job titles/companies (lines that might indicate new positions)
        lines = experience_text.split("\n")
        chunks = []
        current_chunk = []

        for line in lines:
            # Heuristic: if line looks like a job title/company (contains certain patterns)
            if re.search(
                r"\b(Manager|Engineer|Analyst|Director|Coordinator|Specialist|Lead|Senior|Junior)\b",
                line,
                re.I,
            ):
                if current_chunk:
                    chunks.append("\n".join(current_chunk))
                current_chunk = [line]
            else:
                current_chunk.append(line)

        if current_chunk:
            chunks.append("\n".join(current_chunk))

        return chunks if chunks else [experience_text]

    def split_by_paragraphs(
        self, text: str, min_size: int = 200, max_size: int = 800
    ) -> List[str]:
        """Split text into paragraph chunks"""
        paragraphs = text.split("\n\n")
        chunks = []
        current_chunk = ""

        for para in paragraphs:
            if len(current_chunk + para) < max_size:
                current_chunk += para + "\n\n"
            else:
                if len(current_chunk) >= min_size:
                    chunks.append(current_chunk.strip())
                current_chunk = para + "\n\n"

        if len(current_chunk) >= min_size:
            chunks.append(current_chunk.strip())

        return chunks if chunks else [text]

    async def extract_structured_data(self, content: str) -> Dict[str, Any]:
        """Extract structured data using LLM semantic analysis"""

        prompt = f"""
        You are an expert resume analyzer. Extract structured information from this resume content.

        Analyze the resume and extract the following information in JSON format:

        {{
            "contact_info": {{
                "name": "Full Name",
                "email": "email@example.com",
                "phone": "phone number",
                "location": "city, state"
            }},
            "skills": ["skill1", "skill2", "skill3"],
            "experience_years": 5,
            "education_level": "Bachelor's|Master's|PhD|High School|Other",
            "industries": ["industry1", "industry2"],
            "job_titles": ["title1", "title2"],
            "certifications": ["cert1", "cert2"],
            "climate_keywords": ["keyword1", "keyword2"],
            "summary": "Brief professional summary"
        }}

        Focus on:
        - Technical and soft skills
        - Climate/sustainability related experience
        - Years of professional experience
        - Industry experience
        - Educational background

        Resume content:
        {content[:4000]}
        """

        try:
            response = await self.invoke_llm(prompt)

            # Parse JSON response
            response_text = response
            if "```json" in response_text:
                json_start = response_text.find("```json") + 7
                json_end = response_text.find("```", json_start)
                json_text = response_text[json_start:json_end]
            else:
                json_text = response_text

            structured_data = json.loads(json_text)
            return structured_data

        except Exception as e:
            logger.error(f"Error extracting structured data: {e}")
            return {
                "contact_info": {},
                "skills": [],
                "experience_years": 0,
                "education_level": "Unknown",
                "industries": [],
                "job_titles": [],
                "certifications": [],
                "climate_keywords": [],
                "summary": "",
            }

    async def calculate_climate_relevance(
        self, content: str, skills: List[str]
    ) -> float:
        """Calculate climate relevance score using LLM analysis"""

        prompt = f"""
        Analyze this resume for relevance to climate economy careers. Rate from 0-10.

        Consider:
        - Clean energy experience
        - Sustainability projects
        - Environmental roles
        - Climate-related skills
        - Green technology experience
        - Policy/regulation experience
        - Research in climate fields

        Skills: {', '.join(skills[:20])}
        
        Resume content:
        {content[:3000]}
        
        Provide ONLY a number from 0-10 (decimal allowed, e.g., 7.5).
        """

        try:
            response = await self.invoke_llm(prompt)
            score_text = response.strip()

            # Extract number from response
            import re

            numbers = re.findall(r"\d+\.?\d*", score_text)
            if numbers:
                score = float(numbers[0])
                return min(10.0, max(0.0, score))  # Clamp between 0-10

            return 0.0

        except Exception as e:
            logger.error(f"Error calculating climate relevance: {e}")
            return 0.0

    async def store_resume_record(
        self,
        user_id: str,
        filename: str,
        content: str,
        structured_data: Dict[str, Any],
        climate_score: float,
        chunk_count: int,
    ) -> str:
        """Store resume record in Supabase"""

        try:
            resume_data = {
                "user_id": user_id,
                "file_name": filename,  # Fixed: database column is file_name not filename
                "content": content,
                "skills_extracted": structured_data.get("skills", []),
                "climate_relevance_score": climate_score,
                "experience_years": structured_data.get("experience_years", 0),
                "education_level": structured_data.get("education_level", "Unknown"),
                "industries": structured_data.get("industries", []),
                "job_titles": structured_data.get("job_titles", []),
                "certifications": structured_data.get("certifications", []),
                "contact_info": structured_data.get("contact_info", {}),
                "processing_status": "processing",
                "chunk_count": chunk_count,
                "processed_at": datetime.utcnow().isoformat(),
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat(),
            }

            result = self.supabase.table("resumes").insert(resume_data).execute()
            return result.data[0]["id"]

        except Exception as e:
            logger.error(f"Error storing resume record: {e}")
            raise

    async def store_resume_chunks(self, resume_id: str, chunks: List[Dict[str, Any]]):
        """Store resume chunks with embeddings in Supabase"""

        try:
            chunk_records = []

            for i, chunk in enumerate(chunks):
                # Generate embedding for chunk text
                embedding = await self.generate_embeddings(chunk["text"])

                chunk_record = {
                    "resume_id": resume_id,
                    "content": chunk["text"],
                    "chunk_index": i,
                    "section_type": chunk["metadata"].get("section", "unknown"),
                    "importance_score": chunk["metadata"].get("importance", 0.5),
                    "metadata": chunk["metadata"],
                    "embedding": embedding,
                    "created_at": datetime.utcnow().isoformat(),
                }
                chunk_records.append(chunk_record)

            # Batch insert chunks
            self.supabase.table("resume_chunks").insert(chunk_records).execute()

        except Exception as e:
            logger.error(f"Error storing resume chunks: {e}")
            raise

    async def update_processing_status(self, resume_id: str, status: str):
        """Update processing status of resume"""

        try:
            self.supabase.table("resumes").update(
                {
                    "processing_status": status,
                    "updated_at": datetime.utcnow().isoformat(),
                }
            ).eq("id", resume_id).execute()

        except Exception as e:
            logger.error(f"Error updating processing status: {e}")
            raise


# Export the main processor class
__all__ = ["ProductionResumeProcessor"]
