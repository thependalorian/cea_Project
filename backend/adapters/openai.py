"""
OpenAI adapter module for Climate Economy Assistant

This module handles all OpenAI interactions, including:
- LLM completion requests
- Embedding generation
- Chat interactions
- Token tracking and management
"""

import json
import time
from functools import lru_cache
from typing import Any, Dict, List, Optional

from openai import AsyncOpenAI

from core.config import get_settings

settings = get_settings()


@lru_cache()
def get_openai_client() -> Optional[AsyncOpenAI]:
    """
    Get OpenAI client with graceful error handling

    Returns:
        Optional[AsyncOpenAI]: Initialized OpenAI client or None if connection fails
    """
    try:
        if not settings.OPENAI_API_KEY:
            print("⚠️ OpenAI API key not configured")
            return None

        return AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    except Exception as e:
        print(f"Error initializing OpenAI client: {e}")
        return None


async def generate_completion(
    messages: List[Dict[str, Any]],
    model: Optional[str] = None,
    temperature: Optional[float] = None,
    max_tokens: Optional[int] = 1000,
    streaming: bool = False,
) -> Dict[str, Any]:
    """
    Generate a completion from OpenAI

    Args:
        messages: List of message objects
        model: OpenAI model to use
        temperature: Sampling temperature
        max_tokens: Maximum tokens to generate
        streaming: Whether to stream the response

    Returns:
        Dict[str, Any]: Response with content and metadata
    """
    client = get_openai_client()
    if not client:
        return {
            "error": "OpenAI client unavailable",
            "success": False,
            "content": "I apologize, but I'm currently unable to access my advanced language capabilities. Please try again later.",
        }

    try:
        # Prepare model parameters
        model_name = model or settings.OPENAI_MODEL
        temp = temperature if temperature is not None else settings.OPENAI_TEMPERATURE

        # Track start time for latency calculation
        start_time = time.time()

        if streaming:
            # Return a streaming response
            return {
                "success": True,
                "stream": client.chat.completions.create(
                    model=model_name,
                    messages=messages,
                    temperature=temp,
                    max_tokens=max_tokens,
                    stream=True,
                ),
            }
        else:
            # Generate standard completion
            response = await client.chat.completions.create(
                model=model_name,
                messages=messages,
                temperature=temp,
                max_tokens=max_tokens,
            )

            # Calculate latency
            latency_ms = int((time.time() - start_time) * 1000)

            # Extract content and token usage
            content = response.choices[0].message.content

            # Return formatted response
            return {
                "success": True,
                "content": content,
                "model": model_name,
                "completion_tokens": (
                    response.usage.completion_tokens if response.usage else None
                ),
                "prompt_tokens": (
                    response.usage.prompt_tokens if response.usage else None
                ),
                "total_tokens": response.usage.total_tokens if response.usage else None,
                "latency_ms": latency_ms,
            }

    except Exception as e:
        print(f"Error generating completion: {e}")
        return {
            "error": str(e),
            "success": False,
            "content": "I apologize, but I encountered an issue processing your request. Please try again.",
        }


async def generate_embeddings(
    texts: List[str], model: str = "text-embedding-3-small"
) -> Dict[str, Any]:
    """
    Generate embeddings for a list of texts

    Args:
        texts: List of text strings to embed
        model: Embedding model to use

    Returns:
        Dict[str, Any]: Response with embeddings and metadata
    """
    client = get_openai_client()
    if not client:
        return {"error": "OpenAI client unavailable", "success": False}

    try:
        # Track start time for latency calculation
        start_time = time.time()

        # Generate embeddings
        response = await client.embeddings.create(model=model, input=texts)

        # Calculate latency
        latency_ms = int((time.time() - start_time) * 1000)

        # Extract embeddings
        embeddings = [item.embedding for item in response.data]

        # Return formatted response
        return {
            "success": True,
            "embeddings": embeddings,
            "model": model,
            "total_tokens": response.usage.total_tokens,
            "latency_ms": latency_ms,
        }

    except Exception as e:
        print(f"Error generating embeddings: {e}")
        return {"error": str(e), "success": False}


async def chat_with_functions(
    messages: List[Dict[str, Any]],
    functions: List[Dict[str, Any]],
    function_call: Optional[str] = "auto",
    model: Optional[str] = None,
    temperature: Optional[float] = None,
) -> Dict[str, Any]:
    """
    Chat completion with function calling capability

    Args:
        messages: List of message objects
        functions: List of function definitions
        function_call: Function call behavior
        model: OpenAI model to use
        temperature: Sampling temperature

    Returns:
        Dict[str, Any]: Response with content, function calls, and metadata
    """
    client = get_openai_client()
    if not client:
        return {
            "error": "OpenAI client unavailable",
            "success": False,
            "content": "I apologize, but I'm currently unable to access my advanced capabilities. Please try again later.",
        }

    try:
        # Prepare model parameters
        model_name = model or settings.OPENAI_MODEL
        temp = temperature if temperature is not None else settings.OPENAI_TEMPERATURE

        # Track start time for latency calculation
        start_time = time.time()

        # Make API call with function definitions
        response = await client.chat.completions.create(
            model=model_name,
            messages=messages,
            functions=functions,
            function_call=function_call,
            temperature=temp,
        )

        # Calculate latency
        latency_ms = int((time.time() - start_time) * 1000)

        # Extract response
        message = response.choices[0].message

        # Check if function was called
        function_call_data = None
        if message.function_call:
            function_call_data = {
                "name": message.function_call.name,
                "arguments": message.function_call.arguments,
            }

            # Try to parse JSON arguments
            try:
                function_call_data["parsed_arguments"] = json.loads(
                    message.function_call.arguments
                )
            except (json.JSONDecodeError, TypeError):
                function_call_data["parsed_arguments"] = None

        # Return formatted response
        return {
            "success": True,
            "content": message.content,
            "function_call": function_call_data,
            "model": model_name,
            "completion_tokens": (
                response.usage.completion_tokens if response.usage else None
            ),
            "prompt_tokens": response.usage.prompt_tokens if response.usage else None,
            "total_tokens": response.usage.total_tokens if response.usage else None,
            "latency_ms": latency_ms,
        }

    except Exception as e:
        print(f"Error in chat with functions: {e}")
        return {
            "error": str(e),
            "success": False,
            "content": "I apologize, but I encountered an issue processing your request. Please try again.",
        }


async def create_langchain_llm(
    model: Optional[str] = None, temperature: Optional[float] = None
):
    """
    Create a LangChain compatible LLM

    Args:
        model: OpenAI model to use
        temperature: Sampling temperature

    Returns:
        LangChain LLM instance
    """
    try:
        # Import LangChain only when needed
        from langchain_openai import ChatOpenAI

        # Prepare model parameters
        model_name = model or settings.OPENAI_MODEL
        temp = temperature if temperature is not None else settings.OPENAI_TEMPERATURE

        # Create LangChain LLM instance
        llm = ChatOpenAI(
            model=model_name,
            temperature=temp,
            openai_api_key=settings.OPENAI_API_KEY,
            streaming=False,
        )

        return llm

    except Exception as e:
        print(f"Error creating LangChain LLM: {e}")
        return None
