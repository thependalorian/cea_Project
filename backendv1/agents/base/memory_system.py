"""
Memory System for Enhanced Agent Intelligence

Following rule #12: Complete code verification with proper memory management
Following rule #15: Include comprehensive error handling

This module provides episodic and semantic memory capabilities for agents.
Location: backendv1/agents/base/memory_system.py
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

from backendv1.utils.logger import setup_logger
from backendv1.adapters.openai_adapter import OpenAIAdapter

logger = setup_logger("memory_system")


class MemorySystem:
    """
    Enhanced memory system for agent intelligence

    Following rule #12: Complete code verification with proper typing
    """

    def __init__(self, agent_name: str):
        """Initialize memory system for an agent"""
        self.agent_name = agent_name
        self.episodic_memory: List[Dict[str, Any]] = []
        self.semantic_memory: Dict[str, Any] = {}
        self.embedding_cache: Dict[str, np.ndarray] = {}
        self.openai_adapter = OpenAIAdapter()
        logger.info(f"🧠 Memory system initialized for {agent_name}")

    async def store_episode(self, episode: Dict[str, Any]) -> bool:
        """
        Store an episodic memory

        Args:
            episode: Episode data to store

        Returns:
            bool: True if successful
        """
        try:
            episode_with_timestamp = {
                **episode,
                "timestamp": datetime.utcnow().isoformat(),
                "agent": self.agent_name,
            }
            self.episodic_memory.append(episode_with_timestamp)

            # Cache embedding for faster retrieval
            if "content" in episode:
                await self._cache_embedding(episode["content"], len(self.episodic_memory) - 1)

            logger.debug(f"🧠 Episode stored for {self.agent_name}")
            return True
        except Exception as e:
            logger.error(f"Error storing episode: {e}")
            return False

    async def _cache_embedding(self, text: str, memory_index: int) -> bool:
        """Cache embedding for a text"""
        try:
            embedding = await self._get_embedding(text)
            if embedding is not None:
                key = f"mem_{memory_index}"
                self.embedding_cache[key] = embedding
                return True
            return False
        except Exception as e:
            logger.error(f"Error caching embedding: {e}")
            return False

    async def _get_embedding(self, text: str) -> Optional[np.ndarray]:
        """Get embedding for text using OpenAI adapter"""
        try:
            embedding_result = await self.openai_adapter.create_embedding(text)
            if embedding_result and "embedding" in embedding_result:
                return np.array(embedding_result["embedding"])
            return None
        except Exception as e:
            logger.error(f"Error getting embedding: {e}")
            return None

    async def retrieve_memories(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        """
        Retrieve relevant memories

        Args:
            query: Search query
            limit: Maximum number of memories to return

        Returns:
            List[Dict[str, Any]]: Relevant memories
        """
        try:
            # If no memories or small number of memories, return the most recent ones
            if len(self.episodic_memory) <= limit:
                return self.episodic_memory

            # Get query embedding
            query_embedding = await self._get_embedding(query)
            if query_embedding is None:
                logger.warning("Could not get embedding for query, returning most recent memories")
                return self.episodic_memory[-limit:]

            # Calculate similarities for all memories with embeddings
            similarities = []
            for idx, memory in enumerate(self.episodic_memory):
                key = f"mem_{idx}"

                # Get or create embedding
                if key in self.embedding_cache:
                    memory_embedding = self.embedding_cache[key]
                elif "content" in memory:
                    memory_embedding = await self._get_embedding(memory["content"])
                    if memory_embedding is not None:
                        self.embedding_cache[key] = memory_embedding
                    else:
                        continue
                else:
                    continue

                # Calculate similarity
                similarity = cosine_similarity([query_embedding], [memory_embedding])[0][0]
                similarities.append((similarity, idx))

            # Sort by similarity (descending) and get top memories
            similarities.sort(reverse=True)
            top_memory_indices = [idx for _, idx in similarities[:limit]]
            relevant_memories = [self.episodic_memory[idx] for idx in top_memory_indices]

            logger.debug(
                f"🧠 Retrieved {len(relevant_memories)} relevant memories for query: {query}"
            )
            return relevant_memories

        except Exception as e:
            logger.error(f"Error retrieving memories: {e}")
            return self.episodic_memory[-limit:] if self.episodic_memory else []

    async def update_semantic_knowledge(self, key: str, value: Any) -> bool:
        """
        Update semantic memory

        Args:
            key: Knowledge key
            value: Knowledge value

        Returns:
            bool: True if successful
        """
        try:
            self.semantic_memory[key] = value
            logger.debug(f"🧠 Semantic knowledge updated: {key}")
            return True
        except Exception as e:
            logger.error(f"Error updating semantic knowledge: {e}")
            return False


# Export main class
__all__ = ["MemorySystem"]
