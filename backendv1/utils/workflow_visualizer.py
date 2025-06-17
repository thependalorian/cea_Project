#!/usr/bin/env python3
"""
Comprehensive Workflow Visualizer

This script consolidates all workflow visualization functionality:
1. Official LangGraph visualization (Mermaid generation)
2. Mermaid to PNG conversion using multiple methods
3. Cleanup and organization of generated files

Dependencies:
- langgraph
- langchain-core
- pyppeteer (for PNG conversion)
- nest_asyncio
- requests (for mermaid.ink API fallback)
"""

import os
import sys
import re
import base64
import asyncio
import argparse
from pathlib import Path
from typing import Optional, List, Dict, Any

# Add project root to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

# Core dependencies
try:
    import nest_asyncio

    nest_asyncio.apply()
except ImportError:
    print("Warning: nest_asyncio not available. Some features may not work in Jupyter.")

try:
    import requests
except ImportError:
    print("Warning: requests not available. API fallback method disabled.")
    requests = None

try:
    from pyppeteer import launch

    PYPPETEER_AVAILABLE = True
except ImportError:
    print("Warning: pyppeteer not available. Browser-based PNG conversion disabled.")
    PYPPETEER_AVAILABLE = False

# LangGraph dependencies
try:
    from langchain_core.runnables.graph import CurveStyle, MermaidDrawMethod, NodeStyles

    LANGGRAPH_AVAILABLE = True
except ImportError:
    print("Warning: LangGraph dependencies not available. Official visualization disabled.")
    LANGGRAPH_AVAILABLE = False


class WorkflowVisualizer:
    """Comprehensive workflow visualization tool."""

    def __init__(self, output_dir: str = "docs/consolidated/workflows/official_diagrams"):
        self.output_dir = output_dir
        self.images_dir = os.path.join(output_dir, "images")
        self.ensure_directories()

    def ensure_directories(self):
        """Create necessary directories."""
        os.makedirs(self.output_dir, exist_ok=True)
        os.makedirs(self.images_dir, exist_ok=True)

    def generate_langgraph_visualizations(self) -> List[str]:
        """Generate Mermaid diagrams from LangGraph workflows."""
        if not LANGGRAPH_AVAILABLE:
            print("LangGraph not available. Skipping official visualization generation.")
            return []

        generated_files = []

        # Import workflow modules
        workflows = self._import_workflows()

        for workflow_name, graph in workflows.items():
            try:
                mermaid_code = graph.get_graph().draw_mermaid()
                mermaid_path = os.path.join(self.output_dir, f"{workflow_name}.mmd")

                with open(mermaid_path, "w") as f:
                    f.write(mermaid_code)

                print(f"Generated Mermaid diagram: {mermaid_path}")
                generated_files.append(mermaid_path)

            except Exception as e:
                print(f"Error generating visualization for {workflow_name}: {e}")

        return generated_files

    def _import_workflows(self) -> Dict[str, Any]:
        """Import all available workflow graphs."""
        workflows = {}

        # Try to import each workflow
        workflow_imports = [
            (
                "climate_supervisor_graph",
                "backendv1.workflows.climate_supervisor",
                "climate_supervisor_graph",
            ),
            ("empathy_workflow_graph", "backendv1.workflows.empathy_workflow", "empathy_graph"),
            ("interactive_chat_graph", "backendv1.chat.interactive_chat", "graph"),
        ]

        for name, module_path, attr_name in workflow_imports:
            try:
                module = __import__(module_path, fromlist=[attr_name])
                graph = getattr(module, attr_name)
                workflows[name] = graph
                print(f"Imported workflow: {name}")
            except ImportError as e:
                print(f"Could not import {name}: {e}")
            except AttributeError as e:
                print(f"Could not find {attr_name} in {module_path}: {e}")

        return workflows

    async def convert_mermaid_to_png_pyppeteer(self, mermaid_file: str, output_file: str) -> bool:
        """Convert Mermaid file to PNG using pyppeteer."""
        if not PYPPETEER_AVAILABLE:
            return False

        try:
            # Read mermaid file
            with open(mermaid_file, "r") as f:
                mermaid_code = f.read()

            # Create HTML template
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <title>Mermaid Diagram</title>
                <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
                <style>
                    body {{
                        background: white;
                        padding: 20px;
                        margin: 0;
                    }}
                    .mermaid {{
                        font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;
                    }}
                </style>
            </head>
            <body>
                <div class="mermaid">
{mermaid_code}
                </div>
                <script>
                    mermaid.initialize({{
                        startOnLoad: true,
                        theme: 'default',
                        securityLevel: 'loose',
                    }});
                </script>
            </body>
            </html>
            """

            # Create temporary HTML file
            temp_html = f"{output_file}.html"
            with open(temp_html, "w") as f:
                f.write(html_content)

            # Launch browser and convert
            browser = await launch(
                headless=True,
                args=["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
            )

            page = await browser.newPage()
            await page.setViewport({"width": 1200, "height": 800})

            # Navigate to HTML file
            await page.goto(f"file://{os.path.abspath(temp_html)}")

            # Wait for Mermaid to render
            await page.waitForSelector(".mermaid svg", {"timeout": 10000})
            await asyncio.sleep(2)  # Additional wait for complete rendering

            # Take screenshot of SVG element
            svg_element = await page.querySelector(".mermaid svg")
            if svg_element:
                await svg_element.screenshot({"path": output_file, "omitBackground": True})
                print(f"✓ Converted {mermaid_file} to {output_file}")
                success = True
            else:
                print(f"✗ SVG element not found in {mermaid_file}")
                success = False

            await browser.close()

            # Clean up temporary file
            if os.path.exists(temp_html):
                os.remove(temp_html)

            return success

        except Exception as e:
            print(f"✗ Error converting {mermaid_file} with pyppeteer: {e}")
            return False

    def convert_mermaid_to_png_api(self, mermaid_file: str, output_file: str) -> bool:
        """Convert Mermaid file to PNG using mermaid.ink API."""
        if not requests:
            return False

        try:
            # Read mermaid file
            with open(mermaid_file, "r") as f:
                mermaid_code = f.read()

            # Encode for API
            encoded = base64.b64encode(mermaid_code.encode("utf8")).decode("ascii")

            # Make API request
            url = f"https://mermaid.ink/img/{encoded}?type=png&bgColor=white"
            response = requests.get(url, timeout=30)

            if response.status_code == 200:
                with open(output_file, "wb") as f:
                    f.write(response.content)
                print(f"✓ Converted {mermaid_file} to {output_file} (API)")
                return True
            else:
                print(f"✗ API conversion failed for {mermaid_file}: {response.status_code}")
                return False

        except Exception as e:
            print(f"✗ Error converting {mermaid_file} with API: {e}")
            return False

    def convert_all_mermaid_files(self, use_pyppeteer: bool = True) -> List[str]:
        """Convert all Mermaid files to PNG images."""
        # Find all .mmd files
        mermaid_files = [
            os.path.join(self.output_dir, f)
            for f in os.listdir(self.output_dir)
            if f.endswith(".mmd") and os.path.isfile(os.path.join(self.output_dir, f))
        ]

        if not mermaid_files:
            print("No Mermaid files found to convert.")
            return []

        converted_files = []

        for mermaid_file in mermaid_files:
            base_name = os.path.basename(mermaid_file)
            file_name = os.path.splitext(base_name)[0]
            output_file = os.path.join(self.images_dir, f"{file_name}.png")

            success = False

            # Try pyppeteer first if available and requested
            if use_pyppeteer and PYPPETEER_AVAILABLE:
                try:
                    success = asyncio.get_event_loop().run_until_complete(
                        self.convert_mermaid_to_png_pyppeteer(mermaid_file, output_file)
                    )
                except Exception as e:
                    print(f"Pyppeteer conversion failed: {e}")

            # Fallback to API method
            if not success:
                success = self.convert_mermaid_to_png_api(mermaid_file, output_file)

            if success:
                converted_files.append(output_file)
            else:
                print(f"Failed to convert {mermaid_file}")

        return converted_files

    def extract_diagrams_from_markdown(self, markdown_file: str) -> List[str]:
        """Extract Mermaid diagrams from markdown files."""
        if not os.path.exists(markdown_file):
            print(f"Markdown file not found: {markdown_file}")
            return []

        with open(markdown_file, "r") as f:
            content = f.read()

        # Find mermaid code blocks
        pattern = r"```mermaid\n(.*?)\n```"
        diagrams = re.findall(pattern, content, re.DOTALL)

        # Find section titles
        section_pattern = r"## (.*?)\n\n.*?```mermaid"
        sections = re.findall(section_pattern, content, re.DOTALL)

        extracted_files = []

        for i, (section, diagram) in enumerate(zip(sections, diagrams)):
            # Sanitize filename
            filename = re.sub(r"[^a-zA-Z0-9]", "_", section).lower()
            filename = re.sub(r"_+", "_", filename).strip("_")

            mermaid_file = os.path.join(self.output_dir, f"{filename}.mmd")

            with open(mermaid_file, "w") as f:
                f.write(diagram)

            print(f"Extracted diagram: {mermaid_file}")
            extracted_files.append(mermaid_file)

        return extracted_files

    def cleanup_old_files(self):
        """Clean up old visualization files."""
        # Remove old files in output directory
        for file_pattern in ["*.png", "*.html"]:
            for file_path in Path(self.output_dir).glob(file_pattern):
                try:
                    file_path.unlink()
                    print(f"Cleaned up: {file_path}")
                except Exception as e:
                    print(f"Could not remove {file_path}: {e}")

    def generate_summary_report(self, generated_files: List[str], converted_files: List[str]):
        """Generate a summary report of the visualization process."""
        report_file = os.path.join(self.output_dir, "visualization_report.md")

        with open(report_file, "w") as f:
            f.write("# Workflow Visualization Report\n\n")
            f.write(f"Generated on: {Path(__file__).stat().st_mtime}\n\n")

            f.write("## Generated Mermaid Files\n\n")
            for file_path in generated_files:
                f.write(f"- {os.path.basename(file_path)}\n")

            f.write("\n## Converted PNG Files\n\n")
            for file_path in converted_files:
                f.write(f"- {os.path.basename(file_path)}\n")

            f.write(f"\n## Summary\n\n")
            f.write(f"- Total Mermaid files: {len(generated_files)}\n")
            f.write(f"- Total PNG files: {len(converted_files)}\n")
            f.write(
                f"- Success rate: {len(converted_files)/max(len(generated_files), 1)*100:.1f}%\n"
            )

        print(f"Summary report saved: {report_file}")


def main():
    """Main function with command-line interface."""
    parser = argparse.ArgumentParser(description="Comprehensive Workflow Visualizer")
    parser.add_argument(
        "--output-dir",
        type=str,
        default="docs/consolidated/workflows/official_diagrams",
        help="Output directory for visualizations",
    )
    parser.add_argument(
        "--no-pyppeteer", action="store_true", help="Skip pyppeteer conversion, use API only"
    )
    parser.add_argument("--extract-markdown", type=str, help="Extract diagrams from markdown file")
    parser.add_argument(
        "--cleanup", action="store_true", help="Clean up old files before generating new ones"
    )
    parser.add_argument(
        "--skip-generation",
        action="store_true",
        help="Skip LangGraph generation, only convert existing files",
    )

    args = parser.parse_args()

    # Initialize visualizer
    visualizer = WorkflowVisualizer(args.output_dir)

    # Cleanup if requested
    if args.cleanup:
        visualizer.cleanup_old_files()

    generated_files = []

    # Extract from markdown if specified
    if args.extract_markdown:
        extracted = visualizer.extract_diagrams_from_markdown(args.extract_markdown)
        generated_files.extend(extracted)

    # Generate LangGraph visualizations
    if not args.skip_generation:
        langgraph_files = visualizer.generate_langgraph_visualizations()
        generated_files.extend(langgraph_files)

    # Convert to PNG
    use_pyppeteer = not args.no_pyppeteer
    converted_files = visualizer.convert_all_mermaid_files(use_pyppeteer)

    # Generate summary report
    visualizer.generate_summary_report(generated_files, converted_files)

    print(f"\n✓ Visualization complete!")
    print(f"  - Generated {len(generated_files)} Mermaid files")
    print(f"  - Converted {len(converted_files)} PNG files")
    print(f"  - Output directory: {args.output_dir}")


if __name__ == "__main__":
    main()
