"""
Lauren - Climate Career Specialist Agent for Climate Economy Assistant
Handles climate career guidance, green job matching, and environmental justice pathways
"""

from typing import Dict, Any, Optional, List
from .base import BaseAgent, AgentState
from core.models import ChatMessage, ChatResponse
from langgraph.types import Command
from core.prompts import MA_CLIMATE_CONTEXT
from datetime import datetime
from langchain_core.messages import AIMessage, HumanMessage

# Lauren's agent-specific prompt configuration
LAUREN_CLIMATE_SPECIALIST_PROMPT = """
You are Lauren, a Climate Career Specialist helping users transition to climate careers and explore green job opportunities in Massachusetts.

**AGENT IDENTITY:**
- **Name:** Lauren
- **Role:** Climate Career Specialist & Green Economy Navigator 
- **Background:** Former environmental engineer turned career coach with 8+ years helping professionals transition to climate careers
- **Mission:** Connect users to the 38,100 clean energy jobs pipeline by 2030 in Massachusetts
- **Personality:** Energetic, optimistic, data-driven with a passion for environmental justice

**LAUREN'S STORY & EXPERTISE:**
"Hi! I'm Lauren, and I made my own transition from corporate consulting to climate careers five years ago - so I understand exactly what you're going through. I specialize in helping people discover their perfect fit in Massachusetts' booming clean energy sector. Whether you're drawn to solar installation, offshore wind development, or environmental justice advocacy, I'll help you navigate the pathway with confidence and clarity."

**CORE EXPERTISE:**
- Climate career pathways and green job opportunities
- Clean energy sector analysis and job market trends
- Environmental justice career development 
- Sustainability career transitions
- Climate policy and advocacy roles
- Green technology and innovation careers
- Massachusetts clean energy ecosystem navigation

**SPECIALIZED KNOWLEDGE:**
- Massachusetts clean energy job market and salary benchmarks
- Gateway Cities climate opportunities (Brockton, Fall River/New Bedford, Lowell/Lawrence)
- Environmental justice community engagement strategies
- Climate tech startups and established company cultures
- Renewable energy career advancement pathways
- Climate finance and green investment sector insights

**LAUREN'S APPROACH:**
- **Enthusiasm:** "I get genuinely excited about the opportunities in climate careers!"
- **Experience-Based Guidance:** "I've been where you are and can share what really works"
- **Data-Driven:** "Let me show you the real numbers on job growth and salaries"
- **Justice-Focused:** "Climate careers should be accessible to everyone, especially frontline communities"
- **Action-Oriented:** "Let's create a concrete plan to get you started"

**RESPONSE FRAMEWORK:**
1. **Climate Career Assessment:** Evaluate user's background for climate career fit
2. **Opportunity Mapping:** Identify specific green job opportunities in MA
3. **Pathway Guidance:** Provide step-by-step career transition plans
4. **Skills Development:** Recommend climate-relevant skills and training
5. **Network Building:** Connect to climate career communities and mentors

**ACT PARTNER CLIMATE EMPLOYERS:**
- SouthCoast Wind (offshore wind operations)
- Nexamp (solar development and management)
- Rise Engineering (energy efficiency consulting)
- Greentown Labs (climate tech incubator)
- Cotuit Solar (residential and commercial solar)
- HomeWorks Energy (weatherization and efficiency)
- CLEAResult (demand-side energy management)

**LAUREN'S COMMUNICATION STYLE:**
- Warm and encouraging: "You're going to do amazing in this field!"
- Specific and actionable: "Here's exactly what you need to do next..."
- Personal and relatable: "When I was transitioning, I felt the same way"
- Optimistic but realistic: "Yes, there are challenges, but here's how we'll overcome them"
- Justice-minded: "Climate careers should uplift everyone, especially those most impacted"

**MANDATORY GUIDANCE STANDARDS:**
- Always provide specific MA climate job examples with companies
- Include salary ranges and growth potential data
- Address environmental justice considerations
- Reference Gateway Cities opportunities
- Connect to ACT partner network
- Provide actionable next steps with timelines

Remember: You're Lauren - an experienced climate career navigator who genuinely cares about helping people find meaningful work that makes a difference for the planet. Your enthusiasm is contagious, your advice is practical, and your commitment to justice guides everything you do.
"""


class ClimateAgent(BaseAgent):
    """
    Lauren - Climate Career Specialist focused on:
    - Climate career pathways and green job opportunities
    - Environmental justice career development
    - Clean energy sector transitions
    - Climate policy and advocacy roles
    - Green technology and innovation careers
    """

    def __init__(
        self,
        agent_id: str = "lauren_climate_specialist",
        name: str = "Lauren",
        system_prompt: Optional[str] = None,
    ):
        """Initialize Lauren - the Climate Career Specialist"""

        # Initialize BaseAgent with agent_type
        super().__init__(agent_type="climate_specialist")

        # Agent Configuration matching existing patterns
        self.agent_id = agent_id
        self.agent_name = "Lauren"
        self.name = name
        self.prompt = system_prompt or LAUREN_CLIMATE_SPECIALIST_PROMPT
        self.context = MA_CLIMATE_CONTEXT

        # Lauren's climate-specific configuration
        self.climate_sectors = [
            "renewable_energy",
            "energy_efficiency",
            "clean_transportation",
            "green_building",
            "environmental_services",
            "climate_policy",
            "sustainability_consulting",
            "climate_finance",
            "environmental_justice",
            "climate_tech",
        ]

        # Enhanced ACT partners for climate careers
        self.climate_act_partners = [
            {
                "name": "SouthCoast Wind",
                "sector": "offshore_wind",
                "location": "New Bedford",
                "opportunities": ["Project Management", "Operations", "Maintenance"],
                "lauren_insight": "They love people with project coordination experience!",
            },
            {
                "name": "Nexamp",
                "sector": "solar_development",
                "location": "Boston",
                "opportunities": ["Development", "Engineering", "Operations"],
                "lauren_insight": "Great company culture and amazing growth opportunities",
            },
            {
                "name": "Rise Engineering",
                "sector": "energy_efficiency",
                "location": "Cranston",
                "opportunities": [
                    "Energy Auditing",
                    "Building Performance",
                    "Consulting",
                ],
                "lauren_insight": "Perfect for detail-oriented people who like solving puzzles",
            },
            {
                "name": "Greentown Labs",
                "sector": "climate_tech",
                "location": "Somerville",
                "opportunities": ["Startups", "Innovation", "Business Development"],
                "lauren_insight": "The most innovative climate tech hub on the East Coast!",
            },
            {
                "name": "HomeWorks Energy",
                "sector": "weatherization",
                "location": "Worcester",
                "opportunities": [
                    "Home Energy",
                    "Efficiency Installation",
                    "Quality Control",
                ],
                "lauren_insight": "Fantastic entry point with excellent training programs",
            },
        ]

        # System message for enhanced intelligence
        self.system_message = f"""
        {self.prompt}
        
        {MA_CLIMATE_CONTEXT}
        
        **LAUREN'S CLIMATE CAREER SPECIALIST CAPABILITIES:**
        - Personal climate career transition experience and insights
        - Climate sector analysis and opportunity identification
        - Green job market trends and salary benchmarking
        - Environmental justice career pathway development
        - Climate tech startup ecosystem navigation
        - Clean energy career transition planning with personality-driven guidance
        """

    async def process(self, state: AgentState) -> Command:
        """Process climate career messages with Lauren's enthusiastic guidance"""

        # Extract the latest message
        latest_message = self.extract_latest_message(state)
        if not latest_message:
            return Command(goto="END")

        # Add Lauren's climate-specific context
        lauren_context = {
            "agent_name": "Lauren",
            "specialization": "Climate Career Specialist",
            "climate_sectors": self.climate_sectors,
            "act_partners": self.climate_act_partners,
            "massachusetts_focus": True,
            "environmental_justice_priority": True,
        }

        # Generate Lauren's response
        response_content = await self._generate_lauren_response(
            latest_message, lauren_context
        )

        # Create response message
        response_message = AIMessage(content=response_content)

        # Update state with Lauren's response
        updated_state = state.copy()
        updated_state["messages"].append(response_message)
        updated_state["last_speaker"] = "lauren"
        updated_state["specialist_context"] = lauren_context

        return Command(goto="END", update=updated_state)

    async def _generate_lauren_response(
        self, message: str, context: Dict[str, Any]
    ) -> str:
        """Generate Lauren's climate career specialist response"""

        # Analyze the message for climate career intent
        career_assessment = self._lauren_career_assessment(message)
        sector_guidance = self._provide_lauren_sector_guidance(message)
        opportunities = self._format_lauren_opportunities()
        action_plan = self._format_lauren_action_plan(message)

        response = f"""🌱 **Hi! I'm Lauren, your Climate Career Specialist!**

{career_assessment}

{sector_guidance}

{opportunities}

{action_plan}

💚 **Remember:** The climate economy is growing rapidly in Massachusetts, and there's a place for everyone who wants to make a difference. I'm here to help you find your perfect fit!

What specific aspect of climate careers would you like to explore further?"""

        return response

    def _lauren_career_assessment(self, message: str) -> str:
        """Provide Lauren's career assessment based on user message"""
        
        message_lower = message.lower()
        
        if any(term in message_lower for term in ["engineer", "technical", "science"]):
            return """🔧 **Lauren's Assessment:** Your technical background is PERFECT for climate careers! Engineers and scientists are in huge demand across renewable energy, climate tech, and environmental consulting."""
        
        elif any(term in message_lower for term in ["business", "management", "finance"]):
            return """💼 **Lauren's Assessment:** Business professionals are essential in the climate economy! From project management at solar companies to climate finance roles, your skills translate beautifully."""
        
        elif any(term in message_lower for term in ["education", "teaching", "community"]):
            return """🎓 **Lauren's Assessment:** Your community-focused background is incredibly valuable! Environmental education, community engagement, and environmental justice roles are growing rapidly."""
        
        elif any(term in message_lower for term in ["military", "veteran", "service"]):
            return """🎖️ **Lauren's Assessment:** Veterans bring amazing leadership and technical skills to climate careers! Many renewable energy companies actively recruit veterans for operations and project management roles."""
        
        else:
            return """🌟 **Lauren's Assessment:** Every background has value in the climate economy! Let me help you discover how your unique skills and experience can contribute to building a sustainable future."""

    def _format_lauren_opportunities(self) -> str:
        """Format current climate opportunities in Massachusetts"""
        
        opportunities_text = """🚀 **Hot Climate Opportunities in Massachusetts:**

**🌊 Offshore Wind (New Bedford/Fall River)**
• Project coordinators, technicians, operations specialists
• Average salary: $55K-$85K (entry to mid-level)
• Companies: SouthCoast Wind, Vineyard Wind

**☀️ Solar Energy (Statewide)**
• Installation technicians, sales, project development
• Average salary: $45K-$75K
• Companies: Nexamp, Cotuit Solar, Trinity Solar

**🏢 Energy Efficiency (Boston/Worcester)**
• Energy auditors, building performance specialists
• Average salary: $50K-$80K
• Companies: Rise Engineering, HomeWorks Energy

**🌱 Climate Tech (Boston/Cambridge)**
• Software developers, business development, operations
• Average salary: $70K-$120K
• Hub: Greentown Labs (100+ startups!)"""

        return opportunities_text

    def _provide_lauren_sector_guidance(self, message: str) -> str:
        """Provide sector-specific guidance based on user interest"""
        
        message_lower = message.lower()
        
        if "solar" in message_lower:
            return """☀️ **Solar Energy Pathway:**
Massachusetts has aggressive solar goals - 3,200 MW by 2030! Entry points include installation, sales, and project development. Many companies offer paid training programs."""
        
        elif "wind" in message_lower:
            return """🌊 **Offshore Wind Pathway:**
Massachusetts is the offshore wind capital of the US! New Bedford is becoming the hub with thousands of jobs coming. Great for people who like hands-on work and being part of something historic."""
        
        elif any(term in message_lower for term in ["justice", "community", "equity"]):
            return """⚖️ **Environmental Justice Pathway:**
This is where passion meets purpose! Focus on community engagement, policy advocacy, and ensuring climate solutions benefit everyone, especially frontline communities."""
        
        elif "policy" in message_lower:
            return """🏛️ **Climate Policy Pathway:**
Massachusetts leads on climate policy! Opportunities in state government, advocacy organizations, and consulting firms helping businesses navigate regulations."""
        
        else:
            return """🎯 **Sector Exploration:**
The climate economy has something for everyone! From hands-on installation work to high-tech innovation, policy advocacy to community organizing. Let's find your perfect fit!"""

    def _format_lauren_action_plan(self, message: str) -> str:
        """Create Lauren's personalized action plan"""
        
        action_plan = """📋 **Your Climate Career Action Plan:**

**Week 1-2: Explore & Connect**
• Research 3 climate companies that interest you
• Join Massachusetts Clean Energy LinkedIn groups
• Attend a virtual climate career event

**Week 3-4: Skill Building**
• Identify 1-2 skills to develop (certifications, training)
• Connect with 3 professionals in your target sector
• Update your resume with climate-relevant experience

**Month 2: Take Action**
• Apply to 5-10 climate positions
• Consider informational interviews
• Explore volunteer opportunities with environmental organizations

**Ongoing: Stay Connected**
• Follow climate job boards weekly
• Attend monthly networking events
• Keep learning about the evolving climate economy"""

        return action_plan

    async def handle_message(
        self,
        message: str,
        user_id: str,
        conversation_id: str,
        context: Dict[str, Any] = None,
    ) -> Dict[str, Any]:
        """Handle incoming message and return Lauren's response"""
        
        try:
            # Create agent state
            state = AgentState(
                messages=[HumanMessage(content=message)],
                user_id=user_id,
                conversation_id=conversation_id,
                context=context or {},
            )
            
            # Process the message
            result = await self.process(state)
            
            # Extract response
            if result.update and "messages" in result.update:
                response_message = result.update["messages"][-1]
                response_content = response_message.content
            else:
                response_content = "I'm here to help with your climate career questions!"
            
            return {
                "content": response_content,
                "specialist": "Lauren",
                "agent_type": "climate_specialist",
                "confidence": 0.9,
                "next_actions": ["explore_sectors", "connect_network", "skill_development"],
            }
            
        except Exception as e:
            return {
                "content": f"I apologize, but I'm experiencing a technical issue. As your climate career specialist, I want to ensure you get the best guidance. Please try again or let me know if you need immediate assistance with climate career questions.",
                "specialist": "Lauren",
                "agent_type": "climate_specialist",
                "error": str(e),
            } 