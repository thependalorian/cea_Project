"""
Langgraph service for the Climate Economy Assistant.
"""

from typing import Dict, Any, Optional, List
from datetime import datetime
import asyncio

from backend.utils.logger import get_logger
from backend.agents.base.agent_state import AgentState
from backend.agents.base.semantic_analyzer import SemanticAnalyzer
from backend.agents.semantic_router import SemanticRouter
from backend.agents.agent_coordinator import AgentCoordinator

logger = get_logger(__name__)


class LanggraphService:
    """Service for managing Langgraph workflows and agent coordination."""

    def __init__(self, database=None, redis_client=None):
        """Initialize the Langgraph service."""
        self.database = database
        self.redis_client = redis_client
        self.semantic_analyzer = SemanticAnalyzer()
        self.semantic_router = SemanticRouter()
        self.agent_coordinator = AgentCoordinator()

    async def run_graph(
        self,
        message: str,
        user_id: str,
        conversation_id: str,
        context: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Run a message through the Langgraph workflow.

        Args:
            message: User message to process
            user_id: ID of the user
            conversation_id: ID of the conversation
            context: Optional additional context

        Returns:
            Dict containing workflow results
        """
        try:
            # Initialize state
            state = AgentState(
                messages=[],
                user_id=user_id,
                conversation_id=conversation_id,
                context=context or {},
            )

            # Analyze message semantics
            analysis = await self.semantic_analyzer.analyze_text(message)
            state.context["analysis"] = analysis

            # Route to appropriate agent
            agent_id = await self.semantic_router.route_message(
                message=message, analysis=analysis, user_id=user_id
            )
            state.context["agent_id"] = agent_id

            # Process with coordinator
            result = await self.agent_coordinator.process_message(
                message=message, state=state
            )

            # Store workflow results if database available
            if self.database:
                await self._store_workflow_results(
                    user_id=user_id,
                    conversation_id=conversation_id,
                    message=message,
                    analysis=analysis,
                    agent_id=agent_id,
                    result=result,
                )

            return {
                "success": True,
                "analysis": analysis,
                "agent_id": agent_id,
                "result": result,
            }

        except Exception as e:
            logger.error(f"Error running Langgraph workflow: {e}")
            return {"success": False, "error": str(e)}

    async def _store_workflow_results(
        self,
        user_id: str,
        conversation_id: str,
        message: str,
        analysis: Dict[str, Any],
        agent_id: str,
        result: Dict[str, Any],
    ) -> None:
        """Store workflow results in the database."""
        try:
            await self.database.table("workflow_results").insert(
                {
                    "user_id": user_id,
                    "conversation_id": conversation_id,
                    "message": message,
                    "analysis": analysis,
                    "agent_id": agent_id,
                    "result": result,
                    "created_at": datetime.utcnow().isoformat(),
                }
            ).execute()

        except Exception as e:
            logger.error(f"Error storing workflow results: {e}")
            raise
