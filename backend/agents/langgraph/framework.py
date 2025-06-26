"""
Enhanced Climate Economy Assistant LangGraph Framework
Integrates advanced multi-agent coordination, semantic routing, and agent awareness patterns.
"""

from typing import (
    Literal,
    Dict,
    List,
    Any,
    Optional,
    TypedDict,
    Annotated,
    Union,
    Tuple,
)
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.types import interrupt, Command, Send

from langchain_core.messages import SystemMessage, HumanMessage, AIMessage, ToolMessage
from langchain_core.tools import tool, BaseTool
from langchain_openai import ChatOpenAI
from langchain_groq import ChatGroq
from langchain_core.runnables import Runnable

import os
import logging
import json
import uuid
import asyncio
import time
from datetime import datetime
from dotenv import load_dotenv
import random
from functools import wraps

# Enhanced imports for multi-agent coordination
from backend.database.supabase_client import supabase
from backend.database.redis_client import redis_client
from backend.config.settings import get_settings
from backend.config.agent_config import AgentConfig, AgentType
from backend.adapters.models import create_langchain_llm, get_crisis_llm

# Import coordination modules with error handling
COORDINATION_AVAILABLE = False
agent_awareness = None
enhanced_coordination = None
request_agent_coordination = None
request_enhanced_coordination = None


def _import_coordination_modules():
    """Import coordination modules with error handling."""
    global COORDINATION_AVAILABLE, agent_awareness, enhanced_coordination
    global request_agent_coordination, request_enhanced_coordination

    try:
        from backend.agents.awareness import agent_awareness as _agent_awareness
        from backend.agents.awareness import (
            request_agent_coordination as _request_agent_coordination,
        )

        agent_awareness = _agent_awareness
        request_agent_coordination = _request_agent_coordination
        COORDINATION_AVAILABLE = True
        logger.info("✅ Agent awareness module loaded successfully")
    except ImportError as e:
        logger.warning(f"⚠️ Agent awareness module not available: {e}")

    try:
        from backend.agents.coordination import (
            enhanced_coordination as _enhanced_coordination,
        )
        from backend.agents.coordination import (
            request_enhanced_coordination as _request_enhanced_coordination,
        )

        enhanced_coordination = _enhanced_coordination
        request_enhanced_coordination = _request_enhanced_coordination
        logger.info("✅ Enhanced coordination module loaded successfully")
    except ImportError as e:
        logger.warning(f"⚠️ Enhanced coordination module not available: {e}")

    return COORDINATION_AVAILABLE


# Load environment variables
load_dotenv()

# Initialize logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import coordination modules after logger is available
_import_coordination_modules()

# Configuration
DEVELOPMENT_MODE = os.getenv("DEVELOPMENT_MODE", "true").lower() == "true"
USE_DATABASE = os.getenv("USE_DATABASE", "true").lower() == "true"
MODEL_PROVIDER = os.getenv("MODEL_PROVIDER", "deepseek")
MODEL_NAME = os.getenv("MODEL_NAME", "deepseek-chat")
EVALUATION_MODEL = os.getenv("EVALUATION_MODEL", "deepseek-chat")

# Force DeepSeek usage (90% cheaper than OpenAI)
logger.info(f"🚀 Framework using {MODEL_PROVIDER} provider with model {MODEL_NAME}")

# Initialize models using enhanced adapter
semantic_model = create_langchain_llm(
    provider=MODEL_PROVIDER, model=MODEL_NAME, temperature=0.2
)

evaluation_model = create_langchain_llm(
    provider=MODEL_PROVIDER, model=EVALUATION_MODEL, temperature=0.1
)


# Helper function for fast routing
def _get_agent_team(agent_name: str) -> str:
    """Get team name for agent (fast lookup)"""
    agent_team_map = {
        "pendo": "specialists_team",
        "lauren": "specialists_team", 
        "alex": "specialists_team",
        "jasmine": "specialists_team",
        "marcus": "veterans_team",
        "james": "veterans_team",
        "sarah": "veterans_team", 
        "david": "veterans_team",
        "miguel": "ej_team",
        "maria": "ej_team",
        "andre": "ej_team",
        "carmen": "ej_team",
        "liv": "international_team",
        "mei": "international_team",
        "raj": "international_team",
        "sofia": "international_team",
        "mai": "support_team",
        "michael": "support_team",
        "elena": "support_team",
        "thomas": "support_team"
    }
    return agent_team_map.get(agent_name, "specialists_team")

# Enhanced state types with coordination and awareness
class ConversationState(TypedDict):
    conversation_id: str
    user_id: str
    messages: List[Dict[str, Any]]
    metadata: Dict[str, Any]
    current_agent: str
    current_team: str
    coordination_context: Optional[Dict[str, Any]]
    semantic_routing_data: Optional[Dict[str, Any]]
    agent_awareness_info: Optional[Dict[str, Any]]


class TeamState(TypedDict):
    conversation_id: str
    user_id: str
    messages: List[Dict[str, Any]]
    metadata: Dict[str, Any]
    team_context: Dict[str, Any]
    team_coordination: Optional[Dict[str, Any]]


# Specialized team states
class VeteransTeamState(TeamState):
    military_context: Optional[Dict[str, Any]]


class EJTeamState(TeamState):
    community_context: Optional[Dict[str, Any]]


class InternationalTeamState(TeamState):
    global_context: Optional[Dict[str, Any]]


class SupportTeamState(TeamState):
    support_level: Optional[str]


class SpecialistsTeamState(TeamState):
    expertise_domain: Optional[str]


# Database functions (enhanced with coordination tracking)
async def store_message_db(conversation_id: str, message: Dict[str, Any]):
    """Store a message in the conversation_messages table with enhanced metadata"""
    if not USE_DATABASE:
        logger.debug(
            f"Database not available, skipping message storage: {message.get('id')}"
        )
        return

    # Ensure message has an ID and timestamp
    if "id" not in message:
        message["id"] = str(uuid.uuid4())

    if "timestamp" not in message:
        message["timestamp"] = datetime.now().isoformat()

    try:
        logger.info(f"Storing message {message['id']} using Supabase")

        # First, ensure the conversation exists
        conversation_check = (
            supabase.table("conversations")
            .select("id")
            .eq("id", conversation_id)
            .execute()
        )

        if not conversation_check.data:
            # Create the conversation record if it doesn't exist
            # Fix UUID issue - ensure user_id is a proper UUID or None
            user_id = message.get("user_id")
            if user_id == "unknown" or not user_id:
                user_id = None  # Let database handle it
            
            supabase.table("conversations").insert(
                {
                    "id": conversation_id,
                    "user_id": user_id,
                    "created_at": message["timestamp"],
                    "updated_at": message["timestamp"],
                    "last_activity": message["timestamp"],
                    "conversation_type": "general",
                    "status": "active",
                }
            ).execute()
            logger.info(f"Created new conversation record: {conversation_id}")

        # Enhanced message storage with coordination metadata
        message_data = {
            "id": message["id"],
            "conversation_id": conversation_id,
            "role": message["role"],
            "content": message["content"],
            "specialist_type": message.get("agent"),
            "metadata": {
                **message.get("metadata", {}),
                "semantic_routing": message.get("semantic_routing_data"),
                "coordination_used": message.get("coordination_context") is not None,
                "agent_awareness_level": message.get("agent_awareness_info", {}).get(
                    "intelligence_level"
                ),
                "team": message.get("team"),
            },
            "created_at": message["timestamp"],
            "content_type": "text",
            "processed": True,
        }

        supabase.table("conversation_messages").insert(message_data).execute()

        logger.debug(f"Successfully stored message {message['id']}")

        # Update conversation record
        supabase.table("conversations").update(
            {"updated_at": message["timestamp"], "last_activity": message["timestamp"]}
        ).eq("id", conversation_id).execute()

    except Exception as e:
        logger.error(f"Error storing message: {e}")


async def store_conversation_interrupt(
    conversation_id: str, interrupt_data: Dict[str, Any]
) -> str:
    """Store interrupt data in conversation_interrupts table"""
    interrupt_id = str(uuid.uuid4())

    if not USE_DATABASE:
        logger.debug(
            f"Database not available, returning generated interrupt_id: {interrupt_id}"
        )
        return interrupt_id

    try:
        logger.info(f"Storing interrupt {interrupt_id}")

        # Ensure conversation exists
        conversation_check = (
            supabase.table("conversations")
            .select("id")
            .eq("id", conversation_id)
            .execute()
        )

        if not conversation_check.data:
            current_time = datetime.now().isoformat()
            # Fix UUID issue - ensure user_id is a proper UUID or None
            user_id = interrupt_data.get("user_id")
            if user_id == "unknown" or not user_id:
                user_id = None  # Let database handle it
                
            supabase.table("conversations").insert(
                {
                    "id": conversation_id,
                    "user_id": user_id,
                    "created_at": current_time,
                    "updated_at": current_time,
                    "last_activity": current_time,
                    "conversation_type": "general",
                    "status": "active",
                }
            ).execute()

        # Store the interrupt
        current_time = datetime.now().isoformat()
        supabase.table("conversation_interrupts").insert(
            {
                "id": interrupt_id,
                "conversation_id": conversation_id,
                "type": interrupt_data.get("type", "human_review"),
                "context": interrupt_data,
                "status": "pending",
                "created_at": current_time,
                "priority": interrupt_data.get("priority", "medium"),
                "supervisor_approval_required": interrupt_data.get(
                    "supervisor_approval_required", False
                ),
                "escalation_reason": interrupt_data.get("escalation_reason"),
            }
        ).execute()

        logger.debug(f"Successfully stored interrupt {interrupt_id}")

    except Exception as e:
        logger.error(f"Error storing interrupt: {e}")

    return interrupt_id


async def update_conversation_analytics(conversation_id: str, metadata: Dict[str, Any]):
    """Update analytics for conversation with enhanced coordination tracking"""
    if not USE_DATABASE:
        logger.debug(
            f"Database not available, skipping analytics update for: {conversation_id}"
        )
        return

    try:
        logger.info(f"Updating analytics for conversation {conversation_id}")

        # Check if record exists
        result = (
            supabase.table("conversation_analytics")
            .select("*")
            .eq("conversation_id", conversation_id)
            .execute()
        )

        current_time = datetime.now().isoformat()
        topic = metadata.get("routing_reason", "general")

        # Enhanced analytics data
        analytics_update = {
            "topics_discussed": [topic],
            "analyzed_at": current_time,
            "semantic_routing_used": metadata.get("semantic_routing_data") is not None,
            "coordination_events": metadata.get("coordination_context", {}).get(
                "events", 0
            ),
            "agent_handoffs": metadata.get("agent_handoffs", 0),
            "team_collaborations": metadata.get("team_collaborations", 0),
        }

        if "processing_time_ms" in metadata:
            analytics_update["average_response_time_ms"] = metadata[
                "processing_time_ms"
            ]

        if "confidence_score" in metadata:
            analytics_update["routing_confidence"] = metadata["confidence_score"]

        if result.data:
            # Update existing record
            existing_topics = result.data[0].get("topics_discussed", []) or []
            if topic not in existing_topics:
                existing_topics.append(topic)
            analytics_update["topics_discussed"] = existing_topics

            supabase.table("conversation_analytics").update(analytics_update).eq(
                "id", result.data[0]["id"]
            ).execute()
        else:
            # Create new record
            analytics_update.update(
                {
                    "conversation_id": conversation_id,
                    "user_id": metadata.get("user_id"),
                    "messages_received": 1,
                    "messages_sent": 1,
                }
            )

            supabase.table("conversation_analytics").insert(analytics_update).execute()

    except Exception as e:
        logger.error(f"Error updating analytics: {e}")


# Enhanced quality check with agent awareness
async def quality_check(
    state: ConversationState,
) -> Command[Literal["human_review", END]]:
    """Enhanced quality check with agent awareness and coordination context"""
    # Get the most recent AI message
    ai_messages = [m for m in state["messages"] if m.get("role") == "assistant"]
    if not ai_messages:
        return Command(goto=END)

    latest_ai_message = ai_messages[-1]
    latest_human_messages = [m for m in state["messages"] if m.get("role") == "user"]
    latest_human = (
        latest_human_messages[-1] if latest_human_messages else {"content": ""}
    )

    # Check if human review is needed based on multiple factors
    human_input_required = state["metadata"].get("human_input_required", False)
    coordination_complexity = state.get("coordination_context", {}).get(
        "complexity", "low"
    )
    agent_confidence = latest_ai_message.get("metadata", {}).get(
        "confidence_score", 1.0
    )

    # Enhanced quality assessment criteria
    needs_review = (
        human_input_required
        or coordination_complexity == "high"
        or agent_confidence < 0.7
        or state["metadata"].get("crisis_detected", False)
        or state["metadata"].get("policy_sensitive", False)
    )

    if needs_review:
        logger.info(
            f"Quality check triggered human review for conversation {state['conversation_id']}"
        )
        return Command(goto="human_review")

    # LLM-based quality evaluation for complex cases
    try:
        evaluation = await evaluation_model.ainvoke(
            [
                SystemMessage(
                    content="""
            Evaluate if this AI response needs human review considering:
            1. Sensitive topics (mental health, crisis, legal advice)
            2. Complex policy questions requiring expert validation
            3. Uncertainty or potential inaccuracy
            4. Coordination complexity between multiple agents
            5. High-stakes decisions affecting user's career/life
            
            Reply with JSON: {"score": 0.0-1.0, "reason": "brief reason", "needs_review": boolean}
            Score: 0.0-0.6 = needs review, 0.7-1.0 = doesn't need review
            """
                ),
                HumanMessage(
                    content=f"User question: {latest_human['content']}\n\nAI response: {latest_ai_message['content']}\n\nAgent: {latest_ai_message.get('agent', 'unknown')}\nCoordination used: {state.get('coordination_context') is not None}"
                ),
            ]
        )

        try:
            eval_data = json.loads(evaluation.content)
            score = float(eval_data["score"])
            reason = eval_data.get("reason", "No reason provided")
            needs_review_llm = eval_data.get("needs_review", score < 0.7)

            # Record evaluation results
            metadata_update = state["metadata"].copy()
            metadata_update.update(
                {
                    "quality_score": score,
                    "quality_reason": reason,
                    "quality_assessment": "llm_evaluated",
                }
            )

            if needs_review_llm:
                logger.info(
                    f"LLM quality check triggered human review: {score}. Reason: {reason}"
                )
                return Command(
                    goto="human_review", update={"metadata": metadata_update}
                )
            else:
                logger.info(f"Quality check passed: {score}. Reason: {reason}")
                return Command(goto=END, update={"metadata": metadata_update})

        except (json.JSONDecodeError, KeyError, ValueError) as e:
            logger.error(f"Failed to parse quality check result: {e}")
            return Command(goto=END)

    except Exception as e:
        logger.error(f"Quality check error: {e}")
        return Command(goto=END)


async def human_review_node(state: ConversationState) -> Any:
    """Enhanced human review node with coordination context"""
    # Extract the last assistant message for review
    messages = state["messages"]
    last_message = next(
        (m for m in reversed(messages) if m.get("role") == "assistant"), None
    )

    if not last_message:
        return state

    # Generate an interrupt ID
    interrupt_id = f"int_{int(time.time())}_{random.randint(1000, 9999)}"
    conversation_id = state["metadata"].get("conversation_id", "unknown")

    # Enhanced interrupt context
    interrupt_context = {
        "message_content": last_message.get("content", ""),
        "agent": last_message.get("agent", "assistant"),
        "team": last_message.get("team", "unknown"),
        "coordination_used": state.get("coordination_context") is not None,
        "semantic_routing_data": state.get("semantic_routing_data"),
        "quality_concerns": state["metadata"].get(
            "quality_reason", "General review needed"
        ),
        "user_context": {
            "user_id": state["user_id"],
            "conversation_length": len(state["messages"]),
        },
    }

    # Store interrupt in database
    if USE_DATABASE:
        interrupt_data = {
            "id": interrupt_id,
            "conversation_id": conversation_id,
            "type": "human_review",
            "status": "pending",
            "priority": "medium",
            "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "context": interrupt_context,
        }

        await store_conversation_interrupt(conversation_id, interrupt_data)

    # Create an interrupt request with enhanced context
    response = interrupt(
        {
            "action_request": {
                "action": "review_response",
                "args": {"response": last_message.get("content", "")},
            },
            "config": {
                "allow_accept": True,
                "allow_edit": True,
                "allow_respond": True,
                "allow_escalate": True,
            },
            "description": f"Human review requested for {last_message.get('agent', 'agent')} response",
            "context": interrupt_context,
            "metadata": {
                "interrupt_id": interrupt_id,
                "conversation_id": conversation_id,
                "urgency": state["metadata"].get("urgency", "standard"),
            },
        }
    )

    # Handle the human response
    if response["type"] == "accept":
        return state
    elif response["type"] == "edit":
        edited_content = response["args"]["response"]
        new_messages = state["messages"].copy()
        for i in range(len(new_messages) - 1, -1, -1):
            if new_messages[i].get("role") == "assistant":
                new_messages[i]["content"] = edited_content
                new_messages[i]["edited_by_human"] = True
                break

        return {"messages": new_messages, "metadata": state["metadata"]}
    elif response["type"] == "response":
        feedback = response["args"]
        new_messages = state["messages"].copy()
        new_messages.append(
            {
                "role": "system",
                "content": f"Human reviewer feedback: {feedback}",
                "metadata": {"is_feedback": True},
            }
        )

        return {"messages": new_messages, "metadata": state["metadata"]}
    else:
        return state


# Enhanced semantic routing with agent awareness
async def enhanced_semantic_routing(message: str) -> Dict[str, Any]:
    """Enhanced semantic routing with confidence scoring and agent awareness"""
    try:
        # Use semantic model for intelligent routing
        routing_prompt = """You are the Enhanced Climate Economy Assistant Semantic Router.
Analyze the user's message and determine the best routing with confidence scoring.

Available Teams and Lead Agents:
1. specialists_team - Led by Pendo (general climate, coordination, supervision)
   - lauren (climate policy, regulations, government programs)
   - alex (renewable energy, technical certifications, solar, wind)  
   - jasmine (green technology, innovation, startups, sustainability)

2. veterans_team - Led by Marcus (veteran career transition, leadership)
   - james (military skills translation, civilian equivalents)
   - sarah (career coaching, job search, interview prep)
   - david (veteran benefits, education benefits, healthcare)

3. ej_team - Led by Miguel (environmental justice, community organizing)
   - maria (community engagement, grassroots organizing)
   - andre (environmental health, pollution analysis)
   - carmen (community relations, cultural liaison, bilingual support)

4. international_team - Led by Liv (international policy, global climate)
   - mei (asia pacific, credentials recognition, cultural adaptation)
   - raj (south asia, middle east, global sustainability)
   - sofia (europe, africa, cross-cultural communication)

5. support_team - Led by Mai (mental health, wellness, stress management)
   - michael (crisis intervention, emergency support)
   - elena (career counseling, professional development)
   - thomas (job placement, data analysis, analytics)

Respond in JSON format:
{
    "team": "team_name",
    "agent": "agent_name", 
    "confidence": 0.0-1.0,
    "routing_reason": "explanation",
    "complexity": "low|medium|high",
    "requires_coordination": boolean,
    "suggested_collaborators": ["agent1", "agent2"],
    "crisis_indicators": boolean,
    "domain_analysis": {
        "primary_domain": "domain",
        "secondary_domains": ["domain1", "domain2"]
    }
}"""

        response = await semantic_model.ainvoke(
            [
                SystemMessage(content=routing_prompt),
                HumanMessage(content=f"User message: {message}"),
            ]
        )

        try:
            # Check if response content is empty or None
            if not response.content or not response.content.strip():
                logger.warning("Empty response from semantic model, using fallback")
                return await _fallback_semantic_routing(message)
            
            # Clean the response content (remove any markdown formatting)
            content = response.content.strip()
            if content.startswith('```json'):
                content = content[7:]
            if content.endswith('```'):
                content = content[:-3]
            content = content.strip()
            
            # Try to parse JSON
            routing_data = json.loads(content)

            # Validate and enhance routing data
            required_fields = ["team", "agent", "confidence", "routing_reason"]
            for field in required_fields:
                if field not in routing_data:
                    routing_data[field] = _get_fallback_value(field)

            # Ensure confidence is a float between 0 and 1
            routing_data["confidence"] = max(
                0.0, min(1.0, float(routing_data.get("confidence", 0.5)))
            )

            # Add timestamp and enhanced metadata
            routing_data.update(
                {
                    "timestamp": datetime.now().isoformat(),
                    "routing_method": "enhanced_semantic",
                    "fallback_used": False,
                }
            )

            logger.info(
                f"Enhanced semantic routing: {routing_data['agent']} ({routing_data['team']}) - confidence: {routing_data['confidence']:.2f}"
            )
            return routing_data

        except (json.JSONDecodeError, ValueError) as e:
            logger.error(f"Failed to parse enhanced semantic routing response: {e}, Content: '{response.content[:100]}...'")
            return await _fallback_semantic_routing(message)

    except Exception as e:
        logger.error(f"Error in enhanced semantic routing: {e}")
        return await _fallback_semantic_routing(message)


def _get_fallback_value(field: str) -> Any:
    """Get fallback values for missing routing fields"""
    fallbacks = {
        "team": "specialists_team",
        "agent": "pendo",
        "confidence": 0.6,
        "routing_reason": "Fallback routing applied",
        "complexity": "medium",
        "requires_coordination": False,
        "crisis_indicators": False,
    }
    return fallbacks.get(field, None)


async def _fallback_semantic_routing(message: str) -> Dict[str, Any]:
    """Enhanced fallback routing when semantic analysis fails"""
    message_lower = message.lower()

    # Crisis detection keywords
    crisis_keywords = [
        "suicide",
        "self-harm",
        "emergency",
        "crisis",
        "help me",
        "urgent",
    ]
    crisis_detected = any(keyword in message_lower for keyword in crisis_keywords)

    # Enhanced keyword-based routing with confidence scores
    routing_patterns = [
        (
            ["veteran", "military", "va ", "service member", "discharge"],
            "veterans_team",
            "marcus",
            0.8,
        ),
        (
            ["community", "environmental justice", "pollution", "equity"],
            "ej_team",
            "miguel",
            0.8,
        ),
        (
            ["international", "global", "visa", "immigration", "foreign"],
            "international_team",
            "liv",
            0.8,
        ),
        (
            ["crisis", "mental health", "stress", "emergency", "support"],
            "support_team",
            "mai" if not crisis_detected else "michael",
            0.9,
        ),
        (
            ["renewable", "solar", "wind", "technical", "certification"],
            "specialists_team",
            "alex",
            0.7,
        ),
        (
            ["policy", "regulation", "government", "program"],
            "specialists_team",
            "lauren",
            0.7,
        ),
        (
            ["startup", "innovation", "technology", "green tech"],
            "specialists_team",
            "jasmine",
            0.7,
        ),
    ]

    for keywords, team, agent, confidence in routing_patterns:
        if any(keyword in message_lower for keyword in keywords):
            return {
                "team": team,
                "agent": agent,
                "confidence": confidence,
                "routing_reason": f"Fallback routing - {keywords[0]} keywords detected",
                "complexity": "high" if crisis_detected else "medium",
                "requires_coordination": False,
                "crisis_indicators": crisis_detected,
                "fallback_used": True,
                "timestamp": datetime.now().isoformat(),
            }

    # Default fallback
    return {
        "team": "specialists_team",
        "agent": "pendo",
        "confidence": 0.6,
        "routing_reason": "Default fallback routing",
        "complexity": "low",
        "requires_coordination": False,
        "crisis_indicators": crisis_detected,
        "fallback_used": True,
        "timestamp": datetime.now().isoformat(),
    }


# Enhanced top supervisor with multi-agent awareness
async def enhanced_top_supervisor(
    state: ConversationState,
) -> Command[Union[str, Literal["quality_check"]]]:
    """Enhanced top-level supervisor with semantic routing and coordination awareness"""
    # Extract the user's message
    user_message = next(
        (m["content"] for m in state["messages"] if m.get("role") == "user"), ""
    )

    # FAST semantic routing using embeddings (no LLM calls)
    try:
        from ..utils.semantic_router import SemanticRouter
        fast_router = SemanticRouter()
        routing_result = await fast_router.route_message(user_message)
        
        # Convert to framework format
        routing_data = {
            "agent": routing_result["agent"],
            "team": _get_agent_team(routing_result["agent"]),
            "confidence": routing_result["confidence"],
            "routing_reason": routing_result["reasoning"],
            "routing_method": "fast_semantic_embeddings"
        }
    except Exception as e:
        logger.warning(f"Fast semantic routing failed in supervisor, using fallback: {e}")
        routing_data = {
            "agent": "pendo",
            "team": "specialists_team",
            "confidence": 0.8,
            "routing_reason": "Supervisor fallback routing",
            "routing_method": "fallback"
        }

    # Check if coordination is needed based on message analysis
    coordination_analysis = {"needs_coordination": False}
    if COORDINATION_AVAILABLE and agent_awareness:
        try:
            coordination_analysis = await agent_awareness.analyze_coordination_needs(
                user_message, routing_data["agent"]
            )
        except Exception as e:
            logger.warning(f"Coordination analysis failed: {e}")
            coordination_analysis = {"needs_coordination": False}

    # Create enhanced routing message
    routing_message = {
        "role": "system",
        "content": f"Enhanced routing: {routing_data['agent']} ({routing_data['team']}) - Confidence: {routing_data['confidence']:.2f}",
        "metadata": {
            "routing_decision": routing_data["agent"],
            "routing_confidence": routing_data["confidence"],
            "routing_method": "enhanced_semantic",
            "coordination_needed": coordination_analysis["needs_coordination"],
            "timestamp": datetime.now().isoformat(),
        },
    }

    # Update analytics with enhanced data
    if USE_DATABASE:
        await update_conversation_analytics(
            state["conversation_id"],
            {
                "routing": routing_data,
                "coordination_analysis": coordination_analysis,
                "routing_confidence": routing_data["confidence"],
                "semantic_routing_used": True,
            },
        )

    # Update state with enhanced routing information
    metadata = state["metadata"].copy()
    metadata.update(
        {
            "current_team": routing_data["team"],
            "current_agent": routing_data["agent"],
            "routing_confidence": routing_data["confidence"],
            "coordination_needed": coordination_analysis["needs_coordination"],
            "crisis_detected": routing_data.get("crisis_indicators", False),
        }
    )

    # Store routing and coordination context
    state_update = {
        "messages": state["messages"] + [routing_message],
        "metadata": metadata,
        "semantic_routing_data": routing_data,
        "coordination_context": (
            coordination_analysis
            if coordination_analysis["needs_coordination"]
            else None
        ),
        "current_agent": routing_data["agent"],
        "current_team": routing_data["team"],
    }

    # Route to the determined agent
    target_agent = f"{routing_data['agent']}_agent"

    return Command(goto=target_agent, update=state_update)


# Enhanced agent implementations with coordination capabilities
async def create_enhanced_agent(
    agent_name: str, agent_config: Dict[str, Any]
) -> callable:
    """Factory function to create enhanced agents with coordination capabilities"""

    async def enhanced_agent(
        state: ConversationState,
    ) -> Command[Literal["quality_check"]]:
        """Enhanced agent with coordination and awareness capabilities"""
        try:
            start_time = time.time()

            # Extract user message
            user_message = next(
                (m["content"] for m in state["messages"] if m.get("role") == "user"), ""
            )

            # Get agent configuration
            config = AgentConfig.get_agent_config(agent_name)
            if not config:
                raise ValueError(f"No configuration found for agent {agent_name}")

            # Check if coordination is needed
            coordination_context = state.get("coordination_context")
            if (
                coordination_context
                and coordination_context.get("needs_coordination")
                and COORDINATION_AVAILABLE
                and request_enhanced_coordination
            ):
                try:
                    # Use coordination tool
                    coordination_response = await request_enhanced_coordination(
                        requesting_agent=agent_name,
                        expertise_needed=coordination_context[
                            "coordination_suggestions"
                        ][0]["expertise"],
                        specific_question=user_message,
                        urgency="medium",
                    )

                    if coordination_response.goto != agent_name:
                        # Hand off to coordinating agent
                        return coordination_response
                except Exception as e:
                    logger.warning(f"Coordination failed for {agent_name}: {e}")
                    # Continue with normal agent processing

            # Generate response using agent's specialized model and prompt
            system_prompt = _get_enhanced_agent_prompt(agent_name, config)

            # Add conversation context
            context_messages = await _get_conversation_context(
                state["conversation_id"], limit=3
            )
            context_prompt = ""
            if context_messages:
                context_prompt = f"\n\nRecent conversation context: {context_messages}"

            # Use agent's configured model
            agent_model = config.get("model") or semantic_model

            response = await agent_model.ainvoke(
                [
                    SystemMessage(content=system_prompt + context_prompt),
                    HumanMessage(content=user_message),
                ]
            )

            # Calculate processing time
            processing_time = (time.time() - start_time) * 1000

            # Create enhanced response message
            message_data = {
                "id": str(uuid.uuid4()),
                "role": "assistant",
                "content": response.content,
                "agent": agent_name,
                "team": config.get("type", "unknown"),
                "timestamp": datetime.now().isoformat(),
                "metadata": {
                    "confidence_score": 0.9,  # High confidence for direct agent responses
                    "processing_time_ms": processing_time,
                    "agent_specializations": config.get("specializations", []),
                    "coordination_used": coordination_context is not None,
                    "capabilities_used": config.get("capabilities", []),
                },
                "semantic_routing_data": state.get("semantic_routing_data"),
                "coordination_context": coordination_context,
            }

            # Store in database
            if USE_DATABASE:
                await store_message_db(state["conversation_id"], message_data)

            # Return with updated state
            return Command(
                goto="quality_check",
                update={"messages": state["messages"] + [message_data]},
            )

        except Exception as e:
            logger.error(f"Error in {agent_name} agent: {e}")
            error_message = {
                "role": "assistant",
                "content": f"I apologize, but I encountered an error while processing your request. Please try again or contact support if the issue persists.",
                "agent": agent_name,
                "error": str(e),
                "timestamp": datetime.now().isoformat(),
            }
            return Command(
                goto="quality_check",
                update={"messages": state["messages"] + [error_message]},
            )

    # Set function name for identification
    enhanced_agent.__name__ = f"{agent_name}_agent"
    return enhanced_agent


def _get_enhanced_agent_prompt(agent_name: str, config: Dict[str, Any]) -> str:
    """Get enhanced system prompt for agents with their specific expertise"""

    base_context = f"""You are {config.get('name', agent_name)}, {config.get('description', 'a specialist')} for the Climate Economy Assistant.

Your specializations: {', '.join(config.get('specializations', []))}
Your capabilities: {', '.join(config.get('capabilities', []))}
Your primary functions: {', '.join(config.get('primary_functions', []))}

Be knowledgeable, helpful, and leverage your specific expertise. If you need help from other specialists, you can request coordination."""

    # Agent-specific enhanced prompts
    agent_prompts = {
        "pendo": """You are Pendo, the Climate Economy Navigator and primary coordination specialist. You help users understand climate policies, career opportunities, and coordinate with other specialists when needed. As the lead coordinator, you can access all team capabilities and should route complex queries to appropriate specialists while maintaining oversight of the overall user experience.""",
        "marcus": """You are Marcus, the Veterans Program Lead specializing in military career transitions to climate economy roles. You understand military culture, veteran challenges, and how military skills translate to climate opportunities. Be empathetic, practical, and leverage your understanding of military experience. You can coordinate with other veterans team members for specialized support.""",
        "lauren": """You are Lauren, the Climate Policy and Regulations Specialist. You help users navigate government programs, policy frameworks, and regulatory requirements in the climate economy. Provide accurate, up-to-date policy guidance and connect users with relevant programs. You can coordinate with international team for global policy perspectives.""",
        "alex": """You are Alex, the Renewable Energy and Technical Certifications Specialist. You provide expertise on solar, wind, energy storage, and technical career paths in clean energy. Help users understand certification requirements, technical skills needed, and career advancement opportunities in renewable energy sectors.""",
        "jasmine": """You are Jasmine, the Green Technology and Innovation Specialist. You focus on emerging technologies, startups, sustainability practices, and innovative solutions in the climate economy. Help users understand emerging opportunities, startup ecosystems, and how to participate in climate innovation.""",
        "miguel": """You are Miguel, the Environmental Justice Program Lead. You specialize in community organizing, policy advocacy, and ensuring equitable access to climate opportunities. Help communities address environmental concerns and connect with resources. You can coordinate with community engagement specialists for grassroots support.""",
        "liv": """You are Liv, the International Climate Policy Specialist. You provide expertise on global climate frameworks, international cooperation, and cross-border climate opportunities. Help users understand international climate policies and global career opportunities. You can coordinate with regional specialists for specific geographic expertise.""",
        "mai": """You are Mai, the Mental Health and Wellness Specialist. You provide support for stress management, wellness planning, and mental health resources related to climate careers and environmental concerns. Be supportive, understanding, and ready to escalate to crisis intervention when needed.""",
        "michael": """You are Michael, the Crisis Intervention Specialist. You handle emergency support, crisis situations, and urgent assistance needs. Be calm, professional, and prioritize immediate safety and support. You have authority to escalate to emergency services when necessary.""",
        # Additional Specialists Team Agents
        "james": """You are James, the Military Skills Translator specializing in converting military experience into civilian climate career terms. Help veterans identify transferable skills and articulate them effectively to climate employers. You understand military occupational specialties and how they translate to climate economy roles.""",
        "sarah": """You are Sarah, the Veterans Career Coach providing career coaching, resume review, and interview preparation specifically for veterans entering climate careers. Be supportive, practical, and provide actionable career guidance tailored to veteran experiences and challenges.""",
        "david": """You are David, the Veterans Support Specialist focusing on VA benefits, education benefits, and healthcare navigation. Provide accurate information about veterans' benefits and connect veterans with appropriate resources for their climate career transition.""",
        # Environmental Justice Team Agents
        "maria": """You are Maria, the Community Engagement Specialist focusing on grassroots organizing, stakeholder engagement, and coalition building for environmental justice initiatives. Help communities develop effective engagement strategies and build powerful coalitions for climate action.""",
        "andre": """You are Andre, the Environmental Health Specialist focusing on pollution analysis, health advocacy, and environmental health assessments. Help communities understand environmental health impacts and connect with health resources and advocacy support.""",
        "carmen": """You are Carmen, the Cultural Liaison Specialist providing bilingual support, cultural adaptation, and community relations services. Bridge cultural gaps and ensure inclusive access to climate opportunities with sensitivity to diverse cultural backgrounds.""",
        # International Team Agents
        "mei": """You are Mei, the Asia-Pacific Climate Specialist with expertise in credentials recognition, cultural adaptation, and regional climate policies. Help international professionals from Asia-Pacific navigate climate opportunities and credential recognition processes.""",
        "raj": """You are Raj, the South Asia and Middle East Climate Specialist focusing on regional sustainability, international development, and climate policies. Provide expertise on South Asian and Middle Eastern climate initiatives and immigration pathways.""",
        "sofia": """You are Sofia, the Europe and Africa Climate Specialist with expertise in EU Green Deal, African climate solutions, and cross-cultural communication. Help professionals understand European and African climate policies and cooperation opportunities.""",
        # Support Team Agents
        "elena": """You are Elena, the Career Counseling and Professional Development Specialist focusing on user experience, career coaching, and professional development planning. Help users navigate their climate career journey with personalized guidance and development strategies.""",
        "thomas": """You are Thomas, the Data Analysis and Job Placement Specialist providing market insights, analytics, and job placement services. Use data-driven insights to support climate career decisions and connect users with relevant job opportunities.""",
    }

    return agent_prompts.get(agent_name, base_context)


async def _get_conversation_context(conversation_id: str, limit: int = 3) -> str:
    """Get recent conversation context for enhanced responses"""
    try:
        if not supabase:
            return ""

        # Get last few messages for context
        result = (
            supabase.table("conversation_messages")
            .select("role, content, specialist_type")
            .eq("conversation_id", conversation_id)
            .order("created_at", desc=True)
            .limit(limit * 2)
            .execute()
        )  # Get more messages to account for system messages

        if result.data:
            context_messages = []
            user_assistant_pairs = 0

            for msg in reversed(result.data):  # Reverse to get chronological order
                role = msg.get("role", "user")
                content = msg.get("content", "")
                agent = msg.get("specialist_type", "")

                # Skip system messages and limit to actual conversations
                if (
                    role in ["user", "assistant"]
                    and content
                    and user_assistant_pairs < limit
                ):
                    if role == "user":
                        context_messages.append(f"User: {content[:200]}...")
                    elif role == "assistant" and agent:
                        context_messages.append(f"{agent}: {content[:200]}...")

                    if role == "assistant":
                        user_assistant_pairs += 1

            return " | ".join(context_messages[-6:])  # Last 6 messages (3 exchanges)

        return ""

    except Exception as e:
        logger.error(f"Error getting conversation context: {e}")
        return ""


# Create the enhanced graph with all 18 agents
def create_enhanced_climate_assistant_graph():
    """Create and compile the enhanced Climate Economy Assistant graph with all agents"""

    # Create the main graph
    graph = StateGraph(ConversationState)

    # Add the enhanced supervisor
    graph.add_node("enhanced_supervisor", enhanced_top_supervisor)

    # Add quality check and human review nodes
    graph.add_node("quality_check", quality_check)
    graph.add_node("human_review", human_review_node)

    # Create and add all 18 enhanced agent nodes
    agent_configs = AgentConfig.AGENTS
    for agent_name, config in agent_configs.items():
        # Create the agent function without using asyncio.run in the loop
        async def create_agent_wrapper(name=agent_name, cfg=config):
            return await create_enhanced_agent(name, cfg)

        # Create a sync wrapper for the graph
        def create_sync_agent(name=agent_name):
            async def agent_func(
                state: ConversationState,
            ) -> Command[Literal["quality_check"]]:
                enhanced_agent_func = await create_enhanced_agent(
                    name, AgentConfig.get_agent_config(name)
                )
                return await enhanced_agent_func(state)

            return agent_func

        graph.add_node(f"{agent_name}_agent", create_sync_agent(agent_name))

    # Set entry point
    graph.add_edge(START, "enhanced_supervisor")

    # Add conditional edges from supervisor to all agents
    agent_routing = {}
    for agent_name in agent_configs.keys():
        agent_routing[f"{agent_name}_agent"] = f"{agent_name}_agent"

    graph.add_conditional_edges(
        "enhanced_supervisor",
        lambda state: f"{state['current_agent']}_agent",
        agent_routing,
    )

    # Add edges from all agents to quality check
    for agent_name in agent_configs.keys():
        graph.add_edge(f"{agent_name}_agent", "quality_check")

    # Add conditional edges from quality check
    graph.add_conditional_edges(
        "quality_check",
        lambda state: (
            "human_review"
            if state["metadata"].get("human_input_required", False)
            else END
        ),
        {"human_review": "human_review", END: END},
    )

    # Add edge from human review to end
    graph.add_edge("human_review", END)

    # Compile with enhanced memory
    memory = InMemorySaver()
    compiled_graph = graph.compile(checkpointer=memory)

    logger.info(
        f"Enhanced Climate Assistant Graph compiled with {len(agent_configs)} agents"
    )
    return compiled_graph


# Enhanced main processing function
async def process_message_with_enhanced_graph(
    message: str,
    user_id: str,
    conversation_id: str,
    config: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Process a message using the enhanced LangGraph with full agent coordination"""
    
    # Define start_time outside the try block to ensure it's always available
    start_time = datetime.now()

    try:
        # Create enhanced initial state
        initial_state = ConversationState(
            conversation_id=conversation_id,
            user_id=user_id,
            messages=[
                {
                    "role": "user",
                    "content": message,
                    "timestamp": start_time.isoformat(),
                }
            ],
            metadata={
                "conversation_id": conversation_id,
                "user_id": user_id,
                "processing_start": start_time.isoformat(),
                "enhanced_framework": True,
            },
            current_agent="",
            current_team="",
            coordination_context=None,
            semantic_routing_data=None,
            agent_awareness_info=None,
        )

        # Get the enhanced compiled graph
        graph = create_enhanced_climate_assistant_graph()

        # Execute the graph with enhanced configuration
        result = await graph.ainvoke(
            initial_state,
            config={
                "configurable": {"thread_id": conversation_id, "enhanced_mode": True}
            },
        )

        # Extract the enhanced response
        assistant_messages = [
            m for m in result["messages"] if m.get("role") == "assistant"
        ]
        latest_response = (
            assistant_messages[-1]
            if assistant_messages
            else {
                "content": "I'm sorry, I couldn't process your request.",
                "agent": "error_handler",
                "team": "error",
            }
        )

        # Calculate total processing time
        processing_time = (datetime.now() - start_time).total_seconds() * 1000

        # Enhanced response with full context - Fix NoneType errors
        result_metadata = {}
        if result and isinstance(result, dict) and result.get("metadata") is not None:
            result_metadata = result.get("metadata", {})
        
        latest_response_metadata = {}
        if latest_response and latest_response.get("metadata") is not None:
            latest_response_metadata = latest_response.get("metadata", {})
        
        enhanced_response = {
            "response": latest_response.get("content", "I apologize, but I encountered an error processing your request.") if latest_response else "I apologize, but I encountered an error processing your request.",
            "agent": latest_response.get("agent", "unknown") if latest_response else "unknown",
            "team": latest_response.get("team", "unknown") if latest_response else "unknown",
            "conversation_id": conversation_id,
            "metadata": {
                **result_metadata,
                "total_processing_time_ms": processing_time,
                "semantic_routing_used": result.get("semantic_routing_data") is not None if result else False,
                "coordination_used": result.get("coordination_context") is not None if result else False,
                "agent_confidence": latest_response_metadata.get("confidence_score", 0.0),
                "framework_version": "enhanced_v2",
            },
            "routing_info": result.get("semantic_routing_data") if result else None,
            "coordination_info": result.get("coordination_context") if result else None,
        }

        logger.info(
            f"Enhanced message processed in {processing_time:.2f}ms by {enhanced_response['agent']} ({enhanced_response['team']})"
        )
        return enhanced_response

    except Exception as e:
        logger.error(f"Error processing message with enhanced graph: {e}")

        # Calculate processing time for error case
        processing_time = (datetime.now() - start_time).total_seconds() * 1000

        # Return enhanced error response
        return {
            "response": "I apologize, but I encountered an error processing your request. Our enhanced system is designed to handle complex queries, but this particular request couldn't be processed. Please try rephrasing your question or contact support.",
            "agent": "error_handler",
            "team": "system",
            "conversation_id": conversation_id,
            "metadata": {
                "error": str(e),
                "enhanced_framework": True,
                "total_processing_time_ms": processing_time,
                "fallback_used": True,
            },
        }


# New streaming function for better UX
async def stream_message_with_enhanced_graph(
    message: str,
    user_id: str,
    conversation_id: str,
    config: Optional[Dict[str, Any]] = None,
):
    """Stream a message response using the enhanced LangGraph for real-time feedback"""
    
    start_time = datetime.now()
    
    try:
        # Yield immediate acknowledgment
        yield {
            "type": "status",
            "data": {
                "status": "processing",
                "message": "Processing your request...",
                "timestamp": start_time.isoformat(),
                "agent": "system"
            }
        }
        
        # FAST semantic routing using embeddings (no LLM calls)
        try:
            from ..utils.semantic_router import SemanticRouter
            fast_router = SemanticRouter()
            routing_result = await fast_router.route_message(message)
            
            # Convert to framework format
            routing_data = {
                "agent": routing_result["agent"],
                "team": _get_agent_team(routing_result["agent"]),
                "confidence": routing_result["confidence"],
                "routing_reason": routing_result["reasoning"],
                "routing_method": "fast_semantic_embeddings"
            }
            
            yield {
                "type": "routing",
                "data": {
                    "agent": routing_data["agent"],
                    "team": routing_data["team"],
                    "confidence": routing_data["confidence"],
                    "routing_reason": routing_data["routing_reason"],
                    "timestamp": datetime.now().isoformat()
                }
            }
        except Exception as e:
            logger.warning(f"Fast semantic routing failed, using fallback: {e}")
            routing_data = {
                "agent": "pendo",
                "team": "specialists_team",
                "confidence": 0.8,
                "routing_reason": "Fallback routing",
                "routing_method": "fallback"
            }
        
        # Stream thinking status
        yield {
            "type": "thinking",
            "data": {
                "status": f"{routing_data['agent']} is analyzing your request...",
                "agent": routing_data["agent"],
                "timestamp": datetime.now().isoformat()
            }
        }
        
        # Create enhanced initial state
        initial_state = ConversationState(
            conversation_id=conversation_id,
            user_id=user_id,
            messages=[
                {
                    "role": "user",
                    "content": message,
                    "timestamp": start_time.isoformat(),
                }
            ],
            metadata={
                "conversation_id": conversation_id,
                "user_id": user_id,
                "processing_start": start_time.isoformat(),
                "enhanced_framework": True,
                "streaming": True,
            },
            current_agent=routing_data["agent"],
            current_team=routing_data["team"],
            coordination_context=None,
            semantic_routing_data=routing_data,
            agent_awareness_info=None,
        )

        # Get the enhanced compiled graph
        graph = create_enhanced_climate_assistant_graph()
        
        # Use a simpler, faster approach for streaming
        # Skip complex coordination for faster response
        agent_config = AgentConfig.get_agent_config(routing_data["agent"])
        if not agent_config:
            raise ValueError(f"No configuration found for agent {routing_data['agent']}")
        
        # Generate response using agent's specialized model and prompt
        system_prompt = _get_enhanced_agent_prompt(routing_data["agent"], agent_config)
        
        # Get conversation context
        context_messages = await _get_conversation_context(conversation_id, limit=2)
        context_prompt = f"\n\nRecent conversation context: {context_messages}" if context_messages else ""
        
        # Use agent's configured model with streaming
        agent_model = agent_config.get("model") or semantic_model
        
        # Stream the response generation
        response_chunks = []
        
        try:
            # For DeepSeek and compatible models, use streaming
            if hasattr(agent_model, 'astream'):
                async for chunk in agent_model.astream([
                    SystemMessage(content=system_prompt + context_prompt),
                    HumanMessage(content=message),
                ]):
                    if hasattr(chunk, 'content') and chunk.content:
                        response_chunks.append(chunk.content)
                        
                        yield {
                            "type": "content",
                            "data": {
                                "chunk": chunk.content,
                                "accumulated": "".join(response_chunks),
                                "agent": routing_data["agent"],
                                "timestamp": datetime.now().isoformat()
                            }
                        }
            else:
                # Fallback for non-streaming models
                response = await agent_model.ainvoke([
                    SystemMessage(content=system_prompt + context_prompt),
                    HumanMessage(content=message),
                ])
                
                full_content = response.content if hasattr(response, 'content') else str(response)
                
                # Simulate streaming by breaking into chunks
                words = full_content.split()
                chunk_size = max(3, len(words) // 8)  # Break into ~8 chunks
                
                for i in range(0, len(words), chunk_size):
                    chunk = " ".join(words[i:i + chunk_size])
                    if i + chunk_size < len(words):
                        chunk += " "
                    
                    response_chunks.append(chunk)
                    
                    yield {
                        "type": "content",
                        "data": {
                            "chunk": chunk,
                            "accumulated": "".join(response_chunks),
                            "agent": routing_data["agent"],
                            "timestamp": datetime.now().isoformat()
                        }
                    }
                    
                    # Small delay to simulate natural streaming
                    await asyncio.sleep(0.1)
                    
        except Exception as e:
            logger.error(f"Error generating response: {e}")
            error_response = f"I apologize, but I encountered an error while processing your request. Please try again."
            
            yield {
                "type": "content",
                "data": {
                    "chunk": error_response,
                    "accumulated": error_response,
                    "agent": routing_data["agent"],
                    "timestamp": datetime.now().isoformat(),
                    "error": True
                }
            }
            
            response_chunks = [error_response]
        
        # Calculate processing time
        processing_time = (datetime.now() - start_time).total_seconds() * 1000
        
        # Store the complete message in database
        complete_response = "".join(response_chunks)
        
        message_data = {
            "id": str(uuid.uuid4()),
            "role": "assistant",
            "content": complete_response,
            "agent": routing_data["agent"],
            "team": routing_data["team"],
            "timestamp": datetime.now().isoformat(),
            "metadata": {
                "confidence_score": routing_data["confidence"],
                "processing_time_ms": processing_time,
                "agent_specializations": agent_config.get("specializations", []),
                "capabilities_used": agent_config.get("capabilities", []),
                "streaming": True,
            },
            "semantic_routing_data": routing_data,
        }
        
        # Store in database
        if USE_DATABASE:
            await store_message_db(conversation_id, message_data)
        
        # Yield completion status
        yield {
            "type": "complete",
            "data": {
                "conversation_id": conversation_id,
                "agent": routing_data["agent"],
                "team": routing_data["team"],
                "total_content": complete_response,
                "processing_time": processing_time,
                "message_id": message_data["id"],
                "success": True,
                "timestamp": datetime.now().isoformat()
            }
        }
        
        logger.info(
            f"Streaming message completed in {processing_time:.2f}ms by {routing_data['agent']} ({routing_data['team']})"
        )
        
    except Exception as e:
        logger.error(f"Error in streaming message processing: {e}")
        
        processing_time = (datetime.now() - start_time).total_seconds() * 1000
        
        yield {
            "type": "error",
            "data": {
                "error": str(e),
                "conversation_id": conversation_id,
                "processing_time": processing_time,
                "fallback_response": "I apologize, but I encountered an error processing your request. Our enhanced system using DeepSeek is designed to handle complex queries, but this particular request couldn't be processed. Please try rephrasing your question or contact support.",
                "timestamp": datetime.now().isoformat(),
                "agent": "error_handler"
            }
        }


def get_framework_status() -> Dict[str, Any]:
    """Get status information about the enhanced framework"""
    agent_configs = AgentConfig.AGENTS

    return {
        "framework_version": "enhanced_v2",
        "total_agents": len(agent_configs),
        "available_agents": list(agent_configs.keys()),
        "teams": {
            "specialists_team": ["pendo", "lauren", "alex", "jasmine"],
            "veterans_team": ["marcus", "james", "sarah", "david"],
            "ej_team": ["miguel", "maria", "andre", "carmen"],
            "international_team": ["liv", "mei", "raj", "sofia"],
            "support_team": ["mai", "michael", "elena", "thomas"],
        },
        "coordination_available": COORDINATION_AVAILABLE,
        "semantic_routing_enabled": True,
        "agent_awareness_enabled": COORDINATION_AVAILABLE,
        "features": {
            "enhanced_semantic_routing": True,
            "multi_agent_coordination": COORDINATION_AVAILABLE,
            "agent_awareness": COORDINATION_AVAILABLE,
            "quality_check": True,
            "human_review": True,
            "conversation_context": True,
            "analytics_tracking": True,
        },
    }


def get_agent_capabilities() -> Dict[str, Dict[str, Any]]:
    """Get capabilities of all agents"""
    agent_configs = AgentConfig.AGENTS
    capabilities = {}

    for agent_name, config in agent_configs.items():
        capabilities[agent_name] = {
            "name": config.get("name", agent_name),
            "description": config.get("description", ""),
            "type": config.get("type", "general"),
            "specializations": config.get("specializations", []),
            "capabilities": config.get("capabilities", []),
            "primary_functions": config.get("primary_functions", []),
            "streaming": config.get("streaming", True),
        }

    return capabilities


# Export the enhanced functions
__all__ = [
    "create_enhanced_climate_assistant_graph",
    "process_message_with_enhanced_graph",
    "stream_message_with_enhanced_graph",
    "ConversationState",
    "VeteransTeamState",
    "EJTeamState",
    "InternationalTeamState",
    "SupportTeamState",
    "SpecialistsTeamState",
    "enhanced_semantic_routing",
    "enhanced_top_supervisor",
    "get_framework_status",
    "get_agent_capabilities",
]

# Maintain backward compatibility
create_climate_assistant_graph = create_enhanced_climate_assistant_graph
process_message_with_graph = process_message_with_enhanced_graph


# Enhanced sample tool with coordination awareness
def enhanced_coordination_tool(state: ConversationState) -> ConversationState:
    """Enhanced tool with coordination capabilities"""
    input_content = state.get("input", "")

    # Process with coordination awareness
    processed_output = f"Enhanced processing with coordination: {input_content}"

    # Check if coordination is needed
    if "complex" in input_content.lower() or "multiple" in input_content.lower():
        processed_output += " [Coordination recommended for complex query]"

    state["output"] = processed_output
    return state


# Create the enhanced StateGraph for tools
enhanced_builder = StateGraph(ConversationState)
enhanced_builder.add_node("enhanced_coordination_tool", enhanced_coordination_tool)
enhanced_builder.set_entry_point("enhanced_coordination_tool")

# Main application graph for LangGraph Platform deployment (already compiled)
app_graph = create_enhanced_climate_assistant_graph()
