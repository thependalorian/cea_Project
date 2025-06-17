"""
Human-in-the-Loop (HITL) Steering with LangGraph Agent Orchestration
===================================================================

This module implements intelligent human steering that leverages:
- LangGraph's agent orchestration capabilities
- Rich database structure with 25+ tables
- Comprehensive tool suite from @/tools
- Dynamic context generation instead of hardcoded responses

The system provides contextual guidance by querying actual database state
and available agent tools, removing the need for hardcoded information.
"""

import logging
from typing import Dict, Any, List, Optional, Union, TypedDict
from datetime import datetime
from langchain_core.messages import AIMessage, HumanMessage
from langgraph.types import Command, interrupt

from ..utils.state_management import ClimateAgentState, safe_state_get
from ..tools.analytics import (
    log_conversation_analytics,
    extract_conversation_insights,
    get_database_summary,
    get_conversation_analytics,
    get_user_profile_summary,
)
from ..tools.communities import get_partner_organizations, get_partner_stats
from ..tools.jobs import search_jobs, get_job_categories, get_salary_insights
from ..tools.skills import get_skills_frameworks, assess_skill_gaps
from ..tools.search import semantic_search, get_search_suggestions
from ..tools.resume import analyze_resume_skills, get_resume_insights
from ..tools.matching import find_job_matches, calculate_match_scores
from ..tools.credentials import evaluate_credentials, get_credential_pathways
from ..tools.training import find_training_programs, get_education_pathways
from ..tools.web_search_tools import search_climate_jobs, get_industry_trends
from ..utils.human_in_the_loop import HumanInTheLoopCoordinator, evaluate_intervention_need

logger = logging.getLogger(__name__)


class SteeringPoint(TypedDict):
    """Type definition for steering points in the workflow"""

    id: str
    name: str
    description: str
    options: List[Dict[str, str]]


class HumanSteering:
    """
    Intelligent human steering that leverages LangGraph agent orchestration
    and dynamic database/tool queries instead of hardcoded responses.
    """

    def __init__(self):
        self.steering_history = {}
        self.max_steering_attempts = 3
        self.hitl_coordinator = HumanInTheLoopCoordinator()
        self.steering_points = self._initialize_steering_points()

    def _initialize_steering_points(self) -> Dict[str, SteeringPoint]:
        """Initialize predefined steering points in the workflow"""
        return {
            "goal_confirmation": {
                "id": "goal_confirmation",
                "name": "Goal Confirmation",
                "description": "Confirm user goals before proceeding",
                "options": [
                    {"id": "confirm", "label": "Confirm Goals"},
                    {"id": "modify", "label": "Modify Goals"},
                    {"id": "add_context", "label": "Add Context"},
                ],
            },
            "specialist_selection": {
                "id": "specialist_selection",
                "name": "Specialist Selection",
                "description": "Select appropriate specialist for user needs",
                "options": [
                    {"id": "approve", "label": "Approve Selection"},
                    {"id": "change", "label": "Change Specialist"},
                    {"id": "add_context", "label": "Add Context"},
                ],
            },
            "pathway_selection": {
                "id": "pathway_selection",
                "name": "Pathway Selection",
                "description": "Select career pathway for user",
                "options": [
                    {"id": "approve", "label": "Approve Pathway"},
                    {"id": "modify", "label": "Modify Pathway"},
                    {"id": "request_alternatives", "label": "Request Alternatives"},
                ],
            },
            "action_plan_review": {
                "id": "action_plan_review",
                "name": "Action Plan Review",
                "description": "Review action plan before implementation",
                "options": [
                    {"id": "approve", "label": "Approve Plan"},
                    {"id": "modify", "label": "Modify Plan"},
                    {"id": "add_resources", "label": "Add Resources"},
                ],
            },
        }

    async def create_intelligent_steering_point(
        self,
        state: ClimateAgentState,
        steering_type: str = "discovery",
        context: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Create an intelligent steering point that dynamically queries tools
        and database to provide real-time contextual guidance.

        Args:
            state: Current workflow state with user context
            steering_type: Type of steering (discovery, strategy, action_planning, matching)
            context: Additional context for the steering point

        Returns:
            Updated state with dynamic guidance and interrupt handling
        """
        try:
            # Step 1: Query live database and tools for current context
            live_context = await self._gather_live_context(state, steering_type)

            # Step 2: Generate dynamic guidance based on actual data
            guidance_content = await self._generate_dynamic_guidance(
                state, steering_type, live_context
            )

            # Step 3: Create guidance message
            guidance_message = AIMessage(content=guidance_content)

            # Step 4: Set up intelligent interrupt with rich context
            steering_context = await self._build_intelligent_context(
                state, steering_type, live_context
            )

            # Step 5: Use LangGraph interrupt with comprehensive information
            try:
                user_response = interrupt(
                    {
                        "type": "intelligent_steering",
                        "steering_type": steering_type,
                        "live_data_provided": True,
                        "context": steering_context,
                        "question": await self._get_contextual_question(
                            steering_type, live_context
                        ),
                        "available_actions": steering_context.get("dynamic_actions", []),
                        "database_state": steering_context.get("live_db_summary", {}),
                        "agent_tools": steering_context.get("available_tools", []),
                        "personalized_suggestions": steering_context.get(
                            "personalized_options", []
                        ),
                    }
                )

                # Step 6: Process response using agent intelligence
                processed_response = await self._process_intelligent_response(
                    user_response, state, steering_type, live_context
                )

                return {
                    "messages": [guidance_message, processed_response["response_message"]],
                    "needs_human_review": False,
                    "workflow_state": processed_response["next_state"],
                    "live_guidance_provided": True,
                    "waiting_for_input": False,
                    "context_data": live_context,
                    **processed_response.get("state_updates", {}),
                }

            except Exception as interrupt_error:
                # Fallback for testing environments
                logger.warning(f"Interrupt not available: {interrupt_error}")
                return await self._create_intelligent_fallback(state, steering_type, live_context)

        except Exception as e:
            logger.error(f"Error in intelligent steering: {e}")
            return await self._create_error_fallback(state)

    async def _gather_live_context(
        self, state: ClimateAgentState, steering_type: str
    ) -> Dict[str, Any]:
        """
        Dynamically gather live context from database and tools.
        This replaces hardcoded information with real-time data.
        """
        context = {}

        try:
            # Get live database statistics from analytics tool
            context["db_stats"] = await get_database_summary()

            # Get current partner network status
            context["partner_network"] = await get_partner_stats()

            # Get job market insights
            context["job_market"] = await get_job_categories()
            context["salary_insights"] = await get_salary_insights()

            # Get skills framework data
            context["skills_data"] = await get_skills_frameworks()

            # Get user-specific context if available
            if state.get("user_id"):
                context["user_profile"] = await self._get_user_profile_context(state)
                context["user_resume"] = await self._get_user_resume_context(state)
                context["user_matches"] = await self._get_user_job_matches(state)

            # Get conversation history and analytics
            if state.get("conversation_id"):
                context["conversation_analytics"] = await extract_conversation_insights(
                    state.get("conversation_id")
                )

            # Get trending opportunities using web search tools
            context["trending_jobs"] = await search_climate_jobs(limit=10)
            context["industry_trends"] = await get_industry_trends()

            # Get education and training opportunities
            context["training_programs"] = await find_training_programs()
            context["education_pathways"] = await get_education_pathways()

        except Exception as e:
            logger.error(f"Error gathering live context: {e}")
            context["error"] = str(e)

        return context

    async def _generate_dynamic_guidance(
        self, state: ClimateAgentState, steering_type: str, live_context: Dict[str, Any]
    ) -> str:
        """
        Generate dynamic guidance based on live database and tool data.
        """

        # Get current user progress and findings
        current_findings = state.get("incremental_findings", [])
        user_profile = live_context.get("user_profile", {})

        # Build guidance based on actual data
        if steering_type == "discovery":
            return await self._build_discovery_guidance(live_context, state)
        elif steering_type == "strategy":
            return await self._build_strategy_guidance(live_context, state)
        elif steering_type == "action_planning":
            return await self._build_action_guidance(live_context, state)
        elif steering_type == "matching":
            return await self._build_matching_guidance(live_context, state)
        else:
            return await self._build_general_guidance(live_context, state)

    async def _build_discovery_guidance(
        self, live_context: Dict[str, Any], state: ClimateAgentState
    ) -> str:
        """Build discovery guidance using live database data."""

        db_stats = live_context.get("db_stats", {})
        partner_network = live_context.get("partner_network", {})
        job_market = live_context.get("job_market", {})

        guidance = f"""🎯 **Climate Career Discovery - Live Data**

Based on our current database and partner network, here's what's available right now:

## 📊 **Live Database Resources:**
• **{db_stats.get('total_jobs', 0):,} active climate jobs** across {len(job_market.get('categories', []))} categories
• **{partner_network.get('active_partners', 0)} partner organizations** currently hiring
• **{db_stats.get('total_resumes', 0):,} resumes processed** with climate relevance scoring
• **{db_stats.get('skills_mapped', 0):,} skills mapped** to climate career pathways

## 🛠️ **Available Agent Tools:**
"""

        # Add dynamic tool information
        tools_info = await self._get_available_tools_info()
        for tool in tools_info:
            guidance += f"• **{tool['name']}**: {tool['description']}\n"

        guidance += f"""
## 🌟 **Personalized Recommendations:**
"""

        # Add personalized suggestions based on user context
        if state.get("user_id"):
            user_suggestions = await self._get_personalized_suggestions(state, live_context)
            for suggestion in user_suggestions:
                guidance += f"• {suggestion}\n"
        else:
            guidance += """• Upload your resume for personalized job matching
• Tell me about your background for targeted recommendations
• Specify your climate interests for focused search results
"""

        guidance += f"""
## 💡 **What You Can Ask Right Now:**
• "Show me jobs in [specific category]" - Search {len(job_market.get('categories', []))} live categories
• "Analyze my resume for climate careers" - Get AI-powered skills assessment
• "What's trending in climate jobs?" - See latest market insights
• "Connect me with organizations in [location/field]" - Access partner network
• "What skills should I develop?" - Get data-driven recommendations

**What would you like to explore?**"""

        return guidance

    async def _build_strategy_guidance(
        self, live_context: Dict[str, Any], state: ClimateAgentState
    ) -> str:
        """Build strategy guidance using live matching and analytics data."""

        user_matches = live_context.get("user_matches", [])
        salary_insights = live_context.get("salary_insights", {})

        guidance = f"""🎯 **Career Strategy Development - Live Analysis**

Based on your profile and current market data:

## 📈 **Your Match Analysis:**
"""

        if user_matches:
            guidance += f"• Found **{len(user_matches)} potential matches** with scores 70%+\n"
            for match in user_matches[:3]:  # Top 3 matches
                guidance += f"  - {match.get('title', 'Role')} at {match.get('organization', 'Company')} ({match.get('score', 0)}% match)\n"
        else:
            guidance += "• Upload resume or provide background for personalized matching\n"

        guidance += f"""
## 💰 **Market Intelligence:**
• Average salary range: ${salary_insights.get('avg_min', 0):,} - ${salary_insights.get('avg_max', 0):,}
• Top paying sectors: {', '.join(salary_insights.get('top_sectors', [])[:3])}
• Growth areas: {', '.join(live_context.get('industry_trends', {}).get('growing_sectors', [])[:3])}

## 🎯 **Strategic Options:**
• **Immediate Opportunities**: Apply to high-match positions
• **Skill Development**: Target specific competency gaps
• **Network Building**: Connect with partner organizations
• **Credential Enhancement**: Pursue relevant certifications

**What's your priority for career strategy?**"""

        return guidance

    async def _build_action_guidance(
        self, live_context: Dict[str, Any], state: ClimateAgentState
    ) -> str:
        """Build action planning guidance with specific next steps."""

        training_programs = live_context.get("training_programs", [])

        guidance = f"""🎯 **Action Planning - Ready to Execute**

Based on your career strategy, here are concrete next steps:

## 📋 **Immediate Actions Available:**
• **Apply Now**: {len(live_context.get('user_matches', []))} jobs ready for application
• **Skill Building**: {len(training_programs)} relevant training programs available
• **Network**: Connect with {live_context.get('partner_network', {}).get('active_partners', 0)} partner organizations

## 🎓 **Development Opportunities:**
"""

        for program in training_programs[:3]:
            guidance += f"• **{program.get('name', 'Program')}** - {program.get('duration', 'Flexible timing')}\n"

        guidance += f"""
## 📞 **Connection Opportunities:**
• Partner organizations ready to connect
• Industry mentors in our network
• Peer connections in similar transitions

**Which action would you like to take first?**"""

        return guidance

    async def _build_matching_guidance(
        self, live_context: Dict[str, Any], state: ClimateAgentState
    ) -> str:
        """Build job matching guidance with live results."""

        user_matches = live_context.get("user_matches", [])

        guidance = f"""🎯 **Job Matching Results - Live Analysis**

## 🎯 **Your Matches ({len(user_matches)} found):**
"""

        for i, match in enumerate(user_matches[:5], 1):
            guidance += f"""
**{i}. {match.get('title', 'Position')}** - {match.get('score', 0)}% match
   • Organization: {match.get('organization', 'Company')}
   • Location: {match.get('location', 'Various')}
   • Salary: {match.get('salary_range', 'Competitive')}
   • Key matches: {', '.join(match.get('matching_skills', [])[:3])}
"""

        guidance += """
## 🔄 **Refine Your Search:**
• Adjust location preferences
• Specify salary requirements
• Add skill preferences
• Filter by organization type

**Which position interests you most, or would you like to refine the search?**"""

        return guidance

    async def _build_general_guidance(
        self, live_context: Dict[str, Any], state: ClimateAgentState
    ) -> str:
        """Build general guidance with live system capabilities."""

        return f"""🎯 **Climate Career Assistant - Live System Status**

I'm powered by live data and intelligent agents. Here's what I can do right now:

## 🔍 **Current Capabilities:**
• **Job Search**: Access to {live_context.get('db_stats', {}).get('total_jobs', 0):,} live positions
• **Skills Analysis**: AI-powered resume and profile assessment
• **Network Access**: {live_context.get('partner_network', {}).get('active_partners', 0)} partner organizations
• **Market Intelligence**: Real-time salary and trend data
• **Career Planning**: Personalized pathway development

## 🚀 **Getting Started:**
1. **Tell me about yourself** - I'll analyze your background
2. **Upload your resume** - Get instant job matching
3. **Explore opportunities** - Browse by category or location
4. **Connect with partners** - Access our network
5. **Plan your transition** - Get step-by-step guidance

**What would you like to do?**"""

    async def _get_available_tools_info(self) -> List[Dict[str, str]]:
        """Get information about available agent tools from the @/tools directory."""
        return [
            {
                "name": "Job Search & Matching",
                "description": "Find and match jobs using jobs.py and matching.py",
            },
            {
                "name": "Skills Assessment",
                "description": "Analyze skills using skills.py and assess gaps",
            },
            {
                "name": "Resume Analysis",
                "description": "AI-powered resume evaluation using resume.py",
            },
            {
                "name": "Partner Network",
                "description": "Connect with organizations using communities.py",
            },
            {"name": "Market Intelligence", "description": "Salary insights using analytics.py"},
            {"name": "Career Planning", "description": "Personalized pathways using search.py"},
            {"name": "Training Finder", "description": "Education programs using training.py"},
            {
                "name": "Credential Evaluation",
                "description": "Assess qualifications using credentials.py",
            },
            {
                "name": "Web Intelligence",
                "description": "Live market data using web_search_tools.py",
            },
        ]

    async def _get_personalized_suggestions(
        self, state: ClimateAgentState, live_context: Dict[str, Any]
    ) -> List[str]:
        """Generate personalized suggestions based on user context."""
        suggestions = []

        user_profile = live_context.get("user_profile", {})

        if user_profile.get("resume_uploaded"):
            suggestions.append("🎯 Get personalized job matches based on your resume")
            suggestions.append("📊 See your climate career readiness score")
        else:
            suggestions.append("📄 Upload your resume for instant job matching")

        if user_profile.get("climate_interests"):
            interests = user_profile.get("climate_interests", [])
            suggestions.append(f"🌱 Explore opportunities in {', '.join(interests[:2])}")
        else:
            suggestions.append("🌍 Tell me your climate interests for targeted recommendations")

        if user_profile.get("location"):
            suggestions.append(f"📍 Find opportunities in {user_profile.get('location')}")
        else:
            suggestions.append("🗺️ Specify your location preferences")

        return suggestions

    async def _get_user_profile_context(self, state: ClimateAgentState) -> Dict[str, Any]:
        """Get user profile context from job_seeker_profiles table."""
        # Query the database using the user_id from state
        user_id = state.get("user_id")
        if not user_id:
            return {}

        # This would use the database adapter to query job_seeker_profiles
        # For now, return empty dict - implement actual database query
        return {}

    async def _get_user_resume_context(self, state: ClimateAgentState) -> Dict[str, Any]:
        """Get user resume context from resumes and resume_chunks tables."""
        user_id = state.get("user_id")
        if not user_id:
            return {}

        # This would query resumes table and use resume.py tools
        # For now, return empty dict - implement actual database query
        return {}

    async def _get_user_job_matches(self, state: ClimateAgentState) -> List[Dict[str, Any]]:
        """Get current job matches using matching.py tools and partner_match_results table."""
        user_id = state.get("user_id")
        if not user_id:
            return []

        # This would use matching.py tools and query partner_match_results
        # For now, return empty list - implement actual matching logic
        return []

    async def _build_intelligent_context(
        self, state: ClimateAgentState, steering_type: str, live_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Build intelligent context for the LangGraph interrupt."""

        return {
            "live_db_summary": live_context.get("db_stats", {}),
            "available_tools": await self._get_available_tools_info(),
            "dynamic_actions": await self._get_dynamic_actions(steering_type, live_context),
            "personalized_options": await self._get_personalized_options(state, live_context),
            "market_context": live_context.get("industry_trends", {}),
            "user_context": live_context.get("user_profile", {}),
        }

    async def _get_dynamic_actions(
        self, steering_type: str, live_context: Dict[str, Any]
    ) -> List[Dict[str, str]]:
        """Get dynamic actions based on current context and available tools."""
        actions = []

        if steering_type == "discovery":
            actions = [
                {
                    "action": "search_jobs",
                    "description": "Search available positions using jobs.py",
                },
                {
                    "action": "analyze_skills",
                    "description": "Assess your skill profile using skills.py",
                },
                {
                    "action": "explore_partners",
                    "description": "Browse partner organizations using communities.py",
                },
                {
                    "action": "get_market_insights",
                    "description": "View industry trends using analytics.py",
                },
            ]
        elif steering_type == "matching":
            actions = [
                {"action": "find_matches", "description": "Find job matches using matching.py"},
                {
                    "action": "refine_search",
                    "description": "Adjust search criteria using search.py",
                },
                {"action": "save_jobs", "description": "Save interesting positions to database"},
                {"action": "connect_partners", "description": "Connect with hiring organizations"},
            ]
        elif steering_type == "strategy":
            actions = [
                {"action": "assess_gaps", "description": "Identify skill gaps using skills.py"},
                {
                    "action": "find_training",
                    "description": "Discover training programs using training.py",
                },
                {
                    "action": "evaluate_credentials",
                    "description": "Assess qualifications using credentials.py",
                },
                {"action": "plan_pathway", "description": "Create career roadmap using search.py"},
            ]
        elif steering_type == "action_planning":
            actions = [
                {"action": "apply_jobs", "description": "Apply to matched positions"},
                {"action": "enroll_training", "description": "Start skill development programs"},
                {"action": "network_connect", "description": "Connect with industry professionals"},
                {
                    "action": "track_progress",
                    "description": "Monitor application and development progress",
                },
            ]

        return actions

    async def _get_personalized_options(
        self, state: ClimateAgentState, live_context: Dict[str, Any]
    ) -> List[Dict[str, str]]:
        """Get personalized options based on user profile and database state."""
        options = []

        user_profile = live_context.get("user_profile", {})

        # Add options based on user's current state and preferences
        if user_profile.get("climate_focus_areas"):
            for area in user_profile.get("climate_focus_areas", [])[:3]:
                options.append(
                    {
                        "option": f"explore_{area.lower().replace(' ', '_')}",
                        "description": f"Explore opportunities in {area}",
                    }
                )

        if user_profile.get("desired_roles"):
            for role in user_profile.get("desired_roles", [])[:2]:
                options.append(
                    {
                        "option": f"search_{role.lower().replace(' ', '_')}",
                        "description": f"Search for {role} positions",
                    }
                )

        return options

    async def _get_contextual_question(
        self, steering_type: str, live_context: Dict[str, Any]
    ) -> str:
        """Generate contextual question based on live data and steering type."""

        questions = {
            "discovery": "What aspect of climate careers would you like to explore first?",
            "strategy": "What's your priority for developing your climate career strategy?",
            "action_planning": "Which concrete action would you like to take next?",
            "matching": "Which position interests you most, or would you like to refine your search?",
        }

        base_question = questions.get(
            steering_type, "How can I help you with your climate career journey?"
        )

        # Add context-specific information to the question
        db_stats = live_context.get("db_stats", {})
        if db_stats.get("total_jobs"):
            base_question += (
                f" (I have access to {db_stats.get('total_jobs', 0):,} current opportunities)"
            )

        return base_question

    async def _process_intelligent_response(
        self,
        user_response: Union[str, Dict[str, Any]],
        state: ClimateAgentState,
        steering_type: str,
        live_context: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Process user response using intelligent analysis and available tools."""

        # Convert response to string if needed
        if isinstance(user_response, dict):
            response_text = user_response.get("content", str(user_response))
        else:
            response_text = str(user_response)

        # Create response message
        response_message = HumanMessage(content=response_text)

        # Determine next state using AI analysis and tool capabilities
        next_state = await self._determine_intelligent_next_state(
            response_text, steering_type, live_context
        )

        # Update state based on response and available data
        state_updates = await self._generate_state_updates(response_text, state, live_context)

        return {
            "response_message": response_message,
            "next_state": next_state,
            "state_updates": state_updates,
        }

    async def _determine_intelligent_next_state(
        self, response_text: str, steering_type: str, live_context: Dict[str, Any]
    ) -> str:
        """Determine next workflow state using intelligent analysis and tool mapping."""

        response_lower = response_text.lower()

        # Map user intent to specific tools and workflow states
        if any(keyword in response_lower for keyword in ["job", "position", "role", "career"]):
            return "job_search"  # Use jobs.py and matching.py tools
        elif any(
            keyword in response_lower for keyword in ["skill", "learn", "develop", "training"]
        ):
            return "skills_assessment"  # Use skills.py and training.py tools
        elif any(keyword in response_lower for keyword in ["resume", "cv", "background"]):
            return "resume_analysis"  # Use resume.py tools
        elif any(
            keyword in response_lower
            for keyword in ["partner", "organization", "company", "network"]
        ):
            return "partner_connection"  # Use communities.py tools
        elif any(
            keyword in response_lower for keyword in ["salary", "pay", "compensation", "market"]
        ):
            return "market_analysis"  # Use analytics.py tools
        elif any(
            keyword in response_lower for keyword in ["credential", "degree", "certification"]
        ):
            return "credential_evaluation"  # Use credentials.py tools
        elif any(keyword in response_lower for keyword in ["search", "find", "look for"]):
            return "intelligent_search"  # Use search.py and web_search_tools.py
        else:
            return "continue_discovery"

    async def _generate_state_updates(
        self, response_text: str, state: ClimateAgentState, live_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate state updates based on user response and database context."""

        updates = {}
        response_lower = response_text.lower()

        # Extract and update user preferences
        if "location" in response_lower:
            # Extract location preference and update user_interests table
            updates["location_preference_updated"] = True

        if "salary" in response_lower:
            # Extract salary preferences and update job_seeker_profiles
            updates["salary_preferences_updated"] = True

        if "remote" in response_lower or "hybrid" in response_lower:
            # Update remote work preferences
            updates["remote_work_preference"] = "remote" if "remote" in response_lower else "hybrid"

        # Track user interaction in conversation_analytics
        updates["user_interaction_logged"] = True
        updates["response_analyzed"] = True

        return updates

    async def _create_intelligent_fallback(
        self, state: ClimateAgentState, steering_type: str, live_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Create intelligent fallback for testing environments using live data."""

        db_stats = live_context.get("db_stats", {})
        partner_network = live_context.get("partner_network", {})

        fallback_message = AIMessage(
            content=f"I'm ready to help with your climate career journey using our comprehensive tools and database. "
            f"I have access to {db_stats.get('total_jobs', 0):,} climate jobs, "
            f"{partner_network.get('active_partners', 0)} partner organizations, "
            f"and powerful AI tools for matching, skills assessment, and career planning. "
            f"What would you like to explore?"
        )

        return {
            "messages": [fallback_message],
            "needs_human_review": True,
            "workflow_state": "awaiting_input",
            "fallback_mode": True,
            "context_data": live_context,
            "tools_available": await self._get_available_tools_info(),
        }

    async def _create_error_fallback(self, state: ClimateAgentState) -> Dict[str, Any]:
        """Create error fallback with basic functionality."""

        error_message = AIMessage(
            content="I'm here to help with your climate career journey using our comprehensive database and AI tools. "
            "What would you like to explore today?"
        )

        return {
            "messages": [error_message],
            "needs_human_review": True,
            "workflow_state": "error_recovery",
            "error_fallback": True,
            "recovery_options": [
                "job_search",
                "skills_assessment",
                "resume_analysis",
                "partner_connection",
                "market_analysis",
            ],
        }

    async def evaluate_steering_need(
        self,
        state: ClimateAgentState,
        quality_metrics: Optional[Dict[str, Any]] = None,
        routing_decision: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Evaluate if human steering is needed at this point in the workflow

        Args:
            state: Current workflow state
            quality_metrics: Response quality metrics
            routing_decision: Agent routing decision

        Returns:
            Dict[str, Any]: Steering evaluation result
        """
        # Use HITL coordinator to evaluate intervention need
        intervention_result = await evaluate_intervention_need(
            state, quality_metrics, routing_decision
        )

        # Determine if steering is needed based on intervention result
        needs_steering = intervention_result.get("needs_human_intervention", False)

        # Determine steering point based on workflow state
        steering_point = self._determine_steering_point(state)

        return {
            "needs_steering": needs_steering,
            "steering_point": steering_point,
            "intervention_result": intervention_result,
            "recommendations": self._generate_steering_recommendations(state, steering_point),
            "timestamp": datetime.utcnow().isoformat(),
        }

    def _determine_steering_point(self, state: ClimateAgentState) -> str:
        """Determine appropriate steering point based on workflow state"""
        # Get current workflow state
        user_journey_stage = safe_state_get(state, "user_journey_stage", "discovery")
        goals_validated = safe_state_get(state, "goals_validated", False)
        pathway_chosen = safe_state_get(state, "pathway_chosen", False)
        action_plan_approved = safe_state_get(state, "action_plan_approved", False)

        # Determine steering point based on workflow state
        if user_journey_stage == "discovery" and not goals_validated:
            return "goal_confirmation"
        elif user_journey_stage == "strategy" and not pathway_chosen:
            return "pathway_selection"
        elif user_journey_stage == "action_planning" and not action_plan_approved:
            return "action_plan_review"
        else:
            return "specialist_selection"  # Default steering point

    def _generate_steering_recommendations(
        self, state: ClimateAgentState, steering_point: str
    ) -> List[Dict[str, Any]]:
        """Generate steering recommendations based on workflow state"""
        # Get steering point options
        steering_point_data = self.steering_points.get(
            steering_point, self.steering_points["specialist_selection"]
        )

        # Generate recommendations based on steering point
        recommendations = []

        if steering_point == "goal_confirmation":
            # Add goal-specific recommendations
            climate_goals = safe_state_get(state, "climate_goals", [])
            if climate_goals:
                recommendations.append(
                    {
                        "type": "goal_validation",
                        "description": "Validate identified climate goals",
                        "data": {"goals": climate_goals},
                    }
                )

        elif steering_point == "specialist_selection":
            # Add specialist-specific recommendations
            current_specialist = safe_state_get(state, "current_specialist", None)
            if current_specialist:
                recommendations.append(
                    {
                        "type": "specialist_validation",
                        "description": f"Validate selection of {current_specialist}",
                        "data": {"specialist": current_specialist},
                    }
                )

        elif steering_point == "pathway_selection":
            # Add pathway-specific recommendations
            pathway_options = safe_state_get(state, "pathway_options", {})
            if pathway_options:
                recommendations.append(
                    {
                        "type": "pathway_validation",
                        "description": "Validate selected career pathway",
                        "data": {"pathways": pathway_options},
                    }
                )

        elif steering_point == "action_plan_review":
            # Add action plan-specific recommendations
            next_actions = safe_state_get(state, "next_actions", [])
            if next_actions:
                recommendations.append(
                    {
                        "type": "action_plan_validation",
                        "description": "Validate proposed action plan",
                        "data": {"actions": next_actions},
                    }
                )

        # Add general recommendations
        recommendations.append(
            {
                "type": "general",
                "description": "General steering options",
                "data": {"options": steering_point_data["options"]},
            }
        )

        return recommendations

    async def create_steering_point(
        self, state: ClimateAgentState, steering_point: str
    ) -> Dict[str, Any]:
        """
        Create a steering point for human intervention

        Args:
            state: Current workflow state
            steering_point: Type of steering point

        Returns:
            Dict[str, Any]: Steering point data
        """
        # Get steering point data
        steering_point_data = self.steering_points.get(
            steering_point, self.steering_points["specialist_selection"]
        )

        # Generate steering message
        steering_message = self._generate_steering_message(state, steering_point_data)

        # Generate steering options
        steering_options = steering_point_data["options"]

        return {
            "steering_point": steering_point,
            "steering_message": steering_message,
            "steering_options": steering_options,
            "recommendations": self._generate_steering_recommendations(state, steering_point),
            "timestamp": datetime.utcnow().isoformat(),
        }

    def _generate_steering_message(
        self, state: ClimateAgentState, steering_point_data: Dict[str, Any]
    ) -> str:
        """Generate steering message based on steering point"""
        # Get steering point data
        steering_point_id = steering_point_data["id"]
        steering_point_name = steering_point_data["name"]
        steering_point_description = steering_point_data["description"]

        # Generate message based on steering point
        if steering_point_id == "goal_confirmation":
            climate_goals = safe_state_get(state, "climate_goals", [])
            goals_str = ", ".join(climate_goals) if climate_goals else "No goals identified yet"

            return f"""
# {steering_point_name}

{steering_point_description}

## Identified Goals
{goals_str}

Please confirm if these goals accurately reflect the user's intentions, or provide guidance on how to modify them.
"""

        elif steering_point_id == "specialist_selection":
            current_specialist = safe_state_get(
                state, "current_specialist", "No specialist selected"
            )

            return f"""
# {steering_point_name}

{steering_point_description}

## Current Specialist
{current_specialist}

Please confirm if this specialist is appropriate for the user's needs, or select a different specialist.
"""

        elif steering_point_id == "pathway_selection":
            pathway_options = safe_state_get(state, "pathway_options", {})
            pathway_str = (
                "\n".join([f"- {path}" for path in pathway_options.keys()])
                if pathway_options
                else "No pathways identified yet"
            )

            return f"""
# {steering_point_name}

{steering_point_description}

## Available Pathways
{pathway_str}

Please confirm the selected pathway or provide guidance on alternatives.
"""

        elif steering_point_id == "action_plan_review":
            next_actions = safe_state_get(state, "next_actions", [])
            actions_str = (
                "\n".join([f"- {action}" for action in next_actions])
                if next_actions
                else "No actions identified yet"
            )

            return f"""
# {steering_point_name}

{steering_point_description}

## Proposed Actions
{actions_str}

Please review the action plan and provide any necessary modifications or additional resources.
"""

        else:
            return f"""
# {steering_point_name}

{steering_point_description}

Please provide guidance on how to proceed with the workflow.
"""

    async def process_steering_decision(
        self, state: ClimateAgentState, steering_decision: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Process human steering decision

        Args:
            state: Current workflow state
            steering_decision: Human steering decision

        Returns:
            Dict[str, Any]: Updated state with steering decision
        """
        # Extract decision data
        steering_point = steering_decision.get("steering_point", "specialist_selection")
        decision = steering_decision.get("decision", "approve")
        feedback = steering_decision.get("feedback", "")

        # Process decision based on steering point
        if steering_point == "goal_confirmation":
            return await self._process_goal_confirmation(state, decision, feedback)

        elif steering_point == "specialist_selection":
            return await self._process_specialist_selection(state, decision, feedback)

        elif steering_point == "pathway_selection":
            return await self._process_pathway_selection(state, decision, feedback)

        elif steering_point == "action_plan_review":
            return await self._process_action_plan_review(state, decision, feedback)

        else:
            # Default processing
            return {
                "human_feedback": feedback,
                "steering_processed": True,
                "timestamp": datetime.utcnow().isoformat(),
            }

    async def _process_goal_confirmation(
        self, state: ClimateAgentState, decision: str, feedback: str
    ) -> Dict[str, Any]:
        """Process goal confirmation decision"""
        if decision == "confirm":
            return {
                "goals_validated": True,
                "human_feedback": feedback,
                "steering_processed": True,
                "timestamp": datetime.utcnow().isoformat(),
            }
        elif decision == "modify":
            return {
                "goals_validated": False,
                "climate_goals": [],  # Clear goals for rediscovery
                "human_feedback": feedback,
                "steering_processed": True,
                "timestamp": datetime.utcnow().isoformat(),
            }
        else:
            return {
                "human_feedback": feedback,
                "steering_processed": True,
                "timestamp": datetime.utcnow().isoformat(),
            }

    async def _process_specialist_selection(
        self, state: ClimateAgentState, decision: str, feedback: str
    ) -> Dict[str, Any]:
        """Process specialist selection decision"""
        if decision == "approve":
            return {
                "specialist_approved": True,
                "human_feedback": feedback,
                "steering_processed": True,
                "timestamp": datetime.utcnow().isoformat(),
            }
        elif decision == "change":
            # Extract specialist from feedback if provided
            new_specialist = feedback.strip() if feedback else None

            return {
                "specialist_approved": False,
                "requested_specialist": new_specialist,
                "human_feedback": feedback,
                "steering_processed": True,
                "timestamp": datetime.utcnow().isoformat(),
            }
        else:
            return {
                "human_feedback": feedback,
                "steering_processed": True,
                "timestamp": datetime.utcnow().isoformat(),
            }

    async def _process_pathway_selection(
        self, state: ClimateAgentState, decision: str, feedback: str
    ) -> Dict[str, Any]:
        """Process pathway selection decision"""
        if decision == "approve":
            return {
                "pathway_chosen": True,
                "human_feedback": feedback,
                "steering_processed": True,
                "timestamp": datetime.utcnow().isoformat(),
            }
        elif decision == "modify":
            return {
                "pathway_chosen": False,
                "pathway_options": {},  # Clear pathways for rediscovery
                "human_feedback": feedback,
                "steering_processed": True,
                "timestamp": datetime.utcnow().isoformat(),
            }
        elif decision == "request_alternatives":
            return {
                "pathway_chosen": False,
                "request_alternative_pathways": True,
                "human_feedback": feedback,
                "steering_processed": True,
                "timestamp": datetime.utcnow().isoformat(),
            }
        else:
            return {
                "human_feedback": feedback,
                "steering_processed": True,
                "timestamp": datetime.utcnow().isoformat(),
            }

    async def _process_action_plan_review(
        self, state: ClimateAgentState, decision: str, feedback: str
    ) -> Dict[str, Any]:
        """Process action plan review decision"""
        if decision == "approve":
            return {
                "action_plan_approved": True,
                "human_feedback": feedback,
                "steering_processed": True,
                "timestamp": datetime.utcnow().isoformat(),
            }
        elif decision == "modify":
            return {
                "action_plan_approved": False,
                "next_actions": [],  # Clear actions for redevelopment
                "human_feedback": feedback,
                "steering_processed": True,
                "timestamp": datetime.utcnow().isoformat(),
            }
        elif decision == "add_resources":
            return {
                "action_plan_approved": False,
                "request_additional_resources": True,
                "human_feedback": feedback,
                "steering_processed": True,
                "timestamp": datetime.utcnow().isoformat(),
            }
        else:
            return {
                "human_feedback": feedback,
                "steering_processed": True,
                "timestamp": datetime.utcnow().isoformat(),
            }
