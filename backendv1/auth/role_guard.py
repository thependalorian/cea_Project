"""
Role Guard - Role-Based Access Control Middleware

This module provides role-based access control (RBAC) middleware for
protecting API endpoints based on user roles and permissions.

Location: backendv1/auth/role_guard.py
"""

from typing import List, Optional, Callable, Dict, Any, Union, Set
from functools import wraps
from enum import Enum

from fastapi import Request, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from backendv1.adapters.auth_adapter import auth_adapter
from backendv1.utils.audit_logger import audit_logger
from backendv1.utils.logger import setup_logger

logger = setup_logger("role_guard")
security = HTTPBearer()


class UserRole(str, Enum):
    """
    User role enumeration for role-based access control

    Following rule #13: Use TypeScript (but this is Python, so using Enum)
    """

    ADMIN = "admin"
    PARTNER = "partner"
    JOB_SEEKER = "job_seeker"
    PUBLIC = "public"


class Permission(str, Enum):
    """
    Permission enumeration for fine-grained access control
    """

    READ = "read"
    WRITE = "write"
    DELETE = "delete"
    ADMIN = "admin"
    MANAGE_USERS = "manage_users"
    MANAGE_CONTENT = "manage_content"
    MANAGE_PARTNERS = "manage_partners"
    MANAGE_SYSTEM = "manage_system"
    VIEW_ANALYTICS = "view_analytics"
    CREATE_JOBS = "create_jobs"
    EDIT_JOBS = "edit_jobs"
    DELETE_JOBS = "delete_jobs"
    UPLOAD_RESUME = "upload_resume"
    DOWNLOAD_RESUME = "download_resume"


class RoleGuard:
    """
    Role-based access control middleware

    This class provides decorators and dependency functions for
    protecting API endpoints based on user roles and permissions.
    """

    def __init__(self):
        """Initialize the role guard"""
        # Define role hierarchy (higher roles include lower role permissions)
        self.role_hierarchy = {
            "admin": ["admin", "partner", "job_seeker", "public"],
            "partner": ["partner", "job_seeker", "public"],
            "job_seeker": ["job_seeker", "public"],
            "public": ["public"],
        }

        # Define endpoint permissions
        self.endpoint_permissions = {
            # Public endpoints - no auth required
            "/api/v1/health": ["public"],
            "/api/auth/login": ["public"],
            # Job seeker endpoints
            "/api/v1/resume-analysis": ["job_seeker"],
            "/api/v1/career-search": ["job_seeker"],
            "/api/v1/interactive-chat": ["job_seeker"],
            # Partner endpoints
            "/api/partner/dashboard": ["partner"],
            "/api/partner/analytics": ["partner"],
            # Admin endpoints
            "/api/admin/users": ["admin"],
            "/api/admin/settings": ["admin"],
        }

    def has_role(self, user_role: str, required_role: str) -> bool:
        """
        Check if user has the required role based on role hierarchy

        Args:
            user_role: User's role
            required_role: Required role for access

        Returns:
            bool: True if user has the required role
        """
        if user_role == required_role:
            return True

        # Check role hierarchy
        allowed_roles = self.role_hierarchy.get(user_role, [])
        return required_role in allowed_roles

    def get_allowed_roles(self, endpoint: str) -> List[str]:
        """
        Get roles allowed to access the endpoint

        Args:
            endpoint: API endpoint path

        Returns:
            List[str]: List of allowed roles
        """
        # First try exact match
        if endpoint in self.endpoint_permissions:
            return self.endpoint_permissions[endpoint]

        # If no exact match, try pattern matching
        for pattern, roles in self.endpoint_permissions.items():
            # Simple wildcard support
            if pattern.endswith("*") and endpoint.startswith(pattern[:-1]):
                return roles

        # Default to admin-only if not defined
        return ["admin"]

    def verify_endpoint_permission(self, endpoint: str, user_role: str) -> bool:
        """
        Verify if user role has permission to access the endpoint

        Args:
            endpoint: API endpoint path
            user_role: User's role

        Returns:
            bool: True if user has permission
        """
        allowed_roles = self.get_allowed_roles(endpoint)

        # Check if any of the user's roles match the allowed roles
        for role in allowed_roles:
            if self.has_role(user_role, role):
                return True

        return False

    async def check_auth(
        self, auth: HTTPAuthorizationCredentials = Depends(security), request: Request = None
    ) -> Dict[str, Any]:
        """
        FastAPI dependency for checking authentication

        Args:
            auth: HTTP Authorization credentials
            request: FastAPI request object

        Returns:
            Dict[str, Any]: User info if authenticated

        Raises:
            HTTPException: If not authenticated
        """
        try:
            token = auth.credentials
            user_info = await auth_adapter.verify_token(token)

            if not user_info:
                # Log failed authentication
                await audit_logger.log_auth_event(
                    event_type="auth_failed", request=request, details={"reason": "Invalid token"}
                )

                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid authentication credentials",
                )

            # Log successful authentication
            await audit_logger.log_auth_event(
                event_type="auth_success", user_id=user_info["user_id"], request=request
            )

            return user_info

        except Exception as e:
            # Log authentication error
            await audit_logger.log_auth_event(
                event_type="auth_error", request=request, details={"error": str(e)}
            )

            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication failed"
            )

    async def check_role(
        self,
        required_roles: List[str],
        auth: HTTPAuthorizationCredentials = Depends(security),
        request: Request = None,
    ) -> Dict[str, Any]:
        """
        FastAPI dependency for checking role-based access

        Args:
            required_roles: List of roles allowed to access
            auth: HTTP Authorization credentials
            request: FastAPI request object

        Returns:
            Dict[str, Any]: User info if authorized

        Raises:
            HTTPException: If not authorized
        """
        # First check authentication
        user_info = await self.check_auth(auth, request)

        # Get user role
        user_role = user_info.get("user_type", "public")

        # Check if user has any of the required roles
        has_permission = False
        for role in required_roles:
            if self.has_role(user_role, role):
                has_permission = True
                break

        if not has_permission:
            # Log access denied
            await audit_logger.log_auth_event(
                event_type="access_denied",
                user_id=user_info["user_id"],
                request=request,
                details={"required_roles": required_roles, "user_role": user_role},
            )

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions"
            )

        # Log access granted
        await audit_logger.log_auth_event(
            event_type="access_granted",
            user_id=user_info["user_id"],
            request=request,
            details={"required_roles": required_roles, "user_role": user_role},
        )

        return user_info

    def requires_auth(self):
        """
        Dependency function that requires authentication

        Returns:
            Callable: Dependency function
        """
        return self.check_auth

    def requires_role(self, roles: Union[str, List[str]]):
        """
        Dependency function that requires specific role(s)

        Args:
            roles: Role or list of roles allowed to access

        Returns:
            Callable: Dependency function
        """
        # Convert single role to list
        role_list = [roles] if isinstance(roles, str) else roles

        async def check_role_dependency(
            auth: HTTPAuthorizationCredentials = Depends(security), request: Request = None
        ):
            return await self.check_role(role_list, auth, request)

        return check_role_dependency


# Create a singleton instance
role_guard = RoleGuard()


# ============================================================================
# STANDALONE UTILITY FUNCTIONS
# ============================================================================


def require_role(roles: Union[str, List[str]]):
    """
    Standalone function that requires specific role(s)

    Following rule #12: Complete code verification with proper error handling
    Following rule #15: Include comprehensive error handling

    Args:
        roles: Role or list of roles allowed to access

    Returns:
        Callable: Dependency function
    """
    return role_guard.requires_role(roles)


def require_auth():
    """
    Standalone function that requires authentication

    Returns:
        Callable: Dependency function
    """
    return role_guard.requires_auth()


async def check_user_role(user_info: Dict[str, Any], required_roles: Union[str, List[str]]) -> bool:
    """
    Check if user has required role(s)

    Args:
        user_info: User information dictionary
        required_roles: Required role(s)

    Returns:
        bool: True if user has required role
    """
    try:
        user_role = user_info.get("user_type", "public")
        role_list = [required_roles] if isinstance(required_roles, str) else required_roles

        for role in role_list:
            if role_guard.has_role(user_role, role):
                return True

        return False

    except Exception as e:
        logger.error(f"Error checking user role: {e}")
        return False


async def verify_user_permission(user_info: Dict[str, Any], endpoint: str) -> bool:
    """
    Verify if user has permission to access endpoint

    Args:
        user_info: User information dictionary
        endpoint: API endpoint path

    Returns:
        bool: True if user has permission
    """
    try:
        user_role = user_info.get("user_type", "public")
        return role_guard.verify_endpoint_permission(endpoint, user_role)

    except Exception as e:
        logger.error(f"Error verifying user permission: {e}")
        return False


async def check_permissions(
    user_info: Dict[str, Any],
    required_permissions: Union[str, List[str]],
    endpoint: Optional[str] = None,
) -> bool:
    """
    Check if user has required permissions

    Following rule #12: Complete code verification with proper error handling
    Following rule #15: Include comprehensive error handling

    Args:
        user_info: User information dictionary
        required_permissions: Required permission(s) or role(s)
        endpoint: Optional endpoint to check against

    Returns:
        bool: True if user has required permissions
    """
    try:
        # If endpoint is provided, check endpoint-specific permissions
        if endpoint:
            return await verify_user_permission(user_info, endpoint)

        # Otherwise, check role-based permissions
        return await check_user_role(user_info, required_permissions)

    except Exception as e:
        logger.error(f"Error checking permissions: {e}")
        return False


async def has_permission(user_info: Dict[str, Any], permission: str) -> bool:
    """
    Check if user has a specific permission

    Args:
        user_info: User information dictionary
        permission: Permission to check

    Returns:
        bool: True if user has permission
    """
    try:
        # For now, map permissions to roles
        permission_role_map = {
            "read": "public",
            "write": "job_seeker",
            "admin": "admin",
            "partner": "partner",
            "manage_users": "admin",
            "manage_content": "admin",
            "view_analytics": "partner",
        }

        required_role = permission_role_map.get(permission, "admin")
        return await check_user_role(user_info, required_role)

    except Exception as e:
        logger.error(f"Error checking permission {permission}: {e}")
        return False


# Export classes and instance
__all__ = [
    "RoleGuard",
    "role_guard",
    "UserRole",
    "Permission",
    "require_role",
    "require_auth",
    "check_user_role",
    "verify_user_permission",
    "check_permissions",
    "has_permission",
]
