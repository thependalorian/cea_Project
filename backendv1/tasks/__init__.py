"""
Tasks Package for Climate Economy Assistant

This package contains background tasks and scheduled operations.
Following rule #3: Component documentation explaining purpose and functionality
Following rule #6: Asynchronous data handling for background operations

Location: backendv1/tasks/__init__.py
"""

import os
import sys
import importlib.util
import logging

# Set up package-specific logging
logger = logging.getLogger("backendv1.tasks")

# Add the parent directory to sys.path to enable absolute imports
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

# Safe imports with error handling
try:
    from backendv1.tasks.profile_sync import (
        sync_user_profile,
        sync_all_profiles,
        ProfileSyncTask,
        schedule_profile_sync,
    )

    has_profile_sync = True
except ImportError as e:
    logger.warning(f"Could not import profile_sync: {e}")
    has_profile_sync = False

# Export list
__all__ = []

# Add profile sync exports if available
if has_profile_sync:
    __all__.extend(
        ["sync_user_profile", "sync_all_profiles", "ProfileSyncTask", "schedule_profile_sync"]
    )

# Package version
__version__ = "1.0.0"
