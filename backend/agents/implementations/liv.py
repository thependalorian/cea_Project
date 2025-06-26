import logging
from typing import Dict, Any, List
import logging
from langchain_core.messages import HumanMessage, AIMessage

from backend.agents.base.agent_base import BaseAgent, AgentResponse, AgentState

logger = logging.getLogger(__name__)


class LivAgent(BaseAgent):
    """International populations specialist with credential recognition expertise"""

    def __init__(self):
        super().__init__(
            name="Liv",
            role="International Team Lead",
            specialization="International credentials, immigration pathways, cultural adaptation",
            intelligence_level="8.5/10",
        )
        self.credential_evaluator = InternationalCredentialsTool()
        self.job_matcher = JobMatcher()

    async def process_message(self, state: AgentState) -> AgentResponse:
        """Process message with international populations expertise"""
        try:
            user_message = state.messages[-1].content

            # Analyze for international context
            international_context = await self._analyze_international_background(
                user_message, state.context
            )

            # Generate response based on international expertise
            if international_context.get("has_international_background"):
                response = await self._handle_international_query(
                    user_message, international_context, state
                )
            else:
                response = await self._handle_general_career_query(user_message, state)

            return AgentResponse(
                message=response["message"],
                confidence_score=response["confidence"],
                reasoning=response["reasoning"],
                suggested_actions=response.get("actions", []),
                metadata={
                    "international_context": international_context,
                    "tools_used": response.get("tools_used", []),
                },
            )

        except Exception as e:
            logger.error(f"Error processing message in LivAgent: {str(e)}")
            return AgentResponse(
                message="I apologize, but I encountered an error while processing your request. Could you please rephrase or provide more details?",
                confidence_score=0.2,
                reasoning="Error encountered during processing",
                suggested_actions=["Rephrase request", "Provide more details"],
            )

    async def _analyze_international_background(
        self, message: str, context: Dict
    ) -> Dict[str, Any]:
        """Analyze message for international background indicators"""
        international_context = {
            "has_international_background": False,
            "country_of_origin": None,
            "credentials": [],
            "language_proficiency": None,
            "immigration_status": None,
        }

        # Check message content for international indicators
        international_keywords = [
            "international",
            "visa",
            "immigration",
            "foreign",
            "credential",
            "degree",
            "university",
            "overseas",
            "abroad",
            "country",
        ]

        if any(keyword in message.lower() for keyword in international_keywords):
            international_context["has_international_background"] = True

        # Extract country of origin if mentioned
        countries = await self._extract_countries(message)
        if countries:
            international_context["country_of_origin"] = countries[0]
            international_context["has_international_background"] = True

        # Extract credentials if mentioned
        credentials = await self._extract_credentials(message)
        if credentials:
            international_context["credentials"] = credentials
            international_context["has_international_background"] = True

        # Check context for additional information
        if context.get("user_profile"):
            profile = context["user_profile"]
            if profile.get("country_of_origin"):
                international_context["country_of_origin"] = profile[
                    "country_of_origin"
                ]
                international_context["has_international_background"] = True
            if profile.get("credentials"):
                international_context["credentials"].extend(profile["credentials"])
            if profile.get("immigration_status"):
                international_context["immigration_status"] = profile[
                    "immigration_status"
                ]

        return international_context

    async def _handle_international_query(
        self, message: str, international_context: Dict, state: AgentState
    ) -> Dict[str, Any]:
        """Handle queries from international job seekers"""
        response_data = {
            "message": "",
            "confidence": 0.0,
            "reasoning": "",
            "actions": [],
            "tools_used": [],
        }

        # Evaluate credentials if available
        if (
            international_context["credentials"]
            and international_context["country_of_origin"]
        ):
            eval_response = await self.credential_evaluator.execute(
                credentials=international_context["credentials"],
                country=international_context["country_of_origin"],
            )

            if eval_response.success:
                response_data["tools_used"].append("credential_evaluator")

                # Extract key information for response
                us_equivalent = eval_response.results["us_equivalent"]
                requirements = eval_response.results["additional_requirements"]
                recommendations = eval_response.results["recommended_actions"]

                # Build credential evaluation message
                response_data["message"] = (
                    f"Based on your credentials from {international_context['country_of_origin']}, "
                    f"they are generally equivalent to a {us_equivalent} in the US. "
                    f"\n\nKey requirements for recognition:\n"
                    + "\n".join(f"- {req}" for req in requirements[:3])
                )

                response_data["confidence"] = 0.85
                response_data["reasoning"] = (
                    "Provided credential evaluation with high confidence due to available credential and country information"
                )
                response_data["actions"].extend(recommendations)

        # Find relevant job opportunities
        if state.context.get("user_profile", {}).get("skills"):
            job_response = await self.job_matcher.execute(
                skills=state.context["user_profile"]["skills"],
                credentials=international_context["credentials"],
                visa_sponsorship_required=True,
            )

            if job_response.success:
                response_data["tools_used"].append("job_matcher")

                matches = job_response.results["matches"]
                if matches:
                    top_matches = matches[:3]
                    response_data["message"] += (
                        f"\n\nI've found some relevant job opportunities that offer visa sponsorship:\n"
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
                "I understand you're looking for opportunities as an international candidate. "
                "To better assist you, could you please share:\n"
                "1. Your educational credentials and country of origin\n"
                "2. Your current immigration status\n"
                "3. Your key skills and experience\n"
                "4. The types of roles you're interested in"
            )
            response_data["confidence"] = 0.6
            response_data["reasoning"] = (
                "Requesting more information to provide targeted assistance"
            )
            response_data["actions"] = [
                "Provide educational credentials",
                "Share immigration status",
                "List key skills",
            ]

        return response_data

    async def _handle_general_career_query(
        self, message: str, state: AgentState
    ) -> Dict[str, Any]:
        """Handle general career-related queries"""
        return {
            "message": (
                "I specialize in helping international job seekers navigate the US job market. "
                "If you're an international candidate, I can help with:\n"
                "- Evaluating international credentials\n"
                "- Finding jobs with visa sponsorship\n"
                "- Understanding licensing requirements\n"
                "- Cultural adaptation guidance"
            ),
            "confidence": 0.7,
            "reasoning": "Provided general information about international job seeking services",
            "actions": [
                "Share international background",
                "Provide credentials for evaluation",
                "Explore visa sponsorship opportunities",
            ],
        }

    async def _extract_countries(self, message: str) -> List[str]:
        """Extract country names from message"""
        # This is a simplified version - in production, use a proper NER model
        common_countries = [
            "india",
            "china",
            "canada",
            "uk",
            "australia",
            "germany",
            "france",
            "brazil",
            "mexico",
            "japan",
            "south korea",
            "philippines",
            "nigeria",
        ]

        found_countries = []
        message_lower = message.lower()

        for country in common_countries:
            if country in message_lower:
                found_countries.append(country)

        return found_countries

    async def _extract_credentials(self, message: str) -> List[str]:
        """Extract educational credentials from message"""
        # This is a simplified version - in production, use a proper NER model
        credential_keywords = [
            "bachelor",
            "master",
            "phd",
            "doctorate",
            "diploma",
            "certificate",
            "degree",
            "mba",
        ]

        found_credentials = []
        message_lower = message.lower()

        for credential in credential_keywords:
            if credential in message_lower:
                found_credentials.append(credential)

        return found_credentials
