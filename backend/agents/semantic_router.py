"""
Semantic router for routing messages to appropriate agents based on content analysis.
Uses caching and optimized similarity computation for better performance.
"""

from typing import Dict, List, Optional, Tuple
import asyncio
from langchain_community.embeddings import OpenAIEmbeddings
import numpy as np
from backend.database.redis_client import redis_client
from backend.config.settings import get_settings
import structlog
import json

logger = structlog.get_logger(__name__)
settings = get_settings()


class SemanticRouter:
    """Routes messages to appropriate agents based on semantic analysis with caching."""

    def __init__(self):
        """Initialize the semantic router."""
        self.embeddings = OpenAIEmbeddings()
        self.agent_descriptions: Dict[str, str] = {}
        self.agent_embeddings: Dict[str, List[float]] = {}
        self.cache_ttl = 3600  # 1 hour cache TTL

    async def initialize(self, agent_descriptions: Dict[str, str]) -> None:
        """Initialize agent descriptions and embeddings with caching."""
        self.agent_descriptions = agent_descriptions

        # Try to load cached embeddings first
        cached_embeddings = await self._load_cached_embeddings()
        if cached_embeddings:
            self.agent_embeddings = cached_embeddings
            logger.info("Loaded agent embeddings from cache")
            return

        # Generate embeddings for each agent description
        for agent_id, description in agent_descriptions.items():
            try:
                embedding = await asyncio.to_thread(
                    self.embeddings.embed_query, description
                )
                self.agent_embeddings[agent_id] = embedding
            except Exception as e:
                logger.error(
                    "Error generating embedding", agent_id=agent_id, error=str(e)
                )
                continue

        # Cache the embeddings
        await self._cache_embeddings()

    async def route_message(self, message: str) -> Tuple[Optional[str], float]:
        """Route a message to the most appropriate agent.
        Returns tuple of (agent_id, similarity_score).
        """
        try:
            # Check cache for message embedding
            cache_key = f"msg_emb:{hash(message)}"
            message_embedding = await self._get_cached_embedding(cache_key)

            if not message_embedding:
                # Generate and cache embedding
                message_embedding = await asyncio.to_thread(
                    self.embeddings.embed_query, message
                )
                await self._cache_embedding(cache_key, message_embedding)

            # Convert to numpy arrays for vectorized computation
            msg_array = np.array(message_embedding)
            similarities = {}

            # Compute similarities in parallel
            for agent_id, agent_embedding in self.agent_embeddings.items():
                agent_array = np.array(agent_embedding)
                similarity = self._compute_similarity_numpy(msg_array, agent_array)
                similarities[agent_id] = similarity

            # Find best match
            if similarities:
                best_agent = max(similarities.items(), key=lambda x: x[1])
                agent_id, similarity = best_agent

                if similarity > settings.ROUTING_SIMILARITY_THRESHOLD:
                    logger.info(
                        "Routed message to agent",
                        agent_id=agent_id,
                        similarity=similarity,
                    )
                    return agent_id, similarity

            # Default to general assistant if no good match found
            logger.info("No suitable agent found, defaulting to general assistant")
            return "pendo", 0.0

        except Exception as e:
            logger.error("Error routing message", error=str(e))
            return "pendo", 0.0  # Default to general assistant on error

    def _compute_similarity_numpy(self, vec1: np.ndarray, vec2: np.ndarray) -> float:
        """Compute cosine similarity using numpy for better performance."""
        if vec1.shape != vec2.shape:
            raise ValueError("Vectors must have the same shape")

        # Compute cosine similarity
        dot_product = np.dot(vec1, vec2)
        norm1 = np.linalg.norm(vec1)
        norm2 = np.linalg.norm(vec2)

        if norm1 == 0 or norm2 == 0:
            return 0.0

        return float(dot_product / (norm1 * norm2))

    async def _load_cached_embeddings(self) -> Optional[Dict[str, List[float]]]:
        """Load embeddings from cache."""
        try:
            cached = await redis_client.get("agent_embeddings")
            if cached:
                return {k: np.array(v).tolist() for k, v in cached.items()}
            return None
        except Exception as e:
            logger.error("Error loading cached embeddings", error=str(e))
            return None

    async def _cache_embeddings(self) -> None:
        """Cache agent embeddings."""
        try:
            await redis_client.set(
                "agent_embeddings",
                {k: np.array(v).tolist() for k, v in self.agent_embeddings.items()},
                ttl=self.cache_ttl,
            )
        except Exception as e:
            logger.error("Error caching embeddings", error=str(e))

    async def _get_cached_embedding(self, key: str) -> Optional[List[float]]:
        """Get embedding from cache."""
        try:
            cached = await redis_client.get(key)
            if cached:
                return np.array(cached).tolist()
            return None
        except Exception as e:
            logger.error("Error getting cached embedding", key=key, error=str(e))
            return None

    async def _cache_embedding(self, key: str, embedding: List[float]) -> None:
        """Cache an embedding."""
        try:
            await redis_client.set(
                key, np.array(embedding).tolist(), ttl=self.cache_ttl
            )
        except Exception as e:
            logger.error("Error caching embedding", key=key, error=str(e))
