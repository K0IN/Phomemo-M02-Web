import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'

function getBaseUrl() {
    if (!process.env.APP_BASE_URL) {
        return '/';
    }

    return process.env.APP_BASE_URL.endsWith('/')
        ? process.env.APP_BASE_URL
        : process.env.APP_BASE_URL + '/';
}

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        vue({}),
        tailwindcss(),
        vueDevTools(),
        VitePWA({
            registerType: 'autoUpdate',
            workbox: {
                clientsClaim: true,
                skipWaiting: true,
            },

            devOptions: {
                enabled: true
            },
            injectRegister: 'auto',
            filename: 'sw.js',
            manifest: {
                name: 'Phomemo Printer',
                short_name: 'Phomemo',
                description: 'Print images with your Phomemo M02 printer',
                theme_color: '#ffffff',
                start_url: getBaseUrl(),
                display: 'standalone',
                scope: getBaseUrl(),
                file_handlers: [
                    {
                        action: getBaseUrl() + 'file-handler',
                        accept: {
                            'image/*': [
                                '.jpg', '.jpeg',
                                '.png', '.gif',
                                '.webp', '.bmp',
                                '.tiff', '.svg'
                            ],
                        }
                    }
                ],
                icons: [
                    {
                        src: 'favicon.svg',
                        sizes: '192x192',
                        type: 'image/svg+xml',
                        purpose: 'any'
                    }
                ]
            },
            includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'masked-icon.svg'],
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
