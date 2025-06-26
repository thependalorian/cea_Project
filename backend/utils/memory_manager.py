"""
Memory management utilities for the Climate Economy Assistant.
Provides standardized memory handling across agent workflows.
"""

import json
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import asyncio

from backend.utils.logger import get_logger
from backend.database.redis_client import redis_client

logger = get_logger(__name__)


class MemoryManager:
    """
    Memory management system for agent and conversation state.
    Handles caching, retrieval, and semantic search of conversation history.
    """

    def __init__(self, ttl: int = 86400):  # Default TTL: 24 hours
        """Initialize the memory manager."""
        self.ttl = ttl
        self.namespace = "cea:memory:"

    async def store_memory(
        self,
        key: str,
        data: Dict[str, Any],
        namespace: Optional[str] = None,
        ttl: Optional[int] = None,
    ) -> bool:
        """
        Store data in memory with optional custom namespace and TTL.

        Args:
            key: Unique identifier for the memory
            data: Data to store
            namespace: Optional custom namespace
            ttl: Optional custom TTL in seconds

        Returns:
            bool: Success status
        """
        try:
            full_key = f"{namespace or self.namespace}{key}"
            client = await redis_client.get_client()

            # Add metadata
            data_with_metadata = {
                **data,
                "_metadata": {
                    "created_at": datetime.utcnow().isoformat(),
                    "updated_at": datetime.utcnow().isoformat(),
                },
            }

            # Store in Redis
            await client.set(
                full_key, json.dumps(data_with_metadata), ex=ttl or self.ttl
            )

            logger.debug(f"Stored memory: {full_key}")
            return True

        except Exception as e:
            logger.error(f"Failed to store memory: {str(e)}", key=key)
            return False

    async def retrieve_memory(
        self, key: str, namespace: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Retrieve data from memory.

        Args:
            key: Unique identifier for the memory
            namespace: Optional custom namespace

        Returns:
            Optional[Dict[str, Any]]: Retrieved data or None if not found
        """
        try:
            full_key = f"{namespace or self.namespace}{key}"
            client = await redis_client.get_client()

            # Retrieve from Redis
            data = await client.get(full_key)

            if not data:
                logger.debug(f"Memory not found: {full_key}")
                return None

            # Parse JSON data
            parsed_data = json.loads(data)

            logger.debug(f"Retrieved memory: {full_key}")
            return parsed_data

        except Exception as e:
            logger.error(f"Failed to retrieve memory: {str(e)}", key=key)
            return None

    async def delete_memory(self, key: str, namespace: Optional[str] = None) -> bool:
        """
        Delete data from memory.

        Args:
            key: Unique identifier for the memory
            namespace: Optional custom namespace

        Returns:
            bool: Success status
        """
        try:
            full_key = f"{namespace or self.namespace}{key}"
            client = await redis_client.get_client()

            # Delete from Redis
            await client.delete(full_key)

            logger.debug(f"Deleted memory: {full_key}")
            return True

        except Exception as e:
            logger.error(f"Failed to delete memory: {str(e)}", key=key)
            return False

    async def store_conversation_context(
        self, user_id: str, conversation_id: str, context: Dict[str, Any]
    ) -> bool:
        """
        Store conversation context.

        Args:
            user_id: User ID
            conversation_id: Conversation ID
            context: Context data

        Returns:
            bool: Success status
        """
        key = f"conversation:{conversation_id}"
        namespace = f"cea:user:{user_id}:"

        # Retrieve existing context if any
        existing = await self.retrieve_memory(key, namespace)
        if existing:
            # Merge with existing context
            merged_context = {**existing, **context}
            merged_context["_metadata"]["updated_at"] = datetime.utcnow().isoformat()
            return await self.store_memory(key, merged_context, namespace)

        return await self.store_memory(key, context, namespace)

    async def retrieve_conversation_context(
        self, user_id: str, conversation_id: str
    ) -> Dict[str, Any]:
        """
        Retrieve conversation context.

        Args:
            user_id: User ID
            conversation_id: Conversation ID

        Returns:
            Dict[str, Any]: Retrieved context or empty dict if not found
        """
        key = f"conversation:{conversation_id}"
        namespace = f"cea:user:{user_id}:"

        result = await self.retrieve_memory(key, namespace)
        return result or {}

    async def retrieve_user_context(self, user_id: str) -> Dict[str, Any]:
        """
        Retrieve all context for a user.

        Args:
            user_id: User ID

        Returns:
            Dict[str, Any]: User context or empty dict if not found
        """
        try:
            namespace = f"cea:user:{user_id}:"
            client = await redis_client.get_client()

            # Get all keys for user
            keys = await client.keys(f"{namespace}*")

            if not keys:
                return {}

            # Retrieve all values
            result = {}
            for key in keys:
                data = await client.get(key)
                if data:
                    key_name = key.decode("utf-8").replace(namespace, "")
                    result[key_name] = json.loads(data)

            return result

        except Exception as e:
            logger.error(f"Failed to retrieve user context: {str(e)}", user_id=user_id)
            return {}

    async def search_semantic_memories(
        self, query: str, user_id: str, limit: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Search for semantically similar memories.

        Args:
            query: Search query
            user_id: User ID
            limit: Maximum number of results

        Returns:
            List[Dict[str, Any]]: List of semantically similar memories
        """
        # This would ideally use a vector database for semantic search
        # For now, we return a placeholder implementation
        logger.warning("Semantic search is not fully implemented")
        return []

    async def store_semantic_context(
        self, user_id: str, conversation_id: str, semantic_context: Dict[str, Any]
    ) -> None:
        """
        Store semantic context for a conversation.

        Args:
            user_id: ID of the user
            conversation_id: ID of the conversation
            semantic_context: Semantic analysis results to store
        """
        try:
            if not self.redis_client:
                raise ValueError("Redis client not initialized")

            key = f"semantic_context:{user_id}:{conversation_id}"
            value = json.dumps(semantic_context)

            # Store with 24-hour expiry
            await self.redis_client.set(
                key=key, value=value, expire=timedelta(hours=24)
            )

        except Exception as e:
            logger.error(f"Error storing semantic context: {e}")
            raise

    async def get_semantic_context(
        self, user_id: str, conversation_id: str
    ) -> Optional[Dict[str, Any]]:
        """
        Get semantic context for a conversation.

        Args:
            user_id: ID of the user
            conversation_id: ID of the conversation

        Returns:
            Dict containing semantic context if found
        """
        try:
            if not self.redis_client:
                raise ValueError("Redis client not initialized")

            key = f"semantic_context:{user_id}:{conversation_id}"
            value = await self.redis_client.get(key)

            if value:
                return json.loads(value)

            return None

        except Exception as e:
            logger.error(f"Error getting semantic context: {e}")
            return None

    async def clear_semantic_context(self, user_id: str, conversation_id: str) -> bool:
        """
        Clear semantic context for a conversation.

        Args:
            user_id: ID of the user
            conversation_id: ID of the conversation

        Returns:
            True if context was cleared, False otherwise
        """
        try:
            if not self.redis_client:
                raise ValueError("Redis client not initialized")

            key = f"semantic_context:{user_id}:{conversation_id}"
            result = await self.redis_client.delete(key)

            return bool(result)

        except Exception as e:
            logger.error(f"Error clearing semantic context: {e}")
            return False


# Create a global instance
memory_manager = MemoryManager()
