<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { PhomemoPrinter } from './logic/phomemo';
import { convertImageToBits, loadImageFromUrl } from './logic/imagehelper.ts'
import ImagePreview from './components/ImagePreview.vue';
import type { PrinterImage } from './logic/printerimage.ts';
import ImageDragAndDrop from './components/ImageDragAndDrop.vue';


const isConnected = ref(false);
const power = ref(0);
const firmwareVersion = ref('');
const serialNumber = ref(0);
const paperState = ref(0);

const imageDataRef = ref<PrinterImage | null>(null);

// const printerSizeWidth = 48 * 8; // 72 * 8 = 576;

//
// onMounted(async () => {
//     const image = await loadImageFromUrl('/800.png')
//     const imageData = convertImageToBits(image, printerSizeWidth);
//     imageDataRef.value = imageData;
// });

async function connectToRouter() {
    if (!imageDataRef.value) {
        console.error('No image data available to print');
        alert('Please load an image first.');
        return;
    }

    const printer = new PhomemoPrinter();
    try {
        await printer.connect();
        isConnected.value = true;
        console.log('Connected to printer successfully');
    } catch (error) {
        console.error('Failed to connect to printer:', error);
    }

    power.value = await printer.getPower();
    firmwareVersion.value = await printer.getFirmwareVersion();
    serialNumber.value = await printer.getSerialNumber();
    paperState.value = await printer.getPaperState();

    // console.log('Image data:', imageData);
    //  if (imageData.length === 0) {
    //      console.error('Image data is empty, cannot print');
    //      return;
    //  }
    await printer.resetPrinter();

    await printer.initializePrinter();
    await printer.alignCenter();
    const imageData = imageDataRef.value;

    await printer.printRasterBitImage(imageData);
    await printer.printFeedLines(4);

    //  await printer.feedPaperCut();
    // printer.resetPrinter();
    //  printer.disconnect();
}

</script>

<template>
    <header></header>
    <main>
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

        <ImageDragAndDrop @imageLoaded="(image) => imageDataRef = image" />
    </main>
</template>

<style scoped>
/*
header {
    line-height: 1.5;
}

.logo {
    display: block;
    margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
    header {
        display: flex;
        place-items: center;
        padding-right: calc(var(--section-gap) / 2);
    }

    .logo {
        margin: 0 2rem 0 0;
    }

    header .wrapper {
        display: flex;
        place-items: flex-start;
        flex-wrap: wrap;
    }
}
*/
</style>
