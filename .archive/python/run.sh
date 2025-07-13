#!/bin/bash
# Project Memory MCP Server Runner

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Activate virtual environment
source venv/bin/activate

# Run the server with arguments passed to this script
python src/server.py "$@"
