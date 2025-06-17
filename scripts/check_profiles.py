#!/usr/bin/env python3
"""
Check all profile table contents
"""

import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()
supabase = create_client(
    os.environ.get('NEXT_PUBLIC_SUPABASE_URL'),
    os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
)

print('=== PROFILES TABLE ===')
try:
    profiles = supabase.table('profiles').select('*').execute()
    print(f'Found {len(profiles.data)} profiles:')
    for profile in profiles.data:
        print(f'ID: {profile.get("id")}')
        print(f'Email: {profile.get("email")}')
        print(f'Name: {profile.get("first_name", "")} {profile.get("last_name", "")}')
        print(f'Role: {profile.get("role")}')
        print(f'Organization: {profile.get("organization_name")}')
        print(f'Verified: {profile.get("verified")}')
        print(f'Created: {profile.get("created_at")}')
        print('---')
except Exception as e:
    print(f'Error querying profiles: {e}')

print('\n=== ADMIN_PROFILES TABLE ===')
try:
    admin_profiles = supabase.table('admin_profiles').select('*').execute()
    print(f'Found {len(admin_profiles.data)} admin profiles:')
    for admin in admin_profiles.data:
        print(f'ID: {admin.get("id")}')
        print(f'User ID: {admin.get("user_id")}')
        print(f'Name: {admin.get("full_name")}')
        print(f'Email: {admin.get("email")}')
        print(f'Admin Level: {admin.get("admin_level")}')
        print(f'Permissions: {len(admin.get("permissions", []))} permissions')
        print(f'Created: {admin.get("created_at")}')
        print('---')
except Exception as e:
    print(f'Error querying admin_profiles: {e}')

print('\n=== PARTNER_PROFILES TABLE ===')
try:
    partner_profiles = supabase.table('partner_profiles').select('*').execute()
    print(f'Found {len(partner_profiles.data)} partner profiles:')
    for partner in partner_profiles.data:
        print(f'ID: {partner.get("id")}')
        print(f'User ID: {partner.get("user_id")}')
        print(f'Organization: {partner.get("organization_name")}')
        print(f'Contact Email: {partner.get("contact_email")}')
        print(f'Partnership Level: {partner.get("partnership_level")}')
        print(f'Verified: {partner.get("verified")}')
        print(f'Created: {partner.get("created_at")}')
        print('---')
except Exception as e:
    print(f'Error querying partner_profiles: {e}')

print('\n=== JOB_SEEKER_PROFILES TABLE ===')
try:
    job_seeker_profiles = supabase.table('job_seeker_profiles').select('*').execute()
    print(f'Found {len(job_seeker_profiles.data)} job seeker profiles:')
    for job_seeker in job_seeker_profiles.data:
        print(f'ID: {job_seeker.get("id")}')
        print(f'User ID: {job_seeker.get("user_id")}')
        print(f'Name: {job_seeker.get("full_name")}')
        print(f'Email: {job_seeker.get("email")}')
        print(f'Experience Level: {job_seeker.get("experience_level")}')
        print(f'Years Experience: {job_seeker.get("years_experience")}')
        print(f'Created: {job_seeker.get("created_at")}')
        print('---')
except Exception as e:
    print(f'Error querying job_seeker_profiles: {e}')

print('\n=== AUTH USERS (from auth.users) ===')
try:
    # Get auth users using admin API
    auth_users = supabase.auth.admin.list_users()
    print(f'Found {len(auth_users)} auth users:')
    for user in auth_users:
        print(f'ID: {user.id}')
        print(f'Email: {user.email}')
        print(f'Email Confirmed: {user.email_confirmed_at is not None}')
        print(f'Last Sign In: {user.last_sign_in_at}')
        print(f'Created: {user.created_at}')
        print(f'User Metadata: {user.user_metadata}')
        print('---')
except Exception as e:
    print(f'Error querying auth users: {e}') 