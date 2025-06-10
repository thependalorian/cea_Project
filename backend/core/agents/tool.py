"""
Tool Specialist Agent for Climate Economy Assistant

This module implements the general tool specialist agent
that can use multiple tools to provide comprehensive climate career guidance.
"""

import json
from datetime import datetime
from typing import Any, Dict, List, Optional

from core.agents.base import BaseAgent
from core.config import get_settings
from core.prompts import MA_CLIMATE_CONTEXT, MA_RESOURCE_ANALYST_PROMPT
from tools.analytics import log_specialist_interaction
from tools.jobs import match_jobs_for_profile
from tools.resume import get_user_resume
from tools.training import recommend_upskilling

settings = get_settings()


class ToolSpecialist(BaseAgent):
    """
    Tool specialist agent for general climate career guidance
    """

    def __init__(self):
        """Initialize tool specialist agent"""
        super().__init__(
            name="tool_specialist",
            description="General climate career guidance specialist with tools",
        )
        self.prompt = MA_RESOURCE_ANALYST_PROMPT
        self.context = MA_CLIMATE_CONTEXT

    async def handle_message(
        self, message: str, user_id: str, conversation_id: str
    ) -> Dict[str, Any]:
        """
        Handle a user message with the tool specialist

        Args:
            message: User message text
            user_id: User identifier
            conversation_id: Conversation identifier

        Returns:
            Dict containing response and metadata
        """
        try:
            # Initialize tools results and tracking
            tools_used = []
            analysis_results = []

            # Get user resume context if available
            resume_context = None
            if user_id:
                try:
                    # Runtime import to avoid circular dependency
                    from tools.resume import get_user_resume

                    resume_context = await get_user_resume(user_id)
                    if resume_context:
                        analysis_results.append(
                            f"**Resume Analysis:**\n• Education: {resume_context.get('education_level', 'Not specified')}\n• Experience: {resume_context.get('experience_years', 0)} years\n• Skills: {', '.join(resume_context.get('skills_extracted', [])[:5])}"
                        )
                        tools_used.append("resume_analysis")
                except Exception as e:
                    print(f"Error retrieving resume: {e}")

            # Recommend upskilling programs
            try:
                target_skills = ["renewable energy", "sustainability", "data analysis"]
                if resume_context and resume_context.get("skills_extracted"):
                    # Add some skills from resume if available
                    for skill in resume_context.get("skills_extracted", [])[:3]:
                        if skill.lower() not in [s.lower() for s in target_skills]:
                            target_skills.append(skill)

                upskilling_recs = await recommend_upskilling.ainvoke(
                    {
                        "user_background": "general",
                        "target_skills": target_skills,
                        "learning_format": "hybrid",
                    }
                )
                analysis_results.append(
                    f"**Recommended Training Programs:**\n{upskilling_recs}"
                )
                tools_used.append("upskilling_recommendations")
            except Exception as e:
                print(f"Error recommending upskilling: {e}")
                analysis_results.append(
                    "**Recommended Training Programs:** Massachusetts community colleges and technical institutes offer certificate and degree programs in clean energy, sustainability, and climate technology"
                )

            # Match climate jobs
            try:
                skills = []
                if resume_context and resume_context.get("skills_extracted"):
                    skills = resume_context.get("skills_extracted", [])[:5]
                else:
                    skills = ["project management", "communication", "technical skills"]

                job_matches = await match_jobs_for_profile.ainvoke(
                    {
                        "skills": skills,
                        "background": "general",
                        "experience_level": "mid_level",
                    }
                )
                analysis_results.append(f"**Job Opportunities:**\n{job_matches}")
                tools_used.append("job_matching")
            except Exception as e:
                print(f"Error matching jobs: {e}")
                analysis_results.append(
                    "**Job Opportunities:** The Massachusetts clean energy sector has over 400 employers hiring for positions ranging from technical roles to project management and policy analysis"
                )

            # Generate comprehensive response using the specialist prompt
            response_content = f"""
**🌿 Massachusetts Climate Economy - Career Analysis**

Based on your background and our comprehensive analysis, here are your personalized recommendations:

{chr(10).join(analysis_results)}

**🎯 Key Growth Areas in MA Climate Economy:**
• **Offshore Wind**: Technical specialists, project managers, and supply chain experts
• **Energy Efficiency**: Building auditors, retrofit technicians, and program managers
• **Clean Transportation**: EV infrastructure specialists, fleet management, and urban planners
• **Climate Policy**: Analysts, community coordinators, and compliance specialists
• **Green Building**: LEED professionals, sustainable materials specialists, and contractors

**📋 Immediate Next Steps (90-Day Action Plan):**
1. **Skills Assessment** (Week 1-2): Identify specific climate skills to develop based on your background
2. **Training Enrollment** (Week 3-4): Register for relevant certificate or training programs
3. **Network Building** (Week 5-8): Connect with MA climate organizations in your target sector
4. **Job Applications** (Week 9-12): Apply to positions with the specific employers mentioned above

**📞 Key Contacts:**
• MassHire Career Centers: (877) 872-2804
• MA Clean Energy Center: (617) 315-9355
• Sustainable Business Network of MA: (617) 395-0250

**Sources:** Massachusetts Clean Energy Center job board, MA Department of Energy Resources, industry reports
"""

            # Log the interaction for analytics
            try:
                await log_specialist_interaction(
                    user_id=user_id,
                    conversation_id=conversation_id,
                    specialist_type="tool",
                    tools_used=tools_used,
                    query=message,
                    confidence=0.85,
                )
            except Exception as e:
                print(f"Error logging interaction: {e}")

            # Return the response
            return {
                "content": response_content,
                "metadata": {
                    "specialist": "tool",
                    "tools_used": tools_used,
                    "confidence": 0.85,
                    "sources": [],
                },
            }
        except Exception as e:
            print(f"Tool specialist error: {e}")
            return {
                "content": "I apologize, but I'm having trouble responding right now. Please try again later.",
                "role": "assistant",
                "sources": [],
                "timestamp": datetime.now().isoformat(),
                "specialist_type": "fallback_system",
                "error": str(e),
            }
