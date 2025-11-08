import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: [
      'src/**/*.{test,spec}.{js,jsx,ts,tsx}',
      'convex/**/*.{test,spec}.{js,ts}',
      '**/__tests__/**/*.{js,jsx,ts,tsx}',
    ],
    exclude: [
      'node_modules',
      '.next',
      'convex/_generated',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/**/*.d.ts',
        'src/**/*.stories.{js,jsx,ts,tsx}',
        'src/**/__tests__/**',
        'convex/__tests__/**',
        'convex/_generated/**',
        '**/*.config.{js,ts}',
        '**/mockData/**',
      ],
      thresholds: {
        branches: 30,
        functions: 30,
        lines: 30,
        statements: 30,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});


