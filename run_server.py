#!/usr/bin/env python3
"""
Backend Server Runner
Starts the Climate Economy Assistant backend server
Location: run_server.py
"""

import os
import sys
import uvicorn
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent / "backendv1"
sys.path.insert(0, str(backend_dir))

def main():
    """Start the backend server"""
    try:
        # Import the main application from backendv1
        from backendv1.main import app
        
        print("🚀 Starting Climate Economy Assistant Backend Server...")
        print("📍 Backend directory:", backend_dir)
        print("🌐 Server will run on: http://0.0.0.0:8001")
        
        # Start the server
        uvicorn.run(
            "backendv1.main:app",
            host="0.0.0.0",
            port=8001,
            reload=True,
            reload_dirs=[str(backend_dir)],
            log_level="info"
        )
        
    except ImportError as e:
        print(f"❌ Error importing backend application: {e}")
        print("💡 Make sure the backendv1 directory exists and contains main.py")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 