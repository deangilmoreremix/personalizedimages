import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
  esbuild: {
    // Handle TypeScript imports in tests
    loader: 'tsx',
    include: /\.(ts|tsx|js|jsx)$/,
  },
  optimizeDeps: {
    // Ensure TypeScript files are properly handled
    include: ['**/*.ts', '**/*.tsx'],
  },
});