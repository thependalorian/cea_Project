"""
Climate Economy Assistant Agent Coordinator
Adopts proven patterns from cea2.py for robust multi-agent coordination with semantic routing.
Enhanced with agent awareness and advanced coordination patterns.
"""

import asyncio
import logging
import json
import uuid
import time
from datetime import datetime
from typing import Dict, Any, List, Optional, Union, Literal
from dataclasses import dataclass

from langgraph.graph import StateGraph, START, END
from langgraph.types import Command, Send, interrupt
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_openai import ChatOpenAI
from langchain_groq import ChatGroq

from backend.agents.base.agent_state import AgentState
from backend.agents.langgraph.framework import ConversationState


# Defer graph import to avoid circular dependency
def get_climate_assistant_graph():
    """Lazy import to avoid circular dependency"""
    try:
        from backend.agents.langgraph.framework import (
            create_enhanced_climate_assistant_graph,
        )

        return create_enhanced_climate_assistant_graph()
    except ImportError:
        logger.warning("Enhanced framework not available, using basic fallback")
        return None


from backend.database.redis_client import redis_client
from backend.database.supabase_client import supabase

# Absolute imports for semantic routing (following cea2.py patterns)
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

# Initialize models for semantic routing (following cea2.py patterns)
MODEL_PROVIDER = os.getenv("MODEL_PROVIDER", "openai")
MODEL_NAME = os.getenv("MODEL_NAME", "gpt-3.5-turbo")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Initialize semantic routing model
semantic_model = (
    ChatGroq(model_name=MODEL_NAME)
    if MODEL_PROVIDER.lower() == "groq" and GROQ_API_KEY
    else ChatOpenAI(model_name=MODEL_NAME)
)


@dataclass
class AgentResponse:
    """Standardized agent response format"""

    content: str
    agent: str
    team: str
    confidence: float
    metadata: Dict[str, Any]
    conversation_id: str
    processing_time_ms: Optional[float] = None


class AgentCoordinator:
    """
    Enhanced Agent Coordinator using LangGraph framework with semantic routing
    Adopts patterns from cea2.py for robust multi-agent orchestration
    """

    def __init__(self):
        self.redis = redis_client
        self.compiled_graph = None
        self.semantic_model = semantic_model
        self._initialize_graph()

    def _initialize_graph(self):
        """Initialize the compiled LangGraph"""
        try:
            self.compiled_graph = get_climate_assistant_graph()
            logger.info("Agent coordinator initialized with compiled LangGraph")
        except Exception as e:
            logger.error(f"Failed to initialize LangGraph: {e}")
            self.compiled_graph = None

    async def semantic_route_message(self, message: str) -> Dict[str, Any]:
        """
        Use semantic analysis to route messages intelligently
        Following cea2.py patterns for semantic routing
        """
        try:
            # Create semantic routing prompt (following cea2.py patterns)
            routing_prompt = """You are the Climate Economy Assistant Semantic Router.
Analyze the user's query and determine:
1. Primary domain/topic
2. Most appropriate team 
3. Best agent within that team
4. Confidence score (0.0-1.0)
5. Routing reason

Teams and their agents:
- veterans_team: marcus (lead), james (skills translator), sarah (career coach), david (benefits specialist)
- ej_team: miguel (lead), maria (engagement), andre (jobs navigator), carmen (cultural liaison)
- international_team: liv (lead), mei (asia-pacific), raj (south asia/middle east), sofia (europe/africa)
- specialists_team: pendo (navigator), lauren (clean energy), alex (green finance), jasmine (sustainability)
- support_team: mai (general), michael (technical), elena (UX), thomas (data/analytics)

Respond in JSON format:
{
    "primary_domain": "domain_name",
    "team": "team_name", 
    "agent": "agent_name",
    "confidence_score": 0.0-1.0,
    "routing_reason": "brief explanation",
    "requires_human_review": boolean,
    "complexity_level": "low|medium|high"
}"""

            # Get semantic analysis
            response = await self.semantic_model.ainvoke(
                [
                    SystemMessage(content=routing_prompt),
                    HumanMessage(content=f"User query: {message}"),
                ]
            )

            # Parse JSON response
            try:
                routing_data = json.loads(response.content)

                # Validate required fields
                required_fields = [
                    "primary_domain",
                    "team",
                    "agent",
                    "confidence_score",
                    "routing_reason",
                ]
                for field in required_fields:
                    if field not in routing_data:
                        raise ValueError(f"Missing required field: {field}")

                # Ensure confidence is a float
                routing_data["confidence_score"] = float(
                    routing_data["confidence_score"]
                )

                logger.info(
                    f"Semantic routing: {routing_data['agent']} ({routing_data['team']}) - {routing_data['confidence_score']:.2f}"
                )
                return routing_data

            except (json.JSONDecodeError, ValueError) as e:
                logger.error(f"Failed to parse semantic routing response: {e}")
                # Fallback to default routing
                return await self._fallback_semantic_routing(message)

        except Exception as e:
            logger.error(f"Error in semantic routing: {e}")
            return await self._fallback_semantic_routing(message)

    async def _fallback_semantic_routing(self, message: str) -> Dict[str, Any]:
        """Fallback routing when semantic analysis fails"""
        message_lower = message.lower()

        # Simple keyword-based fallback
        if "veteran" in message_lower or "military" in message_lower:
            return {
                "primary_domain": "veterans",
                "team": "veterans_team",
                "agent": "marcus",
                "confidence_score": 0.7,
                "routing_reason": "Fallback routing - veteran keywords detected",
                "requires_human_review": False,
                "complexity_level": "medium",
            }
        elif "community" in message_lower or "environmental justice" in message_lower:
            return {
                "primary_domain": "environmental_justice",
                "team": "ej_team",
                "agent": "miguel",
                "confidence_score": 0.7,
                "routing_reason": "Fallback routing - EJ keywords detected",
                "requires_human_review": False,
                "complexity_level": "medium",
            }
        elif "international" in message_lower or "global" in message_lower:
            return {
                "primary_domain": "international",
                "team": "international_team",
                "agent": "liv",
                "confidence_score": 0.7,
                "routing_reason": "Fallback routing - international keywords detected",
                "requires_human_review": False,
                "complexity_level": "medium",
            }
        else:
            return {
                "primary_domain": "general",
                "team": "specialists_team",
                "agent": "pendo",
                "confidence_score": 0.6,
                "routing_reason": "Fallback routing - default to specialists",
                "requires_human_review": False,
                "complexity_level": "low",
            }

    async def generate_intelligent_response(
        self,
        message: str,
        routing_data: Dict[str, Any],
        conversation_id: str,
        user_id: str,
    ) -> str:
        """
        Generate intelligent responses using agent specialization
        Following cea2.py patterns for agent intelligence
        """
        agent = routing_data["agent"]
        team = routing_data["team"]

        # Get agent-specific system prompt
        agent_prompt = self._get_agent_system_prompt(agent, team)

        # Get conversation context if available
        conversation_context = await self._get_conversation_context(conversation_id)

        # Create context-aware prompt
        context_prompt = ""
        if conversation_context:
            context_prompt = f"\n\nConversation context: {conversation_context}"

        try:
            # Generate response with agent intelligence
            response = await self.semantic_model.ainvoke(
                [
                    SystemMessage(content=agent_prompt + context_prompt),
                    HumanMessage(content=message),
                ]
            )

            return response.content

        except Exception as e:
            logger.error(f"Error generating intelligent response: {e}")
            return f"I apologize, but I encountered an error processing your request. Please try again."

    def _get_agent_system_prompt(self, agent: str, team: str) -> str:
        """Get specialized system prompt for each agent (following cea2.py patterns)"""

        # Veterans Team Agents
        if agent == "marcus":
            return """You are Marcus, the Veterans Program Lead for the Climate Economy Assistant.
You specialize in helping veterans transition to climate careers. You understand military culture,
veteran challenges, and how military skills translate to climate economy opportunities.
Be empathetic, practical, and leverage your understanding of military experience."""

        elif agent == "james":
            return """You are James, the Military Skills Translator for the Climate Economy Assistant.
You specialize in translating military skills and experience into civilian terms for climate careers.
Help veterans identify transferable skills and articulate them effectively to climate employers."""

        elif agent == "sarah":
            return """You are Sarah, the Veterans Career Coach for the Climate Economy Assistant.
You provide career coaching, resume review, and interview preparation specifically for veterans
entering climate careers. Be supportive and provide actionable career guidance."""

        elif agent == "david":
            return """You are David, the Veterans Support Specialist for the Climate Economy Assistant.
You specialize in VA benefits, support services, and crisis resources for veterans.
Provide accurate information about benefits and connect veterans with appropriate resources."""

        # Environmental Justice Team Agents
        elif agent == "miguel":
            return """You are Miguel, the EJ Communities Program Lead for the Climate Economy Assistant.
You specialize in environmental justice, community organizing, and policy advocacy.
Help communities address environmental concerns and connect with resources and opportunities."""

        elif agent == "maria":
            return """You are Maria, the Community Engagement Specialist for the Climate Economy Assistant.
You specialize in community organizing, stakeholder engagement, and coalition building.
Help communities develop effective engagement strategies and build powerful coalitions."""

        elif agent == "andre":
            return """You are Andre, the Green Jobs Navigator for the Climate Economy Assistant.
You specialize in green job placement, workforce development, and training programs.
Connect people with green job opportunities and the training needed to succeed."""

        elif agent == "carmen":
            return """You are Carmen, the Cultural Liaison for the Climate Economy Assistant.
You specialize in cultural adaptation, community relations, and multilingual support.
Help bridge cultural gaps and ensure inclusive access to climate opportunities."""

        # International Team Agents
        elif agent == "liv":
            return """You are Liv, the International Program Lead for the Climate Economy Assistant.
You specialize in international climate policy, global cooperation, and climate diplomacy.
Help people understand international climate frameworks and global opportunities."""

        elif agent == "mei":
            return """You are Mei, the Asia-Pacific Climate Specialist for the Climate Economy Assistant.
You specialize in Asia-Pacific climate policies, regional solutions, and cross-border partnerships.
Provide expertise on climate opportunities and policies in the Asia-Pacific region."""

        elif agent == "raj":
            return """You are Raj, the South Asia and Middle East Climate Specialist for the Climate Economy Assistant.
You specialize in South Asia and Middle East climate policies, regional adaptation, and immigration pathways.
Help people navigate climate opportunities and visa pathways for these regions."""

        elif agent == "sofia":
            return """You are Sofia, the Europe and Africa Climate Specialist for the Climate Economy Assistant.
You specialize in EU Green Deal, African climate solutions, and climate finance.
Provide expertise on European and African climate policies and opportunities."""

        # Specialists Team Agents
        elif agent == "pendo":
            return """You are Pendo, the Climate Economy Navigator for the Climate Economy Assistant.
You are the main routing specialist who helps people find their path in the climate economy.
Provide comprehensive guidance and connect people with appropriate specialists when needed."""

        elif agent == "lauren":
            return """You are Lauren, the Clean Energy Careers Specialist for the Climate Economy Assistant.
You specialize in renewable energy, clean technology, and energy policy careers.
Help people understand and access opportunities in the clean energy sector."""

        elif agent == "alex":
            return """You are Alex, the Green Finance and Investment Specialist for the Climate Economy Assistant.
You specialize in climate finance, green investments, ESG, and sustainable banking.
Help people understand and access opportunities in green finance and sustainable investing."""

        elif agent == "jasmine":
            return """You are Jasmine, the Sustainability and Circular Economy Specialist for the Climate Economy Assistant.
You specialize in circular economy, waste management, and sustainable business practices.
Help people understand sustainability frameworks and circular economy opportunities."""

        # Support Team Agents
        elif agent == "mai":
            return """You are Mai, the General Support Specialist for the Climate Economy Assistant.
You provide general assistance, platform guidance, and user support for all climate career questions.
Be helpful, friendly, and guide users to appropriate resources and specialists."""

        elif agent == "michael":
            return """You are Michael, the Technical Support Specialist for the Climate Economy Assistant.
You provide technical support, system troubleshooting, and platform assistance.
Help users navigate technical issues and platform functionality."""

        elif agent == "elena":
            return """You are Elena, the User Experience Specialist for the Climate Economy Assistant.
You specialize in user experience, accessibility, and platform usability.
Help improve user interactions and ensure accessible experiences for all users."""

        elif agent == "thomas":
            return """You are Thomas, the Data and Analytics Specialist for the Climate Economy Assistant.
You specialize in data analysis, climate data, market insights, and trend reporting.
Provide data-driven insights and analytics to support climate career decisions."""

        # Default fallback
        else:
            return """You are a Climate Economy Assistant specialist.
Help users navigate climate career opportunities with expertise and empathy."""

    async def _get_conversation_context(self, conversation_id: str) -> str:
        """Get recent conversation context for continuity"""
        try:
            if not supabase:
                return ""

            # Get last 5 messages for context
            result = (
                supabase.client.table("conversation_messages")
                .select("role, content, specialist_type")
                .eq("conversation_id", conversation_id)
                .order("created_at", desc=True)
                .limit(5)
                .execute()
            )

            if result.data:
                context_messages = []
                for msg in reversed(result.data):  # Reverse to get chronological order
                    role = msg.get("role", "user")
                    content = msg.get("content", "")
                    agent = msg.get("specialist_type", "")

                    if role == "user":
                        context_messages.append(f"User: {content}")
                    elif role == "assistant" and agent:
                        context_messages.append(f"{agent}: {content}")

                return " | ".join(context_messages[-3:])  # Last 3 exchanges

            return ""

        except Exception as e:
            logger.error(f"Error getting conversation context: {e}")
            return ""

    async def process_message(
        self,
        message: str,
        user_id: str,
        conversation_id: Optional[str] = None,
        config: Optional[Dict[str, Any]] = None,
    ) -> AgentResponse:
        """
        Process a message through the agent system using semantic routing and intelligence

        Args:
            message: User message to process
            user_id: ID of the user sending the message
            conversation_id: Optional conversation ID (will be generated if not provided)
            config: Optional configuration for processing

        Returns:
            AgentResponse with the processed result
        """
        start_time = datetime.now()

        # Generate conversation ID if not provided
        if not conversation_id:
            conversation_id = (
                f"conv_{int(start_time.timestamp())}_{uuid.uuid4().hex[:8]}"
            )

        try:
            logger.info(
                f"Processing message for conversation {conversation_id}, user {user_id}"
            )

            # Step 1: Semantic routing
            routing_data = await self.semantic_route_message(message)

            # Step 2: Generate intelligent response
            response_content = await self.generate_intelligent_response(
                message, routing_data, conversation_id, user_id
            )

            # Step 3: Calculate processing time
            processing_time = (datetime.now() - start_time).total_seconds() * 1000

            # Step 4: Create standardized response
            response = AgentResponse(
                content=response_content,
                agent=routing_data["agent"],
                team=routing_data["team"],
                confidence=routing_data["confidence_score"],
                metadata={
                    "routing_reason": routing_data["routing_reason"],
                    "primary_domain": routing_data["primary_domain"],
                    "requires_human_review": routing_data.get(
                        "requires_human_review", False
                    ),
                    "complexity_level": routing_data.get("complexity_level", "medium"),
                    "semantic_routing": True,
                    "processing_time_ms": processing_time,
                },
                conversation_id=conversation_id,
                processing_time_ms=processing_time,
            )

            # Step 5: Store conversation data
            await self._store_conversation_data(message, response, user_id)

            logger.info(
                f"Message processed successfully in {processing_time:.2f}ms by {response.agent} ({response.team})"
            )
            return response

        except Exception as e:
            logger.error(f"Error processing message: {e}")

            # Calculate processing time for error case
            processing_time = (datetime.now() - start_time).total_seconds() * 1000

            # Return error response
            return AgentResponse(
                content="I apologize, but I encountered an error processing your request. Please try again.",
                agent="error_handler",
                team="error",
                confidence=0.0,
                metadata={"error": str(e), "semantic_routing": False},
                conversation_id=conversation_id,
                processing_time_ms=processing_time,
            )

    async def _store_conversation_data(
        self, user_message: str, response: AgentResponse, user_id: str
    ):
        """Store conversation data in database"""
        try:
            if not supabase:
                return

            conversation_id = response.conversation_id
            timestamp = datetime.now().isoformat()

            # Store user message
            await self._store_message(
                conversation_id=conversation_id,
                role="user",
                content=user_message,
                user_id=user_id,
                timestamp=timestamp,
            )

            # Store assistant response
            await self._store_message(
                conversation_id=conversation_id,
                role="assistant",
                content=response.content,
                user_id=user_id,
                agent=response.agent,
                team=response.team,
                metadata=response.metadata,
                timestamp=timestamp,
            )

            # Update analytics
            await self._update_analytics(conversation_id, response, user_id)

        except Exception as e:
            logger.error(f"Error storing conversation data: {e}")

    async def _store_message(
        self,
        conversation_id: str,
        role: str,
        content: str,
        user_id: str,
        timestamp: str,
        agent: str = None,
        team: str = None,
        metadata: Dict[str, Any] = None,
    ):
        """Store individual message"""
        try:
            message_data = {
                "id": str(uuid.uuid4()),
                "conversation_id": conversation_id,
                "role": role,
                "content": content,
                "specialist_type": agent,
                "metadata": metadata or {},
                "created_at": timestamp,
                "content_type": "text",
                "processed": True,
            }

            result = (
                supabase.client.table("conversation_messages")
                .insert(message_data)
                .execute()
            )

            if result.data:
                logger.debug(f"Stored message: {role} - {agent or 'user'}")
            else:
                logger.warning(f"Failed to store message: {result}")

        except Exception as e:
            logger.error(f"Error storing message: {e}")

    async def _update_analytics(
        self, conversation_id: str, response: AgentResponse, user_id: str
    ):
        """Update conversation analytics"""
        try:
            analytics_data = {
                "conversation_id": conversation_id,
                "user_id": user_id,
                "topics_discussed": [
                    response.metadata.get("primary_domain", "general")
                ],
                "analyzed_at": datetime.now().isoformat(),
                "messages_received": 1,
                "messages_sent": 1,
                "average_response_time_ms": response.processing_time_ms,
                "routing_method": "semantic",
                "agent_used": response.agent,
                "team_used": response.team,
                "confidence_score": response.confidence,
            }

            # Check if analytics record exists
            existing = (
                supabase.client.table("conversation_analytics")
                .select("id")
                .eq("conversation_id", conversation_id)
                .execute()
            )

            if existing.data:
                # Update existing record
                analytics_id = existing.data[0]["id"]
                supabase.client.table("conversation_analytics").update(
                    analytics_data
                ).eq("id", analytics_id).execute()
            else:
                # Create new record
                supabase.client.table("conversation_analytics").insert(
                    analytics_data
                ).execute()

        except Exception as e:
            logger.error(f"Error updating analytics: {e}")

    # ... existing code for state management methods ...
    async def create_agent_state(
        self,
        agent_id: str,
        conversation_id: str,
        user_id: str,
        initial_step: str = "start",
        metadata: Optional[Dict[str, Any]] = None,
    ) -> AgentState:
        """Create a new agent state"""
        try:
            state = AgentState(
                agent_id=agent_id,
                conversation_id=conversation_id,
                user_id=user_id,
                current_step=initial_step,
                memory={},
                messages=[],
                metadata=metadata or {},
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )

            # Store in Redis if available
            if self.redis:
                key = f"agent_state:{agent_id}:{conversation_id}"
                await self.redis.set(key, state.to_dict(), ttl=86400)  # 24 hours expiry
                logger.debug(f"Created and stored agent state: {agent_id}")

            return state

        except Exception as e:
            logger.error(f"Error creating agent state: {e}")
            raise

    async def get_agent_state(
        self, agent_id: str, conversation_id: str
    ) -> Optional[AgentState]:
        """Retrieve an agent state"""
        try:
            if not self.redis:
                logger.warning("Redis not available for state retrieval")
                return None

            key = f"agent_state:{agent_id}:{conversation_id}"
            data = await self.redis.get(key)

            if not data:
                return None

            return AgentState.from_dict(data)

        except Exception as e:
            logger.error(f"Error retrieving agent state: {e}")
            return None

    async def update_agent_state(self, state: AgentState) -> bool:
        """Update an existing agent state"""
        try:
            if not self.redis:
                logger.warning("Redis not available for state update")
                return False

            state.updated_at = datetime.utcnow()

            key = f"agent_state:{state.agent_id}:{state.conversation_id}"
            await self.redis.set(key, state.to_dict(), ttl=86400)  # 24 hours expiry

            logger.debug(f"Updated agent state: {state.agent_id}")
            return True

        except Exception as e:
            logger.error(f"Error updating agent state: {e}")
            return False

    async def list_agent_states(
        self, pattern: str = "agent_state:*"
    ) -> List[AgentState]:
        """List all agent states matching a pattern"""
        try:
            if not self.redis:
                logger.warning("Redis not available for state listing")
                return []

            keys = await self.redis.keys(pattern)
            states = []

            for key in keys:
                data = await self.redis.get(key)
                if data:
                    states.append(AgentState.from_dict(data))

            return states

        except Exception as e:
            logger.error(f"Error listing agent states: {e}")
            return []

    async def delete_agent_state(self, agent_id: str, conversation_id: str) -> bool:
        """Delete an agent state"""
        try:
            if not self.redis:
                logger.warning("Redis not available for state deletion")
                return False

            key = f"agent_state:{agent_id}:{conversation_id}"
            deleted = await self.redis.delete(key)

            logger.debug(f"Deleted agent state: {agent_id} (success: {bool(deleted)})")
            return bool(deleted)

        except Exception as e:
            logger.error(f"Error deleting agent state: {e}")
            return False

    async def get_conversation_history(
        self, conversation_id: str, limit: int = 50
    ) -> List[Dict[str, Any]]:
        """Get conversation history from database"""
        try:
            if not supabase:
                logger.warning("Supabase not available for conversation history")
                return []

            result = (
                supabase.client.table("conversation_messages")
                .select("*")
                .eq("conversation_id", conversation_id)
                .order("created_at", desc=False)
                .limit(limit)
                .execute()
            )

            return result.data or []

        except Exception as e:
            logger.error(f"Error retrieving conversation history: {e}")
            return []

    async def get_agent_analytics(
        self,
        agent_id: Optional[str] = None,
        team: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> Dict[str, Any]:
        """Get analytics for agent performance"""
        try:
            if not supabase:
                logger.warning("Supabase not available for analytics")
                return {}

            query = supabase.client.table("conversation_analytics").select("*")

            if start_date:
                query = query.gte("analyzed_at", start_date.isoformat())
            if end_date:
                query = query.lte("analyzed_at", end_date.isoformat())

            result = query.execute()
            data = result.data or []

            # Process analytics data
            analytics = {
                "total_conversations": len(data),
                "average_response_time": 0,
                "agent_distribution": {},
                "team_distribution": {},
                "topics_discussed": {},
                "semantic_routing_usage": 0,
            }

            if data:
                # Calculate averages and distributions
                total_response_time = 0
                response_time_count = 0
                semantic_routing_count = 0

                for record in data:
                    # Response time
                    if record.get("average_response_time_ms"):
                        total_response_time += record["average_response_time_ms"]
                        response_time_count += 1

                    # Semantic routing usage
                    if record.get("routing_method") == "semantic":
                        semantic_routing_count += 1

                    # Agent distribution
                    agent = record.get("agent_used")
                    if agent:
                        analytics["agent_distribution"][agent] = (
                            analytics["agent_distribution"].get(agent, 0) + 1
                        )

                    # Team distribution
                    team = record.get("team_used")
                    if team:
                        analytics["team_distribution"][team] = (
                            analytics["team_distribution"].get(team, 0) + 1
                        )

                    # Topics
                    topics = record.get("topics_discussed", []) or []
                    for topic in topics:
                        analytics["topics_discussed"][topic] = (
                            analytics["topics_discussed"].get(topic, 0) + 1
                        )

                if response_time_count > 0:
                    analytics["average_response_time"] = (
                        total_response_time / response_time_count
                    )

                analytics["semantic_routing_usage"] = (
                    semantic_routing_count / len(data) if data else 0
                )

            return analytics

        except Exception as e:
            logger.error(f"Error retrieving agent analytics: {e}")
            return {}

    def get_available_agents(self) -> Dict[str, Dict[str, Any]]:
        """Get information about available agents - All 18 specialized agents with intelligence"""
        return {
            # Specialists Team (Core Team)
            "pendo": {
                "name": "Pendo",
                "description": "Climate Economy Navigator and routing specialist with semantic intelligence",
                "team": "specialists_team",
                "specializations": [
                    "Career guidance",
                    "Job market analysis",
                    "Skill development",
                    "Industry trends",
                ],
                "intelligence_level": "high",
                "routing_priority": 1,
            },
            "lauren": {
                "name": "Lauren",
                "description": "Clean energy careers specialist with deep technical knowledge",
                "team": "specialists_team",
                "specializations": [
                    "Renewable energy",
                    "Clean technology",
                    "Energy policy",
                    "Technical careers",
                ],
                "intelligence_level": "high",
                "routing_priority": 2,
            },
            "alex": {
                "name": "Alex",
                "description": "Green finance and investment specialist with market intelligence",
                "team": "specialists_team",
                "specializations": [
                    "Climate finance",
                    "Green investments",
                    "ESG",
                    "Sustainable banking",
                ],
                "intelligence_level": "high",
                "routing_priority": 2,
            },
            "jasmine": {
                "name": "Jasmine",
                "description": "Sustainability and circular economy specialist with systems thinking",
                "team": "specialists_team",
                "specializations": [
                    "Circular economy",
                    "Waste management",
                    "Sustainable business",
                    "Systems design",
                ],
                "intelligence_level": "high",
                "routing_priority": 2,
            },
            # Veterans Team (4 agents with military intelligence)
            "marcus": {
                "name": "Marcus",
                "description": "Veterans career transition specialist with military leadership intelligence",
                "team": "veterans_team",
                "specializations": [
                    "Military skill translation",
                    "Veterans benefits",
                    "Career coaching",
                    "Leadership development",
                ],
                "intelligence_level": "high",
                "routing_priority": 1,
            },
            "james": {
                "name": "James",
                "description": "Military Skills Translator specialist with deep military knowledge",
                "team": "veterans_team",
                "specializations": [
                    "Military to civilian translation",
                    "Skills assessment",
                    "Career pathways",
                    "Technical translation",
                ],
                "intelligence_level": "high",
                "routing_priority": 1,
            },
            "sarah": {
                "name": "Sarah",
                "description": "Veterans Career Coach specialist with coaching intelligence",
                "team": "veterans_team",
                "specializations": [
                    "Career coaching",
                    "Resume review",
                    "Interview preparation",
                    "Professional development",
                ],
                "intelligence_level": "high",
                "routing_priority": 2,
            },
            "david": {
                "name": "David",
                "description": "Veterans Support Specialist with benefits and crisis intelligence",
                "team": "veterans_team",
                "specializations": [
                    "VA benefits",
                    "Support services",
                    "Crisis resources",
                    "Mental health support",
                ],
                "intelligence_level": "high",
                "routing_priority": 1,
            },
            # Environmental Justice Team (4 agents with community intelligence)
            "miguel": {
                "name": "Miguel",
                "description": "Environmental justice advocacy specialist with community organizing intelligence",
                "team": "ej_team",
                "specializations": [
                    "Community organizing",
                    "Policy advocacy",
                    "Environmental health",
                    "Coalition building",
                ],
                "intelligence_level": "high",
                "routing_priority": 1,
            },
            "maria": {
                "name": "Maria",
                "description": "Community Engagement Specialist with stakeholder intelligence",
                "team": "ej_team",
                "specializations": [
                    "Community organizing",
                    "Stakeholder engagement",
                    "Coalition building",
                    "Grassroots mobilization",
                ],
                "intelligence_level": "high",
                "routing_priority": 1,
            },
            "andre": {
                "name": "Andre",
                "description": "Green Jobs Navigator with workforce development intelligence",
                "team": "ej_team",
                "specializations": [
                    "Green job placement",
                    "Workforce development",
                    "Training programs",
                    "Skills matching",
                ],
                "intelligence_level": "high",
                "routing_priority": 1,
            },
            "carmen": {
                "name": "Carmen",
                "description": "Cultural Liaison with multicultural intelligence",
                "team": "ej_team",
                "specializations": [
                    "Cultural adaptation",
                    "Community relations",
                    "Multilingual support",
                    "Cross-cultural communication",
                ],
                "intelligence_level": "high",
                "routing_priority": 2,
            },
            # International Team (4 agents with global intelligence)
            "liv": {
                "name": "Liv",
                "description": "International climate policy specialist with diplomatic intelligence",
                "team": "international_team",
                "specializations": [
                    "Global climate policies",
                    "International cooperation",
                    "Climate diplomacy",
                    "Policy analysis",
                ],
                "intelligence_level": "high",
                "routing_priority": 1,
            },
            "mei": {
                "name": "Mei",
                "description": "Asia-Pacific Climate Specialist with regional intelligence",
                "team": "international_team",
                "specializations": [
                    "Asia-Pacific policies",
                    "Regional climate solutions",
                    "Cross-border partnerships",
                    "Cultural adaptation",
                ],
                "intelligence_level": "high",
                "routing_priority": 1,
            },
            "raj": {
                "name": "Raj",
                "description": "South Asia and Middle East Climate Specialist with immigration intelligence",
                "team": "international_team",
                "specializations": [
                    "South Asia climate",
                    "Middle East policies",
                    "Regional adaptation",
                    "Immigration pathways",
                ],
                "intelligence_level": "high",
                "routing_priority": 1,
            },
            "sofia": {
                "name": "Sofia",
                "description": "Europe and Africa Climate Specialist with policy intelligence",
                "team": "international_team",
                "specializations": [
                    "EU Green Deal",
                    "African climate solutions",
                    "Climate finance",
                    "Regional cooperation",
                ],
                "intelligence_level": "high",
                "routing_priority": 1,
            },
            # Support Team (4 agents with specialized support intelligence)
            "mai": {
                "name": "Mai",
                "description": "General support specialist with comprehensive platform intelligence",
                "team": "support_team",
                "specializations": [
                    "General assistance",
                    "Platform guidance",
                    "User support",
                    "Resource navigation",
                ],
                "intelligence_level": "medium",
                "routing_priority": 3,
            },
            "michael": {
                "name": "Michael",
                "description": "Technical Support Specialist with technical intelligence",
                "team": "support_team",
                "specializations": [
                    "Technical support",
                    "System troubleshooting",
                    "Platform assistance",
                    "Integration support",
                ],
                "intelligence_level": "high",
                "routing_priority": 2,
            },
            "elena": {
                "name": "Elena",
                "description": "User Experience Specialist with UX intelligence",
                "team": "support_team",
                "specializations": [
                    "User experience",
                    "Accessibility",
                    "Platform usability",
                    "Interface design",
                ],
                "intelligence_level": "high",
                "routing_priority": 2,
            },
            "thomas": {
                "name": "Thomas",
                "description": "Data and Analytics Specialist with analytical intelligence",
                "team": "support_team",
                "specializations": [
                    "Data analysis",
                    "Climate data",
                    "Market insights",
                    "Trend reporting",
                ],
                "intelligence_level": "high",
                "routing_priority": 2,
            },
        }


# Global coordinator instance
coordinator = AgentCoordinator()


# Export key functions for external use
async def process_user_message(
    message: str,
    user_id: str,
    conversation_id: Optional[str] = None,
    config: Optional[Dict[str, Any]] = None,
) -> AgentResponse:
    """Process a user message through the intelligent agent system"""
    return await coordinator.process_message(message, user_id, conversation_id, config)


async def get_conversation_history(
    conversation_id: str, limit: int = 50
) -> List[Dict[str, Any]]:
    """Get conversation history"""
    return await coordinator.get_conversation_history(conversation_id, limit)


async def get_analytics(
    agent_id: Optional[str] = None,
    team: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
) -> Dict[str, Any]:
    """Get agent analytics with semantic routing insights"""
    return await coordinator.get_agent_analytics(agent_id, team, start_date, end_date)


def get_available_agents() -> Dict[str, Dict[str, Any]]:
    """Get available intelligent agents information"""
    return coordinator.get_available_agents()


async def semantic_route_message(message: str) -> Dict[str, Any]:
    """Expose semantic routing functionality"""
    return await coordinator.semantic_route_message(message)
