import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  envPrefix: ['VITE_', 'REACT_APP_'],
  resolve: {
    alias: {
      '@app': path.resolve(__dirname, 'src/app'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@widgets': path.resolve(__dirname, 'src/widgets'),
      '@features': path.resolve(__dirname, 'src/features'),
      '@entities': path.resolve(__dirname, 'src/entities'),
      '@shared': path.resolve(__dirname, 'src/shared'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
  build: {
    modulePreload: false,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replace(/\\/g, '/');
          if (
            normalizedId.includes('node_modules/.vite/deps/react') ||
            normalizedId.includes('node_modules/react/') ||
            normalizedId.includes('node_modules/react-dom/') ||
            normalizedId.includes('node_modules/react-router-dom/')
          ) {
            return 'react';
          }
          if (!normalizedId.includes('node_modules')) return undefined;
          if (normalizedId.includes('node_modules/@reduxjs/') || normalizedId.includes('node_modules/react-redux/')) return 'redux';
          if (normalizedId.includes('node_modules/d3') || normalizedId.includes('node_modules/internmap/') || normalizedId.includes('node_modules/delaunator/') || normalizedId.includes('node_modules/robust-predicates/')) return 'd3';
          return undefined;
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    environmentOptions: {
      jsdom: {
        url: 'http://localhost:3000/',
      },
    },
    globals: true,
  },
})
