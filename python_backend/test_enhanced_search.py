#!/usr/bin/env python
"""
Test script to test enhanced search with RAG
"""

import os
import sys
import asyncio
from pathlib import Path
from dotenv import load_dotenv

# Add the parent directory to the path so we can import our modules
sys.path.append(str(Path(__file__).parent))

# Import our modules
from cea.rag_tool import ResumeRAGTool
from cea.social_search import SocialProfileSearcher

# Load environment variables
root_dir = Path(__file__).resolve().parent.parent
env_path = root_dir / '.env'
load_dotenv(env_path)

# Get API keys
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")

async def test_enhanced_search():
    """
    Test the enhanced search with social data
    """
    print("Initializing RAG tool...")
    rag_tool = ResumeRAGTool(
        openai_api_key=OPENAI_API_KEY,
        supabase_url=SUPABASE_URL,
        supabase_key=SUPABASE_KEY
    )
    
    social_searcher = SocialProfileSearcher(
        tavily_api_key=TAVILY_API_KEY,
        openai_api_key=OPENAI_API_KEY
    )
    
    # Get user ID from command line argument or use a default
    user_id = sys.argv[1] if len(sys.argv) > 1 else "9678d792-3104-41b0-b5ea-fca51fae6873"
    
    # Force refresh
    force_refresh = len(sys.argv) > 2 and sys.argv[2].lower() == "refresh"
    
    print(f"Testing enhanced search for user {user_id} (force_refresh={force_refresh})...")
    
    # First, check current social data
    print("Checking current social data...")
    chunks = await rag_tool.get_resume_chunks_for_user(user_id)
    
    if not chunks:
        print("No resume chunks found for this user.")
        return
    
    # Check for social data
    has_social_data = False
    if "social_data" in chunks[0] and chunks[0]["social_data"]:
        has_social_data = True
        print("Current social data:")
        if isinstance(chunks[0]["social_data"], dict) and "comprehensive_profile" in chunks[0]["social_data"]:
            print(chunks[0]["social_data"]["comprehensive_profile"][:500] + "...\n")
        else:
            print(chunks[0]["social_data"])
    else:
        print("No current social data found.")
    
    # Check for social URLs
    social_urls = {}
    if "linkedin_url" in chunks[0] and chunks[0]["linkedin_url"]:
        social_urls["linkedin_url"] = chunks[0]["linkedin_url"]
    if "github_url" in chunks[0] and chunks[0]["github_url"]:
        social_urls["github_url"] = chunks[0]["github_url"]
    if "personal_website" in chunks[0] and chunks[0]["personal_website"]:
        social_urls["personal_website"] = chunks[0]["personal_website"]
    
    print("\nSocial URLs:")
    for url_type, url in social_urls.items():
        print(f"  {url_type}: {url}")
    
    # If force refresh or no social data, perform enhanced search
    if force_refresh or not has_social_data:
        print("\nPerforming enhanced search...")
        # Get resume ID
        resume_id = chunks[0]["resume_id"] if "resume_id" in chunks[0] else None
        
        if not resume_id:
            print("Resume ID not found in chunks, querying database...")
            result = rag_tool.supabase.table("resumes") \
                .select("id") \
                .eq("user_id", user_id) \
                .limit(1) \
                .execute()
            
            if result.data:
                resume_id = result.data[0]["id"]
                print(f"Found resume ID: {resume_id}")
            else:
                print("No resume found for this user.")
                return
        
        # Call enhanced search API
        search_results = await social_searcher.search_all_profiles(
            linkedin_url=social_urls.get("linkedin_url"),
            github_url=social_urls.get("github_url"),
            personal_website=social_urls.get("personal_website")
        )
        
        print("\nSearch results:")
        print(search_results.get("comprehensive_profile", "No comprehensive profile found")[:500] + "...\n" if search_results.get("comprehensive_profile") else "")
        
        # Update resume with social data
        update_result = rag_tool.supabase.table("resumes") \
            .update({"social_data": search_results}) \
            .eq("id", resume_id) \
            .execute()
        
        print("Updated resume with new social data.")
    
    # Test queries with RAG
    print("\nTesting queries with RAG:")
    queries = [
        "What is their experience in climate tech?",
        "What skills do they have that are relevant to climate jobs?",
        "Would they be a good candidate for a sustainability role?"
    ]
    
    for query in queries:
        print(f"\nQuery: {query}")
        result = await rag_tool.query_resume(user_id=user_id, query=query)
        
        if result["success"]:
            print(f"Answer: {result['answer']}")
        else:
            print(f"Error: {result['answer']}")

if __name__ == "__main__":
    asyncio.run(test_enhanced_search()) 