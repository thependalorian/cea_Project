import logging

"""
Carmen - Cultural Liaison Agent
Specializes in cultural adaptation and community relations for environmental justice initiatives.
"""

from typing import Dict, Any, List
import logging
from datetime import datetime
from langchain_core.tools import tool
from langgraph.types import Command

# from langgraph.prebuilt import InjectedState
from typing import Annotated, Literal

from backend.agents.base.agent_base import BaseAgent, AgentState

logger = logging.getLogger(__name__)


class CarmenAgent(BaseAgent):
    """
    Carmen - Cultural Liaison
    Responsible for cultural adaptation and community relations for environmental justice initiatives
    """

    def __init__(self):
        super().__init__(
            name="Carmen",
            description="Cultural Liaison specializing in cultural adaptation and community relations",
            intelligence_level=8.5,
            tools=[
                "search_ej_communities",
                "cultural_competency_assessment",
                "community_relations",
                "multilingual_resources",
                "cultural_mediation",
            ],
        )

    async def process_message(self, state: AgentState) -> Command[Literal["ej_team"]]:
        """Process message with cultural liaison focus"""
        try:
            user_message = next(
                (m["content"] for m in state.messages if m.get("role") == "user"), ""
            )

            response = "I'm Carmen, your Cultural Liaison. I help bridge cultural differences and ensure environmental justice initiatives are culturally appropriate and inclusive for all communities."

            message = {
                "role": "assistant",
                "content": response,
                "agent": "carmen",
                "team": "ej_team",
                "timestamp": datetime.now().isoformat(),
                "metadata": {
                    "specialization": "cultural_liaison",
                    "confidence_score": 0.9,
                },
            }

            new_messages = state.messages + [message]

            return Command(
                goto="ej_team",
                update={"messages": new_messages, "current_agent": "carmen"},
            )

        except Exception as e:
            logger.error(f"Error in Carmen agent: {str(e)}")
            return Command(
                goto="ej_team",
                update={
                    "messages": state.messages
                    + [
                        {
                            "role": "assistant",
                            "content": f"I apologize, but I encountered an error. {str(e)}",
                            "agent": "carmen",
                        }
                    ]
                },
            )
