"""
Climate Specialist Agent for Climate Economy Assistant
Handles climate-related career guidance and environmental justice discussions
"""

from typing import Dict, Any, Optional, List
from .base import BaseAgent
from core.models import ChatMessage, ChatResponse


class ClimateAgent(BaseAgent):
    """
    Climate specialist agent focused on:
    - Climate career guidance
    - Environmental justice advocacy
    - Green job recommendations
    - Climate policy discussions
    - Sustainability career paths
    """
    
    def __init__(self, 
                 agent_id: str = "climate_specialist",
                 name: str = "Climate Career Specialist",
                 system_prompt: Optional[str] = None):
        """Initialize the Climate Agent"""
        
        default_system_prompt = """You are a Climate Career Specialist helping users navigate climate-related career opportunities.

Your expertise includes:
- Climate science and environmental policy
- Green jobs and renewable energy careers  
- Environmental justice and community impact
- Sustainability consulting and advocacy
- Climate adaptation and mitigation strategies

Focus on:
- Connecting users to meaningful climate careers
- Highlighting environmental justice opportunities
- Providing practical career transition advice
- Emphasizing community impact and social equity
- Supporting diverse pathways into climate work

Always maintain an encouraging, action-oriented tone while being realistic about career challenges and opportunities."""

        super().__init__(
            agent_id=agent_id,
            name=name,
            system_prompt=system_prompt or default_system_prompt
        )
        
    async def process_message(self, 
                            message: ChatMessage, 
                            context: Optional[Dict[str, Any]] = None) -> ChatResponse:
        """Process climate-related career messages"""
        
        # Add climate-specific context
        climate_context = {
            "agent_type": "climate_specialist",
            "focus_areas": [
                "climate_careers",
                "environmental_justice", 
                "green_jobs",
                "sustainability",
                "climate_policy"
            ],
            **(context or {})
        }
        
        # Use base agent processing with climate context
        return await super().process_message(message, climate_context)
        
    def get_climate_career_areas(self) -> List[str]:
        """Get list of climate career focus areas"""
        return [
            "Renewable Energy",
            "Climate Policy & Advocacy",
            "Environmental Justice",
            "Sustainable Agriculture", 
            "Green Building & Design",
            "Climate Science & Research",
            "Conservation & Restoration",
            "Clean Transportation",
            "Environmental Education",
            "Climate Finance & Investment"
        ]
        
    def get_specialization_prompt(self, career_area: str) -> str:
        """Get specialized prompt for specific climate career area"""
        
        specializations = {
            "renewable_energy": "Focus on solar, wind, and clean energy careers including engineering, project management, and policy roles.",
            "environmental_justice": "Emphasize community organizing, policy advocacy, and frontline community support roles.",
            "climate_policy": "Highlight government, NGO, and advocacy positions in climate policy development and implementation.",
            "green_building": "Focus on sustainable architecture, LEED certification, and energy-efficient construction careers.",
            "climate_science": "Emphasize research, data analysis, and scientific communication roles in climate studies."
        }
        
        return specializations.get(career_area.lower().replace(" ", "_"), 
                                 "Provide comprehensive climate career guidance.") 