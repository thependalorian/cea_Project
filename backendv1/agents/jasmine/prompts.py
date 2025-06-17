"""
Jasmine - Youth & Early Career Specialist Agent Prompts

Following rule #2: Create modular components for easy maintenance
Following rule #3: Component documentation explaining purpose and functionality
Following rule #21: Specify script/file for code changes

Location: backendv1/agents/jasmine/prompts.py
"""

# Youth & Early Career Specialist Configuration
JASMINE_CONFIG = {
    "agent_name": "Jasmine",
    "specialist_type": "adult_early_career_specialist",
    "expertise_areas": [
        "adult_early_career_guidance",
        "college_student_pathways",
        "internship_programs",
        "entry_level_opportunities",
        "skill_development",
        "career_exploration",
    ],
}

# Jasmine System Prompt
JASMINE_SYSTEM_PROMPT = """You are Jasmine, the Adult Early Career Climate Specialist with expertise in:

🎓 College Student Pathways: Connecting college students (18+) to climate education and career opportunities
💼 Early Career Guidance: Supporting recent graduates and young adults entering climate work
🌱 Internship Programs: Matching young professionals with climate internship opportunities
📚 Skill Development: Identifying essential skills and learning pathways for climate careers

**IMPORTANT RESTRICTION: We only serve adults (18 years and older) due to Massachusetts regulatory requirements.**

Your approach:
- Provide age-appropriate, encouraging guidance for young adults and early career professionals
- Focus on accessible entry points and growth opportunities
- Emphasize learning, exploration, and building foundations
- Connect to relevant programs, scholarships, and opportunities

Always maintain an energetic, supportive, and growth-oriented tone.

🔍 MANDATORY SOURCE CITATION REQUIREMENTS:
You MUST reference specific, verifiable sources for EVERY claim, statistic, program, organization, or recommendation:

REQUIRED FORMAT:
**Organization:** [Full Name]
**Source:** [Report, database, contact method]  
**Contact:** [Current phone, email, address]
**Verified:** [Date within 30 days]
**Link:** [URL when available]

EXAMPLES:
✅ **Organization:** Massachusetts Clean Energy Center
   **Program:** Workforce Development Programs
   **Contact:** (617) 315-9300, info@masscec.com
   **Verified:** December 2024

✅ **Organization:** Environmental Careers Organization
   **Program:** Diversity Program for Environmental Careers
   **Contact:** (617) 426-4375, eco@eco.org
   **Verified:** December 2024

❌ PROHIBITED: "Studies show," "Research indicates," "Many programs" without specific citations
"""

# College Student Climate Pathways Prompt (18+ Only)
STUDENT_CLIMATE_PATHWAYS_PROMPT = """🎓 **College Student Climate Career Pathways (18+ Only)**

Welcome to the exciting world of climate careers! Here's how to get started as a college student:

**🌟 Climate Majors & Academic Pathways:**

**STEM Pathways:**
• **Environmental Engineering**: Clean technology, renewable energy systems
• **Environmental Science**: Climate research, environmental consulting
• **Renewable Energy Engineering**: Solar, wind, and energy storage systems
• **Climate Science**: Climate modeling, impact assessment, policy research

**Business & Policy Pathways:**
• **Environmental Economics**: Carbon markets, climate finance, green investing
• **Public Policy**: Climate policy development, government relations
• **Sustainable Business**: Corporate sustainability, ESG management
• **Communications**: Climate advocacy, environmental journalism

**📚 College Students - Building Your Foundation:**

**Academic Strategy:**
• **Double Major**: Combine technical skills (engineering, science) with policy/business
• **Internships**: Complete 2-3 climate-related internships during college
• **Research**: Participate in faculty climate research projects
• **Study Abroad**: International programs focused on sustainability

**Extracurricular Engagement:**
• **Student Government**: Lead campus sustainability initiatives
• **Climate Organizations**: Join or lead climate action groups
• **Competitions**: Participate in clean energy business plan competitions
• **Conferences**: Attend climate conferences and networking events

**🚀 Essential Skills for Climate Careers:**
• **Technical**: Data analysis, GIS, energy modeling, project management
• **Communication**: Public speaking, writing, advocacy, social media
• **Leadership**: Team management, organizing, coalition building
• **Policy**: Research, analysis, stakeholder engagement

**💡 Immediate Action Steps:**
1. **Explore**: Research 5 climate career areas that interest you
2. **Connect**: Follow climate professionals on LinkedIn and social media
3. **Learn**: Take online courses in climate science and sustainability
4. **Volunteer**: Find local environmental organizations to get involved with
5. **Apply**: Look for summer internships and fellowship programs

What's your current academic level and area of interest? I'll help you create a personalized climate career pathway!"""

# Internship & Fellowship Guidance Prompt
INTERNSHIP_FELLOWSHIP_PROMPT = """💼 **Climate Internships & Fellowship Opportunities**

Internships are your gateway to climate careers! Here's your complete guide:

**🌍 Top Climate Internship Programs:**

**Government & Policy:**
• **EPA Environmental Justice Internships**: Federal climate policy work
• **Department of Energy Fellowships**: Clean energy research and policy
• **State Environmental Agencies**: Local climate planning and implementation
• **Congressional Internships**: Climate policy development and advocacy

**Corporate Sustainability:**
• **Fortune 500 Sustainability Internships**: Microsoft, Google, Apple climate programs
• **Renewable Energy Companies**: Tesla, First Solar, Orsted internship programs
• **Consulting Firms**: McKinsey, Deloitte, BCG sustainability consulting
• **Financial Services**: Goldman Sachs, BlackRock ESG and green finance

**Nonprofit & Research:**
• **Environmental Defense Fund Climate Corps**: MBA-level climate fellowships
• **Natural Resources Defense Council**: Legal and policy internships
• **World Resources Institute**: Research and analysis internships
• **Local Environmental Organizations**: Community-based climate work

**🎯 Internship Search Strategy:**

**Timeline Planning:**
• **Fall Semester**: Research opportunities, prepare applications
• **Winter Break**: Submit applications, practice interviewing
• **Spring Semester**: Interview season, accept offers
• **Summer**: Complete internship, build network

**Application Essentials:**
• **Resume**: Highlight relevant coursework, projects, and volunteer work
• **Cover Letter**: Demonstrate passion for climate work and specific organization
• **Portfolio**: Showcase relevant projects, research, or advocacy work
• **References**: Professors, employers, volunteer coordinators

**📋 Competitive Application Tips:**
• **Research**: Know the organization's climate work and recent initiatives
• **Customize**: Tailor each application to the specific program
• **Network**: Connect with current/former interns on LinkedIn
• **Follow Up**: Send thank you notes after interviews

**💰 Funding & Support:**
• **Paid Internships**: Prioritize programs that provide stipends
• **School Credit**: Arrange academic credit for unpaid internships
• **Scholarship Programs**: Look for internship funding through your school
• **Housing Assistance**: Some programs provide housing or housing stipends

**🌟 Making the Most of Your Internship:**
• **Set Goals**: Define what you want to learn and achieve
• **Network**: Build relationships with colleagues and other interns
• **Document**: Keep track of projects and accomplishments
• **Seek Feedback**: Ask for regular feedback and guidance
• **Convert**: Express interest in full-time opportunities

What type of climate work interests you most? I'll help you identify specific internship opportunities to pursue!"""

# Entry-Level Opportunities Prompt
ENTRY_LEVEL_OPPORTUNITIES_PROMPT = """🚀 **Entry-Level Climate Career Opportunities**

Ready to launch your climate career? Here are the best entry-level pathways:

**🌱 Entry-Level Climate Roles by Sector:**

**Renewable Energy:**
• **Solar Installation Technician** ($35,000-45,000): Hands-on solar panel installation
• **Wind Technician** ($40,000-55,000): Wind turbine maintenance and operations
• **Energy Efficiency Specialist** ($38,000-48,000): Building energy audits and retrofits
• **Project Coordinator** ($42,000-52,000): Support renewable energy project development

**Environmental Consulting:**
• **Environmental Scientist I** ($40,000-50,000): Data collection and environmental monitoring
• **Junior Consultant** ($45,000-55,000): Support environmental impact assessments
• **Field Technician** ($35,000-45,000): Environmental sampling and data collection
• **Research Assistant** ($38,000-48,000): Support environmental research projects

**Corporate Sustainability:**
• **Sustainability Analyst** ($45,000-55,000): Data analysis and reporting on sustainability metrics
• **ESG Coordinator** ($42,000-52,000): Support environmental, social, and governance initiatives
• **Program Assistant** ($38,000-48,000): Support sustainability program implementation
• **Communications Specialist** ($40,000-50,000): Develop sustainability communications

**Government & Policy:**
• **Environmental Specialist** ($40,000-50,000): Support environmental regulatory programs
• **Policy Analyst** ($45,000-55,000): Research and analysis for climate policy development
• **Outreach Coordinator** ($38,000-48,000): Community engagement for environmental programs
• **Program Associate** ($42,000-52,000): Support climate program implementation

**🎯 Entry-Level Job Search Strategy:**

**Target Company Types:**
• **Clean Energy Companies**: Solar, wind, energy storage developers
• **Environmental Consulting**: Engineering firms with environmental divisions
• **Government Agencies**: EPA, state environmental departments, municipalities
• **Nonprofits**: Environmental advocacy and research organizations

**Job Search Tactics:**
• **Indeed/LinkedIn**: Use keywords like "entry level," "associate," "coordinator"
• **Company Websites**: Check careers pages of target organizations
• **Professional Associations**: Environmental careers job boards
• **Networking Events**: Attend local environmental professional meetups

**📋 Application Success Tips:**
• **Tailor Applications**: Customize resume and cover letter for each role
• **Highlight Transferable Skills**: Show how your experience applies to climate work
• **Demonstrate Passion**: Share why you care about climate issues
• **Show Learning Mindset**: Emphasize eagerness to learn and grow

**🌟 Standing Out as an Entry-Level Candidate:**
• **Relevant Experience**: Internships, volunteer work, research projects
• **Skills Development**: Complete relevant online courses or certifications
• **Portfolio**: Create examples of climate-related work or projects
• **Professional Network**: Connect with climate professionals on LinkedIn

**💡 Quick Wins for Job Readiness:**
1. **Complete a Climate Certification**: Climate Change and Health (Yale), Renewable Energy (Duke)
2. **Join Professional Organizations**: Young Professionals in Energy, Women in Sustainability
3. **Attend Industry Events**: Local clean energy meetups, sustainability conferences
4. **Build Your Network**: Connect with 5 climate professionals per week on LinkedIn
5. **Stay Current**: Subscribe to climate industry newsletters and publications

What type of entry-level climate role interests you most? Let me help you create a targeted job search strategy!"""

# Skills Development Prompt
SKILLS_DEVELOPMENT_PROMPT = """📚 **Essential Skills Development for Climate Careers**

Building the right skills early will set you up for climate career success. Here's your roadmap:

**🎯 Core Climate Career Skills:**

**Technical Skills:**
• **Data Analysis**: Excel, Python, R, SQL for environmental data analysis
• **GIS Mapping**: ArcGIS, QGIS for environmental and climate mapping
• **Project Management**: Project planning, budgeting, timeline management
• **Research**: Literature review, data collection, analysis, and presentation

**Communication Skills:**
• **Writing**: Reports, proposals, policy briefs, and communications materials
• **Public Speaking**: Presentations, community meetings, stakeholder engagement
• **Visual Communication**: Infographics, data visualization, social media content
• **Advocacy**: Organizing, campaigning, and coalition building

**🌍 Climate-Specific Knowledge Areas:**
• **Climate Science**: Understanding of climate systems and impacts
• **Renewable Energy**: Solar, wind, energy storage technologies
• **Sustainability**: Life cycle assessment, carbon footprinting, circular economy
• **Policy & Regulation**: Environmental law, climate policy, regulatory frameworks

**📈 Skill Development Pathways:**

**Free Online Learning:**
• **Coursera**: Climate Change and Health (Yale), Renewable Energy (Duke)
• **edX**: Introduction to Climate Change (UBC), Sustainable Energy (TU Delft)
• **FutureLearn**: Climate Change: The Science (University of Exeter)
• **Khan Academy**: Environmental economics, statistics, and data analysis

**Professional Certifications:**
• **LEED Certification**: Green building design and operations
• **Project Management Professional (PMP)**: Project management skills
• **GIS Certification**: Geographic information systems proficiency
• **Sustainability Reporting**: GRI, SASB, TCFD reporting frameworks

**💻 Technical Skills Development:**

**Data Analysis Track:**
• **Excel**: Pivot tables, data analysis, financial modeling
• **Python**: Data analysis libraries (pandas, numpy, matplotlib)
• **R**: Statistical analysis and data visualization
• **SQL**: Database management and query skills

**GIS & Mapping Track:**
• **ArcGIS Online**: Web-based mapping and analysis
• **QGIS**: Open-source GIS software proficiency
• **Google Earth Engine**: Satellite data analysis for environmental monitoring
• **Spatial Analysis**: Environmental modeling and mapping techniques

**🎪 Hands-On Experience Opportunities:**

**Research Projects:**
• **Independent Study**: Design your own climate research project
• **Faculty Research**: Assist professors with climate-related research
• **Thesis Projects**: Focus undergraduate/graduate thesis on climate topics
• **Competition Participation**: Environmental case competitions and challenges

**Volunteer & Community Work:**
• **Local Environmental Groups**: Volunteer with community organizations
• **Citizen Science**: Participate in environmental monitoring projects
• **Climate Advocacy**: Join local climate action and advocacy groups
• **Education & Outreach**: Teach others about climate issues and solutions

**📊 Building Your Portfolio:**
• **Research Papers**: Academic or independent research on climate topics
• **Data Visualizations**: Charts, maps, and infographics about climate issues
• **Project Documentation**: Case studies of climate projects you've worked on
• **Presentation Materials**: Slides from talks or presentations you've given

**🚀 Accelerated Learning Strategies:**
• **Learning Sprints**: Focus intensively on one skill for 2-4 weeks
• **Project-Based Learning**: Apply new skills to real climate challenges
• **Peer Learning**: Study and practice with other climate-interested students
• **Mentorship**: Find mentors who can guide your skill development

**🌟 Skill Development Timeline:**

**Semester 1: Foundation Building**
• Complete 2 online climate courses
• Learn basic Excel and data analysis
• Join one climate-focused student organization
• Attend 3 climate events or webinars

**Semester 2: Specialization**
• Choose a focus area (renewable energy, policy, etc.)
• Complete a relevant certification
• Start a climate-related project or research
• Build professional network (20+ LinkedIn connections)

**Summer: Application**
• Complete a climate internship or intensive program
• Develop a portfolio of work samples
• Present your work at a conference or event
• Plan next year's skill development goals

What's your current skill level and learning style? I'll create a personalized skill development plan for your climate career goals!"""

# Specialized Response Templates
JASMINE_RESPONSE_TEMPLATES = {
    "student_pathways": STUDENT_CLIMATE_PATHWAYS_PROMPT,
    "internship_guidance": INTERNSHIP_FELLOWSHIP_PROMPT,
    "entry_level_opportunities": ENTRY_LEVEL_OPPORTUNITIES_PROMPT,
    "skills_development": SKILLS_DEVELOPMENT_PROMPT,
    "career_exploration": "Let's explore the exciting world of climate careers together! There are so many paths for young adults to make a difference.",
    "general_guidance": "Hey there! I'm excited to help you launch your climate career journey as a young adult. Let's discover the perfect pathway for you!",
}

# Export all prompts
__all__ = [
    "JASMINE_CONFIG",
    "JASMINE_SYSTEM_PROMPT",
    "STUDENT_CLIMATE_PATHWAYS_PROMPT",
    "INTERNSHIP_FELLOWSHIP_PROMPT",
    "ENTRY_LEVEL_OPPORTUNITIES_PROMPT",
    "SKILLS_DEVELOPMENT_PROMPT",
    "JASMINE_RESPONSE_TEMPLATES",
]
