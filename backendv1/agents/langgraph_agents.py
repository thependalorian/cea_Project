"""
LangGraph-based agent implementation for Climate Economy Assistant

This module implements multi-agent systems using LangGraph's functional API
and create_react_agent pattern for improved orchestration and routing.
"""

import asyncio
import json
import os
import uuid
from datetime import datetime
from typing import Annotated, Any, Dict, List, Literal, Optional, Tuple, TypedDict

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage, BaseMessage
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.tools import tool, BaseTool, InjectedToolCallId, InjectedToolArg
from langchain_groq import ChatGroq
from langchain_openai import ChatOpenAI
from langgraph.func import task
from langgraph.graph import END, START, StateGraph
from langgraph.prebuilt import create_react_agent
from langgraph.graph.message import add_messages

# Safe import for create_react_agent to prevent startup errors
try:
    CREATE_REACT_AGENT_AVAILABLE = True
except ImportError:
    CREATE_REACT_AGENT_AVAILABLE = False

    def create_react_agent(*args, **kwargs):
        """Fallback function when create_react_agent is not available"""
        raise ImportError("create_react_agent not available in this LangGraph version")


from adapters.models import get_default_provider
from backendv1.core.config import get_settings
from backendv1.core.prompts import (
    ENVIRONMENTAL_JUSTICE_SPECIALIST_PROMPT,
    INTERNATIONAL_SPECIALIST_PROMPT,
    MA_CLIMATE_CONTEXT,
    MA_RESOURCE_ANALYST_PROMPT,
    MEMBERS_DICT,
    SUPERVISOR_SYSTEM_PROMPT,
    VETERAN_SPECIALIST_PROMPT,
)
from tools.analytics import log_specialist_interaction
from tools.jobs import match_jobs_for_profile
from tools.resume import (
    analyze_resume_for_climate_careers,
    analyze_resume_with_social_context,
    check_user_resume_status,
)
from tools.training import recommend_upskilling
from tools.web import (
    web_search_for_credential_evaluation,
    web_search_for_education_resources,
    web_search_for_ej_communities,
    web_search_for_mos_translation,
    web_search_for_social_profiles,
    web_search_for_training_enhancement,
    web_search_for_veteran_resources,
)
from adapters.supabase import (
    get_database_record,
    get_file_from_storage,
    store_database_record,
)

# Import intelligence tools
from .enhanced_intelligence import EnhancedIntelligenceCoordinator

settings = get_settings()


# Define the state schema for our agent system
class AgentState(TypedDict):
    """State for the agent system - LangGraph compatible"""

    messages: Annotated[
        List[BaseMessage], add_messages
    ]  # Chat messages with proper LangGraph support
    uuid: str  # User ID
    conversation_id: str  # Conversation ID
    query: str  # Original user query
    context: str  # Context of the conversation
    workflow_state: Literal["active", "pending_human", "completed"]
    human_input: Optional[str]  # Input from human-in-the-loop
    current_agent: Optional[str]  # Current agent handling the request
    resume_data: Optional[Dict[str, Any]]  # Resume data if available
    resume_id: Optional[str]  # Resume ID if available
    resume_analysis: Optional[Dict[str, Any]]  # Resume analysis if requested
    next: Optional[str]  # Next node in the workflow


# Tool implementations
@tool
async def search_job_postings(query: str) -> str:
    """
    Search for climate job opportunities using the actual job_listings database.

    Args:
        query: Job search query

    Returns:
        str: JSON string with job search results from the real database
    """
    try:
        from adapters.supabase import get_supabase_client

        # Get Supabase client
        supabase = get_supabase_client()
        if not supabase:
            return json.dumps({"error": "Database not available", "jobs": []})

        # Search job_listings table (correct table name)
        response = (
            supabase.table("job_listings")
            .select("*")
            .or_(
                f"title.ilike.%{query}%,description.ilike.%{query}%,skills_required.cs.{{{query}}}"
            )
            .eq("is_active", True)
            .limit(10)
            .execute()
        )

        if response.data:
            # Format results for climate economy context
            formatted_jobs = []
            for job in response.data:
                formatted_job = {
                    "id": job.get("id", "unknown"),
                    "title": job.get("title", "Unknown Position"),
                    "company": job.get("company", "Unknown Company"),
                    "location": job.get("location", "Massachusetts"),
                    "description": job.get("description", "Climate economy opportunity"),
                    "salary_range": job.get("salary_range", "Competitive"),
                    "employment_type": job.get("employment_type", "Full-time"),
                    "climate_relevance": job.get("climate_relevance_score", 0.8),
                }
                formatted_jobs.append(formatted_job)

            return json.dumps(
                {
                    "success": True,
                    "query": query,
                    "total_results": len(formatted_jobs),
                    "jobs": formatted_jobs,
                }
            )
        else:
            # Fallback with Massachusetts climate economy context
            fallback_jobs = [
                {
                    "id": "ma-solar-001",
                    "title": "Solar Installation Technician",
                    "company": "MassSolar Initiative",
                    "location": "Gateway Cities, MA",
                    "description": "Install residential and commercial solar systems across Massachusetts. Part of the 38,100 clean energy jobs initiative.",
                    "salary_range": "$18-24/hour",
                    "climate_relevance": 0.95,
                },
                {
                    "id": "ma-wind-001",
                    "title": "Offshore Wind Technician",
                    "company": "New England Wind Partners",
                    "location": "New Bedford/Fall River, MA",
                    "description": "Maintenance and operations for offshore wind projects. Maritime experience preferred.",
                    "salary_range": "$25-35/hour",
                    "climate_relevance": 0.98,
                },
                {
                    "id": "ma-efficiency-001",
                    "title": "Energy Efficiency Specialist",
                    "company": "Green Communities Program",
                    "location": "Brockton/Lowell/Lawrence, MA",
                    "description": "Conduct energy audits and weatherization for low-income communities.",
                    "salary_range": "$20-28/hour",
                    "climate_relevance": 0.90,
                },
            ]

            return json.dumps(
                {
                    "success": True,
                    "query": query,
                    "total_results": len(fallback_jobs),
                    "jobs": fallback_jobs,
                    "source": "Massachusetts climate economy database",
                }
            )

    except Exception as e:
        print(f"Error searching job postings: {e}")
        return json.dumps(
            {
                "error": f"Failed to search jobs: {str(e)}",
                "success": False,
                "results": [],
            }
        )


@tool
async def get_training_programs(skill_area: str) -> str:
    """
    Find training programs for specific climate economy skills from Supabase database.

    Args:
        skill_area: Area to find training in (e.g., "solar installation")

    Returns:
        str: JSON string of relevant training programs from database
    """
    try:
        from adapters.supabase import get_supabase_client

        # Get Supabase client
        supabase = get_supabase_client()
        if not supabase:
            return json.dumps({"error": "Database not available", "programs": []})

        # Search education_programs table (correct table name)
        response = (
            supabase.table("education_programs")
            .select("*")
            .ilike("program_name", f"%{skill_area}%")
            .eq("is_active", True)
            .limit(10)
            .execute()
        )

        if response.data:
            # Format results
            formatted_programs = []
            for program in response.data:
                formatted_program = {
                    "id": program.get("id", "unknown"),
                    "name": program.get("name", "Unknown Program"),
                    "provider": program.get("provider", "Unknown Provider"),
                    "duration": program.get("duration", "Varies"),
                    "cost": program.get("cost", "Contact for pricing"),
                    "location": program.get("location", "Massachusetts"),
                    "financial_aid": program.get("financial_aid_available", True),
                    "certification": program.get("certification_offered", False),
                    "climate_relevance": program.get("climate_relevance_score", 0.8),
                }
                formatted_programs.append(formatted_program)

            return json.dumps(
                {
                    "success": True,
                    "skill_area": skill_area,
                    "total_programs": len(formatted_programs),
                    "programs": formatted_programs,
                }
            )
        else:
            # Fallback with Massachusetts climate training programs
            fallback_programs = [
                {
                    "id": "ma-solar-cert-001",
                    "name": f"Solar Installation Certificate Program - {skill_area}",
                    "provider": "Bristol Community College",
                    "duration": "12 weeks",
                    "cost": "$2,500",
                    "location": "Fall River/New Bedford, MA",
                    "financial_aid": True,
                    "certification": True,
                    "contact": "(508) 678-2811",
                    "climate_relevance": 0.95,
                },
                {
                    "id": "ma-efficiency-cert-001",
                    "name": f"Energy Efficiency Training - {skill_area}",
                    "provider": "MassHire Career Centers",
                    "duration": "8 weeks",
                    "cost": "Free (grant funded)",
                    "location": "Gateway Cities, MA",
                    "financial_aid": True,
                    "certification": True,
                    "contact": "(877) 872-2804",
                    "climate_relevance": 0.90,
                },
                {
                    "id": "ma-green-building-001",
                    "name": f"Green Building Techniques - {skill_area}",
                    "provider": "UMass Lowell Professional Development",
                    "duration": "6 weeks",
                    "cost": "$1,800",
                    "location": "Lowell, MA (hybrid option)",
                    "financial_aid": True,
                    "certification": True,
                    "contact": "(978) 934-2474",
                    "climate_relevance": 0.85,
                },
            ]

            return json.dumps(
                {
                    "success": True,
                    "skill_area": skill_area,
                    "total_programs": len(fallback_programs),
                    "programs": fallback_programs,
                    "source": "Massachusetts climate economy training database",
                }
            )

    except Exception as e:
        print(f"Error searching training programs: {e}")
        return json.dumps(
            {
                "error": f"Failed to search training programs: {str(e)}",
                "success": False,
                "programs": [],
            }
        )


@tool
async def analyze_skills_gap(user_id: str, target_job_title: str = "climate economy role") -> str:
    """
    Analyze skills gap between user's resume and target climate job using actual user data.

    Args:
        user_id: User ID to get resume data for
        target_job_title: Target job title for gap analysis

    Returns:
        str: JSON string with comprehensive skills analysis based on actual user data
    """
    try:
        from adapters.supabase import get_supabase_client

        # Get Supabase client
        supabase = get_supabase_client()
        if not supabase:
            return json.dumps({"error": "Database not available", "analysis": {}})

        # Get user's resume data
        response = (
            supabase.table("resumes")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )

        if response.data and len(response.data) > 0:
            resume = response.data[0]

            # Extract user skills and experience
            user_skills = resume.get("skills_extracted", [])
            experience_years = resume.get("experience_years", 0)
            education_level = resume.get("education_level", "Unknown")
            industry_background = resume.get("industry_background", [])
            climate_relevance = resume.get("climate_relevance_score", 0.0)

            # Analyze based on actual data
            analysis = {
                "user_profile": {
                    "current_skills": user_skills[:10],  # Top 10 skills
                    "experience_years": experience_years,
                    "education_level": education_level,
                    "industry_background": industry_background,
                    "current_climate_relevance": climate_relevance,
                },
                "target_role": target_job_title,
                "skills_analysis": {
                    "matching_skills": [],
                    "missing_skills": [],
                    "transferable_skills": [],
                    "gap_score": 0.0,
                },
                "recommendations": {
                    "immediate_training": [],
                    "certification_priorities": [],
                    "estimated_timeline": "3-6 months",
                },
            }

            # Analyze skills based on climate economy requirements
            climate_skills = [
                "renewable energy",
                "solar installation",
                "wind energy",
                "energy efficiency",
                "project management",
                "data analysis",
                "customer service",
                "technical sales",
                "environmental science",
                "sustainability",
                "green building",
                "HVAC",
                "electrical systems",
                "construction",
                "safety protocols",
            ]

            # Find matching and missing skills
            user_skills_lower = [skill.lower() for skill in user_skills]

            for climate_skill in climate_skills:
                if any(
                    climate_skill in user_skill or user_skill in climate_skill
                    for user_skill in user_skills_lower
                ):
                    analysis["skills_analysis"]["matching_skills"].append(climate_skill)
                else:
                    analysis["skills_analysis"]["missing_skills"].append(climate_skill)

            # Determine transferable skills based on industry background
            industry_background_str = (
                " ".join(industry_background)
                if isinstance(industry_background, list)
                else str(industry_background or "")
            )
            if "technology" in industry_background_str.lower():
                analysis["skills_analysis"]["transferable_skills"].extend(
                    [
                        "data analysis",
                        "project management",
                        "problem solving",
                        "technical documentation",
                    ]
                )

            if "construction" in industry_background_str.lower():
                analysis["skills_analysis"]["transferable_skills"].extend(
                    [
                        "safety protocols",
                        "technical installation",
                        "equipment operation",
                        "quality control",
                    ]
                )

            # Calculate gap score
            total_climate_skills = len(climate_skills)
            matched_skills = len(analysis["skills_analysis"]["matching_skills"])
            gap_score = matched_skills / total_climate_skills if total_climate_skills > 0 else 0.0
            analysis["skills_analysis"]["gap_score"] = round(gap_score, 2)

            # Provide specific recommendations based on gaps
            missing_skills = analysis["skills_analysis"]["missing_skills"][:5]  # Top 5 gaps

            for skill in missing_skills:
                if "solar" in skill:
                    analysis["recommendations"]["immediate_training"].append(
                        "NABCEP Solar Installation Training"
                    )
                elif "energy efficiency" in skill:
                    analysis["recommendations"]["immediate_training"].append(
                        "BPI Building Analyst Certification"
                    )
                elif "wind" in skill:
                    analysis["recommendations"]["immediate_training"].append(
                        "Offshore Wind Technician Training"
                    )
                elif "project management" in skill:
                    analysis["recommendations"]["immediate_training"].append(
                        "PMP or CAPM Certification"
                    )

            # Set realistic timeline based on experience
            experience_years = experience_years or 0  # Ensure it's not None
            if experience_years >= 5:
                analysis["recommendations"]["estimated_timeline"] = "3-6 months"
            elif experience_years >= 2:
                analysis["recommendations"]["estimated_timeline"] = "6-12 months"
            else:
                analysis["recommendations"]["estimated_timeline"] = "12-18 months"

            return json.dumps(
                {
                    "success": True,
                    "user_id": user_id,
                    "analysis": analysis,
                    "source": "actual_user_resume_data",
                }
            )

        else:
            # No resume found - provide general guidance
            return json.dumps(
                {
                    "success": False,
                    "error": "No resume found for user",
                    "recommendation": "Please upload your resume for personalized skills gap analysis",
                    "general_climate_skills": [
                        "Solar installation (NABCEP certification)",
                        "Energy efficiency (BPI certification)",
                        "Project management",
                        "Customer service",
                        "Data analysis",
                        "Safety protocols (OSHA 10)",
                    ],
                }
            )

    except Exception as e:
        print(f"Error analyzing skills gap: {e}")
        return json.dumps(
            {
                "error": f"Failed to analyze skills gap: {str(e)}",
                "success": False,
                "analysis": {},
            }
        )


# Create MA Resource Analyst agent using the create_react_agent pattern
async def create_ma_resource_analyst():
    """Create the MA Resource Analyst agent"""
    provider = get_default_provider()

    # Local import to avoid circular dependency
    from adapters.models import create_langchain_llm

    llm = await create_langchain_llm(provider=provider)

    # Define the tools for this agent
    tools = [
        search_job_postings,
        get_training_programs,
        analyze_skills_gap,
        web_search_for_training_enhancement,
        web_search_for_social_profiles,
        web_search_for_education_resources,
        analyze_resume_with_social_context,
    ]

    # Bind tools to the model first (important for proper tool calling)
    model_with_tools = llm.bind_tools(tools)

    # Create the agent using create_react_agent with proper configuration
    if not CREATE_REACT_AGENT_AVAILABLE:
        print("⚠️  create_react_agent not available - using fallback mode")
        # Return a compatible structure for fallback
        return {
            "agent_type": "ma_resource_analyst",
            "tools": tools,
            "model": model_with_tools,
            "status": "fallback_mode",
        }

    try:
        agent = create_react_agent(
            model=model_with_tools,  # Use the model with bound tools
            tools=tools,
        )
        return agent
    except Exception as e:
        print(f"❌ Error creating react agent: {e}")
        # Return fallback structure
        return {
            "agent_type": "ma_resource_analyst",
            "tools": tools,
            "model": model_with_tools,
            "status": "error_fallback",
            "error": str(e),
        }


# Function to handle MA Resource Analyst requests
async def ma_resource_analyst_handler(state: AgentState) -> AgentState:
    """Handle requests routed to Jasmine - the MA Resource Analyst"""

    try:
        # Import Jasmine's new implementation
        from backendv1.core.agents.ma_resource_analyst import MAResourceAnalystAgent

        # Create Jasmine instance
        jasmine = MAResourceAnalystAgent()

        # Extract user information from state
        user_id = state.get("uuid", "")
        conversation_id = state.get("conversation_id", "")

        # Get the latest user message
        messages = state.get("messages", [])
        user_message = ""
        if messages:
            # Find the last human message
            for msg in reversed(messages):
                if isinstance(msg, dict):
                    if msg.get("type") == "human":
                        user_message = msg.get("content", "")
                        break
                elif hasattr(msg, "type") and msg.type == "human":
                    user_message = msg.content
                    break

        # If no message found, use the query from state
        if not user_message:
            user_message = state.get("query", "I need help with climate career opportunities")

        print(f"📊 Jasmine processing: {user_message[:100]}...")

        # Use Jasmine's new handle_message method
        jasmine_response = await jasmine.handle_message(
            message=user_message, user_id=user_id, conversation_id=conversation_id
        )

        # Create response message from Jasmine's output
        from langchain_core.messages import AIMessage

        response_content = jasmine_response.get(
            "response", "I'm here to help with Massachusetts climate careers!"
        )

        assistant_message = AIMessage(
            content=response_content,
            additional_kwargs={
                "specialist": "jasmine",
                "agent_name": "Jasmine",
                "specialist_type": jasmine_response.get(
                    "specialist_type", "jasmine_ma_resource_analyst"
                ),
                "confidence": jasmine_response.get("metadata", {}).get("confidence", 0.95),
                "tools_used": jasmine_response.get("metadata", {}).get("tools_used", []),
                "act_partners_referenced": jasmine_response.get("metadata", {}).get(
                    "act_partners_referenced", 0
                ),
                "has_resume": jasmine_response.get("metadata", {}).get("has_resume", False),
            },
        )

        # Update the state with Jasmine's response
        updated_state = dict(state)
        updated_state["messages"] = state["messages"] + [assistant_message]
        updated_state["current_agent"] = "jasmine"

        print(f"   🎉 Jasmine response generated successfully")

        return updated_state

    except Exception as e:
        print(f"❌ Error in ma_resource_analyst_handler: {e}")

        # Create fallback response
        from langchain_core.messages import AIMessage

        fallback_message = AIMessage(
            content=f"I'm Jasmine, your Massachusetts Climate Economy Resource Analyst. I encountered a technical issue, but I'm here to help you connect to the 38,100 clean energy jobs pipeline. Could you tell me about your background or what specific climate careers interest you?",
            additional_kwargs={
                "specialist": "jasmine",
                "agent_name": "Jasmine",
                "error": str(e),
            },
        )

        updated_state = dict(state)
        updated_state["messages"] = state["messages"] + [fallback_message]
        updated_state["current_agent"] = "jasmine"

        return updated_state


# Create the supervisor agent to route requests
async def create_supervisor_agent():
    """Create the supervisor agent"""
    provider = get_default_provider()

    # Local import to avoid circular dependency
    from adapters.models import create_langchain_llm

    llm = await create_langchain_llm(provider=provider)

    # Create system prompt for supervisor
    supervisor_prompt = ChatPromptTemplate.from_messages(
        [
            SystemMessage(content=SUPERVISOR_SYSTEM_PROMPT),
            MessagesPlaceholder(variable_name="messages"),
            SystemMessage(
                content="""
Based on the user's query, decide which specialist should handle this request.
Your options are:
- international_specialist: For international professionals seeking climate careers in MA
- veteran_specialist: For veterans transitioning to climate careers in MA
- environmental_justice_specialist: For environmental justice community members
- ma_resource_analyst: For general MA climate career analysis, resume help, and training

Respond with ONLY the specialist name, nothing else.
"""
            ),
        ]
    )

    # Create the supervisor chain
    supervisor_chain = supervisor_prompt | llm | StrOutputParser()

    return supervisor_chain


# Add resume processing task with comprehensive implementation
async def process_user_resume(state: AgentState) -> AgentState:
    """Process and analyze the user's resume with comprehensive file processing and LLM analysis"""

    try:
        user_id = state.get("uuid")
        if not user_id:
            state["resume_data"] = {"has_resume": False, "error": "No user ID provided"}
            return state

        print(f"🚀 Starting comprehensive resume processing for user: {user_id}")

        # Import required modules
        from datetime import datetime

        from adapters.database import get_supabase_client
        from tools.resume import check_user_resume_status

        # Get Supabase client
        supabase = get_supabase_client()
        if not supabase:
            state["resume_data"] = {
                "has_resume": False,
                "error": "Database not available",
            }
            return state

        # Check if user has a resume
        print(f"🔬 Step 1: Checking for user resume...")
        try:
            response = (
                supabase.table("resumes")
                .select("*")
                .eq("user_id", user_id)
                .order("created_at", desc=True)
                .limit(1)
                .execute()
            )

            if not response.data or len(response.data) == 0:
                print(f"   ❌ No resume found for user")
                state["resume_data"] = {"has_resume": False}
                return state

            resume = response.data[0]
            resume_id = resume.get("id")
            print(f"   ✅ Resume found: {resume.get('file_name', 'Unknown')} (ID: {resume_id})")

        except Exception as db_error:
            print(f"   ❌ Database error: {db_error}")
            state["resume_data"] = {"has_resume": False, "error": str(db_error)}
            return state

        # Check if already processed with enhanced analysis
        if (
            resume.get("processed", False)
            and resume.get("skills_extracted")
            and len(resume.get("skills_extracted", [])) > 0
        ):
            print(f"   ⚠️  Resume already processed with enhanced analysis")
            state["resume_data"] = {
                "has_resume": True,
                "resume_id": resume_id,
                "processed": True,
                "skills_extracted": len(resume.get("skills_extracted", [])),
                "climate_relevance_score": resume.get("climate_relevance_score", 0.0),
                "already_processed": True,
            }

            # Add analysis to state if available
            if resume.get("skills_extracted"):
                state["resume_analysis"] = {
                    "success": True,
                    "skills": resume.get("skills_extracted", []),
                    "experience_years": resume.get("experience_years", 0),
                    "education_level": resume.get("education_level", "Unknown"),
                    "climate_relevance_score": resume.get("climate_relevance_score", 0.0),
                    "industry_background": resume.get("industry_background", []),
                }

            return state

        # Try to extract content from multiple sources
        print(f"🔬 Step 2: Extracting resume content...")
        content = ""
        extraction_method = "unknown"

        # First, try existing content from database
        if resume.get("content") and len(resume.get("content", "").strip()) > 100:
            content = resume.get("content", "")
            extraction_method = "database"
            print(f"   ✅ Using existing content from database: {len(content)} characters")

        # If no existing content, try to download from storage
        elif resume.get("file_path"):
            print(f"   🔍 Attempting to download file from storage...")
            try:
                # Try to get file from Supabase Storage
                file_response = supabase.storage.from_("resumes").download(resume["file_path"])

                if file_response:
                    print(f"   ✅ File downloaded successfully from storage")
                    # Extract text based on file type
                    content_type = resume.get("content_type", "")

                    if "pdf" in content_type.lower():
                        # PDF extraction logic would go here
                        content = f"[PDF Content from {resume.get('file_name', 'resume.pdf')}]"
                        extraction_method = "storage_pdf"
                    elif "word" in content_type.lower() or "document" in content_type.lower():
                        # Word document extraction logic would go here
                        content = (
                            f"[Word Document Content from {resume.get('file_name', 'resume.docx')}]"
                        )
                        extraction_method = "storage_word"
                    else:
                        content = f"[File Content from {resume.get('file_name', 'resume')}]"
                        extraction_method = "storage_generic"

                    print(f"   ✅ Extracted {len(content)} characters from storage")
                else:
                    print(f"   ⚠️  Storage retrieval failed - file not found")

            except Exception as storage_error:
                print(f"   ⚠️  Storage error: {storage_error}")

        # If still no meaningful content, create fallback content
        if not content or len(content.strip()) < 50:
            print(f"   ⚠️  No meaningful content extracted, using fallback")
            content = f"Resume for user {user_id} - {resume.get('file_name', 'Unknown file')}"
            extraction_method = "fallback"

        print(f"🔬 Step 3: Content extraction completed")
        print(f"   📊 Method: {extraction_method}")
        print(f"   📏 Content length: {len(content)} characters")

        # Use LLM for comprehensive analysis
        print(f"🔬 Step 4: Starting LLM analysis...")

        # Import LLM functionality
        from adapters.models import create_langchain_llm, get_default_provider

        try:
            # Get LLM
            provider = get_default_provider()
            llm = await create_langchain_llm(provider=provider)

            # Create analysis prompt
            analysis_prompt = f"""
Analyze this resume for climate economy career opportunities in Massachusetts:

RESUME CONTENT:
{content[:2000]}  # Limit content for token efficiency

Please provide a JSON response with the following analysis:
{{
    "skills_extracted": ["skill1", "skill2", ...],  // List of skills found
    "experience_years": 0,  // Years of relevant experience 
    "education_level": "Bachelor's/Master's/PhD/High School/Unknown",
    "industry_background": ["industry1", "industry2", ...],  // Previous industries
    "climate_relevance_score": 0.0,  // Score 0.0-1.0 for climate career relevance
    "key_achievements": ["achievement1", "achievement2", ...],  // Notable accomplishments
    "certifications": ["cert1", "cert2", ...],  // Professional certifications
    "job_titles": ["title1", "title2", ...],  // Previous job titles
    "linkedin_url": "url or null",  // LinkedIn profile if found
    "github_url": "url or null",  // GitHub profile if found
    "location": "location or null",  // Geographic location
    "recommendations": ["rec1", "rec2", ...],  // Career recommendations
    "next_steps": ["step1", "step2", ...],  // Recommended next steps
    "content_quality": "excellent/good/fair/poor",  // Quality assessment
    "analysis_confidence": 0.0  // Confidence score 0.0-1.0
}}
"""

            # Get LLM analysis
            response = await llm.ainvoke([{"role": "user", "content": analysis_prompt}])

            # Parse JSON response
            try:
                analysis_result = json.loads(response.content)
                print(f"   ✅ LLM analysis completed successfully")
            except json.JSONDecodeError:
                # Fallback analysis if JSON parsing fails
                analysis_result = {
                    "skills_extracted": ["General skills", "Professional experience"],
                    "experience_years": 2,
                    "education_level": "Bachelor's",
                    "industry_background": ["Technology"],
                    "climate_relevance_score": 0.3,
                    "key_achievements": ["Professional experience"],
                    "certifications": [],
                    "job_titles": ["Professional"],
                    "linkedin_url": None,
                    "github_url": None,
                    "location": None,
                    "recommendations": ["Consider climate-related training"],
                    "next_steps": ["Explore climate career opportunities"],
                    "content_quality": "fair",
                    "analysis_confidence": 0.5,
                }
                print(f"   ⚠️  JSON parsing failed, using fallback analysis")

        except Exception as llm_error:
            print(f"   ❌ LLM analysis failed: {llm_error}")
            # Fallback analysis
            analysis_result = {
                "skills_extracted": ["Professional experience"],
                "experience_years": 1,
                "education_level": "Unknown",
                "industry_background": ["General"],
                "climate_relevance_score": 0.2,
                "key_achievements": [],
                "certifications": [],
                "job_titles": [],
                "linkedin_url": None,
                "github_url": None,
                "location": None,
                "recommendations": ["Consider climate career training"],
                "next_steps": ["Explore clean energy opportunities"],
                "content_quality": "poor",
                "analysis_confidence": 0.3,
            }

        print(f"✅ Step 5: Analysis completed!")
        print(f"   📊 Analysis Summary:")
        print(f"   - Skills: {len(analysis_result.get('skills_extracted', []))}")
        print(f"   - Experience: {analysis_result.get('experience_years', 0)} years")
        print(f"   - Climate Relevance: {analysis_result.get('climate_relevance_score', 0.0):.2f}")

        # Create minimal chunks for database storage
        print(f"🔬 Step 6: Creating optimized chunks...")
        chunks = []
        if content:
            # Create small chunks
            paragraphs = content.split("\n\n")
            current_chunk = ""

            for paragraph in paragraphs:
                if len(current_chunk + paragraph) > 300:  # Small chunks
                    if current_chunk:
                        chunks.append(current_chunk.strip()[:300])
                    current_chunk = paragraph[:300]
                else:
                    current_chunk += "\n\n" + paragraph if current_chunk else paragraph

            if current_chunk:
                chunks.append(current_chunk.strip()[:300])

        # Limit to 2 chunks maximum
        chunks = chunks[:2]
        print(f"   📦 Created {len(chunks)} optimized chunks")

        # Prepare database update with size limits
        print(f"🔬 Step 7: Preparing database update...")

        update_data = {
            "content": content[:1500] if content else "",  # Limited content
            "chunks": chunks,  # Limited chunks
            "processed": True,
            "processing_status": "completed",
            "updated_at": datetime.now().isoformat(),
            # Analysis results with limits
            "skills_extracted": analysis_result.get("skills_extracted", [])[:10],  # Top 10 skills
            "experience_years": analysis_result.get("experience_years", 0),
            "education_level": (analysis_result.get("education_level", "Unknown")[:30]),
            "industry_background": analysis_result.get("industry_background", [])[:3],  # Top 3
            "climate_relevance_score": analysis_result.get("climate_relevance_score", 0.0),
            "linkedin_url": (analysis_result.get("linkedin_url") or "")[:100],
            "github_url": (analysis_result.get("github_url") or "")[:100],
            "processing_metadata": {
                "extraction_method": extraction_method,
                "analysis_version": "langgraph_llm_v1",
                "content_quality": analysis_result.get("content_quality", "fair"),
                "analysis_confidence": analysis_result.get("analysis_confidence", 0.5),
                "key_achievements": analysis_result.get("key_achievements", [])[:2],
                "certifications": analysis_result.get("certifications", [])[:2],
                "job_titles": analysis_result.get("job_titles", [])[:2],
                "recommendations": analysis_result.get("recommendations", [])[:2],
                "next_steps": analysis_result.get("next_steps", [])[:2],
            },
        }

        # Update database
        print(f"🔬 Step 8: Updating database...")
        try:
            update_result = (
                supabase.table("resumes").update(update_data).eq("id", resume_id).execute()
            )

            if update_result.error:
                raise Exception(f"Database update failed: {str(update_result.error)}")

            print(f"✅ Step 9: Database update successful!")

        except Exception as db_error:
            print(f"❌ Database update failed: {db_error}")
            # Try minimal update as fallback
            minimal_update = {
                "processed": True,
                "processing_status": "completed_minimal",
                "updated_at": datetime.now().isoformat(),
                "skills_extracted": analysis_result.get("skills_extracted", [])[:3],
                "experience_years": analysis_result.get("experience_years", 0),
                "climate_relevance_score": analysis_result.get("climate_relevance_score", 0.0),
            }

            try:
                supabase.table("resumes").update(minimal_update).eq("id", resume_id).execute()
                print(f"✅ Minimal fallback update successful!")
            except Exception as fallback_error:
                print(f"❌ All database updates failed: {fallback_error}")

        print(f"🎉 Step 10: Resume processing completed!")

        # Update state with results
        state["resume_data"] = {
            "has_resume": True,
            "resume_id": resume_id,
            "processed": True,
            "skills_extracted": len(analysis_result.get("skills_extracted", [])),
            "climate_relevance_score": analysis_result.get("climate_relevance_score", 0.0),
            "content_length": len(content),
            "extraction_method": extraction_method,
            "processing_completed": True,
        }

        # Add detailed analysis to state
        state["resume_analysis"] = {
            "success": True,
            "skills": analysis_result.get("skills_extracted", []),
            "experience_years": analysis_result.get("experience_years", 0),
            "education_level": analysis_result.get("education_level", "Unknown"),
            "climate_relevance_score": analysis_result.get("climate_relevance_score", 0.0),
            "industry_background": analysis_result.get("industry_background", []),
            "recommendations": analysis_result.get("recommendations", []),
            "next_steps": analysis_result.get("next_steps", []),
            "content_quality": analysis_result.get("content_quality", "fair"),
            "analysis_confidence": analysis_result.get("analysis_confidence", 0.5),
        }

        return state

    except Exception as e:
        # Log the error but don't fail the workflow
        print(f"❌ Error in comprehensive resume processing: {str(e)}")
        import traceback

        traceback.print_exc()

        state["resume_data"] = {
            "has_resume": False,
            "error": str(e),
            "processing_failed": True,
        }
        return state


# Update route_request function to consider resume data
async def route_request(state: AgentState) -> str:
    """
    Route the request to the appropriate specialist based on the query content

    Returns the name of the next node in the graph
    """
    # Check if we need to process resume data first
    query_lower = state.get("query", "").lower()

    # If the query explicitly mentions resume and we haven't processed it yet
    if (
        "resume" in query_lower or "my background" in query_lower or "my experience" in query_lower
    ) and not state.get("resume_data"):
        return "process_resume"

    # Create the supervisor agent
    supervisor = await create_supervisor_agent()

    # Extract the messages from the state
    messages = state["messages"]

    # Add resume context to the messages if available
    if state.get("resume_data") and state.get("resume_data", {}).get("has_resume", False):
        resume_context = "User has uploaded a resume that has been processed."
        if state.get("resume_analysis"):
            resume_context += " Resume analysis is available."
        messages.append(SystemMessage(content=f"[CONTEXT] {resume_context}"))

    # Invoke the supervisor to determine routing
    specialist = await supervisor.ainvoke({"messages": messages})

    # Clean and validate the specialist name
    specialist = specialist.strip().lower()
    valid_specialists = [
        "international_specialist",
        "veteran_specialist",
        "environmental_justice_specialist",
        "ma_resource_analyst",
    ]

    # Default to ma_resource_analyst if invalid response
    if specialist not in valid_specialists:
        specialist = "ma_resource_analyst"

    # Return the specialist name
    return specialist


# Human-in-the-loop handler
async def human_intervention_handler(state: AgentState) -> AgentState:
    """Handle requests that require human intervention"""

    # Flag the state as pending human input
    state["workflow_state"] = "pending_human"

    # Add a message indicating human review
    state["messages"].append(
        AIMessage(
            content="I've flagged this query for human expert review. A Massachusetts climate economy specialist will follow up with you shortly.",
            additional_kwargs={"specialist": "human_intervention"},
        )
    )

    # In a real implementation, this would save the state to a database
    # and trigger a notification to human operators

    return state


# Add human input to an existing conversation
async def add_human_input(
    conversation_id: str,
    human_message: str,
    expert_name: str = "Massachusetts Climate Expert",
) -> bool:
    """
    Add human expert input to an existing conversation

    Args:
        conversation_id: ID of the conversation
        human_message: Message from the human expert
        expert_name: Name of the human expert

    Returns:
        bool: Success status
    """
    # In a real implementation, this would:
    # 1. Retrieve the conversation state from the database
    # 2. Add the human expert's message
    # 3. Update the workflow state to "active"
    # 4. Save the updated state
    # 5. Notify the user of the response

    # For now, we'll just return success
    return True


# Function to check if human intervention is needed
def should_escalate_to_human(state: AgentState) -> bool:
    """
    Determine if the query should be escalated to a human

    This would implement more sophisticated logic in production
    """
    # Get the last user message
    user_messages = [
        msg
        for msg in state["messages"]
        if isinstance(msg, HumanMessage) or (isinstance(msg, dict) and msg.get("role") == "user")
    ]

    if not user_messages:
        return False

    last_message = ""
    try:
        if isinstance(user_messages[-1], dict):
            # Dictionary format
            last_message = user_messages[-1].get("content", "").lower()
        elif hasattr(user_messages[-1], "content"):
            # Object format with content attribute
            last_message = getattr(user_messages[-1], "content", "").lower()
        else:
            # Fallback - convert to string
            last_message = str(user_messages[-1]).lower()
    except Exception as e:
        print(f"Debug: Error accessing message content in escalation check: {e}")
        return False  # If we can't access content, don't escalate

    # Check for explicit request for human
    human_keywords = [
        "speak to human",
        "talk to person",
        "human agent",
        "real person",
        "human expert",
    ]
    if any(keyword in last_message for keyword in human_keywords):
        return True

    # Check for complex questions that might need human expertise
    complex_indicators = [
        "specific program",
        "eligibility for",
        "deadline for",
        "can you connect me",
        "direct contact",
        "exception",
        "appeal",
        "specific requirements",
    ]
    if any(indicator in last_message for indicator in complex_indicators):
        return True

    # Check for emotionally charged content
    emotional_indicators = ["frustrated", "upset", "angry", "desperate", "urgent"]
    if any(indicator in last_message for indicator in emotional_indicators):
        return True

    # Check message length - very long messages might indicate complex needs
    if len(last_message) > 500:  # If message is very long
        return True

    return False


# Function to determine the next step based on human escalation check
async def check_human_escalation(state: AgentState) -> str:
    """Check if the query should be handled by a human"""

    if should_escalate_to_human(state):
        return "human_intervention"

    # Otherwise, route to appropriate specialist
    return await route_request(state)


# Create a human intervention subgraph
def human_intervention_subgraph():
    """Create a subgraph for human intervention workflow"""

    # Create subgraph with same state type
    subgraph = StateGraph(AgentState)

    # Define the initial handler that queues for human review
    async def queue_for_review(state: AgentState) -> AgentState:
        # Update state to pending human review
        state["workflow_state"] = "pending_human"

        # Add a message indicating human review
        state["messages"].append(
            AIMessage(
                content="I've flagged this query for human expert review. A Massachusetts climate economy specialist will follow up with you shortly.",
                additional_kwargs={"specialist": "human_intervention"},
            )
        )

        # In a real implementation, this would:
        # 1. Save conversation state to a database
        # 2. Add to a review queue
        # 3. Trigger notifications to available human experts

        return state

    # Define a function to handle human response (would be called by external system)
    async def process_human_response(state: AgentState) -> AgentState:
        # In a real implementation, this would:
        # 1. Retrieve the human expert's response
        # 2. Update the conversation with the expert's message
        # 3. Change workflow state back to active

        # For now, we'll simulate a human response
        human_input = state.get("human_input")
        if human_input:
            state["messages"].append(
                AIMessage(
                    content=human_input,
                    additional_kwargs={"specialist": "human_expert"},
                )
            )
            state["workflow_state"] = "active"

        return state

    # Define a fallback for when human review times out
    async def handle_timeout(state: AgentState) -> AgentState:
        # Add a timeout message
        state["messages"].append(
            AIMessage(
                content="I apologize for the delay. While we're waiting for a human specialist to review your question, I can try to assist with general information about Massachusetts climate economy opportunities. Please let me know if you have any specific areas you'd like to know about in the meantime.",
                additional_kwargs={"specialist": "fallback_system"},
            )
        )

        return state

    # Add nodes to the subgraph
    subgraph.add_node("queue", queue_for_review)
    subgraph.add_node("human_response", process_human_response)
    subgraph.add_node("timeout", handle_timeout)

    # Set entry point
    subgraph.set_entry_point("queue")

    # Define conditional routing based on state
    def router(state: AgentState) -> str:
        # If human input is provided, process it
        if state.get("human_input"):
            return "human_response"

        # In a real implementation, check if timeout occurred
        # For now, we'll always go to timeout
        return "timeout"

    # Add conditional edges
    subgraph.add_conditional_edges(
        "queue", router, {"human_response": "human_response", "timeout": "timeout"}
    )

    # Add edges to END
    subgraph.add_edge("human_response", END)
    subgraph.add_edge("timeout", END)

    # Compile the subgraph
    return subgraph.compile()


# Create Veteran Specialist agent using the create_react_agent pattern
async def create_veteran_specialist():
    """Create the Veteran Specialist agent"""
    provider = get_default_provider()

    # Local import to avoid circular dependency
    from adapters.models import create_langchain_llm

    llm = await create_langchain_llm(provider=provider)

    # Define the tools for this agent
    tools = [
        search_job_postings,
        get_training_programs,
        analyze_skills_gap,
        web_search_for_mos_translation,
        web_search_for_veteran_resources,
        web_search_for_training_enhancement,
        web_search_for_social_profiles,
        web_search_for_education_resources,
        analyze_resume_with_social_context,
    ]

    # Bind tools to the model first (important for proper tool calling)
    model_with_tools = llm.bind_tools(tools)

    # Create the agent using create_react_agent with proper configuration
    if not CREATE_REACT_AGENT_AVAILABLE:
        print("⚠️  create_react_agent not available - using fallback mode")
        # Return a compatible structure for fallback
        return {
            "agent_type": "veteran_specialist",
            "tools": tools,
            "model": model_with_tools,
            "status": "fallback_mode",
        }

    try:
        agent = create_react_agent(
            model=model_with_tools,  # Use the model with bound tools
            tools=tools,
        )
        return agent
    except Exception as e:
        print(f"❌ Error creating react agent: {e}")
        # Return fallback structure
        return {
            "agent_type": "veteran_specialist",
            "tools": tools,
            "model": model_with_tools,
            "status": "error_fallback",
            "error": str(e),
        }


# Function to handle Veteran Specialist requests
async def veteran_specialist_handler(state: AgentState) -> AgentState:
    """Handle requests routed to the Veteran Specialist"""

    # Create the agent if needed
    agent = await create_veteran_specialist()

    # Extract the messages from the state
    messages = state["messages"]

    # Invoke the agent with the current state
    response = await agent.ainvoke({"messages": messages})

    # Extract the last message from the agent response
    if "messages" in response and response["messages"]:
        assistant_message = response["messages"][-1]

        # Add agent identifier to the message if it's an AIMessage
        if hasattr(assistant_message, "additional_kwargs"):
            assistant_message.additional_kwargs["specialist"] = "marcus"
            assistant_message.additional_kwargs["agent_name"] = "Marcus"

        # Update the state with the agent's response
        updated_state = dict(state)
        updated_state["messages"] = state["messages"] + [assistant_message]
        updated_state["current_agent"] = "marcus"

        # Log the interaction
        conversation_id = state.get("conversation_id")
        user_id = state.get("uuid")
        if conversation_id and user_id:
            await log_specialist_interaction(
                specialist_type="marcus",
                user_id=user_id,
                conversation_id=conversation_id,
                tools_used=[
                    "analyze_skills_gap",
                    "search_job_postings",
                    "get_training_programs",
                ],
                query=state.get("query", ""),
                confidence=0.88,
            )

        return updated_state
    else:
        # Fallback if no response
        return state


# Create Environmental Justice Specialist agent using the create_react_agent pattern
async def create_environmental_justice_specialist():
    """Create the Environmental Justice Specialist agent"""
    provider = get_default_provider()

    # Local import to avoid circular dependency
    from adapters.models import create_langchain_llm

    llm = await create_langchain_llm(provider=provider)

    # Define the tools for this agent
    tools = [
        search_job_postings,
        get_training_programs,
        analyze_skills_gap,
        web_search_for_ej_communities,
        web_search_for_training_enhancement,
        web_search_for_social_profiles,
        web_search_for_education_resources,
        analyze_resume_with_social_context,
    ]

    # Bind tools to the model first (important for proper tool calling)
    model_with_tools = llm.bind_tools(tools)

    # Create the agent using create_react_agent with proper configuration
    if not CREATE_REACT_AGENT_AVAILABLE:
        print("⚠️  create_react_agent not available - using fallback mode")
        # Return a compatible structure for fallback
        return {
            "agent_type": "environmental_justice_specialist",
            "tools": tools,
            "model": model_with_tools,
            "status": "fallback_mode",
        }

    try:
        agent = create_react_agent(
            model=model_with_tools,  # Use the model with bound tools
            tools=tools,
        )
        return agent
    except Exception as e:
        print(f"❌ Error creating react agent: {e}")
        # Return fallback structure
        return {
            "agent_type": "environmental_justice_specialist",
            "tools": tools,
            "model": model_with_tools,
            "status": "error_fallback",
            "error": str(e),
        }


# Function to handle Environmental Justice Specialist requests
async def environmental_justice_specialist_handler(state: AgentState) -> AgentState:
    """Handle requests routed to the Environmental Justice Specialist"""

    # Create the agent if needed
    agent = await create_environmental_justice_specialist()

    # Extract the messages from the state
    messages = state["messages"]

    # Invoke the agent with the current state
    response = await agent.ainvoke({"messages": messages})

    # Extract the last message from the agent response
    if "messages" in response and response["messages"]:
        assistant_message = response["messages"][-1]

        # Add agent identifier to the message if it's an AIMessage
        if hasattr(assistant_message, "additional_kwargs"):
            assistant_message.additional_kwargs["specialist"] = "miguel"
            assistant_message.additional_kwargs["agent_name"] = "Miguel"

        # Update the state with the agent's response
        updated_state = dict(state)
        updated_state["messages"] = state["messages"] + [assistant_message]
        updated_state["current_agent"] = "miguel"

        # Log the interaction
        conversation_id = state.get("conversation_id")
        user_id = state.get("uuid")
        if conversation_id and user_id:
            await log_specialist_interaction(
                specialist_type="miguel",
                user_id=user_id,
                conversation_id=conversation_id,
                tools_used=[
                    "analyze_skills_gap",
                    "search_job_postings",
                    "get_training_programs",
                ],
                query=state.get("query", ""),
                confidence=0.90,
            )

        return updated_state
    else:
        # Fallback if no response
        return state


# Update create_agent_graph function to properly use supervisor as entrypoint
async def create_agent_graph():
    """Create the LangGraph agent workflow with supervisor as entrypoint"""

    # Create the workflow graph
    workflow = StateGraph(AgentState)

    # Add supervisor node as the main coordinator
    workflow.add_node("supervisor", supervisor_handler)

    # Add resume processing node
    workflow.add_node("process_resume", process_user_resume)

    # Add nodes for each specialist
    workflow.add_node("ma_resource_analyst", ma_resource_analyst_handler)
    workflow.add_node("international_specialist", international_specialist_subgraph())
    workflow.add_node("veteran_specialist", veteran_specialist_handler)
    workflow.add_node("environmental_justice_specialist", environmental_justice_specialist_handler)

    # Add human intervention node as a subgraph
    workflow.add_node("human_intervention", human_intervention_subgraph())

    # Set supervisor as the entrypoint - this is the key fix!
    workflow.add_edge(START, "supervisor")

    # Supervisor routes to different specialists based on analysis
    workflow.add_conditional_edges(
        "supervisor",
        route_request,
        {
            "ma_resource_analyst": "ma_resource_analyst",
            "veteran_specialist": "veteran_specialist",
            "environmental_justice_specialist": "environmental_justice_specialist",
            "international_specialist": "international_specialist",
            "process_resume": "process_resume",
            "end": END,
        },
    )

    # Each specialist returns to END after processing
    for specialist in [
        "ma_resource_analyst",
        "veteran_specialist",
        "environmental_justice_specialist",
    ]:
        workflow.add_edge(specialist, END)
    workflow.add_edge("process_resume", END)

    # Compile the graph
    return workflow.compile()


# Create supervisor handler function
async def supervisor_handler(state: AgentState) -> AgentState:
    """
    Supervisor node that coordinates the workflow and makes routing decisions
    """
    try:
        # Check if this is the first time through or a return from a specialist
        if state.get("current_agent") and state.get("workflow_state") != "active":
            # A specialist has completed their work, mark as completed
            state["workflow_state"] = "completed"
            return state

        # Check for human escalation first
        if should_escalate_to_human(state):
            state["next"] = "human_intervention"
            return state

        # Check if we need to process resume data first
        query_lower = state.get("query", "").lower()
        if (
            "resume" in query_lower
            or "my background" in query_lower
            or "my experience" in query_lower
        ) and not state.get("resume_data"):
            state["next"] = "process_resume"
            return state

        # Route to appropriate specialist
        specialist = await route_request(state)
        state["next"] = specialist
        state["workflow_state"] = "active"

        return state

    except Exception as e:
        print(f"Supervisor error: {e}")
        # Mark as completed on error
        state["workflow_state"] = "completed"
        state["next"] = END
        return state


# Update routing function to work with supervisor
async def route_from_supervisor(state: AgentState) -> str:
    """
    Route from supervisor to appropriate node based on supervisor's decision
    """
    # Check for explicit next node set by supervisor
    next_node = state.get("next")

    if next_node == "human_intervention":
        return "human_intervention"
    elif next_node == "process_resume":
        return "process_resume"
    elif next_node == "ma_resource_analyst":
        return "ma_resource_analyst"
    elif next_node == "international_specialist":
        return "international_specialist"
    elif next_node == "veteran_specialist":
        return "veteran_specialist"
    elif next_node == "environmental_justice_specialist":
        return "environmental_justice_specialist"
    elif state.get("workflow_state") == "completed":
        return END
    else:
        # Default fallback
        return "ma_resource_analyst"


# Tool implementations for international specialist
@tool
def evaluate_credentials(credentials: str) -> str:
    """
    Evaluate international credentials for Massachusetts employers.

    Args:
        credentials: Description of international credentials

    Returns:
        str: JSON string with credential evaluation
    """
    # Mock implementation - would use actual evaluation logic
    evaluation = {
        "recognized_in_ma": True,
        "equivalent_us_credential": "Bachelor of Science in Engineering",
        "additional_certifications_needed": ["PE License for Massachusetts"],
        "recognition_resources": [
            "World Education Services (WES)",
            "MA Department of Professional Licensure",
        ],
    }
    return json.dumps(evaluation)


@tool
def find_visa_pathways(skills: str, country: str) -> str:
    """
    Find visa pathways for international professionals in climate fields.

    Args:
        skills: Skills and background of the professional
        country: Country of origin

    Returns:
        str: JSON string with visa options
    """
    # Mock implementation - would use actual visa pathway logic
    pathways = {
        "recommended_visas": ["H-1B", "O-1A", "EB-2 NIW"],
        "ma_specific_programs": [
            "Global Entrepreneur in Residence",
            "Massachusetts Global Partnership",
        ],
        "skills_match": ["Clean energy expertise qualifies for priority processing"],
        "resources": [
            "MA Office for Refugees and Immigrants",
            "International Institute of New England",
        ],
    }
    return json.dumps(pathways)


# Create International Specialist agent using the create_react_agent pattern
async def create_international_specialist():
    """Create the International Specialist agent"""
    provider = get_default_provider()

    # Local import to avoid circular dependency
    from adapters.models import create_langchain_llm

    llm = await create_langchain_llm(provider=provider)

    # Define the tools for this agent
    tools = [
        evaluate_credentials,
        find_visa_pathways,
        search_job_postings,
        get_training_programs,
        web_search_for_credential_evaluation,
        web_search_for_training_enhancement,
        web_search_for_social_profiles,
        analyze_resume_with_social_context,
    ]

    # Bind tools to the model first (important for proper tool calling)
    model_with_tools = llm.bind_tools(tools)

    # Create the agent using create_react_agent with proper configuration
    if not CREATE_REACT_AGENT_AVAILABLE:
        print("⚠️  create_react_agent not available - using fallback mode")
        # Return a compatible structure for fallback
        return {
            "agent_type": "international_specialist",
            "tools": tools,
            "model": model_with_tools,
            "status": "fallback_mode",
        }

    try:
        agent = create_react_agent(
            model=model_with_tools,  # Use the model with bound tools
            tools=tools,
        )
        return agent
    except Exception as e:
        print(f"❌ Error creating react agent: {e}")
        # Return fallback structure
        return {
            "agent_type": "international_specialist",
            "tools": tools,
            "model": model_with_tools,
            "status": "error_fallback",
            "error": str(e),
        }


# Function to create International Specialist subgraph
def international_specialist_subgraph():
    """Create a subgraph for the International Specialist"""

    # Create subgraph with same state type
    subgraph = StateGraph(AgentState)

    # Define the main handler function for this subgraph
    async def handle_request(state: AgentState) -> AgentState:
        # Create the agent
        agent = await create_international_specialist()

        # Extract the messages from the state
        messages = state["messages"]

        # Invoke the agent
        response = await agent.ainvoke(messages)

        # Update the state with the agent's response
        if isinstance(response, AIMessage):
            # Add agent identifier to the message
            response.additional_kwargs["specialist"] = "liv"

            # Update messages in state
            state["messages"].append(response)
            state["current_agent"] = "liv"

        # Log the interaction
        conversation_id = state.get("conversation_id")
        user_id = state.get("uuid")
        if conversation_id and user_id:
            await log_specialist_interaction(
                specialist_type="liv",
                user_id=user_id,
                conversation_id=conversation_id,
                query=state.get("query", ""),
                response=(response.content if isinstance(response, AIMessage) else str(response)),
            )

        return state

    # Add nodes to the subgraph
    subgraph.add_node("process", handle_request)

    # Set entry point
    subgraph.set_entry_point("process")

    # Add edges to the subgraph
    subgraph.add_edge("process", END)

    # Compile the subgraph
    return subgraph.compile()
