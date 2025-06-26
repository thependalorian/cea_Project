#!/bin/bash

# Start Backend Script for Climate Economy Assistant
# This handles Python path correctly for module imports

export PYTHONPATH="$(pwd):$PYTHONPATH"
echo "Starting Climate Economy Assistant Backend..."
echo "Python path: $PYTHONPATH"

cd "$(dirname "$0")"

# Start the FastAPI server
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload 