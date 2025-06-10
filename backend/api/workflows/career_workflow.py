"""
Career Agent Workflow - Climate Economy Assistant
This module provides comprehensive career guidance and job search support for climate economy careers.
Location: backend/api/workflows/career_workflow.py
"""

from typing import Any, Dict, List, Optional
from typing_extensions import TypedDict

from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, END, START
from langgraph.checkpoint.memory import MemorySaver


class CareerGuidanceState(TypedDict):
    """State for the career guidance workflow"""

    messages: List[BaseMessage]
    user_id: Optional[str]
    session_id: Optional[str]
    career_goals: Optional[Dict[str, Any]]
    user_profile: Optional[Dict[str, Any]]
    guidance_type: Optional[str]
    context: Dict[str, Any]


def get_career_llm():
    """Get the language model for career guidance"""
    return ChatOpenAI(model="gpt-4o", temperature=0.5, streaming=True)


def job_search_node(state: CareerGuidanceState) -> Dict[str, Any]:
    """
    Job search guidance node - provides targeted job search strategies
    """
    messages = state.get("messages", [])

    system_message = SystemMessage(
        content="""You are a Climate Career Job Search Strategist specializing in Massachusetts green job market.

Massachusetts Climate Job Market:
- **Major Employers**: National Grid, Eversource, Tesla, Sunrun, Cape Wind, Boston Solar
- **Growing Companies**: Greentown Labs startups, MassCEC portfolio companies
- **Government**: MA DOER, EPA Region 1, city sustainability departments
- **Non-profits**: Conservation Law Foundation, Environment Massachusetts, GreenRoots

Job Search Strategy Framework:

**1. Target Company Research:**
- Climate commitment and initiatives
- Recent projects and hiring patterns
- Company culture and values alignment
- Growth trajectory in clean energy

**2. Application Optimization:**
- ATS-friendly keywords for climate jobs
- Quantifiable impact statements
- Climate-specific portfolio/project highlights
- Network referral strategies

**3. Interview Preparation:**
- Climate industry knowledge demonstrations
- Technical competency discussions
- Cultural fit and passion assessment
- Salary negotiation for green jobs

**4. Massachusetts-Specific Opportunities:**
- Offshore wind projects (Vineyard Wind, Commonwealth Wind)
- Solar development programs
- Building electrification initiatives
- Climate resilience planning roles

Provide specific job search tactics with company names, role types, and application strategies."""
    )

    llm_messages = [system_message] + messages
    llm = get_career_llm()
    response = llm.invoke(llm_messages)

    return {"messages": [response]}


def networking_node(state: CareerGuidanceState) -> Dict[str, Any]:
    """
    Networking guidance node - provides climate industry networking strategies
    """
    messages = state.get("messages", [])

    system_message = SystemMessage(
        content="""You are a Climate Career Networking Expert focused on Massachusetts opportunities.

Massachusetts Climate Networking Ecosystem:

**Professional Organizations:**
- Northeast Clean Energy Council (NECEC)
- Massachusetts Clean Energy Center (MassCEC)
- Boston Society of Architects (sustainable design)
- Green Building Alliance
- Climate XChange

**Events & Conferences:**
- New England Clean Energy Summit
- Greentown Labs Demo Days
- Boston Climate Action Week
- NECEC annual conference
- Local climate meetups (Boston, Cambridge, Worcester)

**Educational Institutions:**
- MIT Energy Initiative
- Harvard Environmental Health
- UMass Clean Energy Extension
- Northeastern sustainability programs

**Networking Strategy:**

**1. Digital Presence:**
- LinkedIn optimization for climate keywords
- Twitter engagement with climate leaders
- Professional climate-focused content sharing
- Thought leadership on sustainability topics

**2. In-Person Engagement:**
- Event attendance and follow-up strategies
- Informational interview requests
- Volunteer opportunities with climate orgs
- Speaking opportunities at local events

**3. Relationship Building:**
- Mentor identification and outreach
- Peer network development
- Industry leader connection strategies
- Cross-sector networking (policy, business, tech)

Provide specific networking tactics with event names, organization contacts, and relationship-building strategies."""
    )

    llm_messages = [system_message] + messages
    llm = get_career_llm()
    response = llm.invoke(llm_messages)

    return {"messages": [response]}


def salary_negotiation_node(state: CareerGuidanceState) -> Dict[str, Any]:
    """
    Salary negotiation node - provides compensation guidance for climate careers
    """
    messages = state.get("messages", [])

    system_message = SystemMessage(
        content="""You are a Climate Career Compensation Specialist with expertise in Massachusetts green job salaries.

Massachusetts Climate Job Salary Ranges (2024):

**Clean Energy Technical:**
- Solar Installer: $45,000-$65,000
- Wind Technician: $55,000-$75,000
- Energy Auditor: $50,000-$70,000
- HVAC (Heat Pump) Specialist: $55,000-$80,000

**Professional/Management:**
- Sustainability Manager: $75,000-$120,000
- Clean Energy Project Manager: $85,000-$130,000
- Climate Policy Analyst: $65,000-$95,000
- ESG Analyst: $70,000-$110,000

**Senior/Specialized:**
- Renewable Energy Engineer: $90,000-$140,000
- Climate Finance Director: $120,000-$180,000
- Chief Sustainability Officer: $150,000-$250,000

**Negotiation Strategy:**

**1. Research & Preparation:**
- Industry salary benchmarking
- Company financial health assessment
- Role complexity and responsibility scope
- Market demand for specific skills

**2. Value Proposition:**
- Quantifiable impact on climate goals
- Technical expertise and certifications
- Leadership and project management experience
- Network and relationship value

**3. Negotiation Tactics:**
- Total compensation package consideration
- Professional development opportunities
- Flexible work arrangements
- Climate impact metrics in role

**4. Massachusetts Context:**
- Cost of living adjustments
- State incentives for green jobs
- Competition for climate talent
- Growth potential in expanding market

Provide specific salary negotiation tactics with data-backed recommendations."""
    )

    llm_messages = [system_message] + messages
    llm = get_career_llm()
    response = llm.invoke(llm_messages)

    return {"messages": [response]}


def route_career_query(state: CareerGuidanceState) -> str:
    """
    Route career queries to appropriate guidance type
    """
    messages = state.get("messages", [])
    if not messages:
        return "job_search"

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
        print(f"Debug: Error accessing message content in route_career_query: {e}")
        return "job_search"  # Default fallback

    # Check for networking queries
    networking_keywords = [
        "network",
        "connect",
        "meet",
        "events",
        "organizations",
        "mentors",
    ]
    if any(keyword in last_message_content for keyword in networking_keywords):
        return "networking"

    # Check for salary/negotiation queries
    salary_keywords = [
        "salary",
        "pay",
        "compensation",
        "negotiate",
        "money",
        "benefits",
    ]
    if any(keyword in last_message_content for keyword in salary_keywords):
        return "salary_negotiation"

    # Default to job search
    return "job_search"


def create_career_graph():
    """Create and return the compiled career guidance graph"""

    workflow = StateGraph(CareerGuidanceState)

    # Add nodes
    workflow.add_node("job_search", job_search_node)
    workflow.add_node("networking", networking_node)
    workflow.add_node("salary_negotiation", salary_negotiation_node)

    # Add routing logic
    workflow.add_conditional_edges(
        START,
        route_career_query,
        {
            "job_search": "job_search",
            "networking": "networking",
            "salary_negotiation": "salary_negotiation",
        },
    )

    # All nodes end the workflow
    workflow.add_edge("job_search", END)
    workflow.add_edge("networking", END)
    workflow.add_edge("salary_negotiation", END)

    # No custom checkpointer - LangGraph API handles persistence automatically
    return workflow.compile()


# Export the compiled graph
career_graph = create_career_graph()
