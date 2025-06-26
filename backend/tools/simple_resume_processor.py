"""
Simple Resume Processor - Clean implementation without transformers dependency
"""

import logging
from typing import Dict, Any, List
from datetime import datetime
import json

from langchain_openai import OpenAIEmbeddings
from backend.config.environment import get_settings
from backend.config.supabase import get_supabase_client

logger = logging.getLogger(__name__)
settings = get_settings()


class SimpleResumeProcessor:
    """Simple resume processor using only DeepSeek + basic processing"""

    def __init__(self):
        logger.info("🚀 Initializing simple resume processor...")

        try:
            from backend.adapters.models import create_langchain_llm

            # Use DeepSeek for cost optimization
            self.llm = create_langchain_llm(
                provider="deepseek", model="deepseek-chat", temperature=0.1
            )
            
            # Use OpenAI embeddings as fallback (since sentence-transformers causing issues)
            self.embeddings = OpenAIEmbeddings(api_key=settings.OPENAI_API_KEY)
            
            logger.info("✅ Using DeepSeek LLM + OpenAI embeddings")

        except Exception as e:
            logger.error(f"❌ Initialization failed: {e}")
            raise Exception(f"Failed to initialize processor: {e}")

        self.supabase = get_supabase_client()

    async def process_resume(
        self, user_id: str, file_content: str, filename: str
    ) -> Dict[str, Any]:
        """Simple resume processing"""
        try:
            logger.info(f"🚀 Processing resume for user: {user_id}")

            # Simple text chunking
            chunks = self.create_simple_chunks(file_content, filename)
            
            # Extract basic structured data
            structured_data = await self.extract_basic_data(file_content)
            
            # Calculate basic climate score
            climate_score = await self.calculate_basic_climate_score(file_content)
            
            # Store resume record
            resume_id = await self.store_resume_record(
                user_id, filename, file_content, structured_data, climate_score, len(chunks)
            )
            
            # Store chunks with embeddings
            await self.store_chunks(resume_id, chunks)
            
            logger.info(f"✅ Resume processed successfully: {resume_id}")
            
            return {
                "success": True,
                "resume_id": resume_id,
                "chunks_processed": len(chunks),
                "skills_extracted": len(structured_data.get("skills", [])),
                "climate_relevance_score": climate_score,
                "message": "Resume processed successfully"
            }

        except Exception as e:
            logger.error(f"❌ Processing failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "message": "Resume processing failed"
            }

    def create_simple_chunks(self, content: str, filename: str) -> List[Dict[str, Any]]:
        """Create simple text chunks"""
        chunks = []
        paragraphs = content.split('\n\n')
        
        for i, paragraph in enumerate(paragraphs):
            if len(paragraph.strip()) > 50:
                chunks.append({
                    "text": paragraph.strip(),
                    "metadata": {
                        "chunk_index": i,
                        "filename": filename,
                        "type": "paragraph"
                    }
                })
        
        return chunks

    async def extract_basic_data(self, content: str) -> Dict[str, Any]:
        """Extract basic structured data"""
        prompt = f"""
        Extract skills and basic info from this resume in JSON format:
        
        {{"skills": ["skill1", "skill2"], "experience_years": 0, "education_level": "Unknown"}}
        
        Resume: {content[:2000]}
        
        Return ONLY valid JSON:
        """
        
        try:
            response = await self.llm.ainvoke(prompt)
            content_text = response.content if hasattr(response, 'content') else str(response)
            
            # Try to parse JSON
            if "```json" in content_text:
                json_start = content_text.find("```json") + 7
                json_end = content_text.find("```", json_start)
                json_text = content_text[json_start:json_end]
            else:
                json_text = content_text
                
            return json.loads(json_text)
        except:
            return {"skills": [], "experience_years": 0, "education_level": "Unknown"}

    async def calculate_basic_climate_score(self, content: str) -> float:
        """Calculate basic climate relevance score"""
        climate_keywords = [
            "renewable", "solar", "wind", "climate", "sustainability", "clean energy",
            "environmental", "green", "carbon", "emission", "recycling"
        ]
        
        content_lower = content.lower()
        score = sum(1 for keyword in climate_keywords if keyword in content_lower)
        return min(10.0, score * 1.5)

    async def store_resume_record(
        self, user_id: str, filename: str, content: str, 
        structured_data: Dict[str, Any], climate_score: float, chunk_count: int
    ) -> str:
        """Store resume record"""
        resume_data = {
            "user_id": user_id,
            "filename": filename,
            "content": content,
            "skills_extracted": structured_data.get("skills", []),
            "climate_relevance_score": climate_score,
            "experience_years": structured_data.get("experience_years", 0),
            "education_level": structured_data.get("education_level", "Unknown"),
            "chunk_count": chunk_count,
            "processing_status": "completed",
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
        }

        result = self.supabase.table("resumes").insert(resume_data).execute()
        return result.data[0]["id"]

    async def store_chunks(self, resume_id: str, chunks: List[Dict[str, Any]]):
        """Store chunks with embeddings"""
        chunk_records = []
        
        for i, chunk in enumerate(chunks):
            # Generate embedding
            embedding = await self.embeddings.aembed_query(chunk["text"])
            
            chunk_record = {
                "resume_id": resume_id,
                "content": chunk["text"],
                "chunk_index": i,
                "metadata": chunk["metadata"],
                "embedding": embedding,
                "created_at": datetime.utcnow().isoformat(),
            }
            chunk_records.append(chunk_record)
        
        if chunk_records:
            self.supabase.table("resume_chunks").insert(chunk_records).execute()


# Export the simple processor
__all__ = ["SimpleResumeProcessor"] 