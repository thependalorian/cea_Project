#!/usr/bin/env python
"""
Script to manually reprocess a resume that's already been uploaded.
This is useful if a resume was uploaded but processing failed.
"""

import os
import sys
import asyncio
import json
from pathlib import Path
from dotenv import load_dotenv

# Add the parent directory to the path so we can import our modules
sys.path.append(str(Path(__file__).parent))

# Import our modules
from cea.resume_processor import ResumeProcessor
from cea.rag_tool import ResumeRAGTool

# Load environment variables
root_dir = Path(__file__).resolve().parent.parent
env_path = root_dir / '.env'
load_dotenv(env_path)

# Get API keys
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

async def fix_resume(resume_id=None, user_id=None):
    """
    Fix resume processing by forcing reprocessing.
    
    Args:
        resume_id: Optional resume ID to reprocess
        user_id: Optional user ID to find their latest resume
    """
    if not resume_id and not user_id:
        print("Error: Either resume_id or user_id must be provided.")
        return
        
    # Create necessary objects
    resume_processor = ResumeProcessor(
        openai_api_key=OPENAI_API_KEY,
        supabase_url=SUPABASE_URL,
        supabase_key=SUPABASE_KEY
    )
    
    rag_tool = ResumeRAGTool(
        openai_api_key=OPENAI_API_KEY,
        supabase_url=SUPABASE_URL,
        supabase_key=SUPABASE_KEY
    )
    
    # First, find the resume if user_id was provided
    if not resume_id and user_id:
        print(f"Looking up resume for user {user_id}...")
        
        result = resume_processor.supabase.table("resumes") \
            .select("id, file_path, file_name, processed") \
            .eq("user_id", user_id) \
            .order("created_at", desc=True) \
            .limit(1) \
            .execute()
            
        if not result.data:
            print(f"No resume found for user {user_id}")
            return
            
        resume_id = result.data[0]["id"]
        print(f"Found resume with ID: {resume_id}")
    
    # Get the resume details
    print(f"Getting details for resume {resume_id}...")
    result = resume_processor.supabase.table("resumes") \
        .select("id, file_path, file_name, processed, user_id") \
        .eq("id", resume_id) \
        .single() \
        .execute()
        
    if not result.data:
        print(f"No resume found with ID {resume_id}")
        return
        
    resume = result.data
    print(f"Resume details: {json.dumps(resume, indent=2)}")
    
    # Generate a public URL for the file
    print("Generating public URL for the file...")
    public_url_result = resume_processor.supabase.storage \
        .from_("user-documents") \
        .get_public_url(resume["file_path"])
    
    file_url = public_url_result["publicUrl"] if isinstance(public_url_result, dict) else public_url_result.data["publicUrl"]
    print(f"File URL: {file_url}")
    
    # Check if the file exists
    print("Checking if file exists...")
    try:
        import requests
        head_response = requests.head(file_url)
        if head_response.status_code != 200:
            print(f"Warning: File might not exist at URL (status code: {head_response.status_code})")
    except Exception as e:
        print(f"Error checking file: {str(e)}")
    
    # Process the resume
    print("Processing resume...")
    processing_result = await resume_processor.process_resume(file_url, resume_id)
    print(f"Processing result: {json.dumps(processing_result, indent=2)}")
    
    # Check processing status
    print("Checking processing status...")
    debug_result = await resume_processor.debug_resume_chunks(resume_id)
    print(f"Debug result: {json.dumps(debug_result, indent=2)}")
    
    chunks_count = debug_result.get("chunks_count", 0)
    print(f"Resume has {chunks_count} processed chunks")
    
    return {
        "resume_id": resume_id,
        "user_id": resume.get("user_id"),
        "file_name": resume.get("file_name"),
        "chunks_count": chunks_count,
        "processing_status": processing_result.get("status")
    }

def print_usage():
    """Print script usage instructions."""
    print(f"Usage: {sys.argv[0]} [--resume-id RESUME_ID] [--user-id USER_ID]")
    print()
    print("Options:")
    print("  --resume-id RESUME_ID    Specify a resume ID to reprocess")
    print("  --user-id USER_ID        Specify a user ID to find and reprocess their latest resume")
    print()
    print("Note: At least one of --resume-id or --user-id must be provided.")

if __name__ == "__main__":
    # Parse command line arguments
    resume_id = None
    user_id = None
    
    if len(sys.argv) < 2:
        print_usage()
        sys.exit(1)
    
    i = 1
    while i < len(sys.argv):
        if sys.argv[i] == "--resume-id" and i + 1 < len(sys.argv):
            resume_id = sys.argv[i + 1]
            i += 2
        elif sys.argv[i] == "--user-id" and i + 1 < len(sys.argv):
            user_id = sys.argv[i + 1]
            i += 2
        else:
            print(f"Unknown argument: {sys.argv[i]}")
            print_usage()
            sys.exit(1)
    
    if not resume_id and not user_id:
        print("Error: Either --resume-id or --user-id must be provided.")
        print_usage()
        sys.exit(1)
    
    # Run the fix_resume function
    result = asyncio.run(fix_resume(resume_id, user_id))
    
    if result:
        print("\nSummary:")
        print(f"Resume ID: {result['resume_id']}")
        print(f"User ID: {result['user_id']}")
        print(f"File Name: {result['file_name']}")
        print(f"Chunks Count: {result['chunks_count']}")
        print(f"Processing Status: {result['processing_status']}")
        
        if result['chunks_count'] > 0:
            print("\n✅ Resume has been successfully processed!")
        else:
            print("\n❌ Resume processing failed! Chunks count is 0.")
    else:
        print("\n❌ Failed to fix resume processing.") 