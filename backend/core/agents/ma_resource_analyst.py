"""
Massachusetts Resource Analyst Agent for Climate Economy Assistant

This module implements the Jasmine agent, specialized in Massachusetts climate economy
resource analysis, job matching, and career pathway guidance.
"""

import asyncio
from datetime import datetime
from typing import Any, Dict, List, Optional

from core.agents.base import BaseAgent
from core.config import get_settings
from core.models import AgentState
from core.prompts import MA_CLIMATE_CONTEXT, MA_RESOURCE_ANALYST_PROMPT
from langgraph.types import Command
from tools.analytics import log_specialist_interaction
from tools.jobs import match_jobs_for_profile
from tools.resume import get_user_resume
from tools.search import search_resources
from tools.training import recommend_upskilling

settings = get_settings()


class MAResourceAnalystAgent(BaseAgent):
    """
    Jasmine - Massachusetts Resource Analyst Agent

    Specializes in Massachusetts climate economy resource analysis,
    job matching, and career pathway guidance using real tools and data.
    """

    def __init__(self):
        """Initialize the MA Resource Analyst agent"""
        super().__init__("jasmine_ma_resource_analyst")
        self.agent_name = "Jasmine"
        self.prompt = MA_RESOURCE_ANALYST_PROMPT
        self.context = MA_CLIMATE_CONTEXT

    async def analyze_ma_opportunities(
        self, user_query: str, user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Analyze Massachusetts climate economy opportunities for the user

        Args:
            user_query: User's query about opportunities
            user_id: User ID for personalized analysis

        Returns:
            Dict containing analysis results
        """
        try:
            analysis_results = {}

            # Get user resume if available
            if user_id:
                user_resume = await get_user_resume(user_id)
                if user_resume:
                    analysis_results["user_profile"] = {
                        "skills": user_resume.get("skills_extracted", []),
                        "experience_years": user_resume.get("experience_years", 0),
                        "education_level": user_resume.get(
                            "education_level", "Unknown"
                        ),
                        "climate_relevance": user_resume.get(
                            "climate_relevance_score", 0.0
                        ),
                    }

            # Search for relevant resources - using proper tool invocation
            resources = await search_resources.ainvoke(
                {
                    "query": user_query,
                    "resource_types": ["jobs", "training", "organizations"],
                    "location": "Massachusetts",
                }
            )
            analysis_results["resources"] = resources

            # Get job matches if user profile available
            if user_id and analysis_results.get("user_profile"):
                job_matches = await match_jobs_for_profile.ainvoke(
                    {
                        "skills": analysis_results["user_profile"]["skills"],
                        "background": "general",
                        "experience_level": "mid_level",
                    }
                )
                analysis_results["job_matches"] = job_matches

            # Get training recommendations - using proper tool invocation
            training_recs = await recommend_upskilling.ainvoke(
                {
                    "user_background": "general",
                    "target_skills": [
                        "renewable energy",
                        "sustainability",
                        "clean technology",
                    ],
                    "learning_format": "hybrid",
                }
            )
            analysis_results["training_recommendations"] = training_recs

            # Get relevant ACT partners
            act_partners = await self._get_relevant_act_partners(user_query)
            analysis_results["act_partners"] = act_partners

            return {
                "success": True,
                "analysis": analysis_results,
                "tools_used": [
                    "search_resources",
                    "match_jobs_for_profile",
                    "recommend_upskilling",
                ],
            }

        except Exception as e:
            self.log_error("MA opportunities analysis failed", e)
            raise Exception(f"Analysis failed: {str(e)}")

    async def _get_relevant_act_partners(self, query: str) -> List[Dict[str, Any]]:
        """
        Get relevant ACT partner organizations based on query

        Args:
            query: User query

        Returns:
            List of relevant ACT partners
        """
        # ACT partner database (would be from real database in production)
        act_partners = [
            {
                "name": "SouthCoast Wind",
                "sector": "offshore_wind",
                "location": "New Bedford",
            },
            {"name": "Nexamp", "sector": "solar", "location": "Boston"},
            {
                "name": "Rise Engineering",
                "sector": "energy_efficiency",
                "location": "Cranston",
            },
            {"name": "Cotuit Solar", "sector": "solar", "location": "Cape Cod"},
            {"name": "IBEW Local 103", "sector": "electrical", "location": "Boston"},
            {
                "name": "HomeWorks Energy",
                "sector": "weatherization",
                "location": "Worcester",
            },
        ]

        # Simple relevance matching (would use ML in production)
        query_lower = query.lower()
        relevant_partners = []

        for partner in act_partners:
            if partner["sector"] in query_lower or any(
                keyword in query_lower
                for keyword in ["solar", "wind", "efficiency", "electrical"]
            ):
                relevant_partners.append(partner)

        return relevant_partners[:3]  # Return top 3 most relevant

    def format_ma_response(self, analysis: Dict[str, Any], user_query: str) -> str:
        """
        Format the analysis into a comprehensive Massachusetts-focused response

        Args:
            analysis: Analysis results
            user_query: Original user query

        Returns:
            Formatted response string
        """
        response_parts = []

        # Header
        response_parts.append(
            f"🍃 **Jasmine - Massachusetts Climate Economy Resource Analysis**\n"
            f'Based on your inquiry about: "{user_query}"\n'
        )

        # User profile insights
        if "user_profile" in analysis:
            profile = analysis["user_profile"]
            response_parts.append(
                f"**Your Profile Analysis:**\n"
                f"• Experience Level: {profile['experience_years']} years\n"
                f"• Education: {profile['education_level']}\n"
                f"• Climate Relevance Score: {profile['climate_relevance']:.1f}/1.0\n"
                f"• Key Skills: {', '.join(profile['skills'][:5])}\n"
            )

        # Job opportunities
        if "job_matches" in analysis:
            response_parts.append(
                f"**Matched Opportunities:**\n{analysis['job_matches']}\n"
            )

        # Training recommendations
        if "training_recommendations" in analysis:
            response_parts.append(
                f"**Recommended Training:**\n{analysis['training_recommendations']}\n"
            )

        # ACT partners
        if "act_partners" in analysis and analysis["act_partners"]:
            partners_text = "\n".join(
                [
                    f"• {partner['name']} ({partner['sector']}) - {partner['location']}"
                    for partner in analysis["act_partners"]
                ]
            )
            response_parts.append(f"**Relevant ACT Partners:**\n{partners_text}\n")

        # Resources
        if "resources" in analysis:
            response_parts.append(
                f"**Additional Resources:**\n{analysis['resources']}\n"
            )

        # Next steps
        response_parts.append(
            f"**Next Steps:**\n"
            f"1. Review the matched opportunities above\n"
            f"2. Connect with relevant ACT partners for networking\n"
            f"3. Enroll in recommended training programs\n"
            f"4. Update your profile with any new skills or certifications\n"
        )

        return "\n".join(response_parts)

    async def handle_message(
        self, message: str, user_id: str, conversation_id: str
    ) -> Dict[str, Any]:
        """
        Handle a user message with real Massachusetts climate economy analysis

        Args:
            message: User message
            user_id: User ID
            conversation_id: Conversation ID

        Returns:
            Dict containing response and metadata
        """
        try:
            # Perform analysis using real tools
            analysis_result = await self.analyze_ma_opportunities(message, user_id)

            if not analysis_result.get("success"):
                raise Exception("Analysis failed to produce results")

            # Format response
            response_content = self.format_ma_response(
                analysis_result["analysis"], message
            )

            # Log interaction
            await log_specialist_interaction(
                specialist_type="jasmine",
                user_id=user_id,
                conversation_id=conversation_id,
                query=message,
                tools_used=analysis_result.get("tools_used", []),
                confidence=0.95,
            )

            return {
                "content": response_content,
                "metadata": {
                    "specialist": "jasmine",
                    "agent_name": "Jasmine",
                    "tools_used": analysis_result.get("tools_used", []),
                    "confidence": 0.95,
                    "has_user_profile": "user_profile" in analysis_result["analysis"],
                    "act_partners_found": len(
                        analysis_result["analysis"].get("act_partners", [])
                    ),
                    "sources": [
                        "Massachusetts ACT Partner Network",
                        "MassCEC Job Board",
                        "Training Database",
                    ],
                },
            }

        except Exception as e:
            self.log_error("MA Resource Analyst error", e)
            raise Exception(f"Massachusetts resource analysis failed: {str(e)}")

    def process(self, state: AgentState) -> Dict[str, Any]:
        """
        Process the agent state and return response

        Args:
            state: Current agent state

        Returns:
            Updated state with response
        """
        try:
            # Extract user message
            user_message = self.extract_latest_message(state)
            user_id = state.get("uuid", "")
            conversation_id = state.get("conversation_id", "")

            if not user_message:
                raise Exception("No user message found in state")

            # Create event loop for async processing
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)

            try:
                # Process message
                response_data = loop.run_until_complete(
                    self.handle_message(user_message, user_id, conversation_id)
                )

                # Create response message
                response_message = self.create_response(response_data["content"])

                # Update state
                updated_messages = list(state.get("messages", []))
                updated_messages.append(response_message)

                return {
                    **state,
                    "messages": updated_messages,
                    "current_specialist_history": ["jasmine_ma_resource_analyst"],
                    "metadata": response_data.get("metadata", {}),
                }

            finally:
                loop.close()

        except Exception as e:
            self.log_error("Process error", e)
            raise Exception(f"Processing failed: {str(e)}")
