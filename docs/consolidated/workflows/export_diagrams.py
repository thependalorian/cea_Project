#!/usr/bin/env python3
"""
Export Mermaid diagrams from workflow documentation to PNG files.
This script extracts mermaid diagrams from the WORKFLOW_DIAGRAMS.md file
and saves them as PNG images.
"""

import os
import re
import base64
import requests
from pathlib import Path

# Configuration
WORKFLOW_DIAGRAMS_FILE = "docs/consolidated/workflows/WORKFLOW_DIAGRAMS.md"
OUTPUT_DIR = "docs/consolidated/workflows/images"
BACKGROUND_COLOR = "white"

def extract_mermaid_diagrams(file_path):
    """Extract mermaid diagram code blocks from a markdown file."""
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Find all mermaid code blocks
    pattern = r"```mermaid\n(.*?)\n```"
    diagrams = re.findall(pattern, content, re.DOTALL)
    
    # Also extract the section titles above each diagram
    section_pattern = r"## (.*?)\n\n.*?```mermaid"
    sections = re.findall(section_pattern, content, re.DOTALL)
    
    return list(zip(sections, diagrams))

def export_diagram_to_png(mermaid_syntax, output_path):
    """Export a mermaid diagram to a PNG file using the mermaid.ink API."""
    # Encode the mermaid syntax
    mermaid_syntax_encoded = base64.b64encode(mermaid_syntax.encode("utf8")).decode("ascii")
    
    # Create the URL for the mermaid.ink API
    image_url = f"https://mermaid.ink/img/{mermaid_syntax_encoded}?type=png&bgColor={BACKGROUND_COLOR}"
    
    # Get the image
    response = requests.get(image_url, timeout=10)
    if response.status_code == 200:
        # Save the image
        with open(output_path, 'wb') as f:
            f.write(response.content)
        print(f"Saved diagram to {output_path}")
        return True
    else:
        print(f"Failed to export diagram. Status code: {response.status_code}")
        return False

def sanitize_filename(name):
    """Convert a section title to a valid filename."""
    # Replace spaces and special characters with underscores
    sanitized = re.sub(r'[^a-zA-Z0-9]', '_', name).lower()
    # Remove consecutive underscores
    sanitized = re.sub(r'_+', '_', sanitized)
    # Remove leading and trailing underscores
    sanitized = sanitized.strip('_')
    return sanitized

def main():
    """Main function to extract and export diagrams."""
    # Create the output directory if it doesn't exist
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # Extract diagrams from the workflow diagrams file
    diagrams = extract_mermaid_diagrams(WORKFLOW_DIAGRAMS_FILE)
    
    # Export each diagram to a PNG file
    for i, (section, diagram) in enumerate(diagrams):
        filename = sanitize_filename(section)
        output_path = os.path.join(OUTPUT_DIR, f"{filename}.png")
        export_diagram_to_png(diagram, output_path)

if __name__ == "__main__":
    main()
