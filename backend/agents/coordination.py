"""
Enhanced Multi-Agent Coordination Module
Extends existing AgentCoordinator with advanced awareness and collaboration patterns.

This module adds:
- Agent-to-agent communication patterns
- Team-level coordination
- Supervisor escalation paths
- Human-in-the-loop guidance
- Cross-team collaboration workflows
"""

import logging
import json
import asyncio
from datetime import datetime
from typing import Dict, Any, List, Optional, Union, Literal, Tuple
from dataclasses import dataclass
from enum import Enum

from langchain_core.tools import tool
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langgraph.types import Command, Send, interrupt
from backend.database.redis_client import redis_client

logger = logging.getLogger(__name__)


# Lazy import to avoid circular dependency
def get_agent_coordinator():
    """Lazy import of AgentCoordinator to avoid circular dependency"""
    try:
        from backend.agents.agent_coordinator import AgentCoordinator

        return AgentCoordinator()
    except ImportError as e:
        logger.warning(f"Could not import AgentCoordinator: {e}")
        return None


class CoordinationType(Enum):
    """Types of coordination between agents"""

    DIRECT_COLLABORATION = "direct_collaboration"
    EXPERTISE_REQUEST = "expertise_request"
    TEAM_ESCALATION = "team_escalation"
    SUPERVISOR_REVIEW = "supervisor_review"
    HUMAN_GUIDANCE = "human_guidance"


@dataclass
class AgentAwarenessMap:
    """Maps agent capabilities and collaboration patterns"""

    agent_name: str
    team: str
    specializations: List[str]
    collaboration_partners: List[str]
    escalation_path: List[str]
    can_supervise: List[str]
    requires_supervision_for: List[str]


class EnhancedCoordination:
    """
    Enhanced coordination system that works alongside existing AgentCoordinator
    """

    def __init__(self, base_coordinator=None):
        self.base_coordinator = base_coordinator or get_agent_coordinator()
        self.redis = redis_client
        self.agent_awareness_map = self._build_agent_awareness_map()

    def _build_agent_awareness_map(self) -> Dict[str, AgentAwarenessMap]:
        """Build comprehensive agent awareness and collaboration map"""
        return {
            # SPECIALISTS TEAM - Supervisors and Coordinators
            "pendo": AgentAwarenessMap(
                agent_name="pendo",
                team="specialists_team",
                specializations=[
                    "general_climate",
                    "career_guidance",
                    "coordination",
                    "supervision",
                ],
                collaboration_partners=["all_agents"],  # Can collaborate with anyone
                escalation_path=["global_supervisor", "human_oversight"],
                can_supervise=["specialists_team", "cross_team_coordination"],
                requires_supervision_for=["high_stakes_decisions", "policy_changes"],
            ),
            "lauren": AgentAwarenessMap(
                agent_name="lauren",
                team="specialists_team",
                specializations=[
                    "climate_policy",
                    "regulations",
                    "government_programs",
                ],
                collaboration_partners=["pendo", "alex", "jasmine", "marcus", "liv"],
                escalation_path=["pendo", "global_supervisor"],
                can_supervise=["policy_analysis_team"],
                requires_supervision_for=[
                    "regulatory_decisions",
                    "policy_recommendations",
                ],
            ),
            "alex": AgentAwarenessMap(
                agent_name="alex",
                team="specialists_team",
                specializations=[
                    "renewable_energy",
                    "technical_certifications",
                    "solar",
                    "wind",
                ],
                collaboration_partners=["lauren", "jasmine", "raj", "liv"],
                escalation_path=["pendo", "technical_supervisor"],
                can_supervise=["technical_analysis"],
                requires_supervision_for=[
                    "certification_validation",
                    "technical_standards",
                ],
            ),
            "jasmine": AgentAwarenessMap(
                agent_name="jasmine",
                team="specialists_team",
                specializations=[
                    "green_technology",
                    "innovation",
                    "startups",
                    "sustainability",
                ],
                collaboration_partners=["alex", "lauren", "thomas", "sofia"],
                escalation_path=["pendo", "innovation_supervisor"],
                can_supervise=["innovation_projects"],
                requires_supervision_for=[
                    "startup_investments",
                    "technology_validation",
                ],
            ),
            # VETERANS TEAM
            "marcus": AgentAwarenessMap(
                agent_name="marcus",
                team="veterans_team",
                specializations=[
                    "veteran_career_transition",
                    "leadership_translation",
                    "military_skills",
                ],
                collaboration_partners=["james", "sarah", "david", "pendo", "elena"],
                escalation_path=["veterans_supervisor", "pendo"],
                can_supervise=["veterans_team", "career_transition_cases"],
                requires_supervision_for=[
                    "complex_benefits_cases",
                    "disability_assessments",
                ],
            ),
            "james": AgentAwarenessMap(
                agent_name="james",
                team="veterans_team",
                specializations=[
                    "military_skills_translation",
                    "civilian_equivalents",
                    "certification_mapping",
                ],
                collaboration_partners=["marcus", "sarah", "alex", "lauren"],
                escalation_path=["marcus", "veterans_supervisor"],
                can_supervise=["skills_translation_projects"],
                requires_supervision_for=[
                    "certification_disputes",
                    "skills_validation",
                ],
            ),
            "sarah": AgentAwarenessMap(
                agent_name="sarah",
                team="veterans_team",
                specializations=["career_coaching", "job_search", "interview_prep"],
                collaboration_partners=["marcus", "james", "elena", "thomas"],
                escalation_path=["marcus", "career_services_supervisor"],
                can_supervise=["career_coaching_sessions"],
                requires_supervision_for=[
                    "career_change_guidance",
                    "salary_negotiations",
                ],
            ),
            "david": AgentAwarenessMap(
                agent_name="david",
                team="veterans_team",
                specializations=[
                    "veteran_benefits",
                    "education_benefits",
                    "healthcare",
                ],
                collaboration_partners=["marcus", "mai", "michael"],
                escalation_path=["marcus", "benefits_specialist_supervisor"],
                can_supervise=["benefits_analysis"],
                requires_supervision_for=[
                    "complex_benefits_appeals",
                    "medical_evaluations",
                ],
            ),
            # ENVIRONMENTAL JUSTICE TEAM
            "miguel": AgentAwarenessMap(
                agent_name="miguel",
                team="ej_team",
                specializations=[
                    "environmental_justice",
                    "community_organizing",
                    "policy_advocacy",
                ],
                collaboration_partners=["maria", "andre", "carmen", "lauren", "liv"],
                escalation_path=["ej_supervisor", "pendo"],
                can_supervise=["ej_team", "community_organizing_efforts"],
                requires_supervision_for=[
                    "policy_advocacy_campaigns",
                    "legal_challenges",
                ],
            ),
            "maria": AgentAwarenessMap(
                agent_name="maria",
                team="ej_team",
                specializations=[
                    "community_engagement",
                    "grassroots_organizing",
                    "cultural_competency",
                ],
                collaboration_partners=["miguel", "carmen", "sofia", "mei"],
                escalation_path=["miguel", "community_engagement_supervisor"],
                can_supervise=["community_engagement_projects"],
                requires_supervision_for=[
                    "sensitive_community_issues",
                    "cross_cultural_conflicts",
                ],
            ),
            "andre": AgentAwarenessMap(
                agent_name="andre",
                team="ej_team",
                specializations=[
                    "environmental_health",
                    "pollution_analysis",
                    "health_advocacy",
                ],
                collaboration_partners=["miguel", "alex", "mai"],
                escalation_path=["miguel", "health_advocacy_supervisor"],
                can_supervise=["health_analysis_projects"],
                requires_supervision_for=[
                    "health_emergency_responses",
                    "pollution_assessments",
                ],
            ),
            "carmen": AgentAwarenessMap(
                agent_name="carmen",
                team="ej_team",
                specializations=[
                    "community_relations",
                    "cultural_liaison",
                    "bilingual_support",
                ],
                collaboration_partners=["maria", "miguel", "sofia", "mei"],
                escalation_path=["miguel", "cultural_services_supervisor"],
                can_supervise=["bilingual_communications"],
                requires_supervision_for=[
                    "cultural_sensitivity_issues",
                    "translation_disputes",
                ],
            ),
            # INTERNATIONAL TEAM
            "liv": AgentAwarenessMap(
                agent_name="liv",
                team="international_team",
                specializations=[
                    "international_policy",
                    "global_climate",
                    "diplomatic_relations",
                ],
                collaboration_partners=["mei", "raj", "sofia", "lauren", "miguel"],
                escalation_path=["international_supervisor", "pendo"],
                can_supervise=["international_team", "diplomatic_initiatives"],
                requires_supervision_for=[
                    "international_agreements",
                    "diplomatic_protocols",
                ],
            ),
            "mei": AgentAwarenessMap(
                agent_name="mei",
                team="international_team",
                specializations=[
                    "asia_pacific",
                    "credentials_recognition",
                    "cultural_adaptation",
                ],
                collaboration_partners=["liv", "raj", "carmen", "maria"],
                escalation_path=["liv", "asia_pacific_supervisor"],
                can_supervise=["asia_pacific_projects"],
                requires_supervision_for=["credential_disputes", "visa_applications"],
            ),
            "raj": AgentAwarenessMap(
                agent_name="raj",
                team="international_team",
                specializations=["south_asia", "middle_east", "global_sustainability"],
                collaboration_partners=["liv", "mei", "alex", "jasmine"],
                escalation_path=["liv", "regional_supervisor"],
                can_supervise=["regional_sustainability_projects"],
                requires_supervision_for=[
                    "geopolitical_sensitivities",
                    "regional_conflicts",
                ],
            ),
            "sofia": AgentAwarenessMap(
                agent_name="sofia",
                team="international_team",
                specializations=["europe", "africa", "cross_cultural_communication"],
                collaboration_partners=["liv", "carmen", "maria", "jasmine"],
                escalation_path=["liv", "regional_supervisor"],
                can_supervise=["european_african_projects"],
                requires_supervision_for=[
                    "eu_regulations",
                    "african_development_programs",
                ],
            ),
            # SUPPORT TEAM
            "mai": AgentAwarenessMap(
                agent_name="mai",
                team="support_team",
                specializations=["mental_health", "wellness", "stress_management"],
                collaboration_partners=["michael", "elena", "david", "marcus"],
                escalation_path=["support_supervisor", "crisis_coordinator"],
                can_supervise=["mental_health_interventions"],
                requires_supervision_for=[
                    "crisis_situations",
                    "mental_health_emergencies",
                ],
            ),
            "michael": AgentAwarenessMap(
                agent_name="michael",
                team="support_team",
                specializations=[
                    "crisis_intervention",
                    "emergency_support",
                    "technical_assistance",
                ],
                collaboration_partners=[
                    "mai",
                    "elena",
                    "all_agents",
                ],  # Crisis support for all
                escalation_path=["emergency_coordinator", "pendo"],
                can_supervise=["crisis_response_team"],
                requires_supervision_for=[
                    "life_threatening_situations",
                    "legal_emergencies",
                ],
            ),
            "elena": AgentAwarenessMap(
                agent_name="elena",
                team="support_team",
                specializations=[
                    "career_counseling",
                    "professional_development",
                    "user_experience",
                ],
                collaboration_partners=["thomas", "sarah", "marcus", "mai"],
                escalation_path=["support_supervisor", "career_services_coordinator"],
                can_supervise=["career_development_programs"],
                requires_supervision_for=["performance_issues", "workplace_conflicts"],
            ),
            "thomas": AgentAwarenessMap(
                agent_name="thomas",
                team="support_team",
                specializations=[
                    "job_placement",
                    "data_analysis",
                    "analytics",
                    "market_research",
                ],
                collaboration_partners=["elena", "sarah", "jasmine", "pendo"],
                escalation_path=["support_supervisor", "data_coordinator"],
                can_supervise=["data_analysis_projects"],
                requires_supervision_for=[
                    "data_privacy_issues",
                    "algorithm_bias_concerns",
                ],
            ),
        }

    def get_agent_awareness(self, agent_name: str) -> Optional[AgentAwarenessMap]:
        """Get awareness map for specific agent"""
        return self.agent_awareness_map.get(agent_name)

    def find_collaboration_partners(
        self, agent_name: str, expertise_needed: str
    ) -> List[str]:
        """Find appropriate collaboration partners for an agent"""
        agent_map = self.agent_awareness_map.get(agent_name)
        if not agent_map:
            return []

        # Find partners who have the needed expertise
        suitable_partners = []
        expertise_lower = expertise_needed.lower()

        for partner_name in agent_map.collaboration_partners:
            if partner_name == "all_agents":
                # Find all agents with relevant expertise
                for other_agent, other_map in self.agent_awareness_map.items():
                    if other_agent != agent_name:
                        if any(
                            expertise_lower in spec.lower()
                            for spec in other_map.specializations
                        ):
                            suitable_partners.append(other_agent)
            else:
                partner_map = self.agent_awareness_map.get(partner_name)
                if partner_map and any(
                    expertise_lower in spec.lower()
                    for spec in partner_map.specializations
                ):
                    suitable_partners.append(partner_name)

        return suitable_partners[:3]  # Return top 3 partners

    def get_escalation_path(self, agent_name: str) -> List[str]:
        """Get escalation path for an agent"""
        agent_map = self.agent_awareness_map.get(agent_name)
        return agent_map.escalation_path if agent_map else ["pendo", "human_oversight"]

    def can_supervise(self, supervisor: str, supervisee: str) -> bool:
        """Check if one agent can supervise another"""
        supervisor_map = self.agent_awareness_map.get(supervisor)
        supervisee_map = self.agent_awareness_map.get(supervisee)

        if not supervisor_map or not supervisee_map:
            return False

        # Check direct supervision capability
        return (
            supervisee in supervisor_map.can_supervise
            or supervisee_map.team in supervisor_map.can_supervise
            or "all_agents" in supervisor_map.can_supervise
        )

    async def coordinate_agents(
        self,
        requesting_agent: str,
        expertise_needed: str,
        question: str,
        urgency: Literal["low", "medium", "high"] = "medium",
    ) -> Dict[str, Any]:
        """
        Coordinate agents based on awareness map and collaboration patterns
        """
        try:
            logger.info(
                f"Coordinating agents for {requesting_agent}: {expertise_needed}"
            )

            # Find suitable collaboration partners
            partners = self.find_collaboration_partners(
                requesting_agent, expertise_needed
            )

            if not partners:
                # No direct partners, escalate
                escalation_path = self.get_escalation_path(requesting_agent)
                return {
                    "coordination_type": CoordinationType.TEAM_ESCALATION.value,
                    "action": "escalate",
                    "escalation_target": escalation_path[0],
                    "escalation_path": escalation_path,
                    "reason": f"No collaboration partners found for {expertise_needed}",
                }

            # Determine coordination type based on urgency and complexity
            if urgency == "high" or len(partners) > 2:
                coordination_type = CoordinationType.SUPERVISOR_REVIEW
                supervisor = self._find_appropriate_supervisor(
                    requesting_agent, partners
                )

                return {
                    "coordination_type": coordination_type.value,
                    "action": "supervisor_coordination",
                    "supervisor": supervisor,
                    "collaboration_partners": partners,
                    "coordination_plan": f"Supervisor {supervisor} will coordinate between {requesting_agent} and {partners}",
                }

            else:
                # Direct collaboration
                primary_partner = partners[0]

                # Store coordination request in Redis
                coordination_key = f"coordination:{requesting_agent}:{primary_partner}:{datetime.now().isoformat()}"
                coordination_data = {
                    "requesting_agent": requesting_agent,
                    "responding_agent": primary_partner,
                    "expertise_needed": expertise_needed,
                    "question": question,
                    "urgency": urgency,
                    "timestamp": datetime.now().isoformat(),
                }

                await self.redis.setex(
                    coordination_key, 3600, json.dumps(coordination_data)
                )

                return {
                    "coordination_type": CoordinationType.DIRECT_COLLABORATION.value,
                    "action": "direct_collaborate",
                    "primary_partner": primary_partner,
                    "backup_partners": partners[1:],
                    "coordination_key": coordination_key,
                    "message": f"Collaborating with {primary_partner} for {expertise_needed}",
                }

        except Exception as e:
            logger.error(f"Error in coordinate_agents: {e}")
            return {
                "coordination_type": "error",
                "action": "escalate",
                "error": str(e),
                "escalation_target": "pendo",
            }

    def _find_appropriate_supervisor(
        self, requesting_agent: str, partners: List[str]
    ) -> str:
        """Find appropriate supervisor for multi-agent coordination"""
        # Find a supervisor who can supervise all involved agents
        all_agents = [requesting_agent] + partners

        for supervisor_name, supervisor_map in self.agent_awareness_map.items():
            if all(self.can_supervise(supervisor_name, agent) for agent in all_agents):
                return supervisor_name

        # Fallback to team supervisors or pendo
        requesting_map = self.agent_awareness_map.get(requesting_agent)
        if requesting_map and requesting_map.escalation_path:
            return requesting_map.escalation_path[0]

        return "pendo"  # Ultimate fallback

    async def request_human_guidance(
        self,
        situation: str,
        agents_involved: List[str],
        complexity: Literal["low", "medium", "high"],
        recommended_actions: List[str],
    ) -> Dict[str, Any]:
        """Request human guidance for complex coordination scenarios"""
        try:
            # Prepare context for human decision
            agent_context = {}
            for agent in agents_involved:
                agent_map = self.agent_awareness_map.get(agent)
                if agent_map:
                    agent_context[agent] = {
                        "team": agent_map.team,
                        "specializations": agent_map.specializations,
                        "can_supervise": agent_map.can_supervise,
                        "escalation_path": agent_map.escalation_path,
                    }

            guidance_request = {
                "type": "coordination_guidance",
                "situation": situation,
                "complexity": complexity,
                "agents_involved": agents_involved,
                "agent_context": agent_context,
                "recommended_actions": recommended_actions,
                "escalation_options": [
                    "approve_recommended_coordination",
                    "modify_coordination_plan",
                    "escalate_to_supervisor",
                    "request_additional_information",
                    "postpone_decision",
                ],
                "urgency_assessment": (
                    "immediate" if complexity == "high" else "standard"
                ),
            }

            # Use LangGraph interrupt for human input
            human_decision = interrupt(guidance_request)

            return {
                "human_guidance_received": True,
                "decision": human_decision,
                "guidance_context": guidance_request,
            }

        except Exception as e:
            logger.error(f"Error requesting human guidance: {e}")
            return {
                "human_guidance_received": False,
                "error": str(e),
                "fallback_action": "escalate_to_pendo",
            }


# Global instance for enhanced coordination
_enhanced_coordination_instance = None


def get_enhanced_coordination():
    """Get or create the global enhanced coordination instance"""
    global _enhanced_coordination_instance
    if _enhanced_coordination_instance is None:
        _enhanced_coordination_instance = EnhancedCoordination()
    return _enhanced_coordination_instance


# Create a property-like object for compatibility
class LazyEnhancedCoordination:
    """Lazy-loading wrapper for enhanced coordination to avoid circular imports"""

    def __getattr__(self, name):
        return getattr(get_enhanced_coordination(), name)


# For backward compatibility and framework imports
enhanced_coordination = LazyEnhancedCoordination()


# Enhanced coordination tool for agents
@tool
async def request_enhanced_coordination(
    requesting_agent: str,
    expertise_needed: str,
    specific_question: str,
    urgency: Literal["low", "medium", "high"] = "medium",
    human_oversight_needed: bool = False,
) -> Command:
    """
    Enhanced coordination tool that uses agent awareness patterns.
    Agents can request help from specific experts or escalate to supervisors.
    """
    try:
        enhanced_coordination = get_enhanced_coordination()  # Lazy load here

        if human_oversight_needed or urgency == "high":
            # Request human guidance for complex scenarios
            guidance = await enhanced_coordination.request_human_guidance(
                situation=f"Agent {requesting_agent} needs {expertise_needed}: {specific_question}",
                agents_involved=[requesting_agent],
                complexity=urgency,
                recommended_actions=[
                    "coordinate_with_expert",
                    "escalate_to_supervisor",
                    "provide_direct_assistance",
                ],
            )

            if guidance.get("human_guidance_received"):
                decision = guidance.get("decision", "coordinate_with_expert")
                if decision == "escalate_to_supervisor":
                    escalation_path = enhanced_coordination.get_escalation_path(
                        requesting_agent
                    )
                    return Command(
                        goto=escalation_path[0],
                        update={
                            "escalation_reason": f"Human guidance: escalate {expertise_needed} request",
                            "original_request": specific_question,
                            "human_guided": True,
                        },
                    )

        # Standard enhanced coordination
        coordination_result = await enhanced_coordination.coordinate_agents(
            requesting_agent=requesting_agent,
            expertise_needed=expertise_needed,
            question=specific_question,
            urgency=urgency,
        )

        action = coordination_result.get("action", "direct_collaborate")

        if action == "direct_collaborate":
            target_agent = coordination_result.get("primary_partner", "pendo")
            return Command(
                goto=target_agent,
                update={
                    "coordination_request": {
                        "from_agent": requesting_agent,
                        "expertise_needed": expertise_needed,
                        "question": specific_question,
                        "coordination_type": coordination_result.get(
                            "coordination_type"
                        ),
                        "coordination_key": coordination_result.get("coordination_key"),
                    }
                },
            )

        elif action == "supervisor_coordination":
            supervisor = coordination_result.get("supervisor", "pendo")
            return Command(
                goto=supervisor,
                update={
                    "supervisor_coordination": {
                        "requesting_agent": requesting_agent,
                        "collaboration_partners": coordination_result.get(
                            "collaboration_partners", []
                        ),
                        "coordination_plan": coordination_result.get(
                            "coordination_plan"
                        ),
                        "expertise_needed": expertise_needed,
                        "question": specific_question,
                    }
                },
            )

        elif action == "escalate":
            escalation_target = coordination_result.get("escalation_target", "pendo")
            return Command(
                goto=escalation_target,
                update={
                    "escalation": {
                        "from_agent": requesting_agent,
                        "reason": coordination_result.get(
                            "reason", "Coordination escalation needed"
                        ),
                        "expertise_needed": expertise_needed,
                        "question": specific_question,
                        "escalation_path": coordination_result.get(
                            "escalation_path", []
                        ),
                    }
                },
            )

        else:
            # Fallback to pendo
            return Command(
                goto="pendo",
                update={
                    "fallback_coordination": {
                        "from_agent": requesting_agent,
                        "expertise_needed": expertise_needed,
                        "question": specific_question,
                        "coordination_error": coordination_result.get(
                            "error", "Unknown coordination issue"
                        ),
                    }
                },
            )

    except Exception as e:
        logger.error(f"Error in enhanced coordination: {e}")
        return Command(
            goto="pendo",
            update={
                "coordination_error": {
                    "error": str(e),
                    "from_agent": requesting_agent,
                    "failed_request": specific_question,
                }
            },
        )


# Tool for agents to check their awareness capabilities
@tool
def get_agent_awareness_info(agent_name: str) -> Dict[str, Any]:
    """
    Get comprehensive awareness information for an agent.
    Helps agents understand their collaboration options and escalation paths.
    """
    try:
        enhanced_coordination = get_enhanced_coordination()  # Lazy load here
        agent_map = enhanced_coordination.get_agent_awareness(agent_name)

        if not agent_map:
            return {
                "error": f"No awareness map found for agent {agent_name}",
                "fallback_escalation": ["pendo", "human_oversight"],
            }

        return {
            "agent_name": agent_map.agent_name,
            "team": agent_map.team,
            "specializations": agent_map.specializations,
            "collaboration_partners": agent_map.collaboration_partners,
            "escalation_path": agent_map.escalation_path,
            "supervision_capabilities": {
                "can_supervise": agent_map.can_supervise,
                "requires_supervision_for": agent_map.requires_supervision_for,
            },
            "coordination_recommendations": {
                "direct_collaboration_available": len(agent_map.collaboration_partners)
                > 0,
                "supervision_available": len(agent_map.can_supervise) > 0,
                "escalation_options": len(agent_map.escalation_path),
            },
        }

    except Exception as e:
        logger.error(f"Error getting agent awareness info: {e}")
        return {
            "error": str(e),
            "agent_name": agent_name,
            "fallback_info": "Contact pendo for coordination assistance",
        }
