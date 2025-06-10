"""
Tools for training recommendations in the Climate Economy Assistant.

This module provides functionality for recommending upskilling and educational
programs related to the Massachusetts climate economy.
"""

from typing import Any, Dict, List, Optional
from langchain_core.tools import tool


@tool
async def recommend_upskilling(
    user_background: str,
    target_skills: List[str],
    learning_format: Optional[str] = "all",
) -> str:
    """
    Recommend upskilling and educational programs.

    Args:
        user_background: User background (veteran, international, etc.)
        target_skills: Skills the user wants to develop
        learning_format: Preferred learning format

    Returns:
        str: Training recommendations as a formatted string
    """
    # This is a placeholder implementation
    # In a real implementation, this would query a database or API

    background_specific = ""
    if user_background == "veteran":
        background_specific = "• **VET TEC Program**: IT training fully covered by VA benefits\n• **Helmets to Hardhats**: Direct pathway to clean energy construction careers"
    elif user_background == "international":
        background_specific = "• **Credential Gap Programs**: Bridge training for international professionals\n• **English for Clean Energy**: Specialized ESL programs for technical terminology"
    elif user_background == "environmental_justice":
        background_specific = "• **Community Advocate Training**: Programs through Alternatives for Community & Environment\n• **Environmental Justice Leadership**: Certificate through Roxbury Community College"

    format_note = ""
    if learning_format == "hybrid":
        format_note = " with flexible hybrid options"
    elif learning_format == "online":
        format_note = " delivered fully online"
    elif learning_format == "community_based":
        format_note = " offered in community settings"

    return f"""
Based on your interest in {', '.join(target_skills[:3])}{format_note}:

• **Clean Energy Certificate**: Bunker Hill Community College (4-month program)
• **Building Energy Efficiency**: Mass Clean Energy Center subsidized training
• **Climate Resilience Planning**: UMass Boston continuing education program
{background_specific}

Funding options: Workforce training grants available through MassHire career centers
Time commitment: Programs range from 2-month certificates to 1-year specialized training
"""
