#!/usr/bin/env python3
"""
Simple Mermaid Diagram Converter

This script converts a single Mermaid diagram file to a PNG image using pyppeteer.
"""

import os
import asyncio
import nest_asyncio

# Apply nest_asyncio to allow running asyncio in Jupyter/IPython environments
nest_asyncio.apply()

# Try to import pyppeteer
try:
    from pyppeteer import launch
except ImportError:
    print("pyppeteer not installed. Please install it with: pip install pyppeteer")
    exit(1)

# HTML template for rendering Mermaid diagrams
MERMAID_HTML_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <title>Mermaid Diagram</title>
    <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
    <style>
        body {{
            background: white;
            padding: 20px;
        }}
        .mermaid {{
            font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;
        }}
    </style>
</head>
<body>
    <div class="mermaid">
{0}
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


async def convert_mermaid_to_png(mermaid_code, output_file, width=1200, height=800):
    """
    Convert a Mermaid diagram code to a PNG image using pyppeteer.

    Args:
        mermaid_code (str): Mermaid diagram code
        output_file (str): Path to save the PNG image
        width (int): Width of the browser viewport
        height (int): Height of the browser viewport
    """
    # Create HTML content
    html_content = MERMAID_HTML_TEMPLATE.format(mermaid_code)

    # Create a temporary HTML file
    temp_html_path = f"{output_file}.html"
    with open(temp_html_path, "w") as f:
        f.write(html_content)

    try:
        # Launch browser
        browser = await launch(headless=True, args=["--no-sandbox", "--disable-setuid-sandbox"])

        page = await browser.newPage()
        await page.setViewport({"width": width, "height": height})

        # Navigate to the HTML file
        await page.goto(f"file://{os.path.abspath(temp_html_path)}")

        # Wait for Mermaid to render
        await page.waitForSelector(".mermaid svg")

        # Wait a bit more to ensure complete rendering
        await asyncio.sleep(2)

        # Get the SVG element
        svg_element = await page.querySelector(".mermaid svg")

        if svg_element:
            # Take a screenshot of the SVG element
            await svg_element.screenshot({"path": output_file, "omitBackground": True})
            print(f"Saved diagram to {output_file}")
        else:
            print(f"Error: Could not find SVG element")

        await browser.close()

    except Exception as e:
        print(f"Error converting diagram: {str(e)}")

    finally:
        # Clean up temporary HTML file
        if os.path.exists(temp_html_path):
            os.remove(temp_html_path)


async def main_async():
    # Path to the mermaid file
    mermaid_file = "docs/consolidated/workflows/official_diagrams/empathy_workflow_graph.mmd"
    output_file = "docs/consolidated/workflows/official_diagrams/images/empathy_workflow_graph.png"

    # Create output directory if it doesn't exist
    os.makedirs(os.path.dirname(output_file), exist_ok=True)

    # Read the mermaid file
    with open(mermaid_file, "r") as f:
        mermaid_code = f.read()

    print(f"Converting {mermaid_file} to {output_file}...")
    await convert_mermaid_to_png(mermaid_code, output_file)
    print("Conversion complete!")


def main():
    # Run the async main function
    asyncio.get_event_loop().run_until_complete(main_async())


if __name__ == "__main__":
    main()
