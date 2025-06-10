"""
Climate Agent Workflow - Climate Economy Assistant
This module provides specialized climate economy guidance and job market analysis.
Location: backend/api/workflows/climate_workflow.py
"""

from typing import Any, Dict, List, Optional
from typing_extensions import TypedDict

from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, END, START
from langgraph.checkpoint.memory import MemorySaver


class ClimateAgentState(TypedDict):
    """State for the climate agent workflow"""

    messages: List[BaseMessage]
    user_id: Optional[str]
    session_id: Optional[str]
    user_profile: Optional[Dict[str, Any]]
    context: Dict[str, Any]
    analysis_type: Optional[str]


def get_climate_llm():
    """Get the language model for climate guidance"""
    return ChatOpenAI(model="gpt-4o", temperature=0.6, streaming=True)


def climate_analysis_node(state: ClimateAgentState) -> Dict[str, Any]:
    """
    Climate economy analysis node - provides detailed climate job market insights
    """
    messages = state.get("messages", [])

    system_message = SystemMessage(
        content="""You are an expert Climate Economy Analyst specializing in Massachusetts' green job market.

Massachusetts Climate Economy Context:
- Leading state in clean energy deployment (40% reduction in emissions since 1990)
- Major sectors: offshore wind, solar, energy efficiency, green buildings
- Key employers: National Grid, Eversource, Tesla, Boston Solar, Cape Wind
- Growing opportunities in: battery storage, EV infrastructure, climate resilience
- Policy drivers: 2050 Net Zero mandate, Clean Energy Standard

Your expertise covers:
1. **Job Market Analysis**: Current openings, salary ranges, growth projections
2. **Skills Mapping**: Translating traditional skills to climate sectors
3. **Career Pathways**: Entry points, advancement opportunities, certifications
4. **Regional Opportunities**: City-specific programs (Boston, Cambridge, Springfield)
5. **Training Programs**: MassCEC initiatives, community college programs

Provide data-driven, actionable career guidance with specific Massachusetts context."""
    )

    llm_messages = [system_message] + messages
    llm = get_climate_llm()
    response = llm.invoke(llm_messages)

    return {"messages": [response]}


def skills_assessment_node(state: ClimateAgentState) -> Dict[str, Any]:
    """
    Skills assessment node - evaluates user skills for climate careers
    """
    messages = state.get("messages", [])

    system_message = SystemMessage(
        content="""You are a Climate Career Skills Assessor focused on Massachusetts opportunities.

Skill Translation Framework:
- **Engineering → Clean Energy**: HVAC → Heat pumps, Electrical → Solar/wind, Civil → Green infrastructure
- **Finance → Climate Finance**: Traditional finance → Green bonds, ESG investing, carbon markets
- **Tech → Climate Tech**: Software → Energy management systems, IoT → Smart grid, Data → Climate modeling
- **Policy → Climate Policy**: Government → Climate planning, Non-profit → Environmental advocacy

Assessment Areas:
1. Technical Skills: Engineering, data analysis, project management
2. Soft Skills: Communication, problem-solving, adaptability
3. Industry Knowledge: Sustainability principles, climate science basics
4. Certifications: LEED, NABCEP, BPI, relevant to career path

Provide specific skill gap analysis and recommended training pathways."""
    )

    llm_messages = [system_message] + messages
    llm = get_climate_llm()
    response = llm.invoke(llm_messages)

    return {"messages": [response]}


def route_climate_query(state: ClimateAgentState) -> str:
    """
    Route climate queries to appropriate analysis type
    """
    messages = state.get("messages", [])
    if not messages:
        return "climate_analysis"

    # Safely extract content from last message (handle both dict and object formats)
    last_message_content = ""
    try:
        last_message = messages[-1]
        if isinstance(last_message, dict):
            # Dictionary format
            last_message_content = last_message.get("content", "").lower()
        elif hasattr(last_message, "content"):
            # Object format with content attribute
            last_message_content = getattr(last_message, "content", "").lower()
        else:
            # Fallback - convert to string
            last_message_content = str(last_message).lower()
    except Exception as e:
        print(f"Debug: Error accessing message content in route_climate_query: {e}")
        return "climate_analysis"  # Default fallback

    # Check for skills-related queries
    skills_keywords = [
        "skills",
        "experience",
        "background",
        "transition",
        "qualify",
        "resume",
    ]
    if any(keyword in last_message_content for keyword in skills_keywords):
        return "skills_assessment"

    # Default to general climate analysis
    return "climate_analysis"


def create_climate_graph():
    """Create and return the compiled climate agent graph"""

    workflow = StateGraph(ClimateAgentState)

    # Add nodes
    workflow.add_node("climate_analysis", climate_analysis_node)
    workflow.add_node("skills_assessment", skills_assessment_node)

    # Add routing logic
    workflow.add_conditional_edges(
        START,
        route_climate_query,
        {
            "climate_analysis": "climate_analysis",
            "skills_assessment": "skills_assessment",
        },
    )

    # Both nodes end the workflow
    workflow.add_edge("climate_analysis", END)
    workflow.add_edge("skills_assessment", END)

    # No custom checkpointer - LangGraph API handles persistence automatically
    return workflow.compile()


# Export the compiled graph
climate_graph = create_climate_graph()
