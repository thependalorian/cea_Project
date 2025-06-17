"""
Chat Package for Climate Economy Assistant

This package contains interactive chat functionality and conversation management.
Following rule #3: Component documentation explaining purpose and functionality
Following rule #6: Asynchronous data handling for real-time chat

Location: backendv1/chat/__init__.py
"""

import os
import sys
import importlib.util
import logging

# Set up package-specific logging
logger = logging.getLogger("backendv1.chat")

# Add the parent directory to sys.path to enable absolute imports
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

# Safe imports with error handling
try:
    from backendv1.chat.interactive_chat import (
        InteractiveChatHandler,
        ChatSession,
        create_chat_session,
        handle_chat_message,
        chat_graph,
    )

    has_interactive_chat = True
except ImportError as e:
    logger.warning(f"Could not import interactive_chat: {e}")
    has_interactive_chat = False

# Export list
__all__ = []

# Add interactive chat exports if available
if has_interactive_chat:
    __all__.extend(
        [
            "InteractiveChatHandler",
            "ChatSession",
            "create_chat_session",
            "handle_chat_message",
            "chat_graph",
        ]
    )

# Package version
__version__ = "1.0.0"
