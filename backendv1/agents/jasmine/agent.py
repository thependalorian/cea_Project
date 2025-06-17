"""
Jasmine - Youth & Early Career Specialist Agent

Following rule #2: Create modular agent components for easy maintenance
Following rule #3: Component documentation explaining purpose and functionality
Following rule #12: Complete code verification with proper agent implementation

Jasmine specializes in supporting young adults (18+) with early career guidance,
college pathways, internships, and entry-level climate career opportunities.

Location: backendv1/agents/jasmine/agent.py
"""

from typing import Dict, Any, List
from datetime import datetime

from backendv1.agents.base.agent_base import AgentBase, AgentContext, AgentResponse
from backendv1.agents.base.memory_system import MemorySystem
from backendv1.agents.base.reflection_engine import ReflectionEngine
from backendv1.utils.logger import setup_logger
from .prompts import (
    JASMINE_SYSTEM_PROMPT,
    STUDENT_CLIMATE_PATHWAYS_PROMPT,
    INTERNSHIP_FELLOWSHIP_PROMPT,
    ENTRY_LEVEL_OPPORTUNITIES_PROMPT,
    SKILLS_DEVELOPMENT_PROMPT,
    JASMINE_RESPONSE_TEMPLATES,
    JASMINE_CONFIG,
)

logger = setup_logger("jasmine_agent")


class JasmineAgent(AgentBase):
    """
    Jasmine - Youth & Early Career Specialist

    Specialized in:
    - College student climate career pathways (18+ only)
    - Internship and fellowship guidance
    - Entry-level career opportunities
    - Skills development for young professionals
    - Early career transition planning
    """

    def __init__(self, agent_name: str, agent_type: str, **kwargs):
        """Initialize Jasmine with memory and reflection capabilities"""
        super().__init__(agent_name, agent_type, **kwargs)
        self.memory_system = MemorySystem(agent_name)
        self.reflection_engine = ReflectionEngine(agent_name)

    def _load_prompts(self):
        """Load Jasmine-specific prompts and templates"""
        self.system_prompt = JASMINE_SYSTEM_PROMPT

        self.specialized_prompts = {
            "student_pathways": STUDENT_CLIMATE_PATHWAYS_PROMPT,
            "internship_guidance": INTERNSHIP_FELLOWSHIP_PROMPT,
            "entry_level_opportunities": ENTRY_LEVEL_OPPORTUNITIES_PROMPT,
            "skills_development": SKILLS_DEVELOPMENT_PROMPT,
            "career_exploration": JASMINE_RESPONSE_TEMPLATES["career_exploration"],
            "general_guidance": JASMINE_RESPONSE_TEMPLATES["general_guidance"],
        }

    def _load_tools(self):
        """Load and configure Jasmine-specific tools"""
        self.available_tools = [
            "internship_finder",
            "college_pathway_mapper",
            "entry_level_job_matcher",
            "skills_gap_analyzer",
            "scholarship_finder",
            "networking_event_locator",
            "portfolio_builder",
            "young_professional_connector",
        ]

    def _setup_capabilities(self):
        """Set up Jasmine-specific capabilities and configurations"""
        self.specialization_areas = [
            "college_student_pathways",
            "internship_programs",
            "entry_level_opportunities",
            "skills_development",
            "young_professional_networking",
            "career_exploration",
            "educational_planning",
            "early_career_transitions",
        ]

        self.expertise_level = "expert"
        self.confidence_threshold = 0.8

    async def process_message(self, message: str, context: AgentContext) -> AgentResponse:
        """
        Process user message and provide youth/early career guidance

        Following rule #6: Asynchronous data handling for performance
        Following rule #15: Include comprehensive error handling

        Args:
            message: User's message
            context: Conversation context

        Returns:
            AgentResponse: Jasmine's specialized response
        """
        try:
            logger.info(
                f"🎓 Jasmine processing youth/early career message for user {context.user_id}"
            )

            # Store interaction in memory
            await self.memory_system.store_episode(
                {
                    "type": "youth_early_career_interaction",
                    "message": message,
                    "user_id": context.user_id,
                    "context": "youth_early_career_guidance",
                }
            )

            # Analyze message for youth/early career intent
            intent = await self._analyze_youth_career_intent(message)

            # Generate specialized response based on intent
            if intent == "student_pathways":
                response_content = await self._provide_student_pathways_guidance(message, context)
            elif intent == "internship_guidance":
                response_content = await self._provide_internship_guidance(message, context)
            elif intent == "entry_level_opportunities":
                response_content = await self._provide_entry_level_guidance(message, context)
            elif intent == "skills_development":
                response_content = await self._provide_skills_development_guidance(message, context)
            elif intent == "career_exploration":
                response_content = await self._provide_career_exploration_guidance(message, context)
            else:
                response_content = await self._provide_general_youth_guidance(message, context)

            # Calculate confidence score
            confidence = await self._calculate_confidence(message, intent)

            # Identify next actions
            next_actions = await self._suggest_next_actions(intent, context)

            # Create response
            response = AgentResponse(
                content=response_content,
                specialist_type="youth_early_career_specialist",
                confidence_score=confidence,
                tools_used=[
                    "internship_finder",
                    "college_pathway_mapper",
                    "entry_level_job_matcher",
                ],
                next_actions=next_actions,
                sources=[
                    "Youth Climate Networks",
                    "College Career Services",
                    "Entry-Level Job Platforms",
                ],
                metadata={
                    "intent": intent,
                    "specialization": "youth_early_career_guidance",
                    "expertise_areas": self.specialization_areas,
                },
            )

            # Reflect on interaction
            await self.reflection_engine.reflect_on_interaction(
                {
                    "id": f"jasmine_{datetime.utcnow().timestamp()}",
                    "user_message": message,
                    "response": response_content,
                    "intent": intent,
                    "confidence": confidence,
                }
            )

            return response

        except Exception as e:
            logger.error(f"Error in Jasmine's message processing: {e}")
            return AgentResponse(
                content="I apologize, but I'm experiencing a technical issue with my youth career guidance systems. Let me connect you with college career services and youth climate organizations who can provide the support you need.",
                specialist_type="youth_early_career_specialist",
                success=False,
                error_message=str(e),
            )

    async def _analyze_youth_career_intent(self, message: str) -> str:
        """Analyze user message to determine youth/early career intent"""
        message_lower = message.lower()

        if any(
            term in message_lower
            for term in ["student", "college", "university", "major", "degree"]
        ):
            return "student_pathways"
        elif any(
            term in message_lower for term in ["internship", "fellowship", "summer", "program"]
        ):
            return "internship_guidance"
        elif any(
            term in message_lower
            for term in ["entry level", "first job", "recent graduate", "new graduate"]
        ):
            return "entry_level_opportunities"
        elif any(
            term in message_lower
            for term in ["skills", "learning", "certification", "training", "development"]
        ):
            return "skills_development"
        elif any(
            term in message_lower for term in ["explore", "career", "path", "options", "interested"]
        ):
            return "career_exploration"
        else:
            return "general_guidance"

    async def _provide_student_pathways_guidance(self, message: str, context: AgentContext) -> str:
        """Provide college student pathway guidance"""
        return self.specialized_prompts["student_pathways"]

    async def _provide_internship_guidance(self, message: str, context: AgentContext) -> str:
        """Provide internship and fellowship guidance"""
        return self.specialized_prompts["internship_guidance"]

    async def _provide_entry_level_guidance(self, message: str, context: AgentContext) -> str:
        """Provide entry-level opportunity guidance"""
        return self.specialized_prompts["entry_level_opportunities"]

    async def _provide_skills_development_guidance(
        self, message: str, context: AgentContext
    ) -> str:
        """Provide skills development guidance"""
        return self.specialized_prompts["skills_development"]

    async def _provide_career_exploration_guidance(
        self, message: str, context: AgentContext
    ) -> str:
        """Provide career exploration guidance for young adults"""
        return """🌟 **Exploring Climate Career Possibilities for Young Adults**

Hey there! I'm so excited you're interested in climate careers! This is such an important and growing field with tons of opportunities for young professionals like you.

**🌍 Why Climate Careers Are Perfect for Young Adults:**

**Growing Industry:**
• 38,100 new clean energy jobs needed in Massachusetts by 2030
• Fastest-growing job sector globally
• Innovation-driven with new opportunities emerging constantly
• Mission-driven work that makes a real difference

**Entry-Level Friendly:**
• Many organizations actively recruiting young talent
• Apprenticeship and training programs available
• Rapid career advancement opportunities
• Mentorship and professional development emphasis

**💡 Climate Career Categories to Explore:**

**Technical & Engineering:**
• Renewable Energy Engineer: Design solar and wind systems
• Environmental Scientist: Study climate impacts and solutions
• Data Analyst: Analyze climate and energy data
• Software Developer: Build climate tech applications

**Business & Finance:**
• Sustainability Consultant: Help companies reduce environmental impact
• ESG Analyst: Evaluate environmental investments
• Project Manager: Coordinate clean energy projects
• Marketing Specialist: Promote climate solutions

**Policy & Advocacy:**
• Policy Analyst: Research and develop climate policies
• Community Organizer: Build grassroots climate movements
• Communications Specialist: Tell climate stories
• Government Relations: Advocate for climate legislation

**🎯 Exploration Activities:**

**Immediate Actions (This Week):**
• Follow 10 climate professionals on LinkedIn
• Watch 3 climate career videos on YouTube
• Join one climate-focused student organization
• Attend one virtual climate event or webinar

**Short-Term Exploration (This Month):**
• Conduct 2 informational interviews with climate professionals
• Complete one online climate course
• Volunteer with a local environmental organization
• Research 5 climate companies you find interesting

**🌱 Getting Started Steps:**

**Academic Preparation:**
• Take environmental science, economics, or policy courses
• Join climate-related clubs and organizations
• Participate in sustainability projects on campus
• Consider climate-focused study abroad programs

**Skill Building:**
• Learn data analysis (Excel, Python basics)
• Develop communication skills (writing, presenting)
• Practice project management
• Build research and critical thinking abilities

**Experience Gaining:**
• Volunteer with environmental organizations
• Apply for climate-focused internships
• Start climate-related projects or initiatives
• Attend climate conferences and networking events

**🔥 Young Professional Success Tips:**

**Networking for Young Professionals:**
• Don't be intimidated - people love helping young talent
• Ask thoughtful questions about career paths
• Be genuine about your passion for climate issues
• Follow up and maintain professional relationships

**Building Your Brand:**
• Create a professional LinkedIn profile
• Share climate content that interests you
• Write about climate topics you're learning about
• Participate in climate discussions online

**Career Development:**
• Set clear goals for what you want to learn
• Seek feedback and be open to growth
• Take on challenging projects and responsibilities
• Find mentors who can guide your development

**📚 Resources for Young Climate Professionals:**

**Organizations to Join:**
• Young Professionals in Energy (YPIE)
• Climate Generation
• Youth Climate Action Network
• Students for Carbon Dividends

**Learning Platforms:**
• Climate Change and Health (Yale/Coursera)
• Renewable Energy Technology (TU Delft/edX)
• Climate Change Law and Policy (University of Edinburgh)
• Project Drawdown Climate Solutions

**Events and Conferences:**
• Youth Climate Summit
• Clean Energy Youth Corps
• Campus sustainability conferences
• Local young professional climate meetups

**💪 Overcoming Common Young Professional Challenges:**

**"I Don't Have Enough Experience":**
• Everyone starts somewhere - passion and willingness to learn matter most
• Volunteer work and internships count as valuable experience
• Focus on transferable skills from other activities
• Emphasize your fresh perspective and energy

**"Climate Work Seems Too Technical":**
• There are roles for every skill set and interest
• You can learn technical skills through courses and practice
• Many successful climate professionals started in other fields
• Communication and people skills are just as important

**"I Don't Know Where to Start":**
• Start with what interests you most about climate issues
• Try different activities to see what you enjoy
• Talk to professionals in various climate roles
• Remember that career paths are rarely linear

**🎪 Your Next Steps:**
1. **Identify** 2-3 climate career areas that sound interesting
2. **Research** professionals working in those areas
3. **Connect** with one climate professional for an informational interview
4. **Explore** one hands-on opportunity (volunteer, project, course)
5. **Plan** your next semester to include climate-focused activities

What specific aspect of climate work are you most curious about? I'm here to help you dive deeper and create a personalized exploration plan!"""

    async def _provide_general_youth_guidance(self, message: str, context: AgentContext) -> str:
        """Provide general youth/early career guidance"""
        return """🎓 **Welcome to Your Climate Career Journey!**

Hey there! I'm Jasmine, and I'm absolutely thrilled to help you explore climate careers! As a young adult (18+), you're entering the job market at the perfect time - the climate economy is booming and there are amazing opportunities for early career professionals.

**🌟 My Specializations:**
• **College Student Pathways**: Connecting your studies to climate career opportunities
• **Internship & Fellowship Guidance**: Finding the perfect programs to launch your career
• **Entry-Level Opportunities**: Identifying roles perfect for new graduates and career starters
• **Skills Development**: Building the competencies you need for climate success
• **Career Exploration**: Discovering what type of climate work excites you most

**⚡ Why This Is the Perfect Time for Climate Careers:**

**Massive Growth:**
• Clean energy is the fastest-growing job sector globally
• Massachusetts alone needs 38,100 new clean energy workers by 2030
• New roles and opportunities emerging constantly
• Early career professionals are in high demand

**Mission-Driven Work:**
• Make a real difference addressing climate change
• Work with passionate, committed colleagues
• See direct impact of your efforts
• Build a career you can be proud of

**🎯 How I Can Help You:**

**If You're a College Student:**
• Map your major to climate career opportunities
• Find internships and research opportunities
• Connect classroom learning to real-world impact
• Plan your remaining semesters strategically

**If You're a Recent Graduate:**
• Translate your skills to climate opportunities
• Navigate the entry-level job market
• Build professional networks from scratch
• Develop climate-specific competencies

**If You're Early Career (1-3 years experience):**
• Transition into climate work from other fields
• Advance within climate organizations
• Specialize in specific climate areas
• Take on leadership and growth opportunities

**🌱 Getting Started Checklist:**

**Explore & Learn:**
• Take online climate courses to build knowledge
• Follow climate professionals and organizations on social media
• Attend virtual climate events and webinars
• Read climate industry publications and news

**Build Skills:**
• Develop data analysis capabilities (Excel, basic Python)
• Practice professional communication and presentation
• Learn project management basics
• Build research and critical thinking skills

**Gain Experience:**
• Volunteer with environmental organizations
• Start climate-related projects or initiatives
• Apply for internships and fellowship programs
• Participate in climate competitions and challenges

**Connect & Network:**
• Join young professional climate organizations
• Attend climate networking events and meetups
• Conduct informational interviews with climate professionals
• Build relationships with peers interested in climate work

**🔥 Young Professional Advantages:**

**What You Bring to Climate Work:**
• Fresh perspectives and innovative thinking
• Digital native skills and social media savvy
• Passion and energy for making a difference
• Adaptability and willingness to learn quickly
• Understanding of youth culture and perspectives

**Why Employers Want You:**
• Diverse viewpoints strengthen climate solutions
• Entry-level positions have lower risk and high potential
• Young professionals often bring new ideas and approaches
• Training and development opportunities benefit both sides
• Youth voices are crucial for climate movement credibility

**📚 Essential Resources for Young Climate Professionals:**

**Organizations to Join:**
• Young Professionals in Energy (YPIE)
• Climate Generation: A Will Steger Legacy
• Students for Carbon Dividends
• Your local Young Professionals in [City] groups

**Learning Platforms:**
• Coursera: Climate change courses from top universities
• edX: Renewable energy and sustainability programs
• FutureLearn: Climate science and policy courses
• Khan Academy: Environmental economics and statistics

**📱 Apps and Tools:**
• LinkedIn: Professional networking and job searching
• Eventbrite: Finding climate events and conferences
• Meetup: Local environmental and climate groups
• Coursera/edX mobile apps: Learning on the go

**💡 Quick Wins to Get Started:**
1. **Complete** one online climate course this month
2. **Connect** with 5 climate professionals on LinkedIn
3. **Attend** one climate event or webinar
4. **Volunteer** for 4 hours with an environmental organization
5. **Read** one climate industry report or publication

**🎪 Common Questions from Young Professionals:**

**"Do I need a specific degree for climate work?"**
Not necessarily! Climate work needs diverse skills and backgrounds. Engineering, business, communications, policy, and many other fields all have climate applications.

**"How do I compete with more experienced candidates?"**
Emphasize your fresh perspective, eagerness to learn, digital skills, and passion for the mission. Many employers value potential over experience.

**"What if I'm not sure what type of climate work I want to do?"**
That's totally normal! Start by exploring different areas through volunteering, informational interviews, and online learning. Career paths evolve over time.

**🌟 Next Steps:**
• What's your current situation? (Student, recent grad, early career?)
• What aspects of climate change interest you most?
• What type of work environment excites you? (tech, policy, hands-on, research, etc.)
• How can I best support your climate career exploration?

I'm here to help you every step of the way! Climate careers are not just about fighting climate change - they're about building a better future, and young professionals like you are leading the way.

What would you like to explore first? 🌍"""

    async def _calculate_confidence(self, message: str, intent: str) -> float:
        """Calculate confidence score based on message analysis"""
        base_confidence = 0.8

        # Adjust based on intent specificity
        intent_adjustments = {
            "student_pathways": 0.05,
            "internship_guidance": 0.04,
            "entry_level_opportunities": 0.04,
            "skills_development": 0.03,
            "career_exploration": 0.02,
            "general_guidance": -0.05,
        }

        confidence = base_confidence + intent_adjustments.get(intent, 0)

        # Adjust based on youth-related terminology
        youth_terms = ["student", "college", "internship", "entry level", "young", "graduate"]
        if any(term in message.lower() for term in youth_terms):
            confidence += 0.03

        if len(message) > 100:
            confidence += 0.02

        return min(confidence, 1.0)

    async def _suggest_next_actions(self, intent: str, context: AgentContext) -> List[str]:
        """Suggest next actions based on intent and context"""
        base_actions = [
            "Join young professional climate organizations",
            "Complete online climate courses",
            "Attend climate networking events",
        ]

        intent_specific_actions = {
            "student_pathways": [
                "Research climate-focused courses and majors",
                "Join campus sustainability organizations",
                "Look for climate research opportunities with faculty",
            ],
            "internship_guidance": [
                "Research internship programs at climate organizations",
                "Update resume with climate-relevant experiences",
                "Practice interviewing for climate positions",
            ],
            "entry_level_opportunities": [
                "Apply to entry-level positions at climate companies",
                "Tailor resume for entry-level climate roles",
                "Build portfolio of climate-related projects",
            ],
            "skills_development": [
                "Identify skill gaps for target climate roles",
                "Enroll in relevant certification programs",
                "Start practicing with climate-related tools and software",
            ],
            "career_exploration": [
                "Conduct informational interviews with climate professionals",
                "Volunteer with different types of climate organizations",
                "Attend climate career fairs and workshops",
            ],
        }

        return intent_specific_actions.get(intent, base_actions)


__all__ = ["JasmineAgent"]
