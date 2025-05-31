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

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Update with your frontend URL
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

if __name__ == "__main__":
    import uvicorn
    print("Starting server...")
    print(f"Looking for .env file at: {env_path}")
    print(f".env file exists: {env_path.exists()}")
    print(f"OpenAI API Key configured: {bool(api_key)}")
    uvicorn.run(app, host="0.0.0.0", port=8000) 