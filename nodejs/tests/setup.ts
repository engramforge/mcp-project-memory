import { jest } from '@jest/globals';
import * as path from 'path';
import * as os from 'os';

// Mock fs-extra module
jest.mock('fs-extra', () => ({
  ensureDir: jest.fn(),
  readFile: jest.fn(),
  writeFile: jest.fn(),
  pathExists: jest.fn(),
  readJSON: jest.fn(),
  writeJSON: jest.fn(),
  mkdtemp: jest.fn(),
  remove: jest.fn(),
  writeJson: jest.fn(),
}));

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

// Global test helpers
declare global {
  var createTempDir: () => Promise<string>;
  var cleanupTempDir: (dirPath: string) => Promise<void>;
  var createTestProjectStructure: (rootDir: string, projectType?: string) => Promise<void>;
}

// Create temporary directory for tests
global.createTempDir = async (): Promise<string> => {
  const fs = await import('fs-extra');
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'project-memory-test-'));
  return tempDir;
};

// Cleanup temporary directory
global.cleanupTempDir = async (dirPath: string): Promise<void> => {
  const fs = await import('fs-extra');
  if (await fs.pathExists(dirPath)) {
    await fs.remove(dirPath);
  }
};

// Create test project structure
global.createTestProjectStructure = async (rootDir: string, projectType: string = 'nodejs'): Promise<void> => {
  const fs = await import('fs-extra');
  await fs.ensureDir(rootDir);
  
  switch (projectType) {
    case 'nodejs':
      await fs.writeJson(path.join(rootDir, 'package.json'), {
        name: 'test-project',
        version: '1.0.0',
        main: 'index.js'
      });
      break;
    case 'python':
      await fs.writeFile(path.join(rootDir, 'requirements.txt'), 'flask==2.0.0\n');
      break;
    case 'rust':
      await fs.writeFile(path.join(rootDir, 'Cargo.toml'), '[package]\nname = "test-project"\nversion = "0.1.0"\n');
      break;
    case 'docker':
      await fs.writeFile(path.join(rootDir, 'docker-compose.yml'), 'version: "3.8"\nservices:\n  app:\n    image: node:18\n');
      break;
  }
};

// Setup test environment
beforeEach(() => {
  jest.clearAllMocks();
});
