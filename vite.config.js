import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// In development the gallery admin talks to PHP (public/api/gallery.php).
// Run `npm run php` alongside `npm run dev` and these paths are forwarded to it.
const php = 'http://localhost:8000'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': php,
      '/uploads': php,
    },
  },
})
