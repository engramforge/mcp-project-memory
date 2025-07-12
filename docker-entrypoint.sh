#!/bin/bash
# Docker entrypoint for Project Memory MCP Server

set -e

# Default values
PROJECT_ROOT="/workspace"
MEMORY_DIR=".project_memory"
VERBOSE=""

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --project-root)
            PROJECT_ROOT="$2"
            shift 2
            ;;
        --memory-dir)
            MEMORY_DIR="$2"
            shift 2
            ;;
        --verbose)
            VERBOSE="--verbose"
            shift
            ;;
        --config)
            CONFIG="--config $2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1" >&2
            exit 1
            ;;
    esac
done

# Ensure workspace directory exists and is accessible
if [[ ! -d "$PROJECT_ROOT" ]]; then
    echo "❌ Project root directory $PROJECT_ROOT does not exist" >&2
    echo "💡 Make sure to mount your project directory:" >&2
    echo "   docker run -v /path/to/your/project:/workspace project-memory-mcp" >&2
    exit 1
fi

# Log startup info to stderr
if [[ -n "$VERBOSE" ]]; then
    echo "🐳 Project Memory MCP Server (Docker)" >&2
    echo "====================================" >&2
    echo "Project Root: $PROJECT_ROOT" >&2
    echo "Memory Directory: $MEMORY_DIR" >&2
    echo "Working Directory: $(pwd)" >&2
    echo "User: $(whoami)" >&2
    echo "Python: $(python --version)" >&2
    echo "" >&2
fi

# Run the MCP server
exec python src/server.py \
    --project-root "$PROJECT_ROOT" \
    --memory-dir "$MEMORY_DIR" \
    $VERBOSE \
    $CONFIG
