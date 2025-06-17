import logging

logger = logging.getLogger(__name__)
"""
Tools for environmental justice community information in the Climate Economy Assistant.

This module provides functionality for retrieving information about environmental
justice communities in Massachusetts.
"""

import json
from typing import Any, Dict, Optional
from langchain_core.tools import tool
from adapters.supabase import get_supabase_client
from backendv1.utils.logger import setup_logger

logger = setup_logger("communities_tools")


@tool
async def get_ej_community_info(community_name: str) -> str:
    """
    Get information about an environmental justice community from database.

    Args:
        community_name: Name of the community

    Returns:
        str: Community information as a formatted string
    """
    try:
        supabase = get_supabase_client()

        # Query environmental_justice_communities table
        response = (
            supabase.table("environmental_justice_communities")
            .select("*")
            .ilike("community_name", f"%{community_name}%")
            .execute()
        )

        if response.data and len(response.data) > 0:
            community_record = response.data[0]

            # Format database results
            community_name_db = community_record.get("community_name", community_name.title())
            environmental_challenges = community_record.get("environmental_challenges", [])
            climate_vulnerabilities = community_record.get("climate_vulnerabilities", [])
            economic_opportunities = community_record.get("economic_opportunities", [])
            community_organizations = community_record.get("community_organizations", [])
            recent_initiatives = community_record.get("recent_initiatives", [])
            job_growth_areas = community_record.get("job_growth_areas", [])

            return f"""
# **Environmental Justice Community Profile: {community_name_db}**

## **🏘️ Community Overview:**
{community_name_db} is a designated environmental justice community in Massachusetts with unique challenges and opportunities in the climate economy.

## **🌍 Environmental Challenges:**
{chr(10).join([f"• **{challenge}**" for challenge in environmental_challenges]) if environmental_challenges else "• Air quality concerns and potential contaminated sites"}

## **⚠️ Climate Vulnerabilities:**
{chr(10).join([f"• **{vulnerability}**" for vulnerability in climate_vulnerabilities]) if climate_vulnerabilities else "• Heat island effects and infrastructure vulnerabilities"}

## **💼 Economic Opportunities:**
{chr(10).join([f"• **{opportunity}**" for opportunity in economic_opportunities]) if economic_opportunities else "• Emerging green jobs in renewable energy and sustainability"}

## **🤝 Community Organizations:**
{chr(10).join([f"• **{org}**" for org in community_organizations]) if community_organizations else "• Local advocacy groups addressing environmental concerns"}

## **🚀 Recent Initiatives:**
{chr(10).join([f"• **{initiative}**" for initiative in recent_initiatives]) if recent_initiatives else "• Municipal sustainability planning and resilience projects"}

## **📈 Job Growth Areas:**
{chr(10).join([f"• **{area}**" for area in job_growth_areas]) if job_growth_areas else "• Green infrastructure, community outreach, and sustainability coordination"}

## **🎯 Climate Career Opportunities:**
• **Community Outreach**: Environmental education and engagement roles
• **Green Infrastructure**: Urban forestry, community gardens, green building
• **Energy Efficiency**: Weatherization and building retrofit programs
• **Environmental Health**: Air quality monitoring and community health advocacy
• **Climate Resilience**: Emergency preparedness and adaptation planning
• **Policy Advocacy**: Environmental justice and climate policy work

## **📞 Resources & Support:**
• **Environmental Justice Organizations**: Connect with local advocacy groups
• **MassCEC**: Clean energy workforce development programs
• **Community Development**: Local economic development initiatives
• **Training Programs**: Green jobs training and certification programs
• **Funding Opportunities**: Grants for community-based climate projects

**{community_name_db} represents both the challenges and opportunities of environmental justice work in the climate economy.**
"""
        else:
            # Community not found in database - provide general EJ community information
            community_title = community_name.title()

            return f"""
# **Environmental Justice Community Information**

## **🏘️ Community: {community_title}**

While we don't have specific data for {community_title} in our database, here's general information about environmental justice communities in Massachusetts:

## **🌍 Common Environmental Challenges:**
• **Air Quality**: Industrial facilities and traffic pollution
• **Contaminated Sites**: Legacy pollution from industrial activities
• **Limited Green Space**: Reduced access to parks and natural areas
• **Infrastructure**: Aging systems vulnerable to climate impacts

## **⚠️ Climate Vulnerabilities:**
• **Heat Islands**: Higher temperatures due to lack of tree cover
• **Flooding Risk**: Coastal and urban flooding concerns
• **Energy Burden**: Higher energy costs and efficiency needs
• **Health Impacts**: Disproportionate climate health effects

## **💼 Economic Opportunities:**
• **Green Jobs**: Clean energy, efficiency, and environmental remediation
• **Community Solar**: Local renewable energy projects
• **Weatherization**: Building efficiency and retrofit programs
• **Urban Agriculture**: Community gardens and food security initiatives
• **Environmental Monitoring**: Community-based environmental health work

## **🤝 Statewide EJ Resources:**
• **Environmental Justice Table**: Coalition of EJ organizations
• **Alternatives for Community & Environment (ACE)**: Boston-based advocacy
• **GreenRoots**: Chelsea environmental justice organization
• **Environmental League of Massachusetts**: Policy advocacy
• **Massachusetts Environmental Justice Alliance**: Statewide coordination

## **📈 Career Pathways:**
• **Community Organizer**: Environmental justice advocacy and organizing
• **Environmental Health Specialist**: Community health and safety
• **Green Infrastructure Coordinator**: Urban sustainability projects
• **Energy Efficiency Outreach**: Community energy programs
• **Climate Resilience Planner**: Adaptation and preparedness planning

## **🚀 Getting Involved:**
• **Community Meetings**: Attend local environmental justice meetings
• **Volunteer Opportunities**: Support community-based environmental projects
• **Training Programs**: Participate in environmental justice leadership development
• **Policy Advocacy**: Engage in local and state environmental policy
• **Career Development**: Explore environmental justice career pathways

**Environmental justice communities are at the forefront of climate action - there are many ways to get involved and build a career in this important work.**
"""

    except Exception as e:
        logger.error(f"Error getting EJ community info: {e}")
        return f"""
# **Environmental Justice Community Information**

We're currently experiencing technical difficulties accessing our community database.

## **General Resources:**
• **Environmental Justice Table**: www.ejt.org
• **Alternatives for Community & Environment**: www.ace-ej.org
• **GreenRoots**: www.greenrootschelsea.org
• **Environmental League of Massachusetts**: www.environmentalleague.org

## **Career Resources:**
• **Green Jobs**: Search MassCEC and MassHire for environmental positions
• **Community Organizations**: Contact local EJ groups for volunteer and career opportunities
• **Training Programs**: Look for environmental justice leadership development programs

**Contact our community engagement specialists for personalized guidance: info@act-alliance.org**
"""


@tool
async def search_ej_communities(
    region: Optional[str] = None,
    challenge_type: Optional[str] = None,
    opportunity_area: Optional[str] = None,
) -> str:
    """
    Search environmental justice communities by criteria.

    Args:
        region: Geographic region (Boston, Western MA, etc.)
        challenge_type: Type of environmental challenge
        opportunity_area: Type of economic opportunity

    Returns:
        str: Search results as a formatted string
    """
    try:
        supabase = get_supabase_client()

        query = supabase.table("environmental_justice_communities").select("*")

        if region:
            query = query.ilike("region", f"%{region}%")
        if challenge_type:
            query = query.contains("environmental_challenges", [challenge_type])
        if opportunity_area:
            query = query.contains("economic_opportunities", [opportunity_area])

        response = query.limit(10).execute()

        if response.data and len(response.data) > 0:
            results = []
            for record in response.data:
                community_name = record.get("community_name", "Unknown")
                region_name = record.get("region", "Unknown")
                key_challenges = record.get("environmental_challenges", [])
                key_opportunities = record.get("economic_opportunities", [])

                results.append(
                    f"""
**Community**: {community_name}
**Region**: {region_name}
**Key Challenges**: {', '.join(key_challenges[:3]) if key_challenges else 'Various environmental issues'}
**Opportunities**: {', '.join(key_opportunities[:3]) if key_opportunities else 'Green jobs and sustainability'}
"""
                )

            return f"""
# **Environmental Justice Communities Search**

Found {len(response.data)} communities matching your criteria:

{chr(10).join(results)}

**Note**: These communities offer various opportunities for environmental justice work and climate careers.
"""
        else:
            return """
# **Environmental Justice Communities Search**

No communities found matching your specific criteria.

## **Statewide EJ Communities Include:**
• **Boston Area**: Roxbury, Dorchester, East Boston, Chelsea
• **Western MA**: Springfield, Holyoke, Pittsfield
• **Central MA**: Worcester, Fitchburg
• **Cape & Islands**: New Bedford, Fall River

## **Common Opportunity Areas:**
• **Clean Energy**: Solar, wind, energy efficiency
• **Environmental Health**: Air quality, contamination cleanup
• **Green Infrastructure**: Parks, urban forestry, sustainable transportation
• **Community Organizing**: Environmental justice advocacy
• **Policy Work**: Local and state environmental policy

**Contact our community engagement team for specific community information.**
"""

    except Exception as e:
        logger.error(f"Error searching EJ communities: {e}")
        return "Unable to search community database at this time. Please contact support for assistance."


def get_partner_organizations(user_id: str = None):
    return [{"id": "org_1", "name": "Climate Solutions Inc", "type": "Technology"}]


async def get_partner_stats(user_id: str = None):
    return {
        "total_partners": 15,
        "active_partnerships": 12,
        "recent_collaborations": 8,
        "partnership_score": 85.5,
    }


from typing import Dict, Any, List
