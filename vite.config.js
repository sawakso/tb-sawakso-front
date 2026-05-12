import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8880',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      // ✅ 修改：只代理 /chat/ 开头的接口请求，不代理页面路由 /chat
      '/chat/': {
        target: 'http://localhost:8881',
        changeOrigin: true,
        ws: true
        // 注意：不要 rewrite，保留 /chat 前缀
      }
    }
  }
})