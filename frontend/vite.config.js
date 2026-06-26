import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth':        'http://localhost:8000',
      '/user':        'http://localhost:8000',
      '/activities':  'http://localhost:8000',
      '/log':         'http://localhost:8000',
      '/stats':       'http://localhost:8000',
      '/ml':          'http://localhost:8000',
      '/api':         'http://localhost:8000',
    }
  }
})
