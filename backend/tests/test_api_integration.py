"""
API integration tests for the Climate Economy Assistant.
"""

import pytest
import asyncio
from unittest.mock import AsyncMock, MagicMock, patch
import json
from fastapi.testclient import TestClient

from backend.api.main import app
from backend.api.routes.conversations import router as conversation_router
from backend.api.routes.resumes import router as resume_router
from backend.agents.agent_coordinator import AgentCoordinator


@pytest.fixture
def test_client():
    """Create a test client."""
    return TestClient(app)


@pytest.fixture
def mock_coordinator():
    """Create a mock agent coordinator."""
    coordinator = AsyncMock(spec=AgentCoordinator)
    coordinator.process.return_value = {
        "messages": [{"role": "assistant", "content": "Test response"}],
        "user_id": "test_user",
        "conversation_id": "test_conversation",
        "current_agent": "pendo",
    }
    return coordinator


@pytest.fixture
def mock_resume_analyzer():
    """Create a mock resume analyzer."""
    analyzer = AsyncMock()
    analyzer.analyze_resume.return_value = {
        "climate_fit_score": 0.8,
        "recommended_jobs": ["Solar Installer", "Wind Technician"],
        "skills_analysis": {
            "relevant_skills": ["project management"],
            "skill_gaps": ["solar installation"],
        },
    }
    return analyzer


class TestConversationEndpoints:
    """Tests for the conversation API endpoints."""

    @pytest.mark.asyncio
    @patch("backend.api.routes.conversations.AgentCoordinator")
    async def test_create_conversation(self, mock_coordinator_class, test_client):
        """Test creating a new conversation."""
        # Set up the mock
        mock_coordinator_class.return_value.create_conversation.return_value = {
            "conversation_id": "new_conversation_id",
            "user_id": "test_user",
            "created_at": "2023-01-01T00:00:00Z",
        }

        # Make the request
        response = test_client.post("/conversations", json={"user_id": "test_user"})

        # Check the response
        assert response.status_code == 200
        data = response.json()
        assert data["conversation_id"] == "new_conversation_id"
        assert data["user_id"] == "test_user"

    @pytest.mark.asyncio
    @patch("backend.api.routes.conversations.AgentCoordinator")
    async def test_get_conversations(self, mock_coordinator_class, test_client):
        """Test getting conversations for a user."""
        # Set up the mock
        mock_coordinator_class.return_value.get_conversations.return_value = [
            {
                "conversation_id": "conversation1",
                "user_id": "test_user",
                "created_at": "2023-01-01T00:00:00Z",
                "last_message": "Hello",
            },
            {
                "conversation_id": "conversation2",
                "user_id": "test_user",
                "created_at": "2023-01-02T00:00:00Z",
                "last_message": "How are you?",
            },
        ]

        # Make the request
        response = test_client.get("/conversations?user_id=test_user")

        # Check the response
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
        assert data[0]["conversation_id"] == "conversation1"
        assert data[1]["conversation_id"] == "conversation2"

    @pytest.mark.asyncio
    @patch("backend.api.routes.conversations.AgentCoordinator")
    async def test_send_message(self, mock_coordinator_class, test_client):
        """Test sending a message to a conversation."""
        # Set up the mock
        mock_coordinator_instance = mock_coordinator_class.return_value
        mock_coordinator_instance.process.return_value = {
            "messages": [
                {"role": "user", "content": "Hello"},
                {"role": "assistant", "content": "Hi! How can I help you?"},
            ],
            "user_id": "test_user",
            "conversation_id": "test_conversation",
            "current_agent": "pendo",
        }

        # Make the request
        response = test_client.post(
            "/conversations/test_conversation/messages",
            json={"user_id": "test_user", "content": "Hello"},
        )

        # Check the response
        assert response.status_code == 200
        data = response.json()
        assert len(data["messages"]) == 2
        assert data["messages"][1]["content"] == "Hi! How can I help you?"
        assert data["current_agent"] == "pendo"


class TestResumeEndpoints:
    """Tests for the resume API endpoints."""

    @pytest.mark.asyncio
    @patch("backend.api.routes.resumes.ResumeService")
    async def test_upload_resume(self, mock_resume_service, test_client):
        """Test uploading a resume."""
        # Set up the mock
        mock_service_instance = mock_resume_service.return_value
        mock_service_instance.upload_resume.return_value = {
            "resume_id": "new_resume_id",
            "user_id": "test_user",
            "file_name": "test_resume.pdf",
            "processed": True,
        }

        # Make the request
        response = test_client.post(
            "/resumes",
            json={
                "user_id": "test_user",
                "file_name": "test_resume.pdf",
                "file_content_base64": "base64encodedcontent",
                "file_format": "pdf",
            },
        )

        # Check the response
        assert response.status_code == 200
        data = response.json()
        assert data["resume_id"] == "new_resume_id"
        assert data["user_id"] == "test_user"
        assert data["file_name"] == "test_resume.pdf"
        assert data["processed"] is True

    @pytest.mark.asyncio
    @patch("backend.api.routes.resumes.ResumeAnalysisService")
    async def test_analyze_resume(self, mock_analysis_service, test_client):
        """Test analyzing a resume."""
        # Set up the mock
        mock_service_instance = mock_analysis_service.return_value
        mock_service_instance.analyze_resume.return_value = {
            "analysis_id": "new_analysis_id",
            "resume_id": "test_resume_id",
            "climate_fit_score": 0.8,
            "recommended_jobs": ["Solar Installer", "Wind Technician"],
            "skills_analysis": {
                "relevant_skills": ["project management"],
                "skill_gaps": ["solar installation"],
            },
        }

        # Make the request
        response = test_client.post(
            "/resumes/test_resume_id/analysis", json={"user_id": "test_user"}
        )

        # Check the response
        assert response.status_code == 200
        data = response.json()
        assert data["analysis_id"] == "new_analysis_id"
        assert data["resume_id"] == "test_resume_id"
        assert data["climate_fit_score"] == 0.8
        assert "Solar Installer" in data["recommended_jobs"]


class TestUserEndpoints:
    """Tests for the user API endpoints."""

    @pytest.mark.asyncio
    @patch("backend.api.routes.users.UserService")
    async def test_get_user_profile(self, mock_user_service, test_client):
        """Test getting a user profile."""
        # Set up the mock
        mock_service_instance = mock_user_service.return_value
        mock_service_instance.get_user_profile.return_value = {
            "user_id": "test_user",
            "email": "test@example.com",
            "first_name": "Test",
            "last_name": "User",
            "is_veteran": False,
            "is_international": True,
        }

        # Make the request
        response = test_client.get("/users/test_user/profile")

        # Check the response
        assert response.status_code == 200
        data = response.json()
        assert data["user_id"] == "test_user"
        assert data["email"] == "test@example.com"
        assert data["is_international"] is True

    @pytest.mark.asyncio
    @patch("backend.api.routes.users.UserService")
    async def test_update_user_profile(self, mock_user_service, test_client):
        """Test updating a user profile."""
        # Set up the mock
        mock_service_instance = mock_user_service.return_value
        mock_service_instance.update_user_profile.return_value = {
            "user_id": "test_user",
            "email": "test@example.com",
            "first_name": "Updated",
            "last_name": "User",
            "is_veteran": True,
            "is_international": True,
        }

        # Make the request
        response = test_client.put(
            "/users/test_user/profile",
            json={"first_name": "Updated", "is_veteran": True},
        )

        # Check the response
        assert response.status_code == 200
        data = response.json()
        assert data["user_id"] == "test_user"
        assert data["first_name"] == "Updated"
        assert data["is_veteran"] is True


class TestLanggraphEndpoints:
    """Tests for the LangGraph API endpoints."""

    @pytest.mark.asyncio
    @patch("backend.api.routes.langgraph.LanggraphService")
    async def test_run_graph(self, mock_langgraph_service, test_client):
        """Test running a LangGraph workflow."""
        # Set up the mock
        mock_service_instance = mock_langgraph_service.return_value
        mock_service_instance.run_graph.return_value = {
            "run_id": "run123",
            "status": "completed",
            "result": {"response": "This is a test response", "agent": "pendo"},
        }

        # Make the request
        response = test_client.post(
            "/langgraph/run",
            json={
                "user_id": "test_user",
                "graph_id": "career_guidance",
                "inputs": {"query": "Help me find a job"},
            },
        )

        # Check the response
        assert response.status_code == 200
        data = response.json()
        assert data["run_id"] == "run123"
        assert data["status"] == "completed"
        assert "This is a test response" in data["result"]["response"]


if __name__ == "__main__":
    pytest.main(["-v", "test_api_integration.py"])
