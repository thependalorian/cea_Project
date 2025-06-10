#!/usr/bin/env python3
"""
Simple Interactive CLI for Climate Economy Assistant
Direct chat implementation without complex imports to avoid circular dependencies.

Usage: python simple_interactive_chat.py
"""

import os
from typing import List
from dotenv import load_dotenv
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage, BaseMessage
from langchain_openai import ChatOpenAI
from typing_extensions import TypedDict
from langgraph.graph import StateGraph, END, START

# Load environment variables
load_dotenv()


class ChatState(TypedDict):
    """State for the interactive chat workflow"""

    messages: List[BaseMessage]


def get_llm():
    """Get the language model for chat"""
    return ChatOpenAI(model="gpt-4o", temperature=0.7)


def climate_assistant_node(state: ChatState) -> dict:
    """
    Main climate assistant node that responds to user messages
    """
    messages = state.get("messages", [])

    # Create system message for climate economy focus
    system_message = SystemMessage(
        content="""You are a Climate Economy Assistant specializing in Massachusetts' climate job market and career transitions.

Your expertise includes:
- Clean energy careers (solar, wind, energy efficiency)
- Green infrastructure and sustainable transportation
- Climate policy and environmental compliance
- Skills translation from traditional to climate sectors
- Resume analysis for climate career transitions
- Educational pathways and training programs

Provide practical, actionable guidance based on Massachusetts' climate economy initiatives and job market. Be conversational, supportive, and specific in your recommendations."""
    )

    # Prepare messages for the LLM
    llm_messages = [system_message] + messages

    # Get response from LLM
    llm = get_llm()
    response = llm.invoke(llm_messages)

    # Add the new response to messages
    updated_messages = messages + [response]

    return {"messages": updated_messages}


def create_simple_chat_graph():
    """Create and return the compiled chat graph"""

    # Initialize the graph
    workflow = StateGraph(ChatState)

    # Add nodes
    workflow.add_node("climate_assistant", climate_assistant_node)

    # Add edges
    workflow.add_edge(START, "climate_assistant")
    workflow.add_edge("climate_assistant", END)

    # Compile the graph
    graph = workflow.compile()

    return graph


def print_banner():
    """Print the Climate Economy Assistant banner"""
    print("\n" + "=" * 60)
    print("🌱 CLIMATE ECONOMY ASSISTANT - INTERACTIVE CHAT 🌱")
    print("=" * 60)
    print("Welcome to your Massachusetts Climate Career Assistant!")
    print("Ask about:")
    print("• Clean energy jobs (solar, wind, efficiency)")
    print("• Green infrastructure careers")
    print("• Climate policy positions")
    print("• Skills transition to climate sectors")
    print("• Resume advice for climate jobs")
    print("• Training programs and education")
    print("\nType 'quit', 'exit', or 'bye' to end the conversation.")
    print("=" * 60 + "\n")


def main():
    """Main interactive chat loop"""
    print_banner()

    # Check for OpenAI API key
    if not os.getenv("OPENAI_API_KEY"):
        print("❌ Error: OPENAI_API_KEY not found in environment variables.")
        print("Please make sure your .env file contains your OpenAI API key.")
        return

    # Initialize the chat graph
    try:
        graph = create_simple_chat_graph()
        print("✅ Climate Economy Assistant initialized successfully!\n")
    except Exception as e:
        print(f"❌ Error initializing assistant: {e}")
        return

    # Initialize conversation state
    messages: List[BaseMessage] = []

    print(
        "Assistant: Hi! I'm your Climate Economy Assistant specializing in Massachusetts' climate job market. How can I help you with your climate career today?\n"
    )

    while True:
        try:
            # Get user input
            user_input = input("You: ").strip()

            # Check for exit commands
            if user_input.lower() in ["quit", "exit", "bye", "q"]:
                print(
                    "\nAssistant: Great talking with you! Good luck with your climate career journey! 🌱\n"
                )
                break

            if not user_input:
                continue

            # Create user message
            user_message = HumanMessage(content=user_input)
            messages.append(user_message)

            # Prepare state for the graph
            state = {"messages": messages}

            # Get response from the graph
            print("Assistant: ", end="", flush=True)

            # Run the graph
            result = graph.invoke(state)

            # Extract the updated messages
            if result and "messages" in result:
                updated_messages = result["messages"]
                # Get the latest assistant message
                assistant_message = updated_messages[-1]
                print(assistant_message.content)
                messages = updated_messages
            else:
                print("Sorry, I couldn't generate a response. Please try again.")

            print()  # Add a blank line for readability

        except KeyboardInterrupt:
            print(
                "\n\nAssistant: Goodbye! Have a great day working on your climate career! 🌱\n"
            )
            break
        except Exception as e:
            print(f"\n❌ Error: {e}")
            print("Please try again or type 'quit' to exit.\n")


if __name__ == "__main__":
    main()
