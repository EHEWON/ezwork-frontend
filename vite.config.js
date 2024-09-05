import { defineConfig,loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    return {
        plugins: [vue()],
        resolve: {
            alias: {
              '@': path.resolve(__dirname, './src'),
              '@assets': path.resolve(__dirname, './src/assets'),
            },
        },
        base: './',
        build:{
            assetsDir:"static",
            publicPath: mode === 'demo' ? '/ezwork-frontend/' : '/'
        }
    }
})
