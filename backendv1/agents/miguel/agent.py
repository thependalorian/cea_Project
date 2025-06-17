"""
Miguel - Environmental Justice Specialist Agent

Following rule #2: Create modular agent components for easy maintenance
Following rule #3: Component documentation explaining purpose and functionality
Following rule #12: Complete code verification with proper agent implementation

Miguel specializes in environmental justice, community engagement, equity advocacy,
and ensuring climate solutions benefit all communities, especially those most impacted.

Location: backendv1/agents/miguel/agent.py
"""

from typing import Dict, Any, List
from datetime import datetime

from backendv1.agents.base.agent_base import AgentBase, AgentContext, AgentResponse
from backendv1.agents.base.memory_system import MemorySystem
from backendv1.agents.base.reflection_engine import ReflectionEngine
from backendv1.utils.logger import setup_logger
from .prompts import (
    MIGUEL_SYSTEM_PROMPT,
    ENVIRONMENTAL_JUSTICE_PROMPT,
    COMMUNITY_ENGAGEMENT_PROMPT,
    EQUITY_ADVOCACY_PROMPT,
    MIGUEL_CONFIG,
)

logger = setup_logger("miguel_agent")


class MiguelAgent(AgentBase):
    """
    Miguel - Environmental Justice Specialist

    Specialized in:
    - Environmental justice and equity advocacy
    - Community engagement and organizing
    - Frontline community support and empowerment
    - Equitable climate solutions and policy
    - Cultural competency and inclusive practices
    """

    def __init__(self, agent_name: str, agent_type: str, **kwargs):
        """Initialize Miguel with memory and reflection capabilities"""
        super().__init__(agent_name, agent_type, **kwargs)
        self.memory_system = MemorySystem(agent_name)
        self.reflection_engine = ReflectionEngine(agent_name)

    def _load_prompts(self):
        """Load Miguel-specific prompts and templates"""
        self.system_prompt = MIGUEL_SYSTEM_PROMPT

        self.specialized_prompts = {
            "environmental_justice": ENVIRONMENTAL_JUSTICE_PROMPT,
            "community_engagement": COMMUNITY_ENGAGEMENT_PROMPT,
            "equity_advocacy": EQUITY_ADVOCACY_PROMPT,
            "community_organizing": "Let's explore how to support community-led climate initiatives...",
        }

    def _load_tools(self):
        """Load and configure Miguel-specific tools"""
        self.available_tools = [
            "environmental_justice_mapper",
            "community_engagement_planner",
            "equity_assessment_tool",
            "frontline_community_connector",
            "cultural_competency_guide",
            "community_organizing_toolkit",
            "policy_equity_analyzer",
            "justice_career_pathways",
        ]

    def _setup_capabilities(self):
        """Set up Miguel-specific capabilities and configurations"""
        self.specialization_areas = [
            "environmental_justice",
            "community_engagement",
            "equity_advocacy",
            "frontline_communities",
            "community_organizing",
            "cultural_competency",
            "policy_equity",
            "grassroots_movements",
        ]

        self.expertise_level = "expert"
        self.confidence_threshold = 0.8

    async def process_message(self, message: str, context: AgentContext) -> AgentResponse:
        """
        Process user message and provide environmental justice guidance

        Following rule #6: Asynchronous data handling for performance
        Following rule #15: Include comprehensive error handling

        Args:
            message: User's message
            context: Conversation context

        Returns:
            AgentResponse: Miguel's specialized response
        """
        try:
            logger.info(
                f"🌍 Miguel processing environmental justice message for user {context.user_id}"
            )

            # Store interaction in memory
            await self.memory_system.store_episode(
                {
                    "type": "environmental_justice_interaction",
                    "message": message,
                    "user_id": context.user_id,
                    "context": "environmental_justice_guidance",
                }
            )

            # Analyze message for environmental justice intent
            intent = await self._analyze_justice_intent(message)

            # Generate specialized response based on intent
            if intent == "environmental_justice":
                response_content = await self._provide_environmental_justice_guidance(
                    message, context
                )
            elif intent == "community_engagement":
                response_content = await self._provide_community_engagement_guidance(
                    message, context
                )
            elif intent == "equity_advocacy":
                response_content = await self._provide_equity_advocacy_guidance(message, context)
            elif intent == "community_organizing":
                response_content = await self._provide_organizing_guidance(message, context)
            elif intent == "career_pathways":
                response_content = await self._provide_justice_career_pathways(message, context)
            else:
                response_content = await self._provide_general_justice_guidance(message, context)

            # Calculate confidence score
            confidence = await self._calculate_confidence(message, intent)

            # Identify next actions
            next_actions = await self._suggest_next_actions(intent, context)

            # Create response
            response = AgentResponse(
                content=response_content,
                specialist_type="environmental_justice_specialist",
                confidence_score=confidence,
                tools_used=[
                    "environmental_justice_mapper",
                    "community_engagement_planner",
                    "equity_assessment_tool",
                ],
                next_actions=next_actions,
                sources=[
                    "Environmental Justice Resources",
                    "Community Organizing Toolkit",
                    "Equity Framework",
                ],
                metadata={
                    "intent": intent,
                    "specialization": "environmental_justice",
                    "expertise_areas": self.specialization_areas,
                },
            )

            # Reflect on interaction
            await self.reflection_engine.reflect_on_interaction(
                {
                    "id": f"miguel_{datetime.utcnow().timestamp()}",
                    "user_message": message,
                    "response": response_content,
                    "intent": intent,
                    "confidence": confidence,
                }
            )

            return response

        except Exception as e:
            logger.error(f"Error in Miguel's message processing: {e}")
            return AgentResponse(
                content="I apologize, but I'm experiencing a technical issue with my environmental justice resources. Let me connect you with community organizations and advocates who can provide the support you need.",
                specialist_type="environmental_justice_specialist",
                success=False,
                error_message=str(e),
            )

    async def _analyze_justice_intent(self, message: str) -> str:
        """Analyze user message to determine environmental justice intent"""
        message_lower = message.lower()

        if any(
            term in message_lower
            for term in ["environmental justice", "equity", "frontline", "marginalized"]
        ):
            return "environmental_justice"
        elif any(
            term in message_lower for term in ["community", "engagement", "outreach", "partnership"]
        ):
            return "community_engagement"
        elif any(term in message_lower for term in ["advocacy", "policy", "systemic", "justice"]):
            return "equity_advocacy"
        elif any(
            term in message_lower for term in ["organizing", "grassroots", "movement", "activism"]
        ):
            return "community_organizing"
        elif any(term in message_lower for term in ["career", "job", "work", "opportunity"]):
            return "career_pathways"
        else:
            return "general_guidance"

    async def _provide_environmental_justice_guidance(
        self, message: str, context: AgentContext
    ) -> str:
        """Provide environmental justice education and guidance"""
        return """🌍 **Environmental Justice Foundations**

¡Hola! I'm here to help you understand and center environmental justice in your climate work. Environmental justice is about ensuring all communities have equal protection from environmental harms and equal access to environmental benefits.

**⚖️ Core Environmental Justice Principles:**

**Historical Context:**
• Environmental racism has systematically placed toxic facilities in communities of color
• Frontline communities bear disproportionate environmental burdens
• Climate change amplifies existing inequalities
• Solutions must address root causes, not just symptoms

**Key Frameworks:**
```
Environmental Justice = Fair Treatment + Meaningful Involvement
Fair Treatment: No group bears disproportionate environmental burdens
Meaningful Involvement: All people can participate in decisions affecting their environment
```

**🏘️ Understanding Frontline Communities:**

**Who Are Frontline Communities?**
• Communities of color disproportionately affected by pollution
• Low-income communities with limited resources for adaptation
• Indigenous communities facing threats to traditional lands
• Rural communities dependent on natural resources
• Urban communities with environmental health disparities

**Environmental Burdens:**
• Air pollution from highways, factories, and power plants
• Water contamination from industrial facilities
• Toxic waste sites and landfills
• Heat islands with limited green space
• Food deserts and lack of healthy food access

**🌟 Climate Justice Intersections:**

**Climate Impacts on Frontline Communities:**
• Extreme heat affects communities without air conditioning
• Flooding impacts areas with poor infrastructure
• Air quality worsens in already polluted neighborhoods
• Economic impacts hit communities with fewer resources
• Health disparities are exacerbated by climate stress

**Justice-Centered Climate Solutions:**
• Community-controlled renewable energy projects
• Green infrastructure that provides community benefits
• Just transition programs for fossil fuel workers
• Community resilience and adaptation planning
• Local food systems and urban agriculture

**🎯 Applying Environmental Justice in Your Work:**

**Before Starting Any Project:**
```
Ask These Questions:
• Who is most affected by this environmental issue?
• Who has been excluded from previous solutions?
• How can affected communities lead or co-lead this work?
• What are the root causes of environmental inequity here?
• How will this solution address systemic inequalities?
```

**Community-Centered Approach:**
• Start by listening to community concerns and priorities
• Build authentic relationships before proposing solutions
• Support community-led initiatives rather than imposing external solutions
• Ensure communities benefit economically from environmental improvements
• Address immediate needs while working on long-term systemic change

**📚 Essential Environmental Justice Resources:**

**Foundational Reading:**
• "Dumping in Dixie" by Robert Bullard
• "The Death of Cancer Alley" by Steve Lerner
• "Environmental Justice in a Moment of Danger" by Julie Sze
• EPA Environmental Justice resources and mapping tools

**Key Organizations:**
• Environmental Justice Health Alliance
• Climate Justice Alliance
• Indigenous Environmental Network
• National Association for the Advancement of Colored People (NAACP) Environmental and Climate Justice Program

**🔍 Environmental Justice Career Pathways:**

**Direct Service Roles:**
• Community organizer with environmental justice organizations
• Environmental health advocate
• Community engagement coordinator for government agencies
• Environmental justice researcher and policy analyst

**Supporting Roles:**
• Lawyer specializing in environmental justice cases
• Public health professional focusing on environmental health disparities
• Urban planner centering equity in climate resilience
• Journalist covering environmental justice stories

**💪 Building Your Environmental Justice Practice:**

**Develop Cultural Competency:**
• Learn about the history and culture of communities you want to work with
• Understand how racism and classism intersect with environmental issues
• Practice humility and recognize what you don't know
• Commit to ongoing learning and self-reflection

**Build Authentic Relationships:**
• Attend community meetings and events as a listener
• Support community-led campaigns and initiatives
• Volunteer with local environmental justice organizations
• Follow community leaders and organizations on social media

**🌱 Getting Started:**
1. **Learn**: Read about environmental justice history and current issues
2. **Listen**: Attend community meetings in frontline communities
3. **Support**: Volunteer with environmental justice organizations
4. **Advocate**: Use your privilege to amplify community voices
5. **Act**: Apply environmental justice principles in your climate work

Remember: Environmental justice isn't just about adding diversity to existing climate work - it's about fundamentally changing how we approach environmental problems to center equity and community leadership.

What specific aspect of environmental justice would you like to explore further?"""

    async def _provide_community_engagement_guidance(
        self, message: str, context: AgentContext
    ) -> str:
        """Provide community engagement best practices"""
        return """🤝 **Authentic Community Engagement for Climate Justice**

Building genuine partnerships with frontline communities is essential for effective and equitable climate work. Here's how to engage authentically:

**🌟 Principles of Authentic Engagement:**

**Start with Relationship, Not Project:**
• Invest time in getting to know the community before proposing solutions
• Attend community events, meetings, and cultural celebrations
• Learn about community history, assets, and priorities
• Build trust through consistent presence and follow-through

**Follow Community Leadership:**
• Ask what the community needs rather than assuming you know
• Support existing community initiatives rather than starting new ones
• Ensure community members are in leadership roles, not just advisory positions
• Compensate community members for their time and expertise

**🏘️ Community Engagement Best Practices:**

**Before Engaging:**
```
Research and Preparation:
□ Learn about community demographics, history, and assets
□ Understand current environmental and social challenges
□ Identify existing community organizations and leaders
□ Research past engagement efforts and their outcomes
□ Examine your own positionality and potential biases
```

**Initial Outreach:**
• Connect through trusted community organizations and leaders
• Attend existing community meetings rather than organizing new ones
• Introduce yourself and your organization transparently
• Ask how you can support existing community priorities
• Be clear about your capacity and limitations

**Building Relationships:**
• Show up consistently, not just when you need something
• Participate in community life beyond your specific project
• Share meals, celebrate successes, and support during challenges
• Learn basic phrases if the community speaks a language other than English
• Respect cultural norms and communication styles

**🎯 Engagement Strategies by Community Type:**

**Urban Communities of Color:**
• Partner with established community-based organizations
• Attend neighborhood association and tenant organization meetings
• Support local businesses and community events
• Address immediate concerns like air quality and green space access
• Connect climate work to housing, health, and economic justice

**Rural Communities:**
• Understand agricultural and natural resource dependencies
• Respect traditional knowledge and land management practices
• Address economic concerns about climate policies
• Partner with agricultural extension services and rural organizations
• Focus on local economic benefits of climate solutions

**Indigenous Communities:**
• Acknowledge tribal sovereignty and government-to-government relationships
• Understand the connection between environmental and cultural preservation
• Support Indigenous-led climate initiatives and traditional ecological knowledge
• Respect protocols for engaging with tribal governments
• Address historical trauma and ongoing colonization

**🚫 What NOT to Do:**

**Extractive Practices to Avoid:**
• Parachuting in with pre-determined solutions
• Taking photos or stories without permission
• Speaking for the community in external forums
• Leaving when funding ends or priorities change
• Treating community members as subjects rather than partners

**Cultural Missteps:**
• Assuming all communities have the same needs and priorities
• Imposing external timelines and processes
• Ignoring power dynamics and historical trauma
• Using academic or technical jargon without explanation
• Failing to address immediate survival needs while focusing on long-term goals

**💼 Community Engagement Career Skills:**

**Essential Competencies:**
• Cultural humility and anti-racism practices
• Conflict resolution and mediation
• Popular education and facilitation
• Grant writing and resource development
• Coalition building and partnership development

**Language Skills:**
• Learn key phrases in community languages
• Understand code-switching and communication styles
• Practice active listening and asking open-ended questions
• Develop skills in plain language communication
• Learn to facilitate meetings in multiple languages

**🌱 Building Your Community Engagement Practice:**

**Start Where You Are:**
• Volunteer with local environmental justice organizations
• Attend community meetings in your own neighborhood
• Practice listening and relationship-building skills
• Reflect on your own identity and how it affects your interactions
• Seek mentorship from experienced community organizers

**Ongoing Development:**
• Take courses in community organizing and popular education
• Attend conferences and trainings on environmental justice
• Read books and articles by community organizers and frontline leaders
• Join professional networks focused on community engagement
• Participate in anti-racism and cultural competency training

**📋 Community Engagement Checklist:**
```
Before Any Community Engagement:
□ Have I done my homework about this community?
□ Am I prepared to listen more than I speak?
□ Do I have realistic expectations about timelines?
□ Am I committed to long-term relationship building?
□ Have I examined my own biases and assumptions?
□ Do I have resources to compensate community members?
□ Am I prepared to follow community leadership?
```

**🔥 Success Metrics for Community Engagement:**
• Community members are in leadership roles
• Community priorities drive project goals and activities
• Relationships continue beyond specific projects
• Community capacity and power are increased
• Environmental and social outcomes improve
• Community members report feeling heard and respected

Remember: Authentic community engagement is not a strategy or tactic - it's a way of being in relationship that recognizes the wisdom, leadership, and self-determination of frontline communities.

What community engagement challenges are you facing, and how can I support you in building more authentic relationships?"""

    async def _provide_equity_advocacy_guidance(self, message: str, context: AgentContext) -> str:
        """Provide equity advocacy strategies and guidance"""
        return """⚖️ **Advocating for Equity in Climate Policy and Practice**

Effective equity advocacy requires understanding systems of oppression and working strategically to dismantle barriers while building community power. Here's how to advocate for justice:

**🎯 Understanding Systemic Inequity:**

**Root Causes Analysis:**
• Historical redlining and discriminatory housing policies
• Zoning laws that concentrate pollution in communities of color
• Lack of political representation and decision-making power
• Economic disinvestment and limited access to resources
• Environmental racism in facility siting and enforcement

**Current Manifestations:**
• Disproportionate exposure to air pollution and toxic chemicals
• Limited access to clean energy and energy efficiency programs
• Exclusion from green jobs and economic opportunities
• Inadequate representation in environmental decision-making
• Climate impacts that worsen existing health and economic disparities

**🏛️ Policy Advocacy Strategies:**

**Legislative Advocacy:**
```
Effective Policy Advocacy:
1. Research: Understand current policies and their impacts
2. Coalition: Build diverse coalitions with affected communities
3. Narrative: Develop compelling stories that center community voices
4. Strategy: Identify decision-makers and influence points
5. Action: Coordinate advocacy campaigns and public pressure
6. Follow-up: Monitor implementation and hold officials accountable
```

**Key Policy Areas:**
• Environmental justice screening tools for permit decisions
• Community benefit agreements for large developments
• Just transition programs for fossil fuel-dependent communities
• Equitable access to clean energy and efficiency programs
• Community ownership models for renewable energy projects

**Regulatory Advocacy:**
• Comment on environmental permits and impact assessments
• Advocate for cumulative impact assessments
• Push for meaningful community engagement requirements
• Support enforcement in overburdened communities
• Advocate for environmental justice considerations in all decisions

**🗣️ Narrative and Communications Strategy:**

**Centering Community Voices:**
• Amplify stories from directly affected community members
• Use community-generated data and research
• Highlight community-led solutions and innovations
• Connect environmental issues to broader justice concerns
• Challenge deficit narratives about frontline communities

**Effective Messaging:**
```
Instead of: "These communities are vulnerable"
Say: "These communities have been systematically targeted"

Instead of: "We need to help these communities"
Say: "We need to support community-led solutions"

Instead of: "Environmental problems affect everyone"
Say: "Environmental harms are not equally distributed"
```

**💪 Building Community Power:**

**Organizing for Systems Change:**
• Support community organizing and leadership development
• Build coalitions that center frontline community leadership
• Develop community capacity for policy analysis and advocacy
• Create pathways for community members to engage in decision-making
• Address immediate needs while working on long-term systemic change

**Economic Justice Strategies:**
• Advocate for community ownership of clean energy projects
• Support local hiring and workforce development programs
• Push for community benefit agreements on large projects
• Advocate for equitable access to green financing and incentives
• Support community-controlled economic development

**🌍 Intersectional Advocacy:**

**Connecting Issues:**
• Link environmental justice to housing, health, and economic justice
• Address immigration status barriers to accessing environmental programs
• Connect climate adaptation to disaster justice and emergency preparedness
• Link environmental health to reproductive justice and children's health
• Address gender-based violence in environmental and climate contexts

**Coalition Building:**
• Build relationships across issue areas and identity groups
• Support leadership development for women, LGBTQ+, and young people
• Address anti-Blackness and other forms of oppression within movements
• Create inclusive spaces that welcome diverse tactics and approaches
• Practice solidarity across different communities and struggles

**📊 Using Data for Advocacy:**

**Community-Controlled Research:**
• Support community-based participatory research
• Use EPA's EJSCREEN and other environmental justice mapping tools
• Collect community health and environmental data
• Document enforcement disparities and permit patterns
• Research economic impacts of environmental policies

**Data Storytelling:**
• Translate complex data into accessible formats
• Use visuals and maps to illustrate environmental injustices
• Connect data to personal stories and community experiences
• Highlight positive examples of equitable solutions
• Use data to hold decision-makers accountable

**🎪 Advocacy Career Pathways:**

**Direct Advocacy Roles:**
• Policy advocate with environmental justice organizations
• Legislative aide or policy analyst for elected officials
• Regulatory advocate working on permit and enforcement issues
• Community organizer building power for policy change
• Communications specialist developing advocacy campaigns

**Supporting Roles:**
• Lawyer providing legal support for advocacy campaigns
• Researcher documenting environmental injustices
• Grant writer securing funding for advocacy organizations
• Coalition coordinator building multi-issue partnerships
• Trainer developing advocacy skills in communities

**🔧 Building Your Advocacy Skills:**

**Essential Skills:**
• Policy analysis and research
• Coalition building and relationship management
• Public speaking and testimony
• Strategic planning and campaign development
• Media relations and communications
• Fundraising and resource development

**Getting Started:**
• Volunteer with local environmental justice organizations
• Attend city council and planning commission meetings
• Join advocacy campaigns on issues you care about
• Take courses in policy analysis and community organizing
• Practice public speaking and writing op-eds

**📋 Advocacy Action Plan:**
1. **Issue Selection**: Choose issues that communities have identified as priorities
2. **Research**: Understand the policy landscape and decision-making process
3. **Coalition Building**: Identify allies and build diverse partnerships
4. **Strategy Development**: Create a theory of change and campaign plan
5. **Implementation**: Execute advocacy tactics while centering community leadership
6. **Evaluation**: Assess outcomes and adjust strategy based on learning

Remember: Effective equity advocacy is not about speaking for communities - it's about supporting community-led advocacy and using your privilege and resources to amplify community voices and demands.

What specific advocacy challenge are you facing, and how can I help you develop a more effective and equitable approach?"""

    async def _provide_organizing_guidance(self, message: str, context: AgentContext) -> str:
        """Provide community organizing guidance and strategies"""
        return """🤝 **Community Organizing for Environmental Justice**

Community organizing builds collective power to create systemic change. Here's how to support and engage in organizing for environmental justice:

**🌟 Organizing Fundamentals:**

**What is Community Organizing?**
• Building collective power among people most affected by problems
• Developing leadership within communities to fight for their own interests
• Creating sustainable organizations that can win concrete improvements
• Challenging systems of oppression through strategic campaigns
• Building community capacity for long-term social change

**Core Organizing Principles:**
```
Power Analysis: Understanding who has power and how decisions are made
Self-Interest: Connecting individual concerns to collective action
Leadership Development: Building skills and confidence in community members
Collective Action: Taking strategic action together to create change
Evaluation: Reflecting on outcomes and adjusting strategy
```

**🏘️ Environmental Justice Organizing:**

**Common Campaign Issues:**
• Stopping polluting facilities from being built in communities
• Demanding cleanup of contaminated sites
• Fighting for equitable access to green space and healthy food
• Advocating for community-controlled renewable energy
• Pushing for just transition programs for fossil fuel workers

**Organizing Cycle:**
```
1. Listening: One-on-one conversations to understand community concerns
2. Research: Investigating root causes and decision-making processes
3. Strategy: Developing a plan to build power and create change
4. Action: Taking collective action to pressure decision-makers
5. Evaluation: Reflecting on outcomes and planning next steps
6. Celebration: Acknowledging victories and building community
```

**🎯 Building Community Power:**

**Leadership Development:**
• Identify and cultivate leaders from within the community
• Provide training in organizing skills, public speaking, and policy analysis
• Create opportunities for community members to practice leadership
• Support leaders in developing their own analysis and vision
• Build diverse leadership that reflects community demographics

**Base Building:**
• Conduct one-on-one conversations to understand community concerns
• Host house parties and community meetings to build relationships
• Organize around immediate, concrete issues that affect daily life
• Connect individual problems to systemic issues and collective solutions
• Build ongoing relationships, not just event-based participation

**🗣️ Popular Education and Consciousness-Raising:**

**Educational Approaches:**
• Use popular education methods that start with community experience
• Connect local environmental issues to broader systems of oppression
• Develop community members' analysis of root causes
• Build understanding of how change happens through collective action
• Create opportunities for peer-to-peer learning and skill sharing

**Consciousness-Raising:**
• Help community members see connections between personal and political
• Build understanding of how environmental racism affects the community
• Develop shared vision for environmental justice and community control
• Challenge internalized oppression and build collective identity
• Connect environmental issues to other justice concerns

**⚡ Campaign Strategy and Tactics:**

**Strategic Planning:**
```
Campaign Planning Framework:
• Problem: What specific issue are we addressing?
• Solution: What concrete change do we want to see?
• Target: Who has the power to make this change?
• Tactics: How will we pressure the target to act?
• Timeline: What are our key milestones and deadlines?
• Resources: What do we need to run this campaign?
```

**Escalation Tactics:**
• Petitions and letter-writing campaigns
• Community forums and public meetings
• Media events and press conferences
• Direct action and civil disobedience
• Electoral organizing and voter engagement
• Legal strategies and litigation

**Coalition Building:**
• Build relationships with other affected communities
• Partner with environmental, health, and social justice organizations
• Engage faith communities and cultural organizations
• Work with labor unions and worker organizations
• Build alliances across racial and class lines

**🌱 Supporting Community Organizing:**

**If You're Not from the Community:**
• Follow the leadership of directly affected community members
• Provide resources and technical assistance when requested
• Use your privilege to open doors and amplify community voices
• Support community-controlled organizations financially
• Advocate within your own networks and institutions

**Skills You Can Offer:**
• Research and policy analysis
• Grant writing and fundraising
• Media relations and communications
• Legal support and advocacy
• Training and facilitation
• Technology and data management

**🎪 Organizing Career Pathways:**

**Community Organizer Roles:**
• Lead organizer with community-based organizations
• Issue-based organizer focusing on environmental justice
• Electoral organizer working on environmental candidates and ballot measures
• Digital organizer using technology for community engagement
• Training coordinator developing organizing skills in communities

**Supporting Roles:**
• Development coordinator raising funds for organizing
• Communications coordinator managing media and messaging
• Research coordinator providing data and policy analysis
• Coalition coordinator building partnerships across organizations
• Program coordinator managing organizing programs and campaigns

**🔧 Building Your Organizing Skills:**

**Essential Organizing Skills:**
• One-on-one conversation and active listening
• Meeting facilitation and group dynamics
• Strategic planning and campaign development
• Public speaking and media interviews
• Conflict resolution and negotiation
• Power analysis and research
• Fundraising and resource development

**Training Opportunities:**
• National Training Institute (NTI) for community organizing
• Midwest Academy training programs
• Local organizing institutes and leadership programs
• Popular education and facilitation training
• Anti-oppression and cultural competency workshops

**📋 Getting Started in Organizing:**
```
Step 1: Find local environmental justice organizations
Step 2: Attend community meetings and events as a listener
Step 3: Volunteer for ongoing campaigns and activities
Step 4: Build relationships with community members and organizers
Step 5: Take on increasing responsibility and leadership
Step 6: Seek formal training and skill development opportunities
```

**🔥 Organizing Success Metrics:**
• Community members develop leadership skills and confidence
• Organizations build sustainable membership and funding
• Campaigns win concrete improvements in community conditions
• Community power and political influence increase over time
• Broader movement for environmental justice is strengthened

Remember: Effective organizing is not about mobilizing people for your agenda - it's about building community power so that people can fight for their own liberation and self-determination.

What organizing challenges are you facing, and how can I support you in building more effective community power?"""

    async def _provide_justice_career_pathways(self, message: str, context: AgentContext) -> str:
        """Provide environmental justice career pathway guidance"""
        return """🌍 **Environmental Justice Career Pathways**

There are many ways to center justice and equity in your climate career. Here are pathways that prioritize community leadership and systemic change:

**🎯 Direct Environmental Justice Roles:**

**Community-Based Organizations:**
• **Community Organizer**: Build power with frontline communities to fight environmental injustices
• **Environmental Health Advocate**: Address pollution and health disparities in overburdened communities
• **Community Engagement Coordinator**: Facilitate authentic partnerships between communities and institutions
• **Popular Educator**: Develop community capacity through education and skill-building
• **Policy Advocate**: Fight for equitable environmental policies at local, state, and federal levels

**Government and Regulatory Roles:**
• **Environmental Justice Coordinator**: Ensure equity considerations in government environmental programs
• **Community Liaison**: Bridge communication between agencies and frontline communities
• **Policy Analyst**: Research and develop policies that address environmental inequities
• **Enforcement Specialist**: Prioritize environmental violations in overburdened communities
• **Grant Program Manager**: Administer funding for community-led environmental projects

**🏛️ Policy and Legal Pathways:**

**Legal Advocacy:**
• **Environmental Justice Lawyer**: Represent communities in environmental litigation
• **Policy Attorney**: Draft and advocate for environmental justice legislation
• **Community Lawyer**: Provide legal support for community organizing campaigns
• **Public Interest Lawyer**: Work on systemic legal challenges to environmental racism
• **Legal Aid Attorney**: Provide direct legal services to low-income communities

**Policy and Research:**
• **Environmental Justice Researcher**: Document environmental inequities and community impacts
• **Policy Researcher**: Analyze the equity implications of environmental policies
• **Community-Based Participatory Researcher**: Support community-controlled research
• **Data Analyst**: Use mapping and data tools to document environmental injustices
• **Policy Advocate**: Lobby for environmental justice policies and funding

**🌱 Community Development and Economic Justice:**

**Economic Development:**
• **Community Development Specialist**: Support community-controlled economic development
• **Green Jobs Coordinator**: Create pathways to environmental careers for frontline communities
• **Cooperative Developer**: Help communities develop worker and energy cooperatives
• **Community Investment Manager**: Direct capital to community-controlled projects
• **Just Transition Coordinator**: Support workers and communities transitioning from fossil fuels

**Community Health:**
• **Environmental Health Specialist**: Address environmental health disparities
• **Community Health Worker**: Provide health education and advocacy in frontline communities
• **Public Health Researcher**: Study environmental health impacts in overburdened communities
• **Health Equity Advocate**: Fight for policies that address environmental health disparities
• **Community Wellness Coordinator**: Develop holistic approaches to community health

**📚 Education and Communications:**

**Education and Training:**
• **Environmental Justice Educator**: Teach about environmental racism and community solutions
• **Popular Education Coordinator**: Develop community education programs
• **Youth Program Coordinator**: Engage young people in environmental justice organizing
• **Training Coordinator**: Build organizing and advocacy skills in communities
• **Curriculum Developer**: Create educational materials on environmental justice

**Communications and Media:**
• **Communications Coordinator**: Develop messaging and media strategy for environmental justice campaigns
• **Community Journalist**: Tell stories from frontline communities
• **Digital Organizer**: Use technology and social media for environmental justice organizing
• **Documentary Filmmaker**: Create media that amplifies community voices
• **Graphic Designer**: Create visual materials for environmental justice campaigns

**🔧 Skills and Qualifications:**

**Essential Skills for Environmental Justice Work:**
• Cultural humility and anti-racism practice
• Community organizing and engagement
• Policy analysis and advocacy
• Popular education and facilitation
• Coalition building and partnership development
• Grant writing and fundraising
• Research and data analysis
• Communications and storytelling

**Educational Pathways:**
• Environmental studies with focus on environmental justice
• Public policy with emphasis on equity and community engagement
• Public health with environmental health concentration
• Urban planning with community development focus
• Law with public interest and civil rights emphasis
• Social work with community organizing concentration

**💪 Building Your Environmental Justice Career:**

**Getting Started:**
• Volunteer with local environmental justice organizations
• Attend community meetings and environmental justice events
• Take courses in environmental justice, community organizing, and anti-racism
• Build relationships with environmental justice practitioners and community leaders
• Participate in environmental justice campaigns and advocacy efforts

**Professional Development:**
• Join professional networks like the Environmental Justice Health Alliance
• Attend conferences like the National Environmental Justice Conference
• Seek mentorship from environmental justice practitioners
• Take training in community organizing, popular education, and cultural competency
• Develop language skills relevant to communities you want to work with

**🌟 Salary and Career Progression:**

**Salary Ranges (vary by location and experience):**
• Entry-level community organizer: $35,000-$45,000
• Mid-level policy advocate: $50,000-$70,000
• Senior program manager: $70,000-$90,000
• Executive director: $80,000-$120,000
• Environmental justice lawyer: $60,000-$150,000

**Career Advancement:**
• Start in direct service or organizing roles
• Develop expertise in specific issue areas or communities
• Take on increasing leadership and management responsibilities
• Build reputation through successful campaigns and policy wins
• Consider advanced education or specialized training

**📋 Environmental Justice Career Action Plan:**
```
1. Self-Assessment: Examine your identity, privilege, and motivations
2. Education: Learn about environmental justice history and current issues
3. Relationship Building: Connect with environmental justice organizations and practitioners
4. Skill Development: Build competencies in organizing, advocacy, and cultural humility
5. Experience: Volunteer and intern with environmental justice organizations
6. Job Search: Target organizations and roles that center community leadership
7. Ongoing Learning: Commit to lifelong learning about justice and equity
```

**🔥 Success in Environmental Justice Careers:**
• Center community leadership and self-determination
• Address root causes of environmental inequity
• Build authentic relationships across difference
• Practice cultural humility and anti-racism
• Support community-controlled solutions
• Measure success by community power and self-determination

Remember: Environmental justice work is not just a career - it's a commitment to justice and liberation that requires ongoing learning, relationship-building, and solidarity with frontline communities.

What specific environmental justice career pathway interests you most, and how can I support you in developing the skills and relationships you need?"""

    async def _provide_general_justice_guidance(self, message: str, context: AgentContext) -> str:
        """Provide general environmental justice guidance"""
        return """🌍 **Welcome to Environmental Justice Work**

¡Hola! I'm Miguel, and I'm here to support you in centering justice and equity in your climate career. Environmental justice is about ensuring that all communities - especially those most impacted by environmental harms - have equal protection and equal access to environmental benefits.

**🌟 My Specializations:**
• **Environmental Justice**: Understanding and addressing environmental racism and inequity
• **Community Engagement**: Building authentic relationships with frontline communities
• **Equity Advocacy**: Fighting for policies and practices that center justice
• **Community Organizing**: Supporting grassroots movements for environmental change
• **Career Pathways**: Connecting your skills to justice-centered climate work

**⚖️ Why Environmental Justice Matters:**

**The Reality of Environmental Inequity:**
• Communities of color are disproportionately exposed to pollution and environmental hazards
• Low-income communities have less access to environmental benefits like parks and clean energy
• Indigenous communities face ongoing threats to traditional lands and resources
• Climate change amplifies existing environmental and social inequalities
• Environmental decisions are often made without meaningful community input

**The Promise of Environmental Justice:**
• All communities deserve clean air, water, and soil
• Frontline communities have the right to lead solutions that affect them
• Environmental benefits should be shared equitably
• Community knowledge and leadership are essential for effective solutions
• Justice and sustainability must go hand in hand

**🤝 How I Can Support You:**

**Learning and Understanding:**
• Environmental justice history and current issues
• How to center equity in climate and environmental work
• Understanding frontline communities and environmental racism
• Connecting environmental issues to broader justice movements

**Relationship Building:**
• Best practices for authentic community engagement
• How to build trust and accountability with frontline communities
• Supporting community-led initiatives and organizations
• Practicing cultural humility and anti-racism

**Career Development:**
• Environmental justice career pathways and opportunities
• Skills needed for justice-centered climate work
• Organizations and networks focused on environmental justice
• How to apply justice principles in any climate role

**🌱 Getting Started in Environmental Justice:**

**Essential First Steps:**
1. **Learn the History**: Understand how environmental racism developed and persists
2. **Listen to Communities**: Attend community meetings and events as a learner
3. **Examine Your Position**: Reflect on your identity, privilege, and motivations
4. **Build Relationships**: Connect with environmental justice organizations and practitioners
5. **Take Action**: Support community-led campaigns and initiatives

**Key Questions for Self-Reflection:**
• What is my relationship to environmental injustice?
• How do my identity and background affect my approach to this work?
• What communities do I want to work with, and why?
• How can I use my privilege and resources to support community leadership?
• What do I need to learn to be an effective ally and accomplice?

**🔥 Environmental Justice Principles to Guide Your Work:**

**Community Leadership:**
• Center the voices and leadership of those most affected
• Support community-defined solutions and priorities
• Follow rather than lead when you're not from the community
• Ensure communities benefit from environmental improvements

**Systemic Analysis:**
• Address root causes, not just symptoms
• Understand how racism, classism, and other oppressions intersect
• Connect environmental issues to broader justice concerns
• Challenge systems that create and maintain environmental inequity

**Cultural Responsiveness:**
• Respect community culture, knowledge, and ways of being
• Practice cultural humility and ongoing learning
• Address language barriers and communication differences
• Understand historical trauma and its ongoing impacts

**📚 Essential Resources:**

**Organizations to Follow:**
• Environmental Justice Health Alliance
• Climate Justice Alliance
• Indigenous Environmental Network
• Deep South Center for Environmental Justice
• National Association for the Advancement of Colored People (NAACP) Environmental and Climate Justice Program

**Books to Read:**
• "Dumping in Dixie" by Robert Bullard
• "The Death of Cancer Alley" by Steve Lerner
• "Environmental Justice in a Moment of Danger" by Julie Sze
• "As Long as Grass Grows" by Dina Gilio-Whitaker

**🎯 Next Steps:**
• What aspect of environmental justice interests you most?
• What communities do you want to learn from and support?
• What skills do you want to develop for justice-centered work?
• How can you start building relationships with environmental justice practitioners?

Remember: Environmental justice work is not about saving communities - it's about supporting communities in their own liberation and self-determination. It requires humility, commitment, and a willingness to challenge systems of oppression.

I'm here to support you in this important work. What questions do you have about environmental justice, and how can I help you get started?"""

    async def _calculate_confidence(self, message: str, intent: str) -> float:
        """Calculate confidence score based on message analysis"""
        base_confidence = 0.8

        # Adjust based on intent specificity
        intent_adjustments = {
            "environmental_justice": 0.05,
            "community_engagement": 0.04,
            "equity_advocacy": 0.03,
            "community_organizing": 0.04,
            "career_pathways": 0.02,
            "general_guidance": -0.05,
        }

        confidence = base_confidence + intent_adjustments.get(intent, 0)

        # Adjust based on justice-related terminology
        justice_terms = ["justice", "equity", "community", "frontline", "organizing", "advocacy"]
        if any(term in message.lower() for term in justice_terms):
            confidence += 0.03

        if len(message) > 100:
            confidence += 0.02

        return min(confidence, 1.0)

    async def _suggest_next_actions(self, intent: str, context: AgentContext) -> List[str]:
        """Suggest next actions based on intent and context"""
        base_actions = [
            "Learn about environmental justice history",
            "Connect with local environmental justice organizations",
            "Practice cultural humility and self-reflection",
        ]

        intent_specific_actions = {
            "environmental_justice": [
                "Read foundational environmental justice texts",
                "Attend environmental justice community meetings",
                "Complete anti-racism and cultural competency training",
            ],
            "community_engagement": [
                "Volunteer with community-based environmental organizations",
                "Practice active listening and relationship-building skills",
                "Learn about the history and culture of communities you want to work with",
            ],
            "equity_advocacy": [
                "Join environmental justice advocacy campaigns",
                "Learn policy analysis and advocacy skills",
                "Build coalitions with frontline community organizations",
            ],
            "community_organizing": [
                "Take community organizing training",
                "Volunteer with grassroots environmental justice campaigns",
                "Practice one-on-one conversations and base-building",
            ],
            "career_pathways": [
                "Research environmental justice organizations and job opportunities",
                "Network with environmental justice practitioners",
                "Develop skills in community engagement and equity analysis",
            ],
        }

        return intent_specific_actions.get(intent, base_actions)


__all__ = ["MiguelAgent"]
