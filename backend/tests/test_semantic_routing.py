"""
Tests for the semantic routing functionality.
"""

import pytest
import asyncio
from unittest.mock import AsyncMock, MagicMock, patch
import numpy as np

from backend.agents.base.semantic_analyzer import SemanticAnalyzer
from backend.utils.memory_manager import MemoryManager
from backend.agents.utils.semantic_router import SemanticRouter


@pytest.fixture
def semantic_analyzer():
    """Create a semantic analyzer."""
    analyzer = SemanticAnalyzer()
    # Mock the embedding function
    analyzer._get_embedding = AsyncMock()
    analyzer._get_embedding.return_value = np.array([0.1, 0.2, 0.3])
    return analyzer


@pytest.fixture
def memory_manager():
    """Create a memory manager."""
    manager = MemoryManager()
    return manager


@pytest.fixture
def semantic_router():
    """Create a semantic router."""
    router = SemanticRouter()
    return router


class TestSemanticAnalyzer:
    """Tests for the semantic analyzer."""

    @pytest.mark.asyncio
    async def test_analyze_text(self, semantic_analyzer):
        """Test analyzing text."""
        # Mock the LLM call
        semantic_analyzer._call_llm = AsyncMock()
        semantic_analyzer._call_llm.return_value = {
            "intent": "career_advice",
            "topics": ["solar_energy", "job_search"],
            "entities": [{"type": "industry", "value": "renewable_energy"}],
            "sentiment": "positive",
            "urgency": "medium",
        }

        # Analyze some text
        result = await semantic_analyzer.analyze_text(
            "I want to find a job in solar energy"
        )

        # Verify the result
        assert result["intent"] == "career_advice"
        assert "solar_energy" in result["topics"]
        assert result["sentiment"] == "positive"
        assert semantic_analyzer._call_llm.called

    @pytest.mark.asyncio
    async def test_get_embedding(self, semantic_analyzer):
        """Test getting embeddings."""
        # Reset the mock to use the real method
        semantic_analyzer._get_embedding = AsyncMock()
        semantic_analyzer._get_embedding.return_value = np.array([0.1, 0.2, 0.3])

        # Get an embedding
        embedding = await semantic_analyzer.get_embedding("Test text")

        # Verify the result
        assert isinstance(embedding, np.ndarray)
        assert len(embedding) == 3
        assert semantic_analyzer._get_embedding.called

    @pytest.mark.asyncio
    async def test_semantic_similarity(self, semantic_analyzer):
        """Test calculating semantic similarity."""
        # Create some test embeddings
        embedding1 = np.array([0.1, 0.2, 0.3])
        embedding2 = np.array([0.1, 0.2, 0.3])  # Same
        embedding3 = np.array([-0.1, -0.2, -0.3])  # Opposite

        # Calculate similarity
        similarity1 = semantic_analyzer.calculate_similarity(embedding1, embedding2)
        similarity2 = semantic_analyzer.calculate_similarity(embedding1, embedding3)

        # Verify the result
        assert similarity1 > 0.9  # Should be very similar
        assert similarity2 < 0.1  # Should be very dissimilar


class TestSemanticRouter:
    """Tests for the semantic router."""

    @pytest.mark.asyncio
    async def test_initialize(self, semantic_router):
        """Test router initialization."""
        # Mock the load_agent_embeddings method
        semantic_router._load_agent_embeddings = AsyncMock()
        semantic_router._load_agent_embeddings.return_value = {
            "pendo": np.array([0.1, 0.2, 0.3]),
            "marcus": np.array([0.4, 0.5, 0.6]),
            "lauren": np.array([0.7, 0.8, 0.9]),
        }

        # Initialize the router
        await semantic_router.initialize()

        # Verify initialization
        assert "pendo" in semantic_router.agent_embeddings
        assert "marcus" in semantic_router.agent_embeddings
        assert "lauren" in semantic_router.agent_embeddings
        assert semantic_router._load_agent_embeddings.called

    @pytest.mark.asyncio
    async def test_route_message(self, semantic_router, semantic_analyzer):
        """Test message routing."""
        # Set up the router
        semantic_router.semantic_analyzer = semantic_analyzer
        semantic_router.agent_embeddings = {
            "pendo": np.array([0.1, 0.2, 0.3]),  # General assistant
            "marcus": np.array([0.8, 0.1, 0.1]),  # Veterans specialist
            "lauren": np.array([0.1, 0.8, 0.1]),  # International specialist
        }

        # Mock the get_embedding method for different types of messages
        async def mock_get_embedding(text):
            if "veteran" in text.lower():
                return np.array([0.8, 0.1, 0.1])  # Similar to Marcus
            elif "international" in text.lower():
                return np.array([0.1, 0.8, 0.1])  # Similar to Lauren
            else:
                return np.array([0.1, 0.2, 0.3])  # Similar to Pendo

        semantic_analyzer.get_embedding = AsyncMock(side_effect=mock_get_embedding)

        # Route different messages
        agent1 = await semantic_router.route_message("I'm a veteran looking for jobs")
        agent2 = await semantic_router.route_message(
            "I'm an international student interested in climate careers"
        )
        agent3 = await semantic_router.route_message("Can you help me find a job?")

        # Verify routing
        assert agent1 == "marcus"  # Veterans specialist
        assert agent2 == "lauren"  # International specialist
        assert agent3 == "pendo"  # General assistant

    @pytest.mark.asyncio
    async def test_route_with_history(self, semantic_router, semantic_analyzer):
        """Test routing with conversation history."""
        # Set up the router
        semantic_router.semantic_analyzer = semantic_analyzer
        semantic_router.agent_embeddings = {
            "pendo": np.array([0.1, 0.2, 0.3]),  # General assistant
            "marcus": np.array([0.8, 0.1, 0.1]),  # Veterans specialist
        }

        # Mock the analyze_conversation method
        semantic_router._analyze_conversation = AsyncMock()
        semantic_router._analyze_conversation.return_value = {
            "topics": ["veterans", "job_search"],
            "current_topic_embedding": np.array([0.8, 0.1, 0.1]),
        }

        # Route a message with conversation history
        messages = [
            {"role": "user", "content": "I served in the military for 5 years"},
            {"role": "assistant", "content": "Thank you for your service"},
            {"role": "user", "content": "Can you help me find a job?"},
        ]

        agent = await semantic_router.route_message(
            "Can you help me find a job?", messages
        )

        # Verify routing based on conversation history
        assert agent == "marcus"  # Veterans specialist
        assert semantic_router._analyze_conversation.called


class TestMemoryIntegration:
    """Tests for memory integration with semantic routing."""

    @pytest.mark.asyncio
    async def test_memory_persistence(self, memory_manager, semantic_analyzer):
        """Test memory persistence for semantic context."""
        # Mock memory store
        memory_manager.store = MagicMock()
        memory_manager.store.set = AsyncMock()
        memory_manager.store.get = AsyncMock()
        memory_manager.store.get.return_value = {
            "topics": ["veterans", "job_search"],
            "intent": "career_guidance",
            "entities": [{"type": "military_branch", "value": "army"}],
        }

        # Store semantic context
        await memory_manager.store_semantic_context(
            user_id="test_user",
            conversation_id="test_conversation",
            semantic_context={
                "topics": ["veterans", "job_search"],
                "intent": "career_guidance",
                "entities": [{"type": "military_branch", "value": "army"}],
            },
        )

        # Retrieve semantic context
        context = await memory_manager.get_semantic_context(
            user_id="test_user", conversation_id="test_conversation"
        )

        # Verify memory operations
        assert memory_manager.store.set.called
        assert memory_manager.store.get.called
        assert context["intent"] == "career_guidance"
        assert "veterans" in context["topics"]

    @pytest.mark.asyncio
    async def test_routing_with_memory(
        self, semantic_router, semantic_analyzer, memory_manager
    ):
        """Test routing with memory integration."""
        # Set up the components
        semantic_router.semantic_analyzer = semantic_analyzer
        semantic_router.memory_manager = memory_manager
        semantic_router.agent_embeddings = {
            "pendo": np.array([0.1, 0.2, 0.3]),  # General assistant
            "marcus": np.array([0.8, 0.1, 0.1]),  # Veterans specialist
        }

        # Mock memory functions
        memory_manager.get_semantic_context = AsyncMock()
        memory_manager.get_semantic_context.return_value = {
            "topics": ["veterans", "job_search"],
            "intent": "career_guidance",
            "topic_embedding": [0.8, 0.1, 0.1],  # Similar to Marcus
        }

        memory_manager.store_semantic_context = AsyncMock()

        # Mock embedding function for current message
        semantic_analyzer.get_embedding = AsyncMock()
        semantic_analyzer.get_embedding.return_value = np.array(
            [0.1, 0.2, 0.3]
        )  # Similar to Pendo

        # Route a message
        agent = await semantic_router.route_message_with_memory(
            message="Can you help me find a job?",
            user_id="test_user",
            conversation_id="test_conversation",
        )

        # Verify that the router used memory context
        assert memory_manager.get_semantic_context.called
        assert memory_manager.store_semantic_context.called
        assert agent == "marcus"  # Should route to veterans specialist based on memory


if __name__ == "__main__":
    pytest.main(["-v", "test_semantic_routing.py"])
