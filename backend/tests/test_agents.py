"""
Tests for the Climate Economy Assistant agents.
"""

import pytest
import asyncio
from unittest.mock import AsyncMock, MagicMock, patch
import json
import os
from datetime import datetime
from typing import Dict, Any
import importlib

from backend.agents.base.agent_base import BaseAgent, AgentState
from backend.agents.agent_coordinator import AgentCoordinator
from backend.agents.implementations.pendo import PendoAgent
from backend.agents.implementations.marcus import MarcusAgent
from backend.agents.implementations.lauren import LaurenAgent
from backend.agents.implementations.alex import AlexAgent
from backend.agents.implementations.andre import AndreAgent
from backend.agents.implementations.carmen import CarmenAgent
from backend.agents.implementations.david import DavidAgent
from backend.agents.implementations.elena import ElenaAgent
from backend.agents.implementations.james import JamesAgent
from backend.agents.implementations.jasmine import JasmineAgent
from backend.agents.implementations.liv import LivAgent
from backend.agents.implementations.maria import MariaAgent
from backend.agents.implementations.mei import MeiAgent
from backend.agents.implementations.mai import MaiAgent
from backend.agents.implementations.michael import MichaelAgent
from backend.agents.implementations.raj import RajAgent
from backend.agents.implementations.sarah import SarahAgent
from backend.agents.implementations.miguel import MiguelAgent
from backend.agents.implementations.sofia import SofiaAgent
from backend.agents.implementations.thomas import ThomasAgent

# Define George Nekwaya's production credentials for testing
PRODUCTION_USER_ID = (
    "9693fb96-3f94-40f1-85e1-d14338d9829a"  # George Nekwaya's verified user ID
)
PRODUCTION_USER_EMAIL = (
    "george.n.p.nekwaya@gmail.com"  # George Nekwaya's verified email
)


# Function to initialize a conversation in the database
async def create_user_profile(user_id: str, email: str = PRODUCTION_USER_EMAIL) -> bool:
    """
    Create a profile for the user if it doesn't exist.
    This is needed before creating conversations to avoid foreign key constraint violations.

    Args:
        user_id: The user ID to create a profile for
        email: The user's email address

    Returns:
        bool: True if successful, False otherwise
    """
    try:
        # First, check if the profile already exists in job_seeker_profiles
        profile_check = await supabase_adapter.query_database(
            "job_seeker_profiles", filters={"id": user_id}
        )

        if profile_check.get("success") and profile_check.get("data"):
            print(f"✅ Profile already exists for user {user_id}")
            return True

        # Profile doesn't exist, create it
        print(f"Creating profile for user {user_id}")

        result = await supabase_adapter.insert_database_record(
            "job_seeker_profiles",
            {
                "id": user_id,
                "email": email,
                "full_name": "George Nekwaya",
                "experience_level": "mid",  # Using 'mid' as it's the correct value in the database
                "climate_focus": "renewable energy",
                "profile_completed": True,
                "verified": True,
            },
        )

        if result.get("success"):
            print(f"✅ Successfully created profile for user {user_id}")
            return True
        else:
            print(f"❌ Failed to create profile: {result.get('error')}")
            return False

    except ImportError:
        print("❌ Supabase adapter not available")
        return False
    except Exception as e:
        print(f"❌ Error creating profile: {e}")
        return False


async def initialize_conversation(conversation_id: str, user_id: str) -> bool:
    """
    Initialize a conversation in the database before running tests.
    This prevents foreign key constraint violations when adding messages.

    Args:
        conversation_id: The ID of the conversation to create
        user_id: The user ID associated with the conversation

    Returns:
        bool: True if successful, False otherwise
    """
    try:
        # First, ensure the user profile exists
        profile_success = await create_user_profile(user_id)
        if not profile_success:
            print("❌ Cannot initialize conversation without a valid user profile")
            return False

        # Then check if the conversation already exists
        conversation_check = await supabase_adapter.query_database(
            "conversations", filters={"id": conversation_id}
        )

        if not conversation_check.get("success") or not conversation_check.get("data"):
            # Create conversation record with valid conversation_type
            current_time = datetime.now().isoformat()

            # Insert the conversation with a valid conversation_type from the enum
            result = await supabase_adapter.insert_database_record(
                "conversations",
                {
                    "id": conversation_id,
                    "user_id": user_id,
                    "created_at": current_time,
                    "updated_at": current_time,
                    "last_activity": current_time,
                    "conversation_type": "general",
                    "status": "active",
                    "message_count": 0,
                    "total_tokens_used": 0,
                },
            )

            if result.get("success"):
                print(f"✅ Successfully initialized conversation: {conversation_id}")
                return True
            else:
                print(f"❌ Failed to initialize conversation: {result.get('error')}")
                return False
        else:
            print(f"✅ Conversation already exists: {conversation_id}")
            return True
    except Exception as e:
        print(f"❌ Error initializing conversation: {str(e)}")
        return False


async def test_agent_functionality(agent_name: str, message: str):
    conversation_id = f"test_{datetime.now().strftime('%Y%m%d%H%M%S')}"
    await initialize_conversation(conversation_id, PRODUCTION_USER_ID)

    # Dynamically import the agent's process_message function
    try:
        agent_module = importlib.import_module(
            f"backend.agents.implementations.{agent_name}"
        )
        process_message = agent_module.process_message
    except ImportError:
        print(f"❌ Could not import process_message for {agent_name}")
        return

    # Create a MessageRequest object
    class MessageRequest:
        def __init__(self, message, user_id=None, conversation_id=None):
            self.message = message
            self.user_id = user_id
            self.conversation_id = conversation_id

    request = MessageRequest(
        message=message, user_id=PRODUCTION_USER_ID, conversation_id=conversation_id
    )

    # Call the agent's process_message function
    response = await process_message(request)

    # Validate the response
    if hasattr(response, "response"):
        print(f"✅ {agent_name} response: {response.response}")
    else:
        print(f"❌ {agent_name} did not return a valid response.")


async def run_test_scenarios():
    scenarios = [
        {
            "name": "Veterans Career Transition",
            "message": "I'm a veteran looking to transition into a climate career.",
        },
        {
            "name": "EJ Community Support",
            "message": "Our community is facing environmental justice issues from a nearby industrial facility.",
        },
        {
            "name": "International Climate Policy",
            "message": "How can developing countries access climate finance under the Paris Agreement?",
        },
        {
            "name": "General Climate Support",
            "message": "What are the most effective ways for an individual to reduce their carbon footprint?",
        },
    ]
    for scenario in scenarios:
        print(f"\n\n{'='*50}")
        print(f"TESTING SCENARIO: {scenario['name']}")
        print(f"{'='*50}")
        await test_agent_functionality("agent_name_placeholder", scenario["message"])


@pytest.fixture
def agent_state():
    """Create a test agent state."""
    return AgentState(
        messages=[],
        user_id="test_user",
        conversation_id="test_conversation",
        memory={},
        metadata={},
        current_agent=None,
    )


@pytest.fixture
def base_agent():
    """Create a test base agent."""
    agent = BaseAgent(
        name="TestAgent",
        description="Test agent for unit tests",
        intelligence_level=5.0,
        tools=["test_tool"],
    )
    return agent


@pytest.fixture
def pendo_agent():
    """Create a test Pendo agent."""
    agent = PendoAgent()
    return agent


@pytest.fixture
def marcus_agent():
    """Create a test Marcus agent."""
    agent = MarcusAgent()
    return agent


@pytest.fixture
def agent_coordinator():
    """Create a test agent coordinator."""
    coordinator = AgentCoordinator()
    return coordinator


class TestBaseAgent:
    """Tests for the base agent class."""

    @pytest.mark.asyncio
    async def test_initialization(self, base_agent):
        """Test agent initialization."""
        assert base_agent.name == "TestAgent"
        assert base_agent.description == "Test agent for unit tests"
        assert base_agent.intelligence_level == 5.0
        assert "test_tool" in base_agent.tools

    @pytest.mark.asyncio
    async def test_process_method(self, base_agent, agent_state):
        """Test the process method."""
        # Mock the handle_message method
        base_agent.handle_message = AsyncMock()
        base_agent.handle_message.return_value = "Test response"

        # Process a message
        agent_state.messages.append(MagicMock(content="Test message"))
        result = await base_agent.process(agent_state)

        # Assert the agent processed the message and updated state
        assert base_agent.handle_message.called
        assert result.current_agent == "TestAgent"

    @pytest.mark.asyncio
    async def test_handle_error(self, base_agent, agent_state):
        """Test error handling."""
        error = Exception("Test error")
        result = await base_agent.handle_error(error, agent_state)

        # Check if error was handled
        assert "error" in result.metadata
        assert result.metadata["error"] == str(error)


class TestPendoAgent:
    """Tests for the Pendo agent."""

    @pytest.mark.asyncio
    async def test_initialization(self, pendo_agent):
        """Test Pendo agent initialization."""
        assert pendo_agent.name == "Pendo"
        assert "general_assistance" in pendo_agent.tools

    @pytest.mark.asyncio
    @patch("backend.agents.implementations.pendo.AgentConfig")
    async def test_process_method(self, mock_config, pendo_agent, agent_state):
        """Test the process method for Pendo agent."""
        # Set up the test
        agent_state.messages.append(
            MagicMock(content="Hello, I need help with climate careers")
        )

        # Process a message
        with patch.object(
            pendo_agent, "_generate_response", return_value="Test response"
        ):
            result = await pendo_agent.process(agent_state)

            # Assert the agent processed the message
            assert len(result.messages) > 1
            assert result.current_agent == "Pendo"


class TestMarcusAgent:
    """Tests for the Marcus agent."""

    @pytest.mark.asyncio
    async def test_initialization(self, marcus_agent):
        """Test Marcus agent initialization."""
        assert marcus_agent.name == "Marcus"
        assert "veterans_support" in marcus_agent.tools

    @pytest.mark.asyncio
    @patch("backend.agents.implementations.marcus.VeteransResourceTool")
    @patch("backend.agents.implementations.marcus.AgentConfig")
    async def test_process_method(
        self, mock_config, mock_tool, marcus_agent, agent_state
    ):
        """Test the process method for Marcus agent."""
        # Set up the test
        agent_state.messages.append(
            MagicMock(content="I'm a veteran looking for climate careers")
        )

        # Mock the _analyze_veteran_needs method
        marcus_agent._analyze_veteran_needs = AsyncMock()
        marcus_agent._analyze_veteran_needs.return_value = {
            "needs": ["job_search"],
            "service_branch": "army",
            "years_of_service": "5",
        }

        # Mock the veterans_resources.get_resources method
        marcus_agent.veterans_resources.get_resources = AsyncMock()
        marcus_agent.veterans_resources.get_resources.return_value = [
            {"name": "Test Resource", "description": "A test resource"}
        ]

        # Process a message
        with patch.object(
            marcus_agent, "_generate_veteran_response", return_value="Test response"
        ):
            result = await marcus_agent.process(agent_state)

            # Assert the agent processed the message
            assert len(result.messages) > 1
            assert result.current_agent == "Marcus"
            assert "veteran_analysis" in result.metadata
            assert "veteran_context" in result.memory


class TestAgentCoordinator:
    """Tests for the agent coordinator."""

    @pytest.mark.asyncio
    async def test_initialization(self, agent_coordinator):
        """Test coordinator initialization."""
        await agent_coordinator.initialize()
        assert len(agent_coordinator.agents) > 0

    @pytest.mark.asyncio
    async def test_route_message(self, agent_coordinator, agent_state):
        """Test message routing."""
        # Mock the semantic router
        agent_coordinator.semantic_router = MagicMock()
        agent_coordinator.semantic_router.route_message = AsyncMock()
        agent_coordinator.semantic_router.route_message.return_value = "pendo"

        # Add a message
        agent_state.messages.append(MagicMock(content="Test message"))

        # Route the message
        agent_id = await agent_coordinator.route_message(agent_state)

        # Assert the message was routed
        assert agent_id == "pendo"
        assert agent_coordinator.semantic_router.route_message.called

    @pytest.mark.asyncio
    async def test_process_message(self, agent_coordinator, agent_state):
        """Test processing a message."""
        # Set up the agents dictionary with mocks
        test_agent = AsyncMock()
        test_agent.process = AsyncMock()
        test_agent.process.return_value = agent_state

        agent_coordinator.agents = {"test_agent": test_agent}

        # Process a message
        with patch.object(
            agent_coordinator, "route_message", return_value="test_agent"
        ):
            result = await agent_coordinator.process(agent_state)

            # Assert the agent processed the message
            assert test_agent.process.called
            assert result == agent_state


def test_alex_agent():
    agent = AlexAgent()
    # Add test logic for AlexAgent


def test_andre_agent():
    agent = AndreAgent()
    # Add test logic for AndreAgent


def test_carmen_agent():
    agent = CarmenAgent()
    # Add test logic for CarmenAgent


def test_david_agent():
    agent = DavidAgent()
    # Add test logic for DavidAgent


def test_elena_agent():
    agent = ElenaAgent()
    # Add test logic for ElenaAgent


def test_james_agent():
    agent = JamesAgent()
    # Add test logic for JamesAgent


def test_jasmine_agent():
    agent = JasmineAgent()
    # Add test logic for JasmineAgent


def test_lauren_agent():
    agent = LaurenAgent()
    # Add test logic for LaurenAgent


def test_liv_agent():
    agent = LivAgent()
    # Add test logic for LivAgent


def test_maria_agent():
    agent = MariaAgent()
    # Add test logic for MariaAgent


def test_mei_agent():
    agent = MeiAgent()
    # Add test logic for MeiAgent


def test_mai_agent():
    agent = MaiAgent()
    # Add test logic for MaiAgent


def test_michael_agent():
    agent = MichaelAgent()
    # Add test logic for MichaelAgent


def test_marcus_agent():
    agent = MarcusAgent()
    # Add test logic for MarcusAgent


def test_pendo_agent():
    agent = PendoAgent()
    # Add test logic for PendoAgent


def test_raj_agent():
    agent = RajAgent()
    # Add test logic for RajAgent


def test_sarah_agent():
    agent = SarahAgent()
    # Add test logic for SarahAgent


def test_miguel_agent():
    agent = MiguelAgent()
    # Add test logic for MiguelAgent


def test_sofia_agent():
    agent = SofiaAgent()
    # Add test logic for SofiaAgent


def test_thomas_agent():
    agent = ThomasAgent()
    # Add test logic for ThomasAgent


if __name__ == "__main__":
    asyncio.run(run_test_scenarios())
