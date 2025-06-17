"""
Empathy-Enhanced LangGraph Workflow for Climate Economy Assistant

Integrates emotional intelligence and empathy support into the supervisor workflow
with conditional edges that provide emotional support before specialist routing.
"""

from typing import Any, Dict, List, Literal, Optional

from langgraph.graph import StateGraph, END, START
from langgraph.types import Command

from core.agents.empathy_agent import EmpathyAgent
from core.models import AgentState
from core.models.empathy_models import (
    EmpathyAssessment,
    EmpathyWorkflowState,
    SupportLevel,
)


def assess_empathy_needs(
    state: AgentState,
) -> Literal["empathy_first", "direct_to_specialist", "supervisor"]:
    """
    Conditional edge function to determine if empathy support is needed before specialist routing.

    Returns:
        - "empathy_first": High emotional support needed, route to empathy agent first
        - "direct_to_specialist": Minimal emotional support needed, route directly to specialist
        - "supervisor": Standard routing through supervisor
    """

    try:
        # Extract latest message
        messages = state.get("messages", [])
        if not messages:
            return "supervisor"

        latest_message = messages[-1].get("content", "")
        if not latest_message:
            return "supervisor"

        message_lower = latest_message.lower()

        # Check for high-priority empathy triggers
        high_empathy_triggers = [
            "overwhelmed",
            "scared",
            "anxious",
            "hopeless",
            "discouraged",
            "don't know where to start",
            "feel lost",
            "too much",
            "can't handle",
            "not qualified",
            "don't belong",
            "imposter",
            "fraud",
            "too old",
            "too young",
            "failed before",
            "can't afford",
            "giving up",
            "pointless",
            "not good enough",
            "why bother",
        ]

        # Crisis indicators
        crisis_indicators = [
            "suicide",
            "kill myself",
            "end it all",
            "can't go on",
            "no point in living",
            "want to die",
        ]

        # Check for crisis - immediate empathy needed
        if any(indicator in message_lower for indicator in crisis_indicators):
            return "empathy_first"

        # Check for high empathy needs
        empathy_trigger_count = sum(
            1 for trigger in high_empathy_triggers if trigger in message_lower
        )
        if empathy_trigger_count >= 2:
            return "empathy_first"

        # Check for single strong empathy trigger
        strong_triggers = [
            "overwhelmed",
            "hopeless",
            "scared",
            "don't belong",
            "imposter",
        ]
        if any(trigger in message_lower for trigger in strong_triggers):
            return "empathy_first"

        # Check message length and complexity (very long messages may indicate overwhelm)
        if len(latest_message) > 500 and empathy_trigger_count > 0:
            return "empathy_first"

        # Check for moderate empathy needs - single trigger but not high priority
        if empathy_trigger_count == 1:
            return "supervisor"  # Let supervisor handle with enhanced empathy context

        # Standard routing for technical questions
        return "direct_to_specialist"

    except Exception as e:
        print(f"Error in empathy assessment: {e}")
        return "supervisor"  # Default to supervisor on error


def should_continue_to_specialist(
    state: AgentState,
) -> Literal["specialist_routing", "human_handoff", "end"]:
    """
    Conditional edge after empathy response to determine next steps.

    Returns:
        - "specialist_routing": Ready for specialist, route to appropriate agent
        - "human_handoff": Crisis situation, escalate to human
        - "end": Empathy response sufficient, end conversation
    """

    try:
        # Check if empathy metadata indicates next steps
        messages = state.get("messages", [])
        if not messages:
            return "end"

        latest_message = messages[-1]
        metadata = latest_message.get("metadata", {})

        # Check for human handoff needed
        if metadata.get("human_handoff_needed", False):
            return "human_handoff"

        # Check if ready for specialist
        if metadata.get("ready_for_specialist", True):
            return "specialist_routing"

        # Default to end if empathy response is sufficient
        return "end"

    except Exception as e:
        print(f"Error in post-empathy routing: {e}")
        return "specialist_routing"  # Default to specialist routing


def route_to_specialist(
    state: AgentState,
) -> Literal[
    "marcus_veteran",
    "liv_international",
    "miguel_environmental_justice",
    "jasmine_resume",
    "tool_specialist",
]:
    """
    Route to appropriate specialist after empathy support.

    Uses both original message content and empathy context for routing decisions.
    """

    try:
        # Get original message and empathy context
        messages = state.get("messages", [])
        if len(messages) < 2:
            return "tool_specialist"

        # Original user message is typically the second-to-last message
        original_message = messages[-2].get("content", "")

        # Empathy metadata from latest message
        empathy_metadata = messages[-1].get("metadata", {})
        specialist_context = empathy_metadata.get("specialist_context", {})

        # Check empathy agent's recommendation
        recommended_specialist = empathy_metadata.get("recommended_specialist", "")
        if recommended_specialist:
            specialist_map = {
                "marcus_veteran": "marcus_veteran",
                "liv_international": "liv_international",
                "miguel_environmental_justice": "miguel_environmental_justice",
                "jasmine_resume": "jasmine_resume",
                "tool_specialist": "tool_specialist",
            }
            if recommended_specialist in specialist_map:
                return specialist_map[recommended_specialist]

        # Fallback routing based on original message content
        message_lower = original_message.lower()

        # Identity-based routing
        if any(
            word in message_lower
            for word in [
                "veteran",
                "military",
                "army",
                "navy",
                "marine",
                "air force",
                "coast guard",
            ]
        ):
            return "marcus_veteran"
        elif any(
            word in message_lower
            for word in [
                "international",
                "immigrant",
                "visa",
                "credential",
                "foreign",
                "h1b",
            ]
        ):
            return "liv_international"
        elif any(
            word in message_lower
            for word in [
                "environmental justice",
                "community",
                "organizing",
                "equity",
                "frontline",
            ]
        ):
            return "miguel_environmental_justice"
        elif any(
            word in message_lower
            for word in ["resume", "cv", "skills", "experience", "background"]
        ):
            return "jasmine_resume"
        else:
            return "tool_specialist"

    except Exception as e:
        print(f"Error in specialist routing: {e}")
        return "tool_specialist"


class EmpathyEnhancedWorkflow:
    """
    Enhanced workflow that integrates empathy support with specialist routing.

    Workflow Flow:
    1. Assess empathy needs from user message
    2. If high empathy needs detected, route to empathy agent first
    3. After empathy support, route to appropriate specialist
    4. Handle crisis escalation to human when needed
    """

    def __init__(self):
        """Initialize the empathy-enhanced workflow"""
        self.empathy_agent = EmpathyAgent()
        self.workflow = None
        self._build_workflow()

    def _build_workflow(self):
        """Build the LangGraph workflow with empathy conditional edges"""

        # Create state graph
        workflow = StateGraph(AgentState)

        # Add nodes
        workflow.add_node("empathy_support", self.empathy_agent.process)
        workflow.add_node("supervisor", self._supervisor_node)
        workflow.add_node("marcus_veteran", self._veteran_specialist_node)
        workflow.add_node("liv_international", self._international_specialist_node)
        workflow.add_node(
            "miguel_environmental_justice", self._environmental_justice_node
        )
        workflow.add_node("jasmine_resume", self._resume_specialist_node)
        workflow.add_node("tool_specialist", self._tool_specialist_node)
        workflow.add_node("human_handoff", self._human_handoff_node)

        # Set entry point with conditional empathy assessment
        workflow.add_conditional_edges(
            START,
            assess_empathy_needs,
            {
                "empathy_first": "empathy_support",
                "direct_to_specialist": "supervisor",
                "supervisor": "supervisor",
            },
        )

        # After empathy support, determine next steps
        workflow.add_conditional_edges(
            "empathy_support",
            should_continue_to_specialist,
            {
                "specialist_routing": "specialist_routing",
                "human_handoff": "human_handoff",
                "end": END,
            },
        )

        # Add specialist routing node
        workflow.add_node("specialist_routing", self._specialist_routing_node)

        # Route from specialist routing to actual specialists
        workflow.add_conditional_edges(
            "specialist_routing",
            route_to_specialist,
            {
                "marcus_veteran": "marcus_veteran",
                "liv_international": "liv_international",
                "miguel_environmental_justice": "miguel_environmental_justice",
                "jasmine_resume": "jasmine_resume",
                "tool_specialist": "tool_specialist",
            },
        )

        # All specialist nodes end the workflow
        workflow.add_edge("marcus_veteran", END)
        workflow.add_edge("liv_international", END)
        workflow.add_edge("miguel_environmental_justice", END)
        workflow.add_edge("jasmine_resume", END)
        workflow.add_edge("tool_specialist", END)
        workflow.add_edge("supervisor", END)
        workflow.add_edge("human_handoff", END)

        # Compile workflow
        self.workflow = workflow.compile()

    def _supervisor_node(self, state: AgentState) -> Command:
        """Supervisor node for standard routing when empathy not needed"""
        # Import here to avoid circular imports
        from core.agents.base import SupervisorAgent

        supervisor = SupervisorAgent()
        return supervisor.process(state)

    def _veteran_specialist_node(self, state: AgentState) -> Command:
        """Veteran specialist node with empathy context"""
        from core.agents.veteran import VeteranAgent

        veteran_agent = VeteranAgent()

        # Add empathy context to state if available
        messages = state.get("messages", [])
        if len(messages) >= 2:
            empathy_metadata = messages[-1].get("metadata", {})
            specialist_context = empathy_metadata.get("specialist_context", {})

            if specialist_context.get("needs_gentle_approach"):
                # Modify state to indicate gentle approach needed
                state["empathy_context"] = specialist_context

        return veteran_agent.process(state)

    def _international_specialist_node(self, state: AgentState) -> Command:
        """International specialist node with empathy context"""
        from core.agents.international import InternationalAgent

        international_agent = InternationalAgent()

        # Add empathy context to state if available
        messages = state.get("messages", [])
        if len(messages) >= 2:
            empathy_metadata = messages[-1].get("metadata", {})
            specialist_context = empathy_metadata.get("specialist_context", {})

            if specialist_context.get("needs_gentle_approach"):
                state["empathy_context"] = specialist_context

        return international_agent.process(state)

    def _environmental_justice_node(self, state: AgentState) -> Command:
        """Environmental justice specialist node with empathy context"""
        from core.agents.environmental import EnvironmentalJusticeAgent

        ej_agent = EnvironmentalJusticeAgent()

        # Add empathy context to state if available
        messages = state.get("messages", [])
        if len(messages) >= 2:
            empathy_metadata = messages[-1].get("metadata", {})
            specialist_context = empathy_metadata.get("specialist_context", {})

            if specialist_context.get("needs_gentle_approach"):
                state["empathy_context"] = specialist_context

        return ej_agent.process(state)

    def _resume_specialist_node(self, state: AgentState) -> Command:
        """Resume specialist node with empathy context"""
        from core.agents.resume import ResumeAgent

        resume_agent = ResumeAgent()

        # Add empathy context to state if available
        messages = state.get("messages", [])
        if len(messages) >= 2:
            empathy_metadata = messages[-1].get("metadata", {})
            specialist_context = empathy_metadata.get("specialist_context", {})

            if specialist_context.get("needs_gentle_approach"):
                state["empathy_context"] = specialist_context

        return resume_agent.process(state)

    def _tool_specialist_node(self, state: AgentState) -> Command:
        """Tool specialist node with empathy context"""
        from core.agents.tool import ToolAgent

        tool_agent = ToolAgent()

        # Add empathy context to state if available
        messages = state.get("messages", [])
        if len(messages) >= 2:
            empathy_metadata = messages[-1].get("metadata", {})
            specialist_context = empathy_metadata.get("specialist_context", {})

            if specialist_context.get("needs_gentle_approach"):
                state["empathy_context"] = specialist_context

        return tool_agent.process(state)

    def _specialist_routing_node(self, state: AgentState) -> Command:
        """Routing node that prepares for specialist assignment"""

        # This is a pass-through node that just updates state
        # The actual routing is handled by the conditional edge
        return Command(
            goto="marcus_veteran", update=state
        )  # Will be overridden by conditional edge

    def _human_handoff_node(self, state: AgentState) -> Command:
        """Human handoff node for crisis situations"""

        # Create crisis intervention response
        crisis_response = {
            "role": "assistant",
            "content": "I understand you're going through a very difficult time right now. I'm connecting you with a human counselor who can provide immediate support. In the meantime, please know that help is available:\n\n🆘 **Immediate Crisis Resources:**\n• National Suicide Prevention Lifeline: 988\n• Crisis Text Line: Text HOME to 741741\n• Emergency Services: 911\n\nYour life has value, and there are people who care about you and want to help. A human counselor will be with you shortly.",
            "metadata": {
                "specialist": "crisis_intervention",
                "human_handoff": True,
                "crisis_resources_provided": True,
                "priority": "immediate",
            },
        }

        # Update messages
        updated_messages = list(state.get("messages", []))
        updated_messages.append(crisis_response)

        # Update state
        updated_state = dict(state)
        updated_state["messages"] = updated_messages
        updated_state["human_handoff_required"] = True
        updated_state["crisis_intervention"] = True

        return Command(goto=END, update=updated_state)

    def run(self, initial_state: AgentState) -> Dict[str, Any]:
        """Run the empathy-enhanced workflow"""

        if not self.workflow:
            raise RuntimeError("Workflow not properly initialized")

        try:
            # Execute workflow
            result = self.workflow.invoke(initial_state)

            return result

        except Exception as e:
            print(f"Error in empathy workflow execution: {e}")

            # Fallback response
            fallback_response = {
                "role": "assistant",
                "content": "I'm experiencing a technical issue, but I'm here to help. Please let me know how you're feeling about your climate career transition, and I'll provide support and guidance.",
                "metadata": {"error": str(e), "fallback": True},
            }

            messages = list(initial_state.get("messages", []))
            messages.append(fallback_response)

            return {**initial_state, "messages": messages, "error": str(e)}


# Create workflow instance for import
empathy_workflow_instance = EmpathyEnhancedWorkflow()
empathy_workflow = empathy_workflow_instance.workflow
