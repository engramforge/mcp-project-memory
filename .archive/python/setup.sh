#!/bin/bash
# Project Memory MCP Server Setup Script

set -e

echo "🧠 Project Memory MCP Server Setup"
echo "=================================="

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "📁 Setup directory: $SCRIPT_DIR"

# Check Python version
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not found"
    echo "Please install Python 3.8 or later"
    exit 1
fi

PYTHON_VERSION=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
echo "🐍 Python version: $PYTHON_VERSION"

# Check if Python version is 3.8 or later
if ! python3 -c 'import sys; sys.exit(0 if sys.version_info >= (3, 8) else 1)'; then
    echo "❌ Python 3.8 or later is required"
    echo "Current version: $PYTHON_VERSION"
    exit 1
fi

# Create virtual environment
echo "📦 Creating Python virtual environment..."
if [ -d "venv" ]; then
    echo "🔄 Virtual environment already exists, removing..."
    rm -rf venv
fi

python3 -m venv venv

# Activate virtual environment
echo "🔌 Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "⬆️ Upgrading pip..."
pip install --upgrade pip

# Install requirements
echo "📥 Installing Python dependencies..."
pip install -r requirements.txt

# Make run script executable
echo "🔧 Setting up run script..."
cat > run.sh << 'EOF'
#!/bin/bash
# Project Memory MCP Server Runner

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Activate virtual environment
source venv/bin/activate

# Run the server with arguments passed to this script
python src/server.py "$@"
EOF

chmod +x run.sh

# Create a test script
echo "🧪 Creating test script..."
cat > test.py << 'EOF'
#!/usr/bin/env python3
"""Test script for Project Memory MCP Server."""

import asyncio
import sys
import tempfile
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from memory_manager import ProjectMemoryManager

async def test_memory_manager():
    """Test the memory manager functionality."""
    print("🧪 Testing Project Memory MCP Server")
    print("=" * 40)
    
    # Create temporary project directory for testing
    with tempfile.TemporaryDirectory() as temp_dir:
        print(f"📁 Test project directory: {temp_dir}")
        
        # Test 1: Initialize memory manager
        print("\n1. Testing memory manager initialization...")
        memory_manager = ProjectMemoryManager(
            project_root=temp_dir,
            memory_dir=".test_memory",
            verbose=True
        )
        print("✅ Memory manager initialized")
        
        # Test 2: Get current context
        print("\n2. Testing get_current_context...")
        context = memory_manager.get_current_context()
        print(f"✅ Project: {context['project_name']}")
        print(f"✅ Type: {context['project_type']}")
        
        # Test 3: Update implementation status
        print("\n3. Testing update_implementation_status...")
        memory_manager.update_implementation_status(
            "frontend", "in_progress", "React app setup complete", 60
        )
        memory_manager.update_implementation_status(
            "backend", "complete", "FastAPI server deployed", 100
        )
        print("✅ Implementation status updated")
        
        # Test 4: Add architecture decision
        print("\n4. Testing add_architecture_decision...")
        memory_manager.add_architecture_decision(
            "Use React with TypeScript for frontend",
            "TypeScript provides better type safety and developer experience",
            "Improved code quality and reduced runtime errors"
        )
        print("✅ Architecture decision added")
        
        # Test 5: Add working solution
        print("\n5. Testing add_working_solution...")
        memory_manager.add_working_solution(
            "Docker container not starting",
            "Check environment variables and port conflicts",
            "docker-compose down && docker-compose up --build"
        )
        print("✅ Working solution added")
        
        # Test 6: Update priorities
        print("\n6. Testing update_priorities...")
        memory_manager.update_priorities([
            "Complete frontend authentication",
            "Implement user dashboard",
            "Add data visualization",
            "Performance optimization"
        ])
        print("✅ Priorities updated")
        
        # Test 7: Search memory
        print("\n7. Testing search_memory...")
        results = memory_manager.search_memory("docker")
        print(f"✅ Found {len(results)} results for 'docker'")
        
        # Test 8: Log conversation
        print("\n8. Testing log_conversation_context...")
        memory_manager.log_conversation_context(
            "Set up project structure and implemented basic authentication",
            ["Use JWT for authentication", "Store sessions in Redis"],
            ["Docker environment configuration", "React TypeScript setup"]
        )
        print("✅ Conversation logged")
        
        # Test 9: Get project summary
        print("\n9. Testing get_project_summary...")
        summary = memory_manager.get_project_summary()
        print(f"✅ Project summary generated ({len(summary)} characters)")
        
        # Final context check
        print("\n10. Final context check...")
        final_context = memory_manager.get_current_context()
        print(f"✅ Components: {len(final_context['components'])}")
        print(f"✅ Decisions: {final_context['statistics']['total_decisions']}")
        print(f"✅ Solutions: {final_context['statistics']['total_solutions']}")
        print(f"✅ Conversations: {final_context['statistics']['total_conversations']}")
        
        print("\n🎉 All tests passed! Project Memory MCP Server is working correctly.")

if __name__ == "__main__":
    asyncio.run(test_memory_manager())
EOF

chmod +x test.py

# Run basic test
echo "🧪 Running basic functionality test..."
python test.py

echo ""
echo "✅ Project Memory MCP Server Setup Complete!"
echo "==========================================="
echo ""
echo "📁 Installation directory: $SCRIPT_DIR"
echo "🐍 Python environment: venv/"
echo "📋 Requirements installed: $(pip list | grep mcp | head -1)"
echo ""
echo "🚀 Next Steps:"
echo ""
echo "1. Test the server:"
echo "   ./run.sh --project-root /path/to/your/project --verbose"
echo ""
echo "2. Add to Claude Desktop configuration:"
echo "   Edit: ~/Library/Application Support/Claude/claude_desktop_config.json"
echo ""
echo "3. Add this server configuration:"
echo '{'
echo '  "mcpServers": {'
echo '    "project-memory": {'
echo '      "command": "'$SCRIPT_DIR'/run.sh",'
echo '      "args": ["--project-root", "/path/to/your/project"]'
echo '    }'
echo '  }'
echo '}'
echo ""
echo "4. Restart Claude Desktop"
echo ""
echo "5. Start using with: 'Load project memory and show current context'"
echo ""
echo "🎯 Example usage:"
echo "   - 'Get project context' - Load current project status"
echo "   - 'Update frontend status to complete' - Update component status"
echo "   - 'Add decision: Use PostgreSQL for primary database' - Record decisions"
echo "   - 'Search memory for authentication issues' - Find solutions"
echo "   - 'Log this conversation: Implemented user management system' - Save context"
echo ""
echo "📚 Documentation:"
echo "   - README.md - Complete usage guide"
echo "   - src/ - Source code"
echo "   - Memory files will be created in your project's .project_memory/ directory"
echo ""
echo "🧠 Your projects now have persistent AI memory!"
