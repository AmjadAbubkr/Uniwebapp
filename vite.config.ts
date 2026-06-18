import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/Uniwebapp/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
  registerType: 'autoUpdate',
  manifest: {
        name: 'Université Roi Fayçal',
        short_name: 'URF',
        description: 'Système de Gestion des Notes et Étudiants',
        start_url: '/Uniwebapp/',
        display: 'standalone',
        background_color: '#092a1e',
        theme_color: '#067647',
        orientation: 'portrait',
        icons: [
          {
            src: '/Uniwebapp/assets/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/Uniwebapp/assets/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/Uniwebapp/assets/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api',
              expiration: { maxEntries: 50, maxAgeSeconds: 300 },
              networkTimeoutSeconds: 10
            }
          }
        ]
      }
    })
  ],
})

