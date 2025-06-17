"""
Configuration module for LangGraph Climate Economy Assistant
This module provides centralized configuration management for the application.
"""

import os
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field, validator
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class Configuration(BaseModel):
    """Main configuration class for the Climate Economy Assistant application"""

    # API Keys
    openai_api_key: str = Field(default_factory=lambda: os.getenv("OPENAI_API_KEY", ""))
    supabase_url: str = Field(default_factory=lambda: os.getenv("SUPABASE_URL", ""))
    supabase_key: str = Field(
        default_factory=lambda: os.getenv("SUPABASE_ANON_KEY", "")
    )

    # LangGraph Configuration
    langgraph_enabled: bool = Field(
        default=True, description="Enable LangGraph functionality"
    )
    streaming_enabled: bool = Field(
        default=True, description="Enable streaming responses"
    )
    checkpoint_enabled: bool = Field(
        default=True, description="Enable checkpoint functionality"
    )
    context_isolation: bool = Field(
        default=True, description="Enable context isolation for child graphs"
    )

    # Model Configuration
    default_model: str = Field(
        default="gpt-4", description="Default OpenAI model to use"
    )
    temperature: float = Field(
        default=0.7, ge=0.0, le=2.0, description="Model temperature"
    )
    max_tokens: int = Field(
        default=2000, gt=0, description="Maximum tokens per response"
    )

    # Application Settings
    debug: bool = Field(
        default_factory=lambda: os.getenv("DEBUG", "false").lower() == "true"
    )
    environment: str = Field(
        default_factory=lambda: os.getenv("ENVIRONMENT", "development")
    )
    log_level: str = Field(default="INFO", description="Logging level")

    # Backend URLs
    python_backend_url: str = Field(
        default_factory=lambda: os.getenv("PYTHON_BACKEND_URL", "http://localhost:8000")
    )
    frontend_url: str = Field(
        default_factory=lambda: os.getenv("FRONTEND_URL", "http://localhost:3000")
    )

    # Climate Assistant Specific Features
    specialist_routing_enabled: bool = Field(
        default=True, description="Enable specialist agent routing"
    )
    user_steering_enabled: bool = Field(
        default=True, description="Enable user steering capabilities"
    )
    enhanced_intelligence: bool = Field(
        default=True, description="Enable enhanced intelligence features"
    )
    empathy_integration: bool = Field(
        default=True, description="Enable empathy integration"
    )

    # Workflow Configuration
    max_workflow_steps: int = Field(
        default=50, gt=0, description="Maximum workflow steps"
    )
    workflow_timeout: int = Field(
        default=300, gt=0, description="Workflow timeout in seconds"
    )
    tool_execution_timeout: int = Field(
        default=30, gt=0, description="Tool execution timeout in seconds"
    )

    # User Journey Configuration
    journey_stages: List[str] = Field(
        default=[
            "discovery",
            "exploration",
            "skill_assessment",
            "pathway_selection",
            "action_planning",
            "implementation",
        ]
    )

    # Security Configuration
    enable_rate_limiting: bool = Field(
        default=True, description="Enable API rate limiting"
    )
    max_requests_per_minute: int = Field(default=60, gt=0)
    cors_origins: List[str] = Field(
        default_factory=lambda: [
            "http://localhost:3000",
            "http://localhost:3001",
            "https://climate-economy-assistant.vercel.app",
        ]
    )

    # Database Configuration
    database_url: str = Field(default_factory=lambda: os.getenv("DATABASE_URL", ""))
    connection_pool_size: int = Field(default=10, gt=0)

    @validator("openai_api_key")
    def validate_openai_key(cls, v):
        """Validate OpenAI API key format"""
        if v and not v.startswith("sk-"):
            raise ValueError('OpenAI API key must start with "sk-"')
        return v

    @validator("temperature")
    def validate_temperature(cls, v):
        """Ensure temperature is within valid range"""
        if not 0.0 <= v <= 2.0:
            raise ValueError("Temperature must be between 0.0 and 2.0")
        return v

    @validator("environment")
    def validate_environment(cls, v):
        """Validate environment setting"""
        valid_environments = ["development", "staging", "production"]
        if v not in valid_environments:
            raise ValueError(f"Environment must be one of: {valid_environments}")
        return v

    def validate_required_fields(self) -> Dict[str, Any]:
        """Validate that all required fields are present and properly configured"""
        missing_fields = []
        warnings = []

        # Critical fields
        if not self.openai_api_key:
            missing_fields.append("OPENAI_API_KEY")
        if not self.supabase_url:
            missing_fields.append("SUPABASE_URL")
        if not self.supabase_key:
            missing_fields.append("SUPABASE_ANON_KEY")

        # Recommended fields
        if not self.database_url and self.environment == "production":
            warnings.append("DATABASE_URL not set for production environment")

        return {
            "valid": len(missing_fields) == 0,
            "missing_fields": missing_fields,
            "warnings": warnings,
            "environment": self.environment,
            "debug_mode": self.debug,
        }

    def get_langgraph_config(self) -> Dict[str, Any]:
        """Get LangGraph-specific configuration"""
        return {
            "streaming_enabled": self.streaming_enabled,
            "checkpoint_enabled": self.checkpoint_enabled,
            "context_isolation": self.context_isolation,
            "max_workflow_steps": self.max_workflow_steps,
            "workflow_timeout": self.workflow_timeout,
            "tool_execution_timeout": self.tool_execution_timeout,
        }

    def get_model_config(self) -> Dict[str, Any]:
        """Get model configuration for OpenAI"""
        return {
            "model": self.default_model,
            "temperature": self.temperature,
            "max_tokens": self.max_tokens,
            "api_key": self.openai_api_key,
        }

    def get_cors_config(self) -> Dict[str, Any]:
        """Get CORS configuration for FastAPI"""
        return {
            "allow_origins": self.cors_origins,
            "allow_credentials": True,
            "allow_methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["*"],
        }

    class Config:
        """Pydantic configuration"""

        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


# Global configuration instance
config = Configuration()

# Validate configuration on import
validation_result = config.validate_required_fields()

if not validation_result["valid"]:
    print(
        f"⚠️ Missing required environment variables: {validation_result['missing_fields']}"
    )
    print("Please check your .env file and ensure all required variables are set.")

if validation_result["warnings"]:
    print(f"⚠️ Configuration warnings: {validation_result['warnings']}")

if config.debug:
    print(f"🐛 Debug mode enabled - Environment: {config.environment}")
    print(
        f"🔧 LangGraph features: streaming={config.streaming_enabled}, checkpoints={config.checkpoint_enabled}"
    )

# Export commonly used configurations
LANGGRAPH_CONFIG = config.get_langgraph_config()
MODEL_CONFIG = config.get_model_config()
CORS_CONFIG = config.get_cors_config()

# Compatibility exports for legacy imports
Configuration = Configuration
config = config
