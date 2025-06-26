from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
import os

# Security configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Security bearer token
security = HTTPBearer()


class TokenManager:
    """JWT token creation and validation."""

    @staticmethod
    def create_access_token(
        data: Dict[str, Any], expires_delta: Optional[timedelta] = None
    ) -> str:
        """Create a new access token."""
        to_encode = data.copy()

        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt

    @staticmethod
    def create_refresh_token(user_id: str) -> str:
        """Create a new refresh token."""
        expires = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        return jwt.encode(
            {"sub": user_id, "exp": expires}, SECRET_KEY, algorithm=ALGORITHM
        )

    @staticmethod
    def verify_token(token: str) -> Dict[str, Any]:
        """Verify a token and return its payload."""
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return payload
        except JWTError as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

    @staticmethod
    def decode_token(token: str) -> Dict[str, Any]:
        """Decode a token without verification."""
        try:
            return jwt.decode(token, options={"verify_signature": False})
        except JWTError:
            return {}


class AuthenticationService:
    """User authentication and session management."""

    def __init__(self):
        self.token_manager = TokenManager()

    async def authenticate_user(self, email: str, password: str) -> Optional[Dict]:
        """Authenticate a user with email and password."""
        try:
            # Get user from database (implement your own user retrieval)
            user = await self.get_user_by_email(email)

            if not user:
                return None

            if not self.verify_password(password, user["hashed_password"]):
                return None

            return user
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Authentication error: {str(e)}",
            )

    async def get_current_user(
        self, credentials: HTTPAuthorizationCredentials = Depends(security)
    ) -> Dict:
        """Get the current authenticated user."""
        try:
            token = credentials.credentials
            payload = self.token_manager.verify_token(token)

            user_id = payload.get("sub")
            if user_id is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid authentication credentials",
                )

            # Get user from database (implement your own user retrieval)
            user = await self.get_user_by_id(user_id)
            if user is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found"
                )

            return user
        except JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
            )

    async def verify_permissions(
        self, user: Dict, required_permissions: List[str]
    ) -> bool:
        """Verify if a user has the required permissions."""
        try:
            user_permissions = user.get("permissions", [])
            return all(perm in user_permissions for perm in required_permissions)
        except Exception:
            return False

    async def refresh_access_token(self, refresh_token: str) -> str:
        """Refresh an access token using a refresh token."""
        try:
            payload = self.token_manager.verify_token(refresh_token)
            user_id = payload.get("sub")

            if not user_id:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid refresh token",
                )

            # Create new access token
            access_token = self.token_manager.create_access_token(data={"sub": user_id})

            return access_token
        except JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token"
            )

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash."""
        return pwd_context.verify(plain_password, hashed_password)

    @staticmethod
    def get_password_hash(password: str) -> str:
        """Get hash of a password."""
        return pwd_context.hash(password)

    async def get_user_by_email(self, email: str) -> Optional[Dict]:
        """Get user by email from database."""
        # Implement your own user retrieval logic
        raise NotImplementedError("Implement user retrieval from database")

    async def get_user_by_id(self, user_id: str) -> Optional[Dict]:
        """Get user by ID from database."""
        # Implement your own user retrieval logic
        raise NotImplementedError("Implement user retrieval from database")
