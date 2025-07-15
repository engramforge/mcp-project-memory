import { describe, test, expect } from '@jest/globals';
import { 
  ProjectMemory, 
  ProjectInfo, 
  ComponentStatus, 
  ArchitectureDecision,
  WorkingSolution,
  ConversationContext,
  ProjectContext,
  ServerOptions,
  ServerConfig
} from '../src/types.js';

describe('types', () => {
  describe('ProjectInfo', () => {
    test('should create valid project info', () => {
      const projectInfo: ProjectInfo = {
        name: 'test-project',
        type: 'nodejs',
        description: 'A test project',
        createdAt: '2024-01-01T00:00:00Z',
        lastUpdated: '2024-01-01T00:00:00Z'
      };

      expect(projectInfo.name).toBe('test-project');
      expect(projectInfo.type).toBe('nodejs');
      expect(projectInfo.description).toBe('A test project');
    });
  });

  describe('ComponentStatus', () => {
    test('should create valid component status', () => {
      const status: ComponentStatus = {
        status: 'in_progress',
        progress: 50,
        details: 'Working on implementation',
        lastUpdated: '2024-01-01T00:00:00Z'
      };

      expect(status.status).toBe('in_progress');
      expect(status.progress).toBe(50);
      expect(status.details).toBe('Working on implementation');
    });

    test('should handle all status types', () => {
      const statuses: ComponentStatus['status'][] = ['not_started', 'in_progress', 'complete', 'blocked', 'deprecated'];
      
      statuses.forEach(statusType => {
        const status: ComponentStatus = {
          status: statusType,
          progress: 0,
          lastUpdated: '2024-01-01T00:00:00Z'
        };
        expect(status.status).toBe(statusType);
      });
    });
  });

  describe('ArchitectureDecision', () => {
    test('should create valid architecture decision', () => {
      const decision: ArchitectureDecision = {
        id: 'decision-1',
        decision: 'Use TypeScript',
        rationale: 'Better type safety',
        impact: 'Improved code quality',
        alternatives: ['JavaScript'],
        date: '2024-01-01T00:00:00Z',
        tags: ['language', 'typescript']
      };

      expect(decision.id).toBe('decision-1');
      expect(decision.decision).toBe('Use TypeScript');
      expect(decision.alternatives).toContain('JavaScript');
    });
  });

  describe('WorkingSolution', () => {
    test('should create valid working solution', () => {
      const solution: WorkingSolution = {
        id: 'solution-1',
        problem: 'How to handle async operations',
        solution: 'Use async/await pattern',
        command: 'npm install',
        tags: ['async', 'javascript'],
        date: '2024-01-01T00:00:00Z',
        successCount: 5
      };

      expect(solution.problem).toBe('How to handle async operations');
      expect(solution.successCount).toBe(5);
    });
  });

  describe('ConversationContext', () => {
    test('should create valid conversation context', () => {
      const context: ConversationContext = {
        id: 'conv-1',
        summary: 'Discussed TypeScript implementation',
        decisions_made: ['Use strict mode'],
        solutions_found: ['Async pattern'],
        date: '2024-01-01T00:00:00Z'
      };

      expect(context.summary).toBe('Discussed TypeScript implementation');
      expect(context.decisions_made).toContain('Use strict mode');
    });
  });

  describe('ProjectMemory', () => {
    test('should create valid project memory', () => {
      const memory: ProjectMemory = {
        project_info: {
          name: 'test-project',
          type: 'nodejs',
          description: 'Test project',
          createdAt: '2024-01-01T00:00:00Z',
          lastUpdated: '2024-01-01T00:00:00Z'
        },
        implementation_status: {
          overall_progress: '50%',
          components: {}
        },
        architecture: {
          technologies: ['typescript'],
          decisions: []
        },
        working_solutions: {},
        current_priorities: ['implement tests'],
        conversations: [],
        metadata: {
          version: '1.0.0',
          created_at: '2024-01-01T00:00:00Z',
          last_updated: '2024-01-01T00:00:00Z'
        }
      };

      expect(memory.project_info.name).toBe('test-project');
      expect(memory.architecture.technologies).toContain('typescript');
      expect(memory.current_priorities).toContain('implement tests');
    });
  });

  describe('ServerOptions', () => {
    test('should create valid server options', () => {
      const options: ServerOptions = {
        projectRoot: '/test/path',
        memoryDir: '/test/memory',
        verbose: true,
        configFile: '/test/config.json'
      };

      expect(options.projectRoot).toBe('/test/path');
      expect(options.verbose).toBe(true);
    });
  });

  describe('ServerConfig', () => {
    test('should create valid server config', () => {
      const config: ServerConfig = {
        max_conversation_history: 100,
        backup_enabled: true,
        backup_interval: 3600,
        compression_enabled: false,
        auto_detect_project_type: true
      };

      expect(config.max_conversation_history).toBe(100);
      expect(config.backup_enabled).toBe(true);
    });
  });
});
