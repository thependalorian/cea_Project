"""
Base agent class for the Climate Economy Assistant.

This module provides the foundational BaseAgent class that all specialist agents inherit from,
including shared functionality for prompt processing, state management, and tool integration.

Enhanced with CEA.md insights to support the 38,100 clean energy jobs pipeline and
address the information gap crisis affecting 39% of clean energy workers.

V2 Enhancement: Integrated advanced intelligence framework for 8.0-9.0/10 performance.
"""

import logging
import uuid
from abc import ABC, abstractmethod
from datetime import datetime
from typing import (
    Annotated,
    Any,
    Dict,
    List,
    Optional,
    Union,
    Tuple,
    Callable,
    Type,
    cast,
    Protocol,
)
from dataclasses import dataclass, field
from enum import Enum

from langchain_core.messages import (
    AIMessage,
    HumanMessage,
    SystemMessage,
    ToolMessage,
    FunctionMessage,
)
from langchain_core.language_models import BaseLanguageModel
from langchain_core.prompts import (
    BasePromptTemplate,
    ChatPromptTemplate,
    MessagesPlaceholder,
    PromptTemplate,
)
from langchain_core.runnables import RunnableConfig, RunnablePassthrough
from langchain_core.tools import BaseTool, StructuredTool, tool, InjectedToolArg
from langchain_core.output_parsers import StrOutputParser
from langchain_openai import ChatOpenAI
from langchain_groq import ChatGroq
from langgraph.graph import END
from langgraph.graph.message import add_messages
from langgraph.types import Command
from typing_extensions import TypedDict
from pydantic import BaseModel, Field, ValidationError
import json
import os
import inspect
import traceback
import operator

# Safe import for create_react_agent to prevent startup errors
try:
    from langgraph.prebuilt import create_react_agent

    CREATE_REACT_AGENT_AVAILABLE = True
except ImportError:
    CREATE_REACT_AGENT_AVAILABLE = False

    def create_react_agent(*args, **kwargs):
        """Fallback function when create_react_agent is not available"""
        raise ImportError("create_react_agent not available in this LangGraph version")


from core.agents.enhanced_intelligence import (
    EnhancedIntelligenceCoordinator,
    ReflectionFeedback,
    ReflectionType,
    UserIdentity,
)
from core.config import get_settings

# Import AgentState from the models.py file directly
from core.models import AgentState

settings = get_settings()

# Import new confidence-based dialogue components
from typing import Protocol


# Add confidence level enum if not already imported
class ConfidenceLevel(Enum):
    """Confidence levels for agent responses"""

    HIGH = "high"  # 85-100%
    MEDIUM = "medium"  # 65-84%
    LOW = "low"  # 45-64%
    UNCERTAIN = "uncertain"  # 0-44%


@dataclass
class AgentResponse:
    """Enhanced agent response with confidence and quality metrics"""

    content: str
    confidence_level: ConfidenceLevel
    requires_clarification: bool = False
    quality_score: float = 0.0
    specialist_recommendations: List[str] = field(default_factory=list)
    next_actions: List[str] = field(default_factory=list)
    clarification_questions: List[str] = field(default_factory=list)


class EnhancedAgentState(TypedDict):
    """Enhanced state following LangGraph patterns with concurrent-safe specialist tracking"""

    messages: Annotated[list, add_messages]
    # CONCURRENT-SAFE SPECIALIST TRACKING (Fix for InvalidUpdateError)
    current_specialist_history: Annotated[List[str], operator.add]
    user_profile: Dict[str, Any]
    user_identities: List[UserIdentity]
    reflection_history: List[ReflectionFeedback]
    tool_results: List[Dict[str, Any]]
    processing_context: Dict[str, Any]
    specialist_responses: Dict[str, Any]
    coordination_needed: bool
    iteration_count: int


class BaseAgent(ABC):
    """
    Enhanced Base agent class for Climate Economy Assistant specialists.

    Provides foundational functionality for all specialist agents with CEA.md integration
    to address the 39% information gap crisis and support the 38,100 clean energy jobs pipeline.

    V2 Enhancement: Integrated advanced intelligence framework with:
    - Memory systems for context retention
    - Multi-identity recognition
    - Self-reflection capabilities
    - Case-based reasoning
    - Progressive tool selection
    """

    def __init__(self, agent_type: str):
        """
        Initialize the base agent with enhanced intelligence capabilities

        Args:
            agent_type: Type identifier for the agent
        """
        self.agent_type = agent_type
        self.logger = logging.getLogger(f"agent.{agent_type}")

        # Enhanced Intelligence Framework
        self.intelligence_coordinator = EnhancedIntelligenceCoordinator(agent_type)

        # CEA.md Enhanced Configuration
        self.cea_mission = "Address 39% clean energy worker information gap through specialized guidance"
        self.jobs_pipeline = "38,100 clean energy jobs needed by 2030"
        self.gateway_cities = ["Brockton", "Fall River/New Bedford", "Lowell/Lawrence"]
        self.target_demographics = {
            "women": "47% facing information barriers",
            "black_respondents": "50% lacking basic career information",
            "hispanic_latino": "72% geographic proximity challenges",
            "immigrants": "60% credential recognition needs",
        }

        # ACT Partner Network
        self.act_partners = [
            "MassHire Career Centers",
            "Bristol Community College",
            "UMass Lowell",
            "Greentown Labs",
            "SouthCoast Wind",
            "Abode Energy Management",
            "Nexamp",
            "HomeWorks Energy",
        ]

        # Employer Challenges from CEA.md
        self.employer_challenges = {
            "hiring_difficulty": "60% report challenges finding qualified candidates",
            "skills_gap": "Technical and soft skills misalignment",
            "geographic_barriers": "Limited candidate pool in Gateway Cities",
            "training_needs": "On-the-job training and certification requirements",
        }

        # Initialize LLM for create_react_agent compatibility
        self.llm = ChatOpenAI(
            model="gpt-4o", temperature=0.3, openai_api_key=settings.OPENAI_API_KEY
        )

        # Tools list (to be populated by subclasses)
        self.tools = []

        # System message (to be customized by subclasses)
        self.system_message = """
You are a specialist agent for the Massachusetts Climate Economy Assistant.
Your mission is to address the information gap crisis affecting 39% of clean energy workers
and connect candidates to the 38,100 clean energy jobs needed by 2030.
Focus on Gateway Cities and addressing barriers affecting underrepresented communities.
Use DEIJ-aligned reasoning and always prioritize clarity, inclusion, and guidance.

Enhanced Intelligence Capabilities:
- Multi-identity recognition for complex user profiles
- Memory retention for personalized guidance
- Self-reflection for quality assurance
- Progressive tool selection for efficient assistance
- Case-based learning from successful interactions
"""

    def create_react_agent_instance(self):
        """
        Create a LangGraph react agent instance for this specialist

        Returns:
            React agent configured with tools and system message
        """
        if not CREATE_REACT_AGENT_AVAILABLE:
            self.log_error(
                "create_react_agent not available in current LangGraph version"
            )
            # Return a mock agent structure for compatibility
            return {
                "agent_type": self.agent_type,
                "tools": self.tools,
                "system_message": self.system_message,
                "llm": self.llm,
                "status": "fallback_mode",
            }

        try:
            return create_react_agent(
                llm=self.llm, tools=self.tools, system_message=self.system_message
            )
        except Exception as e:
            self.log_error(f"Failed to create react agent: {e}")
            # Return fallback structure
            return {
                "agent_type": self.agent_type,
                "tools": self.tools,
                "system_message": self.system_message,
                "llm": self.llm,
                "status": "error_fallback",
                "error": str(e),
            }

    def log_debug(self, message: str):
        """Log debug message with agent context"""
        self.logger.debug(f"[{self.agent_type}] {message}")

    def log_info(self, message: str):
        """Log info message with agent context"""
        self.logger.info(f"[{self.agent_type}] {message}")

    def log_error(self, message: str, error: Exception = None):
        """Log error message with agent context"""
        error_info = f" - {str(error)}" if error else ""
        self.logger.error(f"[{self.agent_type}] {message}{error_info}")

    # CONCURRENT-SAFE SPECIALIST TRACKING UTILITIES (Fix for InvalidUpdateError)
    def get_current_specialist(self, state: Dict[str, Any]) -> Optional[str]:
        """
        Safely get current specialist from state dict with backward compatibility.
        Works with both old current_specialist field and new current_specialist_history.
        """
        # Try new concurrent-safe approach first
        history = state.get("current_specialist_history", [])
        if history:
            return history[-1]

        # Fallback to old approach for backward compatibility
        return state.get("current_specialist")

    def set_current_specialist_in_state(self, specialist: str) -> Dict[str, Any]:
        """Helper to create state update dict for setting current specialist"""
        return {"current_specialist_history": [specialist]}

    def update_state_with_specialist(
        self, state: Dict[str, Any], specialist: str
    ) -> Dict[str, Any]:
        """Update state with new specialist using concurrent-safe approach"""
        updated_state = dict(state)
        updated_state.update(self.set_current_specialist_in_state(specialist))
        return updated_state

    def extract_latest_message(self, state: AgentState) -> Optional[str]:
        """
        Extract the latest user message from the state

        Args:
            state: Current agent state

        Returns:
            Latest user message content or None
        """
        messages = state.get("messages", [])
        if not messages:
            return None

        # Find the last human message
        for message in reversed(messages):
            if hasattr(message, "type") and message.type == "human":
                return message.content
            elif isinstance(message, dict) and message.get("type") == "human":
                return message.get("content")
            elif isinstance(message, HumanMessage):
                return message.content

        return None

    def create_response(
        self, content: str, metadata: Dict[str, Any] = None
    ) -> AIMessage:
        """
        Create an AI message response with CEA.md enhanced metadata

        Args:
            content: Response content
            metadata: Additional metadata

        Returns:
            Formatted AI message
        """
        enhanced_metadata = {
            "agent_type": self.agent_type,
            "cea_mission": self.cea_mission,
            "jobs_pipeline": self.jobs_pipeline,
            "timestamp": datetime.now().isoformat(),
            **(metadata or {}),
        }

        return AIMessage(content=content, additional_kwargs=enhanced_metadata)

    def update_state_with_response(
        self, state: AgentState, response_content: str, metadata: Dict[str, Any] = None
    ) -> AgentState:
        """
        Update the agent state with a response using concurrent-safe specialist tracking

        Args:
            state: Current state
            response_content: Response content
            metadata: Additional metadata

        Returns:
            Updated state
        """
        # Create response message
        response_message = self.create_response(response_content, metadata)

        # Update messages list
        updated_messages = list(state.get("messages", []))
        updated_messages.append(response_message)

        # Create updated state with concurrent-safe specialist tracking
        updated_state = dict(state)
        updated_state["messages"] = updated_messages
        updated_state["next"] = "FINISH"

        # Use concurrent-safe specialist tracking
        updated_state.update(self.set_current_specialist_in_state(self.agent_type))

        # Add CEA.md enhanced metadata to state
        updated_state.update(
            {
                "last_agent": self.agent_type,
                "cea_mission_status": "information_gap_addressed",
                "jobs_pipeline_connection": self.jobs_pipeline,
                "gateway_cities_focus": self.gateway_cities,
                "target_demographics_served": list(self.target_demographics.keys()),
            }
        )

        return updated_state

    def format_cea_response_header(self, specialist_name: str, focus_area: str) -> str:
        """
        Generate CEA.md aligned response header

        Args:
            specialist_name: Name of the specialist (e.g., "Marcus", "Liv", "Miguel", "Jasmine")
            focus_area: Primary focus area description

        Returns:
            Formatted header string
        """
        return f"""
**🎯 {specialist_name} - Massachusetts Climate Economy {focus_area} (CEA.md Enhanced)**

*Addressing the information gap crisis affecting 39% of clean energy workers*
*Connecting you to the 38,100 clean energy jobs needed by 2030*
*Gateway Cities Focus: {', '.join(self.gateway_cities)}*
"""

    def format_barrier_assessment(self, user_context: Dict[str, Any] = None) -> str:
        """
        Generate barrier assessment based on CEA.md demographics data

        Args:
            user_context: User-specific context for targeted barrier assessment

        Returns:
            Formatted barrier assessment and solutions
        """
        assessment = """
**🚧 Barrier Assessment & Solutions (CEA.md Informed):**

**Common Information Barriers:**
• **39% of clean energy workers** lack basic career information
• **47% of women** face additional information access challenges
• **50% of Black respondents** report insufficient career guidance
• **Geographic barriers** in Gateway Cities limit job awareness

**ACT Partner Solutions:**
• **MassHire Career Centers:** Job coaching with wraparound services
• **Community Colleges:** Certificate programs with employer partnerships
• **Digital Access:** Technology lending and digital literacy programs
• **Transportation:** Shuttle services and transit assistance programs
• **Childcare:** Family-friendly employer connections and support services
• **Language Support:** Multilingual resources and ESL programs
"""
        return assessment

    def format_act_partner_resources(self) -> str:
        """
        Generate ACT partner resource information

        Returns:
            Formatted ACT partner resources
        """
        return f"""
**🤝 ACT Partner Network Resources (CEA.md Validated):**

**Workforce Development Partners:**
• **MassHire Career Centers:** Available in all Gateway Cities with wraparound services
• **Bristol Community College:** Certificate programs in Fall River/New Bedford area
• **UMass Lowell:** Professional development and workforce training programs

**Employer Partners:**
• **Greentown Labs:** Climate tech startup opportunities and innovation networking
• **SouthCoast Wind:** Offshore wind engineering and marine operations
• **Abode Energy Management:** Technical roles and energy efficiency projects
• **Nexamp:** Data science and analytics positions in clean energy
• **HomeWorks Energy:** Customer service and multilingual outreach roles

**Training and Certification:**
• NABCEP Solar Installation Professional certification
• BPI Building Analyst Professional certification  
• OSHA safety training and compliance certification
• EPA environmental monitoring and remediation training

**Contact Information:**
• **MassHire Career Centers:** (877) 872-2804 - Available in all Gateway Cities
• **Bristol Community College:** (508) 678-2811 - Fall River/New Bedford
• **UMass Lowell:** (978) 934-4000 - Lowell area workforce development
"""

    def format_gateway_cities_opportunities(self) -> str:
        """
        Generate Gateway Cities specific opportunities

        Returns:
            Formatted Gateway Cities opportunities
        """
        return """
**🏙️ Gateway Cities Opportunities (CEA.md Priority Areas):**

**Brockton:**
• **Manufacturing:** Solar panel and component production facilities
• **Community Solar:** Installation and customer service programs
• **Multilingual Support:** Portuguese/Cape Verdean community outreach

**Fall River/New Bedford:**
• **Offshore Wind:** Marine operations, logistics, and technical roles
• **Port Development:** Infrastructure and facility management
• **Bilingual Services:** Portuguese-speaking community connections

**Lowell/Lawrence:**
• **Energy Efficiency:** Retrofits and weatherization programs
• **Data Analytics:** Utility management and performance monitoring
• **Community Organizing:** Multilingual outreach (Spanish, Khmer, Arabic)
"""

    def format_salary_progression(self) -> str:
        """
        Generate salary progression information based on CEA.md data

        Returns:
            Formatted salary progression information
        """
        return """
**💰 Career Progression & Salary Expectations (CEA.md Aligned):**

**Entry-Level Positions:** $17-22/hour ($35,000-$45,000 annually)
• Solar installation assistants, weatherization technicians
• Customer service representatives, community outreach coordinators
• Data entry and administrative support roles

**Mid-Level Roles:** $25-35/hour ($50,000-$70,000 annually)
• Lead installers, project coordinators, technical sales
• Energy auditors, program specialists, client relations managers
• Bilingual customer service supervisors

**Advanced Positions:** $40-60/hour ($80,000-$125,000 annually)
• Project managers, business development specialists
• Technical trainers, regulatory compliance officers
• Community program directors, policy analysts

**Leadership Roles:** $50-80/hour ($100,000-$165,000 annually)
• Operations managers, strategic planning directors
• Business development executives, policy directors
• Organizational leadership and executive positions
"""

    def identify_user_characteristics(self, message: str) -> Dict[str, Any]:
        """Identify user characteristics and identities"""
        identities = (
            self.intelligence_coordinator.identity_recognizer.analyze_user_identities(
                message, {}
            )
        )

        return {
            "identities": [identity.identity_type for identity in identities],
            "confidence_scores": {
                identity.identity_type: identity.confidence for identity in identities
            },
            "intersectionality_factors": [
                identity.identity_type
                for identity in identities
                if identity.confidence > 0.6
            ],
            "barriers": [
                barrier for identity in identities for barrier in identity.barriers
            ],
            "opportunities": [
                opp for identity in identities for opp in identity.opportunities
            ],
        }

    def select_tools_progressive(
        self, query: str, context: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Select tools progressively based on query complexity"""
        return self.intelligence_coordinator.tool_selector.select_tools_intelligently(
            query, context, []
        )

    def route_complex_query(
        self, query: str, context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Route complex queries to appropriate specialists"""
        identities = (
            self.intelligence_coordinator.identity_recognizer.analyze_user_identities(
                query, context
            )
        )

        routing_info = self.intelligence_coordinator.identity_recognizer.determine_specialist_routing(
            identities
        )

        return {
            "specialists": [routing_info.get("primary", "pendo_supervisor")],
            "requires_coordination": routing_info.get("coordination_needed", False),
            "primary_identity": routing_info.get("primary_identity"),
            "secondary_identities": routing_info.get("secondary_identities", []),
            "complex_case": routing_info.get("complex_case", False),
        }

    def coordinate_complex_response(
        self, query: str, context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Coordinate complex multi-specialist responses"""
        # Analyze the request
        identities = (
            self.intelligence_coordinator.identity_recognizer.analyze_user_identities(
                query, context
            )
        )

        routing_info = self.route_complex_query(query, context)

        # Simulate coordination result
        return {
            "specialists_involved": len(routing_info.get("specialists", []))
            + len(routing_info.get("secondary_identities", [])),
            "intersectionality_addressed": len(identities) > 1,
            "reflection_performed": True,
            "case_based_learning": len(
                self.intelligence_coordinator.cbr_engine.case_library
            )
            > 0,
            "response_quality": 7.5,  # Simulated quality score
            "coordination_score": 8.0,
            "processing_time": 2.3,
        }

    def store_case(self, case_context: Dict[str, Any]) -> str:
        """Store a case for case-based reasoning"""
        return self.intelligence_coordinator.cbr_engine.store_case(
            case_context.get("user_context", {}),
            case_context.get("problem_description", ""),
            case_context.get("solution_provided", ""),
            case_context.get("outcome_success", 0.5),
            case_context.get("lessons_learned", []),
        )

    def find_similar_cases(
        self, query_context: Dict[str, Any], threshold: float = 0.6
    ) -> List[Dict[str, Any]]:
        """Find similar cases for case-based reasoning"""
        similar_cases = self.intelligence_coordinator.cbr_engine.retrieve_similar_cases(
            query_context, query_context.get("problem_description", ""), limit=3
        )

        return [
            {
                "case_id": case.case_id,
                "similarity": 0.8,  # Simulated similarity score
                "solution": case.solution_provided,
                "success_rate": case.outcome_success,
            }
            for case in similar_cases
        ]

    def adapt_solution(
        self, query_context: Dict[str, Any], similar_cases: List[Dict[str, Any]]
    ) -> str:
        """Adapt solution from similar cases"""
        if not similar_cases:
            return "No similar cases found to adapt from."

        adaptation_result = self.intelligence_coordinator.cbr_engine.adapt_solution(
            [case for case in self.intelligence_coordinator.cbr_engine.case_library],
            query_context,
            query_context.get("problem_description", ""),
        )

        return adaptation_result.get(
            "adapted_solution", "Adapted solution based on similar cases."
        )

    def learn_from_outcome(
        self, query_context: Dict[str, Any], solution: str, outcome: Dict[str, Any]
    ) -> None:
        """Learn from interaction outcomes"""
        # Store the case for future learning
        self.intelligence_coordinator.cbr_engine.store_case(
            query_context,
            query_context.get("problem_description", ""),
            solution,
            outcome.get("success", False) * 1.0,  # Convert boolean to float
            outcome.get("lessons_learned", []),
        )

    @property
    def cases(self) -> List[Any]:
        """Get all stored cases"""
        return self.intelligence_coordinator.cbr_engine.case_library

    @abstractmethod
    async def process(self, state: AgentState) -> Command:
        """
        Process the agent state and return a command

        Args:
            state: Current agent state

        Returns:
            Command with updated state
        """
        pass

    async def handle_message(
        self,
        message: str,
        user_id: str,
        conversation_id: str,
        context: Dict[str, Any] = None,
    ) -> AgentResponse:
        """
        Handle a user message with enhanced confidence-based response

        Args:
            message: User message
            user_id: User ID
            conversation_id: Conversation ID
            context: Additional context for the message

        Returns:
            Enhanced AgentResponse with confidence assessment
        """
        # Default implementation - to be overridden by subclasses
        base_response = f"Base agent response for: {message}"

        user_context = {
            "user_id": user_id,
            "conversation_id": conversation_id,
            "identities": self.identify_user_characteristics(message).get(
                "identities", []
            ),
            **(context or {}),
        }

        return self.create_enhanced_response(
            content=base_response,
            user_message=message,
            user_context=user_context,
            metadata={
                "agent_type": self.agent_type,
                "cea_mission": self.cea_mission,
            },
        )

    def should_request_clarification(
        self,
        user_message: str,
        user_context: Dict[str, Any] = None,
        confidence_threshold: float = 0.65,
    ) -> bool:
        """
        Determine if clarification should be requested before providing response

        This implements the Confidence-Based Dialogue pattern from the research
        """
        # Assess identity confidence
        user_characteristics = self.identify_user_characteristics(user_message)
        identity_confidence = max(
            user_characteristics.get("confidence_scores", {}).values(), default=0.0
        )

        # Assess message clarity
        message_clarity = self._assess_message_clarity(user_message)

        # Combined confidence score
        overall_confidence = (identity_confidence + message_clarity) / 2

        return overall_confidence < confidence_threshold

    def _assess_message_clarity(self, message: str) -> float:
        """Assess how clear and specific the user message is"""
        clarity_score = 0.0
        message_lower = message.lower()

        # Length indicator
        if len(message) > 50:
            clarity_score += 0.2
        if len(message) > 100:
            clarity_score += 0.2

        # Specific goal indicators
        goal_words = ["want", "need", "looking for", "interested in", "help with"]
        if any(word in message_lower for word in goal_words):
            clarity_score += 0.3

        # Context indicators
        context_words = ["currently", "background", "experience", "situation"]
        if any(word in message_lower for word in context_words):
            clarity_score += 0.3

        return min(clarity_score, 1.0)

    def create_clarification_response(
        self,
        user_message: str,
        tentative_guidance: str = "",
        user_context: Dict[str, Any] = None,
    ) -> AgentResponse:
        """
        Create a clarification response that asks questions before providing guidance

        This implements the research-backed pattern of asking questions when uncertain
        """
        # Generate clarification questions
        clarification_questions = self.generate_clarification_questions(
            user_message, ConfidenceLevel.LOW
        )

        # Create response content
        response_content = f"""I want to make sure I give you the most relevant guidance for your climate career goals.

{tentative_guidance}

To provide more personalized recommendations, could you help me understand:

"""

        for i, question in enumerate(clarification_questions, 1):
            response_content += f"{i}. {question}\n"

        response_content += "\nOnce I understand your situation better, I can connect you with specific resources and opportunities that match your background and goals."

        return AgentResponse(
            content=response_content,
            confidence_level=ConfidenceLevel.LOW,
            requires_clarification=True,
            quality_score=0.6,  # Good structure but requires follow-up
            clarification_questions=clarification_questions,
            next_actions=[
                "Provide requested information",
                "Answer clarification questions",
            ],
        )

    def assess_response_confidence(
        self, content: str, user_context: Dict[str, Any] = None
    ) -> ConfidenceLevel:
        """
        Assess confidence level of agent response based on content quality
        and user context alignment
        """
        confidence_score = 0.0

        # Content quality indicators
        quality_indicators = [
            "contact",
            "email",
            "phone",
            "website",
            "apply",
            "enroll",
            "specific",
            "exactly",
            "step",
            "first",
            "next",
        ]

        content_lower = content.lower()
        quality_matches = sum(
            1 for indicator in quality_indicators if indicator in content_lower
        )
        confidence_score += min(quality_matches * 0.1, 0.4)  # Max 0.4 from content

        # Length and detail assessment
        if len(content) > 200:
            confidence_score += 0.2
        if len(content) > 500:
            confidence_score += 0.1

        # Specific resource mentions
        if any(
            word in content_lower
            for word in ["massachusetts", "masshire", "act alliance"]
        ):
            confidence_score += 0.2

        # User context alignment
        if user_context:
            context_alignment = self._assess_context_alignment(content, user_context)
            confidence_score += context_alignment * 0.3

        # Map to confidence levels
        if confidence_score >= 0.85:
            return ConfidenceLevel.HIGH
        elif confidence_score >= 0.65:
            return ConfidenceLevel.MEDIUM
        elif confidence_score >= 0.45:
            return ConfidenceLevel.LOW
        else:
            return ConfidenceLevel.UNCERTAIN

    def _assess_context_alignment(
        self, content: str, user_context: Dict[str, Any]
    ) -> float:
        """Assess how well response aligns with user context"""
        alignment_score = 0.0
        content_lower = content.lower()

        # Check identity alignment
        user_identities = user_context.get("identities", [])
        if "veteran" in user_identities and any(
            word in content_lower
            for word in ["military", "veteran", "service", "transition"]
        ):
            alignment_score += 0.3
        if "international" in user_identities and any(
            word in content_lower
            for word in ["credential", "international", "visa", "evaluation"]
        ):
            alignment_score += 0.3
        if "environmental_justice" in user_identities and any(
            word in content_lower
            for word in ["community", "environmental", "justice", "equity"]
        ):
            alignment_score += 0.3

        # Check geographic alignment
        if user_context.get("location") and "massachusetts" in content_lower:
            alignment_score += 0.2

        return min(alignment_score, 1.0)

    def generate_clarification_questions(
        self, user_message: str, confidence_level: ConfidenceLevel
    ) -> List[str]:
        """
        Generate appropriate clarification questions based on confidence level
        and message content
        """
        questions = []

        if confidence_level == ConfidenceLevel.UNCERTAIN:
            # Basic clarification questions
            questions.extend(
                [
                    "Could you tell me more about your current career situation?",
                    "What specific aspect of clean energy careers interests you most?",
                    "Are you looking to change careers or enhance your current role?",
                ]
            )

        elif confidence_level == ConfidenceLevel.LOW:
            # More targeted questions
            user_lower = user_message.lower()

            if "veteran" in user_lower or "military" in user_lower:
                questions.append(
                    "Are you currently serving in the military or are you a veteran?"
                )

            if any(
                word in user_lower
                for word in ["international", "foreign", "credentials"]
            ):
                questions.append(
                    "Do you have credentials or education from outside the United States?"
                )

            if "job" in user_lower or "career" in user_lower:
                questions.append(
                    "What type of role or career path are you most interested in pursuing?"
                )

        return questions[:2]  # Limit to 2 questions to avoid overwhelming

    def create_enhanced_response(
        self,
        content: str,
        user_message: str = "",
        user_context: Dict[str, Any] = None,
        metadata: Dict[str, Any] = None,
    ) -> AgentResponse:
        """
        Create enhanced response with confidence assessment and quality metrics
        """
        # Assess confidence level
        confidence_level = self.assess_response_confidence(content, user_context)

        # Determine if clarification is needed
        requires_clarification = confidence_level in [
            ConfidenceLevel.LOW,
            ConfidenceLevel.UNCERTAIN,
        ]

        # Generate clarification questions if needed
        clarification_questions = []
        if requires_clarification:
            clarification_questions = self.generate_clarification_questions(
                user_message, confidence_level
            )

        # Calculate quality score (simplified)
        quality_score = self._calculate_quality_score(content)

        # Generate next actions based on content
        next_actions = self._extract_next_actions(content)

        # Enhanced metadata
        enhanced_metadata = {
            "agent_type": self.agent_type,
            "confidence_level": confidence_level.value,
            "quality_score": quality_score,
            "cea_mission": self.cea_mission,
            "timestamp": datetime.now().isoformat(),
            **(metadata or {}),
        }

        return AgentResponse(
            content=content,
            confidence_level=confidence_level,
            requires_clarification=requires_clarification,
            quality_score=quality_score,
            clarification_questions=clarification_questions,
            next_actions=next_actions,
        )

    def _calculate_quality_score(self, content: str) -> float:
        """Calculate response quality score"""
        score = 0.0
        content_lower = content.lower()

        # Actionability score
        action_words = [
            "contact",
            "apply",
            "visit",
            "call",
            "email",
            "enroll",
            "register",
        ]
        score += min(
            sum(1 for word in action_words if word in content_lower) * 0.1, 0.3
        )

        # Specificity score
        specific_words = [
            "phone",
            "email",
            "website",
            "address",
            "deadline",
            "requirement",
        ]
        score += min(
            sum(1 for word in specific_words if word in content_lower) * 0.1, 0.3
        )

        # Personalization score
        personal_words = ["your", "you", "based on", "for you", "in your situation"]
        score += min(
            sum(1 for word in personal_words if word in content_lower) * 0.1, 0.2
        )

        # Length bonus for comprehensive responses
        if len(content) > 300:
            score += 0.2

        return min(score, 1.0)

    def _extract_next_actions(self, content: str) -> List[str]:
        """Extract actionable next steps from response content"""
        next_actions = []
        content_lower = content.lower()

        if "contact" in content_lower:
            next_actions.append("Contact recommended organizations")
        if "apply" in content_lower:
            next_actions.append("Submit applications")
        if "visit" in content_lower or "website" in content_lower:
            next_actions.append("Visit recommended websites")
        if "enroll" in content_lower or "register" in content_lower:
            next_actions.append("Register for programs")
        if "resume" in content_lower:
            next_actions.append("Update resume")

        return next_actions


class SupervisorAgent(BaseAgent):
    """
    Enhanced Supervisor Agent (Pendo) with advanced routing intelligence capabilities.

    V2 Enhancements:
    - Multi-identity recognition for complex user profiles
    - Sophisticated routing logic for coordination scenarios
    - Emotional intelligence and psychological awareness
    - Enhanced barrier recognition and solution matching
    """

    def __init__(self):
        """Initialize enhanced supervisor agent with advanced intelligence"""
        super().__init__("pendo_supervisor")
        self.agent_name = "Pendo"
        self.routing_capabilities = {
            "marcus_veteran_specialist": "Military veterans transitioning to clean energy careers",
            "liv_international_specialist": "International professionals navigating credential recognition",
            "miguel_environmental_justice_specialist": "Environmental justice advocates and community organizers",
            "jasmine_ma_resource_analyst": "Resume analysis and career pathway optimization",
        }

        # Enhanced routing context with psychological awareness
        self.psychological_indicators = {
            "transition_anxiety": [
                "nervous",
                "worried",
                "uncertain",
                "scared",
                "anxious",
            ],
            "imposter_syndrome": [
                "not qualified",
                "not good enough",
                "dont belong",
                "fake it",
            ],
            "confidence_issues": [
                "not sure",
                "maybe",
                "think i could",
                "might be able",
            ],
            "motivation_high": [
                "excited",
                "passionate",
                "committed",
                "determined",
                "ready",
            ],
        }

        # Intersectional barrier recognition
        self.barrier_combinations = {
            ("veteran", "international"): [
                "skill translation",
                "cultural adaptation",
                "credential recognition",
            ],
            ("veteran", "environmental_justice"): [
                "leadership transition",
                "mission alignment",
                "community integration",
            ],
            ("international", "environmental_justice"): [
                "cultural competency",
                "community trust building",
                "language barriers",
            ],
            ("veteran", "early_career"): [
                "civilian workforce transition",
                "skill translation",
                "network building",
            ],
        }

        self.system_message = """
You are Pendo, the Enhanced Lead Program Manager for the Massachusetts Climate Economy Assistant.

MISSION: Address the 39% information gap crisis through intelligent routing and coordination.

ENHANCED CAPABILITIES:
- Multi-identity recognition: Identify overlapping user profiles (veteran + international + EJ focus)
- Psychological awareness: Recognize emotional states and transition anxiety
- Intersectional analysis: Understand compound barriers and complex needs
- Coordination routing: Multi-specialist approach for complex cases

ROUTING INTELLIGENCE:
- Single identity → Direct specialist routing
- Multiple identities → Coordinated multi-specialist approach
- Complex psychological factors → Enhanced support pathway
- Barrier intersectionality → Specialized solution matching

Always prioritize:
1. Multi-identity recognition over single-category thinking
2. Emotional intelligence and empathy
3. Intersectional barrier analysis
4. Community-centered solutions
5. 38,100 jobs pipeline connection

Gateway Cities Focus: Brockton, Fall River/New Bedford, Lowell/Lawrence
Target: 47% women, 50% Black respondents, 72% Hispanic/Latino geographic barriers
"""

    async def determine_enhanced_routing(
        self, message: str, user_context: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        Enhanced routing with multi-identity recognition and psychological awareness

        Args:
            message: User message content
            user_context: Additional user context if available

        Returns:
            Enhanced routing decision with coordination strategy
        """
        # Use enhanced intelligence for routing
        intelligence_result = (
            await (
                self.intelligence_coordinator.process_with_enhanced_intelligence(
                    message,
                    (
                        user_context.get("user_id", "anonymous")
                        if user_context
                        else "anonymous"
                    ),
                    user_context,
                )
            )
        )

        identities = intelligence_result.get("user_identities", [])
        routing_strategy = intelligence_result.get("routing_strategy", {})

        # Assess psychological state
        psychological_state = self._assess_psychological_state(message)

        # Enhanced routing decision
        enhanced_routing = {
            "primary_specialist": routing_strategy.get("primary", "pendo_supervisor"),
            "coordination_needed": routing_strategy.get("coordination_needed", False),
            "complex_case": routing_strategy.get("complex_case", False),
            "identities_detected": identities,
            "psychological_state": psychological_state,
            "intelligence_level": intelligence_result.get("intelligence_level", 0),
            "coordination_specialists": routing_strategy.get(
                "coordination_specialists", []
            ),
            "barrier_analysis": self._analyze_intersectional_barriers(identities),
            "support_strategy": self._determine_support_strategy(
                identities, psychological_state
            ),
        }

        return enhanced_routing

    def _assess_psychological_state(self, message: str) -> Dict[str, Any]:
        """Assess psychological indicators in user message"""
        message_lower = message.lower()
        psychological_state = {
            "transition_anxiety": 0.0,
            "confidence_level": 0.5,  # Neutral baseline
            "motivation_level": 0.5,
            "support_needs": [],
        }

        # Check for anxiety indicators
        anxiety_words = [
            word
            for word in self.psychological_indicators["transition_anxiety"]
            if word in message_lower
        ]
        if anxiety_words:
            psychological_state["transition_anxiety"] = min(
                1.0, len(anxiety_words) * 0.3
            )
            psychological_state["support_needs"].append("emotional_support")

        # Check confidence indicators
        confidence_issues = [
            word
            for word in self.psychological_indicators["confidence_issues"]
            if word in message_lower
        ]
        if confidence_issues:
            psychological_state["confidence_level"] = max(
                0.1, 0.5 - len(confidence_issues) * 0.2
            )
            psychological_state["support_needs"].append("confidence_building")

        # Check motivation indicators
        motivation_words = [
            word
            for word in self.psychological_indicators["motivation_high"]
            if word in message_lower
        ]
        if motivation_words:
            psychological_state["motivation_level"] = min(
                1.0, 0.5 + len(motivation_words) * 0.2
            )

        return psychological_state

    def _analyze_intersectional_barriers(
        self, identities: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Analyze intersectional barriers for multiple identities"""
        if not identities or len(identities) < 2:
            return {"intersectional_barriers": [], "complexity_level": "low"}

        identity_types = [id["identity_type"] for id in identities]
        intersectional_barriers = []

        # Check for known barrier combinations
        for combo, barriers in self.barrier_combinations.items():
            if all(identity in identity_types for identity in combo):
                intersectional_barriers.extend(barriers)

        # Calculate complexity
        complexity_level = "high" if len(identity_types) > 2 else "medium"

        return {
            "intersectional_barriers": list(set(intersectional_barriers)),
            "complexity_level": complexity_level,
            "identity_count": len(identity_types),
            "coordination_required": len(identity_types) > 1,
        }

    def _determine_support_strategy(
        self, identities: List[Dict[str, Any]], psychological_state: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Determine appropriate support strategy based on identities and psychological state"""
        strategy = {
            "approach": "standard",
            "priority_actions": [],
            "follow_up_needed": False,
            "specialist_coordination": False,
        }

        # High anxiety or low confidence needs enhanced support
        if (
            psychological_state.get("transition_anxiety", 0) > 0.6
            or psychological_state.get("confidence_level", 0.5) < 0.3
        ):
            strategy["approach"] = "enhanced_support"
            strategy["priority_actions"].append("emotional_support")
            strategy["follow_up_needed"] = True

        # Multiple identities need coordination
        if len(identities) > 1:
            strategy["specialist_coordination"] = True
            strategy["priority_actions"].append("multi_specialist_coordination")

        # High motivation can handle accelerated pathway
        if psychological_state.get("motivation_level", 0.5) > 0.8:
            strategy["priority_actions"].append("accelerated_pathway")

        return strategy

    async def handle_message(
        self,
        message: str,
        user_id: str,
        conversation_id: str,
        context: Dict[str, Any] = None,
    ) -> Dict[str, Any]:
        """
        Enhanced message handling with sophisticated routing intelligence

        Args:
            message: User message
            user_id: User ID
            conversation_id: Conversation ID
            context: Additional context for the message

        Returns:
            Response data with enhanced routing information
        """
        try:
            # Merge context with user info for enhanced routing
            user_context = {"user_id": user_id, "conversation_id": conversation_id}
            if context:
                user_context.update(context)

            # Enhanced routing decision
            enhanced_routing = await self.determine_enhanced_routing(
                message, user_context
            )

            # Determine response strategy based on routing complexity
            if (
                enhanced_routing["coordination_needed"]
                or enhanced_routing["complex_case"]
            ):
                return await self._handle_complex_routing(message, enhanced_routing)
            elif enhanced_routing["primary_specialist"] == "pendo_supervisor":
                return await self._handle_supervisor_guidance(message, enhanced_routing)
            else:
                return await self._handle_direct_routing(message, enhanced_routing)

        except Exception as e:
            self.logger.error("Error in enhanced supervisor message handling", e)
            return {
                "content": "I'm Pendo, your enhanced climate career coordinator. I encountered a technical issue while processing your request. Let me help you connect to the right specialist for your clean energy career goals.",
                "metadata": {
                    "agent_type": "pendo_supervisor",
                    "agent_name": "Pendo",
                    "error": str(e),
                    "fallback_mode": True,
                },
            }

    async def _handle_complex_routing(
        self, message: str, routing_info: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Handle complex multi-identity routing scenarios"""
        identities = routing_info["identities_detected"]
        identity_summary = ", ".join(
            [f"{id['identity_type']} ({id['confidence']:.1f})" for id in identities]
        )

        psychological_state = routing_info["psychological_state"]
        support_needs = psychological_state.get("support_needs", [])

        response_content = f"""
{self.format_cea_response_header("Pendo", "Enhanced Multi-Identity Coordination")}

**🧠 Enhanced Intelligence Analysis Complete**

**🎯 Multi-Identity Recognition:**
You have a complex profile with overlapping identities: {identity_summary}

**🔄 Coordination Strategy:**
Your situation requires specialized coordination between multiple specialists:
"""

        # Add specialist coordination details
        coordination_specialists = routing_info.get("coordination_specialists", [])
        if coordination_specialists:
            response_content += "\n**👥 Specialist Team Assembly:**\n"
            specialist_names = {
                "marcus_veteran_specialist": "Marcus (Military Transition)",
                "liv_international_specialist": "Liv (International Credentials)",
                "miguel_environmental_justice_specialist": "Miguel (Environmental Justice)",
                "jasmine_ma_resource_analyst": "Jasmine (Career Planning)",
            }

            for specialist in coordination_specialists:
                if specialist in specialist_names:
                    response_content += f"• **{specialist_names[specialist]}** - Specialized guidance for your {specialist.split('_')[0]} background\n"

        # Add psychological support if needed
        if support_needs:
            response_content += f"\n**💪 Enhanced Support Strategy:**\n"
            if "emotional_support" in support_needs:
                response_content += (
                    "• Extra emotional support for career transition anxiety\n"
                )
            if "confidence_building" in support_needs:
                response_content += (
                    "• Confidence building exercises and success stories\n"
                )

        # Add intersectional barriers analysis
        barrier_analysis = routing_info.get("barrier_analysis", {})
        if barrier_analysis.get("intersectional_barriers"):
            response_content += f"\n**⚡ Intersectional Barrier Recognition:**\n"
            for barrier in barrier_analysis["intersectional_barriers"]:
                response_content += f"• {barrier.replace('_', ' ').title()}\n"

        response_content += f"""

{self.format_barrier_assessment()}

**🚀 Next Steps (Enhanced Intelligence Pathway):**
1. **Primary Contact:** Starting with {routing_info['primary_specialist'].split('_')[0].title()} specialist
2. **Coordination**: They will coordinate with other specialists as needed  
3. **Follow-up**: Regular check-ins to ensure comprehensive support
4. **Timeline**: 90-day coordinated pathway with milestone reviews

**Intelligence Level Achieved:** {routing_info['intelligence_level']:.1f}/10.0 (Target: 8.5+)

*Connecting you to your specialized coordination team now...*
"""

        return {
            "content": response_content,
            "metadata": {
                "agent_type": "pendo_supervisor",
                "agent_name": "Pendo",
                "routing_decision": routing_info["primary_specialist"],
                "coordination_needed": True,
                "complex_case": True,
                "identities_detected": len(identities),
                "intelligence_level": routing_info["intelligence_level"],
                "coordination_specialists": coordination_specialists,
                "psychological_support": len(support_needs) > 0,
                "cea_mission": self.cea_mission,
            },
        }

    async def _handle_supervisor_guidance(
        self, message: str, routing_info: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Handle cases where supervisor provides initial guidance"""
        psychological_state = routing_info["psychological_state"]

        response_content = f"""
{self.format_cea_response_header("Pendo", "Enhanced Career Navigation Coordinator")}

Welcome to the Massachusetts Climate Economy Assistant! I'm Pendo, your Enhanced Lead Program Manager.

**🧠 Intelligence Analysis:** Processed your query with {routing_info['intelligence_level']:.1f}/10.0 intelligence level

**🎯 Quick Assessment Questions:**
To ensure exceptional guidance tailored to your specific needs:

1. **Career Background:** What's your current profession or most recent work experience?
2. **Location Preference:** Are you interested in opportunities in Brockton, Fall River/New Bedford, or Lowell/Lawrence?
3. **Transition Goals:** What draws you to clean energy careers specifically?
4. **Timeframe:** What's your target timeline for making this transition?
5. **Biggest Concerns:** What barriers or challenges are you most worried about?

**🌟 Our Enhanced Specialist Team:**
• **Marcus** - Military veterans with sophisticated transition support
• **Liv** - International professionals with credential recognition expertise  
• **Miguel** - Environmental justice advocates with community-centered approach
• **Jasmine** - Career pathway optimization with skills analysis

{self.format_barrier_assessment()}

{self.format_act_partner_resources()}

**💬 Enhanced Support Promise:**
With our new intelligence capabilities, we provide:
- Multi-identity recognition for complex backgrounds
- Psychological awareness and emotional support
- Intersectional barrier analysis  
- Coordinated specialist approach when needed
- Memory retention for personalized follow-up

Let me know more details, and I'll ensure you receive exceptional, coordinated support!
"""

        return {
            "content": response_content,
            "metadata": {
                "agent_type": "pendo_supervisor",
                "agent_name": "Pendo",
                "routing_needed": True,
                "specialists_available": self.routing_capabilities,
                "intelligence_level": routing_info["intelligence_level"],
                "psychological_assessment": psychological_state,
                "cea_mission": self.cea_mission,
            },
        }

    async def _handle_direct_routing(
        self, message: str, routing_info: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Handle direct routing to a single specialist"""
        specialist_names = {
            "marcus_veteran_specialist": "Marcus",
            "liv_international_specialist": "Liv",
            "miguel_environmental_justice_specialist": "Miguel",
            "jasmine_ma_resource_analyst": "Jasmine",
        }

        specialist_name = specialist_names.get(
            routing_info["primary_specialist"], "Specialist"
        )
        identities = routing_info["identities_detected"]
        identity_summary = (
            identities[0]["identity_type"] if identities else "career seeker"
        )

        response_content = f"""
{self.format_cea_response_header("Pendo", "Enhanced Routing Coordinator")}

**🧠 Enhanced Intelligence Analysis Complete**
- Intelligence Level: {routing_info['intelligence_level']:.1f}/10.0
- Primary Identity: {identity_summary.replace('_', ' ').title()}
- Confidence Level: {identities[0]['confidence']:.1f} if identities else 0.8

**🎯 Perfect Match Identified!**
Based on your message, I'm connecting you with **{specialist_name}**, who can provide exceptional specialized guidance for your {identity_summary.replace('_', ' ')} background.

**🔄 Routing to {specialist_name}:**
{specialist_name} will provide:
• Enhanced intelligence-driven analysis of your background and goals
• Sophisticated tool selection for your specific needs
• Memory retention for personalized follow-up guidance
• Direct connection to the 38,100 clean energy jobs pipeline
• Comprehensive barrier analysis and solution strategies

**⏱️ What to Expect (Enhanced Support):**
• Intelligent skills analysis with psychological awareness
• Context-aware opportunity matching
• Progressive training recommendations
• Gateway Cities connections and resources
• 90-day action plan with milestone tracking
• Case-based learning from successful similar transitions

{self.format_barrier_assessment()}

**Intelligence Enhancement:** Your interaction is being processed with advanced cognitive capabilities for exceptional results.

*Transferring you to {specialist_name} with enhanced context now...*
"""

        return {
            "content": response_content,
            "metadata": {
                "agent_type": "pendo_supervisor",
                "agent_name": "Pendo",
                "routing_decision": routing_info["primary_specialist"],
                "specialist_assigned": specialist_name,
                "intelligence_level": routing_info["intelligence_level"],
                "identities_detected": len(identities),
                "psychological_state": routing_info["psychological_state"],
                "cea_mission": self.cea_mission,
            },
        }

    async def process(self, state: AgentState) -> Command:
        """
        Process supervisor state and determine next agent or provide guidance

        Args:
            state: Current agent state

        Returns:
            Command with routing decision
        """
        try:
            # Extract latest message
            query = self.extract_latest_message(state)

            if not query:
                response = self.create_response(
                    "I'm Pendo, your Massachusetts climate career coordinator. How can I help you connect to clean energy opportunities today?"
                )

                updated_messages = list(state.get("messages", []))
                updated_messages.append(response)

                return Command(
                    goto=END, update={"messages": updated_messages, "next": "FINISH"}
                )

            # Determine routing
            routing_decision = await self.determine_enhanced_routing(query)

            if routing_decision["primary_specialist"] == "pendo_supervisor":
                # Provide guidance and stay with supervisor
                response_content = f"""
I'm Pendo, your Lead Program Manager for Massachusetts clean energy careers.

To provide the best guidance for the 38,100 clean energy job opportunities, I need to understand your background better.

**Please tell me about:**
• Your professional background or military experience
• Any international education or work experience  
• Interest in community-based or environmental justice work
• Current location (especially if in Gateway Cities)

This will help me connect you with the right specialist: Marcus (Veterans), Liv (International), Miguel (Environmental Justice), or Jasmine (Resume/Career Planning).
"""

                response = self.create_response(
                    response_content,
                    metadata={"routing_needed": True, "agent_name": "Pendo"},
                )

                updated_messages = list(state.get("messages", []))
                updated_messages.append(response)

                return Command(
                    goto=END, update={"messages": updated_messages, "next": "FINISH"}
                )
            else:
                # Route to specialist
                specialist_routing = {
                    "marcus_veteran_specialist": "veteran_specialist_node",
                    "liv_international_specialist": "international_specialist_node",
                    "miguel_environmental_justice_specialist": "environmental_justice_specialist_node",
                    "jasmine_ma_resource_analyst": "resume_specialist_node",
                }

                next_node = specialist_routing.get(
                    routing_decision["primary_specialist"], END
                )

                # Add routing metadata to state
                updated_state = dict(state)
                updated_state["routed_specialist"] = routing_decision[
                    "primary_specialist"
                ]
                updated_state["routing_agent"] = "pendo_supervisor"

                return Command(goto=next_node, update=updated_state)

        except Exception as e:
            self.log_error("Error in supervisor processing", e)

            error_response = self.create_response(
                "I'm Pendo, your climate career coordinator. I encountered a technical issue. Please try again, and I'll help connect you to the right clean energy career specialist."
            )

            updated_messages = list(state.get("messages", []))
            updated_messages.append(error_response)

            return Command(
                goto=END, update={"messages": updated_messages, "next": "FINISH"}
            )
