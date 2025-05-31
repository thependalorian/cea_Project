#!/usr/bin/env python
"""
Simple script to add sample social links to a resume in Supabase
"""

import os
import asyncio
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
root_dir = Path(__file__).resolve().parent.parent
env_path = root_dir / '.env'
load_dotenv(env_path)

# Get API keys
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

async def add_social_links():
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    # Get first resume
    result = supabase.table('resumes').select('id, user_id').limit(1).execute()
    
    if not result.data:
        print('No resumes found')
        return
    
    resume = result.data[0]
    resume_id = resume['id']
    user_id = resume['user_id']
    
    print(f'Adding social links to resume {resume_id}...')
    
    # Update with sample social links
    update_result = supabase.table('resumes').update({
        'linkedin_url': 'https://www.linkedin.com/in/satyanadella/',
        'github_url': 'https://github.com/microsoft',
        'personal_website': 'https://www.microsoft.com'
    }).eq('id', resume_id).execute()
    
    print('Social links added successfully!')
    print(f'Resume ID: {resume_id}')
    print(f'User ID: {user_id}')
    
    return user_id

if __name__ == "__main__":
    asyncio.run(add_social_links()) 