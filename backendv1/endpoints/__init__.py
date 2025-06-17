"""
Endpoints Package for Climate Economy Assistant

This package contains all API endpoint routers and handlers.
Following rule #3: Component documentation explaining purpose and functionality
Following rule #4: Vercel compatibility for all endpoints
Following rule #16: Protect exposed endpoints with authentication

Location: backendv1/endpoints/__init__.py
"""

import os
import sys
import importlib.util
import logging

# Set up package-specific logging
logger = logging.getLogger("backendv1.endpoints")

# Add the parent directory to sys.path to enable absolute imports
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

# Safe imports with error handling
try:
    from backendv1.endpoints.auth import auth_router

    has_auth = True
except ImportError as e:
    logger.warning(f"Could not import auth router: {e}")
    has_auth = False

try:
    from backendv1.endpoints.chat_router import chat_router

    has_chat = True
except ImportError as e:
    logger.warning(f"Could not import chat router: {e}")
    has_chat = False

try:
    from backendv1.v1_aliases import v1_router

    has_v1_aliases = True
except ImportError as e:
    logger.warning(f"Could not import v1_aliases router: {e}")
    has_v1_aliases = False

try:
    from backendv1.endpoints.streaming_router import streaming_router

    has_streaming = True
except ImportError as e:
    logger.warning(f"Could not import streaming router: {e}")
    has_streaming = False

try:
    from backendv1.endpoints.admin_router import admin_router

    has_admin = True
except ImportError as e:
    logger.warning(f"Could not import admin router: {e}")
    has_admin = False

try:
    from backendv1.endpoints.careers_router import careers_router

    has_careers = True
except ImportError as e:
    logger.warning(f"Could not import careers router: {e}")
    has_careers = False

try:
    from backendv1.endpoints.resume_router import resume_router

    has_resume = True
except ImportError as e:
    logger.warning(f"Could not import resume router: {e}")
    has_resume = False

# Export list
__all__ = []

# Add router exports if available
if has_auth:
    __all__.append("auth_router")

if has_chat:
    __all__.append("chat_router")

if has_v1_aliases:
    __all__.append("v1_router")

if has_streaming:
    __all__.append("streaming_router")

if has_admin:
    __all__.append("admin_router")

if has_careers:
    __all__.append("careers_router")

if has_resume:
    __all__.append("resume_router")

# Package version
__version__ = "1.0.0"
