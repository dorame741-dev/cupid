import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/pushinpay': {
        target: 'https://api.pushinpay.com.br',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/pushinpay/, ''),
      },
    },
  },
})
