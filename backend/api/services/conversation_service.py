"""
Conversation service for the Climate Economy Assistant.
"""

from typing import Dict, Any, List, Optional
import structlog
from datetime import datetime

from backend.database.supabase_client import supabase
from backend.api.models.conversation import ConversationCreate, MessageCreate

logger = structlog.get_logger(__name__)


class ConversationService:
    """Service for managing conversations."""

    async def create_conversation(
        self, user_id: str, data: ConversationCreate
    ) -> Dict[str, Any]:
        """Create a new conversation."""
        try:
            # Create conversation
            conversation = (
                await supabase.table("conversations")
                .insert(
                    {
                        "user_id": user_id,
                        "current_agent": "default",
                        "metadata": data.metadata,
                        "created_at": datetime.utcnow().isoformat(),
                        "updated_at": datetime.utcnow().isoformat(),
                    }
                )
                .execute()
            )

            if not conversation.data:
                raise Exception("Failed to create conversation")

            conversation_id = conversation.data[0]["id"]

            # Create initial message
            message = (
                await supabase.table("messages")
                .insert(
                    {
                        "conversation_id": conversation_id,
                        "content": data.initial_message,
                        "role": "user",
                        "metadata": {},
                        "created_at": datetime.utcnow().isoformat(),
                    }
                )
                .execute()
            )

            if not message.data:
                raise Exception("Failed to create initial message")

            # Get full conversation with messages
            return await self.get_conversation(conversation_id, user_id)

        except Exception as e:
            logger.error(f"Error creating conversation: {e}")
            raise

    async def get_conversation(
        self, conversation_id: str, user_id: str
    ) -> Optional[Dict[str, Any]]:
        """Get a conversation by ID."""
        try:
            # Get conversation
            conversation = (
                await supabase.table("conversations")
                .select("*")
                .eq("id", conversation_id)
                .eq("user_id", user_id)
                .execute()
            )

            if not conversation.data:
                return None

            # Get messages
            messages = (
                await supabase.table("messages")
                .select("*")
                .eq("conversation_id", conversation_id)
                .order("created_at")
                .execute()
            )

            # Combine data
            result = conversation.data[0]
            result["messages"] = messages.data or []
            return result

        except Exception as e:
            logger.error(f"Error getting conversation: {e}")
            raise

    async def list_conversations(
        self, user_id: str, limit: int = 10, offset: int = 0
    ) -> List[Dict[str, Any]]:
        """List conversations for a user."""
        try:
            conversations = (
                await supabase.table("conversations")
                .select("*")
                .eq("user_id", user_id)
                .order("updated_at", desc=True)
                .limit(limit)
                .offset(offset)
                .execute()
            )

            return conversations.data or []

        except Exception as e:
            logger.error(f"Error listing conversations: {e}")
            raise

    async def send_message(
        self, conversation_id: str, user_id: str, message: MessageCreate
    ) -> Dict[str, Any]:
        """Send a message in a conversation."""
        try:
            # Create message
            result = (
                await supabase.table("messages")
                .insert(
                    {
                        "conversation_id": conversation_id,
                        "content": message.content,
                        "role": message.role,
                        "metadata": message.metadata,
                        "created_at": datetime.utcnow().isoformat(),
                    }
                )
                .execute()
            )

            if not result.data:
                raise Exception("Failed to create message")

            # Update conversation
            await supabase.table("conversations").update(
                {"updated_at": datetime.utcnow().isoformat()}
            ).eq("id", conversation_id).eq("user_id", user_id).execute()

            return result.data[0]

        except Exception as e:
            logger.error(f"Error sending message: {e}")
            raise

    async def delete_conversation(self, conversation_id: str, user_id: str) -> bool:
        """Delete a conversation."""
        try:
            # Delete messages first
            await supabase.table("messages").delete().eq(
                "conversation_id", conversation_id
            ).execute()

            # Delete conversation
            result = (
                await supabase.table("conversations")
                .delete()
                .eq("id", conversation_id)
                .eq("user_id", user_id)
                .execute()
            )

            return bool(result.data)

        except Exception as e:
            logger.error(f"Error deleting conversation: {e}")
            raise
