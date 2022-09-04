import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'wahapedia.json'],
      manifest: {
        name: 'depot',
        short_name: 'depot',
        description:
          'depot is a free and open-source Warhammer: 40,000 companion app powered by Wahapedia!',
        theme_color: '#2a4747',
        icons: [
          {
            src: '/android-icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            density: '4.0'
          }
        ]
      }
    })
  ]
});
