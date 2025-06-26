import pytest
import json
from typing import Dict, List, AsyncGenerator
import asyncio

pytestmark = pytest.mark.asyncio


async def test_conversation_streaming(
    test_client, mock_user, mock_auth_headers, mock_conversation, test_db, redis_test
):
    """Test streaming conversation with interim analysis"""
    # Create test message
    message = {
        "content": "I'm a veteran looking for climate jobs. Can you help with my resume?"
    }

    # Send streaming request
    response = test_client.post(
        f"/api/v1/conversations/{mock_conversation['id']}/stream-with-analysis",
        json=message,
        headers=mock_auth_headers,
        stream=True,
    )

    assert response.status_code == 200
    assert response.headers["content-type"] == "text/event-stream"

    # Process streaming response
    received_messages = []
    required_types = {
        "analysis_start",
        "population_analysis",
        "agent_selection",
        "context_found",
        "final_response",
    }

    for line in response.iter_lines():
        if line:
            # Parse SSE data
            if line.startswith(b"data: "):
                data = json.loads(line[6:].decode())
                received_messages.append(data)

                # Verify message structure
                assert "type" in data
                if data["type"] != "error":
                    assert "message" in data

    # Verify all required message types were received
    received_types = {msg["type"] for msg in received_messages}
    assert required_types.issubset(received_types)

    # Verify message sequence
    type_sequence = [msg["type"] for msg in received_messages]
    assert type_sequence.index("analysis_start") < type_sequence.index("final_response")

    # Verify final response
    final_message = next(
        msg for msg in received_messages if msg["type"] == "final_response"
    )
    assert "confidence" in final_message
    assert "suggested_actions" in final_message


async def test_conversation_streaming_with_steering(
    test_client, mock_user, mock_auth_headers, mock_conversation, test_db, redis_test
):
    """Test streaming with human steering point"""
    # Create test message that should trigger steering
    message = {
        "content": "I need complex guidance on transitioning from military to climate tech"
    }

    # Send streaming request
    response = test_client.post(
        f"/api/v1/conversations/{mock_conversation['id']}/stream-with-analysis",
        json=message,
        headers=mock_auth_headers,
        stream=True,
    )

    assert response.status_code == 200

    # Process streaming until steering point
    steering_data = None
    for line in response.iter_lines():
        if line:
            data = json.loads(line[6:].decode())
            if data["type"] == "steering_point_created":
                steering_data = data["steering_data"]
                break

    assert steering_data is not None
    assert "interim_results" in steering_data
    assert "steering_options" in steering_data

    # Send steering input
    steering_input = {
        "type": "option_selected",
        "option": steering_data["steering_options"][0],
    }

    steering_response = test_client.post(
        f"/api/v1/conversations/{mock_conversation['id']}/steering",
        json=steering_input,
        headers=mock_auth_headers,
    )

    assert steering_response.status_code == 200
    steering_result = steering_response.json()
    assert "status" in steering_result
    assert steering_result["status"] == "steering_processed"


async def test_conversation_streaming_error_handling(
    test_client, mock_user, mock_auth_headers, mock_conversation, test_db, monkeypatch
):
    """Test error handling in streaming conversation"""

    # Mock agent to raise error
    async def mock_agent_error(*args, **kwargs):
        raise Exception("Agent processing error")

    monkeypatch.setattr(
        "backend.agents.coordinator.AgentCoordinator.process_message", mock_agent_error
    )

    # Send message
    message = {"content": "Test message"}
    response = test_client.post(
        f"/api/v1/conversations/{mock_conversation['id']}/stream-with-analysis",
        json=message,
        headers=mock_auth_headers,
        stream=True,
    )

    # Verify error response
    for line in response.iter_lines():
        if line:
            data = json.loads(line[6:].decode())
            if data["type"] == "error":
                assert "message" in data
                assert "Agent processing error" in data["message"]
                break


async def test_conversation_streaming_no_auth(test_client, mock_conversation):
    """Test streaming without authentication"""
    message = {"content": "Test message"}
    response = test_client.post(
        f"/api/v1/conversations/{mock_conversation['id']}/stream-with-analysis",
        json=message,
    )

    assert response.status_code == 401


async def test_conversation_streaming_invalid_conversation(
    test_client, mock_auth_headers
):
    """Test streaming with invalid conversation ID"""
    message = {"content": "Test message"}
    response = test_client.post(
        "/api/v1/conversations/invalid-id/stream-with-analysis",
        json=message,
        headers=mock_auth_headers,
    )

    assert response.status_code == 404
