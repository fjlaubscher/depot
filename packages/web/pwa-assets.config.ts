import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

export default defineConfig({
  preset: {
    ...minimal2023Preset,
    maskable: {
      sizes: [512],
      resizeOptions: {
        background: '#ff6900', // Match your theme color
        fit: 'contain'
      }
    }
  },
  images: ['public/depot.svg']
})