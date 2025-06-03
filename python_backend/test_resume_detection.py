#!/usr/bin/env python
"""
Test script to check if resume detection is working properly
"""

import asyncio
import json
import httpx
import sys
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
root_dir = Path(__file__).resolve().parent.parent
env_path = root_dir / '.env'
load_dotenv(env_path)

async def test_check_user_resume():
    """
    Test the check-user-resume endpoint to see if resumes are being detected properly
    """
    # Default user ID to test
    user_id = sys.argv[1] if len(sys.argv) > 1 else "9678d792-3104-41b0-b5ea-fca51fae6873"
    
    print(f"Testing resume detection for user ID: {user_id}")
    
    # Use a single AsyncClient for all requests
    async with httpx.AsyncClient() as client:
        # Test the Python backend endpoint
        try:
            response = await client.post(
                'http://localhost:8000/api/check-user-resume',
                json={'user_id': user_id},
                timeout=10.0
            )
            
            print("\n== Python Backend Response ==")
            print(f"Status Code: {response.status_code}")
            if response.status_code == 200:
                result = response.json()
                print(json.dumps(result, indent=2))
                
                # Additional analysis
                if result.get('has_resume'):
                    print("\nResume detected!")
                    print(f"Resume ID: {result.get('resume_id')}")
                    print(f"File Name: {result.get('file_name')}")
                    print(f"Has Social Data: {result.get('has_social_data')}")
                    
                    if result.get('has_social_data'):
                        print("\nSocial data is available")
                    else:
                        print("\nSocial data is NOT available")
                    
                    print("\nSocial Links:")
                    for link_type, url in result.get('social_links', {}).items():
                        print(f"  {link_type}: {url or 'Not available'}")
                else:
                    print("\nNo resume detected for this user!")
            else:
                print(f"Error response: {response.text}")
        except Exception as e:
            print(f"Error querying Python backend: {str(e)}")
        
        # Test the Next.js API endpoint (requires authentication, might not work in this script)
        try:
            response = await client.post(
                'http://localhost:3000/api/check-user-resume',
                json={'user_id': user_id},
                timeout=10.0
            )
            
            print("\n== Next.js API Response ==")
            print(f"Status Code: {response.status_code}")
            if response.status_code == 200:
                result = response.json()
                print(json.dumps(result, indent=2))
            else:
                print(f"Error response: {response.text}")
        except Exception as e:
            print(f"Error querying Next.js API: {str(e)}")
        
        # Now check the resume processing status
        try:
            print("\n== Checking Resume Processing Status ==")
            # First get the resume ID
            response = await client.post(
                'http://localhost:8000/api/check-user-resume',
                json={'user_id': user_id},
                timeout=10.0
            )
            
            resume_id = None
            if response.status_code == 200:
                result = response.json()
                resume_id = result.get('resume_id')
            
            if resume_id:
                # Check the processing status with the debug endpoint
                response = await client.post(
                    'http://localhost:8000/api/debug-resume',
                    json={'resume_id': resume_id},
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    result = response.json()
                    print(json.dumps(result, indent=2))
                    
                    # Check if chunks exist
                    chunks_count = result.get('debug_info', {}).get('chunks_count', 0)
                    if chunks_count > 0:
                        print(f"\nResume has {chunks_count} processed chunks - this means it was successfully processed")
                    else:
                        print("\nResume has no processed chunks - this suggests processing failed")
                        
                    # Check first chunk if available
                    first_chunk = result.get('debug_info', {}).get('first_chunk')
                    if first_chunk:
                        print("\nFirst chunk info:")
                        print(f"  Content sample: {first_chunk.get('content_sample')}")
                        print(f"  Embedding length: {first_chunk.get('embedding_length')}")
                else:
                    print(f"Error response: {response.text}")
        except Exception as e:
            print(f"Error checking processing status: {str(e)}")
        
        # Test the chat API
        try:
            print("\n== Testing Chat API ==")
            chat_response = await client.post(
                'http://localhost:8000/api/chat',
                json={
                    'content': 'What skills do I have?',
                    'context': 'job-seeker',
                    'resumeData': {
                        'id': resume_id,
                        'user_id': user_id
                    }
                },
                timeout=20.0
            )
            
            print(f"Chat API Status Code: {chat_response.status_code}")
            if chat_response.status_code == 200:
                chat_result = chat_response.json()
                print(f"Chat Response Type: {type(chat_result)}")
                print(f"Message: {chat_result.get('message', '')[:150]}...")
            else:
                print(f"Error response: {chat_response.text}")
        except Exception as e:
            print(f"Error testing chat API: {str(e)}")
        
        # Test the enhanced search API
        try:
            print("\n== Testing Enhanced Search API ==")
            enhanced_search_response = await client.post(
                'http://localhost:8000/api/enhanced-search',
                json={
                    'user_id': user_id,
                    'resume_id': resume_id,
                    'force_refresh': False
                },
                timeout=20.0
            )
            
            print(f"Enhanced Search API Status Code: {enhanced_search_response.status_code}")
            if enhanced_search_response.status_code == 200:
                search_result = enhanced_search_response.json()
                print(json.dumps(search_result, indent=2))
            else:
                print(f"Error response: {enhanced_search_response.text}")
        except Exception as e:
            print(f"Error testing enhanced search API: {str(e)}")

if __name__ == "__main__":
    asyncio.run(test_check_user_resume()) 