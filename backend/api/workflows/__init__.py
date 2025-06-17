"""
Workflows package for Climate Economy Assistant
Contains all workflow graphs and routing logic
"""

from .climate_supervisor_workflow import climate_supervisor_graph
from .climate_workflow import climate_graph
from .resume_workflow import resume_graph
from .career_workflow import career_graph

# Import empathy workflow from core.workflows since it's located there
from core.workflows.empathy_workflow import empathy_workflow
