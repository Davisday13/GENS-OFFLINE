import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      react: path.resolve(__dirname, 'node_modules', 'react'),
      'react-dom': path.resolve(__dirname, 'node_modules', 'react-dom'),
      'react/jsx-runtime': path.resolve(__dirname, 'node_modules', 'react', 'jsx-runtime.js'),
      'react/jsx-dev-runtime': path.resolve(__dirname, 'node_modules', 'react', 'jsx-dev-runtime.js'),
    },
  },
  optimizeDeps: {
    exclude: ['zustand'],
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
    fs: {
      allow: [
        path.resolve(__dirname, '..', '..', 'compartido'),
        path.resolve(__dirname),
      ],
    },
  },
});
