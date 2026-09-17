import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: '行程管家',
        short_name: '行程管家',
        description: '个人待办与黄历',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icons/app-icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/app-icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.(tcb|tencentcloudapi)\.com\/.*/,
            handler: 'NetworkFirst',
            options: { cacheName: 'cloudbase-api', networkTimeoutSeconds: 5 },
          },
        ],
      },
    }),
  ],
})
