import { ref } from 'vue'
import { defineStore } from 'pinia'
import { convertImageWorker } from '@/worker/client';
import type { ImageConversionOptions, PrinterImage } from '@/logic/printerimage';



export const useImageConvertersStore = defineStore('image-converter', () => {
    const abortController = ref<AbortController | null>(null);
    const convertImageWorkerFn = convertImageWorker();

    async function convertImage(image: ImageBitmap, outputWidthPixel: number, options: ImageConversionOptions): Promise<PrinterImage> {
        abortController.value?.abort()
        const localController = new AbortController();
        abortController.value = localController;
        const optionsPlain = JSON.parse(JSON.stringify(options));
        const startTime = performance.now();
        const result = await convertImageWorkerFn(image, outputWidthPixel, optionsPlain);
        if (localController) {
            localController.signal.throwIfAborted();
        }
        const endTime = performance.now();
        console.log(`Image conversion took ${endTime - startTime} ms`);
        if (result.width !== outputWidthPixel) {
            console.warn(`Image conversion width mismatch: expected ${outputWidthPixel}, got ${result.width}`);
        }
        return result;
    }

    return { convertImage };
})

