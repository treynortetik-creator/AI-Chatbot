import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'markdown': ['react-markdown', 'remark-gfm'],
          'syntax-highlighter': ['react-syntax-highlighter'],
          'utils': ['date-fns', 'framer-motion', 'lucide-react'],
          // Note: tiktoken is now dynamically imported, so it will be a separate lazy chunk automatically
        },
      },
    },
  },
})
