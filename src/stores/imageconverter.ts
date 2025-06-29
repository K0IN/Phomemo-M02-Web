import { ref } from 'vue'
import { defineStore } from 'pinia'
import { convertImageWorker } from '@/worker/client';
import type { ImageConversionOptions, PrinterImage } from '@/logic/printerimage';

import { $init, runme } from 'image-converter-wasm';



export const useImageConvertersStore = defineStore('image-converter', () => {
    const abortController = ref<AbortController | null>(null);
    const convertImageWorkerFn = convertImageWorker();
    console.log(`Image converter worker function initialized:`, convertImageWorkerFn);
    async function convertImage(image: ImageBitmap, outputWidthPixel: number, options: ImageConversionOptions): Promise<PrinterImage> {
        console.log(`Converting image with width ${image.width} and height ${image.height} to ${outputWidthPixel} pixels wide with options:`, options);

        console.log(`Converting image to bits with options:`, options);
        await $init;
        console.log(`Awaited wasm initialization`);
        runme();
        console.log(`Wasm runme completed`);

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

