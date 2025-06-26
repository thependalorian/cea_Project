import logging
from typing import Dict, Any, List
import logging
from langchain_core.messages import HumanMessage, AIMessage

from backend.agents.base.agent_base import BaseAgent, AgentResponse, AgentState

logger = logging.getLogger(__name__)


class MiguelAgent(BaseAgent):
    """Environmental Justice specialist focusing on climate careers and community impact"""

    def __init__(self):
        super().__init__(
            name="Miguel",
            role="Environmental Justice Lead",
            specialization="Environmental justice, community impact, sustainable development",
            intelligence_level="8.5/10",
        )
        self.ej_analyzer = EnvironmentalJusticeTool()
        self.job_matcher = JobMatcher()

    async def process_message(self, state: AgentState) -> AgentResponse:
        """Process message with environmental justice expertise"""
        try:
            user_message = state.messages[-1].content

            # Analyze for environmental justice context
            ej_context = await self._analyze_environmental_justice_context(
                user_message, state.context
            )

            # Generate response based on environmental justice expertise
            if ej_context.get("has_ej_focus"):
                response = await self._handle_ej_query(user_message, ej_context, state)
            else:
                response = await self._handle_general_climate_query(user_message, state)

            return AgentResponse(
                message=response["message"],
                confidence_score=response["confidence"],
                reasoning=response["reasoning"],
                suggested_actions=response.get("actions", []),
                metadata={
                    "ej_context": ej_context,
                    "tools_used": response.get("tools_used", []),
                },
            )

        except Exception as e:
            logger.error(f"Error processing message in MiguelAgent: {str(e)}")
            return AgentResponse(
                message="I apologize, but I encountered an error while processing your request. Could you please rephrase or provide more details?",
                confidence_score=0.2,
                reasoning="Error encountered during processing",
                suggested_actions=["Rephrase request", "Provide more details"],
            )

    async def _analyze_environmental_justice_context(
        self, message: str, context: Dict
    ) -> Dict[str, Any]:
        """Analyze message for environmental justice indicators"""
        ej_context = {
            "has_ej_focus": False,
            "community_type": None,
            "environmental_concerns": [],
            "impact_areas": [],
            "advocacy_interests": None,
        }

        # Check message content for environmental justice indicators
        ej_keywords = [
            "environmental justice",
            "community",
            "pollution",
            "climate impact",
            "frontline",
            "equity",
            "vulnerable",
            "sustainability",
            "clean energy",
        ]

        if any(keyword in message.lower() for keyword in ej_keywords):
            ej_context["has_ej_focus"] = True

        # Extract community type if mentioned
        communities = await self._extract_community_types(message)
        if communities:
            ej_context["community_type"] = communities[0]
            ej_context["has_ej_focus"] = True

        # Extract environmental concerns if mentioned
        concerns = await self._extract_environmental_concerns(message)
        if concerns:
            ej_context["environmental_concerns"] = concerns
            ej_context["has_ej_focus"] = True

        # Check context for additional information
        if context.get("user_profile"):
            profile = context["user_profile"]
            if profile.get("community_focus"):
                ej_context["community_type"] = profile["community_focus"]
                ej_context["has_ej_focus"] = True
            if profile.get("environmental_interests"):
                ej_context["environmental_concerns"].extend(
                    profile["environmental_interests"]
                )
            if profile.get("advocacy_experience"):
                ej_context["advocacy_interests"] = profile["advocacy_experience"]

        return ej_context

    async def _handle_ej_query(
        self, message: str, ej_context: Dict, state: AgentState
    ) -> Dict[str, Any]:
        """Handle queries related to environmental justice"""
        response_data = {
            "message": "",
            "confidence": 0.0,
            "reasoning": "",
            "actions": [],
            "tools_used": [],
        }

        # Analyze environmental justice impact
        if ej_context["environmental_concerns"] and ej_context["community_type"]:
            ej_response = await self.ej_analyzer.execute(
                concerns=ej_context["environmental_concerns"],
                community=ej_context["community_type"],
            )

            if ej_response.success:
                response_data["tools_used"].append("ej_analyzer")

                # Extract key information for response
                impact_areas = ej_response.results["impact_areas"]
                opportunities = ej_response.results["opportunities"]
                recommendations = ej_response.results["recommended_actions"]

                # Build environmental justice response
                response_data["message"] = (
                    f"Based on your interest in {ej_context['community_type']} communities "
                    f"and {', '.join(ej_context['environmental_concerns'][:2])}, "
                    f"here are key opportunities for impact:\n\n"
                    + "\n".join(f"- {opp}" for opp in opportunities[:3])
                )

                response_data["confidence"] = 0.85
                response_data["reasoning"] = (
                    "Provided environmental justice analysis with high confidence due to specific community and environmental concerns"
                )
                response_data["actions"].extend(recommendations)

        # Find relevant job opportunities
        if state.context.get("user_profile", {}).get("skills"):
            job_response = await self.job_matcher.execute(
                skills=state.context["user_profile"]["skills"],
                focus_areas=ej_context["environmental_concerns"],
                community_impact=True,
            )

            if job_response.success:
                response_data["tools_used"].append("job_matcher")

                matches = job_response.results["matches"]
                if matches:
                    top_matches = matches[:3]
                    response_data["message"] += (
                        f"\n\nI've found some relevant opportunities in environmental justice:\n"
                        + "\n".join(
                            f"- {job['title']} at {job['company']} ({job['match_score']}% match)"
                            for job in top_matches
                        )
                    )
                    response_data["actions"].extend(
                        job_response.results["recommendations"]
                    )

        # Add general guidance if needed
        if not response_data["message"]:
            response_data["message"] = (
                "I understand you're interested in environmental justice opportunities. "
                "To better assist you, could you please share:\n"
                "1. The specific community or region you're focused on\n"
                "2. Key environmental concerns in your area\n"
                "3. Your experience with community advocacy\n"
                "4. The types of environmental justice roles you're interested in"
            )
            response_data["confidence"] = 0.6
            response_data["reasoning"] = (
                "Requesting more information to provide targeted assistance"
            )
            response_data["actions"] = [
                "Specify community focus",
                "Share environmental concerns",
                "Describe advocacy experience",
            ]

        return response_data

    async def _handle_general_climate_query(
        self, message: str, state: AgentState
    ) -> Dict[str, Any]:
        """Handle general climate-related queries"""
        return {
            "message": (
                "I specialize in connecting people with environmental justice opportunities. "
                "I can help you:\n"
                "- Identify environmental justice initiatives in your community\n"
                "- Find roles in climate justice and advocacy\n"
                "- Connect with community environmental programs\n"
                "- Understand environmental impact assessment"
            ),
            "confidence": 0.7,
            "reasoning": "Provided general information about environmental justice opportunities",
            "actions": [
                "Share community focus",
                "Explore environmental concerns",
                "Learn about advocacy opportunities",
            ],
        }

    async def _extract_community_types(self, message: str) -> List[str]:
        """Extract community types from message"""
        # This would be enhanced with NLP for better extraction
        community_types = []
        common_types = [
            "urban",
            "rural",
            "coastal",
            "indigenous",
            "low-income",
            "frontline",
            "industrial",
            "agricultural",
        ]

        message_lower = message.lower()
        for type_ in common_types:
            if type_ in message_lower:
                community_types.append(type_)

        return community_types

    async def _extract_environmental_concerns(self, message: str) -> List[str]:
        """Extract environmental concerns from message"""
        # This would be enhanced with NLP for better extraction
        concerns = []
        common_concerns = [
            "air pollution",
            "water quality",
            "toxic waste",
            "climate change",
            "flooding",
            "heat islands",
            "food access",
            "green space",
        ]

        message_lower = message.lower()
        for concern in common_concerns:
            if concern in message_lower:
                concerns.append(concern)

        return concerns
