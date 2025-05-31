#!/usr/bin/env python
"""
Test script to verify that the RAG tool can properly access and use social data
"""

import os
import sys
import asyncio
from pathlib import Path
from dotenv import load_dotenv

# Add the parent directory to the path so we can import our modules
sys.path.append(str(Path(__file__).parent.parent))

# Import our modules
from cea.rag_tool import ResumeRAGTool
from cea.social_search import SocialProfileSearcher

# Load environment variables
root_dir = Path(__file__).resolve().parent.parent.parent
env_path = root_dir / '.env'
load_dotenv(env_path)

# Get API keys
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")

async def test_rag_with_social_data():
    """
    Test the RAG tool with social data
    """
    print("Initializing RAG tool...")
    rag_tool = ResumeRAGTool(
        openai_api_key=OPENAI_API_KEY,
        supabase_url=SUPABASE_URL,
        supabase_key=SUPABASE_KEY
    )
    
    # Get user ID from command line argument or use a default
    user_id = sys.argv[1] if len(sys.argv) > 1 else None
    
    if not user_id:
        print("No user ID provided. Please provide a user ID as the first argument.")
        print("Trying to find a user with a resume in the database...")
        
        # Try to find a user with a resume
        try:
            resumes_result = rag_tool.supabase.table("resumes") \
                .select("user_id") \
                .limit(1) \
                .execute()
            
            if resumes_result.data:
                user_id = resumes_result.data[0]["user_id"]
                print(f"Found user ID: {user_id}")
            else:
                print("No users with resumes found. Please upload a resume first.")
                return
        except Exception as e:
            print(f"Error finding user: {str(e)}")
            return
    
    print(f"Getting resume chunks for user {user_id}...")
    chunks = await rag_tool.get_resume_chunks_for_user(user_id)
    
    if not chunks:
        print("No resume chunks found for this user.")
        return
    
    print(f"Found {len(chunks)} resume chunks.")
    
    # Check if we have social data
    has_social_data = False
    social_data = None
    social_urls = {}
    
    if chunks:
        if "social_data" in chunks[0] and chunks[0]["social_data"]:
            social_data = chunks[0]["social_data"]
            has_social_data = bool(social_data)
            if has_social_data:
                print("Social data found for this user's resume.")
                if "comprehensive_profile" in social_data:
                    print("\nComprehensive Profile Summary:")
                    print(social_data["comprehensive_profile"][:500] + "...\n")
        
        # Check for social URLs
        if "linkedin_url" in chunks[0] and chunks[0]["linkedin_url"]:
            social_urls["linkedin_url"] = chunks[0]["linkedin_url"]
        if "github_url" in chunks[0] and chunks[0]["github_url"]:
            social_urls["github_url"] = chunks[0]["github_url"]
        if "personal_website" in chunks[0] and chunks[0]["personal_website"]:
            social_urls["personal_website"] = chunks[0]["personal_website"]
    
    if not has_social_data:
        print("No social data found for this user's resume.")
        
        if social_urls:
            print("Found social URLs:")
            for url_type, url in social_urls.items():
                print(f"  {url_type}: {url}")
            
            print("\nWhen querying the resume, the RAG tool will automatically search for social data using these URLs.")
        else:
            print("No social URLs found. Add social URLs to the resume to enable social data fetching.")
    
    # Test querying the resume with RAG
    print("\nTesting RAG query...")
    queries = [
        "What are this person's skills?",
        "What is their work experience?",
        "Where did they go to school?",
        "What climate-related experience do they have?",
        "Would they be a good fit for a climate tech job?"
    ]
    
    for query in queries:
        print(f"\nQuery: {query}")
        result = await rag_tool.query_resume(user_id=user_id, query=query)
        
        if result["success"]:
            print(f"Answer: {result['answer']}")
        else:
            print(f"Error: {result['answer']}")

if __name__ == "__main__":
    asyncio.run(test_rag_with_social_data()) 