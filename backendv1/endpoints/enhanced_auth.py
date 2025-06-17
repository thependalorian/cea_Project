"""
Enhanced Authentication Endpoints for Climate Economy Assistant V1

This module provides enhanced authentication endpoints with JWT token and refresh token support.
It implements the latest security best practices for 2025.

Location: backendv1/endpoints/enhanced_auth.py
"""

import jwt
import uuid
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional, Union
from enum import Enum

from fastapi import APIRouter, HTTPException, Depends, status, Request, Response, Cookie
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr

from backendv1.config.settings import get_settings
from backendv1.adapters.supabase_adapter import SupabaseAdapter
from backendv1.adapters.auth_adapter import auth_adapter
from backendv1.utils.logger import setup_logger
from backendv1.auth.enhanced_role_guard import enhanced_role_guard
from backendv1.models.user_model import UserProfile, JobSeekerProfile, PartnerProfile, AdminProfile
from backendv1.utils.audit_logger import audit_logger

# Initialize router and dependencies
enhanced_auth_router = APIRouter()
security = HTTPBearer()
logger = setup_logger("enhanced_auth_endpoints")
settings = get_settings()


class UserType(str, Enum):
    """User types for role-based access control"""

    JOB_SEEKER = "job_seeker"
    PARTNER = "partner"
    ADMIN = "admin"
    PUBLIC = "public"


class LoginRequest(BaseModel):
    """Login request body"""

    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """Token response model"""

    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user_id: str
    user_type: UserType


class RefreshRequest(BaseModel):
    """Refresh token request body (optional if using cookies)"""

    refresh_token: Optional[str] = None


class AuthStatus(BaseModel):
    """Authentication status response"""

    authenticated: bool
    user_id: Optional[str] = None
    user_type: Optional[UserType] = None
    email: Optional[str] = None
    permissions: List[str] = []
    session_expires_at: Optional[datetime] = None


class TokenData(BaseModel):
    """JWT token data structure"""

    user_id: str
    email: str
    user_type: UserType
    exp: int
    jti: str
    aud: str = "authenticated"

    @property
    def expires_at(self) -> datetime:
        """Get token expiration as datetime"""
        return datetime.fromtimestamp(self.exp)


def create_access_token(data: Dict[str, Any], expires_delta: timedelta) -> str:
    """
    Create a new JWT access token

    Args:
        data: Token payload data
        expires_delta: Token expiration time

    Returns:
        str: Encoded JWT token
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire.timestamp()})

    # Add JWT ID if not present
    if "jti" not in to_encode:
        to_encode["jti"] = str(uuid.uuid4())

    # Add audience if not present
    if "aud" not in to_encode:
        to_encode["aud"] = "authenticated"

    encoded_jwt = jwt.encode(to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)
    return encoded_jwt


def create_refresh_token(data: Dict[str, Any], expires_delta: timedelta) -> str:
    """
    Create a new JWT refresh token

    Args:
        data: Token payload data
        expires_delta: Token expiration time

    Returns:
        str: Encoded JWT refresh token
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire.timestamp(), "token_type": "refresh"})

    # Add JWT ID if not present
    if "jti" not in to_encode:
        to_encode["jti"] = str(uuid.uuid4())

    encoded_jwt = jwt.encode(
        to_encode,
        settings.jwt_refresh_secret_key or settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
    )
    return encoded_jwt


async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> TokenData:
    """
    Verify JWT token using production AuthAdapter

    Args:
        credentials: JWT credentials from request header

    Returns:
        TokenData: Decoded token information

    Raises:
        HTTPException: If token is invalid or expired
    """
    try:
        # Use production AuthAdapter for token verification
        token_data = await auth_adapter.verify_token(credentials.credentials)

        if not token_data:
            logger.warning(f"Token verification failed from credentials")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication token"
            )

        # Convert to TokenData structure
        return TokenData(
            user_id=token_data["user_id"],
            email=token_data.get("email", ""),
            user_type=token_data.get("user_type", UserType.PUBLIC),
            exp=token_data.get("exp", 0),
            jti=token_data.get("jti", str(uuid.uuid4())),
            aud=token_data.get("aud", "authenticated"),
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Token verification error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication verification failed"
        )


async def get_current_user(token_data: TokenData = Depends(verify_token)) -> UserProfile:
    """
    Get current user profile from database using production AuthAdapter

    Args:
        token_data: Verified token information

    Returns:
        UserProfile: Current user profile

    Raises:
        HTTPException: If user not found or database error
    """
    try:
        # Use production AuthAdapter to get user profile with role detection
        user_profile_data = await auth_adapter._get_user_with_role(token_data.user_id)

        # If no profile was found and we're in development mode, create a test profile
        # This allows testing with custom tokens
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

        return user_profile

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting user profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve user profile",
        )


def get_job_seeker():
    """
    Dependency function that requires job seeker role

    Returns:
        Callable: Dependency function
    """
    return enhanced_role_guard.requires_role(UserType.JOB_SEEKER)


def get_partner():
    """
    Dependency function that requires partner role

    Returns:
        Callable: Dependency function
    """
    return enhanced_role_guard.requires_role(UserType.PARTNER)


def get_admin():
    """
    Dependency function that requires admin role

    Returns:
        Callable: Dependency function
    """
    return enhanced_role_guard.requires_role(UserType.ADMIN)


@enhanced_auth_router.post("/login", response_model=TokenResponse)
async def enhanced_login(
    login_data: LoginRequest, response: Response, request: Request
) -> TokenResponse:
    """Enhanced login with JWT tokens and role-based access"""
    try:
        # Verify credentials using existing auth adapter
        user = await auth_adapter.verify_credentials(login_data.email, login_data.password)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password"
            )

        # Create access token with 30-minute expiration
        access_token_expires = timedelta(minutes=30)
        token_data = {
            "sub": user["user_id"],
            "user_id": user["user_id"],
            "email": user["email"],
            "user_type": user["user_type"],
            "exp": (datetime.utcnow() + access_token_expires).timestamp(),
            "jti": str(uuid.uuid4()),
        }

        access_token = jwt.encode(
            token_data, "your-secret-key", algorithm="HS256"  # Use proper secret from settings
        )

        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            expires_in=int(access_token_expires.total_seconds()),
            user_id=user["user_id"],
            user_type=user["user_type"],
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Enhanced login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Authentication failed"
        )


@enhanced_auth_router.post("/refresh-token", response_model=TokenResponse)
async def refresh_token(
    request: Request,
    response: Response,
    refresh_data: RefreshRequest = None,
    refresh_token: str = Cookie(None),
) -> TokenResponse:
    """
    Refresh access token using refresh token

    Args:
        request: FastAPI request object
        response: FastAPI response object for setting cookies
        refresh_data: Refresh token data (optional)
        refresh_token: Refresh token from cookie (optional)

    Returns:
        TokenResponse: New access token and user info

    Raises:
        HTTPException: If refresh token is invalid or expired
    """
    # Get refresh token from cookie or request body
    token = refresh_token or (refresh_data.refresh_token if refresh_data else None)

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token is required"
        )

    try:
        # Verify refresh token
        token_data = await auth_adapter.verify_refresh_token(token)

        if not token_data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token"
            )

        # Get user profile
        user = await auth_adapter._get_user_with_role(token_data["user_id"])

        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        # Generate new access token
        access_token_expires = timedelta(minutes=30)
        access_token = create_access_token(
            data={
                "sub": user["user_id"],
                "user_id": user["user_id"],
                "email": user["email"],
                "user_type": user["user_type"],
                "jti": str(uuid.uuid4()),
            },
            expires_delta=access_token_expires,
        )

        # Generate new refresh token (token rotation for security)
        refresh_token_expires = timedelta(days=7)
        new_refresh_token = create_refresh_token(
            data={"sub": user["user_id"], "user_id": user["user_id"], "jti": str(uuid.uuid4())},
            expires_delta=refresh_token_expires,
        )

        # Invalidate old refresh token
        await auth_adapter.invalidate_refresh_token(token)

        # Store new refresh token
        await auth_adapter.store_refresh_token(
            user_id=user["user_id"],
            token=new_refresh_token,
            expires_at=datetime.utcnow() + refresh_token_expires,
        )

        # Set new refresh token in cookie
        response.set_cookie(
            key="refresh_token",
            value=new_refresh_token,
            httponly=True,
            secure=not settings.is_development,
            samesite="strict",
            max_age=int(refresh_token_expires.total_seconds()),
        )

        # Log token refresh
        await audit_logger.log_auth_event(
            event_type="token_refresh", user_id=user["user_id"], request=request
        )

        # Return new access token
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            expires_in=int(access_token_expires.total_seconds()),
            user_id=user["user_id"],
            user_type=user["user_type"],
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Token refresh error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Token refresh failed"
        )


@enhanced_auth_router.post("/logout")
async def logout(
    response: Response,
    request: Request,
    user: Dict[str, Any] = Depends(enhanced_role_guard.requires_auth()),
    refresh_token: str = Cookie(None),
) -> Dict[str, str]:
    """
    Logout user and invalidate tokens

    Args:
        response: FastAPI response object for clearing cookies
        request: FastAPI request object
        user: Current authenticated user
        refresh_token: Refresh token from cookie

    Returns:
        Dict[str, str]: Success message
    """
    try:
        # Invalidate refresh token if present
        if refresh_token:
            await auth_adapter.invalidate_refresh_token(refresh_token)

        # Clear refresh token cookie
        response.delete_cookie(
            key="refresh_token",
            secure=not settings.is_development,
            httponly=True,
            samesite="strict",
        )

        # Log logout
        await audit_logger.log_auth_event(
            event_type="logout", user_id=user["user_id"], request=request
        )

        return {"message": "Successfully logged out"}

    except Exception as e:
        logger.error(f"Logout error: {e}")
        # Don't raise exception on logout errors, just return success
        return {"message": "Successfully logged out"}


@enhanced_auth_router.get("/status", response_model=AuthStatus)
async def get_enhanced_auth_status(
    user: Dict[str, Any] = Depends(enhanced_role_guard.requires_auth()),
) -> AuthStatus:
    """Get enhanced authentication status with permissions"""
    try:
        # Get user permissions based on role
        permissions = []
        user_role = user.get("user_type", "public")

        # Add permissions based on role hierarchy
        for role in enhanced_role_guard.role_hierarchy.get(user_role, []):
            permissions.extend(enhanced_role_guard.role_permissions.get(role, []))

        # Remove duplicates
        permissions = list(set(permissions))

        return AuthStatus(
            authenticated=True,
            user_id=user["user_id"],
            user_type=user["user_type"],
            email=user.get("email"),
            permissions=permissions,
        )

    except Exception as e:
        logger.error(f"Error getting enhanced auth status: {e}")
        return AuthStatus(authenticated=False)


@enhanced_auth_router.get("/me", response_model=UserProfile)
async def get_me(current_user: UserProfile = Depends(get_current_user)) -> UserProfile:
    """
    Get current user profile

    Args:
        current_user: Current authenticated user profile

    Returns:
        UserProfile: User profile
    """
    return current_user


@enhanced_auth_router.get("/job-seekers/profile")
async def get_job_seeker_profile(
    current_user: Dict[str, Any] = Depends(get_job_seeker()),
) -> Dict[str, Any]:
    """
    Get job seeker profile with enhanced role protection

    Args:
        current_user: Current authenticated job seeker

    Returns:
        Dict[str, Any]: Job seeker profile
    """
    try:
        profile = await auth_adapter.get_job_seeker_profile(current_user["user_id"])

        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Job seeker profile not found"
            )

        return profile

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting job seeker profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve job seeker profile",
        )


@enhanced_auth_router.get("/partners/profile")
async def get_partner_profile(
    current_user: Dict[str, Any] = Depends(get_partner()),
) -> Dict[str, Any]:
    """
    Get partner profile with enhanced role protection

    Args:
        current_user: Current authenticated partner

    Returns:
        Dict[str, Any]: Partner profile
    """
    try:
        profile = await auth_adapter.get_partner_profile(current_user["user_id"])

        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Partner profile not found"
            )

        return profile

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting partner profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve partner profile",
        )


@enhanced_auth_router.get("/admin/profile")
async def get_admin_profile(current_user: Dict[str, Any] = Depends(get_admin())) -> Dict[str, Any]:
    """
    Get admin profile with enhanced role protection

    Args:
        current_user: Current authenticated admin

    Returns:
        Dict[str, Any]: Admin profile
    """
    try:
        profile = await auth_adapter.get_admin_profile(current_user["user_id"])

        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Admin profile not found"
            )

        return profile

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting admin profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve admin profile",
        )
