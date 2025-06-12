"""
Resume Specialist Agent for Climate Economy Assistant
Handles resume analysis, optimization, and career transition guidance
"""

from typing import Dict, Any, Optional, List
from .base import BaseAgent
from core.models import ChatMessage, ChatResponse


class ResumeAgent(BaseAgent):
    """
    Resume specialist agent focused on:
    - Resume analysis and optimization
    - Skills gap identification
    - Career transition planning
    - Climate career alignment
    - Professional development recommendations
    """
    
    def __init__(self, 
                 agent_id: str = "resume_specialist",
                 name: str = "Resume & Career Transition Specialist",
                 system_prompt: Optional[str] = None):
        """Initialize the Resume Agent"""
        
        default_system_prompt = """You are a Resume & Career Transition Specialist helping users optimize their resumes for climate careers.

Your expertise includes:
- Resume writing and optimization
- Skills assessment and gap analysis
- Career transition planning
- Climate career alignment
- Professional development strategies
- ATS optimization techniques

Focus on:
- Identifying transferable skills for climate careers
- Highlighting relevant experience for green jobs
- Recommending skills development opportunities
- Optimizing resumes for specific climate roles
- Providing actionable career transition advice

Always provide specific, actionable recommendations while being encouraging about career transition possibilities."""

        super().__init__(
            agent_id=agent_id,
            name=name,
            system_prompt=system_prompt or default_system_prompt
        )
        
    async def process_message(self, 
                            message: ChatMessage, 
                            context: Optional[Dict[str, Any]] = None) -> ChatResponse:
        """Process resume and career transition messages"""
        
        # Add resume-specific context
        resume_context = {
            "agent_type": "resume_specialist",
            "focus_areas": [
                "resume_optimization",
                "skills_analysis",
                "career_transition",
                "climate_alignment",
                "professional_development"
            ],
            **(context or {})
        }
        
        # Use base agent processing with resume context
        return await super().process_message(message, resume_context)
        
    def get_transferable_skills_categories(self) -> List[str]:
        """Get categories of transferable skills for climate careers"""
        return [
            "Project Management",
            "Data Analysis & Research", 
            "Communication & Advocacy",
            "Technical Skills",
            "Leadership & Collaboration",
            "Problem Solving",
            "Financial Analysis",
            "Regulatory Compliance",
            "Community Engagement",
            "Strategic Planning"
        ]
        
    def get_climate_skills_mapping(self) -> Dict[str, List[str]]:
        """Map traditional skills to climate career applications"""
        return {
            "finance": [
                "Climate risk assessment",
                "Green bond analysis", 
                "ESG investing",
                "Carbon credit trading",
                "Sustainable finance"
            ],
            "marketing": [
                "Sustainability communications",
                "Environmental education",
                "Green product promotion",
                "Climate advocacy campaigns",
                "Community outreach"
            ],
            "operations": [
                "Supply chain sustainability",
                "Energy efficiency optimization",
                "Waste reduction programs",
                "Sustainable procurement",
                "Environmental compliance"
            ],
            "technology": [
                "Clean energy systems",
                "Environmental monitoring",
                "Climate data analysis",
                "Smart grid development",
                "Sustainability software"
            ],
            "education": [
                "Environmental education",
                "Climate science communication",
                "Sustainability training",
                "Community workshops",
                "Policy education"
            ]
        }
        
    def get_resume_optimization_tips(self, target_role: str) -> List[str]:
        """Get specific resume optimization tips for climate roles"""
        
        general_tips = [
            "Quantify environmental impact where possible",
            "Use climate-relevant keywords and terminology",
            "Highlight sustainability initiatives you've led",
            "Emphasize cross-functional collaboration skills",
            "Show passion for environmental and social impact"
        ]
        
        role_specific = {
            "policy": ["Highlight research and analytical skills", "Show government/NGO experience"],
            "technical": ["Emphasize STEM background", "Show hands-on project experience"],
            "communications": ["Highlight writing and outreach skills", "Show campaign experience"],
            "finance": ["Show analytical and modeling skills", "Highlight ESG experience"]
        }
        
        return general_tips + role_specific.get(target_role.lower(), []) 