"""
Models Adapter - Multi-Provider LLM Support for Climate Economy Assistant
Supports both OpenAI and DeepSeek with flexible provider switching.

OpenAI: Premium models, higher cost
DeepSeek: Cost-effective alternative (~90% cheaper)
"""

import logging
import os
from typing import Optional, Union, Dict, Any

from dotenv import load_dotenv

load_dotenv()

try:
    from langchain_openai import ChatOpenAI

    OPENAI_AVAILABLE = True
except ImportError:
    ChatOpenAI = None
    OPENAI_AVAILABLE = False

from backend.config.settings import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


def get_openai_model(
    model_name: str = "gpt-3.5-turbo",
    temperature: float = 0.2,
    max_tokens: Optional[int] = None,
    **kwargs,
) -> Optional[ChatOpenAI]:
    """Create OpenAI model instance."""
    if not OPENAI_AVAILABLE:
        logger.error("OpenAI not available - install langchain-openai")
        return None

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        logger.error("OpenAI API key not found")
        return None

    try:
        return ChatOpenAI(
            model=model_name,
            temperature=temperature,
            max_tokens=max_tokens,
            api_key=api_key,
            **kwargs,
        )
    except Exception as e:
        logger.error(f"Failed to create OpenAI model: {e}")
        return None


def get_deepseek_model(
    model_name: str = "deepseek-chat",
    temperature: float = 0.2,
    max_tokens: Optional[int] = None,
    **kwargs,
) -> Optional[ChatOpenAI]:
    """
    Create DeepSeek model instance using OpenAI-compatible API.

    DeepSeek is OpenAI-compatible but uses different base URL:
    - API: https://api.deepseek.com/v1
    - Models: deepseek-chat, deepseek-reasoner
    - Cost: ~90% cheaper than OpenAI
    """
    if not OPENAI_AVAILABLE:
        logger.error("OpenAI package not available for DeepSeek")
        return None

    api_key = os.getenv("DEEPSEEK_API_KEY")
    if not api_key:
        logger.error("DeepSeek API key not found")
        return None

    try:
        model = ChatOpenAI(
            model=model_name,
            temperature=temperature,
            max_tokens=max_tokens,
            api_key=api_key,
            base_url="https://api.deepseek.com/v1",
            **kwargs,
        )
        logger.info(
            f"✅ DeepSeek model created: {model_name} via https://api.deepseek.com/v1"
        )
        return model
    except Exception as e:
        logger.error(f"Failed to create DeepSeek model: {e}")
        return None


def get_primary_model() -> Optional[ChatOpenAI]:
    """
    Get primary model based on MODEL_PROVIDER environment variable.
    Supports both OpenAI (premium) and DeepSeek (cost-effective) with fallback.

    Returns:
        ChatOpenAI: Configured model instance
    """
    provider = os.getenv("MODEL_PROVIDER", "openai").lower()
    model_name = os.getenv("MODEL_NAME", "gpt-3.5-turbo")

    logger.info(f"🔧 Creating primary model: provider={provider}, model={model_name}")

    if provider == "deepseek":
        model = get_deepseek_model(model_name)
        if model:
            logger.info(
                "✅ DeepSeek model created successfully (cost-effective option)"
            )
            return model
        else:
            logger.warning("❌ DeepSeek failed, checking OpenAI as fallback...")
            # Fallback to OpenAI if DeepSeek fails
            fallback_model = get_openai_model()
            if fallback_model:
                logger.info("✅ Fallback to OpenAI successful")
                return fallback_model
            else:
                logger.error("❌ Both DeepSeek and OpenAI failed")
                return None

    elif provider == "openai":
        model = get_openai_model(model_name)
        if model:
            logger.info("✅ OpenAI model created successfully")
            return model
        else:
            logger.warning(
                "❌ OpenAI failed (quota/billing?), trying DeepSeek as fallback..."
            )
            # Fallback to DeepSeek if OpenAI fails (useful when quota exceeded)
            fallback_model = get_deepseek_model()
            if fallback_model:
                logger.info("✅ Fallback to DeepSeek successful (cost-effective)")
                return fallback_model
            else:
                logger.error("❌ Both OpenAI and DeepSeek failed")
                return None

    else:
        logger.error(f"❌ Unknown provider: {provider}. Supported: openai, deepseek")
        return None


def get_evaluation_model() -> Optional[ChatOpenAI]:
    """Get model for evaluation tasks."""
    eval_model = os.getenv("EVALUATION_MODEL", "gpt-3.5-turbo")
    provider = os.getenv("MODEL_PROVIDER", "openai").lower()

    if provider == "deepseek":
        return get_deepseek_model(eval_model)
    else:
        return get_openai_model(eval_model)


def get_available_models() -> Dict[str, Any]:
    """Get configuration info for available models."""
    return {
        "primary_provider": os.getenv("MODEL_PROVIDER", "openai"),
        "primary_model": os.getenv("MODEL_NAME", "gpt-3.5-turbo"),
        "evaluation_model": os.getenv("EVALUATION_MODEL", "gpt-3.5-turbo"),
        "openai_available": bool(os.getenv("OPENAI_API_KEY")),
        "deepseek_available": bool(os.getenv("DEEPSEEK_API_KEY")),
        "langchain_openai_installed": OPENAI_AVAILABLE,
    }


# Backward compatibility functions
def create_chat_model(**kwargs) -> Optional[ChatOpenAI]:
    """Create chat model with current configuration."""
    return get_primary_model()


def create_evaluation_model(**kwargs) -> Optional[ChatOpenAI]:
    """Create evaluation model with current configuration."""
    return get_evaluation_model()


def create_langchain_llm(**kwargs) -> Optional[ChatOpenAI]:
    """Create LangChain LLM instance (backward compatibility)."""
    return get_primary_model()


def get_model_config() -> Dict[str, Any]:
    """Get model configuration for agent initialization."""
    return {
        "temperature": 0.2,
        "max_tokens": 4000,
        "streaming": True,
        "provider": os.getenv("MODEL_PROVIDER", "openai"),
        "model_name": os.getenv("MODEL_NAME", "gpt-3.5-turbo"),
    }


def get_crisis_llm(**kwargs) -> Optional[ChatOpenAI]:
    """Create LLM instance for crisis/emergency handling (backward compatibility)."""
    return get_primary_model()


# Export main functions
__all__ = [
    "get_primary_model",
    "get_evaluation_model",
    "get_openai_model",
    "get_deepseek_model",
    "get_available_models",
    "create_chat_model",
    "create_evaluation_model",
    "create_langchain_llm",
    "get_model_config",
]

if __name__ == "__main__":
    # Test the model creation
    models_info = get_available_models()
    print("🔍 Models Configuration:")
    for key, value in models_info.items():
        print(f"  {key}: {value}")

    print("\n🧪 Testing DeepSeek model creation...")
    model = get_primary_model()
    if model:
        print("✅ DeepSeek model created successfully")
    else:
        print("❌ Failed to create DeepSeek model")


def get_crisis_llm(**kwargs):
    """Create LLM instance for crisis/emergency handling (backward compatibility)."""
    return get_primary_model()
