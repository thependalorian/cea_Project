#!/usr/bin/env python3
"""
Full System Interactive CLI for Climate Economy Assistant
This connects to the REAL sophisticated multi-agent system with all specialists.

Enhanced Version: Improved compatibility, error handling, and message formatting.
Usage: python full_system_chat.py
"""

import asyncio
import os
import sys
import uuid
import json
from datetime import datetime
from typing import Dict, Any, List
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add the backend directory to Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

# Import the REAL agent system and message types
from core.agents.langgraph_agents import create_agent_graph, AgentState
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage


def print_banner():
    """Print the Climate Economy Assistant banner"""
    print("\n" + "=" * 80)
    print("🌱 CLIMATE ECONOMY ASSISTANT - FULL SYSTEM CHAT 🌱")
    print("=" * 80)
    print("Connected to SOPHISTICATED MULTI-AGENT SYSTEM:")
    print("🎯 Pendo - Massachusetts Climate Economy Supervisor")
    print("👨‍💼 Marcus - Veterans Specialist (Military → Climate Careers)")
    print("🌍 Liv - International Professional Specialist (Credentials & Visa)")
    print("⚖️ Miguel - Environmental Justice Specialist (Gateway Cities Focus)")
    print("📊 Jasmine - MA Resource Analyst (Resume Analysis & Job Matching)")
    print("=" * 80)
    print("🚀 REAL CAPABILITIES:")
    print("• 1,777+ lines of sophisticated agent orchestration")
    print("• Human-in-the-loop escalation system")
    print("• Database integration with Supabase")
    print("• Resume processing & analysis (31KB+ tools)")
    print("• Web search integration (35KB+ tools)")
    print("• Job matching with 38,100 MA climate jobs pipeline")
    print("• Gateway Cities focus: Brockton, Fall River/New Bedford, Lowell/Lawrence")
    print("=" * 80)
    print("Ask about:")
    print("• Climate careers & job matching")
    print("• Resume analysis & improvement")
    print("• Skills translation & training")
    print("• International credential recognition")
    print("• Veteran transition support")
    print("• Environmental justice career opportunities")
    print("• Massachusetts-specific climate resources")
    print("\nType 'quit', 'exit', or 'bye' to end the conversation.")
    print("=" * 80 + "\n")


def format_agent_response(content: str, agent_name: str = None) -> str:
    """Format agent response with proper styling"""
    if not content:
        return "I'm processing your request. Could you please provide more details?"

    # Clean up the content
    content = content.strip()

    # Add agent identifier if available
    if agent_name:
        agent_emoji = {
            "pendo": "🎯",
            "marcus": "👨‍💼",
            "liv": "🌍",
            "miguel": "⚖️",
            "jasmine": "📊",
        }
        emoji = agent_emoji.get(agent_name.lower().split("_")[0], "🤖")
        return f"{emoji} **{agent_name.title()}**: {content}"

    return content


def convert_to_langchain_messages(
    conversation_history: List[Dict[str, Any]],
) -> List[Any]:
    """Convert conversation history to LangChain message objects"""
    langchain_messages = []

    for msg in conversation_history:
        try:
            role = msg.get("role", "user")
            content = msg.get("content", "")

            if role == "user":
                langchain_messages.append(HumanMessage(content=content))
            elif role == "assistant":
                langchain_messages.append(AIMessage(content=content))
            elif role == "system":
                langchain_messages.append(SystemMessage(content=content))

        except Exception as e:
            print(f"Debug: Error converting message: {e}")
            continue

    return langchain_messages


def extract_response_from_messages(messages: List[Any]) -> tuple[str, str]:
    """Extract the assistant response and agent name from messages"""
    if not messages:
        return "No response generated.", None

    # Look for the most recent assistant message
    for message in reversed(messages):
        try:
            # Handle different message formats safely
            content = None
            agent_name = None

            if isinstance(message, dict):
                # Dictionary format - check role first
                if message.get("role") == "user":
                    continue  # Skip user messages

                content = message.get("content", "")
                agent_name = (
                    message.get("name")
                    or message.get("agent_type")
                    or message.get("agent_name")
                    or message.get("role")
                )

            elif hasattr(message, "content"):
                # Object format with content attribute
                content = getattr(message, "content", "")

                # Try different attribute names for agent identification
                agent_name = (
                    getattr(message, "name", None)
                    or getattr(message, "agent_type", None)
                    or getattr(message, "agent_name", None)
                    or getattr(message, "type", None)
                )

                # Check additional_kwargs for more info
                if hasattr(message, "additional_kwargs") and isinstance(
                    message.additional_kwargs, dict
                ):
                    agent_name = (
                        agent_name
                        or message.additional_kwargs.get("agent_name")
                        or message.additional_kwargs.get("specialist")
                        or message.additional_kwargs.get("specialist_type")
                    )

            else:
                # Fallback - convert to string
                content = str(message)
                agent_name = None

            # Return the first valid content found
            if content and content.strip():
                return content.strip(), agent_name

        except Exception as e:
            print(f"Debug: Error processing message: {e}")
            print(f"Debug: Message type: {type(message)}")
            print(f"Debug: Message: {str(message)[:200]}...")
            continue

    return (
        "I processed your request but couldn't generate a proper response. Please try rephrasing.",
        None,
    )


async def check_environment():
    """Check environment setup and provide helpful feedback"""
    print("🔍 Checking system environment...")

    # Check required environment variables
    required_vars = {
        "OPENAI_API_KEY": "OpenAI API access",
        "SUPABASE_URL": "Supabase database connection",
        "SUPABASE_SERVICE_ROLE_KEY": "Supabase authentication",
        "LANGCHAIN_API_KEY": "LangChain tracing (optional)",
        "LANGSMITH_API_KEY": "LangSmith monitoring (optional)",
    }

    missing_vars = []
    optional_missing = []

    for var, description in required_vars.items():
        if not os.getenv(var):
            if "optional" in description:
                optional_missing.append(f"  • {var}: {description}")
            else:
                missing_vars.append(f"  • {var}: {description}")

    if missing_vars:
        print("❌ Missing required environment variables:")
        for var in missing_vars:
            print(var)
        return False

    if optional_missing:
        print("⚠️  Optional environment variables not set:")
        for var in optional_missing:
            print(var)
        print("   (This won't affect functionality, just monitoring)")

    print("✅ Environment check passed!")
    return True


async def run_full_system_chat():
    """Main interactive chat loop using the REAL agent system"""
    print_banner()

    # Check environment
    if not await check_environment():
        print("\nPlease check your .env file and try again.")
        return

    # Initialize the REAL agent graph
    try:
        print("\n🔄 Initializing sophisticated multi-agent system...")
        agent_graph = await create_agent_graph()
        print("✅ Full Climate Economy Assistant system initialized successfully!\n")
    except Exception as e:
        print(f"❌ Error initializing agent system: {e}")
        print("💡 Tip: Make sure your .env file is properly configured and try again.")
        return

    # Generate session identifiers
    user_id = str(uuid.uuid4())
    conversation_id = str(uuid.uuid4())

    # Welcome message
    print("🤖 **Climate Economy Assistant Team Ready!**\n")
    print(
        "Hi! I'm your full-featured Climate Economy Assistant with specialized agents"
    )
    print("for Massachusetts climate careers. My team of experts is ready to help:\n")
    print("🎯 **Pendo (Supervisor)**: Strategic coordination and routing")
    print("👨‍💼 **Marcus (Veterans)**: Military → Climate career transitions")
    print("🌍 **Liv (International)**: Credential recognition & visa pathways")
    print("⚖️ **Miguel (Environmental Justice)**: Gateway Cities opportunities")
    print("📊 **Jasmine (Resource Analyst)**: Resume analysis & job matching")
    print(
        "\n🚀 **Capabilities**: 38,100 Massachusetts climate jobs, sophisticated resume"
    )
    print("analysis, web search tools, and human expert escalation available.")
    print("\n💬 **How can we help you transition to a climate career today?**\n")

    conversation_history = []

    while True:
        try:
            # Get user input
            user_input = input("You: ").strip()

            # Check for exit commands
            if user_input.lower() in ["quit", "exit", "bye", "q"]:
                print(
                    "\n🌱 **Climate Economy Assistant**: Thank you for using our service!"
                )
                print("Best of luck with your climate career journey! 🚀\n")
                break

            if not user_input:
                print("💭 Please enter your question or type 'quit' to exit.\n")
                continue

            # Add user message to history
            conversation_history.append(
                {
                    "role": "user",
                    "content": user_input,
                    "timestamp": datetime.now().isoformat(),
                }
            )

            # Convert conversation history to LangChain messages
            langchain_messages = convert_to_langchain_messages(conversation_history)

            # Create the state for the agent system - using simple message format for current query
            initial_state: AgentState = {
                "messages": langchain_messages,
                "uuid": user_id,
                "conversation_id": conversation_id,
                "query": user_input,
                "context": "Interactive CLI session with full agent system",
                "workflow_state": "active",
                "human_input": None,
                "current_agent": None,
                "resume_data": None,
                "resume_id": None,
                "resume_analysis": None,
                "next": None,
            }

            print("🔄 Processing with multi-agent system...")

            # Run the REAL agent graph
            try:
                result = await agent_graph.ainvoke(initial_state)
            except Exception as e:
                print(f"⚠️  Agent processing error: {e}")
                print("🔄 Retrying with fresh message...")

                # Retry with just the current message
                simple_state: AgentState = {
                    "messages": [HumanMessage(content=user_input)],
                    "uuid": user_id,
                    "conversation_id": conversation_id,
                    "query": user_input,
                    "context": "Simple CLI request",
                    "workflow_state": "active",
                    "human_input": None,
                    "current_agent": None,
                    "resume_data": None,
                    "resume_id": None,
                    "resume_analysis": None,
                    "next": None,
                }

                try:
                    result = await agent_graph.ainvoke(simple_state)
                except Exception as retry_error:
                    print(f"❌ System error: {retry_error}")
                    print("Please try rephrasing your question or contact support.\n")
                    continue

            # Extract and display the response
            if result and "messages" in result:
                response_content, agent_name = extract_response_from_messages(
                    result["messages"]
                )
                formatted_response = format_agent_response(response_content, agent_name)
                print(f"\n{formatted_response}")

                # Add response to conversation history
                conversation_history.append(
                    {
                        "role": "assistant",
                        "content": response_content,
                        "agent": agent_name,
                        "timestamp": datetime.now().isoformat(),
                    }
                )

            else:
                print(
                    "\n🤖 **Assistant**: I processed your request, but couldn't generate a response."
                )
                print("Could you please rephrase your question or be more specific?")

            # Show additional context
            if result:
                # Show which agent handled the request
                if result.get("current_agent"):
                    agent_display = result["current_agent"].replace("_", " ").title()
                    print(f"📋 **Handled by**: {agent_display}")

                # Show workflow state
                workflow_state = result.get("workflow_state", "completed")
                if workflow_state == "pending_human":
                    print(
                        "⏳ **Status**: Escalated to human experts for additional assistance"
                    )
                elif workflow_state == "active":
                    print("✅ **Status**: Processing complete")

            print()  # Add a blank line for readability

        except KeyboardInterrupt:
            print(
                "\n\n🌱 **Climate Economy Assistant**: Goodbye! Have a great day working"
            )
            print("on your climate career! 🚀\n")
            break
        except Exception as e:
            print(f"\n❌ **Unexpected Error**: {e}")
            print("💡 **Tip**: Try rephrasing your question or type 'quit' to exit.\n")


def main():
    """Entry point for the CLI"""
    try:
        asyncio.run(run_full_system_chat())
    except KeyboardInterrupt:
        print("\n\n🌱 **Goodbye!** Thanks for using the Climate Economy Assistant! 🚀")
    except Exception as e:
        print(f"\n❌ **System Error**: {e}")
        print("Please check your setup and try again.")


if __name__ == "__main__":
    main()
