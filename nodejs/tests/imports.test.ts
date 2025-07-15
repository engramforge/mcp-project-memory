import { describe, test, expect } from '@jest/globals';

describe('index module', () => {
  test('should import types successfully', async () => {
    const typesModule = await import('../src/types.js');
    expect(typesModule).toBeDefined();
  });

  test('should import memory manager successfully', async () => {
    const memoryModule = await import('../src/memory-manager.js');
    expect(memoryModule.MemoryManager).toBeDefined();
  });

  test('should import server successfully', async () => {
    const serverModule = await import('../src/server.js');
    expect(serverModule.ProjectMemoryServer).toBeDefined();
  });
});
