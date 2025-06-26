import logging

"""
Raj - South Asia and Middle East Climate Specialist Agent
Specializes in climate policies, solutions, and opportunities in South Asia and Middle East regions.
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


class RajAgent(BaseAgent):
    """
    Raj - South Asia and Middle East Climate Specialist
    Responsible for climate policies, solutions, and opportunities in South Asia and Middle East
    """

    def __init__(self):
        super().__init__(
            name="Raj",
            description="South Asia and Middle East Climate Specialist focusing on regional climate solutions",
            intelligence_level=8.5,
            tools=[
                "south_asia_climate_data",
                "middle_east_policy_analysis",
                "regional_job_opportunities",
                "renewable_energy_projects",
                "climate_adaptation_strategies",
            ],
        )

    async def process_message(
        self, state: AgentState
    ) -> Command[Literal["international_team"]]:
        """Process message with South Asia/Middle East climate focus"""
        try:
            user_message = next(
                (m["content"] for m in state.messages if m.get("role") == "user"), ""
            )

            response = "I'm Raj, your South Asia and Middle East Climate Specialist. I help navigate climate opportunities, renewable energy projects, and adaptation strategies across India, Pakistan, Bangladesh, Gulf states, and the broader Middle East region."

            message = {
                "role": "assistant",
                "content": response,
                "agent": "raj",
                "team": "international_team",
                "timestamp": datetime.now().isoformat(),
                "metadata": {
                    "specialization": "south_asia_middle_east_climate",
                    "confidence_score": 0.9,
                },
            }

            new_messages = state.messages + [message]

            return Command(
                goto="international_team",
                update={"messages": new_messages, "current_agent": "raj"},
            )

        except Exception as e:
            logger.error(f"Error in Raj agent: {str(e)}")
            return Command(
                goto="international_team",
                update={
                    "messages": state.messages
                    + [
                        {
                            "role": "assistant",
                            "content": f"I apologize, but I encountered an error. {str(e)}",
                            "agent": "raj",
                        }
                    ]
                },
            )


# Tools for Raj
@tool
def analyze_south_asia_renewable_energy(
    country: str, energy_type: str = "solar", state: dict = None
) -> str:
    """Analyze renewable energy opportunities and policies in South Asia."""

    renewable_data = f"""
SOUTH ASIA RENEWABLE ENERGY ANALYSIS - {country.upper()}

**SOLAR ENERGY:**
• India: World's 4th largest solar capacity, National Solar Mission targets
• Pakistan: Significant solar potential, government incentives available
• Bangladesh: Growing solar home system market, grid-scale development
• Sri Lanka: Net metering policies, rooftop solar programs

**WIND ENERGY:**
• India: Major wind power capacity, offshore wind development
• Pakistan: Coastal wind farms, favorable wind resources
• Bangladesh: Limited but growing wind potential

**HYDROPOWER:**
• Nepal: Massive hydropower potential, regional export opportunities
• Bhutan: Carbon-negative country, hydropower exports to India
• Pakistan: Existing large hydro, small hydro development

**POLICY FRAMEWORKS:**
• Renewable energy targets and mandates
• Feed-in tariffs and power purchase agreements
• Net metering and distributed generation policies
• International climate finance access

**INVESTMENT OPPORTUNITIES:**
• Large-scale solar and wind projects
• Distributed renewable energy systems
• Energy storage and grid integration
• Green hydrogen development

**CHALLENGES:**
• Grid integration and stability
• Financing and policy consistency
• Land acquisition and environmental clearances
• Technical capacity and skills gaps

**CAREER OPPORTUNITIES:**
• Project development and management
• Technical design and engineering
• Policy analysis and regulatory affairs
• Climate finance and investment
"""

    return renewable_data


@tool
def find_middle_east_climate_jobs(
    sector: str = "renewable_energy", state: dict = None
) -> str:
    """Find climate and clean energy job opportunities in Middle East."""

    job_opportunities = f"""
MIDDLE EAST CLIMATE JOB OPPORTUNITIES

**UAE - CLEAN ENERGY HUB:**
• Masdar City: Renewable energy projects, sustainable technology
• ADNOC: Oil company diversification into renewables
• Dubai Clean Energy Strategy: Solar and innovation roles
• COP28 Legacy: Climate finance and policy positions

**SAUDI ARABIA - VISION 2030:**
• NEOM: Mega sustainable city project
• Saudi Green Initiative: Massive reforestation and renewable projects
• ACWA Power: Regional renewable energy developer
• Saudi Aramco: Energy transition and carbon management

**QATAR - WORLD CUP LEGACY:**
• Qatar National Vision 2030: Sustainability integration
• QatarEnergy: LNG and renewable energy transition
• Green building and sustainable infrastructure

**ISRAEL - INNOVATION ECOSYSTEM:**
• Water technology and desalination
• Agtech and climate adaptation solutions
• Clean technology startups and R&D
• Cybersecurity for critical infrastructure

**JORDAN - RENEWABLE ENERGY LEADER:**
• Large-scale solar and wind projects
• Regional energy trading hub development
• Water-energy nexus solutions

**SKILLS IN HIGH DEMAND:**
• Engineering: Renewable energy, water, sustainable infrastructure
• Finance: Green bonds, climate risk, ESG analysis
• Technology: AI for climate, IoT, data analytics
• Policy: Climate regulation, international negotiations

**VISA AND WORK PERMITS:**
• UAE Golden Visa for skilled professionals
• Saudi Arabia work visa reforms
• Professional licensing requirements
• Arabic language advantages but not always required

**COMPENSATION:**
• Tax-free salaries in UAE and Qatar
• Housing and transportation allowances
• International school fees covered
• Annual leave and travel allowances
"""

    return job_opportunities


@tool
def assess_climate_adaptation_needs(
    region: str, climate_risk: str = "general", state: dict = None
) -> str:
    """Assess climate adaptation needs and solutions for South Asia/Middle East."""

    model = ChatOpenAI(model_name="gpt-3.5-turbo")
    response = model.invoke(
        [
            SystemMessage(
                content="You are Raj, a climate adaptation specialist for South Asia and Middle East. Provide detailed analysis of climate risks, vulnerability assessments, and adaptation strategies."
            ),
            HumanMessage(
                content=f"Assess climate adaptation needs for {region} focusing on {climate_risk}. Include vulnerability analysis, adaptation options, and implementation strategies."
            ),
        ]
    )
    return response.content


@tool
def analyze_regional_climate_finance(
    funding_type: str = "adaptation", state: dict = None
) -> str:
    """Analyze climate finance opportunities in South Asia and Middle East."""

    finance_analysis = f"""
SOUTH ASIA & MIDDLE EAST CLIMATE FINANCE

**MULTILATERAL FUNDING:**
• Green Climate Fund (GCF): Major projects in India, Bangladesh, Pakistan
• Asian Development Bank: Climate-resilient infrastructure
• World Bank Climate Investment Funds
• Islamic Development Bank: Sharia-compliant green finance

**BILATERAL CLIMATE FINANCE:**
• Germany (GIZ): Technical cooperation and capacity building
• Japan (JICA): Climate technology transfer
• UK (FCDO): Climate resilience programs
• US (USAID): Clean energy and adaptation initiatives

**REGIONAL INITIATIVES:**
• South Asian Association for Regional Cooperation (SAARC)
• Gulf Cooperation Council (GCC) green initiatives
• Arab Fund for Economic and Social Development

**PRIVATE SECTOR FINANCE:**
• Green sukuk (Islamic bonds) in Malaysia, Indonesia, UAE
• Climate venture capital in India and Israel
• Corporate sustainability financing
• Blended finance mechanisms

**FUNDING PRIORITIES:**
• Renewable energy infrastructure
• Climate-resilient agriculture
• Water security and management
• Disaster risk reduction
• Sustainable transportation

**ACCESS STRATEGIES:**
1. Develop bankable project proposals
2. Build local institutional capacity
3. Establish public-private partnerships
4. Demonstrate climate co-benefits
5. Ensure gender and social inclusion

**SUCCESS FACTORS:**
• Strong government commitment
• Robust monitoring and evaluation
• Community engagement and ownership
• Technical feasibility and innovation
• Long-term sustainability planning
"""

    return finance_analysis
