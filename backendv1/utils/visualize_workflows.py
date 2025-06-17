#!/usr/bin/env python3
"""
Workflow Visualization Script

This script uses the graph_visualizer module to generate visualizations
for all workflows in the Climate Economy Assistant project.
"""

import os
import sys
from pathlib import Path

# Add the project root to the Python path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from backendv1.utils.graph_visualizer import generate_all_workflow_visualizations


def main():
    """
    Main function to generate visualizations for all workflows.
    """
    # Set output directory
    output_dir = os.path.join("docs", "consolidated", "workflows", "official_diagrams")

    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)

    print(f"Generating official LangGraph visualizations in {output_dir}...")

    # Generate visualizations
    generate_all_workflow_visualizations(output_dir)

    print("Visualization complete!")
    print("These diagrams use the official LangGraph visualization approach.")


if __name__ == "__main__":
    main()
