"""
Career Guidance Workflow

Following rule #2: Create modular components for easy maintenance
Following rule #3: Component documentation explaining purpose and functionality

This module implements a workflow for climate career guidance and job matching.
Location: backendv1/workflows/career_workflow.py
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
logger = setup_logger("career_workflow")
settings = get_settings()


class CareerState(TypedDict):
    """State for career workflow"""
    messages: List[Any]
    user_id: Optional[str]
    session_id: Optional[str]
    career_preferences: Optional[Dict[str, Any]]
    skills_data: Optional[Dict[str, Any]]
    job_matches: List[Dict[str, Any]]
    training_recommendations: List[Dict[str, Any]]
    location_focus: Optional[str]
    climate_sectors: List[str]
    next_step: str
    analysis_complete: bool


class CareerWorkflow:
    """
    Climate career guidance workflow implementation
    
    Following rule #2: Create modular components for easy maintenance
    Following rule #3: Component documentation explaining purpose and functionality
    """
    
    def __init__(self):
        """Initialize career workflow"""
        logger.info("Initializing career workflow")
        self.graph = self._create_workflow_graph()
    
    def _create_workflow_graph(self) -> StateGraph:
        """Create career workflow graph"""
        # Create workflow graph
        workflow = StateGraph(CareerState)
        
        # Add nodes
        workflow.add_node("preference_analysis", self._preference_analysis)
        workflow.add_node("job_matching", self._job_matching)
        workflow.add_node("training_analysis", self._training_analysis)
        workflow.add_node("recommendations", self._recommendations)
        
        # Define workflow edges
        workflow.add_conditional_edges(
            START,
            self._route_initial,
            {
                "preference_analysis": "preference_analysis"
            }
        )
        
        workflow.add_edge("preference_analysis", "job_matching")
        workflow.add_edge("job_matching", "training_analysis")
        workflow.add_edge("training_analysis", "recommendations")
        workflow.add_edge("recommendations", END)
        
        # Compile the graph
        return workflow.compile()
    
    def _preference_analysis(self, state: CareerState) -> Dict[str, Any]:
        """Analyze career preferences"""
        # Implementation would extract and analyze preferences
        # This is a placeholder implementation
        return {
            "career_preferences": {
                "salary_range": "60000-80000",
                "remote_preference": "hybrid",
                "work_environment": "collaborative"
            },
            "location_focus": "Massachusetts",
            "climate_sectors": ["Renewable Energy", "Energy Efficiency"],
            "next_step": "preferences_analyzed"
        }
    
    def _job_matching(self, state: CareerState) -> Dict[str, Any]:
        """Match to climate jobs"""
        # Implementation would find matching jobs
        # This is a placeholder implementation
        return {
            "job_matches": [
                {
                    "title": "Solar Installation Project Manager",
                    "company": "Boston Solar",
                    "match_score": 0.82,
                    "salary_range": "$65,000-$75,000"
                },
                {
                    "title": "Energy Efficiency Consultant",
                    "company": "Mass Save",
                    "match_score": 0.78,
                    "salary_range": "$60,000-$70,000"
                }
            ],
            "next_step": "jobs_matched"
        }
    
    def _training_analysis(self, state: CareerState) -> Dict[str, Any]:
        """Analyze training needs"""
        # Implementation would identify training opportunities
        # This is a placeholder implementation
        return {
            "skills_data": {
                "existing_skills": ["Project Management", "Customer Service"],
                "needed_skills": ["Solar PV Basics", "Energy Modeling"]
            },
            "training_recommendations": [
                {
                    "name": "NABCEP Associate Certification",
                    "provider": "MassCEC Training Network",
                    "duration": "40 hours",
                    "cost": "$1,200"
                },
                {
                    "name": "Energy Efficiency Fundamentals",
                    "provider": "Bunker Hill Community College",
                    "duration": "8 weeks",
                    "cost": "$800"
                }
            ],
            "next_step": "training_analyzed"
        }
    
    def _recommendations(self, state: CareerState) -> Dict[str, Any]:
        """Generate final recommendations"""
        # Implementation would provide comprehensive recommendations
        # This is a placeholder implementation
        return {
            "recommendations": [
                {
                    "type": "career_path",
                    "description": "Solar Project Management track with advancement to operations director",
                    "timeline": "3-5 years"
                },
                {
                    "type": "immediate_action",
                    "description": "Complete NABCEP Associate certification while applying to project coordinator roles"
                }
            ],
            "analysis_complete": True,
            "next_step": "complete"
        }
    
    def _route_initial(self, state: CareerState) -> str:
        """Initial routing"""
        return "preference_analysis"


def create_career_workflow() -> CareerWorkflow:
    """
    Factory function to create a career workflow
    
    Following rule #12: Complete code verification with proper factory pattern
    
    Returns:
        CareerWorkflow: Configured workflow instance
    """
    try:
        workflow = CareerWorkflow()
        logger.info("✅ Career workflow created successfully")
        return workflow
        
    except Exception as e:
        logger.error(f"Failed to create career workflow: {e}")
        raise


# Create singleton instance for LangGraph export
_workflow_instance = None

def get_workflow_instance() -> CareerWorkflow:
    """Get or create singleton workflow instance"""
    global _workflow_instance
    if _workflow_instance is None:
        try:
            _workflow_instance = create_career_workflow()
        except Exception as e:
            logger.error(f"Error creating career workflow instance: {e}")
            raise
    return _workflow_instance


# Export for LangGraph - following documentation pattern
career_graph = get_workflow_instance().graph

# Also export as 'graph' for LangGraph compatibility
graph = career_graph

# Export main classes and functions
__all__ = [
    "CareerWorkflow",
    "CareerState",
    "create_career_workflow", 
    "career_graph",
    "graph"
] 