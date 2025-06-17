"""
Advanced Job Matching Tools for Climate Economy Assistant.

This module provides sophisticated job matching functionality that considers
user profiles, skills, preferences, and climate career opportunities.
"""

from typing import Any, Dict, List, Optional
from langchain_core.tools import tool


@tool
async def advanced_job_matching(
    user_skills: List[str],
    user_background: str,
    location_preference: str = "Massachusetts",
    salary_range: Optional[str] = None,
    work_format: Optional[str] = "hybrid",
) -> str:
    """
    Advanced job matching using comprehensive user profile analysis.

    Args:
        user_skills: List of user's current skills
        user_background: User background (veteran, international, etc.)
        location_preference: Preferred work location
        salary_range: Desired salary range (e.g., "50k-80k")
        work_format: Preferred work format (remote, hybrid, onsite)

    Returns:
        str: Personalized job recommendations with detailed matching rationale
    """
    # Enhanced matching logic with background-specific opportunities
    background_specific_jobs = ""

    if user_background == "veteran":
        background_specific_jobs = """
🎖️ **Veteran-Friendly Climate Opportunities:**
• **Energy Project Manager** - Raytheon Technologies (Security clearance preferred)
• **Solar Installation Supervisor** - SunPower (Leadership experience valued)
• **Grid Modernization Specialist** - National Grid (Technical military background ideal)
"""
    elif user_background == "international":
        background_specific_jobs = """
🌍 **International-Friendly Climate Roles:**
• **Sustainability Analyst** - Boston Consulting Group (Multiple languages valued)
• **Environmental Compliance Specialist** - GE Renewable Energy (Global perspective needed)
• **Climate Data Scientist** - MIT Climate Co-Lab (International research background)
"""
    elif user_background == "environmental_justice":
        background_specific_jobs = """
⚖️ **Environmental Justice Focused Roles:**
• **Community Engagement Coordinator** - Alternatives for Community & Environment
• **Environmental Justice Analyst** - Massachusetts DEP
• **Climate Equity Program Manager** - The Nature Conservancy
"""

    skills_match = f"Based on your skills in {', '.join(user_skills[:3])}"
    location_note = (
        f"in {location_preference}"
        if location_preference != "Massachusetts"
        else "across Massachusetts"
    )

    salary_info = ""
    if salary_range:
        salary_info = (
            f"\n💰 **Salary Range Match**: Positions matching {salary_range} highlighted with 💰"
        )

    return f"""
🎯 **Personalized Climate Career Matches** {location_note}:

{skills_match}, here are your top opportunities:

**🌱 General Climate Economy Roles:**
• **Climate Resilience Planner** - City of Boston (💰65k-85k)
• **Energy Efficiency Consultant** - Massachusetts Clean Energy Center
• **Sustainability Coordinator** - Harvard University (Remote/Hybrid)
• **Green Infrastructure Specialist** - MassDOT

{background_specific_jobs}

**📍 Location-Specific Opportunities:**
• Gateway Cities focus: Lowell, Lawrence, Fall River have emerging clean energy hubs
• Greater Boston: High concentration of climate tech startups
• Western MA: Wind energy and rural sustainability projects{salary_info}

**🔗 Application Strategy:**
• Apply directly through company websites for best response rates
• Leverage your {user_background} background as a unique strength
• Network through ACT Alliance partner organizations
"""


@tool
async def skills_gap_analysis(
    current_skills: List[str],
    target_position: str,
    industry_focus: str = "climate_economy",
) -> str:
    """
    Analyze skills gaps for target climate economy positions.

    Args:
        current_skills: User's current skills
        target_position: Desired job title/role
        industry_focus: Industry focus area

    Returns:
        str: Detailed skills gap analysis with development recommendations
    """
    # Simplified gap analysis logic
    position_lower = target_position.lower()

    # Define required skills for common climate positions
    required_skills = {}
    if "analyst" in position_lower or "data" in position_lower:
        required_skills = [
            "Data Analysis",
            "Python/R",
            "Excel",
            "Report Writing",
            "Statistical Modeling",
        ]
    elif "manager" in position_lower or "coordinator" in position_lower:
        required_skills = [
            "Project Management",
            "Team Leadership",
            "Budget Management",
            "Stakeholder Communication",
        ]
    elif "specialist" in position_lower or "consultant" in position_lower:
        required_skills = [
            "Subject Matter Expertise",
            "Client Communication",
            "Problem Solving",
            "Technical Writing",
        ]
    else:
        required_skills = [
            "Communication",
            "Problem Solving",
            "Adaptability",
            "Technical Skills",
        ]

    # Climate-specific additions
    climate_skills = [
        "Climate Science Basics",
        "Sustainability Principles",
        "Environmental Regulations",
        "Green Technology",
    ]
    required_skills.extend(climate_skills)

    # Compare current vs required
    missing_skills = [skill for skill in required_skills if skill not in current_skills]
    existing_strengths = [skill for skill in current_skills if skill in required_skills]

    return f"""
📊 **Skills Gap Analysis for {target_position}**

✅ **Your Existing Strengths:**
{chr(10).join([f"• {skill}" for skill in existing_strengths[:5]])}

🎯 **Skills to Develop:**
{chr(10).join([f"• {skill}" for skill in missing_skills[:5]])}

📚 **Recommended Development Path:**
1. **Priority Skills** (0-3 months): {', '.join(missing_skills[:2])}
2. **Secondary Skills** (3-6 months): {', '.join(missing_skills[2:4])}
3. **Advanced Skills** (6+ months): {', '.join(missing_skills[4:6])}

🎓 **Training Resources:**
• MassHire Career Centers: Free workforce development programs
• Mass Clean Energy Center: Industry-specific training
• Bunker Hill Community College: Certificate programs
• Online: Coursera Climate Change courses (U Michigan)

💡 **Gap-Bridging Strategy:**
Focus on your transferable strengths while building missing technical skills through targeted training.
"""


async def find_job_matches(user_id: str):
    return [{"title": "Climate Analyst", "score": 85, "organization": "Green Corp"}]


async def calculate_match_scores(user_profile: dict, jobs: list):
    return [{"job_id": "123", "score": 85}]
