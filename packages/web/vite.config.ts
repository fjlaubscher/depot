import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import tsconfigPaths from 'vite-tsconfig-paths';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import { getAppBasePath, getViteBasePath } from './src/utils/paths';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const enableSentryUpload =
    !!env.SENTRY_AUTH_TOKEN &&
    !!env.SENTRY_ORG &&
    !!env.SENTRY_PROJECT &&
    !!env.VITE_SENTRY_RELEASE;

  const basePath = getAppBasePath(env.VITE_APP_BASE_PATH);
  const urlPrefix = basePath ? `~${basePath}/` : '~/';

  const distPath = resolve(process.cwd(), 'dist');

  const plugins = [
    tsconfigPaths(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.ico',
        'apple-touch-icon-180x180.png',
        'mask-icon.svg',
        'images/depot-hero.jpg'
      ],
      manifest: {
        name: 'depot',
        short_name: 'depot',
        description:
          'depot is a free and open-source Warhammer: 40,000 companion app powered by Wahapedia!',
        theme_color: '#ff6900',
        background_color: '#ff6900',
        display: 'standalone',
        scope: './',
        start_url: './',
        icons: [
          {
            src: 'pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png'
          },
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        shortcuts: [
          {
            name: 'Collections',
            short_name: 'Collections',
            url: '/collections',
            icons: [
              {
                src: 'pwa-192x192.png',
                sizes: '192x192',
                type: 'image/png'
              }
            ]
          },
          {
            name: 'Factions',
            short_name: 'Factions',
            url: '/factions',
            icons: [
              {
                src: 'pwa-192x192.png',
                sizes: '192x192',
                type: 'image/png'
              }
            ]
          },
          {
            name: 'Rosters',
            short_name: 'Rosters',
            url: '/rosters',
            icons: [
              {
                src: 'pwa-192x192.png',
                sizes: '192x192',
                type: 'image/png'
              }
            ]
          }
        ]
      }
    })
  ];

  if (enableSentryUpload) {
    plugins.push(
      sentryVitePlugin({
        org: env.SENTRY_ORG,
        project: env.SENTRY_PROJECT,
        authToken: env.SENTRY_AUTH_TOKEN,
        release: { name: env.VITE_SENTRY_RELEASE },
        sourcemaps: {
          assets: [distPath],
          rewriteSources: (source) => `${urlPrefix}${source}`
        }
      })
    );
  }

  return {
    base: getViteBasePath(env.VITE_APP_BASE_PATH),
    plugins,
    build: {
      sourcemap: enableSentryUpload
    }
  };
});
