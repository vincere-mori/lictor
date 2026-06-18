import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {}
const cap = env.LICTOR_TARGET === 'cap'

export default defineConfig(({ command }) => ({
  base: cap ? './' : command === 'build' ? '/lictor/' : '/',
  plugins: [
    react(),
    ...(cap
      ? []
      : [
          VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['icon.svg'],
            workbox: { globPatterns: ['**/*.{js,css,html,svg,woff2}'] },
            manifest: {
              name: 'Lictor',
              short_name: 'Lictor',
              description: 'Агрессивный менеджер напоминаний',
              lang: 'ru',
              theme_color: '#100f0c',
              background_color: '#100f0c',
              display: 'standalone',
              start_url: '/lictor/',
              scope: '/lictor/',
              icons: [{ src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }]
            }
          })
        ])
  ]
}))
