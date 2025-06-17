"""
Liv - International Support Specialist Agent

Following rule #2: Create modular agent components for easy maintenance
Following rule #3: Component documentation explaining purpose and functionality
Following rule #12: Complete code verification with proper agent implementation

Liv specializes in supporting international professionals with credential recognition,
visa guidance, cultural integration, and navigating climate career opportunities.

Location: backendv1/agents/liv/agent.py
"""

from typing import Dict, Any, List
from datetime import datetime

from backendv1.agents.base.agent_base import AgentBase, AgentContext, AgentResponse
from backendv1.agents.base.memory_system import MemorySystem
from backendv1.agents.base.reflection_engine import ReflectionEngine
from backendv1.utils.logger import setup_logger
from .prompts import (
    LIV_SYSTEM_PROMPT,
    CREDENTIAL_EVALUATION_PROMPT,
    VISA_SUPPORT_PROMPT,
    CULTURAL_INTEGRATION_PROMPT,
    LIV_CONFIG,
)

logger = setup_logger("liv_agent")


class LivAgent(AgentBase):
    """
    Liv - International Support Specialist

    Specialized in:
    - Credential recognition and evaluation
    - Visa and immigration guidance for climate careers
    - Cultural integration and professional adaptation
    - International networking and mentorship
    - Cross-cultural communication and workplace navigation
    """

    def __init__(self, agent_name: str, agent_type: str, **kwargs):
        """Initialize Liv with memory and reflection capabilities"""
        super().__init__(agent_name, agent_type, **kwargs)
        self.memory_system = MemorySystem(agent_name)
        self.reflection_engine = ReflectionEngine(agent_name)

    def _load_prompts(self):
        """Load Liv-specific prompts and templates"""
        self.system_prompt = LIV_SYSTEM_PROMPT

        self.specialized_prompts = {
            "credential_recognition": CREDENTIAL_EVALUATION_PROMPT,
            "visa_guidance": VISA_SUPPORT_PROMPT,
            "cultural_integration": CULTURAL_INTEGRATION_PROMPT,
            "international_networking": "Let's build your professional network in the climate sector...",
        }

    def _load_tools(self):
        """Load and configure Liv-specific tools"""
        self.available_tools = [
            "credential_evaluator",
            "visa_pathway_analyzer",
            "cultural_integration_guide",
            "international_network_builder",
            "professional_licensing_navigator",
            "language_skills_assessor",
            "global_climate_job_finder",
            "cross_cultural_communication_coach",
        ]

    def _setup_capabilities(self):
        """Set up Liv-specific capabilities and configurations"""
        self.specialization_areas = [
            "credential_recognition",
            "visa_immigration_guidance",
            "cultural_integration",
            "international_networking",
            "professional_licensing",
            "language_support",
            "global_career_navigation",
            "cross_cultural_communication",
        ]

        self.expertise_level = "expert"
        self.confidence_threshold = 0.8

    async def process_message(self, message: str, context: AgentContext) -> AgentResponse:
        """
        Process user message and provide international support guidance

        Following rule #6: Asynchronous data handling for performance
        Following rule #15: Include comprehensive error handling

        Args:
            message: User's message
            context: Conversation context

        Returns:
            AgentResponse: Liv's specialized response
        """
        try:
            logger.info(
                f"🌍 Liv processing international support message for user {context.user_id}"
            )

            # Store interaction in memory
            await self.memory_system.store_episode(
                {
                    "type": "international_support_interaction",
                    "message": message,
                    "user_id": context.user_id,
                    "context": "international_professional_guidance",
                }
            )

            # Analyze message for international support intent
            intent = await self._analyze_international_intent(message)

            # Generate specialized response based on intent
            if intent == "credential_recognition":
                response_content = await self._provide_credential_guidance(message, context)
            elif intent == "visa_guidance":
                response_content = await self._provide_visa_guidance(message, context)
            elif intent == "cultural_integration":
                response_content = await self._provide_cultural_integration_guidance(
                    message, context
                )
            elif intent == "international_networking":
                response_content = await self._provide_networking_guidance(message, context)
            elif intent == "language_support":
                response_content = await self._provide_language_support(message, context)
            else:
                response_content = await self._provide_general_international_guidance(
                    message, context
                )

            # Calculate confidence score
            confidence = await self._calculate_confidence(message, intent)

            # Identify next actions
            next_actions = await self._suggest_next_actions(intent, context)

            # Create response
            response = AgentResponse(
                content=response_content,
                specialist_type="international_specialist",
                confidence_score=confidence,
                tools_used=[
                    "credential_evaluator",
                    "visa_pathway_analyzer",
                    "cultural_integration_guide",
                ],
                next_actions=next_actions,
                sources=[
                    "International Credential Services",
                    "Immigration Resources",
                    "Global Climate Networks",
                ],
                metadata={
                    "intent": intent,
                    "specialization": "international_professional_support",
                    "expertise_areas": self.specialization_areas,
                },
            )

            # Reflect on interaction
            await self.reflection_engine.reflect_on_interaction(
                {
                    "id": f"liv_{datetime.utcnow().timestamp()}",
                    "user_message": message,
                    "response": response_content,
                    "intent": intent,
                    "confidence": confidence,
                }
            )

            return response

        except Exception as e:
            logger.error(f"Error in Liv's message processing: {e}")
            return AgentResponse(
                content="I apologize, but I'm experiencing a technical issue with my international support systems. Let me connect you with immigration attorneys and international professional organizations who can provide the guidance you need.",
                specialist_type="international_specialist",
                success=False,
                error_message=str(e),
            )

    async def _analyze_international_intent(self, message: str) -> str:
        """Analyze user message to determine international support intent"""
        message_lower = message.lower()

        if any(
            term in message_lower
            for term in ["credential", "degree", "certification", "recognition", "evaluation"]
        ):
            return "credential_recognition"
        elif any(
            term in message_lower
            for term in ["visa", "immigration", "work permit", "green card", "citizenship"]
        ):
            return "visa_guidance"
        elif any(
            term in message_lower
            for term in ["culture", "adaptation", "integration", "workplace", "communication"]
        ):
            return "cultural_integration"
        elif any(
            term in message_lower
            for term in ["network", "connections", "mentorship", "community", "professional"]
        ):
            return "international_networking"
        elif any(
            term in message_lower
            for term in ["language", "english", "communication", "speaking", "writing"]
        ):
            return "language_support"
        else:
            return "general_guidance"

    async def _provide_credential_guidance(self, message: str, context: AgentContext) -> str:
        """Provide credential recognition and evaluation guidance"""
        return """📜 **International Credential Recognition for Climate Careers**

Welcome! I understand the challenges of having your international qualifications recognized. Let me guide you through the credential evaluation process for climate careers in the US.

**🎓 Understanding Credential Evaluation:**

**Types of Evaluations:**
• **Course-by-Course**: Detailed analysis of each course and grade
• **Document-by-Document**: Evaluation of each credential separately
• **General**: Overall equivalency to US education system
• **Professional**: Specific to licensing requirements in your field

**When You Need Evaluations:**
• Applying for jobs that require specific degrees
• Pursuing additional education or certifications
• Obtaining professional licenses
• Applying for certain visa categories
• Meeting employer requirements

**🏢 Credential Evaluation Services:**

**NACES Member Organizations (Recommended):**
• **World Education Services (WES)**: Most widely recognized
• **Educational Credential Evaluators (ECE)**: Detailed evaluations
• **International Education Research Foundation (IERF)**: Comprehensive service
• **Academic Evaluation Services (AES)**: Fast processing
• **Foreign Academic Credential Service (FACS)**: Specialized service

**Evaluation Process:**
```
Step 1: Choose evaluation service based on your needs
Step 2: Submit application and required documents
Step 3: Pay evaluation fees ($100-$300 typically)
Step 4: Wait for processing (2-8 weeks)
Step 5: Receive evaluation report
Step 6: Submit to employers/institutions as needed
```

**🌍 Climate-Specific Credential Considerations:**

**Engineering and Technical Fields:**
• May require additional licensing through state boards
• Professional Engineer (PE) license may be needed
• ABET accreditation equivalency important
• Consider Fundamentals of Engineering (FE) exam

**Environmental Science:**
• Graduate degrees often preferred in climate sector
• Consider additional certifications (LEED, sustainability)
• Research experience and publications valuable
• Laboratory skills and field experience important

**Business and Policy:**
• MBA or policy degrees highly valued
• Consider additional certifications in sustainability
• Language skills and cultural competency are assets
• International experience is often an advantage

**💡 Maximizing Your International Background:**

**Highlighting Global Experience:**
```
Instead of: "I have a degree from [country]"
Say: "I bring international perspective on climate challenges and solutions from my education and experience in [country]"

Instead of: "My credentials are different"
Say: "My diverse educational background provides unique insights into global climate issues"
```

**Leveraging Cultural Knowledge:**
• Emphasize understanding of global climate impacts
• Highlight experience with international collaboration
• Showcase multilingual and multicultural competencies
• Connect your background to specific climate challenges

**📋 Document Preparation Checklist:**
```
Required Documents (varies by service):
□ Official transcripts in original language
□ Official English translations (if needed)
□ Degree certificates/diplomas
□ Course descriptions/syllabi (if available)
□ Professional licenses (if applicable)
□ Identity verification documents
□ Application forms and fees
```

**🚀 Beyond Credential Evaluation:**

**Additional Steps for Climate Careers:**
• Research specific employer requirements
• Consider additional US certifications or training
• Join professional associations in your field
• Attend climate conferences and networking events
• Consider informational interviews with hiring managers

**Professional Development:**
• Take courses to fill any knowledge gaps
• Obtain US-specific certifications (PMP, LEED, etc.)
• Develop familiarity with US regulations and standards
• Build portfolio of US-relevant work or volunteer experience

**🌟 Success Stories:**
Many international professionals have successfully transitioned to climate careers by:
• Combining international credentials with US certifications
• Emphasizing unique global perspectives
• Building strong professional networks
• Continuously learning about US climate policy and markets

**💼 Employer Education:**
Sometimes you may need to help employers understand:
• The value of international education and experience
• How your background brings unique perspectives
• The equivalency of your credentials
• Your commitment to professional development

**📞 Additional Resources:**
• **USCIS**: Immigration-related credential questions
• **State Licensing Boards**: Professional licensing requirements
• **Professional Associations**: Field-specific guidance
• **Career Services**: University and community resources

Remember: Your international background is an asset in the global climate movement. Many employers value diverse perspectives and international experience in addressing climate challenges.

What specific credentials do you need evaluated, and what type of climate role are you targeting? I can provide more targeted guidance based on your situation."""

    async def _provide_visa_guidance(self, message: str, context: AgentContext) -> str:
        """Provide visa and immigration guidance for climate careers"""
        return """🛂 **Visa and Immigration Pathways for Climate Careers**

Navigating US immigration for climate work can be complex, but there are several pathways available. Let me guide you through the options:

**⚠️ Important Disclaimer:**
This is general information only. Always consult with a qualified immigration attorney for personalized advice about your specific situation.

**🎯 Common Visa Categories for Climate Professionals:**

**Employment-Based Visas:**

**H-1B (Specialty Occupation):**
• Requires bachelor's degree or equivalent
• Employer must sponsor and file petition
• Annual cap with lottery system (65,000 + 20,000 for advanced degrees)
• 3-year initial period, renewable once
• Path to green card possible

**L-1 (Intracompany Transfer):**
• Must work for same company abroad for 1+ years
• L-1A for managers/executives, L-1B for specialized knowledge
• No annual cap
• Can lead to green card through EB-1C category

**O-1 (Extraordinary Ability):**
• For individuals with extraordinary ability in sciences, arts, business
• High standard of evidence required
• No annual cap
• Renewable indefinitely

**TN (NAFTA Professionals - Canada/Mexico):**
• Specific list of qualifying professions
• Renewable indefinitely
• No path to green card directly

**🌱 Climate-Specific Opportunities:**

**STEM Fields Advantage:**
• 24-month STEM OPT extension for F-1 students
• Priority processing for certain STEM fields
• Growing demand for climate science and engineering expertise

**Research and Academia:**
• J-1 research scholar programs
• University sponsorship opportunities
• Collaboration with climate research institutions

**Nonprofit Sector:**
• Many climate organizations can sponsor visas
• Mission-driven work often valued by immigration officers
• Potential for National Interest Waiver arguments

**💚 Green Card Pathways:**

**Employment-Based Categories:**

**EB-1 (Priority Workers):**
• EB-1A: Extraordinary ability (self-petition possible)
• EB-1B: Outstanding professors/researchers
• EB-1C: Multinational executives/managers
• No labor certification required
• Current priority dates

**EB-2 (Advanced Degree/Exceptional Ability):**
• Requires advanced degree or exceptional ability
• Labor certification usually required
• National Interest Waiver (NIW) possible for climate work
• Longer wait times for some countries

**EB-3 (Skilled Workers):**
• Bachelor's degree or 2+ years experience
• Labor certification required
• Longer processing times

**🌟 National Interest Waiver (NIW) for Climate Work:**

**Strong NIW Arguments for Climate Professionals:**
• Climate change as urgent national priority
• Shortage of qualified climate professionals
• Economic benefits of clean energy transition
• National security implications of climate resilience
• Public health benefits of environmental protection

**Building Your NIW Case:**
• Document your expertise and achievements
• Gather letters from experts in your field
• Demonstrate national scope of your work
• Show how your work benefits the US broadly
• Highlight urgency and importance of climate action

**📋 Visa Application Strategy:**

**Preparation Steps:**
```
1. Assess your qualifications and options
2. Gather required documentation
3. Find qualified immigration attorney
4. Prepare strong application package
5. Consider timing and strategic factors
6. Plan for potential delays or challenges
```

**Documentation Checklist:**
• Educational credentials and evaluations
• Employment letters and contracts
• Evidence of expertise and achievements
• Financial documentation
• Medical examinations (if required)
• Background checks and clearances

**🤝 Finding Sponsoring Employers:**

**Climate Organizations That Sponsor:**
• Environmental nonprofits and NGOs
• Clean energy companies and startups
• Government agencies (EPA, DOE, NOAA)
• Research institutions and universities
• Consulting firms specializing in sustainability

**Employer Considerations:**
• Cost and complexity of visa sponsorship
• Timeline for hiring international candidates
• Experience with immigration processes
• Commitment to diversity and inclusion

**💡 Maximizing Your Chances:**

**Strengthen Your Profile:**
• Develop specialized climate expertise
• Build strong professional network in US
• Gain experience with US climate policies and markets
• Obtain relevant certifications and training
• Demonstrate English proficiency

**Strategic Timing:**
• Apply early in fiscal year for cap-subject visas
• Consider multiple application strategies
• Plan for processing delays
• Maintain legal status throughout process

**🌍 Alternative Pathways:**

**International Programs:**
• Fulbright Scholar Program
• International visitor exchange programs
• Research collaboration agreements
• Multinational company transfers

**Investment-Based Options:**
• EB-5 investor visa (requires significant investment)
• E-2 treaty investor visa (for certain countries)
• Starting climate-focused business

**📞 Professional Resources:**
• **American Immigration Lawyers Association (AILA)**: Find qualified attorneys
• **USCIS**: Official government information
• **State Bar Associations**: Attorney referral services
• **University International Offices**: Student and scholar support

**🔥 Success Tips:**
• Start planning early - immigration takes time
• Work with experienced immigration attorney
• Maintain detailed records of achievements
• Build relationships with potential sponsors
• Stay informed about policy changes
• Consider multiple pathways simultaneously

Remember: Your international background and climate expertise are valuable assets. Many US organizations recognize the need for global perspectives in addressing climate challenges.

What's your current immigration status, and what type of climate role are you pursuing? I can provide more specific guidance based on your situation."""

    async def _provide_cultural_integration_guidance(
        self, message: str, context: AgentContext
    ) -> str:
        """Provide cultural integration and workplace adaptation guidance"""
        return """🤝 **Cultural Integration and Professional Adaptation**

Adapting to a new professional culture while maintaining your identity can be challenging. Let me help you navigate workplace culture and communication in the US climate sector.

**🌍 Understanding US Workplace Culture:**

**General Characteristics:**
• Direct communication style (compared to many cultures)
• Emphasis on individual achievement and initiative
• Informal hierarchy in many organizations
• Time-conscious and deadline-focused
• Networking and relationship-building important

**Climate Sector Specifics:**
• Mission-driven and values-oriented
• Collaborative and interdisciplinary approach
• Emphasis on innovation and problem-solving
• Strong focus on data and evidence-based decisions
• Growing emphasis on diversity, equity, and inclusion

**💬 Communication Strategies:**

**Professional Communication:**
```
Email Etiquette:
• Clear, concise subject lines
• Brief, direct messages
• Professional but friendly tone
• Prompt responses expected
• Use of "please" and "thank you"

Meeting Culture:
• Punctuality highly valued
• Active participation encouraged
• Speaking up and asking questions welcomed
• Follow-up actions clearly defined
• Virtual meetings common (especially post-COVID)
```

**Verbal Communication:**
• Speak clearly and at moderate pace
• Ask for clarification when needed
• Share your perspectives and expertise
• Use specific examples and data
• Practice active listening

**Cross-Cultural Communication:**
• Acknowledge your international perspective as an asset
• Share relevant global examples and experiences
• Ask questions about US-specific contexts
• Be patient with cultural learning process
• Find mentors who can guide you

**🏢 Workplace Navigation:**

**Building Professional Relationships:**
• Participate in team lunches and social events
• Engage in small talk before meetings
• Show interest in colleagues' work and backgrounds
• Offer help and collaboration
• Share appropriate personal information

**Performance and Feedback:**
• US workplaces often provide direct feedback
• Self-advocacy and promotion are expected
• Document your achievements and contributions
• Seek regular feedback from supervisors
• Set clear goals and track progress

**Professional Development:**
• Take initiative in identifying learning opportunities
• Attend conferences, workshops, and training
• Join professional associations
• Seek mentorship and sponsorship
• Build internal and external networks

**🌟 Leveraging Your International Background:**

**Your Unique Value:**
• Global perspective on climate challenges
• Understanding of international markets and policies
• Multilingual and multicultural competencies
• Experience with diverse stakeholder groups
• Fresh perspectives on US climate issues

**Sharing Your Expertise:**
```
Effective Ways to Contribute:
• "In my experience working in [country], we addressed this challenge by..."
• "From a global perspective, I've seen successful approaches that include..."
• "My background in [region] gives me insight into..."
• "International best practices suggest..."
```

**🤝 Building Your Professional Network:**

**Networking Strategies:**
• Attend climate conferences and events
• Join professional associations in your field
• Participate in international professional groups
• Connect with other international professionals
• Engage in online climate communities

**Mentorship and Support:**
• Find mentors within your organization
• Connect with other international professionals
• Join diversity and inclusion groups
• Seek reverse mentoring opportunities
• Build relationships across different levels

**🏠 Personal and Social Integration:**

**Community Involvement:**
• Join local environmental organizations
• Participate in community climate initiatives
• Volunteer for causes you care about
• Attend cultural events and festivals
• Explore local outdoor and recreational activities

**Maintaining Cultural Identity:**
• Stay connected with your home country's climate community
• Share your cultural perspectives in appropriate settings
• Maintain language skills and cultural practices
• Connect with diaspora communities
• Celebrate your heritage while embracing new experiences

**💪 Overcoming Common Challenges:**

**Imposter Syndrome:**
• Remember that your international background is valuable
• Focus on your unique contributions and perspectives
• Seek feedback to validate your performance
• Connect with other international professionals
• Celebrate your achievements and progress

**Communication Barriers:**
• Practice English in professional contexts
• Ask for clarification when needed
• Use visual aids and written follow-ups
• Join Toastmasters or similar groups
• Consider accent reduction training if desired

**Cultural Misunderstandings:**
• Approach differences with curiosity, not judgment
• Ask questions to understand context
• Share your cultural perspectives when appropriate
• Find cultural bridges and common ground
• Be patient with yourself and others

**📚 Resources for Integration:**

**Professional Development:**
• **Toastmasters International**: Public speaking and leadership
• **Professional Associations**: Field-specific networking
• **LinkedIn Learning**: Professional skills development
• **Local Chambers of Commerce**: Business networking

**Cultural Support:**
• **International Centers**: Community support and programming
• **Cultural Organizations**: Maintain connections to heritage
• **Language Exchange Programs**: Improve English while helping others
• **Diversity and Inclusion Groups**: Workplace support networks

**🌱 Long-term Success Strategies:**

**Career Advancement:**
• Understand promotion criteria and processes
• Build relationships with decision-makers
• Seek stretch assignments and leadership opportunities
• Develop US-specific expertise while maintaining global perspective
• Consider additional education or certifications

**Giving Back:**
• Mentor other international professionals
• Share your expertise with global climate initiatives
• Contribute to diversity and inclusion efforts
• Bridge connections between US and international organizations
• Advocate for inclusive practices in your workplace

Remember: Cultural integration is a process, not a destination. Your international background brings valuable perspectives to the US climate movement. Be patient with yourself, stay curious, and remember that diversity of thought and experience strengthens our collective response to climate challenges.

What specific cultural or workplace challenges are you facing? I'm here to provide more targeted guidance and support."""

    async def _provide_networking_guidance(self, message: str, context: AgentContext) -> str:
        """Provide international networking and mentorship guidance"""
        return """🌐 **Building Your International Climate Professional Network**

Networking is crucial for climate career success, especially as an international professional. Let me help you build meaningful connections and find mentorship opportunities.

**🎯 Strategic Networking Approach:**

**Understanding US Networking Culture:**
• Relationship-building is key to career advancement
• Professional networking is expected and valued
• Quality of connections matters more than quantity
• Mutual benefit and reciprocity are important
• Follow-up and maintenance of relationships essential

**Your Networking Advantages:**
• International perspective is highly valued in climate work
• Global experience provides unique conversation starters
• Multilingual abilities open doors to diverse networks
• Cross-cultural competency is increasingly important
• Fresh perspectives on US climate challenges

**🌍 Climate-Specific Networking Opportunities:**

**Major Climate Conferences:**
• **Climate Week NYC**: Annual September event with global attendance
• **COP Climate Summits**: International climate negotiations
• **ARPA-E Energy Innovation Summit**: Clean energy technology focus
• **Intersolar North America**: Solar industry networking
• **American Wind Energy Association (AWEA) Events**: Wind industry connections

**Professional Associations:**
• **Association of Climate Change Officers (ACCO)**: Climate professionals
• **International Association for Energy Economics (IAEE)**: Energy sector
• **Air & Waste Management Association (A&WMA)**: Environmental professionals
• **American Society of Adaptation Professionals (ASAP)**: Climate adaptation
• **Women in Renewable Energy (WiRE)**: Gender-focused networking

**🤝 Networking Strategies for International Professionals:**

**Preparation and Approach:**
```
Before Networking Events:
□ Research attendees and speakers
□ Prepare your elevator pitch
□ Set specific goals (e.g., meet 5 new people)
□ Bring business cards and LinkedIn QR code
□ Practice small talk and conversation starters
```

**Conversation Starters:**
• "I'm originally from [country] and interested in how climate solutions differ globally..."
• "I'd love to learn about your experience in the US climate sector..."
• "What trends are you seeing in climate work here compared to internationally?"
• "I'm new to the US climate community and would appreciate your insights..."

**Cultural Navigation:**
• Be prepared for direct, informal communication
• Share your international experience confidently
• Ask questions about US-specific climate policies and markets
• Offer your global perspective on climate challenges
• Exchange contact information and follow up promptly

**💼 Professional Mentorship:**

**Finding Mentors:**
• Look for professionals with international backgrounds
• Seek mentors at different career stages
• Consider reverse mentoring opportunities
• Join formal mentorship programs
• Build relationships gradually over time

**Types of Mentors You Need:**
• **Industry Mentor**: Climate sector expertise and connections
• **Cultural Mentor**: US workplace navigation and cultural integration
• **Career Mentor**: Professional development and advancement guidance
• **Peer Mentors**: Other international professionals in similar situations

**Mentorship Best Practices:**
• Be clear about your goals and expectations
• Respect mentors' time and expertise
• Come prepared with specific questions
• Follow through on advice and recommendations
• Express gratitude and update on progress
• Look for ways to give back and support others

**🌐 Online Networking Strategies:**

**LinkedIn Optimization:**
```
Profile Enhancement:
• Highlight international background as asset
• Include climate-relevant keywords
• Share insights from global perspective
• Engage with climate content regularly
• Connect with climate professionals actively
```

**Virtual Networking:**
• Join climate-focused LinkedIn groups
• Participate in Twitter climate conversations
• Attend virtual conferences and webinars
• Engage in online climate communities
• Share relevant content and insights

**Digital Relationship Building:**
• Comment thoughtfully on posts
• Share relevant articles with personal insights
• Congratulate connections on achievements
• Offer help and expertise when appropriate
• Schedule virtual coffee chats

**🏢 Workplace Networking:**

**Internal Networking:**
• Build relationships across departments
• Participate in employee resource groups
• Volunteer for cross-functional projects
• Attend company social events
• Seek informational interviews with colleagues

**External Professional Networking:**
• Join local climate professional groups
• Attend industry meetups and events
• Participate in professional development workshops
• Engage with clients and partners
• Represent your organization at conferences

**🌟 International Professional Communities:**

**Diaspora Networks:**
• Connect with professionals from your home country
• Join country-specific professional associations
• Participate in cultural business networks
• Attend embassy and consulate events
• Build bridges between home and US markets

**Global Climate Networks:**
• **Climate Professionals Network**: International online community
• **Young Professionals in Energy**: Global energy sector networking
• **International Solar Alliance**: Global solar industry connections
• **Global Green Growth Institute**: International green growth network

**📱 Networking Tools and Platforms:**

**Essential Platforms:**
• **LinkedIn**: Primary professional networking platform
• **Meetup**: Local professional and interest groups
• **Eventbrite**: Climate conferences and workshops
• **Twitter**: Climate conversations and thought leadership
• **Slack Communities**: Climate professional groups

**Networking Apps:**
• **Shapr**: Professional networking app
• **Bumble Bizz**: Business networking
• **Coffee Meets Bagel**: Professional connections
• **Luma**: Event discovery and networking

**🚀 Networking Action Plan:**

**Month 1: Foundation Building**
• Optimize LinkedIn profile
• Join 3-5 relevant professional associations
• Attend 2 local climate events
• Reach out to 10 climate professionals for informational interviews

**Month 2-3: Relationship Development**
• Follow up with new connections
• Attend major climate conference
• Join professional association committees
• Seek mentorship opportunities

**Month 4-6: Network Expansion**
• Speak at industry events
• Write articles sharing international perspective
• Mentor other international professionals
• Build strategic partnerships

**💡 Networking Success Tips:**

**Quality over Quantity:**
• Focus on building meaningful relationships
• Invest time in nurturing connections
• Provide value to your network
• Be authentic and genuine in interactions
• Remember personal details about connections

**Cultural Sensitivity:**
• Respect different communication styles
• Be patient with relationship building
• Understand US business etiquette
• Share your cultural insights appropriately
• Bridge cultural gaps in professional settings

**Long-term Relationship Management:**
• Stay in regular contact with key connections
• Celebrate others' successes and milestones
• Offer help and support when possible
• Share relevant opportunities and information
• Maintain relationships even when not actively job searching

Remember: Your international background is a networking asset, not a barrier. The climate sector values global perspectives and cross-cultural collaboration. Be confident in sharing your unique experiences and insights.

What specific networking challenges are you facing, and what type of connections would be most valuable for your climate career goals?"""

    async def _provide_language_support(self, message: str, context: AgentContext) -> str:
        """Provide language and communication support"""
        return """🗣️ **Professional English and Communication Support**

Strong communication skills are essential for climate career success. Let me help you enhance your professional English and cross-cultural communication abilities.

**📈 Assessing Your Communication Needs:**

**Professional English Skills:**
• **Technical Writing**: Reports, proposals, and documentation
• **Presentation Skills**: Public speaking and slide presentations
• **Meeting Participation**: Contributing effectively in discussions
• **Email Communication**: Professional correspondence
• **Networking Conversations**: Building relationships through communication

**Climate-Specific Language:**
• Industry terminology and acronyms
• Policy and regulatory language
• Technical and scientific vocabulary
• Business and finance terminology
• Communication with diverse stakeholders

**💼 Professional Communication Enhancement:**

**Business Writing Skills:**
```
Email Best Practices:
• Clear, specific subject lines
• Concise, well-organized content
• Professional but friendly tone
• Proper grammar and spelling
• Appropriate level of formality

Report Writing:
• Executive summary with key points
• Clear structure and headings
• Data-driven arguments
• Professional formatting
• Actionable recommendations
```

**Presentation Skills:**
• Clear, logical structure
• Engaging opening and closing
• Visual aids that support content
• Practice for smooth delivery
• Handling questions confidently

**Meeting Participation:**
• Prepare talking points in advance
• Speak clearly and at appropriate pace
• Ask clarifying questions when needed
• Contribute unique perspectives
• Follow up on action items

**🌍 Climate Sector Communication:**

**Technical Communication:**
• Learn key climate science terminology
• Understand policy and regulatory language
• Practice explaining complex concepts simply
• Use data and evidence effectively
• Adapt communication to audience level

**Stakeholder Communication:**
• Tailor message to different audiences
• Use appropriate level of technical detail
• Consider cultural and regional differences
• Practice active listening skills
• Build rapport across cultural boundaries

**🎯 Language Development Strategies:**

**Formal Learning:**
• **ESL Classes**: Community colleges and language schools
• **Business English Courses**: Professional communication focus
• **Online Platforms**: Coursera, edX, LinkedIn Learning
• **University Programs**: Continuing education options
• **Professional Coaching**: One-on-one language coaching

**Immersive Practice:**
• **Toastmasters International**: Public speaking and leadership
• **Professional Meetups**: Practice in real-world settings
• **Volunteer Opportunities**: Build skills while giving back
• **Book Clubs**: Improve reading and discussion skills
• **Debate Groups**: Enhance argumentation and critical thinking

**🎤 Public Speaking and Presentation:**

**Overcoming Speaking Anxiety:**
• Practice with supportive audiences
• Record yourself to identify areas for improvement
• Focus on message rather than perfection
• Use visual aids to support your points
• Prepare thoroughly to build confidence

**Accent and Pronunciation:**
• Work with speech coach if desired
• Practice with native speakers
• Record and listen to your speech
• Focus on clarity over accent reduction
• Remember that accents can be assets

**Presentation Techniques:**
• Start with strong opening
• Use storytelling to engage audience
• Include your international perspective
• Practice transitions between points
• End with clear call to action

**📚 Professional Development Resources:**

**Language Learning Apps:**
• **Grammarly**: Writing assistance and grammar checking
• **Hemingway Editor**: Clear, concise writing
• **Pronunciation Coach**: Speech improvement
• **FluentU**: Real-world English practice
• **Cambly**: Conversation practice with native speakers

**Professional Communication:**
• **Harvard Business Review**: Business communication articles
• **TED Talks**: Presentation skills and content ideas
• **Coursera Business Writing**: Professional writing courses
• **LinkedIn Learning**: Communication skills development

**🌟 Leveraging Your Multilingual Abilities:**

**Professional Advantages:**
• Communicate with international stakeholders
• Translate complex concepts across cultures
• Bridge communication gaps in diverse teams
• Access global climate information and research
• Facilitate international partnerships

**Career Opportunities:**
• International business development
• Global climate policy and advocacy
• Cross-cultural team leadership
• International conference speaking
• Multilingual content creation

**💡 Communication Confidence Building:**

**Practice Strategies:**
• Join professional discussion groups
• Volunteer to present at team meetings
• Participate in Q&A sessions at events
• Offer to lead training or workshops
• Write articles or blog posts

**Feedback and Improvement:**
• Ask trusted colleagues for communication feedback
• Record presentations for self-evaluation
• Seek mentorship from strong communicators
• Take advantage of professional development opportunities
• Practice regularly in low-stakes environments

**🤝 Cross-Cultural Communication:**

**Cultural Bridge Building:**
• Share international perspectives appropriately
• Help colleagues understand global contexts
• Facilitate communication in diverse teams
• Translate cultural nuances when helpful
• Build inclusive communication practices

**Navigating Differences:**
• Understand direct vs. indirect communication styles
• Adapt to different meeting and decision-making cultures
• Respect varying approaches to hierarchy and authority
• Bridge generational and cultural communication gaps
• Practice cultural sensitivity in all interactions

**📋 Communication Development Plan:**

**Assessment (Week 1):**
• Identify specific communication challenges
• Set measurable improvement goals
• Gather feedback from colleagues or mentors
• Choose appropriate development resources

**Skill Building (Months 1-3):**
• Enroll in relevant courses or coaching
• Practice daily in professional settings
• Join speaking or discussion groups
• Seek feedback and adjust approach

**Application (Months 4-6):**
• Volunteer for presentation opportunities
• Lead meetings or training sessions
• Write professional articles or reports
• Mentor others in communication skills

**🔥 Success Metrics:**
• Increased confidence in professional communication
• Positive feedback from colleagues and supervisors
• Successful presentations and meeting participation
• Enhanced networking and relationship building
• Career advancement opportunities

Remember: Your multilingual abilities and international perspective are communication assets. Focus on clarity and authenticity rather than perfection. Many successful climate professionals have accents and diverse communication styles.

What specific communication challenges are you facing in your climate career? I can provide more targeted guidance and resources based on your needs."""

    async def _provide_general_international_guidance(
        self, message: str, context: AgentContext
    ) -> str:
        """Provide general international professional guidance"""
        return """🌍 **Welcome to International Climate Career Support**

Hello! I'm Liv, and I'm here to support you as an international professional navigating climate careers in the United States. Your global perspective and diverse background are valuable assets in the climate movement.

**🌟 My Specializations:**
• **Credential Recognition**: Navigating evaluation and recognition of international qualifications
• **Immigration Support**: Understanding visa options and pathways for climate careers
• **Cultural Integration**: Adapting to US workplace culture while maintaining your identity
• **Professional Networking**: Building meaningful connections in the climate sector
• **Language Support**: Enhancing professional communication and presentation skills

**🎯 Why Your International Background Matters:**

**Global Climate Perspective:**
• Climate change is a global challenge requiring international collaboration
• Your experience with different climate impacts and solutions is valuable
• Cross-cultural competency is increasingly important in climate work
• International markets and policies are crucial to climate solutions
• Diverse perspectives strengthen climate innovation and problem-solving

**Professional Advantages:**
• Multilingual abilities for international stakeholder engagement
• Understanding of global supply chains and markets
• Experience with different regulatory and policy frameworks
• Cultural competency for diverse team leadership
• Fresh perspectives on US climate challenges and opportunities

**🤝 How I Can Support You:**

**Practical Guidance:**
• Credential evaluation and professional licensing processes
• Visa and immigration pathways for climate careers
• Job search strategies for international professionals
• Salary negotiation and workplace navigation
• Professional development and career advancement

**Cultural Support:**
• Understanding US workplace culture and communication styles
• Building professional networks and finding mentorship
• Balancing cultural identity with professional integration
• Overcoming common challenges faced by international professionals
• Celebrating and leveraging your diverse background

**Career Development:**
• Identifying climate career opportunities that value international experience
• Translating global experience into US-relevant qualifications
• Building skills and knowledge specific to US climate sector
• Developing leadership and advancement strategies
• Creating long-term career plans in climate work

**🌱 Getting Started as an International Climate Professional:**

**Essential First Steps:**
1. **Assess Your Credentials**: Understand how your qualifications translate to US standards
2. **Research the Market**: Learn about US climate sector opportunities and requirements
3. **Build Your Network**: Connect with climate professionals and international communities
4. **Develop Language Skills**: Enhance professional communication abilities
5. **Understand Culture**: Learn about US workplace norms and expectations

**Key Questions to Consider:**
• What type of climate work aligns with your background and interests?
• What additional credentials or skills might strengthen your profile?
• How can you best leverage your international experience?
• What visa or immigration pathway is most appropriate for your situation?
• Who can provide mentorship and guidance in your transition?

**🔥 Common Challenges and Solutions:**

**Credential Recognition:**
• Challenge: International degrees not recognized or understood
• Solution: Obtain credential evaluation and highlight equivalent experience

**Cultural Adaptation:**
• Challenge: Different workplace norms and communication styles
• Solution: Seek mentorship and practice professional communication skills

**Network Building:**
• Challenge: Limited professional connections in new country
• Solution: Join professional associations and attend climate events

**Language Barriers:**
• Challenge: Professional English and technical terminology
• Solution: Take business English courses and practice in professional settings

**Immigration Complexity:**
• Challenge: Navigating visa requirements and processes
• Solution: Work with qualified immigration attorney and plan strategically

**🌟 Success Stories:**

Many international professionals have built successful climate careers by:
• Combining international credentials with US certifications
• Leveraging global experience for international business development roles
• Building strong professional networks through consistent engagement
• Developing specialized expertise in climate technologies or policies
• Starting their own climate-focused businesses or consulting practices

**📚 Essential Resources:**

**Professional Development:**
• **Climate Professional Networks**: Join international climate communities
• **Professional Associations**: Participate in climate sector organizations
• **Continuing Education**: Take courses to build US-specific knowledge
• **Mentorship Programs**: Find guidance from experienced professionals

**Immigration and Legal:**
• **Immigration Attorneys**: Get qualified legal advice for your situation
• **Credential Evaluation Services**: Obtain official assessment of qualifications
• **Professional Licensing Boards**: Understand requirements for your field

**Cultural Integration:**
• **International Centers**: Community support and programming
• **Professional Development**: Business communication and networking skills
• **Cultural Organizations**: Maintain connections while building new ones

**🎯 Next Steps:**
• What specific aspect of your international transition would you like to focus on?
• What type of climate career are you most interested in pursuing?
• What challenges are you currently facing in your professional journey?
• How can I best support you in achieving your climate career goals?

Remember: Your international background is not a barrier to overcome - it's a unique strength that the climate movement needs. The global nature of climate challenges requires professionals who understand diverse perspectives, cultures, and approaches to solutions.

I'm here to support you every step of the way. What would be most helpful for you to focus on first?"""

    async def _calculate_confidence(self, message: str, intent: str) -> float:
        """Calculate confidence score based on message analysis"""
        base_confidence = 0.8

        # Adjust based on intent specificity
        intent_adjustments = {
            "credential_recognition": 0.05,
            "visa_guidance": 0.04,
            "cultural_integration": 0.03,
            "international_networking": 0.04,
            "language_support": 0.03,
            "general_guidance": -0.05,
        }

        confidence = base_confidence + intent_adjustments.get(intent, 0)

        # Adjust based on international-related terminology
        international_terms = [
            "international",
            "visa",
            "credential",
            "culture",
            "language",
            "immigration",
        ]
        if any(term in message.lower() for term in international_terms):
            confidence += 0.03

        if len(message) > 100:
            confidence += 0.02

        return min(confidence, 1.0)

    async def _suggest_next_actions(self, intent: str, context: AgentContext) -> List[str]:
        """Suggest next actions based on intent and context"""
        base_actions = [
            "Research credential evaluation services",
            "Connect with international climate professionals",
            "Join professional associations in your field",
        ]

        intent_specific_actions = {
            "credential_recognition": [
                "Choose appropriate credential evaluation service",
                "Gather required documents for evaluation",
                "Research additional certifications that might strengthen your profile",
            ],
            "visa_guidance": [
                "Consult with qualified immigration attorney",
                "Research employers who sponsor visas in climate sector",
                "Prepare strong application materials highlighting climate expertise",
            ],
            "cultural_integration": [
                "Find mentors who can guide workplace navigation",
                "Join professional development programs",
                "Practice professional communication in low-stakes environments",
            ],
            "international_networking": [
                "Attend climate conferences and professional events",
                "Join international professional associations",
                "Connect with other international professionals in climate sector",
            ],
            "language_support": [
                "Enroll in business English or professional communication courses",
                "Join Toastmasters or similar speaking groups",
                "Practice professional presentations and writing",
            ],
        }

        return intent_specific_actions.get(intent, base_actions)


__all__ = ["LivAgent"]
