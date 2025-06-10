"""
Test environment variables loading for Climate Economy Assistant backend

This script tests loading environment variables directly from the .env file
without using the settings class.
"""

import json
import os

from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Define variables to check
ENV_VARS = [
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASE_ANON_KEY",
    "OPENAI_API_KEY",
    "TAVILY_API_KEY",
    "APP_URL",
    "REDIS_HOST",
    "REDIS_PORT",
    "REDIS_USERNAME",
    "REDIS_PASSWORD",
]

# Check if each variable is set
results = {}
for var in ENV_VARS:
    value = os.getenv(var)
    results[var] = {"exists": value is not None, "length": len(value) if value else 0}

# Print results
print("Environment Variables Test Results:")
print(json.dumps(results, indent=2))

# Print direct values
print("\nDirect Environment Variable Values:")
for var in ENV_VARS:
    value = os.getenv(var)
    masked_value = (
        f"{value[:5]}...{value[-5:]}"
        if value and len(value) > 10
        else "(empty or too short)"
    )
    print(f"{var}: {masked_value}")

print("\nAll tests completed.")
