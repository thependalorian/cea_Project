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

from core.config import get_settings

settings = get_settings()
logger = logging.getLogger("web_search")

# Initialize Tavily client
tavily_api_key = settings.TAVILY_API_KEY

# Check if Tavily API key is configured
if not tavily_api_key:
    logger.warning(
        "TAVILY_API_KEY is not set. Enhanced search functionality will be limited."
    )


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
            # Return mock results if API key is not configured
            return json.dumps(
                {
                    "success": False,
                    "error": "Enhanced search not available. TAVILY_API_KEY is not configured.",
                    "results": # Mock data removed for production,
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
                "results": # Mock data removed for production,
            }
        )


@tool
def web_search_for_mos_translation(
    mos_code: str, military_base: Optional[str] = None
) -> str:
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
                    "results": # Mock data removed for production,
                }
            )

        # Build search query
        search_query = f"Massachusetts military {mos_code} civilian career translation clean energy climate"
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
                "results": # Mock data removed for production,
            }
        )


@tool
def web_search_for_ej_communities(
    community: str, focus_area: Optional[str] = None
) -> str:
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
                    "results": # Mock data removed for production,
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
                "results": # Mock data removed for production,
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
                    "results": # Mock data removed for production,
                }
            )

        # Build search query
        search_query = f"Massachusetts {skill_area} climate clean energy training certification program"

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
                "results": # Mock data removed for production,
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
                    "results": # Mock data removed for production,
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
                elif any(
                    domain in link.lower()
                    for domain in [".edu", "university", "college"]
                ):
                    link_type = "education"

                # Build search query based on link type
                if link_type == "github":
                    search_query = f"{name} github projects skills repositories climate clean energy"
                elif link_type == "linkedin":
                    search_query = f"{name} linkedin experience skills education climate clean energy massachusetts"
                elif link_type == "education":
                    search_query = f"{name} {link} education degree program leadership volunteer climate"
                else:
                    search_query = f"{name} {link} professional background climate experience projects"

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
                "results": # Mock data removed for production,
            }
        )


@tool
def web_search_for_veteran_resources(
    location: str, resource_type: Optional[str] = None
) -> str:
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
                    "results": # Mock data removed for production,
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
                "results": # Mock data removed for production,
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
                    "results": # Mock data removed for production,
                }
            )

        # Build search query
        search_query = f"Massachusetts {location} {education_type} clean energy climate career training"

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
                "results": # Mock data removed for production,
            }
        )


def # Mock data removed for production -> List[Dict[str, str]]:
    """Generate mock credential evaluation results when Tavily API is not available"""
    return [
        {
            "title": "Massachusetts Department of Professional Licensure - Foreign Credential Evaluation",
            "content": "The Massachusetts Department of Professional Licensure provides guidelines for the evaluation of foreign credentials. International candidates must have their credentials evaluated by approved evaluation services.",
            "url": "https://www.mass.gov/foreign-credential-evaluation",
            "source": "Mass.gov",
        },
        {
            "title": "World Education Services (WES) - Massachusetts",
            "content": "WES provides credential evaluation for international degrees and qualifications. Massachusetts licensing boards and employers often require WES evaluations.",
            "url": "https://www.wes.org/massachusetts",
            "source": "WES.org",
        },
        {
            "title": "UMass Boston - International Student Services",
            "content": "UMass Boston provides guidance for international students and professionals on credential recognition and career pathways in Massachusetts, including in the growing clean energy sector.",
            "url": "https://www.umb.edu/international-student-services",
            "source": "UMass Boston",
        },
    ]


def # Mock data removed for production -> List[Dict[str, str]]:
    """Generate mock MOS translation results when Tavily API is not available"""
    base_info = ""
    if military_base:
        base_info = f" {military_base} has specific resources for transitioning service members."

    return [
        {
            "title": "MassHire Veterans Career Services",
            "content": f"MassHire provides specialized career services for veterans transitioning to civilian careers. Their counselors can help translate military skills like {mos_code} to climate economy opportunities.{base_info}",
            "url": "https://www.mass.gov/masshire-veterans-services",
            "source": "Mass.gov",
        },
        {
            "title": "Massachusetts Clean Energy Center - Veterans in Clean Energy",
            "content": f"MassCEC offers resources specifically for veterans interested in clean energy careers. They provide guidance on how military experience with {mos_code} translates to roles in renewable energy, energy efficiency, and other climate sectors.",
            "url": "https://www.masscec.com/veterans",
            "source": "MassCEC",
        },
        {
            "title": "Military Skills Translator for Clean Energy Careers",
            "content": f"This resource helps veterans translate their military occupational codes like {mos_code} to civilian job requirements in the clean energy sector. It highlights how military experience provides valuable skills for climate careers.",
            "url": "https://www.massveterans.org/careers",
            "source": "Massachusetts Department of Veterans Services",
        },
    ]


def # Mock data removed for production -> List[Dict[str, str]]:
    """Generate mock EJ community results when Tavily API is not available"""
    focus_content = ""
    if focus_area:
        if focus_area.lower() == "transportation":
            focus_content = f" {community} has public transportation routes including bus lines #23 and #47, with service to community colleges and training centers. Transportation access remains a challenge for many residents."
        elif focus_area.lower() == "resources":
            focus_content = f" {community} has 3 community centers offering workforce development services, and is within 5 miles of technical training facilities."
        elif focus_area.lower() == "challenges":
            focus_content = f" {community} faces environmental challenges including air quality concerns from industrial sites, as well as economic barriers to clean energy career pathways."
        elif focus_area.lower() == "education":
            focus_content = f" {community} is served by Bunker Hill Community College and Benjamin Franklin Institute of Technology, both offering climate-related technical programs."

    return [
        {
            "title": f"Massachusetts Environmental Justice Communities - {community}",
            "content": f"Environmental Justice (EJ) communities in Massachusetts, including {community}, are eligible for specialized climate economy programs and funding opportunities that address historical environmental inequities.{focus_content}",
            "url": "https://www.mass.gov/environmental-justice",
            "source": "Mass.gov",
        },
        {
            "title": f"MassCEC Environmental Justice Initiative - {community}",
            "content": f"The Massachusetts Clean Energy Center offers targeted programs for EJ communities like {community}. These include workforce development, clean energy infrastructure, and climate resilience support that consider local transportation access and proximity to training resources.",
            "url": "https://www.masscec.com/environmental-justice",
            "source": "MassCEC",
        },
        {
            "title": f"Clean Energy Jobs in {community}",
            "content": f"{community} and other Environmental Justice communities in Massachusetts are seeing growing opportunities in clean energy jobs. Local residents receive priority consideration for training programs and employment, with support services addressing transportation and childcare barriers.",
            "url": "https://www.mass.gov/ej-workforce",
            "source": "Mass.gov",
        },
        {
            "title": f"Community-Based Climate Solutions in {community}",
            "content": f"Massachusetts is investing in community-based climate solutions in areas like {community}. These initiatives create local jobs while addressing climate vulnerabilities and infrastructure needs, including improving access to community resources and technical education.",
            "url": "https://www.mass.gov/community-climate",
            "source": "Mass.gov",
        },
    ]


def # Mock data removed for production -> List[Dict[str, str]]:
    """Generate mock training enhancement results when Tavily API is not available"""
    return [
        {
            "title": f"Massachusetts Clean Energy Center - {skill_area.title()} Training",
            "content": f"MassCEC offers specialized training programs in {skill_area}. These programs are designed to prepare Massachusetts residents for careers in the growing clean energy economy.",
            "url": "https://www.masscec.com/training",
            "source": "MassCEC",
        },
        {
            "title": f"Bunker Hill Community College - {skill_area.title()} Certificate",
            "content": f"BHCC offers a certificate program in {skill_area} that prepares students for careers in the clean energy sector. The program includes hands-on training and industry partnerships.",
            "url": "https://www.bhcc.edu/certificates",
            "source": "Bunker Hill Community College",
        },
        {
            "title": f"Massachusetts Workforce Development - {skill_area.title()}",
            "content": f"The Massachusetts workforce development system provides resources for training in {skill_area} and other clean energy skills. Programs include both entry-level and advanced training options.",
            "url": "https://www.mass.gov/workforce-development",
            "source": "Mass.gov",
        },
    ]


def # Mock data removed for production -> List[Dict[str, str]]:
    """Generate mock social profile results when Tavily API is not available"""
    mock_results = [
        {
            "profile_type": "github",
            "url": f"https://github.com/{name.lower().replace(' ', '')}",
            "title": f"GitHub Profile: {name}",
            "content": f"{name} has several repositories focused on clean energy projects including solar panel efficiency analysis and climate data visualization. Their GitHub shows strong programming skills in Python and JavaScript with contributions to open-source climate tech libraries.",
            "source": "GitHub",
        },
        {
            "profile_type": "linkedin",
            "url": f"https://linkedin.com/in/{name.lower().replace(' ', '-')}",
            "title": f"LinkedIn: {name} - Clean Energy Professional",
            "content": f"{name} has experience at sustainable energy companies in Massachusetts with a background in environmental engineering. Education includes a degree from a top university with leadership roles in environmental clubs and sustainability initiatives.",
            "source": "LinkedIn",
        },
        {
            "profile_type": "education",
            "url": "https://university.edu/alumni",
            "title": f"{name} - University Projects and Leadership",
            "content": f"{name} participated in several climate-focused initiatives during their education, including leading a campus sustainability project and completing an internship with a renewable energy company. They also studied abroad in Denmark focusing on sustainable urban planning.",
            "source": "University Website",
        },
        {
            "profile_type": "general",
            "url": "https://masscec.com/case-studies",
            "title": f"Community Involvement: {name}",
            "content": f"{name} has volunteered with local environmental justice organizations in Massachusetts and participated in climate advocacy initiatives. They've also presented at regional clean energy conferences on innovative approaches to community solar projects.",
            "source": "Community Organization",
        },
    ]

    # If specific links were provided, try to match them
    if links and len(links) > 0:
        for i, link in enumerate(links):
            if i < len(mock_results):
                mock_results[i]["url"] = link

                # Customize content based on link type
                if "github" in link.lower():
                    mock_results[i]["profile_type"] = "github"
                    mock_results[i]["source"] = "GitHub"
                elif "linkedin" in link.lower():
                    mock_results[i]["profile_type"] = "linkedin"
                    mock_results[i]["source"] = "LinkedIn"

    return mock_results


def # Mock data removed for production -> List[Dict[str, str]]:
    """Generate mock veteran resources results when Tavily API is not available"""
    resource_specific = ""
    if resource_type:
        resource_specific = f" {resource_type} resources for veterans including"

    return [
        {
            "title": f"Veteran Services in {location}, Massachusetts",
            "content": f"{location} offers{resource_specific} specialized career services, housing assistance, and education benefits for veterans transitioning to civilian careers in the clean energy sector. The local Veterans Service Officer can connect veterans to MassCEC opportunities.",
            "url": f"https://www.mass.gov/veterans-services/{location.lower()}",
            "source": "Mass.gov",
        },
        {
            "title": f"Military Bases Near {location} - Transition Services",
            "content": f"Military installations near {location} provide transition assistance programs that include clean energy career pathways. These programs offer skills assessment, training recommendations, and connections to Massachusetts employers in the climate economy.",
            "url": "https://www.massmilitarybases.org",
            "source": "Massachusetts Military Support Foundation",
        },
        {
            "title": f"Technical Training for Veterans in {location}",
            "content": f"Veterans in {location} can access specialized technical training programs in solar installation, energy efficiency, and sustainable construction through the GI Bill and MassCEC partnerships. These programs include hands-on training and job placement assistance.",
            "url": "https://www.masscec.com/veteran-training",
            "source": "MassCEC",
        },
        {
            "title": f"Transportation Services for Veterans in {location}",
            "content": f"Veterans in {location} can access transportation assistance to education and training programs through the DAV transportation network and local VSO services. These services help address transportation barriers to accessing climate economy opportunities.",
            "url": f"https://www.mass.gov/veteran-transportation/{location.lower()}",
            "source": "Mass.gov",
        },
    ]


def # Mock data removed for production -> List[Dict[str, str]]:
    """Generate mock education resource results when Tavily API is not available"""
    education_specific = ""
    if education_type.lower() == "technical_school":
        education_specific = "technical schools offering hands-on training"
    elif education_type.lower() == "community_college":
        education_specific = "community colleges with associate degree programs"
    elif education_type.lower() == "certificate":
        education_specific = "certificate programs for rapid workforce entry"
    elif education_type.lower() == "degree":
        education_specific = "degree programs in climate-related fields"

    return [
        {
            "title": f"Climate Economy Education in {location}, Massachusetts",
            "content": f"{location} offers {education_specific} in clean energy and climate-related fields. These programs are designed to prepare Massachusetts residents for the growing opportunities in the climate economy sector, with flexible scheduling and financial aid options.",
            "url": f"https://www.mass.edu/cleanenergy/{location.lower()}",
            "source": "Massachusetts Department of Higher Education",
        },
        {
            "title": f"{education_type.title()} Programs in {location}",
            "content": f"Students in {location} can access {education_specific} through partnerships with MassCEC and local employers. Programs include solar installation, energy efficiency, offshore wind technician training, and climate resilience planning.",
            "url": "https://www.masscec.com/education",
            "source": "MassCEC",
        },
        {
            "title": f"Transportation Access to {education_type.title()} Programs in {location}",
            "content": f"{location}'s {education_type.lower()} programs are accessible via public transportation, with shuttle services available from major transit hubs. Programs consider transportation challenges in scheduling and offer some online components to reduce travel needs.",
            "url": f"https://www.mass.gov/education-access/{location.lower()}",
            "source": "Mass.gov",
        },
    ]
