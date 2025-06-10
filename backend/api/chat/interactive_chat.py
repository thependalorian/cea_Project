"""
Interactive Chat LangGraph Workflow - Climate Economy Assistant
Enhanced with Supervisor Workflow Integration and Multi-Agent Capabilities

This module provides both simple chat and supervisor-integrated chat workflows.
Location: backend/api/chat/interactive_chat.py
"""

import uuid
from typing import Any, Dict, List, Optional, Union
from typing_extensions import TypedDict

from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, END, START

# Import supervisor workflow components
from api.workflows.climate_supervisor_workflow import (
    ClimateAgentState,
    create_climate_supervisor_workflow,
    UserIdentityProfile,
    RoutingDecision,
    QualityMetrics
)


class ChatState(TypedDict):
    """Enhanced state for the interactive chat workflow"""

    messages: List[BaseMessage]
    user_id: Optional[str]
    session_id: Optional[str]
    context: Dict[str, Any]
    use_supervisor: bool  # Flag to enable supervisor workflow
    specialist_routing: Optional[str]  # Track which specialist to route to
    user_profile: Optional[Dict[str, Any]]  # User profile information
    conversation_complete: bool  # Flag for conversation completion


# Initialize the LLM
def get_llm():
    """Get the language model for chat"""
    return ChatOpenAI(model="gpt-4o", temperature=0.7, streaming=True)


def climate_assistant_node(state: ChatState) -> Dict[str, Any]:
    """
    Enhanced climate assistant node with optional supervisor integration
    """
    messages = state.get("messages", [])
    use_supervisor = state.get("use_supervisor", False)
    
    if use_supervisor:
        # Route through supervisor workflow for enhanced capabilities
        return supervisor_enhanced_response(state)
    else:
        # Use simple chat for basic interactions
        return simple_chat_response(state)


def simple_chat_response(state: ChatState) -> Dict[str, Any]:
    """
    Simple climate assistant response without supervisor workflow
    """
    messages = state.get("messages", [])

    # Create enhanced system message for climate economy focus
    system_message = SystemMessage(
        content="""You are a Climate Economy Assistant specializing in Massachusetts' climate job market and career transitions.

Your expertise includes:
- Clean energy careers (solar, wind, energy efficiency, battery storage)
- Green infrastructure and sustainable transportation
- Environmental justice and community engagement
- Climate policy and environmental compliance
- Skills translation from traditional to climate sectors
- Resume analysis for climate career transitions
- Educational pathways and training programs
- Veteran transition support for climate careers
- International credential evaluation for climate jobs

Massachusetts Focus Areas:
- Gateway Cities climate workforce development
- Clean energy manufacturing in Western MA
- Offshore wind opportunities on the South Coast
- Urban sustainability projects in Greater Boston
- Environmental justice communities statewide

Provide practical, actionable guidance based on Massachusetts' climate economy initiatives, job market trends, and available resources. Be conversational, supportive, and specific in your recommendations. Always consider barriers to entry and provide multiple pathways for career advancement."""
    )

    # Prepare messages for the LLM
    llm_messages = [system_message] + messages

    # Get response from LLM
    llm = get_llm()
    response = llm.invoke(llm_messages)

    # Return updated messages
    return {"messages": [response]}


async def supervisor_enhanced_response(state: ChatState) -> Dict[str, Any]:
    """
    Enhanced response using the supervisor workflow for complex interactions
    """
    try:
        # Get the supervisor workflow
        supervisor_graph = create_climate_supervisor_workflow()
        
        # Convert chat state to supervisor state
        user_id = state.get("user_id", str(uuid.uuid4()))
        session_id = state.get("session_id", str(uuid.uuid4()))
        messages = state.get("messages", [])
        
        # Get the latest user message
        user_message = ""
        if messages:
            last_message = messages[-1]
            if isinstance(last_message, HumanMessage):
                user_message = last_message.content
            elif isinstance(last_message, dict) and last_message.get("type") == "human":
                user_message = last_message.get("content", "")
        
        # Create supervisor state
        supervisor_state = ClimateAgentState(
            messages=[{"role": "human", "content": user_message}],
            user_id=user_id,
            conversation_id=session_id,
            workflow_state="active",
            tools_used=[],
            specialist_handoffs=[],
            resource_recommendations=[],
            next_actions=[],
            error_recovery_log=[],
            reflection_history=[],
            case_recommendations=[]
        )
        
        # Execute supervisor workflow
        result = await supervisor_graph.ainvoke(supervisor_state)
        
        # Extract response from supervisor result
        response_content = ""
        if result.get("messages"):
            last_message = result["messages"][-1]
            if hasattr(last_message, 'content'):
                response_content = last_message.content
            elif isinstance(last_message, dict):
                response_content = last_message.get('content', '')
        
        # Create AI message with supervisor response
        ai_message = AIMessage(content=response_content)
        
        # Update state with supervisor insights
        updated_state = {
            "messages": [ai_message],
            "specialist_routing": result.get("current_specialist"),
            "context": {
                **state.get("context", {}),
                "tools_used": result.get("tools_used", []),
                "specialist": result.get("current_specialist"),
                "quality_metrics": result.get("quality_metrics"),
                "intelligence_level": result.get("intelligence_level")
            }
        }
        
        return updated_state
        
    except Exception as e:
        # Fallback to simple response if supervisor fails
        print(f"Supervisor workflow error, falling back to simple chat: {e}")
        return simple_chat_response(state)


def routing_node(state: ChatState) -> str:
    """
    Determine whether to use simple chat or supervisor workflow
    """
    messages = state.get("messages", [])
    context = state.get("context", {})
    
    # Check if supervisor is explicitly requested
    if state.get("use_supervisor", False):
        return "supervisor_chat"
    
    # Analyze message complexity to determine routing
    if messages:
        last_message = messages[-1]
        message_content = ""
        
        if isinstance(last_message, HumanMessage):
            message_content = last_message.content.lower()
        elif isinstance(last_message, dict):
            message_content = last_message.get("content", "").lower()
        
        # Keywords that suggest need for supervisor workflow
        supervisor_keywords = [
            "resume", "career transition", "military", "veteran", "international",
            "credentials", "job search", "training", "education", "environmental justice",
            "gateway cities", "skills translation", "barrier", "certification"
        ]
        
        # Check for complex queries that benefit from supervisor
        if any(keyword in message_content for keyword in supervisor_keywords):
            return "supervisor_chat"
        
        # Check for follow-up questions that might need specialist routing
        if len(messages) > 2:  # Multi-turn conversation
            return "supervisor_chat"
    
    return "simple_chat"


def should_continue(state: ChatState) -> str:
    """
    Determine if the conversation should continue or end
    """
    # Check for conversation completion indicators
    if state.get("conversation_complete", False):
        return END
    
    # Always continue for now - in practice, you might check for:
    # - User saying goodbye
    # - Task completion
    # - Timeout conditions
    return END


# Create the enhanced workflow graph
def create_chat_graph():
    """Create and return the compiled chat graph with supervisor integration"""

    # Initialize the graph
    workflow = StateGraph(ChatState)

    # Add nodes
    workflow.add_node("climate_assistant", climate_assistant_node)
    workflow.add_node("simple_chat", simple_chat_response)
    workflow.add_node("supervisor_chat", supervisor_enhanced_response)

    # Add edges with conditional routing
    workflow.add_edge(START, "climate_assistant")
    workflow.add_edge("climate_assistant", END)
    workflow.add_edge("simple_chat", END)
    workflow.add_edge("supervisor_chat", END)

    # Compile the graph
    graph = workflow.compile()

    return graph


# Create separate graphs for different use cases
def create_simple_chat_graph():
    """Create a simple chat graph without supervisor workflow"""
    workflow = StateGraph(ChatState)
    workflow.add_node("climate_assistant", simple_chat_response)
    workflow.add_edge(START, "climate_assistant")
    workflow.add_edge("climate_assistant", END)
    
    return workflow.compile()


def create_supervisor_chat_graph():
    """Create a supervisor-enhanced chat graph"""
    workflow = StateGraph(ChatState)
    workflow.add_node("supervisor_assistant", supervisor_enhanced_response)
    workflow.add_edge(START, "supervisor_assistant")
    workflow.add_edge("supervisor_assistant", END)
    
    return workflow.compile()


# Export the compiled graphs for LangGraph CLI and API usage
chat_graph = create_chat_graph()
simple_chat_graph = create_simple_chat_graph()
supervisor_chat_graph = create_supervisor_chat_graph()


# Helper functions for API integration
def create_chat_request(
    message: str,
    user_id: Optional[str] = None,
    session_id: Optional[str] = None,
    use_supervisor: bool = False,
    context: Optional[Dict[str, Any]] = None
) -> ChatState:
    """
    Create a chat request state for workflow execution
    """
    return ChatState(
        messages=[HumanMessage(content=message)],
        user_id=user_id or str(uuid.uuid4()),
        session_id=session_id or str(uuid.uuid4()),
        context=context or {},
        use_supervisor=use_supervisor,
        specialist_routing=None,
        user_profile=None,
        conversation_complete=False
    )


async def process_chat_message(
    message: str,
    user_id: Optional[str] = None,
    session_id: Optional[str] = None,
    use_supervisor: bool = False,
    context: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Process a chat message and return the response
    """
    # Create initial state
    initial_state = create_chat_request(
        message=message,
        user_id=user_id,
        session_id=session_id,
        use_supervisor=use_supervisor,
        context=context
    )
    
    # Select appropriate graph
    if use_supervisor:
        graph = supervisor_chat_graph
    else:
        graph = simple_chat_graph
    
    # Execute the workflow
    result = await graph.ainvoke(initial_state)
    
    # Extract response
    response_message = ""
    if result.get("messages"):
        last_message = result["messages"][-1]
        if hasattr(last_message, 'content'):
            response_message = last_message.content
        elif isinstance(last_message, dict):
            response_message = last_message.get('content', '')
    
    return {
        "response": response_message,
        "session_id": result.get("session_id"),
        "specialist": result.get("specialist_routing"),
        "context": result.get("context", {}),
        "use_supervisor": use_supervisor
    }
