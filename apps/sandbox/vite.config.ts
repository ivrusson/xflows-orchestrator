import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@xflows/core': resolve(__dirname, '../../packages/core/dist'),
      '@xflows/plugin-react': resolve(__dirname, '../../packages/plugin-react/dist'),
      '@xflows/plugin-http': resolve(__dirname, '../../packages/plugin-http/dist'),
      '@xflows/plugins': resolve(__dirname, '../../packages/plugins/dist'),
      '@xflows/renderer-core': resolve(__dirname, '../../packages/renderer-core/dist'),
      '@examples': resolve(__dirname, '../../examples'),
      'components': resolve(__dirname, './components')
    }
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
