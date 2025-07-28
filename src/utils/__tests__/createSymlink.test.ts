import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import mockFs from 'mock-fs'
import createSymlink from '../createSymlink'

// Mock console to verify calls
const consoleMock = {
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
}

beforeEach(() => {
  // Mock filesystem and console
  global.console = consoleMock as any
  mockFs()
})

afterEach(() => {
  // Restore filesystem and clean mocks
  mockFs.restore()
  vi.restoreAllMocks()
})

describe('createSymlink', () => {
  it('Should create the storage directory if it doesnt exist.', async () => {
    const storageDir = '/storage'
    const publicLink = '/public/storage'

    createSymlink(storageDir, publicLink)

    // Verify that the directory was created
    expect(fs.existsSync(storageDir)).toBe(true)
    expect(console.log).toHaveBeenCalledWith('The storage folder was created')
  })

  it('Should create the symlink if it does not exist - way 1.', async () => {
    const storageDir = '/storage'
    const publicLink = '/public/storage'

    // Mock filesystem with basic structure
    mockFs({
      [storageDir]: {}, // Source directory exists
      '/public': {} // Parent directory of the link must exist
    })

    // Specifically mock symlinkSync to simulate success
    const symlinkSyncMock = vi.spyOn(fs, 'symlinkSync').mockImplementation(() => {
      // Simulate that the symlink was created
      mockFs({
        [storageDir]: {},
        '/public': {
          // Simulate that the symlink exists after creating it
          storage: mockFs.symlink({ path: storageDir })
        }
      })
    })

    createSymlink(storageDir, publicLink)

    // Verify that symlinkSync was called with the correct parameters
    expect(symlinkSyncMock).toHaveBeenCalledWith(
      storageDir,
      publicLink,
      'junction'
    )

    // Check the console.logs
    expect(console.log).toHaveBeenCalledWith('public/storage symlink created and points to storage')
  })

  it('Should create the symlink if it does not exist - way 2.', () => {
    const storageDir = '/storage';
    const publicLink = '/public/storage';

    // 1. Configure all necessary mocks
    vi.spyOn(fs, 'existsSync')
      .mockImplementation((path) => path === storageDir);

    const symlinkSyncMock = vi.spyOn(fs, 'symlinkSync')
      .mockImplementation(() => {});

    const consoleLogMock = vi.spyOn(console, 'log')
      .mockImplementation(() => {});

    // 2. Execute the function
    createSymlink(storageDir, publicLink);

    // 3. Verifications
    // Verify that symlinkSync was called
    expect(symlinkSyncMock).toHaveBeenCalledTimes(1);
    expect(symlinkSyncMock).toHaveBeenCalledWith(
      storageDir,
      publicLink,
      'junction'
    );

    // Check the console message
    expect(consoleLogMock).toHaveBeenCalledWith(
      'public/storage symlink created and points to storage'
    );
  });

  it('Should warn if public/storage exists but is not a symlink.', async () => {
    const storageDir = '/storage'
    const publicLink = '/public/storage'

    // Simulate regular file (no symlink)
    mockFs({
      [storageDir]: {},
      [publicLink]: 'contenido'
    })

    createSymlink(storageDir, publicLink)

    expect(console.warn).toHaveBeenCalledWith(
      'public/storage exists but is not a symlink.'
    )
  })

  it('Should handle errors appropriately', async () => {
    const storageDir = '/storage'
    const publicLink = '/public/storage'

    // Error de Forzar en symlinkSync
    vi.spyOn(fs, 'symlinkSync').mockImplementation(() => {
      throw new Error('Mocked error')
    })

    createSymlink(storageDir, publicLink)

    expect(console.error).toHaveBeenCalledWith(
      'Error creating symbolic link:',
      expect.any(Error))
  })
})
