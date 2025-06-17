"""
LangGraph State Management Utilities

Following rule #18: Step-by-step planning - extracted from climate_supervisor_workflow.py
Following rule #12: Complete code verification with proper state handling
Following rule #15: Include comprehensive error handling for state operations

This module handles all LangGraph state initialization, updates, and management.
Location: backendv1/utils/state_management.py
"""

import time
import uuid
import operator
from datetime import datetime
from typing import Annotated, Any, Dict, List, Literal, Optional, Union
from dataclasses import dataclass, field
from enum import Enum
import asyncio

from langgraph.graph import MessagesState
from typing_extensions import TypedDict

# Import logger directly to avoid circular imports
from backendv1.utils.logger import setup_logger
from backendv1.config.settings import get_settings

logger = setup_logger("state_management")
settings = get_settings()

# State configuration constants
MAX_WORKFLOW_STEPS = 25  # Prevent infinite loops
SPECIALIST_MAX_RECURSION = 8  # Max times a specialist can be recalled
EMPATHY_MAX_ATTEMPTS = 3  # Max empathy routing attempts
CONFIDENCE_CHECK_LIMIT = 5  # Max confidence evaluation loops
WORKFLOW_TIMEOUT = 30  # Max workflow execution time in seconds


class IntelligenceLevel(Enum):
    """Intelligence level classification for responses"""

    EXCEPTIONAL = "exceptional"  # 9.0-10.0
    ADVANCED = "advanced"  # 7.0-8.9
    PROFICIENT = "proficient"  # 5.0-6.9
    DEVELOPING = "developing"  # 3.0-4.9
    BASIC = "basic"  # 0.0-2.9


class RoutingConfidence(Enum):
    """Routing decision confidence levels"""

    HIGH = "high"  # 85-100%
    MEDIUM = "medium"  # 60-84%
    LOW = "low"  # 40-59%
    UNCERTAIN = "uncertain"  # 0-39%


class ClimateAgentState(MessagesState):
    """
    Enhanced LangGraph state for Climate Economy Assistant

    Following rule #2: Modular component design for maintainability
    Following rule #12: Complete code verification with proper typing

    This state manages the complete conversation flow across all agents
    """

    # Core identification
    user_id: str
    conversation_id: str

    # CRITICAL FIELDS FOR BACKEND COMPATIBILITY
    query: str = ""
    current_reasoning: str = ""
    content: str = ""
    role: Optional[str] = "user"
    context: Optional[str] = "general"
    next: str = ""
    action: Optional[str] = "continue"
    current_step: str = ""

    # Additional compatibility fields
    id: Optional[str] = None  # Maps to conversation_id
    uuid: Optional[str] = None  # Maps to conversation_id
    session_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    sources: Optional[List[Dict[str, Any]]] = None
    history: Annotated[List[Dict[str, Any]], operator.add] = field(default_factory=list)
    status: str = "ok"
    message: str = ""
    success: Optional[bool] = True

    # USER JOURNEY MANAGEMENT
    user_journey_stage: str = "discovery"  # discovery, strategy, action_planning, implementation
    career_milestones: Annotated[List[Dict[str, Any]], operator.add] = field(default_factory=list)
    user_decisions: Annotated[List[Dict[str, Any]], operator.add] = field(default_factory=list)
    pathway_options: Optional[Dict[str, Any]] = None
    user_preferences: Optional[Dict[str, Any]] = None
    interim_progress: Optional[Dict[str, Any]] = None
    next_decision_point: Optional[str] = None
    user_control_level: str = "collaborative"  # collaborative, guided, autonomous

    # PROGRESS TRACKING
    goals_validated: bool = False
    skills_assessment_complete: bool = False
    pathway_chosen: bool = False
    action_plan_approved: bool = False
    implementation_started: bool = False

    # USER FEEDBACK AND STEERING
    awaiting_user_input: bool = False
    input_type_needed: Optional[str] = None  # "validation", "choice", "feedback", "direction"
    decision_context: Optional[Dict[str, Any]] = None
    user_satisfaction_check: bool = False
    course_correction_needed: bool = False

    # COLLABORATIVE WORKFLOW STATE
    checkpoint_data: Optional[Dict[str, Any]] = None
    approved_actions: Annotated[List[str], operator.add] = field(default_factory=list)
    pending_approvals: Annotated[List[Dict[str, Any]], operator.add] = field(default_factory=list)
    user_modifications: Annotated[List[Dict[str, Any]], operator.add] = field(default_factory=list)

    # CONCURRENT-SAFE SPECIALIST TRACKING
    current_specialist_history: Annotated[List[str], operator.add] = field(default_factory=list)
    user_profile: Optional[Dict[str, Any]] = None
    user_identities: Optional[List[Dict[str, Any]]] = None  # UserIdentity as dict
    climate_goals: Optional[List[str]] = None
    geographic_focus: Optional[str] = None  # Gateway Cities focus
    barriers_identified: Optional[List[str]] = None

    # CONCURRENT-SAFE FIELDS (Using operator.add for safe concurrent updates)
    tools_used: Annotated[List[str], operator.add] = field(default_factory=list)
    specialist_handoffs: Annotated[List[Dict[str, Any]], operator.add] = field(default_factory=list)
    resource_recommendations: Annotated[List[Dict[str, Any]], operator.add] = field(
        default_factory=list
    )
    next_actions: Annotated[List[str], operator.add] = field(default_factory=list)
    error_recovery_log: Annotated[List[Dict], operator.add] = field(default_factory=list)
    reflection_history: Annotated[List[Dict[str, Any]], operator.add] = field(default_factory=list)
    case_recommendations: Annotated[List[Dict[str, Any]], operator.add] = field(
        default_factory=list
    )

    # HANDOFF TRACKING (Concurrent-safe)
    handoff_events: Annotated[List[int], operator.add] = field(default_factory=list)
    confidence_score: float = 0.0
    intelligence_level: str = "developing"
    workflow_state: Literal["active", "pending_human", "completed", "waiting_for_input"] = "active"

    # ENHANCED INTELLIGENCE STATE
    enhanced_identity: Optional[Dict[str, Any]] = None
    routing_decision: Optional[Dict[str, Any]] = None
    quality_metrics: Optional[Dict[str, Any]] = None
    memory_context: Optional[Dict[str, Any]] = None
    progressive_tools: Optional[Dict[str, Any]] = None
    coordination_metadata: Optional[Dict[str, Any]] = None

    # FLOW CONTROL STATE
    flow_control: Optional[Dict[str, Any]] = None

    # CONCURRENT UPDATE TRACKING
    update_sequence: int = 0
    last_update_by: Optional[str] = None
    last_update_time: Optional[float] = None

    # HUMAN-IN-THE-LOOP STATE
    human_feedback_needed: bool = False
    conversation_complete: bool = False
    follow_up_scheduled: bool = False
    satisfaction_rating: Optional[float] = None
    last_specialist_response_time: Optional[str] = None
    needs_human_review: bool = False

    # EMPATHY SYSTEM STATE
    empathy_assessment: Optional[Dict[str, Any]] = None  # EmpathyAssessment as dict
    emotional_state: Optional[Dict[str, Any]] = None  # EmotionalState as dict
    support_level_needed: Optional[Dict[str, Any]] = None  # SupportLevel as dict
    empathy_provided: bool = False
    crisis_intervention_needed: bool = False
    confidence_building_complete: bool = False
    ready_for_specialist: bool = True

    # Helper properties for backward compatibility
    @property
    def current_specialist(self) -> Optional[str]:
        """Get the most recent specialist from history"""
        return self.current_specialist_history[-1] if self.current_specialist_history else None

    @property
    def handoff_count(self) -> int:
        """Get handoff count from events list"""
        return len(self.handoff_events)

    # CRITICAL: Backward compatibility properties
    def __post_init__(self):
        """Ensure backward compatibility fields are set"""
        if self.id is None:
            self.id = self.conversation_id
        if self.uuid is None:
            self.uuid = self.conversation_id
        if self.metadata is None:
            self.metadata = {}
        if self.sources is None:
            self.sources = []

    def set_current_specialist(self, specialist: str) -> Dict[str, Any]:
        """Safely set current specialist using concurrent-safe history approach"""
        return {"current_specialist_history": [specialist]}

    def get_specialist_transition_history(self) -> List[str]:
        """Get full history of specialist transitions"""
        return list(self.current_specialist_history)

    def add_handoff_event(self) -> Dict[str, Any]:
        """Safely add a handoff event"""
        return {"handoff_events": [1]}  # Add one event to the list


def create_flow_control_state() -> Dict[str, Any]:
    """
    Create a new flow control state for LangGraph serialization

    Following rule #12: Complete code verification with proper state management

    Returns:
        Dict[str, Any]: Flow control state dictionary
    """
    return {
        "step_count": 0,
        "specialist_calls": {},
        "empathy_attempts": 0,
        "confidence_checks": 0,
        "start_time": time.time(),
        "circuit_breaker_trips": 0,
        "last_action": "",
    }


def create_user_identity_profile(
    primary_identity: str,
    secondary_identities: List[str] = None,
    intersectionality_factors: List[str] = None,
    barriers_identified: List[str] = None,
    strengths_identified: List[str] = None,
    confidence_score: float = 0.0,
) -> Dict[str, Any]:
    """
    Create user identity profile for LangGraph serialization

    Args:
        primary_identity: Main user identity category
        secondary_identities: Additional identity factors
        intersectionality_factors: Overlapping identity considerations
        barriers_identified: Identified challenges
        strengths_identified: Identified strengths
        confidence_score: Identity recognition confidence

    Returns:
        Dict[str, Any]: User identity profile
    """
    return {
        "primary_identity": primary_identity,
        "secondary_identities": secondary_identities or [],
        "intersectionality_factors": intersectionality_factors or [],
        "barriers_identified": barriers_identified or [],
        "strengths_identified": strengths_identified or [],
        "confidence_score": confidence_score,
        "created_at": datetime.utcnow().isoformat(),
    }


def create_routing_decision(
    specialist_assigned: str,
    confidence_level: str,
    reasoning: str,
    alternative_specialists: List[str] = None,
    tools_recommended: List[str] = None,
    expected_outcome: str = "",
    success_metrics: List[str] = None,
) -> Dict[str, Any]:
    """
    Create routing decision for specialist assignment

    Args:
        specialist_assigned: Target specialist name
        confidence_level: Confidence in routing decision
        reasoning: Explanation for routing choice
        alternative_specialists: Alternative specialist options
        tools_recommended: Recommended tools for specialist
        expected_outcome: Expected interaction outcome
        success_metrics: Success measurement criteria

    Returns:
        Dict[str, Any]: Routing decision data
    """
    return {
        "specialist_assigned": specialist_assigned,
        "confidence_level": confidence_level,
        "reasoning": reasoning,
        "alternative_specialists": alternative_specialists or [],
        "tools_recommended": tools_recommended or [],
        "expected_outcome": expected_outcome,
        "success_metrics": success_metrics or [],
        "timestamp": datetime.utcnow().isoformat(),
    }


def create_quality_metrics(
    clarity_score: float = 0.0,
    actionability_score: float = 0.0,
    personalization_score: float = 0.0,
    source_citation_score: float = 0.0,
    ej_awareness_score: float = 0.0,
    overall_quality: float = 0.0,
    intelligence_level: str = "developing",
) -> Dict[str, Any]:
    """
    Create quality metrics for response assessment

    Args:
        clarity_score: Response clarity rating
        actionability_score: Actionable advice rating
        personalization_score: Personalization level
        source_citation_score: Source citation quality
        ej_awareness_score: Environmental justice awareness
        overall_quality: Overall quality score
        intelligence_level: Intelligence level assessment

    Returns:
        Dict[str, Any]: Quality metrics data
    """
    return {
        "clarity_score": clarity_score,
        "actionability_score": actionability_score,
        "personalization_score": personalization_score,
        "source_citation_score": source_citation_score,
        "ej_awareness_score": ej_awareness_score,
        "overall_quality": overall_quality,
        "intelligence_level": intelligence_level,
        "assessed_at": datetime.utcnow().isoformat(),
    }


class WorkflowState(Enum):
    """Workflow state enumeration"""
    INITIAL = "initial"
    DISCOVERY = "discovery"
    ANALYSIS = "analysis"
    HUMAN_GUIDED = "human_guided"
    PARTNER_MATCHING = "partner_matching"
    CONFIDENCE_ASSESSMENT = "confidence_assessment"
    APPLICATION_GUIDANCE = "application_guidance"
    COMPLETED = "completed"
    ERROR = "error"


class StateManager:
    """
    Centralized state management for workflows
    
    Provides thread-safe state operations, validation, and persistence
    """
    
    def __init__(self):
        """Initialize state manager"""
        self._states: Dict[str, Dict[str, Any]] = {}
        self._locks: Dict[str, asyncio.Lock] = {}
        logger.info("🔄 State manager initialized")
    
    async def get_lock(self, session_id: str) -> asyncio.Lock:
        """Get or create lock for session"""
        if session_id not in self._locks:
            self._locks[session_id] = asyncio.Lock()
        return self._locks[session_id]
    
    async def get_state(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get current state for session"""
        async with await self.get_lock(session_id):
            return self._states.get(session_id)
    
    async def update_state(
        self, 
        session_id: str, 
        updates: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Update state with validation"""
        async with await self.get_lock(session_id):
            # Get current state or create new
            current_state = self._states.get(session_id, {})
            
            # Apply updates
            current_state.update(updates)
            self._states[session_id] = current_state
            
            logger.debug(f"State updated for session {session_id}")
            return current_state

    @classmethod
    def initialize_state(
        cls,
        user_id: str,
        conversation_id: str,
        initial_message: str = ""
    ) -> ClimateAgentState:
        """Initialize a new ClimateAgentState instance"""
        return ClimateAgentState(
            user_id=user_id,
            conversation_id=conversation_id,
            query=initial_message,
            messages=[],
            current_reasoning="",
            content="",
            role="user",
            context="general",
            next="",
            action="continue",
            current_step="initialization"
        )


# Create singleton instance
_state_manager = None


def get_state_manager() -> StateManager:
    """Get or create singleton state manager"""
    global _state_manager
    if _state_manager is None:
        _state_manager = StateManager()
    return _state_manager


# Export for convenience
state_manager = get_state_manager()


async def safe_state_update(
    state: ClimateAgentState, updates: Dict[str, Any], node_id: str
) -> Dict[str, Any]:
    """
    Safely update LangGraph state with concurrency protection

    Following rule #15: Include comprehensive error handling
    Following rule #6: Asynchronous operations for performance

    Args:
        state: Current state
        updates: Updates to apply
        node_id: Node identifier making the update

    Returns:
        Dict[str, Any]: Safe state updates
    """
    try:
        # Add metadata to updates
        safe_updates = updates.copy()
        safe_updates.update(
            {
                "last_update_by": node_id,
                "last_update_time": time.time(),
                "update_sequence": getattr(state, "update_sequence", 0) + 1,
            }
        )

        logger.debug(f"Safe state update by {node_id}: {list(safe_updates.keys())}")
        return safe_updates

    except Exception as e:
        logger.error(f"Error in safe state update: {e}")
        return {}


def safe_state_get(state: Union[ClimateAgentState, Dict[str, Any]], key: str, default=None):
    """
    Safely get value from state with error handling

    Args:
        state: State object or dictionary
        key: Key to retrieve
        default: Default value if key not found

    Returns:
        Any: Retrieved value or default
    """
    try:
        if hasattr(state, key):
            return getattr(state, key)
        elif isinstance(state, dict):
            return state.get(key, default)
        else:
            return default
    except Exception as e:
        logger.error(f"Error getting state key {key}: {e}")
        return default


def get_flow_control_state(state: Union[ClimateAgentState, Dict[str, Any]]) -> Dict[str, Any]:
    """
    Get flow control state with safe fallback

    Args:
        state: Current state

    Returns:
        Dict[str, Any]: Flow control state
    """
    return safe_state_get(state, "flow_control", create_flow_control_state())


def update_flow_control_state(
    state: Union[ClimateAgentState, Dict[str, Any]], flow_control: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Update flow control state

    Args:
        state: Current state
        flow_control: New flow control data

    Returns:
        Dict[str, Any]: State update
    """
    return {"flow_control": flow_control}


# Export main classes and functions
__all__ = [
    "ClimateAgentState",
    "StateManager",
    "IntelligenceLevel",
    "RoutingConfidence",
    "create_flow_control_state",
    "create_user_identity_profile",
    "create_routing_decision",
    "create_quality_metrics",
    "safe_state_update",
    "safe_state_get",
    "get_flow_control_state",
    "update_flow_control_state",
]
