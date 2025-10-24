import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

export default defineConfig({
  preset: {
    ...minimal2023Preset,
    transparent: {
      ...minimal2023Preset.transparent,
      resizeOptions: {
        background: '#ff6900',
        fit: 'contain'
      }
    },
    apple: {
      ...minimal2023Preset.apple,
      resizeOptions: {
        background: '#ff6900',
        fit: 'contain'
      }
    },
    maskable: {
      ...minimal2023Preset.maskable,
      sizes: [512],
      resizeOptions: {
        background: '#ff6900', // Match your theme color
        fit: 'contain'
      }
    }
  },
  images: ['public/depot.svg']
})
