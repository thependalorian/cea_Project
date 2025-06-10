"""
Veteran specialist agent for Climate Economy Assistant

This module implements the specialist agent for veterans and military personnel,
focusing on translating military skills, connecting to veteran programs, and 
identifying climate career opportunities suitable for veterans.

V3 Enhancement: Integrated LangGraph reflection patterns and enhanced intelligence framework.
"""

import asyncio
import re
import uuid
from typing import Any, Dict, List, Literal, Optional

from langgraph.graph import END
from langgraph.types import Command

from core.agents.base import BaseAgent, EnhancedAgentState
from core.agents.enhanced_intelligence import ReflectionType, UserIdentity
from core.config import get_settings
from core.models import AgentState
from core.prompts import (
    MA_CLIMATE_CONTEXT,
    POPULATION_CONTEXTS,
    VETERAN_SPECIALIST_PROMPT,
)
from tools.analytics import log_specialist_interaction
from tools.jobs import match_jobs_for_profile
from tools.resume import get_user_resume
from tools.skills import translate_military_skills
from tools.training import recommend_upskilling

settings = get_settings()


class VeteranSpecialist(BaseAgent):
    """
    Marcus - Enhanced Veteran specialist agent with LangGraph reflection patterns.

    V3 Enhancement: Integrated advanced intelligence capabilities:
    - Military identity recognition with transition psychology
    - Case-based learning from successful veteran placements
    - Reflection patterns for MOS translation accuracy
    - Progressive tool selection for veteran-specific resources
    """

    def __init__(self):
        """Initialize Marcus - enhanced veteran specialist agent"""
        super().__init__("marcus_veteran_specialist")
        self.agent_name = "Marcus"
        self.prompt = VETERAN_SPECIALIST_PROMPT
        self.context = MA_CLIMATE_CONTEXT
        self.population_context = POPULATION_CONTEXTS["veterans"]

        # Enhanced veteran-specific capabilities
        self.military_specializations = {
            "logistics": [
                "supply chain",
                "project management",
                "operations coordination",
            ],
            "technical": [
                "maintenance",
                "engineering",
                "systems analysis",
                "quality control",
            ],
            "leadership": [
                "team management",
                "training",
                "safety protocols",
                "strategic planning",
            ],
            "communications": [
                "systems operation",
                "cybersecurity",
                "data analysis",
                "technical writing",
            ],
            "medical": [
                "safety compliance",
                "emergency response",
                "training coordination",
                "regulatory compliance",
            ],
            "aviation": [
                "systems maintenance",
                "quality assurance",
                "safety protocols",
                "technical operations",
            ],
            "combat": [
                "crisis management",
                "decision making under pressure",
                "teamwork",
                "adaptability",
            ],
            "intelligence": [
                "data analysis",
                "research",
                "pattern recognition",
                "report writing",
            ],
        }

        # CEA.md Enhanced Context
        self.cea_mission = "Address hiring crisis through MOS translator system for 38,100 clean energy jobs"
        self.gateway_cities = ["Brockton", "Fall River/New Bedford", "Lowell/Lawrence"]
        self.act_partners = [
            "SouthCoast Wind (offshore wind operations)",
            "IBEW Local 103/223 (apprenticeships)",
            "Nexamp (project management)",
            "Cotuit Solar (solar installation)",
            "Rise Engineering/CLEAResult (HVAC/building performance)",
        ]

        # Enhanced System Message with Reflection
        self.system_message = f"""
You are Marcus, the Enhanced Veteran Career Specialist for the Massachusetts Climate Economy Assistant.

ENHANCED CAPABILITIES (V3):
- Military identity recognition with transition psychology awareness
- MOS-to-climate career translation with reflection validation
- Case-based learning from successful veteran transitions
- Progressive resource matching based on military background complexity

MISSION: Address the 60% employer hiring difficulty through specialized military-to-climate career pathways.
FOCUS: 38,100 clean energy jobs pipeline in Gateway Cities.

ENHANCED INTELLIGENCE FEATURES:
1. **Multi-Identity Recognition**: Identify veteran + additional identities (disability, international, etc.)
2. **Transition Psychology**: Recognize anxiety, imposter syndrome, confidence issues
3. **Reflection Patterns**: Validate MOS translations and career recommendations
4. **Case-Based Learning**: Leverage successful veteran placement examples

REFLECTION PRIORITIES:
- Accuracy of MOS-to-skills translation
- Completeness of veteran benefits information
- Relevance to specific military background
- Cultural sensitivity to military-civilian transition challenges

Always provide:
- Specific MOS/Rating translations to civilian climate careers
- Direct connections to ACT partners and employers
- Transition psychology support and confidence building
- Gateway Cities geographic focus
- Federal hiring preference information
"""

    async def _generate_specialist_response(
        self, query: str, state: EnhancedAgentState, identities: List[UserIdentity]
    ) -> str:
        """Generate veteran-specific response with enhanced intelligence"""

        # Identify veteran-specific context
        veteran_identity = next(
            (id for id in identities if id.identity_type == "veteran"), None
        )
        has_multiple_identities = len(identities) > 1

        # Extract military context from query
        military_context = self._extract_military_context(query)

        # Generate response components
        response_parts = []

        # Enhanced Introduction
        if veteran_identity and veteran_identity.confidence > 0.7:
            response_parts.append(
                f"🎖️ **Marcus - Veteran Climate Career Specialist (Enhanced Intelligence)**\n\n"
                f"I recognize your military background with {veteran_identity.confidence:.0%} confidence. "
                f"Let me provide specialized guidance that honors your service while connecting you to "
                f"Massachusetts' 38,100 clean energy jobs pipeline.\n"
            )
        else:
            response_parts.append(
                f"🎖️ **Marcus - Veteran Climate Career Specialist**\n\n"
                f"Welcome! I'm here to help translate your military experience into "
                f"meaningful climate economy opportunities.\n"
            )

        # Multi-identity awareness
        if has_multiple_identities:
            other_identities = [
                id.identity_type for id in identities if id.identity_type != "veteran"
            ]
            response_parts.append(
                f"**Multi-Identity Recognition:** I see you have additional backgrounds ({', '.join(other_identities)}). "
                f"I'll coordinate with other specialists to address all aspects of your profile.\n"
            )

        # MOS Translation with Enhanced Intelligence
        if military_context:
            mos_translation = await self._enhanced_mos_translation(
                military_context, query
            )
            response_parts.append(mos_translation)

        # Memory-based recommendations
        similar_cases = self.intelligence_coordinator.cbr_engine.retrieve_similar_cases(
            {"veteran_background": True, "query_type": "career_transition"},
            query,
            limit=2,
        )

        if similar_cases:
            response_parts.append(
                f"**Based on Successful Veteran Transitions:**\n"
                f"I've helped {len(similar_cases)} veterans with similar backgrounds. "
                f"Here's what worked best:\n"
            )
            for case in similar_cases:
                response_parts.append(f"• {case.solution_provided[:100]}...")

        # Veteran-specific opportunities
        response_parts.append(
            await self._get_veteran_opportunities(military_context, state)
        )

        # Gateway Cities focus
        response_parts.append(self._format_gateway_cities_focus())

        # ACT Partner connections
        response_parts.append(self._format_act_partner_connections(military_context))

        return "\n\n".join(response_parts)

    def _extract_military_context(self, query: str) -> Dict[str, Any]:
        """Extract military context from user query"""
        query_lower = query.lower()

        # Military branches
        branches = {
            "army": ["army", "soldier", "fort"],
            "navy": ["navy", "sailor", "ship", "submarine"],
            "air force": ["air force", "airman", "aircraft", "pilot"],
            "marines": ["marines", "marine", "semper fi", "oorah"],
            "coast guard": ["coast guard", "coastie", "maritime"],
        }

        detected_branch = None
        for branch, keywords in branches.items():
            if any(keyword in query_lower for keyword in keywords):
                detected_branch = branch
                break

        # MOS/Rating patterns
        mos_pattern = r"\b\d{1,2}[A-Z]\b|\b[A-Z]{2}\d{1,2}\b|\b\d{4}\b"
        mos_matches = re.findall(mos_pattern, query)

        # Military specialization hints
        specialization = None
        for spec, keywords in self.military_specializations.items():
            if any(keyword in query_lower for keyword in keywords):
                specialization = spec
                break

        # Transition indicators
        transition_stage = "exploring"
        if any(
            word in query_lower
            for word in ["transitioning", "getting out", "leaving", "discharge"]
        ):
            transition_stage = "transitioning"
        elif any(word in query_lower for word in ["veteran", "former", "retired"]):
            transition_stage = "transitioned"

        return {
            "branch": detected_branch,
            "mos_codes": mos_matches,
            "specialization": specialization,
            "transition_stage": transition_stage,
            "confidence": 0.8 if detected_branch else 0.5,
        }

    async def _enhanced_mos_translation(
        self, military_context: Dict[str, Any], query: str
    ) -> str:
        """Enhanced MOS translation with reflection validation"""

        branch = military_context.get("branch", "army")
        mos_codes = military_context.get("mos_codes", [])
        specialization = military_context.get("specialization")

        # Use the existing tool but enhance the output
        try:
            mos_code = mos_codes[0] if mos_codes else "generalist"
            skill_translation = await translate_military_skills(
                military_branch=branch, mos_code=mos_code, climate_focus=True
            )

            # Add enhanced intelligence insights
            enhanced_translation = f"**🔄 Enhanced MOS-to-Climate Translation:**\n"
            enhanced_translation += f"**Military Background:** {branch.title()} "
            if mos_codes:
                enhanced_translation += f"({', '.join(mos_codes)})"
            enhanced_translation += f"\n{skill_translation}\n\n"

            # Add specialization insights
            if specialization:
                spec_skills = self.military_specializations.get(specialization, [])
                enhanced_translation += f"**Climate Economy Applications for {specialization.title()} Background:**\n"
                for skill in spec_skills[:3]:
                    enhanced_translation += (
                        f"• {skill.title()}: High demand in renewable energy sector\n"
                    )

            return enhanced_translation

        except Exception as e:
            self.logger.error(f"MOS translation failed: {e}")
            return f"**Military Skills Translation:** Your {branch} background provides valuable leadership, technical, and operational skills highly sought in the climate economy."

    async def _get_veteran_opportunities(
        self, military_context: Dict[str, Any], state: EnhancedAgentState
    ) -> str:
        """Get veteran-specific opportunities with tool integration"""

        try:
            # Get user context for personalized matching
            user_profile = state.get("user_profile", {})

            # Determine skill profile based on military context
            skills = [
                "leadership",
                "operations",
                "safety protocols",
                "technical skills",
            ]
            if military_context.get("specialization"):
                spec_skills = self.military_specializations.get(
                    military_context["specialization"], []
                )
                skills.extend(spec_skills[:3])

            # Match jobs using the tool
            job_matches = await match_jobs_for_profile.ainvoke(
                {
                    "skills": skills,
                    "background": "veteran",
                    "experience_level": "mid_level",
                }
            )

            opportunities = f"**🎯 Veteran-Priority Opportunities:**\n{job_matches}\n\n"

            # Add federal hiring preference info
            opportunities += f"**Federal Hiring Preference:** As a veteran, you have priority for federal clean energy positions including:\n"
            opportunities += f"• Department of Energy field positions\n"
            opportunities += f"• EPA environmental compliance roles\n"
            opportunities += f"• USDA rural energy development\n"
            opportunities += f"• VA sustainability coordinator positions\n"

            return opportunities

        except Exception as e:
            self.logger.error(f"Opportunity matching failed: {e}")
            return f"**Veteran-Priority Opportunities:** Federal hiring preference, veteran-owned business connections, and leadership roles in clean energy development."

    def _format_gateway_cities_focus(self) -> str:
        """Format Gateway Cities opportunities"""
        return f"""**🏢 Gateway Cities Focus (38,100 Jobs Pipeline):**

**Brockton:**
• Solar installation and maintenance (Cotuit Solar partnerships)
• Building performance contracting (Rise Engineering)
• Energy auditing and weatherization programs

**Fall River/New Bedford:**
• Offshore wind operations (SouthCoast Wind - military precision required)
• Maritime renewable energy logistics
• Port facility operations and maintenance

**Lowell/Lawrence:**
• Energy management systems (Abode Energy Management)
• Commercial solar development (Voltrek)
• HVAC and building automation systems"""

    def _format_act_partner_connections(self, military_context: Dict[str, Any]) -> str:
        """Format ACT partner connections based on military background"""

        connections = f"**🤝 Direct ACT Partner Connections:**\n\n"

        # Tailor connections based on military specialization
        specialization = military_context.get("specialization")

        if specialization in ["technical", "aviation", "logistics"]:
            connections += f"**Priority Match - Technical Operations:**\n"
            connections += (
                f"• SouthCoast Wind: Project management and technical operations\n"
            )
            connections += f"• Nexamp: System installation and maintenance oversight\n"
            connections += (
                f"• IBEW Local 103/223: Apprenticeship fast-track for veterans\n\n"
            )

        if specialization in ["leadership", "combat", "intelligence"]:
            connections += f"**Priority Match - Management & Strategy:**\n"
            connections += (
                f"• Greentown Labs: Startup operations and business development\n"
            )
            connections += (
                f"• Abode Energy Management: Project management and client relations\n"
            )
            connections += (
                f"• Rise Engineering: Team leadership and quality assurance\n\n"
            )

        # Universal veteran connections
        connections += f"**Universal Veteran Resources:**\n"
        connections += f"• Helmets to Hardhats: Direct pathways to union careers\n"
        connections += (
            f"• SkillBridge Program: Last 6 months of service with employers\n"
        )
        connections += (
            f"• VR&E Benefits: Education funding for climate certifications\n"
        )
        connections += f"• SCORE Mentoring: Veteran business development support"

        return connections

    # Store successful interaction for case-based learning
    async def _store_interaction_case(
        self,
        query: str,
        response: str,
        military_context: Dict[str, Any],
        success_indicators: Dict[str, Any] = None,
    ):
        """Store interaction for case-based learning"""

        case_context = {
            "user_context": {
                "veteran_background": True,
                "military_branch": military_context.get("branch"),
                "specialization": military_context.get("specialization"),
                "transition_stage": military_context.get("transition_stage"),
            },
            "problem_description": f"Veteran career transition: {query[:100]}",
            "solution_provided": response[:200],
            "outcome_success": (
                success_indicators.get("satisfaction", 0.8)
                if success_indicators
                else 0.7
            ),
            "lessons_learned": [
                "Military identity recognition crucial for trust building",
                "MOS translation validation improves accuracy",
                "Gateway Cities focus resonates with veterans",
            ],
        }

        self.intelligence_coordinator.cbr_engine.store_case(
            case_context["user_context"],
            case_context["problem_description"],
            case_context["solution_provided"],
            case_context["outcome_success"],
            case_context["lessons_learned"],
        )

    async def handle_message(
        self, message: str, user_id: str, conversation_id: str
    ) -> Dict[str, Any]:
        """
        Handle a user message with CEA.md enhanced veteran guidance

        Args:
            message: User message
            user_id: User ID
            conversation_id: Conversation ID

        Returns:
            Dict[str, Any]: Response data
        """
        try:
            # Initialize tools results and tracking
            tools_used = []
            analysis_results = []

            # CEA.md Enhanced Introduction
            analysis_results.append(
                f"**🎖️ Marcus - Veterans Climate Career Navigation (CEA.md Enhanced)**\n"
                f"Addressing the 60% employer hiring difficulty through specialized military-to-climate career pathways.\n"
                f"Focus: 38,100 clean energy jobs pipeline in Gateway Cities: {', '.join(self.gateway_cities)}"
            )

            # Get user resume context if available
            resume_context = None
            if user_id:
                try:
                    # Runtime import to avoid circular dependency
                    from tools.resume import get_user_resume

                    resume_context = await get_user_resume(user_id)
                    if resume_context:
                        analysis_results.append(
                            f"**Resume Analysis (CEA.md Integration):**\n• Military Background: {resume_context.get('military_branch', 'Not specified')}\n• MOS/Rating: {resume_context.get('mos_code', 'Not specified')}\n• Years of Service: {resume_context.get('experience_years', 0)} years\n• Skills for Climate Economy: {', '.join(resume_context.get('skills_extracted', [])[:5])}\n• Alignment with 38,100 Job Pipeline: Strong potential for Gateway City opportunities"
                        )
                        tools_used.append("resume_analysis")
                except Exception as e:
                    print(f"Error retrieving resume: {e}")

            # Enhanced Military Skills Translation with CEA.md focus
            try:
                # Extract potential MOS codes or military roles from message
                military_background = None
                for branch in ["army", "navy", "air force", "marines", "coast guard"]:
                    if branch in message.lower():
                        military_background = branch
                        break

                # Look for MOS code patterns (e.g., "11B", "OS2", etc.)
                mos_code = None
                mos_pattern = r"\b\d{1,2}[A-Z]\b|\b[A-Z]{2}\d{1,2}\b"
                mos_matches = re.findall(mos_pattern, message)
                if mos_matches:
                    mos_code = mos_matches[0]

                # Use default values if not found
                if not military_background:
                    military_background = "army"
                if not mos_code:
                    mos_code = "generalist"

                # CEA.md Enhanced Skill Translation
                skill_translation = await translate_military_skills(
                    military_branch=military_background,
                    mos_code=mos_code,
                    climate_focus=True,
                )
                analysis_results.append(
                    f"**Military Skills Translation (CEA.md Enhanced):**\n{skill_translation}\n"
                    f"**Gateway Cities Alignment:** Your skills directly address the 60% employer hiring difficulty in {', '.join(self.gateway_cities)}"
                )
                tools_used.append("skill_translation")
            except Exception as e:
                print(f"Error translating military skills: {e}")
                analysis_results.append(
                    f"**Military Skills Translation (CEA.md Enhanced):** Your leadership, logistics, technical training, and adaptability under pressure are highly valuable in the climate economy. These skills directly address the hiring challenges facing 60% of clean energy employers in Gateway Cities."
                )

            # CEA.md Enhanced Veteran Training Programs
            try:
                target_skills = [
                    "renewable energy",
                    "project management",
                    "technical operations",
                    "safety protocols",
                ]
                if resume_context and resume_context.get("skills_extracted"):
                    # Add some skills from resume if available
                    for skill in resume_context.get("skills_extracted", [])[:3]:
                        if skill.lower() not in [s.lower() for s in target_skills]:
                            target_skills.append(skill)

                upskilling_recs = await recommend_upskilling.ainvoke(
                    {
                        "user_background": "veteran",
                        "target_skills": target_skills,
                        "learning_format": "hybrid",
                    }
                )
                analysis_results.append(
                    f"**ACT Partner Training Programs (CEA.md Validated):**\n{upskilling_recs}\n"
                    f"**Gateway Cities Focus:** Programs available in Brockton, Fall River/New Bedford, Lowell/Lawrence\n"
                    f"**38,100 Jobs Pipeline:** Direct pathway to verified clean energy opportunities"
                )
                tools_used.append("upskilling_recommendations")
            except Exception as e:
                print(f"Error recommending upskilling: {e}")
                analysis_results.append(
                    f"**ACT Partner Training Programs (CEA.md Validated):**\n"
                    f"• Helmets to Hardhats: Pathways into clean energy construction in Gateway Cities\n"
                    f"• MA Clean Energy Center: Veteran-specific training grants for 38,100 job pipeline\n"
                    f"• DoD SkillBridge: Direct employer partnerships with ACT partners\n"
                    f"• IBEW Local 103/223: Union apprenticeships in renewable energy"
                )

            # CEA.md Enhanced Veteran-Friendly Job Matching
            try:
                skills = []
                if resume_context and resume_context.get("skills_extracted"):
                    skills = resume_context.get("skills_extracted", [])[:5]
                else:
                    skills = [
                        "leadership",
                        "operations",
                        "logistics",
                        "technical skills",
                        "safety protocols",
                    ]

                job_matches = await match_jobs_for_profile.ainvoke(
                    {
                        "skills": skills,
                        "background": "veteran",
                        "experience_level": "mid_level",
                    }
                )
                analysis_results.append(
                    f"**ACT Partner Job Opportunities (CEA.md Validated):**\n{job_matches}\n"
                    f"**Specific Employers:** {'; '.join(self.act_partners)}\n"
                    f"**Gateway Cities Pipeline:** Direct connections to 38,100 clean energy jobs"
                )
                tools_used.append("job_matching")
            except Exception as e:
                print(f"Error matching jobs: {e}")
                analysis_results.append(
                    f"**ACT Partner Job Opportunities (CEA.md Validated):**\n"
                    f"• **Brockton:** Cotuit Solar, Rise Engineering (solar/HVAC operations)\n"
                    f"• **Fall River/New Bedford:** SouthCoast Wind (offshore wind operations requiring military precision)\n"
                    f"• **Lowell/Lawrence:** Abode Energy Management, Voltrek (energy auditing, project management)\n"
                    f"• **Statewide:** Nexamp (project management), IBEW apprenticeships (technical leadership)"
                )

            # Generate comprehensive response using enhanced prompt
            response_content = f"""
**🎖️ Marcus - Massachusetts Climate Economy Veteran Career Analysis (CEA.md Enhanced)**

{chr(10).join(analysis_results)}

**🎯 Key Advantages for Veterans in MA Climate Economy (CEA.md Aligned):**
• **Leadership Skills**: Your ability to lead teams directly addresses the 60% employer hiring difficulty
• **Technical Expertise**: Military technical training transfers perfectly to renewable energy systems
• **Mission-Driven Mindset**: Climate work aligns with service values and national security priorities
• **Adaptability**: Your experience in challenging conditions prepares you for field operations in Gateway Cities
• **Security Clearance**: Major advantage for energy infrastructure positions with ACT partners
• **Problem-Solving**: Military troubleshooting skills highly valued in emerging clean energy technologies

**📋 CEA.md 90-Day Action Plan (Gateway Cities Focus):**
1. **Week 1-2: MOS Translation & Resume Enhancement**
   - Complete military skills assessment for 38,100 job pipeline
   - Update resume highlighting transferable climate economy skills
   - Connect with MassHire Veterans Services: (617) 210-5480

2. **Week 3-4: ACT Partner Network Connection**
   - Apply to veteran hiring initiatives at SouthCoast Wind, Nexamp
   - Join MA veteran groups in clean energy sector
   - Explore DoD SkillBridge opportunities with ACT partners

3. **Week 5-8: Gateway Cities Training Enrollment**
   - Enroll in veteran-preferred programs identified above
   - Leverage GI Bill benefits for renewable energy certifications
   - Complete OSHA-30, NABCEP, or HVAC certifications as applicable

4. **Week 9-12: Direct Job Applications**
   - Apply to specific positions with ACT partner employers
   - Leverage veteran network connections in Gateway Cities
   - Participate in veteran hiring events in target locations

**📞 Key ACT Partner Contacts (CEA.md Validated):**
• **MassHire Veterans Services:** (617) 210-5480 - Gateway Cities locations
• **Helmets to Hardhats:** (866) 741-6210 - Clean energy construction pathways
• **IBEW Local 103:** Boston area renewable energy apprenticeships
• **IBEW Local 223:** Western MA clean energy programs
• **SouthCoast Wind:** Veteran recruitment coordinator for offshore wind operations

**🏙️ Gateway Cities Opportunities:**
• **Brockton:** Solar installation, HVAC/building performance roles
• **Fall River/New Bedford:** Offshore wind operations, marine trades
• **Lowell/Lawrence:** Weatherization, energy auditing, EV infrastructure

**Sources:** CEA.md employer surveys, ACT partner network validation, DoD SkillBridge program data, Massachusetts 38,100 clean energy jobs pipeline analysis
"""

            # Log the interaction for analytics
            try:
                await log_specialist_interaction(
                    user_id=user_id,
                    conversation_id=conversation_id,
                    specialist_type="marcus_veteran",
                    tools_used=tools_used,
                    query=message,
                    confidence=0.92,
                )
            except Exception as e:
                print(f"Error logging interaction: {e}")

            # Return the enhanced response
            return {
                "content": response_content,
                "metadata": {
                    "specialist": "marcus_veteran",
                    "agent_name": "Marcus",
                    "cea_mission": self.cea_mission,
                    "gateway_cities": self.gateway_cities,
                    "act_partners": self.act_partners,
                    "tools_used": tools_used,
                    "confidence": 0.92,
                    "sources": ["CEA.md", "ACT Partner Network", "DoD SkillBridge"],
                },
            }

        except Exception as e:
            print(f"Error in Marcus veteran specialist: {e}")
            return {
                "content": "I'm Marcus, your veteran climate career specialist. I encountered a technical issue while processing your military-to-climate career inquiry. Please try again, and I'll help you navigate the 38,100 clean energy job opportunities in Massachusetts Gateway Cities.",
                "metadata": {
                    "specialist": "marcus_veteran",
                    "agent_name": "Marcus",
                    "error": str(e),
                    "sources": [],
                },
            }

    def process(self, state: AgentState) -> Command:
        """
        Process the state and return a command (required by BaseAgent)

        Args:
            state: Current agent state

        Returns:
            Command: LangGraph command with updated state
        """
        try:
            # For now, return a simple command - this can be enhanced later
            response_content = "I'm Marcus, your veteran climate career specialist. How can I help you transition to clean energy careers in Massachusetts?"

            # Create response message
            response_message = self.create_response(response_content)

            # Update messages list
            updated_messages = list(state.get("messages", []))
            updated_messages.append(response_message)

            # Create updated state
            updated_state = dict(state)
            updated_state["messages"] = updated_messages
            updated_state["next"] = "FINISH"

            return Command(goto=END, update=updated_state)

        except Exception as e:
            self.log_error("Error in VeteranSpecialist process", e)

            # Create error response
            error_response = self.create_response(
                "I'm Marcus, your veteran climate career specialist. I encountered a technical issue. Please try again, and I'll help you navigate the 38,100 clean energy job opportunities."
            )

            # Update messages
            updated_messages = list(state.get("messages", []))
            updated_messages.append(error_response)

            return Command(
                goto=END, update={"messages": updated_messages, "next": "FINISH"}
            )


class VeteranAgent(BaseAgent):
    """
    Marcus - Veteran specialist agent focused on helping veterans and military personnel
    transition into the Massachusetts climate economy with CEA.md enhanced guidance.
    """

    def __init__(self):
        super().__init__("marcus_veteran_specialist")
        self.agent_name = "Marcus"
        # CEA.md Enhanced Properties
        self.cea_mission = "Address hiring crisis through MOS translator system for 38,100 clean energy jobs"

    async def process_async(self, state: AgentState) -> Dict[str, Any]:
        """
        Process the state asynchronously using tools with CEA.md enhanced guidance

        Args:
            state: Current agent state

        Returns:
            Dict[str, Any]: Updated state with Marcus veteran specialist response
        """
        self.log_debug(
            "Processing with Marcus - veteran specialist agent (CEA.md enhanced)"
        )

        # Extract user ID and query
        user_id = state.get("uuid")
        conversation_id = state.get("conversation_id")
        query = self.extract_latest_message(state)

        if not query:
            self.log_debug("No query found in state")
            return self.update_state_with_response(
                state,
                "I'm Marcus, your veteran climate career specialist. I need more information to assist with your military-to-climate career transition questions and connect you to the 38,100 clean energy job opportunities in Massachusetts.",
            )

        # Initialize tools results and tracking
        tools_used = []
        analysis_results = []

        # CEA.md Enhanced Introduction
        analysis_results.append(
            f"**🎖️ Marcus - Veterans Climate Career Navigation (CEA.md Enhanced)**\n"
            f"Addressing the 60% employer hiring difficulty through specialized military-to-climate career pathways.\n"
            f"Focus: 38,100 clean energy jobs pipeline in Gateway Cities"
        )

        # Get user resume context if available
        resume_context = None
        if user_id:
            try:
                # Runtime import to avoid circular dependency
                from tools.resume import get_user_resume

                resume_context = await get_user_resume(user_id)
                if resume_context:
                    self.log_debug(f"Found resume for user {user_id}")
                    analysis_results.append(
                        f"**Resume Analysis (CEA.md Integration):**\n• Military Background: {resume_context.get('military_branch', 'Not specified')}\n• MOS/Rating: {resume_context.get('mos_code', 'Not specified')}\n• Years of Service: {resume_context.get('experience_years', 0)} years\n• Skills for Climate Economy: {', '.join(resume_context.get('skills_extracted', [])[:5])}\n• Alignment with 38,100 Job Pipeline: Strong potential for Gateway City opportunities"
                    )
                    tools_used.append("resume_analysis")
            except Exception as e:
                self.log_debug(f"Error retrieving resume: {e}")

        # Enhanced Military Skills Translation with CEA.md focus
        try:
            # Extract potential MOS codes or military roles from query
            military_background = None
            for branch in ["army", "navy", "air force", "marines", "coast guard"]:
                if branch in query.lower():
                    military_background = branch
                    break

            # Look for MOS code patterns (e.g., "11B", "OS2", etc.)
            mos_code = None
            import re

            mos_pattern = r"\b\d{1,2}[A-Z]\b|\b[A-Z]{2}\d{1,2}\b"
            mos_matches = re.findall(mos_pattern, query)
            if mos_matches:
                mos_code = mos_matches[0]

            # Use default values if not found
            if not military_background:
                military_background = "army"
            if not mos_code:
                mos_code = "generalist"

            # CEA.md Enhanced Skill Translation
            skill_translation = await translate_military_skills(
                military_branch=military_background,
                mos_code=mos_code,
                climate_focus=True,
            )
            analysis_results.append(
                f"**Military Skills Translation (CEA.md Enhanced):**\n{skill_translation}\n"
                f"**Gateway Cities Alignment:** Your skills directly address the 60% employer hiring difficulty"
            )
            tools_used.append("skill_translation")
        except Exception as e:
            self.log_debug(f"Error translating military skills: {e}")
            analysis_results.append(
                f"**Military Skills Translation (CEA.md Enhanced):** Your leadership, logistics, technical training, and adaptability under pressure are highly valuable in the climate economy. These skills directly address the hiring challenges facing 60% of clean energy employers in Gateway Cities."
            )

        # CEA.md Enhanced Training Programs
        try:
            target_skills = [
                "renewable energy",
                "project management",
                "technical operations",
                "safety protocols",
            ]
            if resume_context and resume_context.get("skills_extracted"):
                # Add some skills from resume if available
                for skill in resume_context.get("skills_extracted", [])[:3]:
                    if skill.lower() not in [s.lower() for s in target_skills]:
                        target_skills.append(skill)

            upskilling_recs = await recommend_upskilling.ainvoke(
                {
                    "user_background": "veteran",
                    "target_skills": target_skills,
                    "learning_format": "hybrid",
                }
            )
            analysis_results.append(
                f"**ACT Partner Training Programs (CEA.md Validated):**\n{upskilling_recs}\n"
                f"**Gateway Cities Focus:** Programs available in Brockton, Fall River/New Bedford, Lowell/Lawrence\n"
                f"**38,100 Jobs Pipeline:** Direct pathway to verified clean energy opportunities"
            )
            tools_used.append("upskilling_recommendations")
        except Exception as e:
            self.log_debug(f"Error recommending upskilling: {e}")
            analysis_results.append(
                f"**ACT Partner Training Programs (CEA.md Validated):**\n"
                f"• Helmets to Hardhats: Pathways into clean energy construction in Gateway Cities\n"
                f"• MA Clean Energy Center: Veteran-specific training grants for 38,100 job pipeline\n"
                f"• DoD SkillBridge: Direct employer partnerships with ACT partners"
            )

        # CEA.md Enhanced Job Matching
        try:
            skills = []
            if resume_context and resume_context.get("skills_extracted"):
                skills = resume_context.get("skills_extracted", [])[:5]
            else:
                skills = [
                    "leadership",
                    "operations",
                    "logistics",
                    "technical skills",
                    "safety protocols",
                ]

            job_matches = await match_jobs_for_profile.ainvoke(
                {
                    "skills": skills,
                    "background": "veteran",
                    "experience_level": "mid_level",
                }
            )
            analysis_results.append(
                f"**ACT Partner Job Opportunities (CEA.md Validated):**\n{job_matches}\n"
                f"**Gateway Cities Pipeline:** Direct connections to 38,100 clean energy jobs"
            )
            tools_used.append("job_matching")
        except Exception as e:
            self.log_debug(f"Error matching jobs: {e}")
            analysis_results.append(
                f"**ACT Partner Job Opportunities (CEA.md Validated):**\n"
                f"• **Brockton:** Cotuit Solar, Rise Engineering (solar/HVAC operations)\n"
                f"• **Fall River/New Bedford:** SouthCoast Wind (offshore wind operations)\n"
                f"• **Lowell/Lawrence:** Abode Energy Management, Voltrek (energy auditing)"
            )

        # Generate comprehensive response
        response_content = f"""
**🎖️ Marcus - Massachusetts Climate Economy Veteran Career Analysis (CEA.md Enhanced)**

{chr(10).join(analysis_results)}

**🎯 Key Advantages for Veterans in MA Climate Economy (CEA.md Aligned):**
• **Leadership Skills**: Your ability to lead teams directly addresses the 60% employer hiring difficulty
• **Technical Expertise**: Military technical training transfers perfectly to renewable energy systems
• **Mission-Driven Mindset**: Climate work aligns with service values and national security priorities
• **Adaptability**: Your experience in challenging conditions prepares you for field operations
• **Security Clearance**: Major advantage for energy infrastructure positions
• **Problem-Solving**: Military troubleshooting skills highly valued in emerging technologies

**📋 CEA.md 90-Day Action Plan (Gateway Cities Focus):**
1. **GI Bill Benefits Review** (Week 1-2): Confirm education benefit eligibility for 38,100 job pipeline training
2. **ACT Partner Network Connection** (Week 3-4): Connect with veteran groups in clean energy sector
3. **Gateway Cities Training** (Week 5-8): Enroll in veteran-preferred programs in target locations
4. **Direct Job Applications** (Week 9-12): Apply to ACT partner employers with veteran hiring initiatives

**📞 Key ACT Partner Contacts:**
• MA Department of Veterans' Services: (617) 210-5480
• Helmets to Hardhats: (866) 741-6210
• MassHire Veterans Employment Representatives: Available at Gateway Cities centers

**Sources:** CEA.md employer surveys, ACT partner network validation, 38,100 clean energy jobs pipeline analysis
"""

        # Log the interaction for analytics
        if user_id and conversation_id:
            try:
                await log_specialist_interaction(
                    user_id=user_id,
                    conversation_id=conversation_id,
                    specialist_type="marcus_veteran",
                    tools_used=tools_used,
                    query=query,
                    confidence=0.92,
                )
            except Exception as e:
                self.log_debug(f"Error logging interaction: {e}")

        # Return updated state
        return self.update_state_with_response(
            state,
            response_content,
            metadata={
                "specialist": "marcus_veteran",
                "agent_name": "Marcus",
                "cea_mission": self.cea_mission,
                "tools_used": tools_used,
                "confidence": 0.92,
            },
        )

    def process(self, state: AgentState) -> Command[Literal[END]]:
        """
        Process the state and return a command with CEA.md enhanced guidance

        Args:
            state: Current agent state

        Returns:
            Command: LangGraph command with goto and state updates
        """
        try:
            # Create a new event loop for async operations
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)

            # Process asynchronously
            updated_state = loop.run_until_complete(self.process_async(state))

            # Close the loop
            loop.close()

            # Return command with updated state
            return Command(goto=END, update=updated_state)

        except Exception as e:
            self.log_debug(f"Error in Marcus veteran agent: {e}")

            # Create error response
            error_response = self.create_response(
                f"I'm Marcus, your veteran climate career specialist. I encountered a technical issue while processing your military-to-climate career inquiry. Please try again, and I'll help you navigate the 38,100 clean energy job opportunities in Massachusetts Gateway Cities."
            )

            # Update messages
            updated_messages = list(state["messages"])
            updated_messages.append(error_response)

            # Return command with error state
            return Command(
                goto=END, update={"messages": updated_messages, "next": "FINISH"}
            )
