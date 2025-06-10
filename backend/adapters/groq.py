"""
Groq adapter module for Climate Economy Assistant

This module handles all Groq interactions, including:
- LLM completion requests
- Chat interactions
- Token tracking and management
"""

import json
import time
from functools import lru_cache
from typing import Any, Dict, List, Optional

from groq import AsyncGroq

from core.config import get_settings

settings = get_settings()


@lru_cache()
def get_groq_client() -> Optional[AsyncGroq]:
    """
    Get Groq client with graceful error handling

    Returns:
        Optional[AsyncGroq]: Initialized Groq client or None if connection fails
    """
    try:
        if not settings.GROQ_API_KEY:
            print("⚠️ Groq API key not configured")
            return None

        return AsyncGroq(api_key=settings.GROQ_API_KEY)
    except Exception as e:
        print(f"Error initializing Groq client: {e}")
        return None


async def generate_completion(
    messages: List[Dict[str, Any]],
    model: Optional[str] = None,
    temperature: Optional[float] = None,
    max_tokens: Optional[int] = 1000,
    streaming: bool = False,
) -> Dict[str, Any]:
    """
    Generate a completion from Groq

    Args:
        messages: List of message objects
        model: Groq model to use
        temperature: Sampling temperature
        max_tokens: Maximum tokens to generate
        streaming: Whether to stream the response

    Returns:
        Dict[str, Any]: Response with content and metadata
    """
    client = get_groq_client()
    if not client:
        return {
            "error": "Groq client unavailable",
            "success": False,
            "content": "I apologize, but I'm currently unable to access my advanced language capabilities. Please try again later.",
        }

    try:
        # Prepare model parameters
        model_name = model or settings.GROQ_MODEL
        temp = temperature if temperature is not None else settings.GROQ_TEMPERATURE

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
        model: Groq model to use
        temperature: Sampling temperature

    Returns:
        Dict[str, Any]: Response with content, function calls, and metadata
    """
    client = get_groq_client()
    if not client:
        return {
            "error": "Groq client unavailable",
            "success": False,
            "content": "I apologize, but I'm currently unable to access my advanced capabilities. Please try again later.",
        }

    try:
        # Prepare model parameters
        model_name = model or settings.GROQ_MODEL
        temp = temperature if temperature is not None else settings.GROQ_TEMPERATURE

        # Track start time for latency calculation
        start_time = time.time()

        # Make API call with function definitions
        response = await client.chat.completions.create(
            model=model_name,
            messages=messages,
            tools=functions,  # Groq uses 'tools' instead of 'functions'
            tool_choice=function_call,  # Groq uses 'tool_choice' instead of 'function_call'
            temperature=temp,
        )

        # Calculate latency
        latency_ms = int((time.time() - start_time) * 1000)

        # Extract response
        message = response.choices[0].message

        # Check if function was called
        function_call_data = None
        if message.tool_calls:
            function_call_data = {
                "name": message.tool_calls[0].function.name,
                "arguments": message.tool_calls[0].function.arguments,
            }

            # Try to parse JSON arguments
            try:
                function_call_data["parsed_arguments"] = json.loads(
                    message.tool_calls[0].function.arguments
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
        print(f"Error generating function completion: {e}")
        return {
            "error": str(e),
            "success": False,
            "content": "I apologize, but I encountered an issue processing your request. Please try again.",
        }


async def create_langchain_llm(
    model: Optional[str] = None, temperature: Optional[float] = None
):
    """
    Create a LangChain LLM instance for Groq

    Args:
        model: Groq model to use
        temperature: Sampling temperature

    Returns:
        LangChain ChatGroq instance
    """
    from langchain_groq import ChatGroq

    # Prepare model parameters
    model_name = model or settings.GROQ_MODEL
    temp = temperature if temperature is not None else settings.GROQ_TEMPERATURE

    # Create and return LangChain LLM
    return ChatGroq(
        model_name=model_name, temperature=temp, groq_api_key=settings.GROQ_API_KEY
    )
