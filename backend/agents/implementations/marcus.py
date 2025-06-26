import logging

"""
Marcus agent implementation - Veterans Specialist
Specializes in supporting military veterans transitioning to climate economy careers.
"""

from typing import Dict, List, Any, AsyncIterator, Optional
import json
import asyncio
from langchain_core.messages import HumanMessage, AIMessage
from datetime import datetime

from backend.agents.base.agent_base import BaseAgent, AgentState

logger = logging.getLogger(__name__)


class MarcusAgent(BaseAgent):
    """
    Marcus - Veterans specialist agent who helps military veterans
    transition to civilian careers in the climate economy.
    """

    def __init__(
        self,
        name: str = "Marcus",
        description: str = "Veterans specialist helping with military-to-civilian transition",
        intelligence_level: float = 9.0,
        tools: Optional[List[str]] = None,
    ):
        tools = tools or ["veterans_support", "skills_translation", "job_matching"]
        super().__init__(name, description, intelligence_level, tools)
        self.config = AgentConfig.get_agent_config("marcus")
        self.veterans_resources = VeteransResourceTool()

    async def initialize(self) -> None:
        """Initialize agent resources"""
        await super().initialize()
        logger.info("Initializing Veterans specialist agent")

    async def process(self, state: AgentState) -> AgentState:
        """Process the current state and return updated state"""
        try:
            # Extract the latest user message
            user_message = state.messages[-1].content

            # Analyze message for veteran-specific needs
            analysis = await self._analyze_veteran_needs(user_message, state.memory)

            # Get appropriate resources
            resources = await self.veterans_resources.get_resources(
                analysis.get("needs", []),
                analysis.get("service_branch"),
                analysis.get("years_of_service"),
            )

            # Generate personalized response
            response = await self._generate_veteran_response(
                user_message, analysis, resources
            )

            # Create AI message
            ai_message = AIMessage(content=response)

            # Update state
            state.messages.append(ai_message)
            state.current_agent = self.name
            state.metadata.update(
                {"veteran_analysis": analysis, "resources_provided": resources}
            )

            # Track in memory for future context
            if "veteran_context" not in state.memory:
                state.memory["veteran_context"] = {}

            state.memory["veteran_context"].update(
                {
                    "service_branch": analysis.get("service_branch"),
                    "skills_identified": analysis.get("skills", []),
                    "last_interaction": datetime.utcnow().isoformat(),
                }
            )

            return state

        except Exception as e:
            logger.error(f"Error in Marcus agent processing: {str(e)}")
            return await self.handle_error(e, state)

    async def _analyze_veteran_needs(
        self, message: str, memory: Dict
    ) -> Dict[str, Any]:
        """
        Analyze the message for veteran-specific needs and context.

        Returns:
            Dict with veteran-specific analysis:
                - needs: List of identified needs
                - service_branch: Identified military branch
                - years_of_service: Estimated years of service
                - skills: List of military skills identified
                - transition_stage: Current stage in transition process
        """
        # This would use a specialized LLM call for veterans context
        # For now, using placeholder implementation

        logger.info("Analyzing veteran needs")

        # Extract service branch from context if available
        service_branch = memory.get("veteran_context", {}).get("service_branch")

        # Simple keyword-based analysis as placeholder
        needs = []
        if "resume" in message.lower():
            needs.append("resume_translation")
        if "benefits" in message.lower() or "va" in message.lower():
            needs.append("benefits_navigation")
        if "training" in message.lower() or "certification" in message.lower():
            needs.append("training_programs")
        if "job" in message.lower() or "career" in message.lower():
            needs.append("job_search")

        # Default to general support if no specific needs identified
        if not needs:
            needs.append("general_transition_support")

        return {
            "needs": needs,
            "service_branch": service_branch or "unidentified",
            "years_of_service": memory.get("veteran_context", {}).get(
                "years_of_service", "unknown"
            ),
            "skills": memory.get("veteran_context", {}).get("skills_identified", []),
            "transition_stage": "exploring",  # Placeholder
        }

    async def _generate_veteran_response(
        self, message: str, analysis: Dict[str, Any], resources: List[Dict[str, Any]]
    ) -> str:
        """Generate a personalized response for the veteran."""
        # This would use a specialized LLM call with veteran-specific prompt
        # For now, using placeholder implementation

        response_parts = [
            f"Hi there! This is Marcus, the Veterans specialist at the Climate Economy Assistant.",
            "\n\n",
        ]

        # Address identified needs
        needs = analysis.get("needs", [])

        if "resume_translation" in needs:
            response_parts.append(
                "I can help you translate your military experience into civilian terms "
                "for your resume. Military experience provides valuable skills like leadership, "
                "logistics, technical expertise, and crisis management that are highly valued "
                "in the climate economy sector."
            )

        if "benefits_navigation" in needs:
            response_parts.append(
                "\n\nRegarding veteran benefits, there are several programs that can support "
                "your transition to a climate career, including the GI Bill for education and "
                "training, VR&E (Vocational Rehabilitation and Employment) for career counseling, "
                "and VA home loans if you're relocating for work."
            )

        if "training_programs" in needs:
            response_parts.append(
                "\n\nThere are several veteran-focused training programs in the climate sector, "
                "including Helmets to Hardhats for construction and solar installation, "
                "and the Veterans in Energy program. Many of these qualify for GI Bill benefits."
            )

        if "job_search" in needs:
            response_parts.append(
                "\n\nFor your job search, I recommend focusing on companies with strong "
                "veteran hiring initiatives in the climate sector, such as Tesla's Veterans Program, "
                "The Solar Foundation's Solar Ready Vets, and General Electric's Junior Officer "
                "Leadership Program."
            )

        if "general_transition_support" in needs:
            response_parts.append(
                "\n\nAs you transition to a civilian career in the climate economy, I'm here to help "
                "you navigate this change. Your military experience has equipped you with valuable "
                "skills like adaptability, team leadership, and mission focus that are highly sought "
                "after in climate-focused organizations."
            )

        # Add resource information if available
        if resources:
            response_parts.append("\n\nHere are some resources that might help you:")
            for resource in resources[:3]:  # Limit to top 3 resources
                response_parts.append(
                    f"\n- {resource['name']}: {resource['description']}"
                )

        # Add follow-up questions
        response_parts.append(
            "\n\nTo better assist you, could you share:"
            "\n1. Which branch of the military did you serve in?"
            "\n2. What specific skills from your military experience would you like to highlight?"
            "\n3. Are you interested in education/training opportunities or immediate employment?"
        )

        return "".join(response_parts)

    async def stream_response(self, state: AgentState) -> AsyncIterator[Dict[str, Any]]:
        """Stream a response to the user."""
        try:
            # Process the state
            updated_state = await self.process(state)

            # Get the response
            response = updated_state.messages[-1].content

            # Stream the response in chunks
            for i in range(0, len(response), 40):
                chunk = response[i : i + 40]
                yield {
                    "type": "token",
                    "content": chunk,
                    "done": False,
                    "agent_id": self.name,
                }
                await asyncio.sleep(0.05)

            yield {
                "type": "message_complete",
                "content": "",
                "done": True,
                "agent_id": self.name,
            }

        except Exception as e:
            logger.error(f"Error streaming response: {str(e)}")
            yield {
                "type": "error",
                "content": "I apologize, but I encountered an error while processing your request.",
                "done": True,
                "agent_id": self.name,
                "error": str(e),
            }

    def get_capabilities(self) -> Dict[str, Any]:
        """Get agent capabilities"""
        capabilities = super().get_capabilities()
        capabilities.update(
            {
                "specializations": [
                    "veterans_affairs",
                    "military_transition",
                    "skills_translation",
                    "benefits_navigation",
                    "veteran_career_development",
                ],
                "supported_branches": [
                    "army",
                    "navy",
                    "air_force",
                    "marines",
                    "coast_guard",
                    "space_force",
                    "national_guard",
                    "reserves",
                ],
            }
        )
        return capabilities
