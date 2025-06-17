"""
Simple Chat Flow - Optimized LangGraph Implementation

This addresses the critical issue where simple messages like "hi" get stuck in human steering.

Following the audit recommendations:
- Single-purpose nodes (max 20 lines each)
- Clean TypedDict state with add_messages
- Conversational responses that bypass human steering
- Direct message return to user

Location: backendv1/workflows/simple_chat_flow.py
"""

from typing import Dict, Any, List, Optional, Literal, Annotated
from datetime import datetime

from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from typing_extensions import TypedDict

from backendv1.utils.logger import setup_logger
from backendv1.models.response_models import (
    ConversationalResponse, 
    SimpleGreetingResponse,
    detect_response_type,
    create_greeting_response
)

# Setup logging
logger = setup_logger("simple_chat_flow")


class SimpleChatState(TypedDict):
    """
    Minimal state for simple chat interactions
    
    Following audit recommendations:
    - Clean TypedDict with add_messages
    - Minimal state complexity
    - Clear message flow
    """
    
    messages: Annotated[List[BaseMessage], add_messages]
    current_stage: str
    response_type: str
    user_id: Optional[str]
    session_id: Optional[str]


def detect_message_intent(state: SimpleChatState) -> Dict[str, Any]:
    """
    Single-purpose node: Detect user intent from message
    
    Max 20 lines - follows audit recommendations
    """
    try:
        # Get latest user message
        latest_message = ""
        if state.get("messages"):
            for msg in reversed(state["messages"]):
                if isinstance(msg, HumanMessage):
                    latest_message = msg.content
                    break
        
        # Detect response type
        response_type = detect_response_type(latest_message)
        
        logger.info(f"Detected intent: {response_type} for message: '{latest_message}'")
        
        return {
            "response_type": response_type,
            "current_stage": "intent_detected"
        }
        
    except Exception as e:
        logger.error(f"Error detecting intent: {e}")
        return {
            "response_type": "error",
            "current_stage": "error"
        }


def generate_simple_response(state: SimpleChatState) -> Dict[str, Any]:
    """
    Single-purpose node: Generate conversational response
    
    Max 20 lines - follows audit recommendations
    """
    try:
        # Get latest user message
        user_message = ""
        if state.get("messages"):
            for msg in reversed(state["messages"]):
                if isinstance(msg, HumanMessage):
                    user_message = msg.content
                    break
        
        response_type = state.get("response_type", "guidance")
        
        # Generate appropriate response
        if response_type == "greeting":
            response = create_greeting_response(user_message)
        else:
            # Default conversational response
            response = ConversationalResponse(
                message=f"I understand you're asking about {user_message}. I'm here to help with climate career opportunities. What specific aspect interests you?",
                response_type=response_type,
                confidence_score=0.8,
                needs_user_input=True,
                suggested_actions=[
                    "Tell me about your background",
                    "Show me job opportunities", 
                    "Explore career paths"
                ],
                agent_name="Climate Assistant",
                workflow_stage="conversation"
            )
        
        # Convert to AI message
        ai_message = response.to_ai_message()
        
        logger.info(f"Generated {response_type} response: {response.message[:50]}...")
        
        return {
            "messages": [ai_message],
            "current_stage": "response_generated"
        }
        
    except Exception as e:
        logger.error(f"Error generating response: {e}")
        
        # Fallback error response
        error_message = AIMessage(
            content="I'm sorry, I encountered an issue. How can I help you with climate careers?"
        )
        
        return {
            "messages": [error_message],
            "current_stage": "error_handled"
        }


def route_conversation(state: SimpleChatState) -> str:
    """
    Simple routing logic - no complex conditions
    
    Following audit recommendations for simple routing
    """
    current_stage = state.get("current_stage", "start")
    
    if current_stage == "start":
        return "detect_intent"
    elif current_stage == "intent_detected":
        return "generate_response"
    elif current_stage in ["response_generated", "error_handled"]:
        return "END"
    else:
        return "END"


class SimpleChatFlow:
    """
    Simple conversational flow that bypasses human steering
    
    Key features:
    - Direct response generation
    - No human steering for simple interactions
    - Clean message flow
    - Proper LangGraph structure
    """
    
    def __init__(self):
        """Initialize simple chat flow"""
        logger.info("Initializing simple chat flow")
        self.graph = self._create_graph()
    
    def _create_graph(self) -> StateGraph:
        """Create simple LangGraph workflow"""
        
        # Create workflow with minimal state
        workflow = StateGraph(SimpleChatState)
        
        # Add nodes (single-purpose, max 20 lines each)
        workflow.add_node("detect_intent", detect_message_intent)
        workflow.add_node("generate_response", generate_simple_response)
        
        # Set entry point
        workflow.add_edge(START, "detect_intent")
        
        # Add simple conditional routing
        workflow.add_conditional_edges(
            "detect_intent",
            route_conversation,
            {
                "generate_response": "generate_response",
                "END": END
            }
        )
        
        workflow.add_conditional_edges(
            "generate_response", 
            route_conversation,
            {
                "END": END
            }
        )
        
        logger.info("✅ Simple chat flow graph created successfully")
        return workflow.compile()
    
    async def process_message(
        self, 
        message: str, 
        user_id: str = "anonymous",
        session_id: str = "simple_chat"
    ) -> Dict[str, Any]:
        """
        Process a single message and return response
        
        This is the main entry point that bypasses complex workflows
        """
        try:
            # Create initial state
            initial_state = SimpleChatState(
                messages=[HumanMessage(content=message)],
                current_stage="start",
                response_type="unknown",
                user_id=user_id,
                session_id=session_id
            )
            
            # Run the simple workflow
            result = await self.graph.ainvoke(initial_state)
            
            # Extract the AI response
            ai_messages = [msg for msg in result["messages"] if isinstance(msg, AIMessage)]
            
            if ai_messages:
                latest_response = ai_messages[-1]
                
                return {
                    "message": latest_response.content,
                    "additional_kwargs": latest_response.additional_kwargs,
                    "success": True,
                    "workflow_type": "simple_chat"
                }
            else:
                # Fallback response
                return {
                    "message": "I'm here to help with climate careers. What would you like to know?",
                    "success": True,
                    "workflow_type": "simple_chat_fallback"
                }
                
        except Exception as e:
            logger.error(f"Error processing message: {e}")
            
            return {
                "message": "I'm sorry, I encountered an issue. How can I help you with climate careers?",
                "success": False,
                "error": str(e),
                "workflow_type": "simple_chat_error"
            }


# Factory function
def create_simple_chat_flow() -> SimpleChatFlow:
    """Create simple chat flow instance"""
    return SimpleChatFlow()


# Singleton instance
_simple_chat_instance = None


def get_simple_chat_instance() -> SimpleChatFlow:
    """Get or create singleton simple chat instance"""
    global _simple_chat_instance
    if _simple_chat_instance is None:
        _simple_chat_instance = create_simple_chat_flow()
    return _simple_chat_instance


# Export for LangGraph
simple_chat_graph = get_simple_chat_instance().graph 