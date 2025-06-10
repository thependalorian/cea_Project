"""
Agent module for Climate Economy Assistant

This module provides agent classes for various specializations:
- International professionals
- Veterans
- Environmental justice communities
- Tool specialists

Each agent provides domain-specific assistance for climate economy careers.
"""

from core.agents.base import BaseAgent
from core.agents.environmental import EnvironmentalJusticeSpecialist
from core.agents.international import InternationalSpecialist

# Export LangGraph-based implementations
from core.agents.langgraph_agents import (
    AgentState,
    add_human_input,
    create_agent_graph,
    should_escalate_to_human,
)
from core.agents.tool import ToolSpecialist
from core.agents.veteran import VeteranSpecialist
from core.agents.workflow import create_agent_workflow

__all__ = [
    "BaseAgent",
    "InternationalSpecialist",
    "VeteranSpecialist",
    "EnvironmentalJusticeSpecialist",
    "ToolSpecialist",
    "create_agent_workflow",
    # LangGraph exports
    "create_agent_graph",
    "AgentState",
    "add_human_input",
    "should_escalate_to_human",
]
