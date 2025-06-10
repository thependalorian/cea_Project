"""
Test settings class for Climate Economy Assistant backend

This script tests loading environment variables using the Settings class
to ensure proper configuration.
"""

import json

from core.config import get_settings

# Get settings instance
settings = get_settings()

# Define variables to check
SETTINGS_VARS = [
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
for var in SETTINGS_VARS:
    value = getattr(settings, var, None)
    results[var] = {
        "exists": value is not None and value != "",
        "length": len(value) if value else 0,
    }

# Print results
print("Settings Class Test Results:")
print(json.dumps(results, indent=2))

# Print direct values
print("\nDirect Settings Values:")
for var in SETTINGS_VARS:
    value = getattr(settings, var, None)
    masked_value = f"{value[:5]}...{value[-5:]}" if value and len(value) > 10 else value
    print(f"{var}: {masked_value}")

print("\nAll tests completed.")
