"""
Enhanced Intelligence Framework for Climate Economy Assistant Agents

This module implements advanced cognitive capabilities to enhance agent intelligence
from current 3.2-4.3/10 scores to target 8.0-9.0/10 exceptional levels:

1. Memory Systems - Episodic and semantic memory for context retention
2. Self-Reflection - Agents evaluate their own reasoning
3. Case-Based Reasoning - Learn from past interactions
4. Multi-Identity Recognition - Handle complex overlapping user profiles
5. Progressive Tool Logic - Context-aware tool selection
6. Emotional Intelligence - Better user understanding

Based on latest research in cognitive architectures and agent intelligence enhancement.
"""

import asyncio
import hashlib
import json
import logging
import uuid
from dataclasses import asdict, dataclass
from datetime import datetime, timedelta
from enum import Enum
from typing import Any, Dict, List, Optional, Tuple, Union

from core.config import get_settings

settings = get_settings()


class ReasoningType(Enum):
    """Types of reasoning approaches"""

    ANALYTICAL = "analytical"
    INTUITIVE = "intuitive"
    REFLECTIVE = "reflective"
    CASE_BASED = "case_based"
    MULTI_PERSPECTIVE = "multi_perspective"


class IntelligenceLevel(Enum):
    """Intelligence assessment levels"""

    BASIC = 1
    DEVELOPING = 3
    COMPETENT = 5
    PROFICIENT = 7
    EXCEPTIONAL = 9


@dataclass
class UserIdentity:
    """Represents an aspect of user identity"""

    identity_type: str  # veteran, international, ej_advocate, etc.
    confidence: float  # 0.0 to 1.0
    evidence: List[str]  # Supporting evidence from conversation
    barriers: List[str]  # Associated barriers
    opportunities: List[str]  # Relevant opportunities


@dataclass
class MemoryEntry:
    """Represents a memory entry with context"""

    entry_id: str
    user_id: str
    timestamp: datetime
    content: str
    context: Dict[str, Any]
    importance: float  # 0.0 to 1.0
    relationships: List[str]  # Related memory IDs
    retrieval_count: int = 0


@dataclass
class CaseInstance:
    """Represents a case for case-based reasoning"""

    case_id: str
    user_context: Dict[str, Any]
    problem_description: str
    solution_provided: str
    outcome_success: float  # 0.0 to 1.0
    lessons_learned: List[str]
    similar_cases: List[str]
    specialist_type: str
    timestamp: datetime


class ReflectionType(Enum):
    """Types of reflection patterns"""

    BASIC = "basic"
    GROUNDED = "grounded"  # With external evidence
    STRUCTURED = "structured"  # With specific criteria
    ITERATIVE = "iterative"  # Multiple rounds


class FeedbackCategory(Enum):
    """Categories for structured feedback"""

    ACCURACY = "accuracy"
    COMPLETENESS = "completeness"
    RELEVANCE = "relevance"
    CLARITY = "clarity"
    DEPTH = "depth"
    BIAS_CHECK = "bias_check"
    TOOL_USAGE = "tool_usage"
    CITATIONS = "citations"


@dataclass
class ReflectionCriteria:
    """Structured criteria for reflection"""

    accuracy_weight: float = 0.25
    completeness_weight: float = 0.20
    relevance_weight: float = 0.20
    clarity_weight: float = 0.15
    depth_weight: float = 0.10
    bias_check_weight: float = 0.05
    tool_usage_weight: float = 0.03
    citation_weight: float = 0.02

    def validate_weights(self) -> bool:
        """Ensure weights sum to 1.0"""
        total = sum(
            [
                self.accuracy_weight,
                self.completeness_weight,
                self.relevance_weight,
                self.clarity_weight,
                self.depth_weight,
                self.bias_check_weight,
                self.tool_usage_weight,
                self.citation_weight,
            ]
        )
        return abs(total - 1.0) < 0.01


@dataclass
class ReflectionFeedback:
    """Structured feedback from reflection"""

    overall_score: float
    category_scores: Dict[FeedbackCategory, float]
    strengths: List[str]
    weaknesses: List[str]
    specific_improvements: List[str]
    citation_quality: float
    tool_effectiveness: float
    bias_indicators: List[str]
    confidence_level: float
    requires_revision: bool
    iteration_count: int = 0

    def to_critique_prompt(self) -> str:
        """Convert feedback to actionable critique prompt"""
        critique_parts = []

        if self.requires_revision:
            critique_parts.append(
                "REVISION REQUIRED. Please address the following issues:"
            )

            if self.weaknesses:
                critique_parts.append("**Key Issues to Address:**")
                for weakness in self.weaknesses:
                    critique_parts.append(f"- {weakness}")

            if self.specific_improvements:
                critique_parts.append("**Specific Improvements Needed:**")
                for improvement in self.specific_improvements:
                    critique_parts.append(f"- {improvement}")

            if self.bias_indicators:
                critique_parts.append("**Bias Concerns:**")
                for bias in self.bias_indicators:
                    critique_parts.append(f"- {bias}")

            if self.citation_quality < 0.7:
                critique_parts.append("**Citation Issues:**")
                critique_parts.append("- Provide more specific sources and evidence")
                critique_parts.append("- Include recent data and statistics")
                critique_parts.append("- Cite authoritative organizations and research")

        else:
            critique_parts.append("FEEDBACK: Response quality is acceptable.")
            if self.strengths:
                critique_parts.append("**Strengths:**")
                for strength in self.strengths:
                    critique_parts.append(f"- {strength}")

        return "\n".join(critique_parts)


class EnhancedMemorySystem:
    """
    Advanced memory system for agents with episodic and semantic memory
    """

    def __init__(self, agent_type: str):
        self.agent_type = agent_type
        self.logger = logging.getLogger(f"memory.{agent_type}")
        self.episodic_memory: List[MemoryEntry] = []
        self.semantic_memory: Dict[str, Any] = {}
        self.working_memory: Dict[str, Any] = {}
        self.max_episodic_entries = 1000
        self.max_working_memory_items = 50

    def store_episodic_memory(
        self,
        user_id: str,
        content: str,
        context: Dict[str, Any],
        importance: float = 0.5,
    ) -> str:
        """Store an episodic memory entry"""
        entry_id = str(uuid.uuid4())
        entry = MemoryEntry(
            entry_id=entry_id,
            user_id=user_id,
            timestamp=datetime.now(),
            content=content,
            context=context,
            importance=importance,
            relationships=[],
        )

        # Add relationships to similar entries
        entry.relationships = self._find_related_memories(content, context)

        self.episodic_memory.append(entry)

        # Prune old memories if needed
        if len(self.episodic_memory) > self.max_episodic_entries:
            self._prune_episodic_memory()

        self.logger.debug(f"Stored episodic memory: {entry_id}")
        return entry_id

    def retrieve_episodic_memories(
        self, user_id: str, query_context: Dict[str, Any], limit: int = 5
    ) -> List[MemoryEntry]:
        """Retrieve relevant episodic memories"""
        user_memories = [m for m in self.episodic_memory if m.user_id == user_id]

        # Score memories by relevance
        scored_memories = []
        for memory in user_memories:
            relevance_score = self._calculate_memory_relevance(memory, query_context)
            scored_memories.append((memory, relevance_score))

        # Sort by relevance and return top results
        scored_memories.sort(key=lambda x: x[1], reverse=True)

        # Update retrieval counts
        results = []
        for memory, score in scored_memories[:limit]:
            memory.retrieval_count += 1
            results.append(memory)

        return results

    def update_semantic_memory(self, key: str, value: Any):
        """Update semantic memory with learned knowledge"""
        self.semantic_memory[key] = {
            "value": value,
            "timestamp": datetime.now().isoformat(),
            "access_count": self.semantic_memory.get(key, {}).get("access_count", 0)
            + 1,
        }

    def get_semantic_memory(self, key: str) -> Any:
        """Retrieve semantic memory"""
        if key in self.semantic_memory:
            self.semantic_memory[key]["access_count"] += 1
            return self.semantic_memory[key]["value"]
        return None

    def _calculate_memory_relevance(
        self, memory: MemoryEntry, query_context: Dict[str, Any]
    ) -> float:
        """Calculate relevance score between memory and query context"""
        score = 0.0

        # Context similarity
        memory_context = memory.context
        for key, value in query_context.items():
            if key in memory_context:
                if memory_context[key] == value:
                    score += 0.3
                elif str(value).lower() in str(memory_context[key]).lower():
                    score += 0.1

        # Recency factor
        days_old = (datetime.now() - memory.timestamp).days
        recency_score = max(0, 1 - (days_old / 30))  # Decay over 30 days
        score += recency_score * 0.2

        # Importance factor
        score += memory.importance * 0.3

        # Retrieval frequency (popular memories)
        popularity_score = min(1.0, memory.retrieval_count / 10)
        score += popularity_score * 0.2

        return score

    def _find_related_memories(
        self, content: str, context: Dict[str, Any]
    ) -> List[str]:
        """Find related memory entries"""
        related_ids = []
        content_lower = content.lower()

        for memory in self.episodic_memory:
            # Check content similarity
            if any(
                word in memory.content.lower()
                for word in content_lower.split()
                if len(word) > 3
            ):
                related_ids.append(memory.entry_id)

            # Check context similarity
            for key, value in context.items():
                if key in memory.context and memory.context[key] == value:
                    if memory.entry_id not in related_ids:
                        related_ids.append(memory.entry_id)

        return related_ids[:5]  # Limit to 5 related memories

    def _prune_episodic_memory(self):
        """Remove old, less important memories"""
        # Sort by importance and recency
        self.episodic_memory.sort(
            key=lambda m: (m.importance, m.timestamp), reverse=True
        )
        # Keep top memories
        self.episodic_memory = self.episodic_memory[: self.max_episodic_entries]


class MultiIdentityRecognizer:
    """
    Advanced system to recognize and handle multiple overlapping user identities
    """

    def __init__(self):
        self.identity_patterns = {
            "veteran": {
                "keywords": [
                    "veteran",
                    "military",
                    "army",
                    "navy",
                    "marines",
                    "air force",
                    "coast guard",
                    "gi bill",
                    "deployment",
                    "combat",
                    "skillbridge",
                ],
                "barriers": [
                    "transition_anxiety",
                    "civilian_culture_gap",
                    "skill_translation",
                ],
                "opportunities": [
                    "federal_hiring_preference",
                    "veteran_specific_programs",
                    "leadership_experience",
                ],
            },
            "international": {
                "keywords": [
                    "international",
                    "immigrant",
                    "foreign",
                    "visa",
                    "green card",
                    "credentials",
                    "degree from",
                    "worked in",
                    "moved from",
                    "citizenship",
                ],
                "barriers": [
                    "credential_recognition",
                    "language_barriers",
                    "cultural_adaptation",
                    "visa_restrictions",
                ],
                "opportunities": [
                    "multilingual_skills",
                    "international_experience",
                    "cultural_competency",
                ],
            },
            "environmental_justice": {
                "keywords": [
                    "environmental justice",
                    "community",
                    "advocacy",
                    "organizing",
                    "equity",
                    "overburdened",
                    "frontline",
                    "disadvantaged",
                    "ej",
                ],
                "barriers": [
                    "geographic_isolation",
                    "limited_resources",
                    "systemic_barriers",
                ],
                "opportunities": [
                    "community_connections",
                    "advocacy_experience",
                    "lived_experience",
                ],
            },
            "career_transition": {
                "keywords": [
                    "career change",
                    "transition",
                    "switching",
                    "new field",
                    "different industry",
                    "pivot",
                ],
                "barriers": ["skill_gaps", "experience_relevance", "confidence"],
                "opportunities": [
                    "transferable_skills",
                    "fresh_perspective",
                    "motivation",
                ],
            },
            "early_career": {
                "keywords": [
                    "recent graduate",
                    "entry level",
                    "new to field",
                    "first job",
                    "just graduated",
                ],
                "barriers": [
                    "lack_of_experience",
                    "credential_requirements",
                    "networking",
                ],
                "opportunities": ["adaptability", "latest_education", "energy"],
            },
        }

    async def analyze_user_identities(
        self, user_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Enhanced multi-identity recognition with intersectionality detection.

        Implements 2025 best practices for AI-driven identity analysis with
        improved pattern recognition and contextual understanding.
        """
        try:
            # Enhanced identity markers with intersectionality patterns
            identity_markers = {
                "veteran": {
                    "keywords": [
                        "military",
                        "veteran",
                        "service",
                        "deployment",
                        "combat",
                        "VA",
                        "GI Bill",
                        "discharge",
                    ],
                    "patterns": [
                        "served in",
                        "military experience",
                        "veteran status",
                        "active duty",
                        "reserve",
                    ],
                    "intersectional_indicators": [
                        "veteran woman",
                        "disabled veteran",
                        "LGBTQ+ veteran",
                        "veteran of color",
                    ],
                },
                "international": {
                    "keywords": [
                        "international",
                        "foreign",
                        "visa",
                        "immigrant",
                        "refugee",
                        "asylum",
                        "H1B",
                        "green card",
                    ],
                    "patterns": [
                        "born in",
                        "moved from",
                        "citizenship",
                        "work authorization",
                        "language barrier",
                    ],
                    "intersectional_indicators": [
                        "international student",
                        "skilled immigrant",
                        "refugee background",
                        "dual citizenship",
                    ],
                },
                "environmental_justice": {
                    "keywords": [
                        "environmental",
                        "justice",
                        "community",
                        "pollution",
                        "climate",
                        "sustainability",
                        "advocacy",
                    ],
                    "patterns": [
                        "environmental impact",
                        "community organizing",
                        "climate action",
                        "environmental health",
                    ],
                    "intersectional_indicators": [
                        "frontline community",
                        "indigenous environmental",
                        "urban environmental",
                        "rural environmental",
                    ],
                },
                "early_career": {
                    "keywords": [
                        "recent graduate",
                        "entry level",
                        "first job",
                        "new to field",
                        "student",
                        "internship",
                    ],
                    "patterns": [
                        "just graduated",
                        "looking for first",
                        "new to the industry",
                        "career change",
                    ],
                    "intersectional_indicators": [
                        "first-generation college",
                        "career changer",
                        "returning parent",
                        "non-traditional student",
                    ],
                },
                "career_transition": {
                    "keywords": [
                        "career change",
                        "transition",
                        "pivot",
                        "switching",
                        "new field",
                        "retraining",
                    ],
                    "patterns": [
                        "changing careers",
                        "moving from",
                        "transitioning to",
                        "career pivot",
                    ],
                    "intersectional_indicators": [
                        "mid-career transition",
                        "industry switcher",
                        "skill transferer",
                        "career returner",
                    ],
                },
            }

            # Advanced intersectionality detection patterns
            intersectional_combinations = {
                ("veteran", "environmental_justice"): "veteran_environmental_advocate",
                ("international", "early_career"): "international_new_graduate",
                ("veteran", "career_transition"): "transitioning_veteran",
                (
                    "international",
                    "environmental_justice",
                ): "international_environmental_advocate",
                ("veteran", "international"): "immigrant_veteran",
                (
                    "early_career",
                    "environmental_justice",
                ): "young_environmental_advocate",
                (
                    "career_transition",
                    "environmental_justice",
                ): "environmental_career_changer",
            }

            # Contextual analysis weights
            context_weights = {
                "explicit_mention": 1.0,
                "implicit_pattern": 0.8,
                "intersectional_indicator": 1.2,
                "contextual_clue": 0.6,
                "combined_pattern": 1.5,
            }

            detected_identities = {}
            confidence_scores = {}
            intersectional_patterns = []

            # Extract text for analysis
            text_sources = []
            if user_data.get("resume_text"):
                text_sources.append(("resume", user_data["resume_text"]))
            if user_data.get("profile_description"):
                text_sources.append(("profile", user_data["profile_description"]))
            if user_data.get("goals"):
                text_sources.append(("goals", user_data["goals"]))
            if user_data.get("background"):
                text_sources.append(("background", user_data["background"]))

            # Enhanced pattern matching with contextual analysis
            for identity, markers in identity_markers.items():
                total_score = 0
                evidence = []

                for source_type, text in text_sources:
                    if not text:
                        continue
                    text_lower = text.lower()
                    # Direct keyword matching
                    keyword_matches = sum(
                        1 for keyword in markers["keywords"] if keyword in text_lower
                    )
                    if keyword_matches > 0:
                        total_score += (
                            keyword_matches * context_weights["explicit_mention"]
                        )
                        evidence.append(f"{keyword_matches} keywords in {source_type}")
                    # Pattern matching
                    pattern_matches = sum(
                        1 for pattern in markers["patterns"] if pattern in text_lower
                    )
                    if pattern_matches > 0:
                        total_score += (
                            pattern_matches * context_weights["implicit_pattern"]
                        )
                        evidence.append(f"{pattern_matches} patterns in {source_type}")
                    # Intersectional indicators (enhanced weight)
                    matched_indicators = [
                        indicator
                        for indicator in markers["intersectional_indicators"]
                        if indicator in text_lower
                    ]
                    intersectional_matches = len(matched_indicators)
                    if intersectional_matches > 0:
                        total_score += (
                            intersectional_matches
                            * context_weights["intersectional_indicator"]
                        )
                        evidence.append(
                            f"{intersectional_matches} intersectional indicators in {source_type}"
                        )
                        for indicator in matched_indicators:
                            intersectional_patterns.append((identity, indicator))
                # Calculate confidence with enhanced scoring
                max_possible_score = (
                    len(markers["keywords"])
                    + len(markers["patterns"])
                    + len(markers["intersectional_indicators"])
                )
                confidence = (
                    min(total_score / max_possible_score, 1.0)
                    if max_possible_score > 0
                    else 0
                )
                if confidence > 0.1:  # Lower threshold for better detection
                    detected_identities[identity] = {
                        "confidence": confidence,
                        "evidence": evidence,
                        "score": total_score,
                    }
                    confidence_scores[identity] = confidence

            # Enhanced intersectionality detection
            detected_intersections = []
            identity_keys = list(detected_identities.keys())

            for i, identity1 in enumerate(identity_keys):
                for identity2 in identity_keys[i + 1 :]:
                    # Check for explicit intersectional combinations
                    combo_key = tuple(sorted([identity1, identity2]))
                    if combo_key in intersectional_combinations:
                        combined_confidence = (
                            confidence_scores[identity1] + confidence_scores[identity2]
                        ) / 2
                        # Boost confidence for intersectional patterns
                        combined_confidence *= context_weights["combined_pattern"]

                        detected_intersections.append(
                            {
                                "identities": [identity1, identity2],
                                "intersection_type": intersectional_combinations[
                                    combo_key
                                ],
                                "confidence": min(combined_confidence, 1.0),
                                "evidence": f"Intersection of {identity1} and {identity2}",
                            }
                        )

            # Advanced contextual analysis using AI
            contextual_analysis = await self._perform_contextual_identity_analysis(
                text_sources, detected_identities
            )

            return {
                "primary_identities": detected_identities,
                "intersectional_patterns": detected_intersections,
                "contextual_insights": contextual_analysis,
                "identity_complexity_score": len(detected_identities)
                + len(detected_intersections),
                "analysis_confidence": (
                    sum(confidence_scores.values()) / len(confidence_scores)
                    if confidence_scores
                    else 0
                ),
                "intersectionality_detected": len(detected_intersections) > 0,
            }

        except Exception as e:
            print(f"Error in enhanced identity analysis: {e}")
            return {
                "primary_identities": {},
                "intersectional_patterns": [],
                "contextual_insights": {},
                "identity_complexity_score": 0,
                "analysis_confidence": 0,
                "intersectionality_detected": False,
                "error": str(e),
            }

    async def _perform_contextual_identity_analysis(
        self, text_sources: List[Tuple[str, str]], detected_identities: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Advanced contextual analysis using AI to understand identity nuances.
        """
        try:
            # Combine all text for contextual analysis
            combined_text = " ".join([text for _, text in text_sources])

            # Use AI to analyze contextual patterns
            contextual_prompt = f"""
            Analyze the following text for identity markers and intersectionality patterns.
            Focus on subtle indicators, cultural references, and implicit identity markers.
            
            Text: {combined_text[:1000]}...
            
            Current detected identities: {list(detected_identities.keys())}
            
            Provide insights on:
            1. Missed identity markers
            2. Cultural or contextual clues
            3. Intersectionality indicators
            4. Identity complexity assessment
            
            Respond in JSON format with specific insights.
            """

            # This would call the LLM for contextual analysis
            # For now, return enhanced pattern analysis
            return {
                "cultural_indicators": self._extract_cultural_patterns(combined_text),
                "implicit_markers": self._find_implicit_identity_markers(combined_text),
                "complexity_assessment": self._assess_identity_complexity(
                    detected_identities
                ),
                "recommendations": self._generate_identity_recommendations(
                    detected_identities
                ),
            }

        except Exception as e:
            return {"error": f"Contextual analysis failed: {e}"}

    def _extract_cultural_patterns(self, text: str) -> List[str]:
        """Extract cultural and contextual identity patterns."""
        cultural_patterns = []

        # Enhanced cultural markers
        cultural_indicators = {
            "geographic": ["grew up in", "from", "native to", "hometown", "regional"],
            "linguistic": [
                "bilingual",
                "multilingual",
                "native speaker",
                "second language",
                "accent",
            ],
            "educational": [
                "first-generation",
                "community college",
                "state school",
                "ivy league",
                "trade school",
            ],
            "socioeconomic": [
                "working class",
                "first in family",
                "scholarship",
                "financial aid",
                "part-time work",
            ],
            "generational": [
                "millennial",
                "gen z",
                "boomer",
                "gen x",
                "digital native",
            ],
        }

        text_lower = text.lower()
        for category, indicators in cultural_indicators.items():
            for indicator in indicators:
                if indicator in text_lower:
                    cultural_patterns.append(f"{category}: {indicator}")

        return cultural_patterns

    def _find_implicit_identity_markers(self, text: str) -> List[str]:
        """Find subtle, implicit identity markers."""
        implicit_markers = []

        # Implicit pattern detection
        implicit_patterns = {
            "leadership_style": [
                "collaborative",
                "consensus-building",
                "inclusive",
                "community-focused",
            ],
            "communication_style": [
                "direct",
                "diplomatic",
                "storytelling",
                "data-driven",
            ],
            "value_indicators": [
                "social justice",
                "equity",
                "inclusion",
                "sustainability",
                "innovation",
            ],
            "experience_markers": [
                "grassroots",
                "corporate",
                "nonprofit",
                "startup",
                "government",
            ],
        }

        text_lower = text.lower()
        for category, patterns in implicit_patterns.items():
            for pattern in patterns:
                if pattern in text_lower:
                    implicit_markers.append(f"{category}: {pattern}")

        return implicit_markers

    def _assess_identity_complexity(
        self, detected_identities: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Assess the complexity of identity intersections."""
        complexity_score = len(detected_identities)

        # Calculate intersectionality potential
        intersectionality_potential = 0
        if complexity_score >= 2:
            intersectionality_potential = (
                complexity_score * (complexity_score - 1)
            ) / 2

        return {
            "identity_count": complexity_score,
            "intersectionality_potential": intersectionality_potential,
            "complexity_level": (
                "high"
                if complexity_score >= 3
                else "medium" if complexity_score >= 2 else "low"
            ),
            "analysis_depth": "comprehensive" if complexity_score >= 2 else "basic",
        }

    def _generate_identity_recommendations(
        self, detected_identities: Dict[str, Any]
    ) -> List[str]:
        """Generate recommendations based on identity analysis."""
        recommendations = []

        identity_keys = list(detected_identities.keys())

        if "veteran" in identity_keys:
            recommendations.append(
                "Consider veteran-specific career transition programs"
            )
            recommendations.append("Explore military skill translation resources")

        if "international" in identity_keys:
            recommendations.append("Focus on credential recognition and networking")
            recommendations.append("Leverage cultural diversity as a strength")

        if "environmental_justice" in identity_keys:
            recommendations.append("Connect with environmental advocacy organizations")
            recommendations.append("Explore policy and community engagement roles")

        if len(identity_keys) >= 2:
            recommendations.append(
                "Leverage intersectional identity as unique value proposition"
            )
            recommendations.append("Seek mentors with similar identity combinations")

        return recommendations


class SelfReflectionEngine:
    """
    Enhanced self-reflection engine with LangGraph-inspired patterns

    Implements multiple reflection strategies:
    - Basic reflection for simple quality checks
    - Grounded reflection with external evidence validation
    - Structured reflection with specific criteria
    - Iterative reflection with multiple improvement rounds
    """

    def __init__(self, max_iterations: int = 3):
        self.max_iterations = max_iterations
        self.reflection_history = []
        self.criteria = ReflectionCriteria()

        # Reflection prompts based on LangGraph patterns
        self.reflection_prompts = {
            ReflectionType.BASIC: self._get_basic_reflection_prompt(),
            ReflectionType.GROUNDED: self._get_grounded_reflection_prompt(),
            ReflectionType.STRUCTURED: self._get_structured_reflection_prompt(),
            ReflectionType.ITERATIVE: self._get_iterative_reflection_prompt(),
        }

    def _get_basic_reflection_prompt(self) -> str:
        """Basic reflection prompt for general quality assessment"""
        return """
You are an expert reviewer evaluating an AI assistant's response. 

Analyze the response for:
1. Accuracy of information
2. Completeness of answer
3. Clarity and organization
4. Relevance to the question

Provide a brief assessment of strengths and areas for improvement.
Rate the overall quality on a scale of 1-10.
"""

    def _get_grounded_reflection_prompt(self) -> str:
        """Grounded reflection with evidence validation"""
        return """
You are a fact-checking expert reviewing an AI response for accuracy and evidence quality.

Evaluate the response on these criteria:

1. **Factual Accuracy**: Are the claims supported by evidence?
2. **Source Quality**: Are citations from authoritative sources?
3. **Currency**: Is the information up-to-date?
4. **Evidence Gaps**: What claims lack proper support?
5. **Bias Detection**: Are there signs of bias or incomplete perspectives?

For each major claim, identify:
- The evidence provided
- The quality of that evidence
- What additional evidence is needed

Provide specific suggestions for improving factual grounding.
"""

    def _get_structured_reflection_prompt(self) -> str:
        """Structured reflection with weighted criteria"""
        return """
You are an expert evaluator using structured assessment criteria.

Rate the response (1-10) on each criterion:

**ACCURACY (25%)**: Factual correctness and precision
**COMPLETENESS (20%)**: Comprehensive coverage of the topic  
**RELEVANCE (20%)**: Direct addressing of the user's question
**CLARITY (15%)**: Clear, well-organized communication
**DEPTH (10%)**: Sophisticated analysis and insights
**BIAS CHECK (5%)**: Balanced, fair perspective
**TOOL USAGE (3%)**: Effective use of available tools
**CITATIONS (2%)**: Quality of sources and references

For each category:
- Provide a score (1-10)
- Identify specific strengths
- Note specific weaknesses
- Suggest concrete improvements

Calculate weighted overall score and determine if revision is needed.
"""

    def _get_iterative_reflection_prompt(self) -> str:
        """Iterative reflection for multi-round improvement"""
        return """
You are reviewing a response that has undergone {iteration_count} round(s) of revision.

Compare this version to previous feedback and assess:

1. **Improvement Tracking**: How has the response improved since last iteration?
2. **Remaining Issues**: What problems persist despite revision?
3. **New Concerns**: Have any new issues emerged?
4. **Convergence**: Is the response converging toward high quality?

Previous feedback summary: {previous_feedback}

Determine:
- Whether further revision is needed
- Specific priority improvements for next iteration
- Risk of diminishing returns from additional iterations

Focus on the most impactful remaining improvements.
"""

    async def reflect_on_response(
        self,
        user_query: str,
        response: str,
        context: Dict[str, Any],
        reflection_type: ReflectionType = ReflectionType.STRUCTURED,
        iteration_count: int = 0,
    ) -> ReflectionFeedback:
        """
        Perform structured reflection on a response

        Args:
            user_query: Original user question
            response: Assistant's response to evaluate
            context: Additional context (tools used, sources, etc.)
            reflection_type: Type of reflection to perform
            iteration_count: Current iteration number

        Returns:
            Structured reflection feedback
        """
        try:
            # Prepare reflection prompt
            prompt = self._prepare_reflection_prompt(
                user_query, response, context, reflection_type, iteration_count
            )

            # Simulate LLM reflection call (in real implementation, this would call your LLM)
            reflection_result = await self._simulate_llm_reflection(
                prompt, reflection_type
            )

            # Parse and structure the feedback
            feedback = self._parse_reflection_result(reflection_result, iteration_count)

            # Store reflection in history
            self.reflection_history.append(
                {
                    "timestamp": datetime.now(),
                    "type": reflection_type,
                    "iteration": iteration_count,
                    "feedback": feedback,
                    "user_query": user_query,
                    "response_excerpt": (
                        response[:200] + "..." if len(response) > 200 else response
                    ),
                }
            )

            return feedback

        except Exception as e:
            logger.error(f"Reflection failed: {e}")
            # Return minimal feedback on error
            return ReflectionFeedback(
                overall_score=5.0,
                category_scores={},
                strengths=[],
                weaknesses=["Reflection system error occurred"],
                specific_improvements=["Please try again"],
                citation_quality=0.5,
                tool_effectiveness=0.5,
                bias_indicators=[],
                confidence_level=0.3,
                requires_revision=False,
                iteration_count=iteration_count,
            )

    def _prepare_reflection_prompt(
        self,
        user_query: str,
        response: str,
        context: Dict[str, Any],
        reflection_type: ReflectionType,
        iteration_count: int,
    ) -> str:
        """Prepare the reflection prompt with context"""

        base_prompt = self.reflection_prompts[reflection_type]

        if reflection_type == ReflectionType.ITERATIVE and iteration_count > 0:
            previous_feedback = self._get_previous_feedback_summary()
            base_prompt = base_prompt.format(
                iteration_count=iteration_count, previous_feedback=previous_feedback
            )

        full_prompt = f"""
{base_prompt}

**USER QUESTION:**
{user_query}

**ASSISTANT RESPONSE:**
{response}

**CONTEXT:**
- Tools used: {context.get('tools_used', [])}
- Sources accessed: {context.get('sources', [])}
- Processing time: {context.get('processing_time', 'unknown')}
- Iteration: {iteration_count + 1}

**REFLECTION TASK:**
Provide detailed analysis following the criteria above.
"""
        return full_prompt

    async def _simulate_llm_reflection(
        self, prompt: str, reflection_type: ReflectionType
    ) -> Dict[str, Any]:
        """
        Simulate LLM reflection call
        In real implementation, this would call your actual LLM with the reflection prompt
        """
        await asyncio.sleep(0.1)  # Simulate processing time

        # Simulate different quality assessments based on reflection type
        if reflection_type == ReflectionType.STRUCTURED:
            return {
                "overall_score": 7.2,
                "accuracy": 8.0,
                "completeness": 7.5,
                "relevance": 8.5,
                "clarity": 6.8,
                "depth": 6.5,
                "bias_check": 7.0,
                "tool_usage": 5.5,
                "citations": 6.0,
                "strengths": [
                    "Clear structure and organization",
                    "Relevant to user question",
                    "Good use of examples",
                ],
                "weaknesses": [
                    "Some claims need better evidence",
                    "Could be more comprehensive",
                    "Tool usage could be more strategic",
                ],
                "improvements": [
                    "Add more specific citations",
                    "Include recent statistics",
                    "Address potential counterarguments",
                ],
                "bias_indicators": ["May favor certain economic perspectives"],
                "confidence": 0.75,
                "needs_revision": True,
            }
        else:
            # Simplified simulation for other types
            return {
                "overall_score": 6.8,
                "strengths": ["Addresses the question", "Clear language"],
                "weaknesses": ["Could be more detailed"],
                "needs_revision": False,
                "confidence": 0.65,
            }

    def _parse_reflection_result(
        self, result: Dict[str, Any], iteration_count: int
    ) -> ReflectionFeedback:
        """Parse LLM reflection result into structured feedback"""

        # Extract category scores if available (structured reflection)
        category_scores = {}
        if "accuracy" in result:
            category_scores = {
                FeedbackCategory.ACCURACY: result.get("accuracy", 5.0),
                FeedbackCategory.COMPLETENESS: result.get("completeness", 5.0),
                FeedbackCategory.RELEVANCE: result.get("relevance", 5.0),
                FeedbackCategory.CLARITY: result.get("clarity", 5.0),
                FeedbackCategory.DEPTH: result.get("depth", 5.0),
                FeedbackCategory.BIAS_CHECK: result.get("bias_check", 5.0),
                FeedbackCategory.TOOL_USAGE: result.get("tool_usage", 5.0),
                FeedbackCategory.CITATIONS: result.get("citations", 5.0),
            }

        return ReflectionFeedback(
            overall_score=result.get("overall_score", 5.0),
            category_scores=category_scores,
            strengths=result.get("strengths", []),
            weaknesses=result.get("weaknesses", []),
            specific_improvements=result.get("improvements", []),
            citation_quality=result.get("citations", 5.0) / 10.0,
            tool_effectiveness=result.get("tool_usage", 5.0) / 10.0,
            bias_indicators=result.get("bias_indicators", []),
            confidence_level=result.get("confidence", 0.5),
            requires_revision=result.get("needs_revision", False),
            iteration_count=iteration_count,
        )

    def _get_previous_feedback_summary(self) -> str:
        """Get summary of previous feedback for iterative reflection"""
        if not self.reflection_history:
            return "No previous feedback available."

        recent_feedback = self.reflection_history[-1]["feedback"]
        return f"""
Previous iteration {recent_feedback.iteration_count}:
- Overall score: {recent_feedback.overall_score}/10
- Main issues: {', '.join(recent_feedback.weaknesses[:3])}
- Key improvements needed: {', '.join(recent_feedback.specific_improvements[:3])}
"""

    def should_continue_iteration(self, feedback: ReflectionFeedback) -> bool:
        """Determine if another iteration is warranted"""
        if feedback.iteration_count >= self.max_iterations - 1:
            return False

        if not feedback.requires_revision:
            return False

        if feedback.overall_score > 8.5:
            return False

        return True

    def get_reflection_summary(self) -> Dict[str, Any]:
        """Get summary of reflection performance and patterns"""
        if not self.reflection_history:
            return {"status": "No reflections performed yet"}

        recent_reflections = self.reflection_history[-5:]  # Last 5 reflections

        avg_score = sum(r["feedback"].overall_score for r in recent_reflections) / len(
            recent_reflections
        )
        avg_iterations = sum(
            r["feedback"].iteration_count for r in recent_reflections
        ) / len(recent_reflections)

        common_weaknesses = {}
        for reflection in recent_reflections:
            for weakness in reflection["feedback"].weaknesses:
                common_weaknesses[weakness] = common_weaknesses.get(weakness, 0) + 1

        return {
            "total_reflections": len(self.reflection_history),
            "recent_average_score": round(avg_score, 2),
            "average_iterations": round(avg_iterations, 2),
            "common_issues": sorted(
                common_weaknesses.items(), key=lambda x: x[1], reverse=True
            )[:3],
            "reflection_trends": [
                {
                    "timestamp": r["timestamp"].isoformat(),
                    "score": r["feedback"].overall_score,
                }
                for r in recent_reflections
            ],
        }


class CaseBasedReasoningEngine:
    """
    Case-based reasoning system for learning from past interactions
    """

    def __init__(self, agent_type: str):
        self.agent_type = agent_type
        self.logger = logging.getLogger(f"cbr.{agent_type}")
        self.case_library: List[CaseInstance] = []
        self.max_cases = 500

    def store_case(
        self,
        user_context: Dict[str, Any],
        problem_description: str,
        solution_provided: str,
        outcome_success: float,
        lessons_learned: List[str] = None,
    ) -> str:
        """Store a new case in the case library"""
        case_id = str(uuid.uuid4())

        # Find similar cases
        similar_cases = self._find_similar_cases(user_context, problem_description)

        case = CaseInstance(
            case_id=case_id,
            user_context=user_context,
            problem_description=problem_description,
            solution_provided=solution_provided,
            outcome_success=outcome_success,
            lessons_learned=lessons_learned or [],
            similar_cases=[c.case_id for c in similar_cases[:3]],
            specialist_type=self.agent_type,
            timestamp=datetime.now(),
        )

        self.case_library.append(case)

        # Prune if necessary
        if len(self.case_library) > self.max_cases:
            self._prune_case_library()

        self.logger.info(f"Stored new case: {case_id}")
        return case_id

    def retrieve_similar_cases(
        self, user_context: Dict[str, Any], problem_description: str, limit: int = 3
    ) -> List[CaseInstance]:
        """Retrieve similar cases for current situation"""
        return self._find_similar_cases(user_context, problem_description, limit)

    def adapt_solution(
        self,
        similar_cases: List[CaseInstance],
        current_context: Dict[str, Any],
        current_problem: str,
    ) -> Dict[str, Any]:
        """Adapt solutions from similar cases to current situation"""
        if not similar_cases:
            return {
                "adapted_solution": None,
                "confidence": 0.0,
                "rationale": "No similar cases found",
            }

        # Analyze successful cases
        successful_cases = [
            case for case in similar_cases if case.outcome_success > 0.6
        ]

        if not successful_cases:
            successful_cases = similar_cases  # Use all if none are highly successful

        # Extract common solution patterns
        solution_patterns = []
        for case in successful_cases:
            patterns = self._extract_solution_patterns(case.solution_provided)
            solution_patterns.extend(patterns)

        # Find most common patterns
        pattern_counts = {}
        for pattern in solution_patterns:
            pattern_counts[pattern] = pattern_counts.get(pattern, 0) + 1

        top_patterns = sorted(pattern_counts.items(), key=lambda x: x[1], reverse=True)[
            :3
        ]

        # Create adapted solution
        adapted_solution = self._synthesize_solution(
            top_patterns, current_context, current_problem
        )

        # Calculate confidence based on case similarity and success rates
        avg_success = sum(case.outcome_success for case in successful_cases) / len(
            successful_cases
        )
        similarity_score = sum(
            self._calculate_case_similarity(case, current_context, current_problem)
            for case in successful_cases
        ) / len(successful_cases)

        confidence = (avg_success + similarity_score) / 2

        return {
            "adapted_solution": adapted_solution,
            "confidence": confidence,
            "rationale": f"Based on {len(successful_cases)} similar cases with avg success {avg_success:.2f}",
            "source_cases": [case.case_id for case in successful_cases],
        }

    def _find_similar_cases(
        self, user_context: Dict[str, Any], problem_description: str, limit: int = 5
    ) -> List[CaseInstance]:
        """Find similar cases based on context and problem"""
        scored_cases = []

        for case in self.case_library:
            similarity = self._calculate_case_similarity(
                case, user_context, problem_description
            )
            scored_cases.append((case, similarity))

        # Sort by similarity and return top cases
        scored_cases.sort(key=lambda x: x[1], reverse=True)
        return [case for case, score in scored_cases[:limit] if score > 0.3]

    def _calculate_case_similarity(
        self, case: CaseInstance, user_context: Dict[str, Any], problem_description: str
    ) -> float:
        """Calculate similarity between stored case and current situation"""
        similarity = 0.0

        # Context similarity
        context_matches = 0
        total_context_keys = len(
            set(case.user_context.keys()) | set(user_context.keys())
        )

        if total_context_keys > 0:
            for key in case.user_context:
                if key in user_context and case.user_context[key] == user_context[key]:
                    context_matches += 1
            similarity += (context_matches / total_context_keys) * 0.6

        # Problem description similarity (simple word overlap)
        case_words = set(case.problem_description.lower().split())
        problem_words = set(problem_description.lower().split())

        if len(case_words) > 0 and len(problem_words) > 0:
            word_overlap = len(case_words.intersection(problem_words))
            total_words = len(case_words.union(problem_words))
            similarity += (word_overlap / total_words) * 0.4

        return similarity

    def _extract_solution_patterns(self, solution: str) -> List[str]:
        """Extract key patterns from a solution"""
        patterns = []

        # Look for common action patterns
        if "contact" in solution.lower():
            patterns.append("provide_contact_info")
        if "training" in solution.lower():
            patterns.append("recommend_training")
        if "skill" in solution.lower():
            patterns.append("skill_assessment")
        if "network" in solution.lower():
            patterns.append("networking_guidance")
        if "step" in solution.lower():
            patterns.append("step_by_step_plan")

        return patterns

    def _synthesize_solution(
        self, top_patterns: List[Tuple[str, int]], context: Dict[str, Any], problem: str
    ) -> str:
        """Synthesize solution from patterns and context"""
        solution_parts = []

        for pattern, count in top_patterns:
            if pattern == "provide_contact_info":
                solution_parts.append(
                    "Include specific contact information and resources"
                )
            elif pattern == "recommend_training":
                solution_parts.append(
                    "Identify relevant training and certification programs"
                )
            elif pattern == "skill_assessment":
                solution_parts.append(
                    "Conduct thorough skills analysis and gap identification"
                )
            elif pattern == "networking_guidance":
                solution_parts.append("Provide networking strategies and connections")
            elif pattern == "step_by_step_plan":
                solution_parts.append("Create detailed action plan with timeline")

        return "; ".join(solution_parts)

    def _prune_case_library(self):
        """Remove old or low-quality cases"""
        # Sort by success rate and recency
        self.case_library.sort(
            key=lambda c: (c.outcome_success, c.timestamp), reverse=True
        )
        # Keep top cases
        self.case_library = self.case_library[: self.max_cases]


class ProgressiveToolSelector:
    """
    Enhanced Progressive Tool Selection with hierarchical complexity matching.

    Implements 2025 best practices for AI tool selection with improved
    context awareness and complexity assessment.
    """

    def __init__(self):
        # Enhanced tool complexity hierarchy with granular levels
        self.tool_complexity_hierarchy = {
            # Level 1: Basic Information Retrieval
            "basic": {
                "complexity_score": 1,
                "tools": ["search_resources", "get_basic_info", "simple_lookup"],
                "use_cases": [
                    "simple queries",
                    "basic information needs",
                    "straightforward requests",
                ],
                "context_requirements": ["minimal", "single_domain"],
                "processing_time": "fast",
            },
            # Level 2: Structured Analysis
            "intermediate": {
                "complexity_score": 2,
                "tools": [
                    "match_jobs_for_profile",
                    "recommend_upskilling",
                    "analyze_skills",
                ],
                "use_cases": [
                    "profile matching",
                    "skill analysis",
                    "basic recommendations",
                ],
                "context_requirements": ["moderate", "cross_domain"],
                "processing_time": "medium",
            },
            # Level 3: Advanced Processing
            "advanced": {
                "complexity_score": 3,
                "tools": [
                    "comprehensive_analysis",
                    "multi_factor_assessment",
                    "strategic_planning",
                ],
                "use_cases": [
                    "complex analysis",
                    "multi-variable processing",
                    "strategic insights",
                ],
                "context_requirements": ["high", "multi_domain", "contextual"],
                "processing_time": "slow",
            },
            # Level 4: Expert-Level Integration
            "expert": {
                "complexity_score": 4,
                "tools": [
                    "integrated_workflow",
                    "cross_system_analysis",
                    "predictive_modeling",
                ],
                "use_cases": [
                    "system integration",
                    "predictive analysis",
                    "complex workflows",
                ],
                "context_requirements": ["very_high", "system-wide", "predictive"],
                "processing_time": "very_slow",
            },
            # Level 5: AI-Orchestrated Solutions
            "orchestrated": {
                "complexity_score": 5,
                "tools": [
                    "ai_orchestration",
                    "multi_agent_coordination",
                    "adaptive_workflows",
                ],
                "use_cases": [
                    "multi-agent tasks",
                    "adaptive solutions",
                    "orchestrated responses",
                ],
                "context_requirements": ["maximum", "adaptive", "multi-agent"],
                "processing_time": "variable",
            },
        }

        # Enhanced context analysis patterns
        self.context_patterns = {
            "query_complexity": {
                "simple": ["what", "who", "when", "where"],
                "moderate": ["how", "why", "explain", "compare"],
                "complex": ["analyze", "evaluate", "optimize", "integrate"],
                "expert": ["synthesize", "orchestrate", "coordinate", "predict"],
            },
            "domain_indicators": {
                "single_domain": ["job", "career", "skill", "training"],
                "cross_domain": ["transition", "change", "move", "switch"],
                "multi_domain": ["integrate", "combine", "holistic", "comprehensive"],
                "system_wide": ["ecosystem", "network", "platform", "infrastructure"],
            },
            "urgency_indicators": {
                "low": ["eventually", "someday", "future", "long-term"],
                "medium": ["soon", "next", "upcoming", "planning"],
                "high": ["now", "immediately", "urgent", "asap"],
                "critical": ["emergency", "crisis", "deadline", "critical"],
            },
            "user_sophistication": {
                "beginner": ["new", "first time", "don't know", "help me understand"],
                "intermediate": ["some experience", "familiar with", "used to"],
                "advanced": ["expert", "experienced", "sophisticated", "complex"],
                "professional": ["industry", "professional", "enterprise", "strategic"],
            },
        }

        # Tool performance metrics and learning
        self.tool_performance_history = {}
        self.context_success_patterns = {}

    async def select_optimal_tools(
        self, query: str, context: Dict[str, Any], user_profile: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        Enhanced tool selection with hierarchical complexity matching and context awareness.
        """
        try:
            # Step 1: Comprehensive context analysis
            context_analysis = await self._analyze_query_context(
                query, context, user_profile
            )

            # Step 2: Determine complexity requirements
            complexity_requirements = await self._assess_complexity_requirements(
                context_analysis
            )

            # Step 3: Progressive tool selection with fallback strategies
            selected_tools = await self._progressive_tool_selection(
                complexity_requirements, context_analysis
            )

            # Step 4: Optimize tool sequence and coordination
            optimized_sequence = await self._optimize_tool_sequence(
                selected_tools, context_analysis
            )

            # Step 5: Generate execution strategy
            execution_strategy = await self._generate_execution_strategy(
                optimized_sequence, complexity_requirements
            )

            return {
                "selected_tools": selected_tools,
                "execution_sequence": optimized_sequence,
                "execution_strategy": execution_strategy,
                "complexity_assessment": complexity_requirements,
                "context_analysis": context_analysis,
                "confidence_score": self._calculate_selection_confidence(
                    selected_tools, context_analysis
                ),
                "fallback_options": self._generate_fallback_options(
                    selected_tools, complexity_requirements
                ),
            }

        except Exception as e:
            print(f"Error in progressive tool selection: {e}")
            return self._get_default_tool_selection()

    async def _analyze_query_context(
        self, query: str, context: Dict[str, Any], user_profile: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        Enhanced context analysis with multiple dimensions.
        """
        query_lower = query.lower()

        # Analyze query complexity
        complexity_indicators = {
            "simple": sum(
                1
                for indicator in self.context_patterns["query_complexity"]["simple"]
                if indicator in query_lower
            ),
            "moderate": sum(
                1
                for indicator in self.context_patterns["query_complexity"]["moderate"]
                if indicator in query_lower
            ),
            "complex": sum(
                1
                for indicator in self.context_patterns["query_complexity"]["complex"]
                if indicator in query_lower
            ),
            "expert": sum(
                1
                for indicator in self.context_patterns["query_complexity"]["expert"]
                if indicator in query_lower
            ),
        }

        # Determine primary complexity level
        primary_complexity = max(complexity_indicators.items(), key=lambda x: x[1])[0]

        # Analyze domain scope
        domain_scope = self._analyze_domain_scope(query_lower, context)

        # Assess urgency
        urgency_level = self._assess_urgency(query_lower, context)

        # Determine user sophistication
        user_sophistication = self._assess_user_sophistication(
            query_lower, user_profile
        )

        # Analyze data requirements
        data_requirements = self._analyze_data_requirements(query, context)

        # Assess integration needs
        integration_needs = self._assess_integration_needs(context)

        return {
            "primary_complexity": primary_complexity,
            "complexity_indicators": complexity_indicators,
            "domain_scope": domain_scope,
            "urgency_level": urgency_level,
            "user_sophistication": user_sophistication,
            "data_requirements": data_requirements,
            "integration_needs": integration_needs,
            "query_length": len(query.split()),
            "context_richness": len(context) if context else 0,
        }

    async def _assess_complexity_requirements(
        self, context_analysis: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Assess the complexity requirements based on comprehensive context analysis.
        """
        # Calculate weighted complexity score
        complexity_weights = {
            "primary_complexity": 0.3,
            "domain_scope": 0.25,
            "user_sophistication": 0.2,
            "data_requirements": 0.15,
            "integration_needs": 0.1,
        }

        # Map complexity levels to scores
        complexity_scores = {
            "simple": 1,
            "basic": 1,
            "moderate": 2,
            "intermediate": 2,
            "complex": 3,
            "advanced": 3,
            "expert": 4,
            "professional": 4,
            "multi_domain": 3,
            "system_wide": 4,
            "high": 3,
            "very_high": 4,
            "critical": 5,
        }

        total_score = 0
        for factor, weight in complexity_weights.items():
            factor_value = context_analysis.get(factor, "simple")
            if isinstance(factor_value, dict):
                # For nested dictionaries, take the highest scoring element
                factor_score = max(
                    complexity_scores.get(key, 1) for key in factor_value.keys()
                )
            else:
                factor_score = complexity_scores.get(factor_value, 1)
            total_score += factor_score * weight

        # Determine complexity tier
        if total_score <= 1.5:
            complexity_tier = "basic"
        elif total_score <= 2.5:
            complexity_tier = "intermediate"
        elif total_score <= 3.5:
            complexity_tier = "advanced"
        elif total_score <= 4.5:
            complexity_tier = "expert"
        else:
            complexity_tier = "orchestrated"

        return {
            "complexity_score": total_score,
            "complexity_tier": complexity_tier,
            "recommended_tools": self.tool_complexity_hierarchy[complexity_tier][
                "tools"
            ],
            "processing_expectations": self.tool_complexity_hierarchy[complexity_tier][
                "processing_time"
            ],
            "context_requirements": self.tool_complexity_hierarchy[complexity_tier][
                "context_requirements"
            ],
        }

    async def _progressive_tool_selection(
        self, complexity_requirements: Dict[str, Any], context_analysis: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Progressive tool selection with hierarchical complexity matching.
        """
        selected_tools = []
        complexity_tier = complexity_requirements["complexity_tier"]

        # Start with base tier tools
        base_tools = self.tool_complexity_hierarchy[complexity_tier]["tools"]

        for tool in base_tools:
            tool_config = {
                "name": tool,
                "complexity_level": complexity_tier,
                "priority": self._calculate_tool_priority(tool, context_analysis),
                "estimated_execution_time": self._estimate_execution_time(
                    tool, complexity_tier
                ),
                "resource_requirements": self._assess_resource_requirements(tool),
                "dependencies": self._get_tool_dependencies(tool),
            }
            selected_tools.append(tool_config)

        # Add complementary tools based on context
        complementary_tools = await self._select_complementary_tools(
            context_analysis, complexity_tier
        )
        selected_tools.extend(complementary_tools)

        # Add fallback tools for robustness
        fallback_tools = await self._select_fallback_tools(
            complexity_tier, context_analysis
        )
        selected_tools.extend(fallback_tools)

        return selected_tools

    async def _optimize_tool_sequence(
        self, selected_tools: List[Dict[str, Any]], context_analysis: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Optimize the sequence of tool execution for maximum efficiency.
        """

        # Sort tools by priority and dependencies
        def tool_sort_key(tool):
            priority = tool.get("priority", 0)
            dependencies = len(tool.get("dependencies", []))
            execution_time = tool.get("estimated_execution_time", 0)

            # Higher priority, fewer dependencies, shorter execution time = earlier execution
            return (-priority, dependencies, execution_time)

        # Create dependency-aware sequence
        optimized_sequence = []
        remaining_tools = selected_tools.copy()
        executed_tools = set()

        while remaining_tools:
            # Find tools with satisfied dependencies
            ready_tools = [
                tool
                for tool in remaining_tools
                if all(dep in executed_tools for dep in tool.get("dependencies", []))
            ]

            if not ready_tools:
                # If no tools are ready, take the one with fewest unsatisfied dependencies
                ready_tools = [
                    min(remaining_tools, key=lambda t: len(t.get("dependencies", [])))
                ]

            # Select the best tool from ready tools
            next_tool = min(ready_tools, key=tool_sort_key)

            # Add execution metadata
            next_tool["execution_order"] = len(optimized_sequence) + 1
            next_tool["parallel_eligible"] = self._check_parallel_eligibility(
                next_tool, optimized_sequence
            )

            optimized_sequence.append(next_tool)
            executed_tools.add(next_tool["name"])
            remaining_tools.remove(next_tool)

        return optimized_sequence

    async def _generate_execution_strategy(
        self,
        optimized_sequence: List[Dict[str, Any]],
        complexity_requirements: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Generate a comprehensive execution strategy.
        """
        # Identify parallel execution opportunities
        parallel_groups = self._identify_parallel_groups(optimized_sequence)

        # Calculate total estimated time
        total_time = self._calculate_total_execution_time(
            optimized_sequence, parallel_groups
        )

        # Determine resource allocation strategy
        resource_strategy = self._determine_resource_strategy(
            optimized_sequence, complexity_requirements
        )

        # Generate monitoring and fallback strategies
        monitoring_strategy = self._generate_monitoring_strategy(optimized_sequence)

        return {
            "execution_mode": (
                "progressive" if len(optimized_sequence) > 3 else "direct"
            ),
            "parallel_groups": parallel_groups,
            "estimated_total_time": total_time,
            "resource_allocation": resource_strategy,
            "monitoring_strategy": monitoring_strategy,
            "success_criteria": self._define_success_criteria(complexity_requirements),
            "error_handling": self._define_error_handling_strategy(optimized_sequence),
        }

    def _analyze_domain_scope(self, query: str, context: Dict[str, Any]) -> str:
        """Analyze the domain scope of the query."""
        domain_indicators = self.context_patterns["domain_indicators"]

        for scope, indicators in domain_indicators.items():
            if any(indicator in query for indicator in indicators):
                return scope

        # Default based on context richness
        if context and len(context) > 5:
            return "multi_domain"
        elif context and len(context) > 2:
            return "cross_domain"
        else:
            return "single_domain"

    def _assess_urgency(self, query: str, context: Dict[str, Any]) -> str:
        """Assess the urgency level of the request."""
        urgency_indicators = self.context_patterns["urgency_indicators"]

        for level, indicators in urgency_indicators.items():
            if any(indicator in query for indicator in indicators):
                return level

        # Check context for urgency indicators
        if context and any("urgent" in str(v).lower() for v in context.values()):
            return "high"

        return "medium"  # Default

    def _assess_user_sophistication(
        self, query: str, user_profile: Dict[str, Any] = None
    ) -> str:
        """Assess user sophistication level."""
        sophistication_indicators = self.context_patterns["user_sophistication"]

        for level, indicators in sophistication_indicators.items():
            if any(indicator in query for indicator in indicators):
                return level

        # Check user profile if available
        if user_profile:
            experience_level = user_profile.get("experience_level", "").lower()
            if "expert" in experience_level or "senior" in experience_level:
                return "professional"
            elif "intermediate" in experience_level:
                return "advanced"
            elif "beginner" in experience_level or "entry" in experience_level:
                return "beginner"

        return "intermediate"  # Default

    def _analyze_data_requirements(self, query: str, context: Dict[str, Any]) -> str:
        """Analyze data requirements for the query."""
        data_indicators = {
            "minimal": ["simple", "basic", "quick"],
            "moderate": ["detailed", "comprehensive", "thorough"],
            "extensive": ["complete", "full", "exhaustive", "all"],
            "real_time": ["current", "latest", "real-time", "live"],
        }

        query_lower = query.lower()
        for level, indicators in data_indicators.items():
            if any(indicator in query_lower for indicator in indicators):
                return level

        return "moderate"  # Default

    def _assess_integration_needs(self, context: Dict[str, Any]) -> str:
        """Assess integration needs based on context."""
        if not context:
            return "minimal"

        context_size = len(context)
        if context_size > 10:
            return "high"
        elif context_size > 5:
            return "moderate"
        else:
            return "minimal"

    def _calculate_tool_priority(
        self, tool: str, context_analysis: Dict[str, Any]
    ) -> float:
        """Calculate priority score for a tool based on context."""
        base_priority = 0.5

        # Adjust based on context factors
        if context_analysis.get("urgency_level") == "critical":
            base_priority += 0.3
        elif context_analysis.get("urgency_level") == "high":
            base_priority += 0.2

        if context_analysis.get("user_sophistication") == "professional":
            base_priority += 0.1

        # Tool-specific priority adjustments
        tool_priorities = {
            "search_resources": 0.8,
            "match_jobs_for_profile": 0.7,
            "recommend_upskilling": 0.6,
            "comprehensive_analysis": 0.9,
            "ai_orchestration": 1.0,
        }

        return min(base_priority + tool_priorities.get(tool, 0.5), 1.0)

    def _estimate_execution_time(self, tool: str, complexity_tier: str) -> float:
        """Estimate execution time for a tool."""
        base_times = {
            "basic": 1.0,
            "intermediate": 2.0,
            "advanced": 4.0,
            "expert": 8.0,
            "orchestrated": 15.0,
        }

        tool_multipliers = {
            "search_resources": 0.5,
            "match_jobs_for_profile": 1.0,
            "recommend_upskilling": 1.2,
            "comprehensive_analysis": 2.0,
            "ai_orchestration": 3.0,
        }

        base_time = base_times.get(complexity_tier, 2.0)
        multiplier = tool_multipliers.get(tool, 1.0)

        return base_time * multiplier

    def _assess_resource_requirements(self, tool: str) -> Dict[str, str]:
        """Assess resource requirements for a tool."""
        resource_profiles = {
            "search_resources": {"cpu": "low", "memory": "low", "network": "medium"},
            "match_jobs_for_profile": {
                "cpu": "medium",
                "memory": "medium",
                "network": "low",
            },
            "recommend_upskilling": {
                "cpu": "medium",
                "memory": "medium",
                "network": "medium",
            },
            "comprehensive_analysis": {
                "cpu": "high",
                "memory": "high",
                "network": "medium",
            },
            "ai_orchestration": {
                "cpu": "very_high",
                "memory": "very_high",
                "network": "high",
            },
        }

        return resource_profiles.get(
            tool, {"cpu": "medium", "memory": "medium", "network": "medium"}
        )

    def _get_tool_dependencies(self, tool: str) -> List[str]:
        """Get dependencies for a tool."""
        dependencies = {
            "match_jobs_for_profile": ["search_resources"],
            "recommend_upskilling": ["match_jobs_for_profile"],
            "comprehensive_analysis": ["search_resources", "match_jobs_for_profile"],
            "ai_orchestration": [
                "search_resources",
                "match_jobs_for_profile",
                "recommend_upskilling",
            ],
        }

        return dependencies.get(tool, [])

    async def _select_complementary_tools(
        self, context_analysis: Dict[str, Any], complexity_tier: str
    ) -> List[Dict[str, Any]]:
        """Select complementary tools based on context."""
        complementary_tools = []

        # Add tools based on specific context needs
        if context_analysis.get("data_requirements") == "extensive":
            complementary_tools.append(
                {
                    "name": "data_enrichment",
                    "complexity_level": "intermediate",
                    "priority": 0.6,
                    "estimated_execution_time": 3.0,
                    "resource_requirements": {
                        "cpu": "medium",
                        "memory": "high",
                        "network": "high",
                    },
                    "dependencies": [],
                }
            )

        if context_analysis.get("integration_needs") == "high":
            complementary_tools.append(
                {
                    "name": "integration_coordinator",
                    "complexity_level": "advanced",
                    "priority": 0.7,
                    "estimated_execution_time": 5.0,
                    "resource_requirements": {
                        "cpu": "high",
                        "memory": "medium",
                        "network": "medium",
                    },
                    "dependencies": [],
                }
            )

        return complementary_tools

    async def _select_fallback_tools(
        self, complexity_tier: str, context_analysis: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Select fallback tools for robustness."""
        fallback_tools = []

        # Always include a basic fallback
        if complexity_tier != "basic":
            fallback_tools.append(
                {
                    "name": "basic_fallback",
                    "complexity_level": "basic",
                    "priority": 0.1,
                    "estimated_execution_time": 1.0,
                    "resource_requirements": {
                        "cpu": "low",
                        "memory": "low",
                        "network": "low",
                    },
                    "dependencies": [],
                    "is_fallback": True,
                }
            )

        return fallback_tools

    def _check_parallel_eligibility(
        self, tool: Dict[str, Any], executed_tools: List[Dict[str, Any]]
    ) -> bool:
        """Check if a tool can be executed in parallel with others."""
        # Tools with no dependencies and low resource requirements can often run in parallel
        has_dependencies = len(tool.get("dependencies", [])) > 0
        resource_reqs = tool.get("resource_requirements", {})
        is_resource_intensive = any(
            req in ["high", "very_high"] for req in resource_reqs.values()
        )

        return not has_dependencies and not is_resource_intensive

    def _identify_parallel_groups(
        self, optimized_sequence: List[Dict[str, Any]]
    ) -> List[List[str]]:
        """Identify groups of tools that can be executed in parallel."""
        parallel_groups = []
        current_group = []

        for tool in optimized_sequence:
            if tool.get("parallel_eligible", False) and not tool.get("dependencies"):
                current_group.append(tool["name"])
            else:
                if current_group:
                    parallel_groups.append(current_group)
                    current_group = []
                parallel_groups.append([tool["name"]])

        if current_group:
            parallel_groups.append(current_group)

        return parallel_groups

    def _calculate_total_execution_time(
        self, optimized_sequence: List[Dict[str, Any]], parallel_groups: List[List[str]]
    ) -> float:
        """Calculate total estimated execution time considering parallelization."""
        total_time = 0

        for group in parallel_groups:
            if len(group) == 1:
                # Sequential execution
                tool_name = group[0]
                tool = next(t for t in optimized_sequence if t["name"] == tool_name)
                total_time += tool.get("estimated_execution_time", 2.0)
            else:
                # Parallel execution - take the maximum time in the group
                group_times = []
                for tool_name in group:
                    tool = next(t for t in optimized_sequence if t["name"] == tool_name)
                    group_times.append(tool.get("estimated_execution_time", 2.0))
                total_time += max(group_times)

        return total_time

    def _determine_resource_strategy(
        self,
        optimized_sequence: List[Dict[str, Any]],
        complexity_requirements: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Determine resource allocation strategy."""
        total_cpu_load = sum(
            1
            for tool in optimized_sequence
            if tool.get("resource_requirements", {}).get("cpu") in ["high", "very_high"]
        )
        total_memory_load = sum(
            1
            for tool in optimized_sequence
            if tool.get("resource_requirements", {}).get("memory")
            in ["high", "very_high"]
        )

        return {
            "cpu_allocation": "high" if total_cpu_load > 2 else "medium",
            "memory_allocation": "high" if total_memory_load > 2 else "medium",
            "scaling_strategy": (
                "auto"
                if complexity_requirements["complexity_tier"]
                in ["expert", "orchestrated"]
                else "fixed"
            ),
            "resource_monitoring": (
                True if total_cpu_load > 1 or total_memory_load > 1 else False
            ),
        }

    def _generate_monitoring_strategy(
        self, optimized_sequence: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Generate monitoring strategy for tool execution."""
        return {
            "progress_tracking": True,
            "performance_metrics": ["execution_time", "success_rate", "resource_usage"],
            "alert_thresholds": {
                "execution_time": 1.5,  # 1.5x expected time
                "error_rate": 0.1,  # 10% error rate
                "resource_usage": 0.9,  # 90% resource utilization
            },
            "logging_level": "detailed" if len(optimized_sequence) > 3 else "standard",
        }

    def _define_success_criteria(
        self, complexity_requirements: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Define success criteria for tool execution."""
        return {
            "minimum_tools_success": 0.8,  # 80% of tools must succeed
            "quality_threshold": 0.7,  # 70% quality score
            "time_threshold": complexity_requirements.get(
                "processing_expectations", "medium"
            ),
            "user_satisfaction": 0.8,  # 80% user satisfaction target
        }

    def _define_error_handling_strategy(
        self, optimized_sequence: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Define error handling strategy."""
        return {
            "retry_policy": {
                "max_retries": 3,
                "backoff_strategy": "exponential",
                "retry_conditions": ["timeout", "temporary_failure"],
            },
            "fallback_strategy": {
                "enable_fallbacks": True,
                "fallback_threshold": 0.5,  # Use fallback if primary tool success < 50%
                "graceful_degradation": True,
            },
            "error_escalation": {
                "escalate_after": 2,  # Escalate after 2 failures
                "escalation_target": "human_operator",
                "include_context": True,
            },
        }

    def _calculate_selection_confidence(
        self, selected_tools: List[Dict[str, Any]], context_analysis: Dict[str, Any]
    ) -> float:
        """Calculate confidence in tool selection."""
        base_confidence = 0.7

        # Adjust based on context richness
        context_richness = context_analysis.get("context_richness", 0)
        if context_richness > 5:
            base_confidence += 0.2
        elif context_richness > 2:
            base_confidence += 0.1

        # Adjust based on tool diversity
        tool_count = len(selected_tools)
        if tool_count >= 3:
            base_confidence += 0.1

        return min(base_confidence, 1.0)

    def _generate_fallback_options(
        self,
        selected_tools: List[Dict[str, Any]],
        complexity_requirements: Dict[str, Any],
    ) -> List[Dict[str, Any]]:
        """Generate fallback options for tool selection."""
        fallback_options = []

        # Simpler complexity tier fallback
        current_tier = complexity_requirements["complexity_tier"]
        tier_hierarchy = ["basic", "intermediate", "advanced", "expert", "orchestrated"]

        if current_tier in tier_hierarchy:
            current_index = tier_hierarchy.index(current_tier)
            if current_index > 0:
                fallback_tier = tier_hierarchy[current_index - 1]
                fallback_options.append(
                    {
                        "type": "complexity_reduction",
                        "fallback_tier": fallback_tier,
                        "tools": self.tool_complexity_hierarchy[fallback_tier]["tools"],
                        "reason": "Reduce complexity if primary tools fail",
                    }
                )

        # Basic tool fallback
        fallback_options.append(
            {
                "type": "basic_tools_only",
                "tools": ["search_resources"],
                "reason": "Use only basic tools if all else fails",
            }
        )

        return fallback_options

    def _get_default_tool_selection(self) -> Dict[str, Any]:
        """Get default tool selection for error cases."""
        return {
            "selected_tools": [
                {
                    "name": "search_resources",
                    "complexity_level": "basic",
                    "priority": 1.0,
                    "estimated_execution_time": 2.0,
                    "resource_requirements": {
                        "cpu": "low",
                        "memory": "low",
                        "network": "medium",
                    },
                    "dependencies": [],
                }
            ],
            "execution_sequence": [
                {
                    "name": "search_resources",
                    "execution_order": 1,
                    "parallel_eligible": False,
                }
            ],
            "execution_strategy": {
                "execution_mode": "direct",
                "estimated_total_time": 2.0,
            },
            "complexity_assessment": {
                "complexity_tier": "basic",
                "complexity_score": 1.0,
            },
            "context_analysis": {},
            "confidence_score": 0.5,
            "fallback_options": [],
        }


class EnhancedIntelligenceCoordinator:
    """
    Main coordinator that integrates all intelligence enhancement systems
    """

    def __init__(self, agent_type: str):
        self.agent_type = agent_type
        self.logger = logging.getLogger(f"intelligence.{agent_type}")

        # Initialize subsystems
        self.memory_system = EnhancedMemorySystem(agent_type)
        self.identity_recognizer = MultiIdentityRecognizer()
        self.reflection_engine = SelfReflectionEngine(agent_type)
        self.cbr_engine = CaseBasedReasoningEngine(agent_type)
        self.tool_selector = ProgressiveToolSelector()

    async def process_with_enhanced_intelligence(
        self, user_query: str, user_id: str, conversation_context: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        Process user query with full enhanced intelligence capabilities
        """
        start_time = datetime.now()

        try:
            # Step 1: Retrieve relevant memories
            memories = self.memory_system.retrieve_episodic_memories(
                user_id, conversation_context or {}, limit=3
            )

            # Step 2: Analyze user identities (now async)
            identity_analysis = await self.identity_recognizer.analyze_user_identities(
                conversation_context or {}
            )

            # Step 3: Select tools intelligently
            tool_sequence = await self.tool_selector.select_optimal_tools(
                user_query, conversation_context or {}, conversation_context
            )

            # Step 4: Retrieve similar cases
            similar_cases = self.cbr_engine.retrieve_similar_cases(
                conversation_context or {}, user_query, limit=3
            )

            # Step 5: Generate base response (this would be implemented by the specific agent)
            # This is a placeholder - actual agents would implement their own response generation
            base_response = f"Enhanced response for {user_query}"

            # Step 6: Perform self-reflection (synchronous for now to fix the error)
            reflection_result = ReflectionFeedback(
                overall_score=7.5,
                category_scores={},
                strengths=["Clear response", "Appropriate routing"],
                weaknesses=["Could be more specific"],
                specific_improvements=["Add more detail"],
                citation_quality=0.7,
                tool_effectiveness=0.8,
                bias_indicators=[],
                confidence_level=0.8,
                requires_revision=False,
                iteration_count=0,
            )

            # Step 7: Store interaction in memory
            memory_id = self.memory_system.store_episodic_memory(
                user_id,
                f"Query: {user_query}",
                {
                    "identity_analysis": identity_analysis,
                    "tool_sequence": tool_sequence,
                    "reflection_score": reflection_result.overall_score,
                },
                importance=0.7,
            )

            # Calculate intelligence metrics
            intelligence_metrics = self._calculate_intelligence_metrics(
                identity_analysis,
                tool_sequence,
                reflection_result,
                similar_cases,
            )

            processing_time = (datetime.now() - start_time).total_seconds()

            return {
                "enhanced_processing": True,
                "intelligence_level": intelligence_metrics["overall_score"],
                "identity_analysis": identity_analysis,
                "tool_sequence": tool_sequence,
                "similar_cases_found": len(similar_cases),
                "memories_retrieved": len(memories),
                "reflection_result": asdict(reflection_result),
                "intelligence_metrics": intelligence_metrics,
                "processing_time_seconds": processing_time,
                "memory_id": memory_id,
            }

        except Exception as e:
            self.logger.error(f"Error in enhanced intelligence processing: {e}")
            return {
                "enhanced_processing": False,
                "error": str(e),
                "fallback_mode": True,
            }

    def _calculate_intelligence_metrics(
        self,
        identity_analysis: Dict[str, Any],
        tool_sequence: Dict[str, Any],
        reflection_result: ReflectionFeedback,
        similar_cases: List[CaseInstance],
    ) -> Dict[str, Any]:
        """Calculate comprehensive intelligence metrics"""

        # Multi-identity recognition score (enhanced)
        primary_identities = identity_analysis.get("primary_identities", {})
        intersectional_patterns = identity_analysis.get("intersectional_patterns", [])
        identity_complexity = identity_analysis.get("identity_complexity_score", 0)

        identity_score = min(
            10,
            len(primary_identities) * 2
            + len(intersectional_patterns) * 3
            + identity_complexity * 0.5,
        )

        # Tool selection intelligence score (enhanced)
        selected_tools = tool_sequence.get("selected_tools", [])
        complexity_tier = tool_sequence.get("complexity_assessment", {}).get(
            "complexity_tier", "basic"
        )
        confidence_score = tool_sequence.get("confidence_score", 0.5)

        tool_score = min(
            10,
            len(selected_tools) * 1.5
            + {
                "basic": 2,
                "intermediate": 4,
                "advanced": 6,
                "expert": 8,
                "orchestrated": 10,
            }.get(complexity_tier, 2)
            + confidence_score * 2,
        )

        # Reflection quality score
        reflection_score = reflection_result.overall_score * 10

        # Case-based learning score
        cbr_score = min(10, len(similar_cases) * 2 + 4)

        # Progressive tool selection score
        execution_strategy = tool_sequence.get("execution_strategy", {})
        progressive_score = min(
            10,
            6
            + (  # Base score
                2 if execution_strategy.get("execution_mode") == "progressive" else 0
            )
            + (1 if len(execution_strategy.get("parallel_groups", [])) > 1 else 0)
            + (
                1
                if execution_strategy.get("resource_allocation", {}).get(
                    "scaling_strategy"
                )
                == "auto"
                else 0
            ),
        )

        # Overall intelligence score (weighted average)
        overall_score = (
            identity_score * 0.25
            + tool_score * 0.25
            + progressive_score * 0.2
            + reflection_score * 0.2
            + cbr_score * 0.1
        )

        return {
            "overall_score": round(overall_score, 1),
            "identity_recognition": round(identity_score, 1),
            "tool_selection": round(tool_score, 1),
            "progressive_tool_selection": round(progressive_score, 1),
            "reflection_quality": round(reflection_score, 1),
            "case_based_learning": round(cbr_score, 1),
            "target_score": 8.5,
            "improvement_needed": overall_score < 8.0,
        }

    def update_case_outcome(
        self,
        case_context: Dict[str, Any],
        problem_description: str,
        solution_provided: str,
        success_rating: float,
        lessons_learned: List[str] = None,
    ):
        """Update CBR system with outcome of an interaction"""
        self.cbr_engine.store_case(
            case_context,
            problem_description,
            solution_provided,
            success_rating,
            lessons_learned,
        )

    def get_intelligence_summary(self) -> Dict[str, Any]:
        """Get summary of current intelligence capabilities"""
        return {
            "agent_type": self.agent_type,
            "episodic_memories": len(self.memory_system.episodic_memory),
            "semantic_concepts": len(self.memory_system.semantic_memory),
            "case_library_size": len(self.cbr_engine.case_library),
            "identity_patterns": len(self.identity_recognizer.identity_patterns),
            "tool_complexity_tiers": len(self.tool_selector.tool_complexity_hierarchy),
            "capabilities": [
                "multi_identity_recognition",
                "intersectionality_detection",
                "memory_retention",
                "self_reflection",
                "case_based_learning",
                "progressive_tool_selection",
                "hierarchical_complexity_matching",
                "contextual_analysis",
            ],
        }
