<<<<<<< HEAD
# mcp-project-memory
Project memory MCP server for Claude desktop
=======
# 🧠 Project Memory MCP Server

**Give AI assistants persistent memory about your development projects**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.8+](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-green.svg)](https://modelcontextprotocol.io/)

## Overview

Project Memory MCP Server transforms AI assistants from stateless tools into knowledgeable team members with persistent memory about your development projects. Instead of re-explaining context in every conversation, your AI assistant remembers:

- 📋 **Implementation Progress** - Track completion status across all project components
- 🏗️ **Architecture Decisions** - Record technical choices with rationale and impact
- 🔧 **Working Solutions** - Build a searchable library of proven fixes
- 🎯 **Current Priorities** - Maintain dynamic priority lists that evolve with your project  
- 💬 **Conversation History** - Preserve context across development sessions
- 🔍 **Searchable Knowledge** - Find relevant information from past discussions

## Why This Matters

**Before Project Memory**:
- "Remember, we're using FastAPI for the backend..."
- "As I mentioned last week, the Docker setup requires..."
- "We decided to use React because..."

**After Project Memory**:
- AI: "Based on your FastAPI backend architecture and the Docker issues we resolved last week, here's how to proceed with the React integration..."

## Key Features

### 🎯 **Smart Context Loading**
Every conversation starts with complete project context - no more repetitive explanations.

### 📊 **Implementation Tracking**
Monitor progress across all components with detailed status updates and completion tracking.

### 🏗️ **Decision Archaeology**
Every technical decision is recorded with rationale, creating an institutional memory that survives team changes.

### 🔧 **Solution Library**
Build a searchable database of working solutions that grows with your project experience.

### 🔍 **Intelligent Search**
Find relevant past decisions, solutions, and context with natural language queries.

### 📝 **Conversation Continuity**
Each discussion builds on previous knowledge, creating increasingly valuable AI assistance.

## Quick Start

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/project-memory-mcp.git
   cd project-memory-mcp
   ```

2. **Run the setup script**:
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

3. **Configure Claude Desktop**:
   Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:
   ```json
   {
     "mcpServers": {
       "project-memory": {
         "command": "/path/to/project-memory-mcp/run.sh",
         "args": ["--project-root", "/path/to/your/project"]
       }
     }
   }
   ```

4. **Restart Claude Desktop and start using**:
   ```
   "Load project memory and provide current context"
   ```

### Usage Examples

**Starting a conversation**:
```
"Check project memory and show current status"
```

**Recording progress**:
```
"Update frontend status to complete - React app implemented with TypeScript"
```

**Recording decisions**:
```
"Add decision: Using PostgreSQL for user data because it provides ACID compliance and good JSON support"
```

**Finding solutions**:
```
"Search memory for Docker networking issues"
```

**Ending conversations**:
```
"Log this session: Implemented authentication, fixed deployment pipeline, updated to use Redis for caching"
```

## Technical Architecture

### Memory Structure
- **Project Info**: Metadata and basic project information
- **Implementation Status**: Component-level progress tracking
- **Architecture Decisions**: Technical choices with rationale
- **Working Solutions**: Proven fixes and implementations
- **Priority Management**: Dynamic priority tracking
- **Conversation History**: Context preservation across sessions

### Storage
- **JSON Files**: Human-readable project memory storage
- **Incremental Updates**: Efficient updates without data loss
- **Backup & Recovery**: Automatic backup of memory state
- **Search Indexing**: Fast retrieval of relevant information

### MCP Integration
- **Standard Protocol**: Compatible with any MCP-enabled AI assistant
- **Tool-Based Interface**: Clean, well-defined tool functions
- **Error Handling**: Robust error handling and recovery
- **Performance**: Optimized for fast context loading

## Available Tools

| Tool | Purpose | Example Usage |
|------|---------|---------------|
| `get_project_context` | Load complete project status | "Show current project context" |
| `update_implementation_status` | Track component progress | "Update API status to complete" |
| `add_architecture_decision` | Record technical decisions | "Add decision: Use Redis for caching" |
| `add_working_solution` | Store proven solutions | "Add solution: Docker memory issues" |
| `update_priorities` | Manage project priorities | "Update priorities: 1. Fix auth, 2. Deploy" |
| `search_memory` | Find relevant information | "Search for authentication solutions" |
| `log_conversation_context` | Preserve session context | "Log: Implemented user management" |
| `get_project_summary` | Generate AI context | "Provide complete project summary" |

## Project Structure

```
project-memory-mcp/
├── README.md                   # This file
├── LICENSE                     # MIT License
├── setup.sh                    # Installation script
├── run.sh                      # Server startup script
├── requirements.txt            # Python dependencies
├── src/
│   ├── server.py              # Main MCP server
│   ├── memory_manager.py      # Memory management logic
│   └── tools.py               # MCP tool implementations
├── docs/
│   ├── installation.md        # Detailed installation guide
│   ├── usage.md              # Comprehensive usage guide
│   └── api.md                # API documentation
├── examples/
│   ├── config_examples/       # Configuration examples
│   └── usage_examples/        # Usage examples
└── tests/
    ├── test_memory.py         # Memory management tests
    ├── test_tools.py          # Tool functionality tests
    └── test_integration.py    # Integration tests
```

## Configuration

### Basic Configuration
```json
{
  "project_root": "/path/to/your/project",
  "memory_file": ".project_memory/memory.json",
  "backup_enabled": true,
  "backup_interval": 3600,
  "max_conversation_history": 100
}
```

### Advanced Configuration
```json
{
  "project_root": "/path/to/your/project",
  "memory_file": ".project_memory/memory.json",
  "decisions_file": ".project_memory/decisions.json",
  "solutions_file": ".project_memory/solutions.json",
  "backup_enabled": true,
  "backup_interval": 3600,
  "backup_directory": ".project_memory/backups",
  "max_conversation_history": 100,
  "search_index_enabled": true,
  "compression_enabled": false,
  "encryption_enabled": false
}
```

## Use Cases

### 🚀 **Startup Development**
- Track MVP feature implementation
- Record early architecture decisions
- Build solution library for common issues
- Maintain priority lists as market feedback evolves

### 🏢 **Enterprise Projects**
- Preserve institutional knowledge across team changes
- Document compliance and security decisions
- Track multi-team coordination and dependencies
- Maintain project history for auditing

### 🔬 **Research Projects**
- Record experimental approaches and results
- Track literature review and methodology decisions
- Preserve research context across long timelines
- Document hypothesis evolution and testing

### 🎓 **Educational Projects**
- Track learning progress and concepts mastered
- Record problem-solving approaches and solutions
- Build knowledge base for future reference
- Document project evolution for portfolios

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup

1. **Clone and setup**:
   ```bash
   git clone https://github.com/yourusername/project-memory-mcp.git
   cd project-memory-mcp
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   pip install -r requirements-dev.txt
   ```

2. **Run tests**:
   ```bash
   python -m pytest tests/
   ```

3. **Code quality**:
   ```bash
   black src/
   flake8 src/
   mypy src/
   ```

## Roadmap

### v1.0 - Core Memory (Current)
- [x] Basic project memory functionality
- [x] MCP server implementation
- [x] Decision and solution tracking
- [x] Conversation context preservation

### v1.1 - Enhanced Search
- [ ] Full-text search capabilities
- [ ] Semantic similarity search
- [ ] Advanced query syntax
- [ ] Search result ranking

### v1.2 - Team Collaboration
- [ ] Multi-user support
- [ ] Shared project memories
- [ ] Role-based access control
- [ ] Collaborative decision making

### v2.0 - Intelligence Layer
- [ ] Pattern recognition in decisions
- [ ] Automated suggestion system
- [ ] Predictive priority management
- [ ] Integration insights

## Support

- 📖 **Documentation**: [docs/](docs/)
- 🐛 **Issues**: [GitHub Issues](https://github.com/yourusername/project-memory-mcp/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/yourusername/project-memory-mcp/discussions)
- 📧 **Email**: support@yourproject.com

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Model Context Protocol (MCP)](https://modelcontextprotocol.io/)
- Inspired by the need for persistent AI memory in development workflows
- Created to solve the problem of context loss in AI-assisted development

---

**Transform your AI assistant from a tool into a knowledgeable team member with Project Memory MCP Server.**
>>>>>>> 9ee9d59 (Initial commit: Project Memory MCP Server)
