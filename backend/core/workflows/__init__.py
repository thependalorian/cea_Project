"""
Workflow modules for Climate Economy Assistant

This package contains workflow definitions using LangGraph for
orchestrating LLM-powered workflows and agent systems.
"""

from core.workflows.conversation import ConversationWorkflow
from core.workflows.resume_workflow import (
    ResumeWorkflowState,
    resume_analysis_workflow,
    resume_processing_workflow,
)

# Export all workflow functions
__all__ = [
    "resume_processing_workflow",
    "resume_analysis_workflow",
    "ResumeWorkflowState",
    "ConversationWorkflow",
]
