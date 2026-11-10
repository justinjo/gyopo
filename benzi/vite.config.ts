import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const base = mode === 'pages' ? '/gyopo/benzi/' : '/benzi/'
  return {
  root: 'benzi',
  base,
  build: { outDir: '../dist/benzi', emptyOutDir: true },
  plugins: [react(), VitePWA({
    strategies: 'injectManifest', srcDir: 'src', filename: 'sw.ts', registerType: 'prompt',
    injectRegister: false,
    manifest: {
      name: 'Benzi Mandarin Practice', short_name: 'Benzi', description: 'Quiet, offline Mandarin drills.',
      start_url: base, scope: base, display: 'standalone', orientation: 'portrait-primary',
      background_color: '#f8f4ec', theme_color: '#f8f4ec',
      icons: [
        { src: `${base}pwa-192x192.png`, sizes: '192x192', type: 'image/png' },
        { src: `${base}pwa-512x512.png`, sizes: '512x512', type: 'image/png' },
        { src: `${base}maskable-icon-512x512.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' }
      ]
    },
    injectManifest: { globPatterns: ['**/*.{js,css,html,png,svg,webmanifest,wav,ogg,mp3,m4a}'] },
    devOptions: { enabled: true, type: 'module' }
  })],
  test: { environment: 'jsdom', setupFiles: ['./src/test/setup.ts'] }
  }
})
