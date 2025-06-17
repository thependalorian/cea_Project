"""
Empathy Models for Climate Economy Assistant

Pydantic models for emotional intelligence, empathy detection, and supportive response generation.
Designed to work with LangGraph conditional edges for enhanced user experience.
"""

from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional, Union

from pydantic import BaseModel, Field, validator


class EmotionalState(str, Enum):
    """Enumeration of detected emotional states"""

    OVERWHELMED = "overwhelmed"
    ANXIOUS = "anxious"
    CONFIDENT = "confident"
    FRUSTRATED = "frustrated"
    HOPEFUL = "hopeful"
    DISCOURAGED = "discouraged"
    EXCITED = "excited"
    UNCERTAIN = "uncertain"
    STRESSED = "stressed"
    MOTIVATED = "motivated"


class SupportLevel(str, Enum):
    """Required level of empathetic support"""

    MINIMAL = "minimal"  # Standard professional response
    MODERATE = "moderate"  # Enhanced encouragement and validation
    HIGH = "high"  # Deep empathy, confidence building
    CRISIS = "crisis"  # Immediate emotional support needed


class EmpathyTrigger(str, Enum):
    """Specific triggers requiring empathetic response"""

    TRANSITION_ANXIETY = "transition_anxiety"
    IMPOSTER_SYNDROME = "imposter_syndrome"
    OVERWHELM = "overwhelm"
    CONFIDENCE_CRISIS = "confidence_crisis"
    MULTIPLE_BARRIERS = "multiple_barriers"
    PAST_FAILURE = "past_failure"
    AGE_CONCERN = "age_concern"
    FINANCIAL_STRESS = "financial_stress"
    FAMILY_PRESSURE = "family_pressure"
    DISCRIMINATION_FEAR = "discrimination_fear"


class EmotionalIndicators(BaseModel):
    """Detected emotional indicators in user message"""

    # Primary emotions detected
    dominant_emotion: EmotionalState = Field(
        ..., description="Primary emotional state detected"
    )
    secondary_emotions: List[EmotionalState] = Field(
        default_factory=list, description="Additional emotions present"
    )

    # Confidence and anxiety levels (0.0 to 1.0)
    confidence_level: float = Field(
        0.5, ge=0.0, le=1.0, description="User confidence level"
    )
    anxiety_level: float = Field(
        0.0, ge=0.0, le=1.0, description="Detected anxiety level"
    )
    motivation_level: float = Field(
        0.5, ge=0.0, le=1.0, description="User motivation level"
    )

    # Specific triggers
    empathy_triggers: List[EmpathyTrigger] = Field(
        default_factory=list, description="Specific empathy triggers detected"
    )

    # Support requirements
    support_level_needed: SupportLevel = Field(
        SupportLevel.MINIMAL, description="Required support level"
    )

    # Detection confidence
    detection_confidence: float = Field(
        0.7, ge=0.0, le=1.0, description="Confidence in emotional assessment"
    )


class IntersectionalContext(BaseModel):
    """Intersectional factors affecting emotional needs"""

    # Identity factors
    identities: List[str] = Field(
        default_factory=list,
        description="User identities (veteran, international, etc.)",
    )
    intersectional_barriers: List[str] = Field(
        default_factory=list, description="Compound barriers faced"
    )

    # Socioeconomic factors
    economic_stress: bool = Field(False, description="Financial stress detected")
    family_responsibilities: bool = Field(
        False, description="Family/caregiving responsibilities"
    )
    geographic_isolation: bool = Field(False, description="Geographic barriers")

    # Systemic barriers
    discrimination_concerns: bool = Field(
        False, description="Discrimination/bias concerns"
    )
    language_barriers: bool = Field(False, description="Language access challenges")
    credential_barriers: bool = Field(
        False, description="Credential recognition issues"
    )


class EmpathyStrategy(BaseModel):
    """Strategy for empathetic response"""

    # Response approach
    validation_approach: str = Field(..., description="How to validate user experience")
    confidence_building: List[str] = Field(
        default_factory=list, description="Confidence building techniques"
    )
    reframing_strategy: Optional[str] = Field(
        None, description="How to reframe challenges as strengths"
    )

    # Specific interventions
    immediate_support: List[str] = Field(
        default_factory=list, description="Immediate support actions"
    )
    follow_up_needed: bool = Field(
        False, description="Whether follow-up support is needed"
    )
    escalation_required: bool = Field(
        False, description="Whether human intervention needed"
    )

    # Messaging approach
    tone: str = Field("warm_professional", description="Tone for response")
    language_style: str = Field("encouraging", description="Language style to use")
    pace: str = Field("measured", description="Response pacing")


class EmpathyAssessment(BaseModel):
    """Complete empathy assessment for user interaction"""

    # User context
    user_id: str = Field(..., description="User identifier")
    conversation_id: str = Field(..., description="Conversation identifier")
    message: str = Field(..., description="User message triggering assessment")

    # Assessment results
    emotional_indicators: EmotionalIndicators = Field(
        ..., description="Detected emotional state"
    )
    intersectional_context: IntersectionalContext = Field(
        ..., description="Intersectional factors"
    )
    empathy_strategy: EmpathyStrategy = Field(
        ..., description="Recommended empathy strategy"
    )

    # Workflow control
    requires_empathy_first: bool = Field(
        False, description="Should empathy response precede specialist routing"
    )
    skip_to_human: bool = Field(
        False, description="Should escalate directly to human support"
    )

    # Metadata
    assessment_timestamp: datetime = Field(default_factory=datetime.now)
    assessment_confidence: float = Field(
        0.7, ge=0.0, le=1.0, description="Overall assessment confidence"
    )

    @validator("requires_empathy_first")
    def determine_empathy_priority(cls, v, values):
        """Determine if empathy response should precede specialist routing"""
        indicators = values.get("emotional_indicators")
        if not indicators:
            return False

        # High priority conditions
        if (
            indicators.anxiety_level > 0.6
            or indicators.confidence_level < 0.3
            or indicators.support_level_needed
            in [SupportLevel.HIGH, SupportLevel.CRISIS]
            or EmpathyTrigger.CONFIDENCE_CRISIS in indicators.empathy_triggers
        ):
            return True

        return False


class EmpathyResponse(BaseModel):
    """Generated empathetic response"""

    # Response content
    content: str = Field(..., description="Empathetic response content")
    validation_message: str = Field(..., description="Validation of user experience")
    encouragement: str = Field(..., description="Encouragement and confidence building")
    next_steps_preview: str = Field(..., description="Preview of helpful next steps")

    # Response metadata
    empathy_score: float = Field(
        0.0, ge=0.0, le=1.0, description="Empathy level of response"
    )
    support_level_provided: SupportLevel = Field(
        ..., description="Level of support provided"
    )

    # Workflow integration
    ready_for_specialist: bool = Field(
        True, description="User ready for specialist routing"
    )
    specialist_context: Dict[str, Any] = Field(
        default_factory=dict, description="Context for specialist"
    )

    # Follow-up
    follow_up_scheduled: bool = Field(False, description="Follow-up support scheduled")
    human_handoff_needed: bool = Field(
        False, description="Human intervention recommended"
    )


class EmpathyWorkflowState(BaseModel):
    """State for empathy workflow processing"""

    # Input
    original_message: str = Field(..., description="Original user message")
    user_context: Dict[str, Any] = Field(
        default_factory=dict, description="User profile context"
    )

    # Assessment
    empathy_assessment: Optional[EmpathyAssessment] = Field(
        None, description="Empathy assessment results"
    )

    # Response
    empathy_response: Optional[EmpathyResponse] = Field(
        None, description="Generated empathy response"
    )

    # Workflow control
    empathy_complete: bool = Field(False, description="Empathy processing complete")
    route_to_specialist: bool = Field(
        True, description="Should route to specialist after empathy"
    )
    recommended_specialist: Optional[str] = Field(
        None, description="Recommended specialist type"
    )

    # State tracking
    processing_stage: str = Field("assessment", description="Current processing stage")
    error_state: Optional[str] = Field(None, description="Error state if any")


# Response templates for different emotional states
EMPATHY_TEMPLATES = {
    EmotionalState.OVERWHELMED: {
        "validation": "I can sense you're feeling overwhelmed right now, and that's completely understandable.",
        "encouragement": "Taking this step to explore new opportunities shows real courage and determination.",
        "reframe": "Feeling overwhelmed often means you care deeply about making the right choice.",
    },
    EmotionalState.ANXIOUS: {
        "validation": "Career transitions can feel really anxiety-provoking, and those feelings are valid.",
        "encouragement": "Many successful people in climate careers started exactly where you are now.",
        "reframe": "Your thoughtfulness about this change shows you'll approach it strategically.",
    },
    EmotionalState.DISCOURAGED: {
        "validation": "I hear the discouragement in your message, and I want you to know that's normal.",
        "encouragement": "Every career transition has ups and downs - you're not behind, you're on your path.",
        "reframe": "Discouragement often comes right before breakthrough moments.",
    },
    EmotionalState.UNCERTAIN: {
        "validation": "Uncertainty is one of the hardest feelings to sit with during career exploration.",
        "encouragement": "Not knowing exactly where you're headed actually opens up more possibilities.",
        "reframe": "Your openness to uncertainty shows flexibility - a key trait for climate careers.",
    },
}

# Support intervention templates
SUPPORT_INTERVENTIONS = {
    SupportLevel.HIGH: [
        "Let's take this one step at a time",
        "You don't have to figure everything out today",
        "Your journey is unique and valid",
        "Small steps forward are still progress",
    ],
    SupportLevel.CRISIS: [
        "I want you to know you're not alone in this",
        "These feelings are temporary and manageable",
        "Let's focus on just the next small step",
        "Your well-being is the most important thing",
    ],
}
