"""
LangGraph Agents Implementation for Climate Economy Assistant
Comprehensive agent orchestration and workflow management
"""

from typing import Dict, Any, List, Optional, Union, Annotated
from dataclasses import dataclass
from enum import Enum
import asyncio
from datetime import datetime

from langgraph.graph import StateGraph, END
from langgraph.types import Command
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage
from langchain_core.runnables import RunnableConfig

# Import individual agents
from .climate_agent import ClimateAgent
from .empathy_agent import EmpathyAgent
from .resume import ResumeAgent
from .veteran import VeteranAgent
from .environmental import EnvironmentalJusticeAgent
from .international import InternationalAgent
from .ma_resource_analyst import MAResourceAgent

class AgentType(str, Enum):
    """Available agent types in the system"""
    CLIMATE_SPECIALIST = "lauren"
    EMPATHY_SPECIALIST = "alex"
    RESUME_SPECIALIST = "mai"
    VETERAN_SPECIALIST = "marcus"
    ENVIRONMENTAL_JUSTICE = "miguel"
    INTERNATIONAL_SPECIALIST = "liv"
    MA_RESOURCES = "jasmine"
    SUPERVISOR = "pendo"

@dataclass
class AgentState:
    """Shared state across all agents"""
    messages: List[BaseMessage]
    user_id: str
    conversation_id: str
    current_agent: Optional[str] = None
    last_speaker: Optional[str] = None
    context: Dict[str, Any] = None
    routing_decision: Optional[str] = None
    specialist_context: Dict[str, Any] = None
    confidence_scores: Dict[str, float] = None
    next_actions: List[str] = None

class SupervisorAgent:
    """
    Pendo - The Supervisor Agent
    Orchestrates the multi-agent system and routes conversations
    """
    
    def __init__(self):
        self.agent_id = "pendo_supervisor"
        self.name = "Pendo"
        
        # Initialize specialist agents
        self.agents = {
            AgentType.CLIMATE_SPECIALIST: ClimateAgent(),
            AgentType.EMPATHY_SPECIALIST: EmpathyAgent(),
            AgentType.RESUME_SPECIALIST: ResumeAgent(),
            AgentType.VETERAN_SPECIALIST: VeteranAgent(),
            AgentType.ENVIRONMENTAL_JUSTICE: EnvironmentalJusticeAgent(),
            AgentType.INTERNATIONAL_SPECIALIST: InternationalAgent(),
            AgentType.MA_RESOURCES: MAResourceAgent(),
        }
        
        # Routing keywords for each specialist
        self.routing_keywords = {
            AgentType.CLIMATE_SPECIALIST: [
                "climate", "green jobs", "renewable energy", "sustainability",
                "solar", "wind", "environmental career", "clean energy"
            ],
            AgentType.EMPATHY_SPECIALIST: [
                "stressed", "anxious", "overwhelmed", "support", "confidence",
                "motivation", "emotional", "feeling", "worried", "scared"
            ],
            AgentType.RESUME_SPECIALIST: [
                "resume", "cv", "application", "cover letter", "interview",
                "skills", "experience", "qualifications", "portfolio"
            ],
            AgentType.VETERAN_SPECIALIST: [
                "veteran", "military", "service", "deployment", "mos",
                "transition", "gi bill", "va benefits", "security clearance"
            ],
            AgentType.ENVIRONMENTAL_JUSTICE: [
                "environmental justice", "community", "equity", "frontline",
                "disadvantaged", "pollution", "advocacy", "organizing"
            ],
            AgentType.INTERNATIONAL_SPECIALIST: [
                "international", "visa", "immigration", "foreign", "credential",
                "recognition", "work permit", "green card", "citizenship"
            ],
            AgentType.MA_RESOURCES: [
                "massachusetts", "boston", "cambridge", "worcester", "springfield",
                "local", "state", "ma", "resources", "programs"
            ]
        }

    def route_conversation(self, message: str, context: Dict[str, Any] = None) -> str:
        """Route conversation to appropriate specialist"""
        
        message_lower = message.lower()
        scores = {}
        
        # Calculate relevance scores for each agent
        for agent_type, keywords in self.routing_keywords.items():
            score = sum(1 for keyword in keywords if keyword in message_lower)
            if score > 0:
                scores[agent_type] = score
        
        # If no clear match, default to climate specialist
        if not scores:
            return AgentType.CLIMATE_SPECIALIST
        
        # Return agent with highest score
        return max(scores.items(), key=lambda x: x[1])[0]

    async def process_message(self, state: AgentState) -> Command:
        """Process message and route to appropriate agent"""
        
        latest_message = state.messages[-1] if state.messages else None
        if not latest_message:
            return Command(goto=END)
        
        # Route to appropriate specialist
        target_agent = self.route_conversation(latest_message.content, state.context)
        
        # Update state with routing decision
        updated_state = state.copy()
        updated_state.routing_decision = target_agent
        updated_state.current_agent = target_agent
        
        return Command(goto=target_agent, update=updated_state)

class LangGraphOrchestrator:
    """
    Main orchestrator for the LangGraph multi-agent system
    """
    
    def __init__(self):
        self.supervisor = SupervisorAgent()
        self.graph = self._build_graph()
    
    def _build_graph(self) -> StateGraph:
        """Build the LangGraph workflow"""
        
        # Create the graph
        workflow = StateGraph(AgentState)
        
        # Add supervisor node
        workflow.add_node("supervisor", self.supervisor.process_message)
        
        # Add specialist nodes
        for agent_type, agent in self.supervisor.agents.items():
            workflow.add_node(agent_type, agent.process)
        
        # Set entry point
        workflow.set_entry_point("supervisor")
        
        # Add conditional edges from supervisor to specialists
        workflow.add_conditional_edges(
            "supervisor",
            self._route_to_specialist,
            {
                AgentType.CLIMATE_SPECIALIST: AgentType.CLIMATE_SPECIALIST,
                AgentType.EMPATHY_SPECIALIST: AgentType.EMPATHY_SPECIALIST,
                AgentType.RESUME_SPECIALIST: AgentType.RESUME_SPECIALIST,
                AgentType.VETERAN_SPECIALIST: AgentType.VETERAN_SPECIALIST,
                AgentType.ENVIRONMENTAL_JUSTICE: AgentType.ENVIRONMENTAL_JUSTICE,
                AgentType.INTERNATIONAL_SPECIALIST: AgentType.INTERNATIONAL_SPECIALIST,
                AgentType.MA_RESOURCES: AgentType.MA_RESOURCES,
            }
        )
        
        # All specialists end the conversation
        for agent_type in self.supervisor.agents.keys():
            workflow.add_edge(agent_type, END)
        
        return workflow.compile()
    
    def _route_to_specialist(self, state: AgentState) -> str:
        """Route to the appropriate specialist based on supervisor decision"""
        return state.routing_decision or AgentType.CLIMATE_SPECIALIST
    
    async def process_conversation(
        self,
        message: str,
        user_id: str,
        conversation_id: str,
        context: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Process a conversation through the multi-agent system"""
        
        try:
            # Create initial state
            initial_state = AgentState(
                messages=[HumanMessage(content=message)],
                user_id=user_id,
                conversation_id=conversation_id,
                context=context or {},
                confidence_scores={},
                next_actions=[]
            )
            
            # Run the graph
            result = await self.graph.ainvoke(initial_state)
            
            # Extract the final response
            if result.messages and len(result.messages) > 1:
                final_message = result.messages[-1]
                response_content = final_message.content
            else:
                response_content = "I'm here to help with your climate career questions!"
            
            return {
                "content": response_content,
                "specialist": result.current_agent or "pendo",
                "confidence": result.confidence_scores.get(result.current_agent, 0.8),
                "next_actions": result.next_actions or [],
                "routing_decision": result.routing_decision,
                "context": result.specialist_context or {}
            }
            
        except Exception as e:
            return {
                "content": f"I apologize, but I'm experiencing a technical issue. Please try again or contact support if the problem persists.",
                "specialist": "pendo",
                "error": str(e),
                "confidence": 0.0
            }

# Global orchestrator instance
orchestrator = LangGraphOrchestrator()

async def process_chat_message(
    message: str,
    user_id: str,
    conversation_id: str,
    context: Dict[str, Any] = None
) -> Dict[str, Any]:
    """
    Main entry point for processing chat messages through the LangGraph system
    """
    return await orchestrator.process_conversation(
        message=message,
        user_id=user_id,
        conversation_id=conversation_id,
        context=context
    )

# Agent registry for external access
AGENT_REGISTRY = {
    "lauren": ClimateAgent(),
    "alex": EmpathyAgent(),
    "mai": ResumeAgent(),
    "marcus": VeteranAgent(),
    "miguel": EnvironmentalJusticeAgent(),
    "liv": InternationalAgent(),
    "jasmine": MAResourceAgent(),
    "pendo": SupervisorAgent()
}

def get_agent(agent_name: str):
    """Get a specific agent by name"""
    return AGENT_REGISTRY.get(agent_name.lower())

def list_available_agents() -> List[str]:
    """List all available agents"""
    return list(AGENT_REGISTRY.keys()) 