"""
Base agent state for the Climate Economy Assistant.
"""

from pydantic import BaseModel
from typing import Dict, Any, Optional, List
from datetime import datetime
from langchain_core.messages import BaseMessage


class AgentState(BaseModel):
    """Base agent state model."""

    agent_id: str
    conversation_id: str
    user_id: str
    current_step: str
    memory: Dict[str, Any]
    messages: List[BaseMessage] = []
    metadata: Optional[Dict[str, Any]] = None
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()

    def update_step(self, step: str) -> None:
        """Update the current step."""
        self.current_step = step
        self.updated_at = datetime.utcnow()

    def update_memory(self, key: str, value: Any) -> None:
        """Update a memory value."""
        self.memory[key] = value
        self.updated_at = datetime.utcnow()

    def get_memory(self, key: str) -> Optional[Any]:
        """Get a memory value."""
        return self.memory.get(key)

    def clear_memory(self) -> None:
        """Clear all memory."""
        self.memory = {}
        self.updated_at = datetime.utcnow()

    def to_dict(self) -> Dict[str, Any]:
        """Convert state to dictionary."""
        return {
            "agent_id": self.agent_id,
            "conversation_id": self.conversation_id,
            "user_id": self.user_id,
            "current_step": self.current_step,
            "memory": self.memory,
            "messages": [msg.dict() for msg in self.messages],
            "metadata": self.metadata,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "AgentState":
        """Create state from dictionary."""
        return cls(
            agent_id=data["agent_id"],
            conversation_id=data["conversation_id"],
            user_id=data["user_id"],
            current_step=data["current_step"],
            memory=data["memory"],
            messages=data.get("messages", []),
            metadata=data.get("metadata"),
            created_at=datetime.fromisoformat(data["created_at"]),
            updated_at=datetime.fromisoformat(data["updated_at"]),
        )
