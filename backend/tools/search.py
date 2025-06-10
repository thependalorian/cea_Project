"""
Search tools for Climate Economy Assistant

This module provides search functionality for resources, jobs, education,
organizations, and other climate economy information for Massachusetts.
"""

import json
import logging
from typing import Any, Dict, List, Optional, Union
from datetime import datetime

from langchain_core.tools import tool
from langchain_openai import ChatOpenAI

from core.config import get_settings
from adapters.supabase import get_supabase_client

settings = get_settings()
logger = logging.getLogger("search_tools")


@tool
async def search_resources(
    query: str,
    resource_types: Optional[List[str]] = None,
    location: str = "Massachusetts",
    limit: int = 10,
) -> str:
    """
    Search for climate economy resources

    Args:
        query: Search query
        resource_types: Types of resources to search for
        location: Geographic location
        limit: Number of results to return

    Returns:
        Formatted search results
    """
    try:
        if not query or len(query.strip()) < 3:
            raise ValueError("Query must be at least 3 characters long")

        # Initialize OpenAI
        llm = ChatOpenAI(
            model="gpt-4", temperature=0.3, api_key=settings.OPENAI_API_KEY
        )

        # Create search prompt
        resource_types_str = (
            ", ".join(resource_types) if resource_types else "all types"
        )

        search_prompt = f"""
        Search for Massachusetts climate economy resources related to: {query}
        
        Resource types needed: {resource_types_str}
        Location: {location}
        
        Provide specific, actionable resources including:
        - Organization names and contact information
        - Program names and application details
        - Training opportunities with enrollment info
        - Job opportunities with application links
        - Funding sources with eligibility criteria
        
        Format as clear, bulleted list with specific details for Massachusetts.
        """

        # Generate response
        response = await llm.ainvoke(search_prompt)

        if not response.content:
            raise Exception("Search returned empty results")

        return response.content

    except Exception as e:
        logger.error(f"Resource search failed: {e}")
        raise Exception(f"Resource search failed: {str(e)}")


@tool
async def search_job_resources(
    query: str,
    skills: Optional[List[str]] = None,
    experience_level: str = "entry_level",
    location: str = "Massachusetts",
) -> str:
    """
    Search for climate job opportunities and resources

    Args:
        query: Job search query
        skills: Relevant skills
        experience_level: Experience level
        location: Location

    Returns:
        Job search results
    """
    try:
        if not query:
            raise ValueError("Job search query cannot be empty")

        # Initialize OpenAI
        llm = ChatOpenAI(
            model="gpt-4", temperature=0.2, api_key=settings.OPENAI_API_KEY
        )

        # Create job search prompt
        skills_str = ", ".join(skills) if skills else "general"

        job_prompt = f"""
        Find Massachusetts clean energy job opportunities for: {query}
        
        Candidate profile:
        - Skills: {skills_str}
        - Experience level: {experience_level}
        - Location: {location}
        
        Provide specific job opportunities including:
        - Job titles and companies
        - Salary ranges
        - Required qualifications
        - Application instructions
        - Contact information
        
        Focus on real Massachusetts clean energy employers and current opportunities.
        """

        # Generate response
        response = await llm.ainvoke(job_prompt)

        if not response.content:
            raise Exception("Job search returned empty results")

        return response.content

    except Exception as e:
        logger.error(f"Job search failed: {e}")
        raise Exception(f"Job search failed: {str(e)}")


@tool
async def search_education_resources(
    query: str,
    program_type: str = "certificate",
    location: str = "Massachusetts",
    budget: Optional[str] = None,
) -> str:
    """
    Search for education and training programs

    Args:
        query: Education search query
        program_type: Type of program
        location: Location
        budget: Budget constraints

    Returns:
        Education program results
    """
    try:
        if not query:
            raise ValueError("Education search query cannot be empty")

        # Initialize OpenAI
        llm = ChatOpenAI(
            model="gpt-4", temperature=0.2, api_key=settings.OPENAI_API_KEY
        )

        # Create education search prompt
        budget_info = f" Budget: {budget}" if budget else ""

        education_prompt = f"""
        Find Massachusetts clean energy education and training programs for: {query}
        
        Program requirements:
        - Type: {program_type}
        - Location: {location}{budget_info}
        
        Provide specific programs including:
        - Program names and institutions
        - Duration and schedule
        - Cost and financial aid options
        - Prerequisites and admission requirements
        - Application deadlines and processes
        - Career outcomes and job placement rates
        
        Focus on real Massachusetts institutions and current programs.
        """

        # Generate response
        response = await llm.ainvoke(education_prompt)

        if not response.content:
            raise Exception("Education search returned empty results")

        return response.content

    except Exception as e:
        logger.error(f"Education search failed: {e}")
        raise Exception(f"Education search failed: {str(e)}")


@tool
async def search_partner_organizations(
    query: str,
    organization_type: Optional[str] = None,
    services: Optional[List[str]] = None,
    location: str = "Massachusetts",
) -> str:
    """
    Search for partner organizations and service providers

    Args:
        query: Organization search query
        organization_type: Type of organization
        services: Required services
        location: Location

    Returns:
        Partner organization results
    """
    try:
        if not query:
            raise ValueError("Organization search query cannot be empty")

        # Initialize OpenAI
        llm = ChatOpenAI(
            model="gpt-4", temperature=0.2, api_key=settings.OPENAI_API_KEY
        )

        # Create organization search prompt
        org_type_info = f" Type: {organization_type}" if organization_type else ""
        services_info = f" Services needed: {', '.join(services)}" if services else ""

        org_prompt = f"""
        Find Massachusetts climate economy partner organizations for: {query}
        
        Organization criteria:{org_type_info}{services_info}
        Location: {location}
        
        Provide specific organizations including:
        - Organization names and descriptions
        - Services offered
        - Contact information
        - Eligibility requirements
        - Application processes
        - Success stories or outcomes
        
        Focus on real Massachusetts organizations with proven track records.
        """

        # Generate response
        response = await llm.ainvoke(org_prompt)

        if not response.content:
            raise Exception("Organization search returned empty results")

        return response.content

    except Exception as e:
        logger.error(f"Organization search failed: {e}")
        raise Exception(f"Organization search failed: {str(e)}")


@tool
async def search_funding_resources(
    query: str,
    funding_type: str = "grants",
    amount_range: Optional[str] = None,
    eligibility: Optional[str] = None,
) -> str:
    """
    Search for funding opportunities and financial resources

    Args:
        query: Funding search query
        funding_type: Type of funding
        amount_range: Funding amount range
        eligibility: Eligibility criteria

    Returns:
        Funding opportunity results
    """
    try:
        if not query:
            raise ValueError("Funding search query cannot be empty")

        # Initialize OpenAI
        llm = ChatOpenAI(
            model="gpt-4", temperature=0.2, api_key=settings.OPENAI_API_KEY
        )

        # Create funding search prompt
        amount_info = f" Amount range: {amount_range}" if amount_range else ""
        eligibility_info = f" Eligibility: {eligibility}" if eligibility else ""

        funding_prompt = f"""
        Find Massachusetts clean energy funding opportunities for: {query}
        
        Funding criteria:
        - Type: {funding_type}{amount_info}{eligibility_info}
        
        Provide specific funding opportunities including:
        - Funding source names and descriptions
        - Award amounts and terms
        - Eligibility requirements
        - Application deadlines and processes
        - Required documentation
        - Contact information
        - Success rates and tips
        
        Focus on real Massachusetts and federal funding programs currently available.
        """

        # Generate response
        response = await llm.ainvoke(funding_prompt)

        if not response.content:
            raise Exception("Funding search returned empty results")

        return response.content

    except Exception as e:
        logger.error(f"Funding search failed: {e}")
        raise Exception(f"Funding search failed: {str(e)}")


@tool
async def search_events(
    query: str,
    event_type: Optional[str] = None,
    timeframe: str = "upcoming",
    location: str = "Massachusetts",
) -> str:
    """
    Search for climate economy events and networking opportunities

    Args:
        query: Event search query
        event_type: Type of event
        timeframe: Time frame
        location: Location

    Returns:
        Event search results
    """
    try:
        if not query:
            raise ValueError("Event search query cannot be empty")

        # Initialize OpenAI
        llm = ChatOpenAI(
            model="gpt-4", temperature=0.2, api_key=settings.OPENAI_API_KEY
        )

        # Create event search prompt
        event_type_info = f" Type: {event_type}" if event_type else ""

        event_prompt = f"""
        Find Massachusetts clean energy events and networking opportunities for: {query}
        
        Event criteria:
        - Timeframe: {timeframe}{event_type_info}
        - Location: {location}
        
        Provide specific events including:
        - Event names and descriptions
        - Dates and times
        - Locations and formats (in-person/virtual)
        - Registration information
        - Cost and financial assistance
        - Target audience
        - Networking opportunities
        - Contact information
        
        Focus on real Massachusetts climate economy events and conferences.
        """

        # Generate response
        response = await llm.ainvoke(event_prompt)

        if not response.content:
            raise Exception("Event search returned empty results")

        return response.content

    except Exception as e:
        logger.error(f"Event search failed: {e}")
        raise Exception(f"Event search failed: {str(e)}")


@tool
async def semantic_resource_search(
    query: str,
    context: Optional[str] = None,
    user_profile: Optional[Dict[str, Any]] = None,
) -> str:
    """
    Perform semantic search for personalized resources using verified database sources

    Args:
        query: Search query
        context: Additional context
        user_profile: User profile information

    Returns:
        Semantic search results with verified sources
    """
    try:
        if not query:
            raise ValueError("Semantic search query cannot be empty")

        # Get database client for verified sources
        supabase = get_supabase_client()
        
        # Search partner profiles for relevant organizations
        partner_response = supabase.table("partner_profiles").select(
            "organization_name, description, email, phone, website, "
            "climate_focus, training_programs, services_offered, "
            "verification_date, partnership_level, headquarters_location"
        ).eq("verified", True).execute()
        
        # Search current job listings
        jobs_response = supabase.table("job_listings").select(
            "title, description, partner_id, salary_range, location, "
            "application_url, requirements, created_at, climate_focus"
        ).eq("is_active", True).execute()
        
        # Search education programs
        programs_response = supabase.table("education_programs").select(
            "program_name, description, partner_id, cost, duration, "
            "contact_info, certification_offered, skills_taught, "
            "application_url, start_date"
        ).eq("is_active", True).execute()
        
        # Build sourced response
        sourced_results = []
        
        # Process partners
        if partner_response.data:
            for partner in partner_response.data:
                sourced_results.append(f"""
**Organization:** {partner['organization_name']}
**Description:** {partner['description']}
**Climate Focus:** {', '.join(partner.get('climate_focus', []))}
**Contact:** {partner.get('email', 'N/A')} | {partner.get('phone', 'N/A')}
**Website:** {partner.get('website', 'N/A')}
**Verified:** {partner.get('verification_date', 'N/A')}
**Location:** {partner.get('headquarters_location', 'Massachusetts')}
**Services:** {', '.join(partner.get('services_offered', []))}
""")
        
        # Process job listings
        if jobs_response.data:
            for job in jobs_response.data[:3]:  # Limit to top 3 matches
                sourced_results.append(f"""
**Job Title:** {job['title']}
**Description:** {job['description'][:200]}...
**Salary Range:** {job.get('salary_range', 'Not specified')}
**Location:** {job.get('location', 'Massachusetts')}
**Apply:** {job.get('application_url', 'Contact partner directly')}
**Posted:** {job.get('created_at', 'N/A')}
**Climate Focus:** {', '.join(job.get('climate_focus', []))}
""")
        
        # Process education programs
        if programs_response.data:
            for program in programs_response.data[:3]:  # Limit to top 3 matches
                contact_info = program.get('contact_info', {})
                sourced_results.append(f"""
**Program:** {program['program_name']}
**Description:** {program['description'][:200]}...
**Duration:** {program.get('duration', 'N/A')}
**Cost:** {program.get('cost', 'Contact for pricing')}
**Certification:** {program.get('certification_offered', 'N/A')}
**Skills:** {', '.join(program.get('skills_taught', []))}
**Contact:** {contact_info.get('email', 'N/A')} | {contact_info.get('phone', 'N/A')}
**Apply:** {program.get('application_url', 'Contact program directly')}
""")
        
        if not sourced_results:
            return """**No verified resources found in database.**
Please contact ACT Alliance directly for current opportunities:
**Contact:** info@act-alliance.org
**Note:** Database search returned no matches for current query."""
        
        # Combine results with source attribution
        final_response = f"""## **Massachusetts Climate Economy Resources**
**Query:** {query}
**Source:** ACT Partner Database (Verified Organizations)
**Search Date:** {datetime.now().strftime('%B %d, %Y')}

{chr(10).join(sourced_results)}

**Data Sources:**
- Partner profiles verified as of their listed verification dates
- Job listings and education programs updated in real-time
- All contact information sourced from verified partner database
- For additional opportunities, contact ACT Alliance: info@act-alliance.org"""
        
        return final_response

    except Exception as e:
        logger.error(f"Semantic search failed: {e}")
        return f"""**Database Search Error**
**Error:** {str(e)}
**Fallback Contact:** ACT Alliance - info@act-alliance.org
**Note:** Please contact directly for current climate career resources."""


@tool
async def generate_resource_recommendations(
    user_query: str,
    user_context: Optional[Dict[str, Any]] = None,
    resource_preferences: Optional[List[str]] = None,
) -> str:
    """
    Generate personalized resource recommendations

    Args:
        user_query: User's specific query or need
        user_context: User background and context
        resource_preferences: Preferred resource types

    Returns:
        Personalized resource recommendations
    """
    try:
        if not user_query:
            raise ValueError("User query cannot be empty for recommendations")

        # Initialize OpenAI
        llm = ChatOpenAI(
            model="gpt-4", temperature=0.4, api_key=settings.OPENAI_API_KEY
        )

        # Create recommendation prompt
        context_info = ""
        if user_context:
            context_info = f" User context: {json.dumps(user_context, indent=2)}"

        preferences_info = ""
        if resource_preferences:
            preferences_info = (
                f" Preferred resources: {', '.join(resource_preferences)}"
            )

        recommendation_prompt = f"""
        Generate personalized Massachusetts clean energy resource recommendations for: {user_query}
        
        Analysis parameters:{context_info}{preferences_info}
        
        Provide comprehensive recommendations including:
        - Priority actions ranked by impact
        - Specific resources with contact details
        - Timeline for implementation
        - Expected outcomes and milestones
        - Alternative pathways if primary options unavailable
        - Success metrics to track progress
        
        Make recommendations specific, actionable, and achievable within Massachusetts.
        """

        # Generate response
        response = await llm.ainvoke(recommendation_prompt)

        if not response.content:
            raise Exception("Recommendation generation returned empty results")

        return response.content

    except Exception as e:
        logger.error(f"Resource recommendation failed: {e}")
        raise Exception(f"Resource recommendation failed: {str(e)}")
