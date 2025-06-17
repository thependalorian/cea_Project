#!/usr/bin/env python3
"""
George Nekwaya Profile Creation Script
====================================

Creates George Nekwaya's three distinct profiles in the database:
1. Admin Profile (ACT Project Manager) - Super Admin Access
2. Partner Profile (Buffr Inc. Founder) - Partner Collaboration Access
3. Job Seeker Profile (Individual) - Career Development Access

Uses the exact Supabase schema structure provided.
"""

import os
import sys
from datetime import datetime
from uuid import uuid4

# Add backend to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from supabase import Client, create_client

from core.config import get_settings

# George's Profile UUIDs (consistent with test file)
GEORGE_ADMIN_UUID = "550e8400-e29b-41d4-a716-446655440001"
GEORGE_PARTNER_UUID = "550e8400-e29b-41d4-a716-446655440002"
GEORGE_JOBSEEKER_UUID = "550e8400-e29b-41d4-a716-446655440003"


def create_george_profiles():
    """Create all three George Nekwaya profiles"""
    print("🌟 Creating George Nekwaya's Triple Access Profiles")
    print("=" * 60)

    settings = get_settings()
    # Use service role key to bypass RLS policies
    supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)

    success_count = 0

    # 1. Create Admin Profile
    try:
        admin_data = {
            "id": GEORGE_ADMIN_UUID,
            "user_id": GEORGE_ADMIN_UUID,
            "full_name": "George Nekwaya",
            "email": "gnekwaya@actinstitute.org",
            "phone": "+1-617-555-0001",
            "department": "Program Management",
            "admin_level": "super",  # Required field
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
            "admin_notes": "ACT Project Manager with super admin access for platform oversight",
            "profile_completed": True,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
        }

        response = supabase.table("admin_profiles").upsert(admin_data).execute()
        print("✅ Admin Profile: George Nekwaya (ACT Institute)")
        success_count += 1

    except Exception as e:
        print(f"❌ Admin Profile failed: {e}")

    # 2. Create Partner Profile
    try:
        partner_data = {
            "id": GEORGE_PARTNER_UUID,
            "organization_name": "Buffr Inc.",
            "full_name": "George Nekwaya",
            "email": "george@buffr.com",
            "phone": "+1-617-555-0002",
            "description": "Fintech founder transitioning to clean energy partnerships",
            "website": "https://buffr.com",
            "headquarters_location": "Boston, MA",
            "organization_type": "Private Company",
            "organization_size": "11-50 employees",
            "founded_year": 2020,
            "employee_count": 25,
            "climate_focus": [
                "fintech",
                "clean energy",
                "carbon credits",
                "sustainability",
            ],
            "industries": ["Financial Technology", "Clean Energy", "Carbon Management"],
            "services_offered": [
                "Carbon Credit Trading",
                "Sustainability Analytics",
                "Clean Energy Financing",
            ],
            "partnership_level": "premium",
            "partnership_start_date": "2024-01-01",
            "verified": True,
            "verification_date": datetime.now().isoformat(),
            "hiring_actively": True,
            "offers_mentorship": True,
            "offers_funding": True,
            "has_job_board": True,
            "profile_completed": True,
            "mission_statement": "Democratizing access to clean energy through innovative financial technology",
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
        }

        response = supabase.table("partner_profiles").upsert(partner_data).execute()
        print("✅ Partner Profile: George Nekwaya (Buffr Inc.)")
        success_count += 1

    except Exception as e:
        print(f"❌ Partner Profile failed: {e}")

    # 3. Create Job Seeker Profile
    try:
        jobseeker_data = {
            "id": GEORGE_JOBSEEKER_UUID,
            "user_id": GEORGE_JOBSEEKER_UUID,
            "full_name": "George Nekwaya",
            "email": "george.nekwaya@gmail.com",
            "phone": "+1-617-555-0003",
            "current_title": "Entrepreneur / Fintech Founder",
            "location": "Boston, MA",
            "experience_level": "Senior Level",
            "climate_interests": [
                "fintech",
                "carbon markets",
                "clean energy finance",
                "sustainability",
            ],
            "climate_focus_areas": [
                "Financial Technology",
                "Carbon Trading",
                "Clean Energy Investment",
            ],
            "desired_roles": [
                "Chief Technology Officer",
                "VP of Product",
                "Sustainability Director",
            ],
            "employment_types": ["Full-time", "Part-time", "Consulting"],
            "preferred_locations": ["Boston, MA", "Cambridge, MA", "Remote"],
            "remote_work_preference": "hybrid",
            "salary_range_min": 150000,
            "salary_range_max": 250000,
            "profile_completed": True,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
        }

        response = (
            supabase.table("job_seeker_profiles").upsert(jobseeker_data).execute()
        )
        print("✅ Job Seeker Profile: George Nekwaya (Individual)")
        success_count += 1

    except Exception as e:
        print(f"❌ Job Seeker Profile failed: {e}")

    # 4. Create basic profiles entry for each
    try:
        for profile_type, uuid_val, email in [
            ("admin", GEORGE_ADMIN_UUID, "gnekwaya@actinstitute.org"),
            ("partner", GEORGE_PARTNER_UUID, "george@buffr.com"),
            ("job_seeker", GEORGE_JOBSEEKER_UUID, "george.nekwaya@gmail.com"),
        ]:
            profile_data = {
                "id": uuid_val,
                "email": email,
                "first_name": "George",
                "last_name": "Nekwaya",
                "role": profile_type,
                "user_type": profile_type,
                "verified": True,
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat(),
            }

            # Add organization data for relevant profiles
            if profile_type == "admin":
                profile_data.update(
                    {
                        "organization_name": "ACT Institute",
                        "organization_type": "Non-profit",
                    }
                )
            elif profile_type == "partner":
                profile_data.update(
                    {
                        "organization_name": "Buffr Inc.",
                        "organization_type": "Private Company",
                    }
                )

            supabase.table("profiles").upsert(profile_data).execute()

        print("✅ Base profiles created for all three identities")
        success_count += 0.5  # Partial credit for base profiles

    except Exception as e:
        print(f"⚠️ Base profiles warning: {e}")

    print(
        f"\n🎯 Profile Creation Summary: {success_count}/3 profiles created successfully"
    )

    if success_count >= 3:
        print("✅ All George Nekwaya profiles created successfully!")
        print("\n📋 Profile Access Summary:")
        print(f"   👤 Admin: {GEORGE_ADMIN_UUID} (gnekwaya@actinstitute.org)")
        print(f"   🤝 Partner: {GEORGE_PARTNER_UUID} (george@buffr.com)")
        print(f"   💼 Job Seeker: {GEORGE_JOBSEEKER_UUID} (george.nekwaya@gmail.com)")
    else:
        print("⚠️ Some profiles failed to create. Check errors above.")


if __name__ == "__main__":
    create_george_profiles()
