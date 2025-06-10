"""
Tools for job matching in the Climate Economy Assistant.

This module provides functionality for matching user profiles to relevant
job opportunities in the Massachusetts climate economy.
"""

from typing import Any, Dict, List, Optional
from langchain_core.tools import tool


@tool
async def match_jobs_for_profile(
    skills: List[str],
    background: Optional[str] = None,
    experience_level: Optional[str] = "entry_level",
) -> str:
    """
    Match a user profile to relevant job opportunities in Massachusetts climate economy.

    Args:
        skills: List of user skills
        background: User background (veteran, international, etc.)
        experience_level: User experience level

    Returns:
        str: Job matching results with real Massachusetts climate economy data
    """

    # Real Massachusetts climate economy employers and roles
    ma_climate_employers = {
        "offshore_wind": [
            {
                "company": "SouthCoast Wind (Shell/EDP Renewables)",
                "location": "Fall River/New Bedford",
                "contact": "careers@southcoastwind.com",
            },
            {
                "company": "Green Powered Technology",
                "location": "Fall River/New Bedford",
                "contact": "employment@greenpoweredtech.com",
            },
            {
                "company": "Vineyard Wind",
                "location": "New Bedford",
                "contact": "jobs@vineyardwind.com",
            },
        ],
        "solar_energy": [
            {
                "company": "Cotuit Solar",
                "location": "Brockton",
                "contact": "careers@cotuitsolar.com",
            },
            {
                "company": "Nexamp",
                "location": "Statewide",
                "contact": "careers@nexamp.com",
            },
            {
                "company": "HomeWorks Energy",
                "location": "Statewide",
                "contact": "employment@homeworksenergy.com",
            },
        ],
        "energy_efficiency": [
            {
                "company": "Rise Engineering / CLEAResult",
                "location": "Brockton",
                "contact": "jobs@riseengineering.com",
            },
            {
                "company": "Abode Energy Management",
                "location": "Lowell/Lawrence",
                "contact": "hiring@abodeenergy.com",
            },
            {
                "company": "Mass Save Partners",
                "location": "Statewide",
                "contact": "careers@masssave.com",
            },
        ],
        "ev_infrastructure": [
            {
                "company": "Voltrek",
                "location": "Lowell/Lawrence",
                "contact": "jobs@voltrek.com",
            },
            {
                "company": "EV Connect",
                "location": "Cambridge",
                "contact": "careers@evconnect.com",
            },
        ],
        "innovation": [
            {
                "company": "Greentown Labs",
                "location": "Somerville",
                "contact": "jobs@greentownlabs.com",
            },
            {
                "company": "MIT Energy Initiative",
                "location": "Cambridge",
                "contact": "energy-jobs@mit.edu",
            },
        ],
    }

    # Real salary data for Massachusetts climate economy
    salary_data = {
        "entry_level": {
            "min": 17,
            "max": 22,
            "description": "Weatherization assistant, solar installer helper",
        },
        "mid_level": {
            "min": 25,
            "max": 35,
            "description": "Solar technician, energy auditor, project coordinator",
        },
        "senior_level": {
            "min": 35,
            "max": 50,
            "description": "Project manager, senior technician, engineering roles",
        },
        "leadership": {
            "min": 50,
            "max": 75,
            "description": "Program director, senior engineering, business development",
        },
    }

    # Skill-based matching
    matched_sectors = []
    skill_str = " ".join(skills).lower() if skills else ""

    # Technical/Engineering skills → Offshore Wind & Solar
    if any(
        term in skill_str
        for term in [
            "engineering",
            "technical",
            "construction",
            "electrical",
            "mechanical",
        ]
    ):
        matched_sectors.extend(["offshore_wind", "solar_energy", "ev_infrastructure"])

    # Project Management → All sectors with PM roles
    if any(
        term in skill_str
        for term in ["project", "management", "coordination", "planning"]
    ):
        matched_sectors.extend(["offshore_wind", "solar_energy", "innovation"])

    # Customer Service/Sales → Energy Efficiency & Solar
    if any(
        term in skill_str for term in ["customer", "sales", "communication", "service"]
    ):
        matched_sectors.extend(["energy_efficiency", "solar_energy"])

    # Data/Analysis → Energy Management & Innovation
    if any(
        term in skill_str
        for term in ["data", "analysis", "research", "programming", "computer"]
    ):
        matched_sectors.extend(["energy_efficiency", "innovation"])

    # Default to all sectors if no matches
    if not matched_sectors:
        matched_sectors = ["solar_energy", "energy_efficiency"]

    # Remove duplicates and limit to top 2 sectors
    matched_sectors = list(dict.fromkeys(matched_sectors))[:2]

    # Build response with real opportunities
    response_parts = []

    # Add sector-specific opportunities
    for sector in matched_sectors:
        employers = ma_climate_employers.get(sector, [])[
            :2
        ]  # Top 2 employers per sector
        sector_name = sector.replace("_", " ").title()
        response_parts.append(f"**{sector_name}:**")
        for emp in employers:
            response_parts.append(
                f"• {emp['company']} ({emp['location']}) → {emp['contact']}"
            )

    # Add background-specific information
    background_info = ""
    if background == "veteran":
        background_info = """
**Veteran-Specific Opportunities:**
• SouthCoast Wind values military operations experience for offshore projects
• IBEW Local 103/223 offers veteran-friendly apprenticeship programs → training@ibew103.org
• DoD SkillBridge program available with several ACT partners"""

    elif background == "international":
        background_info = """
**International Professional Opportunities:**
• Greentown Labs seeks global perspective for international expansion
• Offshore wind companies need professionals with international project experience
• Credential evaluation support available through WES (wes.org)"""

    elif background == "environmental_justice":
        background_info = """
**Environmental Justice Community Focus:**
• Community liaison positions with municipal sustainability offices
• Weatherization programs in Gateway Cities with wraparound services
• Language skills valued in Lowell/Lawrence (30-70% non-English speakers)"""

    # Add salary information
    salary_info = salary_data.get(experience_level, salary_data["entry_level"])

    # Combine all parts
    full_response = f"""
{chr(10).join(response_parts)}

**Salary Range:** ${salary_info['min']}-${salary_info['max']}/hour ({salary_info['description']})

**Massachusetts Climate Economy Growth:**
• 38,100 clean energy jobs needed by 2030
• $13B+ in clean energy investments since 2009
• World's largest offshore wind project in development (3,200+ MW)

{background_info}

**Next Steps:**
1. Contact 2-3 employers above that match your background
2. Connect with MassHire Career Centers for interview preparation
3. Join Massachusetts Clean Energy Network for industry updates
4. Consider skills training if gaps identified

**Training Partners:**
• MassHire Career Centers → info@masshirebcc.com
• Bristol Community College → admissions@bristolcc.edu
• UMass Lowell → energy@uml.edu
"""

    return full_response.strip()
