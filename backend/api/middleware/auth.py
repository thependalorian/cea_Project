"""
Authentication middleware for the Climate Economy Assistant.
Enhanced with role-based access control and optional authentication.
"""

from fastapi import Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Optional
import structlog
import jwt
from supabase import create_client
import os
import time

logger = structlog.get_logger(__name__)
security = HTTPBearer()

# Initialize Supabase client for JWT verification
supabase_url = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_ANON_KEY") or os.getenv(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
)
supabase = create_client(supabase_url, supabase_key)


async def verify_token(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> str:
    """
    Verify JWT token from Supabase Auth.

    Returns:
        User ID if token is valid

    Raises:
        HTTPException: If token is invalid or missing
    """
    try:
        token = credentials.credentials

        # Verify token with Supabase
        try:
            user = supabase.auth.get_user(token)
            if not user or not user.user:
                raise HTTPException(status_code=401, detail="Invalid or expired token")

            return user.user.id

        except Exception as auth_error:
            logger.error("Token verification failed", error=str(auth_error))
            raise HTTPException(status_code=401, detail="Authentication failed")

    except Exception as e:
        logger.error("Error in token verification", error=str(e))
        raise HTTPException(status_code=401, detail="Authentication required")


# Alternative dependency for optional auth
async def optional_verify_token(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(
        HTTPBearer(auto_error=False)
    ),
) -> Optional[str]:
    """Optional token verification for public endpoints"""
    if not credentials:
        return None

    try:
        return await verify_token(credentials)
    except HTTPException:
        return None


class EnhancedAuthenticationMiddleware(BaseHTTPMiddleware):
    """Enhanced authentication middleware with role-based access"""
    
    def __init__(self, app):
        super().__init__(app)
        self.public_endpoints = {
            "/health", "/", "/docs", "/redoc", "/openapi.json"
        }
        self.optional_auth_endpoints = {
            "/api/v1/jobs/listings",
            "/api/v1/education/programs", 
            "/api/v1/resources/public",
            "/api/v1/resumes/analyze",  # Allow resume upload without auth for development
            "/api/resumes/upload"
        }
        self.admin_endpoints = {
            "/api/v1/admin",
            "/api/v1/audit",
            "/api/v1/analytics/admin"
        }
    
    async def extract_user_id(self, request: Request, required: bool = True) -> Optional[str]:
        """Extract user ID from request headers"""
        try:
            # Get authorization header
            auth_header = request.headers.get("Authorization")
            if not auth_header:
                if required:
                    raise HTTPException(
                        status_code=401,
                        detail={"error": "missing_token", "message": "Authorization header required"}
                    )
                return None
            
            # Extract token
            if not auth_header.startswith("Bearer "):
                if required:
                    raise HTTPException(
                        status_code=401,
                        detail={"error": "invalid_token_format", "message": "Token must be Bearer format"}
                    )
                return None
            
            token = auth_header.split(" ")[1]
            
            # Verify token with Supabase
            try:
                user = supabase.auth.get_user(token)
                if user and user.user:
                    return user.user.id
                elif required:
                    raise HTTPException(
                        status_code=401,
                        detail={"error": "invalid_token", "message": "Invalid or expired token"}
                    )
                return None
            except Exception as e:
                logger.warning("Token verification failed", error=str(e))
                if required:
                    raise HTTPException(
                        status_code=401,
                        detail={"error": "token_verification_failed", "message": "Token verification failed"}
                    )
                return None
                
        except HTTPException:
            raise
        except Exception as e:
            logger.error("Authentication error", error=str(e))
            if required:
                raise HTTPException(
                    status_code=500,
                    detail={"error": "auth_error", "message": "Authentication service error"}
                )
            return None
    
    async def check_admin_access(self, user_id: str) -> bool:
        """Check if user has admin access"""
        try:
            # Query admin_profiles table
            result = supabase.table("admin_profiles").select("*").eq("user_id", user_id).execute()
            return len(result.data) > 0
        except Exception as e:
            logger.error("Admin access check failed", error=str(e), user_id=user_id)
            return False
    
    async def dispatch(self, request: Request, call_next):
        path = request.url.path
        
        # Skip auth for public endpoints
        if any(path.startswith(endpoint) for endpoint in self.public_endpoints):
            return await call_next(request)
        
        # Optional auth for certain endpoints
        if any(path.startswith(endpoint) for endpoint in self.optional_auth_endpoints):
            user_id = await self.extract_user_id(request, required=False)
            request.state.user_id = user_id
            
            # For development, create a fallback user ID if none provided
            if not user_id and os.getenv("ENVIRONMENT") == "development":
                request.state.user_id = f"dev-user-{int(time.time())}"
                logger.info("Using development fallback user ID", path=path)
            
            return await call_next(request)
        
        # Required auth for all other endpoints
        user_id = await self.extract_user_id(request, required=True)
        request.state.user_id = user_id
        
        # Check admin access for admin endpoints
        if any(path.startswith(endpoint) for endpoint in self.admin_endpoints):
            if not await self.check_admin_access(user_id):
                logger.warning(
                    "Admin access denied",
                    user_id=user_id,
                    path=path,
                    request_id=getattr(request.state, 'request_id', 'unknown')
                )
                raise HTTPException(
                    status_code=403,
                    detail={"error": "admin_access_required", "message": "Admin access required"}
                )
        
        return await call_next(request)
