import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Listen on all interfaces for GitHub Codespaces
    port: 5173,
    strictPort: false,
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    sourcemap: false,
    chunkSizeWarningLimit: 600, // Increase limit to 600KB to reduce warnings
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('react-router') || id.includes('scheduler')) {
              return 'react-vendor';
            }
            if (id.includes('framer-motion') || id.includes('react-colorful') || id.includes('lucide-react')) {
              return 'ui-vendor';
            }
            if (id.includes('openai') || id.includes('@supabase')) {
              return 'api-vendor';
            }
            return 'vendor';
          }

          if (
            id.includes('components/ActionFigure') ||
            id.includes('components/MusicStar') ||
            id.includes('components/TVShow') ||
            id.includes('components/Wrestling') ||
            id.includes('components/Retro') ||
            id.includes('components/Unified') ||
            id.includes('components/Enhanced') ||
            id.includes('components/Cartoon') ||
            id.includes('components/Ghibli') ||
            id.includes('components/AIImage') ||
            id.includes('components/EnhancedImageEditor') ||
            id.includes('components/Meme') ||
            id.includes('components/GifEditor')
          ) {
            return 'generators';
          }
          if (id.includes('components/admin')) {
            return 'admin';
          }
        }
      }
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});