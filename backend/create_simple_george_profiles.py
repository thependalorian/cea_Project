#!/usr/bin/env python3
"""
Simple George Nekwaya Profile Creation Script
============================================

Creates simplified profiles for testing George's triple access functionality.
Uses constraint-compliant values and focuses on core functionality.
"""

import os
import sys
from datetime import datetime

# Add backend to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from supabase import Client, create_client

from core.config import get_settings

# George's Profile UUIDs (consistent with test file)
GEORGE_ADMIN_UUID = "550e8400-e29b-41d4-a716-446655440001"
GEORGE_PARTNER_UUID = "550e8400-e29b-41d4-a716-446655440002"
GEORGE_JOBSEEKER_UUID = "550e8400-e29b-41d4-a716-446655440003"


def create_simple_george_profiles():
    """Create simplified George profiles for testing"""
    print("🌟 Creating Simple George Nekwaya Test Profiles")
    print("=" * 60)

    settings = get_settings()
    supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)

    success_count = 0

    # 1. Create simple admin profile
    try:
        admin_data = {
            "id": GEORGE_ADMIN_UUID,
            "user_id": GEORGE_ADMIN_UUID,
            "full_name": "George Nekwaya",
            "email": "gnekwaya@actinstitute.org",
            "admin_level": "super",
            "department": "Program Management",
            "can_manage_users": True,
            "can_manage_system": True,
            "can_manage_partners": True,
            "can_manage_content": True,
            "can_view_analytics": True,
            "permissions": {
                "user_management": True,
                "system_analytics": True,
                "content_moderation": True,
                "partner_management": True,
                "data_export": True,
                "platform_configuration": True,
            },
            "profile_completed": True,
        }

        response = supabase.table("admin_profiles").upsert(admin_data).execute()
        if response.data:
            print("✅ Admin Profile: George Nekwaya (ACT Institute)")
            success_count += 1

    except Exception as e:
        print(f"❌ Admin Profile failed: {e}")

    # 2. Create simple partner profile
    try:
        partner_data = {
            "id": GEORGE_PARTNER_UUID,
            "organization_name": "Buffr Inc.",
            "full_name": "George Nekwaya",
            "email": "george@buffr.com",
            "description": "Fintech founder transitioning to clean energy partnerships",
            "website": "https://buffr.com",
            "headquarters_location": "Boston, MA",
            "organization_type": "Private Company",
            "organization_size": "Startup",  # Use simple constraint-compliant value
            "partnership_level": "premium",
            "verified": True,
            "hiring_actively": True,
            "profile_completed": True,
            "mission_statement": "Democratizing access to clean energy through innovative financial technology",
        }

        response = supabase.table("partner_profiles").upsert(partner_data).execute()
        if response.data:
            print("✅ Partner Profile: George Nekwaya (Buffr Inc.)")
            success_count += 1

    except Exception as e:
        print(f"❌ Partner Profile failed: {e}")

    # 3. Create simple job seeker profile
    try:
        jobseeker_data = {
            "id": GEORGE_JOBSEEKER_UUID,
            "full_name": "George Nekwaya",
            "email": "george.nekwaya@gmail.com",
            "current_title": "Entrepreneur / Fintech Founder",
            "location": "Boston, MA",
            "experience_level": "Senior",  # Use simple constraint-compliant value
            "remote_work_preference": "hybrid",
            "profile_completed": True,
        }

        response = (
            supabase.table("job_seeker_profiles").upsert(jobseeker_data).execute()
        )
        if response.data:
            print("✅ Job Seeker Profile: George Nekwaya (Individual)")
            success_count += 1

    except Exception as e:
        print(f"❌ Job Seeker Profile failed: {e}")

    print(
        f"\n🎯 Profile Creation Summary: {success_count}/3 profiles created successfully"
    )

    if success_count >= 2:
        print("✅ George Nekwaya profiles successfully created for testing!")
        print("\n📋 Profile Access Summary:")
        print(f"   👤 Admin: {GEORGE_ADMIN_UUID} (gnekwaya@actinstitute.org)")
        print(f"   🤝 Partner: {GEORGE_PARTNER_UUID} (george@buffr.com)")
        print(f"   💼 Job Seeker: {GEORGE_JOBSEEKER_UUID} (george.nekwaya@gmail.com)")
        print("\n🧪 Profiles are ready for triple access testing!")
    else:
        print(
            "⚠️ Profile creation had issues. Testing will focus on agent functionality."
        )

    return success_count


if __name__ == "__main__":
    create_simple_george_profiles()
