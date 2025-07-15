import { describe, test, expect } from '@jest/globals';
import { ProjectMemoryServer } from '../src/server.js';
import { ServerOptions } from '../src/types.js';

describe('ProjectMemoryServer', () => {
  test('should be importable', () => {
    expect(ProjectMemoryServer).toBeDefined();
    expect(typeof ProjectMemoryServer).toBe('function');
  });

  test('should be constructable with basic options', () => {
    const options: ServerOptions = {
      projectRoot: '/test/project',
      memoryDir: '.project_memory',
      verbose: false
    };

    expect(() => {
      new ProjectMemoryServer(options);
    }).not.toThrow();
  });

  test('should have expected methods', () => {
    const options: ServerOptions = {
      projectRoot: '/test/project',
      memoryDir: '.project_memory',
      verbose: false
    };

    const server = new ProjectMemoryServer(options);
    
    expect(typeof server.start).toBe('function');
  });
});
