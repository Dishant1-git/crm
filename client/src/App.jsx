import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import AppRoutes from './routes/AppRoutes'

function App() {
  return (
    <BrowserRouter>
      {/* Toast notifications rendering container */}
      <Toaster 
        position="top-right"
        toastOptions={{
          className: 'font-sans text-sm font-semibold rounded-xl border border-slate-100 shadow-lg',
          success: {
            duration: 3000,
            style: {
              background: '#f0fdf4',
              color: '#16a34a',
            },
          },
          error: {
            duration: 4000,
            style: {
              background: '#fef2f2',
              color: '#dc2626',
            },
          },
        }}
      />
      
      {/* Declarative app routing */}
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
