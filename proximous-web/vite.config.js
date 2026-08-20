import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
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
  }
})
