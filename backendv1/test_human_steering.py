#!/usr/bin/env python3
"""
Simple test for human_steering module to verify it works independently.
"""

import sys
import os

# Add the project root to Python path
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if project_root not in sys.path:
    sys.path.insert(0, project_root)


def test_human_steering_import():
    """Test that human_steering module can be imported."""
    try:
        from backendv1.workflows.human_steering import create_human_steering_context, HumanSteering

        print("✅ Successfully imported human_steering module")
        return True
    except ImportError as e:
        print(f"❌ Failed to import human_steering: {e}")
        return False


def test_context_creation():
    """Test creating a human steering context."""
    try:
        from backendv1.workflows.human_steering import create_human_steering_context

        # Create a mock state
        mock_state = {
            "user_id": "test_user",
            "current_stage": "discovery",
            "messages": [],
            "conversation_history": [],
        }

        context = create_human_steering_context(mock_state)
        print("✅ Successfully created human steering context")
        print(f"Context keys: {list(context.keys())}")
        return True
    except Exception as e:
        print(f"❌ Failed to create context: {e}")
        return False


def test_human_steering_class():
    """Test the HumanSteering class."""
    try:
        from backendv1.workflows.human_steering import HumanSteering

        # Create instance
        hs = HumanSteering()
        print("✅ Successfully created HumanSteering instance")

        # Test guidance generation
        mock_state = {
            "user_id": "test_user",
            "current_stage": "discovery",
            "messages": [],
            "conversation_history": [],
        }

        guidance = hs.generate_guidance(mock_state)
        print("✅ Successfully generated guidance")
        print(f"Guidance length: {len(guidance)} characters")
        return True
    except Exception as e:
        print(f"❌ Failed to test HumanSteering class: {e}")
        return False


if __name__ == "__main__":
    print("🧪 Testing human_steering module...")

    tests = [test_human_steering_import, test_context_creation, test_human_steering_class]

    passed = 0
    for test in tests:
        if test():
            passed += 1
        print()

    print(f"📊 Results: {passed}/{len(tests)} tests passed")

    if passed == len(tests):
        print("🎉 All tests passed! human_steering module is working correctly.")
        sys.exit(0)
    else:
        print("⚠️  Some tests failed. Check the output above.")
        sys.exit(1)
