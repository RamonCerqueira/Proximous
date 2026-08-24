import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: true,
    allowedHosts: ['proximous.genioplay.com.br', '153.75.244.238', 'localhost', '127.0.0.1']
  },
  preview: {
    host: true,
    port: 8701,
    allowedHosts: ['proximous.genioplay.com.br', '153.75.244.238', 'localhost', '127.0.0.1']
  },
  build: {
    chunkSizeWarningLimit: 1200
  }
})
