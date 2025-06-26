import logging

"""
David - Veterans Support Specialist Agent
Specializes in VA benefits, support services, and crisis resources for veterans.
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


class DavidAgent(BaseAgent):
    """
    David - Veterans Support Specialist
    Responsible for VA benefits, support services, and crisis intervention for veterans
    """

    def __init__(self):
        super().__init__(
            name="David",
            description="Veterans Support Specialist focusing on VA benefits and crisis resources",
            intelligence_level=8.5,
            tools=[
                "search_va_benefits",
                "get_crisis_resources",
                "get_training_programs",
                "disability_benefits_guidance",
                "education_benefits_help",
                "healthcare_navigation",
            ],
        )

        # VA benefits specializations
        self.specializations = [
            "VA disability benefits guidance",
            "Education benefits (GI Bill, VR&E)",
            "Healthcare enrollment and navigation",
            "Housing assistance programs",
            "Career counseling and employment services",
            "Crisis intervention and mental health resources",
            "Family support services",
            "Legal assistance referrals",
        ]

        # VA benefit categories
        self.va_benefits = {
            "disability": {
                "description": "Compensation for service-connected disabilities",
                "eligibility": "Service-connected injury or illness",
                "application": "VA Form 21-526EZ",
                "timeline": "125 days average processing",
            },
            "education": {
                "description": "Education and training benefits including GI Bill",
                "eligibility": "90+ days active duty service",
                "application": "VA Form 22-1990",
                "timeline": "30 days average processing",
            },
            "healthcare": {
                "description": "Medical care at VA facilities",
                "eligibility": "Based on service history and income",
                "application": "VA Form 10-10EZ",
                "timeline": "Immediate enrollment possible",
            },
            "vocational_rehab": {
                "description": "VR&E program for career training",
                "eligibility": "Service-connected disability rating",
                "application": "VA Form 28-1900",
                "timeline": "2-3 months processing",
            },
        }

        # Crisis resources
        self.crisis_resources = [
            "Veterans Crisis Line: 988, Press 1",
            "Crisis Chat: VeteransCrisisLine.net",
            "Crisis Text: Text 838255",
            "Vet Centers for readjustment counseling",
            "VA Mental Health Services",
            "Give an Hour - free mental health services",
            "Team Red White & Blue community support",
            "Veterans Community Living Centers",
        ]

        # Employment and training resources
        self.employment_resources = [
            "VA Work-Study Program",
            "VR&E Chapter 31 benefits",
            "USERRA employment protections",
            "Corporate Gray veteran job placement",
            "HireVeterans.com job board",
            "RecruitMilitary career fairs",
            "Veterans Jobs Mission companies",
            "SCORE mentorship for veteran entrepreneurs",
        ]

    async def initialize(self) -> None:
        """Initialize David's support resources database"""
        await super().initialize()

        logger.info(
            "david_initialized",
            specializations=len(self.specializations),
            va_benefits=len(self.va_benefits),
            crisis_resources=len(self.crisis_resources),
            employment_resources=len(self.employment_resources),
        )

    async def process_message(
        self, state: AgentState
    ) -> Command[Literal["veterans_team"]]:
        """Process message with veterans support focus"""
        try:
            # Extract user message
            user_message = next(
                (m["content"] for m in state.messages if m.get("role") == "user"), ""
            )

            # Analyze for support needs and crisis indicators
            support_context = await self._analyze_support_needs(user_message)

            # Check for crisis indicators
            if support_context.get("crisis_indicators"):
                logger.warning("Crisis indicators detected in message")
                support_context["requires_immediate_attention"] = True

            # Generate specialized response
            response = await self._generate_support_response(
                user_message, support_context
            )

            # Create response message
            message = {
                "role": "assistant",
                "content": response,
                "agent": "david",
                "team": "veterans_team",
                "timestamp": datetime.now().isoformat(),
                "metadata": {
                    "support_context": support_context,
                    "specialization": "veterans_support_services",
                    "confidence_score": 0.9,
                    "crisis_assessment": support_context.get(
                        "crisis_indicators", False
                    ),
                },
            }

            # Update state
            new_messages = state.messages + [message]

            return Command(
                goto="veterans_team",
                update={"messages": new_messages, "current_agent": "david"},
            )

        except Exception as e:
            logger.error(f"Error in David agent: {str(e)}")
            return Command(
                goto="veterans_team",
                update={
                    "messages": state.messages
                    + [
                        {
                            "role": "assistant",
                            "content": f"I apologize, but I encountered an error while processing your support request. For immediate crisis support, please call the Veterans Crisis Line at 988, Press 1. {str(e)}",
                            "agent": "david",
                        }
                    ]
                },
            )

    async def _analyze_support_needs(self, message: str) -> Dict[str, Any]:
        """Analyze message for support needs and crisis indicators"""
        message_lower = message.lower()

        context = {
            "needs_va_benefits": False,
            "needs_crisis_support": False,
            "needs_healthcare_help": False,
            "needs_education_benefits": False,
            "needs_employment_help": False,
            "benefit_type": None,
            "crisis_indicators": False,
            "urgency_level": "normal",
        }

        # Check for VA benefits needs
        if any(
            word in message_lower
            for word in ["benefits", "va", "disability", "compensation"]
        ):
            context["needs_va_benefits"] = True

        # Check for specific benefit types
        if any(
            word in message_lower for word in ["disability", "compensation", "rating"]
        ):
            context["benefit_type"] = "disability"
        elif any(
            word in message_lower
            for word in ["gi bill", "education", "school", "training"]
        ):
            context["benefit_type"] = "education"
        elif any(
            word in message_lower
            for word in ["healthcare", "medical", "doctor", "hospital"]
        ):
            context["benefit_type"] = "healthcare"
        elif any(
            word in message_lower
            for word in ["vr&e", "vocational", "rehabilitation", "career"]
        ):
            context["benefit_type"] = "vocational_rehab"

        # Check for crisis indicators (important for veteran support)
        crisis_words = [
            "suicide",
            "kill myself",
            "end it all",
            "can't go on",
            "hopeless",
            "worthless",
        ]
        if any(word in message_lower for word in crisis_words):
            context["crisis_indicators"] = True
            context["urgency_level"] = "crisis"

        # Check for mental health indicators
        mental_health_words = [
            "depressed",
            "anxiety",
            "ptsd",
            "nightmares",
            "flashbacks",
            "struggling",
        ]
        if any(word in message_lower for word in mental_health_words):
            context["needs_crisis_support"] = True
            context["urgency_level"] = "high"

        # Check for employment help
        if any(
            word in message_lower
            for word in ["job", "work", "employment", "career", "hire"]
        ):
            context["needs_employment_help"] = True

        return context

    async def _generate_support_response(
        self, message: str, context: Dict[str, Any]
    ) -> str:
        """Generate specialized veterans support response"""

        # Handle crisis situations first
        if context.get("crisis_indicators"):
            return self._generate_crisis_response()

        response_parts = [
            "I'm David, your Veterans Support Specialist. I'm here to help you navigate VA benefits and connect you with the support services you need."
        ]

        # Address specific support needs
        if context["needs_va_benefits"]:
            benefit_type = context.get("benefit_type")
            if benefit_type and benefit_type in self.va_benefits:
                benefit_info = self.va_benefits[benefit_type]
                response_parts.append(
                    f"\n**{benefit_type.replace('_', ' ').title()} Benefits:**"
                )
                response_parts.append(f"• Description: {benefit_info['description']}")
                response_parts.append(f"• Eligibility: {benefit_info['eligibility']}")
                response_parts.append(f"• Application: {benefit_info['application']}")
                response_parts.append(f"• Processing time: {benefit_info['timeline']}")
            else:
                response_parts.append(
                    "\n**VA Benefits Overview:**"
                    "\n• Disability compensation for service-connected conditions"
                    "\n• Education benefits (GI Bill, VR&E)"
                    "\n• Healthcare enrollment and services"
                    "\n• Housing assistance and home loans"
                    "\n• Career counseling and job placement"
                )

        if context["needs_crisis_support"]:
            response_parts.append(
                "\n**Mental Health and Crisis Resources:**"
                "\n• Veterans Crisis Line: 988, Press 1 (24/7 support)"
                "\n• Crisis Chat: VeteransCrisisLine.net"
                "\n• Crisis Text: Text 838255"
                "\n• Local Vet Center for counseling"
                "\n• VA Mental Health Services"
                "\n• Give an Hour - free mental health services"
            )

        if context["needs_employment_help"]:
            response_parts.append(
                "\n**Employment and Career Resources:**"
                "\n• VR&E Chapter 31 for career training"
                "\n• VA Work-Study programs"
                "\n• Corporate veteran hiring programs"
                "\n• RecruitMilitary career fairs"
                "\n• USERRA employment protections"
                "\n• SCORE mentorship for entrepreneurs"
            )

        # Add application assistance
        response_parts.append(
            "\n**How I Can Help:**"
            "\n• Guide you through benefit applications"
            "\n• Explain eligibility requirements"
            "\n• Connect you with local VA representatives"
            "\n• Provide crisis intervention resources"
            "\n• Help with appeals and claim reviews"
        )

        # Add next steps
        response_parts.append(
            "\n**Next Steps:**"
            "\n1. Identify your specific benefit needs"
            "\n2. Gather required documentation"
            "\n3. Submit applications with my guidance"
            "\n4. Follow up on claim status"
        )

        response_parts.append(
            "\nRemember: You've earned these benefits through your service. I'm here to make sure you receive everything you're entitled to. What specific area would you like help with first?"
        )

        return "\n".join(response_parts)

    def _generate_crisis_response(self) -> str:
        """Generate immediate crisis intervention response"""
        return """🚨 **IMMEDIATE CRISIS SUPPORT AVAILABLE** 🚨

I'm concerned about you and want to make sure you get immediate help:

**CALL NOW - 24/7 Support:**
• Veterans Crisis Line: **988, Press 1**
• Crisis Chat: **VeteransCrisisLine.net** 
• Crisis Text: **Text 838255**

**You are not alone.** Trained counselors who understand military service are standing by right now.

**Local Emergency:**
• Call 911 if you're in immediate danger
• Go to your nearest emergency room
• Call a trusted friend or family member

**Additional Support:**
• Vet Centers provide readjustment counseling
• VA Mental Health Services
• Team Red White & Blue community support

Your life has value. Your service matters. Help is available right now.

After you connect with crisis support, I'm here to help you access ongoing VA benefits and services. But please reach out for immediate help first."""

    def get_capabilities(self) -> Dict[str, Any]:
        """Get David's enhanced capabilities"""
        base_capabilities = super().get_capabilities()
        base_capabilities.update(
            {
                "specializations": self.specializations,
                "va_benefits": list(self.va_benefits.keys()),
                "crisis_resources": self.crisis_resources,
                "employment_resources": self.employment_resources,
                "veteran_focused": True,
                "crisis_intervention": True,
            }
        )
        return base_capabilities


# Tools for David
@tool
def search_va_benefits(query: str, state: dict = None) -> str:
    """Search for specific VA benefits and eligibility information."""
    from langchain_openai import ChatOpenAI

    model = ChatOpenAI(model_name="gpt-3.5-turbo")
    response = model.invoke(
        [
            SystemMessage(
                content="You are David, a VA benefits specialist. Provide accurate, current information about VA benefits, eligibility requirements, and application processes."
            ),
            HumanMessage(
                content=f"Provide detailed information about VA benefits related to: {query}"
            ),
        ]
    )
    return response.content


@tool
def assess_crisis_risk(message: str, state: dict = None) -> str:
    """Assess crisis risk level and provide appropriate resources."""

    # Simple crisis keyword detection
    crisis_keywords = [
        "suicide",
        "kill myself",
        "end it all",
        "can't go on",
        "hopeless",
        "worthless",
    ]
    high_risk_keywords = ["depressed", "anxiety", "ptsd", "struggling", "overwhelmed"]

    message_lower = message.lower()

    if any(word in message_lower for word in crisis_keywords):
        return """CRISIS LEVEL: HIGH - Immediate intervention needed
        
Resources:
• Veterans Crisis Line: 988, Press 1 (CALL NOW)
• Crisis Chat: VeteransCrisisLine.net
• Crisis Text: Text 838255
• Local emergency: 911

This requires immediate professional attention."""

    elif any(word in message_lower for word in high_risk_keywords):
        return """CRISIS LEVEL: MODERATE - Mental health support recommended

Resources:
• Veterans Crisis Line: 988, Press 1
• Local Vet Center for counseling
• VA Mental Health Services
• Give an Hour - free mental health services

Consider reaching out for professional support."""

    else:
        return """CRISIS LEVEL: LOW - General support resources available

Resources:
• VA Mental Health Services for ongoing support
• Vet Centers for readjustment counseling
• Team Red White & Blue for community connection
• Veterans Crisis Line available 24/7 if needed"""


@tool
def get_va_application_help(benefit_type: str, state: dict = None) -> str:
    """Get step-by-step help with VA benefit applications."""

    applications = {
        "disability": {
            "form": "VA Form 21-526EZ",
            "required_docs": ["DD-214", "Medical records", "Service medical records"],
            "steps": [
                "Gather service and medical records",
                "Complete VA Form 21-526EZ online at VA.gov",
                "Submit supporting medical evidence",
                "Attend C&P exam if scheduled",
                "Wait for decision (avg 125 days)",
            ],
        },
        "education": {
            "form": "VA Form 22-1990",
            "required_docs": ["DD-214", "School enrollment info"],
            "steps": [
                "Choose your education benefit (GI Bill chapter)",
                "Apply online at VA.gov",
                "Submit DD-214 and enrollment information",
                "Receive Certificate of Eligibility",
                "Coordinate with school certifying official",
            ],
        },
    }

    if benefit_type.lower() in applications:
        app_info = applications[benefit_type.lower()]

        response = f"**{benefit_type.title()} Benefit Application Guide:**\n\n"
        response += f"**Form Required:** {app_info['form']}\n\n"
        response += "**Required Documents:**\n"
        for doc in app_info["required_docs"]:
            response += f"• {doc}\n"
        response += "\n**Application Steps:**\n"
        for i, step in enumerate(app_info["steps"], 1):
            response += f"{i}. {step}\n"

        return response
    else:
        return f"I can provide application help for disability and education benefits. For {benefit_type} benefits, I recommend contacting your local VA office or visiting VA.gov for specific guidance."
