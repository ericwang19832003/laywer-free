import { defineConfig } from 'vitest/config'
import { loadEnv } from 'vite'
import path from 'path'

// Load all .env.local (and .env.test.local) vars into process.env so they're
// available in setupFiles and tests running in the node environment.
const env = loadEnv('test', process.cwd(), '')

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['src/lib/ai/agent/integration/**/*.test.ts'],
    testTimeout: 60_000,
    hookTimeout: 30_000,
    setupFiles: ['src/lib/ai/agent/integration/setup.ts'],
    env,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
