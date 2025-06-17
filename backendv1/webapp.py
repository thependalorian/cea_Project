"""
Climate Economy Assistant V1 - WebApp Interface
OPTIMIZED: Was 628 lines, now imports from lean core/app.py (95% reduction)

This maintains LangGraph compatibility while using our optimized architecture.
"""

from backendv1.core.app import app

# Export for LangGraph Studio compatibility
__all__ = ["app"]

# LangGraph Studio expects 'app' to be available at module level
# Our lean architecture provides this through core/app.py 