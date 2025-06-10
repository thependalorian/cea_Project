"""
Model selection module for Climate Economy Assistant

This module provides a unified interface to select and use different
LLM providers (OpenAI or Groq) based on configuration or runtime selection.
"""

import os
from functools import lru_cache
from typing import Any, Dict, List, Literal, Optional

from adapters import groq, openai
from core.config import get_settings

settings = get_settings()

# Model provider types
ModelProvider = Literal["openai", "groq"]


@lru_cache()
def get_default_provider() -> ModelProvider:
    """
    Get the default model provider based on configuration

    Returns:
        ModelProvider: Default model provider ("openai" or "groq")
    """
    # Check environment variable first
    provider = os.getenv("DEFAULT_MODEL_PROVIDER", "").lower()

    # Validate and return
    if provider in ["openai", "groq"]:
        return provider

    # Default to OpenAI if not specified or invalid
    return "openai"


async def generate_completion(
    messages: List[Dict[str, Any]],
    provider: Optional[ModelProvider] = None,
    model: Optional[str] = None,
    temperature: Optional[float] = None,
    max_tokens: Optional[int] = 1000,
    streaming: bool = False,
) -> Dict[str, Any]:
    """
    Generate a completion using the specified provider

    Args:
        messages: List of message objects
        provider: Model provider ("openai" or "groq")
        model: Model to use
        temperature: Sampling temperature
        max_tokens: Maximum tokens to generate
        streaming: Whether to stream the response

    Returns:
        Dict[str, Any]: Response with content and metadata
    """
    # Determine provider
    selected_provider = provider or get_default_provider()

    # Generate completion with selected provider
    if selected_provider == "groq":
        return await groq.generate_completion(
            messages=messages,
            model=model or settings.GROQ_MODEL,
            temperature=temperature or settings.GROQ_TEMPERATURE,
            max_tokens=max_tokens,
            streaming=streaming,
        )
    else:
        # Default to OpenAI
        return await openai.generate_completion(
            messages=messages,
            model=model or settings.OPENAI_MODEL,
            temperature=temperature or settings.OPENAI_TEMPERATURE,
            max_tokens=max_tokens,
            streaming=streaming,
        )


async def chat_with_functions(
    messages: List[Dict[str, Any]],
    functions: List[Dict[str, Any]],
    provider: Optional[ModelProvider] = None,
    function_call: Optional[str] = "auto",
    model: Optional[str] = None,
    temperature: Optional[float] = None,
) -> Dict[str, Any]:
    """
    Chat completion with function calling capability

    Args:
        messages: List of message objects
        functions: List of function definitions
        provider: Model provider ("openai" or "groq")
        function_call: Function call behavior
        model: Model to use
        temperature: Sampling temperature

    Returns:
        Dict[str, Any]: Response with content, function calls, and metadata
    """
    # Determine provider
    selected_provider = provider or get_default_provider()

    # Generate completion with selected provider
    if selected_provider == "groq":
        return await groq.chat_with_functions(
            messages=messages,
            functions=functions,
            function_call=function_call,
            model=model or settings.GROQ_MODEL,
            temperature=temperature or settings.GROQ_TEMPERATURE,
        )
    else:
        # Default to OpenAI
        return await openai.chat_with_functions(
            messages=messages,
            functions=functions,
            function_call=function_call,
            model=model or settings.OPENAI_MODEL,
            temperature=temperature or settings.OPENAI_TEMPERATURE,
        )


async def generate_embeddings(
    texts: List[str],
    provider: Optional[ModelProvider] = None,
    model: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Generate embeddings for a list of texts

    Args:
        texts: List of text strings to embed
        provider: Model provider ("openai" or "groq")
        model: Embedding model to use

    Returns:
        Dict[str, Any]: Response with embeddings and metadata
    """
    # Only OpenAI supports embeddings for now
    return await openai.generate_embeddings(
        texts=texts, model=model or "text-embedding-3-small"
    )


async def create_langchain_llm(
    provider: Optional[ModelProvider] = None,
    model: Optional[str] = None,
    temperature: Optional[float] = None,
):
    """
    Create a LangChain LLM instance for the specified provider

    Args:
        provider: Model provider ("openai" or "groq")
        model: Model to use
        temperature: Sampling temperature

    Returns:
        LangChain LLM instance
    """
    # Determine provider
    selected_provider = provider or get_default_provider()

    # Create LLM with selected provider
    if selected_provider == "groq":
        return await groq.create_langchain_llm(
            model=model or settings.GROQ_MODEL,
            temperature=temperature or settings.GROQ_TEMPERATURE,
        )
    else:
        # Default to OpenAI
        return await openai.create_langchain_llm(
            model=model or settings.OPENAI_MODEL,
            temperature=temperature or settings.OPENAI_TEMPERATURE,
        )
