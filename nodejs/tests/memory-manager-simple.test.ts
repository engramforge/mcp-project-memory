import { describe, test, expect } from '@jest/globals';
import { MemoryManager } from '../src/memory-manager.js';
import { ServerOptions } from '../src/types.js';

describe('MemoryManager', () => {
  test('should be importable', () => {
    expect(MemoryManager).toBeDefined();
    expect(typeof MemoryManager).toBe('function');
  });

  test('should be constructable with basic options', () => {
    const options: ServerOptions = {
      projectRoot: '/test/project',
      memoryDir: '.project_memory',
      verbose: false
    };

    expect(() => {
      new MemoryManager(options);
    }).not.toThrow();
  });

  test('should have expected methods', () => {
    const options: ServerOptions = {
      projectRoot: '/test/project',
      memoryDir: '.project_memory',
      verbose: false
    };

    const manager = new MemoryManager(options);
    
    expect(typeof manager.initialize).toBe('function');
    expect(typeof manager.getCurrentContext).toBe('function');
    expect(typeof manager.searchMemory).toBe('function');
    expect(typeof manager.updateImplementationStatus).toBe('function');
    expect(typeof manager.addArchitectureDecision).toBe('function');
    expect(typeof manager.addWorkingSolution).toBe('function');
    expect(typeof manager.updatePriorities).toBe('function');
    expect(typeof manager.logConversationContext).toBe('function');
    expect(typeof manager.clearMemory).toBe('function');
  });
});
