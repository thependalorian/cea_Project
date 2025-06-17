"""
Adapters Package for Climate Economy Assistant

This package contains external service integrations and adapters.
Following rule #3: Component documentation explaining purpose and functionality
Following rule #8: Use Supabase with SSR for secure data access
Following rule #17: Secure database access with best practices

External service integrations:
- Supabase: Database operations and authentication
- OpenAI: AI model integrations
- Redis: Caching and session storage
- Auth: Authentication and authorization
- Storage: File and document management
- Database: Core database operations

Location: backendv1/adapters/__init__.py
"""

import os
import sys
import importlib.util
import logging

# Set up package-specific logging
logger = logging.getLogger("backendv1.adapters")

# Add the parent directory to sys.path to enable absolute imports
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

# Safe imports with error handling
try:
    from backendv1.adapters.supabase_adapter import SupabaseAdapter

    has_supabase = True
except ImportError as e:
    logger.warning(f"Could not import SupabaseAdapter: {e}")
    has_supabase = False

try:
    from backendv1.adapters.openai_adapter import OpenAIAdapter

    has_openai = True
except ImportError as e:
    logger.warning(f"Could not import OpenAIAdapter: {e}")
    has_openai = False

try:
    from backendv1.adapters.redis_adapter import RedisAdapter

    has_redis = True
except ImportError as e:
    logger.warning(f"Could not import RedisAdapter: {e}")
    has_redis = False

try:
    from backendv1.adapters.auth_adapter import AuthAdapter

    has_auth = True
except ImportError as e:
    logger.warning(f"Could not import AuthAdapter: {e}")
    has_auth = False

try:
    from backendv1.adapters.storage_adapter import StorageAdapter

    has_storage = True
except ImportError as e:
    logger.warning(f"Could not import StorageAdapter: {e}")
    has_storage = False

try:
    from backendv1.adapters.database_adapter import DatabaseAdapter

    has_database = True
except ImportError as e:
    logger.warning(f"Could not import DatabaseAdapter: {e}")
    has_database = False

try:
    from backendv1.adapters.database_utils import (
        get_database_connection,
        execute_query,
        fetch_one,
        fetch_all,
    )

    has_database_utils = True
except ImportError as e:
    logger.warning(f"Could not import database_utils: {e}")
    has_database_utils = False

# Export list
__all__ = []

# Add adapter exports if available
if has_supabase:
    __all__.append("SupabaseAdapter")

if has_openai:
    __all__.append("OpenAIAdapter")

if has_redis:
    __all__.append("RedisAdapter")

if has_auth:
    __all__.append("AuthAdapter")

if has_storage:
    __all__.append("StorageAdapter")

if has_database:
    __all__.append("DatabaseAdapter")

# Add database utils exports if available
if has_database_utils:
    __all__.extend(["get_database_connection", "execute_query", "fetch_one", "fetch_all"])

# Package version
__version__ = "1.0.0"
