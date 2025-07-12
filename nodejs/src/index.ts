#!/usr/bin/env node

import { Command } from 'commander';
import { ProjectMemoryServer } from './server.js';

const program = new Command();

program
  .name('project-memory-mcp')
  .description('Persistent project memory MCP server for AI assistants')
  .version('1.0.0')
  .option('-r, --project-root <path>', 'Root directory of the project', process.cwd())
  .option('-m, --memory-dir <path>', 'Directory for memory files', '.project_memory')
  .option('-v, --verbose', 'Enable verbose logging', false)
  .option('-c, --config <path>', 'Configuration file path')
  .parse();

const options = program.opts();

async function main() {
  try {
    if (options.verbose) {
      console.error('🧠 Project Memory MCP Server (Node.js)');
      console.error('=====================================');
      console.error(`Project Root: ${options.projectRoot}`);
      console.error(`Memory Directory: ${options.memoryDir}`);
      console.error('');
    }

    const server = new ProjectMemoryServer({
      projectRoot: options.projectRoot,
      memoryDir: options.memoryDir,
      verbose: options.verbose,
      configFile: options.config
    });

    await server.start();
  } catch (error) {
    console.error('❌ Error starting server:', error);
    process.exit(1);
  }
}

main().catch(console.error);