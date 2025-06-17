#!/usr/bin/env python3
"""
Convert Mermaid diagrams to PNG images using Pyppeteer.
"""

import os
import asyncio
import nest_asyncio
from pathlib import Path
import pyppeteer
from pyppeteer import launch

# Apply nest_asyncio to allow running asyncio in Jupyter/IPython environments
nest_asyncio.apply()

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


async def convert_mermaid_to_png(mermaid_code, output_path, width=1200, height=800):
    """
    Convert a Mermaid diagram to a PNG image using Pyppeteer.

    Args:
        mermaid_code (str): The Mermaid diagram code
        output_path (str): Path to save the PNG image
        width (int): Width of the browser viewport
        height (int): Height of the browser viewport

    Returns:
        str: Path to the saved PNG image
    """
    html_content = MERMAID_HTML_TEMPLATE.format(mermaid_code=mermaid_code)

    # Create a temporary HTML file
    temp_html_path = f"{output_path}.html"
    with open(temp_html_path, "w") as f:
        f.write(html_content)

    # Launch browser
    browser = await launch(headless=True, args=["--no-sandbox", "--disable-setuid-sandbox"])

    try:
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

        # Take a screenshot of the SVG element
        await svg_element.screenshot({"path": output_path, "omitBackground": True})

        print(f"Saved diagram to {output_path}")
        return output_path

    finally:
        await browser.close()

        # Clean up temporary HTML file
        if os.path.exists(temp_html_path):
            os.remove(temp_html_path)


def convert_mermaid_file_to_png(mermaid_file_path, output_dir=None):
    """
    Convert a Mermaid file to a PNG image.

    Args:
        mermaid_file_path (str): Path to the Mermaid file
        output_dir (str, optional): Directory to save the PNG image. If None,
                                   uses the same directory as the Mermaid file.

    Returns:
        str: Path to the saved PNG image
    """
    # Read the Mermaid file
    with open(mermaid_file_path, "r") as f:
        mermaid_code = f.read()

    # Determine output path
    if output_dir is None:
        output_dir = os.path.dirname(mermaid_file_path)

    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)

    # Determine output filename
    base_name = os.path.basename(mermaid_file_path)
    file_name = os.path.splitext(base_name)[0]
    output_path = os.path.join(output_dir, f"{file_name}.png")

    # Convert to PNG
    asyncio.get_event_loop().run_until_complete(convert_mermaid_to_png(mermaid_code, output_path))

    return output_path


def convert_all_mermaid_files(input_dir, output_dir=None):
    """
    Convert all Mermaid files in a directory to PNG images.

    Args:
        input_dir (str): Directory containing Mermaid files
        output_dir (str, optional): Directory to save the PNG images

    Returns:
        list: List of paths to the saved PNG images
    """
    # Get all Mermaid files in the directory
    mermaid_files = [
        os.path.join(input_dir, f)
        for f in os.listdir(input_dir)
        if f.endswith(".mmd") and os.path.isfile(os.path.join(input_dir, f))
    ]

    # Convert each file
    output_paths = []
    for mermaid_file in mermaid_files:
        output_path = convert_mermaid_file_to_png(mermaid_file, output_dir)
        output_paths.append(output_path)

    return output_paths


if __name__ == "__main__":
    # Convert all Mermaid files in the official_diagrams directory
    input_dir = "docs/consolidated/workflows/official_diagrams"
    output_dir = "docs/consolidated/workflows/official_diagrams/images"

    print(f"Converting Mermaid diagrams from {input_dir} to PNG images in {output_dir}...")
    convert_all_mermaid_files(input_dir, output_dir)
    print("Conversion complete!")
