"""
Resume Analysis Workflow

Following rule #2: Create modular components for easy maintenance
Following rule #3: Component documentation explaining purpose and functionality

This module implements a workflow for resume analysis and career guidance.
Location: backendv1/workflows/resume_workflow.py
"""

import logging
from typing import Dict, Any, List, Optional
from datetime import datetime

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langgraph.graph import StateGraph, START, END
from typing_extensions import TypedDict

from backendv1.utils.logger import setup_logger
from backendv1.config.settings import get_settings

# Setup logging
logger = setup_logger("resume_workflow")
settings = get_settings()


class ResumeState(TypedDict):
    """State for resume workflow"""
    messages: List[Any]
    user_id: Optional[str]
    session_id: Optional[str]
    resume_data: Optional[Dict[str, Any]]
    skills_extracted: List[str]
    experience_extracted: List[Dict[str, Any]]
    education_extracted: List[Dict[str, Any]]
    resume_score: Optional[float]
    gap_analysis: Optional[Dict[str, Any]]
    recommendations: List[Dict[str, Any]]
    analysis_complete: bool
    next_step: str


class ResumeWorkflow:
    """
    Resume analysis workflow implementation
    
    Following rule #2: Create modular components for easy maintenance
    Following rule #3: Component documentation explaining purpose and functionality
    """
    
    def __init__(self):
        """Initialize resume workflow"""
        logger.info("Initializing resume workflow")
        self.graph = self._create_workflow_graph()
    
    def _create_workflow_graph(self) -> StateGraph:
        """Create resume workflow graph"""
        # Create workflow graph
        workflow = StateGraph(ResumeState)
        
        # Add nodes
        workflow.add_node("resume_extraction_node", self._resume_extraction)
        workflow.add_node("skills_analysis_node", self._skills_analysis)
        workflow.add_node("gap_analysis_node", self._gap_analysis)
        workflow.add_node("recommendations_node", self._recommendations)
        
        # Define workflow edges
        workflow.add_conditional_edges(
            START,
            self._route_initial,
            {
                "resume_extraction": "resume_extraction_node"
            }
        )
        
        workflow.add_edge("resume_extraction_node", "skills_analysis_node")
        workflow.add_edge("skills_analysis_node", "gap_analysis_node")
        workflow.add_edge("gap_analysis_node", "recommendations_node")
        workflow.add_edge("recommendations_node", END)
        
        # Compile the graph
        return workflow.compile()
    
    def _resume_extraction(self, state: ResumeState) -> Dict[str, Any]:
        """Extract information from resume"""
        # Implementation would extract structured data from resume
        # This is a placeholder implementation
        return {
            "resume_data": {
                "parsed_at": datetime.utcnow().isoformat(),
                "format_quality": 0.8
            },
            "skills_extracted": ["Communication", "Project Management", "Python"],
            "experience_extracted": [
                {"title": "Software Developer", "years": 2}
            ],
            "education_extracted": [
                {"degree": "Bachelor's", "field": "Computer Science"}
            ],
            "next_step": "extraction_complete"
        }
    
    def _skills_analysis(self, state: ResumeState) -> Dict[str, Any]:
        """Analyze skills from resume"""
        # Implementation would analyze skills for green economy
        # This is a placeholder implementation
        return {
            "resume_score": 0.75,
            "next_step": "skills_analyzed"
        }
    
    def _gap_analysis(self, state: ResumeState) -> Dict[str, Any]:
        """Perform gap analysis for climate careers"""
        # Implementation would identify skill gaps for green jobs
        # This is a placeholder implementation
        return {
            "gap_analysis": {
                "missing_skills": ["Sustainability Reporting", "Carbon Accounting"],
                "strengths": ["Technical Background", "Communication"],
                "development_areas": ["Green Certification", "Renewable Energy Knowledge"]
            },
            "next_step": "gap_analysis_complete"
        }
    
    def _recommendations(self, state: ResumeState) -> Dict[str, Any]:
        """Generate recommendations based on analysis"""
        # Implementation would provide tailored recommendations
        # This is a placeholder implementation
        return {
            "recommendations": [
                {
                    "type": "skill_development",
                    "description": "Complete a sustainability certification",
                    "priority": "high"
                },
                {
                    "type": "resume_improvement",
                    "description": "Highlight transferable skills for green economy",
                    "priority": "medium"
                }
            ],
            "analysis_complete": True,
            "next_step": "complete"
        }
    
    def _route_initial(self, state: ResumeState) -> str:
        """Initial routing"""
        return "resume_extraction"


def create_resume_workflow() -> ResumeWorkflow:
    """
    Factory function to create a resume workflow
    
    Following rule #12: Complete code verification with proper factory pattern
    
    Returns:
        ResumeWorkflow: Configured workflow instance
    """
    try:
        workflow = ResumeWorkflow()
        logger.info("✅ Resume workflow created successfully")
        return workflow
        
    except Exception as e:
        logger.error(f"Failed to create resume workflow: {e}")
        raise


# Create singleton instance for LangGraph export
_workflow_instance = None

def get_workflow_instance() -> ResumeWorkflow:
    """Get or create singleton workflow instance"""
    global _workflow_instance
    if _workflow_instance is None:
        try:
            _workflow_instance = create_resume_workflow()
        except Exception as e:
            logger.error(f"Error creating resume workflow instance: {e}")
            raise
    return _workflow_instance


# Export for LangGraph - following documentation pattern
resume_graph = get_workflow_instance().graph

# Also export as 'graph' for LangGraph compatibility
graph = resume_graph

# Export main classes and functions
__all__ = [
    "ResumeWorkflow",
    "ResumeState", 
    "create_resume_workflow",
    "resume_graph",
    "graph"
] 