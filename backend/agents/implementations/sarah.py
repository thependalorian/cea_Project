import logging

"""
Sarah - Veterans Career Coach Agent
Specializes in career coaching and resume review for veterans transitioning to climate careers.
"""

from typing import Dict, Any, List
import logging
from datetime import datetime
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_core.tools import tool
from langgraph.types import Command

# from langgraph.prebuilt import InjectedState
from typing import Annotated, Literal

from backend.agents.base.agent_base import BaseAgent, AgentState

logger = logging.getLogger(__name__)


class SarahAgent(BaseAgent):
    """
    Sarah - Veterans Career Coach
    Responsible for career coaching, resume review, and career transition planning
    for veterans entering the climate economy
    """

    def __init__(self):
        super().__init__(
            name="Sarah",
            description="Veterans Career Coach specializing in climate economy transitions and resume optimization",
            intelligence_level=8.5,
            tools=[
                "analyze_resume_for_climate_careers",
                "search_job_postings",
                "get_training_programs",
                "analyze_skills_gap",
                "career_path_planning",
                "interview_preparation",
            ],
        )

        # Career coaching specializations
        self.specializations = [
            "Career transition planning",
            "Resume optimization for climate jobs",
            "Interview preparation and coaching",
            "Skills gap analysis and development",
            "Professional networking strategies",
            "Salary negotiation for veterans",
            "LinkedIn profile optimization",
            "Career pathway mapping",
        ]

        # Climate career paths for veterans
        self.climate_career_paths = {
            "renewable_energy": {
                "entry_level": ["Solar installer", "Wind technician", "Energy auditor"],
                "mid_level": [
                    "Project coordinator",
                    "Operations specialist",
                    "Sales engineer",
                ],
                "senior_level": [
                    "Project manager",
                    "Business development",
                    "Operations manager",
                ],
            },
            "sustainability": {
                "entry_level": [
                    "Sustainability coordinator",
                    "Environmental compliance",
                    "Data analyst",
                ],
                "mid_level": [
                    "Sustainability manager",
                    "Program coordinator",
                    "Consultant",
                ],
                "senior_level": [
                    "Director of sustainability",
                    "Senior consultant",
                    "Program director",
                ],
            },
            "clean_tech": {
                "entry_level": [
                    "Technical support",
                    "Quality assurance",
                    "Field service",
                ],
                "mid_level": ["Product manager", "Technical sales", "Engineering"],
                "senior_level": [
                    "Director of operations",
                    "VP of sales",
                    "Chief technology officer",
                ],
            },
        }

        # Resume optimization tips for veterans
        self.resume_tips = [
            "Translate military acronyms to civilian language",
            "Quantify achievements with specific metrics",
            "Highlight leadership and team management experience",
            "Emphasize problem-solving and adaptability skills",
            "Include relevant certifications and training",
            "Use action verbs that resonate with climate employers",
            "Showcase project management and logistics experience",
            "Demonstrate ability to work in challenging environments",
        ]

    async def initialize(self) -> None:
        """Initialize Sarah's career coaching resources"""
        await super().initialize()

        logger.info(
            "sarah_initialized",
            specializations=len(self.specializations),
            career_paths=len(self.climate_career_paths),
            resume_tips=len(self.resume_tips),
        )

    async def process_message(
        self, state: AgentState
    ) -> Command[Literal["veterans_team"]]:
        """Process message with career coaching focus"""
        try:
            # Extract user message
            user_message = next(
                (m["content"] for m in state.messages if m.get("role") == "user"), ""
            )

            # Analyze for career coaching needs
            coaching_context = await self._analyze_coaching_needs(user_message)

            # Generate specialized response
            response = await self._generate_coaching_response(
                user_message, coaching_context
            )

            # Create response message
            message = {
                "role": "assistant",
                "content": response,
                "agent": "sarah",
                "team": "veterans_team",
                "timestamp": datetime.now().isoformat(),
                "metadata": {
                    "coaching_context": coaching_context,
                    "specialization": "veterans_career_coaching",
                    "confidence_score": 0.9,
                },
            }

            # Update state
            new_messages = state.messages + [message]

            return Command(
                goto="veterans_team",
                update={"messages": new_messages, "current_agent": "sarah"},
            )

        except Exception as e:
            logger.error(f"Error in Sarah agent: {str(e)}")
            return Command(
                goto="veterans_team",
                update={
                    "messages": state.messages
                    + [
                        {
                            "role": "assistant",
                            "content": f"I apologize, but I encountered an error while processing your career coaching request. {str(e)}",
                            "agent": "sarah",
                        }
                    ]
                },
            )

    async def _analyze_coaching_needs(self, message: str) -> Dict[str, Any]:
        """Analyze message for career coaching needs"""
        message_lower = message.lower()

        context = {
            "needs_resume_help": False,
            "needs_interview_prep": False,
            "needs_career_planning": False,
            "needs_skills_assessment": False,
            "needs_job_search": False,
            "career_level": "entry",
            "climate_interest": None,
        }

        # Check for specific coaching needs
        if any(word in message_lower for word in ["resume", "cv", "application"]):
            context["needs_resume_help"] = True

        if any(
            word in message_lower for word in ["interview", "interviewing", "questions"]
        ):
            context["needs_interview_prep"] = True

        if any(
            word in message_lower
            for word in ["career", "transition", "path", "planning"]
        ):
            context["needs_career_planning"] = True

        if any(
            word in message_lower
            for word in ["skills", "gap", "training", "certification"]
        ):
            context["needs_skills_assessment"] = True

        if any(
            word in message_lower for word in ["job", "jobs", "hiring", "opportunities"]
        ):
            context["needs_job_search"] = True

        # Determine career level
        if any(
            word in message_lower for word in ["manager", "director", "senior", "lead"]
        ):
            context["career_level"] = "senior"
        elif any(
            word in message_lower for word in ["coordinator", "specialist", "analyst"]
        ):
            context["career_level"] = "mid"

        # Identify climate interest area
        for area in self.climate_career_paths.keys():
            if area.replace("_", " ") in message_lower:
                context["climate_interest"] = area
                break

        return context

    async def _generate_coaching_response(
        self, message: str, context: Dict[str, Any]
    ) -> str:
        """Generate specialized career coaching response"""
        response_parts = [
            "I'm Sarah, your Veterans Career Coach specializing in climate economy transitions."
        ]

        # Address specific coaching needs
        if context["needs_resume_help"]:
            response_parts.append(
                "\n**Resume Optimization for Climate Careers:**"
                "\nAs a veteran, your resume needs to speak the language of climate employers. Here are key strategies:"
            )
            for tip in self.resume_tips[:4]:  # Show first 4 tips
                response_parts.append(f"• {tip}")
            response_parts.append(
                "• Focus on environmental impact and sustainability mindset"
            )

        if context["needs_interview_prep"]:
            response_parts.append(
                "\n**Interview Preparation Tips:**"
                "\n• Research the company's climate mission and values"
                "\n• Prepare examples of how your military experience applies to climate challenges"
                "\n• Practice explaining complex military projects in civilian terms"
                "\n• Prepare questions about the company's environmental impact"
                "\n• Show enthusiasm for contributing to climate solutions"
            )

        if context["needs_career_planning"]:
            climate_area = context.get("climate_interest", "renewable_energy")
            career_level = context["career_level"]

            if climate_area in self.climate_career_paths:
                paths = self.climate_career_paths[climate_area]
                response_parts.append(
                    f"\n**Career Path in {climate_area.replace('_', ' ').title()}:**"
                )

                if career_level == "entry":
                    response_parts.append("Entry-level opportunities:")
                    for job in paths["entry_level"]:
                        response_parts.append(f"• {job}")

                response_parts.append("Growth opportunities:")
                for job in paths["mid_level"]:
                    response_parts.append(f"• {job}")

        if context["needs_skills_assessment"]:
            response_parts.append(
                "\n**Skills Development Recommendations:**"
                "\n• Complete a climate career skills assessment"
                "\n• Consider certifications in renewable energy or sustainability"
                "\n• Develop knowledge of climate policies and regulations"
                "\n• Learn industry-specific software and tools"
                "\n• Build understanding of environmental compliance"
            )

        if context["needs_job_search"]:
            response_parts.append(
                "\n**Job Search Strategy:**"
                "\n• Target companies with veteran hiring programs"
                "\n• Use veteran job boards and networks"
                "\n• Leverage LinkedIn for climate industry networking"
                "\n• Apply to climate-focused government positions"
                "\n• Consider internships or fellowship programs for career changers"
            )

        # Add next steps
        response_parts.append(
            "\n**Next Steps:**"
            "\n1. Schedule a 1-on-1 career coaching session"
            "\n2. Complete a comprehensive skills assessment"
            "\n3. Develop a 90-day job search action plan"
            "\n4. Connect with other veterans in climate careers"
        )

        response_parts.append(
            "\nI'm here to support your entire transition journey. What specific area would you like to focus on first?"
        )

        return "\n".join(response_parts)

    def get_capabilities(self) -> Dict[str, Any]:
        """Get Sarah's enhanced capabilities"""
        base_capabilities = super().get_capabilities()
        base_capabilities.update(
            {
                "specializations": self.specializations,
                "career_paths": list(self.climate_career_paths.keys()),
                "resume_tips": self.resume_tips,
                "veteran_focused": True,
                "career_coaching": True,
            }
        )
        return base_capabilities


# Tools for Sarah
@tool
def create_veteran_resume_template(climate_focus: str, state: dict = None) -> str:
    """Create a resume template optimized for veterans entering climate careers."""
    template = f"""
VETERAN CLIMATE CAREER RESUME TEMPLATE - {climate_focus.upper()}

[Your Name]
[City, State] | [Phone] | [Email] | [LinkedIn]
Veteran committed to leveraging military experience for climate solutions

PROFESSIONAL SUMMARY
Results-driven veteran with [X] years of military experience in [specialty area]. 
Proven track record in leadership, project management, and operations. 
Seeking to apply strategic thinking and execution skills to advance {climate_focus} initiatives.

KEY QUALIFICATIONS
• Leadership: Led teams of [X] personnel in complex, high-stakes environments
• Project Management: Managed [specific examples] with budgets of $[amount]
• Technical Skills: [Relevant technical skills for climate sector]
• Problem-Solving: Demonstrated ability to solve complex problems under pressure
• Security Clearance: [If applicable] - valuable for government climate contracts

PROFESSIONAL EXPERIENCE
[Military Service Branch] | [Rank] | [Years of Service]
• Quantified achievement relevant to {climate_focus}
• Leadership example with team size and impact
• Technical accomplishment with measurable results
• Budget/resource management example

EDUCATION & CERTIFICATIONS
• [Degree/Military Training]
• [Climate-relevant certifications - LEED, PMP, etc.]
• [Professional development courses]

ADDITIONAL QUALIFICATIONS
• Veteran networks and professional associations
• Volunteer work in environmental/community organizations
• Language skills (if applicable)
"""
    return template


@tool
def analyze_climate_job_market(location: str = "national", state: dict = None) -> str:
    """Analyze the climate job market for veterans in a specific location."""
    from langchain_openai import ChatOpenAI

    model = ChatOpenAI(model_name="gpt-3.5-turbo")
    response = model.invoke(
        [
            SystemMessage(
                content="You are Sarah, a veterans career coach. Analyze the climate job market for veterans, including top employers, salary ranges, and growth opportunities."
            ),
            HumanMessage(
                content=f"Analyze the climate job market for veterans in {location}. Include top employers that hire veterans, typical salary ranges, and fastest-growing opportunities."
            ),
        ]
    )
    return response.content


@tool
def create_interview_prep_guide(job_type: str, state: dict = None) -> str:
    """Create an interview preparation guide for veterans applying to climate jobs."""
    guide = f"""
INTERVIEW PREPARATION GUIDE - {job_type.upper()}

RESEARCH PHASE:
• Company's climate mission and recent initiatives
• Industry trends and challenges in {job_type}
• Recent news about the company's environmental impact
• Leadership team backgrounds and company culture

STORY PREPARATION (STAR Method):
Prepare 3-5 stories that demonstrate:
• Leadership in challenging situations
• Problem-solving under pressure
• Adaptability and learning agility
• Team collaboration and communication
• Quantifiable achievements

COMMON CLIMATE INDUSTRY QUESTIONS:
• "Why are you passionate about climate solutions?"
• "How does your military experience apply to environmental challenges?"
• "Describe a time you had to implement change in a resistant environment"
• "How would you approach [specific climate challenge]?"

QUESTIONS TO ASK THEM:
• "What are the company's biggest climate impact goals for the next 3 years?"
• "How does this role contribute to the company's sustainability mission?"
• "What professional development opportunities exist for veterans?"
• "How does the company measure environmental impact?"

SALARY NEGOTIATION TIPS:
• Research veteran-friendly benefits packages
• Consider total compensation including training opportunities
• Highlight unique value veterans bring to climate work
• Be prepared to discuss long-term career goals
"""
    return guide
