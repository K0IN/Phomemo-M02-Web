<script setup lang="ts">
import { computed, ref } from 'vue';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Badge } from '@/components/ui/badge';
import type { ImageConversionOptions } from '@/logic/printerimage';
import Switch from './ui/switch/Switch.vue';
import { Settings } from 'lucide-vue-next';

const rotationOptions = [0, 90, 180, 270] as const;

const threshold = ref(128);
const rotation = ref<number | undefined>(0);
const invert = ref(false);

const emit = defineEmits<{
    (e: 'image-conversion-options-change', value: ImageConversionOptions): void;
}>();

const imageConversionOptions = computed((): ImageConversionOptions => ({
    threshold: threshold.value,
    rotation: rotation.value ?? 0,
    invert: invert.value,
}));
</script>

<template>
    <Card>
        <CardHeader class="flex flex-row items-center">
            <Settings class="mr-2" />
            <CardTitle>Select Image</CardTitle>
        </CardHeader>
        <CardContent>
            <div class="mb-6">
                <div class="flex items-center justify-between mb-2">
                    <label class=" font-medium">Threshold</label>
                    <Badge variant="outline" class="text-xs font-semibold">{{ threshold }}</Badge>
                </div>
                <input type="range" min="0" max="255" v-model="threshold" class="w-full"
                    @input="emit('image-conversion-options-change', imageConversionOptions)" />
            </div>
            <div>
                <label class="block mb-2 font-medium">Rotation</label>
                <ToggleGroup type="single" v-model="rotation">
                    <ToggleGroupItem v-for="option in rotationOptions" :key="option" :value="option"
                        @click="emit('image-conversion-options-change', imageConversionOptions)">
                        {{ option }}°
                    </ToggleGroupItem>
                </ToggleGroup>
            </div>

            <div>
                <label class="block mb-2 font-medium">Invert Colors</label>
                <div class="flex items-center space-x-2">
                    <Switch id="invert-colors" v-model="invert"
                        @update:model-value="emit('image-conversion-options-change', imageConversionOptions)" />
                    <Label for="invert-colors">
                        Invert Colors
                    </Label>
                </div>
            </div>

            <!-- todo crop -->
        </CardContent>
    </Card>
</template>
