"""
Climate Economy Assistant Backend API - Enhanced with Authentication & Role-Based Access

This module serves as the main entry point for the Climate Economy Assistant API,
providing role-based endpoints for job seekers, partners, and admins.

Enhanced with:
- Supabase Authentication & JWT Verification
- Role-Based Access Control (job_seeker, partner, admin)
- LangGraph Multi-Agent System (job seekers only)
- Enhanced Intelligence Framework
- Comprehensive Tool Integration
- Human-in-the-Loop Support
"""

import logging
import os
import asyncio
import uuid
import jwt
from typing import Dict, Any, Optional, List
from contextlib import asynccontextmanager
from enum import Enum
from datetime import datetime

from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel

try:
    from pydantic_settings import BaseSettings
except ImportError:
    from pydantic import BaseSettings

# Import configuration and Supabase
from supabase import create_client, Client

# Import API router (for non-auth endpoints)
from api import api_router

# Import existing core functionality
from core.config import get_settings

# Import the supervisor workflow (job seekers only)
from api.workflows.climate_supervisor_workflow import (
    create_climate_supervisor_workflow,
    ClimateAgentState,
    initialize_enhanced_intelligence,
)

# Import enhanced chat integration
from api.chat.interactive_chat import chat_graph

# Import enhanced intelligence components
from core.agents.enhanced_intelligence import (
    EnhancedIntelligenceCoordinator,
    IntelligenceLevel,
)

# Import the new job seeker authentication workflow
from core.workflows.job_seeker_auth_workflow import (
    get_job_seeker_workflow,
    run_job_seeker_chat_workflow,
    run_job_recommendation_workflow,
)

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("cea_main_auth")

# Load settings
settings = get_settings()


# Enhanced Settings with Supabase Auth
class AuthSettings(BaseSettings):
    supabase_url: str = os.getenv("NEXT_PUBLIC_SUPABASE_URL", "")
    supabase_service_key: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    supabase_anon_key: str = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "")
    jwt_secret: str = os.getenv("SUPABASE_JWT_SECRET", "")

    class Config:
        env_file = ".env"
        extra = "ignore"  # Allow extra environment variables


auth_settings = AuthSettings()

# Create Supabase client
if auth_settings.supabase_url and auth_settings.supabase_service_key:
    supabase: Client = create_client(
        auth_settings.supabase_url, auth_settings.supabase_service_key
    )
    logger.info("✅ Supabase client initialized for authentication")
else:
    supabase = None
    logger.warning("⚠️ Supabase credentials not found - authentication disabled")


# User Types and Models
class UserType(str, Enum):
    JOB_SEEKER = "job_seeker"
    PARTNER = "partner"
    ADMIN = "admin"


class Profile(BaseModel):
    id: str
    user_type: UserType
    email: str
    full_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class JobSeekerProfile(BaseModel):
    id: str
    user_id: str
    email: str
    full_name: Optional[str] = None
    skills: Optional[List[str]] = None
    experience_level: Optional[str] = None
    resume_url: Optional[str] = None
    preferred_location: Optional[str] = None
    climate_interests: Optional[List[str]] = None


class PartnerProfile(BaseModel):
    id: str
    user_id: str
    organization_name: str
    full_name: Optional[str] = None
    email: Optional[str] = None
    company_size: Optional[str] = None
    industry: Optional[str] = None
    website_url: Optional[str] = None
    verified: bool = False


class AdminProfile(BaseModel):
    id: str
    user_id: str
    full_name: str
    email: Optional[str] = None
    permissions: List[str] = ["read"]
    last_login: Optional[datetime] = None
    can_manage_users: bool = False
    can_manage_partners: bool = False
    can_manage_content: bool = False
    can_manage_system: bool = False


# Request/Response Models
class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    context: Optional[Dict[str, Any]] = {}
    stream: bool = False


class ChatResponse(BaseModel):
    success: bool
    content: str
    conversation_id: str
    specialist: Optional[str] = None
    tools_used: List[str] = []
    workflow_state: str = "completed"


# Authentication
security = HTTPBearer()


def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Verify JWT token from Supabase"""
    if not auth_settings.jwt_secret:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service not configured",
        )

    try:
        token = credentials.credentials
        payload = jwt.decode(
            token,
            auth_settings.jwt_secret,
            algorithms=["HS256"],
            audience="authenticated",
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Token has expired"
        )
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"
        )


async def get_current_user(token_data: dict = Depends(verify_token)) -> Profile:
    """Get current user profile based on JWT token"""
    user_id = token_data.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload"
        )

    try:
        # Check admin_profiles first (uses user_id foreign key)
        admin_response = (
            supabase.from("admin_profiles")
            .select("*")
            .eq("user_id", user_id)  # ✅ CORRECT: admin_profiles uses user_id
            .single()
            .execute()
        )

        if admin_response.data:
            return Profile(
                id=admin_response.data["id"],
                user_type=UserType.ADMIN,
                email=admin_response.data.get("email", ""),
                full_name=admin_response.data.get("full_name"),
                created_at=admin_response.data["created_at"],
                updated_at=admin_response.data["updated_at"],
            )

        # Check partner_profiles (uses id as primary key matching auth.users.id)
        partner_response = (
            supabase.from("partner_profiles")
            .select("*")
            .eq("id", user_id)  # ✅ FIXED: partner_profiles.id = auth.users.id
            .single()
            .execute()
        )

        if partner_response.data:
            return Profile(
                id=partner_response.data["id"],
                user_type=UserType.PARTNER,
                email=partner_response.data.get("email", ""),
                full_name=partner_response.data.get("full_name"),
                created_at=partner_response.data["created_at"],
                updated_at=partner_response.data["updated_at"],
            )

        # Check job_seeker_profiles (uses id as primary key matching auth.users.id)
        job_seeker_response = (
            supabase.from("job_seeker_profiles")
            .select("*")
            .eq("id", user_id)  # ✅ FIXED: job_seeker_profiles.id = auth.users.id
            .single()
            .execute()
        )

        if job_seeker_response.data:
            return Profile(
                id=job_seeker_response.data["id"],
                user_type=UserType.JOB_SEEKER,
                email=job_seeker_response.data.get("email", ""),
                full_name=job_seeker_response.data.get("full_name"),
                created_at=job_seeker_response.data["created_at"],
                updated_at=job_seeker_response.data["updated_at"],
            )

        # If no profile found, user exists in auth but no profile created
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found. Please complete your profile setup.",
        )

    except Exception as e:
        logger.error(f"❌ Error fetching user profile for {user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error fetching user profile",
        )


def require_user_type(allowed_types: List[UserType]):
    """Decorator to require specific user types"""

    def decorator(current_user: Profile = Depends(get_current_user)):
        if current_user.user_type not in allowed_types:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required user types: {[t.value for t in allowed_types]}",
            )
        return current_user

    return decorator


# Specific role dependencies
async def get_job_seeker(current_user: Profile = Depends(get_current_user)) -> Profile:
    """Require job seeker role"""
    if current_user.user_type != UserType.JOB_SEEKER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Job seeker access required"
        )
    return current_user


async def get_partner(current_user: Profile = Depends(get_current_user)) -> Profile:
    """Require partner role"""
    if current_user.user_type != UserType.PARTNER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Partner access required"
        )
    return current_user


async def get_admin(current_user: Profile = Depends(get_current_user)) -> Profile:
    """Require admin role"""
    if current_user.user_type != UserType.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required"
        )
    return current_user


# Global workflow instances
climate_supervisor_graph = None
enhanced_intelligence = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Enhanced application lifespan management with auth-aware workflow initialization"""
    logger.info("🚀 Starting Climate Economy Assistant API with Authentication...")

    try:
        # Initialize Enhanced Intelligence Framework
        global enhanced_intelligence
        enhanced_intelligence = await initialize_enhanced_intelligence()
        logger.info("✅ Enhanced Intelligence Framework initialized")

        # Initialize Supervisor Workflow (for job seekers)
        global climate_supervisor_graph
        climate_supervisor_graph = create_climate_supervisor_workflow()
        logger.info("✅ Climate Supervisor Workflow initialized (job seekers only)")

        # Test Supabase connection
        if supabase:
            try:
                # Test with a simple query
                result = (
                    supabase.table("profiles")
                    .select("count", count="exact")
                    .limit(1)
                    .execute()
                )
                logger.info(
                    f"✅ Supabase connection established - {result.count} profiles"
                )
            except Exception as e:
                logger.warning(f"⚠️ Supabase connection test failed: {e}")
        else:
            logger.warning("⚠️ Supabase not configured - authentication disabled")

        logger.info("🎯 Climate Economy Assistant API is ready with role-based access")

        yield

    except Exception as e:
        logger.error(f"❌ Startup error: {str(e)}")
        raise
    finally:
        logger.info("🛑 Shutting down Climate Economy Assistant API...")


# Initialize FastAPI app with enhanced configuration
app = FastAPI(
    title="Climate Economy Assistant API with Authentication",
    description="""
    Role-based API for the Climate Economy Assistant platform.
    
    **User Roles:**
    - **Job Seekers**: Access to AI chat, job recommendations, resume analysis
    - **Partners**: Dashboard access, job posting management
    - **Admins**: Platform administration, user management, analytics
    
    **Features:**
    - Supabase Authentication with JWT tokens
    - Role-based access control
    - LangGraph AI workflows (job seekers only)
    - Enhanced intelligence framework
    - Real-time analytics and monitoring
    """,
    version="2.1.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure enhanced middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://cea-project.vercel.app",
        # Add your production domain
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.add_middleware(GZipMiddleware, minimum_size=1000)

# Include existing API router for public endpoints
app.include_router(api_router, prefix="/api")

# =============================================================================
# PUBLIC ENDPOINTS (No Authentication Required)
# =============================================================================


@app.get("/")
async def root():
    """Enhanced root endpoint with auth status"""
    auth_status = "enabled" if supabase and auth_settings.jwt_secret else "disabled"

    return {
        "message": "Climate Economy Assistant API with Authentication",
        "version": "2.1.0",
        "status": "healthy",
        "authentication": auth_status,
        "features": {
            "role_based_access": auth_status == "enabled",
            "supervisor_workflow": climate_supervisor_graph is not None,
            "enhanced_intelligence": enhanced_intelligence is not None,
            "job_seeker_chat": True,
            "partner_dashboard": True,
            "admin_dashboard": True,
        },
        "user_roles": ["job_seeker", "partner", "admin"],
        "endpoints": {
            "health": "/health",
            "auth_status": "/api/auth/status",
            "job_seeker_chat": "/api/chat (job seekers only)",
            "partner_dashboard": "/api/partners/dashboard",
            "admin_dashboard": "/api/admin/dashboard",
            "docs": "/docs",
        },
    }


@app.get("/health")
async def health_check():
    """Comprehensive health check with auth services"""
    health_status = {
        "status": "healthy",
        "timestamp": str(asyncio.get_event_loop().time()),
        "services": {
            "api": True,
            "authentication": supabase is not None and bool(auth_settings.jwt_secret),
            "database": False,
            "supervisor_workflow": climate_supervisor_graph is not None,
            "enhanced_intelligence": enhanced_intelligence is not None,
        },
        "version": "2.1.0",
    }

    # Test database connection
    if supabase:
        try:
            result = (
                supabase.table("profiles")
                .select("count", count="exact")
                .limit(1)
                .execute()
            )
            health_status["services"]["database"] = True
            health_status["user_count"] = result.count
        except Exception as e:
            logger.warning(f"Database health check failed: {e}")

    # Overall health assessment
    critical_services = ["api", "authentication", "database"]
    if all(health_status["services"][svc] for svc in critical_services):
        health_status["status"] = "healthy"
    elif any(health_status["services"][svc] for svc in critical_services):
        health_status["status"] = "partial"
    else:
        health_status["status"] = "unhealthy"

    return health_status


# =============================================================================
# GENERAL AUTHENTICATED ENDPOINTS
# =============================================================================


@app.get("/api/me")
async def get_me(current_user: Profile = Depends(get_current_user)):
    """Get current user profile - all roles"""
    return current_user


@app.get("/api/auth/status")
async def auth_status(current_user: Profile = Depends(get_current_user)):
    """Get authentication status and permissions"""
    return {
        "authenticated": True,
        "user_id": current_user.id,
        "user_type": current_user.user_type,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "permissions": {
            "can_chat": current_user.user_type == UserType.JOB_SEEKER,
            "can_manage_jobs": current_user.user_type == UserType.PARTNER,
            "can_admin": current_user.user_type == UserType.ADMIN,
        },
    }


# =============================================================================
# JOB SEEKER ENDPOINTS (AI Chat + Recommendations) - ENHANCED WITH WORKFLOW
# =============================================================================


@app.get("/api/job-seekers/profile")
async def get_job_seeker_profile(current_user: Profile = Depends(get_job_seeker)):
    """Get job seeker specific data"""
    if not supabase:
        raise HTTPException(status_code=503, detail="Database service unavailable")

    try:
        response = (
            supabase.table("job_seeker_profiles")
            .select("*")
            .eq("user_id", current_user.id)
            .execute()
        )
        if response.data:
            return JobSeekerProfile(**response.data[0])
        return {"message": "Job seeker profile not found", "user_id": current_user.id}
    except Exception as e:
        logger.error(f"Error fetching job seeker profile: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/chat")
async def chat_with_ai(
    chat_request: ChatRequest,
    background_tasks: BackgroundTasks,
    current_user: Profile = Depends(get_job_seeker),
) -> ChatResponse:
    """
    Enhanced AI Chat endpoint - ONLY for job seekers using LangGraph Authentication Workflow

    This endpoint now uses the comprehensive job seeker authentication workflow that includes:
    - Full authentication and session management
    - Integration with the complete 7-agent ecosystem:
      * Pendo (Supervisor) - Intelligent routing
      * Marcus (Veterans) - Military transition specialist
      * Liv (International) - Credential recognition
      * Miguel (Environmental Justice) - Community organizing
      * Jasmine (MA Resources) - Massachusetts-specific guidance
      * Alex (Empathy) - Crisis intervention and emotional support
      * Lauren (Climate Careers) - Environmental job specialist
      * Mai (Resume Expert) - Resume optimization specialist
    - Intent analysis and personalized responses
    - Analytics and conversation tracking
    - Uses existing 28-table database schema
    """
    try:
        # Generate conversation ID if not provided
        conversation_id = (
            chat_request.conversation_id or f"user_{current_user.id}_{uuid.uuid4()}"
        )

        # Get access token from request headers or context
        # Note: In production, you'd extract this from the Authorization header
        access_token = (
            chat_request.context.get("access_token") if chat_request.context else None
        )
        if not access_token:
            # For now, we'll create a mock token - in production this comes from the frontend
            access_token = "mock_token_for_authenticated_user"

        logger.info(f"🎯 Enhanced job seeker chat request from {current_user.email}")

        # Execute the comprehensive job seeker authentication workflow
        workflow_result = await run_job_seeker_chat_workflow(
            user_id=current_user.id,
            access_token=access_token,
            message=chat_request.message,
            conversation_id=conversation_id,
        )

        if "error" in workflow_result:
            raise HTTPException(
                status_code=500, detail=f"Workflow error: {workflow_result['error']}"
            )

        # Format response using workflow results
        response_data = ChatResponse(
            success=workflow_result["success"],
            content=workflow_result["response"],
            conversation_id=workflow_result["conversation_id"],
            specialist=workflow_result.get("specialist"),
            tools_used=workflow_result.get("tools_used", []),
            workflow_state="completed",
        )

        # Background task for additional analytics (using existing conversation_analytics table)
        background_tasks.add_task(
            log_enhanced_job_seeker_interaction,
            user_id=current_user.id,
            conversation_id=conversation_id,
            career_stage=workflow_result.get("career_stage"),
            interaction_count=workflow_result.get("interaction_count"),
            confidence_score=workflow_result.get("confidence_score"),
            specialist_used=workflow_result.get("specialist"),
        )

        return response_data

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Enhanced chat error for job seeker {current_user.id}: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Enhanced chat service error: {str(e)}"
        )


@app.get("/api/job-seekers/recommendations")
async def get_job_recommendations(current_user: Profile = Depends(get_job_seeker)):
    """Enhanced AI-powered job recommendations using job seeker authentication workflow"""
    try:
        # Get access token (mock for now, in production this comes from the request)
        access_token = "mock_token_for_authenticated_user"

        logger.info(
            f"🎯 Enhanced job recommendations request from {current_user.email}"
        )

        # Execute the job recommendation workflow
        workflow_result = await run_job_recommendation_workflow(
            user_id=current_user.id, access_token=access_token
        )

        if "error" in workflow_result:
            raise HTTPException(
                status_code=500,
                detail=f"Recommendation workflow error: {workflow_result['error']}",
            )

        return {
            "success": workflow_result["success"],
            "personalized_jobs": workflow_result["recommendations"],
            "total_matches": workflow_result["total_matches"],
            "personalization_score": workflow_result["personalization_score"],
            "user_preferences": workflow_result["user_preferences"],
            "recommendation_metadata": {
                "generated_at": datetime.now().isoformat(),
                "algorithm": "langgraph_job_seeker_workflow",
                "version": "2.1.0",
            },
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting enhanced job recommendations: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/job-seekers/workflow-status")
async def get_job_seeker_workflow_status(
    current_user: Profile = Depends(get_job_seeker),
):
    """Get job seeker workflow status and session information"""
    try:
        # Get workflow instance
        workflow = get_job_seeker_workflow()

        # Get session information from workflow_sessions table
        if supabase:
            session_response = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: supabase.table("workflow_sessions")
                .select("*")
                .eq("user_id", current_user.id)
                .eq("workflow_type", "job_seeker_auth")
                .order("updated_at", desc=True)
                .limit(1)
                .execute(),
            )

            session_data = session_response.data[0] if session_response.data else None
        else:
            session_data = None

        return {
            "user_id": current_user.id,
            "workflow_active": True,
            "session_data": session_data,
            "workflow_capabilities": {
                "ai_chat": True,
                "job_recommendations": True,
                "career_guidance": True,
                "skills_assessment": True,
                "intent_analysis": True,
                "specialist_routing": True,
                "analytics_tracking": True,
            },
            "available_specialists": [
                "Pendo (Supervisor)",
                "Marcus (Veterans)",
                "Liv (International)",
                "Miguel (Environmental Justice)",
                "Jasmine (MA Resources)",
                "Alex (Empathy)",
                "Lauren (Climate Careers)",
                "Mai (Resume Expert)",
            ],
            "database_integration": {
                "uses_existing_schema": True,
                "tables_utilized": [
                    "profiles",
                    "job_seeker_profiles",
                    "workflow_sessions",
                    "conversation_analytics",
                    "conversation_messages",
                    "audit_logs",
                    "job_listings",
                ],
            },
        }
    except Exception as e:
        logger.error(f"Error getting workflow status: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# =============================================================================
# PARTNER ENDPOINTS (Dashboard Only - No Chat)
# =============================================================================


@app.get("/api/partners/profile")
async def get_partner_profile(current_user: Profile = Depends(get_partner)):
    """Get partner specific data"""
    if not supabase:
        raise HTTPException(status_code=503, detail="Database service unavailable")

    try:
        response = (
            supabase.table("partner_profiles")
            .select("*")
            .eq("user_id", current_user.id)
            .execute()
        )
        if response.data:
            return PartnerProfile(**response.data[0])
        return {"message": "Partner profile not found", "user_id": current_user.id}
    except Exception as e:
        logger.error(f"Error fetching partner profile: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/partners/dashboard")
async def get_partner_dashboard(current_user: Profile = Depends(get_partner)):
    """Get partner dashboard data - NO CHAT ACCESS"""
    if not supabase:
        raise HTTPException(status_code=503, detail="Database service unavailable")

    try:
        # Get partner profile
        partner_response = (
            supabase.table("partner_profiles")
            .select("*")
            .eq("user_id", current_user.id)
            .execute()
        )

        if not partner_response.data:
            raise HTTPException(status_code=404, detail="Partner profile not found")

        partner_data = partner_response.data[0]

        # Get job postings for this partner
        jobs_response = (
            supabase.table("job_listings")
            .select("*")
            .eq("partner_id", partner_data["id"])
            .execute()
        )

        # Get applications (if available)
        applications_response = (
            supabase.table("job_applications")
            .select("*")
            .eq("partner_id", partner_data["id"])
            .execute()
            if jobs_response.data
            else None
        )

        dashboard_data = {
            "partner_info": partner_data,
            "active_job_posts": (
                len([job for job in jobs_response.data if job.get("is_active")])
                if jobs_response.data
                else 0
            ),
            "total_job_posts": len(jobs_response.data) if jobs_response.data else 0,
            "total_applications": (
                len(applications_response.data)
                if applications_response and applications_response.data
                else 0
            ),
            "recent_jobs": jobs_response.data[:5] if jobs_response.data else [],
            "analytics": {
                "jobs_this_month": len(jobs_response.data) if jobs_response.data else 0,
                "verified_status": partner_data.get("verified", False),
                "partnership_level": partner_data.get("partnership_level", "standard"),
                "organization_type": partner_data.get("organization_type", "unknown"),
            },
            "features": {
                "can_post_jobs": True,
                "can_view_applications": True,
                "chat_access": False,  # Partners don't get AI chat
                "analytics_access": True,
            },
        }

        return dashboard_data
    except Exception as e:
        logger.error(f"Error getting partner dashboard: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/partners/jobs")
async def get_partner_jobs(current_user: Profile = Depends(get_partner)):
    """Get jobs posted by this partner"""
    if not supabase:
        raise HTTPException(status_code=503, detail="Database service unavailable")

    try:
        # Get partner ID first
        partner_response = (
            supabase.table("partner_profiles")
            .select("id")
            .eq("user_id", current_user.id)
            .execute()
        )

        if not partner_response.data:
            raise HTTPException(status_code=404, detail="Partner profile not found")

        partner_id = partner_response.data[0]["id"]

        # Get jobs for this partner
        jobs_response = (
            supabase.table("job_listings")
            .select("*")
            .eq("partner_id", partner_id)
            .order("created_at", desc=True)
            .execute()
        )

        return {
            "jobs": jobs_response.data or [],
            "total_count": len(jobs_response.data) if jobs_response.data else 0,
        }
    except Exception as e:
        logger.error(f"Error getting partner jobs: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# =============================================================================
# ADMIN ENDPOINTS (Dashboard Only - No Chat)
# =============================================================================


@app.get("/api/admin/profile")
async def get_admin_profile(current_user: Profile = Depends(get_admin)):
    """Get admin specific data"""
    if not supabase:
        raise HTTPException(status_code=503, detail="Database service unavailable")

    try:
        response = (
            supabase.table("admin_profiles")
            .select("*")
            .eq("user_id", current_user.id)
            .execute()
        )
        if response.data:
            return AdminProfile(**response.data[0])
        return {"message": "Admin profile not found", "user_id": current_user.id}
    except Exception as e:
        logger.error(f"Error fetching admin profile: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/admin/dashboard")
async def get_admin_dashboard(current_user: Profile = Depends(get_admin)):
    """Get admin dashboard data - NO CHAT ACCESS"""
    if not supabase:
        raise HTTPException(status_code=503, detail="Database service unavailable")

    try:
        # Get user statistics
        profiles_response = supabase.table("profiles").select("user_type").execute()

        user_stats = {}
        for profile in profiles_response.data:
            user_type = profile["user_type"]
            user_stats[user_type] = user_stats.get(user_type, 0) + 1

        # Get recent activity from audit logs
        audit_response = (
            supabase.table("audit_logs")
            .select("*")
            .order("created_at", desc=True)
            .limit(10)
            .execute()
        )

        dashboard_data = {
            "user_statistics": user_stats,
            "total_users": len(profiles_response.data),
            "breakdown": {
                "job_seekers": user_stats.get("job_seeker", 0),
                "partners": user_stats.get("partner", 0),
                "admins": user_stats.get("admin", 0),
            },
            "system_health": "operational",
            "recent_activity": audit_response.data or [],
            "features": {
                "user_management": True,
                "partner_verification": True,
                "content_moderation": True,
                "system_analytics": True,
                "chat_access": False,  # Admins don't get AI chat
            },
            "ai_system_status": {
                "supervisor_workflow": climate_supervisor_graph is not None,
                "enhanced_intelligence": enhanced_intelligence is not None,
                "job_seeker_chat_active": True,
            },
        }

        return dashboard_data
    except Exception as e:
        logger.error(f"Error getting admin dashboard: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/admin/users")
async def get_all_users(
    current_user: Profile = Depends(get_admin), limit: int = 100, offset: int = 0
):
    """Admin endpoint to get all users with pagination"""
    if not supabase:
        raise HTTPException(status_code=503, detail="Database service unavailable")

    try:
        response = (
            supabase.table("profiles")
            .select("*")
            .range(offset, offset + limit - 1)
            .execute()
        )
        count_response = (
            supabase.table("profiles").select("count", count="exact").execute()
        )

        return {
            "users": response.data or [],
            "total_count": count_response.count,
            "limit": limit,
            "offset": offset,
        }
    except Exception as e:
        logger.error(f"Error getting users list: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# =============================================================================
# HELPER FUNCTIONS
# =============================================================================


async def log_enhanced_job_seeker_interaction(
    user_id: str,
    conversation_id: str,
    career_stage: Optional[str],
    interaction_count: Optional[int],
    confidence_score: Optional[float],
    specialist_used: Optional[str],
):
    """Enhanced background task to log job seeker chat interactions using existing tables"""
    if not supabase:
        return

    try:
        # Log enhanced analytics to conversation_analytics table
        enhanced_analytics = {
            "conversation_id": conversation_id,
            "user_id": user_id,
            "messages_sent": 1,
            "messages_received": 1,
            "total_tokens_consumed": 0,  # This would be calculated in production
            "session_metadata": {
                "workflow_type": "job_seeker_auth",
                "career_stage": career_stage,
                "interaction_count": interaction_count,
                "confidence_score": confidence_score,
                "specialist_used": specialist_used,
                "enhanced_workflow": True,
            },
            "analyzed_at": datetime.now().isoformat(),
            "created_at": datetime.now().isoformat(),
        }

        await asyncio.get_event_loop().run_in_executor(
            None,
            lambda: supabase.table("conversation_analytics")
            .upsert(enhanced_analytics)
            .execute(),
        )

        # Also log to audit_logs for comprehensive tracking
        audit_log = {
            "user_id": user_id,
            "table_name": "job_seeker_interactions",
            "operation": "enhanced_chat_interaction",
            "details": {
                "conversation_id": conversation_id,
                "career_stage": career_stage,
                "specialist_used": specialist_used,
                "workflow_version": "2.1.0",
            },
            "created_at": datetime.now().isoformat(),
        }

        await asyncio.get_event_loop().run_in_executor(
            None, lambda: supabase.table("audit_logs").insert(audit_log).execute()
        )
    except Exception as e:
        logger.error(f"Error logging enhanced job seeker interaction: {e}")


async def _create_job_seeker_state(
    message: str,
    user_id: str,
    conversation_id: str,
    context: Dict[str, Any],
) -> ClimateAgentState:
    """Create LangGraph state for job seeker chat - Legacy function for backward compatibility"""
    from langchain_core.messages import HumanMessage

    # Get job seeker profile for context
    job_seeker_context = {}
    if supabase:
        try:
            profile_response = (
                supabase.table("job_seeker_profiles")
                .select("*")
                .eq("user_id", user_id)
                .execute()
            )
            if profile_response.data:
                profile = profile_response.data[0]
                job_seeker_context = {
                    "user_profile": profile,
                    "skills": profile.get("skills", []),
                    "experience_level": profile.get("experience_level"),
                    "climate_interests": profile.get("climate_interests", []),
                    "preferred_location": profile.get("preferred_location"),
                }
        except Exception as e:
            logger.warning(f"Could not fetch job seeker context: {e}")

    # Create enhanced state
    initial_state = ClimateAgentState(
        messages=[HumanMessage(content=message)],
        user_id=user_id,
        conversation_id=conversation_id,
        user_journey_stage=context.get("journey_stage", "discovery"),
        user_preferences=context.get("user_preferences", job_seeker_context),
        workflow_state="active",
        ready_for_specialist=True,
        # Job seeker specific context
        user_profile=job_seeker_context,
        climate_goals=job_seeker_context.get("climate_interests", []),
        geographic_focus=job_seeker_context.get("preferred_location"),
        # Default empathy state
        empathy_assessment=None,
        emotional_state=None,
        support_level_needed=None,
        empathy_provided=False,
        crisis_intervention_needed=False,
    )

    return initial_state


def _format_chat_response(result: Dict[str, Any], conversation_id: str) -> ChatResponse:
    """Format LangGraph result to ChatResponse - Legacy function for backward compatibility"""
    # Extract response content
    response_content = ""
    if result.get("messages"):
        last_message = result["messages"][-1]
        if hasattr(last_message, "content"):
            response_content = last_message.content
        elif isinstance(last_message, dict):
            response_content = last_message.get("content", "")

    # Extract specialist used
    specialist = None
    if result.get("current_specialist_history"):
        specialist = result["current_specialist_history"][-1]

    return ChatResponse(
        success=True,
        content=response_content
        or "I'm here to help with your climate career journey!",
        conversation_id=conversation_id,
        specialist=specialist,
        tools_used=result.get("tools_used", []),
        workflow_state=result.get("workflow_state", "completed"),
    )


# =============================================================================
# ERROR HANDLERS
# =============================================================================


@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc: HTTPException):
    """Enhanced HTTP exception handler with role context"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "status_code": exc.status_code,
            "request_id": str(uuid.uuid4()),
            "auth_required": exc.status_code in [401, 403],
        },
    )


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler for better error responses"""
    logger.error(f"Unhandled exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": "An unexpected error occurred",
            "request_id": str(uuid.uuid4()),
        },
    )


if __name__ == "__main__":
    import uvicorn

    # Configuration for different environments
    config = {
        "host": "0.0.0.0",
        "port": int(os.environ.get("PORT", 8000)),
        "reload": os.environ.get("ENVIRONMENT", "development") == "development",
        "workers": (
            1 if os.environ.get("ENVIRONMENT", "development") == "development" else 4
        ),
        "access_log": True,
        "log_level": os.environ.get("LOG_LEVEL", "info").lower(),
    }

    logger.info(f"🚀 Starting Climate Economy Assistant API with Authentication")
    logger.info(
        f"🔐 Auth Status: {'Enabled' if supabase and auth_settings.jwt_secret else 'Disabled'}"
    )
    logger.info(f"⚙️ Config: {config}")

    uvicorn.run("main:app", **config)
