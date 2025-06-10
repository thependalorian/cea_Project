"""
Test script for Supabase storage using storage3 directly

This script tests the connection to Supabase storage.
"""

import logging
import os

from dotenv import load_dotenv
from storage3 import create_client

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("test_storage")

# Load environment variables
load_dotenv()


def test_storage_connection():
    """Test connection to Supabase storage"""
    # Get credentials from environment
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

    # Construct storage URL
    storage_url = f"{supabase_url}/storage/v1"

    # Set up headers
    headers = {"apiKey": supabase_key, "Authorization": f"Bearer {supabase_key}"}

    logger.info(f"Creating storage client with URL: {storage_url[:30]}...")

    try:
        # Create storage client directly
        storage_client = create_client(storage_url, headers, is_async=False)
        logger.info(f"Storage client created: {type(storage_client)}")

        # Try to list buckets
        try:
            buckets = storage_client.list_buckets()
            logger.info(f"Listed buckets: {buckets}")

            if buckets:
                # Try to access the first bucket
                bucket_name = buckets[0]["name"]
                logger.info(f"Accessing bucket: {bucket_name}")

                # Try to list files in bucket
                try:
                    files = storage_client.from_(bucket_name).list()
                    logger.info(f"Files in bucket {bucket_name}: {files}")
                except Exception as list_error:
                    logger.warning(f"Error listing files: {str(list_error)}")
            else:
                logger.warning("No buckets found")

        except Exception as bucket_error:
            logger.warning(f"Error listing buckets: {str(bucket_error)}")

        logger.info("Storage test completed")
        return True

    except Exception as e:
        logger.error(f"Error creating storage client: {str(e)}")
        return False


if __name__ == "__main__":
    test_storage_connection()
