"""
Enhanced Agent Coordination API Routes
Demonstrates advanced multi-agent coordination patterns and agent awareness capabilities.
"""

from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from typing import Dict, Any, List, Optional, Literal
import structlog
from datetime import datetime
import uuid

from backend.agents.agent_coordinator import AgentCoordinator
from backend.agents.coordination import enhanced_coordination

router = APIRouter()
logger = structlog.get_logger(__name__)

# Initialize agent coordinator
agent_coordinator = AgentCoordinator()


# Request models for coordination
class CoordinationRequest(BaseModel):
    """Request model for agent coordination"""

    requesting_agent: str
    expertise_needed: str
    specific_question: str
    urgency: Literal["low", "medium", "high"] = "medium"
    agents_involved: Optional[List[str]] = None
    human_oversight_needed: bool = False


class AgentAwarenessQuery(BaseModel):
    """Query model for agent awareness information"""

    agent_name: str
    expertise_area: Optional[str] = None


class SupervisorEscalation(BaseModel):
    """Model for supervisor escalation requests"""

    issue_description: str
    agents_involved: List[str]
    complexity_level: Literal["low", "medium", "high"]
    reasoning: str


class CoordinationRequestModel(BaseModel):
    requesting_agent: str
    expertise_needed: str
    question: str
    urgency: Literal["low", "medium", "high"] = "medium"


class HumanGuidanceRequestModel(BaseModel):
    situation: str
    agents_involved: List[str]
    complexity: Literal["low", "medium", "high"]
    recommended_actions: List[str]


# Simple auth function for testing
def simple_verify_token(request: Request) -> str:
    """Simple token verification for testing"""
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        return "test-user-123"
    return "anonymous"


@router.get("/capabilities")
async def get_agent_capabilities(
    request: Request, user_id: str = Depends(simple_verify_token)
) -> Dict[str, Any]:
    """
    Get comprehensive agent capabilities and awareness information.
    Shows what agents can do and how they can coordinate with each other.
    """
    try:
        logger.info("Fetching agent capabilities and awareness data")

        # Enhanced agent capabilities with coordination patterns
        capabilities = {
            "specialists_team": {
                "team_lead": "pendo",
                "coordination_capability": "global",
                "agents": {
                    "pendo": {
                        "role": "General Climate Specialist & Global Supervisor",
                        "specializations": [
                            "climate_policy",
                            "career_guidance",
                            "coordination",
                            "supervision",
                        ],
                        "coordination_level": "all_teams",
                        "can_escalate_to": ["global_supervisor", "human_oversight"],
                        "can_coordinate_with": ["all_agents"],
                        "supervision_capabilities": [
                            "cross_team_coordination",
                            "complex_decision_making",
                        ],
                        "awareness_tools": [
                            "coordinate_with_specialist",
                            "escalate_to_supervisor",
                            "check_agent_availability",
                        ],
                    },
                    "lauren": {
                        "role": "Climate Policy Specialist",
                        "specializations": [
                            "climate_policy",
                            "regulations",
                            "government_programs",
                        ],
                        "coordination_level": "specialists_veterans_international",
                        "can_escalate_to": ["pendo", "policy_supervisor"],
                        "awareness_tools": ["policy_analysis", "regulatory_guidance"],
                    },
                    "alex": {
                        "role": "Renewable Energy Specialist",
                        "specializations": [
                            "renewable_energy",
                            "solar",
                            "wind",
                            "technical_certifications",
                        ],
                        "coordination_level": "specialists_international",
                        "can_escalate_to": ["pendo", "technical_supervisor"],
                        "awareness_tools": [
                            "technical_assessment",
                            "certification_validation",
                        ],
                    },
                    "jasmine": {
                        "role": "Green Technology & Innovation Specialist",
                        "specializations": [
                            "green_technology",
                            "innovation",
                            "startups",
                            "sustainability",
                        ],
                        "coordination_level": "specialists_international",
                        "can_escalate_to": ["pendo", "innovation_supervisor"],
                        "awareness_tools": [
                            "innovation_research",
                            "startup_evaluation",
                        ],
                    },
                },
            },
            "veterans_team": {
                "team_lead": "marcus",
                "coordination_capability": "veterans_support_specialists",
                "agents": {
                    "marcus": {
                        "role": "Veterans Career Transition Lead",
                        "specializations": [
                            "veteran_transition",
                            "leadership_translation",
                            "career_guidance",
                        ],
                        "coordination_level": "veterans_support_specialists",
                        "can_escalate_to": ["veterans_supervisor", "pendo"],
                        "can_coordinate_with": [
                            "veterans_team",
                            "support_team",
                            "pendo",
                        ],
                        "supervision_capabilities": [
                            "veterans_team",
                            "career_transition_cases",
                        ],
                    },
                    "james": {
                        "role": "Military Skills Translator",
                        "specializations": [
                            "skills_translation",
                            "certification_mapping",
                            "military_equivalents",
                        ],
                        "coordination_level": "veterans_specialists",
                        "can_escalate_to": ["marcus", "veterans_supervisor"],
                    },
                    "sarah": {
                        "role": "Veterans Career Coach",
                        "specializations": [
                            "career_coaching",
                            "job_search",
                            "interview_prep",
                        ],
                        "coordination_level": "veterans_support",
                        "can_escalate_to": ["marcus", "career_services_supervisor"],
                    },
                    "david": {
                        "role": "Veterans Benefits Specialist",
                        "specializations": [
                            "veteran_benefits",
                            "education_benefits",
                            "healthcare",
                        ],
                        "coordination_level": "veterans_support",
                        "can_escalate_to": ["marcus", "benefits_supervisor"],
                    },
                },
            },
            "ej_team": {
                "team_lead": "miguel",
                "coordination_capability": "ej_specialists_international",
                "agents": {
                    "miguel": {
                        "role": "Environmental Justice Lead",
                        "specializations": [
                            "environmental_justice",
                            "community_organizing",
                            "policy_advocacy",
                        ],
                        "coordination_level": "ej_specialists_international",
                        "can_escalate_to": ["ej_supervisor", "pendo"],
                        "supervision_capabilities": ["ej_team", "community_organizing"],
                    },
                    "maria": {
                        "role": "Community Engagement Specialist",
                        "specializations": [
                            "community_engagement",
                            "grassroots_organizing",
                        ],
                        "coordination_level": "ej_international",
                        "can_escalate_to": ["miguel", "community_supervisor"],
                    },
                    "andre": {
                        "role": "Environmental Health Specialist",
                        "specializations": [
                            "environmental_health",
                            "pollution_analysis",
                        ],
                        "coordination_level": "ej_specialists",
                        "can_escalate_to": ["miguel", "health_supervisor"],
                    },
                    "carmen": {
                        "role": "Cultural Liaison & Bilingual Support",
                        "specializations": [
                            "community_relations",
                            "cultural_liaison",
                            "bilingual_support",
                        ],
                        "coordination_level": "ej_international",
                        "can_escalate_to": ["miguel", "cultural_supervisor"],
                        "languages": ["en", "es"],
                    },
                },
            },
            "international_team": {
                "team_lead": "liv",
                "coordination_capability": "international_specialists_ej",
                "agents": {
                    "liv": {
                        "role": "International Policy Lead",
                        "specializations": [
                            "international_policy",
                            "global_climate",
                            "diplomatic_relations",
                        ],
                        "coordination_level": "international_specialists_ej",
                        "can_escalate_to": ["international_supervisor", "pendo"],
                        "supervision_capabilities": [
                            "international_team",
                            "diplomatic_initiatives",
                        ],
                    },
                    "mei": {
                        "role": "Asia-Pacific Specialist",
                        "specializations": [
                            "asia_pacific",
                            "credentials_recognition",
                            "cultural_adaptation",
                        ],
                        "coordination_level": "international_support",
                        "can_escalate_to": ["liv", "regional_supervisor"],
                    },
                    "raj": {
                        "role": "South Asia & Middle East Specialist",
                        "specializations": [
                            "south_asia",
                            "middle_east",
                            "global_sustainability",
                        ],
                        "coordination_level": "international_specialists",
                        "can_escalate_to": ["liv", "regional_supervisor"],
                    },
                    "sofia": {
                        "role": "Europe & Africa Specialist",
                        "specializations": [
                            "europe",
                            "africa",
                            "cross_cultural_communication",
                        ],
                        "coordination_level": "international_ej",
                        "can_escalate_to": ["liv", "regional_supervisor"],
                    },
                },
            },
            "support_team": {
                "team_lead": "michael",
                "coordination_capability": "support_all_teams",
                "agents": {
                    "mai": {
                        "role": "Mental Health & Wellness Specialist",
                        "specializations": [
                            "mental_health",
                            "wellness",
                            "stress_management",
                        ],
                        "coordination_level": "support_veterans",
                        "can_escalate_to": ["support_supervisor", "crisis_coordinator"],
                    },
                    "michael": {
                        "role": "Crisis Intervention Lead",
                        "specializations": ["crisis_intervention", "emergency_support"],
                        "coordination_level": "all_teams",
                        "can_escalate_to": ["emergency_coordinator", "pendo"],
                        "supervision_capabilities": [
                            "crisis_response",
                            "emergency_protocols",
                        ],
                    },
                    "elena": {
                        "role": "Career Counseling & UX Specialist",
                        "specializations": [
                            "career_counseling",
                            "professional_development",
                        ],
                        "coordination_level": "support_veterans_specialists",
                        "can_escalate_to": ["support_supervisor", "career_coordinator"],
                    },
                    "thomas": {
                        "role": "Job Placement & Analytics Specialist",
                        "specializations": [
                            "job_placement",
                            "data_analysis",
                            "market_research",
                        ],
                        "coordination_level": "support_specialists",
                        "can_escalate_to": ["support_supervisor", "data_coordinator"],
                    },
                },
            },
        }

        return {
            "agent_capabilities": capabilities,
            "coordination_patterns": {
                "direct_collaboration": "Agents can collaborate directly within their coordination levels",
                "team_escalation": "Complex issues escalate to team leads",
                "supervisor_coordination": "Multi-team coordination through supervisors",
                "human_oversight": "Critical decisions involve human guidance",
            },
            "awareness_features": {
                "agent_specialization_mapping": "Agents know each other's expertise areas",
                "escalation_path_awareness": "Clear escalation hierarchies",
                "coordination_level_restrictions": "Defined collaboration boundaries",
                "supervision_capabilities": "Agents know who can supervise what",
                "human_guidance_triggers": "Automatic human involvement for complex cases",
            },
            "total_agents": 20,
            "total_teams": 5,
            "coordination_tools_available": [
                "coordinate_with_specialist",
                "escalate_to_supervisor",
                "check_agent_availability",
            ],
        }

    except Exception as e:
        logger.error(f"Error fetching agent capabilities: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to fetch capabilities: {str(e)}"
        )


@router.post("/request")
async def request_coordination(data: CoordinationRequestModel):
    """Request agent coordination"""
    result = await enhanced_coordination.coordinate_agents(
        requesting_agent=data.requesting_agent,
        expertise_needed=data.expertise_needed,
        question=data.question,
        urgency=data.urgency,
    )
    return result


@router.get("/awareness/{agent_name}")
async def get_agent_awareness(
    agent_name: str, request: Request, user_id: str = Depends(simple_verify_token)
) -> Dict[str, Any]:
    """
    Get detailed awareness information for a specific agent.
    Shows coordination capabilities, escalation paths, and collaboration options.
    """
    try:
        logger.info(f"Fetching awareness data for agent: {agent_name}")

        # Comprehensive agent awareness data
        awareness_data = {
            "pendo": {
                "agent_name": "pendo",
                "role": "General Climate Specialist & Global Supervisor",
                "team": "specialists_team",
                "awareness_level": "global",
                "specializations": [
                    "climate_policy",
                    "career_guidance",
                    "coordination",
                    "supervision",
                ],
                "coordination_capabilities": {
                    "can_coordinate_with": "all_agents",
                    "coordination_restrictions": "none",
                    "preferred_collaboration_style": "direct_and_supervisory",
                },
                "escalation_options": {
                    "can_escalate_to": ["global_supervisor", "human_oversight"],
                    "escalation_triggers": [
                        "complex_policy_decisions",
                        "multi_team_conflicts",
                        "high_stakes_career_decisions",
                    ],
                    "escalation_authority": "global",
                },
                "supervision_capabilities": {
                    "can_supervise": [
                        "all_teams",
                        "cross_team_coordination",
                        "complex_decision_making",
                    ],
                    "supervision_scope": "global",
                    "delegation_authority": "full",
                },
                "awareness_tools": {
                    "coordinate_with_specialist": "Find and work with expert agents",
                    "escalate_to_supervisor": "Escalate complex issues to higher authority",
                    "check_agent_availability": "Verify agent capabilities and availability",
                },
                "collaboration_patterns": {
                    "primary_collaborators": [
                        "lauren",
                        "alex",
                        "jasmine",
                        "marcus",
                        "miguel",
                        "liv",
                    ],
                    "escalation_recipients": ["global_supervisor", "human_oversight"],
                    "supervision_scope": "all_20_agents",
                },
            },
            "marcus": {
                "agent_name": "marcus",
                "role": "Veterans Career Transition Lead",
                "team": "veterans_team",
                "awareness_level": "team_lead",
                "specializations": [
                    "veteran_transition",
                    "leadership_translation",
                    "career_guidance",
                ],
                "coordination_capabilities": {
                    "can_coordinate_with": ["veterans_team", "support_team", "pendo"],
                    "coordination_restrictions": "veterans_related_topics",
                    "preferred_collaboration_style": "team_based_with_escalation",
                },
                "escalation_options": {
                    "can_escalate_to": ["veterans_supervisor", "pendo"],
                    "escalation_triggers": [
                        "complex_benefits_cases",
                        "disability_assessments",
                        "multi_agency_coordination",
                    ],
                    "escalation_authority": "team_level",
                },
                "supervision_capabilities": {
                    "can_supervise": ["veterans_team", "career_transition_cases"],
                    "supervision_scope": "veterans_domain",
                    "delegation_authority": "team_level",
                },
            },
            # Add more agents as needed...
        }

        agent_info = awareness_data.get(agent_name)

        if not agent_info:
            # Generate basic awareness for unlisted agents
            agent_info = {
                "agent_name": agent_name,
                "awareness_level": "basic",
                "coordination_capabilities": {
                    "can_escalate_to": ["team_supervisor", "pendo"],
                    "coordination_restrictions": "within_team_and_approved_partners",
                },
                "note": f"Agent {agent_name} has basic awareness capabilities. Full awareness data being loaded.",
            }

        return {
            "agent_awareness": agent_info,
            "global_awareness_features": {
                "agent_discovery": "Agents can find each other based on expertise",
                "capability_mapping": "Agents know what others can do",
                "escalation_awareness": "Clear understanding of escalation paths",
                "collaboration_protocols": "Defined patterns for working together",
                "human_oversight_triggers": "Automatic escalation for complex cases",
            },
            "coordination_status": "active",
            "last_updated": datetime.now().isoformat(),
        }

    except Exception as e:
        logger.error(f"Error fetching agent awareness: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to get awareness data: {str(e)}"
        )


@router.post("/escalate")
async def escalate_to_supervisor(
    escalation: SupervisorEscalation,
    request: Request,
    user_id: str = Depends(simple_verify_token),
) -> Dict[str, Any]:
    """
    Escalate complex issues to supervisors or human oversight.
    Demonstrates hierarchical coordination and human-in-the-loop patterns.
    """
    try:
        logger.info(f"Processing escalation: {escalation.issue_description}")

        # Determine escalation path based on complexity and agents involved
        escalation_hierarchy = {
            "low": ["team_supervisor"],
            "medium": ["team_supervisor", "pendo"],
            "high": ["pendo", "global_supervisor", "human_oversight"],
        }

        escalation_path = escalation_hierarchy.get(
            escalation.complexity_level, ["pendo"]
        )

        # Process escalation through agent coordinator
        escalation_message = f"""ESCALATION REQUEST:
Issue: {escalation.issue_description}
Agents Involved: {', '.join(escalation.agents_involved)}
Complexity: {escalation.complexity_level}
Reasoning: {escalation.reasoning}

This requires supervisor-level coordination and potential human oversight."""

        response = await agent_coordinator.process_message(
            message=escalation_message,
            user_id=user_id,
            conversation_id=str(uuid.uuid4()),
        )

        return {
            "escalation_id": str(uuid.uuid4()),
            "issue_description": escalation.issue_description,
            "complexity_level": escalation.complexity_level,
            "escalation_path": escalation_path,
            "current_supervisor": escalation_path[0],
            "agents_involved": escalation.agents_involved,
            "escalation_reasoning": escalation.reasoning,
            "supervisor_response": {
                "content": response.content,
                "responding_agent": response.agent,
                "team": response.team,
                "confidence": response.confidence,
            },
            "escalation_metadata": {
                "timestamp": datetime.now().isoformat(),
                "escalation_authority": escalation_path[0],
                "human_oversight_required": escalation.complexity_level == "high",
                "estimated_resolution_time": (
                    "immediate"
                    if escalation.complexity_level == "low"
                    else "within_24_hours"
                ),
            },
            "next_steps": [
                f"Supervisor {escalation_path[0]} reviewing case",
                "Coordinating with involved agents",
                "Human oversight if complexity requires it",
                "Resolution and feedback to requesting agents",
            ],
        }

    except Exception as e:
        logger.error(f"Error in escalation processing: {e}")
        raise HTTPException(status_code=500, detail=f"Escalation failed: {str(e)}")


@router.post("/human-guidance")
async def request_human_guidance(data: HumanGuidanceRequestModel):
    """Request human-in-the-loop guidance for coordination"""
    result = await enhanced_coordination.request_human_guidance(
        situation=data.situation,
        agents_involved=data.agents_involved,
        complexity=data.complexity,
        recommended_actions=data.recommended_actions,
    )
    return result
