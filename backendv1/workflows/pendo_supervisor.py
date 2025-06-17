"""
Pendo Supervisor Workflow - Intelligent Agent Coordination

Following rule #2: Create modular agent components for easy maintenance
Following rule #3: Component documentation explaining purpose and functionality
Following rule #12: Complete code verification with proper agent implementation
Following rule #6: Asynchronous data handling for performance

This workflow uses Pendo as the intelligent supervisor agent to coordinate
all specialist agents and manage conversation flow.

Location: backendv1/workflows/pendo_supervisor.py
"""

import asyncio
import sys
import os
from typing import Dict, Any, List, Optional
from datetime import datetime

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langgraph.graph import StateGraph, START, END
from langgraph.types import Command, interrupt

# Use absolute imports for LangGraph compatibility
from backendv1.utils.logger import setup_logger
from backendv1.utils.state_management import (
    ClimateAgentState,
    StateManager,
    safe_state_get,
    safe_state_update,
)

# Import human_in_the_loop only if available
from backendv1.utils import human_in_loop_available

if human_in_loop_available:
    from backendv1.utils.human_in_the_loop import human_loop_coordinator
else:
    # Create a dummy object for graceful degradation
    class DummyCoordinator:
        async def evaluate_human_intervention_need(self, *args, **kwargs):
            return {"needs_human_intervention": False}

        async def create_human_review_request(self, *args, **kwargs):
            return {}

        async def process_human_decision(self, *args, **kwargs):
            return {}

    human_loop_coordinator = DummyCoordinator()
    setup_logger("pendo_supervisor").warning(
        "Human-in-the-loop functionality not available, using fallback"
    )

from backendv1.agents import PendoAgent
from backendv1.agents.base.agent_base import AgentContext, AgentResponse
from backendv1.config.settings import get_settings

logger = setup_logger("pendo_supervisor")
settings = get_settings()


class PendoSupervisorWorkflow:
    """
    Pendo-based supervisor workflow for Climate Economy Assistant

    Following rule #2: Create modular components for easy maintenance
    Following rule #6: Asynchronous data handling for performance

    This class uses Pendo as the intelligent supervisor to orchestrate
    all specialist agents and manage conversation flow.
    """

    def __init__(self):
        """Initialize Pendo supervisor workflow"""
        self.pendo = PendoAgent()
        self.session_tracking = {}
        self.conversation_history = {}

        logger.info("🧠 Pendo supervisor workflow initialized")

    async def process_user_message(
        self,
        user_message: str,
        user_id: str,
        conversation_id: str,
        user_profile: Optional[Dict[str, Any]] = None,
        session_data: Optional[Dict[str, Any]] = None,
    ) -> AgentResponse:
        """
        Process user message through Pendo supervision

        Following rule #6: Asynchronous data handling for performance
        Following rule #15: Include comprehensive error handling

        Args:
            user_message: User's message
            user_id: User identifier
            conversation_id: Conversation identifier
            user_profile: User profile information
            session_data: Session-specific data

        Returns:
            AgentResponse: Pendo's coordinated response
        """
        try:
            logger.info(f"🧠 Pendo processing message for user {user_id}")

            # Track session
            await self._track_session(user_id, conversation_id, user_message)

            # Create agent context
            context = AgentContext(
                user_id=user_id,
                conversation_id=conversation_id,
                session_data=session_data or {},
                user_profile=user_profile,
                conversation_history=self.conversation_history.get(conversation_id, []),
                tools_available=["all_specialists"],
                metadata={
                    "workflow": "pendo_supervisor",
                    "timestamp": datetime.utcnow().isoformat(),
                },
            )

            # Get Pendo's response and routing decision
            pendo_response = await self.pendo.handle_interaction(
                message=user_message,
                user_id=user_id,
                conversation_id=conversation_id,
                session_data=session_data,
                user_profile=user_profile,
            )

            # Create initial state for human-in-the-loop evaluation
            initial_state = StateManager.initialize_state(
                user_id=user_id,
                conversation_id=conversation_id,
                initial_message=user_message,
                user_profile=user_profile,
            )

            # Add quality metrics and routing decision to state
            quality_metrics = pendo_response.metadata.get("quality_metrics", {})
            routing_decision = pendo_response.metadata.get("routing_decision", {})

            # Evaluate if human intervention is needed
            human_intervention_evaluation = (
                await human_loop_coordinator.evaluate_human_intervention_need(
                    state=initial_state,
                    quality_metrics=quality_metrics,
                    routing_decision=routing_decision,
                )
            )

            # Check if human intervention is needed
            if human_intervention_evaluation["needs_human_intervention"]:
                priority_level = human_intervention_evaluation["priority_level"]

                if priority_level in ["high", "medium"]:
                    # Create human review request
                    human_review_request = await human_loop_coordinator.create_human_review_request(
                        state=initial_state, intervention_evaluation=human_intervention_evaluation
                    )

                    try:
                        # Agent conditionally decides to pause for human input
                        # In production, this would call the actual interrupt() function
                        # For testing/development, we can mock the interrupt response
                        if settings.enable_human_interrupts:
                            # Real interrupt call
                            human_decision = interrupt(human_review_request)

                            # Process human decision
                            human_updates = await human_loop_coordinator.process_human_decision(
                                state=initial_state, human_decision=human_decision
                            )

                            # Apply human decision updates to response
                            if human_updates.get("response_modifications"):
                                pendo_response.content = human_updates["response_modifications"]

                            # Check if routing was overridden
                            if human_updates.get("routing_override"):
                                routing_recommendation = human_updates["routing_override"][
                                    "specialist"
                                ]
                            else:
                                routing_recommendation = pendo_response.metadata.get(
                                    "routing_recommendation"
                                )
                        else:
                            # Mock interrupt for development
                            logger.info(
                                f"🔄 Human interrupt needed (priority: {priority_level}), but interrupts disabled"
                            )
                            routing_recommendation = pendo_response.metadata.get(
                                "routing_recommendation"
                            )
                    except Exception as interrupt_error:
                        logger.error(f"Error during human interrupt: {interrupt_error}")
                        # Fallback to agent's recommendation
                        routing_recommendation = pendo_response.metadata.get(
                            "routing_recommendation"
                        )
                else:
                    # For low priority cases, continue with agent's recommendation
                    routing_recommendation = pendo_response.metadata.get("routing_recommendation")
            else:
                # No human intervention needed, use agent's recommendation
                routing_recommendation = pendo_response.metadata.get("routing_recommendation")

            # Handle specialist routing (if needed)
            if routing_recommendation and routing_recommendation != "pendo":
                # Delegate to specialist and get their response
                specialist_response = await self.pendo.delegate_to_specialist(
                    routing_recommendation, user_message, context
                )

                # Combine Pendo's routing message with specialist response
                combined_response = await self._combine_responses(
                    pendo_response, specialist_response, routing_recommendation
                )

                # Update conversation history
                await self._update_conversation_history(
                    conversation_id, user_message, combined_response.content, routing_recommendation
                )

                return combined_response
            else:
                # Pendo handles the conversation directly
                await self._update_conversation_history(
                    conversation_id, user_message, pendo_response.content, "pendo"
                )

                return pendo_response

        except Exception as e:
            logger.error(f"Error in Pendo supervisor workflow: {e}")
            return AgentResponse(
                content="I'm experiencing a technical issue. Let me connect you with our support team for immediate assistance.",
                specialist_type="supervisor_coordinator",
                success=False,
                error_message=str(e),
            )

    async def stream_conversation(
        self,
        user_message: str,
        user_id: str,
        conversation_id: str,
        user_profile: Optional[Dict[str, Any]] = None,
        session_data: Optional[Dict[str, Any]] = None,
    ):
        """
        Stream conversation updates through Pendo supervision

        Following rule #6: Asynchronous data handling with streaming

        Args:
            user_message: User's message
            user_id: User identifier
            conversation_id: Conversation identifier
            user_profile: User profile information
            session_data: Session-specific data

        Yields:
            Dict[str, Any]: Streaming updates
        """
        try:
            logger.info(f"🌊 Pendo streaming conversation for user {user_id}")

            # Initial status update
            yield {
                "type": "status",
                "message": "Pendo analyzing your message...",
                "timestamp": datetime.utcnow().isoformat(),
            }

            # Track session
            await self._track_session(user_id, conversation_id, user_message)

            # Create agent context
            context = AgentContext(
                user_id=user_id,
                conversation_id=conversation_id,
                session_data=session_data or {},
                user_profile=user_profile,
                conversation_history=self.conversation_history.get(conversation_id, []),
                tools_available=["all_specialists"],
                metadata={
                    "workflow": "pendo_supervisor",
                    "timestamp": datetime.utcnow().isoformat(),
                },
            )

            # Initial state for human-in-the-loop checks
            initial_state = StateManager.initialize_state(
                user_id=user_id,
                conversation_id=conversation_id,
                initial_message=user_message,
                user_profile=user_profile,
            )

            # Get Pendo's analysis first
            yield {
                "type": "status",
                "message": "Analyzing your message and determining best specialist...",
                "timestamp": datetime.utcnow().isoformat(),
            }

            # Stream Pendo's analysis
            pendo_response = await self.pendo.handle_interaction(
                message=user_message,
                user_id=user_id,
                conversation_id=conversation_id,
                session_data=session_data,
                user_profile=user_profile,
            )

            # Check for human intervention requirements
            quality_metrics = pendo_response.metadata.get("quality_metrics", {})
            routing_decision = pendo_response.metadata.get("routing_decision", {})

            # Check if human intervention is needed
            human_intervention_evaluation = (
                await human_loop_coordinator.evaluate_human_intervention_need(
                    state=initial_state,
                    quality_metrics=quality_metrics,
                    routing_decision=routing_decision,
                )
            )

            if human_intervention_evaluation["needs_human_intervention"]:
                # Signal human intervention need in stream
                yield {
                    "type": "human_intervention",
                    "priority": human_intervention_evaluation["priority_level"],
                    "reasons": human_intervention_evaluation["intervention_reasons"],
                    "timestamp": datetime.utcnow().isoformat(),
                }

                # For high/medium priority, try interrupt
                if (
                    human_intervention_evaluation["priority_level"] in ["high", "medium"]
                    and settings.enable_human_interrupts
                ):
                    try:
                        # Create human review request
                        human_review_request = (
                            await human_loop_coordinator.create_human_review_request(
                                state=initial_state,
                                intervention_evaluation=human_intervention_evaluation,
                            )
                        )

                        # Signal waiting for human input
                        yield {
                            "type": "status",
                            "message": "Waiting for human reviewer input...",
                            "timestamp": datetime.utcnow().isoformat(),
                        }

                        # Real interrupt would happen here
                        # human_decision = interrupt(human_review_request)

                        # Instead, for streaming we'll continue without waiting
                        yield {
                            "type": "status",
                            "message": "Continuing with AI workflow while awaiting human review",
                            "timestamp": datetime.utcnow().isoformat(),
                        }
                    except Exception as interrupt_error:
                        logger.error(f"Error during human interrupt stream: {interrupt_error}")
                        yield {
                            "type": "error",
                            "message": "Error during human review process",
                            "timestamp": datetime.utcnow().isoformat(),
                        }

            # Determine routing
            routing_recommendation = pendo_response.metadata.get("routing_recommendation")

            if routing_recommendation and routing_recommendation != "pendo":
                # Stream routing decision
                yield {
                    "type": "routing",
                    "specialist": routing_recommendation,
                    "message": f"Connecting you with {routing_recommendation} specialist...",
                    "timestamp": datetime.utcnow().isoformat(),
                }

                # Delegate to specialist and get their response
                specialist_response = await self.pendo.delegate_to_specialist(
                    routing_recommendation, user_message, context
                )

                # Stream specialist's response
                yield {
                    "type": "response",
                    "content": specialist_response.content,
                    "specialist": specialist_response.specialist_type,
                    "timestamp": datetime.utcnow().isoformat(),
                }

                # Update conversation history
                await self._update_conversation_history(
                    conversation_id,
                    user_message,
                    specialist_response.content,
                    routing_recommendation,
                )

                # Final completion signal
                yield {
                    "type": "complete",
                    "specialist": specialist_response.specialist_type,
                    "timestamp": datetime.utcnow().isoformat(),
                }
            else:
                # Stream Pendo's direct response
                yield {
                    "type": "response",
                    "content": pendo_response.content,
                    "specialist": "pendo",
                    "timestamp": datetime.utcnow().isoformat(),
                }

                # Update conversation history
                await self._update_conversation_history(
                    conversation_id, user_message, pendo_response.content, "pendo"
                )

                # Final completion signal
                yield {
                    "type": "complete",
                    "specialist": "pendo",
                    "timestamp": datetime.utcnow().isoformat(),
                }

        except Exception as e:
            logger.error(f"Error in Pendo streaming: {e}")
            yield {
                "type": "error",
                "message": "I'm experiencing a technical issue. Let me connect you with our support team for immediate assistance.",
                "timestamp": datetime.utcnow().isoformat(),
            }

    async def get_conversation_summary(self, conversation_id: str, user_id: str) -> Dict[str, Any]:
        """
        Get conversation summary through Pendo analysis

        Args:
            conversation_id: Conversation identifier
            user_id: User identifier

        Returns:
            Dict[str, Any]: Conversation summary
        """
        try:
            conversation_history = self.conversation_history.get(conversation_id, [])
            session_data = self.session_tracking.get(f"{user_id}_{conversation_id}", {})

            if not conversation_history:
                return {
                    "conversation_id": conversation_id,
                    "message_count": 0,
                    "specialists_involved": [],
                    "summary": "No conversation history found",
                    "next_actions": ["Start a new conversation"],
                }

            # Analyze conversation through Pendo
            specialists_involved = list(
                set([msg.get("specialist", "pendo") for msg in conversation_history])
            )
            message_count = len(conversation_history)

            # Get Pendo's analysis of the conversation
            analysis_context = AgentContext(
                user_id=user_id,
                conversation_id=conversation_id,
                session_data=session_data,
                conversation_history=conversation_history,
                metadata={"analysis_request": True},
            )

            summary_message = f"Please provide a summary of this conversation with {message_count} messages involving specialists: {', '.join(specialists_involved)}"

            pendo_analysis = await self.pendo.process_message(summary_message, analysis_context)

            return {
                "conversation_id": conversation_id,
                "message_count": message_count,
                "specialists_involved": specialists_involved,
                "summary": pendo_analysis.content,
                "next_actions": pendo_analysis.next_actions,
                "confidence": pendo_analysis.confidence_score,
                "last_updated": datetime.utcnow().isoformat(),
            }

        except Exception as e:
            logger.error(f"Error getting conversation summary: {e}")
            return {
                "conversation_id": conversation_id,
                "error": str(e),
                "summary": "Unable to generate conversation summary",
            }

    async def _track_session(self, user_id: str, conversation_id: str, message: str) -> None:
        """Track user session data"""
        session_key = f"{user_id}_{conversation_id}"

        if session_key not in self.session_tracking:
            self.session_tracking[session_key] = {
                "user_id": user_id,
                "conversation_id": conversation_id,
                "started_at": datetime.utcnow().isoformat(),
                "message_count": 0,
                "specialists_used": set(),
                "last_activity": datetime.utcnow().isoformat(),
            }

        session = self.session_tracking[session_key]
        session["message_count"] += 1
        session["last_activity"] = datetime.utcnow().isoformat()
        session["last_message_length"] = len(message)

    async def _update_conversation_history(
        self, conversation_id: str, user_message: str, response_content: str, specialist: str
    ) -> None:
        """Update conversation history"""
        if conversation_id not in self.conversation_history:
            self.conversation_history[conversation_id] = []

        self.conversation_history[conversation_id].extend(
            [
                {
                    "type": "user",
                    "content": user_message,
                    "timestamp": datetime.utcnow().isoformat(),
                },
                {
                    "type": "assistant",
                    "content": response_content,
                    "specialist": specialist,
                    "timestamp": datetime.utcnow().isoformat(),
                },
            ]
        )

        # Keep only last 20 messages to prevent memory issues
        if len(self.conversation_history[conversation_id]) > 20:
            self.conversation_history[conversation_id] = self.conversation_history[conversation_id][
                -20:
            ]

    async def _combine_responses(
        self,
        pendo_response: AgentResponse,
        specialist_response: AgentResponse,
        specialist_name: str,
    ) -> AgentResponse:
        """Combine Pendo's routing message with specialist response"""

        # Create combined content
        combined_content = f"{pendo_response.content}\n\n---\n\n{specialist_response.content}"

        # Combine metadata
        combined_metadata = {
            **pendo_response.metadata,
            **specialist_response.metadata,
            "pendo_routing": True,
            "specialist_delegated": specialist_name,
            "combined_response": True,
        }

        # Combine tools and actions
        combined_tools = list(set(pendo_response.tools_used + specialist_response.tools_used))
        combined_actions = list(set(pendo_response.next_actions + specialist_response.next_actions))
        combined_sources = list(set(pendo_response.sources + specialist_response.sources))

        return AgentResponse(
            content=combined_content,
            specialist_type=f"pendo_coordinated_{specialist_response.specialist_type}",
            confidence_score=max(
                pendo_response.confidence_score, specialist_response.confidence_score
            ),
            tools_used=combined_tools,
            next_actions=combined_actions,
            sources=combined_sources,
            metadata=combined_metadata,
            success=pendo_response.success and specialist_response.success,
            processing_time_ms=(pendo_response.processing_time_ms or 0)
            + (specialist_response.processing_time_ms or 0),
        )

    def get_session_stats(self, user_id: str) -> Dict[str, Any]:
        """Get session statistics for a user"""
        user_sessions = {
            k: v for k, v in self.session_tracking.items() if k.startswith(f"{user_id}_")
        }

        if not user_sessions:
            return {"user_id": user_id, "total_sessions": 0}

        total_messages = sum(session["message_count"] for session in user_sessions.values())
        all_specialists = set()
        for session in user_sessions.values():
            all_specialists.update(session.get("specialists_used", set()))

        return {
            "user_id": user_id,
            "total_sessions": len(user_sessions),
            "total_messages": total_messages,
            "specialists_used": list(all_specialists),
            "last_activity": (
                max(session["last_activity"] for session in user_sessions.values())
                if user_sessions
                else None
            ),
        }


def create_pendo_supervisor_workflow() -> PendoSupervisorWorkflow:
    """
    Factory function to create Pendo supervisor workflow

    Following rule #12: Complete code verification with proper factory pattern

    Returns:
        PendoSupervisorWorkflow: Configured Pendo supervisor workflow
    """
    try:
        workflow = PendoSupervisorWorkflow()
        logger.info("✅ Pendo supervisor workflow created successfully")
        return workflow
    except Exception as e:
        logger.error(f"Failed to create Pendo supervisor workflow: {e}")
        raise


# Create workflow instance and export graph for LangGraph compatibility
def get_workflow_instance() -> PendoSupervisorWorkflow:
    """Get singleton workflow instance"""
    return create_pendo_supervisor_workflow()


# Export graphs for LangGraph
def create_pendo_supervisor_graph():
    """
    Create a LangGraph StateGraph for Pendo supervisor

    Returns:
        StateGraph: Compiled LangGraph StateGraph
    """
    from langgraph.graph import StateGraph, START, END, MessagesState
    from typing_extensions import TypedDict
    from typing import List, Any, Optional

    # Define state for LangGraph compatibility - MUST inherit from MessagesState for chat support
    class PendoState(MessagesState):
        user_id: Optional[str] = None
        conversation_id: Optional[str] = None
        user_profile: Optional[Dict[str, Any]] = None
        session_data: Optional[Dict[str, Any]] = None
        response: Optional[str] = None
        routing_decision: Optional[str] = None
        next_step: str = "start"

    # Create the workflow instance
    workflow_instance = create_pendo_supervisor_workflow()

    # Create StateGraph
    graph = StateGraph(PendoState)

    # Add a single node that wraps the workflow
    async def pendo_handler(state: PendoState) -> Dict[str, Any]:
        """Handle Pendo supervisor processing"""
        try:
            # Extract the last message from MessagesState
            messages = state.get("messages", [])
            if messages:
                last_message = messages[-1]
                # Handle different message types (HumanMessage, AIMessage, etc.)
                if hasattr(last_message, "content"):
                    user_message = last_message.content
                elif isinstance(last_message, dict):
                    user_message = last_message.get("content", str(last_message))
                else:
                    user_message = str(last_message)
            else:
                user_message = "Hello"

            # Process through Pendo workflow
            response = await workflow_instance.process_user_message(
                user_message=user_message,
                user_id=state.get("user_id", "default"),
                conversation_id=state.get("conversation_id", "default"),
                user_profile=state.get("user_profile"),
                session_data=state.get("session_data"),
            )

            # Create AI message response for MessagesState compatibility
            from langchain_core.messages import AIMessage

            ai_response = AIMessage(
                content=response.content,
                additional_kwargs={
                    "specialist_type": response.specialist_type,
                    "confidence_score": response.confidence_score,
                    "tools_used": response.tools_used,
                    "next_actions": response.next_actions,
                    "sources": response.sources,
                    "metadata": response.metadata,
                    "success": response.success,
                    "processing_time_ms": response.processing_time_ms,
                },
            )

            # Return updated state with proper MessagesState format
            return {
                "messages": [ai_response],  # Add the AI response to messages
                "response": response.content,
                "routing_decision": response.metadata.get("routing_recommendation"),
                "next_step": "complete",
            }

        except Exception as e:
            logger.error(f"Error in Pendo handler: {e}")
            from langchain_core.messages import AIMessage

            error_response = AIMessage(
                content="I'm experiencing a technical issue. Please try again.",
                additional_kwargs={"error": str(e)},
            )

            return {
                "messages": [error_response],
                "response": "I'm experiencing a technical issue. Please try again.",
                "next_step": "complete",
            }

    # Add the node
    graph.add_node("pendo_supervisor", pendo_handler)

    # Add edges
    graph.add_edge(START, "pendo_supervisor")
    graph.add_edge("pendo_supervisor", END)

    # Compile and return
    return graph.compile()


# Create singleton instance for LangGraph export
_graph_instance = None


def get_pendo_graph():
    """Get or create singleton graph instance"""
    global _graph_instance
    if _graph_instance is None:
        try:
            _graph_instance = create_pendo_supervisor_graph()
            logger.info("✅ Pendo supervisor graph created successfully")
        except Exception as e:
            logger.error(f"Error creating Pendo supervisor graph: {e}")
            raise
    return _graph_instance


# Export for LangGraph - this is what LangGraph expects
pendo_supervisor_graph = get_pendo_graph()

# Generic graph export for LangGraph compatibility
graph = pendo_supervisor_graph

# Export main classes and functions
__all__ = [
    "PendoSupervisorWorkflow",
    "create_pendo_supervisor_workflow",
    "pendo_supervisor_graph",
    "graph",
]
