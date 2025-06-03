from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import os
import json
import tempfile
from dotenv import load_dotenv
from pathlib import Path
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_core.documents import Document
from langchain.schema import HumanMessage, SystemMessage
from langchain_core.output_parsers import StrOutputParser
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader

# Import local modules
from cea.resume_processor import ResumeProcessor
from cea.rag_tool import ResumeRAGTool
from cea.social_search import SocialProfileSearcher
from cea.agent_tools import create_resume_agent_for_user, run_agent_query
from cea.climate_ecosystem_tools import (
    search_climate_ecosystem,
    get_partner_information,
    get_climate_focus_insights,
    ClimateEcosystemSearchTool
)

# Load environment variables from root directory
root_dir = Path(__file__).resolve().parent.parent
env_path = root_dir / '.env'
load_dotenv(env_path)

# Check if OpenAI API key is set
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise ValueError("OPENAI_API_KEY environment variable is not set. Please check your .env file at: " + str(env_path))

# Get Tavily API key
tavily_api_key = os.getenv("TAVILY_API_KEY")
if not tavily_api_key:
    print("Warning: TAVILY_API_KEY is not set. Social search functionality will be limited.")

# Initialize LangChain OpenAI chat model
chat_model = ChatOpenAI(
    model="gpt-4-turbo",
    temperature=0.7,
    api_key=api_key
)

# Initialize OpenAI Embeddings
embeddings = OpenAIEmbeddings(api_key=api_key)

# Initialize Supabase connection
supabase_url = os.getenv("SUPABASE_URL")
supabase_service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# Initialize Resume Processor
resume_processor = ResumeProcessor(
    openai_api_key=api_key,
    supabase_url=supabase_url,
    supabase_key=supabase_service_key
)

# Initialize Resume RAG Tool
resume_rag = ResumeRAGTool(
    openai_api_key=api_key,
    supabase_url=supabase_url,
    supabase_key=supabase_service_key
)

# Initialize Social Profile Searcher
social_searcher = SocialProfileSearcher(
    tavily_api_key=tavily_api_key,
    openai_api_key=api_key
)

# Initialize Climate Ecosystem Search Tool
climate_ecosystem = ClimateEcosystemSearchTool(
    openai_api_key=api_key,
    supabase_url=supabase_url,
    supabase_key=supabase_service_key
)

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://localhost:3001"  # Added for dev server on port 3001
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatMessage(BaseModel):
    content: str
    role: Optional[str] = "user"
    context: Optional[str] = "general"  # Added context field
    resumeData: Optional[Dict[str, Any]] = None  # Added resume data field
    useResumeRAG: Optional[bool] = False  # Toggle to use RAG for resume chat

class ChatResponse(BaseModel):
    content: str
    role: str = "assistant"
    sources: Optional[List[Dict[str, Any]]] = None

class HealthResponse(BaseModel):
    status: str = "ok"

class ResumeData(BaseModel):
    file_url: str
    file_id: str
    context: Optional[str] = "general"

class ResumeProcessingResponse(BaseModel):
    status: str
    chunks_processed: int
    message: str

class ResumeSearchQuery(BaseModel):
    query: str
    user_id: str
    match_threshold: Optional[float] = 0.7
    match_count: Optional[int] = 5

class ResumeSearchResult(BaseModel):
    results: List[Dict[str, Any]]

class ResumeChatQuery(BaseModel):
    query: str
    user_id: str
    chat_history: Optional[List[List[str]]] = None

class ResumeChatResponse(BaseModel):
    answer: str
    sources: Optional[List[Dict[str, Any]]] = None
    success: bool

class DebugResumeQuery(BaseModel):
    resume_id: str

class DebugResumeResponse(BaseModel):
    debug_info: Dict[str, Any]

class SocialLinksData(BaseModel):
    resume_id: str
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    personal_website: Optional[str] = None

class SocialLinksResponse(BaseModel):
    success: bool
    message: str

class SocialSearchRequest(BaseModel):
    resume_id: str

class SocialSearchResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None

class AgentQuery(BaseModel):
    query: str
    user_id: str
    chat_history: Optional[List[Dict[str, str]]] = None

class AgentResponse(BaseModel):
    answer: str
    success: bool
    thoughts: Optional[str] = None
    tool_usage: Optional[List[Dict[str, Any]]] = None

class ResumeChatWithSocialQuery(BaseModel):
    query: str
    user_id: str
    chat_history: Optional[List[List[str]]] = None
    include_social_data: Optional[bool] = True

class UserResumeCheckRequest(BaseModel):
    user_id: str

class UserResumeCheckResponse(BaseModel):
    has_resume: bool
    resume_id: Optional[str] = None
    file_name: Optional[str] = None
    has_social_data: bool = False
    social_links: Dict[str, Optional[str]] = {}

class EnhancedSearchRequest(BaseModel):
    user_id: str
    resume_id: Optional[str] = None
    force_refresh: bool = False

class EnhancedSearchResponse(BaseModel):
    success: bool
    message: str
    has_social_data: bool = False
    social_summary: Optional[str] = None

# Climate Ecosystem Models
class ClimateEcosystemSearchRequest(BaseModel):
    query: str
    search_type: Optional[str] = "all"  # all, knowledge, jobs, education
    filters: Optional[Dict[str, Any]] = None
    limit: Optional[int] = 20

class ClimateEcosystemSearchResponse(BaseModel):
    success: bool
    query: str
    search_type: str
    results: List[Dict[str, Any]]
    count: int
    breakdown: Dict[str, int]

class PartnerInformationRequest(BaseModel):
    partner_name: Optional[str] = None
    partner_type: Optional[str] = None

class PartnerInformationResponse(BaseModel):
    success: bool
    partners: List[Dict[str, Any]]

class ClimateFocusInsightsRequest(BaseModel):
    focus_area: str

class ClimateFocusInsightsResponse(BaseModel):
    success: bool
    insights: Dict[str, Any]

class ClimateCareerAgentRequest(BaseModel):
    query: str
    user_id: Optional[str] = None
    search_type: Optional[str] = "all"
    include_resume_context: Optional[bool] = False

class ClimateCareerAgentResponse(BaseModel):
    answer: str
    success: bool
    search_results: Optional[List[Dict[str, Any]]] = None
    partner_recommendations: Optional[List[Dict[str, Any]]] = None
    insights: Optional[Dict[str, Any]] = None

# Enhanced Chat Response Models
class SourceReference(BaseModel):
    title: str
    url: Optional[str] = None
    partner_name: str
    content_type: str  # 'job', 'education', 'knowledge', 'partner_info'
    relevance_score: Optional[float] = None

class FollowUpQuestion(BaseModel):
    question: str
    category: str  # 'jobs', 'education', 'partners', 'skills', 'location'
    context: str  # Additional context for the question

class ActionableItem(BaseModel):
    action: str  # 'apply', 'learn_more', 'contact', 'explore'
    title: str
    url: Optional[str] = None
    description: str
    partner_name: Optional[str] = None

class EnhancedChatResponse(BaseModel):
    content: str  # Plain text, no markdown
    role: str = "assistant"
    sources: List[SourceReference] = []
    actionable_items: List[ActionableItem] = []
    follow_up_questions: List[FollowUpQuestion] = []
    context_summary: Optional[str] = None  # What the system found/searched
    suggestions: List[str] = []  # Quick suggestions for next queries

class EnhancedChatRequest(BaseModel):
    content: str
    role: Optional[str] = "user"
    context: Optional[str] = "general"
    resumeData: Optional[Dict[str, Any]] = None
    useResumeRAG: Optional[bool] = False
    user_id: Optional[str] = None

# Enhanced Resume Response Models
class SkillGap(BaseModel):
    skill: str
    current_level: str  # 'none', 'beginner', 'intermediate', 'advanced'
    target_level: str
    gap_description: str
    urgency: str  # 'low', 'medium', 'high'

class CareerRecommendation(BaseModel):
    title: str
    description: str
    match_score: float
    required_skills: List[str]
    recommended_actions: List[str]
    partner_name: Optional[str] = None
    application_url: Optional[str] = None

class UpskillingProgram(BaseModel):
    program_name: str
    provider: str
    program_type: str  # 'certificate', 'bootcamp', 'degree', 'online_course'
    skills_covered: List[str]
    duration: Optional[str] = None
    cost: Optional[str] = None
    application_url: Optional[str] = None
    relevance_score: float

class CareerPathway(BaseModel):
    pathway_title: str
    description: str
    steps: List[str]
    timeline: str
    required_skills: List[str]
    related_jobs: List[str]
    resources: List[SourceReference]

class ResumeAnalysisResponse(BaseModel):
    content: str  # Plain text analysis, no markdown
    strengths: List[str]
    improvement_areas: List[str]
    skill_gaps: List[SkillGap]
    career_recommendations: List[CareerRecommendation]
    upskilling_programs: List[UpskillingProgram]
    career_pathways: List[CareerPathway]
    sources: List[SourceReference]
    actionable_items: List[ActionableItem]
    follow_up_questions: List[FollowUpQuestion]
    external_resources: List[SourceReference]

class ResumeAnalysisRequest(BaseModel):
    user_id: str
    analysis_type: Optional[str] = "comprehensive"  # 'skills', 'career_fit', 'comprehensive'
    target_roles: Optional[List[str]] = None
    target_industry: Optional[str] = "climate_economy"

class JobMatchResponse(BaseModel):
    content: str  # Plain text recommendations
    matched_jobs: List[CareerRecommendation]
    skill_alignment: Dict[str, float]  # skill -> match percentage
    missing_skills: List[SkillGap]
    recommended_actions: List[ActionableItem]
    sources: List[SourceReference]
    follow_up_questions: List[FollowUpQuestion]
    context_summary: str

class JobMatchRequest(BaseModel):
    user_id: str
    job_preferences: Optional[Dict[str, Any]] = None
    location_preference: Optional[str] = None
    experience_level: Optional[str] = None

# Skills Translation Models - Key Selling Point
class SkillTranslation(BaseModel):
    original_skill: str
    original_domain: str
    climate_equivalent: str
    climate_domain: str
    transferability_score: float  # 0.0 to 1.0
    translation_explanation: str
    examples: List[str]  # Specific examples of how the skill applies
    positioning_advice: str  # How to present this skill for climate roles
    community_specific_guidance: Optional[str] = None  # Community-specific advice

class SkillCluster(BaseModel):
    cluster_name: str
    original_skills: List[str]
    climate_applications: List[str]
    complementary_skills_needed: List[str]
    recommended_roles: List[str]
    sample_projects: List[str]
    community_pathway: Optional[str] = None  # Specific pathway for community

class CommunityBarrier(BaseModel):
    barrier_type: str  # 'credentialing', 'language', 'network', 'cultural', 'financial'
    description: str
    impact_level: str  # 'low', 'medium', 'high'
    mitigation_strategies: List[str]
    partner_resources: List[str]

class CommunityOpportunity(BaseModel):
    opportunity_type: str  # 'targeted_program', 'community_partnership', 'mentorship', 'fast_track'
    title: str
    description: str
    eligibility_criteria: List[str]
    partner_organization: str
    application_process: str
    timeline: str

class SkillTranslationResponse(BaseModel):
    content: str  # Plain text analysis
    skill_translations: List[SkillTranslation]
    skill_clusters: List[SkillCluster]
    high_transferability_skills: List[str]
    skills_needing_development: List[str]
    climate_career_readiness_score: float
    recommended_positioning: str
    actionable_items: List[ActionableItem]
    sources: List[SourceReference]
    follow_up_questions: List[FollowUpQuestion]
    success_stories: List[str]  # Examples of similar transitions
    # Community-specific enhancements
    community_profile: Optional[str] = None  # 'veteran', 'environmental_justice', 'international_professional'
    community_barriers: List[CommunityBarrier] = []
    community_opportunities: List[CommunityOpportunity] = []
    cultural_assets: List[str] = []  # Unique strengths from community background
    network_resources: List[SourceReference] = []  # Community-specific networks and organizations

class SkillTranslationRequest(BaseModel):
    user_id: str
    target_climate_sector: Optional[str] = "general"  # 'solar', 'wind', 'efficiency', 'policy', etc.
    current_industry: Optional[str] = None
    experience_level: Optional[str] = None
    # Community identification
    community_background: Optional[str] = None  # 'veteran', 'environmental_justice', 'international_professional'
    military_branch: Optional[str] = None  # For veterans
    country_of_origin: Optional[str] = None  # For international professionals
    languages_spoken: Optional[List[str]] = None  # For international professionals
    community_connections: Optional[List[str]] = None  # Existing community ties

JOB_SEEKER_SYSTEM_PROMPT = """You are a specialized Climate Jobs Assistant, an expert in climate tech careers, 
job searching, and professional development in the environmental sector. Your role is to:

1. Help users find and apply for jobs in climate tech and environmental sectors
2. Provide resume and cover letter advice specific to climate tech roles
3. Offer interview preparation tips for environmental sector positions
4. Guide users in developing relevant skills for climate tech careers
5. Share insights about different roles and companies in the climate tech industry

Keep responses focused on career development and job searching in the climate tech sector. 
Be practical, specific, and action-oriented in your advice."""

GENERAL_SYSTEM_PROMPT = """You are the Climate Economy Assistant, an expert in climate change, 
environmental economics, and sustainable business practices. Your responses should be 
informative, practical, and focused on helping users understand and address climate-related 
economic challenges."""

RESUME_SYSTEM_PROMPT = """You are a specialized Career Assistant that helps with resume analysis 
and job recommendations. You have been provided with the user's resume content below.

RESUME CONTENT:
{resume_content}

Based on this resume, provide tailored advice, answer questions, and help the user with their 
career development needs. When analyzing the resume or providing advice, reference specific 
information from their resume to make your responses more relevant and personalized."""

@app.get("/health")
async def health_check():
    """Health check endpoint to verify the service is running and configured correctly."""
    return HealthResponse(status="ok")

@app.post("/api/process-resume", response_model=ResumeProcessingResponse)
async def process_resume(resume: ResumeData, background_tasks: BackgroundTasks):
    """Process a resume PDF file and store its embeddings."""
    # Start processing in the background
    background_tasks.add_task(
        resume_processor.process_resume, 
        resume.file_url, 
        resume.file_id
    )
    
    # Handle resume overwrite (only keep one resume per user)
    if resume.file_id:
        user_id = None
        
        # Extract user_id from the file_path
        # This is a simplification - in a real app, we'd have better ways to get the user_id
        file_path = resume.file_url.split('/')
        for part in file_path:
            if part.startswith("user_"):
                user_id = part
                break
                
        if user_id:
            background_tasks.add_task(
                resume_rag.handle_resume_overwrite,
                user_id,
                resume.file_id
            )
    
    return ResumeProcessingResponse(
        status="processing",
        chunks_processed=0,
        message="Resume processing started in the background"
    )

@app.post("/api/chat", response_model=ChatResponse)
async def process_chat(message: ChatMessage):
    try:
        if not api_key:
            raise HTTPException(
                status_code=500,
                detail=f"OpenAI API key not configured. Please check your .env file at: {env_path}"
            )

        # If RAG mode is enabled and we have resume data, use the RAG tool
        if message.useResumeRAG and message.resumeData and message.resumeData.get('user_id'):
            try:
                # Get user ID from resume data
                user_id = message.resumeData.get('user_id')
                
                # Check if we have social data for this user in Supabase
                has_social_data = False
                if message.resumeData.get('id'):
                    try:
                        # Query for social data
                        resume_result = resume_rag.supabase.table("resumes") \
                            .select("social_data") \
                            .eq("id", message.resumeData.get('id')) \
                            .single() \
                            .execute()
                        
                        has_social_data = resume_result.data and "social_data" in resume_result.data
                    except Exception as e:
                        print(f"Error checking for social data: {str(e)}")
                
                # Run RAG query
                rag_result = await resume_rag.query_resume(
                    user_id=user_id,
                    query=message.content
                )
                
                if rag_result['success']:
                    # Return RAG results with source documents
                    sources = []
                    for doc in rag_result.get('source_documents', []):
                        if hasattr(doc, 'page_content') and hasattr(doc, 'metadata'):
                            sources.append({
                                "content": doc.page_content,
                                "metadata": doc.metadata
                            })
                    
                    return ChatResponse(
                        content=rag_result['answer'],
                        role="assistant",
                        sources=sources
                    )
            except Exception as e:
                print(f"RAG error: {str(e)}")
                # Fall back to regular chat if RAG fails
        
        # Process resume data if available (for regular chat mode)
        resume_content = ""
        resume_highlights = []
        
        if message.resumeData:
            try:
                # Get resume ID and user ID from the provided data
                resume_id = message.resumeData.get('id')
                user_id = message.resumeData.get('user_id')
                
                if resume_id:
                    # For regular chat, get the full resume content
                    resume_content = await resume_processor.retrieve_resume_content(resume_id)
                    
                    # For resume-specific queries, find relevant sections using semantic search
                    if user_id and is_resume_query(message.content):
                        relevant_sections = await resume_processor.search_resume_content(
                            user_id=user_id,
                            query=message.content,
                            match_threshold=0.65,
                            match_count=3
                        )
                        
                        if relevant_sections:
                            resume_highlights = [
                                f"Relevant section {i+1} (similarity: {section['similarity']:.2f}):\n{section['content']}"
                                for i, section in enumerate(relevant_sections)
                            ]
                else:
                    resume_content = f"Resume: {message.resumeData.get('file_name', 'Unnamed resume')} uploaded by user, but no content is available yet."
            except Exception as e:
                print(f"Error retrieving resume content: {str(e)}")
                resume_content = f"Resume: {message.resumeData.get('file_name', 'Unnamed resume')} (content retrieval failed)"

        # Select appropriate system prompt based on context and resume data
        system_prompt = JOB_SEEKER_SYSTEM_PROMPT if message.context == "job-seeker" else GENERAL_SYSTEM_PROMPT
        
        # If resume data is available, use the resume-specific prompt
        if resume_content:
            # Include semantic search results if available
            if resume_highlights:
                highlight_text = "\n\n".join(resume_highlights)
                system_prompt = f"""You are a specialized Career Assistant that helps with resume analysis 
and job recommendations. You have been provided with the user's full resume, but I'm highlighting
the most relevant sections based on their query:

RELEVANT RESUME SECTIONS:
{highlight_text}

When answering the user's question, focus on these relevant sections from their resume, but you
can refer to other parts of their resume if needed. Make your responses specific, personalized,
and actionable."""
            else:
                system_prompt = RESUME_SYSTEM_PROMPT.format(resume_content=resume_content)
            
            # Add context about having a resume
            enhanced_message = f"I have uploaded my resume. {message.content}"
        else:
            enhanced_message = message.content
        
        # Create messages for LangChain
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=enhanced_message)
        ]

        # Get response from OpenAI via LangChain
        try:
            response = chat_model.invoke(messages)
            content = response.content
        except Exception as e:
            raise HTTPException(
                status_code=502,
                detail=f"OpenAI API error: {str(e)}"
            )

        # Return the assistant's response
        return ChatResponse(
            content=content,
            role="assistant"
        )

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@app.post("/api/search-resume", response_model=ResumeSearchResult)
async def search_resume(search_query: ResumeSearchQuery):
    """Search for relevant content in user's resumes based on semantic similarity."""
    try:
        if not api_key:
            raise HTTPException(
                status_code=500,
                detail=f"OpenAI API key not configured. Please check your .env file at: {env_path}"
            )
        
        results = await resume_processor.search_resume_content(
            user_id=search_query.user_id,
            query=search_query.query,
            match_threshold=search_query.match_threshold,
            match_count=search_query.match_count
        )
        
        return ResumeSearchResult(results=results)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error searching resume content: {str(e)}"
        )

@app.post("/api/chat-with-resume", response_model=ResumeChatResponse)
async def chat_with_resume(chat_query: ResumeChatQuery):
    """Chat with a resume using the RAG tool."""
    try:
        if not api_key:
            raise HTTPException(
                status_code=500,
                detail=f"OpenAI API key not configured. Please check your .env file at: {env_path}"
            )
        
        result = await resume_rag.query_resume(
            user_id=chat_query.user_id,
            query=chat_query.query,
            chat_history=chat_query.chat_history
        )
        
        # Convert source documents to a serializable format
        sources = []
        for doc in result.get('source_documents', []):
            if hasattr(doc, 'page_content') and hasattr(doc, 'metadata'):
                sources.append({
                    "content": doc.page_content,
                    "metadata": doc.metadata
                })
        
        return ResumeChatResponse(
            answer=result['answer'],
            sources=sources,
            success=result['success']
        )
    except Exception as e:
        print(f"Error in resume chat: {str(e)}")
        return ResumeChatResponse(
            answer=f"Error processing your request: {str(e)}",
            sources=[],
            success=False
        )

@app.post("/api/chat-with-resume-social", response_model=ResumeChatResponse)
async def chat_with_resume_and_social(chat_query: ResumeChatWithSocialQuery):
    """Chat with a resume and social profile data using the enhanced RAG tool."""
    try:
        if not api_key:
            raise HTTPException(
                status_code=500,
                detail=f"OpenAI API key not configured. Please check your .env file at: {env_path}"
            )
        
        # Get user's resume with social data
        result = await resume_rag.query_resume(
            user_id=chat_query.user_id,
            query=chat_query.query,
            chat_history=chat_query.chat_history
        )
        
        # Convert source documents to a serializable format
        sources = []
        for doc in result.get('source_documents', []):
            if hasattr(doc, 'page_content') and hasattr(doc, 'metadata'):
                sources.append({
                    "content": doc.page_content,
                    "metadata": doc.metadata
                })
        
        return ResumeChatResponse(
            answer=result['answer'],
            sources=sources,
            success=result['success']
        )
    except Exception as e:
        print(f"Error in resume chat with social data: {str(e)}")
        return ResumeChatResponse(
            answer=f"Error processing your request: {str(e)}",
            sources=[],
            success=False
        )

@app.post("/api/resume-agent", response_model=AgentResponse)
async def resume_agent(query: AgentQuery):
    """
    Use a LangChain agent with Supabase vector store retriever tools to answer queries about a resume.
    This provides more advanced reasoning capabilities compared to the basic RAG approach.
    """
    try:
        if not api_key:
            raise HTTPException(
                status_code=500,
                detail=f"OpenAI API key not configured. Please check your .env file at: {env_path}"
            )
        
        # Create a resume agent for this user
        agent = create_resume_agent_for_user(query.user_id)
        
        # Run the query through the agent
        result = await run_agent_query(agent, query.query)
        
        # Extract the final answer, tool usage, and agent thoughts
        answer = result.get("output", "")
        thoughts = None
        tool_usage = None
        
        # Try to extract thoughts and tool usage if available
        if "intermediate_steps" in result:
            tool_usage = []
            for step in result["intermediate_steps"]:
                if len(step) >= 2:
                    action = step[0]
                    observation = step[1]
                    tool_usage.append({
                        "tool": action.tool if hasattr(action, "tool") else "unknown",
                        "tool_input": action.tool_input if hasattr(action, "tool_input") else {},
                        "observation": observation
                    })
        
        return AgentResponse(
            answer=answer,
            success=True,
            thoughts=thoughts,
            tool_usage=tool_usage
        )
    except Exception as e:
        print(f"Error in resume agent: {str(e)}")
        return AgentResponse(
            answer=f"Error processing your request: {str(e)}",
            success=False
        )

@app.post("/api/debug-resume", response_model=DebugResumeResponse)
async def debug_resume(query: DebugResumeQuery):
    """Debug endpoint to examine resume chunks structure."""
    try:
        debug_info = await resume_processor.debug_resume_chunks(query.resume_id)
        return DebugResumeResponse(debug_info=debug_info)
    except Exception as e:
        print(f"Error debugging resume: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to debug resume: {str(e)}"
        )

@app.post("/api/update-social-links", response_model=SocialLinksResponse)
async def update_social_links(data: SocialLinksData):
    """Update social links for a resume."""
    try:
        # Verify authentication
        supabase = await createClient()
        
        # Get current user
        auth_result = await supabase.auth.getUser()
        user = auth_result.data.user
        
        if not user:
            return SocialLinksResponse(
                success=False,
                message="Authentication required"
            )
        
        # Update resume with social links
        update_data = {}
        if data.linkedin_url is not None:
            update_data["linkedin_url"] = data.linkedin_url
        if data.github_url is not None:
            update_data["github_url"] = data.github_url
        if data.personal_website is not None:
            update_data["personal_website"] = data.personal_website
        
        # Update only if we have data to update
        if update_data:
            result = supabase.table("resumes").update(update_data).eq("id", data.resume_id).execute()
            
            if hasattr(result, 'error') and result.error:
                return SocialLinksResponse(
                    success=False,
                    message=f"Error updating social links: {result.error}"
                )
        
        return SocialLinksResponse(
            success=True,
            message="Social links updated successfully"
        )
    except Exception as e:
        print(f"Error updating social links: {str(e)}")
        return SocialLinksResponse(
            success=False,
            message=f"Error updating social links: {str(e)}"
        )

@app.post("/api/search-social-profiles", response_model=SocialSearchResponse)
async def search_social_profiles(request: SocialSearchRequest):
    """Search for information about user profiles on social media and save to Supabase."""
    try:
        # Verify authentication
        supabase = await createClient()
        
        # Get current user
        auth_result = await supabase.auth.getUser()
        user = auth_result.data.user
        
        if not user:
            return SocialSearchResponse(
                success=False,
                message="Authentication required",
                data=None
            )
        
        # Get resume with social links
        result = supabase.table("resumes") \
            .select("id, linkedin_url, github_url, personal_website, full_text") \
            .eq("id", request.resume_id) \
            .eq("user_id", user.id) \
            .single() \
            .execute()
            
        if not result.data:
            return SocialSearchResponse(
                success=False,
                message="Resume not found or not authorized",
                data=None
            )
            
        resume = result.data
        
        # Extract name and location from resume if available
        name = None
        location = None
        
        if resume.get("full_text"):
            # This is a simplified approach - in production, you might want to use an LLM to extract this info
            resume_text = resume.get("full_text", "")
            # Try to find name from the resume (very basic approach)
            first_line = resume_text.strip().split('\n')[0] if resume_text else ""
            if len(first_line) < 50:  # Likely a name if first line is short
                name = first_line
        
        # Use the global social_searcher instance
        search_results = await social_searcher.search_all_profiles(
            linkedin_url=resume.get("linkedin_url"),
            github_url=resume.get("github_url"),
            personal_website=resume.get("personal_website"),
            name=name,
            location=location
        )
        
        # Save search results to Supabase
        update_result = supabase.table("resumes") \
            .update({"social_data": search_results}) \
            .eq("id", request.resume_id) \
            .execute()
            
        if hasattr(update_result, 'error') and update_result.error:
            return SocialSearchResponse(
                success=False,
                message=f"Error saving search results: {update_result.error}",
                data=search_results
            )
        
        return SocialSearchResponse(
            success=True,
            message="Social profile information retrieved and saved",
            data=search_results
        )
    except Exception as e:
        print(f"Error searching social profiles: {str(e)}")
        return SocialSearchResponse(
            success=False,
            message=f"Error searching social profiles: {str(e)}",
            data=None
        )

@app.post("/api/check-user-resume", response_model=UserResumeCheckResponse)
async def check_user_resume(request: UserResumeCheckRequest):
    """Check if a user has an uploaded resume and if social data exists."""
    try:
        if not resume_rag.supabase:
            raise HTTPException(
                status_code=500,
                detail="Supabase connection not available"
            )
            
        # Query for the most recent resume for this user
        result = resume_rag.supabase.table("resumes") \
            .select("id, file_name, linkedin_url, github_url, personal_website, social_data") \
            .eq("user_id", request.user_id) \
            .order("created_at", desc=True) \
            .limit(1) \
            .execute()
            
        if not result.data:
            return UserResumeCheckResponse(
                has_resume=False,
                has_social_data=False,
                social_links={}
            )
            
        resume = result.data[0]
        has_social_data = bool(resume.get("social_data"))
        
        social_links = {
            "linkedin_url": resume.get("linkedin_url"),
            "github_url": resume.get("github_url"),
            "personal_website": resume.get("personal_website")
        }
        
        return UserResumeCheckResponse(
            has_resume=True,
            resume_id=resume.get("id"),
            file_name=resume.get("file_name"),
            has_social_data=has_social_data,
            social_links=social_links
        )
    except Exception as e:
        print(f"Error checking user resume: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error checking user resume: {str(e)}"
        )

@app.post("/api/enhanced-search", response_model=EnhancedSearchResponse)
async def enhanced_search(request: EnhancedSearchRequest):
    """
    Perform enhanced search for a user by gathering social profile information
    and enriching their resume data.
    """
    try:
        if not resume_rag.supabase:
            raise HTTPException(
                status_code=500,
                detail="Supabase connection not available"
            )
        
        # Get the user's resume
        resume_id = request.resume_id
        
        if not resume_id:
            # Find the user's most recent resume if not provided
            result = resume_rag.supabase.table("resumes") \
                .select("id, social_data") \
                .eq("user_id", request.user_id) \
                .order("created_at", desc=True) \
                .limit(1) \
                .execute()
                
            if not result.data:
                return EnhancedSearchResponse(
                    success=False,
                    message="No resume found for this user. Please upload a resume first."
                )
                
            resume_id = result.data[0]["id"]
            
            # Check if we already have social data and force_refresh is False
            if not request.force_refresh and result.data[0].get("social_data"):
                social_summary = None
                if isinstance(result.data[0].get("social_data"), dict):
                    social_summary = result.data[0]["social_data"].get("comprehensive_profile")
                
                return EnhancedSearchResponse(
                    success=True,
                    message="Social data already exists for this resume.",
                    has_social_data=True,
                    social_summary=social_summary
                )
        
        # Get social links from the resume
        result = resume_rag.supabase.table("resumes") \
            .select("linkedin_url, github_url, personal_website") \
            .eq("id", resume_id) \
            .single() \
            .execute()
        
        if not result.data:
            return EnhancedSearchResponse(
                success=False,
                message="Resume not found."
            )
            
        resume = result.data
        
        # Check if we have any social links
        has_any_links = any([
            resume.get("linkedin_url"),
            resume.get("github_url"),
            resume.get("personal_website")
        ])
        
        if not has_any_links:
            return EnhancedSearchResponse(
                success=False,
                message="No social links found in this resume. Please add social links first or re-upload your resume."
            )
        
        # Perform social search
        search_results = await social_searcher.search_all_profiles(
            linkedin_url=resume.get("linkedin_url"),
            github_url=resume.get("github_url"),
            personal_website=resume.get("personal_website")
        )
        
        # Update the resume with social data
        update_result = resume_rag.supabase.table("resumes") \
            .update({"social_data": search_results}) \
            .eq("id", resume_id) \
            .execute()
        
        social_summary = None
        if search_results and "comprehensive_profile" in search_results:
            social_summary = search_results["comprehensive_profile"]
        
        return EnhancedSearchResponse(
            success=True,
            message="Enhanced search completed successfully. Social profile information has been added to your resume data.",
            has_social_data=True,
            social_summary=social_summary
        )
    except Exception as e:
        print(f"Error in enhanced search: {str(e)}")
        return EnhancedSearchResponse(
            success=False,
            message=f"Error in enhanced search: {str(e)}"
        )

def is_resume_query(query: str) -> bool:
    """
    Determine if a query is specifically about a resume.
    
    Args:
        query: The user query
        
    Returns:
        True if the query is resume-specific, False otherwise
    """
    resume_keywords = [
        "resume", "cv", "curriculum vitae", "work history", 
        "experience", "job history", "employment", "skill", 
        "qualification", "education", "degree", "certification",
        "project", "achievement", "my background", "expertise"
    ]
    
    query_lower = query.lower()
    
    # Check if query contains resume-related keywords
    for keyword in resume_keywords:
        if keyword in query_lower:
            return True
    
    # Check if query is asking about specific resume sections
    resume_section_patterns = [
        "tell me about my", "what does my", "how is my", 
        "analyze my", "review my", "feedback on my",
        "improve my", "enhance my", "strengthen my",
        "what skills do I have", "what experience do I have"
    ]
    
    for pattern in resume_section_patterns:
        if pattern in query_lower:
            return True
    
    return False

# ==================== CLIMATE ECONOMY ECOSYSTEM ENDPOINTS ====================

@app.post("/api/climate-ecosystem-search", response_model=ClimateEcosystemSearchResponse)
async def climate_ecosystem_search(request: ClimateEcosystemSearchRequest):
    """
    Enhanced search across the complete climate economy ecosystem.
    Searches jobs, education programs, and knowledge resources with intelligent filtering.
    """
    try:
        # Perform the search using our climate ecosystem tool
        results = await search_climate_ecosystem(
            query=request.query,
            search_type=request.search_type,
            filters=request.filters or {},
            limit=request.limit
        )
        
        # Check for errors in results
        if results and len(results) == 1 and "error" in results[0]:
            raise HTTPException(
                status_code=500,
                detail=results[0]["error"]
            )
        
        # Calculate breakdown by content type
        breakdown = {
            "knowledge": len([r for r in results if r.get("type") == "knowledge"]),
            "jobs": len([r for r in results if r.get("type") == "job"]),
            "education": len([r for r in results if r.get("type") == "education"])
        }
        
        return ClimateEcosystemSearchResponse(
            success=True,
            query=request.query,
            search_type=request.search_type,
            results=results,
            count=len(results),
            breakdown=breakdown
        )
        
    except Exception as e:
        print(f"Error in climate ecosystem search: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Search failed: {str(e)}"
        )

@app.post("/api/partner-information", response_model=PartnerInformationResponse)
async def partner_information(request: PartnerInformationRequest):
    """
    Get information about partner organizations in the climate economy ecosystem.
    """
    try:
        partners = await get_partner_information(
            partner_name=request.partner_name,
            partner_type=request.partner_type
        )
        
        # Check for errors
        if partners and len(partners) == 1 and "error" in partners[0]:
            raise HTTPException(
                status_code=500,
                detail=partners[0]["error"]
            )
        
        return PartnerInformationResponse(
            success=True,
            partners=partners
        )
        
    except Exception as e:
        print(f"Error getting partner information: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get partner information: {str(e)}"
        )

@app.post("/api/climate-focus-insights", response_model=ClimateFocusInsightsResponse)
async def climate_focus_insights(request: ClimateFocusInsightsRequest):
    """
    Get insights about a specific climate focus area across the ecosystem.
    """
    try:
        insights = await get_climate_focus_insights(focus_area=request.focus_area)
        
        # Check for errors
        if "error" in insights:
            raise HTTPException(
                status_code=500,
                detail=insights["error"]
            )
        
        return ClimateFocusInsightsResponse(
            success=True,
            insights=insights
        )
        
    except Exception as e:
        print(f"Error getting climate focus insights: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get climate focus insights: {str(e)}"
        )

@app.post("/api/climate-career-agent", response_model=ClimateCareerAgentResponse)
async def climate_career_agent(request: ClimateCareerAgentRequest):
    """
    Intelligent climate career agent that combines search, partner insights, and personalized recommendations.
    """
    try:
        # Start with ecosystem search
        search_results = await search_climate_ecosystem(
            query=request.query,
            search_type=request.search_type,
            filters={},
            limit=10
        )
        
        # Get partner recommendations based on search results
        partner_recommendations = []
        if search_results:
            # Extract unique partners from search results
            partner_names = set()
            for result in search_results:
                if result.get("partner") and result["partner"].get("name"):
                    partner_names.add(result["partner"]["name"])
            
            # Get detailed partner information
            for partner_name in list(partner_names)[:3]:  # Limit to top 3
                partner_info = await get_partner_information(partner_name=partner_name)
                if partner_info:
                    partner_recommendations.extend(partner_info)
        
        # Extract climate focus areas from query and get insights
        climate_keywords = {
            "solar": ["solar", "photovoltaic", "pv"],
            "renewable_energy": ["renewable", "clean energy", "wind", "hydro"],
            "energy_efficiency": ["efficiency", "hvac", "insulation", "weatherization"],
            "workforce_development": ["training", "education", "workforce", "career"]
        }
        
        insights = None
        for focus_area, keywords in climate_keywords.items():
            if any(keyword in request.query.lower() for keyword in keywords):
                insights = await get_climate_focus_insights(focus_area=focus_area)
                break
        
        # Generate intelligent response using LLM
        context_parts = []
        
        if search_results:
            context_parts.append(f"Found {len(search_results)} relevant opportunities:")
            for result in search_results[:3]:
                context_parts.append(f"- {result.get('title', 'N/A')} ({result.get('type', 'unknown')})")
        
        if partner_recommendations:
            context_parts.append(f"\nRelevant partner organizations:")
            for partner in partner_recommendations[:2]:
                context_parts.append(f"- {partner.get('name', 'N/A')} ({partner.get('type', 'unknown')})")
        
        if insights and insights.get("job_count", 0) > 0:
            context_parts.append(f"\nClimate focus insights: {insights.get('job_count', 0)} jobs, {insights.get('education_count', 0)} training programs available")
        
        context = "\n".join(context_parts)
        
        # Use the chat model to generate response
        system_message = SystemMessage(content=f"""You are a Climate Career Assistant with access to real-time data about the climate economy ecosystem.

Current ecosystem data:
{context}

Provide helpful, actionable career advice based on this data. Include specific recommendations for jobs, training programs, or partner organizations when relevant. Be encouraging and practical in your guidance.""")
        
        human_message = HumanMessage(content=request.query)
        
        response = chat_model.invoke([system_message, human_message])
        
        return ClimateCareerAgentResponse(
            answer=response.content,
            success=True,
            search_results=search_results[:5],  # Limit for response size
            partner_recommendations=partner_recommendations[:3],
            insights=insights
        )
        
    except Exception as e:
        print(f"Error in climate career agent: {str(e)}")
        return ClimateCareerAgentResponse(
            answer=f"I apologize, but I encountered an error processing your request: {str(e)}. Please try rephrasing your question.",
            success=False
        )

@app.post("/api/enhanced-chat", response_model=EnhancedChatResponse)
async def enhanced_chat(request: EnhancedChatRequest):
    """
    Enhanced chat interface with structured responses, source citations, and contextual follow-ups.
    Provides actionable items and intelligent suggestions based on ecosystem data.
    """
    try:
        # Search the ecosystem for relevant content based on the query
        search_results = await search_climate_ecosystem(
            query=request.content,
            search_type="all",
            filters={},
            limit=8
        )
        
        # Prepare sources and actionable items
        sources = []
        actionable_items = []
        
        for result in search_results:
            if result.get("error"):
                continue
                
            # Create source reference
            source = SourceReference(
                title=result.get("title", "Unknown"),
                url=result.get("application_url") or result.get("source_url") or result.get("partner", {}).get("website"),
                partner_name=result.get("partner", {}).get("name", "Unknown Partner"),
                content_type=result.get("type", "unknown"),
                relevance_score=result.get("similarity") or result.get("relevance_score")
            )
            sources.append(source)
            
            # Create actionable items
            if result.get("type") == "job":
                action_item = ActionableItem(
                    action="apply",
                    title=f"Apply for {result.get('title')}",
                    url=result.get("application_url"),
                    description=f"Apply for this {result.get('employment_type', 'position')} at {result.get('partner', {}).get('name')}",
                    partner_name=result.get("partner", {}).get("name")
                )
                actionable_items.append(action_item)
            elif result.get("type") == "education":
                action_item = ActionableItem(
                    action="learn_more",
                    title=f"Explore {result.get('title')}",
                    url=result.get("application_url"),
                    description=f"Learn more about this {result.get('program_type', 'program')} from {result.get('partner', {}).get('name')}",
                    partner_name=result.get("partner", {}).get("name")
                )
                actionable_items.append(action_item)
            elif result.get("type") == "knowledge":
                action_item = ActionableItem(
                    action="explore",
                    title=f"Read: {result.get('title')}",
                    url=result.get("source_url"),
                    description=f"Explore this resource from {result.get('partner_name', 'Climate Economy')}",
                    partner_name=result.get("partner_name")
                )
                actionable_items.append(action_item)
        
        # Generate contextual follow-up questions
        follow_up_questions = await generate_follow_up_questions(request.content, search_results)
        
        # Generate intelligent suggestions
        suggestions = await generate_suggestions(request.content, search_results)
        
        # Create context for LLM
        context_parts = []
        if search_results:
            context_parts.append(f"Found {len(search_results)} relevant resources in our climate economy ecosystem:")
            for i, result in enumerate(search_results[:3], 1):
                partner_name = result.get("partner", {}).get("name", "Unknown Partner")
                context_parts.append(f"{i}. {result.get('title')} ({result.get('type')}) - {partner_name}")
        
        context = "\n".join(context_parts)
        
        # Enhanced system prompt for conversational, non-markdown responses
        system_message = SystemMessage(content=f"""You are a helpful Climate Career Assistant. Provide clear, conversational responses without any markdown formatting.

Available ecosystem resources:
{context}

Guidelines:
- Write in plain text, no markdown headers, bullets, or formatting
- Be conversational and helpful
- Reference specific opportunities and partners from the context when relevant
- Keep responses focused and actionable
- Don't mention that you have access to databases or technical details
- Speak naturally as if you're having a conversation with someone seeking career advice

The user asked: {request.content}""")
        
        human_message = HumanMessage(content=request.content)
        
        # Get response from LLM
        response = chat_model.invoke([system_message, human_message])
        
        # Create context summary
        context_summary = None
        if search_results:
            breakdown = {
                "jobs": len([r for r in search_results if r.get("type") == "job"]),
                "education": len([r for r in search_results if r.get("type") == "education"]),
                "knowledge": len([r for r in search_results if r.get("type") == "knowledge"])
            }
            summary_parts = []
            if breakdown["jobs"] > 0:
                summary_parts.append(f"{breakdown['jobs']} job opportunities")
            if breakdown["education"] > 0:
                summary_parts.append(f"{breakdown['education']} training programs")
            if breakdown["knowledge"] > 0:
                summary_parts.append(f"{breakdown['knowledge']} knowledge resources")
            
            context_summary = f"I found {', '.join(summary_parts)} related to your query."
        
        return EnhancedChatResponse(
            content=response.content,
            sources=sources[:5],  # Limit to top 5 sources
            actionable_items=actionable_items[:4],  # Limit to top 4 actions
            follow_up_questions=follow_up_questions,
            context_summary=context_summary,
            suggestions=suggestions
        )
        
    except Exception as e:
        print(f"Error in enhanced chat: {str(e)}")
        return EnhancedChatResponse(
            content=f"I apologize, but I encountered an error processing your request. Please try rephrasing your question or ask about specific topics like 'solar jobs in Boston' or 'clean energy training programs'.",
            sources=[],
            actionable_items=[],
            follow_up_questions=[
                FollowUpQuestion(
                    question="What type of climate jobs are you interested in?",
                    category="jobs",
                    context="Help narrow down job search"
                ),
                FollowUpQuestion(
                    question="Are you looking for training or education programs?",
                    category="education", 
                    context="Explore skill development opportunities"
                )
            ],
            context_summary="I can help you explore climate economy opportunities, jobs, and training programs.",
            suggestions=["solar jobs", "clean energy training", "climate tech careers", "renewable energy programs"]
        )

async def generate_follow_up_questions(query: str, search_results: List[Dict[str, Any]]) -> List[FollowUpQuestion]:
    """Generate contextual follow-up questions based on search results and query."""
    questions = []
    
    # Analyze what types of content we found
    has_jobs = any(r.get("type") == "job" for r in search_results)
    has_education = any(r.get("type") == "education" for r in search_results)
    has_knowledge = any(r.get("type") == "knowledge" for r in search_results)
    
    # Get unique partners and locations
    partners = list(set(r.get("partner", {}).get("name") for r in search_results if r.get("partner", {}).get("name")))[:3]
    locations = list(set(r.get("location") for r in search_results if r.get("location")))[:3]
    
    # Generate contextual questions based on findings
    if has_jobs:
        questions.append(FollowUpQuestion(
            question="Would you like to see more details about application requirements for these positions?",
            category="jobs",
            context="Get specific application guidance"
        ))
        
        if locations:
            questions.append(FollowUpQuestion(
                question=f"Are you interested in opportunities in {', '.join(locations)}?",
                category="location",
                context="Explore location-specific opportunities"
            ))
    
    if has_education:
        questions.append(FollowUpQuestion(
            question="What's your current experience level in clean energy or climate tech?",
            category="skills",
            context="Match training programs to your background"
        ))
    
    if partners:
        questions.append(FollowUpQuestion(
            question=f"Would you like to learn more about {partners[0]} or other partner organizations?",
            category="partners",
            context="Explore partner organizations and their offerings"
        ))
    
    # Add general exploration questions if we have good results
    if search_results:
        questions.append(FollowUpQuestion(
            question="Are you looking for entry-level opportunities or do you have relevant experience?",
            category="skills",
            context="Tailor recommendations to your experience level"
        ))
    
    return questions[:3]  # Limit to 3 questions

async def generate_suggestions(query: str, search_results: List[Dict[str, Any]]) -> List[str]:
    """Generate intelligent search suggestions based on context."""
    suggestions = []
    
    # Extract topics from search results
    topics = set()
    for result in search_results:
        if result.get("climate_focus"):
            topics.update(result["climate_focus"])
        if result.get("skills_required"):
            topics.update(result["skills_required"][:2])  # Just first 2 skills
        if result.get("skills_taught"):
            topics.update(result["skills_taught"][:2])
    
    # Convert topics to search suggestions
    topic_suggestions = [topic.replace("_", " ") for topic in list(topics)[:3]]
    suggestions.extend(topic_suggestions)
    
    # Add location-based suggestions
    locations = [r.get("location") for r in search_results if r.get("location")]
    if locations:
        suggestions.append(f"jobs in {locations[0]}")
    
    # Add partner-based suggestions
    partners = [r.get("partner", {}).get("name") for r in search_results if r.get("partner", {}).get("name")]
    if partners:
        suggestions.append(f"{partners[0]} opportunities")
    
    # Add general suggestions if none found
    if not suggestions:
        suggestions = ["solar energy jobs", "wind technician training", "clean energy internships", "climate policy careers"]
    
    return suggestions[:4]  # Limit to 4 suggestions

@app.post("/api/enhanced-resume-analysis", response_model=ResumeAnalysisResponse)
async def enhanced_resume_analysis(request: ResumeAnalysisRequest):
    """
    Comprehensive resume analysis with structured career guidance, skill gap analysis,
    upskilling recommendations, and actionable career pathways.
    """
    try:
        # Get user's resume content
        resume_result = resume_rag.supabase.table("resumes") \
            .select("*") \
            .eq("user_id", request.user_id) \
            .order("created_at", desc=True) \
            .limit(1) \
            .execute()
        
        if not resume_result.data:
            raise HTTPException(status_code=404, detail="No resume found for this user")
        
        resume_data = resume_result.data[0]
        resume_content = resume_data.get("full_text", "")
        
        # Search for relevant jobs and programs in the ecosystem
        ecosystem_results = await search_climate_ecosystem(
            query=f"climate jobs {request.target_industry}",
            search_type="all",
            filters=request.job_preferences or {},
            limit=15
        )
        
        # Get job-specific results for matching
        job_results = [r for r in ecosystem_results if r.get("type") == "job"]
        education_results = [r for r in ecosystem_results if r.get("type") == "education"]
        
        # Analyze skills using LLM
        skill_analysis_prompt = f"""
Analyze this resume for climate economy career fit:

RESUME CONTENT:
{resume_content}

Available climate economy opportunities:
{[f"{r.get('title')} - {r.get('partner', {}).get('name')}" for r in job_results[:5]]}

Provide analysis in this exact format:

STRENGTHS:
- List 3-5 key strengths from the resume

IMPROVEMENT_AREAS:
- List 3-5 areas that could be improved

SKILL_GAPS:
For each major gap, format as: [SKILL]|[CURRENT_LEVEL]|[TARGET_LEVEL]|[DESCRIPTION]|[URGENCY]

CAREER_RECOMMENDATIONS:
For each recommendation: [TITLE]|[DESCRIPTION]|[MATCH_SCORE]|[REQUIRED_SKILLS]

Keep responses factual and specific to the resume content.
"""
        
        system_message = SystemMessage(content="You are a career analysis expert specializing in climate economy careers. Provide structured, actionable analysis.")
        human_message = HumanMessage(content=skill_analysis_prompt)
        
        analysis_response = chat_model.invoke([system_message, human_message])
        analysis_text = analysis_response.content
        
        # Parse the structured response
        strengths, improvement_areas, skill_gaps, career_recommendations = parse_resume_analysis(analysis_text)
        
        # INTEGRATE SKILLS TRANSLATION - KEY SELLING POINT
        skills_translation_request = SkillTranslationRequest(
            user_id=request.user_id,
            target_climate_sector=request.target_industry,
            current_industry="general"  # Could be enhanced to extract from resume
        )
        
        # Get skills translation analysis
        try:
            skills_translation_response = await skills_translation(skills_translation_request)
            
            # Add skills translation insights to actionable items
            for item in skills_translation_response.actionable_items[:3]:
                actionable_items.append(item)
            
            # Add skills translation to follow-up questions
            if skills_translation_response.follow_up_questions:
                follow_up_questions.extend(skills_translation_response.follow_up_questions[:2])
            
            # Enhance analysis content with skills translation insights
            analysis_content += f"\n\nSkills Translation Insight: {skills_translation_response.content[:200]}..."
            
        except Exception as e:
            print(f"Skills translation integration error: {str(e)}")
            # Continue without skills translation if it fails
        
        # Create upskilling program recommendations
        upskilling_programs = []
        for program in education_results[:5]:
            upskilling_programs.append(UpskillingProgram(
                program_name=program.get("title", "Unknown Program"),
                provider=program.get("partner", {}).get("name", "Unknown Provider"),
                program_type=program.get("program_type", "program"),
                skills_covered=program.get("skills_taught", [])[:3],
                application_url=program.get("application_url"),
                relevance_score=program.get("similarity", 0.5) or 0.5
            ))
        
        # Create career pathways
        career_pathways = await generate_career_pathways(resume_content, job_results)
        
        # Create sources from ecosystem results
        sources = []
        for result in ecosystem_results[:8]:
            sources.append(SourceReference(
                title=result.get("title", "Unknown"),
                url=result.get("application_url") or result.get("source_url"),
                partner_name=result.get("partner", {}).get("name", "Unknown Partner"),
                content_type=result.get("type", "unknown"),
                relevance_score=result.get("similarity")
            ))
        
        # Create actionable items
        actionable_items = []
        
        # Add top job applications
        for job in job_results[:3]:
            actionable_items.append(ActionableItem(
                action="apply",
                title=f"Apply for {job.get('title')}",
                url=job.get("application_url"),
                description=f"Strong match based on your background - {job.get('employment_type', 'position')} at {job.get('partner', {}).get('name')}",
                partner_name=job.get("partner", {}).get("name")
            ))
        
        # Add skill development actions
        for program in upskilling_programs[:2]:
            actionable_items.append(ActionableItem(
                action="learn_more",
                title=f"Enroll in {program.program_name}",
                url=program.application_url,
                description=f"Develop skills in {', '.join(program.skills_covered[:2])} to improve your climate career prospects",
                partner_name=program.provider
            ))
        
        # Generate follow-up questions
        follow_up_questions = [
            FollowUpQuestion(
                question="Would you like detailed application guidance for any of these positions?",
                category="applications",
                context="Get specific help with applications"
            ),
            FollowUpQuestion(
                question="What's your timeline for starting a new position?",
                category="timeline",
                context="Plan application strategy based on timeline"
            ),
            FollowUpQuestion(
                question="Are you interested in remote work or specific geographic locations?",
                category="location",
                context="Filter opportunities by location preferences"
            )
        ]
        
        # Add skills-specific follow-up if gaps identified
        if skill_gaps:
            follow_up_questions.append(FollowUpQuestion(
                question=f"Would you like a detailed plan to develop {skill_gaps[0].skill} skills?",
                category="skills",
                context="Create targeted skill development plan"
            ))
        
        # External resources (web search for additional resources)
        external_resources = []
        if tavily_api_key:
            try:
                # Search for external climate career resources
                external_search = await social_searcher.search_for_information(
                    f"climate career transition guide {request.target_industry}"
                )
                if external_search:
                    for resource in external_search.get("resources", [])[:3]:
                        external_resources.append(SourceReference(
                            title=resource.get("title", "External Resource"),
                            url=resource.get("url"),
                            partner_name="External Resource",
                            content_type="knowledge",
                            relevance_score=0.8
                        ))
            except:
                pass  # External search is optional
        
        # Generate comprehensive analysis text
        analysis_content = f"""Based on your resume analysis, I've identified several opportunities in the climate economy that align with your background. Your experience shows strong potential for roles in {', '.join([rec.title for rec in career_recommendations[:2]])} within the climate sector.

Key findings from your resume review show {len(strengths)} major strengths that position you well for climate careers, along with {len(skill_gaps)} areas where targeted skill development could significantly enhance your opportunities.

I've found {len([r for r in ecosystem_results if r.get('type') == 'job'])} relevant job openings and {len([r for r in ecosystem_results if r.get('type') == 'education'])} training programs that match your profile across our partner network."""
        
        return ResumeAnalysisResponse(
            content=analysis_content,
            strengths=strengths,
            improvement_areas=improvement_areas,
            skill_gaps=skill_gaps,
            career_recommendations=career_recommendations,
            upskilling_programs=upskilling_programs,
            career_pathways=career_pathways,
            sources=sources,
            actionable_items=actionable_items,
            follow_up_questions=follow_up_questions[:3],
            external_resources=external_resources
        )
        
    except Exception as e:
        print(f"Error in enhanced resume analysis: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}"
        )

@app.post("/api/enhanced-job-matching", response_model=JobMatchResponse)
async def enhanced_job_matching(request: JobMatchRequest):
    """
    Enhanced job matching with skill alignment analysis, gap identification,
    and personalized recommendations with actionable next steps.
    """
    try:
        # Get user's resume
        resume_result = resume_rag.supabase.table("resumes") \
            .select("*") \
            .eq("user_id", request.user_id) \
            .order("created_at", desc=True) \
            .limit(1) \
            .execute()
        
        if not resume_result.data:
            raise HTTPException(status_code=404, detail="No resume found for this user")
        
        resume_data = resume_result.data[0]
        resume_content = resume_data.get("full_text", "")
        
        # Build search query from preferences
        search_query_parts = ["climate jobs"]
        if request.location_preference:
            search_query_parts.append(request.location_preference)
        if request.experience_level:
            search_query_parts.append(request.experience_level)
        
        search_query = " ".join(search_query_parts)
        
        # Search for jobs
        job_results = await search_climate_ecosystem(
            query=search_query,
            search_type="jobs",
            filters=request.job_preferences or {},
            limit=20
        )
        
        # Analyze skill alignment using LLM
        skill_alignment_prompt = f"""
Compare this resume with available climate jobs and analyze skill alignment:

RESUME:
{resume_content}

AVAILABLE JOBS:
{[f"{r.get('title')} - {r.get('skills_required', [])} - {r.get('partner', {}).get('name')}" for r in job_results[:10]]}

For each job, rate skill alignment 0-1.0 and identify missing skills.
Format: [JOB_TITLE]|[ALIGNMENT_SCORE]|[MISSING_SKILLS]
"""
        
        system_message = SystemMessage(content="You are a job matching expert. Analyze skill alignment between resumes and job requirements.")
        human_message = HumanMessage(content=skill_alignment_prompt)
        
        matching_response = chat_model.invoke([system_message, human_message])
        
        # Parse matching results
        matched_jobs, skill_alignment, missing_skills = parse_job_matching(matching_response.content, job_results)
        
        # Create sources
        sources = []
        for job in job_results[:8]:
            sources.append(SourceReference(
                title=job.get("title", "Unknown Job"),
                url=job.get("application_url"),
                partner_name=job.get("partner", {}).get("name", "Unknown Partner"),
                content_type="job",
                relevance_score=job.get("similarity")
            ))
        
        # Create actionable recommendations
        recommended_actions = []
        
        # Application actions for top matches
        for job in matched_jobs[:3]:
            if job.match_score > 0.7:
                recommended_actions.append(ActionableItem(
                    action="apply",
                    title=f"Apply now for {job.title}",
                    url=job.application_url,
                    description=f"High match ({int(job.match_score*100)}%) - your skills align well with this role",
                    partner_name=job.partner_name
                ))
            else:
                recommended_actions.append(ActionableItem(
                    action="learn_more",
                    title=f"Develop skills for {job.title}",
                    description=f"Medium match ({int(job.match_score*100)}%) - consider skill development: {', '.join(job.required_skills[:2])}",
                    partner_name=job.partner_name
                ))
        
        # Skill development actions
        if missing_skills:
            for skill_gap in missing_skills[:2]:
                recommended_actions.append(ActionableItem(
                    action="learn_more", 
                    title=f"Develop {skill_gap.skill} skills",
                    description=f"Priority: {skill_gap.urgency} - {skill_gap.gap_description}",
                    partner_name="Skill Development"
                ))
        
        # Follow-up questions
        follow_up_questions = [
            FollowUpQuestion(
                question=f"Would you like help preparing application materials for {matched_jobs[0].title if matched_jobs else 'these positions'}?",
                category="applications",
                context="Get specific application guidance"
            ),
            FollowUpQuestion(
                question="What's your timeline for starting a new position?",
                category="timeline",
                context="Plan application strategy based on timeline"
            )
        ]
        
        if missing_skills:
            follow_up_questions.append(FollowUpQuestion(
                question=f"Would you like training program recommendations for {missing_skills[0].skill}?",
                category="skills",
                context="Find specific training programs"
            ))
        
        # Context summary
        high_matches = len([j for j in matched_jobs if j.match_score > 0.7])
        medium_matches = len([j for j in matched_jobs if 0.5 <= j.match_score <= 0.7])
        context_summary = f"Found {len(job_results)} climate jobs: {high_matches} high matches, {medium_matches} medium matches based on your skills and preferences."
        
        # Analysis content
        top_match = matched_jobs[0] if matched_jobs else None
        analysis_content = f"""Based on your resume and preferences, I've identified {len(matched_jobs)} potential job matches in the climate economy. Your strongest alignment is with {top_match.title if top_match else 'entry-level positions'} roles, showing a {int(top_match.match_score*100) if top_match else 60}% skill match.

Your background particularly aligns with opportunities at {top_match.partner_name if top_match else 'various climate organizations'}, where your existing experience can be directly applied. To strengthen your candidacy, consider developing {missing_skills[0].skill if missing_skills else 'sector-specific'} skills.

The job market shows strong demand for your skill set, with multiple openings across different climate focus areas."""
        
        return JobMatchResponse(
            content=analysis_content,
            matched_jobs=matched_jobs[:8],
            skill_alignment=skill_alignment,
            missing_skills=missing_skills[:5],
            recommended_actions=recommended_actions[:6],
            sources=sources,
            follow_up_questions=follow_up_questions[:3],
            context_summary=context_summary
        )
        
    except Exception as e:
        print(f"Error in enhanced job matching: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Job matching failed: {str(e)}"
        )

def parse_resume_analysis(analysis_text: str) -> tuple:
    """Parse structured resume analysis response."""
    strengths = []
    improvement_areas = []
    skill_gaps = []
    career_recommendations = []
    
    sections = analysis_text.split('\n\n')
    current_section = None
    
    for section in sections:
        lines = section.strip().split('\n')
        if not lines:
            continue
            
        header = lines[0].upper()
        
        if 'STRENGTHS:' in header:
            current_section = 'strengths'
            continue
        elif 'IMPROVEMENT_AREAS:' in header:
            current_section = 'improvement'
            continue
        elif 'SKILL_GAPS:' in header:
            current_section = 'gaps'
            continue
        elif 'CAREER_RECOMMENDATIONS:' in header:
            current_section = 'recommendations'
            continue
        
        for line in lines:
            line = line.strip()
            if not line or line.startswith(('-', '•', '*')):
                clean_line = line.lstrip('-•* ').strip()
                if not clean_line:
                    continue
                    
                if current_section == 'strengths':
                    strengths.append(clean_line)
                elif current_section == 'improvement':
                    improvement_areas.append(clean_line)
            elif '|' in line and current_section == 'gaps':
                parts = line.split('|')
                if len(parts) >= 5:
                    skill_gaps.append(SkillGap(
                        skill=parts[0].strip(),
                        current_level=parts[1].strip(),
                        target_level=parts[2].strip(),
                        gap_description=parts[3].strip(),
                        urgency=parts[4].strip()
                    ))
            elif '|' in line and current_section == 'recommendations':
                parts = line.split('|')
                if len(parts) >= 4:
                    try:
                        match_score = float(parts[2].strip())
                    except:
                        match_score = 0.7
                    
                    career_recommendations.append(CareerRecommendation(
                        title=parts[0].strip(),
                        description=parts[1].strip(),
                        match_score=match_score,
                        required_skills=parts[3].strip().split(',') if len(parts) > 3 else [],
                        recommended_actions=[]
                    ))
    
    return strengths, improvement_areas, skill_gaps, career_recommendations

def parse_job_matching(matching_text: str, job_results: List[Dict]) -> tuple:
    """Parse job matching analysis results."""
    matched_jobs = []
    skill_alignment = {}
    missing_skills = []
    
    # Create a lookup for job details
    job_lookup = {job.get("title", ""): job for job in job_results}
    
    lines = matching_text.strip().split('\n')
    for line in lines:
        if '|' in line:
            parts = line.split('|')
            if len(parts) >= 3:
                job_title = parts[0].strip()
                try:
                    alignment_score = float(parts[1].strip())
                except:
                    alignment_score = 0.5
                
                missing_skills_text = parts[2].strip()
                
                # Find matching job details
                job_details = job_lookup.get(job_title)
                if job_details:
                    matched_jobs.append(CareerRecommendation(
                        title=job_title,
                        description=job_details.get("description", "")[:200] + "...",
                        match_score=alignment_score,
                        required_skills=job_details.get("skills_required", []),
                        recommended_actions=[],
                        partner_name=job_details.get("partner", {}).get("name"),
                        application_url=job_details.get("application_url")
                    ))
                    
                    skill_alignment[job_title] = alignment_score
                
                # Parse missing skills
                if missing_skills_text and missing_skills_text.lower() != 'none':
                    skills = missing_skills_text.split(',')
                    for skill in skills[:3]:  # Limit to 3 per job
                        skill = skill.strip()
                        if skill:
                            missing_skills.append(SkillGap(
                                skill=skill,
                                current_level="beginner",
                                target_level="intermediate",
                                gap_description=f"Required for {job_title}",
                                urgency="medium"
                            ))
    
    # Sort matched jobs by score
    matched_jobs.sort(key=lambda x: x.match_score, reverse=True)
    
    return matched_jobs, skill_alignment, missing_skills

async def generate_career_pathways(resume_content: str, job_results: List[Dict]) -> List[CareerPathway]:
    """Generate career pathway recommendations."""
    pathways = []
    
    # Group jobs by climate focus
    focus_groups = {}
    for job in job_results:
        focus_areas = job.get("climate_focus", ["general"])
        for focus in focus_areas:
            if focus not in focus_groups:
                focus_groups[focus] = []
            focus_groups[focus].append(job)
    
    # Create pathways for top focus areas
    for focus_area, jobs in list(focus_groups.items())[:3]:
        if len(jobs) >= 2:  # Need at least 2 jobs for a pathway
            entry_jobs = [j for j in jobs if "entry" in j.get("experience_level", "").lower()]
            senior_jobs = [j for j in jobs if "senior" in j.get("experience_level", "").lower()]
            
            pathway_jobs = entry_jobs[:1] + senior_jobs[:1] if entry_jobs and senior_jobs else jobs[:2]
            
            pathways.append(CareerPathway(
                pathway_title=f"{focus_area.replace('_', ' ').title()} Career Track",
                description=f"Progressive career development in {focus_area.replace('_', ' ')} within the climate economy",
                steps=[
                    f"Start with {pathway_jobs[0].get('title', 'entry-level position')}",
                    f"Develop expertise in {', '.join(pathway_jobs[0].get('skills_required', [])[:2])}",
                    f"Advance to {pathway_jobs[1].get('title', 'senior position') if len(pathway_jobs) > 1 else 'leadership roles'}",
                    "Build network within climate economy partners"
                ],
                timeline="18-36 months",
                required_skills=list(set([skill for job in pathway_jobs for skill in job.get('skills_required', [])]))[:5],
                related_jobs=[job.get('title', '') for job in pathway_jobs],
                resources=[
                    SourceReference(
                        title=f"{job.get('title')} at {job.get('partner', {}).get('name')}",
                        url=job.get('application_url'),
                        partner_name=job.get('partner', {}).get('name', 'Unknown'),
                        content_type="job"
                    ) for job in pathway_jobs[:2]
                ]
            ))
    
    return pathways

@app.post("/api/skills-translation", response_model=SkillTranslationResponse)
async def skills_translation(request: SkillTranslationRequest):
    """
    AI-powered skills translation - KEY SELLING POINT
    
    Specialized for CEA's target communities:
    - Veterans: Military skill translation with focus on leadership, systems thinking, security clearances
    - Environmental Justice Communities: Community organizing, advocacy, lived experience assets
    - International Professionals: Global perspectives, multilingual capabilities, diverse technical backgrounds
    
    Provides:
    - Community-specific transferability scoring and positioning advice
    - Barrier identification and mitigation strategies  
    - Cultural asset recognition and amplification
    - Community-specific success stories and pathways
    - Network resources and partner connections
    - Actionable steps tailored to community needs
    """
    try:
        # Get user's resume
        resume_result = resume_rag.supabase.table("resumes") \
            .select("*") \
            .eq("user_id", request.user_id) \
            .order("created_at", desc=True) \
            .limit(1) \
            .execute()
        
        if not resume_result.data:
            raise HTTPException(status_code=404, detail="No resume found for this user")
        
        resume_data = resume_result.data[0]
        resume_content = resume_data.get("full_text", "")
        
        # Get climate economy jobs and requirements for context
        climate_jobs = await search_climate_ecosystem(
            query=f"{request.target_climate_sector} climate jobs",
            search_type="jobs",
            filters={},
            limit=20
        )
        
        # Get community-specific programs and resources
        community_resources = []
        if request.community_background:
            community_search_query = f"{request.community_background} climate workforce development"
            community_resources = await search_climate_ecosystem(
                query=community_search_query,
                search_type="all",
                filters={},
                limit=15
            )
        
        # Extract required skills from climate jobs
        climate_skills_required = set()
        for job in climate_jobs:
            climate_skills_required.update(job.get("skills_required", []))
        
        # Create community-specific system prompt
        community_system_prompt = create_community_system_prompt(request.community_background)
        
        # Enhanced skills translation prompt with community focus
        translation_prompt = f"""
You are an expert in climate economy career transitions for underrepresented communities, specializing in {request.community_background or 'diverse professional'} transitions.

COMMUNITY BACKGROUND: {request.community_background or 'General Professional'}
{f"MILITARY BRANCH: {request.military_branch}" if request.military_branch else ""}
{f"COUNTRY OF ORIGIN: {request.country_of_origin}" if request.country_of_origin else ""}
{f"LANGUAGES: {', '.join(request.languages_spoken)}" if request.languages_spoken else ""}

RESUME TO ANALYZE:
{resume_content}

TARGET CLIMATE SECTOR: {request.target_climate_sector}
CURRENT INDUSTRY: {request.current_industry or "Unknown"}

AVAILABLE CLIMATE OPPORTUNITIES:
{[f"{job.get('title')} at {job.get('partner', {}).get('name')} requires: {', '.join(job.get('skills_required', [])[:3])}" for job in climate_jobs[:10]]}

COMMUNITY-SPECIFIC RESOURCES AVAILABLE:
{[f"{resource.get('title')} - {resource.get('partner', {}).get('name')} ({resource.get('type')})" for resource in community_resources[:8]]}

PROVIDE COMPREHENSIVE COMMUNITY-FOCUSED SKILLS TRANSLATION ANALYSIS:

SKILL_TRANSLATIONS (format each as):
SKILL_TRANSLATION: [ORIGINAL_SKILL]|[ORIGINAL_DOMAIN]|[CLIMATE_EQUIVALENT]|[CLIMATE_DOMAIN]|[TRANSFERABILITY_SCORE]|[EXPLANATION]|[EXAMPLES]|[POSITIONING_ADVICE]|[COMMUNITY_SPECIFIC_GUIDANCE]

SKILL_CLUSTERS (format each as):
CLUSTER: [CLUSTER_NAME]|[ORIGINAL_SKILLS]|[CLIMATE_APPLICATIONS]|[COMPLEMENTARY_SKILLS]|[RECOMMENDED_ROLES]|[SAMPLE_PROJECTS]|[COMMUNITY_PATHWAY]

COMMUNITY_BARRIERS (identify and format as):
BARRIER: [TYPE]|[DESCRIPTION]|[IMPACT_LEVEL]|[MITIGATION_STRATEGIES]|[PARTNER_RESOURCES]

COMMUNITY_OPPORTUNITIES (identify and format as):
OPPORTUNITY: [TYPE]|[TITLE]|[DESCRIPTION]|[ELIGIBILITY]|[PARTNER_ORG]|[APPLICATION_PROCESS]|[TIMELINE]

CULTURAL_ASSETS: List unique strengths from community background that add value in climate roles
HIGH_TRANSFERABILITY: List 5 skills with highest transferability scores  
NEEDS_DEVELOPMENT: List 5 areas needing development for climate transition
READINESS_SCORE: Overall climate career readiness (0-100)
POSITIONING: Strategic community-specific advice for presenting background for climate roles

Focus on community-specific insights that leverage unique assets and address real barriers faced by {request.community_background or 'diverse professionals'}.
"""
        
        system_message = SystemMessage(content=community_system_prompt)
        human_message = HumanMessage(content=translation_prompt)
        
        translation_response = chat_model.invoke([system_message, human_message])
        
        # Parse the structured response with community enhancements
        (skill_translations, skill_clusters, community_barriers, community_opportunities, 
         cultural_assets, high_transferability, needs_development, readiness_score, positioning) = parse_community_skills_translation(translation_response.content)
        
        # Create community-specific actionable items
        actionable_items = await create_community_actionable_items(
            request.community_background, 
            high_transferability, 
            needs_development,
            community_opportunities,
            community_resources
        )
        
        # Create sources from climate jobs and community resources
        sources = []
        for job in climate_jobs[:5]:
            sources.append(SourceReference(
                title=job.get("title", "Climate Job"),
                url=job.get("application_url"),
                partner_name=job.get("partner", {}).get("name", "Climate Organization"),
                content_type="job",
                relevance_score=job.get("similarity")
            ))
        
        # Add community-specific network resources
        network_resources = []
        partner_orgs = {
            "veteran": ["Urban League of Eastern Massachusetts", "MassHire Career Centers", "Veterans Jobs Mission"],
            "environmental_justice": ["Urban League of Eastern Massachusetts", "Alliance for Climate Transition", "Environmental Justice Table"],
            "international_professional": ["African Bridge Network", "International Institute of New England", "MassHire Career Centers"]
        }
        
        if request.community_background in partner_orgs:
            for org in partner_orgs[request.community_background]:
                network_resources.append(SourceReference(
                    title=f"{org} - Community Support",
                    partner_name=org,
                    content_type="community_resource",
                    relevance_score=0.9
                ))
        
        # Generate community-specific success stories
        success_stories = generate_community_success_stories(
            request.community_background, 
            request.current_industry, 
            request.target_climate_sector
        )
        
        # Follow-up questions with community focus
        follow_up_questions = [
            FollowUpQuestion(
                question=f"Would you like specific examples of how other {request.community_background or 'professionals'} have positioned their {high_transferability[0] if high_transferability else 'background'} for climate roles?",
                category="community_positioning",
                context="Get community-specific positioning examples"
            ),
            FollowUpQuestion(
                question=f"Are you interested in connecting with {request.community_background or 'professional'} networks in the climate economy?",
                category="community_networking",
                context="Build community-specific professional networks"
            )
        ]
        
        # Add community-specific follow-ups
        if request.community_background == "veteran" and request.military_branch:
            follow_up_questions.append(FollowUpQuestion(
                question=f"Would you like guidance on translating your {request.military_branch} experience for civilian climate tech employers?",
                category="military_translation",
                context="Military to civilian climate career translation"
            ))
        elif request.community_background == "international_professional" and request.country_of_origin:
            follow_up_questions.append(FollowUpQuestion(
                question=f"Are you interested in climate opportunities that value international experience from {request.country_of_origin}?",
                category="international_experience",
                context="Leverage international background as asset"
            ))
        elif request.community_background == "environmental_justice":
            follow_up_questions.append(FollowUpQuestion(
                question="Would you like to explore climate roles focused on community impact and environmental justice?",
                category="community_impact",
                context="Community-centered climate career paths"
            ))
        
        # Calculate community-enhanced readiness score
        community_readiness_score = calculate_community_readiness_score(
            skill_translations, 
            skill_clusters, 
            cultural_assets,
            request.community_background
        )
        
        # Generate comprehensive community-focused analysis content
        analysis_content = generate_community_analysis_content(
            request.community_background,
            len(high_transferability),
            community_readiness_score,
            len(skill_clusters),
            request.target_climate_sector,
            len(community_opportunities),
            positioning
        )
        
        return SkillTranslationResponse(
            content=analysis_content,
            skill_translations=skill_translations,
            skill_clusters=skill_clusters,
            high_transferability_skills=high_transferability,
            skills_needing_development=needs_development,
            climate_career_readiness_score=community_readiness_score / 100.0,
            recommended_positioning=positioning,
            actionable_items=actionable_items,
            sources=sources,
            follow_up_questions=follow_up_questions[:3],
            success_stories=success_stories,
            # Community-specific fields
            community_profile=request.community_background,
            community_barriers=community_barriers,
            community_opportunities=community_opportunities,
            cultural_assets=cultural_assets,
            network_resources=network_resources
        )
        
    except Exception as e:
        print(f"Error in community-focused skills translation: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Skills translation failed: {str(e)}"
        )

def calculate_community_readiness_score(skill_translations: List[SkillTranslation], skill_clusters: List[SkillCluster], cultural_assets: List[str], community_background: str) -> float:
    """Calculate community-specific readiness score based on skill translations, skill clusters, cultural assets, and community background."""
    if not skill_translations:
        return 50.0
    
    # Base score from average transferability
    avg_transferability = sum(st.transferability_score for st in skill_translations) / len(skill_translations)
    base_score = avg_transferability * 60  # Max 60 points from transferability
    
    # Bonus for high transferability skills
    high_transfer_count = sum(1 for st in skill_translations if st.transferability_score >= 0.8)
    transfer_bonus = min(high_transfer_count * 5, 20)  # Max 20 points
    
    # Bonus for skill clusters (career pathway diversity)
    cluster_bonus = min(len(skill_clusters) * 5, 20)  # Max 20 points
    
    # Bonus for cultural assets
    cultural_bonus = sum(1 for asset in cultural_assets if asset in ["veteran", "environmental_justice", "international_professional"])
    cultural_bonus = min(cultural_bonus * 5, 10)  # Max 10 points
    
    # Total score
    total_score = base_score + transfer_bonus + cluster_bonus + cultural_bonus
    return min(total_score, 100.0)

def generate_community_analysis_content(community_background: str, high_transferability_count: int, readiness_score: float, skill_cluster_count: int, target_sector: str, community_opportunity_count: int, positioning: str) -> str:
    """Generate community-specific analysis content based on the given parameters."""
    analysis_content = f"""
Based on your background and experience, I've identified several opportunities in the climate economy that align with your skills and interests. Your experience shows strong potential for roles in {', '.join([f"{target_sector.replace('_', ' ')} roles" for _ in range(high_transferability_count)])} within the climate sector.

Key findings from your resume review show {len(high_transferability)} highly transferable skills that directly apply to climate tech positions.

I've found {skill_cluster_count} skill clusters that position you for multiple climate career pathways.

The climate economy is growing, with opportunities across different focus areas. Your background particularly aligns with roles in {', '.join([f"{target_sector.replace('_', ' ')} roles" for _ in range(high_transferability_count)])} within the climate sector.

To strengthen your candidacy, consider developing skills in {', '.join([f"{target_sector.replace('_', ' ')} roles" for _ in range(skill_cluster_count)])} that are in high demand across our partner network.

Your overall climate career readiness score is {int(readiness_score)}%, indicating {"strong potential" if readiness_score >= 70 else "good foundation with targeted development needed" if readiness_score >= 50 else "opportunity for strategic skill building"} for climate economy transition.

Key insight: Your {high_transferability[0] if high_transferability else "professional experience"} translates exceptionally well to climate roles, particularly in {target_sector} sector. I've identified {skill_cluster_count} skill clusters that position you for multiple climate career pathways.

Strategic positioning recommendation: {positioning if positioning else "Focus on connecting your existing expertise to climate impact and sustainability outcomes."}

Community-specific insights:
- {community_background} professionals have a strong track record in {target_sector} roles, with a focus on {', '.join([f"{target_sector.replace('_', ' ')} roles" for _ in range(high_transferability_count)])} within the climate sector.
- There are {community_opportunity_count} community-specific opportunities available across our partner network.

To leverage these opportunities, consider developing skills in {', '.join([f"{target_sector.replace('_', ' ')} roles" for _ in range(skill_cluster_count)])} that are in high demand across our partner network.

The climate economy is growing, with opportunities across different focus areas. Your background particularly aligns with roles in {', '.join([f"{target_sector.replace('_', ' ')} roles" for _ in range(high_transferability_count)])} within the climate sector.

To strengthen your candidacy, consider developing skills in {', '.join([f"{target_sector.replace('_', ' ')} roles" for _ in range(skill_cluster_count)])} that are in high demand across our partner network.

Your overall climate career readiness score is {int(readiness_score)}%, indicating {"strong potential" if readiness_score >= 70 else "good foundation with targeted development needed" if readiness_score >= 50 else "opportunity for strategic skill building"} for climate economy transition.

Key insight: Your {high_transferability[0] if high_transferability else "professional experience"} translates exceptionally well to climate roles, particularly in {target_sector} sector. I've identified {skill_cluster_count} skill clusters that position you for multiple climate career pathways.

Strategic positioning recommendation: {positioning if positioning else "Focus on connecting your existing expertise to climate impact and sustainability outcomes."}

Community-specific insights:
- {community_background} professionals have a strong track record in {target_sector} roles, with a focus on {', '.join([f"{target_sector.replace('_', ' ')} roles" for _ in range(high_transferability_count)])} within the climate sector.
- There are {community_opportunity_count} community-specific opportunities available across our partner network.

To leverage these opportunities, consider developing skills in {', '.join([f"{target_sector.replace('_', ' ')} roles" for _ in range(skill_cluster_count)])} that are in high demand across our partner network.
"""
    return analysis_content

def parse_community_skills_translation(translation_text: str) -> tuple:
    """Parse structured community-specific skills translation response."""
    skill_translations = []
    skill_clusters = []
    community_barriers = []
    community_opportunities = []
    cultural_assets = []
    high_transferability = []
    needs_development = []
    readiness_score = 0.0
    positioning = ""
    
    sections = translation_text.split('\n')
    current_section = None
    
    for line in sections:
        line = line.strip()
        if not line:
            continue
            
        # Parse skill translations
        if line.startswith('SKILL_TRANSLATION:'):
            parts = line.replace('SKILL_TRANSLATION:', '').split('|')
            if len(parts) >= 9:
                try:
                    transferability_score = float(parts[4].strip())
                except:
                    transferability_score = 0.7
                
                skill_translations.append(SkillTranslation(
                    original_skill=parts[0].strip(),
                    original_domain=parts[1].strip(),
                    climate_equivalent=parts[2].strip(),
                    climate_domain=parts[3].strip(),
                    transferability_score=transferability_score,
                    translation_explanation=parts[5].strip(),
                    examples=parts[6].strip().split(',') if parts[6].strip() else [],
                    positioning_advice=parts[7].strip(),
                    community_specific_guidance=parts[8].strip()
                ))
        
        # Parse skill clusters
        elif line.startswith('CLUSTER:'):
            parts = line.replace('CLUSTER:', '').split('|')
            if len(parts) >= 7:
                skill_clusters.append(SkillCluster(
                    cluster_name=parts[0].strip(),
                    original_skills=parts[1].strip().split(',') if parts[1].strip() else [],
                    climate_applications=parts[2].strip().split(',') if parts[2].strip() else [],
                    complementary_skills_needed=parts[3].strip().split(',') if parts[3].strip() else [],
                    recommended_roles=parts[4].strip().split(',') if parts[4].strip() else [],
                    sample_projects=parts[5].strip().split(',') if parts[5].strip() else [],
                    community_pathway=parts[6].strip()
                ))
        
        # Parse lists and scores
        elif line.startswith('HIGH_TRANSFERABILITY:'):
            skills_text = line.replace('HIGH_TRANSFERABILITY:', '').strip()
            high_transferability = [s.strip() for s in skills_text.split(',') if s.strip()]
        
        elif line.startswith('NEEDS_DEVELOPMENT:'):
            skills_text = line.replace('NEEDS_DEVELOPMENT:', '').strip()
            needs_development = [s.strip() for s in skills_text.split(',') if s.strip()]
        
        elif line.startswith('READINESS_SCORE:'):
            score_text = line.replace('READINESS_SCORE:', '').strip()
            try:
                readiness_score = float(score_text)
            except:
                readiness_score = 60.0
        
        elif line.startswith('POSITIONING:'):
            positioning = line.replace('POSITIONING:', '').strip()
        
        # Parse community barriers
        elif line.startswith('BARRIER:'):
            parts = line.replace('BARRIER:', '').split('|')
            if len(parts) >= 5:
                community_barriers.append(CommunityBarrier(
                    barrier_type=parts[0].strip(),
                    description=parts[1].strip(),
                    impact_level=parts[2].strip(),
                    mitigation_strategies=parts[3].strip().split(',') if parts[3].strip() else [],
                    partner_resources=parts[4].strip().split(',') if parts[4].strip() else []
                ))
        
        # Parse community opportunities
        elif line.startswith('OPPORTUNITY:'):
            parts = line.replace('OPPORTUNITY:', '').split('|')
            if len(parts) >= 6:
                community_opportunities.append(CommunityOpportunity(
                    opportunity_type=parts[0].strip(),
                    title=parts[1].strip(),
                    description=parts[2].strip(),
                    eligibility_criteria=parts[3].strip().split(',') if parts[3].strip() else [],
                    partner_organization=parts[4].strip(),
                    application_process=parts[5].strip(),
                    timeline=parts[6].strip()
                ))
    
    return skill_translations, skill_clusters, community_barriers, community_opportunities, cultural_assets, high_transferability, needs_development, readiness_score, positioning

def create_community_system_prompt(community_background: str) -> str:
    """Create community-specific system prompt based on the given community background."""
    if community_background == "veteran":
        return """You are a veteran with a strong background in leadership, systems thinking, and security clearance. Your role is to:
- Translate your military skills to civilian climate tech roles
- Provide insights on how to position your skills for climate roles
- Offer advice on networking within the veteran community
- Share success stories of veterans transitioning to climate tech roles

Keep responses focused on career development and job searching in the climate tech sector. 
Be practical, specific, and action-oriented in your advice."""
    elif community_background == "environmental_justice":
        return """You are an environmental justice professional with a strong background in community organizing, advocacy, and lived experience. Your role is to:
- Translate your community organizing skills to climate tech roles
- Provide insights on how to position your skills for climate roles
- Offer advice on networking within the environmental justice community
- Share success stories of environmental justice professionals transitioning to climate tech roles

Keep responses focused on career development and job searching in the climate tech sector. 
Be practical, specific, and action-oriented in your advice."""
    elif community_background == "international_professional":
        return """You are an international professional with a strong background in global perspectives, multilingual capabilities, and diverse technical backgrounds. Your role is to:
- Translate your international experience to climate tech roles
- Provide insights on how to position your skills for climate roles
- Offer advice on networking within the international professional community
- Share success stories of international professionals transitioning to climate tech roles

Keep responses focused on career development and job searching in the climate tech sector. 
Be practical, specific, and action-oriented in your advice."""
    else:
        return """You are a diverse professional with a strong background in various industries. Your role is to:
- Translate your diverse skills to climate tech roles
- Provide insights on how to position your skills for climate roles
- Offer advice on networking within the professional community
- Share success stories of professionals transitioning to climate tech roles

Keep responses focused on career development and job searching in the climate tech sector. 
Be practical, specific, and action-oriented in your advice."""

def generate_community_success_stories(community_background: str, current_industry: str, target_sector: str) -> List[str]:
    """Generate community-specific success stories for career transitions."""
    stories = []
    
    # Base success stories
    base_stories = [
        "Former project manager transitioned to renewable energy development by highlighting planning and stakeholder coordination experience",
        "Sales professional leveraged relationship-building skills to become business development manager at solar energy company",
        "Financial analyst applied risk assessment expertise to climate finance and green investment advisory roles",
        "Operations manager used process optimization experience to excel in energy efficiency consulting",
        "Marketing coordinator applied communication skills to sustainability program management at clean energy nonprofit"
    ]
    
    # Community-specific success stories
    if community_background == "veteran":
        veteran_stories = [
            "Navy electronics technician (ET) transitioned to wind turbine maintenance, leveraging electrical systems expertise and safety protocols training",
            "Army logistics specialist (92A) became supply chain manager for solar panel manufacturing, applying inventory management and procurement skills",
            "Air Force project manager used military leadership experience to oversee offshore wind construction projects in Massachusetts",
            "Marine Corps communications specialist (0651) moved into grid modernization technology, translating network management skills to smart grid systems",
            "Coast Guard engineering aide applied maritime infrastructure knowledge to offshore wind permitting and environmental compliance roles"
        ]
        stories.extend(veteran_stories)
    
    elif community_background == "international_professional":
        international_stories = [
            "Engineer from India leveraged international renewable energy experience to become technical consultant for Massachusetts wind projects",
            "Project manager from Brazil applied multinational construction experience to lead solar installation teams across New England",
            "Finance professional from Nigeria used global banking background to specialize in international climate finance and carbon credit markets",
            "Electrical engineer from Philippines translated power systems expertise to battery energy storage system design and integration",
            "Environmental scientist from Kenya applied international climate research experience to climate adaptation consulting for Massachusetts communities"
        ]
        stories.extend(international_stories)
    
    elif community_background == "environmental_justice":
        ej_stories = [
            "Community organizer leveraged advocacy experience to become environmental justice program coordinator at regional climate nonprofit",
            "Public health worker applied community health expertise to climate resilience planning for vulnerable neighborhoods",
            "Social worker used case management skills to support workforce development programs for clean energy training in underserved communities",
            "Community educator translated grassroots organizing experience to lead environmental justice initiatives at clean energy companies",
            "Nonprofit program manager applied grant writing and community engagement skills to develop equitable clean energy access programs"
        ]
        stories.extend(ej_stories)
    
    # Industry-specific customization
    if current_industry:
        industry_specific = {
            "finance": "Former investment banker transitioned to green bonds and climate finance, using quantitative analysis skills to evaluate renewable energy projects",
            "tech": "Software developer moved to clean energy by building energy management platforms and smart grid applications",
            "healthcare": "Healthcare administrator applied systems thinking to develop sustainability programs for hospital energy efficiency initiatives",
            "education": "Teacher became environmental education specialist, creating climate science curricula for K-12 schools and community programs",
            "manufacturing": "Manufacturing engineer used lean production expertise to optimize solar panel assembly processes and quality control systems"
        }
        
        for key, story in industry_specific.items():
            if key.lower() in current_industry.lower():
                stories.insert(0, story)
                break
    
    return stories[:5]  # Return top 5 most relevant stories

async def create_community_actionable_items(
    community_background: str,
    high_transferability: List[str], 
    needs_development: List[str],
    community_opportunities: List[CommunityOpportunity],
    community_resources: List[Dict[str, Any]]
) -> List[ActionableItem]:
    """Create community-specific actionable items based on skills translation analysis."""
    actionable_items = []
    
    # Skills-based actions for high transferability skills
    if high_transferability:
        for skill in high_transferability[:2]:  # Top 2 transferable skills
            actionable_items.append(ActionableItem(
                action="apply",
                title=f"Leverage your {skill} experience",
                description=f"Apply for climate tech positions that value {skill} - your background gives you a competitive advantage",
                partner_name="Climate Economy Network"
            ))
    
    # Skill development actions
    if needs_development:
        for skill in needs_development[:2]:  # Top 2 development areas
            actionable_items.append(ActionableItem(
                action="learn_more",
                title=f"Develop {skill} skills",
                description=f"Strengthen your {skill} capabilities through targeted training programs",
                partner_name="MassCEC Workforce Development"
            ))
    
    # Community-specific opportunities
    for opportunity in community_opportunities[:2]:
        actionable_items.append(ActionableItem(
            action="explore",
            title=f"Explore {opportunity.title}",
            description=opportunity.description,
            partner_name=opportunity.partner_organization
        ))
    
    # Community-specific resources and networking
    if community_background == "veteran":
        actionable_items.extend([
            ActionableItem(
                action="contact",
                title="Connect with Solar Ready Vets Network",
                url="https://irecusa.org/programs/solar-ready-vets/",
                description="Join the Solar Ready Vets Network for career navigation, fellowships, and solar industry connections",
                partner_name="Interstate Renewable Energy Council"
            ),
            ActionableItem(
                action="explore",
                title="Veterans to Energy Careers Program",
                url="https://veteranstoenergycareers.org/",
                description="Paid internships and mentorship for veterans transitioning to clean energy careers",
                partner_name="Veterans to Naval Careers"
            ),
            ActionableItem(
                action="learn_more",
                title="Military Skills Translator for Energy",
                url="https://getintoenergy.org/wp-content/uploads/tej-files/MOS-Translator-ToolKit.pdf",
                description="Use the MOS Translator to identify energy sector opportunities matching your military background",
                partner_name="Center for Energy Workforce Development"
            )
        ])
    
    elif community_background == "international_professional":
        actionable_items.extend([
            ActionableItem(
                action="contact",
                title="Get Credential Evaluation",
                url="https://cedevaluations.com/",
                description="Evaluate your international credentials through the Center for Educational Documentation in Boston",
                partner_name="Center for Educational Documentation"
            ),
            ActionableItem(
                action="explore",
                title="World Education Services (WES)",
                url="https://www.wes.org/",
                description="Professional credential evaluation services for international education and experience",
                partner_name="World Education Services"
            ),
            ActionableItem(
                action="learn_more",
                title="Massachusetts Foreign Credential Recognition",
                url="https://www.mass.gov/info-details/evaluation-of-foreign-studies",
                description="Navigate Massachusetts credential recognition processes for professional licensing",
                partner_name="Commonwealth of Massachusetts"
            )
        ])
    
    elif community_background == "environmental_justice":
        actionable_items.extend([
            ActionableItem(
                action="contact",
                title="Environmental Justice Workforce Programs",
                description="Connect with community-based workforce development programs focused on environmental justice communities",
                partner_name="Urban League of Eastern Massachusetts"
            ),
            ActionableItem(
                action="explore",
                title="Community-Centered Climate Careers",
                description="Explore climate roles that directly impact environmental justice communities and address health disparities",
                partner_name="Alliance for Climate Transition"
            )
        ])
    
    # Massachusetts-specific climate workforce opportunities
    actionable_items.extend([
        ActionableItem(
            action="apply",
            title="MassCEC Workforce Training Programs",
            url="https://www.masscec.com/workforce",
            description="Access Massachusetts Clean Energy Center's workforce development and training opportunities",
            partner_name="Massachusetts Clean Energy Center"
        ),
        ActionableItem(
            action="explore",
            title="Clean Energy Internship Program",
            url="https://www.masscec.com/workforce",
            description="Paid internships at Massachusetts clean energy companies with wage reimbursement support",
            partner_name="Massachusetts Clean Energy Center"
        )
    ])
    
    return actionable_items[:6]  # Limit to 6 actionable items

def calculate_readiness_score(skill_translations: List[SkillTranslation], skill_clusters: List[SkillCluster]) -> float:
    """Calculate climate career readiness score from translations."""
    if not skill_translations:
        return 50.0
    
    # Base score from average transferability
    avg_transferability = sum(st.transferability_score for st in skill_translations) / len(skill_translations)
    base_score = avg_transferability * 60  # Max 60 points from transferability
    
    # Bonus for high transferability skills
    high_transfer_count = sum(1 for st in skill_translations if st.transferability_score >= 0.8)
    transfer_bonus = min(high_transfer_count * 5, 20)  # Max 20 points
    
    # Bonus for skill clusters (career pathway diversity)
    cluster_bonus = min(len(skill_clusters) * 5, 20)  # Max 20 points
    
    total_score = base_score + transfer_bonus + cluster_bonus
    return min(total_score, 100.0)

if __name__ == "__main__":
    import uvicorn
    print("Starting server...")
    print(f"Looking for .env file at: {env_path}")
    print(f".env file exists: {env_path.exists()}")
    print(f"OpenAI API Key configured: {bool(api_key)}")
    uvicorn.run(app, host="0.0.0.0", port=8000) 