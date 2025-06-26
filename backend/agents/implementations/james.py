import logging

"""
James - Military Skills Translator Agent
Specializes in translating military skills and experience into civilian terms for climate careers.
"""

from typing import Dict, Any, List
import logging
from datetime import datetime
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_core.tools import tool
from langgraph.types import Command

# from langgraph.prebuilt import InjectedState
from typing import Annotated, Literal

from backend.agents.base.agent_base import BaseAgent, AgentState

logger = logging.getLogger(__name__)


class JamesAgent(BaseAgent):
    """
    James - Military Skills Translator
    Responsible for helping veterans translate their military skills and experience
    into civilian terms for climate economy careers
    """

    def __init__(self):
        super().__init__(
            name="James",
            description="Military Skills Translator specializing in veteran career transitions to climate economy",
            intelligence_level=8.5,
            tools=[
                "translate_military_skills",
                "search_job_postings",
                "analyze_skills_gap",
                "mos_translation",
                "security_clearance_matching",
                "veteran_networking",
            ],
        )

        # Military specializations
        self.specializations = [
            "Military Occupational Specialty (MOS) translation",
            "Security clearance requirements",
            "Leadership skills translation",
            "Technical skills mapping",
            "Logistics and operations experience",
            "Project management capabilities",
            "Team coordination skills",
            "Crisis management experience",
        ]

        # Military branches knowledge
        self.military_branches = [
            "Army",
            "Navy",
            "Air Force",
            "Marines",
            "Coast Guard",
            "Space Force",
            "National Guard",
            "Reserves",
        ]

        # Climate industry mappings
        self.climate_skill_mappings = {
            "logistics": "Supply chain management for renewable energy",
            "leadership": "Team leadership in climate projects",
            "technical": "Technical operations in clean energy",
            "communications": "Stakeholder engagement and outreach",
            "maintenance": "Equipment maintenance for clean tech",
            "project_management": "Climate project coordination",
            "security": "Critical infrastructure protection",
            "training": "Workforce development and education",
        }

    async def initialize(self) -> None:
        """Initialize James's military skills database"""
        await super().initialize()

        logger.info(
            "james_initialized",
            specializations=len(self.specializations),
            military_branches=len(self.military_branches),
            skill_mappings=len(self.climate_skill_mappings),
        )

    async def process_message(
        self, state: AgentState
    ) -> Command[Literal["veterans_team"]]:
        """Process message with military skills translation focus"""
        try:
            # Extract user message
            user_message = next(
                (m["content"] for m in state.messages if m.get("role") == "user"), ""
            )

            # Analyze for military context
            military_context = await self._analyze_military_context(user_message)

            # Generate specialized response
            response = await self._generate_skills_translation_response(
                user_message, military_context
            )

            # Create response message
            message = {
                "role": "assistant",
                "content": response,
                "agent": "james",
                "team": "veterans_team",
                "timestamp": datetime.now().isoformat(),
                "metadata": {
                    "military_context": military_context,
                    "specialization": "military_skills_translation",
                    "confidence_score": 0.9,
                },
            }

            # Update state
            new_messages = state.messages + [message]

            return Command(
                goto="veterans_team",
                update={"messages": new_messages, "current_agent": "james"},
            )

        except Exception as e:
            logger.error(f"Error in James agent: {str(e)}")
            return Command(
                goto="veterans_team",
                update={
                    "messages": state.messages
                    + [
                        {
                            "role": "assistant",
                            "content": f"I apologize, but I encountered an error while processing your military skills translation request. {str(e)}",
                            "agent": "james",
                        }
                    ]
                },
            )

    async def _analyze_military_context(self, message: str) -> Dict[str, Any]:
        """Analyze message for military context and skills"""
        message_lower = message.lower()

        context = {
            "has_military_experience": False,
            "branch": None,
            "rank_mentioned": False,
            "mos_mentioned": False,
            "skills_to_translate": [],
            "security_clearance": False,
        }

        # Check for military indicators
        if any(
            word in message_lower
            for word in [
                "military",
                "veteran",
                "army",
                "navy",
                "air force",
                "marines",
                "coast guard",
            ]
        ):
            context["has_military_experience"] = True

        # Check for specific branch
        for branch in self.military_branches:
            if branch.lower() in message_lower:
                context["branch"] = branch
                break

        # Check for skills that need translation
        skill_keywords = [
            "leadership",
            "logistics",
            "technical",
            "communications",
            "maintenance",
            "project",
            "security",
            "training",
        ]
        context["skills_to_translate"] = [
            skill for skill in skill_keywords if skill in message_lower
        ]

        # Check for security clearance
        if any(
            word in message_lower
            for word in ["clearance", "secret", "top secret", "classified"]
        ):
            context["security_clearance"] = True

        return context

    async def _generate_skills_translation_response(
        self, message: str, context: Dict[str, Any]
    ) -> str:
        """Generate specialized military skills translation response"""
        if not context["has_military_experience"]:
            return """I'm James, your Military Skills Translator. I help veterans translate their military experience into civilian terms for climate careers. 

Even if you haven't served, I can help you understand how military skills apply to climate jobs, or connect you with veteran resources if you know someone who served.

What specific military skills or experience would you like help translating to climate career opportunities?"""

        # Build personalized response based on context
        response_parts = [
            f"As a Military Skills Translator, I can help you leverage your {context.get('branch', 'military')} experience for climate careers."
        ]

        if context["skills_to_translate"]:
            response_parts.append(
                "\nHere's how your military skills translate to climate opportunities:"
            )
            for skill in context["skills_to_translate"]:
                if skill in self.climate_skill_mappings:
                    response_parts.append(
                        f"• {skill.title()}: {self.climate_skill_mappings[skill]}"
                    )

        if context["security_clearance"]:
            response_parts.append(
                "\nYour security clearance is valuable in climate careers, especially for:"
                "\n• Critical infrastructure protection"
                "\n• Government climate initiatives"
                "\n• Defense sector clean energy projects"
                "\n• Cybersecurity for renewable energy systems"
            )

        response_parts.append(
            "\nNext steps I recommend:"
            "\n1. Document your transferable skills with specific examples"
            "\n2. Research climate companies that actively hire veterans"
            "\n3. Consider certifications in renewable energy or sustainability"
            "\n4. Network with other veterans in climate careers"
        )

        if context["branch"]:
            response_parts.append(
                f"\nAs a {context['branch']} veteran, you have unique advantages in the climate sector. Would you like me to identify specific opportunities that value your background?"
            )

        return "\n".join(response_parts)

    def get_capabilities(self) -> Dict[str, Any]:
        """Get James's enhanced capabilities"""
        base_capabilities = super().get_capabilities()
        base_capabilities.update(
            {
                "specializations": self.specializations,
                "military_branches": self.military_branches,
                "skill_mappings": list(self.climate_skill_mappings.keys()),
                "veteran_focused": True,
                "skills_translation": True,
            }
        )
        return base_capabilities


# Tools for James
@tool
def translate_military_skills(skills: str, state: dict = None) -> str:
    """Translate military skills to civilian terms for climate careers."""
    from langchain_openai import ChatOpenAI

    model = ChatOpenAI(model_name="gpt-3.5-turbo")
    response = model.invoke(
        [
            SystemMessage(
                content="You are James, a military skills translator. Translate these military skills to civilian terms for climate economy careers. Be specific about how each skill applies to renewable energy, sustainability, or environmental work."
            ),
            HumanMessage(
                content=f"Translate these military skills to civilian climate career terms: {skills}"
            ),
        ]
    )
    return response.content


@tool
def analyze_mos_for_climate(mos_code: str, state: dict = None) -> str:
    """Analyze Military Occupational Specialty for climate career opportunities."""
    from langchain_openai import ChatOpenAI

    model = ChatOpenAI(model_name="gpt-3.5-turbo")
    response = model.invoke(
        [
            SystemMessage(
                content="You are James, analyzing how specific Military Occupational Specialties (MOS) translate to climate economy careers. Provide specific job titles, companies, and career paths."
            ),
            HumanMessage(
                content=f"How does MOS {mos_code} translate to climate career opportunities? Include specific job titles and companies that hire for these skills."
            ),
        ]
    )
    return response.content


@tool
def find_veteran_climate_networks(
    location: str = "national", state: dict = None
) -> str:
    """Find veteran networks and organizations in the climate sector."""
    networks = [
        "Veterans in Energy - National network for energy sector veterans",
        "Student Veterans of America (SVA) - Sustainability chapters",
        "Iraq and Afghanistan Veterans of America (IAVA) - Green jobs initiative",
        "Veterans for Sustainable Energy - Advocacy and networking",
        "Military Veterans in Sustainability (MVIS) - Professional network",
        "Corporate Gray - Veteran job placement including clean energy",
    ]

    response = f"Here are veteran networks in the climate/energy sector"
    if location != "national":
        response += f" with {location} presence"
    response += ":\n\n"

    for network in networks:
        response += f"• {network}\n"

    response += "\nI recommend joining 2-3 of these networks to maximize your networking opportunities and stay informed about climate career openings specifically for veterans."

    return response
