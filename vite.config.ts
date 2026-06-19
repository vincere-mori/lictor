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
            strategies: 'injectManifest',
            srcDir: 'src',
            filename: 'sw.ts',
            registerType: 'autoUpdate',
            includeAssets: ['icon.svg'],
            injectManifest: { globPatterns: ['**/*.{js,css,html,svg,woff2}'] },
            manifest: {
              name: 'Lictor',
              short_name: 'Lictor',
              description: 'Агрессивный менеджер напоминаний',
              lang: 'ru',
              theme_color: '#16130d',
              background_color: '#16130d',
              display: 'standalone',
              start_url: '/lictor/',
              scope: '/lictor/',
              icons: [{ src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }]
            }
          })
        ])
  ]
}))
