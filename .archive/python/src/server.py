#!/usr/bin/env python3
"""
Project Memory MCP Server
========================

A persistent project memory system for AI assistants that tracks:
- Implementation progress and status
- Architecture decisions and rationale
- Working solutions and troubleshooting notes
- Project priorities and evolution
- Conversation context across sessions

This server enables AI to maintain context and build institutional knowledge
about development projects over time.
"""

import asyncio
import sys
from pathlib import Path

# Add the src directory to Python path for imports
sys.path.insert(0, str(Path(__file__).parent))

from memory_manager import ProjectMemoryManager
from tools import MemoryTools
import mcp.server.stdio
from mcp.server import Server
from mcp.server.models import InitializationOptions
import mcp.types as types

# Initialize the MCP server
server = Server("project-memory")

# Global memory manager (will be initialized in main)
memory_manager = None
tools = None

@server.list_tools()
async def handle_list_tools() -> list[types.Tool]:
    """List available tools for project memory management."""
    return tools.get_tool_definitions()

@server.call_tool()
async def handle_call_tool(
    name: str, arguments: dict
) -> list[types.TextContent]:
    """Handle tool calls for project memory management."""
    return await tools.handle_tool_call(name, arguments)

def main():
    """Run the Project Memory MCP server."""
    global memory_manager, tools
    
    # Parse command line arguments
    import argparse
    parser = argparse.ArgumentParser(
        description="Project Memory MCP Server",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python server.py --project-root /path/to/project
  python server.py --project-root /path/to/project --config config.json
        """
    )
    parser.add_argument(
        "--project-root",
        type=str,
        default=".",
        help="Root directory of the project (default: current directory)"
    )
    parser.add_argument(
        "--config",
        type=str,
        help="Configuration file path"
    )
    parser.add_argument(
        "--memory-dir",
        type=str,
        default=".project_memory",
        help="Directory for memory files (default: .project_memory)"
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Enable verbose logging to stderr"
    )
    
    args = parser.parse_args()
    
    # Convert project root to absolute path
    project_root = Path(args.project_root).resolve()
    
    # All verbose output goes to stderr, not stdout
    if args.verbose:
        print(f"🧠 Project Memory MCP Server", file=sys.stderr)
        print(f"=============================", file=sys.stderr)
        print(f"Project Root: {project_root}", file=sys.stderr)
        print(f"Memory Directory: {args.memory_dir}", file=sys.stderr)
        if args.config:
            print(f"Config File: {args.config}", file=sys.stderr)
        print(file=sys.stderr)
    
    try:
        # Initialize memory manager (pass verbose to control stderr output)
        memory_manager = ProjectMemoryManager(
            project_root=str(project_root),
            memory_dir=args.memory_dir,
            config_file=args.config,
            verbose=args.verbose
        )
        
        # Initialize tools
        tools = MemoryTools(memory_manager)
        
        if args.verbose:
            print("✅ Project memory initialized successfully!", file=sys.stderr)
            print(file=sys.stderr)
            context = memory_manager.get_current_context()
            print(f"📊 Project: {context.get('project_name', 'Unknown')}", file=sys.stderr)
            print(f"📈 Components tracked: {len(context.get('components', {}))}", file=sys.stderr)
            print(f"🏗️ Architecture decisions: {len(context.get('recent_decisions', []))}", file=sys.stderr)
            print(f"🔧 Working solutions: {len(context.get('solutions', {}))}", file=sys.stderr)
            print(f"💬 Conversation history: {len(context.get('recent_conversations', []))}", file=sys.stderr)
            print(file=sys.stderr)
            print("Tools available:", file=sys.stderr)
            for tool_def in tools.get_tool_definitions():
                print(f"  • {tool_def.name} - {tool_def.description}", file=sys.stderr)
            print(file=sys.stderr)
        
        # Run the server with the correct MCP pattern
        if args.verbose:
            print("🚀 Starting MCP server...", file=sys.stderr)
        
        async def run():
            async with mcp.server.stdio.stdio_server() as (read_stream, write_stream):
                await server.run(
                    read_stream,
                    write_stream,
                    InitializationOptions(
                        server_name="project-memory",
                        server_version="1.0.0",
                        capabilities={}
                    )
                )
        
        asyncio.run(run())
        
    except Exception as e:
        print(f"❌ Error starting server: {e}", file=sys.stderr)
        if args.verbose:
            import traceback
            traceback.print_exc(file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
