import type { PrinterImage } from "./printerimage";

export class PhomemoPrinter {
    private port?: SerialPort;
    private reader?: ReadableStreamDefaultReader<Uint8Array>;
    private writer?: WritableStreamDefaultWriter<Uint8Array>;
    async connect(showAllBluetoothDevices = false): Promise<void> {
        this.port = await navigator.serial.requestPort({
            filters: showAllBluetoothDevices
                ? []
                : [{ bluetoothServiceClassId: '00001101-0000-1000-8000-00805f9b34fb' }],
        });
        await this.port.open({ baudRate: 9600 });
        this.writer = this.port.writable?.getWriter();
        this.reader = this.port.readable?.getReader();
    }

    async disconnect(): Promise<void> {
        if (this.reader && !this.reader.closed) {
            this.reader.releaseLock();
            await this.reader.cancel().catch(() => { });
            this.reader = undefined;
        }
        if (this.writer && !this.writer.closed) {
            this.writer.releaseLock();
            await this.writer.close().catch(() => { });
            this.writer = undefined;
        }
        if (this.port) {
            await this.port.close().catch(() => { });
            this.port = undefined;
        }
    }

    async getFirmwareVersion(): Promise<string> {
        if (!this.port || !this.writer || !this.reader) throw new Error('Not connected to printer');
        await this.writer.write(new Uint8Array([0x1F, 0x11, 0x07]));
        const { value } = await this.reader.read();
        if (value && value.length >= 5) {
            return `${value[4]}.${value[3]}.${value[2]}`;
        } else {
            throw new Error('Failed to read firmware version');
        }
    }

    async getBatteryLevel(): Promise<number> {
        if (!this.port || !this.writer || !this.reader) throw new Error('Not connected to printer');
        await this.writer.write(new Uint8Array([0x1F, 0x11, 0x08]));
        const { value } = await this.reader.read();
        if (value && value.length >= 3) {
            return value[2];
        } else {
            throw new Error('Failed to read power');
        }
    }

    async getSerialNumber(): Promise<number> {
        if (!this.port || !this.writer || !this.reader) throw new Error('Not connected to printer');
        await this.writer.write(new Uint8Array([0x1F, 0x11, 0x13]));
        const { value } = await this.reader.read();
        if (value && value.length >= 3) {
            return value[2] | (value[1] << 8) | (value[0] << 16);
        } else {
            throw new Error('Failed to read serial number');
        }
    }

    async getPaperState(): Promise<number> {
        if (!this.port || !this.writer || !this.reader) throw new Error('Not connected to printer');
        await this.writer.write(new Uint8Array([0x1F, 0x11, 0x11]));
        const { value } = await this.reader.read();
        if (value && value.length >= 3) {
            return value[2] | (value[1] << 8) | (value[0] << 16);
        } else {
            throw new Error('Failed to read paper state');
        }
    }

    async initializePrinter(): Promise<void> {
        if (!this.port || !this.writer) throw new Error('Not connected to printer');
        await this.writer.write(new Uint8Array([0x1B, 0x40])); // ESC @
    }

    async resetPrinter(): Promise<void> {
        if (!this.port || !this.writer) throw new Error('Not connected to printer');
        await this.writer.write(new Uint8Array([0x1B, 0x40, 0x02])); // ESC @ 0x02
    }

    async alignCenter(): Promise<void> {
        if (!this.port || !this.writer) throw new Error('Not connected to printer');
        await this.writer.write(new Uint8Array([0x1B, 0x61, 0x01])); // ESC a 1
    }

    async printFeedLines(num: number): Promise<void> {
        if (!this.port || !this.writer) throw new Error('Not connected to printer');
        if (num < 0 || num > 255) {
            throw new Error('Number of lines must be between 0 and 255');
        }
        await this.writer.write(new Uint8Array([0x1B, 0x64, num])); // ESC d num
    }

    async printImage(image: PrinterImage): Promise<void> {
        if (!this.port || !this.writer) throw new Error('Not connected to printer');
        if (image.width % 8 !== 0) {
            throw new Error('Image width must be a multiple of 8');
        }

        if (image.bits.length !== (image.width / 8) * image.height) {
            throw new Error('Image bits length does not match width and height');
        }

        const mode = 0; // CS v 0
        const byteWidth = image.width / 8;
        const height = image.height;

        const header = new Uint8Array([
            0x1D, 0x76, 0x30, mode, // GS v 0
            byteWidth & 0xFF, (byteWidth >> 8) & 0xFF, // Width in bytes
            height & 0xFF, (height >> 8) & 0xFF // Height in bytes
        ]);
        const imageData = new Uint8Array(image.bits.length + header.length);
        imageData.set(header, 0);
        imageData.set(image.bits, header.length);
        await this.writer.write(imageData);
    }
}
