import pytest
from fastapi.testclient import TestClient
from typing import Generator, Dict, Any
import asyncio
from datetime import datetime, timedelta
from unittest.mock import AsyncMock, MagicMock, patch
import structlog
import os
import json

from backend.api.main import app
from backend.database.supabase_client import supabase
from backend.database.redis_client import redis_client
from backend.api.middleware.auth import verify_token
from backend.api.models.conversation import MessageCreate, MessageResponse

# Configure test logger
structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer(),
    ]
)

logger = structlog.get_logger(__name__)


@pytest.fixture
def test_client() -> Generator[TestClient, None, None]:
    """Create a test client for FastAPI endpoints"""
    with TestClient(app) as client:
        yield client


@pytest.fixture
def mock_user() -> Dict[str, Any]:
    """Create a mock user for testing"""
    return {
        "id": "test-user-id",
        "email": "test@example.com",
        "full_name": "Test User",
        "organization": "Test Org",
        "organization_type": "Test Type",
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
    }


@pytest.fixture
def mock_conversation(mock_user) -> Dict[str, Any]:
    """Create a mock conversation for testing"""
    return {
        "id": "test-conversation-id",
        "user_id": mock_user["id"],
        "current_agent": "test-agent",
        "metadata": {},
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
    }


@pytest.fixture
def mock_resume_data() -> Dict[str, Any]:
    """Create mock resume data for testing"""
    return {
        "id": "test-resume-id",
        "user_id": "test-user-id",
        "file_name": "test_resume.pdf",
        "content": "Test resume content with climate and sustainability experience",
        "skills_extracted": ["project management", "sustainability", "data analysis"],
        "climate_relevance_score": 0.85,
        "processing_status": "completed",
        "created_at": datetime.utcnow().isoformat(),
    }


@pytest.fixture
def mock_auth_headers(mock_user) -> Dict:
    """Create mock authorization headers"""
    return {"Authorization": f"Bearer test-token-{mock_user['id']}"}


@pytest.fixture
async def test_db():
    """Create test database tables and cleanup after tests"""
    # Create test tables
    await supabase.execute(
        """
        CREATE TABLE IF NOT EXISTS test_conversations (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL,
            title TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            status TEXT DEFAULT 'active'
        );
        
        CREATE TABLE IF NOT EXISTS test_messages (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            conversation_id UUID NOT NULL,
            content TEXT NOT NULL,
            role TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE TABLE IF NOT EXISTS test_resumes (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL,
            file_name TEXT NOT NULL,
            content TEXT,
            content_embedding vector(1536),
            skills_extracted JSONB,
            climate_relevance_score FLOAT,
            processing_status TEXT DEFAULT 'pending',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    """
    )

    yield

    # Cleanup test tables
    await supabase.execute(
        """
        DROP TABLE IF EXISTS test_conversations;
        DROP TABLE IF EXISTS test_messages;
        DROP TABLE IF EXISTS test_resumes;
    """
    )


@pytest.fixture
async def redis_test():
    """Setup and cleanup Redis test data"""
    test_key_prefix = "test:"

    yield redis_client

    # Cleanup test keys
    test_keys = await redis_client.keys(f"{test_key_prefix}*")
    if test_keys:
        await redis_client.delete(*test_keys)


@pytest.fixture
def event_loop():
    """Create event loop for async tests"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
def mock_openai():
    """Mock OpenAI API calls."""
    with patch("openai.AsyncOpenAI") as mock:
        # Mock embeddings
        mock_embeddings = AsyncMock()
        mock_embeddings.create.return_value.data = [{"embedding": [0.1] * 1536}]
        mock.return_value.embeddings = mock_embeddings

        # Mock chat completions
        mock_chat = AsyncMock()
        mock_chat.create.return_value.choices = [
            MagicMock(message=MagicMock(content="Test response", role="assistant"))
        ]
        mock.return_value.chat.completions = mock_chat

        yield mock


@pytest.fixture
def mock_supabase():
    """Mock Supabase client."""
    with patch("backend.database.supabase_client.supabase") as mock:
        mock.table = MagicMock()
        mock.table.return_value.select = MagicMock(return_value=mock.table.return_value)
        mock.table.return_value.insert = MagicMock(return_value=mock.table.return_value)
        mock.table.return_value.update = MagicMock(return_value=mock.table.return_value)
        mock.table.return_value.delete = MagicMock(return_value=mock.table.return_value)
        mock.table.return_value.eq = MagicMock(return_value=mock.table.return_value)
        mock.table.return_value.execute = AsyncMock(return_value=MagicMock(data=[]))
        yield mock


@pytest.fixture
def mock_redis():
    """Mock Redis client."""
    with patch("backend.database.redis_client.redis_client") as mock:
        mock.get = AsyncMock(return_value=None)
        mock.set = AsyncMock(return_value=True)
        mock.delete = AsyncMock(return_value=True)
        mock.ping = AsyncMock(return_value=True)
        yield mock


@pytest.fixture
def test_user():
    """Test user data."""
    return {"id": "test-user-id", "email": "test@example.com", "role": "user"}


@pytest.fixture
def test_conversation():
    """Test conversation data."""
    return {
        "id": "test-conversation-id",
        "user_id": "test-user-id",
        "status": "active",
        "current_agent": "pendo",
        "metadata": {},
        "messages": [],
    }


@pytest.fixture
def test_message():
    """Test message data."""
    return {"content": "Test message", "role": "user", "metadata": {}}


@pytest.fixture
def mock_message() -> Dict[str, Any]:
    """Create a mock message."""
    return {
        "id": "test-message-id",
        "conversation_id": "test-conversation-id",
        "content": "Test message",
        "role": "user",
        "metadata": {},
        "created_at": datetime.utcnow().isoformat(),
    }


@pytest.fixture
def mock_resume_analysis() -> Dict[str, Any]:
    """Create a mock resume analysis."""
    return {
        "id": "test-resume-id",
        "user_id": "test-user-id",
        "file_name": "test-resume.pdf",
        "content": "Test resume content",
        "content_embedding": [0.1, 0.2, 0.3],
        "climate_relevance_score": 0.8,
        "recommended_roles": ["Role 1", "Role 2"],
        "skills": ["Skill 1", "Skill 2"],
        "skill_gaps": ["Gap 1", "Gap 2"],
        "enhancement_suggestions": ["Suggestion 1", "Suggestion 2"],
        "climate_sectors_match": {"Sector 1": 0.8, "Sector 2": 0.6},
        "processing_status": "completed",
        "metadata": {},
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
    }


@pytest.fixture
def mock_auth_token(mock_user: Dict[str, Any]) -> str:
    """Create a mock auth token."""
    # In tests, we'll just pass the user ID directly
    return mock_user["id"]


@pytest.fixture
def mock_verify_token(mock_user: Dict[str, Any]) -> None:
    """Mock the verify_token dependency."""

    async def mock_verify(*args, **kwargs):
        return mock_user["id"]

    app.dependency_overrides[verify_token] = mock_verify
    yield
    app.dependency_overrides = {}
