import logging

"""
Maria - Community Engagement Specialist Agent
Specializes in community outreach, organizing, and engagement for environmental justice initiatives.
"""

from typing import Dict, Any, List
import logging
from datetime import datetime
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_core.tools import tool
from langgraph.types import Command

# from langgraph.prebuilt import InjectedState
from typing import Annotated, Literal

from backend.agents.base.agent_base import BaseAgent, AgentState

logger = logging.getLogger(__name__)


class MariaAgent(BaseAgent):
    """
    Maria - Community Engagement Specialist
    Responsible for community outreach, organizing, and engagement strategies
    for environmental justice initiatives
    """

    def __init__(self):
        super().__init__(
            name="Maria",
            description="Community Engagement Specialist focusing on EJ community organizing and outreach",
            intelligence_level=8.5,
            tools=[
                "search_ej_communities",
                "community_organizing_toolkit",
                "stakeholder_mapping",
                "outreach_strategy_planning",
                "coalition_building",
                "grassroots_mobilization",
            ],
        )

        # Community engagement specializations
        self.specializations = [
            "Community organizing and mobilization",
            "Stakeholder engagement and mapping",
            "Coalition building and partnerships",
            "Grassroots campaign development",
            "Cultural competency and outreach",
            "Community-based participatory research",
            "Public participation and facilitation",
            "Environmental justice advocacy",
        ]

        # Community organizing strategies
        self.organizing_strategies = {
            "grassroots_mobilization": {
                "description": "Building power from the community up",
                "tactics": [
                    "Door-to-door canvassing",
                    "Community meetings",
                    "Petition drives",
                    "Phone banking",
                ],
                "timeline": "3-6 months for initial mobilization",
            },
            "coalition_building": {
                "description": "Creating alliances between organizations",
                "tactics": [
                    "Stakeholder mapping",
                    "Shared agenda development",
                    "Joint actions",
                    "Resource sharing",
                ],
                "timeline": "6-12 months for strong coalitions",
            },
            "policy_advocacy": {
                "description": "Influencing policy through community voice",
                "tactics": [
                    "Public testimony",
                    "Policy briefings",
                    "Media campaigns",
                    "Legislative visits",
                ],
                "timeline": "12-24 months for policy change",
            },
        }

        # Outreach methods for different communities
        self.outreach_methods = {
            "latino_hispanic": [
                "Spanish-language materials",
                "Community radio",
                "Church partnerships",
                "Cultural events",
            ],
            "african_american": [
                "Barbershop/salon outreach",
                "Church partnerships",
                "Community centers",
                "Local media",
            ],
            "indigenous": [
                "Tribal council engagement",
                "Cultural liaisons",
                "Traditional media",
                "Elders involvement",
            ],
            "low_income": [
                "Social service partnerships",
                "Food bank outreach",
                "Public housing engagement",
                "Transportation assistance",
            ],
            "immigrant": [
                "Multilingual materials",
                "Community leaders",
                "Cultural organizations",
                "Trusted messengers",
            ],
        }

        # Community engagement tools
        self.engagement_tools = [
            "Community asset mapping",
            "Power structure analysis",
            "Stakeholder engagement matrix",
            "Community survey development",
            "Focus group facilitation",
            "Public meeting planning",
            "Social media organizing",
            "Storytelling and narrative development",
        ]

    async def initialize(self) -> None:
        """Initialize Maria's community engagement resources"""
        await super().initialize()

        logger.info(
            "maria_initialized",
            specializations=len(self.specializations),
            organizing_strategies=len(self.organizing_strategies),
            outreach_methods=len(self.outreach_methods),
            engagement_tools=len(self.engagement_tools),
        )

    async def process_message(self, state: AgentState) -> Command[Literal["ej_team"]]:
        """Process message with community engagement focus"""
        try:
            # Extract user message
            user_message = next(
                (m["content"] for m in state.messages if m.get("role") == "user"), ""
            )

            # Analyze for community engagement needs
            engagement_context = await self._analyze_engagement_needs(user_message)

            # Generate specialized response
            response = await self._generate_engagement_response(
                user_message, engagement_context
            )

            # Create response message
            message = {
                "role": "assistant",
                "content": response,
                "agent": "maria",
                "team": "ej_team",
                "timestamp": datetime.now().isoformat(),
                "metadata": {
                    "engagement_context": engagement_context,
                    "specialization": "community_engagement",
                    "confidence_score": 0.9,
                },
            }

            # Update state
            new_messages = state.messages + [message]

            return Command(
                goto="ej_team",
                update={"messages": new_messages, "current_agent": "maria"},
            )

        except Exception as e:
            logger.error(f"Error in Maria agent: {str(e)}")
            return Command(
                goto="ej_team",
                update={
                    "messages": state.messages
                    + [
                        {
                            "role": "assistant",
                            "content": f"I apologize, but I encountered an error while processing your community engagement request. {str(e)}",
                            "agent": "maria",
                        }
                    ]
                },
            )

    async def _analyze_engagement_needs(self, message: str) -> Dict[str, Any]:
        """Analyze message for community engagement needs"""
        message_lower = message.lower()

        context = {
            "needs_organizing": False,
            "needs_outreach": False,
            "needs_coalition_building": False,
            "needs_advocacy": False,
            "community_type": None,
            "engagement_stage": "planning",
            "issue_focus": None,
        }

        # Check for organizing needs
        if any(
            word in message_lower
            for word in ["organize", "mobilize", "campaign", "movement"]
        ):
            context["needs_organizing"] = True

        # Check for outreach needs
        if any(
            word in message_lower
            for word in ["outreach", "engagement", "community", "residents"]
        ):
            context["needs_outreach"] = True

        # Check for coalition building
        if any(
            word in message_lower
            for word in ["coalition", "partnership", "alliance", "collaborate"]
        ):
            context["needs_coalition_building"] = True

        # Check for advocacy needs
        if any(
            word in message_lower
            for word in ["advocate", "policy", "government", "officials"]
        ):
            context["needs_advocacy"] = True

        # Identify community type
        for community_type in self.outreach_methods.keys():
            if community_type.replace("_", " ") in message_lower:
                context["community_type"] = community_type
                break

        # Determine engagement stage
        if any(
            word in message_lower for word in ["planning", "start", "begin", "how to"]
        ):
            context["engagement_stage"] = "planning"
        elif any(word in message_lower for word in ["implementing", "doing", "action"]):
            context["engagement_stage"] = "implementation"
        elif any(word in message_lower for word in ["evaluate", "assess", "measure"]):
            context["engagement_stage"] = "evaluation"

        # Identify issue focus
        if any(word in message_lower for word in ["pollution", "air quality", "water"]):
            context["issue_focus"] = "environmental_health"
        elif any(
            word in message_lower
            for word in ["housing", "gentrification", "displacement"]
        ):
            context["issue_focus"] = "housing_justice"
        elif any(word in message_lower for word in ["jobs", "economic", "workforce"]):
            context["issue_focus"] = "economic_justice"

        return context

    async def _generate_engagement_response(
        self, message: str, context: Dict[str, Any]
    ) -> str:
        """Generate specialized community engagement response"""
        response_parts = [
            "I'm Maria, your Community Engagement Specialist. I help communities organize, build power, and create lasting change for environmental justice."
        ]

        # Address specific engagement needs
        if context["needs_organizing"]:
            strategy = context.get("engagement_stage", "planning")
            if strategy in self.organizing_strategies:
                strategy_info = self.organizing_strategies[strategy]
                response_parts.append(
                    f"\n**Community Organizing Strategy - {strategy.replace('_', ' ').title()}:**"
                )
                response_parts.append(f"• Focus: {strategy_info['description']}")
                response_parts.append("• Key tactics:")
                for tactic in strategy_info["tactics"]:
                    response_parts.append(f"  - {tactic}")
                response_parts.append(f"• Timeline: {strategy_info['timeline']}")
            else:
                response_parts.append(
                    "\n**Community Organizing Essentials:**"
                    "\n• Start with relationship building and listening"
                    "\n• Map community assets and power structures"
                    "\n• Identify shared concerns and priorities"
                    "\n• Develop leadership from within the community"
                    "\n• Create clear, winnable campaign goals"
                )

        if context["needs_outreach"]:
            community_type = context.get("community_type")
            if community_type and community_type in self.outreach_methods:
                methods = self.outreach_methods[community_type]
                response_parts.append(
                    f"\n**Outreach Strategies for {community_type.replace('_', ' ').title()} Communities:**"
                )
                for method in methods:
                    response_parts.append(f"• {method}")
            else:
                response_parts.append(
                    "\n**Effective Community Outreach:**"
                    "\n• Meet people where they are (physically and culturally)"
                    "\n• Use trusted messengers and community leaders"
                    "\n• Provide information in accessible formats and languages"
                    "\n• Address immediate needs while building long-term power"
                    "\n• Follow up consistently and build relationships"
                )

        if context["needs_coalition_building"]:
            response_parts.append(
                "\n**Coalition Building Best Practices:**"
                "\n• Map potential allies and their interests"
                "\n• Develop shared values and common agenda"
                "\n• Establish clear roles and decision-making processes"
                "\n• Plan joint actions that benefit all members"
                "\n• Maintain regular communication and coordination"
                "\n• Celebrate victories together and learn from setbacks"
            )

        if context["needs_advocacy"]:
            response_parts.append(
                "\n**Policy Advocacy Strategies:**"
                "\n• Research the policy landscape and decision-makers"
                "\n• Develop clear, specific policy asks"
                "\n• Build broad community support for your position"
                "\n• Use multiple tactics: meetings, testimony, media, protests"
                "\n• Track progress and adapt strategies as needed"
            )

        # Add tools and resources
        response_parts.append("\n**Community Engagement Tools I Can Help With:**")
        for tool in self.engagement_tools[:4]:  # Show first 4 tools
            response_parts.append(f"• {tool}")

        # Add next steps based on context
        issue_focus = context.get("issue_focus", "environmental justice")
        response_parts.append(
            f"\n**Next Steps for {issue_focus.replace('_', ' ').title()}:**"
            "\n1. Conduct community listening sessions"
            "\n2. Map stakeholders and power structures"
            "\n3. Develop organizing strategy and timeline"
            "\n4. Build leadership team and recruit volunteers"
            "\n5. Launch campaign with clear, winnable goals"
        )

        response_parts.append(
            "\nRemember: Sustainable change comes from organized communities with power. I'm here to help you build that power step by step. What's the first challenge you'd like to tackle?"
        )

        return "\n".join(response_parts)

    def get_capabilities(self) -> Dict[str, Any]:
        """Get Maria's enhanced capabilities"""
        base_capabilities = super().get_capabilities()
        base_capabilities.update(
            {
                "specializations": self.specializations,
                "organizing_strategies": list(self.organizing_strategies.keys()),
                "outreach_methods": list(self.outreach_methods.keys()),
                "engagement_tools": self.engagement_tools,
                "community_focused": True,
                "organizing_expertise": True,
            }
        )
        return base_capabilities


# Tools for Maria
@tool
def create_community_organizing_plan(
    issue: str, community_type: str = "general", state: dict = None
) -> str:
    """Create a comprehensive community organizing plan for a specific issue."""

    plan = f"""
COMMUNITY ORGANIZING PLAN - {issue.upper()}

**PHASE 1: FOUNDATION BUILDING (Months 1-2)**
• Conduct community listening sessions
• Map community assets and resources
• Identify key stakeholders and decision-makers
• Research the issue and policy landscape
• Build organizing committee with diverse representation

**PHASE 2: POWER BUILDING (Months 3-4)**
• Recruit and train community leaders
• Develop shared vision and campaign goals
• Create communication strategy and materials
• Build relationships with potential allies
• Plan signature community event or action

**PHASE 3: ACTION AND ADVOCACY (Months 5-6)**
• Launch public campaign with media strategy
• Engage decision-makers through meetings and testimony
• Organize community actions and demonstrations
• Build broader coalition support
• Track progress and adjust tactics

**PHASE 4: SUSTAINING CHANGE (Ongoing)**
• Monitor implementation of any victories
• Continue leadership development
• Plan for long-term organizational sustainability
• Celebrate successes and learn from challenges
• Prepare for next campaign or issue

**COMMUNITY-SPECIFIC CONSIDERATIONS:**
"""

    if community_type == "latino_hispanic":
        plan += """
• Ensure Spanish-language materials and interpretation
• Partner with churches and cultural organizations
• Engage promotoras (community health workers)
• Respect cultural values around family and community
"""
    elif community_type == "african_american":
        plan += """
• Build on historical organizing traditions
• Partner with churches and community institutions
• Address intersectional issues of race and environment
• Connect to broader civil rights and justice movements
"""
    else:
        plan += """
• Adapt outreach methods to community culture and preferences
• Use trusted messengers and existing social networks
• Address language and accessibility barriers
• Connect environmental issues to community priorities
"""

    return plan


@tool
def develop_stakeholder_engagement_strategy(
    issue: str, location: str, state: dict = None
) -> str:
    """Develop a stakeholder engagement strategy for environmental justice issues."""

    strategy = f"""
STAKEHOLDER ENGAGEMENT STRATEGY - {issue} in {location}

**PRIMARY STAKEHOLDERS (Directly Affected):**
• Community residents and families
• Local community organizations
• Environmental justice groups
• Affected workers and unions
• Community health advocates

**SECONDARY STAKEHOLDERS (Influence/Interest):**
• Local government officials
• State and federal agencies
• Environmental organizations
• Public health departments
• Academic researchers
• Media outlets

**KEY DECISION-MAKERS:**
• Mayor and city council members
• State legislators and governor
• Regulatory agency officials
• Company executives (if applicable)
• Federal representatives

**ENGAGEMENT TACTICS BY STAKEHOLDER:**

Community Residents:
• Door-to-door canvassing and surveys
• Community meetings and forums
• Social media and text messaging
• Cultural events and gatherings

Government Officials:
• One-on-one meetings and briefings
• Public testimony at hearings
• Policy briefings and fact sheets
• Coordinated constituent pressure

Agencies:
• Formal comments on proposals
• Technical review and analysis
• Public participation in processes
• Legal advocacy when necessary

Media:
• Press releases and media advisories
• Community spokesperson training
• Story pitching and relationship building
• Social media campaigns

**ENGAGEMENT TIMELINE:**
Month 1-2: Map stakeholders and build relationships
Month 3-4: Launch community engagement phase
Month 5-6: Intensify decision-maker pressure
Month 7+: Sustain engagement and monitor progress
"""

    return strategy


@tool
def create_community_survey(issue: str, state: dict = None) -> str:
    """Create a community survey to assess concerns and priorities."""

    survey = f"""
COMMUNITY SURVEY - {issue.upper()} CONCERNS

**Introduction:**
We are conducting this survey to better understand community concerns about {issue} and how it affects your daily life. Your responses will help us advocate for solutions that meet community needs.

**SECTION 1: BASIC INFORMATION**
1. What is your zip code?
2. How long have you lived in this community?
3. Do you rent or own your home?
4. What is your age range? (18-29, 30-49, 50-64, 65+)

**SECTION 2: ENVIRONMENTAL CONCERNS**
5. How concerned are you about {issue} in your community?
   (Very concerned, Somewhat concerned, Not very concerned, Not at all concerned)

6. How has {issue} affected you or your family? (Check all that apply)
   □ Health problems
   □ Property values
   □ Quality of life
   □ Children's wellbeing
   □ Other: ___________

7. What specific problems have you noticed? (Open-ended)

**SECTION 3: INFORMATION AND ENGAGEMENT**
8. Where do you usually get information about community issues?
   □ Social media
   □ Local news
   □ Community meetings
   □ Neighbors/friends
   □ Other: ___________

9. Would you be interested in attending community meetings about this issue?
10. Would you be willing to take action to address this problem?

**SECTION 4: SOLUTIONS AND PRIORITIES**
11. What solutions would you most like to see? (Open-ended)
12. What is the most important thing for our community to focus on?

**Contact Information (Optional):**
Name: ___________
Email: ___________
Phone: ___________

Thank you for your participation! Your voice matters in creating positive change for our community.
"""

    return survey
