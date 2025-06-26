import logging

"""
Lauren - Environmental Justice Specialist Agent
Specializes in environmental justice, community engagement, and equitable climate solutions.
"""

from typing import Dict, Any, List
import logging
from datetime import datetime
from langchain_core.tools import tool
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_openai import ChatOpenAI
from langgraph.types import Command

# from langgraph.prebuilt import InjectedState
from typing import Annotated, Literal

from backend.agents.base.agent_base import BaseAgent, AgentState

logger = logging.getLogger(__name__)


class LaurenAgent(BaseAgent):
    """
    Lauren - Environmental Justice Specialist
    Responsible for environmental justice analysis and community engagement
    """

    def __init__(self):
        super().__init__(
            name="Lauren",
            description="Environmental Justice Specialist focusing on equitable climate solutions",
            intelligence_level=8.5,
            tools=[
                "environmental_justice_analysis",
                "community_impact_assessment",
                "equity_policy_review",
                "grassroots_organizing",
                "environmental_health_screening",
            ],
        )

    async def process_message(
        self, state: AgentState
    ) -> Command[Literal["specialists_team"]]:
        """Process message with environmental justice focus"""
        try:
            user_message = next(
                (m["content"] for m in state.messages if m.get("role") == "user"), ""
            )

            response = "I'm Lauren, your Environmental Justice Specialist. I help identify environmental inequities, assess community impacts, and develop strategies for equitable climate solutions that prioritize frontline communities."

            message = {
                "role": "assistant",
                "content": response,
                "agent": "lauren",
                "team": "specialists_team",
                "timestamp": datetime.now().isoformat(),
                "metadata": {
                    "specialization": "environmental_justice",
                    "confidence_score": 0.9,
                },
            }

            new_messages = state.messages + [message]

            return Command(
                goto="specialists_team",
                update={"messages": new_messages, "current_agent": "lauren"},
            )

        except Exception as e:
            logger.error(f"Error in Lauren agent: {str(e)}")
            return Command(
                goto="specialists_team",
                update={
                    "messages": state.messages
                    + [
                        {
                            "role": "assistant",
                            "content": f"I apologize, but I encountered an error. {str(e)}",
                            "agent": "lauren",
                        }
                    ]
                },
            )


# Tools for Lauren
@tool
def analyze_environmental_justice_impacts(
    location: str, issue_type: str = "general", state: dict = None
) -> str:
    """Analyze environmental justice impacts and disparities in specific locations."""

    ej_analysis = f"""
ENVIRONMENTAL JUSTICE ANALYSIS - {location.upper()}

**ENVIRONMENTAL HEALTH DISPARITIES:**
• Air Quality: Disproportionate exposure to air pollution
• Water Quality: Access to clean, safe drinking water
• Soil Contamination: Legacy pollution and current exposures
• Noise Pollution: Traffic, industrial, and infrastructure impacts
• Heat Islands: Lack of green space and cooling infrastructure

**VULNERABLE POPULATIONS:**
• Low-income communities and communities of color
• Children and elderly populations
• Individuals with pre-existing health conditions
• Linguistically isolated households
• Undocumented residents with limited access to services

**CUMULATIVE IMPACT FACTORS:**
• Multiple pollution sources in same area
• Historical redlining and discriminatory practices
• Limited access to healthcare and social services
• Economic stressors and housing instability
• Climate change amplifying existing vulnerabilities

**POLICY AND REGULATORY GAPS:**
• Inadequate enforcement of environmental regulations
• Exclusion from decision-making processes
• Lack of meaningful community engagement
• Insufficient consideration of cumulative impacts
• Limited resources for community-led solutions

**COMMUNITY ASSETS AND STRENGTHS:**
• Strong social networks and community organizations
• Cultural knowledge and traditional practices
• Grassroots leadership and advocacy experience
• Resilience and adaptive capacity
• Innovation in community-based solutions

**ENVIRONMENTAL JUSTICE SOLUTIONS:**
• Community-driven research and monitoring
• Participatory decision-making processes
• Investment in green infrastructure and jobs
• Health-protective policies and enforcement
• Capacity building and leadership development

**CLIMATE JUSTICE CONNECTIONS:**
• Frontline communities most impacted by climate change
• Need for just transition away from fossil fuels
• Green infrastructure as community development
• Renewable energy as economic opportunity
• Resilience planning with community priorities

**RECOMMENDED ACTIONS:**
1. Conduct community-based participatory research
2. Advocate for stronger environmental regulations
3. Build coalitions across affected communities
4. Develop community benefit agreements
5. Support community-led climate solutions
"""

    return ej_analysis


@tool
def assess_community_health_impacts(
    pollutant_type: str, community_demographics: str = "general", state: dict = None
) -> str:
    """Assess health impacts of environmental pollutants on specific communities."""

    model = ChatOpenAI(model_name="gpt-3.5-turbo")
    response = model.invoke(
        [
            SystemMessage(
                content="You are Lauren, an environmental justice specialist assessing community health impacts. Provide detailed analysis of how environmental pollutants affect different communities, with focus on vulnerable populations."
            ),
            HumanMessage(
                content=f"Assess health impacts of {pollutant_type} on {community_demographics} communities. Include health effects, vulnerable populations, and protective strategies."
            ),
        ]
    )
    return response.content


@tool
def develop_community_engagement_strategy(
    issue_focus: str, community_type: str = "urban", state: dict = None
) -> str:
    """Develop strategies for meaningful community engagement on environmental issues."""

    engagement_strategy = f"""
COMMUNITY ENGAGEMENT STRATEGY - {issue_focus.upper()}

**PRINCIPLES OF MEANINGFUL ENGAGEMENT:**
• Community leadership and self-determination
• Cultural competency and language accessibility
• Transparency and shared decision-making
• Capacity building and resource sharing
• Long-term relationship building

**STAKEHOLDER MAPPING:**
• Community residents and leaders
• Local organizations and faith communities
• Environmental and health advocates
• Government agencies and officials
• Industry representatives and developers

**ENGAGEMENT METHODS:**

**COMMUNITY MEETINGS:**
• Host in accessible, familiar locations
• Provide interpretation and childcare
• Use interactive formats and visual aids
• Document community input and feedback
• Follow up with action steps

**DOOR-TO-DOOR OUTREACH:**
• Train community members as ambassadors
• Use culturally appropriate materials
• Listen to individual concerns and stories
• Connect residents to resources
• Build trust through consistent presence

**DIGITAL ENGAGEMENT:**
• Social media campaigns in multiple languages
• Online surveys and mapping tools
• Virtual meetings with technical support
• Text messaging for updates and alerts
• Community-managed websites and platforms

**PARTICIPATORY RESEARCH:**
• Community-based environmental monitoring
• Health surveys and symptom tracking
• Photovoice and storytelling projects
• Asset mapping and solution identification
• Peer-to-peer education and training

**COALITION BUILDING:**
• Connect with regional and national networks
• Share resources and best practices
• Coordinate advocacy and policy campaigns
• Support leadership development
• Celebrate victories and learn from challenges

**ADVOCACY STRATEGIES:**
• Public comment at government meetings
• Media campaigns and press conferences
• Direct action and community mobilization
• Policy research and position papers
• Legal advocacy and enforcement

**CAPACITY BUILDING COMPONENTS:**
• Leadership development training
• Technical assistance and skill building
• Grant writing and fundraising support
• Media and communications training
• Policy analysis and advocacy skills

**SUCCESS METRICS:**
• Community participation and leadership
• Policy changes and implementation
• Environmental and health improvements
• Economic benefits and job creation
• Sustained community organizing capacity
"""

    return engagement_strategy


@tool
def review_environmental_policies(
    policy_area: str, jurisdiction: str = "local", state: dict = None
) -> str:
    """Review environmental policies through an environmental justice lens."""

    policy_review = f"""
ENVIRONMENTAL JUSTICE POLICY REVIEW - {policy_area.upper()}

**POLICY ANALYSIS FRAMEWORK:**
• Distributional impacts: Who benefits and who bears burdens?
• Procedural justice: Are communities meaningfully involved?
• Recognition justice: Are diverse values and knowledge respected?
• Corrective justice: Do policies address historical harms?

**KEY POLICY AREAS:**

**AIR QUALITY REGULATIONS:**
• National Ambient Air Quality Standards (NAAQS)
• State Implementation Plans (SIPs)
• Permitting and enforcement procedures
• Cumulative impact assessments
• Community monitoring and notification

**WATER PROTECTION POLICIES:**
• Safe Drinking Water Act implementation
• Clean Water Act enforcement
• Groundwater protection measures
• Environmental justice in water infrastructure
• Affordability and access programs

**WASTE AND TOXICS MANAGEMENT:**
• Facility siting and permitting decisions
• Cleanup priorities and community involvement
• Right-to-know and disclosure requirements
• Prevention and source reduction
• Green chemistry and safer alternatives

**CLIMATE AND ENERGY POLICY:**
• Renewable energy siting and benefits
• Energy efficiency programs and access
• Transportation electrification equity
• Carbon pricing and revenue distribution
• Just transition for fossil fuel workers

**LAND USE AND ZONING:**
• Exclusionary zoning and housing policy
• Industrial facility siting restrictions
• Green space and urban forestry
• Transit-oriented development
• Gentrification and displacement prevention

**POLICY RECOMMENDATIONS:**

**STRENGTHEN ENFORCEMENT:**
• Increase penalties for violations
• Prioritize enforcement in overburdened communities
• Provide whistleblower protections
• Support community-based monitoring
• Ensure transparent reporting

**IMPROVE PARTICIPATION:**
• Require meaningful community engagement
• Provide technical assistance and translation
• Compensate community members for participation
• Use multiple communication channels
• Build long-term relationships

**ADDRESS CUMULATIVE IMPACTS:**
• Develop cumulative impact assessment tools
• Consider multiple stressors and vulnerabilities
• Use health-based standards and screening levels
• Prioritize most impacted communities
• Monitor and evaluate policy effectiveness

**INVEST IN SOLUTIONS:**
• Direct green infrastructure investments
• Support community-led climate solutions
• Create green jobs and workforce development
• Fund community capacity building
• Ensure equitable access to benefits
"""

    return policy_review
