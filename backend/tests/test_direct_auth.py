#!/usr/bin/env python
"""
Direct Authentication Test for Climate Economy Assistant Backend

Tests Supabase JWT handling in the backend by creating manual test requests
"""

import requests
import json
import sys
import os
import jwt
import time
from datetime import datetime, timedelta

# Configuration
BACKEND_URL = "http://localhost:8001"
JWT_SECRET = "0pO2frD3MDM1ifAoISkK+g6QQEQudk9LgKB4lEeHW7OqFVBpWybLkLWVL23Ij71ng533GILHeTjpfbgDGR+5Gg=="

# Test user data
TEST_USER = {
    "user_id": "test-user-123",
    "email": "test@example.com",
    "user_type": "job_seeker"
}

def log_separator(title):
    """Print a separator with title"""
    print("\n" + "=" * 70)
    print(f" {title} ".center(70, "="))
    print("=" * 70)

def log_step(step_name):
    """Print a step header"""
    print(f"\n➡️ {step_name}")
    print("-" * 70)

def create_test_token(user_id, email, expires_in_minutes=60):
    """
    Create a test JWT token that mimics Supabase tokens
    
    Args:
        user_id: User ID to include in the token
        email: Email address to include
        expires_in_minutes: Token expiration time in minutes
        
    Returns:
        str: JWT token
    """
    now = datetime.utcnow()
    exp = now + timedelta(minutes=expires_in_minutes)
    
    # Create payload matching Supabase JWT structure
    # Fix: Use a timestamp 60 seconds in the past to avoid "token not yet valid" errors
    payload = {
        "aud": "authenticated",
        "exp": int(exp.timestamp()),
        "iat": int((now - timedelta(seconds=60)).timestamp()),
        "iss": "supabase",
        "sub": user_id,
        "email": email,
        "role": "authenticated",
        "user_metadata": {
            "user_type": "job_seeker"
        }
    }
    
    # Create token
    token = jwt.encode(payload, JWT_SECRET, algorithm="HS256")
    
    return token

def test_auth_status_endpoint(token):
    """Test authentication status endpoint with token"""
    log_step("Testing Backend Auth Status Endpoint")
    
    try:
        # Try backend auth status endpoint
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        print(f"Calling backend auth status endpoint...")
        response = requests.get(
            f"{BACKEND_URL}/api/auth/status",
            headers=headers
        )
        
        # Print response details
        print(f"Status code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Authentication successful")
            print(f"Auth status: {json.dumps(data, indent=2)}")
            return True
        else:
            print(f"❌ Authentication failed")
            try:
                print(f"Error: {json.dumps(response.json(), indent=2)}")
            except:
                print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_token_debug_endpoint(token):
    """Test a token debug endpoint if it exists"""
    log_step("Testing Backend Token Debug Endpoint")
    
    try:
        # Try backend debug endpoint if it exists
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        print(f"Calling backend token debug endpoint...")
        response = requests.get(
            f"{BACKEND_URL}/api/auth/debug-token",
            headers=headers
        )
        
        # Print response details
        print(f"Status code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Token debug successful")
            print(f"Token debug: {json.dumps(data, indent=2)}")
            return True
        else:
            print(f"ℹ️ Debug endpoint not available or not accessible")
            return False
    except Exception as e:
        print(f"ℹ️ Debug endpoint not available: {e}")
        return False

def test_simple_auth_endpoint(token):
    """Test the simple authentication test endpoint"""
    log_step("Testing Simple Auth Test Endpoint")
    
    try:
        # Try backend simple auth endpoint
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        print(f"Calling backend test-auth endpoint...")
        response = requests.get(
            f"{BACKEND_URL}/api/auth/test-auth",
            headers=headers
        )
        
        # Print response details
        print(f"Status code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Simple authentication successful")
            print(f"Response: {json.dumps(data, indent=2)}")
            return True
        else:
            print(f"❌ Simple authentication failed")
            try:
                print(f"Error: {json.dumps(response.json(), indent=2)}")
            except:
                print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_v1_health_endpoint():
    """Test the v1 health endpoint"""
    log_step("Testing V1 Health Endpoint")
    
    try:
        # Try v1 health endpoint
        print(f"Calling v1 health endpoint...")
        response = requests.get(f"{BACKEND_URL}/api/v1/health")
        
        # Print response details
        print(f"Status code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ V1 health check successful")
            print(f"Response: {json.dumps(data, indent=2)}")
            return True
        else:
            print(f"❌ V1 health check failed")
            try:
                print(f"Error: {json.dumps(response.json(), indent=2)}")
            except:
                print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def run_all_tests():
    """Run all auth tests with a test token"""
    log_separator("DIRECT AUTH TESTS")
    
    # Test v1 health endpoint (no auth required)
    v1_health_success = test_v1_health_endpoint()
    
    # Create test token
    token = create_test_token(
        user_id=TEST_USER["user_id"],
        email=TEST_USER["email"]
    )
    
    print(f"Generated test token: {token[:15]}...{token[-15:] if len(token) > 30 else token}")
    
    # Run tests
    auth_status_success = test_auth_status_endpoint(token)
    simple_auth_success = test_simple_auth_endpoint(token)
    token_debug_success = test_token_debug_endpoint(token)
    
    # Print summary
    log_separator("TEST SUMMARY")
    print(f"V1 Health Check: {'✅ PASS' if v1_health_success else '❌ FAIL'}")
    print(f"Auth Status Test: {'✅ PASS' if auth_status_success else '❌ FAIL'}")
    print(f"Simple Auth Test: {'✅ PASS' if simple_auth_success else '❌ FAIL'}")
    print(f"Token Debug Test: {'✅ PASS' if token_debug_success else 'ℹ️ N/A'}")
    
    # Print curl command examples
    log_step("CURL Command Examples")
    print("Here are some example curl commands you can use for manual testing:")
    
    print("\n1. Check Authentication Status:")
    print(f"""curl -X GET \\
  {BACKEND_URL}/api/auth/status \\
  -H "Authorization: Bearer {token}" \\
  -H "Content-Type: application/json"
""")
    
    print("\n2. Get User Profile:")
    print(f"""curl -X GET \\
  {BACKEND_URL}/api/auth/me \\
  -H "Authorization: Bearer {token}" \\
  -H "Content-Type: application/json"
""")

if __name__ == "__main__":
    run_all_tests() 