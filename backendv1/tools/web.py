"""
Web search tool for Climate Economy Assistant

This module implements web search functionality using Tavily API to enhance core tools
when our internal database falls short. Focused on credential evaluation, MOS translation,
and EJ community information to provide personalized guidance.
"""

import json
import logging
import os
from typing import Any, Dict, List, Optional

from langchain_core.tools import tool
from langchain_tavily import TavilySearch

from backendv1.core.config import get_settings

settings = get_settings()
logger = logging.getLogger("web_search")

# Initialize Tavily client
tavily_api_key = settings.TAVILY_API_KEY

# Check if Tavily API key is configured
if not tavily_api_key:
    logger.warning("TAVILY_API_KEY is not set. Enhanced search functionality will be limited.")


@tool
def web_search_for_credential_evaluation(credentials: str, country: str = "") -> str:
    """
    Search for information to help evaluate international credentials for Massachusetts employers.

    Args:
        credentials: Description of credentials to evaluate (degree, certification, etc.)
        country: Country where credentials were obtained

    Returns:
        str: JSON string with credential evaluation information
    """
    try:
        # Check if Tavily API key is configured
        if not tavily_api_key:
            # Use database data when Tavily is not available
            try:
                from adapters.supabase import get_supabase_client

                supabase = get_supabase_client()

                # Query credential_evaluation table
                query = supabase.table("credential_evaluation").select("*")
                if country:
                    query = query.eq("issuing_country", country.upper()[:3])
                if credentials:
                    query = query.ilike("credential_type", f"%{credentials}%")

                response = query.limit(3).execute()

                if response.data:
                    db_results = []
                    for record in response.data:
                        db_results.append(
                            {
                                "title": f"Credential Evaluation: {record.get('credential_type', 'Unknown')}",
                                "content": f"US Equivalent: {record.get('us_equivalent', 'Evaluation pending')}. Status: {record.get('evaluation_status', 'Pending')}. Country: {record.get('issuing_country', 'Unknown')}",
                                "url": "https://www.mass.gov/foreign-credential-evaluation",
                                "source": "CEA Database",
                            }
                        )

                    return json.dumps(
                        {
                            "success": True,
                            "results": db_results,
                        }
                    )
                else:
                    return json.dumps(
                        {
                            "success": False,
                            "error": "Enhanced search not available. TAVILY_API_KEY is not configured.",
                            "results": [],
                        }
                    )
            except Exception as db_error:
                logger.error(f"Database query failed: {db_error}")
                return json.dumps(
                    {
                        "success": False,
                        "error": "Enhanced search not available. TAVILY_API_KEY is not configured.",
                        "results": [],
                    }
                )

        # Build search query
        search_query = f"Massachusetts credential evaluation {credentials}"
        if country:
            search_query += f" from {country}"

        # Initialize Tavily search tool
        search = TavilySearch(
            api_key=tavily_api_key,
            max_results=3,
            include_domains=[
                "mass.gov",
                "masscec.com",
                "wes.org",
                "ece.org",
                "ed.gov",
                "joinact.org",
                "uct.ac.za",
                "brandeis.edu",
            ],
            exclude_domains=[
                "linkedin.com",
                "indeed.com",
                "glassdoor.com",
                "monster.com",
                "ziprecruiter.com",
            ],
        )

        # Execute search
        search_results = search.invoke(search_query)

        # Format results
        results = []
        for result in search_results:
            results.append(
                {
                    "title": result.get("title", ""),
                    "content": result.get("content", ""),
                    "url": result.get("url", ""),
                    "source": result.get("source", ""),
                }
            )

        return json.dumps({"success": True, "results": results})

    except Exception as e:
        logger.error(f"Error performing credential evaluation search: {e}")
        return json.dumps(
            {
                "success": False,
                "error": str(e),
                "results": [],
            }
        )


@tool
def web_search_for_mos_translation(mos_code: str, military_base: Optional[str] = None) -> str:
    """
    Search for information to help translate military occupation specialty (MOS) codes to civilian climate careers.

    Args:
        mos_code: Military Occupation Specialty code
        military_base: Optional military base location for localized results

    Returns:
        str: JSON string with MOS translation information
    """
    try:
        # Check if Tavily API key is configured
        if not tavily_api_key:
            # Return mock results if API key is not configured
            return json.dumps(
                {
                    "success": False,
                    "error": "Enhanced search not available. TAVILY_API_KEY is not configured.",
                    "results": [],
                }
            )

        # Build search query
        search_query = (
            f"Massachusetts military {mos_code} civilian career translation clean energy climate"
        )
        if military_base:
            search_query += f" {military_base}"

        # Initialize Tavily search tool
        search = TavilySearch(
            api_key=tavily_api_key,
            max_results=3,
            include_domains=[
                "mass.gov",
                "masscec.com",
                "veterans.gov",
                "va.gov",
                "masshirevets.org",
                "military.com",
            ],
            exclude_domains=[
                "linkedin.com",
                "indeed.com",
                "glassdoor.com",
                "monster.com",
                "ziprecruiter.com",
            ],
        )

        # Execute search
        search_results = search.invoke(search_query)

        # Format results
        results = []
        for result in search_results:
            results.append(
                {
                    "title": result.get("title", ""),
                    "content": result.get("content", ""),
                    "url": result.get("url", ""),
                    "source": result.get("source", ""),
                }
            )

        return json.dumps({"success": True, "results": results})

    except Exception as e:
        logger.error(f"Error performing MOS translation search: {e}")
        return json.dumps(
            {
                "success": False,
                "error": str(e),
                "results": [],
            }
        )


@tool
def web_search_for_ej_communities(community: str, focus_area: Optional[str] = None) -> str:
    """
    Search for information about Massachusetts Environmental Justice communities and related climate opportunities.

    Args:
        community: Name of community or area to research
        focus_area: Optional specific focus (transportation, resources, challenges, education)

    Returns:
        str: JSON string with EJ community information
    """
    try:
        # Check if Tavily API key is configured
        if not tavily_api_key:
            # Return mock results if API key is not configured
            return json.dumps(
                {
                    "success": False,
                    "error": "Enhanced search not available. TAVILY_API_KEY is not configured.",
                    "results": [],
                }
            )

        # Build search query
        search_query = f"Massachusetts {community} environmental justice climate"
        if focus_area:
            search_query += f" {focus_area}"

        # Initialize Tavily search tool
        search = TavilySearch(
            api_key=tavily_api_key,
            max_results=4,
            include_domains=[
                "mass.gov",
                "masscec.com",
                "mass-ejscreen.org",
                "ej.mit.edu",
                "ejcw.org",
                "umass.edu",
            ],
            exclude_domains=[
                "linkedin.com",
                "indeed.com",
                "glassdoor.com",
                "monster.com",
                "ziprecruiter.com",
            ],
        )

        # Execute search
        search_results = search.invoke(search_query)

        # Format results
        results = []
        for result in search_results:
            results.append(
                {
                    "title": result.get("title", ""),
                    "content": result.get("content", ""),
                    "url": result.get("url", ""),
                    "source": result.get("source", ""),
                }
            )

        return json.dumps({"success": True, "results": results})

    except Exception as e:
        logger.error(f"Error performing EJ community search: {e}")
        return json.dumps(
            {
                "success": False,
                "error": str(e),
                "results": [],
            }
        )


@tool
def web_search_for_training_enhancement(skill_area: str) -> str:
    """
    Enhance training recommendations with supplementary information from Massachusetts sources.
    Used when our internal database falls short.

    Args:
        skill_area: Skill area to find training information about

    Returns:
        str: JSON string with enhanced training information
    """
    try:
        # Check if Tavily API key is configured
        if not tavily_api_key:
            # Return mock results if API key is not configured
            return json.dumps(
                {
                    "success": False,
                    "error": "Enhanced search not available. TAVILY_API_KEY is not configured.",
                    "results": [],
                }
            )

        # Build search query
        search_query = (
            f"Massachusetts {skill_area} climate clean energy training certification program"
        )

        # Initialize Tavily search tool
        search = TavilySearch(
            api_key=tavily_api_key,
            max_results=3,
            include_domains=[
                "mass.gov",
                "masscec.com",
                "umass.edu",
                "bhcc.edu",
                "masscleanenergyeducation.org",
                "massmep.org",
            ],
            exclude_domains=[
                "linkedin.com",
                "indeed.com",
                "glassdoor.com",
                "monster.com",
                "ziprecruiter.com",
            ],
        )

        # Execute search
        search_results = search.invoke(search_query)

        # Format results
        results = []
        for result in search_results:
            results.append(
                {
                    "title": result.get("title", ""),
                    "content": result.get("content", ""),
                    "url": result.get("url", ""),
                    "source": result.get("source", ""),
                }
            )

        return json.dumps({"success": True, "results": results})

    except Exception as e:
        logger.error(f"Error performing training enhancement search: {e}")
        return json.dumps(
            {
                "success": False,
                "error": str(e),
                "results": [],
            }
        )


@tool
def web_search_for_social_profiles(name: str, links: Optional[List[str]] = None) -> str:
    """
    Search and analyze candidate's social profiles (GitHub, LinkedIn, personal websites)
    to get a more comprehensive picture beyond their resume.

    Args:
        name: Candidate's full name
        links: List of profile URLs (GitHub, LinkedIn, personal website, etc.)

    Returns:
        str: JSON string with enhanced profile information
    """
    try:
        # Check if Tavily API key is configured
        if not tavily_api_key:
            # Return mock results if API key is not configured
            return json.dumps(
                {
                    "success": False,
                    "error": "Enhanced search not available. TAVILY_API_KEY is not configured.",
                    "results": [],
                }
            )

        results = []

        # If specific links are provided, analyze each one
        if links and len(links) > 0:
            for link in links:
                # Determine link type
                link_type = "unknown"
                if "github.com" in link.lower():
                    link_type = "github"
                elif "linkedin.com" in link.lower():
                    link_type = "linkedin"
                elif any(domain in link.lower() for domain in [".edu", "university", "college"]):
                    link_type = "education"

                # Build search query based on link type
                if link_type == "github":
                    search_query = (
                        f"{name} github projects skills repositories climate clean energy"
                    )
                elif link_type == "linkedin":
                    search_query = f"{name} linkedin experience skills education climate clean energy massachusetts"
                elif link_type == "education":
                    search_query = (
                        f"{name} {link} education degree program leadership volunteer climate"
                    )
                else:
                    search_query = (
                        f"{name} {link} professional background climate experience projects"
                    )

                # Initialize Tavily search tool - no domain filtering for this case
                search = TavilySearch(
                    api_key=tavily_api_key,
                    max_results=2,
                    exclude_domains=[
                        "indeed.com",
                        "glassdoor.com",
                        "monster.com",
                        "ziprecruiter.com",
                    ],
                )

                # Execute search
                search_results = search.invoke(search_query)

                # Add results
                for result in search_results:
                    results.append(
                        {
                            "profile_type": link_type,
                            "url": link,
                            "title": result.get("title", ""),
                            "content": result.get("content", ""),
                            "source": result.get("source", ""),
                        }
                    )

        # Also do a general search for the person
        general_search = TavilySearch(
            api_key=tavily_api_key,
            max_results=3,
            exclude_domains=[
                "indeed.com",
                "glassdoor.com",
                "monster.com",
                "ziprecruiter.com",
            ],
        )

        # Execute general search
        general_results = general_search.invoke(
            f"{name} climate clean energy professional background massachusetts"
        )

        # Add general results
        for result in general_results:
            # Check if this is a unique result
            if not any(r.get("url") == result.get("url") for r in results):
                results.append(
                    {
                        "profile_type": "general",
                        "url": result.get("url", ""),
                        "title": result.get("title", ""),
                        "content": result.get("content", ""),
                        "source": result.get("source", ""),
                    }
                )

        return json.dumps({"success": True, "results": results})

    except Exception as e:
        logger.error(f"Error performing social profile search: {e}")
        return json.dumps(
            {
                "success": False,
                "error": str(e),
                "results": [],
            }
        )


@tool
def web_search_for_veteran_resources(location: str, resource_type: Optional[str] = None) -> str:
    """
    Search for veteran-specific resources in Massachusetts, including bases, training programs,
    and support services that can help with climate economy career transitions.

    Args:
        location: City or region in Massachusetts
        resource_type: Optional type of resource (education, employment, benefits, housing)

    Returns:
        str: JSON string with veteran resource information
    """
    try:
        # Check if Tavily API key is configured
        if not tavily_api_key:
            # Return mock results if API key is not configured
            return json.dumps(
                {
                    "success": False,
                    "error": "Enhanced search not available. TAVILY_API_KEY is not configured.",
                    "results": [],
                }
            )

        # Build search query
        search_query = f"Massachusetts {location} veteran military"
        if resource_type:
            search_query += f" {resource_type} resources"
        search_query += " clean energy climate career transition"

        # Initialize Tavily search tool
        search = TavilySearch(
            api_key=tavily_api_key,
            max_results=4,
            include_domains=[
                "mass.gov",
                "masscec.com",
                "veterans.gov",
                "va.gov",
                "masshirevets.org",
                "military.com",
                "massvetsadvisor.org",
            ],
            exclude_domains=[
                "linkedin.com",
                "indeed.com",
                "glassdoor.com",
                "monster.com",
                "ziprecruiter.com",
            ],
        )

        # Execute search
        search_results = search.invoke(search_query)

        # Format results
        results = []
        for result in search_results:
            results.append(
                {
                    "title": result.get("title", ""),
                    "content": result.get("content", ""),
                    "url": result.get("url", ""),
                    "source": result.get("source", ""),
                }
            )

        return json.dumps({"success": True, "results": results})

    except Exception as e:
        logger.error(f"Error performing veteran resource search: {e}")
        return json.dumps(
            {
                "success": False,
                "error": str(e),
                "results": [],
            }
        )


@tool
def web_search_for_education_resources(location: str, education_type: str) -> str:
    """
    Search for educational resources like technical schools and community colleges
    in Massachusetts focused on climate economy skills.

    Args:
        location: City or region in Massachusetts
        education_type: Type of education (technical_school, community_college, certificate, degree)

    Returns:
        str: JSON string with education resource information
    """
    try:
        # Check if Tavily API key is configured
        if not tavily_api_key:
            # Return mock results if API key is not configured
            return json.dumps(
                {
                    "success": False,
                    "error": "Enhanced search not available. TAVILY_API_KEY is not configured.",
                    "results": [],
                }
            )

        # Build search query
        search_query = (
            f"Massachusetts {location} {education_type} clean energy climate career training"
        )

        # Initialize Tavily search tool
        search = TavilySearch(
            api_key=tavily_api_key,
            max_results=3,
            include_domains=[
                "mass.gov",
                "masscec.com",
                "masscleanenergyeducation.org",
                "mass.edu",
                "bhcc.edu",
                "massbay.edu",
                "roxburycc.edu",
                "masstech.org",
            ],
            exclude_domains=[
                "linkedin.com",
                "indeed.com",
                "glassdoor.com",
                "monster.com",
                "ziprecruiter.com",
            ],
        )

        # Execute search
        search_results = search.invoke(search_query)

        # Format results
        results = []
        for result in search_results:
            results.append(
                {
                    "title": result.get("title", ""),
                    "content": result.get("content", ""),
                    "url": result.get("url", ""),
                    "source": result.get("source", ""),
                }
            )

        return json.dumps({"success": True, "results": results})

    except Exception as e:
        logger.error(f"Error performing education resource search: {e}")
        return json.dumps(
            {
                "success": False,
                "error": str(e),
                "results": [],
            }
        )
