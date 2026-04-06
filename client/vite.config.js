import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Ensures assets are loaded relative to index.html
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3030',
        changeOrigin: true
      }
    }
  }
})
