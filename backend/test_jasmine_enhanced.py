#!/usr/bin/env python3
"""
Test script to demonstrate Enhanced Jasmine (MAResourceAnalystAgent) capabilities
"""

import asyncio
import sys
from pathlib import Path
import uuid

# Add backend to path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))


async def test_enhanced_jasmine():
    """Test the enhanced Jasmine agent with different types of queries"""

    # Import the workflow module to get the enhanced Jasmine
    import importlib.util

    workflow_path = backend_dir / "api" / "workflows" / "climate_supervisor_workflow.py"
    spec = importlib.util.spec_from_file_location(
        "climate_supervisor_workflow", workflow_path
    )
    csw_module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(csw_module)

    # Get the MAResourceAnalystAgent (enhanced fallback)
    jasmine = csw_module.MAResourceAnalystAgent()

    print("🧪 Testing Enhanced Jasmine (MAResourceAnalystAgent)")
    print("=" * 60)

    # Test different types of queries
    test_queries = [
        {
            "name": "Veteran Query",
            "message": "I'm a military veteran interested in clean energy careers in Massachusetts. Can you help me understand what opportunities are available?",
        },
        {
            "name": "International Professional",
            "message": "I'm an international engineer looking for visa-sponsored clean energy jobs in Massachusetts.",
        },
        {
            "name": "Resume Help",
            "message": "I need help updating my resume for climate careers. I have a background in customer service.",
        },
        {
            "name": "General Career Inquiry",
            "message": "What clean energy jobs are available in Massachusetts and what do they pay?",
        },
    ]

    for i, test in enumerate(test_queries, 1):
        print(f"\n🔥 Test {i}: {test['name']}")
        print("-" * 40)
        print(f"Query: {test['message']}")
        print("\nJasmine's Response:")
        print("-" * 40)

        try:
            response = await jasmine.handle_message(
                message=test["message"],
                user_id=str(uuid.uuid4()),
                conversation_id=None,
            )

            print(response["response"])
            print(f"\nMetadata: {response['metadata']}")

        except Exception as e:
            print(f"Error: {e}")

        print("\n" + "=" * 60)


if __name__ == "__main__":
    asyncio.run(test_enhanced_jasmine())
