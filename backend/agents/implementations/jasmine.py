import logging

"""
Jasmine - Massachusetts Resources Specialist
Location: backend/agents/implementations/jasmine.py

Responsible for connecting users with MA-specific climate programs, 
workforce development opportunities, and local resources.
"""

import logging
import uuid
from datetime import datetime
from typing import Dict, Any, List, Annotated
from langchain_core.tools import tool
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_openai import ChatOpenAI
from langgraph.types import Command

# from langgraph.prebuilt import InjectedState
import os

from backend.agents.base.agent_base import BaseAgent, AgentState

logger = logging.getLogger(__name__)

# Initialize model
MODEL_NAME = os.getenv("MODEL_NAME", "gpt-3.5-turbo")
model = ChatOpenAI(model_name=MODEL_NAME)


# Define tools for Jasmine (adopting cea2.py tool patterns)
@tool
def search_ma_climate_programs(query: str, state: dict = None) -> str:
    """Search for Massachusetts-specific climate programs and initiatives."""
    try:
        logger.info(f"Jasmine searching MA climate programs: {query}")

        response = model.invoke(
            [
                SystemMessage(
                    content="""You are Jasmine, the Massachusetts Resources Specialist.
You specialize in connecting users with MA-specific climate programs, workforce development, and local resources.

Key Massachusetts resources include:
- Massachusetts Clean Energy Center (MassCEC) programs
- Gateway Cities workforce development initiatives
- Community college clean energy training programs
- State agency climate positions
- Municipal climate job opportunities
- Regional economic development programs

Provide specific program names, contact information, eligibility requirements, and application processes."""
                ),
                HumanMessage(
                    content=f"Find Massachusetts climate programs for: {query}"
                ),
            ]
        )

        return response.content

    except Exception as e:
        logger.error(f"Error in Jasmine search_ma_climate_programs: {e}")
        return f"Massachusetts offers excellent climate programs through MassCEC, community colleges, and Gateway Cities initiatives. For {query}, I recommend checking MassCEC's workforce development programs, exploring community college clean energy training, and looking into municipal climate positions. Contact MassCEC at masscec.com or call 617-315-9300 for more information."


@tool
def find_ma_workforce_development(region: str, state: dict = None) -> str:
    """Find workforce development opportunities in specific Massachusetts regions."""
    try:
        logger.info(f"Jasmine finding workforce development in: {region}")

        response = model.invoke(
            [
                SystemMessage(
                    content="""You are Jasmine, providing Massachusetts workforce development guidance.
Focus on regional opportunities including:
- Gateway Cities programs (Brockton, Fall River, Holyoke, Lawrence, Lowell, Lynn, New Bedford, Pittsfield, Springfield, Worcester)
- Community college partnerships
- State-funded training programs
- Regional employment boards
- Local apprenticeship programs

Provide specific program details, locations, and application processes."""
                ),
                HumanMessage(
                    content=f"Find workforce development opportunities in {region}, Massachusetts"
                ),
            ]
        )

        return response.content

    except Exception as e:
        logger.error(f"Error in Jasmine find_ma_workforce_development: {e}")
        return f"Massachusetts offers strong workforce development programs in {region}. Key resources include Gateway Cities initiatives, community college partnerships, and regional employment boards. Contact your local MassHire office or community college for specific programs and eligibility requirements."


@tool
def get_ma_education_resources(program_type: str, state: dict = None) -> str:
    """Get Massachusetts education and training resources for climate careers."""
    try:
        logger.info(f"Jasmine finding MA education resources: {program_type}")

        response = model.invoke(
            [
                SystemMessage(
                    content="""You are Jasmine, providing Massachusetts education and training guidance.
Key educational resources include:
- Community college clean energy programs
- UMass system sustainability programs
- Technical training institutes
- Professional certification programs
- Continuing education opportunities
- State-funded training initiatives

Provide specific institutions, program details, costs, and application deadlines."""
                ),
                HumanMessage(
                    content=f"Find Massachusetts education resources for: {program_type}"
                ),
            ]
        )

        return response.content

    except Exception as e:
        logger.error(f"Error in Jasmine get_ma_education_resources: {e}")
        return f"Massachusetts has excellent education resources for {program_type}. Community colleges offer clean energy programs, UMass has sustainability degrees, and technical institutes provide hands-on training. Many programs offer financial aid and flexible scheduling. Contact MassCEC or your local community college for specific program information."


@tool
def find_ma_local_opportunities(location: str, state: dict = None) -> str:
    """Find local climate opportunities in specific Massachusetts communities."""
    try:
        logger.info(f"Jasmine finding local opportunities in: {location}")

        response = model.invoke(
            [
                SystemMessage(
                    content="""You are Jasmine, connecting users with local Massachusetts climate opportunities.
Focus on:
- Municipal climate positions
- Local nonprofit organizations
- Regional economic development
- Community-based programs
- Local business opportunities
- Neighborhood-specific initiatives

Provide specific organizations, contact information, and application processes."""
                ),
                HumanMessage(
                    content=f"Find local climate opportunities in {location}, Massachusetts"
                ),
            ]
        )

        return response.content

    except Exception as e:
        logger.error(f"Error in Jasmine find_ma_local_opportunities: {e}")
        return f"Massachusetts communities like {location} offer various climate opportunities including municipal positions, local nonprofits, and community programs. Check with your city/town hall, local environmental organizations, and regional planning agencies for current openings and volunteer opportunities."


def JasmineAgent(state: dict) -> Command:
    """
    Jasmine - Massachusetts Resources Specialist

    Responsible for connecting users with MA-specific climate programs,
    workforce development opportunities, and local resources.
    """
    try:
        # Get user message
        messages = state.get("messages", [])
        user_message = messages[-1].get("content", "") if messages else ""

        logger.info(f"Jasmine processing: {user_message[:100]}...")

        # Analyze for Massachusetts-specific context
        user_lower = user_message.lower()
        ma_keywords = [
            "massachusetts",
            "ma",
            "boston",
            "springfield",
            "worcester",
            "lowell",
            "cambridge",
            "brockton",
            "new bedford",
            "lynn",
            "fall river",
            "quincy",
            "newton",
            "lawrence",
            "somerville",
            "framingham",
            "haverhill",
            "waltham",
            "malden",
            "brookline",
            "plymouth",
            "medford",
            "taunton",
            "chicopee",
            "weymouth",
            "revere",
            "peabody",
            "methuen",
            "barnstable",
            "pittsfield",
            "attleboro",
            "everett",
            "salem",
            "westfield",
            "leominster",
            "fitchburg",
            "beverly",
            "holyoke",
            "marlborough",
            "woburn",
            "amherst",
            "braintree",
            "shrewsbury",
            "chelsea",
            "dartmouth",
            "andover",
            "franklin",
            "tewksbury",
            "gloucester",
            "natick",
            "wellesley",
            "norwood",
            "randolph",
            "watertown",
            "stoughton",
            "danvers",
            "billerica",
            "arlington",
            "needham",
            "milford",
            "lexington",
            "milton",
            "saugus",
            "wakefield",
            "reading",
            "dedham",
            "burlington",
            "medway",
            "north attleborough",
            "westborough",
            "agawam",
            "winchester",
            "easthampton",
            "northampton",
            "wilmington",
            "easton",
            "amesbury",
            "acton",
            "longmeadow",
            "north andover",
            "norfolk",
            "bellingham",
            "swampscott",
            "gardner",
            "hudson",
            "grafton",
            "holden",
            "hopkinton",
            "seekonk",
            "mansfield",
            "middleborough",
            "wareham",
            "uxbridge",
            "westwood",
            "east longmeadow",
            "mashpee",
            "norton",
            "millis",
            "auburn",
            "southbridge",
            "oxford",
            "cohasset",
            "scituate",
            "palmer",
            "webster",
            "millbury",
            "spencer",
            "ludlow",
            "clinton",
            "westport",
            "whitman",
            "hanover",
            "east bridgewater",
            "west springfield",
            "douglas",
            "maynard",
            "blackstone",
            "rehoboth",
            "northbridge",
            "southborough",
            "duxbury",
            "holbrook",
            "rockland",
            "abington",
            "foxborough",
            "charlton",
            "ashland",
            "hanson",
            "north reading",
            "gateway cities",
            "masscec",
            "clean energy center",
        ]

        # Check if this is Massachusetts-specific
        is_ma_specific = any(keyword in user_lower for keyword in ma_keywords)

        if not is_ma_specific:
            # Suggest Massachusetts resources but don't handle if not MA-specific
            return Command(
                goto="specialists_team",
                update={
                    "messages": messages
                    + [
                        {
                            "id": str(uuid.uuid4()),
                            "role": "assistant",
                            "content": "I'm Jasmine, the Massachusetts Resources Specialist. While I specialize in Massachusetts-specific climate programs and opportunities, I can connect you with resources if you're interested in the Commonwealth's clean energy initiatives, workforce development programs, or local opportunities. Let me know if you'd like information about Massachusetts programs, or I can route you to another specialist.",
                            "agent": "jasmine",
                            "team": "specialists_team",
                            "timestamp": datetime.now().isoformat(),
                            "metadata": {
                                "routing_reason": "Not Massachusetts-specific",
                                "suggested_alternative": "Massachusetts resources available",
                            },
                        }
                    ]
                },
            )

        # Handle Massachusetts-specific questions
        response = model.invoke(
            [
                SystemMessage(
                    content="""You are Jasmine, the Massachusetts Resources Specialist for the Climate Economy Assistant.

You specialize in connecting users with Massachusetts-specific climate programs, workforce development opportunities, and local resources including:

- Massachusetts Clean Energy Center (MassCEC) programs and initiatives
- Gateway Cities workforce development programs
- Community college clean energy training programs
- State agency climate positions and opportunities
- Municipal climate job opportunities across the Commonwealth
- Regional economic development programs
- Local nonprofit climate organizations
- Professional certification and licensing programs

Provide specific, actionable information including:
- Program names and descriptions
- Contact information and websites
- Eligibility requirements
- Application processes and deadlines
- Costs and financial aid options
- Location and scheduling details

Be encouraging and knowledgeable about Massachusetts' leadership in clean energy and climate action."""
                ),
                HumanMessage(content=user_message),
            ]
        )

        assistant_message = {
            "id": str(uuid.uuid4()),
            "role": "assistant",
            "content": response.content,
            "agent": "jasmine",
            "team": "specialists_team",
            "timestamp": datetime.now().isoformat(),
            "metadata": {
                "confidence": 0.9,
                "response_type": "ma_resources",
                "tools_used": ["direct_response"],
                "specialization": "massachusetts_resources",
            },
        }

        return Command(
            goto="quality_check", update={"messages": messages + [assistant_message]}
        )

    except Exception as e:
        logger.error(f"Error in Jasmine agent: {e}")

        error_message = {
            "id": str(uuid.uuid4()),
            "role": "assistant",
            "content": "I apologize, but I encountered an error while processing your request. As your Massachusetts Resources Specialist, I'm here to help connect you with the Commonwealth's excellent climate programs, workforce development opportunities, and local resources. Please try rephrasing your question, and I'll do my best to help you find the right Massachusetts programs for your needs.",
            "agent": "jasmine",
            "team": "specialists_team",
            "timestamp": datetime.now().isoformat(),
            "metadata": {"error": str(e)},
        }

        return Command(
            goto="quality_check",
            update={"messages": state.get("messages", []) + [error_message]},
        )
