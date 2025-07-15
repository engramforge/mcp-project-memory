import { describe, test, expect } from '@jest/globals';

// Import type-only to avoid MCP SDK initialization issues
import type { ProjectMemoryServer } from '../src/server.js';
import { MemoryManager } from '../src/memory-manager.js';
import type { ServerOptions, ProjectInfo, ComponentStatus, ArchitectureDecision, WorkingSolution, ConversationContext } from '../src/types.js';

describe('Module Exports and Integration', () => {
  describe('Type exports', () => {
    test('should export all required types', () => {
      // Test that types can be imported and used
      const serverOptions: ServerOptions = {
        projectRoot: '/test',
        memoryDir: '.memory',
        verbose: false
      };
      
      expect(serverOptions.projectRoot).toBe('/test');
      expect(serverOptions.memoryDir).toBe('.memory');
      expect(serverOptions.verbose).toBe(false);
    });

    test('should have proper ProjectInfo structure', () => {
      const projectInfo: ProjectInfo = {
        name: 'test-project',
        type: 'web-application',
        description: 'A test project',
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };

      expect(projectInfo.name).toBe('test-project');
      expect(projectInfo.type).toBe('web-application');
      expect(typeof projectInfo.description).toBe('string');
      expect(typeof projectInfo.createdAt).toBe('string');
      expect(typeof projectInfo.lastUpdated).toBe('string');
    });

    test('should have proper ComponentStatus structure', () => {
      const status: ComponentStatus = {
        status: 'in_progress',
        progress: 75,
        lastUpdated: new Date().toISOString(),
        details: 'Working on tests'
      };

      expect(['not_started', 'in_progress', 'complete', 'blocked', 'deprecated']).toContain(status.status);
      expect(typeof status.progress).toBe('number');
      expect(typeof status.lastUpdated).toBe('string');
    });

    test('should have proper ArchitectureDecision structure', () => {
      const decision: ArchitectureDecision = {
        id: 'decision-1',
        decision: 'Use Jest for testing',
        rationale: 'Well-supported TypeScript integration',
        impact: 'Improved test reliability',
        alternatives: ['Mocha', 'Vitest'],
        date: new Date().toISOString(),
        tags: ['testing', 'infrastructure']
      };

      expect(typeof decision.id).toBe('string');
      expect(typeof decision.decision).toBe('string');
      expect(typeof decision.rationale).toBe('string');
      expect(Array.isArray(decision.alternatives)).toBe(true);
      expect(typeof decision.date).toBe('string');
      expect(Array.isArray(decision.tags)).toBe(true);
    });

    test('should have proper WorkingSolution structure', () => {
      const solution: WorkingSolution = {
        problem: 'TypeScript mocking issues',
        solution: 'Use logic-based tests',
        command: 'npm test',
        tags: ['testing', 'typescript'],
        timestamp: new Date().toISOString()
      };

      expect(typeof solution.problem).toBe('string');
      expect(typeof solution.solution).toBe('string');
      expect(Array.isArray(solution.tags)).toBe(true);
      expect(typeof solution.timestamp).toBe('string');
    });

    test('should have proper ConversationSummary structure', () => {
      const summary: ConversationSummary = {
        summary: 'Discussed testing strategy',
        decisions_made: ['Use Jest', 'Avoid mocking'],
        solutions_found: ['Logic-based testing'],
        timestamp: new Date().toISOString()
      };

      expect(typeof summary.summary).toBe('string');
      expect(Array.isArray(summary.decisions_made)).toBe(true);
      expect(Array.isArray(summary.solutions_found)).toBe(true);
      expect(typeof summary.timestamp).toBe('string');
    });
  });

  describe('Class instantiation', () => {
    test('should be able to create MemoryManager instance', () => {
      const options = {
        projectRoot: '/test/project',
        memoryDir: '.memory',
        verbose: false
      };

      expect(() => {
        new MemoryManager(options);
      }).not.toThrow();
    });

    test('should handle different memory directory names', () => {
      const options1 = { projectRoot: '/test', memoryDir: '.project_memory' };
      const options2 = { projectRoot: '/test', memoryDir: 'memory' };
      const options3 = { projectRoot: '/test', memoryDir: 'custom_memory_dir' };

      expect(() => new MemoryManager(options1)).not.toThrow();
      expect(() => new MemoryManager(options2)).not.toThrow();
      expect(() => new MemoryManager(options3)).not.toThrow();
    });

    test('should handle various project root paths', () => {
      const paths = [
        '/absolute/path',
        './relative/path',
        '../parent/path',
        '~/home/path',
        'simple/path'
      ];

      paths.forEach(path => {
        expect(() => {
          new MemoryManager({ projectRoot: path, memoryDir: '.memory' });
        }).not.toThrow();
      });
    });
  });

  describe('Default values and configurations', () => {
    test('should handle minimal configuration', () => {
      const manager = new MemoryManager({
        projectRoot: '/test',
        memoryDir: '.memory'
      });

      expect(manager).toBeDefined();
      expect(typeof manager.getCurrentContext).toBe('function');
      expect(typeof manager.searchMemory).toBe('function');
    });

    test('should handle verbose mode', () => {
      const manager = new MemoryManager({
        projectRoot: '/test',
        memoryDir: '.memory',
        verbose: true
      });

      expect(manager).toBeDefined();
    });

    test('should handle config file option', () => {
      const manager = new MemoryManager({
        projectRoot: '/test',
        memoryDir: '.memory',
        configFile: '/path/to/config.json'
      });

      expect(manager).toBeDefined();
    });
  });

  describe('Method availability', () => {
    let manager: MemoryManager;

    beforeEach(() => {
      manager = new MemoryManager({
        projectRoot: '/test',
        memoryDir: '.memory'
      });
    });

    test('should have all required methods', () => {
      const expectedMethods = [
        'getCurrentContext',
        'updateImplementationStatus',
        'addArchitectureDecision',
        'addWorkingSolution',
        'updatePriorities',
        'searchMemory',
        'logConversationContext',
        'clearMemory'
      ];

      expectedMethods.forEach(method => {
        expect(typeof manager[method as keyof MemoryManager]).toBe('function');
      });
    });

    test('should have consistent method signatures', () => {
      // Test method existence and basic signature requirements
      expect(manager.getCurrentContext.length).toBe(0); // No parameters
      expect(manager.updateImplementationStatus.length).toBe(3); // component, status, options
      expect(manager.addArchitectureDecision.length).toBe(1); // decision object
      expect(manager.addWorkingSolution.length).toBe(1); // solution object
      expect(manager.updatePriorities.length).toBe(1); // priorities array
      expect(manager.searchMemory.length).toBe(2); // query, limit
      expect(manager.logConversationContext.length).toBe(1); // context object
      expect(manager.clearMemory.length).toBe(1); // options object
    });
  });

  describe('Error handling patterns', () => {
    test('should handle invalid project root gracefully', () => {
      // These should not throw during construction
      expect(() => {
        new MemoryManager({ projectRoot: '', memoryDir: '.memory' });
      }).not.toThrow();

      expect(() => {
        new MemoryManager({ projectRoot: '/nonexistent/path', memoryDir: '.memory' });
      }).not.toThrow();
    });

    test('should handle invalid memory directory gracefully', () => {
      expect(() => {
        new MemoryManager({ projectRoot: '/test', memoryDir: '' });
      }).not.toThrow();

      expect(() => {
        new MemoryManager({ projectRoot: '/test', memoryDir: '/absolute/path' });
      }).not.toThrow();
    });

    test('should handle special characters in paths', () => {
      const specialPaths = [
        '/path with spaces',
        '/path-with-dashes',
        '/path_with_underscores',
        '/path.with.dots',
        '/path@with@symbols'
      ];

      specialPaths.forEach(path => {
        expect(() => {
          new MemoryManager({ projectRoot: path, memoryDir: '.memory' });
        }).not.toThrow();
      });
    });
  });

  describe('TypeScript compilation and exports', () => {
    test('should export all main classes', () => {
      // Test that imports work correctly
      expect(MemoryManager).toBeDefined();
      expect(typeof MemoryManager).toBe('function');
      expect(MemoryManager.prototype.constructor).toBe(MemoryManager);
    });

    test('should have proper TypeScript types', () => {
      // This test validates that TypeScript compilation works
      const manager: MemoryManager = new MemoryManager({
        projectRoot: '/test',
        memoryDir: '.memory'
      });

      // TypeScript should catch type errors at compile time
      expect(manager).toBeInstanceOf(MemoryManager);
    });

    test('should support async patterns', () => {
      const manager = new MemoryManager({
        projectRoot: '/test',
        memoryDir: '.memory'
      });

      // Methods should return promises for async operations
      const context = manager.getCurrentContext();
      expect(context).toBeInstanceOf(Promise);

      const search = manager.searchMemory('test', 5);
      expect(search).toBeInstanceOf(Promise);
    });
  });
});
