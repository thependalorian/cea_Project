import logging

"""
Concrete agent implementations following the cea2.py pattern.
All agents are functions that take state and return Command objects.
"""

# Original agents following cea2.py pattern
from .pendo import PendoAgent
from .marcus import MarcusAgent
from .lauren import LaurenAgent
from .miguel import MiguelAgent
from .mai import MaiAgent
from .alex import AlexAgent
from .liv import LivAgent
from .jasmine import JasmineAgent

# Veterans Team agents
from .james import JamesAgent
from .sarah import SarahAgent
from .david import DavidAgent

# Environmental Justice Team agents
from .maria import MariaAgent
from .andre import AndreAgent
from .carmen import CarmenAgent

# International Team agents
from .mei import MeiAgent
from .raj import RajAgent
from .sofia import SofiaAgent

# Support Team agents
from .michael import MichaelAgent
from .elena import ElenaAgent
from .thomas import ThomasAgent

__all__ = [
    # Specialists Team (4 agents)
    "PendoAgent",
    "LaurenAgent",
    "AlexAgent",
    "JasmineAgent",
    # Veterans Team (4 agents)
    "MarcusAgent",
    "JamesAgent",
    "SarahAgent",
    "DavidAgent",
    # Environmental Justice Team (4 agents)
    "MiguelAgent",
    "MariaAgent",
    "AndreAgent",
    "CarmenAgent",
    # International Team (4 agents)
    "LivAgent",
    "MeiAgent",
    "RajAgent",
    "SofiaAgent",
    # Support Team (4 agents)
    "MaiAgent",
    "MichaelAgent",
    "ElenaAgent",
    "ThomasAgent",
]
