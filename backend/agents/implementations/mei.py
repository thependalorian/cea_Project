import logging

"""
Mei - Asia-Pacific Climate Specialist Agent
Specializes in climate policies, solutions, and opportunities in the Asia-Pacific region.
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


class MeiAgent(BaseAgent):
    """
    Mei - Asia-Pacific Climate Specialist
    Responsible for climate policies, solutions, and opportunities in the Asia-Pacific region
    """

    def __init__(self):
        super().__init__(
            name="Mei",
            description="Asia-Pacific Climate Specialist focusing on regional climate solutions and opportunities",
            intelligence_level=8.5,
            tools=[
                "asia_pacific_climate_data",
                "regional_policy_analysis",
                "international_job_search",
                "climate_finance_opportunities",
                "cross_border_partnerships",
            ],
        )

    async def process_message(
        self, state: AgentState
    ) -> Command[Literal["international_team"]]:
        """Process message with Asia-Pacific climate focus"""
        try:
            user_message = next(
                (m["content"] for m in state.messages if m.get("role") == "user"), ""
            )

            response = "I'm Mei, your Asia-Pacific Climate Specialist. I help navigate climate opportunities, policies, and solutions across the Asia-Pacific region, including China, Japan, Southeast Asia, and Oceania."

            message = {
                "role": "assistant",
                "content": response,
                "agent": "mei",
                "team": "international_team",
                "timestamp": datetime.now().isoformat(),
                "metadata": {
                    "specialization": "asia_pacific_climate",
                    "confidence_score": 0.9,
                },
            }

            new_messages = state.messages + [message]

            return Command(
                goto="international_team",
                update={"messages": new_messages, "current_agent": "mei"},
            )

        except Exception as e:
            logger.error(f"Error in Mei agent: {str(e)}")
            return Command(
                goto="international_team",
                update={
                    "messages": state.messages
                    + [
                        {
                            "role": "assistant",
                            "content": f"I apologize, but I encountered an error. {str(e)}",
                            "agent": "mei",
                        }
                    ]
                },
            )


# Tools for Mei
@tool
def analyze_asia_pacific_climate_policy(
    country: str, policy_area: str = "general", state: dict = None
) -> str:
    """Analyze climate policies and initiatives in Asia-Pacific countries."""

    model = ChatOpenAI(model_name="gpt-3.5-turbo")
    response = model.invoke(
        [
            SystemMessage(
                content="You are Mei, an Asia-Pacific climate policy specialist. Provide detailed analysis of climate policies, initiatives, and opportunities in Asia-Pacific countries."
            ),
            HumanMessage(
                content=f"Analyze climate policy in {country} focusing on {policy_area}. Include recent developments, key initiatives, and opportunities for international collaboration."
            ),
        ]
    )
    return response.content


@tool
def find_asia_pacific_climate_jobs(
    skills: str, target_countries: List[str] = None, state: dict = None
) -> str:
    """Find climate job opportunities across Asia-Pacific region."""

    if target_countries is None:
        target_countries = [
            "Japan",
            "South Korea",
            "Singapore",
            "Australia",
            "New Zealand",
        ]

    opportunities = f"""
ASIA-PACIFIC CLIMATE JOB OPPORTUNITIES

**TARGET COUNTRIES:** {', '.join(target_countries)}

**RENEWABLE ENERGY SECTOR:**
• Japan: Solar and offshore wind projects, energy storage
• South Korea: Green New Deal initiatives, hydrogen economy
• Australia: Large-scale renewable projects, mining transition
• Singapore: Regional clean energy hub, green finance

**EMERGING OPPORTUNITIES:**
• Climate finance and green banking
• Carbon accounting and ESG reporting
• Renewable energy project development
• Climate adaptation consulting
• Green technology transfer

**SKILLS IN DEMAND:**
• Technical: Engineering, data analysis, project management
• Financial: Green finance, carbon markets, ESG analysis
• Policy: Climate policy, international relations, regulatory affairs
• Language: Mandarin, Japanese, Korean highly valued

**VISA PATHWAYS:**
• Skilled migration programs (Australia, New Zealand)
• Working holiday visas for young professionals
• Intra-company transfers for multinational firms
• Specialized skill visas for in-demand occupations

**NEXT STEPS:**
1. Target specific countries based on your skills
2. Research visa requirements and pathways
3. Network with Asia-Pacific climate organizations
4. Consider language training for target markets
5. Apply through international recruitment firms
"""

    return opportunities


@tool
def get_asia_pacific_climate_finance(project_type: str, state: dict = None) -> str:
    """Get information about climate finance opportunities in Asia-Pacific."""

    finance_options = f"""
ASIA-PACIFIC CLIMATE FINANCE OPPORTUNITIES

**MULTILATERAL FUNDING:**
• Asian Development Bank (ADB) Climate Finance
• Green Climate Fund (GCF) Asia-Pacific projects
• World Bank Asia Climate Investment Program
• Asian Infrastructure Investment Bank (AIIB)

**BILATERAL PROGRAMS:**
• Japan International Cooperation Agency (JICA)
• Korea International Cooperation Agency (KOICA)
• Australian Department of Foreign Affairs climate funding
• New Zealand Climate Finance initiatives

**PRIVATE SECTOR FINANCE:**
• Asia Green Bond markets (Japan, China, South Korea)
• Climate venture capital in Singapore and Hong Kong
• Corporate sustainability initiatives
• Impact investing funds

**PROJECT TYPES PRIORITIZED:**
• Renewable energy infrastructure
• Climate adaptation and resilience
• Sustainable transportation
• Green buildings and cities
• Nature-based solutions

**APPLICATION PROCESS:**
1. Identify appropriate funding mechanism
2. Develop detailed project proposal
3. Demonstrate climate impact and co-benefits
4. Show local partnership and capacity
5. Meet country-specific requirements

**SUCCESS FACTORS:**
• Strong local partnerships
• Clear climate impact metrics
• Alignment with national priorities
• Technical feasibility demonstration
• Sustainable financing model
"""

    return finance_options


@tool
def analyze_asia_pacific_carbon_markets(
    market_focus: str = "regional", state: dict = None
) -> str:
    """Analyze carbon markets and trading opportunities in Asia-Pacific."""

    model = ChatOpenAI(model_name="gpt-3.5-turbo")
    response = model.invoke(
        [
            SystemMessage(
                content="You are Mei, analyzing Asia-Pacific carbon markets. Provide insights on carbon pricing, trading mechanisms, and market opportunities across the region."
            ),
            HumanMessage(
                content=f"Analyze Asia-Pacific carbon markets with focus on {market_focus}. Include current prices, trading volumes, regulatory frameworks, and opportunities for participation."
            ),
        ]
    )
    return response.content
