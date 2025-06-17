"""
Tools for job matching in the Climate Economy Assistant.

This module provides functionality for matching user profiles to relevant
job opportunities in the Massachusetts climate economy.
"""

import json
from typing import Any, Dict, List, Optional
from langchain_core.tools import tool
from adapters.supabase import get_supabase_client
from backendv1.utils.logger import setup_logger

logger = setup_logger("jobs_tools")


@tool
async def match_jobs_for_profile(
    skills: List[str],
    background: Optional[str] = None,
    experience_level: Optional[str] = "entry_level",
) -> str:
    """
    Match a user profile to relevant job opportunities using database.

    Args:
        skills: List of user skills
        background: User background (veteran, international, etc.)
        experience_level: User experience level

    Returns:
        str: Job matching results with real database data
    """
    try:
        supabase = get_supabase_client()

        # Query job_listings table
        query = supabase.table("job_listings").select("*")

        # Filter by experience level if provided
        if experience_level:
            query = query.eq("experience_level", experience_level)

        # Filter by skills (search in required_skills array)
        if skills:
            for skill in skills[:3]:  # Limit to top 3 skills for performance
                query = query.contains("required_skills", [skill])

        response = query.limit(10).execute()

        if response.data and len(response.data) > 0:
            # Format database results
            job_results = []
            for job in response.data:
                company = job.get("company_name", "Company TBD")
                title = job.get("job_title", "Role TBD")
                location = job.get("location", "Massachusetts")
                salary_min = job.get("salary_min", 0)
                salary_max = job.get("salary_max", 0)
                required_skills = job.get("required_skills", [])
                job_type = job.get("job_type", "Full-time")

                salary_info = ""
                if salary_min and salary_max:
                    salary_info = f" | ${salary_min}-{salary_max}/hour"
                elif salary_min:
                    salary_info = f" | Starting at ${salary_min}/hour"

                job_results.append(
                    f"""
**{title}** at **{company}**
📍 Location: {location} | {job_type}{salary_info}
🎯 Required Skills: {', '.join(required_skills[:5]) if required_skills else 'Various skills needed'}
"""
                )

            # Add background-specific information
            background_info = ""
            if background == "veteran":
                background_info = """

## **🎖️ Veteran-Specific Opportunities:**
• **Priority Hiring**: Many climate employers participate in veteran hiring initiatives
• **Skills Translation**: Military experience valued in project management and technical roles
• **Training Support**: Use GI Bill benefits for clean energy certifications
• **IBEW Local 103/223**: Veteran-friendly apprenticeship programs
• **DoD SkillBridge**: Available with several Massachusetts climate employers
"""
            elif background == "international":
                background_info = """

## **🌍 International Professional Support:**
• **Credential Recognition**: Many employers work with internationally-trained professionals  
• **Skills Assessment**: Focus on demonstrating technical competencies over specific credentials
• **Language Support**: Some employers offer English language workplace support
• **Networking**: Join international professional associations in clean energy
• **Mentorship**: Connect with other international professionals in climate careers
"""
            elif background == "environmental_justice":
                background_info = """

## **⚖️ Environmental Justice Career Paths:**
• **Community Engagement**: Many roles focus on community outreach and education
• **Policy Work**: Opportunities in environmental justice advocacy and policy
• **Local Hiring**: Many EJ communities have local hiring preferences for climate projects
• **Training Programs**: Specialized programs for EJ community residents
• **Leadership Development**: Pathways for community leadership in climate work
"""

            return f"""
# **🎯 Job Matches for Your Profile**

Based on your skills ({', '.join(skills[:5]) if skills else 'various skills'}) and {experience_level} experience level:

{chr(10).join(job_results)}

{background_info}

## **📈 Next Steps:**
• **Apply Directly**: Use company contact information provided
• **Network**: Connect with professionals in these companies via LinkedIn
• **Skills Development**: Consider additional certifications relevant to these roles
• **Portfolio**: Develop examples that demonstrate your relevant experience
• **Follow Up**: Engage with company social media and attend industry events

## **💡 Additional Resources:**
• **MassCEC Job Board**: www.masscec.com/careers
• **Climate Career Hub**: Browse additional climate job opportunities  
• **Industry Events**: Attend clean energy networking events in Massachusetts
• **Professional Development**: Join relevant professional associations

**Your skills align well with Massachusetts' growing climate economy!**
"""
        else:
            # No specific jobs found - provide general guidance
            return f"""
# **🎯 Climate Career Opportunities in Massachusetts**

While we don't have specific job matches for your exact profile in our current database, here are growing areas in Massachusetts climate economy:

## **🌊 High-Growth Sectors:**
• **Offshore Wind**: New Bedford becoming major hub with thousands of jobs
• **Solar Energy**: Continued growth across residential and commercial sectors  
• **Energy Efficiency**: Building retrofits and weatherization programs
• **Electric Vehicles**: Infrastructure buildout creating new opportunities
• **Climate Resilience**: Municipal and state adaptation planning

## **📊 Experience Level Opportunities:**
• **Entry Level ({experience_level})**: Installer helpers, data entry, customer service
• **Mid Level**: Technicians, project coordinators, energy auditors
• **Senior Level**: Project managers, engineers, business development
• **Leadership**: Program directors, policy roles, executive positions

## **🎯 Skills in Demand:**
• **Technical**: Electrical, construction, engineering, data analysis
• **Project Management**: Planning, coordination, stakeholder management
• **Customer Service**: Sales, education, community outreach
• **Policy/Advocacy**: Research, writing, regulatory knowledge

## **📞 Resources:**
• **MassCEC**: Massachusetts Clean Energy Center job resources
• **MassHire**: Career centers with climate economy focus
• **Industry Associations**: SEIMA, NESEA, Mass Solar & Wind
• **Training Programs**: Upskill for better job matches

**Contact our career specialists for personalized job search support!**
"""

    except Exception as e:
        logger.error(f"Error matching jobs: {e}")
        return f"""
# **🎯 Job Matching Service**

We're currently experiencing technical difficulties accessing our job database.

## **Direct Resources:**
• **MassCEC Job Board**: www.masscec.com/careers
• **Mass Solar & Wind Jobs**: www.mswea.org/jobs
• **Energy Efficiency Jobs**: Search MassHire career centers
• **Offshore Wind Careers**: www.newbedford-ma.gov/economic-development

## **General Guidance:**
Massachusetts climate economy offers opportunities across all skill levels. Key sectors include offshore wind, solar energy, energy efficiency, and electric vehicle infrastructure.

**Contact our career specialists for personalized assistance: careers@act-alliance.org**
"""


@tool
async def search_jobs_by_criteria(
    job_type: Optional[str] = None,
    location: Optional[str] = None,
    company_name: Optional[str] = None,
    salary_min: Optional[int] = None,
) -> str:
    """
    Search job listings by specific criteria.

    Args:
        job_type: Type of job (full-time, part-time, contract, etc.)
        location: Job location or region
        company_name: Specific company name
        salary_min: Minimum salary requirement

    Returns:
        str: Search results as a formatted string
    """
    try:
        supabase = get_supabase_client()

        query = supabase.table("job_listings").select("*")

        if job_type:
            query = query.eq("job_type", job_type)
        if location:
            query = query.ilike("location", f"%{location}%")
        if company_name:
            query = query.ilike("company_name", f"%{company_name}%")
        if salary_min:
            query = query.gte("salary_min", salary_min)

        response = query.limit(15).execute()

        if response.data and len(response.data) > 0:
            results = []
            for job in response.data:
                company = job.get("company_name", "Company TBD")
                title = job.get("job_title", "Role TBD")
                location_info = job.get("location", "Massachusetts")
                job_type_info = job.get("job_type", "Full-time")

                results.append(
                    f"""
**{title}** at **{company}**
📍 {location_info} | {job_type_info}
💰 Salary: {f"${job.get('salary_min', 'TBD')}" if job.get('salary_min') else 'Competitive'}
"""
                )

            return f"""
# **🔍 Job Search Results**

Found {len(response.data)} jobs matching your criteria:

{chr(10).join(results)}

**Note**: Contact companies directly for application processes and additional details.
"""
        else:
            return """
# **🔍 Job Search Results**

No jobs found matching your specific criteria in our current database.

## **Suggestions:**
• **Broaden Search**: Try removing some filters
• **Alternative Resources**: Check MassCEC and MassHire job boards
• **Network**: Connect with companies directly via LinkedIn
• **Industry Events**: Attend clean energy job fairs and networking events

**Contact our career specialists for expanded job search support.**
"""

    except Exception as e:
        logger.error(f"Error searching jobs: {e}")
        return "Unable to search job database at this time. Please contact support for assistance."


async def search_jobs(query: str = "", location: str = "", limit: int = 10):
    return []


async def get_job_categories():
    return {"categories": ["renewable_energy", "sustainability", "environmental"]}


async def get_salary_insights():
    return {"avg_min": 60000, "avg_max": 120000, "top_sectors": ["solar", "wind", "efficiency"]}
