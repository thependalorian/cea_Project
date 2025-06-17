"""
Enhanced Role Guard - Advanced Role-Based Access Control Middleware

This module provides enhanced role-based access control (RBAC) middleware for
protecting API endpoints based on user roles and fine-grained permissions.

Location: backendv1/auth/enhanced_role_guard.py
"""

from typing import List, Optional, Callable, Dict, Any, Union, Set
from functools import wraps
import uuid

from fastapi import Request, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from ..adapters.auth_adapter import auth_adapter
from ..utils.audit_logger import audit_logger
from ..utils.logger import setup_logger

logger = setup_logger("enhanced_role_guard")
security = HTTPBearer()


class EnhancedRoleGuard:
    """
    Enhanced role-based access control middleware with granular permissions

    This class provides decorators and dependency functions for
    protecting API endpoints based on user roles and fine-grained permissions.
    """

    def __init__(self):
        """Initialize the enhanced role guard"""
        # Define role hierarchy (higher roles include lower role permissions)
        self.role_hierarchy = {
            "admin": ["admin", "partner", "job_seeker", "public"],
            "partner": ["partner", "job_seeker", "public"],
            "job_seeker": ["job_seeker", "public"],
            "public": ["public"],
        }

        # Define granular permissions by role
        self.role_permissions = {
            "admin": [
                "user:read",
                "user:write",
                "user:delete",
                "partner:read",
                "partner:write",
                "partner:delete",
                "job_seeker:read",
                "job_seeker:write",
                "job_seeker:delete",
                "system:settings",
                "system:analytics",
            ],
            "partner": ["partner:read", "partner:write", "job_seeker:read"],
            "job_seeker": ["job_seeker:read", "job_seeker:write"],
            "public": [],
        }

        # Define endpoint permissions
        self.endpoint_permissions = {
            # Public endpoints - no auth required
            "/api/v1/health": ["public"],
            "/api/auth/login": ["public"],
            "/api/auth/refresh-token": ["public"],
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
        Check if a user role has the required role

        Args:
            user_role: User's role
            required_role: Required role to check

        Returns:
            bool: True if user has the required role
        """
        # Get list of roles the user has (based on role hierarchy)
        user_roles = self.role_hierarchy.get(user_role, [])

        # Check if the required role is in the user's roles
        return required_role in user_roles

    def has_permission(self, user_role: str, required_permission: str) -> bool:
        """
        Check if a role has a specific permission

        Args:
            user_role: User's role
            required_permission: Permission to check

        Returns:
            bool: True if the role has the permission
        """
        # Get all permissions for this role (including inherited from role hierarchy)
        all_permissions = []
        for role in self.role_hierarchy.get(user_role, []):
            all_permissions.extend(self.role_permissions.get(role, []))

        return required_permission in all_permissions

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

            # Add request ID for traceability
            request_id = str(uuid.uuid4())
            if request:
                request.state.request_id = request_id
                request.state.user_id = user_info.get("user_id")

            # Log successful authentication
            await audit_logger.log_auth_event(
                event_type="auth_success",
                user_id=user_info["user_id"],
                request=request,
                details={"request_id": request_id},
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

    async def check_permission(
        self,
        required_permission: str,
        auth: HTTPAuthorizationCredentials = Depends(security),
        request: Request = None,
    ) -> Dict[str, Any]:
        """
        FastAPI dependency for checking permission-based access

        Args:
            required_permission: Permission required to access
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

        # Check if user has the required permission
        if not self.has_permission(user_role, required_permission):
            # Log access denied
            await audit_logger.log_auth_event(
                event_type="access_denied",
                user_id=user_info["user_id"],
                request=request,
                details={"required_permission": required_permission, "user_role": user_role},
            )

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions: {required_permission} required",
            )

        # Log access granted
        await audit_logger.log_auth_event(
            event_type="access_granted",
            user_id=user_info["user_id"],
            request=request,
            details={"required_permission": required_permission, "user_role": user_role},
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

    def requires_permission(self, permission: str):
        """
        Dependency function that requires specific permission

        Args:
            permission: Permission required to access

        Returns:
            Callable: Dependency function
        """

        async def check_permission_dependency(
            auth: HTTPAuthorizationCredentials = Depends(security), request: Request = None
        ):
            return await self.check_permission(permission, auth, request)

        return check_permission_dependency


# Create a singleton instance
enhanced_role_guard = EnhancedRoleGuard()
