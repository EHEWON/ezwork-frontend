import { defineConfig,loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import path from 'path'
const resolve = (dir) => path.resolve(process.cwd(), dir)

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue(),createSvgIconsPlugin({
      // 指定需要缓存的图标文件夹
      iconDirs: [resolve('src/icons/svg')],
      // iconDirs: [path.resolve(process.cwd(), 'src/assets/icons')],
      // 指定symbolId格式
      symbolId: 'icon-[dir]-[name]'
    })],
    resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
          '@assets': path.resolve(__dirname, './src/assets'),
        },
    },
    build:{
        assetsDir:"static"
    }
})
