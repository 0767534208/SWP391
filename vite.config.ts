import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    cors: true,
    proxy: {
      '/api': {
        target: 'https://localhost:7084',
        changeOrigin: true,
        secure: false
      },
      '/Question': {
        target: 'https://localhost:7084',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => `/api${path}`
      },
      '/Message': {
        target: 'https://localhost:7084',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => `/api${path}`
      }
    }
  }
})
