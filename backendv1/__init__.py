"""
Enhanced Backend V1 Module
==========================

This module provides a comprehensive backend system for the Climate Economy Assistant,
featuring:

- Multi-agent orchestration with specialized climate career agents
- Advanced authentication and authorization
- Database adapters and utilities
- Workflow management and human-in-the-loop coordination
- Real-time chat and conversation management

Location: backendv1/__init__.py
"""

# Core dependencies are imported on-demand to avoid circular imports
# and improve startup performance

# Version information
__version__ = "1.0.0"
__author__ = "Climate Economy Assistant Team"
__description__ = "Enhanced backend system for climate career guidance"

# Main exports - these are the primary interfaces for the backend
__all__ = [
    # Core modules
    "agents",
    "adapters", 
    "workflows",
    "tools",
    "utils",
    "auth",
    "models",
    "endpoints",
    # Configuration
    "config",
    "settings",
    # Version info
    "__version__",
    "__author__",
    "__description__"
]

# Lazy imports to prevent circular dependencies
def get_database_adapter():
    """Get database adapter instance"""
    from backendv1.adapters import DatabaseAdapter
    return DatabaseAdapter()

def get_auth_adapter():
    """Get authentication adapter instance"""  
    from backendv1.adapters import AuthAdapter
    return AuthAdapter()

def get_openai_adapter():
    """Get OpenAI adapter instance"""
    from backendv1.adapters import OpenAIAdapter
    return OpenAIAdapter()

# Lazy model imports
def get_models():
    """Get model classes"""
    try:
        from backendv1.models import (
            UserModel,
            AgentResponse, 
            ConversationModel,
            ResumeModel,
            EmpathyAssessment
        )
        return {
            "UserModel": UserModel,
            "AgentResponse": AgentResponse,
            "ConversationModel": ConversationModel, 
            "ResumeModel": ResumeModel,
            "EmpathyAssessment": EmpathyAssessment
        }
    except ImportError as e:
        print(f"Warning: Could not import models: {e}")
        return {}

# Lazy agent imports  
def get_agents():
    """Get agent management functions"""
    try:
        from backendv1.agents import (
            load_agent,
            get_agent_by_name
        )
        return {
            "load_agent": load_agent,
            "get_agent_by_name": get_agent_by_name
        }
    except ImportError as e:
        print(f"Warning: Could not import agents: {e}")
        return {}

# Initialize logging
def setup_logging():
    """Setup logging configuration for the backend"""
    import logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    return logging.getLogger(__name__)

logger = setup_logging()
logger.info("✅ Backend V1 module initialized successfully")
