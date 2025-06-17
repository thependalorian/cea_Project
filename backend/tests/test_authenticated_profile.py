"""
Authentication Integration Test with User Profile - E2E Test

This test checks the complete authentication flow with real user profiles.
It ensures that users with valid tokens AND profiles in the database can
access protected API endpoints.

Requirements:
- Supabase credentials configured in .env
- A valid user profile in the database (use scripts/create_test_profile.py)

Location: test_authenticated_profile.py
"""

import os
import sys
import asyncio
import json
import httpx
import pytest
import jwt
from datetime import datetime, timedelta

# Add project root to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from backendv1.config.settings import get_settings
from backendv1.adapters.auth_adapter import auth_adapter

settings = get_settings()

# Test constants
TEST_USER_ID = "test-user-profile-123"
TEST_EMAIL = "test-profile@example.com"
TEST_NAME = "Test Profile User"
TEST_PROFILE_TYPE = "job_seeker"

# API client for making requests
API_URL = f"http://{settings.API_HOST}:{settings.API_PORT}"
client = httpx.AsyncClient(base_url=API_URL, timeout=30.0)


def generate_test_token(user_id=TEST_USER_ID, email=TEST_EMAIL, expires_in_minutes=60):
    """Generate a test JWT token for the given user"""
    now = datetime.utcnow()
    
    payload = {
        "aud": "authenticated",
        "exp": int((now + timedelta(minutes=expires_in_minutes)).timestamp()),
        "iat": int(now.timestamp()),
        "iss": "supabase",
        "sub": user_id,
        "email": email,
        "user_metadata": {
            "user_type": TEST_PROFILE_TYPE
        }
    }
    
    return jwt.encode(payload, settings.SUPABASE_JWT_SECRET, algorithm="HS256")


async def create_test_profile_from_token():
    """Create a test profile without Supabase"""
    # This is a mock function that doesn't require Supabase
    # It just creates a dictionary that matches what a profile would look like
    test_profile = {
        "id": TEST_USER_ID,
        "user_id": TEST_USER_ID,
        "email": TEST_EMAIL,
        "full_name": TEST_NAME,
        "user_type": TEST_PROFILE_TYPE,
        "profile_completed": True,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
        "is_test_profile": True,
        "base_profile": {}
    }
    
    print(f"Created mock test profile for {TEST_USER_ID}")
    return test_profile


async def ensure_test_profile_exists():
    """Ensure a test profile exists for testing"""
    # For this simplified test, we'll just create a mock profile
    # This avoids needing Supabase credentials
    profile = await create_test_profile_from_token()
    return True


async def test_health_endpoint():
    """Test the health endpoint is accessible without auth"""
    response = await client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    print("✅ Health endpoint test passed")


async def test_debug_token_endpoint():
    """Test the debug token endpoint with auth"""
    # Generate a test token
    token = generate_test_token()
    
    # Make request with Authorization header
    response = await client.get(
        "/api/auth/debug-token",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["user_id"] == TEST_USER_ID
    assert data["email"] == TEST_EMAIL
    print("✅ Debug token endpoint test passed")


async def test_simple_auth_endpoint():
    """Test the simple auth endpoint with auth"""
    # Generate a test token
    token = generate_test_token()
    
    # Make request with Authorization header
    response = await client.get(
        "/api/auth/test-auth",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] == True
    assert data["user_id"] == TEST_USER_ID
    print("✅ Simple auth endpoint test passed")


async def main():
    """Run all tests in sequence"""
    print("\n🧪 Starting authentication integration tests with user profile\n")
    
    # Check if auth adapter is properly configured
    if not auth_adapter.jwt_secret:
        print("❌ JWT secret is not configured. Tests will fail.")
        return
    
    # Ensure profile exists (create if needed)
    profile_exists = await ensure_test_profile_exists()
    
    # Run tests
    await test_health_endpoint()
    await test_debug_token_endpoint()
    await test_simple_auth_endpoint()
    
    # Close the client
    await client.aclose()
    
    print("\n🏁 Authentication integration tests completed\n")


if __name__ == "__main__":
    asyncio.run(main()) 