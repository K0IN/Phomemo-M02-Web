import type { ImageConversionOptions, PrinterImage } from "./printerimage";

import { $init, runme } from 'image-converter-wasm';

export async function convertImageToBits(image: ImageBitmap, outputWidthPixel: number, options: ImageConversionOptions): Promise<PrinterImage> {
    console.log(`Converting image to bits with options:`, options);
    await $init;
    console.log(`Awaited wasm initialization`);
    runme();
    console.log(`Wasm runme completed`);

    let outputHeight: number;
    if (options.rotation === 90 || options.rotation === 270) {
        outputHeight = Math.round(outputWidthPixel * (image.width / image.height));
    } else {
        outputHeight = Math.round(outputWidthPixel * (image.height / image.width));
    }

    const canvas = new OffscreenCanvas(outputWidthPixel, outputHeight);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas context');

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    console.log(`Drawing image to canvas: ${image.width}x${image.height} -> ${canvas.width}x${canvas.height} (${outputWidthPixel} pixels wide) with options:`, options);

    if (options.rotation !== 0) {
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(options.rotation * Math.PI / 180);
        if (options.rotation === 90 || options.rotation === 270) {
            ctx.drawImage(image, -canvas.height / 2, -canvas.width / 2, canvas.height, canvas.width);
        } else {
            ctx.drawImage(image, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
        }
        ctx.restore();
    } else {
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    }

    const sampledImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const getPixel = (x: number, y: number): boolean => (
        sampledImage.data[(y * canvas.width + x) * 4] +
        sampledImage.data[(y * canvas.width + x) * 4 + 1] +
        sampledImage.data[(y * canvas.width + x) * 4 + 2]) < (options.threshold * 3.0);

    const bits = new Uint8ClampedArray(outputHeight * outputWidthPixel / 8);
    for (let y = 0; y < outputHeight; y++) {
        for (let x = 0; x < outputWidthPixel / 8; x++) {
            for (let bit = 0; bit < 8; bit++) {
                const pixelX = x * 8 + bit;
                if (pixelX >= outputWidthPixel) break;
                const pixelValue = getPixel(pixelX, y);
                const result = options.invert
                    ? (pixelValue ? 0 : 1)
                    : (pixelValue ? 1 : 0);
                bits[y * outputWidthPixel / 8 + x] |= (result << (7 - bit));
            }
        }
    }

    if (canvas.width !== outputWidthPixel) {
        throw new Error(`Canvas width ${canvas.width} does not match output width ${outputWidthPixel}`);
    }

    console.log(`Image converted to bits: ${outputWidthPixel} pixels wide, ${outputHeight} pixels high`);
    return {
        width: outputWidthPixel,
        height: outputHeight,
        bits: bits
    };
}


export function loadImageFromUrl(url: string): Promise<ImageBitmap> {
    return new Promise<ImageBitmap>((resolve, error) => {
        const img = new Image();
        img.onload = async () => createImageBitmap(img).then(resolve).catch(error);
        img.onerror = (err) => error(err);
        img.src = url;
    });
}


