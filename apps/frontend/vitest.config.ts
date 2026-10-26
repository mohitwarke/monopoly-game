import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@monopoly/shared': path.resolve(__dirname, '../../packages/shared/src'),
      '@monopoly/game-engine': path.resolve(__dirname, '../../packages/game-engine/src'),
      '@monopoly/rules-engine': path.resolve(__dirname, '../../packages/rules-engine/src'),
      '@monopoly/networking': path.resolve(__dirname, '../../packages/networking/src'),
      '@monopoly/modding': path.resolve(__dirname, '../../packages/modding/src'),
      '@monopoly/ui-components': path.resolve(__dirname, '../../packages/ui-components/src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/', '**/*.d.ts', '**/*.config.*', 'dist/'],
    },
    globals: true,
  },
});