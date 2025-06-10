"""
Tools for skills translation in the Climate Economy Assistant.

This module provides functionality for translating skills between domains,
particularly focusing on military-to-civilian skills translation.
"""

from typing import Any, Dict, Optional
from langchain_core.tools import tool


@tool
async def translate_military_skills(
    military_branch: str, mos_code: Optional[str] = None, climate_focus: bool = False
) -> str:
    """
    Translate military skills to civilian equivalents.

    Args:
        military_branch: Military branch (army, navy, etc.)
        mos_code: Military Occupational Specialty code
        climate_focus: Whether to focus on climate economy relevance

    Returns:
        str: Skill translation results as a formatted string
    """
    # This is a placeholder implementation
    # In a real implementation, this would query a database or API

    branch_upper = military_branch.upper()

    climate_specific = ""
    if climate_focus:
        climate_specific = """
• **Energy Systems**: Military experience with power generation translates to renewable energy systems management
• **Emergency Response**: Experience in crisis situations applies to climate resilience and disaster management
• **Technical Expertise**: Military technical training provides foundation for clean energy technology work"""

    return f"""
Your {branch_upper} experience with{f" MOS {mos_code}" if mos_code and mos_code != "generalist" else "out specific MOS"} translates to these civilian skills:

• **Leadership**: Team management and personnel supervision
• **Logistics**: Supply chain management and operational efficiency
• **Project Management**: Planning and executing complex operations
• **Technical Proficiency**: Equipment operation and maintenance
• **Adaptability**: Functioning effectively in changing environments
{climate_specific}

These skills are highly valued by Massachusetts employers in the climate economy sector.
"""
