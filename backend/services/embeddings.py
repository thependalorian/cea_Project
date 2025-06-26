"""
Embeddings service for the Climate Economy Assistant.
"""

from typing import List, Optional
import os
from langchain_openai import OpenAIEmbeddings
import structlog

from ..utils.logger import get_logger

logger = get_logger(__name__)


class EmbeddingService:
    """Service for generating embeddings."""

    _instance = None
    _embeddings = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        """Initialize the embeddings service."""
        if not self._embeddings:
            self._embeddings = OpenAIEmbeddings(
                openai_api_key=os.getenv("OPENAI_API_KEY")
            )
            self.logger = logger.bind(service="EmbeddingService")

    async def embed_text(self, text: str) -> List[float]:
        """Generate embeddings for text."""
        try:
            embedding = await self._embeddings.aembed_query(text)
            return embedding
        except Exception as e:
            self.logger.error("Error generating embedding", error=str(e))
            raise

    async def embed_texts(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for multiple texts."""
        try:
            embeddings = await self._embeddings.aembed_documents(texts)
            return embeddings
        except Exception as e:
            self.logger.error("Error generating embeddings", error=str(e))
            raise


def get_embedding_service() -> EmbeddingService:
    """Get the embedding service instance."""
    return EmbeddingService()
