"""
Memory service implementation for the Climate Economy Assistant.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
import structlog
from langchain_core.embeddings import Embeddings
from langchain_openai import OpenAIEmbeddings
from langchain.vectorstores.supabase import SupabaseVectorStore

from ..utils.logger import get_logger
from ..config.supabase import get_supabase_client

logger = get_logger(__name__)


class MemoryService:
    """Service for managing memory storage and retrieval."""

    def __init__(self):
        """Initialize the memory service."""
        self.supabase = get_supabase_client()
        self.embeddings = OpenAIEmbeddings()
        self.vector_store = SupabaseVectorStore(
            client=self.supabase,
            embedding=self.embeddings,
            table_name="memory",
            query_name="match_memory",
        )
        self.logger = logger.bind(service="MemoryService")

    async def store(self, entry: Dict[str, Any]) -> Dict[str, Any]:
        """Store a memory entry."""
        try:
            # Generate embedding for content
            embedding = await self.embeddings.embed_query(entry["content"])

            # Store in Supabase
            result = await self.vector_store.add_texts(
                texts=[entry["content"]],
                metadatas=[
                    {
                        "user_id": entry["user_id"],
                        "timestamp": entry["timestamp"].isoformat(),
                        **entry["metadata"],
                    }
                ],
                embeddings=[embedding],
            )

            return {"id": result[0], "timestamp": entry["timestamp"]}
        except Exception as e:
            self.logger.error("Error storing memory", error=str(e))
            raise

    async def search(
        self,
        query: str,
        limit: int = 10,
        metadata_filter: Optional[Dict[str, Any]] = None,
    ) -> List[Dict[str, Any]]:
        """Search memory entries."""
        try:
            # Generate query embedding
            embedding = await self.embeddings.embed_query(query)

            # Search vector store
            results = await self.vector_store.similarity_search_with_score(
                query=query, k=limit, filter=metadata_filter
            )

            # Format results
            formatted_results = []
            for doc, score in results:
                formatted_results.append(
                    {
                        "content": doc.page_content,
                        "metadata": doc.metadata,
                        "similarity_score": score,
                    }
                )

            return formatted_results
        except Exception as e:
            self.logger.error("Error searching memory", error=str(e))
            raise

    async def get_recent(self, user_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Get recent memory entries."""
        try:
            # Query Supabase directly for recent entries
            result = (
                await self.supabase.table("memory")
                .select("*")
                .eq("user_id", user_id)
                .order("timestamp", desc=True)
                .limit(limit)
                .execute()
            )

            return result.data
        except Exception as e:
            self.logger.error("Error getting recent memories", error=str(e))
            raise

    async def delete(self, memory_id: str, user_id: str) -> Dict[str, Any]:
        """Delete a memory entry."""
        try:
            # Delete from Supabase
            result = (
                await self.supabase.table("memory")
                .delete()
                .match({"id": memory_id, "user_id": user_id})
                .execute()
            )

            return {"id": memory_id, "deleted_at": datetime.utcnow().isoformat()}
        except Exception as e:
            self.logger.error("Error deleting memory", error=str(e))
            raise
