import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import { githubProxyPlugin } from './vite-github-proxy';

export default defineConfig({
  plugins: [
    react(),
    githubProxyPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: false,
      },
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'MyOrganizer — Mestrado',
        short_name: 'MyOrganizer',
        description: 'Organizador pessoal para o mestrado em Engenharia Informática',
        theme_color: '#6366f1',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Não cachear Firestore — os canais realtime/long-polling falham com SW
        navigateFallbackDenylist: [/^\/api\//],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
