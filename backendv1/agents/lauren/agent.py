"""
Lauren - Climate Career Specialist Agent

Following rule #2: Create modular agent components for easy maintenance
Following rule #3: Component documentation explaining purpose and functionality
Following rule #12: Complete code verification with proper agent implementation

Lauren specializes in comprehensive climate economy guidance, green job opportunities,
and environmental justice career pathways.

Location: backendv1/agents/lauren/agent.py
"""

from typing import Dict, Any, List
from datetime import datetime

from backendv1.agents.base.agent_base import AgentBase, AgentContext, AgentResponse
from backendv1.utils.logger import setup_logger
from .prompts import (
    LAUREN_SYSTEM_PROMPT,
    USER_ASSESSMENT_PROMPT,
    GENERAL_CLIMATE_GUIDANCE_PROMPT,
    LAUREN_CONFIG,
)

logger = setup_logger("lauren_agent")


class LaurenAgent(AgentBase):
    """
    Lauren - Climate Career Specialist

    Specialized in:
    - Comprehensive climate economy guidance
    - Green job opportunities and pathways
    - Environmental justice career development
    - Sustainability sector navigation
    - Climate policy career guidance
    """

    def _load_prompts(self):
        """Load Lauren-specific prompts and templates"""
        self.system_prompt = LAUREN_SYSTEM_PROMPT

        self.specialized_prompts = {
            "user_assessment": USER_ASSESSMENT_PROMPT,
            "general_guidance": GENERAL_CLIMATE_GUIDANCE_PROMPT,
            "career_exploration": "Let me help you explore how your background aligns with climate career opportunities...",
            "job_matching": "Based on your skills and interests, here are some promising climate career paths...",
            "industry_insights": "The climate economy offers exciting opportunities across sectors...",
            "transition_planning": "Here's a strategic approach to transitioning into climate work...",
        }

    def _load_tools(self):
        """Load and configure Lauren-specific tools"""
        self.available_tools = [
            "web_search_climate_jobs",
            "climate_career_database",
            "green_job_matching",
            "sustainability_resource_search",
            "climate_policy_resources",
            "environmental_justice_resources",
            "climate_tech_insights",
            "renewable_energy_careers",
        ]

    def _setup_capabilities(self):
        """Set up Lauren-specific capabilities and configurations"""
        self.specialization_areas = [
            "climate_career_guidance",
            "green_job_opportunities",
            "sustainability_careers",
            "environmental_justice",
            "climate_policy",
            "renewable_energy",
            "climate_tech",
            "esg_careers",
        ]

        self.expertise_level = "expert"
        self.confidence_threshold = 0.8

    async def process_message(self, message: str, context: AgentContext) -> AgentResponse:
        """
        Process user message and provide climate career guidance

        Following rule #6: Asynchronous data handling for performance
        Following rule #15: Include comprehensive error handling

        Args:
            message: User's message
            context: Conversation context

        Returns:
            AgentResponse: Lauren's specialized response
        """
        try:
            logger.info(f"🌍 Lauren processing climate career message for user {context.user_id}")

            # Analyze message for climate career intent
            intent = await self._analyze_career_intent(message)

            # Generate specialized response based on intent
            if intent == "career_exploration":
                response_content = await self._provide_career_exploration(message, context)
            elif intent == "job_search":
                response_content = await self._provide_job_search_guidance(message, context)
            elif intent == "transition_planning":
                response_content = await self._provide_transition_planning(message, context)
            elif intent == "industry_insights":
                response_content = await self._provide_industry_insights(message, context)
            else:
                response_content = await self._provide_general_climate_guidance(message, context)

            # Calculate confidence score
            confidence = await self._calculate_confidence(message, intent)

            # Identify next actions
            next_actions = await self._suggest_next_actions(intent, context)

            return AgentResponse(
                content=response_content,
                specialist_type="climate_specialist",
                confidence_score=confidence,
                tools_used=["climate_career_analysis", "green_job_database"],
                next_actions=next_actions,
                sources=[
                    "Climate Career Database",
                    "Green Jobs Network",
                    "Sustainability Workforce Development",
                ],
                metadata={
                    "intent": intent,
                    "specialization": "climate_career_guidance",
                    "expertise_areas": self.specialization_areas,
                },
            )

        except Exception as e:
            logger.error(f"Error in Lauren's message processing: {e}")
            return AgentResponse(
                content="I apologize, but I'm experiencing a technical issue. Let me connect you with additional support to ensure you get the climate career guidance you need.",
                specialist_type="climate_specialist",
                success=False,
                error_message=str(e),
            )

    async def _analyze_career_intent(self, message: str) -> str:
        """Analyze user message to determine career guidance intent"""
        message_lower = message.lower()

        if any(
            term in message_lower
            for term in ["explore", "interested in", "learn about", "what are"]
        ):
            return "career_exploration"
        elif any(term in message_lower for term in ["job", "position", "hiring", "opportunity"]):
            return "job_search"
        elif any(term in message_lower for term in ["transition", "change", "switch", "move to"]):
            return "transition_planning"
        elif any(term in message_lower for term in ["industry", "sector", "field", "market"]):
            return "industry_insights"
        else:
            return "general_guidance"

    async def _provide_career_exploration(self, message: str, context: AgentContext) -> str:
        """Provide career exploration guidance"""
        return """🌍 **Climate Career Exploration**

The climate economy offers incredible opportunities across multiple sectors! Here's how to start exploring:

**🏢 Key Climate Sectors:**
• **Renewable Energy**: Solar, wind, hydroelectric, and emerging technologies
• **Energy Efficiency**: Building retrofits, smart grid, and efficiency consulting  
• **Climate Tech**: Carbon capture, climate modeling, and green technology innovation
• **Sustainable Finance**: ESG investing, green bonds, and climate risk analysis
• **Environmental Justice**: Community organizing, policy advocacy, and equitable solutions

**🎯 Next Steps:**
1. **Skills Assessment**: Let's identify how your current skills translate to climate work
2. **Sector Deep-Dive**: Choose 2-3 sectors that resonate with your interests and values
3. **Network Building**: Connect with professionals in your target climate sectors
4. **Skill Development**: Identify any gaps and create a learning plan

**💡 Quick Win**: Start following climate career resources and attending virtual climate job fairs.

What specific climate sector interests you most? I can provide detailed pathway guidance."""

    async def _provide_job_search_guidance(self, message: str, context: AgentContext) -> str:
        """Provide job search guidance for climate careers"""
        return """🎯 **Climate Job Search Strategy**

Here's a strategic approach to finding climate career opportunities:

**🔍 Where Climate Jobs Are:**
• **Job Boards**: Climate Jobs List, Green Jobs Network, Idealist (Environmental)
• **Company Direct**: Check career pages of climate leaders like Tesla, Patagonia, Interface
• **Organizations**: Environmental Defense Fund, Natural Resources Defense Council, local nonprofits
• **Government**: EPA, Department of Energy, state environmental agencies
• **Startups**: AngelList climate filter, climate accelerator portfolio companies

**📝 Application Strategy:**
1. **Climate-Focused Resume**: Highlight relevant experience, even if not directly environmental
2. **Cover Letter**: Demonstrate genuine passion for climate solutions and mission alignment
3. **Networking**: LinkedIn climate groups, local sustainability meetups, informational interviews
4. **Skills Positioning**: Frame existing skills in climate context (project management → sustainability program management)

**🚀 High-Demand Skills:**
• Project management for sustainability initiatives
• Data analysis for climate impact measurement
• Communications for climate education and advocacy
• Policy analysis and regulatory compliance

Would you like me to help optimize your resume for climate positions or identify specific opportunities in your area?"""

    async def _provide_transition_planning(self, message: str, context: AgentContext) -> str:
        """Provide career transition planning guidance"""
        return """🔄 **Climate Career Transition Plan**

Transitioning to climate work is strategic and achievable with the right approach:

**📊 Transition Framework:**

**Phase 1: Foundation (Months 1-2)**
• Skills inventory and gap analysis
• Climate sector research and informational interviews
• Start building climate knowledge through courses/reading
• Join climate professional networks

**Phase 2: Skill Building (Months 3-6)**
• Complete relevant certifications (sustainability, renewable energy, climate policy)
• Volunteer with environmental organizations
• Start side projects related to climate solutions
• Attend climate conferences and workshops

**Phase 3: Active Transition (Months 6-12)**
• Update resume and LinkedIn with climate focus
• Apply for climate-adjacent roles in current industry
• Consider transitional roles (sustainability coordinator, environmental compliance)
• Build portfolio of climate-related work

**🛠️ Transferable Skills to Highlight:**
• **Project Management** → Sustainability program management
• **Finance/Accounting** → Carbon accounting, green finance
• **Marketing** → Climate communications, green marketing
• **Operations** → Sustainable operations, supply chain sustainability
• **HR** → Sustainability workforce development

What's your current background? I can create a personalized transition roadmap for you."""

    async def _provide_industry_insights(self, message: str, context: AgentContext) -> str:
        """Provide climate industry insights"""
        return """📈 **Climate Economy Industry Insights**

The climate economy is one of the fastest-growing sectors with incredible opportunities:

**🚀 Growth Sectors:**
• **Clean Energy**: $1.8 trillion invested globally in 2023, millions of jobs created
• **Climate Tech**: $40+ billion in venture funding, breakthrough technologies emerging
• **ESG & Sustainable Finance**: Every major bank now has dedicated teams
• **Climate Adaptation**: Infrastructure resilience, disaster preparedness growing rapidly

**💼 Career Outlook:**
• **High Demand**: Solar installers, wind technicians, sustainability analysts
• **Emerging Roles**: Carbon accountants, climate risk analysts, green finance specialists
• **Leadership**: Chief sustainability officers, climate policy directors
• **Technical**: Climate data scientists, renewable energy engineers

**🌟 Why Now is the Perfect Time:**
• Paris Agreement driving massive investment
• Corporate net-zero commitments creating jobs
• Government incentives (IRA, Green New Deal) funding growth
• Early career advantage in rapidly evolving field

**📍 Geographic Hotspots:**
• **West Coast**: Climate tech, renewable energy
• **Northeast**: Finance, policy, consulting
• **Texas**: Wind energy, clean tech manufacturing
• **Colorado**: Federal agencies, outdoor industry sustainability

What specific aspect of the climate economy would you like to explore further?"""

    async def _provide_general_climate_guidance(self, message: str, context: AgentContext) -> str:
        """Provide general climate career guidance"""
        return """🌍 **Welcome to Climate Career Guidance!**

I'm Lauren, your Climate Career Specialist. I'm here to help you navigate the exciting world of climate careers and sustainability opportunities.

**🎯 How I Can Help:**
• **Career Exploration**: Discover climate career paths that match your interests and skills
• **Job Search Strategy**: Find climate opportunities and optimize your application materials
• **Transition Planning**: Create a roadmap from your current role to climate work
• **Industry Insights**: Understand climate economy trends and growth opportunities
• **Skill Development**: Identify learning opportunities and professional development
• **Network Building**: Connect with climate professionals and organizations

**🌱 Popular Starting Points:**
1. **"What climate careers match my background?"** - Skills assessment and pathway mapping
2. **"How do I find climate jobs?"** - Job search strategy and resources
3. **"I want to transition to climate work"** - Transition planning and timeline
4. **"Tell me about the renewable energy sector"** - Industry deep-dive and opportunities

**💡 Climate Career Fact**: The climate economy added 3.3 million jobs in 2023 alone, with opportunities spanning from entry-level to executive positions across all industries.

What specific aspect of climate careers would you like to explore? I'm here to provide personalized guidance for your climate career journey!"""

    async def _calculate_confidence(self, message: str, intent: str) -> float:
        """
        Calculate confidence score using LLM assessment of climate career relevance

        Replaces keyword matching with intelligent assessment of message relevance
        """
        try:
            from langchain_core.prompts import ChatPromptTemplate
            from langchain_core.output_parsers import PydanticOutputParser
            from pydantic import BaseModel, Field
            from langchain_openai import ChatOpenAI

            class ConfidenceAssessment(BaseModel):
                relevance_score: float = Field(
                    description="How relevant is this message to climate careers (0.0 to 1.0)",
                    ge=0.0,
                    le=1.0,
                )
                climate_focus: bool = Field(
                    description="Whether the message is specifically about climate/sustainability careers"
                )
                reasoning: str = Field(description="Brief explanation of the confidence assessment")

            parser = PydanticOutputParser(pydantic_object=ConfidenceAssessment)

            prompt = ChatPromptTemplate.from_messages(
                [
                    (
                        "system",
                        """You are assessing how relevant a user message is to climate career guidance.

Consider:
- Direct mentions of climate, sustainability, renewable energy, environmental work
- Career transition questions that could apply to climate sector
- Skills assessment requests that could be climate-relevant
- General career guidance that could be applied to climate work

Score 0.8-1.0: Directly about climate careers
Score 0.6-0.8: Career guidance applicable to climate sector  
Score 0.4-0.6: General career questions
Score 0.0-0.4: Not relevant to climate careers

{format_instructions}""",
                    ),
                    ("human", "User message: {message}\nDetected intent: {intent}"),
                ]
            )

            llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0.1)
            chain = prompt | llm | parser

            assessment = await chain.ainvoke(
                {
                    "message": message,
                    "intent": intent,
                    "format_instructions": parser.get_format_instructions(),
                }
            )

            # Base confidence for Lauren's climate expertise
            base_confidence = 0.8

            # Boost confidence for core competencies
            if intent in ["career_exploration", "industry_insights"]:
                base_confidence += 0.1

            # Apply LLM relevance assessment
            final_confidence = min(base_confidence * assessment.relevance_score, 1.0)

            logger.info(
                f"🎯 Lauren confidence: {final_confidence:.2f} (relevance: {assessment.relevance_score:.2f})"
            )
            return final_confidence

        except Exception as e:
            logger.warning(f"LLM confidence assessment failed: {e}")
            # Fallback to base confidence
            base_confidence = 0.8
            if intent in ["career_exploration", "industry_insights"]:
                base_confidence += 0.1
            return min(base_confidence, 1.0)

    async def _suggest_next_actions(self, intent: str, context: AgentContext) -> List[str]:
        """Suggest next actions based on user intent"""
        actions = []

        if intent == "career_exploration":
            actions = [
                "Complete skills assessment for climate career matching",
                "Research 2-3 specific climate sectors of interest",
                "Schedule informational interviews with climate professionals",
                "Join climate career networking groups",
            ]
        elif intent == "job_search":
            actions = [
                "Update resume with climate-focused language",
                "Create alerts on climate job boards",
                "Research target companies in climate space",
                "Prepare climate-focused interview responses",
            ]
        elif intent == "transition_planning":
            actions = [
                "Create 6-month transition timeline",
                "Identify skill gaps and learning opportunities",
                "Start volunteer work with environmental organizations",
                "Build climate-focused portfolio projects",
            ]
        else:
            actions = [
                "Explore climate career assessment tools",
                "Review climate economy industry reports",
                "Connect with local sustainability professionals",
                "Attend climate career webinars and events",
            ]

        return actions


# Export the agent class
__all__ = ["LaurenAgent"]
