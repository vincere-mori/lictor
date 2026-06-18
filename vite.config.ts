import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/lictor/' : '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
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
  ]
}))
