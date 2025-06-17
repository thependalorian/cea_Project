"""
Authentication Endpoints for Climate Economy Assistant V1

Following rule #16: Protect exposed endpoints with API keys and authentication
Following rule #17: Secure database access with proper authentication
Following rule #8: Use Supabase with SSR for secure data access

This module handles all authentication and authorization endpoints with Pendo integration.
Location: backendv1/endpoints/auth.py
"""

import jwt
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from enum import Enum

from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel

from backendv1.config.settings import get_settings
from backendv1.adapters.supabase_adapter import SupabaseAdapter
from backendv1.adapters.auth_adapter import AuthAdapter
from backendv1.workflows.auth_workflow import AuthWorkflow
from backendv1.utils.logger import setup_logger
from backendv1.models.user_model import UserProfile, JobSeekerProfile, PartnerProfile, AdminProfile

# Initialize router and dependencies
auth_router = APIRouter()
security = HTTPBearer()
logger = setup_logger("auth_endpoints")
settings = get_settings()

# Initialize updated auth workflow and adapter
auth_workflow = AuthWorkflow()
auth_adapter = AuthAdapter()

# Import Pendo workflow for session tracking
try:
    from backendv1.workflows.pendo_supervisor import create_pendo_supervisor_workflow

    pendo_workflow = create_pendo_supervisor_workflow()
    PENDO_AVAILABLE = True
    logger.info("✅ Pendo supervisor integrated with authentication")
except Exception as e:
    logger.warning(f"⚠️ Pendo supervisor not available in auth: {e}")
    pendo_workflow = None
    PENDO_AVAILABLE = False


class UserType(str, Enum):
    """User types for role-based access control"""

    JOB_SEEKER = "job_seeker"
    PARTNER = "partner"
    ADMIN = "admin"


class AuthStatus(BaseModel):
    """Authentication status response"""

    authenticated: bool
    user_id: Optional[str] = None
    user_type: Optional[UserType] = None
    email: Optional[str] = None
    permissions: List[str] = []
    session_expires_at: Optional[datetime] = None
    pendo_supervisor: bool = False
    pendo_session_id: Optional[str] = None


class TokenData(BaseModel):
    """JWT token data structure"""

    user_id: str
    email: str
    user_type: UserType
    exp: int
    aud: str = "authenticated"

    @property
    def expires_at(self) -> datetime:
        """Get token expiration as datetime"""
        return datetime.fromtimestamp(self.exp)


async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> TokenData:
    """
    Verify JWT token using updated AuthWorkflow

    Following rule #16: Secure endpoint protection with JWT verification
    Following rule #15: Include comprehensive error handling

    Args:
        credentials: JWT credentials from request header

    Returns:
        TokenData: Decoded token information

    Raises:
        HTTPException: If token is invalid or expired
    """
    try:
        # Use updated AuthWorkflow for token verification
        validation_result = await auth_workflow.validate_token(credentials.credentials)

        if not validation_result.get("valid"):
            logger.warning(f"Token validation failed: {validation_result.get('error')}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=validation_result.get("error", "Invalid authentication token"),
            )

        # Convert to TokenData structure
        return TokenData(
            user_id=validation_result["user_id"],
            email=validation_result.get("email", ""),
            user_type=validation_result.get("user_type", "job_seeker"),
            exp=int(datetime.now().timestamp()) + 86400,  # Default 24h expiry
            aud="authenticated",
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Token verification error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication verification failed",
        )


async def get_current_user(token_data: TokenData = Depends(verify_token)) -> UserProfile:
    """
    Get current user profile from database using updated AuthWorkflow

    Following rule #8: Use Supabase with SSR for secure data access
    Following rule #17: Secure database access patterns

    Args:
        token_data: Verified token information

    Returns:
        UserProfile: Current user profile

    Raises:
        HTTPException: If user not found or database error
    """
    try:
        # Use updated AuthWorkflow to get user profile with role detection
        user_profile_data = await auth_workflow._get_user_profile(token_data.user_id)

        # If no profile was found and we're in development mode, create a test profile
        # This allows testing with custom tokens
        from backendv1.config.settings import get_settings

        settings = get_settings()

        if not user_profile_data and settings.is_development:
            logger.info(
                f"🧪 Creating test profile for user {token_data.user_id} in development mode"
            )
            user_profile_data = {
                "id": token_data.user_id,
                "user_id": token_data.user_id,
                "user_type": token_data.user_type,
                "email": token_data.email,
                "full_name": "Test User",
                "profile_completed": False,
                "is_test_profile": True,
                "base_profile": {},  # Add required base_profile field to fix Pydantic validation
            }

        if not user_profile_data:
            logger.error(f"User profile not found: {token_data.user_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User profile not found for ID: {token_data.user_id}. This token may be valid but the user doesn't exist in the database.",
            )

        # Create UserProfile instance from the data
        user_profile = UserProfile(
            id=user_profile_data.get("id", token_data.user_id),
            user_id=user_profile_data.get("user_id", token_data.user_id),
            user_type=user_profile_data.get("user_type", "job_seeker"),
            email=token_data.email,
            full_name=user_profile_data.get("full_name"),
            profile_completed=user_profile_data.get("profile_completed", False),
            created_at=user_profile_data.get("created_at"),
            updated_at=user_profile_data.get("updated_at"),
        )

        # Skip session creation for test profiles
        is_test_profile = user_profile_data.get("is_test_profile", False)

        # Create/update session using production AuthAdapter (skip for test profiles)
        if not is_test_profile:
            try:
                session_id = await auth_adapter.create_session(
                    user_id=token_data.user_id,
                    user_data={
                        "user_type": user_profile.user_type,
                        "email": token_data.email,
                        "profile_completed": user_profile.profile_completed,
                    },
                )
                if session_id:
                    logger.debug(f"🔐 Session created/updated: {session_id}")
            except Exception as session_error:
                logger.warning(f"Session creation failed (non-critical): {session_error}")
        else:
            logger.debug(f"🧪 Skipping session creation for test profile: {token_data.user_id}")

        # Initialize Pendo session tracking if available and not a test profile
        if not is_test_profile and PENDO_AVAILABLE and pendo_workflow:
            try:
                # Create a default conversation ID for session tracking
                session_conversation_id = (
                    f"session_{token_data.user_id}_{datetime.utcnow().strftime('%Y%m%d')}"
                )

                # Track user session in Pendo
                await pendo_workflow._track_session(
                    user_id=token_data.user_id,
                    conversation_id=session_conversation_id,
                    message="User authenticated",
                )

                logger.info(f"🧠 Pendo session initialized for user {token_data.user_id}")

            except Exception as e:
                logger.warning(f"Failed to initialize Pendo session: {e}")

        return user_profile

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting user profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve user profile",
        )


def require_user_type(allowed_types: List[UserType]):
    """
    Dependency factory for role-based access control

    Following rule #16: Protect exposed endpoints with role-based access

    Args:
        allowed_types: List of allowed user types

    Returns:
        Dependency function for FastAPI
    """

    def dependency(current_user: UserProfile = Depends(get_current_user)):
        if current_user.user_type not in allowed_types:
            logger.warning(
                f"Access denied for user {current_user.id} with type {current_user.user_type}"
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required user types: {allowed_types}",
            )
        return current_user

    return dependency


# Convenience dependencies for specific user types
async def get_job_seeker(current_user: UserProfile = Depends(get_current_user)) -> UserProfile:
    """Get current user ensuring they are a job seeker"""
    if current_user.user_type != UserType.JOB_SEEKER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Job seeker access required"
        )
    return current_user


async def get_partner(current_user: UserProfile = Depends(get_current_user)) -> UserProfile:
    """Get current user ensuring they are a partner"""
    if current_user.user_type != UserType.PARTNER:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Partner access required")
    return current_user


async def get_admin(current_user: UserProfile = Depends(get_current_user)) -> UserProfile:
    """Get current user ensuring they are an admin"""
    if current_user.user_type != UserType.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user


@auth_router.get("/status")
async def get_auth_status(current_user: UserProfile = Depends(get_current_user)) -> AuthStatus:
    """
    Get authentication status

    Following rule #16: Protect exposed endpoints with API keys and authentication

    Args:
        current_user: Current user profile from token

    Returns:
        AuthStatus: Authentication status response
    """
    try:
        # Get user permissions
        permissions = await _get_user_permissions(current_user)

        # Get expiration from token if available
        token_data = getattr(current_user, "token_data", None)
        session_expires_at = None

        # Extract expiration time from token data if available
        if token_data and hasattr(token_data, "expires_at"):
            session_expires_at = token_data.expires_at

        # Check if Pendo integration is available
        pendo_session_id = None
        if PENDO_AVAILABLE and pendo_workflow:
            try:
                # Get existing session or create new one
                session_id = f"session_{current_user.id}_{datetime.utcnow().strftime('%Y%m%d')}"
                pendo_session_id = session_id
            except Exception as e:
                logger.error(f"Error getting Pendo session: {e}")

        return AuthStatus(
            authenticated=True,
            user_id=current_user.id,
            user_type=current_user.user_type,
            email=current_user.email,
            permissions=permissions,
            session_expires_at=session_expires_at,
            pendo_supervisor=PENDO_AVAILABLE,
            pendo_session_id=pendo_session_id,
        )

    except Exception as e:
        logger.error(f"Error getting auth status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get authentication status",
        )


@auth_router.get("/me")
async def get_me(current_user: UserProfile = Depends(get_current_user)) -> UserProfile:
    """
    Get current user profile information

    Following rule #17: Secure database access with proper authentication
    """
    try:
        logger.info(f"👤 Profile request for user {current_user.id}")
        return current_user
    except Exception as e:
        logger.error(f"Error getting user profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve user profile",
        )


@auth_router.get("/permissions")
async def get_user_permissions(
    current_user: UserProfile = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Get user permissions and capabilities with Pendo integration

    Following rule #6: Asynchronous data handling for performance
    """
    try:
        permissions = await _get_user_permissions(current_user)
        capabilities = await _get_user_capabilities(current_user)

        # Add Pendo-specific capabilities
        pendo_capabilities = {}
        if PENDO_AVAILABLE and pendo_workflow:
            try:
                session_stats = pendo_workflow.get_session_stats(current_user.id)
                pendo_capabilities = {
                    "pendo_supervisor_access": True,
                    "intelligent_routing": True,
                    "specialist_delegation": True,
                    "conversation_analysis": True,
                    "session_tracking": True,
                    "total_sessions": session_stats.get("total_sessions", 0),
                    "specialists_used": session_stats.get("specialists_used", []),
                }
            except Exception as e:
                logger.warning(f"Failed to get Pendo capabilities: {e}")
                pendo_capabilities = {"pendo_supervisor_access": False}

        return {
            "user_id": current_user.id,
            "user_type": current_user.user_type,
            "permissions": permissions,
            "capabilities": {**capabilities, **pendo_capabilities},
            "pendo_integration": PENDO_AVAILABLE,
        }

    except Exception as e:
        logger.error(f"Error getting user permissions: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve user permissions",
        )


async def _get_user_permissions(user: UserProfile) -> List[str]:
    """Get user permissions based on user type"""
    base_permissions = ["chat:read", "chat:write", "profile:read"]

    if user.user_type == UserType.JOB_SEEKER:
        return base_permissions + [
            "resume:upload",
            "resume:analyze",
            "jobs:search",
            "applications:track",
        ]
    elif user.user_type == UserType.PARTNER:
        return base_permissions + ["jobs:post", "candidates:view", "analytics:view"]
    elif user.user_type == UserType.ADMIN:
        return base_permissions + ["users:manage", "system:admin", "analytics:full", "pendo:admin"]
    else:
        return base_permissions


async def _get_user_capabilities(user: UserProfile) -> Dict[str, bool]:
    """Get user capabilities based on profile and user type"""
    base_capabilities = {
        "can_chat": True,
        "can_upload_resume": user.user_type == UserType.JOB_SEEKER,
        "can_search_jobs": user.user_type in [UserType.JOB_SEEKER, UserType.PARTNER],
        "can_post_jobs": user.user_type == UserType.PARTNER,
        "can_admin": user.user_type == UserType.ADMIN,
        "has_profile": True,
    }

    # Add specialist access capabilities
    specialist_capabilities = {
        "can_access_lauren": True,  # Climate specialist
        "can_access_mai": True,  # Resume specialist
        "can_access_marcus": True,  # Veterans specialist
        "can_access_miguel": True,  # Environmental justice specialist
        "can_access_liv": True,  # International specialist
        "can_access_jasmine": True,  # Youth & early career specialist
        "can_access_alex": True,  # Empathy specialist
    }

    return {**base_capabilities, **specialist_capabilities}


@auth_router.post("/logout")
async def logout_user(current_user: UserProfile = Depends(get_current_user)) -> Dict[str, str]:
    """
    Logout user and clear Pendo session

    Following rule #17: Secure session management
    """
    try:
        logger.info(f"👋 User {current_user.id} logging out")

        # Clear Pendo session if available
        if PENDO_AVAILABLE and pendo_workflow:
            try:
                # Clear user sessions from Pendo
                user_sessions = {
                    k: v
                    for k, v in pendo_workflow.session_tracking.items()
                    if k.startswith(f"{current_user.id}_")
                }

                for session_key in user_sessions.keys():
                    if session_key in pendo_workflow.session_tracking:
                        del pendo_workflow.session_tracking[session_key]

                logger.info(
                    f"🧠 Cleared {len(user_sessions)} Pendo sessions for user {current_user.id}"
                )

            except Exception as e:
                logger.warning(f"Failed to clear Pendo sessions: {e}")

        return {
            "message": "Successfully logged out",
            "user_id": current_user.id,
            "pendo_sessions_cleared": PENDO_AVAILABLE,
        }

    except Exception as e:
        logger.error(f"Error during logout: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Logout failed"
        )


@auth_router.get("/pendo/status")
async def get_pendo_status(current_user: UserProfile = Depends(get_current_user)) -> Dict[str, Any]:
    """
    Get Pendo supervisor status for current user

    Following rule #10: Include detailed error checks and logging
    """
    try:
        if not PENDO_AVAILABLE or not pendo_workflow:
            return {
                "status": "unavailable",
                "pendo_supervisor": False,
                "message": "Pendo supervisor not initialized",
            }

        # Get Pendo workflow status
        try:
            workflow_status = await pendo_workflow.get_status()
            return {
                "status": "active",
                "pendo_supervisor": True,
                "user_id": current_user.id,
                "workflow_status": workflow_status,
                "message": "Pendo supervisor operational",
            }
        except Exception as e:
            return {
                "status": "error",
                "pendo_supervisor": False,
                "message": f"Error getting Pendo status: {str(e)}",
            }

    except Exception as e:
        logger.error(f"Error getting Pendo status: {e}")
        return {
            "status": "error",
            "pendo_supervisor": False,
            "message": "Failed to get Pendo status",
        }


# ============================================================================
# ROLE-BASED DASHBOARD ENDPOINTS (Critical for Frontend Integration)
# ============================================================================


@auth_router.get("/job-seekers/profile")
async def get_job_seeker_profile(
    current_user: UserProfile = Depends(get_job_seeker),
) -> Dict[str, Any]:
    """
    Get job seeker profile data for dashboard
    Following rule #17: Secure database access patterns
    """
    try:
        supabase_adapter = SupabaseAdapter()

        # Get detailed job seeker profile
        profile_result = await supabase_adapter.query_database(
            "job_seeker_profiles", filters={"id": current_user.id}
        )

        if not profile_result["success"] or not profile_result["data"]:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Job seeker profile not found"
            )

        profile = profile_result["data"][0]

        # Get user preferences
        preferences_result = await supabase_adapter.query_database(
            "user_preferences", filters={"user_id": current_user.id}
        )

        # Get recent conversations
        conversations_result = await supabase_adapter.query_database(
            "conversations",
            filters={"user_id": current_user.id},
            order_column="updated_at",
            order_desc=True,
            limit=5,
        )

        return {
            "profile": profile,
            "preferences": (
                preferences_result["data"][0]
                if preferences_result["success"] and preferences_result["data"]
                else None
            ),
            "recent_conversations": (
                conversations_result["data"] if conversations_result["success"] else []
            ),
            "user_type": "job_seeker",
            "dashboard_permissions": await auth_adapter.get_user_permissions(
                current_user.id, "job_seeker"
            ),
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting job seeker profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get job seeker profile",
        )


@auth_router.get("/partners/profile")
async def get_partner_profile(current_user: UserProfile = Depends(get_partner)) -> Dict[str, Any]:
    """
    Get partner profile data for dashboard
    Following rule #17: Secure database access patterns
    """
    try:
        supabase_adapter = SupabaseAdapter()

        # Get detailed partner profile
        profile_result = await supabase_adapter.query_database(
            "partner_profiles", filters={"id": current_user.id}
        )

        if not profile_result["success"] or not profile_result["data"]:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Partner profile not found"
            )

        profile = profile_result["data"][0]

        # Get partnership analytics (if available)
        analytics_result = await supabase_adapter.query_database(
            "partnership_analytics",
            filters={"partner_id": current_user.id},
            order_column="created_at",
            order_desc=True,
            limit=10,
        )

        return {
            "profile": profile,
            "analytics": analytics_result["data"] if analytics_result["success"] else [],
            "user_type": "partner",
            "dashboard_permissions": await auth_adapter.get_user_permissions(
                current_user.id, "partner"
            ),
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting partner profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get partner profile",
        )


@auth_router.get("/admin/profile")
async def get_admin_profile(current_user: UserProfile = Depends(get_admin)) -> Dict[str, Any]:
    """
    Get admin profile data for dashboard
    Following rule #17: Secure database access patterns
    """
    try:
        supabase_adapter = SupabaseAdapter()

        # Get detailed admin profile
        profile_result = await supabase_adapter.query_database(
            "admin_profiles", filters={"user_id": current_user.id}
        )

        if not profile_result["success"] or not profile_result["data"]:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Admin profile not found"
            )

        profile = profile_result["data"][0]

        # Get system stats for admin dashboard
        try:
            # Get user counts by type
            users_stats = {"job_seekers": 0, "partners": 0, "admins": 0, "total_conversations": 0}

            # Count job seekers
            js_result = await supabase_adapter.query_database(
                "job_seeker_profiles", select="count(*)"
            )
            if js_result["success"]:
                users_stats["job_seekers"] = len(js_result["data"])

            # Count partners
            partner_result = await supabase_adapter.query_database(
                "partner_profiles", select="count(*)"
            )
            if partner_result["success"]:
                users_stats["partners"] = len(partner_result["data"])

            # Count admins
            admin_result = await supabase_adapter.query_database(
                "admin_profiles", select="count(*)"
            )
            if admin_result["success"]:
                users_stats["admins"] = len(admin_result["data"])

            # Count conversations
            conv_result = await supabase_adapter.query_database("conversations", select="count(*)")
            if conv_result["success"]:
                users_stats["total_conversations"] = len(conv_result["data"])

        except Exception as stats_error:
            logger.warning(f"Error getting admin stats: {stats_error}")
            users_stats = {"error": "Stats unavailable"}

        return {
            "profile": profile,
            "system_stats": users_stats,
            "user_type": "admin",
            "dashboard_permissions": await auth_adapter.get_user_permissions(
                current_user.id, "admin"
            ),
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting admin profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to get admin profile"
        )


@auth_router.get("/dashboard")
async def get_dashboard_data(
    current_user: UserProfile = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Get dashboard data based on user role
    Following rule #17: Secure database access patterns
    """
    try:
        if current_user.user_type == "job_seeker":
            return await get_job_seeker_profile(current_user)
        elif current_user.user_type == "partner":
            return await get_partner_profile(current_user)
        elif current_user.user_type == "admin":
            return await get_admin_profile(current_user)
        else:
            # Default fallback
            return {
                "profile": {
                    "id": current_user.id,
                    "user_type": current_user.user_type,
                    "email": current_user.email,
                    "full_name": current_user.full_name,
                },
                "user_type": current_user.user_type,
                "dashboard_permissions": ["chat", "profile_access"],
            }

    except Exception as e:
        logger.error(f"Error getting dashboard data: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to get dashboard data"
        )


@auth_router.get("/debug-token", include_in_schema=False)
async def debug_token(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> Dict[str, Any]:
    """
    Debug endpoint to verify token parsing and display token data
    Only available in development mode for debugging

    Args:
        credentials: JWT credentials from request header

    Returns:
        Dict[str, Any]: Token debugging information
    """
    from backendv1.config.settings import get_settings

    settings = get_settings()

    # Only allow in development mode for security
    if not settings.is_development:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Endpoint not found")

    token = credentials.credentials
    debug_info = {"token_analysis": {}, "verify_attempts": []}

    # Get basic token info
    if token.startswith("Bearer "):
        token = token[7:]
        debug_info["token_analysis"]["bearer_prefix"] = True
    else:
        debug_info["token_analysis"]["bearer_prefix"] = False

    debug_info["token_analysis"]["token_length"] = len(token)
    debug_info["token_analysis"]["token_preview"] = f"{token[:10]}...{token[-10:]}"

    # Try to decode parts without verification
    try:
        import base64
        import json

        parts = token.split(".")
        debug_info["token_analysis"]["parts"] = len(parts)

        if len(parts) == 3:
            # Decode header
            header_bytes = base64.urlsafe_b64decode(parts[0] + "=" * (4 - len(parts[0]) % 4))
            header = json.loads(header_bytes.decode("utf-8"))
            debug_info["token_analysis"]["header"] = header

            # Decode payload without verification
            payload_bytes = base64.urlsafe_b64decode(parts[1] + "=" * (4 - len(parts[1]) % 4))
            payload = json.loads(payload_bytes.decode("utf-8"))

            # Only include non-sensitive fields for security
            safe_payload = {}
            for key in ["exp", "iat", "aud", "iss", "role"]:
                if key in payload:
                    safe_payload[key] = payload[key]

            if "sub" in payload:
                safe_payload["sub"] = (
                    f"{payload['sub'][:5]}...{payload['sub'][-5:]}"
                    if len(payload["sub"]) > 10
                    else payload["sub"]
                )

            if "email" in payload:
                parts = payload["email"].split("@")
                if len(parts) == 2:
                    safe_payload["email"] = f"{parts[0][:3]}...@{parts[1]}"

            debug_info["token_analysis"]["payload"] = safe_payload
    except Exception as e:
        debug_info["token_analysis"]["decode_error"] = str(e)

    # Try various decode options
    secret = auth_adapter.jwt_secret
    debug_info["jwt_secret_preview"] = (
        f"{secret[:5]}...{secret[-5:]}" if len(secret) > 10 else secret
    )

    # Test with audience
    try:
        import jwt

        payload = jwt.decode(
            token,
            secret,
            algorithms=["HS256"],
            audience="authenticated",
            options={
                "verify_exp": True,
                "verify_iat": False,  # Disable iat validation to fix time sync issues
            },
        )
        debug_info["verify_attempts"].append(
            {"settings": "With audience='authenticated', iat validation disabled", "success": True}
        )
    except Exception as e:
        debug_info["verify_attempts"].append(
            {
                "settings": "With audience='authenticated', iat validation disabled",
                "success": False,
                "error": str(e),
                "error_type": type(e).__name__,
            }
        )

    # Test without audience
    try:
        import jwt

        payload = jwt.decode(
            token,
            secret,
            algorithms=["HS256"],
            options={
                "verify_exp": True,
                "verify_iat": False,  # Disable iat validation to fix time sync issues
            },
        )
        debug_info["verify_attempts"].append(
            {"settings": "Without audience validation, iat validation disabled", "success": True}
        )
    except Exception as e:
        debug_info["verify_attempts"].append(
            {
                "settings": "Without audience validation, iat validation disabled",
                "success": False,
                "error": str(e),
                "error_type": type(e).__name__,
            }
        )

    # Use the auth adapter to verify
    try:
        token_data = await auth_adapter.verify_token(token)
        if token_data:
            debug_info["auth_adapter_verification"] = {
                "success": True,
                "user_id": token_data.get("user_id"),
                "user_type": token_data.get("user_type"),
                "aud": token_data.get("aud"),
            }
        else:
            debug_info["auth_adapter_verification"] = {
                "success": False,
                "error": "Token verification failed",
            }
    except Exception as e:
        debug_info["auth_adapter_verification"] = {
            "success": False,
            "error": str(e),
            "error_type": type(e).__name__,
        }

    return debug_info


@auth_router.get("/test-auth", include_in_schema=False)
async def test_auth(token_data: TokenData = Depends(verify_token)) -> Dict[str, Any]:
    """
    Simple authentication test endpoint to verify tokens
    Only available in development mode

    Args:
        token_data: Verified token information

    Returns:
        Dict[str, Any]: Basic user information for testing
    """
    from backendv1.config.settings import get_settings

    settings = get_settings()

    # Only allow in development mode for security
    if not settings.is_development:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Endpoint not found")

    # Return basic user info without any session creation or DB access
    return {
        "success": True,
        "user_id": token_data.user_id,
        "email": token_data.email,
        "user_type": token_data.user_type,
        "timestamp": datetime.utcnow().isoformat(),
        "message": "Authentication successful",
    }


# Export dependencies for use in other routers
__all__ = [
    "auth_router",
    "get_current_user",
    "get_job_seeker",
    "get_partner",
    "get_admin",
    "require_user_type",
    "UserType",
]
