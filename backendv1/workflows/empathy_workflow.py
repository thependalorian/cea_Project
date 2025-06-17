"""
Empathy Workflow with Alex Agent Integration

Following rule #3: Component documentation - This workflow provides emotional support
Following rule #6: Asynchronous data handling for performance
Following rule #12: Complete code verification with proper error handling

Enhanced with LLM-based emotional assessment instead of hardcoded keywords.
Location: backendv1/workflows/empathy_workflow.py
"""

import asyncio
from enum import Enum
from typing import Dict, Any, List, Optional, Literal, TypedDict, Annotated
from datetime import datetime
from pydantic import BaseModel, Field

from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage

from backendv1.utils.logger import setup_logger
from backendv1.adapters.openai_adapter import get_openai_client
from backendv1.config.settings import get_settings

logger = setup_logger("empathy_workflow")
settings = get_settings()


class EmotionalState(str, Enum):
    """Emotional state classification"""

    CRISIS = "crisis"
    DISTRESSED = "distressed"
    ANXIOUS = "anxious"
    NEUTRAL = "neutral"
    POSITIVE = "positive"


class EmpathyState(TypedDict):
    """State for empathy workflow - LangGraph compatible"""

    messages: Annotated[List[BaseMessage], add_messages]
    user_id: Optional[str]
    session_id: Optional[str]
    emotional_state: str
    crisis_detected: bool
    empathy_level: str
    needs_human_escalation: bool
    support_provided: bool
    action_plan: Optional[Dict[str, Any]]
    alex_response: Optional[str]
    next_step: str


class EmpathyWorkflow:
    """
    Empathy workflow implementation fully integrated with Alex Agent

    This workflow orchestrates Alex Agent for all empathy responses,
    providing crisis detection and human escalation when needed.

    Enhanced with LLM-based reasoning to avoid user misclassification.
    """

    def __init__(self):
        """Initialize empathy workflow with Alex Agent integration"""
        logger.info("Initializing empathy workflow with Alex Agent integration")
        self.alex_agent = None
        self._initialize_alex_agent()
        self.graph = self._create_workflow_graph()

    def _initialize_alex_agent(self):
        """Initialize Alex Agent for empathy responses"""
        try:
            from backendv1.agents.alex import AlexAgent
            from backendv1.agents.base.agent_base import AgentContext

            self.alex_agent = AlexAgent("Alex", "empathy_specialist")
            self.agent_context_class = AgentContext
            logger.info("✅ Alex Agent initialized for empathy workflow")

        except ImportError as e:
            logger.warning(f"Could not import Alex Agent: {e}")
            self.alex_agent = None

    def _create_workflow_graph(self) -> StateGraph:
        """Create empathy workflow graph with Alex Agent integration"""
        # Create workflow graph
        workflow = StateGraph(EmpathyState)

        # Add nodes - all empathy responses go through Alex Agent
        workflow.add_node("emotional_assessment", self._emotional_assessment)
        workflow.add_node("alex_empathy_response", self._alex_empathy_response)
        workflow.add_node("crisis_escalation", self._crisis_escalation)
        workflow.add_node("action_planning", self._action_planning_with_alex)

        # Define conditional edges
        workflow.add_conditional_edges(
            START, self._route_initial, {"emotional_assessment": "emotional_assessment"}
        )

        workflow.add_conditional_edges(
            "emotional_assessment",
            self._route_after_assessment,
            {
                "alex_empathy_response": "alex_empathy_response",
                "crisis_escalation": "crisis_escalation",
            },
        )

        workflow.add_edge("alex_empathy_response", "action_planning")
        workflow.add_edge("crisis_escalation", "action_planning")
        workflow.add_edge("action_planning", END)

        # Compile the graph
        return workflow.compile()

    async def _emotional_assessment(self, state: EmpathyState) -> Dict[str, Any]:
        """
        Assess emotional state using LLM reasoning instead of keyword matching

        This approach uses the LLM to understand emotional context, tone, and nuance
        rather than relying on hardcoded keywords that can misclassify users.
        """
        try:
            # Extract latest message for analysis
            messages = state.get("messages", [])
            latest_message = ""

            if messages:
                for msg in reversed(messages):
                    if isinstance(msg, dict) and msg.get("role") == "user":
                        latest_message = msg.get("content", "")
                        break
                    elif hasattr(msg, "type") and msg.type == "human":
                        latest_message = msg.content
                        break
                    elif isinstance(msg, HumanMessage):
                        latest_message = msg.content
                        break

            # Use LLM for emotional assessment
            try:
                from langchain_core.prompts import ChatPromptTemplate
                from langchain_core.output_parsers import PydanticOutputParser
                from langchain_openai import ChatOpenAI

                class EmotionalAssessment(BaseModel):
                    emotional_state: Literal[
                        "crisis", "distressed", "anxious", "neutral", "positive"
                    ] = Field(description="Primary emotional state detected in the message")
                    crisis_detected: bool = Field(
                        description="Whether immediate crisis intervention is needed"
                    )
                    empathy_level: Literal[
                        "crisis", "high", "moderate", "standard", "supportive"
                    ] = Field(description="Level of empathetic support needed")
                    reasoning: str = Field(
                        description="Brief explanation of the emotional assessment"
                    )
                    urgency_score: float = Field(
                        description="Urgency score from 0.0 to 1.0", ge=0.0, le=1.0
                    )

                parser = PydanticOutputParser(pydantic_object=EmotionalAssessment)

                prompt = ChatPromptTemplate.from_messages(
                    [
                        (
                            "system",
                            """You are an expert emotional intelligence specialist analyzing user messages for empathy workflow routing.

Assess the emotional state and crisis risk level:

CRISIS (immediate intervention needed):
- Explicit self-harm ideation or suicidal thoughts
- Expressions of hopelessness with no future perspective
- Immediate danger to self or others

DISTRESSED (high empathy needed):
- Severe emotional distress or breakdown
- Overwhelming anxiety or panic
- Major life crisis or trauma

ANXIOUS (moderate empathy needed):
- Worry, uncertainty, or nervousness
- Career-related stress or concerns
- General anxiety about decisions

NEUTRAL (standard empathy):
- Calm, matter-of-fact communication
- Information seeking without emotional distress

POSITIVE (supportive empathy):
- Excitement, confidence, or optimism
- Positive outlook with support needs

Consider context, tone, and implicit emotional indicators - not just keywords.

{format_instructions}""",
                        ),
                        ("human", "User message: {message}"),
                    ]
                )

                llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0.1)
                chain = prompt | llm | parser

                assessment = await chain.ainvoke(
                    {
                        "message": latest_message,
                        "format_instructions": parser.get_format_instructions(),
                    }
                )

                logger.info(
                    f"🔍 LLM Emotional assessment: {assessment.emotional_state}, Crisis: {assessment.crisis_detected}, Empathy level: {assessment.empathy_level}"
                )

                return {
                    "emotional_state": assessment.emotional_state,
                    "crisis_detected": assessment.crisis_detected,
                    "empathy_level": assessment.empathy_level,
                    "reasoning": assessment.reasoning,
                    "urgency_score": assessment.urgency_score,
                    "assessment_method": "llm_reasoning",
                    "next_step": "assessment_complete",
                }

            except Exception as llm_error:
                logger.warning(f"LLM emotional assessment failed: {llm_error}")
                # Fallback to conservative assessment
                return {
                    "emotional_state": "neutral",
                    "crisis_detected": False,
                    "empathy_level": "standard",
                    "reasoning": "Unable to assess emotional state, providing standard support",
                    "urgency_score": 0.5,
                    "assessment_method": "fallback",
                    "next_step": "assessment_complete",
                }

        except Exception as e:
            logger.error(f"Error in emotional assessment: {e}")
            return {
                "emotional_state": "neutral",
                "crisis_detected": False,
                "empathy_level": "standard",
                "reasoning": "Assessment error, providing standard support",
                "urgency_score": 0.5,
                "assessment_method": "error_fallback",
                "next_step": "assessment_complete",
            }

    async def _alex_empathy_response(self, state: EmpathyState) -> Dict[str, Any]:
        """Get empathy response from Alex Agent"""
        try:
            if not self.alex_agent:
                logger.warning("Alex Agent not available, providing fallback response")
                return {
                    "alex_response": "I understand you're going through a difficult time. I'm here to support you.",
                    "support_provided": True,
                    "next_step": "empathy_provided",
                }

            # Extract user message
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

            # Create context for Alex Agent with emotional state info
            context = self.agent_context_class(
                user_id=state.get("user_id", "anonymous"),
                session_id=state.get("session_id", "empathy_session"),
                conversation_history=messages,
                metadata={
                    "emotional_state": state.get("emotional_state", "neutral"),
                    "empathy_level": state.get("empathy_level", "standard"),
                    "workflow_context": "empathy_support",
                },
            )

            # Get Alex's empathetic response
            alex_response = await self.alex_agent.process_message(user_message, context)
            alex_content = (
                alex_response.content if hasattr(alex_response, "content") else str(alex_response)
            )

            logger.info("💚 Empathy response provided via Alex Agent")

            return {
                "alex_response": alex_content,
                "support_provided": True,
                "next_step": "empathy_provided",
            }

        except Exception as e:
            logger.error(f"Error getting Alex empathy response: {e}")
            return {
                "alex_response": "I'm here to support you through this. Let's work together to find a path forward.",
                "support_provided": True,
                "next_step": "empathy_provided",
            }

    async def _crisis_escalation(self, state: EmpathyState) -> Dict[str, Any]:
        """Handle crisis escalation with Alex Agent and human intervention"""
        try:
            if not self.alex_agent:
                logger.warning("Alex Agent not available for crisis support")
                return {
                    "alex_response": "I'm concerned about you and want to help. Please consider reaching out to a crisis helpline: 988 (Suicide & Crisis Lifeline).",
                    "needs_human_escalation": True,
                    "support_provided": True,
                    "next_step": "crisis_handled",
                }

            # Extract user message
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

            # Create crisis context for Alex Agent
            context = self.agent_context_class(
                user_id=state.get("user_id", "anonymous"),
                session_id=state.get("session_id", "empathy_session"),
                conversation_history=messages,
                metadata={
                    "emotional_state": "crisis",
                    "empathy_level": "crisis",
                    "crisis_detected": True,
                    "workflow_context": "crisis_intervention",
                },
            )

            # Get Alex's crisis intervention response
            crisis_message = f"CRISIS INTERVENTION NEEDED: {user_message}"
            alex_response = await self.alex_agent.process_message(crisis_message, context)
            alex_content = (
                alex_response.content if hasattr(alex_response, "content") else str(alex_response)
            )

            logger.warning("🚨 Crisis escalation handled via Alex Agent with human escalation")

            return {
                "alex_response": alex_content,
                "needs_human_escalation": True,
                "support_provided": True,
                "next_step": "crisis_handled",
            }

        except Exception as e:
            logger.error(f"Error in crisis escalation: {e}")
            return {
                "alex_response": "I'm very concerned about you. Please reach out for immediate help: 988 (Suicide & Crisis Lifeline) or go to your nearest emergency room.",
                "needs_human_escalation": True,
                "support_provided": True,
                "next_step": "crisis_handled",
            }

    async def _action_planning_with_alex(self, state: EmpathyState) -> Dict[str, Any]:
        """Create action plan with Alex Agent's guidance"""
        try:
            if not self.alex_agent:
                # Fallback action plan
                return {
                    "action_plan": {
                        "immediate_steps": ["Take deep breaths", "Reach out to support network"],
                        "resources": ["Crisis helpline: 988", "Local mental health services"],
                        "follow_up": "Check in within 24 hours",
                    },
                    "next_step": "complete",
                }

            # Create context for action planning
            context = self.agent_context_class(
                user_id=state.get("user_id", "anonymous"),
                session_id=state.get("session_id", "empathy_session"),
                conversation_history=state.get("messages", []),
                metadata={
                    "emotional_state": state.get("emotional_state", "neutral"),
                    "empathy_level": state.get("empathy_level", "standard"),
                    "crisis_detected": state.get("crisis_detected", False),
                    "workflow_context": "action_planning",
                },
            )

            # Get action plan from Alex
            planning_message = (
                "Please provide a supportive action plan and next steps for moving forward."
            )
            alex_response = await self.alex_agent.process_message(planning_message, context)
            alex_content = (
                alex_response.content if hasattr(alex_response, "content") else str(alex_response)
            )

            # Create structured action plan
            action_plan = {
                "alex_guidance": alex_content,
                "emotional_state": state.get("emotional_state", "neutral"),
                "support_level": state.get("empathy_level", "standard"),
                "crisis_escalation": state.get("needs_human_escalation", False),
                "timestamp": datetime.utcnow().isoformat(),
            }

            logger.info("📋 Action plan created with Alex Agent guidance")

            return {"action_plan": action_plan, "next_step": "complete"}

        except Exception as e:
            logger.error(f"Error in action planning: {e}")
            return {
                "action_plan": {
                    "guidance": "Take things one step at a time and remember that support is available.",
                    "resources": ["Crisis helpline: 988", "Local mental health services"],
                    "follow_up": "Continue seeking support as needed",
                },
                "next_step": "complete",
            }

    def _route_initial(self, state: EmpathyState) -> str:
        """Initial routing to emotional assessment"""
        return "emotional_assessment"

    def _route_after_assessment(self, state: EmpathyState) -> str:
        """Route after emotional assessment"""
        if state.get("crisis_detected", False):
            return "crisis_escalation"
        else:
            return "alex_empathy_response"


def create_empathy_workflow() -> EmpathyWorkflow:
    """
    Factory function to create an empathy workflow integrated with Alex Agent

    Returns:
        EmpathyWorkflow: Configured workflow instance with Alex Agent integration
    """
    try:
        workflow = EmpathyWorkflow()
        logger.info("✅ Empathy workflow with Alex Agent integration created successfully")
        return workflow

    except Exception as e:
        logger.error(f"Failed to create empathy workflow: {e}")
        raise


# Create singleton instance for LangGraph export
_workflow_instance = None


def get_workflow_instance() -> EmpathyWorkflow:
    """Get or create singleton workflow instance"""
    global _workflow_instance
    if _workflow_instance is None:
        try:
            _workflow_instance = create_empathy_workflow()
        except Exception as e:
            logger.error(f"Error creating empathy workflow instance: {e}")
            raise
    return _workflow_instance


# Export for LangGraph
empathy_graph = get_workflow_instance().graph

# Also export as 'graph' for LangGraph compatibility
graph = empathy_graph

# Export main classes and functions
__all__ = [
    "EmpathyWorkflow",
    "EmotionalState",
    "EmpathyState",
    "create_empathy_workflow",
    "empathy_graph",
    "graph",
]
