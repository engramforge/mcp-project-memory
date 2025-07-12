# Project Memory MCP Server

[![npm version](https://badge.fury.io/js/project-memory-mcp.svg)](https://badge.fury.io/js/project-memory-mcp)

A persistent project memory MCP server that enables AI assistants to maintain context and build institutional knowledge across conversations.

## 🎯 What It Does

Transforms AI assistants from stateless tools into experienced colleagues that:
- **Remember** your project patterns and architectural decisions
- **Learn** from successful solutions and avoid past mistakes  
- **Track** implementation progress across components
- **Maintain** persistent context between conversations
- **Search** through accumulated project knowledge

## 🚀 Quick Start

### Run with npx (Recommended)

```bash
npx project-memory-mcp --project-root /path/to/your/project
```

### Install Globally

```bash
npm install -g project-memory-mcp
project-memory-mcp --project-root /path/to/your/project
```

## 📋 Claude Desktop Configuration

Add to your `~/Library/Application Support/Claude/claude_desktop_config.json`:

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

## 🔧 Available Tools

When configured with Claude Desktop, you'll have access to:

- **`get_project_context()`** - Get comprehensive current project status
- **`update_implementation_status()`** - Track progress on components  
- **`add_architecture_decision()`** - Record decisions with rationale
- **`add_working_solution()`** - Save solutions for future reference
- **`update_priorities()`** - Manage project priorities
- **`search_memory()`** - Find relevant past decisions and solutions
- **`log_conversation_context()`** - Record conversation outcomes

## 💬 Usage Examples

### Get Project Status
> "What's the current status of my project?"

The AI will automatically call `get_project_context()` and brief you on:
- Current priorities and blockers
- Recent architecture decisions  
- Component progress (frontend 75%, backend 90%)
- Available working solutions

### Update Progress  
> "We finished implementing the user authentication system"

The AI will call `update_implementation_status()` to record the completion.

### Record Decisions
> "We decided to use PostgreSQL for the database"

The AI will call `add_architecture_decision()` to preserve the choice and rationale.

## ⚙️ Command Line Options

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

## 📁 Memory Storage

The server creates a `.project_memory` directory in your project with:

- `project_memory.json` - Main memory store
- `current_context.json` - Latest project context  
- `backups/` - Automatic memory backups

## 🏗️ Project Type Detection

Automatically detects project types based on files present:
- **Node.js/JavaScript** - `package.json`
- **Python** - `requirements.txt`, `pyproject.toml`
- **Rust** - `Cargo.toml`
- **Go** - `go.mod`
- **Java** - `pom.xml`, `build.gradle`
- **Docker/Microservices** - `docker-compose.yml`

## 🔒 Privacy & Security

- All data stored locally in your project directory
- No external network calls except npm package installation
- Memory files are human-readable JSON
- Can be excluded from version control with `.gitignore`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🐛 Issues

Report issues at: https://github.com/your-username/project-memory-mcp/issues