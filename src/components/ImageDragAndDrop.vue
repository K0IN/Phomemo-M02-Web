<script setup lang="ts">
import { convertImageToBits } from '@/logic/imagehelper';
import type { PrinterImage } from '@/logic/printerimage';

const emit = defineEmits<{
    (e: 'imageLoaded', image: PrinterImage): void;
}>();

function onImage(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            const imageData = convertImageToBits(img, 384); // Assuming 48mm width in pixels
            emit('imageLoaded', imageData);
        };
        img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
}

</script>

<template>
    <div class="outline">
        <input type="file" accept="image/*" @change="(e) => onImage(e)" class="file-input"
            style="display: block; margin: 20px auto; width: 200px;" />
        <p style="text-align: center;">Drag and drop an image file here or click to select</p>
        <p style="text-align: center;">Supported formats: PNG, JPEG, BMP</p>
    </div>
</template>

<style scoped>
.outline {
    border: 2px dashed #007bff;
    padding: 20px;
    text-align: center;
    margin: 20px auto;
    width: 80%;
    max-width: 600px;
    border-radius: 8px;
}

.file-input {
    display: block;
    margin: 20px auto;
    width: 200px;
    padding: 10px;
    font-size: 16px;
    border: 1px solid #ccc;
    border-radius: 4px;
}

.file-input:hover {
    border-color: #007bff;
}
</style>
