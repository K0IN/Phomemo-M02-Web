<script setup lang="ts">
import { ref } from 'vue';
import Card from './ui/card/Card.vue';
import { Badge, BadgeCheck, Image as ImageIcon, Upload } from 'lucide-vue-next';
import CardHeader from './ui/card/CardHeader.vue';
import CardTitle from './ui/card/CardTitle.vue';
import CardContent from './ui/card/CardContent.vue';
import Button from './ui/button/Button.vue';
const emit = defineEmits<{
    (e: 'imageLoaded', image: HTMLImageElement): void;
}>();

const isDragActive = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const hasImage = ref(false);

function onImage(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            emit('imageLoaded', img);
            hasImage.value = true;
        };
        img.onerror = (err) => {
            console.error('Error loading image:', err);
            alert('Failed to load image. Please try a different file.');
        };
        img.src = event.target?.result as string;
    };
    reader.onerror = (err) => {
        console.error('Error reading file:', err);
        alert('Failed to read file. Please try a different file.');
    };
    reader.readAsDataURL(file);
}

function onDragOver(e: DragEvent) {
    e.preventDefault();
    if (!isDragActive.value) {
        isDragActive.value = true;
    }
}
function onDragLeave() {
    isDragActive.value = false;
}
function onDrop(e: DragEvent) {
    isDragActive.value = false;
    const file = e.dataTransfer?.files?.[0];
    if (!file) return;
    // Create a synthetic event with a target that matches the expected type
    const syntheticEvent = {
        target: { files: [file] }
    } as unknown as Event;
    onImage(syntheticEvent);
}
</script>

<template>
    <Card class="drop-area " @dragover.prevent="onDragOver" @dragleave.prevent="onDragLeave" @drop.prevent="onDrop"
        :class="{ 'drag-active': isDragActive }">
        <CardHeader class="flex flex-row items-center">
            <ImageIcon class="mr-2" />
            <CardTitle>Select Image</CardTitle>
            <BadgeCheck v-if="hasImage" class="ml-auto" variant="outline">Image Selected</BadgeCheck>
            <Badge v-else class="ml-auto" variant="outline">No Image</Badge>
        </CardHeader>
        <CardContent>
            <label class="file-label cursor-pointer" tabindex="0">
                <input ref="fileInput" type="file" accept="image/*" @change="(e) => onImage(e)" class="file-input" />
                <Button @click="fileInput?.click()">
                    <Upload :size="20" class="inline-block" />
                    choose {{ hasImage ? 'another' : '' }} image
                </Button>
            </label>
            <span class="sub-text mt-1">You can also drag and drop images here</span>
        </CardContent>
    </Card>
</template>

<style scoped>
.drop-area.drag-active {
    border-color: var(--color-border-hover);
    box-shadow: 0 8px 32px 0 rgba(44, 62, 80, 0.18);
    animation: smooth-pulse 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

@keyframes smooth-pulse {
    0% {
        box-shadow: 0 0 0 0 rgba(44, 62, 80, 0.18);
    }

    50% {
        box-shadow: 0 0 0 10px rgba(44, 62, 80, 0.08);
    }

    100% {
        box-shadow: 0 0 0 0 rgba(44, 62, 80, 0.18);
    }
}

.file-label {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    width: 100%;
    outline: none;
}

.file-input {
    display: none;
}

.sub-text {
    font-size: 0.98rem;
    color: var(--color-text);
    margin-bottom: 0;
    opacity: 0.7;
    text-align: center;
    width: 100%;
    display: block;
}
</style>
