import logging

"""
Sofia - Europe and Africa Climate Specialist Agent
Specializes in climate policies, solutions, and opportunities in Europe and Africa regions.
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


class SofiaAgent(BaseAgent):
    """
    Sofia - Europe and Africa Climate Specialist
    Responsible for climate policies, solutions, and opportunities in Europe and Africa
    """

    def __init__(self):
        super().__init__(
            name="Sofia",
            description="Europe and Africa Climate Specialist focusing on regional climate solutions and policies",
            intelligence_level=8.5,
            tools=[
                "european_green_deal_analysis",
                "africa_climate_adaptation",
                "eu_africa_partnerships",
                "carbon_border_adjustments",
                "green_transition_jobs",
            ],
        )

    async def process_message(
        self, state: AgentState
    ) -> Command[Literal["international_team"]]:
        """Process message with Europe/Africa climate focus"""
        try:
            user_message = next(
                (m["content"] for m in state.messages if m.get("role") == "user"), ""
            )

            response = "I'm Sofia, your Europe and Africa Climate Specialist. I help navigate climate opportunities, the European Green Deal, Africa's climate adaptation needs, and EU-Africa climate partnerships."

            message = {
                "role": "assistant",
                "content": response,
                "agent": "sofia",
                "team": "international_team",
                "timestamp": datetime.now().isoformat(),
                "metadata": {
                    "specialization": "europe_africa_climate",
                    "confidence_score": 0.9,
                },
            }

            new_messages = state.messages + [message]

            return Command(
                goto="international_team",
                update={"messages": new_messages, "current_agent": "sofia"},
            )

        except Exception as e:
            logger.error(f"Error in Sofia agent: {str(e)}")
            return Command(
                goto="international_team",
                update={
                    "messages": state.messages
                    + [
                        {
                            "role": "assistant",
                            "content": f"I apologize, but I encountered an error. {str(e)}",
                            "agent": "sofia",
                        }
                    ]
                },
            )


# Tools for Sofia
@tool
def analyze_european_green_deal(sector: str = "general", state: dict = None) -> str:
    """Analyze European Green Deal policies and opportunities."""

    green_deal_analysis = f"""
EUROPEAN GREEN DEAL ANALYSIS - {sector.upper()}

**OVERALL FRAMEWORK:**
• 55% emissions reduction by 2030 (compared to 1990)
• Climate neutrality by 2050
• €1 trillion investment over 10 years
• Just Transition Fund for affected regions

**KEY POLICY AREAS:**
• Fit for 55 Package: Updated climate legislation
• EU Taxonomy: Green investment classification
• Carbon Border Adjustment Mechanism (CBAM)
• REPowerEU: Energy independence and renewables

**SECTORAL OPPORTUNITIES:**
• Energy: Renewable energy targets, energy efficiency
• Transport: Electric vehicles, sustainable fuels
• Industry: Circular economy, clean steel and cement
• Buildings: Renovation wave, energy performance
• Agriculture: Farm to Fork strategy, biodiversity

**FUNDING MECHANISMS:**
• NextGenerationEU Recovery Fund
• European Green Deal Investment Plan
• Innovation Fund from EU ETS revenues
• LIFE Programme for environment and climate

**JOB CREATION SECTORS:**
• Renewable energy installation and maintenance
• Energy efficiency retrofitting
• Circular economy and waste management
• Sustainable transport and mobility
• Green finance and ESG consulting

**SKILLS IN DEMAND:**
• Technical: Engineering, data analysis, project management
• Policy: EU law, climate regulation, environmental law
• Finance: Green bonds, sustainable finance, ESG
• Digital: AI for climate, IoT, blockchain for carbon tracking

**CAREER PATHWAYS:**
• EU institutions (Commission, Parliament, agencies)
• National governments and regional authorities
• Private sector (consulting, finance, technology)
• NGOs and think tanks
• Research institutions and universities
"""

    return green_deal_analysis


@tool
def find_africa_climate_opportunities(
    region: str = "general", focus_area: str = "adaptation", state: dict = None
) -> str:
    """Find climate opportunities and projects in Africa."""

    africa_opportunities = f"""
AFRICA CLIMATE OPPORTUNITIES - {region.upper()}

**ADAPTATION PRIORITIES:**
• Water security and drought resilience
• Climate-smart agriculture and food security
• Coastal protection and sea-level rise
• Disaster risk reduction and early warning
• Ecosystem-based adaptation

**MITIGATION OPPORTUNITIES:**
• Renewable energy: Solar, wind, hydro potential
• Energy access: Mini-grids and off-grid solutions
• Sustainable transport: BRT, electric mobility
• Forest conservation: REDD+ and afforestation
• Industrial efficiency and clean technology

**REGIONAL HIGHLIGHTS:**
• East Africa: Geothermal energy, climate-smart agriculture
• West Africa: Solar power, sustainable cities
• Southern Africa: Just energy transition, mining
• North Africa: Solar and wind export potential
• Central Africa: Forest conservation, sustainable logging

**FUNDING SOURCES:**
• Green Climate Fund (GCF): Major projects across continent
• African Development Bank: Climate finance leadership
• World Bank Africa Climate Business Plan
• EU-Africa Partnership on climate and energy
• Climate Investment Funds (CIF)

**CAREER OPPORTUNITIES:**
• International development organizations
• Climate finance institutions
• Renewable energy companies
• Agricultural technology firms
• Conservation and environmental NGOs

**SKILLS NEEDED:**
• Climate science and adaptation planning
• Renewable energy project development
• Agricultural extension and rural development
• Water resources management
• Community engagement and local knowledge

**SUCCESS FACTORS:**
• Local partnership and community ownership
• Gender inclusion and youth engagement
• Integration with development priorities
• Technology transfer and capacity building
• Long-term sustainability planning
"""

    return africa_opportunities


@tool
def analyze_eu_africa_climate_partnerships(
    partnership_type: str = "general", state: dict = None
) -> str:
    """Analyze EU-Africa climate partnerships and collaboration opportunities."""

    model = ChatOpenAI(model_name="gpt-3.5-turbo")
    response = model.invoke(
        [
            SystemMessage(
                content="You are Sofia, analyzing EU-Africa climate partnerships. Provide detailed analysis of collaboration frameworks, funding mechanisms, and opportunities for cooperation."
            ),
            HumanMessage(
                content=f"Analyze EU-Africa climate partnerships focusing on {partnership_type}. Include current initiatives, funding flows, and opportunities for professionals."
            ),
        ]
    )
    return response.content


@tool
def assess_carbon_border_adjustments(
    sector: str, origin_country: str = "general", state: dict = None
) -> str:
    """Assess impact of EU Carbon Border Adjustment Mechanism."""

    cbam_analysis = f"""
EU CARBON BORDER ADJUSTMENT MECHANISM (CBAM) - {sector.upper()}

**SCOPE AND TIMELINE:**
• Pilot phase: October 2023 - December 2025 (reporting only)
• Full implementation: January 2026 (financial obligations)
• Initial sectors: Cement, iron/steel, aluminum, fertilizers, electricity, hydrogen

**IMPACT ON {origin_country.upper()}:**
• Export competitiveness to EU market
• Need for carbon accounting and verification
• Incentives for domestic carbon pricing
• Technology upgrade requirements

**COMPLIANCE REQUIREMENTS:**
• Carbon content measurement and reporting
• Verification by accredited bodies
• Purchase of CBAM certificates
• Documentation of carbon price paid in origin country

**BUSINESS OPPORTUNITIES:**
• Carbon accounting and verification services
• Clean technology deployment
• Carbon management consulting
• Green finance and investment

**CAREER IMPLICATIONS:**
• Carbon accounting specialists
• Climate policy analysts
• Trade and regulatory experts
• Sustainability consultants
• Green technology engineers

**PREPARATION STRATEGIES:**
• Develop carbon measurement capabilities
• Invest in clean production technologies
• Establish carbon pricing mechanisms
• Build verification and reporting systems
• Engage with EU stakeholders

**SUPPORT AVAILABLE:**
• EU technical assistance programs
• International cooperation initiatives
• Private sector partnerships
• Technology transfer mechanisms
• Capacity building programs
"""

    return cbam_analysis
