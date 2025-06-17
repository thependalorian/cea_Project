#!/usr/bin/env python3
"""
Test authentication with the actual seed credentials
"""

import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()
supabase = create_client(
    os.environ.get('NEXT_PUBLIC_SUPABASE_URL'),
    os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
)

# Test credentials from the seed script
test_accounts = [
    {
        'email': 'george.n.p.nekwaya@gmail.com',
        'password': 'ClimateJobs2025!JobSeeker',
        'role': 'job_seeker'
    },
    {
        'email': 'gnekwaya@joinact.org', 
        'password': 'ClimateAdmin2025!George_Nekwaya_Act',
        'role': 'admin'
    },
    {
        'email': 'buffr_inc@buffr.ai',
        'password': 'ClimateJobs2025!Buffr_Inc', 
        'role': 'partner'
    }
]

print('🔐 Testing Authentication Credentials\n')

for account in test_accounts:
    try:
        # Try to sign in with each account
        response = supabase.auth.sign_in_with_password({
            "email": account['email'],
            "password": account['password']
        })
        
        if response.user:
            print(f"✅ {account['role'].upper()}: {account['email']}")
            print(f"   User ID: {response.user.id}")
            print(f"   Confirmed: {response.user.email_confirmed_at is not None}")
            
            # Get profile data
            profile = supabase.table('profiles').select('*').eq('id', response.user.id).execute()
            if profile.data:
                print(f"   Profile: {profile.data[0].get('first_name', '')} {profile.data[0].get('last_name', '')}")
                print(f"   Role: {profile.data[0].get('role', 'N/A')}")
            
            print()
        else:
            print(f"❌ {account['role'].upper()}: Login failed - no user returned")
            
    except Exception as e:
        print(f"❌ {account['role'].upper()}: {account['email']}")
        print(f"   Error: {str(e)}")
        print()

print('✅ Authentication test completed!') 