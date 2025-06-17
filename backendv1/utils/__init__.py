"""Utility modules for the backendv1 package."""

from .graph_visualizer import visualize_graph, generate_all_workflow_visualizations
from .state_management import StateManager, ClimateAgentState
from .logger import setup_logger


def human_in_loop_available():
    """Check if human-in-the-loop functionality is available."""
    return True


def validate_input(data, schema=None):
    """Validate input data against schema."""
    if schema is None:
        return True
    # Basic validation - can be enhanced
    return isinstance(data, dict)


def sanitize_data(data):
    """Sanitize data for safe processing."""
    if isinstance(data, dict):
        return {k: str(v) for k, v in data.items()}
    return str(data)


class FlowController:
    """Basic flow controller for workflow management."""
    
    def __init__(self):
        self.current_flow = None
    
    def set_flow(self, flow_name):
        self.current_flow = flow_name
    
    def get_flow(self):
        return self.current_flow


__all__ = [
    "visualize_graph", 
    "generate_all_workflow_visualizations", 
    "human_in_loop_available",
    "setup_logger",
    "validate_input", 
    "sanitize_data",
    "StateManager",
    "ClimateAgentState",
    "FlowController"
]
