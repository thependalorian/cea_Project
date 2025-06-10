#!/usr/bin/env python3
"""
Interactive CLI for Climate Economy Assistant
Run this script to have a command-line conversation with your climate assistant.

Usage: python interactive_cli.py
"""

import os
import sys
from typing import List
from dotenv import load_dotenv
from langchain_core.messages import HumanMessage, BaseMessage

# Load environment variables
load_dotenv()

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import the chat graph
from api.chat.interactive_chat import create_chat_graph


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

    # Initialize the chat graph
    try:
        graph = create_chat_graph()
        print("✅ Climate Economy Assistant initialized successfully!\n")
    except Exception as e:
        print(f"❌ Error initializing assistant: {e}")
        return

    # Initialize conversation state
    messages: List[BaseMessage] = []
    session_id = "interactive_cli_session"

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
            state = {
                "messages": messages,
                "user_id": "cli_user",
                "session_id": session_id,
                "context": {},
            }

            # Get response from the graph
            print("Assistant: ", end="", flush=True)

            # Run the graph
            result = graph.invoke(state)

            # Extract the assistant's response
            if result and "messages" in result:
                new_messages = result["messages"]
                if new_messages:
                    assistant_message = new_messages[-1]
                    print(assistant_message.content)
                    messages.append(assistant_message)
                else:
                    print("Sorry, I couldn't generate a response. Please try again.")
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
