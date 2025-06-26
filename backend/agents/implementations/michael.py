import logging

"""
Michael - Technical Support Specialist Agent
Specializes in technical troubleshooting, system support, and user assistance.
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


class MichaelAgent(BaseAgent):
    """
    Michael - Technical Support Specialist
    Responsible for technical troubleshooting and user support
    """

    def __init__(self):
        super().__init__(
            name="Michael",
            description="Technical Support Specialist focusing on troubleshooting and user assistance",
            intelligence_level=8.0,
            tools=[
                "technical_troubleshooting",
                "system_diagnostics",
                "user_support_guidance",
                "platform_optimization",
                "error_resolution",
            ],
        )

    async def process_message(
        self, state: AgentState
    ) -> Command[Literal["support_team"]]:
        """Process message with technical support focus"""
        try:
            user_message = next(
                (m["content"] for m in state.messages if m.get("role") == "user"), ""
            )

            response = "I'm Michael, your Technical Support Specialist. I help troubleshoot technical issues, provide system support, optimize platform performance, and assist with user technical questions."

            message = {
                "role": "assistant",
                "content": response,
                "agent": "michael",
                "team": "support_team",
                "timestamp": datetime.now().isoformat(),
                "metadata": {
                    "specialization": "technical_support",
                    "confidence_score": 0.9,
                },
            }

            new_messages = state.messages + [message]

            return Command(
                goto="support_team",
                update={"messages": new_messages, "current_agent": "michael"},
            )

        except Exception as e:
            logger.error(f"Error in Michael agent: {str(e)}")
            return Command(
                goto="support_team",
                update={
                    "messages": state.messages
                    + [
                        {
                            "role": "assistant",
                            "content": f"I apologize, but I encountered an error. {str(e)}",
                            "agent": "michael",
                        }
                    ]
                },
            )


# Tools for Michael
@tool
def diagnose_technical_issue(
    issue_description: str, user_environment: str = "web_browser", state: dict = None
) -> str:
    """Diagnose technical issues and provide troubleshooting guidance."""

    diagnostic_guide = f"""
TECHNICAL ISSUE DIAGNOSIS - {user_environment.upper()}

**ISSUE ANALYSIS:**
{issue_description}

**COMMON CAUSES AND SOLUTIONS:**

**BROWSER-RELATED ISSUES:**
• Cache and Cookies: Clear browser cache and cookies
• Browser Compatibility: Ensure using supported browser (Chrome, Firefox, Safari)
• Extensions: Disable browser extensions that might interfere
• JavaScript: Ensure JavaScript is enabled
• Pop-up Blockers: Check if pop-ups are being blocked

**NETWORK CONNECTIVITY:**
• Internet Connection: Verify stable internet connection
• Firewall Settings: Check corporate firewall restrictions
• VPN Issues: Try connecting without VPN if applicable
• DNS Problems: Try using different DNS servers (8.8.8.8, 1.1.1.1)

**PLATFORM-SPECIFIC ISSUES:**
• Account Authentication: Verify login credentials
• Session Timeout: Re-login if session has expired
• Feature Access: Check if user has required permissions
• Data Sync: Allow time for data synchronization

**MOBILE DEVICE ISSUES:**
• App Version: Ensure latest app version is installed
• Device Storage: Check available storage space
• Operating System: Verify OS compatibility
• App Permissions: Ensure required permissions are granted

**STEP-BY-STEP TROUBLESHOOTING:**

1. **IMMEDIATE ACTIONS:**
   • Refresh the page (Ctrl+F5 or Cmd+R)
   • Try in incognito/private browsing mode
   • Test on different device or browser
   • Check platform status page

2. **INTERMEDIATE STEPS:**
   • Clear browser cache and cookies
   • Disable browser extensions temporarily
   • Check internet connection speed
   • Try different network connection

3. **ADVANCED TROUBLESHOOTING:**
   • Check browser console for error messages
   • Verify firewall and security settings
   • Test with different user account
   • Document error messages and screenshots

**ESCALATION CRITERIA:**
• Issue persists after basic troubleshooting
• Error affects multiple users
• Data loss or corruption suspected
• Security-related concerns
• Critical functionality impacted

**PREVENTION MEASURES:**
• Keep browser and apps updated
• Regular cache clearing
• Use supported browsers and devices
• Maintain stable internet connection
• Follow platform best practices

**SUPPORT RESOURCES:**
• Help documentation and FAQs
• Video tutorials and guides
• Community forums and discussions
• Live chat support availability
• Email support for complex issues
"""

    return diagnostic_guide


@tool
def provide_platform_guidance(
    feature_area: str, user_level: str = "beginner", state: dict = None
) -> str:
    """Provide step-by-step guidance for platform features."""

    guidance = f"""
PLATFORM GUIDANCE - {feature_area.upper()} - {user_level.upper()} LEVEL

**FEATURE OVERVIEW:**
Understanding and using {feature_area} effectively

**STEP-BY-STEP INSTRUCTIONS:**

**GETTING STARTED:**
1. **Access the Feature:**
   • Navigate to the appropriate section
   • Ensure you're logged in with proper permissions
   • Look for the {feature_area} menu or button

2. **Initial Setup:**
   • Complete any required profile information
   • Review and accept terms if applicable
   • Configure basic settings and preferences

3. **Basic Usage:**
   • Start with simple tasks to familiarize yourself
   • Use tooltips and help icons for guidance
   • Save your progress regularly

**COMMON TASKS:**

**FOR BEGINNERS:**
• Follow guided tutorials and walkthroughs
• Use default settings initially
• Focus on core functionality first
• Ask for help when needed

**FOR INTERMEDIATE USERS:**
• Explore advanced features gradually
• Customize settings to match your needs
• Use bulk operations for efficiency
• Integrate with other tools

**FOR ADVANCED USERS:**
• Leverage automation features
• Use API integrations if available
• Optimize workflows for maximum efficiency
• Share knowledge with other users

**BEST PRACTICES:**
• Keep your profile and information updated
• Use strong, unique passwords
• Enable two-factor authentication
• Regularly review privacy settings
• Back up important data

**TROUBLESHOOTING TIPS:**
• Check for browser compatibility
• Ensure stable internet connection
• Clear cache if experiencing issues
• Try different devices or browsers
• Contact support for persistent problems

**OPTIMIZATION SUGGESTIONS:**
• Use keyboard shortcuts for efficiency
• Set up notifications for important updates
• Organize your workspace logically
• Take advantage of search and filter features
• Regularly clean up unused data

**SUPPORT RESOURCES:**
• Interactive tutorials and demos
• Video guides and webinars
• Community forums and discussions
• Knowledge base articles
• Direct support channels
"""

    return guidance


@tool
def analyze_system_performance(
    performance_area: str = "general", state: dict = None
) -> str:
    """Analyze system performance and provide optimization recommendations."""

    model = ChatOpenAI(model_name="gpt-3.5-turbo")
    response = model.invoke(
        [
            SystemMessage(
                content="You are Michael, a technical support specialist analyzing system performance. Provide detailed analysis of performance issues and optimization recommendations."
            ),
            HumanMessage(
                content=f"Analyze system performance for {performance_area}. Include performance metrics, bottleneck identification, and specific optimization recommendations."
            ),
        ]
    )
    return response.content


@tool
def create_user_support_ticket(
    issue_type: str,
    priority_level: str = "medium",
    issue_details: str = "",
    state: dict = None,
) -> str:
    """Create and manage user support tickets with proper categorization."""

    ticket_template = f"""
SUPPORT TICKET CREATION - {issue_type.upper()}

**TICKET INFORMATION:**
• Ticket ID: Generated automatically upon submission
• Priority Level: {priority_level.upper()}
• Issue Category: {issue_type}
• Creation Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

**ISSUE DETAILS:**
{issue_details if issue_details else "Please provide detailed description of the issue"}

**REQUIRED INFORMATION:**
• User Account: Username or email address
• Browser/Device: Browser version and operating system
• Steps to Reproduce: Detailed steps that led to the issue
• Expected Behavior: What should have happened
• Actual Behavior: What actually happened
• Error Messages: Any error messages or codes
• Screenshots: Visual evidence of the issue

**PRIORITY LEVELS:**

**CRITICAL (Response within 1 hour):**
• System outages or major functionality failures
• Security breaches or data loss
• Issues affecting multiple users
• Revenue-impacting problems

**HIGH (Response within 4 hours):**
• Important feature not working
• Performance degradation
• User unable to complete key tasks
• Integration failures

**MEDIUM (Response within 24 hours):**
• Minor functionality issues
• Questions about features
• Enhancement requests
• Documentation updates

**LOW (Response within 72 hours):**
• General questions
• Feature requests
• Cosmetic issues
• Training requests

**TROUBLESHOOTING CHECKLIST:**
Before submitting, please try:
□ Refreshing the page or restarting the app
□ Clearing browser cache and cookies
□ Trying a different browser or device
□ Checking internet connection
□ Reviewing help documentation

**ESCALATION PROCESS:**
• Level 1: Initial support response and basic troubleshooting
• Level 2: Technical specialist involvement
• Level 3: Engineering team consultation
• Level 4: Product team and management involvement

**EXPECTED RESOLUTION TIMES:**
• Simple issues: 1-2 business days
• Complex technical issues: 3-5 business days
• Feature requests: 2-4 weeks
• System enhancements: 1-3 months

**FOLLOW-UP PROCESS:**
• Regular status updates provided
• User notification upon resolution
• Satisfaction survey after closure
• Knowledge base updates if applicable
"""

    return ticket_template
