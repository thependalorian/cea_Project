import logging
from typing import Dict, Any, List
import logging
from datetime import datetime
from langchain_core.messages import HumanMessage, AIMessage

from backend.agents.base.agent_base import BaseAgent, AgentState

logger = logging.getLogger(__name__)


class MaiAgent(BaseAgent):
    """
    Mai - Resume Analysis and Optimization Specialist
    Responsible for analyzing resumes and providing optimization recommendations
    """

    def __init__(self):
        super().__init__(
            name="Mai",
            description="Resume analysis and optimization specialist",
            intelligence_level=9.0,  # High precision required for resume analysis
            tools=[
                "resume_analysis",
                "ats_optimization",
                "skill_extraction",
                "job_matching",
            ],
        )

    async def initialize(self) -> None:
        """Initialize Mai's resume analysis capabilities"""
        await super().initialize()

        # Initialize analysis categories
        self.analysis_categories = {
            "format": "Resume formatting and structure",
            "content": "Content quality and relevance",
            "skills": "Skills identification and matching",
            "experience": "Experience description and impact",
            "ats": "ATS compatibility score",
        }

        logger.info("mai_initialized", categories=len(self.analysis_categories))

    async def process(self, state: AgentState) -> AgentState:
        """
        Process the current state with resume analysis focus

        This implements Mai's core logic:
        1. Analyze resume content
        2. Extract and validate skills
        3. Check ATS compatibility
        4. Provide optimization recommendations
        """
        try:
            if not state.messages:
                raise ValueError("No messages in state")

            latest_message = state.messages[-1]

            # Update state metadata
            state.metadata.update(
                {
                    "processed_by": "mai",
                    "timestamp": datetime.utcnow().isoformat(),
                    "message_count": len(state.messages),
                }
            )

            # Check if resume is attached
            resume_id = state.metadata.get("resume_id")
            if resume_id:
                # Analyze resume
                analysis_results = await self._analyze_resume(resume_id)
                state.metadata["analysis_results"] = analysis_results

                # Generate recommendations
                recommendations = await self._generate_recommendations(analysis_results)

                # Add response to state
                state.messages.append(
                    AIMessage(
                        content=self._format_recommendations(recommendations),
                        additional_kwargs={
                            "analysis_results": analysis_results,
                            "timestamp": datetime.utcnow().isoformat(),
                        },
                    )
                )
            else:
                # Handle conversation without resume
                response = await self._handle_general_query(latest_message)
                state.messages.append(
                    AIMessage(
                        content=response,
                        additional_kwargs={"timestamp": datetime.utcnow().isoformat()},
                    )
                )

            return state

        except Exception as e:
            return await self.handle_error(e, state)

    async def _analyze_resume(self, resume_id: str) -> Dict[str, Any]:
        """Analyze a resume and return structured results"""
        # Implement resume analysis logic here
        # For now, return placeholder results
        return {
            "format_score": 8.5,
            "content_score": 7.5,
            "ats_compatibility": 9.0,
            "skills_extracted": ["python", "data analysis", "project management"],
            "improvement_areas": [
                "bullet point formatting",
                "quantifiable achievements",
            ],
        }

    async def _generate_recommendations(
        self, analysis: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Generate specific recommendations based on analysis"""
        recommendations = []

        # Format recommendations
        if analysis["format_score"] < 9.0:
            recommendations.append(
                {
                    "category": "format",
                    "suggestion": "Consider using a more modern template with clear section headers",
                    "priority": "medium",
                }
            )

        # Content recommendations
        if analysis["content_score"] < 8.0:
            recommendations.append(
                {
                    "category": "content",
                    "suggestion": "Add more quantifiable achievements to demonstrate impact",
                    "priority": "high",
                }
            )

        # ATS recommendations
        if analysis["ats_compatibility"] < 9.5:
            recommendations.append(
                {
                    "category": "ats",
                    "suggestion": "Use more industry-standard keywords from the job description",
                    "priority": "high",
                }
            )

        return recommendations

    def _format_recommendations(self, recommendations: List[Dict[str, Any]]) -> str:
        """Format recommendations into a user-friendly message"""
        message = "Here's my analysis of your resume:\n\n"

        for rec in recommendations:
            message += f"📌 {rec['category'].upper()}: {rec['suggestion']}"
            if rec["priority"] == "high":
                message += " (High Priority)"
            message += "\n"

        return message

    async def _handle_general_query(self, message: HumanMessage) -> str:
        """Handle general resume-related queries"""
        # Implement query handling logic
        return "I can help you optimize your resume. Would you like to upload one for analysis?"

    def get_analysis_categories(self) -> Dict[str, str]:
        """Get the current analysis categories"""
        return self.analysis_categories
