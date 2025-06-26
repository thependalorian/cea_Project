"""
Agent configuration for the Climate Economy Assistant.
Defines settings for each agent in the system.
"""

import os
from typing import Dict, Any, List, Optional
from enum import Enum
from backend.adapters import models as model_adapter


class AgentType(str, Enum):
    """Enumeration of agent types."""

    GENERAL = "general"
    VETERANS = "veterans"
    INTERNATIONAL = "international"
    ENVIRONMENTAL_JUSTICE = "environmental_justice"
    CAREERS = "careers"
    CRISIS = "crisis"
    RESOURCES = "resources"
    SUPPORT = "support"


class AgentConfig:
    """Configuration for all agents in the system."""

    # Default agent settings
    DEFAULT_MODEL = os.getenv("DEFAULT_MODEL", "gpt-4-turbo")
    DEFAULT_TEMPERATURE = 0.2
    DEFAULT_STREAMING = True

    # Agent definitions with capabilities and specializations
    AGENTS = {
        "pendo": {
            "name": "Pendo",
            "description": "General support agent",
            "type": AgentType.GENERAL,
            "model": model_adapter.create_langchain_llm(
                provider=os.getenv("PENDO_PROVIDER", "openai"),
                model=os.getenv("PENDO_MODEL", DEFAULT_MODEL),
                temperature=float(os.getenv("PENDO_TEMP", "0.2")),
            ),
            "temperature": float(os.getenv("PENDO_TEMP", "0.2")),
            "specializations": ["career_counseling", "general_support"],
            "capabilities": [
                "SEMANTIC_ANALYSIS",
                "CAREER_GUIDANCE",
                "RESOURCE_DISCOVERY",
                "SKILLS_TRANSLATION",
                "CRISIS_INTERVENTION",
            ],
            "primary_functions": [
                "Initial user assessment",
                "General career guidance",
                "Routing to specialized agents",
                "Resume analysis",
                "Skills translation",
            ],
            "streaming": True,
        },
        "marcus": {
            "name": "Marcus",
            "description": "Veterans specialist",
            "type": AgentType.VETERANS,
            "model": model_adapter.create_langchain_llm(
                provider=os.getenv("MARCUS_PROVIDER", "openai"),
                model=os.getenv("MARCUS_MODEL", DEFAULT_MODEL),
                temperature=float(os.getenv("MARCUS_TEMP", "0.2")),
            ),
            "temperature": float(os.getenv("MARCUS_TEMP", "0.2")),
            "specializations": ["veterans_affairs", "military_transition"],
            "capabilities": [
                "VETERAN_SUPPORT",
                "SEMANTIC_ANALYSIS",
                "CAREER_GUIDANCE",
                "SKILLS_TRANSLATION",
            ],
            "primary_functions": [
                "Military to civilian skills translation",
                "Veterans benefits navigation",
                "Career transition support",
                "Resume optimization for veterans",
            ],
            "streaming": True,
        },
        "liv": {
            "name": "Liv",
            "description": "International specialist",
            "type": AgentType.INTERNATIONAL,
            "model": model_adapter.create_langchain_llm(
                provider=os.getenv("LIV_PROVIDER", "openai"),
                model=os.getenv("LIV_MODEL", DEFAULT_MODEL),
                temperature=float(os.getenv("LIV_TEMP", "0.2")),
            ),
            "temperature": float(os.getenv("LIV_TEMP", "0.2")),
            "specializations": ["international_workers", "credential_transfer"],
            "capabilities": [
                "INTERNATIONAL_CREDENTIALS",
                "CULTURAL_ADAPTATION",
                "SEMANTIC_ANALYSIS",
                "CAREER_GUIDANCE",
            ],
            "primary_functions": [
                "International credentials evaluation",
                "Work visa information",
                "Cultural adaptation support",
                "Global climate opportunities",
            ],
            "streaming": True,
        },
        "miguel": {
            "name": "Miguel",
            "description": "Environmental Justice specialist",
            "type": AgentType.ENVIRONMENTAL_JUSTICE,
            "model": model_adapter.create_langchain_llm(
                provider=os.getenv("MIGUEL_PROVIDER", "openai"),
                model=os.getenv("MIGUEL_MODEL", DEFAULT_MODEL),
                temperature=float(os.getenv("MIGUEL_TEMP", "0.2")),
            ),
            "temperature": float(os.getenv("MIGUEL_TEMP", "0.2")),
            "specializations": ["environmental_justice", "community_development"],
            "capabilities": [
                "ENVIRONMENTAL_JUSTICE",
                "SEMANTIC_ANALYSIS",
                "RESOURCE_DISCOVERY",
                "CAREER_GUIDANCE",
            ],
            "primary_functions": [
                "Community resource identification",
                "Environmental justice education",
                "Local climate initiatives",
                "Community engagement strategies",
            ],
            "streaming": True,
        },
        "jasmine": {
            "name": "Jasmine",
            "description": "MA Resources specialist",
            "type": AgentType.RESOURCES,
            "model": model_adapter.create_langchain_llm(
                provider=os.getenv("JASMINE_PROVIDER", "openai"),
                model=os.getenv("JASMINE_MODEL", DEFAULT_MODEL),
                temperature=float(os.getenv("JASMINE_TEMP", "0.2")),
            ),
            "temperature": float(os.getenv("JASMINE_TEMP", "0.2")),
            "specializations": ["massachusetts_resources", "local_programs"],
            "capabilities": [
                "RESOURCE_DISCOVERY",
                "SEMANTIC_ANALYSIS",
                "CAREER_GUIDANCE",
            ],
            "primary_functions": [
                "MA climate initiatives navigation",
                "Local training program identification",
                "Grant and funding opportunities",
                "Regional career pathway guidance",
            ],
            "streaming": True,
        },
        "lauren": {
            "name": "Lauren",
            "description": "Environmental Justice specialist",
            "type": AgentType.ENVIRONMENTAL_JUSTICE,
            "model": model_adapter.create_langchain_llm(
                provider=os.getenv("LAUREN_PROVIDER", "openai"),
                model=os.getenv("LAUREN_MODEL", DEFAULT_MODEL),
                temperature=float(os.getenv("LAUREN_TEMP", "0.2")),
            ),
            "temperature": float(os.getenv("LAUREN_TEMP", "0.2")),
            "specializations": ["environmental_justice", "community_engagement"],
            "capabilities": [
                "ENVIRONMENTAL_JUSTICE",
                "SEMANTIC_ANALYSIS",
                "RESOURCE_DISCOVERY",
                "COMMUNITY_ENGAGEMENT",
            ],
            "primary_functions": [
                "Environmental justice analysis",
                "Community impact assessment",
                "Resource identification",
                "Action planning",
                "Stakeholder engagement",
            ],
            "streaming": True,
        },
        "alex": {
            "name": "Alex",
            "description": "Crisis Support specialist",
            "type": AgentType.CRISIS,
            "model": model_adapter.create_langchain_llm(
                provider=os.getenv("ALEX_PROVIDER", "openai"),
                model=os.getenv("ALEX_MODEL", DEFAULT_MODEL),
                temperature=float(os.getenv("ALEX_TEMP", "0.1")),
            ),
            "temperature": float(
                os.getenv("ALEX_TEMP", "0.1")
            ),  # Lower temperature for more predictable responses
            "specializations": ["crisis_intervention", "mental_health"],
            "capabilities": [
                "CRISIS_INTERVENTION",
                "SEMANTIC_ANALYSIS",
                "RESOURCE_DISCOVERY",
            ],
            "primary_functions": [
                "Crisis identification",
                "Immediate support resources",
                "De-escalation techniques",
                "Mental health resource connection",
            ],
            "streaming": True,
        },
        # Support Team agents
        "mai": {
            "name": "Mai",
            "description": "Resume Analysis and Optimization specialist",
            "type": AgentType.SUPPORT,
            "model": model_adapter.create_langchain_llm(
                provider=os.getenv("MAI_PROVIDER", "openai"),
                model=os.getenv("MAI_MODEL", DEFAULT_MODEL),
                temperature=float(os.getenv("MAI_TEMP", "0.2")),
            ),
            "temperature": float(os.getenv("MAI_TEMP", "0.2")),
            "specializations": ["resume_analysis", "ats_optimization"],
            "capabilities": [
                "RESUME_ANALYSIS",
                "SEMANTIC_ANALYSIS",
                "SKILLS_TRANSLATION",
                "CAREER_GUIDANCE",
            ],
            "primary_functions": [
                "Resume analysis and optimization",
                "ATS compatibility scoring",
                "Skills extraction and matching",
                "Job application optimization",
            ],
            "streaming": True,
        },
        "michael": {
            "name": "Michael",
            "description": "Technical Support specialist",
            "type": AgentType.GENERAL,
            "model": model_adapter.create_langchain_llm(
                provider=os.getenv("MICHAEL_PROVIDER", "openai"),
                model=os.getenv("MICHAEL_MODEL", DEFAULT_MODEL),
                temperature=float(os.getenv("MICHAEL_TEMP", "0.2")),
            ),
            "temperature": float(os.getenv("MICHAEL_TEMP", "0.2")),
            "specializations": ["technical_support", "platform_assistance"],
            "capabilities": [
                "TECHNICAL_SUPPORT",
                "SEMANTIC_ANALYSIS",
                "RESOURCE_DISCOVERY",
            ],
            "primary_functions": [
                "Platform technical support",
                "User assistance and guidance",
                "System troubleshooting",
                "Feature explanation",
            ],
            "streaming": True,
        },
        "elena": {
            "name": "Elena",
            "description": "User Experience specialist",
            "type": AgentType.GENERAL,
            "model": model_adapter.create_langchain_llm(
                provider=os.getenv("ELENA_PROVIDER", "openai"),
                model=os.getenv("ELENA_MODEL", DEFAULT_MODEL),
                temperature=float(os.getenv("ELENA_TEMP", "0.2")),
            ),
            "temperature": float(os.getenv("ELENA_TEMP", "0.2")),
            "specializations": ["user_experience", "accessibility"],
            "capabilities": [
                "USER_EXPERIENCE",
                "SEMANTIC_ANALYSIS",
                "ACCESSIBILITY_SUPPORT",
            ],
            "primary_functions": [
                "User experience optimization",
                "Accessibility guidance",
                "Interface assistance",
                "User feedback collection",
            ],
            "streaming": True,
        },
        "thomas": {
            "name": "Thomas",
            "description": "Data Analysis specialist",
            "type": AgentType.GENERAL,
            "model": model_adapter.create_langchain_llm(
                provider=os.getenv("THOMAS_PROVIDER", "openai"),
                model=os.getenv("THOMAS_MODEL", DEFAULT_MODEL),
                temperature=float(os.getenv("THOMAS_TEMP", "0.2")),
            ),
            "temperature": float(os.getenv("THOMAS_TEMP", "0.2")),
            "specializations": ["data_analysis", "reporting"],
            "capabilities": ["DATA_ANALYSIS", "SEMANTIC_ANALYSIS", "REPORTING"],
            "primary_functions": [
                "Data analysis and insights",
                "Report generation",
                "Trend identification",
                "Performance metrics",
            ],
            "streaming": True,
        },
        # Veterans Team agents
        "james": {
            "name": "James",
            "description": "Military Skills Translator specialist",
            "type": AgentType.VETERANS,
            "model": model_adapter.create_langchain_llm(
                provider=os.getenv("JAMES_PROVIDER", "openai"),
                model=os.getenv("JAMES_MODEL", DEFAULT_MODEL),
                temperature=float(os.getenv("JAMES_TEMP", "0.2")),
            ),
            "temperature": float(os.getenv("JAMES_TEMP", "0.2")),
            "specializations": ["military_skills_translation", "veteran_transition"],
            "capabilities": [
                "VETERAN_SUPPORT",
                "SKILLS_TRANSLATION",
                "SEMANTIC_ANALYSIS",
                "CAREER_GUIDANCE",
            ],
            "primary_functions": [
                "Military to civilian skills translation",
                "Career transition planning",
                "Military experience optimization",
                "Veteran-specific job matching",
            ],
            "streaming": True,
        },
        "sarah": {
            "name": "Sarah",
            "description": "Veterans Benefits specialist",
            "type": AgentType.VETERANS,
            "model": model_adapter.create_langchain_llm(
                provider=os.getenv("SARAH_PROVIDER", "openai"),
                model=os.getenv("SARAH_MODEL", DEFAULT_MODEL),
                temperature=float(os.getenv("SARAH_TEMP", "0.2")),
            ),
            "temperature": float(os.getenv("SARAH_TEMP", "0.2")),
            "specializations": ["veterans_benefits", "disability_support"],
            "capabilities": [
                "VETERAN_SUPPORT",
                "BENEFITS_NAVIGATION",
                "SEMANTIC_ANALYSIS",
                "RESOURCE_DISCOVERY",
            ],
            "primary_functions": [
                "Veterans benefits navigation",
                "Disability accommodation support",
                "VA resources guidance",
                "Benefits optimization",
            ],
            "streaming": True,
        },
        "david": {
            "name": "David",
            "description": "Veterans Education specialist",
            "type": AgentType.VETERANS,
            "model": model_adapter.create_langchain_llm(
                provider=os.getenv("DAVID_PROVIDER", "openai"),
                model=os.getenv("DAVID_MODEL", DEFAULT_MODEL),
                temperature=float(os.getenv("DAVID_TEMP", "0.2")),
            ),
            "temperature": float(os.getenv("DAVID_TEMP", "0.2")),
            "specializations": ["veterans_education", "gi_bill"],
            "capabilities": [
                "VETERAN_SUPPORT",
                "EDUCATION_GUIDANCE",
                "SEMANTIC_ANALYSIS",
                "CAREER_GUIDANCE",
            ],
            "primary_functions": [
                "GI Bill guidance and optimization",
                "Educational pathway planning",
                "Certification and training programs",
                "Academic transition support",
            ],
            "streaming": True,
        },
        # Environmental Justice Team agents
        "maria": {
            "name": "Maria",
            "description": "Community Engagement specialist",
            "type": AgentType.ENVIRONMENTAL_JUSTICE,
            "model": model_adapter.create_langchain_llm(
                provider=os.getenv("MARIA_PROVIDER", "openai"),
                model=os.getenv("MARIA_MODEL", DEFAULT_MODEL),
                temperature=float(os.getenv("MARIA_TEMP", "0.2")),
            ),
            "temperature": float(os.getenv("MARIA_TEMP", "0.2")),
            "specializations": ["community_engagement", "organizing"],
            "capabilities": [
                "ENVIRONMENTAL_JUSTICE",
                "COMMUNITY_ENGAGEMENT",
                "SEMANTIC_ANALYSIS",
                "RESOURCE_DISCOVERY",
            ],
            "primary_functions": [
                "Community outreach and organizing",
                "Stakeholder engagement strategies",
                "Environmental justice advocacy",
                "Community resource mobilization",
            ],
            "streaming": True,
        },
        "andre": {
            "name": "Andre",
            "description": "Environmental Policy specialist",
            "type": AgentType.ENVIRONMENTAL_JUSTICE,
            "model": model_adapter.create_langchain_llm(
                provider=os.getenv("ANDRE_PROVIDER", "openai"),
                model=os.getenv("ANDRE_MODEL", DEFAULT_MODEL),
                temperature=float(os.getenv("ANDRE_TEMP", "0.2")),
            ),
            "temperature": float(os.getenv("ANDRE_TEMP", "0.2")),
            "specializations": ["environmental_policy", "regulatory_analysis"],
            "capabilities": [
                "ENVIRONMENTAL_JUSTICE",
                "POLICY_ANALYSIS",
                "SEMANTIC_ANALYSIS",
                "RESOURCE_DISCOVERY",
            ],
            "primary_functions": [
                "Environmental policy analysis",
                "Regulatory compliance guidance",
                "Policy impact assessment",
                "Advocacy strategy development",
            ],
            "streaming": True,
        },
        "carmen": {
            "name": "Carmen",
            "description": "Environmental Health specialist",
            "type": AgentType.ENVIRONMENTAL_JUSTICE,
            "model": model_adapter.create_langchain_llm(
                provider=os.getenv("CARMEN_PROVIDER", "openai"),
                model=os.getenv("CARMEN_MODEL", DEFAULT_MODEL),
                temperature=float(os.getenv("CARMEN_TEMP", "0.2")),
            ),
            "temperature": float(os.getenv("CARMEN_TEMP", "0.2")),
            "specializations": ["environmental_health", "community_health"],
            "capabilities": [
                "ENVIRONMENTAL_JUSTICE",
                "HEALTH_ASSESSMENT",
                "SEMANTIC_ANALYSIS",
                "RESOURCE_DISCOVERY",
            ],
            "primary_functions": [
                "Environmental health assessment",
                "Community health impact analysis",
                "Health resource identification",
                "Environmental hazard evaluation",
            ],
            "streaming": True,
        },
        # International Team agents
        "mei": {
            "name": "Mei",
            "description": "International Credentials specialist",
            "type": AgentType.INTERNATIONAL,
            "model": model_adapter.create_langchain_llm(
                provider=os.getenv("MEI_PROVIDER", "openai"),
                model=os.getenv("MEI_MODEL", DEFAULT_MODEL),
                temperature=float(os.getenv("MEI_TEMP", "0.2")),
            ),
            "temperature": float(os.getenv("MEI_TEMP", "0.2")),
            "specializations": ["credential_evaluation", "professional_licensing"],
            "capabilities": [
                "INTERNATIONAL_CREDENTIALS",
                "CREDENTIAL_EVALUATION",
                "SEMANTIC_ANALYSIS",
                "CAREER_GUIDANCE",
            ],
            "primary_functions": [
                "International credential evaluation",
                "Professional licensing guidance",
                "Credential recognition processes",
                "Educational equivalency assessment",
            ],
            "streaming": True,
        },
        "raj": {
            "name": "Raj",
            "description": "Immigration and Visa specialist",
            "type": AgentType.INTERNATIONAL,
            "model": model_adapter.create_langchain_llm(
                provider=os.getenv("RAJ_PROVIDER", "openai"),
                model=os.getenv("RAJ_MODEL", DEFAULT_MODEL),
                temperature=float(os.getenv("RAJ_TEMP", "0.2")),
            ),
            "temperature": float(os.getenv("RAJ_TEMP", "0.2")),
            "specializations": ["immigration_law", "visa_processes"],
            "capabilities": [
                "IMMIGRATION_GUIDANCE",
                "VISA_SUPPORT",
                "SEMANTIC_ANALYSIS",
                "RESOURCE_DISCOVERY",
            ],
            "primary_functions": [
                "Immigration pathway guidance",
                "Visa application support",
                "Work authorization assistance",
                "Legal resource connection",
            ],
            "streaming": True,
        },
        "sofia": {
            "name": "Sofia",
            "description": "Cultural Integration specialist",
            "type": AgentType.INTERNATIONAL,
            "model": model_adapter.create_langchain_llm(
                provider=os.getenv("SOFIA_PROVIDER", "openai"),
                model=os.getenv("SOFIA_MODEL", DEFAULT_MODEL),
                temperature=float(os.getenv("SOFIA_TEMP", "0.2")),
            ),
            "temperature": float(os.getenv("SOFIA_TEMP", "0.2")),
            "specializations": ["cultural_adaptation", "workplace_integration"],
            "capabilities": [
                "CULTURAL_ADAPTATION",
                "WORKPLACE_INTEGRATION",
                "SEMANTIC_ANALYSIS",
                "CAREER_GUIDANCE",
            ],
            "primary_functions": [
                "Cultural adaptation support",
                "Workplace integration guidance",
                "Communication skills development",
                "Professional networking assistance",
            ],
            "streaming": True,
        },
    }

    # Team configurations
    TEAMS = {
        "specialists": {
            "primary_agent": "pendo",
            "supporting_agents": ["lauren", "alex", "jasmine"],
            "description": "Core specialists team for general support and coordination",
        },
        "support": {
            "primary_agent": "mai",
            "supporting_agents": ["michael", "elena", "thomas"],
            "description": "Support team for technical assistance and user experience",
        },
        "veterans": {
            "primary_agent": "marcus",
            "supporting_agents": ["james", "sarah", "david"],
            "description": "Veterans workforce development team",
        },
        "international": {
            "primary_agent": "liv",
            "supporting_agents": ["mei", "raj", "sofia"],
            "description": "International workers support team",
        },
        "environmental_justice": {
            "primary_agent": "miguel",
            "supporting_agents": ["maria", "andre", "carmen"],
            "description": "Environmental justice and community resources team",
        },
        "careers": {
            "primary_agent": "lauren",
            "supporting_agents": ["pendo", "mai"],
            "description": "Climate careers specialist team",
        },
        "resources": {
            "primary_agent": "jasmine",
            "supporting_agents": ["pendo", "lauren"],
            "description": "Massachusetts resources team",
        },
        "crisis": {
            "primary_agent": "alex",
            "supporting_agents": ["pendo"],
            "description": "Crisis intervention team",
        },
    }

    @classmethod
    def get_agent_config(cls, agent_id: str) -> Dict[str, Any]:
        """Get configuration for a specific agent."""
        return cls.AGENTS.get(agent_id, {})

    @classmethod
    def get_team_config(cls, team_id: str) -> Dict[str, Any]:
        """Get configuration for a specific team."""
        return cls.TEAMS.get(team_id, {})

    @classmethod
    def get_agent_by_type(cls, agent_type: AgentType) -> Optional[str]:
        """Get the first agent of a specific type."""
        for agent_id, config in cls.AGENTS.items():
            if config.get("type") == agent_type:
                return agent_id
        return None

    @classmethod
    def get_agents_by_capability(cls, capability: str) -> List[str]:
        """Get all agents with a specific capability."""
        matching_agents = []
        for agent_id, config in cls.AGENTS.items():
            if capability in config.get("capabilities", []):
                matching_agents.append(agent_id)
        return matching_agents
