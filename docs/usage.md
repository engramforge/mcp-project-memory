# Usage Guide

## Available Tools

When connected to Claude Desktop, the following tools become available:

### get_project_context()
Retrieves comprehensive current project status including:
- Project overview and type
- Current priorities and blockers
- Recent architectural decisions
- Component implementation status
- Working solutions database

### update_implementation_status(component, status, details, progress)
Updates the implementation status for project components:
- `component`: Name of the component (e.g., "frontend", "api", "database")
- `status`: One of "not_started", "in_progress", "complete", "blocked", "deprecated"
- `details`: Optional additional information
- `progress`: Optional percentage (0-100)

### add_architecture_decision(decision, rationale, impact, alternatives)
Records architectural decisions with context:
- `decision`: The decision that was made
- `rationale`: Reasoning behind the decision
- `impact`: Expected consequences (optional)
- `alternatives`: Other options considered (optional)

### add_working_solution(problem, solution, command, tags)
Saves working solutions for future reference:
- `problem`: Description of the problem solved
- `solution`: The working solution or approach
- `command`: Specific commands or code snippets (optional)
- `tags`: Categorization tags (optional)

### update_priorities(priorities)
Updates current project priorities:
- `priorities`: Array of priority items in order of importance

### search_memory(query, limit)
Searches through accumulated project knowledge:
- `query`: Search terms to find relevant information
- `limit`: Maximum number of results (default: 10)

### log_conversation_context(summary, decisions_made, solutions_found)
Records conversation outcomes:
- `summary`: What was discussed or accomplished
- `decisions_made`: List of decisions made (optional)
- `solutions_found`: List of solutions discovered (optional)

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

## Usage Examples

### Getting Project Status
Start a conversation with Claude Desktop and ask:
"What's the current status of my project?"

Claude will automatically call `get_project_context()` and provide a comprehensive briefing.

### Recording Progress
When you complete work, tell Claude:
"We finished implementing the user authentication system"

Claude will call `update_implementation_status()` to record the completion.

### Making Decisions
When making architectural choices:
"We decided to use PostgreSQL instead of MongoDB for better ACID compliance"

Claude will call `add_architecture_decision()` to preserve the choice and rationale.

### Finding Solutions
To search for past solutions:
"Search for Docker networking issues we've solved before"

Claude will call `search_memory()` to find relevant solutions.

### Logging Sessions
At the end of productive sessions:
"Log this session: Implemented user authentication, fixed deployment pipeline, updated to use Redis for caching"

Claude will call `log_conversation_context()` to preserve the session outcomes.

## Privacy and Security

- All data is stored locally in your project directory
- No external network connections except for npm package downloads
- Memory files are human-readable JSON format
- Add `.project_memory/` to `.gitignore` to exclude from version control
