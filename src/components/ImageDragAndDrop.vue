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
