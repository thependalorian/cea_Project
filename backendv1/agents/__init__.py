"""
Climate Economy Assistant Agents Package

Specialized AI agents for climate economy career guidance:
- Pendo: Supervisor & Climate Economy Coordinator
- Lauren: Climate Career Specialist
- Mai: Resume & Career Transition Specialist
- Marcus: Veterans Specialist
- Miguel: Environmental Justice Specialist
- Liv: International Support Specialist
- Jasmine: Youth & Early Career Specialist
- Alex: Empathy Specialist
"""

from backendv1.agents.base import AgentBase, IntelligenceCoordinator
from backendv1.agents.pendo import PendoAgent
from backendv1.agents.lauren import LaurenAgent
from backendv1.agents.mai import MaiAgent
from backendv1.agents.marcus import MarcusAgent
from backendv1.agents.miguel import MiguelAgent
from backendv1.agents.liv import LivAgent
from backendv1.agents.jasmine import JasmineAgent
from backendv1.agents.alex import AlexAgent

__all__ = [
    "AgentBase",
    "IntelligenceCoordinator",
    "PendoAgent",
    "LaurenAgent",
    "MaiAgent",
    "MarcusAgent",
    "MiguelAgent",
    "LivAgent",
    "JasmineAgent",
    "AlexAgent",
]
