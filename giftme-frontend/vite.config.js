import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Keep artwork as real, cacheable files instead of inlining it into the JS
    // bundle as data URIs. Only tiny assets (icons, the QR tag) get inlined.
    assetsInlineLimit: 1024,
  },
})
