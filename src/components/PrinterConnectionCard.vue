<script setup lang="ts">
import {
  Card,
  CardContent,
} from '@/components/ui/card'

import { Wifi, WifiOff, Loader2, BatteryFull, BatteryLow, BatteryMedium, Battery } from 'lucide-vue-next';

import { ref } from 'vue';
import Button from './ui/button/Button.vue';
import { usePrinterStore } from '@/stores/printer';

import { toast } from 'vue-sonner';
import TooltipProvider from './ui/tooltip/TooltipProvider.vue';
import Tooltip from './ui/tooltip/Tooltip.vue';
import TooltipTrigger from './ui/tooltip/TooltipTrigger.vue';
import TooltipContent from './ui/tooltip/TooltipContent.vue';

const isLoading = ref(false);

const printer = usePrinterStore();

const emit = defineEmits<{
  (e: 'connect'): void;
}>();

async function connectToPrinter() {
  isLoading.value = true;
  try {
    if (printer.isConnected) {
      await printer.disconnectPrinter();
    } else {
      try {
        await printer.connectPrinter();
        emit('connect');
      } catch (error) {
        console.error('Failed to connect to printer:', error);
        toast.error('Failed to connect to printer. Please try again.');
      }
      return;
    }
  } catch (error) {
    console.error('Error during printer connection:', error);
    toast.error('An error occurred while connecting to the printer.');
  } finally {
    isLoading.value = false;
  }
}

</script>

<template>
  <Card>
    <CardContent>
      <div class="flex items-center justify-between w-full">
        <div class="flex items-center gap-4">
          <span class="icon-stack relative inline-block w-5 h-5">
            <Wifi class="absolute top-0 left-0 transition-opacity duration-300"
              :style="{ opacity: printer.isConnected ? 1 : 0 }" color="#16a34a" :size="20" />
            <WifiOff class="absolute top-0 left-0 transition-opacity duration-300"
              :style="{ opacity: printer.isConnected ? 0 : 1 }" color="#666" :size="20" />
          </span>
          <div>
            <h2 class="text-lg font-semibold">
              Printer Connection Status
            </h2>
            <div style="display: flex; gap: 8px; align-items: center;">
              <span>
                {{ printer.isConnected ? 'Printer ready' : 'Tap to connect' }}
              </span>
              <span class="battery-icon-wrapper" v-if="printer.isConnected">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <BatteryFull v-if="printer.printerBattery > 75" class="battery-icon" />
                      <BatteryMedium v-else-if="printer.printerBattery > 50" class="battery-icon" />
                      <BatteryLow v-else-if="printer.printerBattery > 25" class="battery-icon" />
                      <Battery v-else color="red" class="battery-icon" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Battery: {{ printer.printerBattery }}%
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </span>
            </div>

          </div>
        </div>
        <Button @click="connectToPrinter" :disabled="isLoading">
          <Loader2 v-if="isLoading" class="w-4 h-4 mr-2 animate-spin" />
          {{ printer.isConnected ? 'Disconnect' : 'Connect' }}
        </Button>
      </div>
    </CardContent>
  </Card>
</template>
