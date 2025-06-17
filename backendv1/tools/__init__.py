"""
BackendV1 Tools Package - Agent-Specific Tool Collections

This package provides tools organized by specialist agent, matching the backend
tool assignment structure for consistent functionality across the system.

Location: backendv1/tools/__init__.py
Version: 1.0.0
"""

import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)

# ============================================================================
# CORE TOOL IMPORTS - Safe imports with error handling
# ============================================================================

# Web Search Tools (Original BackendV1) - Using actual function names
try:
    from backendv1.tools.web_search_tools import (
        web_search_for_credential_evaluation,
        web_search_for_mos_translation,
        web_search_for_ej_communities,
        generate_mock_credential_results,
        generate_mock_mos_results,
        generate_mock_ej_results,
    )

    logger.info("✅ Web search tools imported successfully")
except ImportError as e:
    logger.warning(f"Could not import web_search_tools: {e}")
    web_search_for_credential_evaluation = web_search_for_mos_translation = None
    web_search_for_ej_communities = generate_mock_credential_results = None
    generate_mock_mos_results = generate_mock_ej_results = None

# Search Tools (Original BackendV1) - Using actual function names
try:
    from backendv1.tools.search_tools import (
        enhanced_search,
        climate_ecosystem_search,
        search_resume_proxy,
        search_knowledge_base,
    )

    logger.info("✅ Search tools imported successfully")
except ImportError as e:
    logger.warning(f"Could not import search_tools: {e}")
    enhanced_search = climate_ecosystem_search = search_resume_proxy = search_knowledge_base = None

# Backend Tools (Copied from backend) - Using actual function names
try:
    from backendv1.tools.resume import (
        analyze_resume_with_social_context,
        extract_text_from_pdf,
        extract_text_from_word,
    )

    logger.info("✅ Resume tools imported successfully")
except ImportError as e:
    logger.warning(f"Could not import resume tools: {e}")
    analyze_resume_with_social_context = extract_text_from_pdf = extract_text_from_word = None

try:
    from backendv1.tools.jobs import (
        match_jobs_for_profile,
    )

    logger.info("✅ Job tools imported successfully")
except ImportError as e:
    logger.warning(f"Could not import job tools: {e}")
    match_jobs_for_profile = None

# For tools that don't have the expected functions, we'll create placeholder imports
try:
    from backendv1.tools.skills import translate_military_skills, search_mos_database

    logger.info("✅ Skills tools imported successfully")
except ImportError as e:
    logger.warning(f"Could not import skills tools: {e}")
    translate_military_skills = search_mos_database = None

try:
    from backendv1.tools.matching import *

    logger.info("✅ Matching tools imported successfully")
except ImportError as e:
    logger.warning(f"Could not import matching tools: {e}")

try:
    from backendv1.tools.analytics import *

    logger.info("✅ Analytics tools imported successfully")
except ImportError as e:
    logger.warning(f"Could not import analytics tools: {e}")

try:
    from backendv1.tools.credentials import evaluate_credentials, search_credential_database

    logger.info("✅ Credentials tools imported successfully")
except ImportError as e:
    logger.warning(f"Could not import credentials tools: {e}")
    evaluate_credentials = search_credential_database = None

try:
    from backendv1.tools.training import *

    logger.info("✅ Training tools imported successfully")
except ImportError as e:
    logger.warning(f"Could not import training tools: {e}")

try:
    from backendv1.tools.communities import get_ej_community_info, search_ej_communities

    logger.info("✅ Communities tools imported successfully")
except ImportError as e:
    logger.warning(f"Could not import communities tools: {e}")
    get_ej_community_info = search_ej_communities = None

# ============================================================================
# AGENT-SPECIFIC TOOL COLLECTIONS (Based on Actual Available Tools)
# ============================================================================

# JASMINE TOOLS - MA Resources Analyst (Resume & Skills Focus)
JASMINE_TOOLS = [
    # Resume Analysis Tools (actual functions)
    analyze_resume_with_social_context,
    extract_text_from_pdf,
    extract_text_from_word,
    # Job Matching Tools (actual functions)
    match_jobs_for_profile,
    # Search & Resources (actual functions)
    search_knowledge_base,
    enhanced_search,
    climate_ecosystem_search,
    search_resume_proxy,
]

# MARCUS TOOLS - Veterans Specialist (Military Transition Focus)
MARCUS_TOOLS = [
    # Military Skills Translation (actual functions)
    translate_military_skills,
    search_mos_database,
    # Job Matching for Veterans (actual functions)
    match_jobs_for_profile,
    # Resume Support (actual functions)
    analyze_resume_with_social_context,
    extract_text_from_pdf,
    extract_text_from_word,
    # Search & Resources (actual functions)
    enhanced_search,
    search_knowledge_base,
]

# LIV TOOLS - International Specialist (Credentials & Integration Focus)
LIV_TOOLS = [
    # Credential Evaluation (actual functions)
    evaluate_credentials,
    search_credential_database,
    # Job Matching (actual functions)
    match_jobs_for_profile,
    # Search & Resources (actual functions)
    enhanced_search,
    search_knowledge_base,
    climate_ecosystem_search,
]

# MIGUEL TOOLS - Environmental Justice Specialist (Community Focus)
MIGUEL_TOOLS = [
    # Environmental Justice (actual functions)
    get_ej_community_info,
    search_ej_communities,
    # Job Matching with EJ Focus (actual functions)
    match_jobs_for_profile,
    # Search & Resources (actual functions)
    enhanced_search,
    climate_ecosystem_search,
    search_knowledge_base,
]

# LAUREN TOOLS - Climate Career Specialist (Comprehensive Climate Focus)
LAUREN_TOOLS = [
    # Climate-Specific Search (actual functions)
    climate_ecosystem_search,
    search_knowledge_base,
    # Job & Career Tools (actual functions)
    match_jobs_for_profile,
    # Search & Resources (actual functions)
    enhanced_search,
    search_resume_proxy,
]

# MAI TOOLS - Resume & Career Transition Specialist (Resume Optimization Focus)
MAI_TOOLS = [
    # Resume Processing & Analysis (actual functions)
    analyze_resume_with_social_context,
    extract_text_from_pdf,
    extract_text_from_word,
    search_resume_proxy,
    # Job Matching (actual functions)
    match_jobs_for_profile,
    # Search & Resources (actual functions)
    search_knowledge_base,
    enhanced_search,
]

# ALEX TOOLS - Empathy Specialist (Support & Crisis Focus)
ALEX_TOOLS = [
    # Basic Resource Search (actual functions)
    enhanced_search,
    search_knowledge_base,
]

# PENDO TOOLS - Supervisor (Coordination & Analytics Focus)
PENDO_TOOLS = [
    # Search & Knowledge Base (actual functions)
    search_knowledge_base,
    enhanced_search,
    climate_ecosystem_search,
    search_resume_proxy,
    # Job Market Analysis (actual functions)
    match_jobs_for_profile,
]

# ============================================================================
# TOOL COLLECTIONS REGISTRY
# ============================================================================

AGENT_TOOL_COLLECTIONS = {
    "jasmine": JASMINE_TOOLS,
    "marcus": MARCUS_TOOLS,
    "liv": LIV_TOOLS,
    "miguel": MIGUEL_TOOLS,
    "lauren": LAUREN_TOOLS,
    "mai": MAI_TOOLS,
    "alex": ALEX_TOOLS,
    "pendo": PENDO_TOOLS,
}

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================


def get_agent_tools(agent_name: str) -> List[Any]:
    """Get tools assigned to a specific agent"""
    tools = AGENT_TOOL_COLLECTIONS.get(agent_name.lower(), [])
    # Filter out None values (failed imports)
    return [tool for tool in tools if tool is not None]


def get_available_tools_count() -> Dict[str, int]:
    """Get count of available tools per agent"""
    return {agent: len(get_agent_tools(agent)) for agent in AGENT_TOOL_COLLECTIONS.keys()}


def list_all_unique_tools() -> List[str]:
    """Get list of all unique tool names across agents"""
    all_tools = set()
    for tools in AGENT_TOOL_COLLECTIONS.values():
        for tool in tools:
            if tool is not None and hasattr(tool, "__name__"):
                all_tools.add(tool.__name__)
    return sorted(list(all_tools))


# ============================================================================
# EXPORTS
# ============================================================================

# Export all individual tools that are available
__all__ = [
    # Web search tools (actual functions)
    "web_search_for_credential_evaluation",
    "web_search_for_mos_translation",
    "web_search_for_ej_communities",
    "generate_mock_credential_results",
    "generate_mock_mos_results",
    "generate_mock_ej_results",
    # Search tools (actual functions)
    "enhanced_search",
    "climate_ecosystem_search",
    "search_resume_proxy",
    "search_knowledge_base",
    # Resume tools (actual functions)
    "analyze_resume_with_social_context",
    "extract_text_from_pdf",
    "extract_text_from_word",
    # Job tools (actual functions)
    "match_jobs_for_profile",
    # Agent tool collections
    "JASMINE_TOOLS",
    "MARCUS_TOOLS",
    "LIV_TOOLS",
    "MIGUEL_TOOLS",
    "LAUREN_TOOLS",
    "MAI_TOOLS",
    "ALEX_TOOLS",
    "PENDO_TOOLS",
    "AGENT_TOOL_COLLECTIONS",
    # Utility functions
    "get_agent_tools",
    "get_available_tools_count",
    "list_all_unique_tools",
]

# Log initialization summary
available_tools = get_available_tools_count()
total_unique_tools = len(list_all_unique_tools())

logger.info(f"✅ BackendV1 tools package initialized successfully (v1.0.0)")
logger.info(f"📊 Agent tool assignments: {available_tools}")
logger.info(f"🔧 Total unique tools available: {total_unique_tools}")
logger.info(f"🎯 Tool collections organized by specialist expertise")
