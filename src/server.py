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
        help="Enable verbose logging"
    )
    
    args = parser.parse_args()
    
    # Convert project root to absolute path
    project_root = Path(args.project_root).resolve()
    
    if args.verbose:
        print(f"🧠 Project Memory MCP Server")
        print(f"=============================")
        print(f"Project Root: {project_root}")
        print(f"Memory Directory: {args.memory_dir}")
        if args.config:
            print(f"Config File: {args.config}")
        print()
    
    try:
        # Initialize memory manager
        memory_manager = ProjectMemoryManager(
            project_root=str(project_root),
            memory_dir=args.memory_dir,
            config_file=args.config,
            verbose=args.verbose
        )
        
        # Initialize tools
        tools = MemoryTools(memory_manager)
        
        if args.verbose:
            print("✅ Project memory initialized successfully!")
            print()
            context = memory_manager.get_current_context()
            print(f"📊 Project: {context.get('project_name', 'Unknown')}")
            print(f"📈 Components tracked: {len(context.get('components', {}))}")
            print(f"🏗️ Architecture decisions: {len(context.get('decisions', []))}")
            print(f"🔧 Working solutions: {len(context.get('solutions', {}))}")
            print(f"💬 Conversation history: {len(context.get('conversations', []))}")
            print()
            print("Tools available:")
            for tool_def in tools.get_tool_definitions():
                print(f"  • {tool_def.name} - {tool_def.description}")
            print()
        
        # Run the server
        asyncio.run(mcp.server.stdio.stdio_server(server))
        
    except Exception as e:
        print(f"❌ Error starting server: {e}", file=sys.stderr)
        if args.verbose:
            import traceback
            traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
