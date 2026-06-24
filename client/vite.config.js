import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  define: {
    global: 'globalThis',
    'process.env.NODE_ENV': JSON.stringify('development'),
  },
  resolve: {
    alias: {
      events: 'events',
      stream: 'stream-browserify',
      buffer: 'buffer',
    },
  },
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8000',
      '/socket.io': {
        target: 'http://localhost:8000',
        ws: true,
      },
    },
  },
})
