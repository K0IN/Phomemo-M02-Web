import type { PrinterImage } from "./printerimage";

export class PhomemoPrinter {
    private port?: SerialPort;
    private reader?: ReadableStreamDefaultReader<Uint8Array>;
    private writer?: WritableStreamDefaultWriter<Uint8Array>;
    constructor() {
        if (!navigator.serial) {
            throw new Error('Web Serial API is not supported in this browser.');
        }
    }

    async connect(): Promise<void> {
        this.port = await navigator.serial.requestPort({
            filters: [{ bluetoothServiceClassId: '00001101-0000-1000-8000-00805f9b34fb' }],
        });
        await this.port.open({ baudRate: 9600 });
        this.writer = this.port.writable?.getWriter();
        this.reader = this.port.readable?.getReader();
    }

    async disconnect(): Promise<void> {
        if (this.reader && !this.reader.closed) {
            this.reader.releaseLock();
            this.reader.cancel();
            this.reader = undefined;
        }
        if (this.writer && !this.writer.closed) {
            this.writer.releaseLock();
            this.writer.close();
            this.writer = undefined;
        }
        if (this.port) {
            await this.port.close();
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

    async getPower(): Promise<number> {
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
        console.log('Printer initialized');
    }

    async resetPrinter(): Promise<void> {
        if (!this.port || !this.writer) throw new Error('Not connected to printer');
        await this.writer.write(new Uint8Array([0x1B, 0x40, 0x02])); // ESC @ 0x02
        console.log('Printer reset');
    }

    async alignCenter(): Promise<void> {
        if (!this.port || !this.writer) throw new Error('Not connected to printer');
        await this.writer.write(new Uint8Array([0x1B, 0x61, 0x01])); // ESC a 1
        console.log('Printer aligned to center');
    }

    async printFeedLines(num: number): Promise<void> {
        if (!this.port || !this.writer) throw new Error('Not connected to printer');
        if (num < 0 || num > 255) {
            throw new Error('Number of lines must be between 0 and 255');
        }
        await this.writer.write(new Uint8Array([0x1B, 0x64, num])); // ESC d num
        console.log(`Printed ${num} feed lines`);
    }

    async printRasterBitImage(image: PrinterImage): Promise<void> {
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
        console.log('Raster bit image printed');
    }
}


/*
const connectButton = document.getElementById('connectButton');
const firmwareButton = document.getElementById('firmwareButton');
const powerButton = document.getElementById('powerButton');
let port, reader, writer;

connectButton?.addEventListener('click', async () => {
  port = await navigator.serial.requestPort({ filters: [] });
  console.log('Port selected:', port);
  await port.open({ baudRate: 9600 });
  console.log('Port opened:', port);
  reader = port.readable.getReader();
  writer = port.writable.getWriter();
});

firmwareButton?.addEventListener('click', async () => {
  if (!writer || !reader) return alert('Connect first!');
  // Send firmware command: [0x1F, 0x11, 0x07]
  await writer.write(new Uint8Array([0x1F, 0x11, 0x07]));
  // Read 5 bytes
  const { value } = await reader.read();
  if (value && value.length >= 5) {
    const fw = `${value[4]}.${value[3]}.${value[2]}`;
    alert('Firmware version: ' + fw);
  } else {
    alert('Failed to read firmware version');
  }
});

powerButton?.addEventListener('click', async () => {
  if (!writer || !reader) return alert('Connect first!');
  // Send power command: [0x1F, 0x11, 0x08]
  await writer.write(new Uint8Array([0x1F, 0x11, 0x08]));
  // Read 3 bytes
  const { value } = await reader.read();
  if (value && value.length >= 3) {
    const power = value[2];
    alert('Power: ' + power);
  } else {
    alert('Failed to read power');
  }
});
# Copyright (c) 2021 Alethea Katherine Flowers.
# Published under the standard MIT License.
# Full text available at: https://opensource.org/licenses/MIT

import math

import PIL
import PIL.Image
import PIL.ImageOps

def preprocess_image(src, width=512, save=False):
    src_w, src_h = src.size
    aspect = src_w / src_h
    new_size = (width, math.floor(width / aspect))
    resized = src.resize(new_size)
    converted = PIL.ImageOps.invert(resized.convert("RGB")).convert("1")

    if save:
        converted.save("converted.png")

    return converted

def split_image(image, padding_top):
    chunks = image.height // 255

    # Yield one "empty" chunk as a workaround for the printer not printing
    # the first couple lines
    yield _make_padding(image.width, padding_top)

    for chunk in range(chunks + 1):
        i = image.crop((0, chunk * 255, image.width, chunk * 255 + 255))
        yield i

def image_to_bits(image, threshold=127):
    return [
        bytearray(
            [
                1 if image.getpixel((x, y)) > threshold else 0
                for x in range(image.width)
            ]
        )
        for y in range(image.height)
    ]

def _make_padding(width, height):
    return PIL.Image.new("L", (width, height), color=0)


# Copyright (c) 2021 Alethea Katherine Flowers.
# Published under the standard MIT License.
# Full text available at: https://opensource.org/licenses/MIT

from __future__ import annotations

import PIL
import serial
import socket

from phomemo_m02s import _image_helper

FF = 0x0C
NAK = 0x15
CAN = 0x18
ESC = 0x1B
GS = 0x1D
US = 0x1F


class BluSerial:
    def __init__(self, mac, port):
        self.sock = socket.socket(
            socket.AF_BLUETOOTH, socket.SOCK_STREAM, socket.BTPROTO_RFCOMM
        )
        self.sock.connect((mac, port))

    def write(self, b):
        if type(b) is list:
            b = bytes(b)
        self.sock.send(b)

    def read(self, size):
        return self.sock.recv(size)

    def flush(self):
        pass


class Printer:
    # Figured out empirically
    MAX_WIDTH = 576

    def __init__(self, port_name="/dev/tty.M02S", mac=None):
        if mac is not None:
            # the channel can be found by running `sdptool browse` but should be the same
            self.port = BluSerial(mac, 6)

        else:
            self.port = serial.Serial(port_name, timeout=10)

    def write(self, bytes):
        self.port.write(bytes)
        self.port.flush()

    def read(self, count):
        return self.port.read(size=count)

    # These commands are in the same order as in PrinterUtils.java
    # from the Android app.

    def set_concentration(self, val=2):
        self.write(bytes([ESC, 0x4E, 0x04, val]))

    def set_device_timer(self, val):
        self.write(bytes([ESC, 0x4E, 0x07, val]))

    def get_serial_number(self):
        # PrinterUtils uses NAK, but it doesn't seem to work for some reason.
        # However, apparently US works.
        self.write(bytes([US, 0x11, 0x13]))
        return int.from_bytes(
            self.read(3)[2:],
            byteorder="little",
        )

    def get_firmware_version(self):
        self.write([US, 0x11, 0x07])
        response = self.read(5)
        return f"{response[4]}.{response[3]}.{response[2]}"

    def get_energy(self):
        self.write(bytes([US, 0x11, 0x08]))
        return int.from_bytes(self.read(3)[2:], byteorder="little")

    def get_device_timer(self):
        self.write(bytes([US, 0x11, 0x0E]))
        return int.from_bytes(self.read(3)[2:], byteorder="little")

    def get_paper_state(self):
        self.write(bytes([US, 0x11, 0x11]))
        return int.from_bytes(
            self.read(3)[2:],
            byteorder="little",
        )

    def initialize(self):
        self.write(bytes([ESC, 0x40]))

    def print_line_feed(self):
        self.write(bytes([0x0A]))

    def emphasized_on(self):
        self.write(bytes([ESC, 0x45, 1]))

    def emphasized_off(self):
        self.write(bytes([ESC, 0x45, 0]))

    def align_left(self):
        self.write(bytes([ESC, 0x61, 0]))

    def align_center(self):
        self.write(bytes([ESC, 0x61, 1]))

    def align_right(self):
        self.write(bytes([ESC, 0x61, 2]))

    def feed_paper_cut(self):
        self.write(bytes([GS, 0x56, 1]))

    def feed_paper_cut_partial(self):
        self.write(bytes([GS, 0x56, 0x42, 0]))

    # Note: not sure what the difference is between
    # set_concentration and print_concentration, although
    # this one seems to use non-standard commands.
    def print_concentration(self, val):
        self.write(bytes([NAK, 0x11, 0x02, val]))

    # These commands are in the same order as PrintCommands.java,
    # except for the ones already above.

    def print_feed_lines(self, num):
        self.write(bytes([ESC, 0x64, num]))

    def print_feed_paper(self, num):
        self.write(bytes([ESC, 0x4A, num]))

    def reset(self):
        self.write(bytes([ESC, 0x40, 0x02]))

    def print_raster_bit_image(self, lines: list[bytearray]):
        """The lowest level print image command.

        lines must be a list of bytearrays representing the lines to
        print. The line length must be a multiple of 8 and the number of lines
        must be less than 256. The "pixels" should be either a 0 or 1.

        For the M02S, a fullwidth image is 512 pixels width.
        """
        mode = 0
        # CS v 0
        output = bytearray([GS, 0x76, 0x30, mode])

        width = len(lines[0]);
        height = len(lines);

        if (width % 8 != 0) {
            throw new ValueError("Width isn't a multiple of 8");
        }

        byte_width = width // 8;

        output.extend(byte_width.to_bytes(2, byteorder="little"));

        if (height > 255) {
            throw new ValueError("Height must be less than 256");
        }

        output.extend(height.to_bytes(2, byteorder="little"));

        for (line in 0..height) {
            for (byte_num in 0..byte_width) {
                byte = 0;
                for (bit in 0..7) {
                    pixel = lines[line][byte_num * 8 + bit];
                    byte |= (pixel & 0x01) << (7 - bit);
                }

                output.append(byte);
            }
        }

        self.write(output);
    }

    # These are custom. :3
    def print_image(printer, filename_or_image, width=512, padding_top=5):
        with PIL.Image.open(filename_or_image) as src:
            image = _image_helper.preprocess_image(src, width);

        for chunk in _image_helper.split_image(image, padding_top=padding_top):
            printer.print_raster_bit_image(_image_helper.image_to_bits(chunk));

        printer.feed_paper_cut();

        */
