<script setup lang="ts">
import { ref, watch } from 'vue';
import 'vue-sonner/style.css'

import ImagePreview from './components/ImagePreview.vue';
import ImageDragAndDrop from './components/ImageDragAndDrop.vue';
import PrinterConnectionCard from './components/PrinterConnectionCard.vue';
import ImageConversionCard from './components/ImageConversionCard.vue';
import AppSettings from './components/AppSettings.vue';
import PrintButton from './components/PrintButton.vue';

import { Printer } from 'lucide-vue-next';
import { Toaster } from '@/components/ui/sonner'

import { defaultImageConversionOptions, type PrinterImage } from './logic/printerimage.ts';
import { useImageConvertersStore } from './stores/imageconverter.ts';
import { useGlobalSettingsStore } from './stores/globalSettings.ts';
import { usePrinterStore } from './stores/printer.ts';



const imageDataRef = ref<PrinterImage | null>(null);

const converterStore = useImageConvertersStore();
const appSettings = useGlobalSettingsStore();
const printerStore = usePrinterStore();


const imageConversionOptions = ref(defaultImageConversionOptions);
const imageRef = ref<HTMLImageElement | null>(null);
async function setImage(image: HTMLImageElement) {
    imageRef.value = image;
}

watch([imageRef, imageConversionOptions], async () => {
    if (!imageRef.value) return;
    const image = await createImageBitmap(imageRef.value);
    const options = JSON.parse(JSON.stringify(imageConversionOptions.value));
    try {
        const result = await converterStore.convertImage(image, appSettings.settings.pixelPerLine, options);
        imageDataRef.value = result;
    } catch {
    }
});

async function printImage() {
    if (!imageDataRef.value) {
        console.error('No image data to print');
        return;
    }
    try {
        await printerStore.printImage(imageDataRef.value);
    } catch (error) {
        console.error('Failed to print image:', error);
    }
}

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
            <PrinterConnectionCard :show-all-bluetooth-devices="appSettings.settings.showAllBluetoothDevices" />
            <ImageDragAndDrop @imageLoaded="(image) => setImage(image)" />
            <ImageConversionCard @image-conversion-options-change="(options) => imageConversionOptions = options" />
        </div>
        <div class="preview-panel">
            <ImagePreview :image="imageDataRef" :original-image="imageRef" style="width: 100%;" />
            <PrintButton style="width: 100%;" :image-selected="!!imageDataRef" :connected="printerStore.isConnected"
                @print="printImage" />
        </div>
    </main>

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
