import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    // Keep Vitest's default ignores (node_modules, dist), then drop files that
    // are not real test suites. `exclude` only controls which files Vitest runs
    // as suites; these modules are still importable by other tests (e.g. the
    // shared test-utils helper), and cors.test.ts remains valid for `deno test`.
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      // Helper/demo files misnamed *.test.* (no standalone suite). test-utils
      // is imported by personalization-e2e.test.tsx; App.test.tsx is a demo.
      'src/App.test.tsx',
      'src/__tests__/test-utils.test.tsx',
      // Deno-only test (Deno.test + https ESM imports) that Vitest's ESM loader
      // rejects. Kept for `deno test`, excluded from the Vitest run.
      'supabase/functions/_shared/cors.test.ts',
    ],
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