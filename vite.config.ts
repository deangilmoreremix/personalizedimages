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
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            if (id.includes('framer-motion') || id.includes('react-colorful') || id.includes('lucide-react')) {
              return 'ui-vendor';
            }
            if (id.includes('react-dnd') || id.includes('react-dropzone')) {
              return 'dnd-vendor';
            }
            if (id.includes('openai') || id.includes('@supabase')) {
              return 'api-vendor';
            }
            if (id.includes('gifshot') || id.includes('@resvg') || id.includes('react-player')) {
              return 'media-vendor';
            }
            return 'vendor';
          }

          // Feature-based chunks
          if (id.includes('components/ActionFigure') || id.includes('components/MusicStar') || id.includes('components/TVShow') || id.includes('components/Wrestling')) {
            return 'action-figures';
          }
          if (id.includes('components/Cartoon') || id.includes('components/Ghibli')) {
            return 'cartoon-ghibli';
          }
          if (id.includes('components/Meme') || id.includes('components/GifEditor')) {
            return 'meme-gif';
          }
          if (id.includes('components/AIImage') || id.includes('components/EnhancedImageEditor')) {
            return 'ai-image';
          }
          if (id.includes('components/admin') || id.includes('components/Auth')) {
            return 'admin-auth';
          }
        }
      }
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});