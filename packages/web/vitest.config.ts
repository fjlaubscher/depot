/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  resolve: { tsconfigPaths: true },
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
    ]
  }
});
