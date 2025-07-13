# mcp-project-memory
Project memory MCP server for Claude desktop
# 🧠 Project Memory MCP Server

**Give AI assistants persistent memory about your development projects**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js 18+](https://img.shields.io/badge/node.js-18+-blue.svg)](https://nodejs.org/)
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

### Option 1: Quick Start with npx (Recommended)

Run the server for any project without installation:

```bash
npx project-memory-mcp --project-root /path/to/your/project
```

### Option 2: Global Installation

Install globally for repeated use:

```bash
npm install -g project-memory-mcp
project-memory-mcp --project-root /path/to/your/project
```

### Option 3: Development Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/project-memory-mcp.git
   cd project-memory-mcp/nodejs
   ```

2. **Install dependencies**:
   ```bash
   npm install
   npm run build
   ```

3. **Configure Claude Desktop**:
   Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:
   ```json
   {
     "mcpServers": {
       "project-memory": {
         "command": "npx",
         "args": [
           "project-memory-mcp",
           "--project-root", "/path/to/your/project",
           "--verbose"
         ]
       }
     }
   }
   ```

4. **Restart Claude Desktop and start using**:
   ```
   "Load project memory and provide current context"
   ```

### Command Line Options

```bash
project-memory-mcp [options]

Options:
  -r, --project-root <path>   Root directory of the project (default: current directory)
  -m, --memory-dir <path>     Directory for memory files (default: .project_memory)
  -v, --verbose               Enable verbose logging
  -c, --config <path>         Configuration file path
  -h, --help                  Display help information
  --version                   Show version number
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
- **Performance**: Optimized for fast context loading and TypeScript type safety

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

For detailed tool documentation and usage examples, see [docs/usage.md](docs/usage.md).

## Memory Storage

The server creates a `.project_memory` directory containing:

- `project_memory.json` - Main memory database
- `current_context.json` - Latest project context snapshot
- `architecture_decisions.json` - Decision history
- `working_solutions.json` - Solution database
- `conversations.json` - Conversation logs
- `backups/` - Automatic backup files

## Project Type Detection

The server automatically detects project types based on configuration files:

- **Node.js/JavaScript**: `package.json`
- **Python**: `requirements.txt`, `pyproject.toml`
- **Rust**: `Cargo.toml`
- **Go**: `go.mod`
- **Java**: `pom.xml`, `build.gradle`
- **Docker/Microservices**: `docker-compose.yml`

## Project Structure

```
project-memory-mcp/
├── README.md                   # This file
├── LICENSE                     # MIT License
├── initialize_engramforge.py   # Project initialization script
├── data/                       # Sample data and templates
├── nodejs/                     # Node.js/TypeScript implementation
│   ├── package.json           # Node.js dependencies
│   ├── tsconfig.json          # TypeScript configuration
│   ├── README.md              # Node.js specific documentation
│   ├── src/                   # TypeScript source code
│   │   ├── index.ts           # Main server entry point
│   │   ├── server.ts          # MCP server implementation
│   │   ├── memory-manager.ts  # Memory management logic
│   │   └── types.ts           # TypeScript type definitions
│   └── tests/                 # Test files (to be implemented)
│       ├── memory-manager.test.ts  # Memory management tests
│       ├── server.test.ts     # Server functionality tests
│       └── integration.test.ts # Integration tests
├── docs/                       # Documentation
│   ├── installation.md        # Detailed installation guide
│   └── usage.md              # Comprehensive usage guide
├── examples/
│   ├── claude_desktop_config.json  # Claude Desktop MCP configuration
│   └── project_config.json    # Project memory configuration example
```

## Configuration

The Project Memory MCP Server can be configured using a `project_config.json` file. See `examples/project_config.json` for a complete example.

### Example Configuration

```json
{
  "max_conversation_history": 1000,
  "backup_enabled": true,
  "backup_interval": 3600,
  "compression_enabled": false,
  "auto_detect_project_type": true,
  "search_index_enabled": true,
  "verbose_logging": false
}
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `max_conversation_history` | number | 100 | Maximum number of conversation entries to retain in memory |
| `backup_enabled` | boolean | true | Enable automatic backups of project memory |
| `backup_interval` | number | 3600 | Backup interval in seconds (3600 = 1 hour) |
| `compression_enabled` | boolean | false | Enable compression for memory files to save disk space |
| `auto_detect_project_type` | boolean | true | Automatically detect project type based on files and structure |
| `search_index_enabled` | boolean | true | Enable full-text search indexing for faster memory searches |
| `verbose_logging` | boolean | false | Enable detailed logging for debugging and development |

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
  "max_conversation_history": 1000,
  "search_index_enabled": true,
  "compression_enabled": false,
  "auto_detect_project_type": true,
  "verbose_logging": false
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
   cd project-memory-mcp/nodejs
   npm install
   ```

2. **Build the project**:
   ```bash
   npm run build
   ```

3. **Development mode**:
   ```bash
   npm run dev
   ```

4. **Run tests** (when implemented):
   ```bash
   npm test
   npm run test:watch
   npm run test:coverage
   ```

5. **Code quality** (when linting is configured):
   ```bash
   npm run lint
   npm run lint:fix
   npm run type-check
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
- � **Installation Guide**: [docs/installation.md](docs/installation.md)
- 📚 **Usage Guide**: [docs/usage.md](docs/usage.md)
- �🐛 **Issues**: [GitHub Issues](https://github.com/yourusername/project-memory-mcp/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/yourusername/project-memory-mcp/discussions)

## Privacy and Security

- All data is stored locally in your project directory
- No external network connections except for npm package downloads
- Memory files are human-readable JSON format
- Add `.project_memory/` to `.gitignore` to exclude from version control

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Model Context Protocol (MCP)](https://modelcontextprotocol.io/)
- Inspired by the need for persistent AI memory in development workflows
- Created to solve the problem of context loss in AI-assisted development

---

**Transform your AI assistant from a tool into a knowledgeable team member with Project Memory MCP Server.**
