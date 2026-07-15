import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5056',
      '/login': 'http://localhost:5056',
      '/teacher': 'http://localhost:5056',
      '/teachers': 'http://localhost:5056',
      '/classes': 'http://localhost:5056',
      '/students': 'http://localhost:5056',
      '/attendance': 'http://localhost:5056',
      '/reports': 'http://localhost:5056',
      '/google-sheet': 'http://localhost:5056',
      '/teaching-plans': 'http://localhost:5056'
    }
  }
})
