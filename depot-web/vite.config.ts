import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['/data/index.json'],
      manifest: {
        name: 'depot',
        short_name: 'depot',
        description:
          'depot is a free and open-source Warhammer: 40,000 companion app powered by Wahapedia!',
        theme_color: '#EA7317',
        background_color: '#EA7317',
        icons: [
          {
            src: '/android-icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/android-icon.png',
            sizes: '1024x1024',
            type: 'image/png'
          }
        ]
      }
    })
  ]
});
