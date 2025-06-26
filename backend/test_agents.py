#!/usr/bin/env python3
"""
Test script for Climate Economy Assistant agents and import validation.
"""

import sys
import os
import asyncio
import traceback
from datetime import datetime
from typing import Dict, Any, List

# Add project root to path
project_root = os.path.dirname(os.path.abspath("."))
sys.path.insert(0, project_root)
sys.path.insert(0, os.path.abspath("."))


# Color codes for terminal output
class Colors:
    GREEN = "\033[92m"
    RED = "\033[91m"
    YELLOW = "\033[93m"
    BLUE = "\033[94m"
    PURPLE = "\033[95m"
    CYAN = "\033[96m"
    WHITE = "\033[97m"
    BOLD = "\033[1m"
    UNDERLINE = "\033[4m"
    END = "\033[0m"


def print_header(text: str):
    """Print a formatted header"""
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{text.center(60)}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.END}\n")


def print_success(text: str):
    """Print success message"""
    print(f"{Colors.GREEN}✅ {text}{Colors.END}")


def print_error(text: str):
    """Print error message"""
    print(f"{Colors.RED}❌ {text}{Colors.END}")


def print_warning(text: str):
    """Print warning message"""
    print(f"{Colors.YELLOW}⚠️  {text}{Colors.END}")


def print_info(text: str):
    """Print info message"""
    print(f"{Colors.CYAN}ℹ️  {text}{Colors.END}")


# Test results storage
test_results = {
    "imports": {"passed": 0, "failed": 0, "errors": []},
    "agents": {"passed": 0, "failed": 0, "errors": []},
    "tools": {"passed": 0, "failed": 0, "errors": []},
    "services": {"passed": 0, "failed": 0, "errors": []},
    "overall": {"passed": 0, "failed": 0},
}


def test_import(module_name: str, description: str = "") -> bool:
    """Test importing a module"""
    try:
        __import__(module_name)
        print_success(f"Import {module_name} {description}")
        test_results["imports"]["passed"] += 1
        return True
    except ImportError as e:
        print_error(f"Import {module_name} failed: {e}")
        test_results["imports"]["failed"] += 1
        test_results["imports"]["errors"].append(f"{module_name}: {e}")
        return False
    except Exception as e:
        print_error(f"Import {module_name} error: {e}")
        test_results["imports"]["failed"] += 1
        test_results["imports"]["errors"].append(f"{module_name}: {e}")
        return False


async def test_agent_basic(agent_class, agent_name: str) -> bool:
    """Test basic agent functionality"""
    try:
        # Initialize agent
        agent = agent_class()
        print_info(f"Testing {agent_name} initialization...")

        # Test initialization
        await agent.initialize()
        print_success(f"{agent_name} initialized successfully")

        # Test capabilities
        capabilities = agent.get_capabilities()
        print_info(f"{agent_name} capabilities: {list(capabilities.keys())}")

        # Test tool validation
        tools_valid = await agent.validate_tools()
        if tools_valid:
            print_success(f"{agent_name} tools validated")
        else:
            print_warning(f"{agent_name} some tools not available")

        # Test cleanup
        await agent.cleanup()
        print_success(f"{agent_name} cleanup successful")

        test_results["agents"]["passed"] += 1
        return True

    except Exception as e:
        print_error(f"{agent_name} test failed: {e}")
        test_results["agents"]["failed"] += 1
        test_results["agents"]["errors"].append(f"{agent_name}: {e}")
        return False


async def test_agent_with_state(agent_class, agent_name: str) -> bool:
    """Test agent with state processing"""
    try:
        from backend.agents.base.agent_state import AgentState
        from langchain_core.messages import HumanMessage

        # Initialize agent
        if agent_name.lower() == "lauren":
            # Lauren needs a config parameter
            from backend.config.agent_config import AgentConfig

            config = AgentConfig()
            agent = agent_class(config)
        else:
            agent = agent_class()

        await agent.initialize()

        # Create test state - use the correct AgentState from agent_state.py
        state = AgentState(
            agent_id=agent_name.lower(),
            conversation_id="test_conv_001",
            user_id="test_user_001",
            current_step="start",
            memory={},
            metadata={"test": True},
        )

        print_info(f"Testing {agent_name} state processing...")

        # Test state processing (if agent has process method)
        if hasattr(agent, "process"):
            # For agents that expect messages, create a compatible state
            try:
                # Try to create a state with messages if the agent expects it
                from backend.agents.base.agent_base import AgentState as BaseAgentState

                base_state = BaseAgentState(
                    messages=[
                        HumanMessage(content="Hello, I need help with climate careers")
                    ],
                    current_agent=agent_name.lower(),
                    next_agent=None,
                    memory={},
                    metadata={"test": True},
                )
                processed_state = await agent.process(base_state)
                print_success(f"{agent_name} processed state successfully")
                print_info(f"State updated at: {processed_state.updated_at}")
            except Exception as e:
                # If that fails, try with the simple state
                processed_state = await agent.process(state)
                print_success(f"{agent_name} processed state successfully")
                print_info(f"State updated at: {processed_state.updated_at}")
        else:
            print_warning(f"{agent_name} does not have process method")

        await agent.cleanup()
        return True

    except Exception as e:
        print_error(f"{agent_name} state test failed: {e}")
        traceback.print_exc()
        return False


def test_core_imports():
    """Test core system imports"""
    print_header("TESTING CORE IMPORTS")

    core_imports = [
        ("backend.database.supabase_client", "Supabase client"),
        ("backend.database.redis_client", "Redis client"),
        ("backend.utils.logger", "Logger utilities"),
        ("backend.utils.error_handling", "Error handling"),
        ("backend.config.settings", "Settings configuration"),
        ("backend.agents.base.agent_base", "Base agent classes"),
        ("backend.agents.base.agent_state", "Agent state management"),
        ("backend.agents.agent_coordinator", "Agent coordinator"),
    ]

    for module, desc in core_imports:
        test_import(module, desc)


def test_agent_imports():
    """Test agent implementation imports"""
    print_header("TESTING AGENT IMPORTS")

    agent_imports = [
        ("backend.agents.implementations.pendo", "Pendo supervisor agent"),
        ("backend.agents.implementations.marcus", "Marcus veterans agent"),
        ("backend.agents.implementations.lauren", "Lauren climate careers agent"),
        ("backend.agents.implementations.miguel", "Miguel environmental justice agent"),
        ("backend.agents.implementations.alex", "Alex empathy agent"),
        ("backend.agents.implementations.liv", "Liv international agent"),
        ("backend.agents.implementations.mai", "Mai resume specialist agent"),
        ("backend.agents.implementations.jasmine", "Jasmine MA resources agent"),
    ]

    for module, desc in agent_imports:
        test_import(module, desc)


def test_tool_imports():
    """Test tool imports"""
    print_header("TESTING TOOL IMPORTS")

    tool_imports = [
        ("backend.tools.base_tool", "Base tool class"),
        ("backend.tools.resume.process_resume", "Resume processing"),
        ("backend.tools.resume.analyze_resume_for_climate_careers", "Resume analysis"),
        ("backend.tools.job_matching.match_jobs", "Job matching"),
        ("backend.tools.search.semantic_search", "Semantic search"),
        ("backend.tools.specialized.climate_careers", "Climate careers tool"),
        (
            "backend.tools.specialized.environmental_justice",
            "Environmental justice tool",
        ),
        ("backend.tools.specialized.veterans", "Veterans resources tool"),
        ("backend.tools.training.find_programs", "Training programs tool"),
        ("backend.tools.analytics.track_interactions", "Analytics tracking"),
    ]

    for module, desc in tool_imports:
        test_import(module, desc)


def test_api_imports():
    """Test API imports"""
    print_header("TESTING API IMPORTS")

    api_imports = [
        ("backend.api.models.auth", "Auth models"),
        ("backend.api.models.user", "User models"),
        ("backend.api.models.conversation", "Conversation models"),
        ("backend.api.models.resume", "Resume models"),
        ("backend.api.routes.auth", "Auth routes"),
        ("backend.api.routes.users", "User routes"),
        ("backend.api.routes.conversations", "Conversation routes"),
        ("backend.api.services.conversation_service", "Conversation service"),
        ("backend.api.services.user_service", "User service"),
    ]

    for module, desc in api_imports:
        test_import(module, desc)


async def test_agent_functionality():
    """Test agent functionality"""
    print_header("TESTING AGENT FUNCTIONALITY")

    # Test agents
    agents_to_test = [
        ("PendoAgent", "backend.agents.implementations.pendo"),
        ("MarcusAgent", "backend.agents.implementations.marcus"),
        ("LaurenAgent", "backend.agents.implementations.lauren"),
        ("MiguelAgent", "backend.agents.implementations.miguel"),
        ("AlexAgent", "backend.agents.implementations.alex"),
        ("LivAgent", "backend.agents.implementations.liv"),
        ("MaiAgent", "backend.agents.implementations.mai"),
        ("JasmineAgent", "backend.agents.implementations.jasmine"),
    ]

    for agent_name, module_path in agents_to_test:
        await test_agent(agent_name, module_path)


async def test_agent_basic_with_config(agent_class, agent_name: str, config) -> bool:
    """Test basic agent functionality with config parameter"""
    try:
        # Initialize agent with config
        agent = agent_class(config)
        print_info(f"Testing {agent_name} initialization with config...")

        # Test initialization
        await agent.initialize()
        print_success(f"{agent_name} initialized successfully")

        # Test capabilities
        capabilities = agent.get_capabilities()
        print_info(f"{agent_name} capabilities: {list(capabilities.keys())}")

        # Test tool validation
        tools_valid = await agent.validate_tools()
        if tools_valid:
            print_success(f"{agent_name} tools validated")
        else:
            print_warning(f"{agent_name} some tools not available")

        # Test cleanup
        await agent.cleanup()
        print_success(f"{agent_name} cleanup successful")

        test_results["agents"]["passed"] += 1
        return True

    except Exception as e:
        print_error(f"{agent_name} test failed: {e}")
        test_results["agents"]["failed"] += 1
        test_results["agents"]["errors"].append(f"{agent_name}: {e}")
        return False


async def test_coordinator():
    """Test agent coordinator"""
    print_header("TESTING AGENT COORDINATOR")

    try:
        from backend.agents.agent_coordinator import AgentCoordinator
        from backend.agents.base.agent_state import AgentState

        coordinator = AgentCoordinator()
        print_success("Agent coordinator initialized")

        # Test state creation
        try:
            from backend.agents.base.agent_state import AgentState

            state = await coordinator.create_agent_state(
                agent_id="test_agent",
                conversation_id="test_conversation",
                user_id="test_user",
                initial_step="start",
                metadata={"test": True},
            )
            print_success("✓ Agent coordinator created state successfully")

            # Test state retrieval
            retrieved_state = await coordinator.get_agent_state(
                "test_agent", "test_conversation"
            )
            if retrieved_state:
                print_success("✓ Agent coordinator retrieved state successfully")
            else:
                print_error("✗ Agent coordinator failed to retrieve state")

        except Exception as e:
            print_error(f"Agent coordinator test failed: {e}")
            import traceback

            print_error(f"Traceback: {traceback.format_exc()}")

        # Test updating agent state
        if retrieved_state:
            retrieved_state.update_step("processing")
            await coordinator.update_agent_state(retrieved_state)
            print_success("Agent state updated successfully")

        # Test listing agent states
        states = await coordinator.list_agent_states("test_conv_001")
        print_success(f"Found {len(states)} agent states")

        # Cleanup
        deleted = await coordinator.delete_agent_state("test_agent", "test_conv_001")
        if deleted:
            print_success("Agent state deleted successfully")

        test_results["services"]["passed"] += 1

    except Exception as e:
        print_error(f"Agent coordinator test failed: {e}")
        traceback.print_exc()
        test_results["services"]["failed"] += 1
        test_results["services"]["errors"].append(f"AgentCoordinator: {e}")


def print_summary():
    """Print test summary"""
    print_header("TEST SUMMARY")

    total_passed = sum(
        test_results[category]["passed"]
        for category in test_results
        if category != "overall"
    )
    total_failed = sum(
        test_results[category]["failed"]
        for category in test_results
        if category != "overall"
    )

    test_results["overall"]["passed"] = total_passed
    test_results["overall"]["failed"] = total_failed

    print(f"{Colors.BOLD}Test Results:{Colors.END}")
    print(
        f"  Imports:  {Colors.GREEN}{test_results['imports']['passed']} passed{Colors.END}, {Colors.RED}{test_results['imports']['failed']} failed{Colors.END}"
    )
    print(
        f"  Agents:   {Colors.GREEN}{test_results['agents']['passed']} passed{Colors.END}, {Colors.RED}{test_results['agents']['failed']} failed{Colors.END}"
    )
    print(
        f"  Tools:    {Colors.GREEN}{test_results['tools']['passed']} passed{Colors.END}, {Colors.RED}{test_results['tools']['failed']} failed{Colors.END}"
    )
    print(
        f"  Services: {Colors.GREEN}{test_results['services']['passed']} passed{Colors.END}, {Colors.RED}{test_results['services']['failed']} failed{Colors.END}"
    )
    print(
        f"  {Colors.BOLD}Total:    {Colors.GREEN}{total_passed} passed{Colors.END}, {Colors.RED}{total_failed} failed{Colors.END}"
    )

    if total_failed > 0:
        print(f"\n{Colors.RED}{Colors.BOLD}FAILED TESTS:{Colors.END}")
        for category in test_results:
            if (
                test_results[category]["failed"] > 0
                and "errors" in test_results[category]
            ):
                print(f"\n{Colors.RED}{category.upper()}:{Colors.END}")
                for error in test_results[category]["errors"]:
                    print(f"  {Colors.RED}• {error}{Colors.END}")

    success_rate = (
        (total_passed / (total_passed + total_failed)) * 100
        if (total_passed + total_failed) > 0
        else 0
    )

    if success_rate >= 90:
        print(
            f"\n{Colors.GREEN}{Colors.BOLD}🎉 SUCCESS RATE: {success_rate:.1f}% - EXCELLENT!{Colors.END}"
        )
    elif success_rate >= 70:
        print(
            f"\n{Colors.YELLOW}{Colors.BOLD}⚠️  SUCCESS RATE: {success_rate:.1f}% - GOOD{Colors.END}"
        )
    else:
        print(
            f"\n{Colors.RED}{Colors.BOLD}❌ SUCCESS RATE: {success_rate:.1f}% - NEEDS WORK{Colors.END}"
        )


async def test_agent(agent_name: str, module_path: str):
    """Test individual agent functionality"""
    print_info(f"Testing {agent_name}...")

    try:
        # Dynamic import
        module = __import__(module_path, fromlist=[agent_name])
        agent_class = getattr(module, agent_name)

        # Special handling for Lauren (needs config)
        if agent_name == "LaurenAgent":
            try:
                from backend.config.agent_config import AgentConfig

                config = AgentConfig()
                agent = agent_class(config)
            except Exception as e:
                print_warning(
                    f"Could not create Lauren with config, trying without: {e}"
                )
                agent = agent_class()
        else:
            agent = agent_class()

        # Test basic functionality
        print_info(f"  ✓ {agent_name} instantiated successfully")

        # Test capabilities
        capabilities = agent.get_capabilities()
        print_info(f"  ✓ {agent_name} capabilities: {len(capabilities)} items")

        # Test with simple state
        try:
            from backend.agents.base.agent_state import AgentState
            from langchain_core.messages import HumanMessage

            state = AgentState(
                agent_id="test_agent",
                conversation_id="test_conversation",
                user_id="test_user",
                current_step="test_step",
                memory={},
                messages=[
                    HumanMessage(content="Hello, I need help with climate careers")
                ],
                metadata={"test": True},
            )

            # Process state
            result_state = await agent.process(state)
            print_success(f"  ✓ {agent_name} processed state successfully")
            print_info(f"    Messages: {len(result_state.messages)}")

        except Exception as e:
            print_error(f"  ✗ {agent_name} state processing failed: {e}")

    except Exception as e:
        print_error(f"  ✗ {agent_name} test failed: {e}")
        import traceback

        print_error(f"    Traceback: {traceback.format_exc()}")


async def main():
    """Main test function"""
    print_header("CLIMATE ECONOMY ASSISTANT - AGENT TESTING")
    print(f"Starting tests at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    # Test imports first
    test_core_imports()
    test_agent_imports()
    test_tool_imports()
    test_api_imports()

    # Test agent functionality
    await test_agent_functionality()

    # Test coordinator
    await test_coordinator()

    # Print summary
    print_summary()


if __name__ == "__main__":
    asyncio.run(main())
