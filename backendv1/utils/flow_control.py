"""
LangGraph Flow Control and Routing Utilities

Following rule #18: Step-by-step planning - extracted routing logic from climate_supervisor_workflow.py
Following rule #12: Complete code verification with proper routing mechanisms
Following rule #15: Include comprehensive error handling for flow control

This module handles workflow routing, specialist assignment, and flow control logic.
Location: backendv1/utils/flow_control.py
"""

import asyncio
import re
from typing import Any, Dict, List, Optional, Tuple
from datetime import datetime
from enum import Enum

from backendv1.utils.logger import setup_logger
from backendv1.utils.state_management import (
    ClimateAgentState,
    StateManager,
    RoutingConfidence,
    create_routing_decision,
    safe_state_get,
)

logger = setup_logger("flow_control")


class SpecialistType(Enum):
    """Available specialist types in the system"""

    LAUREN = "lauren"  # Climate Career Specialist
    MAI = "mai"  # Resume & Career Transition Specialist
    MARCUS = "marcus"  # Veterans Specialist
    MIGUEL = "miguel"  # Environmental Justice Specialist
    LIV = "liv"  # International Support Specialist
    JASMINE = "jasmine"  # MA Resources Analyst
    ALEX = "alex"  # Empathy Specialist


class FlowController:
    """
    Main flow control class for routing and workflow management

    Following rule #2: Create modular components for easy maintenance
    Following rule #15: Include comprehensive error handling
    """

    def __init__(self):
        self.identity_recognizer = AdvancedIdentityRecognizer()
        self.routing_engine = IntelligentRoutingEngine()
        self.confidence_dialogue = ConfidenceBasedDialogue()

    async def determine_next_action(
        self, state: ClimateAgentState, user_message: str
    ) -> Dict[str, Any]:
        """
        Determine the next action in the workflow

        Following rule #6: Asynchronous data handling for performance

        Args:
            state: Current workflow state
            user_message: User's message

        Returns:
            Dict[str, Any]: Next action decision
        """
        try:
            # Check workflow limits
            if not StateManager.check_recursion_limits(state):
                return StateManager.create_circuit_breaker_response("Workflow limits exceeded")

            # Analyze user identity
            identity_profile = await self.identity_recognizer.analyze_user_identity(user_message)

            # Determine routing
            routing_decision = await self.routing_engine.determine_routing(
                identity_profile, user_message
            )

            # Handle confidence-based routing
            if routing_decision["confidence_level"] == RoutingConfidence.LOW.value:
                return await self.confidence_dialogue.evaluate_confidence_and_respond(
                    user_message, identity_profile, routing_decision, state
                )

            # Standard routing
            return await self._execute_routing(state, routing_decision)

        except Exception as e:
            logger.error(f"Error determining next action: {e}")
            return {
                "action": "error",
                "specialist": "alex",  # Default to empathy specialist for errors
                "reason": str(e),
            }

    async def _execute_routing(
        self, state: ClimateAgentState, routing_decision: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Execute the routing decision

        Args:
            state: Current state
            routing_decision: Routing decision data

        Returns:
            Dict[str, Any]: Routing execution result
        """
        specialist = routing_decision["specialist_assigned"]

        # Track specialist call
        flow_updates = StateManager.track_specialist_call(state, specialist)

        return {
            "action": "route_to_specialist",
            "specialist": specialist,
            "confidence": routing_decision["confidence_level"],
            "reasoning": routing_decision["reasoning"],
            "tools_recommended": routing_decision.get("tools_recommended", []),
            "state_updates": flow_updates,
        }


class AdvancedIdentityRecognizer:
    """
    Advanced identity recognition for users with intersectionality support

    Following rule #3: Component documentation explaining purpose and functionality
    """

    def __init__(self):
        # EXPLICIT IDENTITY PHRASES (High confidence patterns)
        self.explicit_patterns = {
            "veteran": [
                r"\b(veteran|vet|military|army|navy|air force|marine|coast guard)\b",
                r"\b(served|deployment|combat|base|rank|discharge)\b",
                r"\bMOS\b",
                r"\b(enlisted|officer|active duty|reserve|national guard)\b",
            ],
            "international": [
                r"\b(visa|green card|work permit|h1b|opt|cpt)\b",
                r"\b(international student|foreign|immigrant|refugee)\b",
                r"\b(credential evaluation|degree recognition)\b",
                r"\b(english as second language|esl|accent)\b",
            ],
            "environmental_justice": [
                r"\b(environmental justice|ej|gateway cities)\b",
                r"\b(community organizing|grassroots|advocacy)\b",
                r"\b(pollution|toxic|contamination|environmental racism)\b",
                r"\b(frontline communities|disadvantaged communities)\b",
            ],
            "career_transition": [
                r"\b(career change|transition|pivot|switch)\b",
                r"\b(new field|different industry|change direction)\b",
                r"\b(laid off|unemployed|job loss|downsizing)\b",
                r"\b(mid-career|late career)\b",
            ],
            "resume_help": [
                r"\b(resume|cv|curriculum vitae)\b",
                r"\b(ats|applicant tracking|job application)\b",
                r"\b(interview|cover letter|linkedin)\b",
                r"\b(skills assessment|portfolio)\b",
            ],
            "ma_specific": [
                r"\b(massachusetts|ma|boston|cambridge|springfield|worcester)\b",
                r"\b(mbta|commuter rail|mass pike|route 128)\b",
                r"\b(umass|mit|harvard|northeastern|boston university)\b",
            ],
        }

        # Context indicators for nuanced recognition
        self.context_indicators = {
            "barriers": [
                r"\b(struggle|difficult|challenge|barrier|obstacle)\b",
                r"\b(discrimination|bias|unfair|excluded)\b",
                r"\b(language barrier|cultural difference)\b",
            ],
            "strengths": [
                r"\b(experience|expertise|skilled|talented)\b",
                r"\b(leadership|management|team|project)\b",
                r"\b(bilingual|multilingual|diverse background)\b",
            ],
            "urgency": [
                r"\b(urgent|asap|quickly|soon|immediate)\b",
                r"\b(deadline|time sensitive|running out of time)\b",
            ],
        }

    async def analyze_user_identity(self, message: str) -> Dict[str, Any]:
        """
        Analyze user message to identify key characteristics

        Args:
            message: User's message

        Returns:
            Dict[str, Any]: Identity analysis results
        """
        try:
            message_lower = message.lower()
            identities = []
            confidence_scores = {}

            # Check explicit patterns
            for identity, patterns in self.explicit_patterns.items():
                score = 0
                matches = []

                for pattern in patterns:
                    if re.search(pattern, message_lower, re.IGNORECASE):
                        score += 1
                        matches.append(pattern)

                if score > 0:
                    confidence = min(score / len(patterns), 1.0)
                    identities.append(identity)
                    confidence_scores[identity] = confidence

            # Determine primary identity (highest confidence)
            primary_identity = "general"
            if identities:
                primary_identity = max(confidence_scores, key=confidence_scores.get)

            # Check for intersectionality factors
            intersectionality = []
            if len(identities) > 1:
                intersectionality = identities.copy()
                intersectionality.remove(primary_identity)

            # Identify barriers and strengths
            barriers = self._identify_context_factors(message_lower, "barriers")
            strengths = self._identify_context_factors(message_lower, "strengths")

            return {
                "primary_identity": primary_identity,
                "secondary_identities": intersectionality,
                "confidence_score": confidence_scores.get(primary_identity, 0.1),
                "barriers_identified": barriers,
                "strengths_identified": strengths,
                "analysis_timestamp": datetime.utcnow().isoformat(),
                "message_keywords": self._extract_keywords(message_lower),
            }

        except Exception as e:
            logger.error(f"Error analyzing user identity: {e}")
            return {
                "primary_identity": "general",
                "secondary_identities": [],
                "confidence_score": 0.1,
                "barriers_identified": [],
                "strengths_identified": [],
                "analysis_timestamp": datetime.utcnow().isoformat(),
                "error": str(e),
            }

    def _identify_context_factors(self, message: str, factor_type: str) -> List[str]:
        """Identify context factors like barriers or strengths"""
        factors = []
        patterns = self.context_indicators.get(factor_type, [])

        for pattern in patterns:
            if re.search(pattern, message, re.IGNORECASE):
                factors.append(pattern.replace(r"\b", "").replace("|", " or "))

        return factors

    def _extract_keywords(self, message: str) -> List[str]:
        """Extract key terms from the message"""
        # Simple keyword extraction - could be enhanced with NLP
        climate_keywords = [
            "climate",
            "environment",
            "green",
            "clean energy",
            "sustainability",
            "renewable",
            "solar",
            "wind",
            "carbon",
            "emissions",
            "esg",
        ]

        found_keywords = []
        for keyword in climate_keywords:
            if keyword in message:
                found_keywords.append(keyword)

        return found_keywords


class IntelligentRoutingEngine:
    """
    Intelligent routing engine for specialist assignment

    Following rule #12: Complete code verification with proper routing logic
    """

    def __init__(self):
        # Specialist capability matrix
        self.specialist_capabilities = {
            "lauren": {
                "primary_focus": ["climate", "general", "career_guidance"],
                "secondary_focus": ["sustainability", "green_jobs"],
                "tools": ["web_search", "job_matching", "resource_search"],
                "confidence_threshold": 0.3,
            },
            "mai": {
                "primary_focus": ["resume_help", "career_transition"],
                "secondary_focus": ["interview_prep", "linkedin"],
                "tools": ["resume_analysis", "ats_optimization", "skills_assessment"],
                "confidence_threshold": 0.5,
            },
            "marcus": {
                "primary_focus": ["veteran"],
                "secondary_focus": ["military_transition", "benefits"],
                "tools": ["mos_translation", "veteran_resources", "skills_translation"],
                "confidence_threshold": 0.7,
            },
            "miguel": {
                "primary_focus": ["environmental_justice"],
                "secondary_focus": ["community", "advocacy", "equity"],
                "tools": ["ej_resources", "community_search", "advocacy_tools"],
                "confidence_threshold": 0.6,
            },
            "liv": {
                "primary_focus": ["international"],
                "secondary_focus": ["visa", "credentials", "immigration"],
                "tools": ["credential_evaluation", "visa_guidance", "international_resources"],
                "confidence_threshold": 0.6,
            },
            "jasmine": {
                "primary_focus": ["ma_specific"],
                "secondary_focus": ["massachusetts", "local_resources"],
                "tools": ["ma_resources", "local_search", "state_programs"],
                "confidence_threshold": 0.4,
            },
            "alex": {
                "primary_focus": ["empathy", "crisis", "confidence"],
                "secondary_focus": ["emotional_support", "motivation"],
                "tools": ["empathy_assessment", "confidence_building", "crisis_support"],
                "confidence_threshold": 0.2,
            },
        }

    async def determine_routing(
        self, user_identity: Dict[str, Any], message: str
    ) -> Dict[str, Any]:
        """
        Determine which specialist to route to based on user identity and needs

        Args:
            user_identity: User identity analysis results
            message: User's message

        Returns:
            Dict[str, Any]: Routing decision
        """
        try:
            primary_identity = user_identity["primary_identity"]
            confidence_score = user_identity["confidence_score"]

            # Score each specialist
            specialist_scores = {}

            for specialist, capabilities in self.specialist_capabilities.items():
                score = 0

                # Primary focus match
                if primary_identity in capabilities["primary_focus"]:
                    score += 3

                # Secondary focus match
                for secondary in user_identity.get("secondary_identities", []):
                    if secondary in capabilities["secondary_focus"]:
                        score += 2

                # Confidence threshold check
                if confidence_score >= capabilities["confidence_threshold"]:
                    score += 1

                # Keyword matching
                message_keywords = user_identity.get("message_keywords", [])
                for keyword in message_keywords:
                    if keyword in str(capabilities):
                        score += 0.5

                specialist_scores[specialist] = score

            # Determine best specialist
            best_specialist = max(specialist_scores, key=specialist_scores.get)
            best_score = specialist_scores[best_specialist]

            # Determine confidence level
            if best_score >= 4:
                confidence_level = RoutingConfidence.HIGH.value
            elif best_score >= 2:
                confidence_level = RoutingConfidence.MEDIUM.value
            elif best_score >= 1:
                confidence_level = RoutingConfidence.LOW.value
            else:
                confidence_level = RoutingConfidence.UNCERTAIN.value
                best_specialist = "lauren"  # Default to Lauren for uncertain cases

            # Generate alternative specialists
            alternatives = sorted(
                [
                    (spec, score)
                    for spec, score in specialist_scores.items()
                    if spec != best_specialist
                ],
                key=lambda x: x[1],
                reverse=True,
            )[:2]

            return create_routing_decision(
                specialist_assigned=best_specialist,
                confidence_level=confidence_level,
                reasoning=f"Primary identity '{primary_identity}' best matches {best_specialist} capabilities (score: {best_score})",
                alternative_specialists=[alt[0] for alt in alternatives],
                tools_recommended=self.specialist_capabilities[best_specialist]["tools"],
                expected_outcome=f"Specialized assistance for {primary_identity} needs",
            )

        except Exception as e:
            logger.error(f"Error determining routing: {e}")
            return create_routing_decision(
                specialist_assigned="lauren",
                confidence_level=RoutingConfidence.LOW.value,
                reasoning=f"Error in routing analysis: {e}",
                expected_outcome="General climate career guidance",
            )


class ConfidenceBasedDialogue:
    """
    Handles dialogue when routing confidence is low

    Following rule #15: Include error checks and fallback mechanisms
    """

    def __init__(self):
        self.confidence_prompts = {
            "clarification_needed": "I want to make sure I connect you with the right specialist. Could you tell me more about your specific needs?",
            "identity_confirmation": "Based on what you've shared, I think you might benefit from {specialist} assistance. Does that sound right to you?",
            "multiple_options": "I see several ways I could help you. Would you prefer guidance on {option1} or {option2}?",
        }

    async def evaluate_confidence_and_respond(
        self,
        user_message: str,
        identity_profile: Dict[str, Any],
        routing_decision: Dict[str, Any],
        state: ClimateAgentState,
    ) -> Dict[str, Any]:
        """
        Handle low-confidence routing with clarification

        Args:
            user_message: User's message
            identity_profile: Identity analysis
            routing_decision: Initial routing decision
            state: Current state

        Returns:
            Dict[str, Any]: Confidence-based response
        """
        try:
            # Check if clarification is needed
            clarification_type = self._identify_clarification_needed(
                user_message, identity_profile, routing_decision
            )

            if clarification_type:
                clarification_message = self._generate_clarification_message(
                    clarification_type, identity_profile, routing_decision
                )

                return {
                    "action": "request_clarification",
                    "message": clarification_message,
                    "awaiting_user_input": True,
                    "clarification_type": clarification_type,
                }

            # Generate confirmation message
            confirmation_message = self._generate_confirmation_message(
                identity_profile, routing_decision
            )

            return {
                "action": "confirm_routing",
                "message": confirmation_message,
                "specialist": routing_decision["specialist_assigned"],
                "awaiting_confirmation": True,
            }

        except Exception as e:
            logger.error(f"Error in confidence-based dialogue: {e}")
            return {
                "action": "route_to_specialist",
                "specialist": "lauren",  # Safe default
                "reason": "fallback_routing",
            }

    def _identify_clarification_needed(
        self,
        message: str,
        identity_profile: Dict[str, Any],
        routing_decision: Dict[str, Any],
    ) -> Optional[str]:
        """Identify what type of clarification is needed"""

        # Very low confidence - need more information
        if identity_profile["confidence_score"] < 0.2:
            return "clarification_needed"

        # Multiple strong identities - need to prioritize
        if len(identity_profile.get("secondary_identities", [])) >= 2:
            return "multiple_options"

        # Medium confidence - confirm understanding
        if routing_decision["confidence_level"] == RoutingConfidence.LOW.value:
            return "identity_confirmation"

        return None

    def _generate_clarification_message(
        self,
        clarification_type: str,
        identity_profile: Dict[str, Any],
        routing_decision: Dict[str, Any],
    ) -> str:
        """Generate appropriate clarification message"""

        if clarification_type == "clarification_needed":
            return self.confidence_prompts["clarification_needed"]

        elif clarification_type == "identity_confirmation":
            specialist = routing_decision["specialist_assigned"]
            return self.confidence_prompts["identity_confirmation"].format(specialist=specialist)

        elif clarification_type == "multiple_options":
            identities = [identity_profile["primary_identity"]] + identity_profile.get(
                "secondary_identities", []
            )
            if len(identities) >= 2:
                return self.confidence_prompts["multiple_options"].format(
                    option1=identities[0], option2=identities[1]
                )

        return "I'd like to understand your needs better to provide the most helpful assistance."

    def _generate_confirmation_message(
        self, identity_profile: Dict[str, Any], routing_decision: Dict[str, Any]
    ) -> str:
        """Generate confirmation message"""
        specialist = routing_decision["specialist_assigned"]
        reasoning = routing_decision["reasoning"]

        return f"Based on your message, I think {specialist.title()} would be the best specialist to help you. {reasoning} Shall I connect you with them?"


async def manage_workflow_state(
    state: ClimateAgentState, action_result: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Manage workflow state updates based on action results

    Following rule #6: Asynchronous operations for performance

    Args:
        state: Current state
        action_result: Result from flow control action

    Returns:
        Dict[str, Any]: State updates
    """
    try:
        updates = {}

        # Handle specialist routing
        if action_result.get("action") == "route_to_specialist":
            specialist = action_result["specialist"]
            updates.update(
                {
                    "current_specialist_history": [specialist],
                    "routing_decision": {
                        "specialist": specialist,
                        "confidence": action_result.get("confidence"),
                        "reasoning": action_result.get("reasoning"),
                        "timestamp": datetime.utcnow().isoformat(),
                    },
                }
            )

            # Add flow control updates
            if "state_updates" in action_result:
                updates.update(action_result["state_updates"])

        # Handle clarification requests
        elif action_result.get("action") == "request_clarification":
            updates.update(
                {
                    "awaiting_user_input": True,
                    "input_type_needed": "clarification",
                    "decision_context": {
                        "clarification_type": action_result.get("clarification_type"),
                        "message": action_result.get("message"),
                    },
                }
            )

        # Handle workflow errors
        elif action_result.get("action") == "error":
            updates.update(
                {
                    "workflow_state": "pending_human",
                    "needs_human_review": True,
                    "error_recovery_log": [
                        {
                            "error": action_result.get("reason"),
                            "timestamp": datetime.utcnow().isoformat(),
                            "recovery_action": "escalate_to_human",
                        }
                    ],
                }
            )

        return updates

    except Exception as e:
        logger.error(f"Error managing workflow state: {e}")
        return {"workflow_state": "pending_human", "needs_human_review": True}


# Export main classes and functions
__all__ = [
    "FlowController",
    "AdvancedIdentityRecognizer",
    "IntelligentRoutingEngine",
    "ConfidenceBasedDialogue",
    "SpecialistType",
    "manage_workflow_state",
]
