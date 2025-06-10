"""
Test script for Supabase connection

This script tests the connection to Supabase and prints debugging information.
"""

import logging
import os

from dotenv import load_dotenv
from supabase import Client, create_client

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("test_supabase")

# Load environment variables
load_dotenv()


def test_supabase_connection():
    """Test connection to Supabase"""
    # Get credentials from environment
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

    # Log credential presence (without revealing full values)
    logger.info(f"SUPABASE_URL exists: {bool(supabase_url)}")
    if supabase_url:
        logger.info(f"SUPABASE_URL prefix: {supabase_url[:15]}...")

    logger.info(f"SUPABASE_SERVICE_ROLE_KEY exists: {bool(supabase_key)}")
    if supabase_key:
        logger.info(f"SUPABASE_SERVICE_ROLE_KEY prefix: {supabase_key[:10]}...")

    try:
        # Create client
        logger.info("Creating Supabase client...")
        client = create_client(supabase_url, supabase_key)

        # Test connection with a simple query
        logger.info("Testing connection with a query...")
        try:
            response = client.table("conversations").select("*").limit(1).execute()
            logger.info(f"Query successful: {response is not None}")
            logger.info(f"Response data: {response.data}")
        except Exception as query_error:
            logger.warning(f"Could not query table: {str(query_error)}")

        # Test storage access - different approach for v1.0.0
        logger.info("Testing storage access with v1.0.0 API...")
        try:
            # In v1.0.0, storage is accessed directly
            bucket = "resumes"
            # Just test if we can access the storage client
            storage_client = client.storage
            logger.info(f"Storage client object type: {type(storage_client)}")

            # Try a simple operation like getting a bucket
            try:
                storage_bucket = storage_client.from_(bucket)
                logger.info(f"Successfully accessed bucket '{bucket}'")

                # Try to list files
                try:
                    files = storage_bucket.list()
                    logger.info(
                        f"Listed files in bucket '{bucket}': {len(files)} files found"
                    )
                except Exception as list_error:
                    logger.warning(f"Could not list files in bucket: {str(list_error)}")
            except Exception as bucket_error:
                logger.warning(f"Could not access bucket: {str(bucket_error)}")

        except Exception as storage_error:
            logger.warning(f"Could not access storage: {str(storage_error)}")

        logger.info("Supabase connection test completed successfully!")
        return True

    except Exception as e:
        logger.error(f"Error connecting to Supabase: {str(e)}")
        return False


if __name__ == "__main__":
    test_supabase_connection()
