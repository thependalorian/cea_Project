"""
Mai - Resume and Application Specialist Agent for Climate Economy Assistant
Handles resume optimization, application strategies, and interview preparation
"""

from typing import Dict, Any, Optional, List
from .base import BaseAgent, AgentState
from core.models import ChatMessage, ChatResponse
from langgraph.types import Command
from datetime import datetime
from langchain_core.messages import AIMessage, HumanMessage

# Mai's agent-specific prompt configuration
MAI_RESUME_SPECIALIST_PROMPT = """
You are Mai, a Resume and Application Specialist helping users create compelling resumes, cover letters, and application materials for climate and green economy careers.

**AGENT IDENTITY:**
- **Name:** Mai
- **Role:** Resume Specialist & Application Strategist
- **Background:** Former HR director and certified resume writer with 12+ years experience in recruitment and career coaching
- **Mission:** Help users create standout application materials that land interviews in the climate economy
- **Personality:** Detail-oriented, strategic, encouraging, and results-focused

**MAI'S STORY & EXPERTISE:**
"Hi! I'm Mai, and I've spent over a decade on both sides of the hiring process - as an HR director reviewing thousands of resumes and as a career coach helping people craft compelling applications. I know exactly what employers in the climate sector are looking for, and I'll help you showcase your unique value in a way that gets you noticed and hired."

**CORE EXPERTISE:**
- Resume writing and optimization for climate careers
- Cover letter strategy and personalization
- LinkedIn profile optimization
- Interview preparation and practice
- Application tracking system (ATS) optimization
- Skills translation across industries
- Portfolio development for climate professionals

**SPECIALIZED KNOWLEDGE:**
- Climate industry hiring trends and preferences
- ATS systems used by major climate employers
- Keywords and terminology for green economy roles
- Skills translation from traditional to climate careers
- Interview formats common in sustainability sector
- Portfolio requirements for different climate roles
- Salary negotiation strategies for green jobs

**MAI'S APPROACH:**
- **Strategic:** "Let's create a targeted strategy for your specific goals"
- **Detail-Oriented:** "Every word on your resume should serve a purpose"
- **Results-Focused:** "Our goal is to get you interviews and job offers"
- **Encouraging:** "You have more relevant experience than you realize"
- **Practical:** "Here's exactly what you need to do to improve your applications"

**RESPONSE FRAMEWORK:**
1. **Application Assessment:** Evaluate current resume and application materials
2. **Strategic Optimization:** Provide specific improvements and recommendations
3. **Skills Translation:** Help translate experience to climate career relevance
4. **ATS Optimization:** Ensure materials pass applicant tracking systems
5. **Interview Preparation:** Prepare for climate sector interview processes

**CLIMATE SECTOR RESUME PRIORITIES:**
- Quantified achievements and impact metrics
- Sustainability and environmental keywords
- Project management and collaboration skills
- Data analysis and problem-solving abilities
- Community engagement and stakeholder management
- Technical skills relevant to clean energy/climate
- Leadership and initiative-taking examples

**MAI'S COMMUNICATION STYLE:**
- Professional and strategic: "Let's optimize your resume for maximum impact"
- Specific and actionable: "Change this bullet point to highlight your quantified results"
- Encouraging and supportive: "Your background is stronger than you think"
- Results-oriented: "This change will significantly improve your interview chances"
- Detail-focused: "Small tweaks can make a huge difference in how you're perceived"

**MANDATORY APPLICATION STANDARDS:**
- Always provide specific, actionable resume feedback
- Include ATS optimization recommendations
- Offer climate-specific keyword suggestions
- Provide interview preparation guidance
- Connect skills to climate career relevance
- Include follow-up and networking strategies

Remember: You're Mai - an expert resume strategist who knows exactly what climate employers want to see. Your advice is specific, actionable, and designed to get results. You help people present their best professional selves.
"""


class ResumeAgent(BaseAgent):
    """
    Mai - Resume and Application Specialist focused on:
    - Resume writing and optimization
    - Cover letter strategy and personalization
    - LinkedIn profile optimization
    - Interview preparation and practice
    - ATS optimization and keyword strategy
    """

    def __init__(
        self,
        agent_id: str = "mai_resume_specialist",
        name: str = "Mai",
        system_prompt: Optional[str] = None,
    ):
        """Initialize Mai - the Resume and Application Specialist"""

        # Initialize BaseAgent with agent_type
        super().__init__(agent_type="resume_specialist")

        # Agent Configuration
        self.agent_id = agent_id
        self.agent_name = "Mai"
        self.name = name
        self.prompt = system_prompt or MAI_RESUME_SPECIALIST_PROMPT

        # Mai's resume-specific configuration
        self.application_areas = [
            "resume_optimization",
            "cover_letter_writing",
            "linkedin_optimization",
            "interview_preparation",
            "ats_optimization",
            "skills_translation",
            "portfolio_development",
            "salary_negotiation",
        ]

        # Climate sector keywords for ATS optimization
        self.climate_keywords = {
            "renewable_energy": [
                "solar", "wind", "renewable energy", "clean energy", "energy storage",
                "grid modernization", "energy efficiency", "sustainability"
            ],
            "environmental": [
                "environmental compliance", "sustainability", "carbon footprint",
                "environmental impact", "green building", "LEED", "environmental justice"
            ],
            "project_management": [
                "project management", "stakeholder engagement", "cross-functional teams",
                "budget management", "timeline management", "risk assessment"
            ],
            "data_analysis": [
                "data analysis", "environmental monitoring", "reporting", "metrics",
                "performance tracking", "impact measurement", "analytics"
            ],
            "policy_advocacy": [
                "policy development", "regulatory compliance", "advocacy", "community engagement",
                "public policy", "government relations", "stakeholder outreach"
            ]
        }

        # Interview preparation by role type
        self.interview_prep = {
            "technical_roles": [
                "Prepare for technical assessments and case studies",
                "Review industry-specific software and tools",
                "Practice explaining complex concepts simply",
                "Prepare examples of problem-solving and innovation"
            ],
            "policy_roles": [
                "Research current climate policy landscape",
                "Prepare examples of stakeholder engagement",
                "Practice discussing complex policy issues",
                "Review regulatory frameworks and compliance"
            ],
            "business_roles": [
                "Prepare financial and business case examples",
                "Practice discussing ROI and impact metrics",
                "Review market trends and competitive landscape",
                "Prepare examples of strategic thinking and execution"
            ]
        }

        # System message for enhanced application intelligence
        self.system_message = f"""
        {self.prompt}
        
        **MAI'S RESUME SPECIALIST CAPABILITIES:**
        - Advanced resume optimization and ATS strategies
        - Climate sector keyword integration and skills translation
        - Interview preparation and practice for green economy roles
        - LinkedIn profile optimization for climate professionals
        - Cover letter personalization and strategic messaging
        - Portfolio development guidance for sustainability careers
        """

    async def process(self, state: AgentState) -> Command:
        """Process application-related messages with Mai's strategic guidance"""

        # Extract the latest message
        latest_message = self.extract_latest_message(state)
        if not latest_message:
            return Command(goto="END")

        # Add Mai's application-specific context
        mai_context = {
            "agent_name": "Mai",
            "specialization": "Resume and Application Specialist",
            "application_areas": self.application_areas,
            "climate_keywords": self.climate_keywords,
            "interview_prep": self.interview_prep,
            "ats_optimization": True,
        }

        # Generate Mai's strategic response
        response_content = await self._generate_mai_response(
            latest_message, mai_context
        )

        # Create response message
        response_message = AIMessage(content=response_content)

        # Update state with Mai's response
        updated_state = state.copy()
        updated_state["messages"].append(response_message)
        updated_state["last_speaker"] = "mai"
        updated_state["specialist_context"] = mai_context

        return Command(goto="END", update=updated_state)

    async def _generate_mai_response(
        self, message: str, context: Dict[str, Any]
    ) -> str:
        """Generate Mai's strategic application guidance"""

        # Analyze the message for application needs
        application_assessment = self._assess_application_needs(message)
        strategic_guidance = self._provide_strategic_guidance(message)
        optimization_tips = self._provide_optimization_tips(message)
        action_plan = self._create_application_action_plan(message)

        response = f"""📄 **Hi! I'm Mai, your Resume and Application Specialist!**

{application_assessment}

{strategic_guidance}

{optimization_tips}

{action_plan}

💼 **Remember:** Your resume is your marketing document - every word should showcase your value to climate employers. I'm here to help you create application materials that get results!

What specific aspect of your application materials would you like to work on together?"""

        return response

    def _assess_application_needs(self, message: str) -> str:
        """Assess the user's application needs and provide targeted guidance"""
        
        message_lower = message.lower()
        
        if any(term in message_lower for term in ["resume", "cv"]):
            return """📋 **Resume Assessment:**
I can help you create a compelling resume that highlights your climate-relevant experience and gets past ATS systems. Let's focus on quantified achievements, relevant keywords, and strategic positioning."""
        
        elif any(term in message_lower for term in ["cover letter"]):
            return """✉️ **Cover Letter Strategy:**
Cover letters are crucial for climate careers - they let you tell your story and connect your passion to the role. I'll help you create personalized, compelling letters that complement your resume."""
        
        elif any(term in message_lower for term in ["interview", "interviewing"]):
            return """🎯 **Interview Preparation:**
Climate sector interviews often include behavioral questions, case studies, and passion assessments. I'll help you prepare compelling stories and practice responses that showcase your fit."""
        
        elif any(term in message_lower for term in ["linkedin", "profile"]):
            return """💼 **LinkedIn Optimization:**
Your LinkedIn profile is often the first impression climate employers have of you. Let's optimize it with the right keywords, compelling summary, and strategic positioning."""
        
        else:
            return """📊 **Application Strategy Assessment:**
I can help you develop a comprehensive application strategy that includes resume optimization, cover letter personalization, LinkedIn enhancement, and interview preparation."""

    def _provide_strategic_guidance(self, message: str) -> str:
        """Provide strategic guidance based on user's application focus"""
        
        message_lower = message.lower()
        
        if "resume" in message_lower:
            return """🎯 **Strategic Resume Guidance:**

**Climate Resume Priorities:**
• Lead with quantified achievements (numbers, percentages, dollar amounts)
• Include sustainability and environmental keywords naturally
• Highlight project management and collaboration skills
• Show problem-solving and analytical abilities
• Demonstrate community engagement and stakeholder management

**ATS Optimization:**
• Use standard section headers (Experience, Education, Skills)
• Include relevant keywords from job descriptions
• Use simple formatting without graphics or tables
• Save as both .docx and .pdf versions"""

        elif "cover letter" in message_lower:
            return """✍️ **Cover Letter Strategy:**

**Winning Cover Letter Formula:**
• Opening: Connect your passion to their mission
• Body: Tell your story with specific examples
• Skills: Highlight 2-3 most relevant qualifications
• Closing: Show enthusiasm and request next steps

**Climate-Specific Tips:**
• Research the company's sustainability initiatives
• Mention specific projects or values that resonate
• Connect your experience to their environmental goals
• Show genuine passion for climate solutions"""

        elif "interview" in message_lower:
            return """🗣️ **Interview Strategy:**

**Common Climate Interview Questions:**
• "Why are you passionate about climate/sustainability?"
• "Tell me about a time you solved a complex problem"
• "How do you handle working with diverse stakeholders?"
• "Describe a project where you had to influence without authority"

**Preparation Framework:**
• Research the company's climate initiatives thoroughly
• Prepare 5-7 STAR method examples
• Practice explaining technical concepts simply
• Prepare thoughtful questions about their work"""

        else:
            return """📈 **Comprehensive Application Strategy:**

**The Mai Method:**
1. **Research:** Understand the role and company deeply
2. **Customize:** Tailor every application to the specific opportunity
3. **Quantify:** Use numbers and metrics wherever possible
4. **Connect:** Link your experience to their climate mission
5. **Follow-up:** Professional networking and thank-you notes"""

    def _provide_optimization_tips(self, message: str) -> str:
        """Provide specific optimization tips"""
        
        return """⚡ **Quick Optimization Wins:**

**Resume Power-Ups:**
• Replace "responsible for" with action verbs (led, developed, implemented)
• Add metrics to every bullet point possible
• Include relevant climate keywords naturally
• Use consistent formatting and professional fonts

**ATS-Friendly Formatting:**
• Use standard fonts (Arial, Calibri, Times New Roman)
• Include keywords from job descriptions
• Use simple bullet points, not symbols
• Keep formatting clean and scannable

**LinkedIn Enhancements:**
• Write a compelling headline with climate keywords
• Use your summary to tell your climate career story
• Get recommendations from colleagues and supervisors
• Share climate-related content and insights regularly"""

    def _create_application_action_plan(self, message: str) -> str:
        """Create a personalized application action plan"""
        
        return """📅 **Your Application Action Plan:**

**Week 1: Foundation**
• Audit current resume and identify improvement areas
• Research 5-10 target climate companies and roles
• Update LinkedIn profile with climate-focused positioning
• Gather quantified examples of your achievements

**Week 2: Optimization**
• Rewrite resume with climate keywords and metrics
• Create master cover letter template
• Practice elevator pitch and interview stories
• Connect with climate professionals on LinkedIn

**Week 3: Application**
• Apply to 3-5 targeted positions with customized materials
• Follow up on applications with thoughtful networking
• Schedule informational interviews with climate professionals
• Continue refining materials based on feedback

**Ongoing: Consistency**
• Apply to 2-3 new positions weekly
• Network actively in climate communities
• Keep learning about the climate sector
• Track applications and follow up professionally"""

    async def handle_message(
        self,
        message: str,
        user_id: str,
        conversation_id: str,
        context: Dict[str, Any] = None,
    ) -> Dict[str, Any]:
        """Handle incoming message and return Mai's strategic response"""
        
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
                response_content = "I'm here to help you create outstanding application materials for climate careers!"
            
            return {
                "content": response_content,
                "specialist": "Mai",
                "agent_type": "resume_specialist",
                "confidence": 0.9,
                "next_actions": ["resume_optimization", "application_strategy", "interview_prep"],
            }
            
        except Exception as e:
            return {
                "content": f"I apologize, but I'm experiencing a technical issue. As your resume specialist, I want to ensure you get the best application guidance. Please try again or let me know if you need immediate help with your resume or applications.",
                "specialist": "Mai",
                "agent_type": "resume_specialist",
                "error": str(e),
            } 