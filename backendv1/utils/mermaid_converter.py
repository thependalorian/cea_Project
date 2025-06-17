#!/usr/bin/env python3
"""
Mermaid Diagram Converter

This script converts Mermaid diagram files to PNG images using pyppeteer.
"""

import os
import asyncio
import nest_asyncio
from pathlib import Path
import argparse

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


async def convert_mermaid_to_png(mermaid_file, output_file, width=1200, height=800):
    """
    Convert a Mermaid diagram file to a PNG image using pyppeteer.

    Args:
        mermaid_file (str): Path to the Mermaid file
        output_file (str): Path to save the PNG image
        width (int): Width of the browser viewport
        height (int): Height of the browser viewport
    """
    # Read the Mermaid file
    with open(mermaid_file, "r") as f:
        mermaid_code = f.read()

    # Create HTML content
    html_content = MERMAID_HTML_TEMPLATE.format(mermaid_code=mermaid_code)

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
            print(f"Error: Could not find SVG element in {mermaid_file}")

        await browser.close()

    except Exception as e:
        print(f"Error converting {mermaid_file}: {str(e)}")

    finally:
        # Clean up temporary HTML file
        if os.path.exists(temp_html_path):
            os.remove(temp_html_path)


def convert_mermaid_files(input_dir, output_dir=None):
    """
    Convert all Mermaid files in a directory to PNG images.

    Args:
        input_dir (str): Directory containing Mermaid files
        output_dir (str, optional): Directory to save the PNG images
    """
    # Create output directory if it doesn't exist
    if output_dir is None:
        output_dir = os.path.join(input_dir, "images")

    os.makedirs(output_dir, exist_ok=True)

    # Get all Mermaid files in the directory
    mermaid_files = [
        os.path.join(input_dir, f)
        for f in os.listdir(input_dir)
        if f.endswith(".mmd") and os.path.isfile(os.path.join(input_dir, f))
    ]

    if not mermaid_files:
        print(f"No .mmd files found in {input_dir}")
        return

    # Convert each file
    for mermaid_file in mermaid_files:
        base_name = os.path.basename(mermaid_file)
        file_name = os.path.splitext(base_name)[0]
        output_file = os.path.join(output_dir, f"{file_name}.png")

        print(f"Converting {mermaid_file} to {output_file}...")

        # Run the conversion asynchronously
        asyncio.get_event_loop().run_until_complete(
            convert_mermaid_to_png(mermaid_file, output_file)
        )


def main():
    parser = argparse.ArgumentParser(description="Convert Mermaid diagrams to PNG images")
    parser.add_argument(
        "--input-dir",
        type=str,
        default="docs/consolidated/workflows/official_diagrams",
        help="Directory containing Mermaid files",
    )
    parser.add_argument(
        "--output-dir",
        type=str,
        default=None,
        help="Directory to save PNG images (defaults to input_dir/images)",
    )

    args = parser.parse_args()

    print(f"Converting Mermaid diagrams from {args.input_dir} to PNG images...")
    convert_mermaid_files(args.input_dir, args.output_dir)
    print("Conversion complete!")


if __name__ == "__main__":
    main()
