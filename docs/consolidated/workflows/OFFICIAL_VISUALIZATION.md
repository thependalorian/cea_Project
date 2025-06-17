# Official LangGraph Visualization

This document explains how to use the official LangGraph visualization capabilities to generate diagrams of the Climate Economy Assistant workflows.

## Overview

LangGraph provides built-in visualization capabilities that allow you to generate visual representations of your graph-based workflows. These visualizations can be generated in two formats:

1. **Mermaid** - A markdown-based diagramming language
2. **PNG** - Image files that can be embedded in documentation or shared

The Climate Economy Assistant project now includes utilities to generate these visualizations for all workflows.

## Visualization Utilities

We've added the following utilities to the project:

- `backendv1/utils/graph_visualizer.py` - Core visualization functions
- `backendv1/utils/visualize_workflows.py` - Script to generate all workflow visualizations

## How to Generate Visualizations

To generate visualizations for all workflows:

```bash
# From the project root
python backendv1/utils/visualize_workflows.py
```

This will generate both Mermaid (.mmd) and PNG (.png) files in the `docs/consolidated/workflows/official_diagrams` directory.

## Visualization Methods

LangGraph provides several methods for visualizing graphs:

### 1. Mermaid Diagrams

```python
# Get the mermaid code
mermaid_code = graph.get_graph().draw_mermaid()
```

### 2. PNG Images

```python
# Generate PNG using mermaid.ink API
png_data = graph.get_graph().draw_mermaid_png(
    curve_style=CurveStyle.LINEAR,
    node_colors=NodeStyles(first="#99ccff", last="#ffcc99", default="#f2f0ff"),
    wrap_label_n_words=9,
    output_file_path="my_graph.png",
    draw_method=MermaidDrawMethod.MERMAID_INK,
    background_color="white",
    padding=10,
)
```

### 3. Alternative Methods

LangGraph also supports other visualization methods:

- Using Pyppeteer (requires `pip install pyppeteer nest_asyncio`)
- Using Graphviz (requires `pip install pygraphviz`)

## Customizing Visualizations

The visualization utilities support several customization options:

- **Node Colors** - Customize colors for different node types
- **Curve Style** - Change the style of edges (LINEAR, BASIS, CARDINAL, etc.)
- **Background Color** - Set the background color of the diagram
- **Padding** - Adjust padding around the diagram

## Comparison with Manual Mermaid Diagrams

The official LangGraph visualization approach provides an accurate representation of the actual graph structure as implemented in code. This differs from our manual Mermaid diagrams in a few ways:

1. **Accuracy** - Official visualizations show the exact graph structure as implemented
2. **Detail Level** - Official visualizations include all nodes and edges, which may be more detailed
3. **Customizability** - Manual diagrams can be simplified to focus on conceptual understanding
4. **Dependencies** - Official visualizations require LangGraph dependencies

Both approaches have their uses:
- Use official visualizations for technical documentation and debugging
- Use manual diagrams for high-level conceptual understanding

## Integration with Documentation

The generated diagrams can be included in Markdown documentation using standard image links:

```markdown
![Climate Supervisor Graph](./official_diagrams/climate_supervisor_graph.png)
```
