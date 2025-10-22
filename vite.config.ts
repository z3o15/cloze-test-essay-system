import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dns from 'node:dns'

// 修复localhost解析问题
dns.setDefaultResultOrder('verbatim')

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: './',
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: false,
    hmr: {
      port: 5173,
      host: '127.0.0.1'
    },
    proxy: {
      // API代理配置
      '/api': {
        target: 'http://localhost:3000',
        // 在本地开发时，Vercel Serverless Functions无法直接访问
        // 这里使用rewrite将请求重定向到实际的API目录
        rewrite: (path) => path.replace(/^\/api/, '/api'),
        changeOrigin: true
      }
    }
  },
  define: {
    // 显式定义Vue feature flags以避免警告
    __VUE_OPTIONS_API__: false,
    __VUE_PROD_DEVTOOLS__: false,
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        entryFileNames: `[name].[hash].js`,
        chunkFileNames: `[name].[hash].js`,
        assetFileNames: `[name].[hash].[ext]`
      }
    }
  }
})
