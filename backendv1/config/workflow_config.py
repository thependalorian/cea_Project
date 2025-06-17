"""
Workflow Configuration Management

Following rule #12: Complete code verification with proper workflow configuration
Following rule #15: Include comprehensive error handling for workflow settings

This module manages LangGraph workflow configurations and orchestration settings.
Location: backendv1/config/workflow_config.py
"""

from typing import Dict, Any, List, Optional
from dataclasses import dataclass, field
from enum import Enum

from backendv1.config.settings import get_settings

settings = get_settings()


class WorkflowType(str, Enum):
    """Workflow type enumeration"""

    CLIMATE_SUPERVISOR = "climate_supervisor"
    AGENT_SPECIALIST = "agent_specialist"
    EMPATHY_ROUTING = "empathy_routing"
    QUALITY_ASSESSMENT = "quality_assessment"


@dataclass
class WorkflowConfig:
    """
    Workflow configuration class for LangGraph orchestration

    Following rule #12: Complete code verification with proper typing
    """

    # Core Configuration
    workflow_name: str
    workflow_type: WorkflowType
    max_steps: int = 25
    timeout_seconds: int = 300

    # Flow Control
    max_specialist_recursion: int = 8
    empathy_max_attempts: int = 3
    confidence_check_limit: int = 5
    circuit_breaker_threshold: int = 5

    # State Management
    enable_state_persistence: bool = True
    enable_conversation_memory: bool = True
    enable_user_profile_tracking: bool = True

    # Routing Configuration
    default_specialist: str = "lauren"
    routing_confidence_threshold: float = 0.6
    enable_confidence_routing: bool = True
    enable_empathy_routing: bool = True

    # Quality Assurance
    enable_quality_checks: bool = True
    quality_threshold: float = 0.7
    enable_response_enhancement: bool = True

    # Performance Settings
    enable_streaming: bool = True
    enable_parallel_processing: bool = True
    enable_caching: bool = True

    # Error Handling
    enable_circuit_breaker: bool = True
    enable_error_recovery: bool = True
    enable_human_escalation: bool = True

    # Monitoring
    enable_metrics_tracking: bool = True
    enable_performance_logging: bool = True
    enable_conversation_analytics: bool = True

    # Metadata
    version: str = "1.0.0"
    created_at: str = ""
    updated_at: str = ""


# Default workflow configurations
DEFAULT_WORKFLOW_CONFIGS = {
    WorkflowType.CLIMATE_SUPERVISOR: WorkflowConfig(
        workflow_name="Climate Supervisor Workflow",
        workflow_type=WorkflowType.CLIMATE_SUPERVISOR,
        max_steps=25,
        timeout_seconds=300,
        max_specialist_recursion=8,
        enable_quality_checks=True,
        enable_streaming=True,
    ),
    WorkflowType.AGENT_SPECIALIST: WorkflowConfig(
        workflow_name="Agent Specialist Workflow",
        workflow_type=WorkflowType.AGENT_SPECIALIST,
        max_steps=10,
        timeout_seconds=120,
        max_specialist_recursion=3,
        enable_quality_checks=True,
        enable_response_enhancement=True,
    ),
    WorkflowType.EMPATHY_ROUTING: WorkflowConfig(
        workflow_name="Empathy Routing Workflow",
        workflow_type=WorkflowType.EMPATHY_ROUTING,
        max_steps=5,
        timeout_seconds=60,
        empathy_max_attempts=3,
        enable_empathy_routing=True,
        enable_human_escalation=True,
    ),
    WorkflowType.QUALITY_ASSESSMENT: WorkflowConfig(
        workflow_name="Quality Assessment Workflow",
        workflow_type=WorkflowType.QUALITY_ASSESSMENT,
        max_steps=3,
        timeout_seconds=30,
        enable_quality_checks=True,
        quality_threshold=0.8,
        enable_response_enhancement=True,
    ),
}


def get_workflow_config(workflow_type: WorkflowType) -> WorkflowConfig:
    """
    Get configuration for a specific workflow type

    Args:
        workflow_type: Type of workflow to configure

    Returns:
        WorkflowConfig: Workflow configuration
    """
    return DEFAULT_WORKFLOW_CONFIGS.get(
        workflow_type, DEFAULT_WORKFLOW_CONFIGS[WorkflowType.CLIMATE_SUPERVISOR]
    )


def get_all_workflow_configs() -> Dict[WorkflowType, WorkflowConfig]:
    """
    Get all workflow configurations

    Returns:
        Dict[WorkflowType, WorkflowConfig]: All workflow configurations
    """
    return DEFAULT_WORKFLOW_CONFIGS.copy()


def create_custom_workflow_config(
    workflow_name: str, workflow_type: WorkflowType, **kwargs
) -> WorkflowConfig:
    """
    Create a custom workflow configuration

    Args:
        workflow_name: Name of the workflow
        workflow_type: Type of workflow
        **kwargs: Additional configuration parameters

    Returns:
        WorkflowConfig: Custom workflow configuration
    """
    base_config = get_workflow_config(workflow_type)

    # Update with custom parameters
    config_dict = {"workflow_name": workflow_name, "workflow_type": workflow_type, **kwargs}

    # Create new config with updated values
    return WorkflowConfig(**{**base_config.__dict__, **config_dict})


# Export main classes and functions
__all__ = [
    "WorkflowType",
    "WorkflowConfig",
    "AgentWorkflowSettings",
    "get_workflow_config",
    "get_all_workflow_configs",
    "create_custom_workflow_config",
    "DEFAULT_WORKFLOW_CONFIGS",
]

# Alias for backward compatibility
AgentWorkflowSettings = WorkflowConfig
