/// <reference types="vitest" />
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    exclude: [
      'node_modules/**',
      'dist/**',
      'e2e/**',
      '**/e2e/**',
      '**/test-results/**',
      '**/playwright-report/**'
    ],
  }
})
