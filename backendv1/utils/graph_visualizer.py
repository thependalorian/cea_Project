#!/usr/bin/env python3
"""
LangGraph Visualization Utilities

This module provides functions to visualize LangGraph graphs using the official
LangGraph visualization methods. It supports both Mermaid and PNG visualization.
"""

import os
import base64
from pathlib import Path
from typing import Optional, Dict, Any, Union, Literal

# Conditionally import IPython to avoid dependency issues
try:
    from IPython.display import Image, display

    IPYTHON_AVAILABLE = True
except ImportError:
    IPYTHON_AVAILABLE = False

    # Create dummy Image and display functions
    def Image(data):
        return data

    def display(obj):
        print("IPython display not available. Image would be displayed here.")


from langchain_core.runnables.graph import CurveStyle, MermaidDrawMethod, NodeStyles


def visualize_graph(
    graph: Any,
    output_dir: str = "docs/consolidated/workflows/images",
    filename: str = None,
    format: Literal["mermaid", "both"] = "both",
    curve_style: CurveStyle = CurveStyle.LINEAR,
    node_colors: Optional[Dict[str, str]] = None,
    background_color: str = "white",
    padding: int = 10,
    display_result: bool = False,
) -> None:
    """
    Visualize a LangGraph graph using the official LangGraph visualization methods.

    Args:
        graph: The LangGraph graph to visualize
        output_dir: Directory to save the visualization files
        filename: Base filename for the output files (without extension)
        format: Output format(s) - "mermaid" or "both"
        curve_style: Style of curves in the graph
        node_colors: Custom colors for specific node types
        background_color: Background color for the diagram
        padding: Padding around the diagram
        display_result: Whether to display the result in IPython/Jupyter

    Returns:
        None
    """
    if filename is None:
        # Try to get a name from the graph if possible
        if hasattr(graph, "__class__"):
            filename = graph.__class__.__name__.lower()
        else:
            filename = "langgraph_visualization"

    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)

    # Setup node colors if not provided
    if node_colors is None:
        node_colors = NodeStyles(
            first="#99ccff",  # Light blue for start nodes
            last="#ffcc99",  # Light orange for end nodes
            default="#f2f0ff",  # Light purple for other nodes
        )

    # Generate and save mermaid diagram
    if format in ["mermaid", "both"]:
        mermaid_code = graph.get_graph().draw_mermaid()
        mermaid_path = os.path.join(output_dir, f"{filename}.mmd")

        with open(mermaid_path, "w") as f:
            f.write(mermaid_code)

        print(f"Mermaid diagram saved to {mermaid_path}")

    # Display the mermaid diagram if requested and in an environment that supports it
    if display_result and IPYTHON_AVAILABLE:
        try:
            from IPython.display import display, Markdown

            display(Markdown(f"```mermaid\n{mermaid_code}\n```"))
        except Exception:
            print("Unable to display mermaid diagram - not in IPython/Jupyter environment")


def generate_all_workflow_visualizations(
    output_dir: str = "docs/consolidated/workflows/images",
) -> None:
    """
    Generate visualizations for all registered workflows in the project.

    Args:
        output_dir: Directory to save the visualization files

    Returns:
        None
    """
    # Import all graph objects from the workflows
    try:
        from backendv1.workflows.climate_supervisor import climate_supervisor_graph

        visualize_graph(climate_supervisor_graph, output_dir, "climate_supervisor_graph")
        print(f"Generated climate_supervisor_graph visualization")
    except ImportError as e:
        print(f"Error importing climate_supervisor_graph: {e}")

    try:
        from backendv1.workflows.empathy_workflow import empathy_graph

        visualize_graph(empathy_graph, output_dir, "empathy_workflow_graph")
        print(f"Generated empathy_workflow_graph visualization")
    except ImportError as e:
        print(f"Error importing empathy_graph: {e}")

    try:
        from backendv1.workflows.resume_workflow import graph as resume_graph

        visualize_graph(resume_graph, output_dir, "resume_workflow_graph")
        print(f"Generated resume_workflow_graph visualization")
    except ImportError as e:
        print(f"Error importing resume_graph: {e}")

    try:
        from backendv1.workflows.career_workflow import graph as career_graph

        visualize_graph(career_graph, output_dir, "career_workflow_graph")
        print(f"Generated career_workflow_graph visualization")
    except ImportError as e:
        print(f"Error importing career_graph: {e}")

    try:
        from backendv1.chat.interactive_chat import graph as chat_graph

        visualize_graph(chat_graph, output_dir, "interactive_chat_graph")
        print(f"Generated interactive_chat_graph visualization")
    except ImportError as e:
        print(f"Error importing chat_graph: {e}")

    print(f"All available workflow visualizations generated in {output_dir}")


if __name__ == "__main__":
    # When run as a script, generate all workflow visualizations
    generate_all_workflow_visualizations()
