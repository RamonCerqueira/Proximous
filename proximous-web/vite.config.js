import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const chunkGroups = [
  { name: 'react', packages: ['react', 'react-dom', 'react-router-dom'] },
  { name: 'motion', packages: ['framer-motion', 'motion-dom'] },
  { name: 'maps', packages: ['leaflet', 'react-leaflet'] },
  { name: 'charts', packages: ['recharts'] },
  { name: 'emoji', packages: ['emoji-picker-react'] },
  { name: 'icons', packages: ['lucide-react'] },
  { name: 'forms', packages: ['react-hook-form', '@hookform/resolvers', 'zod'] },
  { name: 'ui', packages: ['@radix-ui'] },
  { name: 'realtime', packages: ['socket.io-client', 'engine.io-client'] },
]

const getPackageChunk = (id) => {
  if (!id.includes('node_modules')) return undefined

  const normalizedId = id.replace(/\\/g, '/')
  const group = chunkGroups.find(({ packages }) =>
    packages.some((packageName) => normalizedId.includes(`/node_modules/${packageName}/`))
  )

  return group?.name || 'vendor'
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: getPackageChunk,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
