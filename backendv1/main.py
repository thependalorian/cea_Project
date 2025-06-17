"""
Climate Economy Assistant V1 - Main Entry Point
OPTIMIZED: Now imports from lean core/app.py (was 172 lines, now 15 lines = 91% reduction)

Following Roger Martin's "Play to Win" optimization strategy.
"""

from backendv1.core.app import app, create_app, cea_app_v1

# Export all required symbols for compatibility
__all__ = ["app", "create_app", "cea_app_v1"]

# This replaces 172 lines of redundant code with lean import-based architecture
