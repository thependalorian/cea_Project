"""
Resume processing and analysis workflow for Climate Economy Assistant

This module implements LangGraph-based workflows for resume processing, analysis,
and integration with the larger climate career assistant system.
"""

import json
import logging
import os
import uuid
from datetime import datetime
from typing import Any, Dict, List, Literal, Optional, TypedDict

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables import RunnableConfig
from langchain_core.tools import tool
from langgraph.func import entrypoint, task
from langgraph.graph import END, StateGraph
from langgraph.store.memory import InMemoryStore

from adapters.models import create_langchain_llm, get_default_provider
from core.config import get_settings
from core.prompts import RESUME_ANALYSIS_PROMPT
from tools.resume import (
    analyze_resume_for_climate_careers,
    analyze_resume_with_social_context,
    process_resume,
    query_user_resume,
)
from tools.web import web_search_for_social_profiles

settings = get_settings()
logger = logging.getLogger("resume_workflow")


# Define the state schema for our resume workflow
class ResumeWorkflowState(TypedDict):
    """State for the resume processing workflow"""

    user_id: str
    session_id: str
    resume_id: Optional[str]
    workflow_status: Literal[
        "initiated", "processing", "analyzing", "completed", "error"
    ]
    file_url: Optional[str]
    file_id: Optional[str]
    file_name: Optional[str]
    content_type: Optional[str]
    file_size: Optional[int]
    context: Optional[str]
    content: Optional[str]
    processing_result: Optional[Dict[str, Any]]
    analysis_result: Optional[Dict[str, Any]]
    error: Optional[str]
    start_time: str
    completion_time: Optional[str]


# Create memory and store for checkpointing
# memory_saver = MemorySaver()
resume_workflow_store = InMemoryStore()


# Task: Initialize the resume workflow
@task
async def initialize_workflow(
    user_id: str,
    file_id: Optional[str] = None,
    file_url: Optional[str] = None,
    file_name: Optional[str] = None,
    content_type: Optional[str] = None,
    file_size: Optional[int] = None,
    context: Optional[str] = "general",
) -> ResumeWorkflowState:
    """Initialize the resume workflow state"""

    session_id = f"resume_{uuid.uuid4().hex}"

    return {
        "user_id": user_id,
        "session_id": session_id,
        "resume_id": file_id,
        "workflow_status": "initiated",
        "file_url": file_url,
        "file_id": file_id,
        "file_name": file_name,
        "content_type": content_type,
        "file_size": file_size,
        "context": context,
        "content": None,
        "processing_result": None,
        "analysis_result": None,
        "error": None,
        "start_time": datetime.now().isoformat(),
        "completion_time": None,
    }


# Task: Process the resume
@task
async def process_resume_task(state: ResumeWorkflowState) -> ResumeWorkflowState:
    """Process the resume and extract data"""

    # Update workflow status
    state["workflow_status"] = "processing"

    try:
        logger.info(f"Starting resume processing for user {state['user_id']}")

        # Check if we have all required data
        if not state["file_url"] or not state["file_id"]:
            state["error"] = "Missing required file information"
            state["workflow_status"] = "error"
            return state

        # Process the resume
        result = await process_resume(
            user_id=state["user_id"],
            file_url=state["file_url"],
            file_id=state["file_id"],
            context=state.get("context", "general"),
        )

        # Update state with processing result
        state["processing_result"] = result

        # Check for errors
        if not result.get("success", False):
            state["error"] = result.get("error", "Resume processing failed")
            state["workflow_status"] = "error"
            return state

        # Extract content if available
        if "content" in result:
            state["content"] = result["content"]

        # Update workflow status
        state["workflow_status"] = "analyzing"

        return state

    except Exception as e:
        logger.error(f"Error in resume processing: {str(e)}")
        state["error"] = f"Resume processing error: {str(e)}"
        state["workflow_status"] = "error"
        return state


# Task: Analyze the processed resume
@task
async def analyze_resume_task(state: ResumeWorkflowState) -> ResumeWorkflowState:
    """Analyze the processed resume for climate economy careers"""

    try:
        logger.info(f"Starting resume analysis for user {state['user_id']}")

        # Check if processing was successful
        if state["workflow_status"] == "error":
            return state

        # Analyze the resume
        result = await analyze_resume_for_climate_careers(
            user_id=state["user_id"],
            resume_id=state["resume_id"],
            analysis_type="comprehensive",
        )

        # Update state with analysis result
        state["analysis_result"] = result

        # Check for errors
        if not result.get("success", False):
            state["error"] = result.get("error", "Resume analysis failed")
            state["workflow_status"] = "error"
            return state

        # Update workflow status
        state["workflow_status"] = "completed"
        state["completion_time"] = datetime.now().isoformat()

        return state

    except Exception as e:
        logger.error(f"Error in resume analysis: {str(e)}")
        state["error"] = f"Resume analysis error: {str(e)}"
        state["workflow_status"] = "error"
        return state


# Task: Handle errors in the workflow
@task
async def handle_error(state: ResumeWorkflowState) -> ResumeWorkflowState:
    """Handle errors in the resume workflow"""

    logger.error(f"Resume workflow error: {state.get('error', 'Unknown error')}")

    # Mark as completed even though there was an error
    state["completion_time"] = datetime.now().isoformat()

    return state


# LangGraph entry point for resume processing
@entrypoint(store=resume_workflow_store)
async def resume_processing_workflow(
    user_id: str,
    file_id: Optional[str] = None,
    file_url: Optional[str] = None,
    file_name: Optional[str] = None,
    content_type: Optional[str] = None,
    file_size: Optional[int] = None,
    context: Optional[str] = "general",
    **kwargs,
) -> ResumeWorkflowState:
    """
    End-to-end resume processing workflow from upload to analysis

    Args:
        user_id: User ID
        file_id: Resume file ID
        file_url: URL to the resume file
        file_name: Name of the file
        content_type: Content type of the file
        file_size: Size of the file in bytes
        context: Context of the resume analysis

    Returns:
        ResumeWorkflowState with processing and analysis results
    """

    # Create workflow graph
    workflow = StateGraph(ResumeWorkflowState)

    # Add nodes to the graph
    workflow.add_node("initialize", initialize_workflow)
    workflow.add_node("process", process_resume_task)
    workflow.add_node("analyze", analyze_resume_task)
    workflow.add_node("handle_error", handle_error)

    # Define the edges
    workflow.add_edge("initialize", "process")
    workflow.add_edge("process", "analyze")
    workflow.add_edge("analyze", END)

    # Add conditional edges for error handling
    workflow.add_conditional_edges(
        "process",
        lambda state: (
            "handle_error" if state["workflow_status"] == "error" else "analyze"
        ),
        {"handle_error": "handle_error", "analyze": "analyze"},
    )

    workflow.add_conditional_edges(
        "analyze",
        lambda state: "handle_error" if state["workflow_status"] == "error" else END,
        {"handle_error": "handle_error", "end": END},
    )

    workflow.add_edge("handle_error", END)

    # Set entry point
    workflow.set_entry_point("initialize")

    # Compile the graph
    compiled_workflow = workflow.compile()

    # Create the initial state
    initial_state = await initialize_workflow(
        user_id=user_id,
        file_id=file_id,
        file_url=file_url,
        file_name=file_name,
        content_type=content_type,
        file_size=file_size,
        context=context,
    )

    # Run the workflow
    result = await compiled_workflow.ainvoke(initial_state)

    return result


# LangGraph entry point for resume analysis
@entrypoint(store=resume_workflow_store)
async def resume_analysis_workflow(
    user_id: str,
    query: str,
    resume_id: Optional[str] = None,
    session_id: Optional[str] = None,
    include_social_data: bool = True,
    **kwargs,
) -> Dict[str, Any]:
    """
    Natural language query workflow for resume analysis

    Args:
        user_id: User ID
        query: Natural language query about the resume
        resume_id: Optional resume ID (if not provided, will look up user's resume)
        session_id: Optional session ID for continuity
        include_social_data: Whether to include social data in the analysis

    Returns:
        Dict with query results
    """

    try:
        # Generate session ID if not provided
        if not session_id:
            session_id = f"query_{uuid.uuid4().hex}"

        # Query the resume
        result = await query_user_resume(
            user_id=user_id, query=query, resume_id=resume_id
        )

        # Add additional context to the result
        result["session_id"] = session_id
        result["query_time"] = datetime.now().isoformat()

        return result

    except Exception as e:
        logger.error(f"Resume query workflow error: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "answer": "I encountered an error while trying to analyze your resume.",
            "session_id": session_id,
            "query_time": datetime.now().isoformat(),
        }
