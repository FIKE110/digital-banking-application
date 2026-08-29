import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://ec2-16-16-169-107.eu-north-1.compute.amazonaws.com',
        changeOrigin: true,
      },
    },
  },
})
