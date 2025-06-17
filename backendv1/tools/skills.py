"""
Tools for skills translation in the Climate Economy Assistant.

This module provides functionality for translating skills between domains,
particularly focusing on military-to-civilian skills translation.
"""

import json
from typing import Any, Dict, Optional, List
from langchain_core.tools import tool
from adapters.supabase import get_supabase_client
from backendv1.utils.logger import setup_logger

logger = setup_logger("skills_tools")


@tool
async def translate_military_skills(
    military_branch: str, mos_code: Optional[str] = None, climate_focus: bool = False
) -> str:
    """
    Translate military skills to civilian equivalents using database.

    Args:
        military_branch: Military branch (army, navy, etc.)
        mos_code: Military Occupational Specialty code
        climate_focus: Whether to focus on climate economy relevance

    Returns:
        str: Skill translation results as a formatted string
    """
    try:
        supabase = get_supabase_client()

        if mos_code and mos_code.lower() != "generalist":
            # Query mos_translation table for specific MOS
            response = (
                supabase.table("mos_translation")
                .select("*")
                .eq("mos_code", mos_code.upper())
                .execute()
            )

            if response.data and len(response.data) > 0:
                mos_record = response.data[0]

                # Format database results
                civilian_equivalents = mos_record.get("civilian_equivalents", [])
                transferable_skills = mos_record.get("transferable_skills", [])
                mos_title = mos_record.get("mos_title", f"MOS {mos_code}")

                climate_specific = ""
                if climate_focus:
                    climate_specific = f"""

## **🌍 Climate Economy Applications:**
• **Renewable Energy**: Your technical skills apply to solar, wind, and energy storage systems
• **Energy Efficiency**: Building systems experience translates to green building and retrofits
• **Climate Resilience**: Emergency response skills valuable for climate adaptation planning
• **Sustainability Operations**: Logistics and operations experience applies to sustainable supply chains
• **Environmental Monitoring**: Technical expertise valuable for environmental compliance and monitoring
"""

                return f"""
# **Military Skills Translation: {mos_title}**

## **📋 MOS Details:**
**Code**: {mos_code.upper()}
**Title**: {mos_title}
**Branch**: {military_branch.upper()}

## **💼 Civilian Career Equivalents:**
{chr(10).join([f"• **{equiv}**" for equiv in civilian_equivalents]) if civilian_equivalents else "• General technical and leadership roles"}

## **🎯 Transferable Skills:**
{chr(10).join([f"• **{skill}**" for skill in transferable_skills]) if transferable_skills else "• Leadership, technical proficiency, problem-solving, teamwork"}

{climate_specific}

## **📈 Massachusetts Opportunities:**
• **MassCEC Programs**: Clean energy workforce development
• **Veteran Hiring Initiatives**: Priority placement with climate employers
• **Skills-Based Hiring**: Many climate companies value military experience
• **Training Programs**: Additional certifications to bridge skill gaps

## **🚀 Next Steps:**
• **Resume Translation**: Highlight civilian applications of military experience
• **Networking**: Connect with veteran professionals in climate careers
• **Certifications**: Consider industry-specific certifications (NABCEP, LEED, etc.)
• **Informational Interviews**: Learn about specific climate career paths

**Your military experience is highly valued in the climate economy - let's leverage it effectively!**
"""
            else:
                # MOS not found in database - provide general guidance
                return await _provide_general_military_translation(
                    military_branch, mos_code, climate_focus
                )
        else:
            # No specific MOS provided - general military skills translation
            return await _provide_general_military_translation(
                military_branch, mos_code, climate_focus
            )

    except Exception as e:
        logger.error(f"Error translating military skills: {e}")
        return await _provide_general_military_translation(military_branch, mos_code, climate_focus)


async def _provide_general_military_translation(
    military_branch: str, mos_code: Optional[str], climate_focus: bool
) -> str:
    """Provide general military skills translation when specific MOS not found."""

    branch_upper = military_branch.upper()
    mos_info = f" with MOS {mos_code}" if mos_code and mos_code.lower() != "generalist" else ""

    climate_specific = ""
    if climate_focus:
        climate_specific = """

## **🌍 Climate Economy Applications:**
• **Energy Systems**: Military experience with power generation translates to renewable energy systems
• **Emergency Response**: Crisis management skills apply to climate resilience and disaster response
• **Technical Expertise**: Military technical training provides foundation for clean energy technology
• **Project Management**: Military planning experience valuable for climate infrastructure projects
• **Leadership**: Military leadership skills essential for climate team management
"""

    return f"""
# **Military Skills Translation**

## **📋 Your Background:**
**Branch**: {branch_upper}
**Experience**: {f"MOS {mos_code}" if mos_code and mos_code != "generalist" else "General military experience"}

## **💼 Core Transferable Skills:**
• **Leadership & Management**: Team supervision, personnel development, mission planning
• **Technical Proficiency**: Equipment operation, maintenance, troubleshooting
• **Project Management**: Complex operation planning, resource coordination, timeline management
• **Problem Solving**: Critical thinking under pressure, adaptive solutions
• **Communication**: Clear briefings, cross-functional coordination, training delivery
• **Safety & Compliance**: Risk assessment, safety protocols, regulatory adherence
• **Logistics & Operations**: Supply chain management, inventory control, process optimization

{climate_specific}

## **📈 Massachusetts Climate Opportunities:**
• **Clean Energy Technician**: Solar, wind, energy storage installation and maintenance
• **Project Manager**: Renewable energy and efficiency project coordination
• **Operations Manager**: Sustainable operations and supply chain management
• **Safety Coordinator**: Environmental health and safety in clean energy
• **Training Specialist**: Workforce development for clean energy careers
• **Field Supervisor**: Leading technical teams in climate infrastructure

## **🎯 Veteran Advantages:**
• **Security Clearance**: Valuable for government climate contracts
• **Discipline & Reliability**: Highly valued by climate employers
• **Adaptability**: Essential for rapidly evolving clean energy sector
• **Mission Focus**: Aligns with climate action and environmental stewardship

## **🚀 Career Development Strategy:**
• **Skills Assessment**: Identify specific technical skills that transfer
• **Industry Certifications**: OSHA, NABCEP, LEED, or field-specific credentials
• **Networking**: Join veteran professional organizations in clean energy
• **Mentorship**: Connect with veterans who've transitioned to climate careers
• **Continuous Learning**: Stay current with clean energy technologies and policies

## **📞 Resources:**
• **MassHire Veterans Services**: Career counseling and job placement
• **MassCEC**: Clean energy training and career pathways
• **Corporate Gray**: Veteran job placement in clean energy
• **ACT Alliance**: Climate career guidance and support

**Your military service has prepared you well for climate careers - let's translate that experience into your next mission!**
"""


@tool
async def search_mos_database(
    mos_code: Optional[str] = None, skill_keyword: Optional[str] = None
) -> str:
    """
    Search the MOS translation database for specific codes or skills.

    Args:
        mos_code: Military Occupational Specialty code to search for
        skill_keyword: Keyword to search in transferable skills

    Returns:
        str: Search results as a formatted string
    """
    try:
        supabase = get_supabase_client()

        query = supabase.table("mos_translation").select("*")

        if mos_code:
            query = query.eq("mos_code", mos_code.upper())
        elif skill_keyword:
            # Search in transferable_skills array
            query = query.contains("transferable_skills", [skill_keyword])

        response = query.limit(10).execute()

        if response.data and len(response.data) > 0:
            results = []
            for record in response.data:
                civilian_equivalents = record.get("civilian_equivalents", [])
                transferable_skills = record.get("transferable_skills", [])

                results.append(
                    f"""
**MOS Code**: {record.get('mos_code', 'Unknown')}
**Title**: {record.get('mos_title', 'Unknown')}
**Civilian Equivalents**: {', '.join(civilian_equivalents[:3]) if civilian_equivalents else 'General roles'}
**Key Skills**: {', '.join(transferable_skills[:5]) if transferable_skills else 'Leadership, technical skills'}
"""
                )

            return f"""
# **MOS Database Search Results**

Found {len(response.data)} matching military occupational specialties:

{chr(10).join(results)}

**Note**: This data helps translate military experience to civilian career opportunities.
"""
        else:
            return """
# **MOS Database Search**

No matching MOS codes found in our database.

## **Alternative Resources:**
• **Military Skills Translator**: Use online military-to-civilian skill translators
• **Career Counseling**: Work with veteran career counselors
• **Industry Research**: Research specific climate career requirements

**Contact our veteran career specialists for personalized guidance.**
"""

    except Exception as e:
        logger.error(f"Error searching MOS database: {e}")
        return "Unable to search MOS database at this time. Please contact support for assistance."


async def get_skills_frameworks():
    return {"frameworks": ["clean_energy", "sustainability", "environmental"]}


async def assess_skill_gaps(user_id: str = None):
    return {
        "gaps": ["data_analysis", "project_management"],
        "recommendations": ["take_course", "get_certification"],
    }
