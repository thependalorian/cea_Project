"""
Job Recommendation Workflow - Integrated with Climate Career Agents

Following rule #2: Create modular components for easy maintenance
Following rule #3: Component documentation explaining purpose and functionality

This module implements a workflow for job recommendations based on user profile,
skills, and preferences, integrated with Lauren (Climate Careers), Mai (Resume Analysis),
and Marcus (Job Market Insights) agents.
Location: backendv1/workflows/job_recommendation.py
"""

import logging
from typing import Dict, Any, List, Optional, Annotated
from datetime import datetime

from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from typing_extensions import TypedDict

from backendv1.utils.logger import setup_logger
from backendv1.config.settings import get_settings

# Setup logging
logger = setup_logger("job_recommendation")
settings = get_settings()


class JobRecommendationState(TypedDict):
    """State for job recommendation workflow - LangGraph compatible"""

    messages: Annotated[List[BaseMessage], add_messages]
    user_id: Optional[str]
    session_id: Optional[str]
    user_profile: Optional[Dict[str, Any]]
    skills_data: Optional[Dict[str, Any]]
    job_preferences: Optional[Dict[str, Any]]
    job_matches: List[Dict[str, Any]]
    recommendation_score: Optional[float]
    location_preferences: List[str]
    salary_range: Optional[Dict[str, Any]]
    lauren_analysis: Optional[str]
    mai_resume_insights: Optional[str]
    marcus_market_data: Optional[str]
    next_step: str
    analysis_complete: bool


class JobRecommendationWorkflow:
    """
    Job recommendation workflow implementation integrated with climate career agents

    This workflow orchestrates Lauren (Climate Careers), Mai (Resume Analysis),
    and Marcus (Job Market Insights) for comprehensive job recommendations.
    """

    def __init__(self):
        """Initialize job recommendation workflow with agent integrations"""
        logger.info("Initializing job recommendation workflow with climate career agents")
        self.lauren_agent = None
        self.mai_agent = None
        self.marcus_agent = None
        self._initialize_agents()
        self.graph = self._create_workflow_graph()

    def _initialize_agents(self):
        """Initialize climate career agents"""
        try:
            from backendv1.agents.lauren import LaurenAgent
            from backendv1.agents.mai import MaiAgent
            from backendv1.agents.marcus import MarcusAgent
            from backendv1.agents.base.agent_base import AgentContext

            self.lauren_agent = LaurenAgent("Lauren", "climate_career_specialist")
            self.mai_agent = MaiAgent("Mai", "resume_specialist")
            self.marcus_agent = MarcusAgent("Marcus", "job_market_analyst")
            self.agent_context_class = AgentContext

            logger.info("✅ Climate career agents initialized for job recommendation workflow")

        except ImportError as e:
            logger.warning(f"Could not import climate career agents: {e}")
            self.lauren_agent = None
            self.mai_agent = None
            self.marcus_agent = None

    def _create_workflow_graph(self) -> StateGraph:
        """Create job recommendation workflow graph with agent integrations"""
        # Create workflow graph
        workflow = StateGraph(JobRecommendationState)

        # Add nodes - each agent handles their specialty
        workflow.add_node("mai_resume_analysis", self._mai_resume_analysis)
        workflow.add_node("lauren_career_matching", self._lauren_career_matching)
        workflow.add_node("marcus_market_insights", self._marcus_market_insights)
        workflow.add_node("integrated_recommendations", self._integrated_recommendations)

        # Define workflow edges - parallel processing then integration
        workflow.add_conditional_edges(
            START, self._route_initial, {"mai_resume_analysis": "mai_resume_analysis"}
        )

        workflow.add_edge("mai_resume_analysis", "lauren_career_matching")
        workflow.add_edge("lauren_career_matching", "marcus_market_insights")
        workflow.add_edge("marcus_market_insights", "integrated_recommendations")
        workflow.add_edge("integrated_recommendations", END)

        # Compile the graph
        return workflow.compile()

    async def _mai_resume_analysis(self, state: JobRecommendationState) -> Dict[str, Any]:
        """Analyze user profile and resume using Mai Agent"""
        try:
            if not self.mai_agent:
                logger.warning("Mai Agent not available, providing fallback analysis")
                return {
                    "mai_resume_insights": "Resume analysis not available - please ensure your skills and experience are clearly documented.",
                    "skills_data": {
                        "analysis_source": "mai_agent",
                        "timestamp": datetime.utcnow().isoformat(),
                    },
                    "next_step": "resume_analyzed",
                }

            # Extract user message or profile data
            messages = state.get("messages", [])
            user_message = ""

            if messages:
                for msg in reversed(messages):
                    if isinstance(msg, dict) and msg.get("role") == "user":
                        user_message = msg.get("content", "")
                        break
                    elif hasattr(msg, "type") and msg.type == "human":
                        user_message = msg.content
                        break
                    elif isinstance(msg, HumanMessage):
                        user_message = msg.content
                        break

            # Create context for Mai Agent
            context = self.agent_context_class(
                user_id=state.get("user_id", "anonymous"),
                session_id=state.get("session_id", "job_rec_session"),
                conversation_history=messages,
                metadata={
                    "workflow_context": "resume_analysis_for_jobs",
                    "analysis_type": "skills_extraction",
                },
            )

            # Get Mai's resume analysis
            analysis_message = (
                f"Please analyze this profile for job recommendations: {user_message}"
            )
            mai_response = await self.mai_agent.process_message(analysis_message, context)
            mai_content = (
                mai_response.content if hasattr(mai_response, "content") else str(mai_response)
            )

            logger.info("📄 Resume analysis completed via Mai Agent")

            return {
                "mai_resume_insights": mai_content,
                "skills_data": {
                    "analysis_source": "mai_agent",
                    "timestamp": datetime.utcnow().isoformat(),
                },
                "next_step": "resume_analyzed",
            }

        except Exception as e:
            logger.error(f"Error in Mai resume analysis: {e}")
            return {
                "mai_resume_insights": "Resume analysis encountered an error. Please provide your key skills and experience.",
                "skills_data": {"error": str(e)},
                "next_step": "resume_analyzed",
            }

    async def _lauren_career_matching(self, state: JobRecommendationState) -> Dict[str, Any]:
        """Match climate career opportunities using Lauren Agent"""
        try:
            if not self.lauren_agent:
                logger.warning("Lauren Agent not available, providing fallback career matching")
                return {
                    "lauren_analysis": "Climate career matching not available - consider roles in renewable energy, sustainability, and environmental consulting.",
                    "job_matches": [
                        {
                            "title": "Climate Data Analyst",
                            "company": "Clean Energy Organization",
                            "match_score": 0.75,
                            "source": "fallback",
                        }
                    ],
                    "next_step": "careers_matched",
                }

            # Create context for Lauren Agent with resume insights
            context = self.agent_context_class(
                user_id=state.get("user_id", "anonymous"),
                session_id=state.get("session_id", "job_rec_session"),
                conversation_history=state.get("messages", []),
                metadata={
                    "workflow_context": "climate_career_matching",
                    "mai_insights": state.get("mai_resume_insights", ""),
                    "skills_data": state.get("skills_data", {}),
                },
            )

            # Get Lauren's climate career recommendations
            career_message = f"Based on this resume analysis, what climate career opportunities would you recommend? Resume insights: {state.get('mai_resume_insights', 'No resume analysis available')}"
            lauren_response = await self.lauren_agent.process_message(career_message, context)
            lauren_content = (
                lauren_response.content
                if hasattr(lauren_response, "content")
                else str(lauren_response)
            )

            logger.info("🌱 Climate career matching completed via Lauren Agent")

            return {
                "lauren_analysis": lauren_content,
                "job_matches": [
                    {
                        "source": "lauren_agent",
                        "analysis": lauren_content,
                        "timestamp": datetime.utcnow().isoformat(),
                    }
                ],
                "next_step": "careers_matched",
            }

        except Exception as e:
            logger.error(f"Error in Lauren career matching: {e}")
            return {
                "lauren_analysis": f"Climate career matching encountered an error: {str(e)}",
                "job_matches": [],
                "next_step": "careers_matched",
            }

    async def _marcus_market_insights(self, state: JobRecommendationState) -> Dict[str, Any]:
        """Get job market insights using Marcus Agent"""
        try:
            if not self.marcus_agent:
                logger.warning("Marcus Agent not available, providing fallback market insights")
                return {
                    "marcus_market_data": "Job market insights not available - consider researching salary ranges and growth trends in your target climate sectors.",
                    "salary_range": {"min": 50000, "max": 100000, "source": "fallback"},
                    "next_step": "market_analyzed",
                }

            # Create context for Marcus Agent with previous analyses
            context = self.agent_context_class(
                user_id=state.get("user_id", "anonymous"),
                session_id=state.get("session_id", "job_rec_session"),
                conversation_history=state.get("messages", []),
                metadata={
                    "workflow_context": "job_market_analysis",
                    "mai_insights": state.get("mai_resume_insights", ""),
                    "lauren_analysis": state.get("lauren_analysis", ""),
                    "job_matches": state.get("job_matches", []),
                },
            )

            # Get Marcus's market insights
            market_message = f"What are the current job market trends and salary expectations for these climate career recommendations? Lauren's analysis: {state.get('lauren_analysis', 'No career analysis available')}"
            marcus_response = await self.marcus_agent.process_message(market_message, context)
            marcus_content = (
                marcus_response.content
                if hasattr(marcus_response, "content")
                else str(marcus_response)
            )

            logger.info("📊 Job market insights completed via Marcus Agent")

            return {
                "marcus_market_data": marcus_content,
                "salary_range": {
                    "analysis": marcus_content,
                    "source": "marcus_agent",
                    "timestamp": datetime.utcnow().isoformat(),
                },
                "next_step": "market_analyzed",
            }

        except Exception as e:
            logger.error(f"Error in Marcus market analysis: {e}")
            return {
                "marcus_market_data": f"Job market analysis encountered an error: {str(e)}",
                "salary_range": {"error": str(e)},
                "next_step": "market_analyzed",
            }

    def _integrated_recommendations(self, state: JobRecommendationState) -> Dict[str, Any]:
        """Generate integrated job recommendations from all agent analyses"""
        try:
            # Compile all agent insights
            mai_insights = state.get("mai_resume_insights", "No resume analysis available")
            lauren_analysis = state.get("lauren_analysis", "No career analysis available")
            marcus_data = state.get("marcus_market_data", "No market data available")

            # Create comprehensive recommendation
            integrated_recommendation = {
                "recommendation_summary": {
                    "resume_analysis": mai_insights,
                    "climate_career_opportunities": lauren_analysis,
                    "market_insights": marcus_data,
                    "integration_timestamp": datetime.utcnow().isoformat(),
                },
                "action_plan": {
                    "immediate_steps": [
                        "Review and optimize resume based on Mai's analysis",
                        "Research specific climate roles identified by Lauren",
                        "Understand market conditions from Marcus's insights",
                    ],
                    "next_steps": [
                        "Apply to recommended positions",
                        "Network within identified climate sectors",
                        "Continue skill development based on market trends",
                    ],
                },
                "agent_collaboration": {
                    "mai_contribution": "Resume and skills analysis",
                    "lauren_contribution": "Climate career matching",
                    "marcus_contribution": "Job market insights",
                },
            }

            logger.info("🎯 Integrated job recommendations completed with all agent insights")

            return {
                "recommendation_score": 0.85,  # High confidence with all agents
                "analysis_complete": True,
                "integrated_recommendation": integrated_recommendation,
                "next_step": "complete",
            }

        except Exception as e:
            logger.error(f"Error in integrated recommendations: {e}")
            return {
                "recommendation_score": 0.5,
                "analysis_complete": True,
                "integrated_recommendation": {
                    "error": str(e),
                    "partial_analysis": {
                        "mai_insights": state.get("mai_resume_insights", ""),
                        "lauren_analysis": state.get("lauren_analysis", ""),
                        "marcus_data": state.get("marcus_market_data", ""),
                    },
                },
                "next_step": "complete",
            }

    def _route_initial(self, state: JobRecommendationState) -> str:
        """Initial routing to Mai for resume analysis"""
        return "mai_resume_analysis"


def create_job_recommendation_workflow() -> JobRecommendationWorkflow:
    """
    Factory function to create a job recommendation workflow integrated with climate career agents

    Returns:
        JobRecommendationWorkflow: Configured workflow instance with agent integrations
    """
    try:
        workflow = JobRecommendationWorkflow()
        logger.info(
            "✅ Job recommendation workflow with climate career agents created successfully"
        )
        return workflow

    except Exception as e:
        logger.error(f"Failed to create job recommendation workflow: {e}")
        raise


# Create singleton instance for LangGraph export
_workflow_instance = None


def get_workflow_instance() -> JobRecommendationWorkflow:
    """Get or create singleton workflow instance"""
    global _workflow_instance
    if _workflow_instance is None:
        try:
            _workflow_instance = create_job_recommendation_workflow()
        except Exception as e:
            logger.error(f"Error creating job recommendation workflow instance: {e}")
            raise
    return _workflow_instance


# Export for LangGraph
job_recommendation_graph = get_workflow_instance().graph

# Also export as 'graph' for LangGraph compatibility
graph = job_recommendation_graph

# Export main classes and functions
__all__ = [
    "JobRecommendationWorkflow",
    "JobRecommendationState",
    "create_job_recommendation_workflow",
    "job_recommendation_graph",
    "graph",
]
