"""
Marcus - Veterans Specialist Agent

Following rule #2: Create modular agent components for easy maintenance
Following rule #3: Component documentation explaining purpose and functionality
Following rule #12: Complete code verification with proper agent implementation

Marcus specializes in military transition support, MOS translation, veteran benefits navigation,
and connecting military experience to climate economy careers.

Location: backendv1/agents/marcus/agent.py
"""

from typing import Dict, Any, List
from datetime import datetime

from backendv1.agents.base.agent_base import AgentBase, AgentContext, AgentResponse
from backendv1.agents.base.memory_system import MemorySystem
from backendv1.agents.base.reflection_engine import ReflectionEngine
from backendv1.utils.logger import setup_logger
from .prompts import (
    MARCUS_CONFIG,
    MARCUS_SYSTEM_PROMPT,
    MARCUS_RESPONSE_TEMPLATES,
    MOS_TRANSLATION_PROMPT,
    BENEFITS_NAVIGATION_PROMPT,
    LEADERSHIP_DEVELOPMENT_PROMPT,
    MISSION_ALIGNMENT_PROMPT,
    MARCUS_CONFIDENCE_PROMPT,
)

logger = setup_logger("marcus_agent")


class MarcusAgent(AgentBase):
    """
    Marcus - Veterans Specialist

    Specialized in:
    - Military to civilian career transitions
    - MOS (Military Occupational Specialty) translation
    - Veteran benefits and resources navigation
    - Military experience to climate career mapping
    - Leadership and team management skill translation
    """

    def __init__(self, agent_name: str, agent_type: str, **kwargs):
        """Initialize Marcus with memory and reflection capabilities"""
        super().__init__(agent_name, agent_type, **kwargs)
        self.memory_system = MemorySystem(agent_name)
        self.reflection_engine = ReflectionEngine(agent_name)

    def _load_prompts(self):
        """Load Marcus-specific prompts and templates from prompts.py"""
        # Import prompts from dedicated prompts.py file
        self.config = MARCUS_CONFIG
        self.system_prompt = MARCUS_SYSTEM_PROMPT
        self.specialized_prompts = MARCUS_RESPONSE_TEMPLATES

        # Individual prompt templates
        self.mos_translation_prompt = MOS_TRANSLATION_PROMPT
        self.benefits_navigation_prompt = BENEFITS_NAVIGATION_PROMPT
        self.leadership_development_prompt = LEADERSHIP_DEVELOPMENT_PROMPT
        self.mission_alignment_prompt = MISSION_ALIGNMENT_PROMPT
        self.confidence_prompt = MARCUS_CONFIDENCE_PROMPT

    def _load_tools(self):
        """Load and configure Marcus-specific tools"""
        self.available_tools = [
            "mos_translator",
            "veteran_benefits_lookup",
            "military_skills_mapper",
            "va_education_planner",
            "veteran_networking_connector",
            "security_clearance_optimizer",
            "leadership_skills_translator",
            "climate_mission_matcher",
        ]

    def _setup_capabilities(self):
        """Set up Marcus-specific capabilities and configurations"""
        self.specialization_areas = self.config["expertise_areas"]
        self.agent_name = self.config["agent_name"]
        self.specialist_type = self.config["specialist_type"]

        self.expertise_level = "expert"
        self.confidence_threshold = 0.85

    async def process_message(self, message: str, context: AgentContext) -> AgentResponse:
        """
        Process user message and provide veteran-specific guidance

        Following rule #6: Asynchronous data handling for performance
        Following rule #15: Include comprehensive error handling

        Args:
            message: User's message
            context: Conversation context

        Returns:
            AgentResponse: Marcus's specialized response
        """
        try:
            logger.info(f"🎖️ Marcus processing veteran message for user {context.user_id}")

            # Store interaction in memory
            await self.memory_system.store_episode(
                {
                    "type": "veteran_interaction",
                    "message": message,
                    "user_id": context.user_id,
                    "context": "military_transition_guidance",
                }
            )

            # Analyze message for veteran-specific intent
            intent = await self._analyze_veteran_intent(message)

            # Generate specialized response based on intent
            if intent == "mos_translation":
                response_content = await self._provide_mos_translation(message, context)
            elif intent == "benefits_navigation":
                response_content = await self._provide_benefits_guidance(message, context)
            elif intent == "transition_planning":
                response_content = await self._provide_transition_planning(message, context)
            elif intent == "leadership_development":
                response_content = await self._provide_leadership_guidance(message, context)
            elif intent == "climate_mission_alignment":
                response_content = await self._provide_mission_alignment(message, context)
            else:
                response_content = await self._provide_general_veteran_guidance(message, context)

            # Calculate confidence score
            confidence = await self._calculate_confidence(message, intent)

            # Identify next actions
            next_actions = await self._suggest_next_actions(intent, context)

            # Create response
            response = AgentResponse(
                content=response_content,
                specialist_type="veteran_specialist",
                confidence_score=confidence,
                tools_used=["mos_translator", "veteran_benefits_lookup", "military_skills_mapper"],
                next_actions=next_actions,
                sources=[
                    "VA Career Resources",
                    "Military Skills Translator",
                    "Veteran Climate Network",
                ],
                metadata={
                    "intent": intent,
                    "specialization": "military_transition_support",
                    "expertise_areas": self.specialization_areas,
                },
            )

            # Reflect on interaction
            await self.reflection_engine.reflect_on_interaction(
                {
                    "id": f"marcus_{datetime.utcnow().timestamp()}",
                    "user_message": message,
                    "response": response_content,
                    "intent": intent,
                    "confidence": confidence,
                }
            )

            return response

        except Exception as e:
            logger.error(f"Error in Marcus's message processing: {e}")
            return AgentResponse(
                content="I apologize, but I'm experiencing a technical issue with my veteran support systems. Let me connect you with additional resources to ensure you get the transition support you deserve.",
                specialist_type="veteran_specialist",
                success=False,
                error_message=str(e),
            )

    async def _analyze_veteran_intent(self, message: str) -> str:
        """Analyze user message to determine veteran-specific intent"""
        message_lower = message.lower()

        if any(
            term in message_lower
            for term in ["mos", "military job", "military experience", "translate"]
        ):
            return "mos_translation"
        elif any(
            term in message_lower
            for term in ["benefits", "va", "gi bill", "education", "disability"]
        ):
            return "benefits_navigation"
        elif any(
            term in message_lower for term in ["transition", "civilian", "getting out", "discharge"]
        ):
            return "transition_planning"
        elif any(term in message_lower for term in ["leadership", "management", "team", "command"]):
            return "leadership_development"
        elif any(term in message_lower for term in ["mission", "purpose", "service", "impact"]):
            return "climate_mission_alignment"
        else:
            return "general_guidance"

    async def _provide_mos_translation(self, message: str, context: AgentContext) -> str:
        """Provide MOS translation and skills mapping"""
        return self.mos_translation_prompt

    async def _provide_benefits_guidance(self, message: str, context: AgentContext) -> str:
        """Provide veteran benefits navigation for climate careers"""
        return self.benefits_navigation_prompt

    async def _provide_transition_planning(self, message: str, context: AgentContext) -> str:
        """Provide comprehensive transition planning"""
        return self.specialized_prompts.get(
            "transition_planning",
            "I'll help you create a strategic transition plan from military to climate careers.",
        )

    async def _provide_leadership_guidance(self, message: str, context: AgentContext) -> str:
        """Provide leadership development guidance"""
        return self.leadership_development_prompt

    async def _provide_mission_alignment(self, message: str, context: AgentContext) -> str:
        """Provide mission alignment and purpose guidance"""
        return self.mission_alignment_prompt

    async def _provide_general_veteran_guidance(self, message: str, context: AgentContext) -> str:
        """Provide general veteran guidance"""
        return self.specialized_prompts.get(
            "general_guidance",
            "Welcome to your climate career journey! As a veteran, you bring unique skills and dedication to the fight for our planet's future.",
        )

    async def _calculate_confidence(self, message: str, intent: str) -> float:
        """Calculate confidence score based on message analysis"""
        base_confidence = 0.85

        # Adjust based on intent specificity
        intent_adjustments = {
            "mos_translation": 0.05,
            "benefits_navigation": 0.04,
            "transition_planning": 0.03,
            "leadership_development": 0.04,
            "climate_mission_alignment": 0.02,
            "general_guidance": -0.05,
        }

        confidence = base_confidence + intent_adjustments.get(intent, 0)

        # Adjust based on military terminology and specificity
        military_terms = [
            "mos",
            "veteran",
            "military",
            "service",
            "deployment",
            "leadership",
            "mission",
        ]
        if any(term in message.lower() for term in military_terms):
            confidence += 0.03

        if len(message) > 100:
            confidence += 0.02

        return min(confidence, 1.0)

    async def _suggest_next_actions(self, intent: str, context: AgentContext) -> List[str]:
        """Suggest next actions based on intent and context"""
        base_actions = [
            "Complete military skills assessment",
            "Research climate career opportunities",
            "Connect with veteran climate network",
        ]

        intent_specific_actions = {
            "mos_translation": [
                "Provide detailed MOS and military experience",
                "Research civilian equivalents for your skills",
                "Create skills-based resume highlighting transferable abilities",
            ],
            "benefits_navigation": [
                "Schedule appointment with VA education counselor",
                "Research climate-relevant degree programs",
                "Apply for VR&E if eligible",
            ],
            "transition_planning": [
                "Create 6-month transition timeline",
                "Identify target climate employers",
                "Begin networking with veteran climate professionals",
            ],
            "leadership_development": [
                "Document leadership achievements with metrics",
                "Join climate leadership professional associations",
                "Seek climate leadership mentorship",
            ],
            "climate_mission_alignment": [
                "Write personal climate mission statement",
                "Research mission-aligned organizations",
                "Volunteer with climate organizations",
            ],
        }

        return intent_specific_actions.get(intent, base_actions)


__all__ = ["MarcusAgent"]
