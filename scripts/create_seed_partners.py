#!/usr/bin/env python3
"""
Climate Economy Seed Partners Creation Script

Creates seed partner accounts with proper auth.users and profiles records
based on real current data from partner websites (June 2025), including 
AI-optimized PDF ingestion, embeddings creation, and comprehensive resources.
"""

import os
import asyncio
import logging
import json
from datetime import datetime, timezone
from typing import List, Dict, Any, Tuple, Optional
from pathlib import Path
from dotenv import load_dotenv

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

try:
    from supabase import create_client
    import openai
    from openai import OpenAI
    import pypdf
    from pypdf import PdfReader
    import requests
    import io
    import re
    import hashlib
    import uuid
    from urllib.parse import urlparse, urljoin
except ImportError as e:
    logger.error(f"Missing required dependency: {e}")
    logger.error("Please install with: pip install -r requirements.txt")
    exit(1)

# Initialize clients
try:
    # Get Supabase credentials from environment
    supabase_url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    
    logger.info(f"Connecting to Supabase: {supabase_url}")
    
    # Try to create client with basic options only
    from supabase.lib.client_options import ClientOptions
    options = ClientOptions()
    supabase = create_client(supabase_url, supabase_key, options)
    
    # Try to get OpenAI API key from environment, or use a placeholder
    openai_api_key = os.environ.get("OPENAI_API_KEY")
    if not openai_api_key:
        logger.warning("OPENAI_API_KEY not found in environment. Some features may not work.")
        # Create a dummy client for testing
        openai_client = None
    else:
        openai_client = OpenAI(api_key=openai_api_key)
        logger.info("OpenAI client initialized successfully")
        
except Exception as e:
    logger.error(f"Failed to initialize clients: {e}")
    import traceback
    logger.error(f"Traceback: {traceback.format_exc()}")
    exit(1)

# PDF Configuration with full file paths
PDFS_DIR = Path("/Users/georgenekwaya/Downloads/projects_genai/climate_economy_ecosystem/temp_repo_clean/pdfs")

# Climate domain knowledge resources (PDFs to be ingested)
CLIMATE_DOMAIN_RESOURCES = [
    {
        "file": PDFS_DIR / "NECEC_2023_Annual_Report.pdf",
        "title": "NECEC 2023 Annual Report",
        "domain": "policy",
        "topics": ["clean_energy_economy", "massachusetts_policy", "energy_transition"],
        "description": "Comprehensive annual report on New England Clean Energy Council activities and clean energy economy growth"
    },
    {
        "file": PDFS_DIR / "Powering_the_Future_A_Massachusetts_Clean_Energy_Workforce_Needs_Assessment_Final.pdf", 
        "title": "Powering the Future: A Massachusetts Clean Energy Workforce Needs Assessment",
        "domain": "workforce",
        "topics": ["clean_energy_jobs", "skills_gap", "workforce_development"],
        "description": "Detailed workforce analysis identifying skill gaps and training needs in Massachusetts clean energy sector"
    }
]

# Real current partner data from June 2025 web searches - MATCHING SETUP.MD EXACTLY
PARTNERS_DATA_2025 = {
    "tps_energy": {
        "name": "TPS Energy",
        "organization_type": "employer",
        "website": "https://tps-energy.com/",
        "description": "Leading solar installation and renewable energy company in Massachusetts, specializing in residential and commercial solar projects with focus on workforce development.",
        "climate_focus": ["solar", "energy_efficiency"],
        "partnership_level": "standard",
        "contact_info": {
            "email": "careers@tpsenergy.com",
            "phone": "978-204-0530",
            "address": "Woburn, MA"
        },
        "current_programs": [
            {
                "title": "Solar Installation Technician Training",
                "type": "job_training",
                "description": "Hands-on solar panel installation training with NABCEP certification prep",
                "requirements": ["High school diploma", "Physical fitness", "Willingness to work at heights"],
                "duration": "8 weeks",
                "cost": "Free for qualified candidates",
                "next_cohort": "July 2025"
            }
        ]
    },
    
    "franklin_cummings": {
        "name": "Franklin Cummings Tech",
        "organization_type": "education",
        "website": "https://franklincummings.edu/",
        "description": "Private technical college offering career-focused programs in renewable energy, HVAC, and green building technologies with emphasis on hands-on learning.",
        "climate_focus": ["renewable_energy", "energy_efficiency", "technical_education"],
        "partnership_level": "premium",
        "contact_info": {
            "email": "admissions@fctinc.org",
            "phone": "617-423-4630",
            "address": "41 Berkeley Street, Boston, MA 02116"
        },
        "current_programs": [
            {
                "title": "Renewable Energy Technology Associate Degree",
                "type": "education",
                "description": "Comprehensive 18-month program covering solar, wind, and energy storage systems",
                "accreditation": "NEASC accredited",
                "duration": "18 months",
                "start_dates": ["September 2025", "January 2026"]
            }
        ]
    },
    
    "urban_league_eastern_ma": {
        "name": "Urban League of Eastern Massachusetts",
        "organization_type": "community",
        "website": "https://www.ulem.org/",
        "description": "Community organization providing workforce development and job placement services with focus on equity and diversity in clean energy careers.",
        "climate_focus": ["workforce_development", "equity"],
        "partnership_level": "standard",
        "contact_info": {
            "email": "info@ulem.org",
            "phone": "617-442-4519",
            "address": "Boston, MA"
        },
        "current_programs": [
            {
                "title": "Clean Energy Career Pathways Program",
                "type": "workforce_development",
                "description": "Comprehensive workforce development program connecting community members to clean energy careers",
                "target_audience": ["ej_communities", "career_changers"],
                "duration": "12 weeks",
                "support_services": ["Career coaching", "Job placement", "Skills training"]
            }
        ]
    },
    
    "headlamp": {
        "name": "Headlamp",
        "organization_type": "community",
        "website": "https://myheadlamp.com/",
        "description": "Career guidance platform and veteran transition accelerator specializing in clean energy careers, with DOD SkillBridge program and innovative talent platform.",
        "climate_focus": ["career_guidance", "workforce_development"],
        "partnership_level": "standard",
        "contact_info": {
            "email": "info@headlamp.io",
            "address": "Massachusetts"
        },
        "current_programs": [
            {
                "title": "Clean Energy Career Guidance Program",
                "type": "career_guidance",
                "description": "Personalized career guidance and pathway mapping for clean energy careers",
                "target_audience": ["veterans", "career_changers"],
                "format": "Online platform with coaching support"
            },
            {
                "title": "DOD SkillBridge Program",
                "type": "apprenticeship",
                "description": "DOD SkillBridge renewal approved until May 2027 for veteran transitions to clean energy",
                "duration": "Up to 6 months",
                "target_audience": ["veterans", "military_transitioning"],
                "status": "Active through May 2027",
                "compensation": "Military pay continues during program"
            }
        ]
    },
    
    "african_bridge_network": {
        "name": "African Bridge Network",
        "organization_type": "community",
        "website": "https://africanbn.org/",
        "description": "Supporting immigrant professionals transition to clean energy careers through fellowship programs and workforce development initiatives, celebrating 10th anniversary in 2025.",
        "climate_focus": ["immigrant_professionals", "workforce_integration"],
        "partnership_level": "standard",
        "contact_info": {
            "email": "info@africanbridgenetwork.org",
            "phone": "617-442-7440",
            "address": "Boston, MA"
        },
        "current_programs": [
            {
                "title": "Immigrant Professionals Fellowship for Clean Energy",
                "type": "fellowship",
                "description": "Supporting healthcare and research professionals transitioning to clean energy careers",
                "target_audience": ["immigrant_professionals", "healthcare_workers", "researchers"],
                "focus_areas": ["Career transition", "Professional development", "Clean energy sector orientation"],
                "duration": "6 months",
                "next_orientation": "June 28, 2025 at MassHire Metro North"
            }
        ]
    },
    
    "masshire_career_centers": {
        "name": "MassHire Career Centers",
        "organization_type": "government",
        "website": "https://www.mass.gov/masshire-career-centers",
        "description": "Statewide network of 25+ career centers providing workforce development services including sustainable energy training and JobQuest platform.",
        "climate_focus": ["workforce_development", "job_placement"],
        "partnership_level": "founding",
        "contact_info": {
            "email": "masshire@mass.gov",
            "phone": "617-626-5300",
            "address": "Statewide - 25+ locations"
        },
        "current_programs": [
            {
                "title": "Sustainable Energy Pre-Apprenticeship TRADES Training",
                "type": "pre_apprenticeship",
                "description": "Comprehensive pre-apprenticeship training for sustainable energy careers",
                "duration": "June-August 2025",
                "focus_areas": ["Solar installation", "Energy efficiency", "Green building"],
                "certification": "Industry-recognized credentials",
                "career_pathways": ["Solar installer", "Energy auditor", "Green building technician"]
            },
            {
                "title": "JobQuest Platform Access",
                "type": "job_placement",
                "description": "Digital platform connecting job seekers with clean energy employers",
                "features": ["Job matching", "Skills assessment", "Career coaching"],
                "availability": "All MassHire locations statewide"
            }
        ]
    },
    
    "masscec": {
        "name": "Massachusetts Clean Energy Center",
        "organization_type": "government",
        "website": "https://www.masscec.com/",
        "description": "State agency accelerating clean energy adoption and workforce development, with comprehensive internship and training programs.",
        "climate_focus": ["clean_energy", "workforce_development", "equity", "offshore_wind"],
        "partnership_level": "founding",
        "contact_info": {
            "email": "info@masscec.com",
            "phone": "617-315-9300",
            "address": "294 Washington St, Boston, MA 02108"
        },
        "current_programs": [
            {
                "title": "Clean Energy Internship Program",
                "type": "internship",
                "description": "Paid internships at 600+ clean energy companies with wage reimbursement for employers",
                "stats": "5,000+ students placed since inception",
                "reimbursement": "$4,320/intern (fall/spring), $8,640/intern (summer)",
                "application_status": "Summer 2025 applications open"
            },
            {
                "title": "MassCEC Equity Program",
                "type": "workforce_development",
                "description": "Targeted workforce development programs for environmental justice communities",
                "target_audience": ["ej_communities", "underrepresented_groups"],
                "focus_areas": ["Clean energy careers", "Skills development", "Job placement"],
                "partnerships": ["Community organizations", "Educational institutions"]
            }
        ]
    },
    
    "alliance_climate_transition": {
        "name": "Alliance for Climate Transition (ACT)",
        "organization_type": "nonprofit",
        "website": "https://www.joinact.org/",
        "description": "Nonprofit organization focusing on climate action and community-driven initiatives for sustainable economic transition.",
        "climate_focus": ["climate_action", "community_initiatives"],
        "partnership_level": "standard",
        "contact_info": {
            "email": "info@joinact.org",
            "address": "Massachusetts"
        },
        "current_programs": [
            {
                "title": "Community Climate Action Initiative",
                "type": "community_engagement",
                "description": "Community-driven climate action programs and sustainable economic development",
                "target_audience": ["community_members", "climate_advocates"],
                "focus_areas": ["Climate education", "Community organizing", "Sustainable development"],
                "format": "Community workshops and action projects"
            }
        ]
    }
}

class AIOptimizedChunker:
    """
    Optimized chunking strategy for AI agents focusing on:
    - Semantic coherence for better embeddings
    - Agent-specific context preservation
    - Structured metadata for intelligent retrieval
    """
    
    def __init__(self, max_chunk_size=1500, overlap_size=200):
        self.max_chunk_size = max_chunk_size  # Optimized for AI context windows
        self.overlap_size = overlap_size
        
    def chunk_content(self, content: str, source_metadata: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Create AI-optimized chunks with enhanced metadata."""
        
        # Clean and preprocess content
        content = self._preprocess_content(content)
        
        # Detect content type and structure
        content_type = self._detect_content_type(content)
        
        if content_type == "structured":
            chunks = self._chunk_structured_content(content, source_metadata)
        else:
            chunks = self._chunk_semantic_content(content, source_metadata)
            
        return chunks
    
    def _preprocess_content(self, content: str) -> str:
        """Clean content for better AI processing."""
        # Remove excessive whitespace
        content = re.sub(r'\s+', ' ', content)
        # Fix common PDF artifacts
        content = re.sub(r'([a-z])([A-Z])', r'\1 \2', content)
        # Normalize quotes
        content = re.sub(r'["""]', '"', content)
        content = re.sub(r"[''']", "'", content)
        return content.strip()
    
    def _detect_content_type(self, content: str) -> str:
        """Detect if content is structured (has clear sections) or narrative."""
        section_indicators = [
            r'^\s*(?:Chapter|Section|Part)\s+\d+',
            r'^\s*\d+\.\s+[A-Z]',
            r'^\s*[A-Z][A-Z\s]+:',
            r'##\s+',
            r'###\s+'
        ]
        
        for indicator in section_indicators:
            if re.search(indicator, content, re.MULTILINE):
                return "structured"
        return "narrative"
    
    def _chunk_structured_content(self, content: str, metadata: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Chunk structured content by sections."""
        chunks = []
        
        # Split by common section markers
        sections = re.split(r'(?=^\s*(?:Chapter|Section|Part|\d+\.|##|###))', content, flags=re.MULTILINE)
        
        for i, section in enumerate(sections):
            if not section.strip():
                continue
                
            # Extract section title
            title_match = re.search(r'^([^\n]+)', section.strip())
            section_title = title_match.group(1) if title_match else f"Section {i+1}"
            
            # Create chunks from section
            section_chunks = self._create_semantic_chunks(section, self.max_chunk_size)
            
            for j, chunk_text in enumerate(section_chunks):
                chunks.append({
                    'content': chunk_text,
                    'metadata': {
                        **metadata,
                        'section_title': section_title,
                        'section_index': i,
                        'chunk_index': j,
                        'content_type': 'structured',
                        'chunk_type': 'section'
                    }
                })
        
        return chunks
    
    def _chunk_semantic_content(self, content: str, metadata: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Chunk narrative content semantically."""
        chunks = []
        
        # Split by paragraphs first
        paragraphs = [p.strip() for p in content.split('\n\n') if p.strip()]
        
        current_chunk = ""
        chunk_index = 0
        
        for paragraph in paragraphs:
            # Check if adding this paragraph would exceed limit
            if len(current_chunk) + len(paragraph) > self.max_chunk_size and current_chunk:
                # Save current chunk
                chunks.append({
                    'content': current_chunk.strip(),
                    'metadata': {
                        **metadata,
                        'chunk_index': chunk_index,
                        'content_type': 'narrative',
                        'chunk_type': 'semantic'
                    }
                })
                
                # Start new chunk with overlap
                overlap_text = self._extract_overlap(current_chunk)
                current_chunk = overlap_text + paragraph
                chunk_index += 1
            else:
                # Add paragraph to current chunk
                current_chunk += "\n\n" + paragraph if current_chunk else paragraph
        
        # Add final chunk
        if current_chunk.strip():
            chunks.append({
                'content': current_chunk.strip(),
                'metadata': {
                    **metadata,
                    'chunk_index': chunk_index,
                    'content_type': 'narrative',
                    'chunk_type': 'semantic'
                }
            })
        
        return chunks
    
    def _create_semantic_chunks(self, text: str, max_size: int) -> List[str]:
        """Create chunks based on semantic boundaries."""
        if len(text) <= max_size:
            return [text]
        
        # Try to split on sentence boundaries
        sentences = re.split(r'(?<=[.!?])\s+', text)
        chunks = []
        current_chunk = ""
        
        for sentence in sentences:
            if len(current_chunk) + len(sentence) > max_size and current_chunk:
                chunks.append(current_chunk.strip())
                current_chunk = sentence
            else:
                current_chunk += " " + sentence if current_chunk else sentence
        
        if current_chunk.strip():
            chunks.append(current_chunk.strip())
        
        return chunks
    
    def _extract_overlap(self, text: str) -> str:
        """Extract overlap text from end of chunk."""
        if len(text) <= self.overlap_size:
            return text
        
        # Try to find sentence boundary for clean overlap
        overlap_text = text[-self.overlap_size:]
        sentence_start = overlap_text.find('. ')
        if sentence_start > 0:
            return overlap_text[sentence_start + 2:]
        
        return overlap_text

async def process_pdf_resource(pdf_info: Dict[str, Any], chunker: AIOptimizedChunker) -> List[Dict[str, Any]]:
    """Process a PDF resource and return knowledge resources."""
    
    try:
        pdf_path = pdf_info["file"]
        
        # Check if file exists
        if not pdf_path.exists():
            logger.error(f"PDF file not found: {pdf_path}")
            return []
        
        logger.info(f"Processing PDF: {pdf_path}")
        
        # Extract text from PDF
        pdf_reader = PdfReader(str(pdf_path))
        full_text = ""
        
        for page in pdf_reader.pages:
            full_text += page.extract_text() + "\n\n"
        
        if not full_text.strip():
            logger.warning(f"No text extracted from PDF: {pdf_path}")
            return []
        
        # Create source metadata
        source_metadata = {
            "source_type": "pdf",
            "file_path": str(pdf_path),
            "file_name": pdf_path.name,
            "title": pdf_info["title"],
            "domain": pdf_info["domain"],
            "topics": pdf_info["topics"],
            "year": "2025"
        }
        
        # Chunk the content
        chunks = chunker.chunk_content(full_text, source_metadata)
        
        resources = []
        for chunk in chunks:
            # Generate embedding
            embedding = await generate_embedding(chunk["content"])
            
            # Create resource record
            resource_data = {
                "id": str(uuid.uuid4()),
                "title": f"{pdf_info['title']} - Part {chunk['metadata']['chunk_index'] + 1}",
                "description": pdf_info.get("description", chunk["content"][:200] + "..."),
                "content": chunk["content"],
                "content_type": "pdf",
                "source_url": f"file://{pdf_path}",
                "domain": pdf_info["domain"],
                "topics": pdf_info["topics"],
                "tags": pdf_info["topics"] + [pdf_info["domain"], "policy_document", "research", "2025"],
                "categories": [pdf_info["domain"], "pdf", "research"],
                "target_audience": ["policy_makers", "researchers", "workforce_developers"],
                "embedding": embedding,
                "metadata": chunk["metadata"]
            }
            
            resources.append(resource_data)
        
        logger.info(f"Created {len(resources)} resources from {pdf_path}")
        return resources
        
    except Exception as e:
        logger.error(f"Error processing PDF {pdf_info['file']}: {str(e)}")
        return []

async def ingest_pdf_resources() -> Dict[str, int]:
    """Ingest all PDF resources into the knowledge base."""
    
    stats = {"processed": 0, "resources_created": 0, "failed": 0}
    chunker = AIOptimizedChunker()
    
    # Ensure PDFs directory exists
    if not PDFS_DIR.exists():
        logger.warning(f"PDFs directory not found: {PDFS_DIR}")
        logger.info("Creating PDFs directory...")
        PDFS_DIR.mkdir(parents=True, exist_ok=True)
        
        # Log expected PDF locations
        logger.info("Expected PDF files:")
        for pdf_info in CLIMATE_DOMAIN_RESOURCES:
            logger.info(f"  - {pdf_info['file']}")
            logger.info(f"    Title: {pdf_info['title']}")
            logger.info(f"    Domain: {pdf_info['domain']}")
        
        return stats
    
    for pdf_info in CLIMATE_DOMAIN_RESOURCES:
        try:
            resources = await process_pdf_resource(pdf_info, chunker)
            
            if resources:
                # Insert all resources for this PDF
                for resource in resources:
                    try:
                        supabase.table("knowledge_resources").insert(resource).execute()
                        stats["resources_created"] += 1
                    except Exception as e:
                        logger.error(f"Failed to insert resource: {e}")
                        stats["failed"] += 1
                
                stats["processed"] += 1
                logger.info(f"Successfully processed {pdf_info['title']}")
            else:
                stats["failed"] += 1
                logger.error(f"Failed to process {pdf_info['title']}")
                
        except Exception as e:
            logger.error(f"Error processing {pdf_info['title']}: {str(e)}")
            stats["failed"] += 1
    
    return stats

async def create_partner_with_programs(partner_id: str, partner_data: Dict[str, Any]) -> Dict[str, Any]:
    """Create a partner account with their real programs and resources."""
    
    try:
        # Generate email and password
        domain = partner_data['website'].replace('https://', '').replace('http://', '').split('/')[0]
        user_email = f"{partner_id}@{domain}"
        password = f"ClimateJobs2025!{partner_id.title()}"
        
        user_id = None
        user_created = False
        
        try:
            # Try to create new auth user
            user_result = supabase.auth.admin.create_user({
                "email": user_email,
                "password": password,
                "email_confirm": True,
                "user_metadata": {
                    "organization": partner_data["name"],
                    "role": "partner",
                    "created_date": "June 2025"
                }
            })
            user_id = user_result.user.id
            user_created = True
            logger.info(f"Created new user for {partner_data['name']}")
            
        except Exception as auth_error:
            if "already been registered" in str(auth_error):
                # User exists, try to find their ID and update profile
                logger.info(f"User {user_email} already exists, updating profile...")
                
                # Get existing user by email
                existing_users = supabase.auth.admin.list_users()
                for user in existing_users:
                    if user.email == user_email:
                        user_id = user.id
                        break
                
                if not user_id:
                    # If we can't find the user, try to delete and recreate
                    logger.warning(f"Could not find existing user {user_email}, attempting to delete and recreate...")
                    try:
                        # List all users and delete the one with matching email
                        all_users = supabase.auth.admin.list_users()
                        for user in all_users:
                            if user.email == user_email:
                                supabase.auth.admin.delete_user(user.id)
                                logger.info(f"Deleted existing user {user_email}")
                                break
                        
                        # Now try to create again
                        user_result = supabase.auth.admin.create_user({
                            "email": user_email,
                            "password": password,
                            "email_confirm": True,
                            "user_metadata": {
                                "organization": partner_data["name"],
                                "role": "partner",
                                "created_date": "June 2025"
                            }
                        })
                        user_id = user_result.user.id
                        user_created = True
                        logger.info(f"Successfully recreated user for {partner_data['name']}")
                        
                    except Exception as delete_error:
                        logger.error(f"Could not delete/recreate user: {delete_error}")
                        return {"success": False, "error": f"Could not handle existing user: {delete_error}"}
            else:
                raise auth_error
        
        if not user_id:
            return {"success": False, "error": "Could not obtain user ID"}
        
        # Create or update partner profile
        profile_data = {
            "id": user_id,
            "email": user_email,
            "user_type": "partner",
            "organization_name": partner_data["name"],
            "organization_type": partner_data["organization_type"],
            "website": partner_data["website"],
            "description": partner_data["description"],
            "partnership_level": partner_data["partnership_level"],
            "climate_focus": partner_data["climate_focus"],
            "verified": True,
            "contact_info": partner_data["contact_info"]
        }
        
        try:
            # Try to insert profile
            supabase.table("profiles").insert(profile_data).execute()
        except Exception as profile_error:
            if "duplicate key value" in str(profile_error) or "already exists" in str(profile_error):
                # Profile exists, update it
                logger.info(f"Profile exists for {partner_data['name']}, updating...")
                update_data = {k: v for k, v in profile_data.items() if k != 'id'}
                supabase.table("profiles").update(update_data).eq('id', user_id).execute()
            else:
                raise profile_error
        
        # Clean up existing data for this partner
        try:
            supabase.table("knowledge_resources").delete().eq('partner_id', user_id).execute()
            supabase.table("job_listings").delete().eq('partner_id', user_id).execute()  
            supabase.table("education_programs").delete().eq('partner_id', user_id).execute()
        except Exception as delete_error:
            logger.warning(f"Could not delete existing records: {delete_error}")
        
        # Create resources, job listings, and education programs
        resources_created = 0
        job_listings_created = 0
        education_programs_created = 0
        chunker = AIOptimizedChunker()
        
        for program in partner_data.get("current_programs", []):
            program_type = program.get("type", "")
            
            # Create job listings for job-related programs
            if program_type in ["job_training", "apprenticeship", "job_placement"]:
                job_data = await create_job_listing_from_program(user_id, partner_data, program)
                if job_data:
                    try:
                        supabase.table("job_listings").insert(job_data).execute()
                        job_listings_created += 1
                        logger.info(f"Created job listing: {program['title']}")
                    except Exception as e:
                        logger.error(f"Failed to create job listing: {e}")
            
            # Create education programs for education-related programs  
            elif program_type in ["education", "internship", "fellowship", "workforce_development", "pre_apprenticeship", "career_guidance", "community_engagement"]:
                edu_data = await create_education_program_from_program(user_id, partner_data, program)
                if edu_data:
                    try:
                        supabase.table("education_programs").insert(edu_data).execute()
                        education_programs_created += 1
                        logger.info(f"Created education program: {program['title']}")
                    except Exception as e:
                        logger.error(f"Failed to create education program: {e}")
            
            # Always create a knowledge resource for AI search
            content = generate_program_content(partner_data, program)
            chunks = chunker.chunk_content(content, {
                "partner_id": user_id,
                "partner_name": partner_data["name"],
                "program_title": program["title"],
                "program_type": program["type"],
                "source_type": "partner_program",
                "year": "2025"
            })
            
            for chunk in chunks:
                # Generate embedding
                embedding = await generate_embedding(chunk["content"])
                
                # Create resource record
                resource_data = {
                    "id": str(uuid.uuid4()),
                    "partner_id": user_id,
                    "title": f"{partner_data['name']}: {program['title']}",
                    "description": program.get("description", ""),
                    "content": chunk["content"],
                    "content_type": program["type"],
                    "source_url": partner_data.get("website"),
                    "domain": partner_data["climate_focus"][0] if partner_data["climate_focus"] else "general",
                    "topics": extract_topics(chunk["content"]),
                    "tags": generate_tags(partner_data, program),
                    "categories": [partner_data["organization_type"], program["type"]],
                    "target_audience": program.get("target_audience", ["general"]),
                    "embedding": embedding,
                    "metadata": chunk["metadata"]
                }
                
                try:
                    supabase.table("knowledge_resources").insert(resource_data).execute()
                    resources_created += 1
                except Exception as e:
                    logger.error(f"Failed to create knowledge resource: {e}")
        
        action = "Created" if user_created else "Updated"
        return {
            "success": True,
            "user_id": user_id,
            "email": user_email,
            "password": password,
            "resources_created": resources_created,
            "job_listings_created": job_listings_created,
            "education_programs_created": education_programs_created,
            "action": action
        }
        
    except Exception as e:
        logger.error(f"Error creating partner {partner_id}: {str(e)}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        return {"success": False, "error": str(e)}

async def create_job_listing_from_program(partner_id: str, partner_data: Dict, program: Dict) -> Dict[str, Any]:
    """Create a job listing from a program."""
    
    # Determine employment type
    employment_type = program.get("employment_type", "full_time")
    if program["type"] == "apprenticeship":
        employment_type = "apprenticeship"
    elif program["type"] == "job_training":
        employment_type = "training"
    elif "internship" in program.get("title", "").lower():
        employment_type = "internship"
    
    # Extract requirements and responsibilities
    requirements = []
    if "requirements" in program:
        requirements = program["requirements"] if isinstance(program["requirements"], list) else [program["requirements"]]
    elif "eligibility" in program:
        eligibility = program["eligibility"]
        requirements = eligibility if isinstance(eligibility, list) else [eligibility]
    
    # Generate job description
    description = program.get("description", "")
    if "focus_areas" in program:
        description += f"\n\nFocus Areas: {', '.join(program['focus_areas'])}"
    if "duration" in program:
        description += f"\n\nProgram Duration: {program['duration']}"
    if "compensation" in program:
        description += f"\n\nCompensation: {program['compensation']}"
    
    # Use program-specific location or default to partner address
    location = program.get("location", partner_data.get("contact_info", {}).get("address", "Massachusetts"))
    
    # Use program-specific experience level or default
    experience_level = program.get("experience_level", "entry_level")
    
    # Use program-specific salary range
    salary_range = program.get("salary_range", program.get("compensation", program.get("reimbursement", None)))
    
    # Use program-specific climate focus or default to partner's
    climate_focus = program.get("climate_focus", partner_data.get("climate_focus", []))
    
    # Use program-specific skills or focus areas
    skills_required = program.get("skills_required", program.get("focus_areas", []))
    
    job_data = {
        "id": str(uuid.uuid4()),
        "partner_id": partner_id,
        "title": program["title"],
        "description": description,
        "requirements": "\n".join(requirements) if requirements else None,
        "responsibilities": program.get("focus", ""),
        "location": location,
        "employment_type": employment_type,
        "experience_level": experience_level,
        "salary_range": salary_range,
        "climate_focus": climate_focus,
        "skills_required": skills_required,
        "benefits": program.get("support_services", None),
        "application_url": partner_data.get("website"),
        "application_email": partner_data.get("contact_info", {}).get("email"),
        "is_active": True,
        "expires_at": None
    }
    
    return job_data

async def create_education_program_from_program(partner_id: str, partner_data: Dict, program: Dict) -> Dict[str, Any]:
    """Create an education program from a program."""
    
    # Determine program type
    program_type = "certificate"
    if program["type"] == "education":
        if "degree" in program.get("title", "").lower():
            program_type = "degree"
        elif "certificate" in program.get("title", "").lower():
            program_type = "certificate"
    elif program["type"] == "internship":
        program_type = "internship"
    elif program["type"] == "fellowship":
        program_type = "fellowship"
    elif program["type"] == "workforce_development":
        program_type = "workshop"
    elif program["type"] == "pre_apprenticeship":
        program_type = "pre_apprenticeship"
    
    # Determine format
    format_type = "in_person"
    if "online" in program.get("description", "").lower():
        format_type = "online"
    elif "hybrid" in program.get("description", "").lower():
        format_type = "hybrid"
    
    # Extract cost information
    cost = "Contact for pricing"
    if "cost" in program:
        cost = program["cost"]
    elif "free" in program.get("description", "").lower():
        cost = "Free"
    elif "reimbursement" in program:
        cost = f"Employer reimbursement available: {program['reimbursement']}"
    
    # Generate comprehensive description
    description = program.get("description", "")
    if "focus_areas" in program:
        description += f"\n\nFocus Areas: {', '.join(program['focus_areas'])}"
    if "eligibility" in program:
        eligibility = program["eligibility"]
        if isinstance(eligibility, list):
            description += f"\n\nEligible Participants: {', '.join(eligibility)}"
        else:
            description += f"\n\nEligibility: {eligibility}"
    if "support_services" in program:
        services = program["support_services"]
        if isinstance(services, list):
            description += f"\n\nSupport Services: {', '.join(services)}"
        else:
            description += f"\n\nSupport Services: {services}"
    
    edu_data = {
        "id": str(uuid.uuid4()),
        "partner_id": partner_id,
        "program_name": program["title"],
        "description": description,
        "program_type": program_type,
        "duration": program.get("duration"),
        "format": format_type,
        "cost": cost,
        "prerequisites": "\n".join(program.get("requirements", [])) if program.get("requirements") else None,
        "climate_focus": partner_data.get("climate_focus", []),
        "skills_taught": program.get("focus_areas", []),
        "certification_offered": program.get("certification", program.get("accreditation")),
        "application_deadline": None,  # Would need specific dates
        "start_date": None,  # Would need specific dates
        "end_date": None,
        "contact_info": partner_data.get("contact_info", {}),
        "application_url": partner_data.get("website"),
        "is_active": True
    }
    
    return edu_data

def generate_program_content(partner_data: Dict, program: Dict) -> str:
    """Generate comprehensive content for a program."""
    
    content_parts = [
        f"# {partner_data['name']}: {program['title']}",
        f"\n## Organization Overview",
        f"**Organization Type:** {partner_data['organization_type'].title()}",
        f"**Website:** {partner_data['website']}",
        f"**Partnership Level:** {partner_data['partnership_level'].title()}",
        f"**Climate Focus Areas:** {', '.join(partner_data['climate_focus'])}",
        f"\n**Description:** {partner_data['description']}",
    ]
    
    if partner_data.get("contact_info"):
        content_parts.append("\n## Contact Information")
        for key, value in partner_data["contact_info"].items():
            if value:
                content_parts.append(f"**{key.title()}:** {value}")
    
    content_parts.extend([
        f"\n## Program: {program['title']}",
        f"**Program Type:** {program['type'].replace('_', ' ').title()}",
        f"\n**Description:** {program['description']}"
    ])
    
    # Add program-specific details
    for key, value in program.items():
        if key not in ['title', 'type', 'description']:
            if isinstance(value, list):
                content_parts.append(f"**{key.replace('_', ' ').title()}:** {', '.join(map(str, value))}")
            elif isinstance(value, dict):
                content_parts.append(f"\n### {key.replace('_', ' ').title()}")
                for sub_key, sub_value in value.items():
                    content_parts.append(f"**{sub_key.replace('_', ' ').title()}:** {sub_value}")
            else:
                content_parts.append(f"**{key.replace('_', ' ').title()}:** {value}")
    
    return "\n".join(content_parts)

async def generate_embedding(text: str) -> List[float]:
    """Generate embedding for text using OpenAI."""
    try:
        if openai_client is None:
            logger.warning("OpenAI client not available, returning dummy embedding")
            # Return a dummy embedding vector for testing
            return [0.0] * 1536
            
        response = await asyncio.to_thread(
            openai_client.embeddings.create,
            model="text-embedding-3-small",
            input=text
        )
        return response.data[0].embedding
    except Exception as e:
        logger.error(f"Error generating embedding: {e}")
        # Return dummy embedding on error
        return [0.0] * 1536

def extract_topics(content: str) -> List[str]:
    """Extract topics from content using keyword analysis."""
    
    topic_keywords = {
        "solar": ["solar", "photovoltaic", "pv", "solar panel", "solar energy"],
        "wind": ["wind", "turbine", "wind energy", "offshore wind"],
        "hvac": ["hvac", "heating", "cooling", "heat pump"],
        "energy_efficiency": ["efficiency", "insulation", "audit", "retrofit"],
        "workforce_development": ["training", "apprenticeship", "career", "job", "workforce"],
        "innovation": ["innovation", "technology", "research", "development"]
    }
    
    content_lower = content.lower()
    topics = []
    
    for topic, keywords in topic_keywords.items():
        if any(keyword in content_lower for keyword in keywords):
            topics.append(topic)
    
    return topics[:5]

def generate_tags(partner_data: Dict, program: Dict) -> List[str]:
    """Generate tags for better searchability."""
    
    tags = [
        partner_data["organization_type"],
        partner_data["partnership_level"],
        program["type"],
        "2025",
        "massachusetts",
        "clean_energy"
    ]
    
    tags.extend(partner_data["climate_focus"])
    
    if "certification" in program.get("description", "").lower():
        tags.append("certification")
    if "free" in str(program).lower():
        tags.append("free")
    if "paid" in str(program).lower():
        tags.append("paid")
    
    return list(set(tags))

async def main():
    """Main function to create seed partners with real current data."""
    
    print("=" * 80)
    print("🌱 CLIMATE ECONOMY ECOSYSTEM - COMPREHENSIVE SETUP")
    print("📅 Current Date: June 2025")
    print("🔄 Using Real Current Partner Data")
    print("🤖 AI-Optimized Knowledge Base Ingestion")
    print("📄 PDF Domain Knowledge Integration")
    print("=" * 80)
    
    results = {
        "partners_created": 0,
        "partner_resources_created": 0,
        "pdf_resources_created": 0,
        "credentials": [],
        "errors": []
    }
    
    try:
        # First, ingest PDF domain knowledge resources
        print(f"\n📚 PROCESSING PDF DOMAIN KNOWLEDGE...")
        print(f"📁 PDFs Directory: {PDFS_DIR}")
        
        pdf_stats = await ingest_pdf_resources()
        results["pdf_resources_created"] = pdf_stats["resources_created"]
        
        if pdf_stats["processed"] > 0:
            print(f"   ✅ Processed {pdf_stats['processed']} PDFs")
            print(f"   📊 Created {pdf_stats['resources_created']} knowledge chunks")
        else:
            print(f"   ⚠️ No PDFs processed (files may not exist yet)")
            print(f"   📍 Expected PDF locations:")
            for pdf_info in CLIMATE_DOMAIN_RESOURCES:
                print(f"      - {pdf_info['file']}")
        
        if pdf_stats["failed"] > 0:
            print(f"   ❌ Failed: {pdf_stats['failed']} PDFs")
        
        # Now create partner accounts with their programs
        print(f"\n👥 CREATING PARTNER ACCOUNTS WITH PROGRAMS...")
        
        for partner_id, partner_data in PARTNERS_DATA_2025.items():
            print(f"\n🏢 Creating partner: {partner_data['name']}...")
            
            result = await create_partner_with_programs(partner_id, partner_data)
            
            if result["success"]:
                results["partners_created"] += 1
                results["partner_resources_created"] += result["resources_created"]
                results["credentials"].append({
                    "name": partner_data["name"],
                    "email": result["email"],
                    "password": result["password"],
                    "website": partner_data["website"],
                    "type": partner_data["organization_type"],
                    "programs": len(partner_data.get("current_programs", [])),
                    "resources": result["resources_created"]
                })
                print(f"   ✅ {result['action']} successfully with {result['resources_created']} program resources")
            else:
                results["errors"].append(f"{partner_data['name']}: {result['error']}")
                print(f"   ❌ Failed: {result['error']}")
        
        print("\n" + "=" * 80)
        print("✅ COMPREHENSIVE CLIMATE ECONOMY SETUP COMPLETED!")
        print("=" * 80)
        print(f"👥 Partners Created: {results['partners_created']}")
        print(f"📊 Partner Program Resources: {results['partner_resources_created']}")
        print(f"📚 PDF Domain Knowledge Resources: {results['pdf_resources_created']}")
        print(f"📖 Total Knowledge Base Resources: {results['partner_resources_created'] + results['pdf_resources_created']}")
        print(f"❌ Errors: {len(results['errors'])}")
        
        if results['errors']:
            print("\n🚨 ERRORS:")
            for error in results['errors']:
                print(f"   • {error}")
        
        print("\n" + "=" * 80)
        print("🔐 PARTNER LOGIN CREDENTIALS")
        print("=" * 80)
        
        for cred in results['credentials']:
            print(f"\n🏢 {cred['name']}")
            print(f"   📧 Email: {cred['email']}")
            print(f"   🔑 Password: {cred['password']}")
            print(f"   🌐 Website: {cred['website']}")
            print(f"   📋 Type: {cred['type'].title()}")
            print(f"   📊 Programs: {cred['programs']}")
            print(f"   📚 Resources Created: {cred['resources']}")
        
        print("\n" + "=" * 80)
        print("📁 PDF DOMAIN KNOWLEDGE FILES")
        print("=" * 80)
        print(f"📍 Directory: {PDFS_DIR}")
        print("📄 Expected Files:")
        for pdf_info in CLIMATE_DOMAIN_RESOURCES:
            exists = "✅" if pdf_info['file'].exists() else "❌"
            print(f"   {exists} {pdf_info['file'].name}")
            print(f"      📖 {pdf_info['title']}")
            print(f"      🏷️ Domain: {pdf_info['domain']}")
            print(f"      🔖 Topics: {', '.join(pdf_info['topics'])}")
        
        print("\n" + "=" * 80)
        print("🎯 NEXT STEPS")
        print("=" * 80)
        print("1. 📄 Add PDF files to the PDFs directory for domain knowledge")
        print("2. 🔗 Partners can log in using the credentials above")
        print("3. 🔍 Knowledge base is ready for AI-powered search")
        print("4. 📱 Test the search API at /api/search")
        print("5. 🎓 Job seekers can explore programs and opportunities")
        print("6. 🤖 AI agents can leverage structured knowledge chunks")
        print("7. 🔄 Re-run script after adding PDFs to process domain knowledge")
        
        print("\n🌟 The climate economy ecosystem is now ready!")
        print("=" * 80)
        
    except Exception as e:
        print(f"\n❌ CRITICAL ERROR: {str(e)}")
        return False
    
    return True

if __name__ == "__main__":
    asyncio.run(main()) 