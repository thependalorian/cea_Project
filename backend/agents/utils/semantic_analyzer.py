from typing import Dict, Any, List, Optional
from langchain_openai import OpenAIEmbeddings
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import logging
from ...database.supabase_client import supabase

logger = logging.getLogger(__name__)


class SemanticAnalyzer:
    """Pure semantic analysis without hardcoded keywords"""

    def __init__(self):
        self.embeddings = OpenAIEmbeddings()
        self._initialize_embeddings_table()

    def _initialize_embeddings_table(self):
        """Initialize or verify the embeddings table in Supabase"""
        try:
            # Check if table exists, create if not
            supabase.table("semantic_embeddings").select("*").limit(1).execute()
            logger.info("Embeddings table verified")
        except Exception as e:
            logger.error(f"Error verifying embeddings table: {e}")
            raise

    async def analyze_population_identity(
        self, message: str, context: Dict = None
    ) -> Dict[str, Any]:
        """Analyze population identity using semantic similarity"""
        try:
            # Generate message embedding
            message_embedding = await self.embeddings.aembed_query(message)

            # Get population embeddings from Supabase
            population_embeddings = await self._get_population_embeddings()

            # Calculate similarities
            population_scores = {}
            for pop in population_embeddings:
                similarity = cosine_similarity([message_embedding], [pop["embedding"]])[
                    0
                ][0]
                population_scores[pop["population"]] = similarity

            # Get highest scoring population
            best_match = max(population_scores.items(), key=lambda x: x[1])

            return {
                "identified_population": (
                    best_match[0] if best_match[1] > 0.7 else "general"
                ),
                "confidence_score": best_match[1],
                "all_scores": population_scores,
                "analysis_method": "semantic_embedding_similarity",
            }

        except Exception as e:
            logger.error(f"Population analysis error: {e}")
            return {
                "identified_population": "general",
                "confidence_score": 0.0,
                "error": str(e),
            }

    async def analyze_intent_and_needs(self, message: str) -> Dict[str, Any]:
        """Analyze user intent and needs semantically"""
        try:
            message_embedding = await self.embeddings.aembed_query(message)

            # Get intent embeddings from Supabase
            intent_embeddings = await self._get_intent_embeddings()

            # Calculate similarities
            intent_scores = {}
            for intent in intent_embeddings:
                similarity = cosine_similarity(
                    [message_embedding], [intent["embedding"]]
                )[0][0]
                intent_scores[intent["intent_type"]] = similarity

            # Get primary and secondary intents
            sorted_intents = sorted(
                intent_scores.items(), key=lambda x: x[1], reverse=True
            )

            return {
                "primary_intent": sorted_intents[0][0],
                "primary_confidence": sorted_intents[0][1],
                "secondary_intent": (
                    sorted_intents[1][0] if len(sorted_intents) > 1 else None
                ),
                "all_scores": intent_scores,
                "analysis_method": "semantic_embedding_similarity",
            }

        except Exception as e:
            logger.error(f"Intent analysis error: {e}")
            return {
                "primary_intent": "general_inquiry",
                "primary_confidence": 0.0,
                "error": str(e),
            }

    async def _get_population_embeddings(self) -> List[Dict]:
        """Get population embeddings from Supabase"""
        try:
            result = (
                await supabase.table("semantic_embeddings")
                .select("*")
                .eq("type", "population")
                .execute()
            )
            return result.data
        except Exception as e:
            logger.error(f"Error fetching population embeddings: {e}")
            return []

    async def _get_intent_embeddings(self) -> List[Dict]:
        """Get intent embeddings from Supabase"""
        try:
            result = (
                await supabase.table("semantic_embeddings")
                .select("*")
                .eq("type", "intent")
                .execute()
            )
            return result.data
        except Exception as e:
            logger.error(f"Error fetching intent embeddings: {e}")
            return []

    async def update_embeddings(
        self, embedding_type: str, data: Dict[str, Any]
    ) -> bool:
        """Update embeddings in Supabase"""
        try:
            # Generate embedding
            text = data.get("text", "")
            embedding = await self.embeddings.aembed_query(text)

            # Store in Supabase
            await supabase.table("semantic_embeddings").upsert(
                {
                    "type": embedding_type,
                    "name": data.get("name"),
                    "embedding": embedding,
                    "metadata": data.get("metadata", {}),
                }
            ).execute()

            return True
        except Exception as e:
            logger.error(f"Error updating embeddings: {e}")
            return False
