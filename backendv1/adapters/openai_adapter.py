"""
OpenAI Adapter - Production AI Model Integration

Following rule #12: Complete code verification with proper AI integration
Following rule #15: Include comprehensive error handling

This adapter handles OpenAI API interactions for the multi-agent system.
Ported from backend/adapters/openai.py (297 lines) to provide full functionality.

Location: backendv1/adapters/openai_adapter.py
"""

import json
import time
from functools import lru_cache
from typing import Dict, Any, List, Optional, AsyncIterator, Union

from openai import AsyncOpenAI

from backendv1.utils.logger import setup_logger
from backendv1.config.settings import get_settings

logger = setup_logger("openai_adapter")
settings = get_settings()

# Global adapter instance for backward compatibility
_global_adapter = None


def get_openai_client() -> Optional[AsyncOpenAI]:
    """
    Get OpenAI client - backward compatibility function

    Returns:
        Optional[AsyncOpenAI]: Initialized OpenAI client or None if connection fails
    """
    global _global_adapter
    if not _global_adapter:
        _global_adapter = OpenAIAdapter()

    return _global_adapter.get_client()


class OpenAIAdapter:
    """
    OpenAI API adapter for AI model interactions

    Following rule #12: Complete code verification with proper typing
    Following rule #15: Include comprehensive error handling
    """

    def __init__(self):
        """Initialize OpenAI adapter"""
        self.api_key = settings.OPENAI_API_KEY
        self._client = None
        logger.info("🤖 OpenAI adapter initialized")

    def get_client(self) -> Optional[AsyncOpenAI]:
        """
        Get OpenAI client with graceful error handling

        Returns:
            Optional[AsyncOpenAI]: Initialized OpenAI client or None if connection fails
        """
        try:
            if not self.api_key:
                logger.warning("⚠️ OpenAI API key not configured")
                return None

            if not self._client:
                self._client = AsyncOpenAI(api_key=self.api_key)

            return self._client

        except Exception as e:
            logger.error(f"Error initializing OpenAI client: {e}")
            return None

    async def validate_connection(self) -> bool:
        """
        Validate OpenAI API connection

        Returns:
            bool: True if connection is valid
        """
        try:
            client = self.get_client()
            if not client:
                return False

            # Simple ping to validate connection - list models
            await client.models.list()
            logger.info("✅ OpenAI connection validated")
            return True

        except Exception as e:
            logger.error(f"❌ OpenAI connection failed: {e}")
            return False

    async def generate_completion(
        self,
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
        client = self.get_client()
        if not client:
            logger.warning("OpenAI client unavailable")
            return {
                "error": "OpenAI client unavailable",
                "success": False,
                "content": "I apologize, but I'm currently unable to access my advanced language capabilities. Please try again later.",
            }

        try:
            # Prepare model parameters
            model_name = model or settings.OPENAI_MODEL or "gpt-4"
            temp = temperature if temperature is not None else (settings.OPENAI_TEMPERATURE or 0.7)

            # Track start time for latency calculation
            start_time = time.time()

            if streaming:
                # Return a streaming response
                logger.info(f"🤖 Generating streaming completion with {model_name}")
                stream = await client.chat.completions.create(
                    model=model_name,
                    messages=messages,
                    temperature=temp,
                    max_tokens=max_tokens,
                    stream=True,
                )

                return {
                    "success": True,
                    "stream": stream,
                    "model": model_name,
                }
            else:
                # Generate standard completion
                logger.info(f"🤖 Generating completion with {model_name}")
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

                logger.info(f"✅ Completion generated in {latency_ms}ms")

                # Return formatted response
                return {
                    "success": True,
                    "content": content,
                    "model": model_name,
                    "completion_tokens": (
                        response.usage.completion_tokens if response.usage else None
                    ),
                    "prompt_tokens": (response.usage.prompt_tokens if response.usage else None),
                    "total_tokens": response.usage.total_tokens if response.usage else None,
                    "latency_ms": latency_ms,
                }

        except Exception as e:
            logger.error(f"Error generating completion: {e}")
            return {
                "error": str(e),
                "success": False,
                "content": "I apologize, but I encountered an issue processing your request. Please try again.",
            }

    async def generate_embeddings(
        self, texts: List[str], model: str = "text-embedding-3-small"
    ) -> Dict[str, Any]:
        """
        Generate embeddings for a list of texts

        Args:
            texts: List of text strings to embed
            model: Embedding model to use

        Returns:
            Dict[str, Any]: Response with embeddings and metadata
        """
        client = self.get_client()
        if not client:
            logger.warning("OpenAI client unavailable for embeddings")
            return {"error": "OpenAI client unavailable", "success": False}

        try:
            # Track start time for latency calculation
            start_time = time.time()

            logger.info(f"🧠 Generating embeddings with {model} for {len(texts)} texts")

            # Generate embeddings
            response = await client.embeddings.create(model=model, input=texts)

            # Calculate latency
            latency_ms = int((time.time() - start_time) * 1000)

            # Extract embeddings
            embeddings = [item.embedding for item in response.data]

            logger.info(f"✅ Embeddings generated in {latency_ms}ms")

            # Return formatted response
            return {
                "success": True,
                "embeddings": embeddings,
                "model": model,
                "total_tokens": response.usage.total_tokens,
                "latency_ms": latency_ms,
            }

        except Exception as e:
            logger.error(f"Error generating embeddings: {e}")
            return {"error": str(e), "success": False}

    async def chat_with_functions(
        self,
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
        client = self.get_client()
        if not client:
            logger.warning("OpenAI client unavailable for function calling")
            return {
                "error": "OpenAI client unavailable",
                "success": False,
                "content": "I apologize, but I'm currently unable to access my advanced capabilities. Please try again later.",
            }

        try:
            # Prepare model parameters
            model_name = model or settings.OPENAI_MODEL or "gpt-4"
            temp = temperature if temperature is not None else (settings.OPENAI_TEMPERATURE or 0.7)

            # Track start time for latency calculation
            start_time = time.time()

            logger.info(f"🤖 Generating function-enabled completion with {model_name}")

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

                logger.info(f"✅ Function call to {function_call_data['name']} generated")
            else:
                logger.info(f"✅ Content response generated (no function call)")

            # Return formatted response
            return {
                "success": True,
                "content": message.content,
                "function_call": function_call_data,
                "model": model_name,
                "completion_tokens": (response.usage.completion_tokens if response.usage else None),
                "prompt_tokens": response.usage.prompt_tokens if response.usage else None,
                "total_tokens": response.usage.total_tokens if response.usage else None,
                "latency_ms": latency_ms,
            }

        except Exception as e:
            logger.error(f"Error in chat with functions: {e}")
            return {
                "error": str(e),
                "success": False,
                "content": "I apologize, but I encountered an issue processing your request. Please try again.",
            }

    async def create_langchain_llm(
        self, model: Optional[str] = None, temperature: Optional[float] = None
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
            model_name = model or settings.OPENAI_MODEL or "gpt-4"
            temp = temperature if temperature is not None else (settings.OPENAI_TEMPERATURE or 0.7)

            logger.info(f"🔗 Creating LangChain LLM with {model_name}")

            # Create LangChain LLM instance
            llm = ChatOpenAI(
                model=model_name,
                temperature=temp,
                openai_api_key=self.api_key,
                streaming=False,
            )

            return llm

        except Exception as e:
            logger.error(f"Error creating LangChain LLM: {e}")
            return None

    # ============================================================================
    # Additional enhanced adapter methods
    # ============================================================================

    async def process_prompt_template(
        self,
        template: str,
        variables: Dict[str, Any],
        model: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Process a prompt template with variables and generate a completion

        Args:
            template: Prompt template with {variable} placeholders
            variables: Dictionary of variables to fill in the template
            model: OpenAI model to use

        Returns:
            Dict[str, Any]: Completion response
        """
        try:
            # Replace variables in template
            prompt = template
            for key, value in variables.items():
                placeholder = "{" + key + "}"
                prompt = prompt.replace(placeholder, str(value))

            # Generate completion from processed prompt
            messages = [
                {"role": "system", "content": "You are a helpful AI assistant."},
                {"role": "user", "content": prompt},
            ]

            return await self.generate_completion(messages, model=model)

        except Exception as e:
            logger.error(f"Error processing prompt template: {e}")
            return {
                "error": str(e),
                "success": False,
                "content": "Error processing prompt template",
            }

    async def analyze_document(
        self,
        document_text: str,
        analysis_prompt: str,
        model: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Analyze a document with a specific prompt

        Args:
            document_text: Text content of the document
            analysis_prompt: Prompt specifying the analysis to perform
            model: OpenAI model to use

        Returns:
            Dict[str, Any]: Analysis response
        """
        try:
            # Create a message sequence for document analysis
            messages = [
                {"role": "system", "content": "You are an expert document analyzer."},
                {
                    "role": "user",
                    "content": f"Please analyze the following document according to these instructions: {analysis_prompt}\n\nDOCUMENT: {document_text}",
                },
            ]

            logger.info(f"📄 Analyzing document of {len(document_text)} characters")
            return await self.generate_completion(messages, model=model)

        except Exception as e:
            logger.error(f"Error analyzing document: {e}")
            return {
                "error": str(e),
                "success": False,
                "content": "Error analyzing document",
            }


# Create a singleton instance
openai_adapter = OpenAIAdapter()


# Backward compatibility function
def get_openai_client() -> Optional[AsyncOpenAI]:
    """
    Get OpenAI client - backward compatibility function

    Returns:
        Optional[AsyncOpenAI]: Initialized OpenAI client or None if connection fails
    """
    return openai_adapter.get_client()


# Export classes and convenience functions
__all__ = ["OpenAIAdapter", "openai_adapter", "get_openai_client"]
