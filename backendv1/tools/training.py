"""
Tools for training recommendations in the Climate Economy Assistant.

This module provides functionality for recommending upskilling and educational
programs related to the Massachusetts climate economy.
"""

import json
from typing import Any, Dict, List, Optional
from langchain_core.tools import tool
from adapters.supabase import get_supabase_client
from backendv1.utils.logger import setup_logger

logger = setup_logger("training_tools")


@tool
async def recommend_upskilling(
    user_background: str,
    target_skills: List[str],
    learning_format: Optional[str] = "all",
) -> str:
    """
    Recommend upskilling and educational programs using database.

    Args:
        user_background: User background (veteran, international, etc.)
        target_skills: Skills the user wants to develop
        learning_format: Preferred learning format

    Returns:
        str: Training recommendations as a formatted string
    """
    try:
        supabase = get_supabase_client()

        # Query education_programs table
        query = supabase.table("education_programs").select("*")

        # Filter by learning format if specified
        if learning_format and learning_format != "all":
            query = query.eq("program_format", learning_format)

        # Filter by target skills
        if target_skills:
            for skill in target_skills[:3]:  # Limit to top 3 skills for performance
                query = query.contains("skills_covered", [skill])

        response = query.limit(10).execute()

        if response.data and len(response.data) > 0:
            # Format database results
            program_results = []
            for program in response.data:
                program_name = program.get("program_name", "Program TBD")
                institution = program.get("institution_name", "Institution TBD")
                duration = program.get("duration", "Duration varies")
                cost = program.get("cost", 0)
                skills_covered = program.get("skills_covered", [])
                program_format = program.get("program_format", "In-person")

                cost_info = ""
                if cost and cost > 0:
                    cost_info = f" | ${cost}"
                elif cost == 0:
                    cost_info = " | Free"
                else:
                    cost_info = " | Cost varies"

                program_results.append(
                    f"""
**{program_name}** - {institution}
⏱️ Duration: {duration} | 📚 Format: {program_format}{cost_info}
🎯 Skills: {', '.join(skills_covered[:5]) if skills_covered else 'Various skills'}
"""
                )

            # Add background-specific information
            background_info = ""
            if user_background == "veteran":
                background_info = """

## **🎖️ Veteran-Specific Resources:**
• **VET TEC Program**: IT and technical training fully covered by VA benefits
• **GI Bill**: Use education benefits for clean energy certification programs
• **Helmets to Hardhats**: Direct pathway to clean energy construction careers
• **VR&E Program**: Vocational rehabilitation for career changes into climate sector
• **IBEW Apprenticeships**: Veteran-friendly electrical programs for renewable energy
"""
            elif user_background == "international":
                background_info = """

## **🌍 International Professional Support:**
• **Credential Gap Programs**: Bridge training for international professionals
• **English for Clean Energy**: Specialized ESL programs for technical terminology
• **Professional Networks**: Connect with international professionals in clean energy
• **Skills Assessment**: Focus on demonstrating competencies through portfolio work
• **Certification Programs**: Industry certifications recognized across backgrounds
"""
            elif user_background == "environmental_justice":
                background_info = """

## **⚖️ Environmental Justice Training:**
• **Community Advocate Training**: Programs through Alternatives for Community & Environment
• **Environmental Justice Leadership**: Certificate through Roxbury Community College
• **Policy & Advocacy**: Training in environmental policy and community organizing
• **Technical Training**: Priority access to clean energy training for EJ residents
• **Leadership Development**: Programs focused on community climate leadership
"""

            # Add format-specific information
            format_info = ""
            if learning_format == "hybrid":
                format_info = "\n**📱 Hybrid Learning**: Programs combine online learning with hands-on labs and field experience."
            elif learning_format == "online":
                format_info = "\n**💻 Online Learning**: Flexible programs that fit around work and family schedules."
            elif learning_format == "community_based":
                format_info = "\n**🏘️ Community-Based**: Programs delivered in local community centers and accessible locations."

            return f"""
# **📚 Training Recommendations for Your Goals**

Based on your interest in {', '.join(target_skills[:5]) if target_skills else 'various skills'} and your {user_background} background:

{chr(10).join(program_results)}

{background_info}

{format_info}

## **💰 Funding Options:**
• **Workforce Innovation & Opportunity Act (WIOA)**: Free training for eligible individuals
• **MassHire Career Centers**: Scholarships and support for career training
• **Employer Sponsorship**: Many climate employers sponsor employee training
• **Community College Grants**: Need-based financial aid available
• **MassCEC Grants**: Training subsidies for clean energy programs

## **🚀 Next Steps:**
• **Contact Programs**: Reach out to institutions for more detailed information
• **Financial Aid**: Apply for funding through MassHire or institution financial aid
• **Skills Assessment**: Take skills assessments to identify training gaps
• **Industry Connections**: Network with professionals in your target field
• **Portfolio Development**: Start building examples of your work and learning

## **📞 Additional Resources:**
• **MassCEC Training**: www.masscec.com/training
• **MassHire Centers**: Local career center training resources
• **Bunker Hill Community College**: Leading clean energy training programs
• **Benjamin Franklin Institute**: Technical training with industry partnerships

**Your commitment to upskilling shows great potential for climate career success!**
"""
        else:
            # No specific programs found - provide general guidance
            return f"""
# **📚 Clean Energy Training Opportunities in Massachusetts**

While we don't have specific programs matching your exact criteria in our current database, here are leading training pathways:

## **🏫 Top Training Institutions:**
• **Bunker Hill Community College**: Clean Energy Certificate, Solar Installation
• **Benjamin Franklin Institute**: Technical programs with industry partnerships
• **MassCEC Training Centers**: Specialized clean energy workforce development
• **Community Colleges Statewide**: Various renewable energy and efficiency programs

## **🎯 Popular Training Areas:**
• **Solar Installation**: NABCEP certification preparation, hands-on training
• **Building Energy Efficiency**: BPI certification, energy auditing, weatherization
• **Offshore Wind**: New programs emerging for growing sector
• **Electric Vehicle Infrastructure**: Installation and maintenance training
• **Energy Storage**: Battery systems and grid integration

## **📚 Learning Formats Available:**
• **In-Person**: Hands-on labs, equipment training, direct instructor support
• **Online**: Flexible scheduling, self-paced learning, virtual simulations
• **Hybrid**: Combination of online theory and in-person practical work
• **Apprenticeships**: Earn while you learn with industry partners

## **💰 Financial Support:**
• **Free Programs**: Many programs funded through workforce development grants
• **Scholarships**: Available through community colleges and industry associations
• **Employer Training**: Many climate companies provide paid training
• **Career Counseling**: Free support through MassHire career centers

## **📞 Next Steps:**
• **Career Assessment**: Visit local MassHire center for skills and interest evaluation
• **Program Research**: Contact institutions directly for current offerings
• **Financial Aid**: Apply for workforce training funding
• **Industry Events**: Attend clean energy job fairs and information sessions

**Contact our training specialists for personalized program recommendations!**
"""

    except Exception as e:
        logger.error(f"Error recommending training: {e}")
        return f"""
# **📚 Training Recommendation Service**

We're currently experiencing technical difficulties accessing our training database.

## **Direct Resources:**
• **MassCEC Training**: www.masscec.com/training
• **Bunker Hill CC**: www.bhcc.edu/clean-energy
• **Benjamin Franklin Institute**: www.bfit.edu
• **MassHire Centers**: www.mass.gov/masshire

## **General Guidance:**
Massachusetts offers excellent clean energy training programs through community colleges, technical institutes, and industry partnerships. Most programs are available in multiple formats and have financial aid options.

**Contact our training specialists for personalized assistance: training@act-alliance.org**
"""


@tool
async def search_training_programs(
    program_type: Optional[str] = None,
    institution: Optional[str] = None,
    duration: Optional[str] = None,
    cost_range: Optional[str] = None,
) -> str:
    """
    Search training programs by specific criteria.

    Args:
        program_type: Type of program (certificate, degree, apprenticeship, etc.)
        institution: Specific institution name
        duration: Program duration preference
        cost_range: Cost preference (free, low, moderate, high)

    Returns:
        str: Search results as a formatted string
    """
    try:
        supabase = get_supabase_client()

        query = supabase.table("education_programs").select("*")

        if program_type:
            query = query.eq("program_type", program_type)
        if institution:
            query = query.ilike("institution_name", f"%{institution}%")
        if duration:
            query = query.ilike("duration", f"%{duration}%")
        if cost_range:
            if cost_range == "free":
                query = query.eq("cost", 0)
            elif cost_range == "low":
                query = query.lte("cost", 1000)
            elif cost_range == "moderate":
                query = query.gte("cost", 1000).lte("cost", 5000)
            elif cost_range == "high":
                query = query.gt("cost", 5000)

        response = query.limit(15).execute()

        if response.data and len(response.data) > 0:
            results = []
            for program in response.data:
                program_name = program.get("program_name", "Program TBD")
                institution_name = program.get("institution_name", "Institution TBD")
                duration_info = program.get("duration", "Duration varies")
                cost = program.get("cost", 0)

                cost_display = "Free" if cost == 0 else f"${cost}" if cost else "Cost varies"

                results.append(
                    f"""
**{program_name}** - {institution_name}
⏱️ {duration_info} | 💰 {cost_display}
"""
                )

            return f"""
# **🔍 Training Program Search Results**

Found {len(response.data)} programs matching your criteria:

{chr(10).join(results)}

**Note**: Contact institutions directly for current enrollment information and application processes.
"""
        else:
            return """
# **🔍 Training Program Search Results**

No programs found matching your specific criteria in our current database.

## **Suggestions:**
• **Broaden Search**: Try removing some filters
• **Alternative Resources**: Check MassCEC and community college websites
• **Contact Institutions**: Reach out to institutions directly for current offerings
• **Career Counseling**: Visit MassHire centers for personalized training guidance

**Contact our training specialists for expanded program search support.**
"""

    except Exception as e:
        logger.error(f"Error searching training programs: {e}")
        return "Unable to search training database at this time. Please contact support for assistance."


async def find_training_programs():
    return [{"name": "Climate Leadership", "duration": "3 months"}]


async def get_education_pathways():
    return [{"degree": "Environmental Science", "level": "masters"}]
