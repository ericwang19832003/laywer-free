import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['src/lib/ai/agent/integration/**/*.test.ts'],
    testTimeout: 60_000,
    hookTimeout: 30_000,
    setupFiles: ['src/lib/ai/agent/integration/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
