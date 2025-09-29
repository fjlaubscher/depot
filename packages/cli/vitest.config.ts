import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    pool: 'threads',
    minWorkers: 1,
    maxWorkers: 1,
    include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    coverage: {
      enabled: false
    }
  }
});
