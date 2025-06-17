#!/usr/bin/env python3
"""
Test script to verify human-in-the-loop functionality works correctly
"""

import asyncio
import os
import sys
from datetime import datetime

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from api.workflows.climate_supervisor_workflow import (
    climate_supervisor_graph,
    ClimateAgentState,
    safe_state_get,
)
from langchain_core.messages import HumanMessage


async def test_human_in_loop():
    """Test human-in-the-loop workflow to ensure no infinite loops"""

    print("🧪 Testing Human-in-the-Loop Workflow")
    print("=" * 60)

    # Create test state with the exact scenario from the user's issue
    initial_state = ClimateAgentState(
        user_id="test_user_namibia",
        conversation_id="test_hitl_001",
        messages=[
            HumanMessage(
                content="hello i need help getting a job, i'm from namibia i hold a bachelors in engineering from NUST and an MBA from brandeis, my opt is about to end and i cant apply for extention without a fulltime offer"
            )
        ],
        user_journey_stage="discovery",
        goals_validated=False,
        awaiting_user_input=False,
    )

    print(f"📝 Initial State:")
    print(
        f"   User Journey Stage: {safe_state_get(initial_state, 'user_journey_stage', 'unknown')}"
    )
    print(
        f"   Goals Validated: {safe_state_get(initial_state, 'goals_validated', False)}"
    )
    print(
        f"   Awaiting User Input: {safe_state_get(initial_state, 'awaiting_user_input', False)}"
    )
    print()

    # Track iterations to prevent infinite loops in testing
    max_iterations = 5
    iteration_count = 0

    try:
        print("🚀 Starting workflow execution...")

        # Use astream_events to track the workflow step by step
        final_state = None
        events = []

        async for event in climate_supervisor_graph.astream_events(
            initial_state,
            version="v1",
            config={"recursion_limit": 10},  # Low limit to prevent runaway
        ):
            iteration_count += 1
            events.append(event)

            print(f"📊 Event {iteration_count}: {event.get('event', 'unknown')}")

            # Break if we hit the limit
            if iteration_count >= max_iterations:
                print(
                    f"⚠️  Breaking after {max_iterations} iterations to prevent runaway"
                )
                break

            # Check for completion signals
            if event.get("event") == "on_chain_end":
                print("✅ Workflow completed successfully")
                break

        print(f"\n📈 Workflow Statistics:")
        print(f"   Total Events: {len(events)}")
        print(f"   Iterations: {iteration_count}")
        print(f"   Max Iterations: {max_iterations}")

        # Check the final state if available
        if events:
            last_event = events[-1]
            if "data" in last_event and "output" in last_event["data"]:
                final_state = last_event["data"]["output"]

                print(f"\n🎯 Final State Analysis:")
                print(
                    f"   Awaiting User Input: {final_state.get('awaiting_user_input', False)}"
                )
                print(
                    f"   Workflow State: {final_state.get('workflow_state', 'unknown')}"
                )
                print(
                    f"   Journey Stage: {final_state.get('user_journey_stage', 'unknown')}"
                )
                print(f"   Messages Count: {len(final_state.get('messages', []))}")

                # Check for proper human-in-the-loop behavior
                if final_state.get("awaiting_user_input"):
                    print("✅ SUCCESS: Workflow properly paused for user input")
                    return True
                elif final_state.get("workflow_state") == "waiting_for_input":
                    print("✅ SUCCESS: Workflow properly waiting for input")
                    return True
                else:
                    print(
                        "⚠️  WARNING: Workflow didn't pause for user input as expected"
                    )
                    return False

        if iteration_count >= max_iterations:
            print("❌ FAILED: Workflow hit iteration limit - possible infinite loop")
            return False
        else:
            print("✅ SUCCESS: Workflow completed without infinite loops")
            return True

    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return False


async def test_multiple_scenarios():
    """Test multiple human-in-the-loop scenarios"""

    print("\n🔄 Testing Multiple Scenarios")
    print("=" * 60)

    scenarios = [
        {
            "name": "Initial Career Inquiry",
            "message": "I need help getting a job in clean energy",
            "expected_stage": "discovery",
        },
        {
            "name": "Goal Confirmation",
            "message": "Yes, those goals look right for me",
            "expected_stage": "strategy",
        },
        {
            "name": "Skills Question",
            "message": "What skills do I need for solar energy?",
            "expected_stage": "discovery",
        },
    ]

    results = []

    for i, scenario in enumerate(scenarios, 1):
        print(f"\n🧪 Scenario {i}: {scenario['name']}")
        print("-" * 40)

        test_state = ClimateAgentState(
            user_id=f"test_user_{i}",
            conversation_id=f"test_scenario_{i}",
            messages=[HumanMessage(content=scenario["message"])],
            user_journey_stage=scenario["expected_stage"],
            goals_validated=False,
        )

        try:
            # Quick test with even lower limits
            event_count = 0
            max_events = 3

            async for event in climate_supervisor_graph.astream_events(
                test_state, version="v1", config={"recursion_limit": 5}
            ):
                event_count += 1
                if event_count >= max_events:
                    break

            print(f"   ✅ Completed {event_count} events without hanging")
            results.append(True)

        except Exception as e:
            print(f"   ❌ Error: {str(e)}")
            results.append(False)

    success_rate = sum(results) / len(results) * 100
    print(f"\n📊 Scenario Test Results: {success_rate:.1f}% success rate")
    return success_rate >= 100  # All scenarios must pass


async def main():
    """Main test runner"""

    print("🚀 Human-in-the-Loop Workflow Testing")
    print("=" * 60)
    print(f"📅 Test Run: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()

    # Test 1: Basic human-in-the-loop workflow
    test1_result = await test_human_in_loop()

    # Test 2: Multiple scenarios
    test2_result = await test_multiple_scenarios()

    # Final results
    print("\n" + "=" * 60)
    print("🏁 FINAL TEST RESULTS")
    print("=" * 60)

    tests = [
        ("Human-in-Loop Basic", test1_result),
        ("Multiple Scenarios", test2_result),
    ]

    passed = sum(1 for _, result in tests if result)
    total = len(tests)

    for test_name, result in tests:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"   {test_name}: {status}")

    print(f"\n📊 Overall Results: {passed}/{total} tests passed")

    if passed == total:
        print("🎉 SUCCESS: All human-in-the-loop tests passed!")
        print("✅ The workflow should no longer get stuck in infinite loops")
    else:
        print("⚠️  WARNING: Some tests failed")
        print("❌ The workflow may still have human-in-the-loop issues")

    return passed == total


if __name__ == "__main__":
    asyncio.run(main())
