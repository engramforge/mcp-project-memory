# Installation Guide

## Quick Start with npx

Run the server for any project without installation:

```bash
npx project-memory-mcp --project-root /path/to/your/project
```

## Global Installation

Install globally for repeated use:

```bash
npm install -g project-memory-mcp
project-memory-mcp --project-root /path/to/your/project
```

## Claude Desktop Configuration

Add the MCP server to your Claude Desktop configuration file at:
`~/Library/Application Support/Claude/claude_desktop_config.json`

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

Replace `/path/to/your/project` with the absolute path to your project directory.

## Command Line Options

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

## Development Installation

For development or contributing:

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

## Troubleshooting

### Server Not Connecting
1. Ensure Claude Desktop is completely restarted after configuration changes
2. Verify the project path is absolute and exists
3. Check that Node.js version 18+ is installed
4. Run with `--verbose` flag to see detailed logging

### Memory Not Persisting
1. Verify the memory directory is writable
2. Check for filesystem permission issues
3. Ensure the project directory exists and is accessible

### Tool Calls Failing
1. Restart Claude Desktop completely
2. Verify the MCP server configuration syntax
3. Test the server manually with command line before Claude integration

## Requirements

- Node.js 18.0.0 or higher
- Claude Desktop (latest version)
- Write access to the project directory
