"""
Resume Analysis Workflow - Climate Economy Assistant
This module provides resume analysis and career transition guidance for climate economy jobs.
Location: backend/api/workflows/resume_workflow.py
"""

from typing import Any, Dict, List, Optional
from typing_extensions import TypedDict

from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, END, START
from langgraph.checkpoint.memory import MemorySaver


class ResumeAnalysisState(TypedDict):
    """State for the resume analysis workflow"""

    messages: List[BaseMessage]
    user_id: Optional[str]
    session_id: Optional[str]
    resume_content: Optional[str]
    analysis_results: Optional[Dict[str, Any]]
    recommendations: Optional[List[str]]
    context: Dict[str, Any]


def get_resume_llm():
    """Get the language model for resume analysis"""
    return ChatOpenAI(
        model="gpt-4o",
        temperature=0.4,  # Lower temperature for more analytical responses
        streaming=True,
    )


def resume_analysis_node(state: ResumeAnalysisState) -> Dict[str, Any]:
    """
    Resume analysis node - analyzes resumes for climate economy opportunities
    """
    messages = state.get("messages", [])

    system_message = SystemMessage(
        content="""You are an expert Resume Analyst specializing in climate economy career transitions in Massachusetts.

Resume Analysis Framework:
1. **Skills Inventory**: Technical, soft, and transferable skills
2. **Experience Mapping**: How current experience applies to climate jobs
3. **Gap Analysis**: Missing skills/experience for target climate roles
4. **Strength Identification**: Unique value propositions for climate sector

Massachusetts Climate Career Opportunities:
- **Clean Energy**: Solar installer, wind technician, energy auditor
- **Green Building**: LEED coordinator, building performance analyst
- **Transportation**: EV infrastructure, sustainable logistics
- **Policy/Planning**: Climate resilience, environmental compliance
- **Finance**: Green finance, ESG analysis, climate risk assessment

Analysis Output:
- Current skills alignment with climate careers (%)
- Top 3 recommended climate career paths
- Specific skill development recommendations
- Training programs and certifications needed
- Expected timeline for career transition

Be specific about Massachusetts opportunities and include salary ranges when relevant."""
    )

    llm_messages = [system_message] + messages
    llm = get_resume_llm()
    response = llm.invoke(llm_messages)

    return {"messages": [response]}


def skills_mapping_node(state: ResumeAnalysisState) -> Dict[str, Any]:
    """
    Skills mapping node - maps existing skills to climate economy roles
    """
    messages = state.get("messages", [])

    system_message = SystemMessage(
        content="""You are a Climate Career Skills Mapper focused on translating existing experience to Massachusetts climate opportunities.

Skill Translation Matrix:

**Technical Skills:**
- Project Management → Clean energy project development
- Data Analysis → Energy efficiency analysis, carbon footprint assessment
- Sales → Solar sales, energy services marketing
- Engineering → Renewable energy systems design
- IT/Software → Energy management systems, smart grid technology

**Industry Crossovers:**
- Construction → Green building, solar installation
- Finance → Climate finance, carbon markets, ESG investing
- Healthcare → Environmental health, climate resilience planning
- Education → Climate education, sustainability training
- Government → Climate policy, environmental regulation

**Soft Skills Enhancement:**
- Communication → Stakeholder engagement on climate initiatives
- Problem-solving → Climate adaptation strategy development
- Leadership → Sustainability program management

Provide specific examples of how their background translates to 3-5 concrete climate job opportunities in Massachusetts, including entry-level paths and growth potential."""
    )

    llm_messages = [system_message] + messages
    llm = get_resume_llm()
    response = llm.invoke(llm_messages)

    return {"messages": [response]}


def career_planning_node(state: ResumeAnalysisState) -> Dict[str, Any]:
    """
    Career planning node - creates actionable career transition plans
    """
    messages = state.get("messages", [])

    system_message = SystemMessage(
        content="""You are a Climate Career Transition Planner specializing in Massachusetts opportunities.

Create a practical 6-12 month transition plan including:

**Immediate Actions (0-3 months):**
- Skill assessments and gap analysis
- Networking strategy (climate organizations, events)
- Resume optimization for climate roles
- LinkedIn profile updates with climate keywords

**Skill Development (3-6 months):**
- Online courses (MITx, edX climate courses)
- Certifications (LEED, NABCEP, BPI, etc.)
- Volunteer opportunities with climate organizations
- Informational interviews with climate professionals

**Job Search Strategy (6-12 months):**
- Target companies and organizations
- Application timeline and milestones
- Interview preparation for climate roles
- Salary negotiation strategies

**Massachusetts-Specific Resources:**
- MassCEC training programs
- Clean Energy Center job board
- Boston area climate meetups and conferences
- Community college green job training programs

Provide specific, actionable steps with timelines and measurable outcomes."""
    )

    llm_messages = [system_message] + messages
    llm = get_resume_llm()
    response = llm.invoke(llm_messages)

    return {"messages": [response]}


def route_resume_query(state: ResumeAnalysisState) -> str:
    """
    Route resume queries to appropriate analysis type
    """
    messages = state.get("messages", [])
    if not messages:
        return "resume_analysis"

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
        print(f"Debug: Error accessing message content in route_resume_query: {e}")
        return "resume_analysis"  # Default fallback

    # Check for skills mapping queries
    skills_keywords = ["skills", "experience", "background", "translate", "apply"]
    if any(keyword in last_message_content for keyword in skills_keywords):
        return "skills_mapping"

    # Check for career planning queries
    planning_keywords = ["plan", "timeline", "steps", "transition", "next", "how"]
    if any(keyword in last_message_content for keyword in planning_keywords):
        return "career_planning"

    # Default to resume analysis
    return "resume_analysis"


def create_resume_graph():
    """Create and return the compiled resume analysis graph"""

    workflow = StateGraph(ResumeAnalysisState)

    # Add nodes
    workflow.add_node("resume_analysis", resume_analysis_node)
    workflow.add_node("skills_mapping", skills_mapping_node)
    workflow.add_node("career_planning", career_planning_node)

    # Add routing logic
    workflow.add_conditional_edges(
        START,
        route_resume_query,
        {
            "resume_analysis": "resume_analysis",
            "skills_mapping": "skills_mapping",
            "career_planning": "career_planning",
        },
    )

    # All nodes end the workflow
    workflow.add_edge("resume_analysis", END)
    workflow.add_edge("skills_mapping", END)
    workflow.add_edge("career_planning", END)

    # No custom checkpointer - LangGraph API handles persistence automatically
    return workflow.compile()


# Export the compiled graph
resume_graph = create_resume_graph()
