<script setup lang="ts">
import { ref, watch } from 'vue';

import { defaultImageConversionOptions, type PrinterImage } from './logic/printerimage.ts';

import { Printer } from 'lucide-vue-next';

import { Toaster } from '@/components/ui/sonner'
import 'vue-sonner/style.css'

import ImagePreview from './components/ImagePreview.vue';
import ImageDragAndDrop from './components/ImageDragAndDrop.vue';
import PrinterConnectionCard from './components/PrinterConnectionCard.vue';
import ImageConversionCard from './components/ImageConversionCard.vue';
import AppSettings from './components/AppSettings.vue';
import { getWorker } from './worker/client.ts';

// const isConnected = ref(false);
// const power = ref(0);
// const firmwareVersion = ref('');
// const serialNumber = ref(0);
// const paperState = ref(0);

const imageDataRef = ref<PrinterImage | null>(null);

const printerSizeWidth = 48 * 8; // 72 * 8 = 576;

//
// onMounted(async () => {
//     const image = await loadImageFromUrl('/800.png')
//     const imageData = convertImageToBits(image, printerSizeWidth);
//     imageDataRef.value = imageData;
// });

// async function connectToRouter() {
//     if (!imageDataRef.value) {
//         console.error('No image data available to print');
//         alert('Please load an image first.');
//         return;
//     }
//
//     const printer = new PhomemoPrinter();
//     try {
//         await printer.connect();
//         isConnected.value = true;
//         console.log('Connected to printer successfully');
//     } catch (error) {
//         console.error('Failed to connect to printer:', error);
//     }
//
//     power.value = await printer.getBatteryLevel();
//     firmwareVersion.value = await printer.getFirmwareVersion();
//     serialNumber.value = await printer.getSerialNumber();
//     paperState.value = await printer.getPaperState();
//
//
//     // await printer.resetPrinter();
//     // await printer.initializePrinter();
//     // await printer.alignCenter();
//     // await printer.printRasterBitImage(imageDataRef.value);
//     // await printer.printFeedLines(4);
//
// }

const imageConversionOptions = ref(defaultImageConversionOptions);
const imageRef = ref<HTMLImageElement | null>(null);
async function setImage(image: HTMLImageElement) {
    // imageDataRef.value = await convertImageToBits(image, printerSizeWidth, imageConversionOptions.value);
    imageRef.value = image;
}


// https://developer.mozilla.org/en-US/docs/Web/API/Window/createImageBitmap

const worker = getWorker();
let abortController: AbortController | null = null;
watch([imageRef, imageConversionOptions], async () => {
    if (!imageRef.value) return;
    if (abortController) {
        abortController.abort();
    }
    abortController = new AbortController();
    const localController = abortController;
    // Clear previous image data
    const image = await createImageBitmap(imageRef.value);
    // Convert options from proxy/ref to plain object
    const options = JSON.parse(JSON.stringify(imageConversionOptions.value));
    console.log('Image loaded:', image);
    try {
        localController.signal.throwIfAborted();
        const result = await worker(image, printerSizeWidth, options);
        // Convert the result to PrinterImage type
        localController.signal.throwIfAborted();
        imageDataRef.value = result;
    } catch (error) {
        // console.error('Error converting image:', error);
    }
});

</script>

<template>
    <main>
        <header class="app-header">
            <div class="app-header-titles">
                <h1 class="app-title">
                    <Printer class="printer-icon" />
                    Phomemo M02 Web Printer
                </h1>
                <p class="app-subtitle">Mobile Recipe Printer</p>
            </div>
            <div class="app-settings-corner">
                <AppSettings />
            </div>
        </header>
        <div class="settings-panel">
            <PrinterConnectionCard />
            <ImageDragAndDrop @imageLoaded="(image) => setImage(image)" />
            <ImageConversionCard @image-conversion-options-change="(options) => imageConversionOptions = options" />
        </div>
        <div class="preview-panel">
            <ImagePreview :image="imageDataRef" style="width: 100%;" />
        </div>
    </main>

    <!--
        <Button>Click me</Button>
        <Sheet>
            <SheetTrigger>Open</SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Are you absolutely sure?</SheetTitle>
                    <SheetDescription>
                        This action cannot be undone. This will permanently delete your account
                        and remove your data from our servers.
                    </SheetDescription>
                </SheetHeader>
            </SheetContent>
        </Sheet>

        <Button variant="outline" @click="() => {
            toast('Event has been created', {
                description: 'Sunday, December 03, 2023 at 9:00 AM',
                action: {
                    label: 'Undo',
                    onClick: () => console.log('Undo'),
                },
            })
        }">
            Add to calendar
        </Button>


        <button @click="connectToRouter">Connect to Router</button>
        <div v-if="isConnected">
            <p>Printer is connected.</p>
            <p>Power: {{ power }}</p>
            <p>Firmware Version: {{ firmwareVersion }}</p>
            <p>Serial Number: {{ serialNumber }}</p>
            <p>Paper State: {{ paperState }}</p>

        </div>

        <p v-else>Printer is not connected.</p>
        <div v-if="imageDataRef">
            <p>Image Data:</p>
            <p>Width: {{ imageDataRef.width }} px</p>
            <p>Height: {{ imageDataRef.height }} px</p>
            <p>Bits Length: {{ imageDataRef.bits.length }} bytes</p>
            <br>
            <ImagePreview :image="imageDataRef" />
        </div>

        -->

    <Toaster />
</template>

<style scoped>
main {
    display: grid;
    grid-template-areas:
        "header header"
        "settings preview";
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto 1fr;
    gap: 2rem;
    align-items: flex-start;
    justify-content: center;
    min-height: 100vh;
    padding: 2rem;
    background-color: #f0f0f0;
}

.app-header {
    grid-area: header;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
}

.app-header-titles {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.app-title {
    font-size: 2rem;
    font-weight: bold;
    margin: 0;
    color: #222;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.printer-icon {
    width: 1.5em;
    height: 1.5em;
    margin-right: 0.25em;
}

.app-subtitle {
    font-size: 1rem;
    color: #666;
    margin-top: 0.25rem;
    margin-left: 0.1rem;
}

.app-settings-corner {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    font-size: 1.5rem;
    margin-left: 1rem;
}

.settings-panel {
    grid-area: settings;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.preview-panel {
    grid-area: preview;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    width: 100%;
}

@media (max-width: 768px) {
    main {
        grid-template-areas:
            "header"
            "settings"
            "preview";
        grid-template-columns: 1fr;
        grid-template-rows: auto auto 1fr;
        gap: 1.5rem;
        min-height: unset;
    }

    .preview-panel {
        align-items: stretch;
    }

    .app-header {
        flex-direction: row;
        align-items: center;
        justify-content: flex-start;
        gap: 0.75rem;
    }

    .app-title {
        font-size: 1.3rem;
    }

    .app-subtitle {
        font-size: 0.95rem;
    }

    .app-settings-corner {
        margin-left: 0;
        font-size: 1.3rem;
    }
}
</style>
