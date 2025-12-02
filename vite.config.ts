import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Increase chunk size warning limit since we're aware of the large bundles
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'markdown': ['react-markdown', 'remark-gfm'],
          'syntax-highlighter': ['react-syntax-highlighter'],
          'utils': ['date-fns', 'framer-motion', 'lucide-react'],
          // Separate js-tiktoken into its own chunk as it's very large
          'tiktoken': ['js-tiktoken'],
        },
      },
    },
  },
})
