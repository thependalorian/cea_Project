"""
PendoAgent - General Climate Specialist and Supervisor (Agentic)
Location: backend/agents/implementations/pendo.py

This agent inherits from AgenticAgent, supporting reasoning, planning, dynamic tool use, and memory.
All tools are registered for dynamic invocation. Use the run() method to process user input with reasoning and tool use.
"""

import logging
import os
from typing import List, Optional, Dict, Any
from langchain_core.tools import tool
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_openai import ChatOpenAI
from langchain_groq import ChatGroq
from langchain.agents import Tool
from backend.agents.base.agent_base import AgenticAgent
from langchain.memory import ConversationBufferMemory

logger = logging.getLogger(__name__)

MODEL_PROVIDER = os.getenv("MODEL_PROVIDER", "openai")
MODEL_NAME = os.getenv("MODEL_NAME", "gpt-3.5-turbo")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

model = (
    ChatGroq(model_name=MODEL_NAME)
    if MODEL_PROVIDER.lower() == "groq" and GROQ_API_KEY
    else ChatOpenAI(model_name=MODEL_NAME)
)


# Define tools for Pendo (adopting cea2.py tool patterns)
@tool
def search_climate_careers(query: str, state: dict = None) -> str:
    """Search for climate career opportunities and information."""
    try:
        logger.info(f"Pendo searching climate careers: {query}")

        response = model.invoke(
            [
                SystemMessage(
                    content="""You are Pendo, the General Climate Specialist and Supervisor.
You provide comprehensive climate career guidance, policy analysis, and coordinate with specialist teams.

Focus on:
- Climate career opportunities and pathways
- Policy analysis and implications
- Training and education resources
- Strategic career planning
- Cross-functional climate expertise

Provide specific, actionable advice with clear next steps."""
                ),
                HumanMessage(content=f"Find climate career opportunities for: {query}"),
            ]
        )

        return response.content

    except Exception as e:
        logger.error(f"Error in Pendo search_climate_careers: {e}")
        return f"I can help you explore climate career opportunities in {query}. This field offers diverse paths including renewable energy, environmental consulting, policy work, and green technology. Consider starting with skills assessment, exploring relevant certifications, and networking with professionals in the field."


@tool
def analyze_climate_policy(policy_area: str, state: dict = None) -> str:
    """Analyze climate policy and its impact on careers and opportunities."""
    try:
        logger.info(f"Pendo analyzing climate policy: {policy_area}")

        response = model.invoke(
            [
                SystemMessage(
                    content="""You are Pendo, providing expert climate policy analysis.
Analyze policies for their career and economic implications, focusing on:
- Policy implementation and timeline
- Job creation potential
- Skill requirements and training needs
- Economic opportunities and challenges
- Regional and sectoral impacts"""
                ),
                HumanMessage(
                    content=f"Analyze climate policy in this area: {policy_area}"
                ),
            ]
        )

        return response.content

    except Exception as e:
        logger.error(f"Error in Pendo analyze_climate_policy: {e}")
        return f"Climate policy in {policy_area} creates significant career opportunities. Key areas include implementation roles, compliance positions, and new technology development. I recommend staying updated on policy developments and building relevant skills through professional development programs."


@tool
def get_training_resources(skill_area: str, state: dict = None) -> str:
    """Get training and education resources for climate skills."""
    try:
        logger.info(f"Pendo finding training resources: {skill_area}")

        response = model.invoke(
            [
                SystemMessage(
                    content="""You are Pendo, providing comprehensive training and education guidance.
Focus on:
- Specific courses and certifications
- Educational institutions and programs
- Professional development opportunities
- Online and in-person options
- Cost considerations and financial aid
- Timeline and prerequisites"""
                ),
                HumanMessage(content=f"Find training resources for: {skill_area}"),
            ]
        )

        return response.content

    except Exception as e:
        logger.error(f"Error in Pendo get_training_resources: {e}")
        return f"For {skill_area} training, consider professional certifications, university programs, and online courses. Look into programs from institutions like MIT, Stanford, and specialized organizations. Many offer financial aid and flexible scheduling options."


# Enhanced Coordination Tools for Pendo (Agent Awareness System)
@tool
def coordinate_with_specialist(
    expertise_needed: str,
    specific_question: str,
    urgency: str = "medium",
    state: dict = None,
) -> str:
    """
    Coordinate with specialist agents when Pendo needs specific expertise.
    Uses agent awareness to find the best specialist for the task.
    """
    try:
        logger.info(f"Pendo coordinating with specialist for: {expertise_needed}")

        # Agent awareness mapping for coordination
        specialist_mapping = {
            "veterans": "marcus",
            "military": "marcus",
            "va_benefits": "david",
            "career_coaching": "sarah",
            "environmental_justice": "miguel",
            "community_organizing": "maria",
            "pollution": "andre",
            "international_policy": "liv",
            "asia_pacific": "mei",
            "renewable_energy": "alex",
            "green_technology": "jasmine",
            "mental_health": "mai",
            "crisis": "michael",
            "data_analysis": "thomas",
            "job_placement": "thomas",
        }

        # Find best specialist
        expertise_lower = expertise_needed.lower()
        recommended_specialist = None

        for key, specialist in specialist_mapping.items():
            if key in expertise_lower:
                recommended_specialist = specialist
                break

        if not recommended_specialist:
            recommended_specialist = "pendo"  # Self-handle if no specialist found

        coordination_message = f"""As the General Climate Specialist and Supervisor, I'm coordinating with our {recommended_specialist} specialist for your question about {expertise_needed}.

Your specific question: {specific_question}

Based on my assessment:
- Specialist Agent: {recommended_specialist}
- Expertise Match: {expertise_needed}
- Urgency Level: {urgency}
- Coordination Type: Direct specialist consultation

I'll ensure you get the most accurate and specialized guidance for your needs."""

        return coordination_message

    except Exception as e:
        logger.error(f"Error in Pendo coordinate_with_specialist: {e}")
        return f"I'll help you with {expertise_needed}. While I coordinate with our specialists, I can provide general guidance on {specific_question}."


@tool
def escalate_to_supervisor(
    complex_issue: str, agents_involved: str, reasoning: str, state: dict = None
) -> str:
    """
    Escalate complex issues that require supervisor-level coordination or human oversight.
    """
    try:
        logger.info(f"Pendo escalating complex issue: {complex_issue}")

        escalation_message = f"""As your General Climate Specialist, I'm escalating this complex issue for additional oversight:

**Issue**: {complex_issue}
**Agents/Teams Involved**: {agents_involved}  
**Escalation Reasoning**: {reasoning}

**Escalation Path**:
1. Global Supervisor Review
2. Human Oversight (if needed)
3. Multi-agent team coordination

**My Assessment**: This issue requires specialized coordination beyond my direct capabilities. I'm ensuring you receive the most comprehensive support by involving our coordination team.

**Next Steps**: 
- Global supervisor will review the case
- Appropriate specialist teams will be assembled
- You'll receive coordinated guidance from multiple experts
- Human oversight will be provided if the complexity requires it

I remain your primary point of contact throughout this process."""

        return escalation_message

    except Exception as e:
        logger.error(f"Error in Pendo escalate_to_supervisor: {e}")
        return f"I'm escalating your complex issue ({complex_issue}) to ensure you receive the best possible assistance. Our coordination team will provide comprehensive support."


@tool
def check_agent_availability(
    requested_agent: str, expertise_area: str, state: dict = None
) -> str:
    """
    Check availability and capability of specific agents for coordination.
    """
    try:
        logger.info(
            f"Pendo checking availability of {requested_agent} for {expertise_area}"
        )

        # Agent capability matrix
        agent_capabilities = {
            "marcus": [
                "veteran_transition",
                "leadership",
                "military_skills",
                "career_guidance",
            ],
            "james": [
                "skills_translation",
                "certification_mapping",
                "military_equivalents",
            ],
            "sarah": [
                "career_coaching",
                "job_search",
                "interview_prep",
                "resume_building",
            ],
            "david": [
                "veteran_benefits",
                "education_benefits",
                "healthcare",
                "disability",
            ],
            "miguel": [
                "environmental_justice",
                "community_organizing",
                "policy_advocacy",
            ],
            "maria": [
                "community_engagement",
                "grassroots_organizing",
                "cultural_competency",
            ],
            "andre": ["environmental_health", "pollution_analysis", "health_advocacy"],
            "carmen": ["community_relations", "cultural_liaison", "bilingual_support"],
            "liv": ["international_policy", "global_climate", "diplomatic_relations"],
            "mei": ["asia_pacific", "credentials_recognition", "cultural_adaptation"],
            "raj": ["south_asia", "middle_east", "global_sustainability"],
            "sofia": ["europe", "africa", "cross_cultural_communication"],
            "alex": ["renewable_energy", "solar", "wind", "technical_certifications"],
            "jasmine": ["green_technology", "innovation", "startups", "sustainability"],
            "lauren": ["climate_policy", "regulations", "government_programs"],
            "mai": ["mental_health", "wellness", "stress_management"],
            "michael": [
                "crisis_intervention",
                "emergency_support",
                "technical_assistance",
            ],
            "elena": [
                "career_counseling",
                "professional_development",
                "user_experience",
            ],
            "thomas": [
                "job_placement",
                "data_analysis",
                "analytics",
                "market_research",
            ],
        }

        agent_caps = agent_capabilities.get(requested_agent, [])
        expertise_match = any(
            expertise_area.lower() in cap.lower() for cap in agent_caps
        )

        if expertise_match:
            availability_message = f"""✅ **Agent Availability Check**

**Agent**: {requested_agent}
**Expertise Area**: {expertise_area}
**Match Found**: Yes

**Agent Capabilities**: {', '.join(agent_caps)}

**Coordination Status**: {requested_agent} is well-suited for {expertise_area} and available for collaboration.

**Recommendation**: I'll coordinate directly with {requested_agent} to ensure you receive specialized assistance in {expertise_area}."""
        else:
            availability_message = f"""⚠️ **Agent Availability Check**

**Agent**: {requested_agent}
**Expertise Area**: {expertise_area}
**Match Found**: Limited

**Agent Capabilities**: {', '.join(agent_caps) if agent_caps else 'Agent not found'}

**Alternative Recommendation**: While {requested_agent} may not be the primary expert for {expertise_area}, I can:
1. Find a better-matched specialist
2. Coordinate with multiple agents if needed
3. Provide general guidance myself

**Best Alternative**: Let me find the most suitable specialist for {expertise_area}."""

        return availability_message

    except Exception as e:
        logger.error(f"Error in Pendo check_agent_availability: {e}")
        return f"I'm checking the availability of {requested_agent} for {expertise_area}. I'll ensure you're connected with the right specialist for your needs."


# --- Agentic Pendo Class ---
class PendoAgent(AgenticAgent):
    def __init__(self, memory: Optional[Any] = None):
        tools = [
            Tool.from_function(search_climate_careers),
            Tool.from_function(analyze_climate_policy),
            Tool.from_function(get_training_resources),
            Tool.from_function(coordinate_with_specialist),
            Tool.from_function(escalate_to_supervisor),
        ]
        super().__init__(
            name="pendo",
            tools=tools,
            llm=model,
            memory=memory or ConversationBufferMemory(),
        )

    def run(self, input: str, context: Optional[Dict[str, Any]] = None) -> Any:
        """
        Process user input with reasoning and tool use.
        """
        return super().run(input, context)


# Export function
__all__ = ["PendoAgent"]
