import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

const app = createApp(App);
app.use(createPinia());
app.mount('#app');

// function readImageFile(file: File): Promise<string> {
//     return new Promise((resolve, reject) => {
//         const reader = new FileReader();
//         const img = new Image();
//         reader.onload = (e) => {
//             img.src = e.target!.result as string;
//             img.onload = () => resolve(img.src);
//             img.onerror = () => reject(new Error('Failed to load image'));
//         };
//         reader.onerror = () => reject(new Error('Failed to read image file'));
//         reader.readAsDataURL(file);
//     });
// }
//
//
// navigator.serviceWorker.addEventListener('message', async (event) => {
//     if (event.data.type === 'image_shared') {
//         const file = event.data.file;
//         console.log('Received image file from service worker:', file.name, file.size, file.type, file);
//         const image = await readImageFile(file);
//         console.log('Image data URL:', image);
//     }
// });
