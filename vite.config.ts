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
          'utils': ['date-fns', 'framer-motion', 'lucide-react'],
          // Note: syntax-highlighter and tiktoken are now dynamically imported
          // They will be separate lazy chunks that only load when needed
        },
      },
    },
  },
})
