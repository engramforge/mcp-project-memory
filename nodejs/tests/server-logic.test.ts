import { describe, test, expect, beforeEach } from '@jest/globals';
import { ProjectMemoryServer } from '../src/server.js';
import { ServerOptions } from '../src/types.js';

// Note: These tests focus on the server logic that doesn't require MCP SDK initialization

describe('ProjectMemoryServer - Logic Tests', () => {
  let options: ServerOptions;

  beforeEach(() => {
    options = {
      projectRoot: '/test/project',
      memoryDir: '.project_memory',
      verbose: false
    };
  });

  describe('Constructor and Configuration', () => {
    test('should be constructable with basic options', () => {
      expect(() => {
        new ProjectMemoryServer(options);
      }).not.toThrow();
    });

    test('should handle verbose mode', () => {
      const verboseOptions = { ...options, verbose: true };
      expect(() => {
        new ProjectMemoryServer(verboseOptions);
      }).not.toThrow();
    });

    test('should handle custom memory directory', () => {
      const customOptions = { ...options, memoryDir: 'custom_memory' };
      expect(() => {
        new ProjectMemoryServer(customOptions);
      }).not.toThrow();
    });

    test('should handle config file option', () => {
      const configOptions = { ...options, configFile: '/path/to/config.json' };
      expect(() => {
        new ProjectMemoryServer(configOptions);
      }).not.toThrow();
    });
  });

  describe('Tool Definition Validation', () => {
    test('should have valid tool definitions', () => {
      const server = new ProjectMemoryServer(options);
      const tools = server['getToolDefinitions']();
      
      expect(Array.isArray(tools)).toBe(true);
      expect(tools.length).toBeGreaterThan(0);
      
      tools.forEach(tool => {
        expect(tool).toHaveProperty('name');
        expect(tool).toHaveProperty('description');
        expect(tool).toHaveProperty('inputSchema');
        expect(typeof tool.name).toBe('string');
        expect(typeof tool.description).toBe('string');
        expect(typeof tool.inputSchema).toBe('object');
      });
    });

    test('should include all expected tools', () => {
      const server = new ProjectMemoryServer(options);
      const tools = server['getToolDefinitions']();
      const toolNames = tools.map(tool => tool.name);
      
      const expectedTools = [
        'get_project_context',
        'update_implementation_status',
        'add_architecture_decision',
        'add_working_solution',
        'update_priorities',
        'search_memory',
        'log_conversation_context',
        'clear_memory'
      ];

      expectedTools.forEach(expectedTool => {
        expect(toolNames).toContain(expectedTool);
      });
    });

    test('should have proper input schemas', () => {
      const server = new ProjectMemoryServer(options);
      const tools = server['getToolDefinitions']();
      
      tools.forEach(tool => {
        expect(tool.inputSchema).toHaveProperty('type');
        expect(tool.inputSchema.type).toBe('object');
        expect(tool.inputSchema).toHaveProperty('properties');
        
        if (tool.inputSchema.required) {
          expect(Array.isArray(tool.inputSchema.required)).toBe(true);
        }
      });
    });
  });

  describe('formatSearchResults method', () => {
    let server: ProjectMemoryServer;

    beforeEach(() => {
      server = new ProjectMemoryServer(options);
    });

    test('should handle empty results', () => {
      const formatted = server['formatSearchResults']([]);
      expect(typeof formatted).toBe('string');
      expect(formatted).toContain('No results found');
    });

    test('should format single result', () => {
      const results = [{
        type: 'decision',
        relevance: 0.8,
        data: 'Test decision content'
      }];
      
      const formatted = server['formatSearchResults'](results);
      expect(typeof formatted).toBe('string');
      expect(formatted).toContain('Result 1');
      expect(formatted).toContain('decision');
      expect(formatted).toContain('0.8');
      expect(formatted).toContain('Test decision content');
    });

    test('should format multiple results', () => {
      const results = [
        { type: 'decision', relevance: 0.9, data: 'Decision 1' },
        { type: 'solution', relevance: 0.7, data: 'Solution 1' },
        { type: 'conversation', relevance: 0.6, data: 'Conversation 1' }
      ];
      
      const formatted = server['formatSearchResults'](results);
      expect(formatted).toContain('Result 1');
      expect(formatted).toContain('Result 2');
      expect(formatted).toContain('Result 3');
      expect(formatted).toContain('decision');
      expect(formatted).toContain('solution');
      expect(formatted).toContain('conversation');
    });

    test('should handle object data', () => {
      const results = [{
        type: 'decision',
        relevance: 0.8,
        data: { 
          decision: 'Use TypeScript', 
          rationale: 'Better type safety',
          impact: 'Improved code quality'
        }
      }];
      
      const formatted = server['formatSearchResults'](results);
      expect(formatted).toContain('Use TypeScript');
      expect(formatted).toContain('Better type safety');
      expect(formatted).toContain('Improved code quality');
    });

    test('should handle string data', () => {
      const results = [{
        type: 'solution',
        relevance: 0.7,
        data: 'Simple string solution'
      }];
      
      const formatted = server['formatSearchResults'](results);
      expect(formatted).toContain('Simple string solution');
    });

    test('should handle non-string, non-object data', () => {
      const results = [{
        type: 'test',
        relevance: 0.5,
        data: 12345
      }];
      
      const formatted = server['formatSearchResults'](results);
      expect(formatted).toContain('12345');
    });

    test('should handle null or undefined data', () => {
      const results = [
        { type: 'test1', relevance: 0.5, data: null },
        { type: 'test2', relevance: 0.4, data: undefined }
      ];
      
      const formatted = server['formatSearchResults'](results);
      expect(typeof formatted).toBe('string');
      expect(formatted.length).toBeGreaterThan(0);
    });
  });

  describe('validateToolArguments method', () => {
    let server: ProjectMemoryServer;

    beforeEach(() => {
      server = new ProjectMemoryServer(options);
    });

    test('should validate get_project_context (no args required)', () => {
      expect(() => {
        server['validateToolArguments']('get_project_context', {});
      }).not.toThrow();
    });

    test('should validate update_implementation_status with required args', () => {
      const validArgs = {
        component: 'frontend',
        status: 'in_progress'
      };
      
      expect(() => {
        server['validateToolArguments']('update_implementation_status', validArgs);
      }).not.toThrow();
    });

    test('should reject update_implementation_status with missing required args', () => {
      expect(() => {
        server['validateToolArguments']('update_implementation_status', { component: 'test' });
      }).toThrow('Missing required argument: status');

      expect(() => {
        server['validateToolArguments']('update_implementation_status', { status: 'complete' });
      }).toThrow('Missing required argument: component');
    });

    test('should validate status enum values', () => {
      const validStatuses = ['not_started', 'in_progress', 'complete', 'blocked', 'deprecated'];
      
      validStatuses.forEach(status => {
        expect(() => {
          server['validateToolArguments']('update_implementation_status', {
            component: 'test',
            status: status
          });
        }).not.toThrow();
      });

      expect(() => {
        server['validateToolArguments']('update_implementation_status', {
          component: 'test',
          status: 'invalid_status'
        });
      }).toThrow('Invalid status: invalid_status');
    });

    test('should validate progress range', () => {
      // Valid progress values
      [0, 50, 100].forEach(progress => {
        expect(() => {
          server['validateToolArguments']('update_implementation_status', {
            component: 'test',
            status: 'in_progress',
            progress: progress
          });
        }).not.toThrow();
      });

      // Invalid progress values
      [-1, 101, 150].forEach(progress => {
        expect(() => {
          server['validateToolArguments']('update_implementation_status', {
            component: 'test',
            status: 'in_progress',
            progress: progress
          });
        }).toThrow('Progress must be between 0 and 100');
      });
    });

    test('should validate add_architecture_decision arguments', () => {
      const validArgs = {
        decision: 'Use React',
        rationale: 'Component-based architecture'
      };
      
      expect(() => {
        server['validateToolArguments']('add_architecture_decision', validArgs);
      }).not.toThrow();

      expect(() => {
        server['validateToolArguments']('add_architecture_decision', { decision: 'test' });
      }).toThrow('Missing required argument: rationale');

      expect(() => {
        server['validateToolArguments']('add_architecture_decision', { rationale: 'test' });
      }).toThrow('Missing required argument: decision');
    });

    test('should validate search_memory arguments', () => {
      const validArgs = { query: 'test search' };
      
      expect(() => {
        server['validateToolArguments']('search_memory', validArgs);
      }).not.toThrow();

      expect(() => {
        server['validateToolArguments']('search_memory', {});
      }).toThrow('Missing required argument: query');
    });

    test('should validate search_memory limit range', () => {
      // Valid limits
      [1, 10, 25, 50].forEach(limit => {
        expect(() => {
          server['validateToolArguments']('search_memory', {
            query: 'test',
            limit: limit
          });
        }).not.toThrow();
      });

      // Invalid limits
      [0, -1, 51, 100].forEach(limit => {
        expect(() => {
          server['validateToolArguments']('search_memory', {
            query: 'test',
            limit: limit
          });
        }).toThrow('Limit must be between 1 and 50');
      });
    });

    test('should validate update_priorities arguments', () => {
      const validArgs = { priorities: ['task1', 'task2'] };
      
      expect(() => {
        server['validateToolArguments']('update_priorities', validArgs);
      }).not.toThrow();

      expect(() => {
        server['validateToolArguments']('update_priorities', { priorities: 'not an array' });
      }).toThrow('Priorities must be an array');

      expect(() => {
        server['validateToolArguments']('update_priorities', {});
      }).toThrow('Missing required argument: priorities');
    });

    test('should validate add_working_solution arguments', () => {
      const validArgs = {
        problem: 'How to test async code',
        solution: 'Use async/await'
      };
      
      expect(() => {
        server['validateToolArguments']('add_working_solution', validArgs);
      }).not.toThrow();

      expect(() => {
        server['validateToolArguments']('add_working_solution', { problem: 'test' });
      }).toThrow('Missing required argument: solution');

      expect(() => {
        server['validateToolArguments']('add_working_solution', { solution: 'test' });
      }).toThrow('Missing required argument: problem');
    });

    test('should validate log_conversation_context arguments', () => {
      const validArgs = { summary: 'Discussed architecture' };
      
      expect(() => {
        server['validateToolArguments']('log_conversation_context', validArgs);
      }).not.toThrow();

      expect(() => {
        server['validateToolArguments']('log_conversation_context', {});
      }).toThrow('Missing required argument: summary');
    });

    test('should validate clear_memory arguments', () => {
      const validArgs = { confirm: true };
      
      expect(() => {
        server['validateToolArguments']('clear_memory', validArgs);
      }).not.toThrow();

      expect(() => {
        server['validateToolArguments']('clear_memory', {});
      }).toThrow('Missing required argument: confirm');
    });

    test('should reject unknown tool names', () => {
      expect(() => {
        server['validateToolArguments']('unknown_tool', {});
      }).toThrow('Unknown tool: unknown_tool');
    });
  });

  describe('Server instance properties', () => {
    test('should have memory manager instance', () => {
      const server = new ProjectMemoryServer(options);
      expect(server['memoryManager']).toBeDefined();
      expect(typeof server['memoryManager']).toBe('object');
    });

    test('should have server instance', () => {
      const server = new ProjectMemoryServer(options);
      expect(server['server']).toBeDefined();
      expect(typeof server['server']).toBe('object');
    });

    test('should store verbose flag', () => {
      const server = new ProjectMemoryServer(options);
      expect(server['verbose']).toBe(false);

      const verboseServer = new ProjectMemoryServer({ ...options, verbose: true });
      expect(verboseServer['verbose']).toBe(true);
    });

    test('should have start method', () => {
      const server = new ProjectMemoryServer(options);
      expect(typeof server.start).toBe('function');
    });
  });

  describe('Tool schema validation', () => {
    test('should have proper required fields for each tool', () => {
      const server = new ProjectMemoryServer(options);
      const tools = server['getToolDefinitions']();
      
      const toolRequirements = {
        'get_project_context': [],
        'update_implementation_status': ['component', 'status'],
        'add_architecture_decision': ['decision', 'rationale'],
        'add_working_solution': ['problem', 'solution'],
        'update_priorities': ['priorities'],
        'search_memory': ['query'],
        'log_conversation_context': ['summary'],
        'clear_memory': ['confirm']
      };

      tools.forEach(tool => {
        const expectedRequired = toolRequirements[tool.name];
        if (expectedRequired) {
          const actualRequired = (tool.inputSchema as any).required || [];
          expect(actualRequired).toEqual(expectedRequired);
        }
      });
    });

    test('should have proper property types in schemas', () => {
      const server = new ProjectMemoryServer(options);
      const tools = server['getToolDefinitions']();
      
      tools.forEach(tool => {
        const properties = (tool.inputSchema as any).properties || {};
        
        Object.values(properties).forEach((prop: any) => {
          expect(prop).toHaveProperty('type');
          expect(['string', 'integer', 'array', 'boolean']).toContain(prop.type);
          
          if (prop.type === 'array') {
            expect(prop).toHaveProperty('items');
          }
          
          if (prop.enum) {
            expect(Array.isArray(prop.enum)).toBe(true);
          }
        });
      });
    });
  });
});
