import { defineConfig } from 'vitest/config'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  test: {
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
    environment: 'node',
    setupFiles: ['./testSetup.ts'],
    include: [
      'src/**/*.test.ts',
      'src/**/*.spec.ts'
    ],
    exclude: [
      '**/dist/**',
      '**/node_modules/**'
    ]
  },
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, './src') },
      { find: '@config', replacement: path.resolve(__dirname, './src/config') },
      { find: '@controllers', replacement: path.resolve(__dirname, './src/controllers') },
      { find: '@middlewares', replacement: path.resolve(__dirname, './src/middlewares') },
      { find: '@routes', replacement: path.resolve(__dirname, './src/routes') },
      { find: '@utils', replacement: path.resolve(__dirname, './src/utils') },
      { find: '@public', replacement: path.resolve(__dirname, './public') }
    ]
  }
})
