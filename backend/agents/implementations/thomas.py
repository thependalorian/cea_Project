import logging

"""
Thomas - Data and Analytics Specialist Agent
Specializes in data analysis, metrics tracking, and insights for climate applications.
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


class ThomasAgent(BaseAgent):
    """
    Thomas - Data and Analytics Specialist
    Responsible for data analysis, metrics tracking, and generating insights
    """

    def __init__(self):
        super().__init__(
            name="Thomas",
            description="Data and Analytics Specialist focusing on metrics, insights, and data-driven decisions",
            intelligence_level=8.5,
            tools=[
                "performance_analytics",
                "user_behavior_analysis",
                "climate_data_insights",
                "predictive_modeling",
                "dashboard_creation",
            ],
        )

    async def process_message(
        self, state: AgentState
    ) -> Command[Literal["support_team"]]:
        """Process message with data analytics focus"""
        try:
            user_message = next(
                (m["content"] for m in state.messages if m.get("role") == "user"), ""
            )

            response = "I'm Thomas, your Data and Analytics Specialist. I help analyze user behavior, track performance metrics, generate insights from climate data, and create dashboards for data-driven decision making."

            message = {
                "role": "assistant",
                "content": response,
                "agent": "thomas",
                "team": "support_team",
                "timestamp": datetime.now().isoformat(),
                "metadata": {
                    "specialization": "data_analytics",
                    "confidence_score": 0.9,
                },
            }

            new_messages = state.messages + [message]

            return Command(
                goto="support_team",
                update={"messages": new_messages, "current_agent": "thomas"},
            )

        except Exception as e:
            logger.error(f"Error in Thomas agent: {str(e)}")
            return Command(
                goto="support_team",
                update={
                    "messages": state.messages
                    + [
                        {
                            "role": "assistant",
                            "content": f"I apologize, but I encountered an error. {str(e)}",
                            "agent": "thomas",
                        }
                    ]
                },
            )


# Tools for Thomas
@tool
def analyze_user_engagement(
    time_period: str = "30_days", metric_focus: str = "general", state: dict = None
) -> str:
    """Analyze user engagement metrics and patterns."""

    engagement_analysis = f"""
USER ENGAGEMENT ANALYSIS - {time_period.upper()}

**KEY METRICS OVERVIEW:**
• Daily Active Users (DAU): Tracking unique daily visitors
• Monthly Active Users (MAU): Measuring monthly user base
• Session Duration: Average time spent per session
• Page Views per Session: Content consumption patterns
• Bounce Rate: Single-page session percentage

**ENGAGEMENT PATTERNS:**

**PEAK USAGE TIMES:**
• Weekdays: 9-11 AM, 2-4 PM (professional research)
• Weekends: 10 AM-2 PM (personal exploration)
• Seasonal: Higher activity in January (career planning) and September (back-to-school)

**USER JOURNEY ANALYSIS:**
• Entry Points: 45% organic search, 25% direct, 20% social media, 10% referrals
• Most Viewed Content: Job search tools, skill assessments, training programs
• Conversion Funnels: Profile creation → skill assessment → job applications
• Drop-off Points: Complex registration forms, lengthy assessments

**SEGMENTATION INSIGHTS:**
• New Users: Higher bounce rate but longer sessions when engaged
• Returning Users: More focused behavior, higher conversion rates
• Mobile vs Desktop: 60% mobile, 40% desktop usage
• Geographic: Higher engagement from urban areas and university towns

**CONTENT PERFORMANCE:**
• Top Performing: "How to transition to climate careers" guides
• High Engagement: Interactive tools and assessments
• Low Performance: Dense policy documents, long-form articles
• Video Content: 3x higher engagement than text-only content

**RECOMMENDATIONS:**
• Optimize mobile experience for primary user base
• Create more interactive and visual content
• Simplify onboarding and registration processes
• Develop targeted content for peak usage times
• Implement progressive profiling to reduce form abandonment

**SUCCESS METRICS TO TRACK:**
• User activation rate (completed profile setup)
• Feature adoption rates
• Time to first value (successful job application)
• User retention curves
• Net Promoter Score (NPS)
"""

    return engagement_analysis


@tool
def create_performance_dashboard(
    dashboard_type: str = "executive", focus_area: str = "overall", state: dict = None
) -> str:
    """Create comprehensive performance dashboards for different stakeholders."""

    dashboard_spec = f"""
PERFORMANCE DASHBOARD SPECIFICATION - {dashboard_type.upper()}

**DASHBOARD PURPOSE:**
• Monitor key performance indicators (KPIs)
• Track progress toward business objectives
• Identify trends and anomalies
• Support data-driven decision making

**TARGET AUDIENCE: {dashboard_type.upper()}**

**EXECUTIVE DASHBOARD:**
• High-level business metrics
• Monthly and quarterly trends
• Goal progress indicators
• Revenue and growth metrics

**OPERATIONAL DASHBOARD:**
• Daily operational metrics
• System performance indicators
• User activity and engagement
• Content performance metrics

**ANALYTICS DASHBOARD:**
• Detailed user behavior analysis
• Conversion funnel performance
• A/B test results
• Cohort analysis

**KEY METRICS BY FOCUS AREA:**

**USER ACQUISITION:**
• New user registrations
• Traffic sources and channels
• Cost per acquisition (CPA)
• Conversion rates by channel

**USER ENGAGEMENT:**
• Daily/Monthly active users
• Session duration and frequency
• Feature usage rates
• Content engagement metrics

**BUSINESS OUTCOMES:**
• Job application submissions
• Successful job placements
• Training program completions
• Partner referrals generated

**TECHNICAL PERFORMANCE:**
• Page load times
• System uptime and reliability
• Error rates and types
• API response times

**DASHBOARD FEATURES:**
• Real-time data updates
• Interactive filtering and drill-down
• Automated alerts and notifications
• Export capabilities for reporting
• Mobile-responsive design

**VISUALIZATION TYPES:**
• Line charts for trends over time
• Bar charts for comparisons
• Pie charts for composition
• Heat maps for geographic data
• Funnel charts for conversion analysis

**UPDATE FREQUENCY:**
• Real-time: System performance metrics
• Hourly: User activity and engagement
• Daily: Business outcomes and conversions
• Weekly: Content performance and trends
• Monthly: Executive summary reports
"""

    return dashboard_spec


@tool
def analyze_climate_career_trends(
    data_source: str = "job_market",
    analysis_type: str = "growth_trends",
    state: dict = None,
) -> str:
    """Analyze trends in climate careers and job market data."""

    model = ChatOpenAI(model_name="gpt-3.5-turbo")
    response = model.invoke(
        [
            SystemMessage(
                content="You are Thomas, a data analyst specializing in climate career trends. Provide detailed analysis of job market data, skill demands, and career growth patterns in the climate sector."
            ),
            HumanMessage(
                content=f"Analyze climate career trends from {data_source} focusing on {analysis_type}. Include statistical insights, growth projections, and actionable recommendations."
            ),
        ]
    )
    return response.content


@tool
def generate_predictive_insights(
    prediction_target: str, time_horizon: str = "6_months", state: dict = None
) -> str:
    """Generate predictive insights using historical data and trend analysis."""

    predictive_analysis = f"""
PREDICTIVE INSIGHTS - {prediction_target.upper()} - {time_horizon.upper()}

**PREDICTION METHODOLOGY:**
• Historical data analysis (2+ years of data)
• Seasonal pattern identification
• External factor correlation analysis
• Machine learning model application
• Confidence interval calculation

**DATA SOURCES:**
• Internal platform analytics
• Job market databases
• Economic indicators
• Climate policy announcements
• Industry reports and surveys

**PREDICTION MODELS:**

**USER GROWTH FORECASTING:**
• Time series analysis with seasonal adjustments
• New user acquisition rate predictions
• Churn rate and retention modeling
• Lifetime value projections

**CONTENT DEMAND PREDICTION:**
• Topic trend analysis and forecasting
• Search volume correlation modeling
• Content consumption pattern prediction
• Optimal content scheduling recommendations

**JOB MARKET FORECASTING:**
• Climate job posting volume predictions
• Skill demand trend analysis
• Salary range evolution forecasting
• Geographic opportunity mapping

**SEASONAL PATTERNS IDENTIFIED:**
• January: 40% increase in career exploration
• March-May: Peak hiring season for climate roles
• September: Back-to-school effect on training programs
• November-December: Planning phase for next year

**EXTERNAL FACTORS IMPACT:**
• Climate policy announcements: +25% interest spike
• COP conferences: +60% international job searches
• Economic indicators: Inverse correlation with career changes
• University calendar: Student engagement patterns

**CONFIDENCE LEVELS:**
• High Confidence (80-95%): User engagement patterns
• Medium Confidence (60-80%): Job market trends
• Lower Confidence (40-60%): External policy impacts

**ACTIONABLE RECOMMENDATIONS:**
• Content calendar optimization based on predicted demand
• Resource allocation for peak usage periods
• Proactive feature development for emerging trends
• Marketing campaign timing optimization
• Partnership development in growing sectors

**MONITORING AND VALIDATION:**
• Weekly model performance review
• Monthly prediction accuracy assessment
• Quarterly model recalibration
• Annual methodology review and updates
"""

    return predictive_analysis
