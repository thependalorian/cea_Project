"""
Authentication Package for Climate Economy Assistant

This package contains authentication utilities and role-based access control.
Following rule #3: Component documentation explaining purpose and functionality
Following rule #16: Protect exposed endpoints with authentication

Location: backendv1/auth/__init__.py
"""

import os
import sys
import importlib.util
import logging

# Set up package-specific logging
logger = logging.getLogger("backendv1.auth")

# Add the parent directory to sys.path to enable absolute imports
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

# Safe imports with error handling
try:
    from backendv1.auth.token_utils import (
        create_access_token,
        verify_token,
        decode_token,
        TokenData,
        get_current_user,
        get_current_active_user,
    )

    has_token_utils = True
except ImportError as e:
    logger.warning(f"Could not import token_utils: {e}")
    has_token_utils = False

try:
    from backendv1.auth.role_guard import (
        RoleGuard,
        require_role,
        check_permissions,
        UserRole,
        Permission,
    )

    has_role_guard = True
except ImportError as e:
    logger.warning(f"Could not import role_guard: {e}")
    has_role_guard = False

try:
    from backendv1.auth.models import UserProfile

    has_models = True
except ImportError as e:
    logger.warning(f"Could not import models: {e}")
    has_models = False

# Export list
__all__ = []

# Add token utils exports if available
if has_token_utils:
    __all__.extend(
        [
            "create_access_token",
            "verify_token",
            "decode_token",
            "TokenData",
            "get_current_user",
            "get_current_active_user",
        ]
    )

# Add role guard exports if available
if has_role_guard:
    __all__.extend(["RoleGuard", "require_role", "check_permissions", "UserRole", "Permission"])

# Add models exports if available
if has_models:
    __all__.extend(["UserProfile"])

# Package version
__version__ = "1.0.0"
