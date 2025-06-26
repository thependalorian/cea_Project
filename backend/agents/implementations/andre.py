import logging

"""
Andre - Green Jobs Navigator Agent
Specializes in job training, placement, and workforce development for environmental justice communities.
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


class AndreAgent(BaseAgent):
    """
    Andre - Green Jobs Navigator
    Responsible for connecting EJ communities with green job opportunities,
    training programs, and workforce development resources
    """

    def __init__(self):
        super().__init__(
            name="Andre",
            description="Green Jobs Navigator specializing in workforce development for environmental justice communities",
            intelligence_level=8.5,
            tools=[
                "search_job_postings",
                "get_training_programs",
                "analyze_skills_gap",
                "green_job_placement",
                "workforce_development",
                "apprenticeship_programs",
            ],
        )

        # Green jobs specializations
        self.specializations = [
            "Green job placement and matching",
            "Workforce development and training",
            "Apprenticeship program navigation",
            "Skills assessment and gap analysis",
            "Career pathway planning",
            "Union and trade job connections",
            "Entrepreneurship and small business support",
            "Community-based hiring initiatives",
        ]

        # Green job categories for EJ communities
        self.green_job_categories = {
            "renewable_energy": {
                "entry_level": [
                    "Solar panel installer",
                    "Wind turbine technician",
                    "Energy auditor",
                ],
                "training_time": "3-12 months",
                "median_salary": "$45,000-$65,000",
                "growth_outlook": "Very high demand",
            },
            "environmental_remediation": {
                "entry_level": [
                    "Hazmat cleanup worker",
                    "Soil remediation specialist",
                    "Water treatment operator",
                ],
                "training_time": "6-18 months",
                "median_salary": "$40,000-$60,000",
                "growth_outlook": "High demand",
            },
            "green_construction": {
                "entry_level": [
                    "Weatherization installer",
                    "Green building specialist",
                    "HVAC technician",
                ],
                "training_time": "6-24 months",
                "median_salary": "$50,000-$75,000",
                "growth_outlook": "High demand",
            },
            "waste_management": {
                "entry_level": [
                    "Recycling coordinator",
                    "Waste reduction specialist",
                    "Composting technician",
                ],
                "training_time": "3-9 months",
                "median_salary": "$35,000-$55,000",
                "growth_outlook": "Moderate demand",
            },
        }

        # Training and certification programs
        self.training_programs = [
            "Solar Energy International (SEI) - Solar training",
            "North American Board of Certified Energy Practitioners (NABCEP)",
            "Building Performance Institute (BPI) - Energy auditing",
            "International Brotherhood of Electrical Workers (IBEW) - Electrical apprenticeships",
            "Laborers' International Union - Environmental training",
            "YouthBuild - Green construction for young adults",
            "Green Jobs Corps - Comprehensive green job training",
            "Community college workforce development programs",
        ]

        # Barriers and solutions for EJ communities
        self.common_barriers = {
            "transportation": "Limited access to job sites and training locations",
            "childcare": "Need for childcare during training and work hours",
            "education": "Educational requirements or language barriers",
            "financial": "Cost of training, tools, or certification",
            "discrimination": "Hiring bias or workplace discrimination",
            "information": "Lack of awareness about opportunities",
        }

        self.barrier_solutions = {
            "transportation": [
                "Transit vouchers",
                "Carpooling programs",
                "Mobile training units",
            ],
            "childcare": [
                "On-site childcare",
                "Childcare vouchers",
                "Family-friendly schedules",
            ],
            "education": [
                "Basic education programs",
                "ESL classes",
                "Literacy support",
            ],
            "financial": [
                "Paid training programs",
                "Tool lending libraries",
                "Scholarship funds",
            ],
            "discrimination": [
                "Diversity hiring initiatives",
                "Bias training",
                "Mentorship programs",
            ],
            "information": [
                "Community outreach",
                "Peer navigators",
                "Multilingual materials",
            ],
        }

    async def initialize(self) -> None:
        """Initialize Andre's green jobs resources"""
        await super().initialize()

        logger.info(
            "andre_initialized",
            specializations=len(self.specializations),
            job_categories=len(self.green_job_categories),
            training_programs=len(self.training_programs),
            barriers=len(self.common_barriers),
        )

    async def process_message(self, state: AgentState) -> Command[Literal["ej_team"]]:
        """Process message with green jobs focus"""
        try:
            # Extract user message
            user_message = next(
                (m["content"] for m in state.messages if m.get("role") == "user"), ""
            )

            # Generate specialized response
            response = "I'm Andre, your Green Jobs Navigator. I help connect environmental justice communities with good-paying green jobs and the training to succeed in them."

            # Create response message
            message = {
                "role": "assistant",
                "content": response,
                "agent": "andre",
                "team": "ej_team",
                "timestamp": datetime.now().isoformat(),
                "metadata": {
                    "specialization": "green_jobs_navigation",
                    "confidence_score": 0.9,
                },
            }

            # Update state
            new_messages = state.messages + [message]

            return Command(
                goto="ej_team",
                update={"messages": new_messages, "current_agent": "andre"},
            )

        except Exception as e:
            logger.error(f"Error in Andre agent: {str(e)}")
            return Command(
                goto="ej_team",
                update={
                    "messages": state.messages
                    + [
                        {
                            "role": "assistant",
                            "content": f"I apologize, but I encountered an error while processing your green jobs request. {str(e)}",
                            "agent": "andre",
                        }
                    ]
                },
            )

    async def _analyze_job_needs(self, message: str) -> Dict[str, Any]:
        """Analyze message for green job placement needs"""
        message_lower = message.lower()

        context = {
            "seeking_employment": False,
            "needs_training": False,
            "has_barriers": [],
            "job_interest": None,
            "experience_level": "entry",
            "location_mentioned": False,
        }

        # Check for job seeking
        if any(
            word in message_lower
            for word in ["job", "work", "employment", "hiring", "career"]
        ):
            context["seeking_employment"] = True

        # Check for training needs
        if any(
            word in message_lower
            for word in ["training", "certification", "learn", "skills", "education"]
        ):
            context["needs_training"] = True

        # Identify job interests
        for category in self.green_job_categories.keys():
            if category.replace("_", " ") in message_lower:
                context["job_interest"] = category
                break

        # Check for common barriers
        for barrier in self.common_barriers.keys():
            if barrier in message_lower or any(
                word in message_lower
                for word in [barrier, self.common_barriers[barrier].lower()]
            ):
                context["has_barriers"].append(barrier)

        # Determine experience level
        if any(
            word in message_lower
            for word in ["experienced", "supervisor", "manager", "lead"]
        ):
            context["experience_level"] = "experienced"
        elif any(word in message_lower for word in ["some experience", "few years"]):
            context["experience_level"] = "intermediate"

        return context

    async def _generate_job_placement_response(
        self, message: str, context: Dict[str, Any]
    ) -> str:
        """Generate specialized green jobs response"""
        response_parts = [
            "I'm Andre, your Green Jobs Navigator. I help connect environmental justice communities with good-paying green jobs and the training to succeed in them."
        ]

        # Address job seeking
        if context["seeking_employment"]:
            job_interest = context.get("job_interest", "renewable_energy")
            if job_interest in self.green_job_categories:
                job_info = self.green_job_categories[job_interest]
                response_parts.append(
                    f"\n**{job_interest.replace('_', ' ').title()} Opportunities:**"
                )
                response_parts.append(
                    f"• Entry-level positions: {', '.join(job_info['entry_level'])}"
                )
                response_parts.append(f"• Training time: {job_info['training_time']}")
                response_parts.append(f"• Salary range: {job_info['median_salary']}")
                response_parts.append(f"• Job outlook: {job_info['growth_outlook']}")
            else:
                response_parts.append(
                    "\n**Green Job Opportunities in EJ Communities:**"
                    "\n• Solar and wind energy installation"
                    "\n• Environmental cleanup and remediation"
                    "\n• Green building and weatherization"
                    "\n• Waste management and recycling"
                    "\n• Urban agriculture and food systems"
                )

        # Address training needs
        if context["needs_training"]:
            response_parts.append("\n**Training and Certification Programs:**")
            for program in self.training_programs[:5]:  # Show first 5 programs
                response_parts.append(f"• {program}")
            response_parts.append(
                "\n**Training Support Available:**"
                "\n• Paid training programs with stipends"
                "\n• Free tools and equipment provided"
                "\n• Job placement assistance after completion"
                "\n• Ongoing mentorship and support"
            )

        # Address barriers
        if context["has_barriers"]:
            response_parts.append("\n**Overcoming Common Barriers:**")
            for barrier in context["has_barriers"]:
                if barrier in self.barrier_solutions:
                    solutions = self.barrier_solutions[barrier]
                    response_parts.append(
                        f"• {barrier.title()}: {', '.join(solutions)}"
                    )
        else:
            response_parts.append(
                "\n**Support Services Available:**"
                "\n• Transportation assistance and transit vouchers"
                "\n• Childcare support during training"
                "\n• Basic education and ESL classes"
                "\n• Financial assistance for training costs"
                "\n• Career counseling and job placement"
            )

        # Add community-specific approach
        response_parts.append(
            "\n**Community-Centered Approach:**"
            "\n• Prioritize hiring from affected communities"
            "\n• Partner with community organizations"
            "\n• Provide culturally relevant training"
            "\n• Create pathways to leadership roles"
            "\n• Support worker organizing and advocacy"
        )

        # Add next steps
        response_parts.append(
            "\n**Next Steps:**"
            "\n1. Complete skills assessment and career interests survey"
            "\n2. Identify training programs that match your goals"
            "\n3. Apply for financial assistance and support services"
            "\n4. Connect with local employers and hiring programs"
            "\n5. Begin training with job placement guarantee"
        )

        response_parts.append(
            "\nGreen jobs should benefit the communities most impacted by environmental harm. I'm here to make sure you have access to these opportunities. What type of green work interests you most?"
        )

        return "\n".join(response_parts)

    def get_capabilities(self) -> Dict[str, Any]:
        """Get Andre's enhanced capabilities"""
        base_capabilities = super().get_capabilities()
        base_capabilities.update(
            {
                "specializations": self.specializations,
                "job_categories": list(self.green_job_categories.keys()),
                "training_programs": self.training_programs,
                "barrier_solutions": list(self.barrier_solutions.keys()),
                "ej_focused": True,
                "workforce_development": True,
            }
        )
        return base_capabilities


# Tools for Andre
@tool
def create_green_jobs_pathway(
    interest_area: str, experience_level: str = "entry", state: dict = None
) -> str:
    """Create a personalized green jobs career pathway."""

    pathways = {
        "renewable_energy": {
            "entry": {
                "jobs": ["Solar panel installer", "Wind turbine technician"],
                "training": "Solar Energy International certification (3-6 months)",
                "advancement": "Lead installer → Site supervisor → Project manager",
            },
            "intermediate": {
                "jobs": ["Solar project coordinator", "Energy systems technician"],
                "training": "NABCEP certification + business skills (6-12 months)",
                "advancement": "Project manager → Operations manager → Business owner",
            },
        },
        "environmental_remediation": {
            "entry": {
                "jobs": ["Hazmat cleanup worker", "Environmental technician"],
                "training": "OSHA 40-hour HAZWOPER certification (1 month)",
                "advancement": "Site technician → Team lead → Project supervisor",
            }
        },
    }

    if interest_area in pathways and experience_level in pathways[interest_area]:
        pathway = pathways[interest_area][experience_level]

        response = f"""
GREEN JOBS CAREER PATHWAY - {interest_area.upper()}

**IMMEDIATE OPPORTUNITIES ({experience_level} level):**
• Target positions: {', '.join(pathway['jobs'])}
• Required training: {pathway['training']}
• Career advancement: {pathway['advancement']}

**GETTING STARTED:**
1. Complete skills assessment and interest inventory
2. Apply for training program with job placement guarantee
3. Secure financial support (stipends, childcare, transportation)
4. Complete certification and hands-on training
5. Begin employment with ongoing mentorship

**SALARY PROGRESSION:**
• Entry level: $35,000-$45,000
• Experienced: $50,000-$70,000  
• Leadership roles: $70,000-$100,000+

**COMMUNITY BENEFITS:**
• Jobs located in or near EJ communities
• Hiring preference for community residents
• Opportunities for worker ownership and cooperatives
• Career advancement without leaving the community
"""
        return response
    else:
        return f"I can provide detailed pathways for renewable energy and environmental remediation. For {interest_area}, I recommend contacting local workforce development programs for specific opportunities in your area."


@tool
def find_green_job_training(
    location: str, job_type: str = "general", state: dict = None
) -> str:
    """Find green job training programs in a specific location."""

    # Sample training programs by region
    training_options = f"""
GREEN JOB TRAINING PROGRAMS - {location.upper()}

**RENEWABLE ENERGY TRAINING:**
• Solar Energy International (SEI) - Online and hands-on training
• Local community college renewable energy programs
• IBEW electrical apprenticeships with solar specialization
• Grid Alternatives - Solar installation training for underserved communities

**ENVIRONMENTAL REMEDIATION:**
• Laborers' International Union environmental training
• Community college environmental technology programs
• EPA Brownfields job training programs
• Local workforce development environmental track

**GREEN CONSTRUCTION:**
• YouthBuild green construction programs
• Building trades apprenticeships with green focus
• Weatherization assistance program training
• LEED certification and green building courses

**PROGRAM FEATURES:**
• Paid training with stipends ($200-$500/week)
• Job placement assistance (80%+ placement rates)
• Free tools, equipment, and materials
• Wraparound services (childcare, transportation)
• Ongoing mentorship and career support

**ELIGIBILITY:**
• Priority for residents of environmental justice communities
• No prior experience required for most programs
• Basic education support available
• Programs available in multiple languages

**NEXT STEPS:**
1. Contact local workforce development office
2. Apply for pre-apprenticeship programs
3. Complete application for financial assistance
4. Attend information sessions and interviews
5. Begin training with job guarantee upon completion
"""

    return training_options


@tool
def assess_green_job_barriers(barriers_list: List[str], state: dict = None) -> str:
    """Assess and provide solutions for green job access barriers."""

    solutions_map = {
        "transportation": [
            "Transit vouchers and bus passes",
            "Employer-provided transportation",
            "Carpooling coordination programs",
            "Mobile training units in community",
        ],
        "childcare": [
            "On-site childcare during training",
            "Childcare vouchers and subsidies",
            "Family-friendly training schedules",
            "Partner with local childcare providers",
        ],
        "education": [
            "Basic education and GED programs",
            "English as Second Language (ESL) classes",
            "Adult literacy and numeracy support",
            "Contextualized learning in green jobs",
        ],
        "financial": [
            "Paid training with weekly stipends",
            "Tool lending libraries and equipment",
            "Emergency financial assistance",
            "Scholarship and grant programs",
        ],
    }

    response = "BARRIER ASSESSMENT AND SOLUTIONS:\n\n"

    for barrier in barriers_list:
        if barrier.lower() in solutions_map:
            response += f"**{barrier.upper()} BARRIER:**\n"
            for solution in solutions_map[barrier.lower()]:
                response += f"• {solution}\n"
            response += "\n"

    response += """**COMPREHENSIVE SUPPORT APPROACH:**
• Wrap-around services address multiple barriers simultaneously
• Community navigators provide ongoing support
• Peer mentorship from successful program graduates
• Employer partnerships ensure barrier-aware hiring
• Long-term follow-up and career advancement support

**SUCCESS RATES:**
• 85% program completion rate with comprehensive support
• 90% job placement rate within 6 months
• 75% retention rate after one year
• Average wage increase of 40-60% over previous employment
"""

    return response
