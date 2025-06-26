"""
Tests for the Climate Economy Assistant tools.
"""

import pytest
import asyncio
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime
from pydantic import BaseModel

from ..tools.base_tool import BaseTool, ToolResponse
from ..tools.job_matching.match_jobs import JobMatcher
from ..tools.resume.analyze_resume_for_climate_careers import ResumeAnalyzer
from ..tools.search.semantic_search import SemanticSearchTool
from ..tools.training.find_programs import TrainingProgramTool
from ..tools.analytics.track_interactions import AnalyticsTracker


class TestToolRequest(BaseModel):
    """Test request model."""

    test_param: str
    optional_param: str = None


class TestTool(BaseTool):
    """Test tool implementation."""

    name = "test_tool"
    description = "A test tool"

    async def execute(self, request: TestToolRequest) -> ToolResponse:
        """Execute the test tool."""
        return ToolResponse(
            success=True,
            message="Test executed successfully",
            data={"param": request.test_param},
        )


@pytest.mark.asyncio
async def test_base_tool():
    """Test BaseTool functionality."""
    tool = TestTool()
    request = TestToolRequest(test_param="test")
    response = await tool.execute(request)

    assert response.success
    assert response.message == "Test executed successfully"
    assert response.data["param"] == "test"


class TestJobMatcher:
    """Tests for the job matching tool."""

    @pytest.fixture
    def job_tool(self):
        """Create a job matching tool."""
        return JobMatcher()

    @pytest.mark.asyncio
    @patch("backend.tools.job_matching.match_jobs.get_logger")
    async def test_find_jobs(self, mock_logger, job_tool):
        """Test finding jobs."""
        # Mock the database and search functionality
        job_tool.database = MagicMock()
        job_tool.semantic_search = AsyncMock()
        job_tool.semantic_search.search.return_value = [
            {
                "id": "job1",
                "title": "Solar Installer",
                "company": "Green Energy Co",
                "description": "A job installing solar panels",
                "score": 0.95,
                "metadata": {
                    "location": "New York",
                    "salary_min": 50000,
                    "job_type": "full_time",
                },
            }
        ]

        # Test finding jobs
        result = await job_tool.find_matches(
            skills=["solar installation"],
            credentials=["certification"],
            location="New York",
        )

        # Verify the result
        assert result.success is True
        assert len(result.results["matches"]) > 0
        assert job_tool.semantic_search.search.called


class TestResumeAnalyzer:
    """Tests for the resume analysis tool."""

    @pytest.fixture
    def resume_tool(self):
        """Create a resume analysis tool."""
        return ResumeAnalyzer()

    @pytest.mark.asyncio
    @patch("backend.tools.resume.analyze_resume_for_climate_careers.OpenAIEmbeddings")
    async def test_analyze_resume(self, mock_embeddings, resume_tool):
        """Test analyzing a resume."""
        # Mock the embeddings
        mock_embeddings.return_value.aembed_query = AsyncMock()
        mock_embeddings.return_value.aembed_query.return_value = [0.1, 0.2, 0.3]

        # Test resume analysis
        result = await resume_tool.execute(
            resume_text="Test resume content with solar installation and project management experience"
        )

        # Verify the result
        assert result.success is True
        assert "climate_relevance_score" in result.results
        assert "skills_analysis" in result.results
        assert "experience_analysis" in result.results
        assert mock_embeddings.return_value.aembed_query.called


class TestSemanticSearchTool:
    """Tests for the semantic search tool."""

    @pytest.fixture
    def search_tool(self):
        """Create a semantic search tool."""
        return SemanticSearchTool()

    @pytest.mark.asyncio
    @patch("backend.tools.search.semantic_search.get_logger")
    async def test_search(self, mock_logger, search_tool):
        """Test semantic search."""
        # Mock the embedding service and vector store
        search_tool.embedding_service = AsyncMock()
        search_tool.embedding_service.get_embedding.return_value = [0.1, 0.2, 0.3]

        search_tool.vector_store = AsyncMock()
        search_tool.vector_store.search.return_value = [
            {
                "id": "doc1",
                "content": "Information about solar energy",
                "score": 0.95,
                "metadata": {
                    "title": "Solar Energy Basics",
                    "content_type": "resources",
                },
            }
        ]

        # Test searching
        result = await search_tool.search("solar energy", ["resources"])

        # Verify the result
        assert len(result) == 1
        assert result[0]["title"] == "Solar Energy Basics"
        assert search_tool.embedding_service.get_embedding.called
        assert search_tool.vector_store.search.called


class TestTrainingProgramTool:
    """Tests for the training program tool."""

    @pytest.fixture
    def training_tool(self):
        """Create a training program tool."""
        return TrainingProgramTool()

    @pytest.mark.asyncio
    @patch("backend.tools.training.find_programs.get_logger")
    async def test_find_programs(self, mock_logger, training_tool):
        """Test finding training programs."""
        # Mock the semantic search functionality
        training_tool.semantic_search = AsyncMock()
        training_tool.semantic_search.search.return_value = [
            {
                "id": "program1",
                "title": "Solar Installation Certification",
                "description": "Learn to install solar panels",
                "score": 0.95,
                "metadata": {
                    "provider": "Green Training Co",
                    "duration_weeks": 8,
                    "cost": 1000,
                    "format": "hybrid",
                },
            }
        ]

        # Test finding programs
        result = await training_tool.find_programs(
            query="solar installation training",
            format_types=["hybrid"],
            gi_bill_eligible=True,
        )

        # Verify the result
        assert len(result) == 1
        assert result[0]["title"] == "Solar Installation Certification"
        assert training_tool.semantic_search.search.called


class TestAnalyticsTracker:
    """Tests for the analytics tracker tool."""

    @pytest.fixture
    def analytics_tool(self):
        """Create an analytics tracker tool."""
        return AnalyticsTracker()

    @pytest.mark.asyncio
    @patch("backend.tools.analytics.track_interactions.get_logger")
    async def test_track_event(self, mock_logger, analytics_tool):
        """Test tracking events."""
        # Mock the database and redis client
        analytics_tool.database = MagicMock()
        analytics_tool.redis_client = MagicMock()

        # Test tracking an event
        result = await analytics_tool.track_event(
            event_type="message", user_id="test_user", data={"content": "Test message"}
        )

        # Verify the result
        assert result is True

    @pytest.mark.asyncio
    @patch("backend.tools.analytics.track_interactions.get_logger")
    async def test_track_conversation(self, mock_logger, analytics_tool):
        """Test tracking conversation metrics."""
        # Mock the database and redis client
        analytics_tool.database = MagicMock()
        analytics_tool.redis_client = MagicMock()

        # Test tracking conversation metrics
        result = await analytics_tool.track_conversation(
            conversation_id="test_conv",
            user_id="test_user",
            metrics={"duration": 300, "messages": 10, "satisfaction_score": 4.5},
        )

        # Verify the result
        assert result is True


if __name__ == "__main__":
    pytest.main(["-v", "test_tools.py"])
