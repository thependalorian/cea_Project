"""
Mai - Resume & Career Transition Specialist Agent

Following rule #2: Create modular agent components for easy maintenance
Following rule #3: Component documentation explaining purpose and functionality
Following rule #12: Complete code verification with proper agent implementation

Mai specializes in strategic resume optimization, ATS systems, career transition planning,
and skills translation for climate economy careers.

Location: backendv1/agents/mai/agent.py
"""

from typing import Dict, Any, List
from datetime import datetime

from backendv1.agents.base.agent_base import AgentBase, AgentContext, AgentResponse
from backendv1.agents.base.memory_system import MemorySystem
from backendv1.agents.base.reflection_engine import ReflectionEngine
from backendv1.utils.logger import setup_logger
from .prompts import (
    MAI_SYSTEM_PROMPT,
    RESUME_OPTIMIZATION_PROMPT,
    CAREER_TRANSITION_PROMPT,
    SKILLS_ANALYSIS_PROMPT,
    INTERVIEW_PREPARATION_PROMPT,
    MAI_CONFIG,
)

logger = setup_logger("mai_agent")


class MaiAgent(AgentBase):
    """
    Mai - Resume & Career Transition Specialist

    Specialized in:
    - Strategic resume optimization and ATS compatibility
    - Career transition planning and skills translation
    - Interview preparation and professional branding
    - LinkedIn optimization and networking strategies
    - Skills gap analysis and development planning
    """

    def __init__(self, agent_name: str, agent_type: str, **kwargs):
        """Initialize Mai with memory and reflection capabilities"""
        super().__init__(agent_name, agent_type, **kwargs)
        self.memory_system = MemorySystem(agent_name)
        self.reflection_engine = ReflectionEngine(agent_name)

    def _load_prompts(self):
        """Load Mai-specific prompts and templates"""
        self.system_prompt = MAI_SYSTEM_PROMPT

        self.specialized_prompts = {
            "resume_review": RESUME_OPTIMIZATION_PROMPT,
            "career_transition": CAREER_TRANSITION_PROMPT,
            "skills_analysis": SKILLS_ANALYSIS_PROMPT,
            "interview_prep": INTERVIEW_PREPARATION_PROMPT,
        }

    def _load_tools(self):
        """Load and configure Mai-specific tools"""
        self.available_tools = [
            "resume_ats_analyzer",
            "skills_gap_assessment",
            "career_transition_planner",
            "linkedin_optimizer",
            "interview_prep_generator",
            "salary_negotiation_advisor",
            "networking_strategy_builder",
            "professional_brand_analyzer",
        ]

    def _setup_capabilities(self):
        """Set up Mai-specific capabilities and configurations"""
        self.specialization_areas = [
            "resume_optimization",
            "ats_compatibility",
            "career_transitions",
            "skills_translation",
            "interview_preparation",
            "professional_branding",
            "networking_strategies",
            "salary_negotiation",
        ]

        self.expertise_level = "expert"
        self.confidence_threshold = 0.85

    async def process_message(self, message: str, context: AgentContext) -> AgentResponse:
        """
        Process user message and provide resume/career transition guidance

        Following rule #6: Asynchronous data handling for performance
        Following rule #15: Include comprehensive error handling

        Args:
            message: User's message
            context: Conversation context

        Returns:
            AgentResponse: Mai's specialized response
        """
        try:
            logger.info(f"📄 Mai processing resume/career message for user {context.user_id}")

            # Store interaction in memory
            await self.memory_system.store_episode(
                {
                    "type": "user_interaction",
                    "message": message,
                    "user_id": context.user_id,
                    "context": "resume_career_guidance",
                }
            )

            # Analyze message for resume/career intent
            intent = await self._analyze_career_intent(message)

            # Generate specialized response based on intent
            if intent == "resume_review":
                response_content = await self._provide_resume_review(message, context)
            elif intent == "career_transition":
                response_content = await self._provide_transition_guidance(message, context)
            elif intent == "skills_analysis":
                response_content = await self._provide_skills_analysis(message, context)
            elif intent == "interview_prep":
                response_content = await self._provide_interview_prep(message, context)
            elif intent == "linkedin_optimization":
                response_content = await self._provide_linkedin_guidance(message, context)
            else:
                response_content = await self._provide_general_career_guidance(message, context)

            # Calculate confidence score
            confidence = await self._calculate_confidence(message, intent)

            # Identify next actions
            next_actions = await self._suggest_next_actions(intent, context)

            # Create response
            response = AgentResponse(
                content=response_content,
                specialist_type="resume_specialist",
                confidence_score=confidence,
                tools_used=["resume_analyzer", "career_transition_planner", "ats_optimizer"],
                next_actions=next_actions,
                sources=[
                    "Resume Best Practices",
                    "ATS Optimization Guide",
                    "Career Transition Framework",
                ],
                metadata={
                    "intent": intent,
                    "specialization": "resume_career_optimization",
                    "expertise_areas": self.specialization_areas,
                },
            )

            # Reflect on interaction
            await self.reflection_engine.reflect_on_interaction(
                {
                    "id": f"mai_{datetime.utcnow().timestamp()}",
                    "user_message": message,
                    "response": response_content,
                    "intent": intent,
                    "confidence": confidence,
                }
            )

            return response

        except Exception as e:
            logger.error(f"Error in Mai's message processing: {e}")
            return AgentResponse(
                content="I apologize, but I'm experiencing a technical issue with my resume analysis tools. Let me connect you with additional support to ensure you get the career guidance you need.",
                specialist_type="resume_specialist",
                success=False,
                error_message=str(e),
            )

    async def _analyze_career_intent(self, message: str) -> str:
        """Analyze user message to determine career guidance intent"""
        message_lower = message.lower()

        if any(term in message_lower for term in ["resume", "cv", "application", "ats"]):
            return "resume_review"
        elif any(
            term in message_lower for term in ["transition", "change career", "pivot", "switch"]
        ):
            return "career_transition"
        elif any(
            term in message_lower
            for term in ["skills", "experience", "background", "qualifications"]
        ):
            return "skills_analysis"
        elif any(
            term in message_lower for term in ["interview", "questions", "preparation", "practice"]
        ):
            return "interview_prep"
        elif any(
            term in message_lower for term in ["linkedin", "profile", "networking", "connections"]
        ):
            return "linkedin_optimization"
        else:
            return "general_guidance"

    async def _provide_resume_review(self, message: str, context: AgentContext) -> str:
        """Provide comprehensive resume review and optimization guidance"""
        return """📄 **Strategic Resume Optimization**

I'll help you create an ATS-friendly, impact-driven resume that showcases your climate potential!

**🎯 ATS Optimization Checklist:**
• **Format**: Use standard headings (Experience, Education, Skills)
• **Keywords**: Include climate-relevant terms from job descriptions
• **File Type**: Save as .docx and .pdf versions
• **Length**: 1-2 pages max, prioritize recent/relevant experience
• **Contact Info**: Professional email, LinkedIn URL, location (city, state)

**💪 Impact-Driven Content Framework:**
```
[Action Verb] + [What You Did] + [Quantifiable Result]
Example: "Reduced energy consumption by 25% through implementation of efficiency protocols"
```

**🌍 Climate Skills Translation:**
• **Project Management** → "Sustainability Project Coordination"
• **Data Analysis** → "Environmental Impact Assessment"
• **Communication** → "Climate Advocacy & Stakeholder Engagement"
• **Problem Solving** → "Environmental Challenge Resolution"

**📋 Next Steps:**
1. **Upload your current resume** for detailed ATS analysis
2. **Identify 3 target climate roles** to optimize keywords
3. **Quantify your achievements** using the impact framework
4. **Create a master resume** with all experiences, then tailor for each application

Would you like me to review your current resume or help you identify specific climate roles to target?"""

    async def _provide_transition_guidance(self, message: str, context: AgentContext) -> str:
        """Provide strategic career transition planning"""
        return """🔄 **Strategic Career Transition Planning**

Transitioning into climate work requires strategic planning. Here's your roadmap:

**📊 Phase 1: Assessment & Planning (Weeks 1-2)**
• **Skills Inventory**: List all technical and soft skills
• **Values Alignment**: Identify what climate impact matters most to you
• **Market Research**: Explore 5-7 climate roles that match your background
• **Gap Analysis**: Identify skills/experience needed for target roles

**🎯 Phase 2: Skill Building & Positioning (Weeks 3-8)**
• **Targeted Learning**: Take climate-relevant courses (Coursera, edX)
• **Volunteer/Project Work**: Gain climate experience through nonprofits
• **Network Building**: Connect with climate professionals on LinkedIn
• **Content Creation**: Share climate insights to build thought leadership

**🚀 Phase 3: Active Transition (Weeks 9-16)**
• **Resume Optimization**: Tailor for each climate role
• **Application Strategy**: Apply to 5-10 positions weekly
• **Interview Preparation**: Develop climate-focused narratives
• **Offer Evaluation**: Assess opportunities for growth and impact

**💡 Quick Wins for Immediate Credibility:**
• Subscribe to climate newsletters (ClimateJobs, GreenBiz)
• Join climate professional groups (LinkedIn, local meetups)
• Complete a climate certification (Climate Change Mitigation, Sustainability)
• Start a climate-focused side project or blog

**🎪 Transition Timeline Options:**
• **Gradual**: 6-12 months while maintaining current role
• **Accelerated**: 3-6 months with intensive focus
• **Bridge Role**: Take climate-adjacent position first

What's your current industry and timeline preference? I can create a personalized transition plan."""

    async def _provide_skills_analysis(self, message: str, context: AgentContext) -> str:
        """Provide skills gap analysis and development planning"""
        return """🎯 **Skills Translation & Development Strategy**

Let's identify your transferable skills and map them to climate opportunities:

**🔄 Universal Skills → Climate Applications:**

**Technical Skills:**
• **Data Analysis** → Climate risk modeling, carbon accounting, impact measurement
• **Project Management** → Sustainability initiatives, renewable energy projects
• **Financial Analysis** → ESG investing, green finance, carbon markets
• **Engineering** → Clean technology, energy efficiency, environmental systems
• **Marketing** → Climate communications, sustainable brand development

**Soft Skills:**
• **Leadership** → Climate team management, sustainability program leadership
• **Communication** → Climate advocacy, stakeholder engagement, policy briefings
• **Problem-Solving** → Environmental challenge resolution, innovation development
• **Collaboration** → Cross-sector climate partnerships, community engagement

**🎓 High-Impact Skill Development:**
```
Priority 1 (Immediate): Climate literacy, sustainability frameworks
Priority 2 (3-6 months): Sector-specific knowledge, relevant certifications
Priority 3 (6-12 months): Advanced specialization, thought leadership
```

**📚 Recommended Learning Path:**
• **Foundation**: Climate Change Mitigation (University of Edinburgh - Coursera)
• **Business**: Sustainable Business Strategy (University of Virginia - Coursera)
• **Technical**: Environmental Management & Ethics (University of Queensland - edX)
• **Leadership**: Sustainability Leadership (Cambridge Institute for Sustainability Leadership)

**🏆 Skill Validation Strategies:**
• Complete relevant certifications
• Lead a sustainability project at current job
• Volunteer with environmental organizations
• Write articles demonstrating climate knowledge

What's your current role and strongest skills? I'll create a personalized skills development roadmap."""

    async def _provide_interview_prep(self, message: str, context: AgentContext) -> str:
        """Provide interview preparation guidance"""
        return """🎤 **Climate Career Interview Mastery**

Here's how to ace your climate career interviews with compelling narratives:

**🌟 The STAR-C Method for Climate Interviews:**
• **Situation**: Set the context
• **Task**: Describe your responsibility  
• **Action**: Explain what you did
• **Result**: Share the quantifiable outcome
• **Climate Connection**: Link to environmental impact

**💬 Essential Climate Interview Questions & Frameworks:**

**"Why do you want to work in climate?"**
```
Framework: Personal motivation + Professional alignment + Impact vision
Example: "My concern about climate change grew from [personal experience]. 
My [relevant skills] can contribute to [specific climate solutions]. 
I want to help [organization] achieve [specific climate goals]."
```

**"How do your skills transfer to climate work?"**
```
Framework: Skill + Application + Evidence + Future potential
Example: "My project management experience in [industry] directly applies 
to coordinating sustainability initiatives. I successfully [specific example]. 
In climate work, I could apply this to [specific climate application]."
```

**"What's your understanding of our climate challenges?"**
```
Framework: Global context + Sector-specific + Solution-oriented
Research: Company's climate goals, industry challenges, recent initiatives
```

**🎯 Interview Preparation Checklist:**
• **Research**: Company climate strategy, recent news, key personnel
• **Stories**: Prepare 5-7 STAR-C examples showcasing relevant skills
• **Questions**: Prepare thoughtful questions about climate impact and growth
• **Practice**: Mock interviews focusing on climate narratives

**🔥 Power Phrases for Climate Interviews:**
• "I'm passionate about creating measurable environmental impact..."
• "My experience in [field] taught me how to [transferable skill]..."
• "I see climate work as the intersection of [your expertise] and [environmental need]..."

Would you like me to help you craft specific STAR-C stories for your background?"""

    async def _provide_linkedin_guidance(self, message: str, context: AgentContext) -> str:
        """Provide LinkedIn optimization guidance"""
        return """💼 **LinkedIn Climate Career Optimization**

Transform your LinkedIn into a climate career magnet:

**🎯 Profile Optimization Strategy:**

**Headline Formula:**
```
[Your Role/Expertise] | [Climate Focus] | [Value Proposition]
Example: "Project Manager | Sustainability & Clean Energy | Driving Environmental Impact Through Strategic Initiatives"
```

**Summary Structure:**
• **Hook**: Start with your climate passion/mission
• **Experience**: Highlight transferable skills with climate applications
• **Value**: Specific ways you can contribute to climate solutions
• **Call-to-Action**: Invite connections and conversations

**🌍 Climate-Focused Content Strategy:**
• **Share**: Climate news with your professional insights
• **Comment**: Thoughtfully on climate leaders' posts
• **Post**: Weekly climate-related content (articles, observations, questions)
• **Engage**: Join climate professional groups and discussions

**🔗 Strategic Networking Approach:**
```
Connection Request Template:
"Hi [Name], I'm transitioning into climate work and admire your work at [Company] 
on [specific project]. I'd love to connect and learn from your experience in [area]."
```

**📈 Profile Enhancement Checklist:**
• **Keywords**: Include climate terms throughout profile
• **Experience**: Reframe past roles with climate/sustainability angle
• **Skills**: Add climate-relevant skills and get endorsements
• **Recommendations**: Request recommendations highlighting transferable skills
• **Activity**: Post/engage 3-5 times per week on climate topics

**🎪 LinkedIn Groups to Join:**
• Climate Professionals Network
• Sustainable Business Network
• Clean Energy Professionals
• Environmental Careers Network
• [Industry]-specific climate groups

**📊 Success Metrics:**
• Profile views increase 50%+ within 30 days
• 10+ new climate professional connections weekly
• Regular engagement on climate content
• Inbound messages from climate recruiters

Want me to review your current LinkedIn profile and suggest specific improvements?"""

    async def _provide_general_career_guidance(self, message: str, context: AgentContext) -> str:
        """Provide general career guidance and next steps"""
        return """🚀 **Comprehensive Career Development Strategy**

I'm here to help you navigate every aspect of your climate career journey!

**🎯 My Specializations:**
• **Resume Optimization**: ATS-friendly, impact-driven resumes
• **Career Transitions**: Strategic planning for climate career pivots
• **Skills Development**: Gap analysis and targeted learning plans
• **Interview Mastery**: Compelling narratives and preparation strategies
• **Professional Branding**: LinkedIn optimization and networking

**📋 Career Development Framework:**
```
1. ASSESS: Current skills, values, and career goals
2. EXPLORE: Climate opportunities and requirements
3. PLAN: Strategic transition timeline and milestones
4. BUILD: Skills, network, and professional brand
5. EXECUTE: Applications, interviews, and negotiations
6. SUCCEED: Onboarding and continued growth
```

**💡 Quick Assessment Questions:**
• What's your current role and industry?
• What climate impact do you want to make?
• What's your timeline for transition?
• What's your biggest career challenge right now?

**🎪 Immediate Next Steps:**
1. **Career Assessment**: Complete a skills and values inventory
2. **Market Research**: Identify 5 target climate roles
3. **Resume Audit**: Review current resume for climate optimization
4. **Network Building**: Connect with 3 climate professionals this week

**🔥 Success Stories:**
I've helped professionals transition from finance to ESG investing, from marketing to climate communications, and from engineering to renewable energy. Your background has value in the climate economy!

What specific area would you like to focus on first? I can provide detailed guidance tailored to your situation."""

    async def _calculate_confidence(self, message: str, intent: str) -> float:
        """Calculate confidence score based on message analysis"""
        base_confidence = 0.85

        # Adjust based on intent specificity
        intent_adjustments = {
            "resume_review": 0.05,
            "career_transition": 0.03,
            "skills_analysis": 0.02,
            "interview_prep": 0.04,
            "linkedin_optimization": 0.03,
            "general_guidance": -0.05,
        }

        confidence = base_confidence + intent_adjustments.get(intent, 0)

        # Adjust based on message length and specificity
        if len(message) > 100:
            confidence += 0.02
        if any(term in message.lower() for term in ["resume", "interview", "linkedin", "career"]):
            confidence += 0.03

        return min(confidence, 1.0)

    async def _suggest_next_actions(self, intent: str, context: AgentContext) -> List[str]:
        """Suggest next actions based on intent and context"""
        base_actions = [
            "Schedule a resume review session",
            "Complete skills assessment",
            "Research target climate roles",
        ]

        intent_specific_actions = {
            "resume_review": [
                "Upload current resume for ATS analysis",
                "Identify 3 target job descriptions for keyword optimization",
                "Quantify achievements using impact framework",
            ],
            "career_transition": [
                "Create transition timeline and milestones",
                "Identify skill development priorities",
                "Build climate professional network",
            ],
            "skills_analysis": [
                "Complete comprehensive skills inventory",
                "Research climate role requirements",
                "Create targeted learning plan",
            ],
            "interview_prep": [
                "Develop STAR-C interview stories",
                "Practice climate-focused narratives",
                "Research target companies' climate initiatives",
            ],
            "linkedin_optimization": [
                "Optimize LinkedIn headline and summary",
                "Join climate professional groups",
                "Start sharing climate-focused content",
            ],
        }

        return intent_specific_actions.get(intent, base_actions)


__all__ = ["MaiAgent"]
