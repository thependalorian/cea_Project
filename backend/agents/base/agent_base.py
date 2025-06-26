"""
Base agent classes and types for the Climate Economy Assistant.

AgenticAgent Base Class
----------------------
Location: backend/agents/base/agent_base.py

Purpose:
- Provides a foundation for agentic behavior: reasoning, planning, dynamic tool use, and memory.
- Integrates with LangChain for multi-step reasoning and tool invocation.
- Designed for subclassing by specific agent implementations (e.g., Pendo, Alex).

Usage:
- Subclass AgenticAgent in your agent implementation.
- Register tools and provide an LLM instance.
- Call `run(input, context)` to execute agentic reasoning.
"""

from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field
from langgraph.graph import StateGraph, END
from langchain_core.messages import BaseMessage
import structlog
from datetime import datetime
from langchain.agents import initialize_agent, Tool
from langchain.memory import ConversationBufferMemory

logger = structlog.get_logger()


class AgentResponse(BaseModel):
    """Response model for agent operations"""

    success: bool = Field(default=True)
    message: str = Field(default="")
    data: Optional[Dict[str, Any]] = Field(default=None)
    error: Optional[str] = Field(default=None)
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class AgentState(BaseModel):
    """Base state model for all agents"""

    messages: List[BaseMessage] = Field(default_factory=list)
    current_agent: str = Field(default="")
    next_agent: Optional[str] = Field(default=None)
    memory: Dict[str, Any] = Field(default_factory=dict)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class BaseAgent:
    """Base agent class with common functionality"""

    def __init__(
        self,
        name: str,
        description: str,
        intelligence_level: float = 8.5,
        tools: Optional[List[str]] = None,
    ):
        self.name = name
        self.description = description
        self.intelligence_level = intelligence_level
        self.tools = tools or []
        self.logger = logger.bind(agent=name)

    async def initialize(self) -> None:
        """Initialize agent resources"""
        self.logger.info("initializing_agent", tools=len(self.tools))
        # Initialize tools, memory, etc.

    async def process(self, state: AgentState) -> AgentState:
        """Process the current state and return updated state"""
        raise NotImplementedError("Agents must implement process method")

    async def cleanup(self) -> None:
        """Cleanup agent resources"""
        self.logger.info("cleaning_up_agent")
        # Cleanup resources

    def build_graph(self) -> StateGraph:
        """Build the agent's workflow graph"""
        # Create graph builder
        builder = StateGraph(AgentState)

        # Add nodes
        builder.add_node("process", self.process)

        # Set entry point
        builder.set_entry_point("process")

        # Add edge to END
        builder.add_edge("process", END)

        return builder.compile()

    async def handle_error(self, error: Exception, state: AgentState) -> AgentState:
        """Handle errors during processing"""
        self.logger.error("agent_error", error=str(error), state=state.dict())

        # Update state with error information
        state.metadata["error"] = {
            "message": str(error),
            "timestamp": datetime.utcnow().isoformat(),
        }

        return state

    def get_capabilities(self) -> Dict[str, Any]:
        """Get agent capabilities"""
        return {
            "name": self.name,
            "description": self.description,
            "intelligence_level": self.intelligence_level,
            "tools": self.tools,
            "capabilities": {
                "streaming": True,
                "memory": True,
                "tool_use": bool(self.tools),
            },
        }

    async def validate_tools(self) -> bool:
        """Validate that all required tools are available"""
        for tool in self.tools:
            if not await self._check_tool_availability(tool):
                self.logger.error("tool_not_available", tool=tool)
                return False
        return True

    async def _check_tool_availability(self, tool: str) -> bool:
        """Check if a specific tool is available"""
        # Implement tool availability check
        return True  # Placeholder


class AgenticAgent:
    def __init__(
        self, name: str, tools: List[Tool], llm: Any, memory: Optional[Any] = None
    ):
        self.name = name
        self.tools = tools
        self.llm = llm
        self.memory = memory or ConversationBufferMemory()
        self.agent = initialize_agent(
            tools=self.tools,
            llm=self.llm,
            memory=self.memory,
            agent_type="zero-shot-react-description",
        )

    def run(self, input: str, context: Optional[Dict[str, Any]] = None) -> Any:
        """
        Executes the agent's reasoning loop.
        - input: User message or task description
        - context: Optional dict for additional context
        Returns: Agent's response (may include tool use, reasoning trace, etc.)
        """
        # Optionally, context can be injected into memory or prompt
        return self.agent.run(input)
