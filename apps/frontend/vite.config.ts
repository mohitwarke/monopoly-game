import { defineConfig } from 'vite';
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
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:4000',
        ws: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});