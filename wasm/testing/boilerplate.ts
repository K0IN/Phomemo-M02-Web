export type PrinterImage = {
    width: number;
    height: number;
    bits: Uint8ClampedArray; // every pixel is 1 bit (black or white) the image is stored x -> xn for each row
};

export async function loadImage(filePath: string): Promise<ImageBitmap> {
    // Read the file as bytes
    const imageData = await Deno.readFile(filePath);

    // Create a Blob from the bytes
    const blob = new Blob([imageData], { type: 'image/jpeg' })

    // Create ImageBitmap from the Blob
    const imageBitmap = await createImageBitmap(blob);

    return imageBitmap;
}

export async function saveImage(image: PrinterImage) {



}
