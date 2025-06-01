import { ref } from 'vue'
import { defineStore } from 'pinia'
import { PhomemoPrinter } from '@/logic/phomemo';

const printer = ref(new PhomemoPrinter());

const printerBattery = ref(0);
const printerFirmwareVersion = ref('');
const printerSerialNumber = ref(0);
const isConnected = ref(false);

export const usePrinterStore = defineStore('printer', () => {
    async function connectPrinter() {
        await printer.value.connect()
        printerBattery.value = await printer.value.getBatteryLevel();
        printerFirmwareVersion.value = await printer.value.getFirmwareVersion();
        printerSerialNumber.value = await printer.value.getSerialNumber();
        isConnected.value = true;
    }

    return {
        printer, connectPrinter, printerBattery, printerFirmwareVersion, printerSerialNumber, isConnected, disconnectPrinter: async () => {
            await printer.value.disconnect();
            isConnected.value = false;
        }
    }
})
