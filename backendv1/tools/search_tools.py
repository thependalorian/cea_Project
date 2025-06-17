"""
Search tools for Climate Economy Assistant V1

Following rule #12: Complete code verification with proper imports
Following rule #15: Include comprehensive error handling

This module provides search functionality for resources, jobs, education,
organizations, and other climate economy information.
Location: backendv1/tools/search_tools.py
"""

import json
import logging
from typing import Any, Dict, List, Optional, Union
from datetime import datetime

from pydantic import BaseModel, Field

# Import LangGraph dependencies
try:
    from langgraph.graph import StateGraph
    from langgraph.prebuilt import ToolNode
except ImportError:
    # Mock classes if LangGraph is not installed
    class StateGraph:
        pass

    class ToolNode:
        pass


# Import settings
try:
    from backendv1.config.settings import get_settings

    settings = get_settings()
except ImportError:
    # Mock settings if not available
    settings = type("Settings", (), {"OPENAI_API_KEY": None})

# Initialize logger
logger = logging.getLogger("search_tools")


class SearchResult(BaseModel):
    """
    Structured search result model
    """

    title: str = Field(..., description="Result title")
    description: str = Field(..., description="Result description")
    url: Optional[str] = Field(None, description="Result URL")
    source: Optional[str] = Field(None, description="Result source")
    relevance_score: Optional[float] = Field(None, description="Relevance score")
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class SearchResourcesInput(BaseModel):
    """
    Input schema for resource search
    """

    query: str = Field(..., description="Search query")
    resource_types: Optional[List[str]] = Field(None, description="Types of resources")
    location: str = Field("Massachusetts", description="Geographic location")
    limit: int = Field(10, description="Number of results to return")


class SearchJobResourcesInput(BaseModel):
    """
    Input schema for job search
    """

    query: str = Field(..., description="Job search query")
    skills: Optional[List[str]] = Field(None, description="Relevant skills")
    experience_level: str = Field("entry_level", description="Experience level")
    location: str = Field("Massachusetts", description="Location")


class SearchEducationResourcesInput(BaseModel):
    """
    Input schema for education search
    """

    query: str = Field(..., description="Education search query")
    program_type: str = Field("certificate", description="Type of program")
    location: str = Field("Massachusetts", description="Location")
    budget: Optional[str] = Field(None, description="Budget constraints")


class SearchPartnerOrganizationsInput(BaseModel):
    """
    Input schema for partner organization search
    """

    query: str = Field(..., description="Search query")
    organization_type: Optional[str] = Field(None, description="Organization type")
    services: Optional[List[str]] = Field(None, description="Services offered")
    location: str = Field("Massachusetts", description="Location")


async def search_resources(input_data: Union[SearchResourcesInput, Dict[str, Any]]) -> str:
    """
    Search for climate economy resources

    Args:
        input_data: Search input data

    Returns:
        Formatted search results
    """
    try:
        # Convert dict to model if needed
        if isinstance(input_data, dict):
            input_data = SearchResourcesInput(**input_data)

        if not input_data.query or len(input_data.query.strip()) < 3:
            raise ValueError("Query must be at least 3 characters long")

        # Initialize OpenAI if available
        try:
            from langchain_openai import ChatOpenAI

            if settings.OPENAI_API_KEY:
                llm = ChatOpenAI(model="gpt-4", temperature=0.3, api_key=settings.OPENAI_API_KEY)
            else:
                raise ImportError("OpenAI API key not configured")
        except ImportError:
            # Fallback to database search when OpenAI is not available
            return await search_database_resources(input_data)

        # Create search prompt
        resource_types_str = (
            ", ".join(input_data.resource_types) if input_data.resource_types else "all types"
        )

        search_prompt = f"""
        Search for {input_data.location} climate economy resources related to: {input_data.query}
        
        Resource types needed: {resource_types_str}
        Location: {input_data.location}
        
        Provide specific, actionable resources including:
        - Organization names and contact information
        - Program names and application details
        - Training opportunities with enrollment info
        - Job opportunities with application links
        - Funding sources with eligibility criteria
        
        Format as clear, bulleted list with specific details for {input_data.location}.
        """

        # Generate response
        response = await llm.ainvoke(search_prompt)

        if not response.content:
            raise Exception("Search returned empty results")

        return json.dumps(
            {"status": "success", "query": input_data.query, "results": response.content}
        )

    except Exception as e:
        logger.error(f"Resource search failed: {e}")
        return json.dumps(
            {
                "status": "error",
                "message": str(e),
                "mock_results": True,
                "results": generate_mock_resources(input_data.query, input_data.resource_types),
            }
        )


async def search_job_resources(input_data: Union[SearchJobResourcesInput, Dict[str, Any]]) -> str:
    """
    Search for climate job opportunities and resources

    Args:
        input_data: Job search input data

    Returns:
        Job search results
    """
    try:
        # Convert dict to model if needed
        if isinstance(input_data, dict):
            input_data = SearchJobResourcesInput(**input_data)

        if not input_data.query:
            raise ValueError("Job search query cannot be empty")

        # Initialize OpenAI if available
        try:
            from langchain_openai import ChatOpenAI

            if settings.OPENAI_API_KEY:
                llm = ChatOpenAI(model="gpt-4", temperature=0.2, api_key=settings.OPENAI_API_KEY)
            else:
                raise ImportError("OpenAI API key not configured")
        except ImportError:
            return json.dumps(
                {
                    "status": "error",
                    "message": "Search provider not available",
                    "mock_results": True,
                    "results": generate_mock_jobs(input_data.query, input_data.skills),
                }
            )

        # Create job search prompt
        skills_str = ", ".join(input_data.skills) if input_data.skills else "general"

        job_prompt = f"""
        Find {input_data.location} clean energy job opportunities for: {input_data.query}
        
        Candidate profile:
        - Skills: {skills_str}
        - Experience level: {input_data.experience_level}
        - Location: {input_data.location}
        
        Provide specific job opportunities including:
        - Job titles and companies
        - Salary ranges
        - Required qualifications
        - Application instructions
        - Contact information
        
        Focus on real {input_data.location} clean energy employers and current opportunities.
        """

        # Generate response
        response = await llm.ainvoke(job_prompt)

        if not response.content:
            raise Exception("Job search returned empty results")

        return json.dumps(
            {"status": "success", "query": input_data.query, "results": response.content}
        )

    except Exception as e:
        logger.error(f"Job search failed: {e}")
        return json.dumps(
            {
                "status": "error",
                "message": str(e),
                "mock_results": True,
                "results": generate_mock_jobs(input_data.query, input_data.skills),
            }
        )


async def search_education_resources(
    input_data: Union[SearchEducationResourcesInput, Dict[str, Any]],
) -> str:
    """
    Search for education and training programs

    Args:
        input_data: Education search input data

    Returns:
        Education program results
    """
    try:
        # Convert dict to model if needed
        if isinstance(input_data, dict):
            input_data = SearchEducationResourcesInput(**input_data)

        if not input_data.query:
            raise ValueError("Education search query cannot be empty")

        # Initialize OpenAI if available
        try:
            from langchain_openai import ChatOpenAI

            if settings.OPENAI_API_KEY:
                llm = ChatOpenAI(model="gpt-4", temperature=0.2, api_key=settings.OPENAI_API_KEY)
            else:
                raise ImportError("OpenAI API key not configured")
        except ImportError:
            return json.dumps(
                {
                    "status": "error",
                    "message": "Search provider not available",
                    "mock_results": True,
                    "results": generate_mock_education(input_data.query, input_data.program_type),
                }
            )

        # Create education search prompt
        budget_info = f" Budget: {input_data.budget}" if input_data.budget else ""

        education_prompt = f"""
        Find {input_data.location} clean energy education and training programs for: {input_data.query}
        
        Program requirements:
        - Type: {input_data.program_type}
        - Location: {input_data.location}{budget_info}
        
        Provide specific programs including:
        - Program names and institutions
        - Duration and schedule
        - Cost and financial aid options
        - Prerequisites and admission requirements
        - Application deadlines and processes
        - Career outcomes and job placement rates
        
        Focus on real {input_data.location} institutions and current programs.
        """

        # Generate response
        response = await llm.ainvoke(education_prompt)

        if not response.content:
            raise Exception("Education search returned empty results")

        return json.dumps(
            {"status": "success", "query": input_data.query, "results": response.content}
        )

    except Exception as e:
        logger.error(f"Education search failed: {e}")
        return json.dumps(
            {
                "status": "error",
                "message": str(e),
                "mock_results": True,
                "results": generate_mock_education(input_data.query, input_data.program_type),
            }
        )


# Mock result generators for offline/testing use
def generate_mock_resources(query: str, resource_types: Optional[List[str]] = None) -> str:
    """Generate mock resource results for testing"""
    resource_list = [
        "• **Clean Energy Center** - Provides funding and resources for clean energy businesses. Contact: info@cleanenergycenter.org, (555) 123-4567",
        "• **Green Skills Training Program** - 12-week certificate program in solar installation. Applications due monthly. Visit greenskills.org",
        "• **Climate Innovation Hub** - Co-working space and mentorship for climate startups. Membership starts at $150/month. Located in Cambridge.",
        "• **EcoJobs Database** - Comprehensive listing of environmental careers updated weekly. Free access at ecojobs.org",
        "• **Sustainable Business Network** - Professional networking and resources for green businesses. Monthly meetings and annual conference.",
    ]

    return "\n".join(resource_list[:3])


def generate_mock_jobs(query: str, skills: Optional[List[str]] = None) -> str:
    """Generate mock job results for testing"""
    job_list = [
        "• **Solar Installation Technician** - SunPower Systems\n  Salary: $45,000-$60,000\n  Requirements: NABCEP certification preferred, 1+ year experience\n  Apply at: sunpower.com/careers",
        "• **Energy Efficiency Consultant** - GreenSave Partners\n  Salary: $55,000-$70,000\n  Requirements: Building science knowledge, energy auditing experience\n  Contact: careers@greensave.com",
        "• **Climate Policy Analyst** - EcoPolicy Institute\n  Salary: $60,000-$75,000\n  Requirements: Master's degree in environmental policy or related field\n  Application deadline: June 15, 2023",
    ]

    return "\n".join(job_list)


def generate_mock_education(query: str, program_type: str) -> str:
    """Generate mock education results for testing"""
    education_list = [
        "• **Solar Installation Certificate** - Technical Community College\n  Duration: 12 weeks (evenings and weekends)\n  Cost: $2,500 (financial aid available)\n  Prerequisites: High school diploma or equivalent\n  Application: Rolling admissions, classes start quarterly",
        "• **Clean Energy Management** - State University\n  Duration: 2-year Master's program\n  Cost: $35,000 total (scholarships available)\n  Prerequisites: Bachelor's degree, GRE scores\n  Application deadline: January 15 for fall semester",
        "• **Green Building Certification** - Architecture Institute\n  Duration: 6 months online\n  Cost: $1,800\n  Prerequisites: Construction or design background recommended\n  Self-paced program, start anytime",
    ]

    return "\n".join(education_list)


async def enhanced_search(
    query: str, search_type: str = "general", location: str = "Massachusetts", limit: int = 10
) -> str:
    """
    Enhanced search function for general queries

    Args:
        query: Search query
        search_type: Type of search (general, jobs, education, etc.)
        location: Geographic location
        limit: Number of results

    Returns:
        JSON string with search results
    """
    try:
        # Use the existing search_resources function
        search_input = SearchResourcesInput(query=query, location=location, limit=limit)
        return await search_resources(search_input)
    except Exception as e:
        logger.error(f"Enhanced search failed: {e}")
        return json.dumps(
            {
                "status": "error",
                "message": str(e),
                "results": f"Mock enhanced search results for: {query}",
            }
        )


async def climate_ecosystem_search(
    query: str, focus_area: str = "general", location: str = "Massachusetts"
) -> str:
    """
    Search for climate ecosystem resources and organizations

    Args:
        query: Search query
        focus_area: Climate focus area
        location: Geographic location

    Returns:
        JSON string with climate ecosystem results
    """
    try:
        # Create climate-specific search
        climate_query = f"climate {focus_area} {query} organizations programs"
        search_input = SearchResourcesInput(
            query=climate_query,
            resource_types=["organizations", "programs", "initiatives"],
            location=location,
        )
        return await search_resources(search_input)
    except Exception as e:
        logger.error(f"Climate ecosystem search failed: {e}")
        return json.dumps(
            {
                "status": "error",
                "message": str(e),
                "results": f"Mock climate ecosystem results for: {query}",
            }
        )


async def search_resume_proxy(
    query: str, skills: Optional[List[str]] = None, experience_level: str = "entry_level"
) -> str:
    """
    Search for resume-related resources and job opportunities

    Args:
        query: Search query
        skills: List of relevant skills
        experience_level: Experience level

    Returns:
        JSON string with resume/job search results
    """
    try:
        # Use the existing job search function
        job_input = SearchJobResourcesInput(
            query=query, skills=skills, experience_level=experience_level
        )
        return await search_job_resources(job_input)
    except Exception as e:
        logger.error(f"Resume proxy search failed: {e}")
        return json.dumps(
            {
                "status": "error",
                "message": str(e),
                "results": f"Mock resume search results for: {query}",
            }
        )


async def search_knowledge_base(
    query: str, category: str = "general", location: str = "Massachusetts"
) -> str:
    """
    Search the knowledge base for relevant information

    Args:
        query: Search query
        category: Knowledge category
        location: Geographic location

    Returns:
        JSON string with knowledge base results
    """
    try:
        # Create knowledge-focused search
        kb_query = f"{category} {query} information resources guide"
        search_input = SearchResourcesInput(
            query=kb_query, resource_types=["guides", "information", "resources"], location=location
        )
        return await search_resources(search_input)
    except Exception as e:
        logger.error(f"Knowledge base search failed: {e}")
        return json.dumps(
            {
                "status": "error",
                "message": str(e),
                "results": f"Mock knowledge base results for: {query}",
            }
        )
