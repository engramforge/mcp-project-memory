import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { ProjectMemoryServer } from '../src/server.js';
import { ServerOptions } from '../src/types.js';

// Mock MCP SDK
jest.mock('@modelcontextprotocol/sdk/server/index.js', () => ({
  Server: jest.fn().mockImplementation(() => ({
    setRequestHandler: jest.fn(),
    notification: jest.fn(),
    connect: jest.fn(),
  })),
}));

jest.mock('@modelcontextprotocol/sdk/server/stdio.js', () => ({
  StdioServerTransport: jest.fn().mockImplementation(() => ({
    start: jest.fn(),
  })),
}));

describe('ProjectMemoryServer', () => {
  let server: ProjectMemoryServer;
  let options: ServerOptions;

  beforeEach(() => {
    jest.clearAllMocks();
    
    options = {
      projectRoot: '/test/project',
      memoryDir: '.project_memory',
      verbose: false
    };
    
    server = new ProjectMemoryServer(options);
  });

  describe('constructor', () => {
    test('should initialize server with options', () => {
      expect(server).toBeDefined();
      expect(server['verbose']).toBe(false);
      expect(server['memoryManager']).toBeDefined();
      expect(server['server']).toBeDefined();
    });

    test('should handle verbose mode', () => {
      const verboseOptions = { ...options, verbose: true };
      const verboseServer = new ProjectMemoryServer(verboseOptions);
      expect(verboseServer['verbose']).toBe(true);
    });
  });

  describe('formatSearchResults', () => {
    test('should handle empty results', () => {
      const formatted = server['formatSearchResults']([]);
      expect(formatted).toContain('No results found');
    });

    test('should format single result', () => {
      const results = [{
        type: 'decision',
        relevance: 0.8,
        data: 'Test decision content'
      }];
      
      const formatted = server['formatSearchResults'](results);
      expect(formatted).toContain('Result 1');
      expect(formatted).toContain('decision');
      expect(formatted).toContain('0.8');
      expect(formatted).toContain('Test decision content');
    });

    test('should format multiple results', () => {
      const results = [
        { type: 'decision', relevance: 0.9, data: 'Decision 1' },
        { type: 'solution', relevance: 0.7, data: 'Solution 1' }
      ];
      
      const formatted = server['formatSearchResults'](results);
      expect(formatted).toContain('Result 1');
      expect(formatted).toContain('Result 2');
      expect(formatted).toContain('decision');
      expect(formatted).toContain('solution');
    });

    test('should handle object data', () => {
      const results = [{
        type: 'decision',
        relevance: 0.8,
        data: { decision: 'Use TypeScript', rationale: 'Better types' }
      }];
      
      const formatted = server['formatSearchResults'](results);
      expect(formatted).toContain('Use TypeScript');
      expect(formatted).toContain('Better types');
    });
  });

  describe('validateToolArguments', () => {
    test('should not throw for valid get_project_context call', () => {
      expect(() => server['validateToolArguments']('get_project_context', {}))
        .not.toThrow();
    });

    test('should validate update_implementation_status arguments', () => {
      const validArgs = {
        component: 'frontend',
        status: 'in_progress'
      };
      
      expect(() => server['validateToolArguments']('update_implementation_status', validArgs))
        .not.toThrow();
    });

    test('should throw for missing required arguments', () => {
      expect(() => server['validateToolArguments']('update_implementation_status', { component: 'test' }))
        .toThrow('Missing required argument: status');
    });

    test('should validate status values', () => {
      expect(() => server['validateToolArguments']('update_implementation_status', { 
        component: 'test', 
        status: 'invalid_status' 
      })).toThrow('Invalid status: invalid_status');
    });

    test('should validate progress range', () => {
      expect(() => server['validateToolArguments']('update_implementation_status', {
        component: 'test',
        status: 'in_progress',
        progress: 150
      })).toThrow('Progress must be between 0 and 100');
    });

    test('should validate architecture decision arguments', () => {
      const validArgs = {
        decision: 'Use React',
        rationale: 'Component-based'
      };
      
      expect(() => server['validateToolArguments']('add_architecture_decision', validArgs))
        .not.toThrow();
    });

    test('should throw for missing decision rationale', () => {
      expect(() => server['validateToolArguments']('add_architecture_decision', { decision: 'test' }))
        .toThrow('Missing required argument: rationale');
    });

    test('should validate search memory arguments', () => {
      const validArgs = { query: 'test search' };
      
      expect(() => server['validateToolArguments']('search_memory', validArgs))
        .not.toThrow();
    });

    test('should throw for missing search query', () => {
      expect(() => server['validateToolArguments']('search_memory', {}))
        .toThrow('Missing required argument: query');
    });

    test('should validate search limit range', () => {
      expect(() => server['validateToolArguments']('search_memory', { 
        query: 'test',
        limit: 100 
      })).toThrow('Limit must be between 1 and 50');
    });

    test('should validate priorities array', () => {
      const invalidArgs = { priorities: 'not an array' };
      
      expect(() => server['validateToolArguments']('update_priorities', invalidArgs))
        .toThrow('Priorities must be an array');
    });

    test('should accept valid priorities array', () => {
      const validArgs = { priorities: ['task1', 'task2'] };
      
      expect(() => server['validateToolArguments']('update_priorities', validArgs))
        .not.toThrow();
    });

    test('should throw for unknown tool', () => {
      expect(() => server['validateToolArguments']('unknown_tool', {}))
        .toThrow('Unknown tool: unknown_tool');
    });
  });
});
