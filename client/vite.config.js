import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'https://crm-9i8x.onrender.com',
      '/login': 'https://crm-9i8x.onrender.com',
      '/teacher': 'https://crm-9i8x.onrender.com',
      '/teachers': 'https://crm-9i8x.onrender.com',
      '/classes': 'https://crm-9i8x.onrender.com',
      '/students': 'https://crm-9i8x.onrender.com',
      '/attendance': 'https://crm-9i8x.onrender.com',
      '/reports': 'https://crm-9i8x.onrender.com',
      '/google-sheet': 'https://crm-9i8x.onrender.com',
      '/teaching-plans': 'https://crm-9i8x.onrender.com'
    }
  }
})
