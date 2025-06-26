"""
Authentication routes for the Climate Economy Assistant API.
"""

from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Dict, Any, Optional
import jwt
import os
from datetime import datetime, timedelta
import structlog
import uuid

from backend.database.supabase_client import supabase
from backend.api.middleware.auth import verify_token
from backend.api.models.auth import LoginRequest, SignupRequest, TokenResponse

router = APIRouter()
security = HTTPBearer()
logger = structlog.get_logger(__name__)


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    name: str
    organization_name: Optional[str] = None
    organization_type: Optional[str] = None


@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest) -> Dict[str, Any]:
    """Login user and return access token."""
    try:
        # Authenticate with Supabase
        result = await supabase.auth.sign_in_with_password(
            {"email": request.email, "password": request.password}
        )

        if not result.user:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        return {
            "access_token": result.session.access_token,
            "token_type": "bearer",
            "expires_in": result.session.expires_in,
        }

    except Exception as e:
        logger.error(f"Login failed: {e}")
        raise HTTPException(status_code=401, detail="Authentication failed")


@router.post("/register", response_model=TokenResponse)
async def register(register_data: RegisterRequest):
    """Register new user with Supabase"""
    try:
        # Register user with Supabase Auth
        auth_response = supabase.client.auth.sign_up(
            {
                "email": register_data.email,
                "password": register_data.password,
                "options": {"data": {"full_name": register_data.name}},
            }
        )

        if not auth_response.user:
            raise HTTPException(status_code=400, detail="Registration failed")

        try:
            # Create profile
            profile_data = {
                "user_id": auth_response.user.id,
                "full_name": register_data.name,
                "email": register_data.email,
                "organization_name": register_data.organization_name,
                "organization_type": register_data.organization_type,
            }

            profile_response = (
                supabase.client.table("user_profiles").insert(profile_data).execute()
            )

            if not profile_response.data:
                # If profile creation fails, delete the auth user
                supabase.client.auth.admin.delete_user(auth_response.user.id)
                raise HTTPException(
                    status_code=400, detail="Failed to create user profile"
                )

        except Exception as e:
            # If profile creation fails, delete the auth user
            supabase.client.auth.admin.delete_user(auth_response.user.id)
            logger.error("Failed to create user profile", error=str(e))
            raise HTTPException(status_code=400, detail="Failed to create user profile")

        # Create JWT token
        payload = {
            "user_id": auth_response.user.id,
            "email": auth_response.user.email,
            "exp": datetime.utcnow() + timedelta(hours=24),
        }

        token = jwt.encode(
            payload,
            os.getenv("SUPABASE_JWT_SECRET", "your-secret-key"),
            algorithm="HS256",
        )

        return TokenResponse(
            access_token=token,
            expires_in=86400,
            user={
                "id": auth_response.user.id,
                "email": auth_response.user.email,
                "name": register_data.name,
                "created_at": auth_response.user.created_at,
            },
        )

    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error("Registration failed", error=str(e))
        raise HTTPException(status_code=400, detail="Registration failed")


@router.post("/refresh")
async def refresh_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Refresh JWT token"""
    try:
        # Decode current token
        payload = jwt.decode(
            credentials.credentials,
            os.getenv("SUPABASE_JWT_SECRET", "your-secret-key"),
            algorithms=["HS256"],
        )

        # Create new token
        new_payload = {
            "user_id": payload["user_id"],
            "email": payload["email"],
            "exp": datetime.utcnow() + timedelta(hours=24),
        }

        new_token = jwt.encode(
            new_payload,
            os.getenv("SUPABASE_JWT_SECRET", "your-secret-key"),
            algorithm="HS256",
        )

        return {"access_token": new_token, "token_type": "bearer", "expires_in": 86400}

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


@router.get("/me")
async def get_current_user_info(user_id: str = Depends(verify_token)) -> Dict[str, Any]:
    """Get current user information."""
    try:
        result = (
            await supabase.table("users")
            .select("*")
            .eq("id", user_id)
            .single()
            .execute()
        )

        if not result.data:
            raise HTTPException(status_code=404, detail="User not found")

        return result.data

    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error getting user info: {e}")
        raise HTTPException(status_code=500, detail="Failed to get user information")


@router.post("/logout")
async def logout(user_id: str = Depends(verify_token)) -> Dict[str, Any]:
    """Logout current user."""
    try:
        await supabase.auth.sign_out()
        return {"message": "Successfully logged out"}
    except Exception as e:
        logger.error(f"Logout failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to logout")
