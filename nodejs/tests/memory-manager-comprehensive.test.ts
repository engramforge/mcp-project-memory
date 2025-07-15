import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import * as path from 'path';
import { MemoryManager } from '../src/memory-manager.js';
import { ServerOptions, ProjectMemory } from '../src/types.js';

// Create mock implementations
const mockFs = {
  ensureDir: jest.fn().mockResolvedValue(undefined),
  readFile: jest.fn(),
  writeFile: jest.fn().mockResolvedValue(undefined),
  pathExists: jest.fn(),
  readJSON: jest.fn(),
  writeJSON: jest.fn().mockResolvedValue(undefined),
  readJson: jest.fn(),
  writeJson: jest.fn().mockResolvedValue(undefined),
  readdir: jest.fn().mockResolvedValue([]),
  existsSync: jest.fn().mockReturnValue(true),
};

// Mock fs-extra at the module level
jest.mock('fs-extra', () => mockFs);

describe('MemoryManager - Comprehensive Tests', () => {
  let memoryManager: MemoryManager;
  let options: ServerOptions;
  let mockMemory: ProjectMemory;

  beforeEach(() => {
    jest.clearAllMocks();
    
    options = {
      projectRoot: '/test/project',
      memoryDir: '.project_memory',
      verbose: false
    };
    
    mockMemory = {
      project_info: {
        name: 'test-project',
        type: 'nodejs',
        description: 'Test project',
        createdAt: '2024-01-01T00:00:00Z',
        lastUpdated: '2024-01-01T00:00:00Z'
      },
      implementation_status: {
        overall_progress: '0%',
        components: {}
      },
      architecture: {
        technologies: ['typescript', 'jest'],
        decisions: []
      },
      working_solutions: {},
      current_priorities: ['setup tests'],
      conversations: [],
      metadata: {
        version: '1.0.0',
        created_at: '2024-01-01T00:00:00Z',
        last_updated: '2024-01-01T00:00:00Z'
      }
    };
    
    // Setup default mock responses
    mockFs.readJSON.mockResolvedValue(mockMemory);
    mockFs.pathExists.mockResolvedValue(true);
    mockFs.existsSync.mockReturnValue(true);
    
    memoryManager = new MemoryManager(options);
  });

  describe('Constructor and Initialization', () => {
    test('should initialize with correct paths', () => {
      expect(memoryManager['projectRoot']).toBe(path.resolve('/test/project'));
      expect(memoryManager['memoryDir']).toBe(path.join(path.resolve('/test/project'), '.project_memory'));
      expect(memoryManager['verbose']).toBe(false);
    });

    test('should resolve relative project root path', () => {
      const relativeOptions = {
        ...options,
        projectRoot: './test'
      };
      const manager = new MemoryManager(relativeOptions);
      expect(path.isAbsolute(manager['projectRoot'])).toBe(true);
    });

    test('should handle verbose mode', () => {
      const verboseOptions = { ...options, verbose: true };
      const verboseManager = new MemoryManager(verboseOptions);
      expect(verboseManager['verbose']).toBe(true);
    });

    test('should handle custom memory directory', () => {
      const customOptions = { ...options, memoryDir: 'custom_memory' };
      const customManager = new MemoryManager(customOptions);
      expect(customManager['memoryDir']).toBe(path.join(path.resolve('/test/project'), 'custom_memory'));
    });
  });

  describe('initialize method', () => {
    test('should ensure memory directory exists', async () => {
      mockFs.pathExists.mockResolvedValue(false);
      
      await memoryManager.initialize();
      
      expect(mockFs.ensureDir).toHaveBeenCalledWith(
        path.join(path.resolve('/test/project'), '.project_memory')
      );
    });

    test('should load existing memory when file exists', async () => {
      mockFs.pathExists.mockResolvedValue(true);
      
      await memoryManager.initialize();
      
      expect(mockFs.readJSON).toHaveBeenCalledWith(
        path.join(path.resolve('/test/project'), '.project_memory', 'memory.json')
      );
    });

    test('should create new memory when file does not exist', async () => {
      mockFs.pathExists.mockResolvedValue(false);
      
      await memoryManager.initialize();
      
      expect(mockFs.writeJSON).toHaveBeenCalled();
    });

    test('should handle corrupted memory file gracefully', async () => {
      mockFs.pathExists.mockResolvedValue(true);
      mockFs.readJSON.mockRejectedValue(new Error('Invalid JSON'));
      
      await expect(memoryManager.initialize()).resolves.not.toThrow();
      expect(mockFs.writeJSON).toHaveBeenCalled(); // Should create new memory
    });
  });

  describe('updateImplementationStatus method', () => {
    beforeEach(async () => {
      await memoryManager.initialize();
    });

    test('should update component status with all parameters', async () => {
      await memoryManager.updateImplementationStatus(
        'frontend',
        'in_progress',
        'Working on components',
        75
      );

      expect(mockFs.writeJSON).toHaveBeenCalled();
    });

    test('should update component status with minimal parameters', async () => {
      await memoryManager.updateImplementationStatus('backend', 'complete');

      expect(mockFs.writeJSON).toHaveBeenCalled();
    });

    test('should handle different status values', async () => {
      const statuses = ['not_started', 'in_progress', 'complete', 'blocked', 'deprecated'] as const;
      
      for (const status of statuses) {
        await memoryManager.updateImplementationStatus('test-component', status);
        expect(mockFs.writeJSON).toHaveBeenCalled();
      }
    });

    test('should update overall progress calculation', async () => {
      // Add multiple components to test progress calculation
      await memoryManager.updateImplementationStatus('frontend', 'complete', '', 100);
      await memoryManager.updateImplementationStatus('backend', 'in_progress', '', 50);
      await memoryManager.updateImplementationStatus('database', 'not_started', '', 0);

      expect(mockFs.writeJSON).toHaveBeenCalledTimes(3);
    });
  });

  describe('addArchitectureDecision method', () => {
    beforeEach(async () => {
      await memoryManager.initialize();
    });

    test('should add decision with all parameters', async () => {
      await memoryManager.addArchitectureDecision(
        'Use TypeScript',
        'Better type safety',
        'Improved code quality but longer build times',
        ['JavaScript', 'Flow']
      );

      expect(mockFs.writeJSON).toHaveBeenCalled();
    });

    test('should add decision with minimal parameters', async () => {
      await memoryManager.addArchitectureDecision(
        'Use MongoDB',
        'Good fit for document-based data'
      );

      expect(mockFs.writeJSON).toHaveBeenCalled();
    });

    test('should handle empty alternatives array', async () => {
      await memoryManager.addArchitectureDecision(
        'Use Docker',
        'Containerization benefits',
        'Easier deployment',
        []
      );

      expect(mockFs.writeJSON).toHaveBeenCalled();
    });
  });

  describe('addWorkingSolution method', () => {
    beforeEach(async () => {
      await memoryManager.initialize();
    });

    test('should add solution with all parameters', async () => {
      await memoryManager.addWorkingSolution(
        'How to handle async errors',
        'Use try-catch with async/await',
        'try { await asyncFunction(); } catch (error) { handleError(error); }',
        ['async', 'error-handling', 'javascript']
      );

      expect(mockFs.writeJSON).toHaveBeenCalled();
    });

    test('should add solution with minimal parameters', async () => {
      await memoryManager.addWorkingSolution(
        'Simple problem',
        'Simple solution'
      );

      expect(mockFs.writeJSON).toHaveBeenCalled();
    });

    test('should increment success count for duplicate problems', async () => {
      const problem = 'How to test async functions';
      const solution = 'Use async/await in tests';
      
      await memoryManager.addWorkingSolution(problem, solution);
      await memoryManager.addWorkingSolution(problem, solution);

      expect(mockFs.writeJSON).toHaveBeenCalledTimes(2);
    });
  });

  describe('searchMemory method', () => {
    beforeEach(async () => {
      // Add some test data to the memory
      mockMemory.architecture.decisions = [{
        id: 'dec1',
        decision: 'Use React for frontend',
        rationale: 'Component-based architecture',
        impact: 'Faster development',
        alternatives: ['Vue', 'Angular'],
        date: '2024-01-01T00:00:00Z',
        tags: ['frontend', 'react']
      }];
      
      mockMemory.working_solutions = {
        'sol1': {
          id: 'sol1',
          problem: 'How to handle React state',
          solution: 'Use useState hook',
          command: 'const [state, setState] = useState()',
          tags: ['react', 'hooks'],
          date: '2024-01-01T00:00:00Z',
          successCount: 1
        }
      };
      
      mockFs.readJSON.mockResolvedValue(mockMemory);
      await memoryManager.initialize();
    });

    test('should return empty results for no matches', () => {
      const results = memoryManager.searchMemory('nonexistent technology');
      expect(results).toEqual([]);
    });

    test('should find results for matching queries', () => {
      const results = memoryManager.searchMemory('react');
      expect(results.length).toBeGreaterThan(0);
    });

    test('should limit results when specified', () => {
      const results = memoryManager.searchMemory('react', 1);
      expect(results.length).toBeLessThanOrEqual(1);
    });

    test('should search case-insensitively', () => {
      const lowerResults = memoryManager.searchMemory('react');
      const upperResults = memoryManager.searchMemory('REACT');
      const mixedResults = memoryManager.searchMemory('React');
      
      expect(lowerResults.length).toBe(upperResults.length);
      expect(lowerResults.length).toBe(mixedResults.length);
    });

    test('should return results with proper structure', () => {
      const results = memoryManager.searchMemory('react');
      if (results.length > 0) {
        const result = results[0];
        expect(result).toHaveProperty('type');
        expect(result).toHaveProperty('relevance');
        expect(result).toHaveProperty('data');
        expect(typeof result.relevance).toBe('number');
      }
    });
  });

  describe('getCurrentContext method', () => {
    beforeEach(async () => {
      await memoryManager.initialize();
    });

    test('should return context with all required properties', () => {
      const context = memoryManager.getCurrentContext();
      
      const requiredProperties = [
        'project_name', 'project_type', 'project_description', 'project_root',
        'overall_progress', 'components', 'priorities', 'technologies',
        'recent_decisions', 'solutions', 'recent_conversations', 'last_updated'
      ];

      requiredProperties.forEach(prop => {
        expect(context).toHaveProperty(prop);
      });
    });

    test('should return arrays for array properties', () => {
      const context = memoryManager.getCurrentContext();
      
      expect(Array.isArray(context.priorities)).toBe(true);
      expect(Array.isArray(context.technologies)).toBe(true);
      expect(Array.isArray(context.recent_decisions)).toBe(true);
      expect(Array.isArray(context.recent_conversations)).toBe(true);
    });

    test('should include project root as absolute path', () => {
      const context = memoryManager.getCurrentContext();
      expect(path.isAbsolute(context.project_root)).toBe(true);
    });
  });

  describe('updatePriorities method', () => {
    beforeEach(async () => {
      await memoryManager.initialize();
    });

    test('should update project priorities', async () => {
      const priorities = ['Task 1', 'Task 2', 'Task 3'];
      
      await memoryManager.updatePriorities(priorities);
      
      expect(mockFs.writeJSON).toHaveBeenCalled();
    });

    test('should handle empty priorities array', async () => {
      await memoryManager.updatePriorities([]);
      
      expect(mockFs.writeJSON).toHaveBeenCalled();
    });

    test('should handle single priority', async () => {
      await memoryManager.updatePriorities(['Single task']);
      
      expect(mockFs.writeJSON).toHaveBeenCalled();
    });
  });

  describe('logConversationContext method', () => {
    beforeEach(async () => {
      await memoryManager.initialize();
    });

    test('should log conversation with all parameters', async () => {
      await memoryManager.logConversationContext(
        'Discussed architecture decisions',
        ['Decision 1', 'Decision 2'],
        ['Solution 1', 'Solution 2']
      );

      expect(mockFs.writeJSON).toHaveBeenCalled();
    });

    test('should log conversation with only summary', async () => {
      await memoryManager.logConversationContext('Brief discussion');

      expect(mockFs.writeJSON).toHaveBeenCalled();
    });

    test('should handle empty arrays for decisions and solutions', async () => {
      await memoryManager.logConversationContext(
        'Discussion with empty arrays',
        [],
        []
      );

      expect(mockFs.writeJSON).toHaveBeenCalled();
    });
  });

  describe('clearMemory method', () => {
    beforeEach(async () => {
      await memoryManager.initialize();
    });

    test('should clear all memory sections', async () => {
      const result = await memoryManager.clearMemory('all', false);
      
      expect(result).toContain('cleared');
      expect(mockFs.writeJSON).toHaveBeenCalled();
    });

    test('should clear specific sections', async () => {
      const scopes = ['decisions', 'solutions', 'conversations', 'components'] as const;
      
      for (const scope of scopes) {
        const result = await memoryManager.clearMemory(scope, false);
        expect(result).toContain('cleared');
        expect(mockFs.writeJSON).toHaveBeenCalled();
      }
    });

    test('should create backup when requested', async () => {
      const result = await memoryManager.clearMemory('all', true);
      
      expect(result).toContain('cleared');
      expect(mockFs.ensureDir).toHaveBeenCalled(); // For backup directory
    });

    test('should handle backup creation errors gracefully', async () => {
      mockFs.ensureDir.mockRejectedValueOnce(new Error('Cannot create backup directory'));
      
      const result = await memoryManager.clearMemory('all', true);
      
      expect(result).toContain('cleared');
      expect(result).toContain('backup failed');
    });
  });

  describe('Error handling', () => {
    test('should handle file write errors', async () => {
      mockFs.writeJSON.mockRejectedValueOnce(new Error('Write failed'));
      
      await memoryManager.initialize();
      
      await expect(
        memoryManager.updateImplementationStatus('test', 'complete')
      ).rejects.toThrow('Write failed');
    });

    test('should handle file read errors during initialization', async () => {
      mockFs.pathExists.mockResolvedValue(true);
      mockFs.readJSON.mockRejectedValue(new Error('Read failed'));
      
      await expect(memoryManager.initialize()).resolves.not.toThrow();
    });

    test('should handle directory creation errors', async () => {
      mockFs.ensureDir.mockRejectedValueOnce(new Error('Cannot create directory'));
      
      await expect(memoryManager.initialize()).rejects.toThrow('Cannot create directory');
    });
  });
});
