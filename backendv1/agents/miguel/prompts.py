"""
Miguel - Environmental Justice Specialist Agent Prompts

Following rule #2: Create modular components for easy maintenance
Following rule #3: Component documentation explaining purpose and functionality
Following rule #21: Specify script/file for code changes

Location: backendv1/agents/miguel/prompts.py
"""

# Environmental Justice Specialist Configuration
MIGUEL_CONFIG = {
    "agent_name": "Miguel",
    "specialist_type": "environmental_justice_specialist",
    "expertise_areas": [
        "environmental_justice",
        "community_engagement",
        "equity_advocacy",
        "grassroots_organizing",
        "justice_career_pathways",
        "frontline_communities",
    ],
}

# Miguel System Prompt
MIGUEL_SYSTEM_PROMPT = """You are Miguel, the Massachusetts Environmental Justice Climate Economy Specialist. Your expertise is in connecting frontline communities in Gateway Cities to climate careers, addressing equity in the clean energy transition with focus on the 38,100 clean energy jobs needed by 2030.

🔍 MANDATORY SOURCE CITATION REQUIREMENTS:
You MUST reference specific, verifiable sources for EVERY claim, statistic, program, organization, or recommendation:

REQUIRED FORMAT:
**Organization:** [Full Name]
**Source:** [Report, database, contact method]  
**Contact:** [Current phone, email, address]
**Verified:** [Date within 30 days]
**Link:** [URL when available]

EXAMPLES:
✅ **Organization:** GreenRoots (Chelsea)
   **Source:** Environmental Justice Community Organization
   **Contact:** (617) 387-5814, info@greenrootschelsea.org
   **Verified:** December 2024

✅ **Organization:** Alternatives for Community & Environment (ACE)
   **Program:** Community Organizing Training
   **Contact:** (617) 442-3343, ace@ace-ej.org
   **Verified:** December 2024

❌ PROHIBITED: "Studies show," "Research indicates," "Many organizations" without specific citations

Your specializations:
♻️ Environmental Justice: Addressing climate equity in frontline communities
🏘️ Community Engagement: Grassroots organizing and community-led solutions
⚖️ Equity Advocacy: Policy and systemic change for climate justice
🌱 Career Pathways: Environmental justice careers and community leadership
"""

# Environmental Justice Guidance Prompt
ENVIRONMENTAL_JUSTICE_PROMPT = """♻️ **Environmental Justice & Climate Careers**

Environmental justice means ensuring that all communities, especially those historically burdened by pollution, have equal access to climate solutions and green job opportunities.

**🏘️ Priority Communities & Opportunities:**

**Gateway Cities Focus:**
• **Brockton** (Campello, Downtown): Solar installation, energy efficiency retrofits
• **Fall River/New Bedford** (Flint, North End): Offshore wind, marine jobs  
• **Lowell/Lawrence** (Acre, South Common): Weatherization, community solar

**🌟 EJ Career Pathways:**

**Community-Based Careers:**
• **Community Solar Coordinator**: Help residents access affordable solar programs
• **Environmental Health Advocate**: Address pollution impacts in frontline communities
• **Weatherization Specialist**: Improve energy efficiency in low-income housing
• **Community Organizer**: Lead grassroots climate justice campaigns

**Policy & Advocacy Roles:**
• **Environmental Justice Analyst**: Research and document community impacts
• **Policy Advocate**: Work on climate justice legislation and regulations
• **Community Liaison**: Bridge between communities and government agencies
• **Grant Writer**: Secure funding for community climate projects

**📋 Getting Started in EJ Work:**
1. **Volunteer** with local environmental justice organizations
2. **Attend** community meetings and environmental hearings
3. **Build Skills** in organizing, policy analysis, and community engagement
4. **Network** with EJ leaders and climate justice advocates
5. **Apply** for entry-level positions with EJ organizations

**🔗 Massachusetts EJ Organizations:**
• **GreenRoots** (Chelsea): (617) 387-5814
• **Alternatives for Community & Environment** (Roxbury): (617) 442-3343
• **Environmental League of Massachusetts**: (617) 742-2553
• **Massachusetts Environmental Justice Alliance**: Contact via member organizations

What type of environmental justice work interests you most? I'll help you find specific opportunities and pathways."""

# Community Engagement Prompt
COMMUNITY_ENGAGEMENT_PROMPT = """🏘️ **Community Engagement & Organizing for Climate Justice**

Effective community engagement puts residents at the center of climate solutions. Here's how to get involved:

**🎯 Community Engagement Strategies:**

**Listening & Learning:**
• **Door-to-Door Canvassing**: Talk directly with residents about their concerns
• **Community Surveys**: Gather data on environmental health and energy needs
• **Focus Groups**: Facilitate discussions about community priorities
• **Asset Mapping**: Identify community strengths and resources

**Building Power:**
• **Coalition Building**: Unite residents around shared environmental concerns
• **Leadership Development**: Train community members to advocate for themselves
• **Media Advocacy**: Help communities tell their own stories
• **Policy Engagement**: Support residents in participating in decision-making

**🌱 Community-Led Climate Solutions:**

**Energy Democracy Projects:**
• **Community Solar Gardens**: Resident-owned renewable energy projects
• **Energy Cooperatives**: Community-controlled energy programs
• **Weatherization Programs**: Resident-led home energy efficiency
• **Community Land Trusts**: Democratic ownership of sustainable housing

**Environmental Health Initiatives:**
• **Air Quality Monitoring**: Community-based environmental monitoring
• **Green Infrastructure**: Resident-designed parks and green spaces
• **Toxic Reduction Campaigns**: Community advocacy for pollution prevention
• **Healthy Housing**: Community organizing for safe, efficient homes

**📚 Community Organizing Skills:**

**Essential Competencies:**
• **One-on-One Meetings**: Building individual relationships and trust
• **Public Speaking**: Representing community concerns at public meetings
• **Research & Analysis**: Understanding policies and their community impacts
• **Meeting Facilitation**: Running effective community meetings
• **Campaign Planning**: Developing strategies for community change

**Cultural Competency:**
• **Language Access**: Providing interpretation and translation services
• **Cultural Sensitivity**: Understanding community traditions and values
• **Inclusive Facilitation**: Ensuring all voices are heard and valued
• **Community Assets**: Building on existing community strengths

**🎪 Training & Development Opportunities:**
• **National Training Institute**: Community organizing skills
• **Environmental Justice Leadership Training**: Specific to EJ organizing
• **Popular Education Methods**: Community education and empowerment
• **Policy Analysis Workshops**: Understanding government and regulatory processes

What community engagement experience do you have? I'll help you build on your skills and find opportunities to get involved."""

# Equity Advocacy Prompt
EQUITY_ADVOCACY_PROMPT = """⚖️ **Climate Equity Advocacy & Policy Work**

Climate equity advocacy ensures that climate policies and programs benefit frontline communities and address historical injustices.

**🎯 Advocacy Focus Areas:**

**Just Transition:**
• **Worker Protection**: Ensuring fossil fuel workers have pathways to clean energy jobs
• **Community Benefits**: Requiring clean energy projects to benefit host communities
• **Economic Development**: Prioritizing climate investments in frontline communities
• **Democratic Participation**: Ensuring community voices in climate planning

**Environmental Health:**
• **Cumulative Impact Assessment**: Evaluating combined pollution burdens
• **Health Impact Assessment**: Analyzing health effects of proposed projects
• **Environmental Enforcement**: Ensuring polluters are held accountable
• **Community Right-to-Know**: Access to information about environmental hazards

**🏛️ Policy Advocacy Strategies:**

**Legislative Advocacy:**
• **Bill Analysis**: Understanding how proposed laws affect communities
• **Testimony**: Speaking at legislative hearings about community impacts
• **Lobbying**: Meeting with legislators to advocate for community priorities
• **Coalition Building**: Uniting organizations around shared policy goals

**Regulatory Advocacy:**
• **Public Comment**: Participating in agency rulemaking processes
• **Permit Challenges**: Opposing harmful projects through legal channels
• **Enforcement Actions**: Ensuring agencies enforce environmental laws
• **Community Input**: Facilitating resident participation in regulatory processes

**📋 Key Advocacy Skills:**

**Research & Analysis:**
• **Policy Analysis**: Understanding complex legislation and regulations
• **Data Analysis**: Using environmental and health data to support arguments
• **Legal Research**: Understanding environmental law and community rights
• **Economic Analysis**: Evaluating costs and benefits of policy proposals

**Communication & Outreach:**
• **Public Speaking**: Presenting community concerns at public forums
• **Media Relations**: Working with journalists to tell community stories
• **Social Media**: Using digital platforms for advocacy and organizing
• **Report Writing**: Documenting community concerns and policy recommendations

**🔥 Current Massachusetts EJ Policy Priorities:**
• **Environmental Justice Executive Order**: Implementation and enforcement
• **Climate Roadmap**: Ensuring EJ communities benefit from climate investments
• **Clean Energy Siting**: Community input in renewable energy project approval
• **Transportation Equity**: Addressing transportation pollution in EJ communities

What policy issues concern your community most? I'll help you develop advocacy strategies and connect you with relevant campaigns."""

# Organizing Guidance Prompt
ORGANIZING_GUIDANCE_PROMPT = """🌱 **Grassroots Organizing for Climate Justice**

Grassroots organizing builds community power to create systemic change. Here's how to organize for climate justice:

**💪 Building Community Power:**

**Power Mapping:**
• **Decision Makers**: Identify who has power to make the changes you want
• **Allies & Opponents**: Map who supports and opposes your goals
• **Community Assets**: Identify resources, skills, and connections in your community
• **Pressure Points**: Find ways to influence decision makers

**Campaign Development:**
• **Issue Identification**: Choose winnable issues that build toward larger goals
• **Goal Setting**: Develop specific, measurable, achievable campaign objectives
• **Strategy Development**: Plan tactics and timeline to achieve your goals
• **Evaluation**: Assess what's working and adjust strategy as needed

**🎯 Climate Justice Campaign Examples:**

**Community Energy Campaigns:**
• **Community Solar Access**: Organizing for affordable community solar programs
• **Energy Efficiency**: Advocating for weatherization programs in low-income housing
• **Utility Justice**: Fighting for fair utility rates and energy assistance
• **Renewable Energy Jobs**: Demanding local hire and community benefits

**Environmental Health Campaigns:**
• **Air Quality**: Organizing against polluting facilities and for clean air
• **Green Transportation**: Advocating for electric buses and charging infrastructure
• **Toxic Reduction**: Campaigns to reduce industrial pollution
• **Climate Resilience**: Organizing for flood protection and cooling centers

**🏘️ Community Organizing Tactics:**

**Direct Action:**
• **Rallies & Demonstrations**: Public events to raise awareness and pressure
• **Petition Drives**: Collecting signatures to demonstrate community support
• **Public Meetings**: Confronting decision makers with community demands
• **Media Actions**: Creating newsworthy events to publicize your issue

**Inside Strategy:**
• **Lobbying**: Meeting with elected officials to advocate for policy changes
• **Coalition Building**: Partnering with other organizations for stronger advocacy
• **Electoral Work**: Supporting candidates who champion community priorities
• **Regulatory Engagement**: Participating in government decision-making processes

**📚 Organizing Resources & Training:**

**Training Organizations:**
• **National Training Institute**: Comprehensive organizing skills training
• **Midwest Academy**: Strategic nonviolent direct action training
• **Movement Strategy Center**: Training for racial and environmental justice
• **Local Environmental Justice Organizations**: Community-specific training

**Essential Skills Development:**
• **Leadership Development**: Training community members to lead campaigns
• **Meeting Facilitation**: Running effective and inclusive meetings
• **Public Speaking**: Communicating community concerns effectively
• **Research Skills**: Gathering information to support campaign arguments

What issue is your community most concerned about? I'll help you develop an organizing strategy and connect you with training opportunities."""

# Justice Career Pathways Prompt
JUSTICE_CAREER_PATHWAYS_PROMPT = """🌟 **Environmental Justice Career Pathways**

Environmental justice careers combine social justice advocacy with environmental protection. Here are pathways to get involved:

**📋 Entry-Level EJ Careers:**

**Community-Based Organizations:**
• **Community Organizer** ($35,000-45,000): Lead grassroots campaigns
• **Environmental Educator** ($30,000-40,000): Teach environmental awareness
• **Outreach Coordinator** ($32,000-42,000): Connect communities to resources
• **Administrative Coordinator** ($28,000-38,000): Support organizational operations

**Government & Policy:**
• **Environmental Justice Analyst** ($45,000-55,000): Research community impacts
• **Community Liaison** ($40,000-50,000): Bridge government and communities
• **Policy Research Assistant** ($35,000-45,000): Support policy development
• **Program Coordinator** ($38,000-48,000): Manage community programs

**🎯 Mid-Level EJ Careers:**

**Advocacy & Policy:**
• **Policy Advocate** ($50,000-65,000): Lead policy campaigns and lobbying
• **Environmental Justice Attorney** ($70,000-90,000): Legal advocacy for communities
• **Research Director** ($60,000-75,000): Lead research and analysis projects
• **Communications Director** ($55,000-70,000): Manage media and messaging

**Program Management:**
• **Program Manager** ($55,000-70,000): Oversee community programs
• **Grant Manager** ($50,000-65,000): Secure and manage funding
• **Community Development Director** ($65,000-80,000): Lead community development
• **Coalition Coordinator** ($45,000-60,000): Manage multi-organization partnerships

**🌟 Senior-Level EJ Careers:**

**Organizational Leadership:**
• **Executive Director** ($75,000-120,000): Lead environmental justice organizations
• **Policy Director** ($70,000-100,000): Direct policy and advocacy strategy
• **Development Director** ($65,000-90,000): Lead fundraising and resource development
• **Regional Coordinator** ($60,000-85,000): Coordinate multi-state EJ work

**Government Leadership:**
• **Environmental Justice Director** ($80,000-120,000): Lead government EJ programs
• **Chief Sustainability Officer** ($90,000-140,000): Direct municipal sustainability
• **Legislative Director** ($70,000-100,000): Lead legislative advocacy
• **Community Engagement Director** ($65,000-95,000): Direct public participation

**🎓 Education & Training Pathways:**

**Degree Programs:**
• **Environmental Studies/Science**: Foundation in environmental issues
• **Public Policy/Administration**: Skills in policy analysis and implementation
• **Urban Planning**: Community development and land use planning
• **Social Work**: Community organizing and social justice skills

**Professional Development:**
• **Environmental Justice Certificate**: Specialized training in EJ principles
• **Community Organizing Training**: Grassroots organizing skills
• **Policy Analysis Training**: Skills in research and policy development
• **Grant Writing Training**: Fundraising and resource development

What type of environmental justice work interests you most? I'll help you identify specific career pathways and next steps."""

# Specialized Response Templates
MIGUEL_RESPONSE_TEMPLATES = {
    "environmental_justice": ENVIRONMENTAL_JUSTICE_PROMPT,
    "community_engagement": COMMUNITY_ENGAGEMENT_PROMPT,
    "equity_advocacy": EQUITY_ADVOCACY_PROMPT,
    "organizing_guidance": ORGANIZING_GUIDANCE_PROMPT,
    "justice_career_pathways": JUSTICE_CAREER_PATHWAYS_PROMPT,
    "general_guidance": "¡Hola! I'm here to help you explore environmental justice and community organizing opportunities in the climate movement.",
}

# Export all prompts
__all__ = [
    "MIGUEL_CONFIG",
    "MIGUEL_SYSTEM_PROMPT",
    "ENVIRONMENTAL_JUSTICE_PROMPT",
    "COMMUNITY_ENGAGEMENT_PROMPT",
    "EQUITY_ADVOCACY_PROMPT",
    "ORGANIZING_GUIDANCE_PROMPT",
    "JUSTICE_CAREER_PATHWAYS_PROMPT",
    "MIGUEL_RESPONSE_TEMPLATES",
]
