#!/usr/bin/env python3
"""
Standalone test for Climate Supervisor Workflow
Tests the workflow without importing the problematic api package
"""

import sys
import os
import asyncio
from pathlib import Path
import uuid

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))


def test_climate_supervisor_import():
    """Test importing the climate supervisor workflow directly"""
    print("🧪 Testing Climate Supervisor Workflow Import...")

    try:
        # Import the module directly
        import importlib.util

        # Load the climate_supervisor_workflow module directly
        workflow_path = (
            backend_dir / "api" / "workflows" / "climate_supervisor_workflow.py"
        )
        spec = importlib.util.spec_from_file_location(
            "climate_supervisor_workflow", workflow_path
        )
        csw_module = importlib.util.module_from_spec(spec)

        # Execute the module
        spec.loader.exec_module(csw_module)

        print("✅ Climate supervisor workflow module loaded successfully!")

        # Test if we can access the graph
        if hasattr(csw_module, "climate_supervisor_graph"):
            graph = csw_module.climate_supervisor_graph
            print(f"✅ Climate supervisor graph found: {type(graph)}")
            return graph
        else:
            print("❌ climate_supervisor_graph not found in module")
            return None

    except Exception as e:
        print(f"❌ Import failed: {e}")
        import traceback

        traceback.print_exc()
        return None


async def test_climate_supervisor_workflow():
    """Test running the climate supervisor workflow"""

    # First test import
    graph = test_climate_supervisor_import()
    if not graph:
        return False

    print("\n🧪 Testing Climate Supervisor Workflow Execution...")

    try:
        # Import the state class from the module
        import importlib.util

        workflow_path = (
            backend_dir / "api" / "workflows" / "climate_supervisor_workflow.py"
        )
        spec = importlib.util.spec_from_file_location(
            "climate_supervisor_workflow", workflow_path
        )
        csw_module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(csw_module)

        ClimateAgentState = csw_module.ClimateAgentState
        HumanMessage = csw_module.HumanMessage

        # Create test state
        test_state = ClimateAgentState(
            messages=[
                HumanMessage(
                    content="I'm a military veteran interested in clean energy careers in Massachusetts. Can you help me?"
                )
            ],
            user_id=str(uuid.uuid4()),
            conversation_id=str(uuid.uuid4()),
        )

        print("✅ Test state created successfully!")

        # Try to invoke the workflow
        result = await graph.ainvoke(test_state)

        print("✅ Workflow execution successful!")
        print(f"📊 Result summary:")
        print(f"   - Messages: {len(result.get('messages', []))}")
        print(f"   - Current specialist: {result.get('current_specialist')}")
        print(f"   - Tools used: {result.get('tools_used', [])}")

        return True

    except Exception as e:
        print(f"❌ Workflow execution failed: {e}")
        import traceback

        traceback.print_exc()
        return False


if __name__ == "__main__":
    print("🚀 Climate Economy Assistant Supervisor Workflow Test")
    print("=" * 60)

    # Test import first
    graph = test_climate_supervisor_import()

    if graph:
        print("\n🎯 Proceeding to workflow execution test...")
        success = asyncio.run(test_climate_supervisor_workflow())

        if success:
            print("\n✅ All tests passed! Climate supervisor workflow is ready.")
        else:
            print("\n❌ Workflow execution test failed.")
    else:
        print("\n❌ Import test failed. Cannot proceed to execution test.")
