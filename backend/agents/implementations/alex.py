import logging
from typing import Dict, Any, List
import logging
from datetime import datetime
from langchain_core.messages import HumanMessage, AIMessage

from backend.agents.base.agent_base import BaseAgent, AgentState

logger = logging.getLogger(__name__)


class AlexAgent(BaseAgent):
    """
    Alex - Crisis Intervention and Mental Health Support Specialist
    Responsible for providing emotional support and crisis intervention
    """

    def __init__(self):
        super().__init__(
            name="Alex",
            description="Crisis intervention and mental health support specialist",
            intelligence_level=9.0,  # High EQ required for crisis handling
            tools=[
                "crisis_detection",
                "emotional_support",
                "resource_connection",
                "risk_assessment",
            ],
        )

    async def initialize(self) -> None:
        """Initialize Alex's resources and crisis protocols"""
        await super().initialize()

        # Initialize crisis protocols
        self.crisis_levels = {
            "low": "General emotional support needed",
            "medium": "Elevated distress requiring focused attention",
            "high": "Immediate intervention required",
            "emergency": "Emergency services notification required",
        }

        logger.info("alex_initialized", crisis_protocols=len(self.crisis_levels))

    async def process(self, state: AgentState) -> AgentState:
        """
        Process the current state with crisis-aware handling

        This implements Alex's core logic:
        1. Assess message for crisis indicators
        2. Determine appropriate response level
        3. Provide support and resources
        4. Maintain safety protocols
        """
        try:
            if not state.messages:
                raise ValueError("No messages in state")

            latest_message = state.messages[-1]

            # Update state metadata
            state.metadata.update(
                {
                    "processed_by": "alex",
                    "timestamp": datetime.utcnow().isoformat(),
                    "message_count": len(state.messages),
                }
            )

            # Assess crisis level
            crisis_level = await self._assess_crisis_level(latest_message)

            # Update state with crisis information
            state.metadata["crisis_level"] = crisis_level

            # Generate appropriate response based on crisis level
            response = await self._generate_crisis_response(
                crisis_level, latest_message
            )

            # Add response to state
            state.messages.append(
                AIMessage(
                    content=response,
                    additional_kwargs={
                        "crisis_level": crisis_level,
                        "timestamp": datetime.utcnow().isoformat(),
                    },
                )
            )

            # If emergency level, mark for immediate human review
            if crisis_level == "emergency":
                state.metadata["requires_human_review"] = True
                state.metadata["emergency_timestamp"] = datetime.utcnow().isoformat()

            return state

        except Exception as e:
            return await self.handle_error(e, state)

    async def _assess_crisis_level(self, message: HumanMessage) -> str:
        """
        Assess the crisis level of a message
        Uses semantic analysis to detect crisis indicators
        """
        # Implement crisis detection logic here
        # For now, return a default level
        return "low"

    async def _generate_crisis_response(
        self, crisis_level: str, message: HumanMessage
    ) -> str:
        """Generate appropriate response based on crisis level"""
        responses = {
            "low": "I hear you, and I want you to know that it's okay to feel this way. Would you like to talk more about what's troubling you?",
            "medium": "I can sense that you're going through a difficult time. I'm here to support you. Can you tell me more about what's happening?",
            "high": "I'm very concerned about what you're sharing. Let's focus on your immediate safety and well-being. Would it be okay if we explored some immediate support options?",
            "emergency": "Your safety is my top priority right now. I'm going to connect you with emergency support services who are better equipped to help you through this situation.",
        }

        return responses.get(crisis_level, responses["low"])

    def get_crisis_protocols(self) -> Dict[str, str]:
        """Get the current crisis protocols and levels"""
        return self.crisis_levels

    async def validate_response(self, response: str, crisis_level: str) -> bool:
        """Validate that a response is appropriate for the crisis level"""
        # Implement response validation logic
        return True  # Placeholder
