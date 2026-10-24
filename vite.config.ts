import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const base = mode === 'pages' ? '/gyopo/' : '/'
  return {
  base,
  plugins: [react(), VitePWA({
    strategies: 'injectManifest', srcDir: 'src', filename: 'sw.ts', registerType: 'prompt',
    injectRegister: false,
    manifest: {
      name: 'Gyopo Korean Practice', short_name: 'Gyopo', description: 'Quiet, offline Korean drills.',
      start_url: base, scope: base, display: 'standalone', orientation: 'portrait-primary',
      background_color: '#f8f4ec', theme_color: '#f8f4ec',
      icons: [
        { src: `${base}pwa-192x192.png`, sizes: '192x192', type: 'image/png' },
        { src: `${base}pwa-512x512.png`, sizes: '512x512', type: 'image/png' },
        { src: `${base}maskable-icon-512x512.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' }
      ]
    },
    injectManifest: { globPatterns: ['**/*.{js,css,html,png,svg,webmanifest}'] },
    devOptions: { enabled: true, type: 'module' }
  })],
  test: { environment: 'jsdom', setupFiles: ['./src/test/setup.ts'] }
  }
})
