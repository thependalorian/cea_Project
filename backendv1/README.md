# Climate Economy Assistant - Human-in-the-Loop Integration

## Overview

This document describes the integration of modern human-in-the-loop (HITL) functionality in the Climate Economy Assistant system. The implementation follows the 2025 LangGraph standards for agent-driven interrupts and human-AI collaboration.

## Key Features

- **Agent-Driven Interrupts**: Uses conditional logic to determine when human intervention is needed, rather than static breakpoints
- **Priority-Based Routing**: Categorizes HITL requests by priority level (LOW, MEDIUM, HIGH, URGENT)
- **Multi-Factor Evaluation**: Determines need for human review based on response quality, routing confidence, handoff frequency, and more
- **Streaming Support**: Integrates with the streaming API to provide real-time updates during human review processes
- **Flexible Review Options**: Provides configurable review options based on the specific intervention type
- **Rate Limiting**: Prevents excessive interruptions by tracking and limiting intervention frequency

## Implementation

The human-in-the-loop functionality is implemented through several components:

### 1. Human-in-the-Loop Coordinator

Located in `utils/human_in_the_loop.py`, the `HumanInTheLoopCoordinator` class provides the core functionality:

```python
class HumanInTheLoopCoordinator:
    # Evaluates when human intervention is needed
    async def evaluate_human_intervention_need(self, state, quality_metrics, routing_decision)
    
    # Creates structured review requests for interrupt()
    async def create_human_review_request(self, state, intervention_evaluation)
    
    # Processes human decisions and updates state
    async def process_human_decision(self, state, human_decision)
```

### 2. LangGraph Integration

The implementation uses LangGraph's modern `interrupt()` function to pause workflow execution when human input is needed:

```python
# Create human review request
human_review_request = await human_loop_coordinator.create_human_review_request(
    state=initial_state,
    intervention_evaluation=human_intervention_evaluation
)

# Pause for human input
human_decision = interrupt(human_review_request)

# Process human decision
human_updates = await human_loop_coordinator.process_human_decision(
    state=initial_state,
    human_decision=human_decision
)
```

### 3. Configuration Options

Human-in-the-loop functionality can be configured through settings in `config/settings.py`:

- `enable_human_interrupts`: Enables/disables human interrupt functionality
- `human_interrupt_timeout`: Maximum time to wait for human input (seconds)
- `human_intervention_quality_threshold`: Minimum quality score required to bypass human review
- `human_intervention_confidence_threshold`: Minimum routing confidence required to bypass human review
- `crisis_escalation_email`: Email address for urgent human escalations

## Intervention Types

The system supports various types of human intervention:

1. **QUALITY_CHECK**: Review the quality of AI-generated responses
2. **ROUTING_VALIDATION**: Validate agent routing decisions
3. **GOAL_CONFIRMATION**: Confirm or modify user goals
4. **PATHWAY_SELECTION**: Help select career pathways
5. **ACTION_PLAN_APPROVAL**: Review and approve action plans
6. **CRISIS_INTERVENTION**: Handle emergency support situations
7. **ERROR_RECOVERY**: Fix technical issues
8. **SPECIALIST_CONFLICT**: Resolve routing conflicts between specialists

## Priority Levels

Interventions are categorized by priority:

1. **LOW**: Continue with AI workflow, optionally flag for later review
2. **MEDIUM**: Optional asynchronous human review
3. **HIGH**: Pause for human review before proceeding
4. **URGENT**: Immediate human escalation with contact information

## Usage Example

```python
# Evaluate if human intervention is needed
human_intervention_evaluation = await human_loop_coordinator.evaluate_human_intervention_need(
    state=state,
    quality_metrics=quality_metrics,
    routing_decision=routing_decision
)

# Check if human intervention is needed
if human_intervention_evaluation["needs_human_intervention"]:
    priority_level = human_intervention_evaluation["priority_level"]
    
    if priority_level in ["high", "medium"]:
        # Create human review request
        human_review_request = await human_loop_coordinator.create_human_review_request(
            state=state,
            intervention_evaluation=human_intervention_evaluation
        )
        
        # Get human decision
        human_decision = interrupt(human_review_request)
        
        # Process human decision
        human_updates = await human_loop_coordinator.process_human_decision(
            state=state,
            human_decision=human_decision
        )
```

## Best Practices

1. **Configure Thresholds Carefully**: Set appropriate thresholds for quality and confidence to avoid unnecessary interruptions
2. **Use Priority Levels**: Differentiate between urgent issues requiring immediate attention and lower-priority reviews
3. **Provide Context**: Include relevant conversation context in review requests
4. **Limit Interruptions**: Use rate limiting to prevent excessive interruptions
5. **Handle Timeouts**: Implement timeout handling for cases where human reviewers don't respond
6. **Monitor Effectiveness**: Track metrics on human intervention frequency and impact

## Future Enhancements

Planned enhancements to the human-in-the-loop system include:

1. Integration with external review queues and dashboards
2. Implementing a learning loop to improve automated decision-making
3. Adding support for multi-reviewer consensus for complex decisions
4. Enhanced audit logging for human interventions

## Related Files

- `utils/human_in_the_loop.py`: Core HITL implementation
- `workflows/pendo_supervisor.py`: Integration with main workflow
- `config/settings.py`: HITL configuration settings
- `utils/__init__.py`: HITL module exports

## Climate Economy Assistant Backend V1

This directory contains the modular LangGraph implementation of the Climate Economy Assistant backend with human-in-the-loop capabilities.

### Migration Strategy

This implementation follows the successful patterns from the original backend but with an improved modular architecture. Key improvements include:

1. **Modular Package Structure**
   - Clear separation of concerns with dedicated directories
   - Proper import management to avoid circular dependencies
   - Support for conditional module loading

2. **Async Operations**
   - Asynchronous resource initialization and cleanup
   - Non-blocking I/O operations for better performance
   - Proper error handling and graceful degradation

3. **Human-in-the-Loop Integration**
   - Seamless integration with human reviewers
   - Configurable confidence thresholds
   - Crisis escalation capabilities

4. **Enhanced Models**
   - Structured data validation with Pydantic
   - Clear model hierarchy and relationships
   - Comprehensive schema definitions

### Directory Structure

```
backendv1/
├── __init__.py                  # Package initialization
├── main.py                      # FastAPI app factory
├── webapp.py                    # FastAPI app with lifespan management
├── adapters/                    # Database and API adapters
├── agents/                      # Climate specialists implementation
├── auth/                        # Authentication and authorization
├── chat/                        # Chat functionality
├── config/                      # Configuration and settings
├── endpoints/                   # API endpoints
├── models/                      # Data models and schemas
├── tasks/                       # Background tasks
├── tests/                       # Test suite
├── tools/                       # Agent tools
├── utils/                       # Utility functions
└── workflows/                   # LangGraph workflow definitions
```

### Key Components

1. **Models**
   - `agent_model.py`: Agent response data models
   - `agent_schema.py`: Agent configuration schemas
   - `conversation_model.py`: Chat message models
   - `empathy_model.py`: Emotional intelligence models
   - `resume_model.py`: Resume data models
   - `user_model.py`: User profile models

2. **Utils**
   - `logger.py`: Logging configuration
   - `human_in_the_loop.py`: Human reviewer integration
   - `state_management.py`: Application state management

3. **Config**
   - `settings.py`: Environment-based configuration

### Installation

1. Install development dependencies:
   ```bash
   ./install_dev.sh
   ```

2. Run the backend:
   ```bash
   uvicorn backendv1.webapp:app --reload
   ```

### API Endpoints

- Health Check: `/api/v1/health`
- System Info: `/api/v1/system/info`
- Interactive Chat: `/api/v1/interactive-chat`
- Resume Analysis: `/api/v1/resume-analysis`
- Career Search: `/api/v1/career-search`

### Configuration

Configuration is managed through environment variables with sensible defaults. See `config/settings.py` for details.

### Development

The package can be imported and used in other Python files:

```python
from backendv1 import create_app, get_settings
from backendv1.models import UserModel, AgentResponse

# Create FastAPI app instance
app = create_app()

# Get application settings
settings = get_settings()
``` 