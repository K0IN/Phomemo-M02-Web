<script setup lang="ts">
import { ref } from 'vue';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Badge } from '@/components/ui/badge';

const threshold = ref(128);
const rotation = ref(0);
const rotationOptions = [0, 90, 180, 270];

const emit = defineEmits<{
    (e: 'update:threshold', value: number): void;
    (e: 'update:rotation', value: number): void;
}>();
</script>

<template>
    <Card>
        <CardHeader class="flex flex-row items-center justify-between">
            <CardTitle>Image Conversion Settings</CardTitle>
        </CardHeader>
        <CardContent>
            <!-- Threshold Slider -->
            <div class="mb-6">
                <div class="flex items-center justify-between mb-2">
                    <label class="font-medium">Threshold</label>
                    <Badge variant="outline" class="text-xs font-semibold">{{ threshold }}</Badge>
                </div>
                <input type="range" min="0" max="255" v-model="threshold" class="w-full"
                    @input="emit('update:threshold', threshold)" />
            </div>
            <!-- Rotation Toggle Group -->
            <div>
                <label class="block mb-2 font-medium">Rotation</label>
                <ToggleGroup type="single" v-model="rotation">
                    <ToggleGroupItem v-for="option in rotationOptions" :key="option" :value="option"
                        @click="emit('update:rotation', option)">
                        {{ option }}°
                    </ToggleGroupItem>
                </ToggleGroup>
            </div>
            <!-- todo crop -->
        </CardContent>
    </Card>
</template>
