import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  // Em produção (GitHub Pages) o site fica em /metro/. Em dev, base '/'.
  const base = command === 'build' ? '/metro/' : '/'
  return {
    base,
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png'],
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,woff2,json}'],
        },
        manifest: {
          name: 'Rede Metroferroviária SP',
          short_name: 'Metrô SP',
          description: 'Visualizador da rede de metrô e trens de São Paulo',
          lang: 'pt-BR',
          start_url: '.',
          scope: base,
          display: 'standalone',
          background_color: '#ffffff',
          theme_color: '#0455a1',
          icons: [
            { src: 'icons/pwa-192.png', sizes: '192x192', type: 'image/png' },
            { src: 'icons/pwa-512.png', sizes: '512x512', type: 'image/png' },
            {
              src: 'icons/pwa-512-maskable.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }
})
