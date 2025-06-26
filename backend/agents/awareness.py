"""
Enhanced Agent Awareness System for Climate Economy Assistant
Implements advanced multi-agent coordination patterns without disrupting existing architecture.

Key Features:
- Agent self-awareness and capability mapping
- Cross-team coordination and help requests  
- Hierarchical supervisor communication
- Dynamic task delegation and collaboration
- Human-in-the-loop coordination guidance
"""

import logging
import json
import asyncio
from datetime import datetime
from typing import Dict, Any, List, Optional, Union, Literal, Tuple
from dataclasses import dataclass, asdict
from enum import Enum

from langchain_core.tools import tool
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langgraph.types import Command, Send, interrupt
from backend.database.redis_client import redis_client

logger = logging.getLogger(__name__)


# Enums for agent coordination
class CoordinationLevel(Enum):
    AGENT_TO_AGENT = "agent_to_agent"
    TEAM_TO_TEAM = "team_to_team"
    SUPERVISOR = "supervisor"
    GLOBAL_COORDINATOR = "global_coordinator"
    HUMAN_OVERSIGHT = "human_oversight"


class ExpertiseLevel(Enum):
    NOVICE = "novice"
    INTERMEDIATE = "intermediate"
    EXPERT = "expert"
    SPECIALIST = "specialist"


@dataclass
class AgentCapability:
    """Defines what an agent can do and their expertise level"""

    name: str
    expertise_areas: List[str]
    expertise_level: ExpertiseLevel
    tools_available: List[str]
    can_coordinate_with: List[str]
    max_complexity_level: Literal["low", "medium", "high"]
    languages_supported: List[str] = None

    def __post_init__(self):
        if self.languages_supported is None:
            self.languages_supported = ["en"]


@dataclass
class CoordinationRequest:
    """Request for agent coordination or help"""

    requesting_agent: str
    requesting_team: str
    expertise_needed: str
    specific_question: str
    context: Dict[str, Any]
    urgency: Literal["low", "medium", "high"]
    coordination_level: CoordinationLevel
    suggested_agents: List[str] = None
    human_oversight_required: bool = False

    def to_dict(self) -> Dict[str, Any]:
        result = asdict(self)
        result["coordination_level"] = self.coordination_level.value
        return result


@dataclass
class CoordinationResponse:
    """Response to coordination request"""

    responding_agent: str
    responding_team: str
    response_content: str
    confidence: float
    follow_up_needed: bool
    escalation_recommended: bool
    metadata: Dict[str, Any]


class AgentAwarenessSystem:
    """
    Enhanced Agent Awareness System that enables intelligent coordination
    without disrupting existing agent implementations
    """

    def __init__(self):
        self.redis = redis_client
        self.agent_capabilities = self._initialize_agent_capabilities()
        self.coordination_history = {}

    def _initialize_agent_capabilities(self) -> Dict[str, AgentCapability]:
        """Initialize comprehensive agent capability mapping"""
        return {
            # SPECIALISTS TEAM
            "pendo": AgentCapability(
                name="pendo",
                expertise_areas=[
                    "general_climate",
                    "career_guidance",
                    "policy_overview",
                    "coordination",
                ],
                expertise_level=ExpertiseLevel.EXPERT,
                tools_available=[
                    "search_climate_careers",
                    "analyze_climate_policy",
                    "get_training_resources",
                ],
                can_coordinate_with=["all_teams"],
                max_complexity_level="high",
            ),
            "lauren": AgentCapability(
                name="lauren",
                expertise_areas=[
                    "climate_policy",
                    "regulations",
                    "government_programs",
                    "clean_energy_policy",
                ],
                expertise_level=ExpertiseLevel.SPECIALIST,
                tools_available=[
                    "policy_analysis",
                    "regulatory_guidance",
                    "program_finder",
                ],
                can_coordinate_with=[
                    "specialists_team",
                    "veterans_team",
                    "international_team",
                ],
                max_complexity_level="high",
            ),
            "alex": AgentCapability(
                name="alex",
                expertise_areas=[
                    "renewable_energy",
                    "solar",
                    "wind",
                    "technical_certifications",
                    "energy_storage",
                ],
                expertise_level=ExpertiseLevel.SPECIALIST,
                tools_available=[
                    "renewable_energy_analysis",
                    "certification_guidance",
                    "technical_assessment",
                ],
                can_coordinate_with=["specialists_team", "international_team"],
                max_complexity_level="high",
            ),
            "jasmine": AgentCapability(
                name="jasmine",
                expertise_areas=[
                    "green_technology",
                    "innovation",
                    "startups",
                    "sustainability",
                    "green_finance",
                ],
                expertise_level=ExpertiseLevel.SPECIALIST,
                tools_available=[
                    "innovation_research",
                    "startup_guidance",
                    "sustainability_analysis",
                ],
                can_coordinate_with=["specialists_team", "international_team"],
                max_complexity_level="high",
            ),
            # VETERANS TEAM
            "marcus": AgentCapability(
                name="marcus",
                expertise_areas=[
                    "veteran_career_transition",
                    "leadership_translation",
                    "veteran_benefits",
                    "military_skills",
                ],
                expertise_level=ExpertiseLevel.SPECIALIST,
                tools_available=[
                    "career_transition",
                    "leadership_mapping",
                    "benefits_guidance",
                ],
                can_coordinate_with=[
                    "veterans_team",
                    "specialists_team",
                    "support_team",
                ],
                max_complexity_level="high",
            ),
            "james": AgentCapability(
                name="james",
                expertise_areas=[
                    "military_skills_translation",
                    "civilian_equivalents",
                    "certification_mapping",
                ],
                expertise_level=ExpertiseLevel.SPECIALIST,
                tools_available=[
                    "skills_translation",
                    "certification_finder",
                    "equivalency_mapping",
                ],
                can_coordinate_with=["veterans_team", "specialists_team"],
                max_complexity_level="medium",
            ),
            "sarah": AgentCapability(
                name="sarah",
                expertise_areas=[
                    "veteran_career_coaching",
                    "job_search",
                    "interview_prep",
                    "resume_building",
                ],
                expertise_level=ExpertiseLevel.EXPERT,
                tools_available=["career_coaching", "job_search", "interview_prep"],
                can_coordinate_with=["veterans_team", "support_team"],
                max_complexity_level="medium",
            ),
            "david": AgentCapability(
                name="david",
                expertise_areas=[
                    "veteran_benefits",
                    "education_benefits",
                    "disability_benefits",
                    "healthcare",
                ],
                expertise_level=ExpertiseLevel.SPECIALIST,
                tools_available=[
                    "benefits_calculator",
                    "education_guidance",
                    "healthcare_navigation",
                ],
                can_coordinate_with=["veterans_team", "support_team"],
                max_complexity_level="high",
            ),
            # ENVIRONMENTAL JUSTICE TEAM
            "miguel": AgentCapability(
                name="miguel",
                expertise_areas=[
                    "environmental_justice",
                    "community_organizing",
                    "policy_advocacy",
                    "equity",
                ],
                expertise_level=ExpertiseLevel.SPECIALIST,
                tools_available=[
                    "community_organizing",
                    "policy_advocacy",
                    "equity_analysis",
                ],
                can_coordinate_with=[
                    "ej_team",
                    "specialists_team",
                    "international_team",
                ],
                max_complexity_level="high",
            ),
            "maria": AgentCapability(
                name="maria",
                expertise_areas=[
                    "community_engagement",
                    "grassroots_organizing",
                    "cultural_competency",
                ],
                expertise_level=ExpertiseLevel.EXPERT,
                tools_available=[
                    "community_engagement",
                    "organizing_tools",
                    "cultural_guidance",
                ],
                can_coordinate_with=["ej_team", "international_team"],
                max_complexity_level="high",
            ),
            "andre": AgentCapability(
                name="andre",
                expertise_areas=[
                    "environmental_health",
                    "pollution_analysis",
                    "health_advocacy",
                ],
                expertise_level=ExpertiseLevel.SPECIALIST,
                tools_available=[
                    "health_analysis",
                    "pollution_assessment",
                    "advocacy_tools",
                ],
                can_coordinate_with=["ej_team", "specialists_team"],
                max_complexity_level="high",
            ),
            "carmen": AgentCapability(
                name="carmen",
                expertise_areas=[
                    "community_relations",
                    "cultural_liaison",
                    "bilingual_support",
                ],
                expertise_level=ExpertiseLevel.EXPERT,
                tools_available=[
                    "cultural_translation",
                    "community_relations",
                    "bilingual_communication",
                ],
                can_coordinate_with=["ej_team", "international_team"],
                max_complexity_level="medium",
                languages_supported=["en", "es"],
            ),
            # INTERNATIONAL TEAM
            "liv": AgentCapability(
                name="liv",
                expertise_areas=[
                    "international_policy",
                    "global_climate",
                    "diplomatic_relations",
                ],
                expertise_level=ExpertiseLevel.SPECIALIST,
                tools_available=[
                    "international_analysis",
                    "policy_comparison",
                    "diplomatic_guidance",
                ],
                can_coordinate_with=[
                    "international_team",
                    "specialists_team",
                    "ej_team",
                ],
                max_complexity_level="high",
            ),
            "mei": AgentCapability(
                name="mei",
                expertise_areas=[
                    "asia_pacific",
                    "credentials_recognition",
                    "cultural_adaptation",
                ],
                expertise_level=ExpertiseLevel.SPECIALIST,
                tools_available=[
                    "credential_assessment",
                    "cultural_adaptation",
                    "asia_pacific_guidance",
                ],
                can_coordinate_with=["international_team", "support_team"],
                max_complexity_level="medium",
            ),
            "raj": AgentCapability(
                name="raj",
                expertise_areas=[
                    "south_asia",
                    "middle_east",
                    "global_sustainability",
                    "international_development",
                ],
                expertise_level=ExpertiseLevel.SPECIALIST,
                tools_available=[
                    "regional_expertise",
                    "sustainability_analysis",
                    "development_guidance",
                ],
                can_coordinate_with=["international_team", "specialists_team"],
                max_complexity_level="high",
            ),
            "sofia": AgentCapability(
                name="sofia",
                expertise_areas=[
                    "europe",
                    "africa",
                    "cross_cultural_communication",
                    "international_cooperation",
                ],
                expertise_level=ExpertiseLevel.SPECIALIST,
                tools_available=[
                    "regional_analysis",
                    "cultural_communication",
                    "cooperation_guidance",
                ],
                can_coordinate_with=["international_team", "ej_team"],
                max_complexity_level="high",
            ),
            # SUPPORT TEAM
            "mai": AgentCapability(
                name="mai",
                expertise_areas=[
                    "mental_health",
                    "wellness",
                    "stress_management",
                    "general_support",
                ],
                expertise_level=ExpertiseLevel.EXPERT,
                tools_available=[
                    "mental_health_assessment",
                    "wellness_planning",
                    "stress_management",
                ],
                can_coordinate_with=["support_team", "veterans_team"],
                max_complexity_level="high",
            ),
            "michael": AgentCapability(
                name="michael",
                expertise_areas=[
                    "crisis_intervention",
                    "emergency_support",
                    "technical_assistance",
                ],
                expertise_level=ExpertiseLevel.SPECIALIST,
                tools_available=[
                    "crisis_intervention",
                    "emergency_protocols",
                    "technical_support",
                ],
                can_coordinate_with=["support_team", "all_teams"],
                max_complexity_level="high",
            ),
            "elena": AgentCapability(
                name="elena",
                expertise_areas=[
                    "career_counseling",
                    "professional_development",
                    "user_experience",
                ],
                expertise_level=ExpertiseLevel.EXPERT,
                tools_available=[
                    "career_counseling",
                    "development_planning",
                    "ux_optimization",
                ],
                can_coordinate_with=[
                    "support_team",
                    "veterans_team",
                    "specialists_team",
                ],
                max_complexity_level="medium",
            ),
            "thomas": AgentCapability(
                name="thomas",
                expertise_areas=[
                    "job_placement",
                    "data_analysis",
                    "analytics",
                    "market_research",
                ],
                expertise_level=ExpertiseLevel.SPECIALIST,
                tools_available=["job_placement", "data_analysis", "market_research"],
                can_coordinate_with=["support_team", "specialists_team"],
                max_complexity_level="high",
            ),
        }

    def get_agent_capability(self, agent_name: str) -> Optional[AgentCapability]:
        """Get capability information for a specific agent"""
        return self.agent_capabilities.get(agent_name)

    def find_expert_agents(
        self, expertise_needed: str, exclude_agent: str = None
    ) -> List[Tuple[str, float]]:
        """Find agents with specific expertise, ranked by relevance"""
        expert_agents = []

        for agent_name, capability in self.agent_capabilities.items():
            if exclude_agent and agent_name == exclude_agent:
                continue

            # Calculate relevance score
            relevance_score = 0.0
            expertise_lower = expertise_needed.lower()

            for area in capability.expertise_areas:
                if expertise_lower in area.lower():
                    relevance_score += 1.0
                elif any(word in area.lower() for word in expertise_lower.split()):
                    relevance_score += 0.5

            # Boost score based on expertise level
            level_boost = {
                ExpertiseLevel.SPECIALIST: 0.4,
                ExpertiseLevel.EXPERT: 0.3,
                ExpertiseLevel.INTERMEDIATE: 0.2,
                ExpertiseLevel.NOVICE: 0.1,
            }
            relevance_score += level_boost.get(capability.expertise_level, 0.1)

            if relevance_score > 0.3:  # Minimum threshold
                expert_agents.append((agent_name, relevance_score))

        # Sort by relevance score (highest first)
        expert_agents.sort(key=lambda x: x[1], reverse=True)
        return expert_agents[:5]  # Return top 5

    def can_agents_coordinate(self, agent1: str, agent2: str) -> bool:
        """Check if two agents can coordinate directly"""
        cap1 = self.agent_capabilities.get(agent1)
        cap2 = self.agent_capabilities.get(agent2)

        if not cap1 or not cap2:
            return False

        # Check if either agent can coordinate with the other's team or "all_teams"
        agent2_team = self._get_agent_team(agent2)
        agent1_team = self._get_agent_team(agent1)

        return (
            "all_teams" in cap1.can_coordinate_with
            or agent2_team in cap1.can_coordinate_with
            or "all_teams" in cap2.can_coordinate_with
            or agent1_team in cap2.can_coordinate_with
        )

    def _get_agent_team(self, agent_name: str) -> str:
        """Get the team name for a given agent"""
        team_mapping = {
            "pendo": "specialists_team",
            "lauren": "specialists_team",
            "alex": "specialists_team",
            "jasmine": "specialists_team",
            "marcus": "veterans_team",
            "james": "veterans_team",
            "sarah": "veterans_team",
            "david": "veterans_team",
            "miguel": "ej_team",
            "maria": "ej_team",
            "andre": "ej_team",
            "carmen": "ej_team",
            "liv": "international_team",
            "mei": "international_team",
            "raj": "international_team",
            "sofia": "international_team",
            "mai": "support_team",
            "michael": "support_team",
            "elena": "support_team",
            "thomas": "support_team",
        }
        return team_mapping.get(agent_name, "unknown_team")

    async def request_coordination(
        self, coordination_request: CoordinationRequest
    ) -> CoordinationResponse:
        """Process a coordination request between agents"""
        try:
            logger.info(
                f"Processing coordination request from {coordination_request.requesting_agent}"
            )

            # Find best agents for the requested expertise
            expert_agents = self.find_expert_agents(
                coordination_request.expertise_needed,
                exclude_agent=coordination_request.requesting_agent,
            )

            if not expert_agents:
                # No specific experts found, escalate to supervisor
                return await self._escalate_to_supervisor(coordination_request)

            # Try direct agent coordination first
            best_agent, score = expert_agents[0]

            if self.can_agents_coordinate(
                coordination_request.requesting_agent, best_agent
            ):
                return await self._direct_agent_coordination(
                    coordination_request, best_agent, score
                )
            else:
                # Coordination not allowed, go through team supervisor
                return await self._team_supervisor_coordination(
                    coordination_request, best_agent
                )

        except Exception as e:
            logger.error(f"Error in coordination request: {e}")
            return CoordinationResponse(
                responding_agent="system",
                responding_team="system",
                response_content=f"Unable to process coordination request: {str(e)}",
                confidence=0.1,
                follow_up_needed=True,
                escalation_recommended=True,
                metadata={"error": str(e)},
            )

    async def _direct_agent_coordination(
        self, request: CoordinationRequest, target_agent: str, relevance_score: float
    ) -> CoordinationResponse:
        """Handle direct agent-to-agent coordination"""
        logger.info(
            f"Direct coordination: {request.requesting_agent} -> {target_agent}"
        )

        # Store coordination in Redis for tracking
        coordination_key = f"coordination:{request.requesting_agent}:{target_agent}:{datetime.now().isoformat()}"
        await self.redis.setex(
            coordination_key, 3600, json.dumps(request.to_dict())  # 1 hour TTL
        )

        # Return coordination response
        return CoordinationResponse(
            responding_agent=target_agent,
            responding_team=self._get_agent_team(target_agent),
            response_content=f"Coordinating with {target_agent} for {request.expertise_needed} expertise.",
            confidence=min(relevance_score, 0.95),
            follow_up_needed=request.urgency in ["medium", "high"],
            escalation_recommended=request.urgency == "high",
            metadata={
                "coordination_type": "direct",
                "relevance_score": relevance_score,
                "coordination_key": coordination_key,
            },
        )

    async def _team_supervisor_coordination(
        self, request: CoordinationRequest, target_agent: str
    ) -> CoordinationResponse:
        """Handle coordination through team supervisors"""
        target_team = self._get_agent_team(target_agent)
        logger.info(
            f"Team supervisor coordination: {request.requesting_agent} -> {target_team} supervisor -> {target_agent}"
        )

        return CoordinationResponse(
            responding_agent=f"{target_team}_supervisor",
            responding_team=target_team,
            response_content=f"Routing request through {target_team} supervisor to {target_agent}.",
            confidence=0.8,
            follow_up_needed=True,
            escalation_recommended=False,
            metadata={
                "coordination_type": "team_supervisor",
                "target_agent": target_agent,
                "target_team": target_team,
            },
        )

    async def _escalate_to_supervisor(
        self, request: CoordinationRequest
    ) -> CoordinationResponse:
        """Escalate coordination to global supervisor"""
        logger.info(
            f"Escalating coordination request from {request.requesting_agent} to global supervisor"
        )

        return CoordinationResponse(
            responding_agent="global_supervisor",
            responding_team="coordination",
            response_content="Escalating to global supervisor for complex coordination.",
            confidence=0.7,
            follow_up_needed=True,
            escalation_recommended=True,
            metadata={
                "coordination_type": "escalation",
                "original_request": request.to_dict(),
            },
        )

    async def analyze_coordination_needs(
        self, message: str, current_agent: str
    ) -> Dict[str, Any]:
        """Analyze if a message requires coordination with other agents"""
        message_lower = message.lower()

        # Define coordination triggers
        coordination_triggers = {
            "veteran": ["veterans_team", "military experience", "va benefits"],
            "international": [
                "international_team",
                "global perspective",
                "cultural adaptation",
            ],
            "environmental justice": ["ej_team", "community organizing", "equity"],
            "mental health": ["support_team", "wellness", "stress management"],
            "policy": [
                "specialists_team",
                "regulatory guidance",
                "government programs",
            ],
            "technical": ["specialists_team", "renewable energy", "green technology"],
        }

        coordination_needed = []
        confidence_scores = []

        for trigger, [team, expertise1, expertise2] in coordination_triggers.items():
            if trigger in message_lower:
                expert_agents = self.find_expert_agents(
                    expertise1, exclude_agent=current_agent
                )
                if expert_agents:
                    coordination_needed.append(
                        {
                            "trigger": trigger,
                            "team": team,
                            "expertise": expertise1,
                            "suggested_agents": [
                                agent for agent, score in expert_agents[:2]
                            ],
                            "confidence": expert_agents[0][1] if expert_agents else 0.5,
                        }
                    )
                    confidence_scores.append(
                        expert_agents[0][1] if expert_agents else 0.5
                    )

        return {
            "needs_coordination": len(coordination_needed) > 0,
            "coordination_suggestions": coordination_needed,
            "overall_confidence": (
                sum(confidence_scores) / len(confidence_scores)
                if confidence_scores
                else 0.0
            ),
            "recommended_coordination_level": (
                CoordinationLevel.AGENT_TO_AGENT
                if len(coordination_needed) == 1
                else (
                    CoordinationLevel.TEAM_TO_TEAM
                    if len(coordination_needed) <= 2
                    else CoordinationLevel.SUPERVISOR
                )
            ).value,
        }


# Global instance for system-wide access
agent_awareness = AgentAwarenessSystem()


# Tool for agents to request coordination
@tool
async def request_agent_coordination(
    requesting_agent: str,
    expertise_needed: str,
    specific_question: str,
    urgency: Literal["low", "medium", "high"] = "medium",
    context: Dict[str, Any] = None,
) -> Command:
    """
    Tool for agents to request coordination with other agents or teams.
    This enables intelligent agent-to-agent communication and collaboration.
    """
    try:
        coordination_request = CoordinationRequest(
            requesting_agent=requesting_agent,
            requesting_team=agent_awareness._get_agent_team(requesting_agent),
            expertise_needed=expertise_needed,
            specific_question=specific_question,
            context=context or {},
            urgency=urgency,
            coordination_level=CoordinationLevel.AGENT_TO_AGENT,
        )

        response = await agent_awareness.request_coordination(coordination_request)

        # Return LangGraph Command for routing
        return Command(
            goto=response.responding_agent,
            update={
                "coordination_request": coordination_request.to_dict(),
                "coordination_response": {
                    "agent": response.responding_agent,
                    "team": response.responding_team,
                    "content": response.response_content,
                    "confidence": response.confidence,
                    "metadata": response.metadata,
                },
            },
            graph=Command.PARENT if response.escalation_recommended else None,
        )

    except Exception as e:
        logger.error(f"Error in request_agent_coordination: {e}")
        return Command(
            goto="error_handler",
            update={"error": f"Coordination request failed: {str(e)}"},
        )


# Tool for human-in-the-loop coordination guidance
@tool
async def request_human_coordination_guidance(
    current_situation: str,
    agents_involved: List[str],
    coordination_complexity: Literal["low", "medium", "high"],
    suggested_actions: List[str],
) -> Dict[str, Any]:
    """
    Request human guidance for complex agent coordination decisions.
    Returns interrupt for human decision-making.
    """
    try:
        guidance_request = {
            "type": "coordination_guidance",
            "situation": current_situation,
            "agents_involved": agents_involved,
            "complexity": coordination_complexity,
            "suggested_actions": suggested_actions,
            "agent_capabilities": {
                agent: agent_awareness.get_agent_capability(agent)
                for agent in agents_involved
                if agent_awareness.get_agent_capability(agent)
            },
            "coordination_history": "Recent coordination patterns...",
            "recommendation": "Please select the best coordination approach",
        }

        # Interrupt for human guidance
        human_decision = interrupt(guidance_request)

        return {
            "human_decision": human_decision,
            "coordination_approved": True,
            "guidance_provided": True,
        }

    except Exception as e:
        logger.error(f"Error requesting human coordination guidance: {e}")
        return {
            "error": str(e),
            "coordination_approved": False,
            "guidance_provided": False,
        }
