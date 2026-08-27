import { copyFileSync } from 'node:fs'
import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin, type ProxyOptions } from 'vite'

const proxy: Record<string, ProxyOptions> = {
  '/proxy/api': {
    target: 'https://api.geonet.org.nz',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/proxy\/api/, ''),
  },
  '/proxy/images': {
    target: 'https://images.geonet.org.nz',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/proxy\/images/, ''),
  },
  '/proxy/tilde': {
    target: 'https://tilde.geonet.org.nz',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/proxy\/tilde/, ''),
  },
  '/proxy/nrt': {
    target: 'https://service-nrt.geonet.org.nz',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/proxy\/nrt/, ''),
  },
  '/proxy/fdsn': {
    target: 'https://service.geonet.org.nz',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/proxy\/fdsn/, ''),
  },
}

function githubPages404(): Plugin {
  return {
    name: 'github-pages-404',
    closeBundle() {
      try {
        copyFileSync(resolve('dist/index.html'), resolve('dist/404.html'))
      } catch {
        // ignore if dist is not ready
      }
    },
  }
}

export default defineConfig({
  base: './',
  plugins: [react(), githubPages404()],
  server: {
    port: 5173,
    host: true,
    proxy,
  },
  preview: {
    port: 5173,
    host: true,
    proxy,
  },
})
