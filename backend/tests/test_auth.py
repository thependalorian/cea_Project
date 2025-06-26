"""
Authentication Middleware Security Tests
Testing JWT verification and security measures
"""

import pytest
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from unittest.mock import Mock, patch, AsyncMock
import jwt
import os

from backend.api.middleware.auth import verify_token


class TestAuthMiddleware:
    """Test suite for authentication middleware"""

    @pytest.fixture
    def mock_credentials(self):
        """Mock credentials fixture"""
        return HTTPAuthorizationCredentials(
            scheme="Bearer", credentials="valid.jwt.token"
        )

    @pytest.fixture
    def invalid_credentials(self):
        """Invalid credentials fixture"""
        return HTTPAuthorizationCredentials(
            scheme="Bearer", credentials="invalid.token"
        )

    @pytest.mark.security
    @patch("backend.api.middleware.auth.supabase")
    async def test_verify_token_success(self, mock_supabase, mock_credentials):
        """Test successful token verification"""
        # Mock successful Supabase response
        mock_supabase.auth.get_user.return_value.user.id = "user123"
        mock_supabase.auth.get_user.return_value.user = Mock(id="user123")

        with patch(
            "backend.api.middleware.auth.supabase.auth.get_user"
        ) as mock_get_user:
            mock_get_user.return_value.user.id = "user123"
            result = await verify_token(mock_credentials)
            assert result == "user123"

    @pytest.mark.security
    @patch("backend.api.middleware.auth.supabase")
    async def test_verify_token_invalid(self, mock_supabase, invalid_credentials):
        """Test invalid token handling"""
        # Mock Supabase throwing an exception
        mock_supabase.auth.get_user.side_effect = Exception("Invalid token")

        with pytest.raises(HTTPException) as exc_info:
            await verify_token(invalid_credentials)

        assert exc_info.value.status_code == 401
        assert "Invalid or expired token" in str(exc_info.value.detail)

    @pytest.mark.security
    async def test_verify_token_empty_credentials(self):
        """Test handling of empty credentials"""
        empty_credentials = HTTPAuthorizationCredentials(
            scheme="Bearer", credentials=""
        )

        with pytest.raises(HTTPException) as exc_info:
            await verify_token(empty_credentials)

        assert exc_info.value.status_code == 401

    @pytest.mark.security
    @patch("backend.api.middleware.auth.supabase")
    async def test_verify_token_supabase_error(self, mock_supabase, mock_credentials):
        """Test Supabase connection error handling"""
        mock_supabase.auth.get_user.side_effect = ConnectionError(
            "Cannot connect to Supabase"
        )

        with pytest.raises(HTTPException) as exc_info:
            await verify_token(mock_credentials)

        assert exc_info.value.status_code == 503
        assert "Authentication service unavailable" in str(exc_info.value.detail)

    @pytest.mark.security
    def test_jwt_decode_malformed_token(self):
        """Test handling of malformed JWT tokens"""
        malformed_token = "not.a.valid.jwt"

        with pytest.raises(jwt.InvalidTokenError):
            jwt.decode(malformed_token, "secret", algorithms=["HS256"])

    @pytest.mark.security
    @patch.dict(
        os.environ,
        {"SUPABASE_URL": "https://test.supabase.co", "SUPABASE_ANON_KEY": "test-key"},
    )
    def test_environment_variables_set(self):
        """Test that required environment variables are set"""
        from backend.api.middleware.auth import supabase_url, supabase_key

        assert supabase_url is not None
        assert supabase_key is not None
        assert "supabase.co" in supabase_url

    @pytest.mark.security
    async def test_token_expiration_handling(self, mock_credentials):
        """Test expired token handling"""
        with patch("backend.api.middleware.auth.supabase") as mock_supabase:
            # Mock expired token error
            mock_supabase.auth.get_user.side_effect = Exception("JWT expired")

            with pytest.raises(HTTPException) as exc_info:
                await verify_token(mock_credentials)

            assert exc_info.value.status_code == 401
