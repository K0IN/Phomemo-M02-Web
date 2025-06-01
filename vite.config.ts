import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        vue({}),
        tailwindcss(),
        vueDevTools(),
        VitePWA({
            registerType: 'autoUpdate', workbox: {
                clientsClaim: true,
                skipWaiting: true
            },
            // devOptions: {
            //     enabled: true
            // },
            injectRegister: 'auto',
            filename: 'sw.js',
            manifest: {
                name: 'My Vue App',
                short_name: 'VueApp',
                description: 'A Vue.js application with PWA support',
                theme_color: '#ffffff',
            },
            includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
            srcDir: 'src',
            minify: true,
        })
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        },
    },
    base: process.env.APP_BASE_URL || undefined,
})
