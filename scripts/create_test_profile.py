#!/usr/bin/env python
"""
Create Test Profile - Development Utility Script

This script creates a test user profile in the Supabase database for
development and testing purposes. It uses the user ID from a JWT token
to create a corresponding profile in the appropriate profile table.

Usage:
    python scripts/create_test_profile.py --user-id=<user_id> --profile-type=<type> --email=<email> --name=<name>

Examples:
    python scripts/create_test_profile.py --user-id=test-user-123 --profile-type=job_seeker --email=test@example.com --name="Test User"
    python scripts/create_test_profile.py --decode-token=<jwt_token> --profile-type=partner

Requirements:
    - Supabase credentials configured in .env
    - Valid user ID or JWT token

Location: scripts/create_test_profile.py
"""

import sys
import os
import argparse
import asyncio
import jwt
import json
from typing import Dict, Any, Optional

# Add parent directory to path to import from backendv1
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import after adding to path
from backendv1.utils.user_profile_manager import create_user_profile
from backendv1.utils.logger import setup_logger
from backendv1.config.settings import get_settings
from backendv1.adapters.supabase_adapter import supabase_adapter

logger = setup_logger("create_test_profile")
settings = get_settings()


def decode_jwt_token(token: str) -> Dict[str, Any]:
    """
    Decode a JWT token without verification to extract user info
    
    Args:
        token: JWT token
        
    Returns:
        Dict[str, Any]: Decoded token payload
    """
    try:
        # Remove 'Bearer ' prefix if present
        if token.startswith('Bearer '):
            token = token[7:]
            
        # Decode token without verification (for debugging)
        payload = jwt.decode(token, options={"verify_signature": False})
        return payload
    except Exception as e:
        logger.error(f"Error decoding token: {e}")
        sys.exit(1)


async def main():
    """Main function to create test profile"""
    parser = argparse.ArgumentParser(description="Create a test user profile in Supabase")
    
    # Define arguments
    parser.add_argument("--user-id", help="User ID (sub) to create profile for")
    parser.add_argument("--decode-token", help="JWT token to decode and extract user ID")
    parser.add_argument("--profile-type", choices=["job_seeker", "partner", "admin"], 
                        default="job_seeker", help="Type of profile to create")
    parser.add_argument("--email", help="Email for the user profile")
    parser.add_argument("--name", help="Full name for the user profile")
    
    # Parse arguments
    args = parser.parse_args()
    
    # Validate Supabase connection
    if not supabase_adapter.is_configured():
        logger.error("Supabase credentials not configured. Set SUPABASE_URL and SUPABASE_SERVICE_KEY in .env")
        sys.exit(1)
    
    user_id = args.user_id
    email = args.email
    name = args.name
    profile_type = args.profile_type
    
    # If token is provided, decode it to get user ID
    if args.decode_token:
        payload = decode_jwt_token(args.decode_token)
        print("\nToken payload:")
        print(json.dumps(payload, indent=2))
        
        user_id = payload.get("sub")
        if not user_id:
            logger.error("Token does not contain a subject (sub) claim")
            sys.exit(1)
            
        # Use email from token if not provided
        if not email and "email" in payload:
            email = payload["email"]
            
        print(f"\nExtracted user_id: {user_id}")
        print(f"Extracted email: {email}")
        
    # Validate required arguments
    if not user_id:
        logger.error("User ID is required. Provide --user-id or --decode-token")
        sys.exit(1)
        
    if not email:
        email = f"{user_id}@example.com"
        print(f"Using default email: {email}")
        
    if not name:
        name = "Test User"
        print(f"Using default name: {name}")
    
    # Create the profile
    print(f"\nCreating {profile_type} profile for user {user_id}...")
    
    profile = await create_user_profile(
        user_id=user_id,
        email=email,
        full_name=name,
        profile_type=profile_type,
        additional_data={"profile_completed": True, "base_profile": {}}
    )
    
    if profile:
        print("\n✅ Profile created successfully!")
        print(f"Profile type: {profile_type}")
        print(f"User ID: {user_id}")
        print(f"Email: {email}")
        print(f"Name: {name}")
    else:
        print("\n❌ Failed to create profile. Check logs for details.")


if __name__ == "__main__":
    asyncio.run(main()) 