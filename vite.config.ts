import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-components': ['framer-motion', 'react-colorful', 'classnames'],
          'dnd-vendor': ['react-dnd', 'react-dnd-html5-backend', 'react-dnd-touch-backend', 'react-dnd-multi-backend']
        }
      }
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});