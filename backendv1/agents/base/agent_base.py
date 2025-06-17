"""
Base Agent Class for Climate Economy Assistant

Following rule #2: Create new, modular UI components (agents in this case)
Following rule #3: Component documentation explaining purpose and functionality
Following rule #12: Complete code verification with error-free implementation

This class provides the foundation for all specialized agents in the system.
Location: backendv1/agents/base/agent_base.py
"""

import asyncio
import uuid
from abc import ABC, abstractmethod
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple
from dataclasses import dataclass, field

from backendv1.utils.logger import AgentLogger
from backendv1.config.settings import get_settings


@dataclass
class AgentContext:
    """
    Context information for agent operations
    Following rule #3: Component documentation for clear purpose
    """

    user_id: str
    conversation_id: str
    session_data: Dict[str, Any] = field(default_factory=dict)
    user_profile: Optional[Dict[str, Any]] = None
    conversation_history: List[Dict[str, Any]] = field(default_factory=list)
    tools_available: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class AgentResponse:
    """
    Standardized response format from all agents
    Following rule #12: Complete code verification with consistent interfaces
    """

    content: str
    specialist_type: str
    confidence_score: float = 0.0
    tools_used: List[str] = field(default_factory=list)
    next_actions: List[str] = field(default_factory=list)
    sources: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)
    success: bool = True
    error_message: Optional[str] = None
    processing_time_ms: Optional[float] = None


class AgentBase(ABC):
    """
    Abstract base class for all Climate Economy Assistant agents

    Following rule #2: Create modular components for easy maintenance
    Following rule #15: Include error checks and logging for all operations

    This class ensures consistent behavior across all specialized agents:
    - Lauren: Climate Career Specialist
    - Mai: Resume & Career Transition Specialist
    - Marcus: Veterans Specialist
    - Miguel: Environmental Justice Specialist
    - Liv: International Support Specialist
    - Jasmine: MA Resources Analyst
    - Alex: Empathy Specialist
    """

    def __init__(
        self,
        agent_name: str,
        agent_type: str,
        model_name: Optional[str] = None,
        temperature: Optional[float] = None,
    ):
        """
        Initialize base agent with common configuration

        Args:
            agent_name: Human-readable name (e.g., "Lauren", "Marcus")
            agent_type: Technical type (e.g., "climate_specialist", "veteran_specialist")
            model_name: AI model to use (defaults to settings)
            temperature: Model temperature (defaults to settings)
        """
        self.agent_name = agent_name
        self.agent_type = agent_type
        self.agent_id = str(uuid.uuid4())

        # Configuration
        self.settings = get_settings()
        self.model_name = model_name or self.settings.DEFAULT_AI_MODEL
        self.temperature = temperature or self.settings.AGENT_TEMPERATURE
        self.max_tokens = self.settings.AGENT_MAX_TOKENS

        # Logging
        self.logger = AgentLogger(agent_name)

        # Performance tracking
        self.interaction_count = 0
        self.total_processing_time = 0.0
        self.error_count = 0

        # Initialization
        self._initialize_agent()

    def _initialize_agent(self):
        """Initialize agent-specific configuration"""
        try:
            # Load agent-specific prompts and configuration
            self._load_prompts()
            self._load_tools()
            self._setup_capabilities()

            self.logger.logger.info(f"✅ {self.agent_name} agent initialized successfully")

        except Exception as e:
            self.logger.log_error(e, {"phase": "initialization"})
            raise

    @abstractmethod
    def _load_prompts(self):
        """Load agent-specific prompts and templates"""
        pass

    @abstractmethod
    def _load_tools(self):
        """Load and configure agent-specific tools"""
        pass

    @abstractmethod
    def _setup_capabilities(self):
        """Set up agent-specific capabilities and configurations"""
        pass

    @abstractmethod
    async def process_message(self, message: str, context: AgentContext) -> AgentResponse:
        """
        Process a user message and generate a response

        This is the main method that each agent must implement.
        Following rule #6: Asynchronous data handling for performance

        Args:
            message: User's message
            context: Conversation context and user information

        Returns:
            AgentResponse: Standardized agent response
        """
        pass

    async def handle_interaction(
        self,
        message: str,
        user_id: str,
        conversation_id: str,
        session_data: Optional[Dict[str, Any]] = None,
        user_profile: Optional[Dict[str, Any]] = None,
    ) -> AgentResponse:
        """
        Main entry point for agent interactions

        Following rule #15: Include comprehensive error handling
        Following rule #6: Asynchronous operations for performance

        Args:
            message: User's message
            user_id: User identifier
            conversation_id: Conversation identifier
            session_data: Session-specific data
            user_profile: User profile information

        Returns:
            AgentResponse: Processed response from the agent
        """
        start_time = datetime.utcnow()

        try:
            # Create context
            context = AgentContext(
                user_id=user_id,
                conversation_id=conversation_id,
                session_data=session_data or {},
                user_profile=user_profile,
                tools_available=self.get_available_tools(),
            )

            # Validate input
            if not message or not message.strip():
                raise ValueError("Message cannot be empty")

            # Process the message
            response = await self.process_message(message, context)

            # Calculate processing time
            processing_time = (datetime.utcnow() - start_time).total_seconds() * 1000
            response.processing_time_ms = processing_time

            # Update performance metrics
            self.interaction_count += 1
            self.total_processing_time += processing_time

            # Log interaction
            self.logger.log_interaction(
                user_id=user_id,
                conversation_id=conversation_id,
                message=message,
                response=response.content,
                tools_used=response.tools_used,
                confidence_score=response.confidence_score,
            )

            return response

        except Exception as e:
            # Handle and log errors
            self.error_count += 1
            self.logger.log_error(
                e,
                {
                    "user_id": user_id,
                    "conversation_id": conversation_id,
                    "message_length": len(message) if message else 0,
                },
            )

            # Return error response
            return AgentResponse(
                content=f"I apologize, but I encountered an error while processing your request. Please try again or rephrase your question.",
                specialist_type=self.agent_type,
                success=False,
                error_message=str(e),
                processing_time_ms=(datetime.utcnow() - start_time).total_seconds() * 1000,
            )

    def get_available_tools(self) -> List[str]:
        """
        Get list of tools available to this agent

        Returns:
            List[str]: Available tool names
        """
        # Override in subclasses to specify agent-specific tools
        return []

    def get_agent_info(self) -> Dict[str, Any]:
        """
        Get agent information and statistics

        Returns:
            Dict[str, Any]: Agent information
        """
        return {
            "agent_name": self.agent_name,
            "agent_type": self.agent_type,
            "agent_id": self.agent_id,
            "model_name": self.model_name,
            "interaction_count": self.interaction_count,
            "average_processing_time_ms": (
                self.total_processing_time / self.interaction_count
                if self.interaction_count > 0
                else 0
            ),
            "error_rate": (
                self.error_count / self.interaction_count if self.interaction_count > 0 else 0
            ),
            "available_tools": self.get_available_tools(),
        }

    async def validate_context(self, context: AgentContext) -> bool:
        """
        Validate the agent context

        Following rule #15: Input validation and error checking

        Args:
            context: Agent context to validate

        Returns:
            bool: True if context is valid
        """
        try:
            # Basic validation
            if not context.user_id or not context.conversation_id:
                return False

            # Agent-specific validation can be implemented in subclasses
            return await self._validate_agent_context(context)

        except Exception as e:
            self.logger.log_error(e, {"validation_phase": "context"})
            return False

    async def _validate_agent_context(self, context: AgentContext) -> bool:
        """
        Agent-specific context validation
        Override in subclasses for custom validation

        Args:
            context: Agent context

        Returns:
            bool: True if valid
        """
        return True

    def __str__(self) -> str:
        """String representation of the agent"""
        return f"{self.agent_name} ({self.agent_type})"

    def __repr__(self) -> str:
        """Detailed string representation"""
        return (
            f"AgentBase(name='{self.agent_name}', type='{self.agent_type}', id='{self.agent_id}')"
        )


# Export for use by specialized agents
__all__ = ["AgentBase", "AgentContext", "AgentResponse"]
