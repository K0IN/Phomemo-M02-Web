import { ref } from 'vue'
import { defineStore } from 'pinia'
import { PhomemoPrinter } from '@/logic/phomemo';
import type { PrinterImage } from '@/logic/printerimage';


export const usePrinterStore = defineStore('printer', () => {
    const printer = ref(new PhomemoPrinter());
    const printerBattery = ref(0);
    const printerFirmwareVersion = ref('');
    const printerSerialNumber = ref(0);
    const isConnected = ref(false);

    function resetPrinter() {
        printer.value = new PhomemoPrinter();
        printerBattery.value = 0;
        printerFirmwareVersion.value = '';
        printerSerialNumber.value = 0;
        isConnected.value = false;
    }


    async function connectPrinter(showAllBluetoothDevices = false) {
        resetPrinter();
        await printer.value.connect(showAllBluetoothDevices)
        printerBattery.value = await printer.value.getBatteryLevel();
        printerFirmwareVersion.value = await printer.value.getFirmwareVersion();
        printerSerialNumber.value = await printer.value.getSerialNumber();
        isConnected.value = true;
    }

    async function printImage(image: PrinterImage) {
        if (!isConnected.value) throw new Error('Printer is not connected');
        await printer.value.printImage(image);
    }

    async function disconnectPrinter() {
        await printer.value.disconnect()
        resetPrinter();
    }

    return {
        printer, connectPrinter, printerBattery, printerFirmwareVersion, printerSerialNumber, isConnected,
        printImage,

        disconnectPrinter,
        isSupported: Boolean(navigator.serial),
    }
})
