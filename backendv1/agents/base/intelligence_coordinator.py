"""
Enhanced Intelligence Coordinator

Following rule #12: Complete code verification with modular intelligence framework
Following rule #15: Include comprehensive error handling for AI operations
Following rule #2: Create modular components for advanced AI capabilities

This module coordinates enhanced intelligence capabilities across all agents.
Location: backendv1/agents/base/intelligence_coordinator.py
"""

from typing import Any, Dict, List, Optional
from datetime import datetime

from backendv1.utils.logger import setup_logger
from backendv1.config.settings import get_settings
from backendv1.agents.base.memory_system import MemorySystem
from backendv1.agents.base.reflection_engine import ReflectionEngine
from backendv1.adapters.openai_adapter import OpenAIAdapter

logger = setup_logger("intelligence_coordinator")
settings = get_settings()


class IntelligenceCoordinator:
    """
    Enhanced intelligence coordinator for advanced AI capabilities

    Following rule #2: Modular component design
    Following rule #12: Complete code verification

    This class will be expanded to include:
    - Multi-model coordination
    - Response quality analysis
    - Cognitive enhancement features
    - Performance optimization
    """

    def __init__(self, coordinator_type: str = "base"):
        self.coordinator_type = coordinator_type
        self.model_name = settings.DEFAULT_AI_MODEL
        self.temperature = settings.AGENT_TEMPERATURE
        self.memory = MemorySystem(f"{coordinator_type}_coordinator")
        self.reflection = ReflectionEngine(f"{coordinator_type}_coordinator")
        self.openai_adapter = OpenAIAdapter()

        logger.info(f"✅ Intelligence coordinator initialized: {coordinator_type}")

    async def enhance_response(
        self, base_response: str, context: Dict[str, Any], enhancement_level: str = "standard"
    ) -> Dict[str, Any]:
        """
        Enhance AI response with advanced intelligence capabilities

        Args:
            base_response: Original AI response
            context: Conversation context
            enhancement_level: Level of enhancement to apply

        Returns:
            Dict[str, Any]: Enhanced response with metadata
        """
        try:
            # Store the original response in memory
            await self.memory.store_episode(
                {"type": "response", "content": base_response, "context": context}
            )

            # Determine enhancement approach based on level
            if enhancement_level == "minimal":
                # For minimal enhancement, just return the original with metadata
                return {
                    "content": base_response,
                    "enhancement_level": "minimal",
                    "confidence_score": 0.9,
                    "intelligence_metrics": {
                        "clarity": 0.9,
                        "actionability": 0.8,
                        "personalization": 0.7,
                    },
                    "enhanced_at": datetime.utcnow().isoformat(),
                }

            # For standard and advanced enhancement, use the OpenAI adapter
            enhancement_prompt = self._build_enhancement_prompt(
                base_response, context, enhancement_level
            )

            # Get enhanced response from OpenAI
            response_data = await self.openai_adapter.complete(
                enhancement_prompt,
                temperature=0.3,  # Lower temperature for more controlled enhancement
                max_tokens=1500,
            )

            enhanced_content = response_data.get("content", base_response)

            # Analyze the enhanced response quality
            quality_metrics = await self.analyze_quality(enhanced_content, context)

            enhanced_response = {
                "content": enhanced_content,
                "enhancement_level": enhancement_level,
                "confidence_score": quality_metrics.get("overall_quality", 0.8),
                "intelligence_metrics": {
                    "clarity": quality_metrics.get("clarity_score", 0.8),
                    "actionability": quality_metrics.get("actionability_score", 0.7),
                    "personalization": quality_metrics.get("personalization_score", 0.9),
                },
                "enhanced_at": datetime.utcnow().isoformat(),
            }

            # Store enhanced response in memory
            await self.memory.store_episode(
                {
                    "type": "enhanced_response",
                    "content": enhanced_content,
                    "metrics": quality_metrics,
                    "original": base_response,
                }
            )

            logger.debug(f"Enhanced response with {enhancement_level} level")
            return enhanced_response

        except Exception as e:
            logger.error(f"Error enhancing response: {e}")
            return {
                "content": base_response,
                "enhancement_level": "none",
                "confidence_score": 0.5,
                "error": str(e),
            }

    def _build_enhancement_prompt(
        self, response: str, context: Dict[str, Any], enhancement_level: str
    ) -> str:
        """Build prompt for response enhancement"""
        user_query = context.get("query", "")
        user_info = context.get("user_info", {})
        conversation_history = context.get("conversation_history", [])

        # Base prompt for enhancement
        prompt = f"""You are an expert at enhancing AI responses to make them more helpful, 
clear, and personalized. Your task is to enhance the following AI response.

Original user query: {user_query}

AI response to enhance:
---
{response}
---

Enhancement level: {enhancement_level}

"""

        # Add specific enhancement instructions based on level
        if enhancement_level == "standard":
            prompt += """
Please enhance this response by:
1. Improving clarity and readability
2. Adding specific actionable steps if applicable
3. Ensuring it directly addresses the user's query
4. Maintaining the same information and intent

Return only the enhanced response text without explanations or meta-commentary.
"""
        elif enhancement_level == "advanced":
            prompt += f"""
Please significantly enhance this response by:
1. Improving clarity, concision, and readability
2. Adding specific, detailed actionable steps with context
3. Personalizing based on user profile: {user_info.get('profile_summary', 'No profile available')}
4. Incorporating relevant previous conversation context if helpful
5. Adding depth and nuance while maintaining accuracy
6. Structuring information for maximum readability and usefulness

Return only the enhanced response text without explanations or meta-commentary.
"""

        return prompt

    async def analyze_quality(self, response: str, user_context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze response quality using multiple dimensions

        Args:
            response: AI response to analyze
            user_context: User context information

        Returns:
            Dict[str, Any]: Quality analysis results
        """
        try:
            # Define evaluation criteria based on best practices
            query = user_context.get("query", "")

            # Create analysis prompt
            analysis_prompt = f"""
You are an expert AI quality evaluator. Analyze the following AI response to a user query.
Evaluate on a scale from 0.0 to 1.0 (where 1.0 is perfect) across these dimensions:

User query: {query}

AI response:
---
{response}
---

Evaluate:
1. Clarity score (0.0-1.0): How clear and understandable is the response?
2. Actionability score (0.0-1.0): How actionable and practical is the response?
3. Personalization score (0.0-1.0): How well-tailored is it to the specific query?
4. Empathy score (0.0-1.0): How empathetic and understanding is the response?
5. Overall quality (0.0-1.0): The overall quality considering all factors

Format your response as a JSON object with these scores and brief explanations.
"""

            # Get quality analysis from OpenAI
            analysis_data = await self.openai_adapter.complete(
                analysis_prompt,
                temperature=0.1,  # Low temperature for consistent evaluations
                max_tokens=800,
                response_format={"type": "json_object"},
            )

            # Extract metrics from the response
            try:
                content = analysis_data.get("content", "{}")
                import json

                metrics = json.loads(content)

                # Ensure all required metrics are present
                quality_metrics = {
                    "clarity_score": metrics.get("clarity_score", 0.8),
                    "actionability_score": metrics.get("actionability_score", 0.7),
                    "personalization_score": metrics.get("personalization_score", 0.9),
                    "empathy_score": metrics.get("empathy_score", 0.8),
                    "overall_quality": metrics.get("overall_quality", 0.8),
                    "analysis_timestamp": datetime.utcnow().isoformat(),
                }

                # Store analysis in memory for future learning
                await self.memory.store_episode(
                    {
                        "type": "quality_analysis",
                        "metrics": quality_metrics,
                        "query": query,
                        "response": response,
                    }
                )

                # Reflect on the quality for continuous improvement
                await self.reflection.reflect_on_interaction(
                    {"type": "quality_analysis", "metrics": quality_metrics, "response": response}
                )

                return quality_metrics

            except Exception as parse_error:
                logger.error(f"Error parsing quality analysis: {parse_error}")
                # Fall back to default metrics
                return {
                    "clarity_score": 0.8,
                    "actionability_score": 0.7,
                    "personalization_score": 0.9,
                    "empathy_score": 0.8,
                    "overall_quality": 0.8,
                    "analysis_timestamp": datetime.utcnow().isoformat(),
                    "error": "Analysis parsing failed",
                }

        except Exception as e:
            logger.error(f"Error analyzing quality: {e}")
            return {"overall_quality": 0.5, "error": str(e)}


# Use the already improved MemorySystem from memory_system.py

# Use the already improved ReflectionEngine from reflection_engine.py

# Export main classes
__all__ = ["IntelligenceCoordinator", "MemorySystem", "ReflectionEngine"]
