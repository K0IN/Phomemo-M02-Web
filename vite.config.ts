import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'

function getBaseUrl() {
    // Use '/' for development, '/Phomemo-M02-Web/' for production (e.g., GitHub Pages)
    if (process.env.NODE_ENV === 'production') {
        return '/Phomemo-M02-Web/';
    }
    return '/';
}

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        vue({}),
        tailwindcss(),
        vueDevTools(),
        VitePWA({
            registerType: 'autoUpdate',
            strategies: 'injectManifest',

            injectRegister: 'auto',
            srcDir: 'src',
            filename: 'serviceworker.ts',

            devOptions: {
                enabled: true,
                type: 'module',
            },

            manifest: {
                name: 'Phomemo Printer',
                short_name: 'Phomemo',
                description: 'Print images with your Phomemo M02 printer',
                theme_color: '#ffffff',
                start_url: process.env.NODE_ENV === 'production' ? '/Phomemo-M02-Web/' : '/',
                display: 'standalone',
                scope: process.env.NODE_ENV === 'production' ? '/Phomemo-M02-Web/' : '/',
                orientation: 'portrait',
                //  protocol_handlers
                share_target: {
                    action: (process.env.NODE_ENV === 'production' ? '/Phomemo-M02-Web/' : '/') + 'share-target',
                    method: 'POST',
                    enctype: 'multipart/form-data',
                    params: {
                        files: [
                            {
                                name: 'image',
                                accept: ['image/*', '.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.svg']
                            }
                        ]
                    }
                },
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
            minify: true,

        })
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        },
    },
    base: getBaseUrl(),
})
