<script setup lang="ts">
import type { PrinterImage } from '@/logic/printerimage';
import { defineProps, ref, watch } from 'vue';
import Card from './ui/card/Card.vue';
import CardHeader from './ui/card/CardHeader.vue';
import CardTitle from './ui/card/CardTitle.vue';
import CardContent from './ui/card/CardContent.vue';
import TabsContent from './ui/tabs/TabsContent.vue';
import TabsList from './ui/tabs/TabsList.vue';
import Tabs from './ui/tabs/Tabs.vue';
import TabsTrigger from './ui/tabs/TabsTrigger.vue';

const props = defineProps<{
    image: PrinterImage | null; // Optional image prop
    originalImage: HTMLImageElement | null; // Optional original image prop
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);

// on prop change
watch([canvasRef, props], async () => {
    const canvas = canvasRef.value as HTMLCanvasElement | null;
    if (!canvas || !props.image) return;
    await new Promise(resolve => requestAnimationFrame(resolve)); // Ensure DOM is updated

    canvas.width = props.image.width;
    canvas.height = props.image.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    //ctx.fillStyle = '#ffffff'; // Set background to white
    //ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Clear the canvas

    // Create image data
    const imageData = ctx.createImageData(props.image.width, props.image.height);
    const data = imageData.data;
    const { width, height, bits } = props.image;

    // Each bit in 'bits' is a pixel, row-major order
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const byteIndex = (y * width + x) >> 3;
            const bitIndex = 7 - (x & 7);
            const isBlack = ((bits[byteIndex] >> bitIndex) & 1) === 1;
            const color = isBlack ? 0 : 255;
            const pixelIndex = (y * width + x) * 4;

            data[pixelIndex] = color;     // R
            data[pixelIndex + 1] = color; // G
            data[pixelIndex + 2] = color; // B
            data[pixelIndex + 3] = 255;   // A
        }
    }

    ctx.putImageData(imageData, 0, 0);
});



</script>

<template>
    <Card>
        <CardHeader class="flex flex-row items-center justify-between">
            <CardTitle>Image Preview</CardTitle>
        </CardHeader>
        <CardContent>
            <!--
            <p class="text-sm text-gray-500">Preview of the image to be printed.</p>
            <p class="text-xs text-gray-400 mt-2">Width: {{ props.image.width }} px, Height: {{ props.image.height }} px
            </p>
            <p class="text-xs text-gray-400">Bits Length: {{ props.image.bits.length }} bytes</p>

            <p class="text-xs text-gray-400">Total Pixels: {{ props.image.width * props.image.height }}</p>
            <p class="text-xs text-gray-400">Total Bytes: {{ Math.ceil((props.image.width * props.image.height) / 8) }}
                bytes</p>
-->

            <Tabs default-value="account" class="w-[400px]">
                <TabsList>
                    <TabsTrigger value="account">
                        Preview
                    </TabsTrigger>
                    <TabsTrigger value="password">
                        Original Image
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="account" style="width: 100%; height: 100%;">
                    <canvas ref="canvasRef"></canvas>
                </TabsContent>
                <TabsContent value="password">
                    <img :src="props.originalImage?.src" alt="Original Image" style="outline: 2px solid #666;" />
                </TabsContent>
            </Tabs>

        </CardContent>
    </Card>
</template>

<style scoped>
canvas {
    outline: 2px solid #666;
    width: 100%;
    height: 100%;
    min-width: 100%;
    min-height: 100%;
    max-width: 100%;
    max-height: 100%;
}
</style>
