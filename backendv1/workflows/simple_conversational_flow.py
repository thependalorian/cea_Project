"""
Simple Conversational Flow - Optimized LangGraph Implementation

Following the LangGraph audit recommendations:
- Clean TypedDict state schema with add_messages
- Single-purpose nodes (max 20 lines each)
- Conversational response as final node
- Concise, user-friendly responses (50-150 words)
- Proper message accumulation

Location: backendv1/workflows/simple_conversational_flow.py
"""

from typing import Dict, Any, List, Optional, Literal, Annotated
from datetime import datetime

from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from typing_extensions import TypedDict

from backendv1.utils.logger import setup_logger
from backendv1.agents.pendo.agent import PendoAgent
from backendv1.agents.base.agent_base import AgentContext

logger = setup_logger("simple_conversational_flow")


# CLEAN STATE SCHEMA - Following audit recommendation #1
class ConversationState(TypedDict):
    """Clean, focused state for conversational flow"""
    messages: Annotated[List[BaseMessage], add_messages]
    user_id: str
    conversation_id: str
    current_intent: str
    specialist_needed: Optional[str]
    confidence_score: float
    response_ready: bool


class SimpleConversationalFlow:
    """
    Simplified conversational workflow following LangGraph best practices
    
    Implements audit recommendations:
    - Single responsibility nodes
    - Clean state management
    - Conversational output focus
    - Quick response times (<3 seconds)
    """

    def __init__(self):
        self.pendo_agent = PendoAgent()
        self.graph = self._create_workflow()
        logger.info("✅ Simple conversational flow initialized")

    def _create_workflow(self) -> StateGraph:
        """Create optimized workflow graph"""
        workflow = StateGraph(ConversationState)

        # SINGLE-PURPOSE NODES - Following audit recommendation #2
        workflow.add_node("intent_classifier", self._classify_intent)
        workflow.add_node("pendo_responder", self._pendo_response)
        workflow.add_node("conversational_formatter", self._format_conversational_response)

        # SIMPLE ROUTING - Following audit recommendation #3
        workflow.add_edge(START, "intent_classifier")
        workflow.add_edge("intent_classifier", "pendo_responder")
        workflow.add_edge("pendo_responder", "conversational_formatter")
        workflow.add_edge("conversational_formatter", END)

        return workflow.compile()

    async def _classify_intent(self, state: ConversationState) -> Dict[str, Any]:
        """Classify user intent - SINGLE PURPOSE NODE"""
        try:
            latest_message = state["messages"][-1] if state["messages"] else None
            if not latest_message or not hasattr(latest_message, 'content'):
                return {
                    "current_intent": "greeting",
                    "specialist_needed": None,
                    "confidence_score": 0.5
                }

            user_message = latest_message.content.lower()
            
            # SIMPLE INTENT CLASSIFICATION - Following audit recommendation
            if any(word in user_message for word in ["resume", "cv", "interview"]):
                intent = "resume_help"
                specialist = "mai"
            elif any(word in user_message for word in ["veteran", "military", "service"]):
                intent = "veteran_support"
                specialist = "marcus"
            elif any(word in user_message for word in ["international", "visa", "credential"]):
                intent = "international_help"
                specialist = "liv"
            elif any(word in user_message for word in ["student", "internship", "early career"]):
                intent = "youth_support"
                specialist = "jasmine"
            elif any(word in user_message for word in ["job", "career", "opportunity"]):
                intent = "career_guidance"
                specialist = "lauren"
            else:
                intent = "general_inquiry"
                specialist = None

            return {
                "current_intent": intent,
                "specialist_needed": specialist,
                "confidence_score": 0.8
            }

        except Exception as e:
            logger.error(f"Intent classification error: {e}")
            return {
                "current_intent": "general_inquiry",
                "specialist_needed": None,
                "confidence_score": 0.3
            }

    async def _pendo_response(self, state: ConversationState) -> Dict[str, Any]:
        """Get Pendo's response - SINGLE PURPOSE NODE"""
        try:
            latest_message = state["messages"][-1] if state["messages"] else None
            if not latest_message:
                return {"response_ready": False}

            # Create context for Pendo
            context = AgentContext(
                user_id=state["user_id"],
                conversation_id=state["conversation_id"],
                session_data={},
                conversation_history=state["messages"][-3:],  # Last 3 messages only
                metadata={"intent": state["current_intent"]}
            )

            # Get Pendo's response
            pendo_response = await self.pendo_agent.process_message(
                latest_message.content, context
            )

            # CONCISE RESPONSE - Following audit recommendation #4
            content = pendo_response.content
            if len(content) > 300:  # Limit to ~150 words
                content = content[:300] + "... Would you like me to elaborate on any specific aspect?"

            return {
                "pendo_content": content,
                "confidence_score": pendo_response.confidence_score,
                "response_ready": True
            }

        except Exception as e:
            logger.error(f"Pendo response error: {e}")
            return {
                "pendo_content": "I'm here to help with climate career opportunities! What specific area interests you?",
                "confidence_score": 0.5,
                "response_ready": True
            }

    async def _format_conversational_response(self, state: ConversationState) -> Dict[str, Any]:
        """Format final conversational response - SINGLE PURPOSE NODE"""
        try:
            content = state.get("pendo_content", "I'm here to help with climate careers!")
            
            # CONVERSATIONAL FORMATTING - Following audit recommendation #5
            if state.get("specialist_needed"):
                specialist_name = {
                    "mai": "Mai (Resume Specialist)",
                    "marcus": "Marcus (Veteran Specialist)", 
                    "liv": "Liv (International Specialist)",
                    "jasmine": "Jasmine (Youth Specialist)",
                    "lauren": "Lauren (Career Specialist)"
                }.get(state["specialist_needed"], "our specialist")
                
                content += f"\n\nI think {specialist_name} would be perfect to help you with this. Should I connect you?"

            # CREATE AI MESSAGE - Following audit recommendation #6
            ai_response = AIMessage(
                content=content,
                additional_kwargs={
                    "specialist": "pendo",
                    "confidence": state.get("confidence_score", 0.5),
                    "intent": state.get("current_intent", "general"),
                    "timestamp": datetime.utcnow().isoformat()
                }
            )

            return {
                "messages": [ai_response],
                "response_ready": True
            }

        except Exception as e:
            logger.error(f"Response formatting error: {e}")
            fallback_response = AIMessage(
                content="I'm here to help you explore climate career opportunities! What interests you most?"
            )
            return {
                "messages": [fallback_response],
                "response_ready": True
            }

    async def process_conversation(
        self, 
        user_message: str, 
        user_id: str, 
        conversation_id: str
    ) -> str:
        """
        Process a single conversation turn
        
        Returns:
            str: AI response content
        """
        try:
            # Create initial state
            initial_state = ConversationState(
                messages=[HumanMessage(content=user_message)],
                user_id=user_id,
                conversation_id=conversation_id,
                current_intent="",
                specialist_needed=None,
                confidence_score=0.0,
                response_ready=False
            )

            # Run workflow
            result = await self.graph.ainvoke(initial_state)
            
            # Extract AI response
            if result.get("messages"):
                ai_message = result["messages"][-1]
                if isinstance(ai_message, AIMessage):
                    return ai_message.content
            
            return "I'm here to help with climate careers! How can I assist you today?"

        except Exception as e:
            logger.error(f"Conversation processing error: {e}")
            return "I encountered a technical issue. Let me help you explore climate career opportunities - what interests you most?"


# Create workflow instance
def create_simple_conversational_flow() -> SimpleConversationalFlow:
    """Create simple conversational flow instance"""
    return SimpleConversationalFlow()


# Quick test function
async def test_conversation():
    """Test the conversational flow"""
    flow = create_simple_conversational_flow()
    
    test_messages = [
        "Hello, I'm interested in climate careers",
        "I need help with my resume for clean energy jobs",
        "I'm a veteran looking for opportunities"
    ]
    
    for msg in test_messages:
        response = await flow.process_conversation(msg, "test_user", "test_conv")
        print(f"User: {msg}")
        print(f"AI: {response}\n")


if __name__ == "__main__":
    import asyncio
    asyncio.run(test_conversation()) 