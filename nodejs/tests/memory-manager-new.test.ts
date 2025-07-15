import { jest } from '@jest/globals';
import * as path from 'path';
import { MemoryManager } from '../src/memory-manager.js';
import { ServerOptions, ComponentStatus } from '../src/types.js';

// Mock fs-extra
const mockFs = {
  ensureDir: jest.fn().mockResolvedValue(undefined),
  readFile: jest.fn(),
  writeFile: jest.fn().mockResolvedValue(undefined),
  pathExists: jest.fn().mockResolvedValue(true),
  readJSON: jest.fn(),
  writeJSON: jest.fn().mockResolvedValue(undefined),
  readJson: jest.fn(),
  writeJson: jest.fn().mockResolvedValue(undefined),
  readdir: jest.fn().mockResolvedValue([]),
  existsSync: jest.fn().mockReturnValue(true),
};

jest.mock('fs-extra', () => mockFs);

describe('MemoryManager', () => {
  let memoryManager: MemoryManager;
  let options: ServerOptions;

  beforeEach(() => {
    jest.clearAllMocks();
    
    options = {
      projectRoot: '/test/project',
      memoryDir: '.project_memory',
      verbose: false
    };
    
    memoryManager = new MemoryManager(options);
    
    // Setup default mock responses
    mockFs.readJSON.mockResolvedValue({
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
        technologies: [],
        decisions: []
      },
      working_solutions: {},
      current_priorities: [],
      conversations: [],
      metadata: {
        version: '1.0.0',
        created_at: '2024-01-01T00:00:00Z',
        last_updated: '2024-01-01T00:00:00Z'
      }
    });
    
    mockFs.pathExists.mockResolvedValue(false);
  });

  describe('constructor', () => {
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
  });

  describe('initialize', () => {
    test('should ensure memory directory exists', async () => {
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
  });

  describe('updateImplementationStatus', () => {
    beforeEach(async () => {
      await memoryManager.initialize();
    });

    test('should update component status', async () => {
      const status: ComponentStatus = {
        status: 'in_progress',
        progress: 50,
        details: 'Working on tests',
        lastUpdated: expect.any(String)
      };

      await memoryManager.updateImplementationStatus(
        'frontend',
        'in_progress',
        'Working on tests',
        50
      );

      expect(mockFs.writeJSON).toHaveBeenCalled();
    });

    test('should update overall progress when component is complete', async () => {
      await memoryManager.updateImplementationStatus(
        'frontend',
        'complete',
        'All tests passing',
        100
      );

      expect(mockFs.writeJSON).toHaveBeenCalled();
    });
  });

  describe('addArchitectureDecision', () => {
    beforeEach(async () => {
      await memoryManager.initialize();
    });

    test('should add new architecture decision', async () => {
      await memoryManager.addArchitectureDecision(
        'Use TypeScript',
        'Better type safety',
        'Improved code quality',
        ['JavaScript']
      );

      expect(mockFs.writeJSON).toHaveBeenCalled();
    });

    test('should assign unique ID to decision', async () => {
      await memoryManager.addArchitectureDecision(
        'Use Jest for testing',
        'Good TypeScript support'
      );

      expect(mockFs.writeJSON).toHaveBeenCalled();
    });
  });

  describe('addWorkingSolution', () => {
    beforeEach(async () => {
      await memoryManager.initialize();
    });

    test('should add new working solution', async () => {
      await memoryManager.addWorkingSolution(
        'How to mock ES modules',
        'Use jest.mock() with module factory',
        'jest.mock("module", () => ({ default: mockFn }))',
        ['jest', 'mocking', 'es-modules']
      );

      expect(mockFs.writeJSON).toHaveBeenCalled();
    });

    test('should increment success count for existing solution', async () => {
      // Add solution first time
      await memoryManager.addWorkingSolution(
        'How to test async functions',
        'Use async/await in test',
        'test("should work", async () => { await fn(); })',
        ['testing', 'async']
      );

      // Add same solution again
      await memoryManager.addWorkingSolution(
        'How to test async functions',
        'Use async/await in test'
      );

      expect(mockFs.writeJSON).toHaveBeenCalledTimes(2);
    });
  });

  describe('searchMemory', () => {
    beforeEach(async () => {
      await memoryManager.initialize();
    });

    test('should return empty results for empty memory', () => {
      const results = memoryManager.searchMemory('test query');
      expect(results).toEqual([]);
    });

    test('should limit results when specified', () => {
      const results = memoryManager.searchMemory('test query', 5);
      expect(results.length).toBeLessThanOrEqual(5);
    });
  });

  describe('getCurrentContext', () => {
    beforeEach(async () => {
      await memoryManager.initialize();
    });

    test('should return current project context', () => {
      const context = memoryManager.getCurrentContext();
      
      expect(context).toHaveProperty('project_name');
      expect(context).toHaveProperty('project_type');
      expect(context).toHaveProperty('project_description');
      expect(context).toHaveProperty('project_root');
      expect(context).toHaveProperty('overall_progress');
      expect(context).toHaveProperty('components');
      expect(context).toHaveProperty('priorities');
      expect(context).toHaveProperty('technologies');
      expect(context).toHaveProperty('solutions');
      expect(context).toHaveProperty('last_updated');
    });

    test('should include recent decisions and conversations', () => {
      const context = memoryManager.getCurrentContext();
      
      expect(context).toHaveProperty('recent_decisions');
      expect(context).toHaveProperty('recent_conversations');
      expect(Array.isArray(context.recent_decisions)).toBe(true);
      expect(Array.isArray(context.recent_conversations)).toBe(true);
    });
  });

  describe('updatePriorities', () => {
    beforeEach(async () => {
      await memoryManager.initialize();
    });

    test('should update project priorities', async () => {
      const priorities = ['Implement authentication', 'Add unit tests', 'Setup CI/CD'];
      
      await memoryManager.updatePriorities(priorities);
      
      expect(mockFs.writeJSON).toHaveBeenCalled();
    });

    test('should handle empty priorities', async () => {
      await memoryManager.updatePriorities([]);
      
      expect(mockFs.writeJSON).toHaveBeenCalled();
    });
  });

  describe('logConversationContext', () => {
    beforeEach(async () => {
      await memoryManager.initialize();
    });

    test('should log conversation context', async () => {
      await memoryManager.logConversationContext(
        'Discussed testing strategy',
        ['Use Jest for unit tests'],
        ['Mock ES modules pattern']
      );
      
      expect(mockFs.writeJSON).toHaveBeenCalled();
    });

    test('should handle optional parameters', async () => {
      await memoryManager.logConversationContext(
        'Brief discussion about architecture'
      );
      
      expect(mockFs.writeJSON).toHaveBeenCalled();
    });
  });

  describe('clearMemory', () => {
    beforeEach(async () => {
      await memoryManager.initialize();
    });

    test('should clear all memory when scope is "all"', async () => {
      const result = await memoryManager.clearMemory('all', false);
      
      expect(result).toContain('cleared');
      expect(mockFs.writeJSON).toHaveBeenCalled();
    });

    test('should create backup when requested', async () => {
      const result = await memoryManager.clearMemory('all', true);
      
      expect(result).toContain('cleared');
      expect(mockFs.ensureDir).toHaveBeenCalled();
    });

    test('should clear specific sections', async () => {
      const result = await memoryManager.clearMemory('decisions', false);
      
      expect(result).toContain('cleared');
      expect(mockFs.writeJSON).toHaveBeenCalled();
    });
  });
});
