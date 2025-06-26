from typing import Dict, Any, Optional
import logging
from .semantic_analyzer import SemanticAnalyzer

logger = logging.getLogger(__name__)


class SemanticRouter:
    """Pure semantic routing without any hardcoded keywords"""

    def __init__(self):
        self.semantic_analyzer = SemanticAnalyzer()
        self.confidence_threshold = 0.7

    async def route_message(self, message: str, context: Dict = None) -> Dict[str, Any]:
        """Route message using pure semantic analysis"""
        try:
            # Analyze population identity
            population_analysis = (
                await self.semantic_analyzer.analyze_population_identity(
                    message, context
                )
            )

            # Analyze intent and needs
            intent_analysis = await self.semantic_analyzer.analyze_intent_and_needs(
                message
            )

            # Determine optimal agent based on semantic analysis
            optimal_agent = await self._determine_optimal_agent(
                population_analysis, intent_analysis, context
            )

            return {
                "agent": optimal_agent["agent_name"],
                "confidence": optimal_agent["confidence"],
                "reasoning": optimal_agent["reasoning"],
                "population_analysis": population_analysis,
                "intent_analysis": intent_analysis,
                "routing_method": "semantic_similarity_analysis",
            }

        except Exception as e:
            logger.error(f"Semantic routing error: {e}")
            return {
                "agent": "pendo",  # Fallback to supervisor
                "confidence": 0.3,
                "reasoning": f"Error in semantic routing: {str(e)}",
                "routing_method": "error_fallback",
            }

    async def _determine_optimal_agent(
        self, population_analysis: Dict, intent_analysis: Dict, context: Dict = None
    ) -> Dict[str, Any]:
        """Determine optimal agent using semantic matching"""
        try:
            # Get agent capabilities from embeddings
            agent_capabilities = await self.semantic_analyzer._get_agent_capabilities()

            # Calculate agent scores
            agent_scores = {}
            for agent in agent_capabilities:
                # Population match score
                population_score = cosine_similarity(
                    [agent["population_embedding"]], [population_analysis["embedding"]]
                )[0][0]

                # Intent match score
                intent_score = cosine_similarity(
                    [agent["intent_embedding"]], [intent_analysis["embedding"]]
                )[0][0]

                # Context relevance score
                context_score = await self._calculate_context_relevance(agent, context)

                # Calculate weighted score
                total_score = (
                    population_score * 0.4 + intent_score * 0.4 + context_score * 0.2
                )

                agent_scores[agent["name"]] = {
                    "total_score": total_score,
                    "population_score": population_score,
                    "intent_score": intent_score,
                    "context_score": context_score,
                }

            # Select best agent
            best_agent = max(agent_scores.items(), key=lambda x: x[1]["total_score"])

            return {
                "agent_name": best_agent[0],
                "confidence": best_agent[1]["total_score"],
                "reasoning": self._generate_routing_reasoning(
                    best_agent, population_analysis, intent_analysis
                ),
                "all_scores": agent_scores,
            }

        except Exception as e:
            logger.error(f"Error determining optimal agent: {e}")
            return {
                "agent_name": "pendo",
                "confidence": 0.3,
                "reasoning": f"Error in agent determination: {str(e)}",
                "all_scores": {},
            }

    async def _calculate_context_relevance(
        self, agent: Dict, context: Dict = None
    ) -> float:
        """Calculate context relevance score"""
        if not context:
            return 0.5  # Neutral score

        try:
            # Get context embedding
            context_text = self._format_context(context)
            context_embedding = await self.semantic_analyzer.embeddings.aembed_query(
                context_text
            )

            # Calculate similarity with agent's context handling
            similarity = cosine_similarity(
                [context_embedding], [agent["context_embedding"]]
            )[0][0]

            return similarity

        except Exception as e:
            logger.error(f"Error calculating context relevance: {e}")
            return 0.5

    def _format_context(self, context: Dict) -> str:
        """Format context dictionary into analyzable text"""
        context_parts = []

        if "conversation_history" in context:
            context_parts.append(
                "Previous messages: "
                + " ".join(
                    [
                        msg["content"] for msg in context["conversation_history"][-3:]
                    ]  # Last 3 messages
                )
            )

        if "user_profile" in context:
            profile = context["user_profile"]
            context_parts.extend(
                [
                    f"User background: {profile.get('background', '')}",
                    f"Career interests: {', '.join(profile.get('career_interests', []))}",
                    f"Skills: {', '.join(profile.get('skills', []))}",
                ]
            )

        if "session_metadata" in context:
            metadata = context["session_metadata"]
            context_parts.extend(
                [
                    f"Current focus: {metadata.get('current_focus', '')}",
                    f"Session goals: {metadata.get('session_goals', '')}",
                ]
            )

        return "\n".join(context_parts)

    def _generate_routing_reasoning(
        self, best_agent: tuple, population_analysis: Dict, intent_analysis: Dict
    ) -> str:
        """Generate human-readable reasoning for routing decision"""
        agent_name = best_agent[0]
        scores = best_agent[1]

        reasoning_parts = []

        # Population-based reasoning
        if scores["population_score"] > 0.8:
            reasoning_parts.append(
                f"High specialization match for {population_analysis['identified_population']} population"
            )
        elif scores["population_score"] > 0.6:
            reasoning_parts.append(
                f"Good fit for {population_analysis['identified_population']} population needs"
            )

        # Intent-based reasoning
        if scores["intent_score"] > 0.8:
            reasoning_parts.append(
                f"Strong capability for {intent_analysis['primary_intent']} requests"
            )
        elif scores["intent_score"] > 0.6:
            reasoning_parts.append(
                f"Suitable for handling {intent_analysis['primary_intent']}"
            )

        # Overall confidence
        if scores["total_score"] > 0.8:
            reasoning_parts.append("High confidence routing")
        elif scores["total_score"] > 0.6:
            reasoning_parts.append("Good confidence routing")
        else:
            reasoning_parts.append("Moderate confidence routing")

        return f"Routed to {agent_name}: " + ", ".join(reasoning_parts)
