import type { PrinterImage } from "./printerimage";

export function convertImageToBits(image: HTMLImageElement, outputWidthPixel: number, keepAspectRatio = true): PrinterImage {
    const canvas = document.createElement('canvas');
    const outputHeight = keepAspectRatio
        ? Math.round(outputWidthPixel * (image.height / image.width)) : image.height;


    canvas.width = outputWidthPixel;
    canvas.height = outputHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas context');

    //   if (keepAspectRatio) {
    //       const aspectRatio = image.width / image.height;
    //       const newHeight = outputWidthPixel / aspectRatio;
    //       canvas.height = Math.min(newHeight, outputHeight);
    //   }

    // draw the image to the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);


    const sampledImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const getPixel = (x: number, y: number): boolean =>
        sampledImage.data[(y * canvas.width + x) * 4] +
        sampledImage.data[(y * canvas.width + x) * 4 + 1] +
        sampledImage.data[(y * canvas.width + x) * 4 + 2] < 384;

    const bits = new Uint8ClampedArray(outputHeight * outputWidthPixel / 8);
    for (let y = 0; y < outputHeight; y++) {
        for (let x = 0; x < outputWidthPixel / 8; x++) {
            for (let bit = 0; bit < 8; bit++) {
                const pixelX = x * 8 + bit;
                if (pixelX >= outputWidthPixel) break; // Prevent out of bounds
                const pixelValue = getPixel(pixelX, y) ? 1 : 0;
                bits[y * outputWidthPixel / 8 + x] |= (pixelValue << (7 - bit));
            }
        }
    }

    return {
        width: outputWidthPixel,
        height: outputHeight,
        bits: bits
    };
}


export function loadImageFromUrl(url: string): Promise<HTMLImageElement> {
    return new Promise<HTMLImageElement>((resolve, error) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (err) => error(err);
        img.src = url;
    });
}

/*
working code:
import type { PrinterImage } from "./printerimage";

export function convertImageToBits(image: HTMLImageElement, outputWidth: number, keepAspectRatio = true): any {
    const canvas = document.createElement('canvas');
    const outputHeight = keepAspectRatio ? Math.round(outputWidth * (image.height / image.width)) : image.height;


    canvas.width = outputWidth;
    canvas.height = outputHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas context');

    if (keepAspectRatio) {
        const aspectRatio = image.width / image.height;
        const newHeight = outputWidth / aspectRatio;
        canvas.height = Math.min(newHeight, outputHeight);
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);


    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height, { colorSpace: 'srgb' });
    const bits: number[][] = [];
    for (let y = 0; y < outputHeight; y++) {
        const row: number[] = [];
        for (let x = 0; x < outputWidth; x++) {
            const index = (y * outputWidth + x) * 4;
            const r = imageData.data[index];
            const g = imageData.data[index + 1];
            const b = imageData.data[index + 2];
            // Convert to black and white (1 bit per pixel)
            row.push((r + g + b) < 384 ? 1 : 0); // Threshold at 384 for black
        }
        bits.push(row);
    }

    return bits;
}


export function loadImageFromUrl(url: string): Promise<HTMLImageElement> {
    return new Promise<HTMLImageElement>((resolve, error) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (err) => error(err);
        img.src = url;
    });
}
*/
