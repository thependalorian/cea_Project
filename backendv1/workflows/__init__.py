"""
Workflows Package - Climate Economy Assistant Workflows

Following rule #12: Complete code verification with proper workflow organization
Following rule #3: Component documentation explaining purpose and functionality

This package contains all workflow orchestration modules for the Climate Economy Assistant.
Location: backendv1/workflows/__init__.py
"""

import os
import sys
import importlib.util
import logging

# Set up package-specific logging
logger = logging.getLogger("backendv1.workflows")

# Add the parent directory to sys.path to enable absolute imports
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
project_root = os.path.dirname(parent_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

# Initialize module mapping dict
workflow_modules = {}


# Import modules with robust error handling
def _safe_import(module_name):
    """Safely import a module and handle any import errors."""
    try:
        module = importlib.import_module(f"backendv1.workflows.{module_name}")
        workflow_modules[module_name] = module
        return module
    except ImportError as e:
        logger.warning(f"Could not import workflow module {module_name}: {e}")
        return None


# Try to import all workflow modules
pendo_supervisor = _safe_import("pendo_supervisor")
climate_supervisor = _safe_import("climate_supervisor")
auth_workflow = _safe_import("auth_workflow")
empathy_workflow = _safe_import("empathy_workflow")
human_steering = _safe_import("human_steering")  # Add the new human steering module
hitl = _safe_import("hitl")  # Add the HITL alias module


# Define common functions for workflow creation
def create_workflow(name):
    """
    Factory function to create workflow instances.

    Args:
        name: Name of the workflow to create

    Returns:
        The workflow instance or None if not available
    """
    module = workflow_modules.get(name)
    if not module:
        logger.warning(f"Workflow module '{name}' not found")
        return None

    create_func_name = f"create_{name}_workflow"
    create_func = getattr(module, create_func_name, None)
    if create_func:
        try:
            return create_func()
        except Exception as e:
            logger.error(f"Error creating workflow {name}: {e}")
            return None
    else:
        logger.warning(f"Creation function '{create_func_name}' not found in module {name}")
        return None


# Export key elements
__all__ = [
    # Modules
    "pendo_supervisor",
    "climate_supervisor",
    "auth_workflow",
    "resume_analysis",
    "job_recommendation",
    "empathy_workflow",
    "human_steering",
    "hitl",
    # Helper functions
    "create_workflow",
]
