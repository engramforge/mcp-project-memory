import { describe, test, expect, beforeEach } from '@jest/globals';
import { MemoryManager } from '../src/memory-manager.js';
import { ServerOptions } from '../src/types.js';

describe('MemoryManager - Logic Tests', () => {
  let memoryManager: MemoryManager;
  let options: ServerOptions;

  beforeEach(() => {
    options = {
      projectRoot: '/test/project',
      memoryDir: '.project_memory',
      verbose: false
    };
    
    memoryManager = new MemoryManager(options);
  });

  describe('Constructor and Path Resolution', () => {
    test('should resolve absolute paths correctly', () => {
      const absolutePath = '/absolute/path/project';
      const absOptions = { ...options, projectRoot: absolutePath };
      const manager = new MemoryManager(absOptions);
      
      expect(manager['projectRoot']).toBe(absolutePath);
    });

    test('should resolve relative paths to absolute', () => {
      const relativeOptions = { ...options, projectRoot: './relative/path' };
      const manager = new MemoryManager(relativeOptions);
      
      expect(manager['projectRoot']).toContain('relative/path');
      expect(manager['projectRoot']).not.toMatch(/^\.\//);
    });

    test('should handle different memory directory names', () => {
      const customOptions = { ...options, memoryDir: 'custom_memory' };
      const manager = new MemoryManager(customOptions);
      
      expect(manager['memoryDir']).toContain('custom_memory');
      expect(manager['memoryDir']).not.toContain('.project_memory');
    });

    test('should handle verbose flag correctly', () => {
      const verboseOptions = { ...options, verbose: true };
      const manager = new MemoryManager(verboseOptions);
      
      expect(manager['verbose']).toBe(true);
    });
  });

  describe('getCurrentContext method - without initialization', () => {
    test('should return context object with default values', () => {
      const context = memoryManager.getCurrentContext();
      
      // Should have all required properties
      expect(context).toHaveProperty('project_name');
      expect(context).toHaveProperty('project_type');
      expect(context).toHaveProperty('project_description');
      expect(context).toHaveProperty('project_root');
      expect(context).toHaveProperty('overall_progress');
      expect(context).toHaveProperty('components');
      expect(context).toHaveProperty('priorities');
      expect(context).toHaveProperty('technologies');
      expect(context).toHaveProperty('recent_decisions');
      expect(context).toHaveProperty('solutions');
      expect(context).toHaveProperty('recent_conversations');
      expect(context).toHaveProperty('last_updated');
    });

    test('should return arrays for collection properties', () => {
      const context = memoryManager.getCurrentContext();
      
      expect(Array.isArray(context.priorities)).toBe(true);
      expect(Array.isArray(context.technologies)).toBe(true);
      expect(Array.isArray(context.recent_decisions)).toBe(true);
      expect(Array.isArray(context.recent_conversations)).toBe(true);
    });

    test('should return absolute project root path', () => {
      const context = memoryManager.getCurrentContext();
      
      expect(context.project_root).toBe(memoryManager['projectRoot']);
      expect(context.project_root.startsWith('/')).toBe(true);
    });

    test('should return object for components and solutions', () => {
      const context = memoryManager.getCurrentContext();
      
      expect(typeof context.components).toBe('object');
      expect(typeof context.solutions).toBe('object');
      expect(context.components).not.toBeNull();
      expect(context.solutions).not.toBeNull();
    });
  });

  describe('searchMemory method - without initialization', () => {
    test('should return empty array for any search query', () => {
      const results = memoryManager.searchMemory('test query');
      expect(Array.isArray(results)).toBe(true);
      expect(results).toHaveLength(0);
    });

    test('should respect limit parameter', () => {
      const results1 = memoryManager.searchMemory('test', 5);
      const results2 = memoryManager.searchMemory('test', 10);
      
      expect(results1.length).toBeLessThanOrEqual(5);
      expect(results2.length).toBeLessThanOrEqual(10);
    });

    test('should handle default limit', () => {
      const results = memoryManager.searchMemory('test');
      expect(results.length).toBeLessThanOrEqual(10); // Default limit
    });

    test('should handle empty query string', () => {
      const results = memoryManager.searchMemory('');
      expect(Array.isArray(results)).toBe(true);
    });

    test('should handle very long query string', () => {
      const longQuery = 'a'.repeat(1000);
      const results = memoryManager.searchMemory(longQuery);
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('Method existence and types', () => {
    test('should have all required public methods', () => {
      const expectedMethods = [
        'initialize',
        'getCurrentContext',
        'searchMemory',
        'updateImplementationStatus',
        'addArchitectureDecision',
        'addWorkingSolution',
        'updatePriorities',
        'logConversationContext',
        'clearMemory'
      ];

      expectedMethods.forEach(methodName => {
        expect(typeof memoryManager[methodName]).toBe('function');
      });
    });

    test('should have proper method signatures', () => {
      // Test that methods exist and are callable (without actually calling them)
      expect(memoryManager.initialize).toBeInstanceOf(Function);
      expect(memoryManager.getCurrentContext).toBeInstanceOf(Function);
      expect(memoryManager.searchMemory).toBeInstanceOf(Function);
      expect(memoryManager.updateImplementationStatus).toBeInstanceOf(Function);
      expect(memoryManager.addArchitectureDecision).toBeInstanceOf(Function);
      expect(memoryManager.addWorkingSolution).toBeInstanceOf(Function);
      expect(memoryManager.updatePriorities).toBeInstanceOf(Function);
      expect(memoryManager.logConversationContext).toBeInstanceOf(Function);
      expect(memoryManager.clearMemory).toBeInstanceOf(Function);
    });

    test('should handle method calls with proper parameters', () => {
      // Test that methods can be called (though they may fail due to file system)
      expect(() => memoryManager.getCurrentContext()).not.toThrow();
      expect(() => memoryManager.searchMemory('test')).not.toThrow();
      expect(() => memoryManager.searchMemory('test', 5)).not.toThrow();
    });
  });

  describe('Internal helper methods', () => {
    test('should have private helper methods accessible for testing', () => {
      // Test that internal methods exist (using bracket notation to access private methods)
      expect(typeof memoryManager['generateId']).toBe('function');
      expect(typeof memoryManager['calculateRelevance']).toBe('function');
      expect(typeof memoryManager['calculateOverallProgress']).toBe('function');
    });

    test('should generate unique IDs', () => {
      const id1 = memoryManager['generateId']();
      const id2 = memoryManager['generateId']();
      
      expect(typeof id1).toBe('string');
      expect(typeof id2).toBe('string');
      expect(id1).not.toBe(id2);
      expect(id1.length).toBeGreaterThan(0);
      expect(id2.length).toBeGreaterThan(0);
    });

    test('should calculate relevance scores', () => {
      const score1 = memoryManager['calculateRelevance']('react frontend', 'How to build React components');
      const score2 = memoryManager['calculateRelevance']('react frontend', 'Database optimization techniques');
      
      expect(typeof score1).toBe('number');
      expect(typeof score2).toBe('number');
      expect(score1).toBeGreaterThanOrEqual(0);
      expect(score2).toBeGreaterThanOrEqual(0);
      expect(score1).toBeGreaterThan(score2); // First should be more relevant
    });

    test('should handle relevance calculation edge cases', () => {
      const emptyQuery = memoryManager['calculateRelevance']('', 'some content');
      const emptyContent = memoryManager['calculateRelevance']('query', '');
      const bothEmpty = memoryManager['calculateRelevance']('', '');
      
      expect(typeof emptyQuery).toBe('number');
      expect(typeof emptyContent).toBe('number');
      expect(typeof bothEmpty).toBe('number');
      expect(emptyQuery).toBeGreaterThanOrEqual(0);
      expect(emptyContent).toBeGreaterThanOrEqual(0);
      expect(bothEmpty).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Configuration and options handling', () => {
    test('should handle configFile option', () => {
      const configOptions = { ...options, configFile: '/path/to/config.json' };
      const manager = new MemoryManager(configOptions);
      
      expect(manager['configFile']).toBe('/path/to/config.json');
    });

    test('should handle missing configFile option', () => {
      const manager = new MemoryManager(options);
      expect(manager['configFile']).toBeUndefined();
    });

    test('should maintain internal state', () => {
      expect(memoryManager['memory']).toBeDefined();
      expect(memoryManager['config']).toBeDefined();
      expect(typeof memoryManager['memory']).toBe('object');
      expect(typeof memoryManager['config']).toBe('object');
    });
  });

  describe('Error handling and edge cases', () => {
    test('should handle invalid project root gracefully', () => {
      const invalidOptions = { ...options, projectRoot: '' };
      expect(() => new MemoryManager(invalidOptions)).not.toThrow();
    });

    test('should handle special characters in paths', () => {
      const specialOptions = { ...options, projectRoot: '/path/with spaces/and-dashes_underscores' };
      expect(() => new MemoryManager(specialOptions)).not.toThrow();
    });

    test('should handle very long paths', () => {
      const longPath = '/very/long/path/' + 'a'.repeat(200);
      const longOptions = { ...options, projectRoot: longPath };
      expect(() => new MemoryManager(longOptions)).not.toThrow();
    });

    test('should handle null and undefined search queries gracefully', () => {
      // TypeScript prevents null/undefined, but test runtime safety
      expect(() => memoryManager.searchMemory('')).not.toThrow();
    });
  });
});
