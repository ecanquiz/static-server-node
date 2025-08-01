import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { writeFileSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import writeFilesToDisk from '../writeFilesToDisk';

// Mock dependencies
vi.mock('uuid');
vi.mock('fs');

describe('writeFilesToDisk', () => {
  const testDir = '/test-dir';
  let mockImageNames: string[];

  beforeEach(() => {
    mockImageNames = [];
    
    // Configure mocks
    (uuidv4 as Mock).mockReturnValue('mocked-uuid');
    (writeFileSync as Mock).mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('escribe archivo PNG y actualiza imageNames', () => {
    const testBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==';

    writeFilesToDisk(testBase64, testDir, mockImageNames);

    // Verify call to writeFileSync
    expect(writeFileSync).toHaveBeenCalledWith(
      './test-dir/mocked-uuid.png',
      expect.any(Buffer)
    );
    
    // Verify updated array
    expect(mockImageNames).toEqual(['mocked-uuid.png']);
  });

  it('no escribe archivo si el base64 es inválido', () => {
    writeFilesToDisk('invalid-data', testDir, mockImageNames);
    
    expect(writeFileSync).not.toHaveBeenCalled();
    expect(mockImageNames).toEqual([]);
  });

  it('maneja correctamente formato JPG', () => {
    const testBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRg...';

    writeFilesToDisk(testBase64, testDir, mockImageNames);

    expect(writeFileSync).toHaveBeenCalledWith(
      './test-dir/mocked-uuid.jpeg',
      expect.any(Buffer)
    );
  });
});