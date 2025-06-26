import logging

"""
Elena - User Experience Specialist Agent
Specializes in user experience research, design, and optimization for climate applications.
"""

from typing import Dict, Any, List
import logging
from datetime import datetime
from langchain_core.tools import tool
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_openai import ChatOpenAI
from langgraph.types import Command

# from langgraph.prebuilt import InjectedState
from typing import Annotated, Literal

from backend.agents.base.agent_base import BaseAgent, AgentState

logger = logging.getLogger(__name__)


class ElenaAgent(BaseAgent):
    """
    Elena - User Experience Specialist
    Responsible for user experience research, design, and optimization
    """

    def __init__(self):
        super().__init__(
            name="Elena",
            description="User Experience Specialist focusing on UX research, design, and optimization",
            intelligence_level=8.0,
            tools=[
                "ux_research_analysis",
                "user_journey_mapping",
                "accessibility_audit",
                "usability_testing",
                "design_recommendations",
            ],
        )

    async def process_message(
        self, state: AgentState
    ) -> Command[Literal["support_team"]]:
        """Process message with UX focus"""
        try:
            user_message = next(
                (m["content"] for m in state.messages if m.get("role") == "user"), ""
            )

            response = "I'm Elena, your User Experience Specialist. I help improve user interfaces, conduct UX research, optimize user journeys, and ensure accessibility in climate applications and websites."

            message = {
                "role": "assistant",
                "content": response,
                "agent": "elena",
                "team": "support_team",
                "timestamp": datetime.now().isoformat(),
                "metadata": {
                    "specialization": "user_experience",
                    "confidence_score": 0.9,
                },
            }

            new_messages = state.messages + [message]

            return Command(
                goto="support_team",
                update={"messages": new_messages, "current_agent": "elena"},
            )

        except Exception as e:
            logger.error(f"Error in Elena agent: {str(e)}")
            return Command(
                goto="support_team",
                update={
                    "messages": state.messages
                    + [
                        {
                            "role": "assistant",
                            "content": f"I apologize, but I encountered an error. {str(e)}",
                            "agent": "elena",
                        }
                    ]
                },
            )


# Tools for Elena
@tool
def conduct_ux_research(
    research_type: str = "user_interviews",
    target_audience: str = "general",
    state: dict = None,
) -> str:
    """Conduct UX research to understand user needs and behaviors."""

    research_plan = f"""
UX RESEARCH PLAN - {research_type.upper()}

**RESEARCH OBJECTIVES:**
• Understand user needs, goals, and pain points
• Identify usability issues and improvement opportunities
• Gather insights on user behavior and preferences
• Validate design decisions and assumptions

**METHODOLOGY: {research_type.upper()}**

**USER INTERVIEWS:**
• 1-on-1 sessions with 8-12 participants
• Semi-structured interview guide
• Focus on user goals, workflows, and challenges
• Duration: 45-60 minutes per session

**SURVEYS:**
• Quantitative data collection from larger sample
• Mix of multiple choice and open-ended questions
• Statistical analysis of user preferences
• Online distribution through multiple channels

**USABILITY TESTING:**
• Task-based testing with 5-8 participants
• Think-aloud protocol during task completion
• Observation of user behavior and interactions
• Identification of usability issues and barriers

**CARD SORTING:**
• Information architecture research
• Understanding user mental models
• Categorization of content and features
• Open, closed, or hybrid sorting methods

**TARGET AUDIENCE: {target_audience.upper()}**
• Demographics and psychographics
• Experience level with climate topics
• Technology comfort and usage patterns
• Specific needs and use cases

**DELIVERABLES:**
• Research findings report
• User personas and journey maps
• Prioritized list of insights and recommendations
• Presentation of key findings to stakeholders

**TIMELINE:**
• Planning and recruitment: 1-2 weeks
• Data collection: 2-3 weeks
• Analysis and reporting: 1-2 weeks
• Total duration: 4-7 weeks
"""

    return research_plan


@tool
def create_user_journey_map(
    user_type: str, scenario: str = "job_search", state: dict = None
) -> str:
    """Create detailed user journey maps for climate career scenarios."""

    journey_map = f"""
USER JOURNEY MAP - {user_type.upper()} - {scenario.upper()}

**USER PERSONA:**
• Background and demographics
• Goals and motivations
• Pain points and challenges
• Technology comfort level

**JOURNEY STAGES:**

**1. AWARENESS**
• Trigger: Realization of need for climate career change
• Actions: Initial research, exploring options
• Touchpoints: Search engines, social media, word of mouth
• Emotions: Curious, overwhelmed, hopeful
• Pain Points: Information overload, unclear pathways

**2. CONSIDERATION**
• Actions: Comparing options, seeking advice
• Touchpoints: Career websites, networking events, mentors
• Emotions: Excited, anxious, determined
• Pain Points: Lack of specific guidance, skill gaps

**3. DECISION**
• Actions: Choosing specific path, making commitments
• Touchpoints: Application processes, training programs
• Emotions: Confident, nervous, committed
• Pain Points: Complex processes, financial concerns

**4. ACTION**
• Actions: Skill building, networking, job applications
• Touchpoints: Learning platforms, job boards, interviews
• Emotions: Motivated, frustrated, persistent
• Pain Points: Rejection, long timelines, competition

**5. ADVOCACY**
• Actions: Sharing experiences, helping others
• Touchpoints: Professional networks, social media
• Emotions: Proud, helpful, accomplished
• Opportunities: Community building, referrals

**IMPROVEMENT OPPORTUNITIES:**
• Simplify information architecture
• Provide personalized guidance
• Reduce friction in key processes
• Add progress tracking and motivation
• Create community support features

**SUCCESS METRICS:**
• Time to complete key tasks
• User satisfaction scores
• Conversion rates at each stage
• Support ticket volume
• User retention and engagement
"""

    return journey_map


@tool
def perform_accessibility_audit(
    interface_type: str = "website", state: dict = None
) -> str:
    """Perform comprehensive accessibility audit following WCAG guidelines."""

    model = ChatOpenAI(model_name="gpt-3.5-turbo")
    response = model.invoke(
        [
            SystemMessage(
                content="You are Elena, a UX specialist conducting accessibility audits. Provide detailed analysis of accessibility issues and recommendations following WCAG 2.1 guidelines."
            ),
            HumanMessage(
                content=f"Conduct accessibility audit for {interface_type}. Include WCAG compliance check, common issues, and specific recommendations for climate career platforms."
            ),
        ]
    )
    return response.content


@tool
def design_usability_test(
    feature_area: str, user_tasks: List[str] = None, state: dict = None
) -> str:
    """Design comprehensive usability testing protocol."""

    if user_tasks is None:
        user_tasks = [
            "Browse job opportunities",
            "Create profile",
            "Apply for position",
        ]

    test_protocol = f"""
USABILITY TEST PROTOCOL - {feature_area.upper()}

**TEST OBJECTIVES:**
• Evaluate ease of use and efficiency
• Identify usability issues and barriers
• Measure task completion rates and times
• Gather qualitative feedback on user experience

**PARTICIPANT CRITERIA:**
• Target user demographics
• Relevant experience level
• Technology comfort requirements
• Screening questionnaire responses

**TEST TASKS:**
{chr(10).join([f"• Task {i+1}: {task}" for i, task in enumerate(user_tasks)])}

**TEST PROTOCOL:**

**PRE-TEST (10 minutes):**
• Welcome and introduction
• Consent form and recording permission
• Background questionnaire
• Think-aloud instructions

**MAIN TEST (30-45 minutes):**
• Task-based scenarios
• Think-aloud observation
• Minimal moderator intervention
• Note-taking on behaviors and issues

**POST-TEST (10 minutes):**
• Satisfaction questionnaire (SUS)
• Open-ended feedback questions
• Preference and recommendation queries
• Debrief and thank you

**METRICS TO COLLECT:**
• Task completion rates (%)
• Time to complete tasks (seconds)
• Number of errors or wrong paths
• Satisfaction ratings (1-10 scale)
• Qualitative feedback themes

**ANALYSIS APPROACH:**
• Quantitative analysis of completion rates and times
• Qualitative coding of observation notes
• Severity rating of identified issues
• Prioritized recommendations list

**DELIVERABLES:**
• Usability test report with findings
• Video highlights of key issues
• Prioritized recommendations
• Executive summary for stakeholders
"""

    return test_protocol
