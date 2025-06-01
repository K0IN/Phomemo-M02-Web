import type { ImageConversionOptions, PrinterImage } from "./printerimage";

export async function convertImageToBits(image: ImageBitmap, outputWidthPixel: number, options: ImageConversionOptions): Promise<PrinterImage> {
    // const canvas = new OffscreenCanvas();// document.createElement('canvas');
    const outputHeight = Math.round(outputWidthPixel * (image.height / image.width));

    // canvas.width = outputWidthPixel;
    // canvas.height = outputHeight;
    const canvas = new OffscreenCanvas(outputWidthPixel, outputHeight);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas context');

    // draw the image to the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);


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
                if (pixelX >= outputWidthPixel) break; // Prevent out of bounds
                const pixelValue = getPixel(pixelX, y);
                const result = options.invert
                    ? (pixelValue ? 0 : 1)
                    : (pixelValue ? 1 : 0);
                bits[y * outputWidthPixel / 8 + x] |= (result << (7 - bit));
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


