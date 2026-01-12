import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    exclude: ['**/node_modules/**', '**/e2e/**', '**/.git/**'],
    fileParallelism: false,
    watch: false,
    testTimeout: 10000,
    hookTimeout: 10000,
    teardownTimeout: 5000,
    env: {
      DATABASE_URL:
        'postgresql://postgres:postgres@localhost:5432/db_vocab_hero_test?schema=public',
    },
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.config.*',
        '**/*.d.ts',
        '**/types/',
        '.next/',
        'e2e/',
      ],
      thresholds: {
        lines: 78,
        functions: 78,
        branches: 78,
        statements: 78,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
    },
  },
});
