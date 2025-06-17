"""
Enhanced web search tools for the Climate Economy Assistant.

This module provides specialized web search functionality for credential evaluation,
military skills translation, and environmental justice community information.
"""

import json
import logging
from datetime import datetime
from typing import Any, Dict, List, Optional, Union

from pydantic import BaseModel, Field
from langchain_core.tools import tool

from backendv1.utils.logger import setup_logger
from backendv1.config.settings import get_settings

# Setup logging
logger = setup_logger("web_search_tools")
settings = get_settings()

# Get API keys
tavily_api_key = settings.TAVILY_API_KEY


class WebSearchResult(BaseModel):
    """
    Web search result model
    """

    title: str = Field(..., description="Result title")
    content: str = Field(..., description="Result content")
    url: Optional[str] = Field(None, description="Result URL")
    source: Optional[str] = Field(None, description="Result source")
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class CredentialEvaluationInput(BaseModel):
    """
    Input schema for credential evaluation search
    """

    credentials: str = Field(..., description="Credentials to evaluate")
    country: str = Field("", description="Country where credentials were obtained")


class MosTranslationInput(BaseModel):
    """
    Input schema for MOS translation search
    """

    mos_code: str = Field(..., description="Military Occupation Specialty code")
    military_base: Optional[str] = Field(None, description="Military base location")


class EjCommunitiesInput(BaseModel):
    """
    Input schema for EJ communities search
    """

    community: str = Field(..., description="Community name")
    focus_area: Optional[str] = Field(None, description="Environmental justice focus area")


@tool
async def web_search_for_credential_evaluation(
    input_data: Union[CredentialEvaluationInput, Dict[str, Any]],
) -> str:
    """
    Search for credential evaluation information with fallback to database.

    Args:
        input_data: Credential evaluation input data

    Returns:
        str: JSON string with credential evaluation information
    """
    try:
        # Convert dict to model if needed
        if isinstance(input_data, dict):
            input_data = CredentialEvaluationInput(**input_data)

        # Check if Tavily API key is configured
        if not tavily_api_key:
            # Use database fallback
            try:
                from backendv1.tools.credentials import evaluate_credentials

                db_result = await evaluate_credentials(
                    input_data.credentials, input_data.credentials, input_data.country
                )
                return json.dumps(
                    {
                        "success": True,
                        "results": [
                            {
                                "title": "Database Result",
                                "content": db_result,
                                "source": "CEA Database",
                            }
                        ],
                    }
                )
            except Exception as db_error:
                logger.error(f"Database fallback failed: {db_error}")
                return json.dumps(
                    {
                        "success": False,
                        "error": "Enhanced search not available. TAVILY_API_KEY is not configured.",
                        "results": [],
                    }
                )

        # Try to use Tavily search
        try:
            from langchain_tavily import TavilySearch

            # Build search query
            search_query = f"Massachusetts credential evaluation {input_data.credentials}"
            if input_data.country:
                search_query += f" from {input_data.country}"

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
                ],
                exclude_domains=[
                    "linkedin.com",
                    "indeed.com",
                    "glassdoor.com",
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

        except ImportError:
            logger.warning("TavilySearch not available. Using database fallback.")
            try:
                from backendv1.tools.credentials import evaluate_credentials

                db_result = await evaluate_credentials(
                    input_data.credentials, input_data.credentials, input_data.country
                )
                return json.dumps(
                    {
                        "success": True,
                        "results": [
                            {
                                "title": "Database Result",
                                "content": db_result,
                                "source": "CEA Database",
                            }
                        ],
                    }
                )
            except Exception as db_error:
                logger.error(f"Database fallback failed: {db_error}")
                return json.dumps(
                    {
                        "success": False,
                        "error": "TavilySearch not available and database fallback failed",
                        "results": [],
                    }
                )

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
async def web_search_for_mos_translation(
    input_data: Union[MosTranslationInput, Dict[str, Any]],
) -> str:
    """
    Search for MOS translation information with fallback to database.

    Args:
        input_data: MOS translation input data

    Returns:
        str: JSON string with MOS translation information
    """
    try:
        # Convert dict to model if needed
        if isinstance(input_data, dict):
            input_data = MosTranslationInput(**input_data)

        # Check if Tavily API key is configured
        if not tavily_api_key:
            # Use database fallback
            try:
                from backendv1.tools.skills import translate_military_skills

                db_result = await translate_military_skills(
                    "military", input_data.mos_code, True  # default branch  # climate focus
                )
                return json.dumps(
                    {
                        "success": True,
                        "results": [
                            {
                                "title": "Database Result",
                                "content": db_result,
                                "source": "CEA Database",
                            }
                        ],
                    }
                )
            except Exception as db_error:
                logger.error(f"Database fallback failed: {db_error}")
                return json.dumps(
                    {
                        "success": False,
                        "error": "Enhanced search not available. TAVILY_API_KEY is not configured.",
                        "results": [],
                    }
                )

        # Try to use Tavily search
        try:
            from langchain_tavily import TavilySearch

            # Build search query
            search_query = f"Massachusetts military {input_data.mos_code} civilian career translation clean energy"
            if input_data.military_base:
                search_query += f" {input_data.military_base}"

            # Initialize Tavily search tool
            search = TavilySearch(
                api_key=tavily_api_key,
                max_results=3,
                include_domains=[
                    "mass.gov",
                    "masscec.com",
                    "veterans.gov",
                    "va.gov",
                    "military.com",
                ],
                exclude_domains=[
                    "linkedin.com",
                    "indeed.com",
                    "glassdoor.com",
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

        except ImportError:
            logger.warning("TavilySearch not available. Using database fallback.")
            try:
                from backendv1.tools.skills import translate_military_skills

                db_result = await translate_military_skills(
                    "military", input_data.mos_code, True  # default branch  # climate focus
                )
                return json.dumps(
                    {
                        "success": True,
                        "results": [
                            {
                                "title": "Database Result",
                                "content": db_result,
                                "source": "CEA Database",
                            }
                        ],
                    }
                )
            except Exception as db_error:
                logger.error(f"Database fallback failed: {db_error}")
                return json.dumps(
                    {
                        "success": False,
                        "error": "TavilySearch not available and database fallback failed",
                        "results": [],
                    }
                )

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
async def web_search_for_ej_communities(
    input_data: Union[EjCommunitiesInput, Dict[str, Any]],
) -> str:
    """
    Search for Environmental Justice community information with fallback to database.

    Args:
        input_data: EJ communities input data

    Returns:
        str: JSON string with EJ community information
    """
    try:
        # Convert dict to model if needed
        if isinstance(input_data, dict):
            input_data = EjCommunitiesInput(**input_data)

        # Check if Tavily API key is configured
        if not tavily_api_key:
            # Use database fallback
            try:
                from backendv1.tools.communities import get_ej_community_info

                db_result = await get_ej_community_info(input_data.community)
                return json.dumps(
                    {
                        "success": True,
                        "results": [
                            {
                                "title": "Database Result",
                                "content": db_result,
                                "source": "CEA Database",
                            }
                        ],
                    }
                )
            except Exception as db_error:
                logger.error(f"Database fallback failed: {db_error}")
                return json.dumps(
                    {
                        "success": False,
                        "error": "Enhanced search not available. TAVILY_API_KEY is not configured.",
                        "results": [],
                    }
                )

        # Try to use Tavily search
        try:
            from langchain_tavily import TavilySearch

            # Build search query
            search_query = f"environmental justice community {input_data.community} climate"
            if input_data.focus_area:
                search_query += f" {input_data.focus_area}"

            # Initialize Tavily search tool
            search = TavilySearch(
                api_key=tavily_api_key,
                max_results=3,
                include_domains=[
                    "mass.gov",
                    "masscec.com",
                    "epa.gov",
                    "ej4climate.org",
                    "ejscreen.epa.gov",
                ],
                exclude_domains=[
                    "linkedin.com",
                    "indeed.com",
                    "glassdoor.com",
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

        except ImportError:
            logger.warning("TavilySearch not available. Using database fallback.")
            try:
                from backendv1.tools.communities import get_ej_community_info

                db_result = await get_ej_community_info(input_data.community)
                return json.dumps(
                    {
                        "success": True,
                        "results": [
                            {
                                "title": "Database Result",
                                "content": db_result,
                                "source": "CEA Database",
                            }
                        ],
                    }
                )
            except Exception as db_error:
                logger.error(f"Database fallback failed: {db_error}")
                return json.dumps(
                    {
                        "success": False,
                        "error": "TavilySearch not available and database fallback failed",
                        "results": [],
                    }
                )

    except Exception as e:
        logger.error(f"Error performing EJ communities search: {e}")
        return json.dumps(
            {
                "success": False,
                "error": str(e),
                "results": [],
            }
        )


def generate_mock_credential_results():
    return []


def generate_mock_mos_results():
    return []


def generate_mock_ej_results():
    return []


async def search_climate_jobs(limit: int = 10):
    return [{"title": "Climate Analyst", "company": "Green Energy Co"}]


async def get_industry_trends():
    return {"growing_sectors": ["solar", "wind", "storage"], "job_growth": 15}
