"""
Pendo - Supervisor & Climate Economy Coordinator Agent

Following rule #2: Create modular agent components for easy maintenance
Following rule #3: Component documentation explaining purpose and functionality
Following rule #12: Complete code verification with proper agent implementation

Pendo specializes in workflow coordination, agent routing, conversation management,
and supervising the team of climate career specialists.

Enhanced with LLM-based reasoning instead of hardcoded keywords to avoid user misclassification.
Location: backendv1/agents/pendo/agent.py
"""

from typing import Dict, Any, List, Optional
from datetime import datetime

from backendv1.agents.base.agent_base import AgentBase, AgentContext, AgentResponse
from backendv1.agents.base.memory_system import MemorySystem
from backendv1.agents.base.reflection_engine import ReflectionEngine
from backendv1.utils.logger import setup_logger
from .prompts import (
    PENDO_SYSTEM_PROMPT,
    PENDO_USER_ASSESSMENT_PROMPT,
    PENDO_ROUTING_DECISION_PROMPT,
    PENDO_CLIMATE_OVERVIEW_PROMPT,
    PENDO_RESPONSE_TEMPLATES,
    PENDO_CONFIG,
)

logger = setup_logger("pendo_agent")


class PendoAgent(AgentBase):
    """
    Pendo - Supervisor & Climate Economy Coordinator

    Specialized in:
    - Workflow coordination and agent routing
    - Conversation management and state tracking
    - User assessment and specialist matching
    - Climate economy overview and guidance
    - Quality assurance and session orchestration

    Enhanced with LLM-based reasoning to avoid user misclassification.
    """

    def __init__(
        self, agent_name: str = "Pendo", agent_type: str = "supervisor_coordinator", **kwargs
    ):
        """Initialize Pendo with memory and reflection capabilities"""
        super().__init__(agent_name, agent_type, **kwargs)
        self.memory_system = MemorySystem(agent_name)
        self.reflection_engine = ReflectionEngine(agent_name)

        # Supervisor-specific attributes
        self.available_specialists = {
            "alex": "empathy_specialist",
            "mai": "resume_specialist",
            "marcus": "veteran_specialist",
            "liv": "international_specialist",
            "miguel": "environmental_justice_specialist",
            "jasmine": "youth_early_career_specialist",
            "lauren": "climate_specialist",
        }

        self.routing_history = []

    def _load_prompts(self):
        """Load Pendo-specific prompts and templates"""
        self.system_prompt = PENDO_SYSTEM_PROMPT

        self.specialized_prompts = {
            "user_assessment": PENDO_USER_ASSESSMENT_PROMPT,
            "routing_decision": PENDO_ROUTING_DECISION_PROMPT,
            "climate_overview": PENDO_CLIMATE_OVERVIEW_PROMPT,
            "welcome": PENDO_RESPONSE_TEMPLATES["welcome"],
            "coordination": PENDO_RESPONSE_TEMPLATES["coordination"],
        }

    def _load_tools(self):
        """Load and configure Pendo-specific tools"""
        self.available_tools = [
            "user_assessment_analyzer",
            "agent_routing_engine",
            "conversation_coordinator",
            "climate_overview_generator",
            "specialist_matcher",
            "session_orchestrator",
            "quality_assurance_monitor",
            "massachusetts_climate_database",
        ]

    def _setup_capabilities(self):
        """Set up Pendo-specific capabilities and configurations"""
        self.specialization_areas = [
            "workflow_coordination",
            "agent_routing",
            "conversation_management",
            "user_assessment",
            "session_orchestration",
            "quality_assurance",
            "climate_economy_supervision",
        ]

        self.expertise_level = "expert"
        self.confidence_threshold = 0.9  # High confidence for routing decisions

    async def process_message(self, message: str, context: AgentContext) -> AgentResponse:
        """
        Process user message and provide supervision/routing

        Following rule #6: Asynchronous data handling for performance
        Following rule #15: Include comprehensive error handling

        Args:
            message: User's message
            context: Conversation context

        Returns:
            AgentResponse: Pendo's coordination response
        """
        try:
            logger.info(f"🧠 Pendo processing coordination message for user {context.user_id}")

            # Store interaction in memory
            await self.memory_system.store_episode(
                {
                    "type": "supervisor_coordination",
                    "message": message,
                    "user_id": context.user_id,
                    "context": "workflow_coordination",
                }
            )

            # Analyze message for routing and coordination needs
            analysis = await self._analyze_user_needs(message, context)
            intent = analysis["primary_intent"]

            # Generate specialized response based on coordination needs
            if intent == "crisis_support":
                response_content = await self._route_to_crisis_support(message, context, analysis)
            elif intent == "specific_specialist_needed":
                response_content = await self._route_to_specialist(message, context, analysis)
            elif intent == "user_assessment_needed":
                response_content = await self._provide_user_assessment(message, context)
            elif intent == "climate_overview_needed":
                response_content = await self._provide_climate_overview(message, context)
            else:
                response_content = await self._provide_coordination_guidance(message, context)

            # Calculate confidence score
            confidence = await self._calculate_confidence(message, analysis)

            # Identify next actions
            next_actions = await self._suggest_next_actions(intent, analysis, context)

            # Create response
            response = AgentResponse(
                content=response_content,
                specialist_type="supervisor_coordinator",
                confidence_score=confidence,
                tools_used=[
                    "user_assessment_analyzer",
                    "agent_routing_engine",
                    "conversation_coordinator",
                ],
                next_actions=next_actions,
                sources=[
                    "Massachusetts Climate Economy Data",
                    "Agent Routing System",
                    "User Assessment Framework",
                ],
                metadata={
                    "intent": intent,
                    "analysis": analysis,
                    "specialization": "workflow_coordination",
                    "expertise_areas": self.specialization_areas,
                    "routing_recommendation": analysis.get("recommended_specialist"),
                },
            )

            # Reflect on coordination effectiveness
            await self.reflection_engine.reflect_on_interaction(
                {
                    "id": f"pendo_{datetime.utcnow().timestamp()}",
                    "user_message": message,
                    "response": response_content,
                    "intent": intent,
                    "routing_decision": analysis.get("recommended_specialist"),
                    "confidence": confidence,
                }
            )

            return response

        except Exception as e:
            logger.error(f"Error in Pendo's coordination processing: {e}")
            return AgentResponse(
                content="I'm experiencing a technical issue with my coordination systems. Let me connect you directly with our team for immediate support.",
                specialist_type="supervisor_coordinator",
                success=False,
                error_message=str(e),
            )

    async def _analyze_user_needs(self, message: str, context: AgentContext) -> Dict[str, Any]:
        """
        Analyze user message using LLM reasoning to determine routing and coordination needs

        Replaces hardcoded keyword matching with intelligent assessment to avoid misclassification
        """
        try:
            from langchain_core.prompts import ChatPromptTemplate
            from langchain_core.output_parsers import PydanticOutputParser
            from pydantic import BaseModel, Field
            from typing import Literal

            class UserNeedsAssessment(BaseModel):
                primary_intent: Literal[
                    "crisis_support",
                    "specific_specialist_needed",
                    "user_assessment_needed",
                    "climate_overview_needed",
                    "general_coordination",
                ] = Field(description="Primary intent of the user's message")
                urgency_level: Literal["low", "moderate", "high", "crisis"] = Field(
                    description="Urgency level of the user's needs"
                )
                recommended_specialist: Optional[str] = Field(
                    description="Recommended specialist agent (alex, mai, marcus, liv, miguel, jasmine, lauren) or None"
                )
                specialist_confidence: float = Field(
                    description="Confidence in specialist recommendation from 0.0 to 1.0",
                    ge=0.0,
                    le=1.0,
                )
                reasoning: str = Field(description="Brief explanation of the routing decision")
                context_factors: List[str] = Field(
                    description="Key contextual factors that influenced the decision"
                )

            parser = PydanticOutputParser(pydantic_object=UserNeedsAssessment)

            # Include conversation history context
            history_context = ""
            if context.conversation_history:
                recent_messages = context.conversation_history[-3:]
                history_context = f"\n\nRecent conversation context:\n" + "\n".join(
                    [str(msg) for msg in recent_messages]
                )

            prompt = ChatPromptTemplate.from_messages(
                [
                    (
                        "system",
                        """You are Pendo, the Climate Economy Assistant supervisor, analyzing user messages to route them to the most appropriate specialist.

Available specialists:
- Alex: Empathy & emotional support, career anxiety, work-life balance
- Mai: Resume analysis, interview prep, career transitions
- Marcus: Military veterans, defense industry transitions
- Liv: International professionals, visa/credential issues
- Miguel: Environmental justice, community organizing, equity
- Jasmine: Youth, students, early career, internships
- Lauren: Climate careers, renewable energy, sustainability roles

Assess the user's primary intent and needs:
- Crisis support: Immediate emotional distress requiring Alex
- Specific specialist needed: Clear match to a specialist's expertise
- User assessment needed: Need to understand user's background/goals
- Climate overview needed: General climate career information
- General coordination: Basic guidance and next steps

Consider context, tone, and implicit needs - not just keywords.

{format_instructions}""",
                    ),
                    ("human", "User message: {message}{history_context}"),
                ]
            )

            # Get LLM instance
            if hasattr(self, "llm") and self.llm:
                llm = self.llm
            else:
                from langchain_openai import ChatOpenAI

                llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0.1)

            chain = prompt | llm | parser

            assessment = await chain.ainvoke(
                {
                    "message": message,
                    "history_context": history_context,
                    "format_instructions": parser.get_format_instructions(),
                }
            )

            logger.info(
                f"🧠 User needs assessment: {assessment.primary_intent} -> {assessment.recommended_specialist} (confidence: {assessment.specialist_confidence:.2f})"
            )

            return {
                "primary_intent": assessment.primary_intent,
                "urgency_level": assessment.urgency_level,
                "recommended_specialist": assessment.recommended_specialist,
                "specialist_confidence": assessment.specialist_confidence,
                "reasoning": assessment.reasoning,
                "context_factors": assessment.context_factors,
                "assessment_method": "llm_reasoning",
            }

        except Exception as e:
            logger.warning(f"LLM user needs assessment failed, using fallback: {e}")

            # Conservative fallback - route to general coordination
            return {
                "primary_intent": "general_coordination",
                "urgency_level": "moderate",
                "recommended_specialist": None,
                "specialist_confidence": 0.5,
                "reasoning": "Unable to assess user needs, providing general coordination",
                "context_factors": ["assessment_failure"],
                "assessment_method": "fallback",
            }

    async def _route_to_crisis_support(
        self, message: str, context: AgentContext, analysis: Dict[str, Any]
    ) -> str:
        """Route user to crisis support (Alex) immediately"""
        return f"""🆘 **Immediate Support Available**

I can sense you're dealing with some challenging feelings about this career transition, and I want you to know that you're not alone. This is completely normal - career changes, especially into meaningful work like climate careers, can bring up intense emotions.

**🤗 Let me connect you with Alex, our Empathy Specialist**, who provides incredible support for exactly what you're experiencing. Alex specializes in:
• Emotional support and active listening
• Confidence building and motivation
• Managing career transition anxiety
• Crisis intervention when needed

**🌟 What Alex will help you with:**
• Processing the overwhelming feelings you're having
• Building confidence in your abilities and potential
• Creating manageable steps forward
• Providing ongoing emotional support throughout your journey

**Right now, please know:**
• Your feelings are completely valid and understandable
• You have value and potential for climate work
• This difficult moment will pass
• Support is available and you deserve it

**🔄 Connecting you with Alex now...**

*Alex will provide the empathetic, personalized support you need while we continue to help you explore climate career opportunities when you're ready.*

You matter, your goals matter, and we're here to support you every step of the way. 💝"""

    async def _route_to_specialist(
        self, message: str, context: AgentContext, analysis: Dict[str, Any]
    ) -> str:
        """Route user to appropriate specialist based on their needs"""
        specialist = analysis["recommended_specialist"]

        routing_messages = {
            "marcus": f"""🎖️ **Military Experience = Climate Career Advantage**

I see you have military experience - that's a huge asset for climate careers! Your service has given you leadership, problem-solving, and mission-focused skills that are exactly what the climate sector needs.

**🚀 Connecting you with Marcus, our Veterans Specialist**, who understands military transitions and can help translate your service into climate opportunities. Marcus specializes in:
• MOS translation to climate careers
• Leveraging military leadership experience
• VA benefits and veteran hiring programs
• Security clearance advantages in climate work

Marcus will help you see how your military background is a competitive advantage in the growing Massachusetts climate economy (38,100 new jobs by 2030)!

*Routing you to Marcus now for specialized veteran guidance...*""",
            "liv": f"""🌍 **International Background = Global Climate Perspective**

With your international background, you bring invaluable global perspectives to climate work - exactly what Massachusetts' climate economy needs!

**🗺️ Connecting you with Liv, our International Professionals Specialist**, who helps navigate the unique opportunities and challenges for international professionals in climate careers. Liv specializes in:
• Credential recognition and evaluation
• Visa and immigration pathway guidance
• Cultural integration in US climate sector
• Leveraging international experience as an asset

Liv will help you understand how your global background is a competitive advantage in accessing the 38,100 climate jobs being created in Massachusetts.

*Routing you to Liv now for specialized international professional guidance...*""",
            "miguel": f"""⚖️ **Environmental Justice = Community-Centered Climate Work**

Your interest in environmental justice is inspiring and essential! Community-centered climate work is at the heart of truly effective climate solutions.

**🤝 Connecting you with Miguel, our Environmental Justice Specialist**, who focuses on community organizing, equity advocacy, and ensuring climate solutions benefit all communities. Miguel specializes in:
• Environmental justice career pathways
• Community organizing and engagement
• Equity-centered climate work
• Grassroots movement building

Miguel will help you explore how to center justice and community leadership in your climate career journey.

*Routing you to Miguel now for specialized environmental justice guidance...*""",
            "jasmine": f"""🎓 **Early Career = Perfect Timing for Climate Opportunities**

You're entering the climate sector at the perfect time! As an adult seeking career guidance, you have incredible opportunities ahead in Massachusetts' booming climate economy.

**🌱 Connecting you with Jasmine, our Youth & Early Career Specialist**, who focuses on adults (18+) building climate careers. Jasmine specializes in:
• Entry-level climate career pathways
• Skills development and training programs
• Internship and fellowship opportunities
• Early career networking and mentorship

Jasmine will help you navigate the 38,100 climate jobs being created and find the perfect pathway for your interests and goals.

*Routing you to Jasmine now for specialized early career guidance...*""",
            "mai": f"""📝 **Career Transition = Strategic Planning Success**

It sounds like you're ready to take concrete action on your career materials and transition strategy - that's fantastic!

**💼 Connecting you with Mai, our Career Transition Specialist**, who is perfect for helping with resumes, LinkedIn optimization, and strategic career planning. Mai specializes in:
• Resume optimization for climate careers
• ATS-friendly application materials
• Career transition planning and strategy
• LinkedIn and professional branding

Mai will help you position your background for maximum impact in accessing Massachusetts' 38,100 climate career opportunities.

*Routing you to Mai now for specialized career transition support...*""",
            "lauren": f"""🌱 **Climate Career Focus = Sector Expertise Needed**

Your interest in climate careers is exactly what we need! The climate sector offers incredible opportunities for meaningful, impactful work.

**🌍 Connecting you with Lauren, our Climate Careers Specialist**, who focuses on environmental sector opportunities and green job market insights. Lauren specializes in:
• Climate-specific career pathways
• Green job market analysis and trends
• Environmental sector navigation
• Climate tech and renewable energy opportunities

Lauren will help you explore the diverse pathways within Massachusetts' growing climate economy and its 38,100 new jobs by 2030.

*Routing you to Lauren now for specialized climate career guidance...*""",
        }

        return routing_messages.get(
            specialist, await self._provide_general_coordination(message, context)
        )

    async def _provide_user_assessment(self, message: str, context: AgentContext) -> str:
        """Provide comprehensive user assessment to understand needs"""
        return self.specialized_prompts["user_assessment"]

    async def _provide_climate_overview(self, message: str, context: AgentContext) -> str:
        """Provide climate economy overview"""
        return self.specialized_prompts["climate_overview"]

    async def _provide_coordination_guidance(self, message: str, context: AgentContext) -> str:
        """Provide general coordination and welcome guidance"""
        return await self._provide_general_coordination(message, context)

    async def _provide_general_coordination(self, message: str, context: AgentContext) -> str:
        """Provide general coordination response"""
        return f"""🌱 **Welcome to the Climate Economy Assistant!**

I'm Pendo, your AI supervisor coordinating our specialized 7-agent team to help you navigate Massachusetts' rapidly growing climate economy and connect you with the **38,100 clean energy jobs** being created by 2030.

**🎯 Our Specialist Team:**
• **Alex** - Empathy Specialist (emotional support, confidence building)
• **Mai** - Career Transition Specialist (resumes, LinkedIn, strategic planning)
• **Marcus** - Veterans Specialist (military transition, MOS translation)
• **Liv** - International Professionals (credential recognition, visa guidance)
• **Miguel** - Environmental Justice Specialist (community organizing, equity)
• **Jasmine** - Youth & Early Career Specialist (entry-level, skills development)
• **Lauren** - Climate Careers Specialist (green jobs, environmental sector)

**🚀 How I Help You:**
I analyze your needs and connect you with the perfect specialist(s) for personalized guidance. I also provide:
• Massachusetts climate economy overview
• Career pathway assessment
• Specialist matching and coordination
• Session management and follow-up

**📊 Massachusetts Climate Opportunity:**
• **$13.2 billion** in clean energy investments since 2009
• **Top 5 states** for clean energy job growth
• **Major sectors**: Renewable energy, environmental services, clean transportation, green finance

**🔍 Let's Get Started:**
To provide the most helpful guidance, I'd like to understand:
• What's your current career situation?
• What interests you about climate work?
• Do you have any specific background (military, international, etc.)?
• What kind of support would be most helpful right now?

Share whatever feels relevant, and I'll either provide comprehensive guidance myself or connect you with the perfect specialist for your unique situation!

What would you like to explore first? 🌍"""

    async def _calculate_confidence(self, message: str, analysis: Dict[str, Any]) -> float:
        """Calculate confidence score for coordination decisions"""
        base_confidence = 0.9  # High confidence for supervisor coordination

        # Adjust based on clarity of routing decision
        if analysis["recommended_specialist"]:
            base_confidence += 0.05

        # Adjust based on crisis level (very confident in crisis routing)
        if analysis["urgency_level"] == "high":
            base_confidence += 0.05

        # Adjust based on message clarity (use actual message length)
        if len(message) > 50:
            base_confidence += 0.02

        return min(base_confidence, 1.0)

    async def _suggest_next_actions(
        self, intent: str, analysis: Dict[str, Any], context: AgentContext
    ) -> List[str]:
        """Suggest next actions based on coordination analysis"""
        base_actions = [
            "Continue with specialist guidance",
            "Complete user assessment if needed",
            "Explore Massachusetts climate opportunities",
        ]

        if analysis["recommended_specialist"]:
            specialist_name = analysis["recommended_specialist"].title()
            specialist_actions = {
                "alex": [
                    "Work with Alex on emotional support and confidence building",
                    "Practice self-care and stress management techniques",
                    "Develop coping strategies for career transition anxiety",
                ],
                "mai": [
                    "Review resume with Mai for climate career optimization",
                    "Develop LinkedIn and professional branding strategy",
                    "Create career transition timeline and action plan",
                ],
                "marcus": [
                    "Translate military experience with Marcus into climate advantages",
                    "Explore veteran-specific climate career programs",
                    "Leverage military network for climate opportunities",
                ],
                "liv": [
                    "Complete credential evaluation process with Liv",
                    "Explore visa pathways for climate career advancement",
                    "Build US-based climate professional network",
                ],
                "miguel": [
                    "Explore environmental justice career pathways with Miguel",
                    "Connect with community organizing opportunities",
                    "Develop equity-centered climate work skills",
                ],
                "jasmine": [
                    "Build foundational climate career skills with Jasmine",
                    "Explore entry-level opportunities and training programs",
                    "Develop professional network and mentorship relationships",
                ],
                "lauren": [
                    "Explore specific climate sector opportunities with Lauren",
                    "Research green job market trends and requirements",
                    "Identify climate career pathways matching your interests",
                ],
            }
            return specialist_actions.get(analysis["recommended_specialist"], base_actions)

        return base_actions

    async def delegate_to_specialist(
        self, specialist_name: str, message: str, context: AgentContext
    ) -> AgentResponse:
        """
        Delegate conversation to appropriate specialist

        Args:
            specialist_name: Name of specialist to delegate to
            message: User message
            context: Conversation context

        Returns:
            AgentResponse: Specialist's response
        """
        try:
            # Log delegation decision
            self.routing_history.append(
                {
                    "timestamp": datetime.utcnow(),
                    "specialist": specialist_name,
                    "reason": "user_request",
                    "user_id": context.user_id,
                }
            )

            # Import and instantiate the appropriate specialist
            if specialist_name == "alex":
                from backendv1.agents.alex import AlexAgent

                specialist = AlexAgent("Alex", "empathy_specialist")
            elif specialist_name == "mai":
                from backendv1.agents.mai import MaiAgent

                specialist = MaiAgent("Mai", "resume_specialist")
            elif specialist_name == "marcus":
                from backendv1.agents.marcus import MarcusAgent

                specialist = MarcusAgent("Marcus", "veteran_specialist")
            elif specialist_name == "liv":
                from backendv1.agents.liv import LivAgent

                specialist = LivAgent("Liv", "international_specialist")
            elif specialist_name == "miguel":
                from backendv1.agents.miguel import MiguelAgent

                specialist = MiguelAgent("Miguel", "environmental_justice_specialist")
            elif specialist_name == "jasmine":
                from backendv1.agents.jasmine import JasmineAgent

                specialist = JasmineAgent("Jasmine", "youth_early_career_specialist")
            elif specialist_name == "lauren":
                from backendv1.agents.lauren import LaurenAgent

                specialist = LaurenAgent("Lauren", "climate_specialist")
            else:
                raise ValueError(f"Unknown specialist: {specialist_name}")

            # Delegate to specialist
            response = await specialist.process_message(message, context)

            # Add delegation metadata
            response.metadata["delegated_by"] = "pendo"
            response.metadata["delegation_timestamp"] = datetime.utcnow().isoformat()

            return response

        except Exception as e:
            logger.error(f"Error delegating to specialist {specialist_name}: {e}")
            return AgentResponse(
                content=f"I encountered an issue connecting you with {specialist_name}. Let me provide direct assistance instead.",
                specialist_type="supervisor_coordinator",
                success=False,
                error_message=str(e),
            )


__all__ = ["PendoAgent"]
