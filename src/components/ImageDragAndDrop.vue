<template>
    <div class="outline drop-area" @dragover.prevent="onDragOver" @dragleave.prevent="onDragLeave"
        @drop.prevent="onDrop" :class="{ 'drag-active': isDragActive }">
        <label class="file-label" tabindex="0">
            <input type="file" accept="image/*" @change="(e) => onImage(e)" class="file-input" />
            <div class="icon-wrapper">
                <svg class="upload-icon" viewBox="0 0 64 64" width="48" height="48">
                    <g>
                        <rect x="12" y="44" width="40" height="8" rx="4" fill="#e3eafc" />
                        <path d="M32 44V16" stroke="#007bff" stroke-width="4" stroke-linecap="round" />
                        <polyline points="24,24 32,16 40,24" fill="none" stroke="#007bff" stroke-width="4"
                            stroke-linecap="round" stroke-linejoin="round" />
                    </g>
                </svg>
            </div>
            <p class="main-text">Drag & drop an image here or <span class="highlight">click to select</span></p>
            <p class="sub-text">Supported: PNG, JPEG, BMP</p>
        </label>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const emit = defineEmits<{
    (e: 'imageLoaded', image: HTMLImageElement): void;
}>();

const isDragActive = ref(false);

function onImage(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => emit('imageLoaded', img);
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

function onDragOver() {
    isDragActive.value = true;
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

<style scoped>
.outline {
    border: 2px dashed var(--color-border);
    background: linear-gradient(135deg, var(--color-background-soft) 0%, var(--color-background-mute) 100%);
    padding: 32px 24px 28px 24px;
    text-align: center;
    margin: 32px auto;
    width: 90%;
    max-width: 420px;
    border-radius: 18px;
    box-shadow: 0 4px 24px 0 rgba(44, 62, 80, 0.08);
    transition: border-color 0.3s, box-shadow 0.3s, background 0.3s;
    position: relative;
    cursor: pointer;
    outline: none;
}

.drop-area.drag-active {
    border-color: var(--color-border-hover);
    background: linear-gradient(135deg, var(--color-background-mute) 0%, var(--color-background-soft) 100%);
    box-shadow: 0 8px 32px 0 rgba(44, 62, 80, 0.18);
    animation: pulse 0.7s;
}

@keyframes pulse {
    0% {
        box-shadow: 0 0 0 0 rgba(44, 62, 80, 0.2);
    }

    70% {
        box-shadow: 0 0 0 12px rgba(44, 62, 80, 0.05);
    }

    100% {
        box-shadow: 0 0 0 0 rgba(44, 62, 80, 0.2);
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

.icon-wrapper {
    margin-bottom: 12px;
    animation: float 2.2s infinite ease-in-out;
}

@keyframes float {

    0%,
    100% {
        transform: translateY(0);
    }

    50% {
        transform: translateY(-10px);
    }
}

.upload-icon {
    fill: none;
    stroke: var(--vt-c-indigo);
    filter: drop-shadow(0 2px 8px var(--color-background-mute));
    transition: stroke 0.3s;
}

.main-text {
    font-size: 1.18rem;
    color: var(--color-heading);
    margin-bottom: 4px;
    font-weight: 500;
}

.sub-text {
    font-size: 0.98rem;
    color: var(--color-text);
    margin-bottom: 0;
    opacity: 0.7;
}

.highlight {
    color: var(--vt-c-indigo);
    text-decoration: underline;
    cursor: pointer;
}

.outline:focus-within,
.file-label:focus {
    border-color: var(--color-border-hover);
    box-shadow: 0 0 0 2px var(--color-background-mute);
}
</style>
