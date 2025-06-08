import { PrinterImage, loadImage, saveImage } from './testing/boilerplate.ts';
import { createCanvas } from "https://deno.land/x/canvas/mod.ts";

const image = await loadImage('./testing/mona-lisa-image.jpg');
const convertedImage = await convertImageToBits(image, 300)
await saveImage(convertedImage)



/* actual implementation */
async function convertImageToBits(image: ImageBitmap, outputWidthPixel: number): Promise<PrinterImage> {
    const outputHeight = Math.round(outputWidthPixel * (image.height / image.width));

    const canvas = createCanvas(outputWidthPixel, outputHeight);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas context');


    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    const sampledImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const getPixel = (x: number, y: number): boolean => (
        sampledImage.data[(y * canvas.width + x) * 4] +
        sampledImage.data[(y * canvas.width + x) * 4 + 1] +
        sampledImage.data[(y * canvas.width + x) * 4 + 2]) < (128 * 3.0);

    const bits = new Uint8ClampedArray(outputHeight * outputWidthPixel / 8);
    for (let y = 0; y < outputHeight; y++) {
        for (let x = 0; x < outputWidthPixel / 8; x++) {
            for (let bit = 0; bit < 8; bit++) {
                const pixelX = x * 8 + bit;
                if (pixelX >= outputWidthPixel) break;
                const pixelValue = getPixel(pixelX, y);
                const result = false
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

