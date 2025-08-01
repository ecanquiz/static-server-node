import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import mockFs from 'mock-fs';
import writeFilesToDisk from '../writeFilesToDisk';

describe('writeFilesToDiskMockFs', () => {
  const testDir = '/test-dir';
  let mockImageNames: string[];

  beforeEach(() => {
    // Configure mock-fs
    mockFs({
      './test-dir': {} // Empty directory
    });

    mockImageNames = [];
    vi.mock('uuid', () => ({
      v4: vi.fn(() => 'mocked-uuid')
    }));
  });

  afterEach(() => {
    mockFs.restore(); // Use restore() instead of reset()
    vi.clearAllMocks();
  });

  it('escribe archivo PNG y actualiza imageNames', () => {
    const testBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==';

    writeFilesToDisk(testBase64, testDir, mockImageNames);

    // Check with the mocked filesystem
    const fs = require('fs');
    const files = fs.readdirSync(`.${testDir}`);
    expect(files).toEqual(['mocked-uuid.png']);
    
    expect(mockImageNames).toEqual(['mocked-uuid.png']);
  });

  it('no escribe archivo si el base64 es inválido', () => {
    writeFilesToDisk('invalid-data', testDir, mockImageNames);
    
    const fs = require('fs');
    expect(fs.readdirSync(`.${testDir}`)).toEqual([]);
    expect(mockImageNames).toEqual([]);
  });
});

