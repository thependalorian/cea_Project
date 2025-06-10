#!/usr/bin/env python3
"""
Simple runner for the updated seed script
"""

import sys
import os
import subprocess
from pathlib import Path

def main():
    """Run the updated seed script with proper error handling."""
    
    # Get the script directory
    script_dir = Path(__file__).parent
    seed_script = script_dir / "create_seed_partners_updated.py"
    
    if not seed_script.exists():
        print(f"❌ Seed script not found: {seed_script}")
        return False
    
    print("🚀 Running updated Climate Economy seed script...")
    print(f"📁 Script location: {seed_script}")
    
    try:
        # Run the seed script
        result = subprocess.run([
            sys.executable, str(seed_script)
        ], capture_output=True, text=True, cwd=script_dir.parent)
        
        # Print output
        if result.stdout:
            print(result.stdout)
        
        if result.stderr:
            print("STDERR:", result.stderr)
        
        if result.returncode == 0:
            print("✅ Seed script completed successfully!")
            return True
        else:
            print(f"❌ Seed script failed with return code: {result.returncode}")
            return False
            
    except Exception as e:
        print(f"❌ Error running seed script: {e}")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 