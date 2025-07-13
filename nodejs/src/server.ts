import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
  CallToolResult,
  TextContent,
  ErrorCode,
  McpError
} from '@modelcontextprotocol/sdk/types.js';
import { MemoryManager } from './memory-manager.js';
import { ServerOptions } from './types.js';

export class ProjectMemoryServer {
  private server: Server;
  private memoryManager: MemoryManager;
  private verbose: boolean;

  constructor(options: ServerOptions) {
    this.verbose = options.verbose;
    this.memoryManager = new MemoryManager(options);
    
    this.server = new Server(
      {
        name: 'project-memory',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  private setupToolHandlers(): void {
    // List tools handler
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: this.getToolDefinitions(),
      };
    });

    // Call tool handler
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        return await this.handleToolCall(request.params.name, request.params.arguments);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new McpError(ErrorCode.InternalError, `Tool execution failed: ${errorMessage}`);
      }
    });
  }
  private getToolDefinitions(): Tool[] {
    return [
      {
        name: 'get_project_context',
        description: 'Get comprehensive current project context and status',
        inputSchema: {
          type: 'object',
          properties: {},
          required: []
        }
      },
      {
        name: 'update_implementation_status',
        description: 'Update implementation status for a project component',
        inputSchema: {
          type: 'object',
          properties: {
            component: {
              type: 'string',
              description: 'Name of the component (e.g., "frontend", "api", "database")'
            },
            status: {
              type: 'string',
              enum: ['not_started', 'in_progress', 'complete', 'blocked', 'deprecated'],
              description: 'Current status of the component'
            },
            details: {
              type: 'string',
              description: 'Additional details about the status or progress'
            },
            progress: {
              type: 'integer',
              minimum: 0,
              maximum: 100,
              description: 'Progress percentage (0-100)'
            }
          },
          required: ['component', 'status']
        }
      },
      {
        name: 'add_architecture_decision',
        description: 'Record an architecture decision with rationale and impact',
        inputSchema: {
          type: 'object',
          properties: {
            decision: {
              type: 'string',
              description: 'The architecture decision that was made'
            },
            rationale: {
              type: 'string',
              description: 'The reasoning behind this decision'
            },
            impact: {
              type: 'string',
              description: 'Expected impact or consequences of this decision'
            },
            alternatives: {
              type: 'array',
              items: { type: 'string' },
              description: 'Alternative approaches that were considered'
            }
          },
          required: ['decision', 'rationale']
        }
      }      ,
      {
        name: 'add_working_solution',
        description: 'Record a working solution for a problem that can be referenced later',
        inputSchema: {
          type: 'object',
          properties: {
            problem: {
              type: 'string',
              description: 'Description of the problem that was solved'
            },
            solution: {
              type: 'string',
              description: 'The working solution or approach'
            },
            command: {
              type: 'string',
              description: 'Command, code snippet, or exact steps to implement the solution'
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              description: 'Tags for categorizing this solution'
            }
          },
          required: ['problem', 'solution']
        }
      },
      {
        name: 'update_priorities',
        description: 'Update the current project priorities in order of importance',
        inputSchema: {
          type: 'object',
          properties: {
            priorities: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of current priorities in order of importance'
            }
          },
          required: ['priorities']
        }
      },
      {
        name: 'search_memory',
        description: 'Search through project memory for relevant information',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query to find relevant decisions, solutions, or conversations'
            },
            limit: {
              type: 'integer',
              default: 10,
              minimum: 1,
              maximum: 50,
              description: 'Maximum number of results to return'
            }
          },
          required: ['query']
        }
      },
      {
        name: 'log_conversation_context',
        description: 'Log the context and outcomes from the current conversation',
        inputSchema: {
          type: 'object',
          properties: {
            summary: {
              type: 'string',
              description: 'Summary of what was discussed or accomplished in this conversation'
            },
            decisions_made: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of decisions made during this conversation'
            },
            solutions_found: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of solutions discovered or implemented'
            }
          },
          required: ['summary']
        }
      },
      {
        name: 'clear_memory',
        description: 'Clear or reset project memory (with optional backup)',
        inputSchema: {
          type: 'object',
          properties: {
            scope: {
              type: 'string',
              enum: ['all', 'decisions', 'solutions', 'conversations', 'components'],
              default: 'all',
              description: 'What to clear: all memory, or specific sections'
            },
            create_backup: {
              type: 'boolean',
              default: true,
              description: 'Whether to create a backup before clearing'
            },
            confirm: {
              type: 'boolean',
              default: false,
              description: 'Confirmation flag - must be true to actually clear memory'
            }
          },
          required: ['confirm']
        }
      }
    ];
  }
  private async handleToolCall(name: string, args: any): Promise<CallToolResult> {
    if (this.verbose) {
      console.error(`🔧 Tool called: ${name}`);
    }

    try {
      switch (name) {
        case 'get_project_context':
          return await this.handleGetProjectContext();
        
        case 'update_implementation_status':
          return await this.handleUpdateImplementationStatus(args);
        
        case 'add_architecture_decision':
          return await this.handleAddArchitectureDecision(args);
        
        case 'add_working_solution':
          return await this.handleAddWorkingSolution(args);
        
        case 'update_priorities':
          return await this.handleUpdatePriorities(args);
        
        case 'search_memory':
          return await this.handleSearchMemory(args);
        
        case 'log_conversation_context':
          return await this.handleLogConversationContext(args);
        
        case 'clear_memory':
          return await this.handleClearMemory(args);
        
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: 'text',
            text: `Error executing ${name}: ${errorMessage}`
          } as TextContent
        ]
      };
    }
  }

  private async handleGetProjectContext(): Promise<CallToolResult> {
    const context = this.memoryManager.getCurrentContext();
    
    const formattedContext = {
      project_overview: {
        name: context.project_name,
        type: context.project_type,
        description: context.project_description,
        progress: context.overall_progress
      },
      current_priorities: context.priorities,
      recent_activity: {
        decisions: context.recent_decisions,
        conversations: context.recent_conversations
      },
      implementation_status: {
        components: context.components,
        overall_progress: context.overall_progress
      },
      architecture: {
        technologies: context.technologies,
        recent_decisions: context.recent_decisions
      },
      working_solutions: context.solutions,
      last_updated: context.last_updated
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(formattedContext, null, 2)
        } as TextContent
      ]
    };
  }
  private async handleUpdateImplementationStatus(args: any): Promise<CallToolResult> {
    const { component, status, details, progress } = args;
    
    await this.memoryManager.updateImplementationStatus(
      component,
      status,
      details,
      progress
    );

    return {
      content: [
        {
          type: 'text',
          text: `Successfully updated ${component} status to ${status}${progress !== undefined ? ` (${progress}%)` : ''}`
        } as TextContent
      ]
    };
  }

  private async handleAddArchitectureDecision(args: any): Promise<CallToolResult> {
    const { decision, rationale, impact, alternatives } = args;
    
    await this.memoryManager.addArchitectureDecision(
      decision,
      rationale,
      impact,
      alternatives
    );

    return {
      content: [
        {
          type: 'text',
          text: `Successfully recorded architecture decision: ${decision}`
        } as TextContent
      ]
    };
  }

  private async handleAddWorkingSolution(args: any): Promise<CallToolResult> {
    const { problem, solution, command, tags } = args;
    
    await this.memoryManager.addWorkingSolution(
      problem,
      solution,
      command,
      tags
    );

    return {
      content: [
        {
          type: 'text',
          text: `Successfully recorded working solution for: ${problem}`
        } as TextContent
      ]
    };
  }

  private async handleUpdatePriorities(args: any): Promise<CallToolResult> {
    const { priorities } = args;
    
    await this.memoryManager.updatePriorities(priorities);

    return {
      content: [
        {
          type: 'text',
          text: `Successfully updated priorities (${priorities.length} items)`
        } as TextContent
      ]
    };
  }
  private async handleSearchMemory(args: any): Promise<CallToolResult> {
    const { query, limit = 10 } = args;
    
    const results = this.memoryManager.searchMemory(query, limit);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            query,
            results_count: results.length,
            results: results.map(r => ({
              type: r.type,
              relevance: r.relevance,
              content: r.data
            }))
          }, null, 2)
        } as TextContent
      ]
    };
  }

  private async handleLogConversationContext(args: any): Promise<CallToolResult> {
    const { summary, decisions_made, solutions_found } = args;
    
    await this.memoryManager.logConversationContext(
      summary,
      decisions_made,
      solutions_found
    );

    return {
      content: [
        {
          type: 'text',
          text: `Successfully logged conversation context: ${summary}`
        } as TextContent
      ]
    };
  }

  private async handleClearMemory(args: any): Promise<CallToolResult> {
    const { scope = 'all', create_backup = true, confirm = false } = args;
    
    if (!confirm) {
      return {
        content: [
          {
            type: 'text',
            text: `⚠️ Memory clear operation requires confirmation. Call again with confirm: true to proceed.\n\nThis will clear: ${scope}\nBackup will be created: ${create_backup}`
          } as TextContent
        ]
      };
    }
    
    const result = await this.memoryManager.clearMemory(scope, create_backup);

    return {
      content: [
        {
          type: 'text',
          text: result
        } as TextContent
      ]
    };
  }

  async start(): Promise<void> {
    // Initialize memory manager
    await this.memoryManager.initialize();

    if (this.verbose) {
      console.error('🚀 Starting MCP server...');
      console.error('Tools available:');
      const tools = this.getToolDefinitions();
      for (const tool of tools) {
        console.error(`  • ${tool.name} - ${tool.description}`);
      }
      console.error('');
    }

    // Create transport and run server
    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    if (this.verbose) {
      console.error('✅ MCP server started successfully!');
    }
  }
}