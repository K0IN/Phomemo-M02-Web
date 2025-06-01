<script lang="ts" setup>
import { FileImage } from 'lucide-vue-next';
import Button from './ui/button/Button.vue';
import Card from './ui/card/Card.vue';
import CardContent from './ui/card/CardContent.vue';
import CardHeader from './ui/card/CardHeader.vue';
import CardTitle from './ui/card/CardTitle.vue';

const props = defineProps<{
    imageSelected: boolean;
    connected: boolean;

}>();

const emit = defineEmits<{
    (e: 'print'): void;
}>();
</script>

<template>
    <Card>
        <CardHeader class="flex flex-row items-center">
            <FileImage />
            <CardTitle>

                Print Image
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div v-if="!props.connected || !props.imageSelected" class="mb-2 text-sm text-gray-600 flex flex-col gap-1">
                <span v-if="!props.connected">Please <b>connect the printer</b> before printing.</span>
                <span v-if="!props.imageSelected">Please <b>select an image</b> before printing.</span>
            </div>
            <Button :disabled="!props.imageSelected || !props.connected" class="mt-4 w-full" @click="emit('print')">
                Print
            </Button>
        </CardContent>
    </Card>
</template>
