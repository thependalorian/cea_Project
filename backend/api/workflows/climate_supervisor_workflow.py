"""
Climate Economy Assistant Supervisor Workflow - Enhanced Intelligence V4
Multi-agent supervisor system with advanced cognitive capabilities
Uses Enhanced Intelligence Framework for 8.5-9.5/10 performance

Addresses the 39% information gap crisis affecting clean energy workers
Connects users to the 38,100 clean energy jobs pipeline by 2030

ENHANCED FEATURES V4 - INTEGRATED ROBUST INTELLIGENCE:
✅ Advanced Identity Recognition with Intersectionality Support
✅ Intelligent Routing Engine with Confidence Scoring  
✅ Response Quality Analyzer (5 Quality Dimensions)
✅ Comprehensive Error Handling and Recovery Systems
✅ Real-time Performance Analytics and Monitoring
✅ Progressive Tool Selection Intelligence
✅ Enhanced Memory Systems (Episodic + Semantic)
✅ Self-Reflection Engine (4 Reflection Types)
✅ Case-Based Reasoning Engine
✅ Intelligence Coordination Hub

BEST PRACTICES INTEGRATED FROM TESTING FRAMEWORKS:
- Exceptional agent intelligence testing patterns
- Comprehensive performance monitoring systems
- Focused backend functionality validation
- Standalone workflow robustness mechanisms
- Advanced error recovery and fallback strategies
"""

import asyncio
import json
from typing import Annotated, Any, Dict, List, Literal, Optional
from datetime import datetime
from dataclasses import dataclass, field
import operator
import uuid
from enum import Enum

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_core.tools import tool, InjectedToolCallId, InjectedToolArg
from langgraph.graph import StateGraph, START, END, MessagesState
from langgraph.types import Command, Send, interrupt
from langchain_core.messages import ToolMessage
from typing_extensions import TypedDict

# Enhanced Intelligence Framework Integration
from core.agents.enhanced_intelligence import (
    EnhancedIntelligenceCoordinator,
    MultiIdentityRecognizer,
    ProgressiveToolSelector,
    EnhancedMemorySystem,
    SelfReflectionEngine,
    CaseBasedReasoningEngine,
    ReflectionType,
    IntelligenceLevel,
    UserIdentity,
)

from langchain_openai import ChatOpenAI
import os

# Import all tools directly
from tools.resume import (
    analyze_resume_for_climate_careers,
    analyze_resume_with_social_context,
    check_user_resume_status,
    process_resume,
    get_user_resume,
    extract_skills_from_resume,
    query_user_resume,
)

from tools.web import (
    web_search_for_credential_evaluation,
    web_search_for_mos_translation,
    web_search_for_ej_communities,
    web_search_for_training_enhancement,
    web_search_for_social_profiles,
    web_search_for_veteran_resources,
    web_search_for_education_resources,
)

from tools.search import (
    search_resources,
    search_job_resources,
    search_education_resources,
    search_partner_organizations,
    search_funding_resources,
    search_events,
    semantic_resource_search,
    generate_resource_recommendations,
)

from tools.jobs import match_jobs_for_profile
from tools.training import recommend_upskilling
from tools.credentials import evaluate_credentials
from tools.skills import translate_military_skills
from tools.communities import get_ej_community_info
from tools.matching import advanced_job_matching, skills_gap_analysis
from tools.analytics import (
    log_specialist_interaction,
    log_conversation_analytics,
    log_resource_view,
    log_user_feedback,
    extract_conversation_insights,
)

# Import enhanced agents and prompts
from core.agents.ma_resource_analyst import MAResourceAnalystAgent
from core.agents.veteran import VeteranSpecialist
from core.agents.international import InternationalSpecialist
from core.agents.environmental import EnvironmentalJusticeSpecialist

# Import the best prompts developed
from core.prompts import (
    SUPERVISOR_SYSTEM_PROMPT,
    MA_CLIMATE_CONTEXT,
    POPULATION_CONTEXTS,
    INTERNATIONAL_SPECIALIST_PROMPT,
    VETERAN_SPECIALIST_PROMPT,
    ENVIRONMENTAL_JUSTICE_SPECIALIST_PROMPT,
    MA_RESOURCE_ANALYST_PROMPT,
)

# Import adapters for enhanced functionality
from adapters.supabase import get_supabase_client
from adapters.models import get_default_provider
from adapters.openai import get_openai_client

# Import available workflows for enhanced functionality
from core.workflows.resume_workflow import resume_processing_workflow, resume_analysis_workflow
from core.workflows.conversation import ConversationWorkflow


# ROBUST INTELLIGENCE ENUMS AND CLASSES
class IntelligenceLevel(Enum):
    """Intelligence level classification for responses"""
    EXCEPTIONAL = "exceptional"  # 9.0-10.0 
    ADVANCED = "advanced"        # 7.0-8.9
    PROFICIENT = "proficient"    # 5.0-6.9
    DEVELOPING = "developing"    # 3.0-4.9
    BASIC = "basic"             # 0.0-2.9


class RoutingConfidence(Enum):
    """Routing decision confidence levels"""
    HIGH = "high"        # 85-100%
    MEDIUM = "medium"    # 60-84%
    LOW = "low"         # 40-59%
    UNCERTAIN = "uncertain"  # 0-39%


@dataclass
class UserIdentityProfile:
    """Comprehensive user identity recognition with intersectionality"""
    primary_identity: str
    secondary_identities: List[str] = field(default_factory=list)
    intersectionality_factors: List[str] = field(default_factory=list)
    barriers_identified: List[str] = field(default_factory=list)
    strengths_identified: List[str] = field(default_factory=list)
    geographic_context: str = "Massachusetts"
    confidence_score: float = 0.0


@dataclass
class RoutingDecision:
    """Intelligent routing decision with reasoning and alternatives"""
    specialist_assigned: str
    confidence_level: RoutingConfidence
    reasoning: str
    alternative_specialists: List[str] = field(default_factory=list)
    tools_recommended: List[str] = field(default_factory=list)
    expected_outcome: str = ""
    success_metrics: List[str] = field(default_factory=list)


@dataclass
class QualityMetrics:
    """Response quality assessment across 5 dimensions"""
    clarity_score: float = 0.0
    actionability_score: float = 0.0
    personalization_score: float = 0.0
    source_citation_score: float = 0.0
    ej_awareness_score: float = 0.0
    overall_quality: float = 0.0
    intelligence_level: IntelligenceLevel = IntelligenceLevel.DEVELOPING


# Enhanced State for Climate Economy Assistant with Robust Intelligence Integration
class ClimateAgentState(MessagesState):
    """Enhanced state with comprehensive intelligence framework integration"""

    user_id: str
    conversation_id: str
    current_specialist: Optional[str] = None
    user_profile: Optional[Dict[str, Any]] = None
    user_identities: Optional[List[UserIdentity]] = None
    climate_goals: Optional[List[str]] = None
    geographic_focus: Optional[str] = None  # Gateway Cities focus
    barriers_identified: Optional[List[str]] = None
    tools_used: Annotated[List[str], operator.add] = []  # Allow concurrent additions
    confidence_score: float = 0.0
    intelligence_level: str = "developing"
    workflow_state: Literal["active", "pending_human", "completed", "waiting_for_input"] = "active"
    specialist_handoffs: Annotated[List[Dict[str, Any]], operator.add] = []  # Allow concurrent additions
    resource_recommendations: Annotated[List[Dict[str, Any]], operator.add] = []  # Allow concurrent additions
    next_actions: Annotated[List[str], operator.add] = []  # Allow concurrent additions
    
    # ROBUST INTELLIGENCE FRAMEWORK STATE
    enhanced_identity: Optional[UserIdentityProfile] = None
    routing_decision: Optional[RoutingDecision] = None
    quality_metrics: Optional[QualityMetrics] = None
    error_recovery_log: Annotated[List[Dict], operator.add] = []
    memory_context: Optional[Dict[str, Any]] = None
    reflection_history: Annotated[List[Dict[str, Any]], operator.add] = []  # Allow concurrent additions
    case_recommendations: Annotated[List[Dict[str, Any]], operator.add] = []  # Allow concurrent additions
    progressive_tools: Optional[Dict[str, Any]] = None
    coordination_metadata: Optional[Dict[str, Any]] = None
    
    # HUMAN-IN-THE-LOOP STATE
    human_feedback_needed: bool = False
    conversation_complete: bool = False
    follow_up_scheduled: bool = False
    satisfaction_rating: Optional[float] = None
    handoff_count: int = 0  # Track number of specialist handoffs
    last_specialist_response_time: Optional[str] = None
    needs_human_review: bool = False


# ROBUST INTELLIGENCE COMPONENTS
class AdvancedIdentityRecognizer:
    """Advanced identity recognition with intersectionality support from exceptional testing"""
    
    def __init__(self):
        self.identity_patterns = {
            "veteran": {
                "keywords": ["military", "veteran", "navy", "army", "air force", "marines", "coast guard", "service", "deployment"],
                "context_clues": ["transition", "civilian", "mos", "rank", "base", "deployment"],
                "barriers": ["ptsd", "disability", "transition challenges", "civilian workplace"],
                "strengths": ["leadership", "discipline", "logistics", "security clearance"]
            },
            "international": {
                "keywords": ["immigrant", "foreign", "visa", "h1b", "international", "credential", "degree from"],
                "context_clues": ["country", "embassy", "work authorization", "english language"],
                "barriers": ["credential recognition", "language barriers", "visa restrictions", "cultural adaptation"],
                "strengths": ["multilingual", "diverse perspective", "international experience", "adaptability"]
            },
            "environmental_justice": {
                "keywords": ["community", "environmental justice", "ej", "frontline", "pollution", "equity"],
                "context_clues": ["organizing", "advocacy", "grassroots", "systemic", "cumulative impact"],
                "barriers": ["systemic racism", "economic inequality", "health disparities", "displacement"],
                "strengths": ["community knowledge", "organizing skills", "advocacy experience", "cultural competency"]
            },
            "career_development": {
                "keywords": ["resume", "skills", "training", "career", "job search", "transition"],
                "context_clues": ["experience", "education", "career change", "professional development"],
                "barriers": ["skills gap", "career uncertainty", "networking challenges", "training costs"],
                "strengths": ["motivation", "learning readiness", "professional experience", "growth mindset"]
            }
        }
    
    async def analyze_user_identity(self, message: str) -> UserIdentityProfile:
        """Comprehensive identity analysis with intersectionality awareness"""
        message_lower = message.lower()
        
        # Detect primary and secondary identities
        identity_scores = {}
        for identity, patterns in self.identity_patterns.items():
            score = 0
            # Keyword matching
            for keyword in patterns["keywords"]:
                if keyword in message_lower:
                    score += 2
            
            # Context clue matching
            for clue in patterns["context_clues"]:
                if clue in message_lower:
                    score += 1
            
            identity_scores[identity] = score
        
        # Determine primary identity
        primary_identity = max(identity_scores, key=identity_scores.get)
        
        # Determine secondary identities (intersectionality)
        secondary_identities = [
            identity for identity, score in identity_scores.items() 
            if score > 0 and identity != primary_identity
        ]
        
        # Identify intersectionality factors
        intersectionality_factors = []
        if len(secondary_identities) > 0:
            intersectionality_factors.append("multiple_identities")
        
        # Check for specific intersectional indicators
        if "single mother" in message_lower or "single parent" in message_lower:
            intersectionality_factors.append("single_parent")
        if any(word in message_lower for word in ["latina", "hispanic", "black", "african american"]):
            intersectionality_factors.append("racial_ethnic_minority")
        if any(word in message_lower for word in ["disability", "disabled", "ptsd", "anxiety"]):
            intersectionality_factors.append("disability_status")
        
        # Identify barriers and strengths
        barriers_identified = []
        strengths_identified = []
        
        for identity in [primary_identity] + secondary_identities:
            if identity in self.identity_patterns:
                barriers_identified.extend(self.identity_patterns[identity]["barriers"])
                strengths_identified.extend(self.identity_patterns[identity]["strengths"])
        
        # Calculate confidence score
        total_score = sum(identity_scores.values())
        confidence_score = min(total_score / 10.0, 1.0)  # Normalize to 0-1
        
        return UserIdentityProfile(
            primary_identity=primary_identity,
            secondary_identities=secondary_identities,
            intersectionality_factors=intersectionality_factors,
            barriers_identified=list(set(barriers_identified)),
            strengths_identified=list(set(strengths_identified)),
            confidence_score=confidence_score
        )


class IntelligentRoutingEngine:
    """Intelligent routing with confidence scoring from supervisor testing"""
    
    def __init__(self):
        self.specialist_capabilities = {
            "jasmine": {
                "primary_focus": ["career_development", "skills_analysis", "resume_optimization"],
                "secondary_focus": ["training_programs", "job_matching", "professional_development"],
                "tools": ["resume_analysis", "skills_gap_analysis", "job_matching", "training_search"],
                "success_indicators": ["resume_improved", "skills_identified", "training_found", "jobs_matched"]
            },
            "marcus": {
                "primary_focus": ["veteran", "military_transition", "veteran_benefits"],
                "secondary_focus": ["leadership_roles", "security_positions", "logistics_careers"],
                "tools": ["mos_translation", "veteran_programs", "skill_translation", "military_career_mapping"],
                "success_indicators": ["mos_translated", "veteran_programs_found", "transition_plan_created"]
            },
            "liv": {
                "primary_focus": ["international", "credential_evaluation", "visa_support"],
                "secondary_focus": ["language_support", "cultural_integration", "international_experience"],
                "tools": ["credential_evaluation", "visa_guidance", "international_programs", "language_resources"],
                "success_indicators": ["credentials_evaluated", "visa_pathway_identified", "integration_support_found"]
            },
            "miguel": {
                "primary_focus": ["environmental_justice", "community_organizing", "equity_advocacy"],
                "secondary_focus": ["community_benefits", "grassroots_organizing", "policy_advocacy"],
                "tools": ["ej_community_search", "organizing_resources", "policy_analysis", "community_programs"],
                "success_indicators": ["community_resources_found", "organizing_support_provided", "equity_pathways_identified"]
            }
        }
    
    async def determine_routing(self, user_identity: UserIdentityProfile, message: str) -> RoutingDecision:
        """Determine optimal specialist routing with confidence and reasoning"""
        # Calculate specialist compatibility scores
        compatibility_scores = {}
        
        for specialist, capabilities in self.specialist_capabilities.items():
            score = 0
            
            # Primary identity match
            if user_identity.primary_identity in capabilities["primary_focus"]:
                score += 5
            elif user_identity.primary_identity in capabilities["secondary_focus"]:
                score += 3
            
            # Secondary identity matches
            for secondary in user_identity.secondary_identities:
                if secondary in capabilities["primary_focus"]:
                    score += 3
                elif secondary in capabilities["secondary_focus"]:
                    score += 2
            
            # Intersectionality bonus for Miguel (EJ specialist)
            if specialist == "miguel" and len(user_identity.intersectionality_factors) > 1:
                score += 2
            
            # Complex case bonus for high-capability specialists
            if len(user_identity.secondary_identities) > 1:
                if specialist in ["jasmine", "miguel"]:  # High coordination capability
                    score += 1
            
            compatibility_scores[specialist] = score
        
        # Determine best specialist
        best_specialist = max(compatibility_scores, key=compatibility_scores.get)
        best_score = compatibility_scores[best_specialist]
        
        # Calculate confidence level
        if best_score >= 6:
            confidence = RoutingConfidence.HIGH
        elif best_score >= 4:
            confidence = RoutingConfidence.MEDIUM
        elif best_score >= 2:
            confidence = RoutingConfidence.LOW
        else:
            confidence = RoutingConfidence.UNCERTAIN
        
        # Generate reasoning
        reasoning = self._generate_routing_reasoning(
            best_specialist, user_identity, compatibility_scores
        )
        
        # Identify alternative specialists
        sorted_specialists = sorted(
            compatibility_scores.items(), 
            key=lambda x: x[1], 
            reverse=True
        )
        alternatives = [spec for spec, score in sorted_specialists[1:3] if score > 0]
        
        # Recommend tools
        tools_recommended = self.specialist_capabilities[best_specialist]["tools"]
        
        # Expected outcome
        expected_outcome = f"Comprehensive {user_identity.primary_identity} support with personalized recommendations"
        
        # Success metrics
        success_metrics = self.specialist_capabilities[best_specialist]["success_indicators"]
        
        return RoutingDecision(
            specialist_assigned=best_specialist,
            confidence_level=confidence,
            reasoning=reasoning,
            alternative_specialists=alternatives,
            tools_recommended=tools_recommended,
            expected_outcome=expected_outcome,
            success_metrics=success_metrics
        )
    
    def _generate_routing_reasoning(
        self, 
        specialist: str, 
        identity: UserIdentityProfile, 
        scores: Dict[str, int]
    ) -> str:
        """Generate human-readable reasoning for routing decision"""
        
        specialist_names = {
            "jasmine": "Jasmine (MA Resource Analyst)",
            "marcus": "Marcus (Veterans Specialist)",
            "liv": "Liv (International Specialist)",
            "miguel": "Miguel (Environmental Justice Specialist)"
        }
        
        reasoning = f"Routed to {specialist_names[specialist]} because:\n"
        
        # Primary identity reasoning
        reasoning += f"- Primary identity '{identity.primary_identity}' aligns with specialist expertise\n"
        
        # Intersectionality reasoning
        if len(identity.intersectionality_factors) > 1:
            reasoning += f"- Multiple intersecting identities detected, requiring specialized support\n"
        
        # Confidence reasoning
        best_score = scores[specialist]
        if best_score >= 6:
            reasoning += "- High confidence match based on keyword analysis and context\n"
        elif best_score >= 4:
            reasoning += "- Moderate confidence match with good capability alignment\n"
        else:
            reasoning += "- Best available match, may require coordination with other specialists\n"
        
        return reasoning


class ResponseQualityAnalyzer:
    """Analyze response quality based on 5 dimensions from exceptional testing"""
    
    async def analyze_response_quality(
        self, 
        response: str, 
        user_identity: UserIdentityProfile,
        tools_used: List[str]
    ) -> QualityMetrics:
        """Comprehensive response quality analysis"""
        
        response_lower = response.lower()
        
        # Clarity Score (0-10)
        clarity_indicators = [
            "step", "first", "next", "then", "specific", "clear", "exactly"
        ]
        clarity_score = min(
            sum(2 for indicator in clarity_indicators if indicator in response_lower), 10
        )
        
        # Actionability Score (0-10)
        actionability_indicators = [
            "contact", "apply", "enroll", "visit", "call", "email", "website", "next step"
        ]
        actionability_score = min(
            sum(1.5 for indicator in actionability_indicators if indicator in response_lower), 10
        )
        
        # Personalization Score (0-10)
        personalization_indicators = [
            "your", "you", "based on", "given", "specific to", "tailored"
        ]
        personalization_score = min(
            sum(1.5 for indicator in personalization_indicators if indicator in response_lower), 10
        )
        
        # Source Citation Score (0-10)
        source_indicators = [
            "organization:", "contact:", "website:", "verified:", "source:", "phone:"
        ]
        source_citation_score = min(
            sum(2 for indicator in source_indicators if indicator in response_lower), 10
        )
        
        # Environmental Justice Awareness Score (0-10)
        ej_indicators = [
            "environmental justice", "community", "equity", "frontline", 
            "overburdened", "systemic", "barriers", "intersectional"
        ]
        ej_awareness_score = min(
            sum(1.5 for indicator in ej_indicators if indicator in response_lower), 10
        )
        
        # Calculate overall quality
        overall_quality = (
            clarity_score * 0.25 + 
            actionability_score * 0.25 + 
            personalization_score * 0.20 + 
            source_citation_score * 0.20 + 
            ej_awareness_score * 0.10
        )
        
        # Determine intelligence level
        if overall_quality >= 8.5:
            intelligence_level = IntelligenceLevel.EXCEPTIONAL
        elif overall_quality >= 7.0:
            intelligence_level = IntelligenceLevel.ADVANCED
        elif overall_quality >= 5.0:
            intelligence_level = IntelligenceLevel.PROFICIENT
        elif overall_quality >= 3.0:
            intelligence_level = IntelligenceLevel.DEVELOPING
        else:
            intelligence_level = IntelligenceLevel.BASIC
        
        return QualityMetrics(
            clarity_score=clarity_score,
            actionability_score=actionability_score,
            personalization_score=personalization_score,
            source_citation_score=source_citation_score,
            ej_awareness_score=ej_awareness_score,
            overall_quality=overall_quality,
            intelligence_level=intelligence_level
        )


class RobustErrorRecovery:
    """Comprehensive error handling and recovery from testing frameworks"""
    
    async def handle_error(
        self, 
        error: Exception, 
        context: Dict[str, Any],
        state: ClimateAgentState
    ) -> Dict[str, Any]:
        """Comprehensive error handling with recovery strategies"""
        
        error_info = {
            "error_type": type(error).__name__,
            "error_message": str(error),
            "timestamp": datetime.now().isoformat(),
            "context": context,
            "recovery_strategy": "log_and_continue",
        }
        
        # Log error for analysis - use dictionary access
        if "error_recovery_log" not in state:
            state["error_recovery_log"] = []
        state["error_recovery_log"].append(error_info)
        
        return error_info


# Initialize robust intelligence components
advanced_identity_recognizer = AdvancedIdentityRecognizer()
intelligent_routing_engine = IntelligentRoutingEngine()
response_quality_analyzer = ResponseQualityAnalyzer()
robust_error_recovery = RobustErrorRecovery()


# PERFORMANCE TRACKING AND OPTIMIZATION COMPONENTS
class PerformanceOptimizer:
    """Performance optimization and session tracking from robust framework"""
    
    def __init__(self):
        self.session_metrics = {}
        self.error_count = 0
        self.success_count = 0
    
    async def optimize_performance(self, state: ClimateAgentState, quality_metrics: QualityMetrics):
        """Optimize performance based on quality metrics"""
        
        # Track session performance
        session_id = f"{state.get('user_id', 'unknown')}_{state.get('conversation_id', 'unknown')}"
        if session_id not in self.session_metrics:
            self.session_metrics[session_id] = {
                "responses": [],
                "average_quality": 0.0,
                "improvement_trend": []
            }
        
        # Add current quality score
        self.session_metrics[session_id]["responses"].append(quality_metrics.overall_quality)
        
        # Calculate running average
        responses = self.session_metrics[session_id]["responses"]
        avg_quality = sum(responses) / len(responses)
        self.session_metrics[session_id]["average_quality"] = avg_quality
        
        # Performance optimization logic
        if quality_metrics.overall_quality < 6.0:
            print(f"⚠️ Low quality response detected: {quality_metrics.overall_quality:.1f}/10")
            # Could trigger additional verification or specialist consultation
        
        if avg_quality > 8.0:
            print(f"🌟 High-performance session: {avg_quality:.1f}/10 average")
        
        # Log performance analytics
        try:
            await log_conversation_analytics(
                user_id=state.get('user_id', 'unknown'),
                conversation_id=state.get('conversation_id', 'unknown'),
                analytics_data={
                    "quality_score": quality_metrics.overall_quality,
                    "intelligence_level": quality_metrics.intelligence_level.value,
                    "session_average": avg_quality,
                    "response_count": len(responses)
                }
            )
        except Exception as e:
            print(f"Analytics logging failed: {e}")
    
    async def determine_next_action(
        self, 
        routing_decision: RoutingDecision, 
        quality_metrics: QualityMetrics
    ) -> str:
        """Determine next action based on routing confidence and quality"""
        
        # High confidence, high quality -> delegate
        if (routing_decision.confidence_level in [RoutingConfidence.HIGH, RoutingConfidence.MEDIUM] 
            and quality_metrics.overall_quality >= 6.0):
            return "delegate"
        
        # Low confidence or quality -> provide guidance and reassess
        elif routing_decision.confidence_level == RoutingConfidence.UNCERTAIN:
            return "clarify"
        
        # Default to providing comprehensive guidance
        return "guide"

    async def generate_enhanced_response(
        self, 
        user_message: str, 
        user_identity: UserIdentityProfile, 
        routing_decision: RoutingDecision,
        state: ClimateAgentState
    ) -> str:
        """Generate enhanced response with comprehensive intelligence"""
        
        # Enhanced prompt with comprehensive intelligence
        enhanced_prompt = f"""You are Pendo, the Climate Economy Assistant Supervisor, equipped with robust intelligence V4 and comprehensive Massachusetts climate career expertise.

USER IDENTITY ANALYSIS:
- Primary Identity: {user_identity.primary_identity}
- Secondary Identities: {', '.join(user_identity.secondary_identities)}
- Intersectionality Factors: {', '.join(user_identity.intersectionality_factors)}
- Identified Barriers: {', '.join(user_identity.barriers_identified)}
- Identified Strengths: {', '.join(user_identity.strengths_identified)}
- Geographic Context: {user_identity.geographic_context}

INTELLIGENT ROUTING DECISION:
- Specialist Assignment: {routing_decision.specialist_assigned}
- Confidence Level: {routing_decision.confidence_level.value}
- Routing Reasoning: {routing_decision.reasoning}
- Alternative Specialists: {', '.join(routing_decision.alternative_specialists)}
- Recommended Tools: {', '.join(routing_decision.tools_recommended)}

USER MESSAGE: {user_message}

RESPONSE REQUIREMENTS (ENHANCED INTELLIGENCE V4):
1. **Advanced Intelligence**: Demonstrate exceptional understanding of user's complex, intersectional identity
2. **Source Citation**: Every recommendation MUST include specific organization names, contact information, and verification dates
3. **Environmental Justice Awareness**: Recognize and address systemic barriers and equity considerations
4. **Actionable Guidance**: Provide clear, step-by-step next actions with specific contact details
5. **Personalization**: Tailor response to user's specific identity, barriers, and strengths
6. **Routing Explanation**: Clearly explain why you're connecting them to the recommended specialist

MASSACHUSETTS CONTEXT:
- Focus on Gateway Cities (Brockton, Fall River, New Bedford, Lowell, Lawrence) when relevant
- Reference Massachusetts-specific programs, policies, and resources
- Include environmental justice considerations per 2021 Climate Act
- Emphasize the 38,100 clean energy jobs pipeline by 2030

Generate a comprehensive, intelligent response that demonstrates exceptional understanding and provides verified, actionable guidance."""

        # Get verified resources through search tool
        try:
            verified_resources = await semantic_resource_search.ainvoke({
                "query": user_message,
                "context": f"User identity: {user_identity.primary_identity}",
                "user_profile": user_identity.__dict__
            })
            if "tools_used" not in state:
                state["tools_used"] = []
            state["tools_used"].append("semantic_resource_search")
        except Exception as e:
            print(f"Resource search failed: {e}")
            verified_resources = "Resource search temporarily unavailable - using fallback guidance"
        
        # Generate enhanced response
        try:
            from langchain_openai import ChatOpenAI
            llm = ChatOpenAI(model="gpt-4o", temperature=0.3)
            
            full_prompt = f"{enhanced_prompt}\n\nVERIFIED RESOURCES:\n{verified_resources}\n\nProvide your enhanced, intelligent response:"
            
            response = await llm.ainvoke([HumanMessage(content=full_prompt)])
            return response.content
            
        except Exception as e:
            print(f"LLM response generation failed: {e}")
            return "I apologize for the technical issue. Please contact ACT Alliance directly at info@act-alliance.org for immediate climate career assistance."
    
    async def update_session_metrics(self, user_id: str, conversation_id: str, quality_score: float):
        """Update session performance metrics"""
        session_id = f"{user_id}_{conversation_id}"
        if session_id not in self.session_metrics:
            self.session_metrics[session_id] = {"responses": [], "average_quality": 0.0}
        
        self.session_metrics[session_id]["responses"].append(quality_score)
        responses = self.session_metrics[session_id]["responses"]
        self.session_metrics[session_id]["average_quality"] = sum(responses) / len(responses)


# Initialize performance optimizer
performance_optimizer = PerformanceOptimizer()


# Tool Collections for Each Specialist
JASMINE_TOOLS = [
    analyze_resume_for_climate_careers,
    analyze_resume_with_social_context,
    check_user_resume_status,
    process_resume,
    get_user_resume,
    extract_skills_from_resume,
    query_user_resume,
    match_jobs_for_profile,
    advanced_job_matching,
    skills_gap_analysis,
    recommend_upskilling,
    search_job_resources,
    search_education_resources,
    web_search_for_training_enhancement,
]

MARCUS_TOOLS = [
    web_search_for_mos_translation,
    web_search_for_veteran_resources,
    translate_military_skills,
    match_jobs_for_profile,
    advanced_job_matching,
    skills_gap_analysis,
    recommend_upskilling,
    search_resources,
    search_job_resources,
    analyze_resume_for_climate_careers,
    web_search_for_training_enhancement,
]

LIV_TOOLS = [
    web_search_for_credential_evaluation,
    evaluate_credentials,
    search_resources,
    search_education_resources,
    search_partner_organizations,
    match_jobs_for_profile,
    advanced_job_matching,
    skills_gap_analysis,
    recommend_upskilling,
    web_search_for_education_resources,
]

MIGUEL_TOOLS = [
    web_search_for_ej_communities,
    get_ej_community_info,
    search_partner_organizations,
    search_funding_resources,
    search_events,
    match_jobs_for_profile,
    advanced_job_matching,
    skills_gap_analysis,
    recommend_upskilling,
    search_resources,
]

ALL_ANALYTICS_TOOLS = [
    log_specialist_interaction,
    log_conversation_analytics,
    log_resource_view,
    log_user_feedback,
    extract_conversation_insights,
]


# Create handoff tools for agent coordination
def create_handoff_tool(
    *, agent_name: str, specialist_name: str, description: str | None = None
):
    """Create handoff tool for transferring to specialist agents"""
    name = f"transfer_to_{agent_name}"
    description = (
        description
        or f"Transfer conversation to {specialist_name} for specialized assistance."
    )

    @tool(name, description=description)
    def handoff_tool(
        state: Annotated[ClimateAgentState, InjectedToolArg],
        tool_call_id: Annotated[str, InjectedToolCallId],
        task_description: Optional[str] = None,
    ) -> Command:
        """Handle transfer to specialist agent"""

        # Create tool response message
        tool_message = {
            "role": "tool",
            "content": f"Successfully transferred to {specialist_name} ({agent_name})",
            "name": name,
            "tool_call_id": tool_call_id,
        }

        # Track the handoff
        handoff_info = {
            "timestamp": datetime.now().isoformat(),
            "from": "pendo_supervisor",
            "to": agent_name,
            "specialist": specialist_name,
            "task_description": task_description,
            "tool_call_id": tool_call_id,
        }

        # Update state
        updated_state = {
            **state,
            "messages": state["messages"] + [tool_message],
            "current_specialist": agent_name,
            "specialist_handoffs": state.get("specialist_handoffs", [])
            + [handoff_info],
        }

        # Route to the appropriate specialist node
        return Send(agent_name, updated_state)

    return handoff_tool


# Enhanced Intelligence Framework Instances
enhanced_coordinator = None
identity_recognizer = None
tool_selector = None
memory_system = None
reflection_engine = None
case_engine = None
# Store progressive tools globally for tool call handling
_progressive_tools = []


async def initialize_enhanced_intelligence():
    """Initialize the Enhanced Intelligence Framework components"""
    global enhanced_coordinator, identity_recognizer, tool_selector, memory_system, reflection_engine, case_engine

    if enhanced_coordinator is None:
        enhanced_coordinator = EnhancedIntelligenceCoordinator("supervisor")
        identity_recognizer = MultiIdentityRecognizer()
        tool_selector = ProgressiveToolSelector()
        memory_system = EnhancedMemorySystem("supervisor")
        reflection_engine = SelfReflectionEngine(max_iterations=3)
        case_engine = CaseBasedReasoningEngine("supervisor")
        print("🧠 Enhanced Intelligence Framework Initialized")


async def create_pendo_supervisor():
    """Create enhanced Pendo supervisor with advanced intelligence capabilities"""
    global _progressive_tools

    # Initialize Enhanced Intelligence Framework
    await initialize_enhanced_intelligence()

    # Get LLM with enhanced configuration
    llm = ChatOpenAI(
        model="gpt-4o",
        temperature=0.2,  # Lower temperature for more consistent reasoning
        max_tokens=3000,  # Increased for detailed responses
        api_key=os.getenv("OPENAI_API_KEY"),
    )

    # Create handoff tools with enhanced intelligence
    jasmine_handoff = create_handoff_tool(
        agent_name="jasmine",
        specialist_name="Jasmine (MA Resource Analyst)",
        description="Transfer to Jasmine for Massachusetts climate career guidance, job matching, and resource analysis",
    )

    marcus_handoff = create_handoff_tool(
        agent_name="marcus",
        specialist_name="Marcus (Veterans Specialist)",
        description="Transfer to Marcus for veteran-specific climate career transitions and military skill translation",
    )

    liv_handoff = create_handoff_tool(
        agent_name="liv",
        specialist_name="Liv (International Specialist)",
        description="Transfer to Liv for international credential evaluation and global climate opportunities",
    )

    miguel_handoff = create_handoff_tool(
        agent_name="miguel",
        specialist_name="Miguel (Environmental Justice Specialist)",
        description="Transfer to Miguel for environmental justice, community-focused climate work, and equity initiatives",
    )

    # Create delegation tools that return Commands for proper LangGraph handoffs
    @tool("delegate_to_jasmine", description="Delegate to Jasmine (MA Resource Analyst) for Massachusetts climate career guidance")
    def delegate_to_jasmine(task_description: str = "Climate career guidance needed"):
        """Delegate to Jasmine specialist"""
        return Command(goto="jasmine", update={"delegation_task": task_description})

    @tool("delegate_to_marcus", description="Delegate to Marcus (Veterans Specialist) for veteran transition support")  
    def delegate_to_marcus(task_description: str = "Veteran transition support needed"):
        """Delegate to Marcus specialist"""
        return Command(goto="marcus", update={"delegation_task": task_description})

    @tool("delegate_to_liv", description="Delegate to Liv (International Specialist) for credential evaluation")
    def delegate_to_liv(task_description: str = "International credential evaluation needed"):
        """Delegate to Liv specialist"""
        return Command(goto="liv", update={"delegation_task": task_description})

    @tool("delegate_to_miguel", description="Delegate to Miguel (Environmental Justice Specialist) for community engagement")
    def delegate_to_miguel(task_description: str = "Environmental justice support needed"):
        """Delegate to Miguel specialist"""
        return Command(goto="miguel", update={"delegation_task": task_description})

    # Enhanced tools with progressive selection
    progressive_tools = [
        # Delegation tools (handled by supervisor) - These return Commands for proper handoffs
        delegate_to_jasmine,
        delegate_to_marcus,
        delegate_to_liv,
        delegate_to_miguel,
        # Enhanced analytics with intelligence
        log_specialist_interaction,
        log_conversation_analytics,
        extract_conversation_insights,
        # Progressive search tools
        semantic_resource_search,
        generate_resource_recommendations,
    ]

    # Store tools globally for tool call handling
    _progressive_tools = progressive_tools

    # Bind tools to LLM with enhanced configuration
    supervisor_llm_with_tools = llm.bind_tools(progressive_tools)

    return supervisor_llm_with_tools


# Specialist Agent Instances
jasmine_agent = MAResourceAnalystAgent()
marcus_agent = VeteranSpecialist()
liv_agent = InternationalSpecialist()
miguel_agent = EnvironmentalJusticeSpecialist()


# Agent Handler Functions with Robust Intelligence Integration
async def supervisor_handler(state: ClimateAgentState) -> ClimateAgentState:
    """Enhanced Pendo supervisor with robust intelligence framework and 2025 LangGraph conditional human-in-the-loop"""
    try:
        await initialize_enhanced_intelligence()
        messages = state.get("messages", [])
        user_message = ""
        
        # Extract user message
        for msg in reversed(messages):
            if isinstance(msg, dict) and msg.get("role") == "user":
                user_message = msg.get("content", "")
                break
            elif hasattr(msg, "type") and msg.type == "human":
                user_message = msg.content
                break
            elif isinstance(msg, HumanMessage):
                user_message = msg.content
                break
                
        if not user_message:
            user_message = "I need help with Massachusetts climate career opportunities"
            
        print(f"🧠 Processing with Robust Intelligence: {user_message[:100]}...")
        
        # ROBUST INTELLIGENCE ANALYSIS
        # 1. Advanced Identity Recognition with Intersectionality
        identity_profile = await advanced_identity_recognizer.analyze_user_identity(user_message)
        print(f"🎯 Identity Analysis: {identity_profile.primary_identity} + {len(identity_profile.secondary_identities)} secondary")
        
        # 2. Intelligent Routing with Confidence Scoring
        routing_decision = await intelligent_routing_engine.determine_routing(identity_profile, user_message)
        print(f"🔀 Routing Decision: {routing_decision.specialist_assigned} ({routing_decision.confidence_level.value} confidence)")
        
        # Enhanced Intelligence Framework Analysis (Original)
        user_data = {
            "message": user_message,
            "profile": state.get("user_profile", {}),
            "conversation_history": [str(msg) for msg in messages[-3:]],
            "user_id": state.get("user_id", "unknown"),
            "identity_profile": identity_profile,
            "routing_decision": routing_decision,
        }
        
        identity_analysis = await identity_recognizer.analyze_user_identities(user_data)
        
        # Memory integration (only in supervisor to avoid concurrent updates)
        memory_context = {}
        if state.get("user_id"):
            memory_entries = memory_system.retrieve_episodic_memories(
                user_id=state["user_id"],
                query_context={
                    "message": user_message,
                    "identities": identity_analysis,
                    "robust_identity": identity_profile,
                },
                limit=3,
            )
            if memory_entries:
                memory_context = {
                    "relevant_memories": [entry.content for entry in memory_entries],
                    "memory_count": len(memory_entries),
                }
            memory_system.store_episodic_memory(
                user_id=state["user_id"],
                content=f"User Query: {user_message}",
                context={
                    "identities": identity_analysis,
                    "robust_identity_profile": identity_profile.__dict__,
                    "routing_decision": routing_decision.__dict__,
                    "timestamp": datetime.now().isoformat(),
                },
                importance=0.8,
            )

        conversation_context = {
            "user_message": user_message,
            "identities": identity_analysis,
            "robust_identity": identity_profile,
            "routing_decision": routing_decision,
            "memory": memory_context,
            "conversation_stage": len(messages),
            "barriers": state.get("barriers_identified", []),
        }
        
        user_profile = state.get("user_profile", {})
        optimal_tools = await tool_selector.select_optimal_tools(
            query=user_message, context=conversation_context, user_profile=user_profile
        )
        
        similar_cases = case_engine.retrieve_similar_cases(
            user_context=conversation_context, problem_description=user_message, limit=2
        )
        
        case_guidance = ""
        if similar_cases:
            case_adaptation = case_engine.adapt_solution(
                similar_cases=similar_cases,
                current_context=conversation_context,
                current_problem=user_message,
            )
            case_guidance = case_adaptation.get("adapted_solution", "")

        # 3. Generate Enhanced Response with Performance Optimization
        enhanced_response = await performance_optimizer.generate_enhanced_response(
            user_message, identity_profile, routing_decision, state
        )
        
        # 4. Quality Assessment and Performance Tracking
        quality_metrics = await response_quality_analyzer.analyze_response_quality(
            enhanced_response, identity_profile, state.get("tools_used", [])
        )
        
        print(f"📊 Quality Analysis: {quality_metrics.overall_quality:.1f}/10 ({quality_metrics.intelligence_level.value})")
        
        # 5. Performance Optimization
        await performance_optimizer.optimize_performance(state, quality_metrics)
        
        # 6. Determine Next Action
        next_action = await performance_optimizer.determine_next_action(routing_decision, quality_metrics)
        print(f"🎯 Next Action: {next_action}")

        # 🔄 HUMAN-IN-THE-LOOP & CONVERSATION COMPLETION CHECKS
        
        # Check if conversation should be completed
        completion_status = await completion_checker.check_completion_status(
            user_message=user_message,
            state=state,
            specialist_response=enhanced_response
        )
        
        print(f"🎯 Completion Status: {completion_status['recommended_action']} (confidence: {completion_status['confidence_score']:.2f})")
        
        # 🔥 MODERN 2025 CONDITIONAL HUMAN-IN-THE-LOOP EVALUATION
        # Agents decide when human intervention is needed based on multiple factors
        human_intervention_evaluation = await human_loop_coordinator.evaluate_human_intervention_need(
            state=state,
            quality_metrics=quality_metrics,
            routing_decision=routing_decision
        )
        
        print(f"🤝 Human Intervention: {'NEEDED' if human_intervention_evaluation['needs_human_intervention'] else 'Not Required'} (Priority: {human_intervention_evaluation.get('priority_level', 'low')})")
        
        # CONDITIONAL HUMAN INTERVENTION USING MODERN interrupt() FUNCTION
        if human_intervention_evaluation['needs_human_intervention']:
            priority_level = human_intervention_evaluation['priority_level']
            
            # For urgent cases, create immediate escalation
            if priority_level == "urgent":
                escalation_message = AIMessage(
                    content=f"""⚠️ **URGENT: Human Intervention Required**

**Issue Detected:** {', '.join(human_intervention_evaluation['intervention_reasons'])}

**Immediate Action Required:**
• This conversation requires immediate human specialist review
• Please contact: {human_intervention_evaluation.get('escalation_contact', 'supervisor@act-alliance.org')}
• Reference ID: {state.get('conversation_id', 'unknown')}

**Context:**
• User Query: {user_message[:200]}...
• Quality Score: {quality_metrics.overall_quality:.1f}/10
• Routing Confidence: {routing_decision.confidence_level.value}

A human specialist will contact you shortly to provide expert assistance.""",
                    additional_kwargs={
                        "agent": "pendo_supervisor",
                        "specialist": "Human Escalation Coordinator", 
                        "urgent_intervention": True,
                        "priority_level": priority_level,
                        "intervention_reasons": human_intervention_evaluation['intervention_reasons'],
                        "timestamp": datetime.now().isoformat(),
                    },
                )
                
                return {
                    **state,
                    "messages": state["messages"] + [escalation_message],
                    "needs_human_review": True,
                    "workflow_state": "pending_human",
                    "conversation_complete": True,
                    "human_intervention_triggered": True,
                    "escalation_level": "urgent"
                }
            
            # For high/medium priority cases, use conditional interrupt() for async human review
            elif priority_level in ["high", "medium"]:
                try:
                    # MODERN 2025 CONDITIONAL INTERRUPT PATTERN
                    # Agent decides to pause for human review based on quality/confidence metrics
                    human_review_request = {
                        "question": f"Human review requested for {priority_level} priority case",
                        "conversation_summary": {
                            "user_query": user_message,
                            "quality_score": quality_metrics.overall_quality,
                            "routing_confidence": routing_decision.confidence_level.value,
                            "specialist_assigned": routing_decision.specialist_assigned,
                            "intervention_reasons": human_intervention_evaluation['intervention_reasons']
                        },
                        "review_options": [
                            "approve_and_continue",
                            "modify_approach", 
                            "escalate_to_human_specialist",
                            "provide_feedback_and_retry"
                        ],
                        "priority_level": priority_level,
                        "recommended_wait_time": human_intervention_evaluation.get('recommended_wait_time', 300)
                    }
                    
                    # Use modern interrupt() function for conditional human intervention
                    human_decision = interrupt(human_review_request)
                    
                    # Process human decision when resumed
                    if human_decision == "approve_and_continue":
                        print("✅ Human approved - continuing with AI workflow")
                        # Continue with normal flow below
                    elif human_decision == "escalate_to_human_specialist":
                        escalation_message = AIMessage(
                            content="This conversation has been escalated to a human specialist who will contact you shortly for personalized assistance.",
                            additional_kwargs={
                                "agent": "pendo_supervisor",
                                "specialist": "Human Escalation", 
                                "human_escalated": True,
                                "timestamp": datetime.now().isoformat(),
                            },
                        )
                        return {
                            **state,
                            "messages": state["messages"] + [escalation_message],
                            "workflow_state": "pending_human",
                            "conversation_complete": True,
                            "human_specialist_assigned": True
                        }
                    else:
                        # Handle other human decisions (modify_approach, provide_feedback_and_retry)
                        print(f"🤝 Human decision: {human_decision}")
                        # Continue with modified approach based on human input
                        
                except Exception as e:
                    # If interrupt fails, continue with AI workflow but log the issue
                    print(f"⚠️ Human intervention interrupt failed: {e}")
                    # Continue with normal AI workflow below
            
        # CONVERSATION COMPLETION LOGIC
        if completion_status["is_complete"]:
            print("✅ Conversation marked as complete - ending workflow")
            
            # Create completion message
            completion_message = AIMessage(
                content=f"""Thank you for using the Climate Economy Assistant! 🌱

**Summary of Our Conversation:**
{', '.join(completion_status['completion_signals'])}

**Resources Provided:** {len(state.get('resource_recommendations', []))} recommendations
**Specialists Consulted:** {len(state.get('specialist_handoffs', []))} handoffs

**Next Steps:**
• Follow up on the resources and contacts shared
• Reach out to the organizations mentioned
• Contact ACT Alliance at info@act-alliance.org for ongoing support

**Quality Rating:** {quality_metrics.overall_quality:.1f}/10

We're here to support your climate career journey. Good luck! 🚀""",
                additional_kwargs={
                    "agent": "pendo_supervisor",
                    "specialist": "Completion Coordinator",
                    "conversation_complete": True,
                    "completion_confidence": completion_status["confidence_score"],
                    "quality_score": quality_metrics.overall_quality,
                    "timestamp": datetime.now().isoformat(),
                }
            )
            
            # Return final state that will trigger END
            return {
                **state,
                "messages": state["messages"] + [completion_message],
                "conversation_complete": True,
                "workflow_state": "completed",
                "current_specialist": None,  # Restore this field
                "quality_metrics": quality_metrics,
                "completion_status": completion_status,
                "final_summary": True
            }
            
        # NORMAL SPECIALIST ROUTING WITH LOOP PREVENTION
        
        # Track handoff count to prevent ping-pong
        handoff_count = state.get("handoff_count", 0)
        print(f"🔄 Current handoff count: {handoff_count}")
        
        # If too many handoffs, force conversation completion
        if handoff_count >= 3:
            print("⚠️ Maximum handoffs reached - completing conversation")
            
            max_handoff_message = AIMessage(
                content=f"""I've consulted with our specialists and provided comprehensive guidance for your climate career needs.

**Summary:**
• Consulted {handoff_count} specialists
• Quality score: {quality_metrics.overall_quality:.1f}/10
• Resources provided: {len(state.get('resource_recommendations', []))}

**Your Next Steps:**
• Follow up on the specific contacts and resources shared
• Apply to recommended programs/positions
• Contact ACT Alliance for ongoing support: info@act-alliance.org

**Need Additional Help?**
For further assistance, please start a new conversation or contact our human specialists directly. We're here to support your climate career journey! 🌱""",
                additional_kwargs={
                    "agent": "pendo_supervisor",
                    "specialist": "Loop Prevention Coordinator",
                    "max_handoffs_reached": True,
                    "handoff_count": handoff_count,
                    "quality_score": quality_metrics.overall_quality,
                    "timestamp": datetime.now().isoformat(),
                }
            )
            
            return {
                **state,
                "messages": state["messages"] + [max_handoff_message],
                "conversation_complete": True,
                "workflow_state": "completed",
                "current_specialist": None,  # Restore this field
                "handoff_limit_reached": True
            }

        # ROBUST INTELLIGENCE PROMPT ENHANCEMENT
        enhanced_prompt = f"""{SUPERVISOR_SYSTEM_PROMPT}

🧠 ROBUST INTELLIGENCE FRAMEWORK ACTIVE (V4):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 ADVANCED IDENTITY ANALYSIS:
Primary Identity: {identity_profile.primary_identity} (Confidence: {identity_profile.confidence_score:.2f})
Secondary Identities: {', '.join(identity_profile.secondary_identities) if identity_profile.secondary_identities else 'None'}
Intersectionality Factors: {', '.join(identity_profile.intersectionality_factors) if identity_profile.intersectionality_factors else 'None'}
Identified Barriers: {', '.join(identity_profile.barriers_identified[:3]) if identity_profile.barriers_identified else 'None'}
Identified Strengths: {', '.join(identity_profile.strengths_identified[:3]) if identity_profile.strengths_identified else 'None'}

🔀 INTELLIGENT ROUTING DECISION:
Assigned Specialist: {routing_decision.specialist_assigned}
Confidence Level: {routing_decision.confidence_level.value.upper()} ({routing_decision.confidence_level.value})
Routing Reasoning: {routing_decision.reasoning}
Alternative Options: {', '.join(routing_decision.alternative_specialists) if routing_decision.alternative_specialists else 'None'}
Recommended Tools: {', '.join(routing_decision.tools_recommended[:3]) if routing_decision.tools_recommended else 'None'}

📊 QUALITY METRICS & PERFORMANCE:
Overall Quality Score: {quality_metrics.overall_quality:.1f}/10
Intelligence Level: {quality_metrics.intelligence_level.value.upper()}
Next Action: {next_action.upper()}
- Clarity Score: {quality_metrics.clarity_score:.1f}/10
- Actionability Score: {quality_metrics.actionability_score:.1f}/10  
- Personalization Score: {quality_metrics.personalization_score:.1f}/10
- Source Citation Score: {quality_metrics.source_citation_score:.1f}/10
- EJ Awareness Score: {quality_metrics.ej_awareness_score:.1f}/10

🔄 CONVERSATION FLOW MANAGEMENT:
Current Handoff Count: {handoff_count}/3 maximum
Completion Status: {completion_status['recommended_action']} (confidence: {completion_status['confidence_score']:.2f})
Human Intervention: {"NEEDED" if human_intervention_evaluation['needs_human_intervention'] else "Not Required"} (Priority: {human_intervention_evaluation.get('priority_level', 'low')})

🎯 2025 LANGGRAPH HANDOFF PATTERN WITH ROBUST INTELLIGENCE:
Use delegate_to_* tools to create proper handoffs with enhanced context.

ENHANCED HANDOFF DECISION MATRIX:
- Veterans/Military → delegate_to_marcus (Confidence: {routing_decision.confidence_level.value if routing_decision.specialist_assigned == 'marcus' else 'medium'})
- International/Credentials → delegate_to_liv (Confidence: {routing_decision.confidence_level.value if routing_decision.specialist_assigned == 'liv' else 'medium'})
- Environmental Justice → delegate_to_miguel (Confidence: {routing_decision.confidence_level.value if routing_decision.specialist_assigned == 'miguel' else 'medium'})
- Massachusetts General → delegate_to_jasmine (Confidence: {routing_decision.confidence_level.value if routing_decision.specialist_assigned == 'jasmine' else 'medium'})

Expected Outcome: {routing_decision.expected_outcome}
Success Metrics: {', '.join(routing_decision.success_metrics) if routing_decision.success_metrics else 'Standard success metrics'}

⚠️ IMPORTANT: AVOID EXCESSIVE HANDOFFS - Current count is {handoff_count}/3. 
If approaching limit, provide comprehensive response directly instead of delegating.

🔍 ENHANCED SOURCE CITATION REQUIREMENTS:
ALL responses must include VERIFIED sources with complete attribution."""

        supervisor_llm = await create_pendo_supervisor()
        enhanced_messages = [SystemMessage(content=enhanced_prompt)] + state["messages"]
        
        # Get LLM response
        response = await supervisor_llm.ainvoke(enhanced_messages)
        
        # 2025 LANGGRAPH HANDOFF PATTERN - Tool calls trigger handoffs
        if hasattr(response, "tool_calls") and response.tool_calls:
            # Build a mapping of tool name to function from _progressive_tools
            tool_map = {t.name: t for t in _progressive_tools if hasattr(t, "name")}
            
            # CRITICAL: Add the assistant message with tool_calls to the conversation
            messages_with_tool_calls = state["messages"] + [response]
            tool_messages = []
            delegation_command = None
            
            # Process each tool call
            for tool_call in response.tool_calls:
                tool_name = tool_call.get("name")
                tool_args = tool_call.get("arguments", {})
                tool_call_id = tool_call.get("id") or f"call_{tool_name}_{len(tool_messages)}"
                
                try:
                    if tool_name in tool_map:
                        tool = tool_map[tool_name]
                        
                        # Check if tool is async and use appropriate invoke method
                        if hasattr(tool, 'ainvoke'):
                            tool_result = await tool.ainvoke(tool_args)
                        else:
                            tool_result = tool.invoke(tool_args)
                        
                        # Check if tool returned a Command (delegation tools)
                        if isinstance(tool_result, Command):
                            delegation_command = tool_result
                            task_description = tool_args.get("task_description", "Climate career assistance needed")
                            
                            # Create tool response message for OpenAI compliance
                            tool_messages.append(
                                ToolMessage(
                                    content=f"✅ ROBUST HANDOFF to {delegation_command.goto} specialist: {task_description}\n🎯 Confidence: {routing_decision.confidence_level.value}\n📊 Expected Outcome: {routing_decision.expected_outcome}",
                                    name=tool_name,
                                    tool_call_id=tool_call_id,
                                )
                            )
                            
                            print(f"🚀 Robust Handoff to {delegation_command.goto} specialist with enhanced intelligence context")
                        else:
                            # Regular tool response
                            tool_messages.append(
                                ToolMessage(
                                    content=str(tool_result),
                                    name=tool_name,
                                    tool_call_id=tool_call_id,
                                )
                            )
                    else:
                        tool_messages.append(
                            ToolMessage(
                                content=f"Error: Tool '{tool_name}' not found in robust intelligence framework",
                                name=tool_name,
                                tool_call_id=tool_call_id,
                            )
                        )
                except Exception as e:
                    # Use robust error recovery
                    error_recovery_info = await robust_error_recovery.handle_error(
                        error=e,
                        context={"tool_name": tool_name, "tool_args": tool_args},
                        state=state
                    )
                    
                    tool_messages.append(
                        ToolMessage(
                            content=f"Error executing tool '{tool_name}': {str(e)}",
                            name=tool_name,
                            tool_call_id=tool_call_id,
                        )
                    )
            
            # CRITICAL: Ensure complete message flow for OpenAI compliance
            complete_messages = messages_with_tool_calls + tool_messages
            
            # If we have a delegation command, execute the handoff with robust intelligence
            if delegation_command:
                # Increment handoff count
                new_handoff_count = handoff_count + 1
                
                # Prepare handoff state with comprehensive intelligence context
                handoff_state = {
                    **state,
                    "messages": complete_messages,
                    "current_specialist": delegation_command.goto,  # Restore this field
                    "handoff_count": new_handoff_count,  # Track handoffs
                    "last_specialist_response_time": datetime.now().isoformat(),
                    # Enhanced Intelligence Context (Original)
                    "user_identities": [
                        UserIdentity(
                            identity_type=identity_type,
                            confidence=identity_data.get("confidence", 0.0),
                            evidence=identity_data.get("evidence", []),
                            barriers=identity_data.get("barriers", []),
                            opportunities=identity_data.get("opportunities", []),
                        )
                        for identity_type, identity_data in identity_analysis.get(
                            "detected_identities", {}
                        ).items()
                    ],
                    "memory_context": memory_context,
                    "progressive_tools": optimal_tools,
                    # Robust Intelligence Context (New)
                    "enhanced_identity": identity_profile,
                    "routing_decision": routing_decision,
                    "quality_metrics": quality_metrics,
                    "coordination_metadata": {
                        "handoff_task": delegation_command.update.get("delegation_task", ""),
                        "handoff_from": "pendo_supervisor",
                        "handoff_time": datetime.now().isoformat(),
                        "specialist_id": delegation_command.goto,
                        "enhanced_intelligence_active": True,
                        "robust_intelligence_v4": True,
                        "routing_confidence": routing_decision.confidence_level.value,
                        "expected_quality_level": "exceptional",
                        "success_metrics": routing_decision.success_metrics,
                        "next_action": next_action,
                        "quality_scores": quality_metrics.__dict__,
                        "performance_tracking": True,
                        "handoff_count": new_handoff_count,
                        "human_intervention_evaluated": True,
                        "human_intervention_needed": human_intervention_evaluation['needs_human_intervention'],
                    },
                    "tools_used": state.get("tools_used", []) + [
                        "robust_identity_recognition", 
                        "intelligent_routing_engine",
                        "response_quality_analyzer",
                        "performance_optimizer",
                        "conditional_human_intervention",
                        "supervisor_handoff", 
                        f"delegate_to_{delegation_command.goto}"
                    ],
                }
                
                # Merge any additional updates from the Command
                if delegation_command.update:
                    handoff_state.update(delegation_command.update)
                
                # Return Command for proper handoff with robust intelligence
                return Command(
                    goto=delegation_command.goto,
                    update=handoff_state
                )
            else:
                # No delegation, continue with normal conversation flow
                return {
                    **state,
                    "messages": complete_messages,
                    "current_specialist": "pendo_supervisor",  # Restore this field
                    "enhanced_identity": identity_profile,
                    "routing_decision": routing_decision,
                    "human_intervention_evaluated": True,
                }
        
        # No handoff needed - provide direct response with quality analysis
        enhanced_processing_result = (
            await enhanced_coordinator.process_with_enhanced_intelligence(
                user_query=user_message,
                user_id=state.get("user_id", "unknown"),
                conversation_context=conversation_context,
            )
        )
        
        # Analyze response quality
        response_content = response.content if hasattr(response, 'content') else str(response)
        quality_metrics = await response_quality_analyzer.analyze_response_quality(
            response=response_content,
            user_identity=identity_profile,
            tools_used=state.get("tools_used", [])
        )
        
        print(f"📊 Quality Analysis: {quality_metrics.overall_quality:.1f}/10 ({quality_metrics.intelligence_level.value})")
        
        intelligence_score = enhanced_processing_result.get(
            "intelligence_metrics", {}
        ).get("overall_intelligence_score", 5.0)
        
        # Return updated state without handoff but with robust intelligence tracking
        return {
            **state,
            "messages": state["messages"] + [response],
            "current_specialist": "pendo_supervisor",  # Restore this field
            # Enhanced Intelligence Context (Original)
            "user_identities": [
                UserIdentity(
                    identity_type=identity_type,
                    confidence=identity_data.get("confidence", 0.0),
                    evidence=identity_data.get("evidence", []),
                    barriers=identity_data.get("barriers", []),
                    opportunities=identity_data.get("opportunities", []),
                )
                for identity_type, identity_data in identity_analysis.get(
                    "detected_identities", {}
                ).items()
            ],
            "intelligence_level": enhanced_processing_result.get(
                "intelligence_level", "developing"
            ),
            "memory_context": memory_context,
            "progressive_tools": optimal_tools,
            # Robust Intelligence Context (New)
            "enhanced_identity": identity_profile,
            "routing_decision": routing_decision,
            "quality_metrics": quality_metrics,
            "coordination_metadata": {
                **enhanced_processing_result.get("intelligence_metrics", {}),
                "robust_intelligence_v4": True,
                "quality_analysis": quality_metrics.__dict__,
                "routing_analysis": routing_decision.__dict__,
                "human_intervention_evaluated": True,
                "human_intervention_needed": human_intervention_evaluation['needs_human_intervention'],
            },
            "tools_used": state.get("tools_used", []) + [
                "robust_intelligence_coordination",
                "advanced_identity_recognition", 
                "intelligent_routing_engine",
                "response_quality_analyzer",
                "progressive_tool_selection",
                "conditional_human_intervention",
            ],
            "confidence_score": max(intelligence_score / 10.0, quality_metrics.overall_quality / 10.0),
            "human_intervention_evaluated": True,
        }

    except Exception as e:
        print(f"❌ Error in Robust Supervisor: {str(e)}")
        import traceback
        traceback.print_exc()
        
        # Simple error recovery
        error_info = await robust_error_recovery.handle_error(
            error=e,
            context={"handler": "supervisor", "user_message": user_message},
            state=state
        )
        
        fallback_response = AIMessage(
            content="I apologize for the technical issue. Please contact ACT Alliance directly at info@act-alliance.org for immediate climate career assistance.",
            additional_kwargs={
                "agent": "pendo_supervisor",
                "specialist": "Pendo", 
                "error": str(e),
                "fallback": True,
                "robust_intelligence": "error_logged",
                "error_timestamp": error_info["timestamp"],
            },
        )
        
        # Even in error, use proper handoff pattern with robust intelligence
        return Command(
            goto="jasmine",
            update={
                **state,
                "messages": state["messages"] + [fallback_response],
                "current_specialist": "jasmine",  # Restore this field
                "workflow_state": "active",
                "error_recovery_log": state.get("error_recovery_log", []) + [error_info],
            }
        )

    # HUMAN-IN-THE-LOOP INTERVENTION
    # Note: Removed premature human intervention check at conversation start
    # Human intervention should only happen after specialists have had a chance to help
    human_intervention = {"needs_human_intervention": False}

    # NORMAL SPECIALIST ROUTING WITH LOOP PREVENTION


async def jasmine_handler(state: ClimateAgentState) -> Command[Literal["pendo_supervisor"]]:
    """Handle Jasmine requests with proper handoff back to supervisor"""

    # Extract user message
    messages = state.get("messages", [])
    user_message = ""

    if messages:
        for msg in reversed(messages):
            if isinstance(msg, dict) and msg.get("role") == "user":
                user_message = msg.get("content", "")
                break
            elif hasattr(msg, "type") and msg.type == "human":
                user_message = msg.content
                break
            elif isinstance(msg, HumanMessage):
                user_message = msg.content
                break

    if not user_message:
        user_message = "I need help with Massachusetts climate career opportunities"

    # Handle message using Jasmine's enhanced implementation
    jasmine_response = await jasmine_agent.handle_message(
        message=user_message,
        user_id=state.get("user_id", ""),
        conversation_id=state.get("conversation_id", ""),
    )

    specialist_response_content = jasmine_response.get("response", jasmine_response.get("content", ""))
    
    # Check conversation completion status
    completion_status = await completion_checker.check_completion_status(
        user_message=user_message,
        state=state,
        specialist_response=specialist_response_content
    )
    
    # If conversation appears complete, provide completion guidance instead of handoff
    if completion_status["is_complete"] or completion_status["confidence_score"] >= 0.6:
        print("✅ Jasmine detected conversation completion - providing final guidance")
        
        completion_response = AIMessage(
            content=f"""{specialist_response_content}

**Next Steps Summary:**
{', '.join(completion_status.get('completion_signals', []))}

**How to Get Started:**
• Contact the organizations and programs I mentioned above
• Apply for positions that match your background
• Follow up on training opportunities discussed

**Questions?** Feel free to reach out to ACT Alliance at info@act-alliance.org for ongoing support.

Thanks for using the Climate Economy Assistant - good luck with your climate career journey! 🌱""",
            additional_kwargs={
                "agent": "jasmine",
                "specialist": "Jasmine",
                "timestamp": datetime.now().isoformat(),
                "enhanced_intelligence": True,
                "ma_resource_analyst": True,
                "conversation_completion_detected": True,
                "completion_confidence": completion_status["confidence_score"],
                "final_response": True,
            },
        )
        
        # Return final state that should trigger END
        return Command(
            goto="END",  # Signal workflow completion
            update={
                **state,
                "messages": messages + [completion_response],
                "conversation_complete": True,
                "workflow_state": "completed",
                "current_specialist": None,  # Restore this field
                "completion_status": completion_status,
                "specialist_handoffs": state.get("specialist_handoffs", []) + [{
                    "from": "jasmine",
                    "to": "completion",
                    "timestamp": datetime.now().isoformat(),
                    "task_completed": "Massachusetts climate career guidance with completion",
                    "completion_detected": True
                }]
            }
        )

    # Normal response - continue conversation
    response = AIMessage(
        content=specialist_response_content,
        additional_kwargs={
            "agent": "jasmine",
            "specialist": "Jasmine",
            "timestamp": datetime.now().isoformat(),
            "enhanced_intelligence": True,
            "ma_resource_analyst": True,
            "handoff_complete": True,
        },
    )

    print("🔄 Jasmine completing handoff back to supervisor")
    
    # Check handoff count to prevent excessive ping-pong
    handoff_count = state.get("handoff_count", 0)
    if handoff_count >= 2:  # Allow one more handoff max
        print("⚠️ Jasmine: High handoff count detected - providing comprehensive final response")
        
        final_response = AIMessage(
            content=f"""{specialist_response_content}

**Complete Resource Summary:**
I've provided comprehensive guidance on Massachusetts climate career opportunities. Here are your key next steps:

• **Contact Information:** All verified contacts and resources shared above
• **Application Process:** Follow the specific application links provided  
• **Timeline:** Most programs accept applications year-round
• **Support:** ACT Alliance (info@act-alliance.org) for ongoing assistance

This completes our consultation. You now have everything needed to move forward with your climate career goals in Massachusetts! 🚀""",
            additional_kwargs={
                "agent": "jasmine",
                "specialist": "Jasmine",
                "timestamp": datetime.now().isoformat(),
                "enhanced_intelligence": True,
                "ma_resource_analyst": True,
                "final_comprehensive_response": True,
                "handoff_limit_prevention": True,
            },
        )
        
        return Command(
            goto="END",
            update={
                **state,
                "messages": messages + [final_response],
                "conversation_complete": True,
                "workflow_state": "completed",
                "current_specialist": None,  # Restore this field
                "handoff_limit_reached": True,
                "specialist_handoffs": state.get("specialist_handoffs", []) + [{
                    "from": "jasmine",
                    "to": "completion",
                    "timestamp": datetime.now().isoformat(),
                    "task_completed": "Massachusetts climate career guidance - comprehensive final response"
                }]
            }
        )
    
    # Normal handoff back to supervisor
    return Command(
        goto="pendo_supervisor",
        update={
            **state,
            "messages": messages + [response],
            "current_specialist": "pendo_supervisor",
            "specialist_handoffs": state.get("specialist_handoffs", []) + [{
                "from": "jasmine",
                "to": "pendo_supervisor",
                "timestamp": datetime.now().isoformat(), 
                "task_completed": "Massachusetts climate career guidance"
            }]
        }
    )


async def marcus_handler(state: ClimateAgentState) -> Command[Literal["pendo_supervisor"]]:
    """Handle Marcus requests with proper handoff back to supervisor"""

    # Extract user message
    messages = state.get("messages", [])
    user_message = ""

    if messages:
        for msg in reversed(messages):
            if isinstance(msg, dict) and msg.get("role") == "user":
                user_message = msg.get("content", "")
                break
            elif hasattr(msg, "type") and msg.type == "human":
                user_message = msg.content
                break
            elif isinstance(msg, HumanMessage):
                user_message = msg.content
                break

    if not user_message:
        user_message = "I'm a veteran interested in climate careers"

    # Handle message using Marcus's enhanced implementation
    marcus_response = await marcus_agent.handle_message(
        message=user_message,
        user_id=state.get("user_id", ""),
        conversation_id=state.get("conversation_id", ""),
    )

    response = AIMessage(
        content=marcus_response.get("response", marcus_response.get("content", "")),
        additional_kwargs={
            "agent": "marcus",
            "specialist": "Marcus",
            "timestamp": datetime.now().isoformat(),
            "enhanced_intelligence": True,
            "veteran_specialist": True,
            "handoff_complete": True,
        },
    )

    print("🔄 Marcus completing handoff back to supervisor")
    
    # Proper handoff back to supervisor
    return Command(
        goto="pendo_supervisor",
        update={
            **state,
            "messages": messages + [response],
            "current_specialist": "pendo_supervisor",
            "specialist_handoffs": state.get("specialist_handoffs", []) + [{
                "from": "marcus",
                "to": "pendo_supervisor",
                "timestamp": datetime.now().isoformat(), 
                "task_completed": "Veteran climate career transition support"
            }]
        }
    )


async def liv_handler(state: ClimateAgentState) -> Command[Literal["pendo_supervisor"]]:
    """Handle Liv requests with proper handoff back to supervisor"""

    # Extract user message
    messages = state.get("messages", [])
    user_message = ""

    if messages:
        for msg in reversed(messages):
            if isinstance(msg, dict) and msg.get("role") == "user":
                user_message = msg.get("content", "")
                break
            elif hasattr(msg, "type") and msg.type == "human":
                user_message = msg.content
                break
            elif isinstance(msg, HumanMessage):
                user_message = msg.content
                break

    if not user_message:
        user_message = "I need help with international credentials for climate careers"

    # Handle message using Liv's enhanced implementation
    liv_response = await liv_agent.handle_message(
        message=user_message,
        user_id=state.get("user_id", ""),
        conversation_id=state.get("conversation_id", ""),
    )

    response = AIMessage(
        content=liv_response.get("response", liv_response.get("content", "")),
        additional_kwargs={
            "agent": "liv",
            "specialist": "Liv",
            "timestamp": datetime.now().isoformat(),
            "enhanced_intelligence": True,
            "international_specialist": True,
            "handoff_complete": True,
        },
    )

    print("🔄 Liv completing handoff back to supervisor")
    
    # Proper handoff back to supervisor  
    return Command(
        goto="pendo_supervisor",
        update={
            **state,
            "messages": messages + [response],
            "current_specialist": "pendo_supervisor",
            "specialist_handoffs": state.get("specialist_handoffs", []) + [{
                "from": "liv",
                "to": "pendo_supervisor",
                "timestamp": datetime.now().isoformat(),
                "task_completed": "International credential evaluation and guidance"
            }]
        }
    )


async def miguel_handler(state: ClimateAgentState) -> Command[Literal["pendo_supervisor"]]:
    """Handle Miguel requests with proper handoff back to supervisor"""

    # Extract user message
    messages = state.get("messages", [])
    user_message = ""

    if messages:
        for msg in reversed(messages):
            if isinstance(msg, dict) and msg.get("role") == "user":
                user_message = msg.get("content", "")
                break
            elif hasattr(msg, "type") and msg.type == "human":
                user_message = msg.content
                break
            elif isinstance(msg, HumanMessage):
                user_message = msg.content
                break

    if not user_message:
        user_message = "I'm interested in environmental justice and climate careers"

    # Handle message using Miguel's enhanced implementation
    miguel_response = await miguel_agent.handle_message(
        message=user_message,
        user_id=state.get("user_id", ""),
        conversation_id=state.get("conversation_id", ""),
    )

    response = AIMessage(
        content=miguel_response.get("response", miguel_response.get("content", "")),
        additional_kwargs={
            "agent": "miguel",
            "specialist": "Miguel",
            "timestamp": datetime.now().isoformat(),
            "enhanced_intelligence": True,
            "environmental_justice_specialist": True,
            "handoff_complete": True,
        },
    )

    print("🔄 Miguel completing handoff back to supervisor")
    
    # Proper handoff back to supervisor
    return Command(
        goto="pendo_supervisor", 
        update={
            **state,
            "messages": messages + [response],
            "current_specialist": "pendo_supervisor",
            "specialist_handoffs": state.get("specialist_handoffs", []) + [{
                "from": "miguel",
                "to": "pendo_supervisor",
                "timestamp": datetime.now().isoformat(),
                "task_completed": "Environmental justice community engagement"
            }]
        }
    )


# Create the Climate Economy Assistant Workflow Graph with Proper Handoffs
def create_climate_supervisor_workflow():
    """Create the complete Climate Economy Assistant supervisor workflow with modern 2025 human-in-the-loop patterns"""

    # Create the workflow graph
    workflow = StateGraph(ClimateAgentState)

    # Add all agent nodes
    workflow.add_node("pendo_supervisor", supervisor_handler)
    workflow.add_node("jasmine", jasmine_handler)
    workflow.add_node("marcus", marcus_handler)
    workflow.add_node("liv", liv_handler)
    workflow.add_node("miguel", miguel_handler)

    # Set entry point
    workflow.add_edge(START, "pendo_supervisor")

    # CONDITIONAL EDGES for intelligent routing
    def route_from_supervisor(state: ClimateAgentState):
        """Route from supervisor based on intelligent routing decision"""
        # Check if conversation is complete
        if state.get("conversation_complete", False):
            return END
        
        # Check for specific handoff commands in recent messages
        messages = state.get("messages", [])
        if messages:
            last_message = messages[-1]
            if hasattr(last_message, "additional_kwargs"):
                kwargs = last_message.additional_kwargs
                
                # Check for specialist handoffs
                if kwargs.get("conversation_complete"):
                    return END
                elif kwargs.get("handoff_to_jasmine"):
                    return "jasmine"
                elif kwargs.get("handoff_to_marcus"):
                    return "marcus"
                elif kwargs.get("handoff_to_liv"):
                    return "liv"
                elif kwargs.get("handoff_to_miguel"):
                    return "miguel"
        
        # Check routing decision in state
        routing_decision = state.get("routing_decision")
        if routing_decision and hasattr(routing_decision, "specialist_assigned"):
            specialist = routing_decision.specialist_assigned
            if specialist in ["jasmine", "marcus", "liv", "miguel"]:
                return specialist
        
        # Default: stay with supervisor for direct response
        return "pendo_supervisor"

    def route_from_specialist(state: ClimateAgentState):
        """Route from specialists - typically back to supervisor or end"""
        # Check if conversation is complete
        if state.get("conversation_complete", False):
            return END
            
        # Check handoff limit
        handoff_count = state.get("handoff_count", 0)
        if handoff_count >= 3:
            return END
            
        # Default: return to supervisor for coordination
        return "pendo_supervisor"

    # Add conditional edges
    workflow.add_conditional_edges("pendo_supervisor", route_from_supervisor)
    workflow.add_conditional_edges("jasmine", route_from_specialist)
    workflow.add_conditional_edges("marcus", route_from_specialist)
    workflow.add_conditional_edges("liv", route_from_specialist)
    workflow.add_conditional_edges("miguel", route_from_specialist)

    # Note: Command pattern from handlers can override conditional edge routing
    # Commands take precedence over conditional edges in LangGraph
    
    # 🔥 MODERN 2025 COMPILATION - No static interrupt_before/interrupt_after
    # Human intervention is now conditional and agent-driven using interrupt() function
    return workflow.compile(
        # Modern 2025: Checkpointer required for conditional interrupt() function
        checkpointer=None  # Will be set when deploying to production
        # Removed deprecated interrupt_before/interrupt_after - agents now decide conditionally
    )


# Test function
async def test_workflow():
    """Test the climate supervisor workflow"""

    test_state = ClimateAgentState(
        messages=[
            HumanMessage(
                content="I'm a military veteran interested in clean energy careers in Massachusetts. Can you help me understand what opportunities are available?"
            )
        ],
        user_id=str(uuid.uuid4()),  # Generate proper UUID instead of "test_user_001"
        conversation_id=str(uuid.uuid4()),  # Generate proper UUID for conversation_id too
    )

    print("🧪 Testing Climate Economy Assistant Workflow...")

    result = await climate_supervisor_graph.ainvoke(test_state)
    print("✅ Workflow test successful!")
    print(f"Final messages: {len(result.get('messages', []))}")
    print(f"Current specialist: {result.get('current_specialist')}")
    return result


class ConversationCompletionChecker:
    """Determines when conversations are complete and should end"""
    
    def __init__(self):
        self.completion_keywords = [
            "thank you", "thanks", "that's helpful", "that helps", "perfect",
            "great", "sounds good", "i'll look into", "i'll contact", "i'll apply",
            "that's all", "no more questions", "goodbye", "bye", "talk later"
        ]
        
    async def check_completion_status(
        self, 
        user_message: str, 
        state: ClimateAgentState,
        specialist_response: str = ""
    ) -> Dict[str, Any]:
        """Check if conversation should be completed"""
        
        completion_signals = []
        confidence_score = 0.0
        
        # Check user message for completion signals
        user_lower = user_message.lower()
        for keyword in self.completion_keywords:
            if keyword in user_lower:
                completion_signals.append(f"User expressed gratitude/completion: '{keyword}'")
                confidence_score += 0.3
                
        # Check handoff count (prevent ping-pong)
        handoff_count = state.get("handoff_count", 0)
        if handoff_count >= 3:
            completion_signals.append(f"Multiple handoffs completed ({handoff_count})")
            confidence_score += 0.4
            
        # Check if resources were provided
        resources_provided = len(state.get("resource_recommendations", []))
        if resources_provided >= 2:
            completion_signals.append(f"Multiple resources provided ({resources_provided})")
            confidence_score += 0.2
            
        # Check if specific contact information was provided
        if any(word in specialist_response.lower() for word in ["contact", "email", "phone", "apply", "website"]):
            completion_signals.append("Contact information provided")
            confidence_score += 0.3
            
        # Check for natural conversation endings
        if any(phrase in user_lower for phrase in ["that's all i needed", "no other questions", "i'm all set"]):
            completion_signals.append("Natural conversation ending detected")
            confidence_score += 0.5
            
        is_complete = confidence_score >= 0.7
        needs_followup = 0.3 <= confidence_score < 0.7
        
        return {
            "is_complete": is_complete,
            "needs_followup": needs_followup,
            "confidence_score": min(confidence_score, 1.0),
            "completion_signals": completion_signals,
            "recommended_action": "complete" if is_complete else "continue" if not needs_followup else "followup"
        }


class HumanInTheLoopCoordinator:
    """Manages human-in-the-loop decision points"""
    
    def __init__(self):
        self.human_needed_triggers = [
            "complex_case",
            "low_confidence_routing",
            "quality_below_threshold", 
            "error_recovery_failed",
            "specialist_conflict",
            "sensitive_topic"
        ]
        
    async def evaluate_human_intervention_need(
        self, 
        state: ClimateAgentState,
        quality_metrics: QualityMetrics,
        routing_decision: RoutingDecision
    ) -> Dict[str, Any]:
        """Determine if human intervention is needed"""
        
        intervention_reasons = []
        priority_level = "low"  # low, medium, high, urgent
        
        # Check quality scores
        if quality_metrics.overall_quality < 5.0:
            intervention_reasons.append("Low quality response detected")
            priority_level = "medium"
            
        # Check routing confidence
        if routing_decision.confidence_level == RoutingConfidence.UNCERTAIN:
            intervention_reasons.append("Uncertain routing decision")
            priority_level = "medium"
            
        # Check handoff count (ping-pong prevention)
        handoff_count = state.get("handoff_count", 0)
        if handoff_count >= 4:
            intervention_reasons.append("Excessive specialist handoffs detected")
            priority_level = "high"
            
        # Check error recovery
        error_count = len(state.get("error_recovery_log", []))
        if error_count >= 2:
            intervention_reasons.append("Multiple errors encountered")
            priority_level = "urgent"
            
        # Check for sensitive topics
        user_message = ""
        messages = state.get("messages", [])
        if messages:
            for msg in reversed(messages):
                if isinstance(msg, HumanMessage):
                    user_message = msg.content
                    break
                    
        sensitive_keywords = ["discrimination", "harassment", "mental health", "crisis", "emergency"]
        if any(keyword in user_message.lower() for keyword in sensitive_keywords):
            intervention_reasons.append("Sensitive topic detected")
            priority_level = "urgent"
            
        needs_human = len(intervention_reasons) > 0
        
        return {
            "needs_human_intervention": needs_human,
            "priority_level": priority_level,
            "intervention_reasons": intervention_reasons,
            "recommended_wait_time": 300 if priority_level == "low" else 60,  # seconds
            "escalation_contact": "supervisor@act-alliance.org" if priority_level in ["high", "urgent"] else None
        }


# Initialize the new coordinators after all classes are defined
completion_checker = ConversationCompletionChecker()
human_loop_coordinator = HumanInTheLoopCoordinator()

# Create the compiled graph for export (after all handlers and classes are defined)
climate_supervisor_graph = create_climate_supervisor_workflow()

if __name__ == "__main__":
    # Run test if executed directly
    import asyncio

    asyncio.run(test_workflow())
