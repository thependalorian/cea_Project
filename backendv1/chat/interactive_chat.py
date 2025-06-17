"""
Interactive Chat Implementation

Following rule #2: Create modular components for easy maintenance
Following rule #3: Component documentation explaining purpose and functionality

This module implements an interactive chat workflow with human-in-the-loop capabilities.
Location: backendv1/chat/interactive_chat.py
"""

import logging
from typing import Dict, Any, List, Optional, Union, Annotated
from datetime import datetime

from langchain_core.messages import BaseMessage, AIMessage, HumanMessage, SystemMessage
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langgraph.types import Command
from typing_extensions import TypedDict

from backendv1.utils.logger import setup_logger
from backendv1.config.settings import get_settings

# Setup logging
logger = setup_logger("interactive_chat")
settings = get_settings()


class ChatState(TypedDict):
    """State for interactive chat workflow - LangGraph compatible"""

    messages: Annotated[List[BaseMessage], add_messages]
    user_id: Optional[str]
    session_id: Optional[str]
    context: Dict[str, Any]
    metadata: Dict[str, Any]
    next_step: str
    waiting_for_human: bool
    human_feedback: Optional[str]
    stream: bool


class InteractiveChat:
    """
    Interactive chat workflow implementation

    Following rule #2: Create modular components for easy maintenance
    Following rule #3: Component documentation explaining purpose and functionality
    """

    def __init__(self):
        """Initialize interactive chat"""
        logger.info("Initializing interactive chat")
        self.graph = self._create_workflow_graph()

    def _create_workflow_graph(self) -> StateGraph:
        """Create interactive chat workflow graph"""
        # Create workflow graph
        workflow = StateGraph(ChatState)

        # Add nodes
        workflow.add_node("process_input", self._process_input)
        workflow.add_node("generate_response", self._generate_response)
        workflow.add_node("human_review", self._human_review)
        workflow.add_node("apply_feedback", self._apply_feedback)

        # Define conditional edges
        workflow.add_conditional_edges(
            START, self._route_initial, {"process_input": "process_input"}
        )

        workflow.add_conditional_edges(
            "process_input",
            self._route_after_processing,
            {"generate_response": "generate_response", "human_review": "human_review"},
        )

        workflow.add_edge("generate_response", END)

        workflow.add_conditional_edges(
            "human_review",
            self._route_after_review,
            {"apply_feedback": "apply_feedback", "END": END},
        )

        workflow.add_edge("apply_feedback", "generate_response")

        # Compile the graph
        return workflow.compile()

    def _process_input(self, state: ChatState) -> Dict[str, Any]:
        """Process user input"""
        # This is a placeholder implementation
        return {
            "metadata": {"processed_at": datetime.utcnow().isoformat(), "sentiment": "neutral"},
            "next_step": "input_processed",
        }

    def _generate_response(self, state: ChatState) -> Dict[str, Any]:
        """Generate AI response"""
        # This is a placeholder implementation

        # Check if we're streaming
        if state.get("stream", False):
            return Command.stream(
                {
                    "messages": [
                        AIMessage(content="This is a streamed response from the interactive chat.")
                    ],
                    "next_step": "response_generated",
                    "waiting_for_human": False,
                }
            )

        # Regular response
        return {
            "messages": [AIMessage(content="This is a response from the interactive chat.")],
            "next_step": "response_generated",
            "waiting_for_human": False,
        }

    def _human_review(self, state: ChatState) -> Dict[str, Any]:
        """Wait for human review"""
        # This is a placeholder implementation

        # Signal that we're waiting for human input
        return Command.interrupt({"waiting_for_human": True, "next_step": "awaiting_human"})

    def _apply_feedback(self, state: ChatState) -> Dict[str, Any]:
        """Apply human feedback"""
        # This is a placeholder implementation
        feedback = state.get("human_feedback", "")

        return {
            "metadata": {
                "feedback_applied": True,
                "feedback": feedback,
                "applied_at": datetime.utcnow().isoformat(),
            },
            "next_step": "feedback_applied",
            "waiting_for_human": False,
        }

    def _route_initial(self, state: ChatState) -> str:
        """Initial routing"""
        return "process_input"

    def _route_after_processing(self, state: ChatState) -> str:
        """Route after processing input"""
        # Example logic: route to human review if we detect a critical question
        messages = state.get("messages", [])
        if messages and isinstance(messages[-1], HumanMessage):
            content = messages[-1].content.lower()
            if "critical" in content or "urgent" in content or "emergency" in content:
                return "human_review"

        return "generate_response"

    def _route_after_review(self, state: ChatState) -> str:
        """Route after human review"""
        if state.get("human_feedback"):
            return "apply_feedback"
        return "END"


def create_interactive_chat() -> InteractiveChat:
    """
    Factory function to create an interactive chat

    Following rule #12: Complete code verification with proper factory pattern

    Returns:
        InteractiveChat: Configured chat instance
    """
    try:
        chat = InteractiveChat()
        logger.info("✅ Interactive chat created successfully")
        return chat

    except Exception as e:
        logger.error(f"Failed to create interactive chat: {e}")
        raise


# Create singleton instance for LangGraph export
_chat_instance = None


def get_chat_instance() -> InteractiveChat:
    """Get or create singleton chat instance"""
    global _chat_instance
    if _chat_instance is None:
        try:
            _chat_instance = create_interactive_chat()
        except Exception as e:
            logger.error(f"Error creating interactive chat instance: {e}")
            raise
    return _chat_instance


# Export for LangGraph - following documentation pattern
chat_graph = get_chat_instance().graph

# Also export as 'graph' for LangGraph compatibility
graph = chat_graph

# Export main classes and functions
__all__ = ["InteractiveChat", "ChatState", "create_interactive_chat", "chat_graph", "graph"]
